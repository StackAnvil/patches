Shared native scene, layout, image, text, HUD and GUI actor rendering precedes the form and inventory adapters.

## Actor-backed UI portraits

The shared renderer accepts the pinned `live_horse_renderer` for verified real player actors.
The negotiated actor-state v3 channel maps the authored signed native UID to the actual Java UUID.
The legacy v2 channel remains byte-compatible and has no inferred UID.
Missing or removed actors produce no portrait. Unverified actor classes retain ordinary controls.

Original target CPU controls establish string UID parsing, missing ID `-1`, player-family admission, mouse input mode and camera rotation.
The camera uses the authored box center and width through the normal Java entity GUI pipeline.
A scoped transform separates depth from Java's uniform GUI scale.
Portrait controllers, equipment and emotes retain separate playback, variables and caches.
Scene changes, actor replacement and screen closure retire those retained resources.
World animation clocks and effect dispatch remain unchanged.
Active GUI particle or sound cues retain ordinary controls until their submission is implemented.
Unsupported portrait opacity also retains ordinary controls.

Grid capacities use integer count bounds independently of pixel geometry bounds.
The accepted Social definitions contain a million-cell capacity with only a bounded number of actual children.
Sparse measurement visits those children without allocating or iterating the declared capacity.
Malformed, fractional and overflowing capacities remain rejected.
The prior fixed-grid position formula remained a native comparison boundary.

The focused suite passes 42 cases: 39 passed and three optional fixtures skipped.
It covers independent playback, failure-safe scope restoration, transform preservation, resource retirement, signed UID parsing and bounded grid measurement.
The actual accepted ordinary chest scene passes 63 slot addresses and 65 image regions.
That prior supplied profile-title scene passes parsing and layout, then correctly rejects an unresolved close-button mapping.
Its authored portrait UID is 150150. These supplied title and empty-menu inputs do not establish actual Social metadata delivery or actor presence.
Native projection, pixels, transformed startup, resource reloads and Iris compatibility remain required client gates.
The clean combined build passes 706 cases: 588 passed and 118 optional fixtures skipped.
The normal 31-patch replay, Gradle check, build, POM and access-widener gates pass.
All 1,304 embedded core entries match the private actor-UID candidate.
The 38 installed artifacts and all 58 frozen v10 files remain unchanged.
The private portrait candidate is not installed; actual client and Iris gates remain pending.

### Manual grid sizing and positions

Grids without an item template use each child's authored `grid_position`, with `[0,0]` when absent.
Their children measure percentages, anchors and offsets against the full parent extent.
The cell stride changes placement without dividing the child's measurement context.
Template grids retain their existing collection placement and sizing.
Only actual bounded children are measured; million-cell capacities allocate no additional nodes.

Original native property readers, GridItem writer and fresh dependency scheduler bind these rules.
The target layout suite passes 32 cases, including positions, constraints, hidden controls, templates and absent positions.
Zero or missing manual capacities retain ordinary fallback because their native secondary inactivity lifecycle remains unbound.
Malformed and overflowing positions also retain fallback; native machine overflow is not presented as a Java exception rule.

The accepted profile diagnostic selects 19 distinct addresses with full-parent geometry.
Its supplied hover strings remain separate from production values and captured Social data.
Production hover text, the native one-item autoplacement action and intentional subset admission remain open.
The strict action and full-slot completeness guards are unchanged.
Native portrait pixels, current client acceptance, resource reloads and Iris compatibility remain required client gates.

The final paired clean build passes 726 cases: 608 passed and 118 optional fixtures skipped.
Normal replay retains all 31 patches; Gradle check, build, POM and access-widener validation pass.
All 1,311 approved core entries match the private manual-grid core candidate.
The 38 installed artifacts, 58 frozen v10 files and 45 prior actor-candidate files remain unchanged.
These private candidates do not establish current client or Iris acceptance.


## Loose maximum constraints in shared menu templates

CubeCraft's accepted UI pack uses `max_size: [100000, 100000]` on shared button labels.
These values remove a practical upper constraint; they do not request a control of that size.
Cap finite maximum constraints at the existing layout limit.
Continue to reject oversized actual sizes, oversized offsets, and non-finite dimensions.

A targeted test covers numeric, pixel, and percentage maximum constraints without changing the resulting geometry.
A private client projection of the exported Skyblock homepage passes at 640 by 360 and 427 by 240 logical pixels.
Both projections retain 171 visible draws and authored coverage for the expected slot actions.
A separate CubeCraft long-form click probe sends the correct original button index.
These CPU checks do not establish live Pillars of Fortune acceptance, GPU pixels, or shader compatibility.

The repeated-control test also clicks the retained middle widget and checks its original response index.
A later click on the same closing screen produces no second response.
The full add-on build passes 751 tests: 632 passed and 119 optional skips, with no failures or errors.
The final JAR's UI and actor bundles pass checksum and entry verification against the approved local assets.


## HUD title rendering

The shared UI renderer now displays core-resolved HUD title factories with authored images, captions, size and anchors. Alpha animations follow fade, wait and fade-out chains. Subtitle updates retain the original title clock. Late updates cannot revive an expired title, and disconnects invalidate queued work and release resources. Ordinary titles remain available for scenes the core cannot resolve.

Targeted tests sample the alpha chain before, during and after each phase, including replacement scene nodes on the same clock. The complete addon suite passes 799 tests: 679 passed and 120 skipped. All four full-stack builds and bundle checks pass.


## Persistent HUD image metadata

The persistent HUD previously rejected later icons after its metadata cache reached 256 entries.
Both success and failure metadata now evict the least recently used entry instead of retiring a valid title.
The resource manager retains ownership of pack textures.
Tests cover more than 256 icons, frequent cache hits, evicted entries and changed resource sources.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md): Publish shared UI scene and program contracts before the client renderer.

## Inventory image failure report

The current release report shows inventory items without their panel background.
The reporter opened the screen with E.
The original active client screen type remains unknown.
A verified failure path allowed a native container program before the converted pack loaded.
The core now keeps its ordinary menu until those resources load, without advancing presentation identity.
The shared client image loader now reports missing or corrupt pack images through the existing screen failure handler.
It preserves asynchronous remote-image loading and can recover when a new pack source supplies valid pixels.

Both regressions fail before their fixes and pass after them.
The full core build passes 1,494 tests with 90 optional skips, including the concurrent cooking return fix.
The paired add-on build passes 843 tests with 122 optional skips.
Both have zero failures or errors.
All 104 core and 38 add-on patches replay to their identical tested source trees.
Main, test and tool Checkstyle, both publication POMs, add-on access-widener validation and four patch metadata tests pass.

This fixes two asset-failure paths and does not confirm the screenshot's exact cause.
It does not establish native pixels or GUI scale parity.
The same report includes pearl/wind-charge rollback, repeated eating and a missing locator bar.
Those symptoms remain under investigation.
Fresh public WildMC joins completed on October 23, 2026, after the storage cleanup.
The published 0.3.43 add-on and pinned ViaFabricPlus match their release checksums in the installed private client.
The release client shows complete backgrounds for its lobby inventory, native server selector, WildFFA inventory, and native `/kits` menu.
After the Default kit claim, the release inventory closely matches the reported item arrangement and retains its background.
Screen observations identify E as an ordinary `InventoryScreen` and the two menus as `BedrockNativeContainerScreen`.
The current build also shows complete lobby, Practice, and WildFFA inventories and native menus.
The six kit icons and player-inventory layout match the native WildFFA `/kits` menu.
The reporter used E, but these E controls retain an ordinary inventory screen.
The server-driven path to that layout remains unverified.

The initial current and release captures show locator markers and receive `LOCATOR_BAR` packets.
The first current capture records 1,015 packets, and the release capture records 6,909 packets.
The initial clients use a plain profile, software rendering, an 854 by 480 window, and Java GUI scale two.
Further release controls use the reported 1920 by 1013 resolution with Java GUI scales two and four.
The native `/kits` background remains complete in both scale combinations.
Each capture completes initialization, spawn, gameplay acknowledgments, and normal cleanup of all eight owned process identities.
The release run includes a private observer that reads screen and menu state on the client thread.

These controls do not reproduce the reported fault or its server-driven screen transition.
They do not establish the original mod configuration or official native pixel parity.
The pearl/wind-charge and repeated-eating reports remain open.
Raw journals, server packs, screenshots, account data, and observer output stay private.

## Recipe and toggle states

Recipe action annotations now select authored hover and locked branches without requiring an unrelated close annotation.
The shared CPU presentation regression covers enabled, disabled, pointed, and unpointed states.
This change does not establish native button pixels or physical device mapping.

Native toggle groups select checked/unchecked hover and locked branches without a form response annotation.
The presentation regression covers all eight checked, enabled, and pointer combinations. Native pixels and device equivalence remain separate gates.

## Equal-layer draw order

Cooking tab icons and their backgrounds can have the same cumulative layer.
The layout previously sorted siblings before flattening their descendants.
That changed the tie order and let tab backgrounds cover their icons.

Layout now preserves authored child order.
The complete draw list uses a stable sort by cumulative layer.
Overlapping actions give the later authored control priority when their layers match.
HUDs, forms, and containers share the draw order.

Twelve controls execute the unchanged traversal from Bedrock 1.26.51.1, build 51061372, protocol 2193.
They verify additive layers, authored child order, and inherited visibility.
Nested-image and screen-pointer regressions fail with the previous behavior and pass with the fix.
The native visitor callback, hierarchy, and visibility flags are supplied test boundaries.
Native GPU batching, pixel equality, and full default cooking-screen coverage remain unverified.

The combined four-project replay and build pass 2,483 tests, with 213 optional skips and no failures or errors.
Checkstyle, access-widener validation, Maven POM generation, and offline patch validation pass.
All 1,404 embedded core classes match the core build.
The captured furnace scene places both tab icons after their backgrounds at matching cumulative layers.

The private Fabric client projection now visibly renders the food and search tab icons.
Both icon regions previously contained only one background color.
The fixture retains the authored textures, dimensions, and cumulative layers.
This comparison verifies the host rendering correction, with no native reference pixel claim.

The controlled client run passes furnace, smoker, and blast-furnace cooking, then reconnects to the same world.
Fourteen preference sends receive fourteen newer matching core models; all six recipe press/release replies pass.
All three captures show the tab icons.
Each fixture restores ordinary controls before the normal cooking check.
Two runtime inventories verify 2,520 classes and four data resources each.
The observer is removed, the temporary driver delay is restored, and normal cleanup leaves no managed-profile JVM.
The scene projection removes unfinished controls and mappings, so this does not prove complete default-screen support.

The combined movement and cooking build repeats these client checks and completes normal reconnect and cleanup.
All 74 shared UI classes match the earlier icon-correction checkpoint.


## Native component flags and focus defaults

Shared scenes now use native boolean and signed/unsigned 64-bit integer component flags.
Real values and strings retain the property's default. Parsing visibility and querying runtime properties use the same reader.
Keyboard traversal requires authored `focus_enabled`; an absent value defaults to false.
The interaction regression preserves pointer actions for controls without traversal focus.

The original InputComponent and FocusComponent factories execute in 666 cases through original JsonCpp and PropertyView objects.
The production reader matches 5,544 resulting property reads. Four deliberate type-conversion regressions fail.
Factory/property cleanup completes all 25,840 native frees.

Another 432 sequences feed factory-created components through original ScreenView selection, hover, button dispatch and toggle handling.
The private candidate matches 2,880 sequence steps. Three wrong phase, input-mode and focus variants fail.
Three history-ring controls add 240 selections per input mode.
Together, these controls execute 5,040 screen input calls and 193,283 native frees with balanced owners after every case.

The factory and screen controls supply component IDs, control ownership, screen/controller fields, four rectangles and empty observer state.
Platform interfaces observe event delivery, bindings, visuals, radio/settings notifications, diagnostics and profiling.
The production port still needs full native navigation and input routing.
Complete controller receivers, physical device-origin translation, radio siblings and unchanged authored screen acceptance remain open.
The [factory and input notes](../../../docs/native-cooking-actions.md#native-component-flags-and-factory-created-input) retain the boundaries.


The full four-project replay and build pass 2,706 tests with 163 optional skips and no failures or errors.
The packaged add-on also matches all 5,544 native property reads.
All 1,448 core classes match both embedded copies, and all 1,144 client classes match the add-on.
These checks do not add a fresh live screen or native pixel comparison.

## Directional focus, containers and scrolling

The shared selector uses native edge scoring, binary32 arithmetic, nearest ancestor clipping, wrapping and explicit focus overrides.
Original scroll-view viewport searches precede the global clipped search and disable wrapping, including after an unsuccessful search.
Nested viewport candidates retain subtree order. The screen reveals newly focused controls through its retained scroll state.
It updates Java widget visibility during reflow, and an interaction regression types into the newly revealed edit field before another render pass.

Focus containers apply directional stop, containment and custom routing, plus remembered selection through ancestor containers.
Custom routes use control names. Explicit overrides use focus identifiers and bypass container policies.
The native 50-entry weak history supplies fallback for disabled controls.
Retained scene refreshes remap history to replacement nodes without replacing the widget identities.

Original native Focus/Input factories, FocusContainer and ScrollView constructors, custom-route property parsing, ancestor registration and viewport binding execute.
The original manager, subtree iterator, geometry and history helpers run before original component/manager/property-bag destruction.
The production selector matches 3,976 geometry steps and 5,344 context steps across 310 scenes.
A separate original history control verifies 36 enabled-state and capacity results, plus retained-node remap checks in the candidate.
All recorded native allocations and declared owner references balance.

Static rectangles, component IDs, bare controls, focus-container boolean fields and parent/child storage remain supplied inputs.
The fixture retires bare hierarchy references and caller-owned history results.
Complete native control/screen construction, non-widget controls, magnet state, scroll physics, complete controller receivers and physical input remain open.
These controls do not prove native pixels or complete unchanged authored-screen support.
The [directional focus notes](../../../docs/native-cooking-actions.md#native-directional-focus-and-scroll-contexts) describe the boundaries.
