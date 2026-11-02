# Interpolate remote player movement with native float steps

Negotiated receipts retain the original player mode, native inputs, and actor lifetime. The client pairs each receipt with its exact translated position or rotation packet. Admitted remote movement uses independent native counters for position, body rotation, and head rotation.

A decorator retains the real host handler. Unpaired packets, reset modes, known riding, local authority, and unticking entities use the host path. Ordinary Java movement keeps its interpolation history. Connection, world, entity, lifetime, and mount changes retire pending native movement.

Head-only updates apply raw pitch immediately. They preserve live yaw, pending position and body targets, and forced queues. The head target uses the maximum remaining position/body counter. Explicit packet pairing prevents Java's rotation-only path from cancelling movement. Raw inputs avoid the legacy packet's byte-angle quantization.

## Native evidence

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls use protocol 2225. Read-only StateVector samples show three steps after admitted normal movement, including an excursion beyond Java's distance cutoff. A small move produces X samples 2.166666746, 1.833333373, and 1.5. The [actor runtime evidence](0008-share-native-actor-and-resource-runtime.pr.md) links the earlier controls and their limits.

Original instructions from the verified current executable establish the component rules. Mode helper `0x1402d92c0` passes 720 head-only cases, including pending counters and absent-component fallback. Callback `0x143630d70` and angle helper `0x143631440` pass 512 position, rotation, and head-counter cases. Producer `0x1422c8d20` and writer `0x142c74350` pass 432 target cases, including unsigned duration conversion and forced completion. Queue kernel `0x143634ae0` passes 108 handoff and signed-counter cases. Synthetic component stores and explicit boundary callbacks exclude allocation, scheduling, and full factory admission.

A conditional Java/native test compares all 256 current callback cases with a head component. Default regressions cover observed position samples, overlapping head-only input, raw pitch, forced handoff, rotation wrapping, host fallback, and lifecycle replacement.

## Installed comparisons

Earlier direct and ViaProxy controls retain the observed large- and small-move steps. Twelve settled phases per route compare movement origins and poses, including the previously occluded leg. The new overlapping-head controls use the final functional source and two fresh player identities.

The new fixture sends normal movement followed immediately by a head-only packet. Both rebuilt routes reach the native movement endpoint and retain the head target. A settled update keeps the raw 22.75-degree pitch. Sparse movement after the overlap still uses its independent receive cache. Read-only audits pass all eight position, pitch, yaw, and head-yaw checks per route.

Strict journal decoders verify identical peer spawn, skin, normal, head-only, and sparse bytes against native. Camera instructions precede peer creation. Three settled images per phase compare six colored markers. All marker visibility checks agree. Median centroids stay within 0.34% of each viewport axis; boundaries stay within 0.66%. These projections do not establish frame timing or numeric native body angles.

## Validation and limits

The full four-project build passes 3,352 tests, with 326 skipped and no failures. The conditional native comparison also passes separately. All 157 patches replay from fresh upstream clones. Bundle generation, ten artifact/manifest hashes, and all 1,651 embedded core-class comparisons pass. The installed JAR hashes match the compared builds. Later commit-message edits preserve both exact source trees.

All owned game, display, relay, and server processes are gone. Cleanup restores the backed-up native world, options, external server lists, and owned server configuration.

Full factory, readiness, region, scheduler, and ground-state admission remain unverified. Reset modes retain existing host behavior. Mounted movement, broader head/body transitions, complete trajectories, and skin parity remain open. The original custom-skin report remains unresolved.
