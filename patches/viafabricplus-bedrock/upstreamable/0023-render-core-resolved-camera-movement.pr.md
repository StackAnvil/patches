# feat(camera): render core-resolved server camera movement

## Purpose

Render ViaBedrock's resolved camera poses, blends, follow targets, FOV, fades, and audio context on direct and ViaProxy connections. Preserve overlay ordering and elapsed state when listeners register late.

## Design constraints

Render core-resolved timelines and targets on the client thread. Apply FOV before projection, preserve overlay ordering and audio context, and retire state on listener replacement.

Prerequisites:

- viabedrock/0089-resolve-and-transport-native-camera-instructions.patch: Publish free-camera tracking, follow-orbit snapshots, and their shared per-preset frame runtimes.

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Publish actor unique IDs, lifetimes, and native physical bounds before resolving camera targets.

## Validation and remaining limits

Run the affected project checks and the specific reproduction described by this patch.

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 compare a detached-camera blend with a clear immediately followed by that blend. Two native clear/set trials start at player height; the ordinary blend retains the rendered detached height. Complete packet journals retain distinct CLEAR and SET instructions. The pre-fix installed direct route retains the stale detached height after clear. Two client-frame regressions cover the queued clear/set boundary and the ordinary blend.

Rebuilt direct and ViaProxy clients each pass clear-only, ordinary blend, and two clear/set trials with verified installed JARs. The four-project build passes 3,328 tests with 325 skipped and no failures or errors; bundle and artifact checksums pass.

Timeline and selected native/replay controls cover supported commands. Complete transition timing, aim assistance, collision, and visual composition remain partial.

The [owning patch](0023-render-core-resolved-camera-movement.patch) retains implementation rationale and versioned evidence.
