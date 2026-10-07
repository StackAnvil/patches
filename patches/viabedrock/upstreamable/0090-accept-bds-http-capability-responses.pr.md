# Accept successful BDS HTTP capability responses without metadata

The pinned BDS 1.26.51.1 endpoint returns `200 OK` with an empty body to `GET /v1/join`.
The official 26.51 client accepts that response, posts its SDP offer, and reaches a playable world.
The newer transport requires JSON metadata and rejects the same endpoint before sending an offer.

Core now owns the complete HTTP signaling flow used by direct clients and ViaProxy.
Capability support depends on the response status. It does not require optional server metadata.
SDP answer validation and the transport's identity verification still apply.
Closing the signaling cancels pending HTTP work and suppresses answer callbacks.
Certificate validation failures do not downgrade the connection to plaintext.

[Mojang's signaling guide](https://mojang.github.io/bedrock-protocol-docs/guides/nether-net-onboarding-guide/) defines successful capability status and the following SDP exchange.
The empty-body compatibility behavior comes from the pinned native client and local BDS capture.
Raw traffic, account identifiers, and screenshots remain private.

## Verification

- The patch applies to the pinned upstream base without setup.
- Loopback tests cover plaintext TLS rejection, empty capability responses, SDP delivery, unsupported endpoints, and invalid answers.
- Core Checkstyle passes.
- A native client joins strict BDS and retains the connection through walking and jumping.
- The rebuilt ViaProxy route reaches a visible strict BDS world and retains the configured 120-second capture.
- Its packet journal includes local-player initialization and 1,955 continuing input packets.
- The native client must disconnect before reusing the same account; simultaneous joins return `ServerIdConflict`.
- Online account regression, platform joins, and full movement parity remain to verify.

## Offline HTTP identity, October 7, 2026

HTTP signaling requires a player identity before game login starts.
An account-free direct HTTP connection previously sent an unsigned offer.
The matching offline BDS returned HTTP 200 with numeric body `37`, which failed SDP validation.
This numeric value remains unnamed until its native error domain is verified.

Core now exposes `AuthData.createSelfSigned` for signaling and the subsequent game login.
The game login also uses this factory when no provider supplied an identity.
The existing token claims, username identity, and session key rules remain unchanged.
The caller retains the same `AuthData` object instead of generating another token after the transport opens.

A private probe uses BDS 1.26.51.1, build 51061372, protocol 2193, with offline login and strict movement.
The unsigned offer has 704 bytes and receives the two-byte refusal.
The signed self identity offer has 2,313 bytes and receives a valid 2,059-byte SDP answer.
The original transport then completes ICE, DTLS, and its data channel connection.
The owned server stops normally; shared servers and installed artifacts remain unchanged.

Token tests verify the public-key claims, signature, stable player identity, and a fresh session key on reconnect.
A registered game-login test compares legacy late identity, early signaling identity, and the account-free fallback.
All three retain the same player UUID, self-signed ID, and client random ID.
A supplied identity retains its original object and key.
The full core build passes with 863 tests, including 30 optional fixture skips, and both source Checkstyle checks.

The rebuilt account-free direct and ViaProxy HTTP routes both reach the matching strict BDS world.
Each route initializes its local player and retains 30 seconds of continuing input after initialization.
The direct journal records 619 input packets; ViaProxy records 618.
For each route, the SDP token and public key match the actual game-login token and key.
Both the offline token and skin token signatures validate with that key.
The owned server and clients stop normally, with shared servers and installed artifacts unchanged during these runs.
Online accounts, full transfer reconnects, platform acceptance, and broader movement parity remain separate verification requirements.
