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
