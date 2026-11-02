# Interpolate remote player movement with native float steps

Negotiated receipts retain the original player mode, native inputs, and actor lifetime. The client pairs each receipt with its exact translated position or rotation packet. Admitted remote movement uses independent native counters for position, body rotation, and head rotation.

A decorator retains the real host handler. Unpaired packets, known riding, and local authority use the host path. Normal and actor interpolation retain the existing ticking guard. Resets and head-only input apply without that normal-mode gate. Ordinary Java movement keeps its interpolation history. Connection, world, entity, lifetime, and mount changes retire pending native movement.

Head-only updates apply raw pitch immediately. They preserve live yaw, pending position and body targets, and forced queues. The head target uses the maximum remaining position/body counter. Explicit packet pairing prevents Java's rotation-only path from cancelling movement. Raw inputs avoid the legacy packet's byte-angle quantization. The outer packet path derives motion from raw source position minus the retained previous native eye. Entity ticks retain that float history before interpolation, including while idle.

## Native evidence

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls use protocol 2225. Read-only StateVector samples show three steps after admitted normal movement, including an excursion beyond Java's distance cutoff. A small move produces X samples 2.166666746, 1.833333373, and 1.5. The [actor runtime evidence](0008-share-native-actor-and-resource-runtime.pr.md) links the earlier controls and their limits.

Original instructions from the verified current executable establish the component rules. Mode helper `0x1402d92c0` passes 720 head-only cases, including pending counters and absent-component fallback. Callback `0x143630d70` and angle helper `0x143631440` pass 512 position, rotation, and head-counter cases. Producer `0x1422c8d20` and writer `0x142c74350` pass 432 target cases, including unsigned duration conversion and forced completion. Queue kernel `0x143634ae0` passes 108 handoff and signed-counter cases. Synthetic component stores and explicit boundary callbacks exclude allocation, scheduling, and full factory admission.

Original mode-helper and setter instructions also pass 54 teleport-origin cases, including low-Y rounding and signed zero. A conditional Java/native test compares all 256 current callback cases with a head component. Default regressions cover observed position samples, overlapping head-only input, raw pitch, forced handoff, rotation wrapping, host fallback, and lifecycle replacement.

## Installed comparisons

Earlier direct and ViaProxy controls retain the observed large- and small-move steps. Twelve settled phases per route compare movement origins and poses, including the previously occluded leg. The overlapping-head regression also runs against the current rebuilt source with two fresh player identities.

The new fixture sends normal movement followed immediately by a head-only packet. Both rebuilt routes reach the native movement endpoint and retain the head target. A settled update keeps the raw 22.75-degree pitch. Sparse movement after the overlap still uses its independent receive cache. Read-only audits pass all eight position, pitch, yaw, and head-yaw checks per route.

Strict journal decoders verify identical peer spawn, skin, normal, head-only, and sparse bytes against native. Camera instructions precede peer creation. Three settled images per phase compare six colored markers. All marker visibility checks agree. Current direct/proxy journals contain 2,301 and 2,061 frames. Median centroids stay within 0.41% of each viewport axis; boundaries stay within 0.91%. These projections do not establish frame timing or numeric native body angles.

## Validation and limits

The earlier normal/head comparisons use matching installed hashes. Their cleanup restores the backed-up native profile and owned server configuration.

Current native reset controls establish immediate position changes and cleared motion/interpolation counters. Respawn resets pitch to zero and preserves previous position. Teleport retains wrapped pitch and resets previous position to its destination. Both retain the current head angle and queued movement. Teleport also retains the native float feet-to-eye roundtrip.

A fourteen-phase native/direct baseline reproduces the old respawn-pitch and lost-queue defects. Rebuilt direct and ViaProxy routes now pass all fourteen position, pitch, yaw, and head checks. Forced queued movement resumes after either reset and reaches X=2.5. Complete journals contain 3,925 native, 2,933 direct, and 2,726 proxy frames. Strict decoders verify identical peer payloads. All marker visibility checks agree.

Reset-pose projections still differ. Median marker centroids differ by up to 0.97% of a viewport axis; boundaries differ by up to 1.44%. The largest centroid difference occurs at an arm after respawn. Native body-angle and tick-order comparisons remain open. State checks do not establish full pose parity. The accepted native capture uses corrected teleport payloads; earlier malformed and debugger-paused trials are excluded.

Three targeted regressions fail before the correction and pass afterward. Further tests cover exact previous-eye precision, reset admission, retained live head state, distinct previous positions, and queued handoff through the real handler. The full build passes 3,358 tests, with 326 skipped and no failures. The conditional 256-case native comparison also passes separately. Fresh replay reproduces the exact built source trees. All 157 patches replay against pinned and current upstream tips. Bundle generation, ten artifact/manifest hashes, and 1,651 embedded core-class comparisons pass. Installed hashes match the compared builds.

All owned Java/display, relay, and server processes are gone. The reset comparison restores owned server configuration and leaves the native profile untouched.

Full factory, readiness, region, scheduler, and ground-state admission remain unverified. Mounted movement, broader head/body transitions, complete trajectories, and skin parity remain open. The original custom-skin report remains unresolved.
