# Interpolate remote player movement with native float steps

Negotiated receipts retain the original player mode, native inputs, and actor lifetime. The client pairs each receipt with its exact translated position or rotation packet. Admitted remote movement uses independent native counters for position, body rotation, and head rotation.

A decorator retains the real host handler. Unpaired packets, known riding, and local authority use the host path. Normal and actor interpolation retain the existing ticking guard. Resets and head-only input apply without that normal-mode gate. Ordinary Java movement keeps its interpolation history. Connection, world, entity, lifetime, and mount changes retire pending native movement.

Head-only updates apply raw pitch immediately. They preserve live yaw, pending position and body targets, and forced queues. The head target uses the maximum remaining position/body counter. Explicit packet pairing prevents Java's rotation-only path from cancelling movement. Raw inputs avoid the legacy packet's byte-angle quantization.

The admitted native handler publishes wrapped pitch directly to the rotation field. Java 26.3's setter clips pitch to -90/+90 degrees. Native remote rotation permits angles beyond those limits. Ordinary Java and local look input retain their existing setters.

The handler retains previous pitch before Java shifts its render history by 360 degrees. Immediate head-only updates use that retained value too. Completed body ticks refresh it, while historical physics replay cannot advance it. Context retirement restores the host history source. Java keeps its public render fields and normalizer.

The outer packet path derives motion from raw source position minus the retained previous native eye. Body control reads the exact native displacement before the previous-position copy. The client retains that float history after body control, including while interpolation is idle. Historical physics replay does not advance this live history.

## Native evidence

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls use protocol 2225. Read-only StateVector samples show three steps after admitted normal movement, including an excursion beyond Java's distance cutoff. A small move produces X samples 2.166666746, 1.833333373, and 1.5. The [actor runtime evidence](0008-share-native-actor-and-resource-runtime.pr.md) links the earlier controls and their limits.

Original instructions from the verified current executable establish the component rules. Mode helper `0x1402d92c0` passes 720 head-only cases, including pending counters and absent-component fallback. Callback `0x143630d70` and angle helper `0x143631440` pass 512 position, rotation, and head-counter cases. Producer `0x1422c8d20` and writer `0x142c74350` pass 432 target cases, including unsigned duration conversion and forced completion. Queue kernel `0x143634ae0` passes 108 handoff and signed-counter cases. Synthetic component stores and explicit boundary callbacks exclude allocation, scheduling, and full factory admission.

Live remote actor vtables identify current player body control `0x1443419f0`, invoked through callback `0x146947130`. Read-only entry, return, and position-write samples establish the history order. After respawn, body yaw changes from 40 to 62.5 degrees before the previous-position copy, then settles at 60.5 degrees. The following return settles at 50 degrees.

A head-only packet arrives with one interpolation step remaining and derives motion from the last completed body tick position. Debugger pauses alter wall-clock timing, so these controls establish state ordering only. The existing body-turn formula remains unchanged.

Original mode-helper and setter instructions also pass 54 teleport-origin cases, including low-Y rounding and signed zero. A conditional Java/native test compares all 256 current callback cases with a head component. Default regressions cover observed position samples, overlapping head-only input, raw pitch, forced handoff, rotation wrapping, host fallback, and lifecycle replacement.

Three additional original-callback controls retain pitch beyond Java's look limits while moving from -179 toward 179 degrees. The installed baseline confirms that +179/-179 packets previously settled at +90/-90. The handler regression reproduces this clipping and covers normal movement followed by head-only input.

## Installed comparisons

Six-phase direct and ViaProxy controls retain +179/-179-degree pitch through normal movement and immediate head-only input. Position, yaw, and head-yaw remain at their declared values. The native journal contains 2,696 complete frames. Fresh Java journals contain 1,575 and 1,230 frames from the final review build. All three routes retain identical peer skin, spawn, and movement payloads. Installed add-on and proxy hashes match the verified build. The [appearance comparison](0009-manage-character-creator-accounts-and-wardrobes.pr.md) covers native pitch history, angular queries, and their remaining limits.

Earlier direct and ViaProxy controls retain the observed large- and small-move steps. Twelve settled phases per route compare movement origins and poses, including the previously occluded leg. The overlapping-head regression also runs against the current rebuilt source with two fresh player identities.

The new fixture sends normal movement followed immediately by a head-only packet. Both rebuilt routes reach the native movement endpoint and retain the head target. A settled update keeps the raw 22.75-degree pitch. Sparse movement after the overlap still uses its independent receive cache. Read-only audits pass all eight position, pitch, yaw, and head-yaw checks per route.

Strict journal decoders verify identical peer spawn, skin, normal, head-only, and sparse bytes against native. Camera instructions precede peer creation. Three settled images per phase compare six colored markers. All marker visibility checks agree. Current direct/proxy journals contain 1,998 and 1,718 frames. Median centroids stay within 0.22% of each viewport axis; boundaries stay within 0.42%. These projections do not establish frame timing or numeric native body angles.

## Validation and limits

The earlier normal/head comparisons use matching installed hashes. Their cleanup restores the backed-up native profile and owned server configuration.

Current native reset controls establish immediate position changes and cleared motion/interpolation counters. Respawn resets pitch to zero and preserves previous position. Teleport retains wrapped pitch and resets previous position to its destination. Both retain the current head angle and queued movement. Teleport also retains the native float feet-to-eye roundtrip.

Fourteen-phase installed direct and ViaProxy controls pass the declared position, pitch, yaw, head-yaw, and body-yaw expectations. Both queued-reset cases reach X=2.5. Respawn settles at the native 60.5-degree body yaw, and the following return settles at 50 degrees. Strict decoders verify identical peer payloads for all fourteen phases. The native journal contains 8,096 complete frames, including two auxiliary movement probes. Current direct and proxy journals contain 2,514 and 2,228 complete frames.

A private scheduling pause aligns the first interpolation tick before the normal-then-teleport pair completes. Both routes match native rotation, eye history, and counters at that boundary and through the first three post-teleport body ticks. Main rotation, head yaw, and body yaw then agree with native medians in all twelve traced phases. The remaining two phases use the previously verified zero body seed. Debugger and Java scheduling pauses exclude frame-rate and scheduler-timing claims.

The [appearance query correction](0009-manage-character-creator-accounts-and-wardrobes.pr.md) covers the separate native head limit and current settled-pose projections. State checks and marker projections do not establish full pose parity.

Targeted regressions cover respawn pitch, queued movement, and position-history ordering. Further tests cover exact previous-eye precision, reset admission, retained live head state, distinct previous positions, and queued handoff through the real handler.

The current full build passes 3,362 tests, with 325 skipped and no failures. This run includes the conditional 256-case native comparison. The respawn body-history regression fails with the old ordering and passes with the correction. A separate replay-scope regression protects the live position history.

Fresh replay reproduces the exact built source trees. All 157 patches replay against pinned and current upstream tips. Bundle generation, ten artifact/manifest hashes, and 1,651 embedded core-class comparisons pass. Installed hashes match the compared builds.

All owned Java/display, relay, and server processes are gone. The reset comparison restores owned server configuration and leaves the native profile untouched.

Full factory, readiness, region, scheduler, and ground-state admission remain unverified. Mounted movement, broader head/body transitions, complete trajectories, and skin parity remain open. The original custom-skin report remains unresolved.
