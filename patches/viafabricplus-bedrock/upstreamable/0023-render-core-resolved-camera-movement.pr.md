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

Matching stationary world markers on official 1.26.60.5 and rebuilt direct/ViaProxy clients cover slider values 60, 30, 110, and return to 60. The corrected projection matches native within pixel-spacing quantization. An add-on control with gameplay FOV disabled matches the native disabled control. A direct-route server command retains its specified 40-degree projection, and clear restores the corrected local projection. Complete protocol-2225 journals, installed JAR hashes, stationary position, eye height, and facing are verified. The final death-camera controls also exercise server FOV set and clear on both routes.

Native high-Speed controls reach the 130-degree projection limit and return to baseline after expiry. Direct and ViaProxy observations retain the 2.42 modifier before the final projection clamp. The native expiry video records intermediate projections above the former Java modifier limit.

A stationary, submerged fixture with a low ceiling compares native, direct, and ViaProxy swimming without movement input. All three reach the swimming pose and matching underwater projection. Dolphins widen that projection, which persists briefly after their removal and returns to baseline. Unobstructed marker pairs match within pixel-spacing quantization. Frames with obscured markers are excluded.

Both translated journals contain six Dolphin Boost refreshes with 60-tick durations. Client-thread observations retain the multiplier through the final packet tick plus 60, then clear it on the next tick. The first direct water trial died during fixture preparation and remained on the death screen. It does not establish a swimming defect. The repeated direct trial completes alive with the expected pose, eye height, boost, and expiry.

The four-project build passes 3,519 tests with 329 skipped and no failures or errors, including the executable FOV and death-camera comparisons. Bundle and patch-health checks pass.

The default death camera uses the native eight-block orbit and 60-to-84-degree projection. Original 1.26.60.5 instructions supply 54 death-projection cases, including disabled gameplay effects with retained modifier history. Nine native stills at slider values 60 and 30 match the profile-derived marker bounds within 1.1 pixels. Rebuilt direct and ViaProxy clients pass settled pose, FOV disable/restore, explicit server FOV, server-camera ownership, clear, and respawn controls. Auxiliary camera ticks leave the shared death counter unchanged. Complete protocol-2225 journals and installed artifact hashes identify both final builds.

The native viewport FOV factor uses viewport-to-context size ratios. Thirty-one controls execute the original 1.26.60.5 resize path, viewport getters, aspect update, FOV calculation, rendering cache setter, and projection writer together. Resize rounds viewport dimensions to a multiple of the previous native UI scale. At 1277 × 720 and scale two, it stores 1278 × 720 and changes FOV 66 to approximately 65.94836. Both the cached viewport and scissor rectangle retain those padded dimensions. The current Java camera uses raw dimensions and does not retain this padding.

The produced native projection matrices match JOML in 62 comparisons across both Java depth ranges within 0.000002. Current Java parameters differ in 18 of 40 comparisons with supported UI scales. These controls supply the new UI-scale result, FOV delivery in radians, and `tanf` through libm. Final world render-target sizing, clipping or rescaling, official UCRT bits, installed rendering, and visible portrait parity remain unverified. The controls do not establish a complete correction.

Exact death activation timing, varied angles, collision and postures, non-default death contexts, and native death-screen UI remain open. Other fluid effects, portrait scaling, input-frame expiry, complete transition timing, aim assistance, and visual composition remain partial. These controls do not establish complete camera or pixel parity.

The [owning patch](0023-render-core-resolved-camera-movement.patch) retains implementation rationale and versioned evidence.
