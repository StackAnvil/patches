Shared native scene, layout, image, text, HUD and GUI actor rendering precedes the form and inventory adapters.

## Player inventory renderer

The target selects a separate `live_player_renderer` for player inventory.
It reads the local actor directly and retains independent actor rotation, body-yaw history and head-yaw history.
The shared renderer now supports this separate local-player path.
Java PIP applies its native model correction after portrait translation and before entity submission.
Scoped actor, body and head rotations preserve world player state.

A private reference executes 672 original player draw calls through normal return with an absent renderer result.
The original component lookups, body-yaw getter/setter, matrix arithmetic and player/mount restoration execute.
The cases cover standing, swimming, crawling, gliding, overlapping flags, control shapes and cursor admission paths.
Renderer-context boundaries, actor delivery, flags, cursor admission getters and host float math remain supplied.
GPU output, successful renderer variables, effects and physical input producers remain unverified.

Three packaged camera regressions cover the native framing and pose fields and reject four deliberately incorrect implementations.
The full stack passes 2,801 tests, with 163 optional skips.
All 1,450 core classes match both packaged copies, and all 1,188 client classes match the add-on.
The prior 35 screen regressions and 1,940 UI input reference cases still pass.

Two private Java 26.3 clients retain 36 actual PIP submission samples at 854 by 480 and 1920 by 1013 pixels.
Their Java/native GUI scale pairs are 2/1 and 3/4.
The checks cover mouse coordinates, cursor tracking, supplied native pose flags, local actor selection and unchanged world rotation fields.
Private screenshots show the local player in both viewports.
The scene and native flags are supplied. These checks do not reproduce genuine world gliding or a complete authored inventory screen.
Native pixels, successful native renderer variables, converted skins, equipment, emotes, GUI effects, mounted queries and Iris comparisons remain incomplete.

The [player inventory reference](../../../docs/native-player-inventory.md) records the target functions, pose fields and remaining implementation requirements.
Production still lacks the complete player-inventory controller. These changes remain outside release 0.3.53.

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


## Shared native input components

The shared runtime now parses native input mappings and toggle factory fields.
It retains mapping phases, double-press history, implicit hover events and source-specific release captures.
Toggle state separates component initialization from controller bindings.
Radio propagation clears matching-group siblings with different indices, including ordinary toggles.
Duplicate indices retain their checked state.
The container patch consumes these components and owns its domain callbacks and admission limits.

Original factories, component handlers, capture routing and destructors provide the comparison corpus.
The actual container consumer also matches 384 composed native Input/Toggle/controller steps.
Complete screen/controller construction, device-origin translation and pixels remain separate requirements.


## Initial native focus selection

Initial focus now ranks the authored precedence before the native float top-left score.
Equal scores retain registration order. All-negative precedences and scores at the initial maximum leave focus empty.
The signed 64-bit property reader narrows accepted integers to 32 bits.
Unsigned-only integers, real values, booleans and other types retain zero.

The production selector matches 1,920 original native default-ranking cases and 19 factory property reads.
The comparison excludes 1,920 manager-disabled fixtures because manager activation belongs to the caller.
Three deliberate first-control, double-score and unsigned-coercion variants fail these comparisons.
The container consumer now owns authored VIEW arrow delivery and post-focus hover ordering.
Full native factories, focus-tab traversal, controller pointer events, devices and pixels remain unfinished.


## Raw native input phases

Component and capture routing now retain raw phases zero, one and two.
Only phase one requests a press capture or counts as a pressed controller event.
Phase two preserves a completed double press until phase zero releases it.
The original factory, dispatch and cleanup corpus matches 3,216 steps and 1,032 exact button events.
The API carries raw phases through the router; physical callers convert their boolean state at the boundary.
The container patch owns GLOBAL reinjection and its controller capability checks.


## Retained Button appearance and component delivery

The shared runtime now models Button appearance separately from edit-box selection and input activation.
The press byte and applied visibility can differ after a suppressed mapping transition.
Raw phase `2` preserves the press byte. Own visibility and enabled callbacks retain their native reset behavior.
Inherited enabled updates use general event `17` without clearing the press byte.

Named setters use breadth-first ownership and native alias order. Only a missing locked control uses the default fallback.
A matching scene replacement restores the applied visibility before layout.
The same scene instance does not replay its setters. A visibility revision tells the consumer when layout needs another pass.
The retained presentation path preserves those setters during draw collection.

Input routing runs component effects before the next control reads its current context.
Container consumers keep implicit hover buttons on their separate controller route.
Original component and property comparisons match 248 cases and 7,168 steps.
Button/Input and hover composition match another 732 cases and 8,004 steps.
The container consumer also matches 336 ScreenView and overlap cases, including capture-priority releases.
Eight incorrect variants fail the native comparisons or lifecycle regressions.
Full screen construction, property-update timing, controller pointer receivers, Button audio, devices and pixels remain separate gates.

## Input visibility and capture ownership

Input visibility callbacks invalidate all mapping phases without clearing double-press history.
Removing a control from normal input order also invalidates its phases.
Captured controls retain their identity after removal and receive their captured release before the normal pass.
New presses do not reach an unregistered control.

The source consumer matches 144 native pending-update cases and 12 initially hidden fixtures.
The complete original View update executes visibility propagation, input registration and removal, capture routing, and controller delivery.
The container patch owns the visibility producer and its retained scene integration.
External notification queue insertion, the admitted root, geometry, clocks, and input mode remain supplied boundaries.
Full screen construction, binding scheduling, modal transitions, physical devices, and native pixels remain unfinished.

The packaged consumer matches all 144 update cases, 12 initial hidden fixtures, and 12 direct visibility callback cases.
The direct callback corpus exposes an incorrect history-clearing variant that the screen sequence alone cannot distinguish.
Six incorrect variants fail behavioral assertions. All four builds pass 2,785 tests with 163 optional skips.
Twenty-five packaged regressions and the earlier input comparisons pass with mandatory production class origins.

## Synchronous component callbacks and scene restoration

Input dispatch now runs sibling callbacks before it commits the sender phase.
A reentrant visibility callback can invalidate other mappings without replacing the sender's final phase.
Wildcard callbacks also run before the following mapping samples its phase and double-press history.

Button components exist before deferred names bind.
Runtime setters notify the host immediately, while matching scene copies restore cached visuals without property callbacks.
This prevents intermediate alias writes from resetting held child input during a redraw.
The container notes record the original factories, tree notifications, composed comparisons, and remaining lifecycle boundaries.

The final JAR matches all 1,700 cases across twelve Button and visibility corpora.
Seven new incorrect variants fail behavioral assertions, including the scene-restoration regression.
All 33 packaged regressions and the earlier focus, tab, arrow, and GLOBAL comparisons pass.
All four builds pass 2,793 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies. All 1,184 client classes match the final add-on.
The modpack contains the exact verified client JARs. These changes are the candidate for release 0.3.51.

## Mode notifications and queued invalidation

Original mode notifications reset Button appearance before the sender resumes normal routing.
The sibling callback alone preserves Input mapping phases.
The complete producer also queues the root component update and drains the original tree context twice.
That update invalidates the mapping phases to `2` while captured control identity survives.
A reset-only implementation therefore misses part of the native lifecycle.

The reference covers 768 activation combinations and 36 press/release sequences across three mapping kinds.
Repeated notifications still run the lifecycle when the mode value remains unchanged.
The native controller receives the kind-7 event with its original mode payload.
These are native reference captures. The production mode-notification route remains unimplemented.


## Native desktop scale preference

The Bedrock settings tab now exposes `Bedrock UI scale offset` through the existing persisted VFP enum setting.
The default offset remains zero.
Offsets from -1 through -4 reduce supported native presentations independently of Java GUI scale.
The viewport clamps the displayed scale to its current native limits and retains the selected preference across window sizes.
Native screens, supported HUD layouts, portraits, extraction, and pointer coordinates use the same viewport.

The existing Bedrock 1.26.51.1 `GuiData` controls establish the desktop scale and offset bounds at `141566fd0`.
Previously, runtime always supplied offset zero to that verified calculation.
The new wiring regression covers three resolutions, five Java GUI scales, and all five preference values.
All four viewport tests pass without skips.
The full build passes 3,054 tests with 152 optional skips and no failures or errors.
All 1,206 compiled client classes match the distributable add-on.
The core and both consumers retain matching 1,558 core classes, 200 assets, and 39 converter classes.

The reported missing inventory background remains unconfirmed.
This preference does not establish complete player-inventory/controller behavior, pocket layouts, or native pixel parity.

Fresh direct and ViaProxy BDS 1.26.51.1 sessions each verify 12 physical inventory actions at 1920 by 1013 pixels.
The native/Java scale pairs are 4/2, 3/3, 2/2, and 4/4.
At each pair, actual clicks pick up three diamonds, place one, and restore the stack.
Independent BDS chest counts confirm every transfer, and the production hovered slot remains aligned with the visible cell.
The real VFP setting passes four serialization round trips per route.
A physical click on its published settings row selects -1, and the private client configuration saves that preference.
All 20 screenshots receive visual review, including backgrounds, slot layouts, and the settings row.
Runtime hashes match the final distributables.
These controls cover a real chest and desktop settings; they do not reproduce the reported E-key player inventory or compare native pixels.


## Per-bone portrait material extraction, October 26, 2026

Portrait extraction now partitions each controller's actual rendered bones by material.
Each group intersects its surface selection with that controller's visibility rules.
Model keys retain the selected bones while the model keeps the complete animation hierarchy.
The current portrait cache releases historical surface subsets.

The shared geometry regressions cover surface filtering and preserved ancestor transforms.
Existing portrait appearance tests consume the complete material map and retain their independent context behavior.
Fresh installed portrait rendering with several bone materials remains unverified.
The separate creative inventory avatar preview is empty in the zero-alpha player fixture and does not verify this renderer.

The [current coverage record](../../../docs/bedrock-coverage.md#per-bone-material-rendering-october-26-2026) records the final build, both live routes, and remaining limits.


## Texture-backed avatar coverage, October 26, 2026

Native opaque costumes can retain zero source alpha while remaining visible in the world.
Minecraft 26.3 blits inventory avatars through a shader that discards zero alpha.
The previous intermediate texture therefore loses those surfaces before the final GUI draw.
This explains the earlier empty avatar in the zero-alpha fixture.

Picture-in-picture model submission now selects a lazy GUI variant for each native material.
The variant retains images, lighting, multiplier, and UV transforms while leaving the cached world material intact.
Ordinary Java materials retain their current rendering path.
The submission scope restores nesting and failures independently of native camera and animation contexts.
GUI emission stays in the native GUI shader and does not acquire world Iris additive passes.

After native cutout and emission calculations, surviving GUI fragments use control opacity as coverage.
Source alpha retains its earlier cutout and emission roles without multiplying opacity again.
World fragment output remains unchanged.

The old GUI shader fails the new EGL coverage regression with expected coverage 0.0925 and actual coverage zero.
The corrected shader passes 3,552 GUI blends and all 1,184 existing native color, discard, and depth controls.
All 15 focused tests pass without skips, including recovery after nested submission failures.
These opacity controls describe Java compositor integration, not a native GUI graphical baseline.

Fresh direct and Iris-enabled ViaProxy runs show the blue body on both inventory openings.
They retain cutout rejection, equipment, and the world appearance after closing the inventory.
Actual GUI variants remain distinct and stable across reopening while world pipeline flags remain unchanged.
All 26 main captures and a separate 15-capture Iris sneak probe receive review and pass their strict checks.
Downloaded pack files, installed artifacts, binding matrices, cache retirement, and owned process retirement also pass.

This supersedes the earlier empty-avatar observation for the authored fixture.
The [coverage record](../../../docs/bedrock-coverage.md#inventory-avatar-coverage-october-26-2026) records the full build and remaining limits.
The original E-key background/scale report, generic native portraits, remote skins, persona composition, and emote effects remain separate work.

## Native actor depth in GUI consumers, October 26, 2026

GUI actor selection retains the shared material's depth state when choosing its own blending pipeline.
Default, read-only equality, and disabled-depth cases keep their world-state identity without replacing GUI blending.
Uncommon variants enter the shared runtime cache rather than expanding the default preload list.
The shared actor owner contains comparison parsing, reversed-depth mapping, GPU controls, and emission limits.

## Explicit glint draw state in GUI conversion, October 27, 2026

GUI conversion retains the shared renderer's immutable glint state and secondary texture binding.
It preserves the existing portrait-coverage rule after the shared glint fragment result.
This keeps GUI blending separate from native world alpha without changing the cached world pipeline.
The shared actor owner records the native shader and clock controls.
Production enchanted equipment and live GUI glint remain unverified; their admission is unchanged.

Frame-glint world materials retain their captured state when converted to GUI materials.
The GUI variant uses explicit neutral tile RGB with the existing independent fullbright portrait policy.
Its cached variant does not sample a world entity's lightmap.
The final full-stack build and focused shader controls pass; native GUI glint equality remains unverified.

The replay retains the shared Iris glint mapping instead of restoring the earlier exclusion.
The new client check covers world actor draws and shader toggles; native GUI glint remains unverified.


## Held glint remains separate from GUI admission, October 27, 2026

GUI actor extraction keeps its own resources and selection scopes when world held items gain native GLINT admission.
A GUI portrait does not inherit the held-item material route or assume the world item's verified UV scale.
The pipeline guard rejects glint without explicit draw inputs.
The [held-item checkpoint](../../../docs/bedrock-coverage.md#equipped-native-glint-and-current-item-channels-october-27-2026) leaves native GUI glint unverified.

## Bitmap font resources for 26.60

The licensed resource provider now retains bitmap atlases and their layout JSON beside TrueType fonts.
The shared core converter selects each atlas with its own pack metadata.
The add-on regression exercises this provider through resource storage and font conversion.
It covers extended native layout, a legacy server texture override, pixel retention, and reuse of the unchanged licensed view.
The full add-on stack passes 1,274 tests, with no failures or errors and 142 optional skips.
Matching native 1.26.60.5 captures now cover mixed-language text, a legacy atlas, wide punctuation, multiline labels, and colored private-use icons.

`BedrockUnicodeFont` preserves native fractional advances and bearings while retaining Java's atlas uploads and provider lifetime.
The native width loader at `0x1415905b0` supplies the full-width ranges and distinct Hangul advance.
The line-advance method at `0x141590590` and the multiline capture establish ten UI units between bitmap text lines.
Ordinary Unicode pages use eight logical units; private-use pages E0 through F8 retain source-pixel size and a centered baseline.
The core converter owns that atlas scale and the winning first atlas's active page count.

Labels measure and align each line with a rounded width while glyph positions retain fractional advances.
The font layout regressions now live in this shared patch instead of the container consumer.
Tests cover narrow bearings, wide-range boundaries, Hangul, empty cells, texture resolution, and private-use metrics.
Paired renders match text spacing and preserve colored icon pixels.
The legacy-atlas origin difference is resolved by the native pixel grid rule below.
Font acceptance remains open for origin comparisons outside that fixture.

### Bitmap label origin comparison, October 28, 2026

Native 1.26.60.5 and the corrected Java add-on render the same legacy atlas at 1280 × 720 and GUI scale 2.
Sixteen fixed labels cover small, normal, large, and extra-large fonts at whole, quarter, half, and three-quarter positions.
The old Java renderer drifts vertically and samples extra ink columns at fractional positions.
All sixteen corrected glyphs match native bounds, ink counts, and normalized pixel masks.
Both Java recordings reach gameplay and finish normally.
The comparison isolates the glyph component from unrelated tutorial text and world pixels.

Apply the native one-unit label inset before snapping each aligned line origin to its font-size grid and then whole physical pixels.
Use the native viewport scale independently of Java's GUI scale.
Keep glyph advances and authored line spacing fractional.
The sixteen native coordinate cases form the regression fixture.

The full build reports 2,057 core cases and 1,294 add-on cases, with no failures or errors.
Optional skips total 176 and 145 respectively.
The fresh bundle contains the corrected origin implementation.
This result covers unshadowed legacy bitmap labels at the stated scale.
Extended-font origins, other viewport scales, and TrueType pixel comparisons remain open.
Licensed atlases, captures, packet journals, and image hashes remain private.
