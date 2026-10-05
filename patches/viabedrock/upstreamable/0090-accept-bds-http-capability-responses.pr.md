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
- Direct add-on joining, offline HTTP identities, platform joins, and full movement parity remain to verify.
