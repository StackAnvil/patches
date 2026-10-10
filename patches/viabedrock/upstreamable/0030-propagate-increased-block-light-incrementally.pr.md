Preserve light snapshots after block updates and propagate emission increases into a clean cached region. Emission decreases, opacity changes, and incomplete regions trigger full recomputation.

The opacity table also distinguishes single and double slabs. Java stores both under one identifier, which previously gave every slab opacity zero. Half slabs now filter one level, and double slabs block light.

An isolated official Bedrock Dedicated Server 1.26.51.1 probe measured sealed skylight shafts and block-light tunnels without client joins. The server reports build 51061372 and protocol 2193. Its Script API measurements show:

- Upper and lower oak and smooth-stone slabs read skylight 14, followed by 13 below them.
- Double slabs block both sky and block light.
- Upper and lower stairs transmit full skylight 15.
- Single slabs, leaves, and water pass block light 14, followed by 13.

Numerical propagation tests reproduce those measurements. The target results do not support importing Java directional face occlusion.

All 315 saved Hive columns contain 17,078 half slabs and 11,795 double slabs. A counterfactual spawn region changes 85 sky-light cells and 46 block-light cells in its center chunk. It resolves every captured vanilla state. One double slab changes sky light from 10 to 0 and block light from 14 to 0. The player cell remains sky 15 and block 4. Raw server outputs and captured world data remain private.

Waterlogged stairs, fences, chains, and lanterns filter one skylight level. Their dry states transmit 15. Waterlogged leaves and half slabs retain filtering one. Custom blocks with filters zero, eight, and fifteen use the greater of their filter and water’s one-level filter. The target server measured these combinations in closed shafts and tunnels at clear noon. Script API queries include time and weather adjustment.

Light snapshots now retain native secondary water for each position, including custom carriers without a Java waterlogged variant. Water addition and removal invalidate cached light. Replacement columns discard both state and water snapshots. Palette data and render states retain their original values. Block-light propagation already loses at least one level per step, so secondary water requires no extra block-light loss.

Validation: 276 core tests pass with no failures, errors, or skips using the StackAnvil CubeConverter publication. Both main and test Checkstyle tasks pass. Numerical tests cover wet and dry states, native filter combinations, water removal, and immutable palette snapshots. Differential tests retain coverage across chunk and section boundaries.

## Pending refreshes after column replacement

The lighting scheduler previously removed dirty keys before checking for an active worker.
A server can replace or reload a column while the old column's worker still runs.
The old result then fails the column-identity check and discards its snapshot.
Removing the replacement's dirty key also loses its required border refresh.

Keep pending keys queued until their worker completes.
Continue dispatching unrelated ready keys and remove unloaded keys.
A regression test fails under the previous queue behavior and passes after this correction.
It covers an unloaded key, an unrelated ready column, a pending replacement, and dispatch after the old worker finishes.
The scheduling fault exists in the pinned upstream lighting path as well as the applied stack.

This correction does not reproduce or establish the cause of the reported chunk-loading slowdown.
The affected server, implementation, add-ons, update order, and timing still need capture and comparison.
Existing Hive-column calculations and BDS measurements cover narrower boundaries.

The final ordered stack builds with 880 tests passed and 110 skipped, with no failures or errors.
Both core Checkstyle tasks pass.

### Native source emission, October 7, 2026

An isolated official BDS 1.26.51.1 probe measured light through a sealed 16-block tunnel at clear noon.
The server reported build 51061372 and protocol 2193. Every sampled tunnel cell had skylight zero.
The probe recorded each source's actual block identifier and states after 30 ticks.
This excludes cases where native updates replaced the requested source before measurement.

Powered redstone dust retained signal 15 but emitted no light. Its unpowered control also left the tunnel dark.
Soul campfires produced light 9, 8, 7 at successive air cells, which establishes source emission 10.
Extinguished soul campfires left the tunnel dark. Lit redstone and deepslate redstone ores produced 8, 7, 6, which establishes emission 9.
Their unlit controls left the tunnel dark. Ordinary campfires and the three furnace variants retained their existing emission rules.

Core now removes false lighting around powered dust, reduces soul campfire emission from 13 to 10, and adds lit ore emission 9.
Both direct and ViaProxy connections receive these corrected light arrays without requiring the add-on.
Tests cover full and incremental propagation across a chunk boundary, unchanged cached arrays, and source removal.
They exercise all 16 translated dust power values and 14 lit/unlit source states.

These measurements establish source emission and tunnel propagation. They do not establish complete rendered image parity.
Directional shading, ambient occlusion, held-item light sampling, End sky inputs, and enhanced lighting remain open.
The native executable, world, scripts, and raw output remain private.

Validation: the full 97-patch stack replays. Core build and all Checkstyle tasks pass with 800 tests, including 25 fixture skips.
The add-on build passes with 605 tests, including 117 fixture skips. Neither suite reports failures or errors.
ViaProxy builds successfully. All 1,250 core files match both downstream bundles, except their manifests.
The emission regressions fail with the old rules and pass with the corrected rules.
These checks do not include a new live Java/native screenshot comparison.

## Palette lookup reuse

Section snapshots resolve Java states and water flags once per palette entry.
Chunk remapping also resolves block tags once per palette entry.
Coordinate order, waterlogging and uniform-section compaction remain intact.
The current weak tracker reservations still coalesce chunk callbacks and discard replaced dimensions.
The existing water snapshot regression checks coordinates and independent earlier snapshots.

## Combined stack validation

The full dependency build passes for CubeConverter, ViaBedrock, the Bedrock add-on and ViaProxy.
Core passes 1,159 tests and the add-on passes 786 tests.
JUnit skips 30 core tests and 120 add-on tests.
CubeConverter passes 18 tests and ViaProxy passes four tests.
The standalone cache patch passes 45 tests and both Checkstyle tasks.
TypeScript checking and patch whitespace checks also pass.
These results establish stack replay and test behavior. Live server frame-time profiling remains separate.
