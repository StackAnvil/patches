# feat(camera): render core-resolved server camera movement

## Purpose

Subscribe to ViaBedrock's versioned camera fade channel on direct and ViaProxy connections. Draw the supplied color and opacity timeline while preserving the HUD, including when the normal HUD is hidden. Render the remaining elapsed state after late registration instead of restarting it.

## Design constraints

Render core-resolved timelines and targets on the client thread. Apply FOV before projection, preserve overlay ordering and audio context, and retire state on listener replacement.

Prerequisites:

- viabedrock/0089-resolve-and-transport-native-camera-instructions.patch: Publish free-camera tracking, follow-orbit snapshots, and their shared per-preset frame runtimes.

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Publish actor unique IDs, lifetimes, and native physical bounds before resolving camera targets.

## Validation and remaining limits

Run the affected project checks and the specific reproduction described by this patch.

Timeline and selected native/replay controls cover supported commands. Complete transition timing, aim assistance, collision, and visual composition remain partial.

The [owning patch](0023-render-core-resolved-camera-movement.patch) retains implementation rationale and versioned evidence.
