# Bedrock skin flow and Character Creator gap

This note explains why Character Creator skins appear as default skins in the current add-on. It also separates account appearance updates from the skin data sent to a world.

## What the native client sends

The Bedrock client saved an owned classic skin through an HTTPS `PUT` to `persona-secondary.franchise.minecraft-services.net` after leaving Dressing Room. The request contained `appearanceObjects`, and the service returned HTTP 200. This updates the account appearance. It does not prove that a server or another player received the skin.

For a new world connection, the client puts its skin in the login client-data JWT. A private local server recorded these fields from Bedrock 1.26.51:

| Selected appearance | `PersonaSkin` | Image | Geometry | Persona pieces |
| --- | --- | --- | --- | --- |
| Birdie Wings classic skin | `false` | 64×64 RGBA | 7,411 bytes | 0 |
| Default Character Creator character | `true` | 256×256 RGBA | 57,295 bytes | 9 |

The Character Creator sample had 48 geometry bones across two models. It had 12 `poly_mesh` entries and no cubes. These counts describe this sample, not every Character Creator skin.

For a skin change during a connection, Bedrock uses `PlayerSkinPacket`. The server processes that packet and broadcasts it to other clients. See [Mojang's packet reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.24/packets/player-skin-packet/).

## What the add-on does today

`BedrockDressingRoomScreen` selects Steve, Alex, or an imported classic PNG. It saves that choice in `BedrockAppearanceStore` and tells the player to join a Bedrock world again. The screen has no Character Creator selection.

At login, `ViaFabricPlusSkinProvider.getClientPlayerSkin` reads that local choice. It replaces the default Steve skin fields in ViaBedrock's client-data JWT. It does not read the native Bedrock account's current Character Creator choice. ViaBedrock builds the JWT in `LoginPackets`.

For other players, ViaBedrock reads skin data from `PlayerListPacket` and `PlayerSkinPacket`. Both paths call `ViaFabricPlusSkinProvider.setSkin`. `BedrockPlayerSkins.accept` returns immediately when `skin.persona()` is true. As a result, Character Creator players keep the Java client's fallback appearance.

Removing that condition alone is unsafe. `BedrockGeometryParser` reads cube geometry but skips `poly_mesh`. The captured Character Creator sample has no cubes. The current custom renderer would have no body surfaces for that sample. The second geometry model also supplies an animated face, which needs its own texture handling.

The add-on does not send `PlayerSkinPacket` when its Dressing Room changes a skin. Its classic skin takes effect on the next Bedrock login. ViaBedrock's `SkinType.write` is currently marked incomplete, so live skin updates need a protocol writer and round-trip tests first.

## Work needed to close the report

1. Test an imported classic skin with two clients. After the Java client joins, inspect the skin that a Bedrock observer receives in `PlayerListPacket`. Check the skin ID, image, geometry, and cape.
2. Add support for `poly_mesh` geometry and the animated face data. Then render a Character Creator packet in the Java client and compare it with a native Bedrock screenshot.
3. Decide how the add-on obtains an account's Character Creator appearance. The HTTPS `appearanceObjects` update contains account selections, but the login JWT also needs rendered skin pixels and geometry. A local classic PNG cannot provide those fields.
4. If the Dressing Room must update a connected player, implement `SkinType.write` for the current protocol. Send `PlayerSkinPacket` and check that a second Bedrock client receives the change.

Keep login JWTs, raw proxy flows, player textures, and account data under `.stackanvil/`. The private probe for this investigation is in `.stackanvil/captures/20260925t191234-skin-login-probe/`. Do not commit it.
