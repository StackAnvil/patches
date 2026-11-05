# feat(camera): render core-resolved server camera movement

## Purpose

Render ViaBedrock's resolved camera poses, blends, follow targets, FOV, fades, and audio context on direct and ViaProxy connections. Use the native ordinary player FOV before server transitions. Preserve overlay ordering and elapsed state when listeners register late.

## Design constraints

Render core-resolved timelines and targets on the client thread. Apply FOV before projection, preserve overlay ordering and audio context, and retire state on listener replacement.

Prerequisites:

- viabedrock/0089-resolve-and-transport-native-camera-instructions.patch: Publish free-camera tracking, follow-orbit snapshots, and their shared per-preset frame runtimes.

- viafabricplus-bedrock/0008-share-native-actor-and-resource-runtime.patch: Publish actor unique IDs, lifetimes, and native physical bounds before resolving camera targets.

- viafabricplus-bedrock/0025-send-completed-local-physics-to-viabedrock.patch: Share retained movement-effect marker state for the player FOV swim multiplier.

## Validation and remaining limits

Run the affected project checks and the specific reproduction described by this patch.

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 compare a detached-camera blend with a clear immediately followed by that blend. Two native clear/set trials start at player height; the ordinary blend retains the rendered detached height. Complete packet journals retain distinct CLEAR and SET instructions. The pre-fix installed direct route retains the stale detached height after clear. Two client-frame regressions cover the queued clear/set boundary and the ordinary blend.

Rebuilt direct and ViaProxy clients each pass clear-only, ordinary blend, and two clear/set trials with verified installed JARs.

Original Bedrock 1.26.60.5 instructions supply 25 player FOV cases covering movement speed, flight, Slowness, swim boost, bow charge, scoping, disabled gameplay effects, and zero walking speed. Finite outputs match native float bits; the zero-over-zero result remains NaN. Six native Dolphin Boost kernel controls establish the swimming gate and marker-presence rule. The effect timeline regression covers the final marker frame and restored values.

Matching stationary world markers on official 1.26.60.5 and rebuilt direct/ViaProxy clients cover slider values 60, 30, 110, and return to 60. The corrected projection matches native within pixel-spacing quantization. An add-on control with gameplay FOV disabled matches the native disabled control. A direct-route server command retains its specified 40-degree projection, and clear restores the corrected local projection. Complete protocol-2225 journals, installed JAR hashes, stationary position, eye height, and facing are verified. The extra proxy server-FOV command check did not run before its timed recorder ended.

Native high-Speed controls reach the 130-degree projection limit and return to baseline after expiry. Direct and ViaProxy observations retain the 2.42 modifier before the final projection clamp. The native expiry video records intermediate projections above the former Java modifier limit.

A stationary, submerged fixture with a low ceiling compares native, direct, and ViaProxy swimming without movement input. All three reach the swimming pose and matching underwater projection. Dolphins widen that projection, which persists briefly after their removal and returns to baseline. Unobstructed marker pairs match within pixel-spacing quantization. Frames with obscured markers are excluded.

Both translated journals contain six Dolphin Boost refreshes with 60-tick durations. Client-thread observations retain the multiplier through the final packet tick plus 60, then clear it on the next tick. The first direct water trial died during fixture preparation and remained on the death screen. It does not establish a swimming defect. The repeated direct trial completes alive with the expected pose, eye height, boost, and expiry.

The four-project build passes 3,515 tests with 329 skipped and no failures or errors, including the executable FOV comparison. Bundle and patch-health checks pass.

Timeline and selected native/replay controls cover supported commands. Exact native input-frame expiry, other fluid effects, death projection, portrait scaling, complete transition timing, aim assistance, collision, and visual composition remain partial. Original 1.26.60.5 world-FOV instructions confirm an ordinary death curve without Java's 20-tick cap. The default native death controller and its counter lifetime still need live comparison before changing that path. These controls do not establish complete camera or pixel parity.

The [owning patch](0023-render-core-resolved-camera-movement.patch) retains implementation rationale and versioned evidence.
