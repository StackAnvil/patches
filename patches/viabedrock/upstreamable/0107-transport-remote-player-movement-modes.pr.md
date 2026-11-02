# Preserve remote player movement modes

Java position packets discard the original normal, respawn, and teleport modes. Rotation-only packets also quantize pitch and omit the native head target. A negotiated receipt retains native coordinates, rotations, flags, duration, mode, UUID, and lifetime. Existing Java packets stay available to older clients.

The receipt precedes its translated position or rotation packet. It carries the exact Java target separately, including packet family. This preserves the different Y arithmetic and byte-angle rounding without reconstructing either packet. A bounded connection queue consumes each receipt once. A mismatch clears pending receipts. Overflow disables pairing until connection reset.

## Evidence and validation

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls use protocol 2225. Current native observation distinguishes normal interpolation from Java's large-distance snap and intermediate curve. Original mode-helper instructions also preserve pending movement during head-only updates and apply raw pitch immediately.

Focused tests invoke the registered handlers and decode their actual output. They cover normal, respawn, teleport, head-only, known riding, absolute, and sparse updates. Fractional pitch and conflicting yaw/head values distinguish raw native inputs from the translated byte-angle target. Other cases cover unsigned duration, packet-family correlation, actor replacement, connection reset, overflow, capability gates, and local-player exclusion. The focused suite and both Checkstyle tasks pass.

The [client integration](../../viafabricplus-bedrock/upstreamable/0041-interpolate-native-remote-player-movement.pr.md) records current native instruction controls, installed comparisons, and complete build validation.

## Limits

This patch transports inputs. It does not change interpolation, actor receive caches, collision history, or body-control formulas. Head-only receipts retain raw position for native packet-level motion while leaving live position and the legacy Java target unchanged. The client integration covers reset state and queued movement. Full native readiness, region admission, scheduling, mounted movement, and pose parity remain open.
