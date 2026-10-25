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

## Proxy announcement policy

The proxy payload includes the native world chat-muting policy in its existing mute flag.
The client still applies its own chat preference and privacy checks.
Packet flags remain intact when the world does not mute emote announcements.
A provider regression covers capability negotiation and both world policies across ordinary and high-bit flags.


## Local emote controls through Java clients

Compatible clients register both playback and world-policy channels.
Core sends the world chat policy before it advertises the versioned action channel.
Clients can advertise available emotes, play one of those IDs or stop local playback.
Core takes the actor runtime ID and Xbox identity from the connected Bedrock session.
Requests contain no actor or account identity fields.

Per-connection playback supplies the native Emoting input flag.
An explicit stop, duration expiry or capability withdrawal clears that state.
Controls reject unsupported versions, unknown actions, trailing bytes, oversized lists and invalid durations.
Playback requires an advertised ID and an initially spawned local actor.
These are transport bounds, not claims about every native emote asset.


Native announcement names travel with the world policy on the new context channel.
Core resolves the local player by native unique ID because Java and native UUIDs can differ.
It uses the connected account name until the native player-list entry arrives.
Remote announcements use the retained native player-list name.
The client clears these names with the connection.
This preserves the existing playback wire format and avoids synthetic or empty Java profile names.


## Local control verification

The full four-project build passes 3,029 tests with 152 optional skips.
Both core Checkstyle tasks pass, and all 104 core and 38 add-on patches replay.
Seven focused tests pass against the distributable core JAR with verified implementation origins.
Embedded core classes and resources match both consumers.

Fresh direct and ViaProxy sessions use physical B-key and slot-key input against an isolated Bedrock 1.26.51.1 server.
A declared fixture installs four bundled wheel choices without sending packets or starting animations.
Both routes produce native server receipts, local world-render samples and correctly named announcements.
Native input carries Emoting during playback and clears it after movement or natural completion.
Outgoing packets use the connected actor ID and zero flags.
The runtime JAR checksums match the verified build.

These controls use a private display and silent software rendering.
Account wardrobe assignment, purchases, full effect timing and native graphical comparisons remain outside these controls.
The existing direct camera-item rendering gate remains failed and separate from these transport-only gameplay controls.


The incoming proxy regression passes its full rendering gate with the same controlled peer fixture.
All four bundled emotes reach world-render sampling across 73 observations.
The remote announcement also uses the declared native player-list name.
Peer placement and durations remain fixture inputs, and the peer remains partly submerged.
This control does not establish native placement, pose or complete graphical parity.
