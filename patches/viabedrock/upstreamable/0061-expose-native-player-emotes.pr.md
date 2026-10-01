## Native player emotes

Decode protocol 2193 `EMOTE` and `EMOTE_LIST` and resolve their runtime actor IDs to player UUIDs. Client integrations can override `EmoteProvider` or register the versioned `viabedrock:emote` payload. The provider also supplies the local `PlayerAuthInput` Emoting state.

The [Bedrock 1.26.51 Emote schema](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/EmotePacketPayload.json) defines the field order. A private native capture confirms Battle Cry's pack UUID, 130-tick duration, and zero flags. Its metadata piece UUID differs from the wire UUID. The native client clears Emoting on completion or movement.

## Verification

- The full ViaBedrock stack builds, including Checkstyle and tests.
- Codec tests cover field order, UUID strings, unsigned tick lengths, and flags.
- Native client captures verify both emote packets and local input state.

This patch exposes the protocol data. Animation assets and rendering belong to the client integration. Captures, account identifiers, and assets stay private.

## World emote-chat policy

Retain the existing StartGame mute-emote-chat boolean in `GameSessionStorage`. Client integrations can use it to suppress announcements while continuing animation playback. This keeps the protocol field order unchanged.

The [Mojang LevelSettings schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.24/types/level-settings/) includes this field. Inspection of the target Bedrock 1.26.51.1 local announcement path confirms the world policy gate. Incoming emote flag bit 2 independently suppresses remote announcements. The target outgoing packet constructor retains zero flags.

The replayed full stack passes its build, Checkstyle, and tests. A running add-on client verifies world muting, incoming flags, animation playback while muted, and local echo suppression using a mock connection. Live native multiplayer announcement comparison remains pending.
