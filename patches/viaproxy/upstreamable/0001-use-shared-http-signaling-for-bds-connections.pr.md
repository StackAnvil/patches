# Use ViaBedrock HTTP signaling for BDS connections

Use the shared core signaling implementation for HTTP NetherNet targets.
The current transport rejects empty successful capability responses from BDS 1.26.51.1.
The pinned native client proceeds to its SDP exchange and spawns on that endpoint.

This patch requires ViaBedrock's HTTP signaling change.
It leaves discovery and Xbox signaling with their existing providers.
Core owns the capability check, SDP exchange, cancellation, and TLS failure behavior.

## Verification

Core loopback tests cover the reproduced capability response and SDP flow.
The complete routed core, CubeConverter, and ViaProxy build passes.
The rebuilt proxy reaches a visible strict BDS world and retains the configured 120-second capture.
The journal contains initialization and continuing input; broader movement parity remains open.

## Account-free HTTP login, October 7, 2026

An account-free HTTP backend also requires a signed player identity.
The Java handshake has no player name, so ViaProxy waits for one real `LoginHello` before opening this backend.
The gate includes both login and transfer handshakes that enter the login state.
It creates the core self-signed identity from that name and uses the same token and key for signaling and game login.
After the backend handshake, the saved packet passes through the normal login handler and configured online-mode verification.
Signed online HTTP connections and RakNet keep their existing paths.

The wait has the configured connection deadline.
Disconnect or unexpected input cancels the deadline and removes the callback.
There is no additional packet queue.
Three `EmbeddedChannel` tests cover one-packet consumption, read control, disconnect cleanup, and rejection of unexpected input.
A fourth test exercises the production route predicate for login, transfer, status, online accounts, RakNet, and Java targets.
These tests replace the network callback and do not establish game-login acceptance.
The full proxy build passes all four tests against the shared factory through an isolated dependency repository.

The exact offline BDS transport probe opens a self-signed connection and rejects its unsigned control with numeric body `37`.
That value remains unnamed.
This patch depends on core's shared identity factory as well as its HTTP signaling implementation.
The rebuilt account-free proxy route reaches the matching strict BDS world.
It initializes its local player and retains 30 seconds of continuing input, with 618 input packets in the journal.
The actual SDP token and key match the game-login token and key; offline and skin token signatures both validate.
The loaded `AuthData` class comes from the reviewed shaded proxy artifact.
The owned client, proxy, and server stop normally; shared services remain unchanged.
Full transfer reconnects, online accounts, platform acceptance, and broader movement parity remain to verify.
