Sign text can carry Bedrock formatting codes such as `§c`. ViaBedrock painted every text component with the sign's text color, so formatted text on an ordinary sign turned black.

Native behavior, checked on the 1.26.60.5 client against a local BDS with signs loaded from a structure:

- Undyed (black) signs, glowing or not, show formatting colors, and with `PersistFormatting` a color carries to the next line until `§r`.
- Dyed signs, glowing or not, draw all text in the dye color; `§e` on a blue sign stays blue.

This keeps component colors while the sign color is black and fills only uncolored text with it. Dyed signs keep the existing behavior.

Validation: unit tests convert an undyed sign with `§c`, a carried color and a reset, and a dyed sign with `§e`, and check the Java message colors. In game, the add-on now matches the native screenshots for both signs.

Remaining limits: Bedrock draws formatting colors on unlit signs slightly darker than Java. The [add-on wrapping patch](../../viafabricplus-bedrock/upstreamable/0047-wrap-bedrock-sign-text-like-the-native-client.pr.md) breaks long lines like Bedrock.
