# Correct Java 26.3 head rotation packets

Bedrock head-only movement produced corrupted Java player rotations. Java 26.3 reads the on-ground boolean before yaw and pitch. ViaBedrock wrote it after both angles.

The patch corrects the Java packet field order and preserves the Bedrock state handling. Two registered-handler cases serialize the output and decode the current Java wire layout. Both ground-state cases pass in the current verified build.

## Evidence and remaining limits

The earlier Hive control uses Bedrock 1.26.51.1 on protocol 2193. The gray seated player's source pitch became its Java yaw, and its ground flag became a 1.40625-degree pitch. A fixed local replay restores the expected draw-call angles within the existing byte-angle quantization. This evidence establishes the wire-order error without a skin mesh change.

Current controls use official Bedrock 1.26.60.5/BDS 1.26.60.6 on protocol 2225. After a same-identity yaw cycle, a mode-3 packet supplies a 22.5-degree pitch, conflicting yaw and head yaw, and a different position. Native applies the pitch while retaining the earlier position and yaw. The current direct and ViaProxy clients reproduce this selected result. Their runtime audits retain position, actor yaw, and head yaw while pitch changes to 22.5 degrees. A normal packet restores the level head pose.

Strict decoders verify identical source spawn and movement payloads across the routes. The accepted Java fixtures disable their onboarding tutorial before observations. The [shared player-runtime controls](../../viafabricplus-bedrock/upstreamable/0008-share-native-actor-and-resource-runtime.pr.md) describe the complete sequence, marker measurements, and cleanup.

This stationary, unmounted control supports the retained pitch-only handling for the selected inputs. Mounted head/body rules, native ground-state parity, interpolation timing, and complete skin animation parity remain open. Private captures, client assets, and runtime traces stay outside Git. No packet-semantic change follows from these controls.
