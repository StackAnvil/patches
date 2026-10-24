# Present authored native containers

Server-authored container geometry needs real menu addresses and item authority.
This patch renders supported programs over the actual Java menu, with its actual slots, cursor, revisions, and ordinary inventory dispatch.
It retains the original screen object for recovery.

Supported families include template chests, ender chests, barrels, shulker boxes, hoppers, dispensers, droppers, and brewing stands.
Cooking programs use furnace, smoker, and blast-furnace menus with all 39 real inventory slots.
The default cooking program still uses ordinary controls because required handlers remain unfinished.

## Ownership and admission

Presentations bind to the current play listener, actual menu object, menu ID, family, and increasing opening sequence.
Cooking item updates also carry snapshot and inventory revisions.
Stale frames reject before item conversion. Invalid newer frames retire the previous authority.
Closing or retiring a menu preserves the sequence floor, so reused numeric IDs cannot revive it.
Reconfiguration on the same physical connection still requires a new play owner.

Full template menus require complete slot coverage.
Negotiated authored subsets retain only their declared slots and wait for actual contents and server activation acknowledgment.
Hidden or omitted slots cannot receive generic pickup, shift, number-key, drop, double-click, or drag actions in that subset.
Count-one actions use the existing negotiated backend, independently of template inventory dispatch.

Unknown required renderers, active unsupported item filters, storage bindings, and command mappings retain ordinary controls.
Known bundles retain ordinary controls while their storage bindings remain unsupported.
Native lock decoration reads exact retained ByteTag values and the owned connection's `showTags` rule.
Unknown storage values remain absent, rather than becoming fabricated zero values.

## Recipe pointer input

The client registers typed version-four cooking actions and replies.
Initial input requires an installed native screen, its exact owned menu, a resolved recipe scope, an empty cursor, and advertised capability.
The authored cooking backend currently requires server-authoritative inventory.
Recipe previews use copied translated stacks, independently of inventory-slot identities.

Slots, close commands, and recipe cells share clipped painter order, including equal-layer overlays and inactive controls.
Close commands honor their source input and pressed mapping.
A cooking slot's cancel-to-exit binding cannot close the menu on an ordinary primary or secondary click.

The Java adapter maps primary and secondary presses to phase zero, and releases to phase two.
Captured buttons retain the original recipe and command when newer scenes replace or remove the cell.
Drags, additional buttons, and duplicate releases cannot dispatch vanilla inventory input.
Unsupported mapping attributes, select/deselect constraints, and string booleans reject before the scene becomes actionable.
This adapter does not establish native physical event equivalence.

Replies must match the complete pending action. The sender records pending input before transport, including synchronous bridges.
Rejected or consumed authority requires a newer resolved frame before another gesture starts.
Capability loss, menu replacement, transport ambiguity, and response timeout retire the presentation.
A one-shot terminal release retains the original identity after retirement and cannot repeat transfers or retry an ambiguous terminal send.
Fallback restores the exact original screen on the same connected menu, even after controller retirement.
It cannot overwrite a later screen or a reused menu.

## Preference pointers

Supported tab, filtering, and layout toggles bind their actual authored group, index, and checked state.
They share clipped painter order with slots, recipe cells, and close commands.
The existing per-family transport carries changes after the installed screen checks its displayed snapshot.
Tab and filter changes permit a carried stack. Layout changes still require an empty cursor.
Preference changes cannot interrupt a recipe gesture.
Further pointer, scroll, and inventory-key input waits for a newer matching model.
Capability loss, ambiguous transport, or a ten-second wait restores the original screen.

The pinned callbacks `0x146c99520` and `0x146c99b40` pass 74 controls with initialized controller/model state and valid weak ownership.
Tab events use the group index and skip refresh for the current tab. Filtering events publish the new checked byte.
Downstream setters, collection rebuild, and settings refresh remain observed external boundaries.
Layout pointers preserve the current tab/filter, use native indices `1` and `2`, and skip a current-layout selection.
They wait for newer matching model state in either direction. Forced-profile layout controls retain ordinary screens.
The unchanged direct layout callback at `0x146c99560` passes 480 controls over supplied state, profile/input values, and held-source validity.
Its saved-tab and held-selection branches are observed but remain unimplemented in this preference adapter.
Focused mappings and additional device mappings also remain unsupported.
This route does not establish complete default-screen, native input, or visual parity.

## Rendering and retained behavior

Authored item bounds, count labels, progress, transient flights, and ordinary slot decoration use genuine menu state.
Native images and item draws carry opacity once through premultiplied submission, including cached item textures.
Animation refresh preserves clocks through hierarchical control and inventory identity.
New controls start at their update time; removed controls retire without inventing slot addresses.

Native title, multiline tooltip, color, anchor, offset, constraint, and scroll behavior use the shared renderer.
Tooltip wrapping preserves styled runs, CRLF boundaries, and empty lines.
Furnace tab, filter, and layout preferences retain their independent negotiated state per family.
The remaining default cooking controllers still need their UI bindings.

## Evidence and validation

The pinned native target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Native CPU controls cover progress, flights, typed lock reads, UI callbacks, and mixed-unit vector animation.
These include 20 progress cases, seven flight timings, 25 NBT controls, 125 UI callbacks, and 1,536 animation samples across 32 easing selectors.
Their original fixture boundaries remain separate from GPU and complete controller behavior.

The paired four-project build passes 2,453 tests, with 213 optional skips and no failures or errors.
All 104 core patches and 38 client patches replay.
Checkstyle, access-widener validation, and Maven POM generation pass. All 1,401 embedded core classes match the rebuilt core.
The cooking action, presentation, controller, screen, and geometry suites pass all 42 tests.
All eight shared presentation tests also pass.
Disabling recipe pointer routing fails the interaction regression.
The mapping regression also fails before the unsupported-attribute guard.
Disabling preference or layout admission, or intrinsic toggle hover selection, fails the corresponding interaction and presentation regressions.

A private live fixture projects supported controls from real cooking scenes without changing the core or server.
It removes unfinished widgets, unsupported mappings, and unsupported renderer leaves.
A private color marker identifies the projection. The ordinary test driver waits twelve seconds before its first panel check.
Projection retains all 39 real inventory addresses, retained recipe metadata, and original mapping entries.
Actual installed screen handlers send fourteen tab/filter/layout changes and receive newer cooking models with the requested state.
These confirm the core round trip, independently of Bedrock settings acknowledgment.
The handlers then send primary presses and releases in all three cooking families.
BDS starts cooking after each placement, with one real ingredient and an empty cursor.
All six production replies match and accept the inputs.
The fixture restores ordinary screens, then the three normal cooking cases and same-world reconnect pass.
Private runtime inventories match all 2,445 core and client class resources plus four data resources.
Raw captures, rendered images, fixture programs, and observers remain private.

This live fixture is a controlled projection, not an unchanged server-authored screen or native reference image.
It does not establish OS mouse translation, broader recipes and quantities, nonempty-cursor behavior, or native pixel parity.

## Remaining work

Complete default search, help, focus, carried-item, tertiary, controller handlers, and layout selection history before replacing the default cooking program.
Navigation and filtering still need their remaining focus and device mappings.
Cross-input prediction, authoritative model watchers, additional workstation families, and complete inventory semantics remain unfinished.
Exit transitions, carried-item opacity, inactive filters, native fonts and pixels, resource reloads, and broader client routes also remain verification gaps.
Actor-backed authored storage acceptance and complete native GUI parity remain unverified.

## Prerequisite

- [Shared scene and GUI actor rendering](0029-share-native-ui-scene-rendering.pr.md).

See the [native cooking reference](../../../docs/native-cooking-actions.md) for dispatch, request, and native evidence boundaries.


## Context-preserving recipe focus

Version-five action sessions carry an explicit native controller mode.
Mode `2` can begin with a primary focus and continue to a primary press, including before the focus reply arrives.
The next press still requires its current displayed cell and command scope.
Follow-up phases and cancellation retain the captured snapshot and controller mode.
An older focus rejection cannot erase a newer selection and strand its release.
Terminal cancellation sends at most once after an ambiguous focus send.

The production mouse adapter supplies mode `1` and keeps its carried-item guard.
It does not infer a native mode-`2` device from pointer input.
Physical mode-`2` delivery, complete active-device integration, and the default carried-item screen remain unfinished.
Core compares three cursor-preserving request payloads with original native transfer and serialization execution.
Client controls cover reentrant replies, pending focus, newer frames, forged contexts, late failure, and cancellation.
The [focused transfer notes](../../../docs/native-cooking-actions.md#focused-carried-item-transfers) retain the native boundaries.

The final combined suites pass 2,621 tests, with 163 optional skips and no failures or errors.
All four projects build, and the final core rerun includes the integrated movement reference fixtures.
Cooking, camera, retained particle, attachable, and Iris GPU comparisons run without skips.
All 1,413 core classes match both packaged copies, and all 1,139 production client classes match the add-on.
The affected core and add-on stacks replay successfully.

A fresh BDS 1.26.51.1 route verifies version-five mouse actions in furnace, smoker, and blast-furnace screens.
All six press/release replies retain context `1` and their original authority across newer frames.
Each real ingredient starts cooking, all three ordinary follow-up cases pass, and same-world reconnect passes.
Both runtime inventories match 2,551 project class resources and four data resources.
Normal cleanup removes the observer, restores the private driver change, and leaves no managed-profile JVM.
The controlled scene projection preserves all 39 real slots while it removes unfinished controls and mappings.
This run does not establish unchanged authored screens, physical mode-`2` input, carried-item screen support, or native pixels.

## Carried stacks on supported cooking screens

Supported cooking scenes retain their installed screen when the real menu cursor changes.
Ordinary slot input and Java carried-item extraction keep their existing owners.
The screen no longer falls back merely because the player carries a stack.
Direct mouse recipe presses still require an empty cursor and consume their captured release without ordinary inventory input.

Complete native tab and filter callbacks `0x146c99520` and `0x146c99b40` contain no held-item admission check.
The adapter now permits those preferences while carrying, with the same idle-gesture and newer-model checks.
Downstream native model setters remain supplied boundaries in the callback fixtures.
Layout changes retain their carried-item guard because saved-tab and held-selection behavior remains unfinished.

Three new screen regressions fail before the correction and pass after it.
They cover counts `1` and `64`, preparation and refresh, newer snapshots, recipe suppression and resumption, and preference acknowledgment.
Separate negative controls restore the old preference guard or remove the mouse recipe guard. Each breaks the relevant behavioral regression.
The focused client suite passes all 34 tests without skips.
The four-project build passes 2,626 tests, with 163 optional skips and no failures or errors.
All 104 core patches and 38 client patches replay.
The 1,413 core classes match both packaged copies. All 1,139 production client classes match the add-on.


A fresh BDS 1.26.51.1 route passes furnace, smoker, and blast-furnace controls with one supplied ingredient each.
Actual screen handlers pick up that real stack, retain the screen, suppress a held recipe gesture, and return the unchanged stack.
The cooking model advances through both cursor transitions. Ordinary request responses do not increment the server revision counter.
Normal recipe input then receives all six matching press/release acknowledgments, and BDS starts cooking in each family.
All three ordinary follow-up cases and same-world reconnect pass with the expected final item counts.

The private scene projection retains all 39 real slots and recipe metadata while removing unfinished controls and mappings.
Both runtime inventories match 2,551 project class resources and four data resources.
Normal cleanup removes the observer, restores the temporary six-second driver delay, and leaves no managed-profile JVM.
Two earlier failed fixture attempts remain archived separately. They assumed a spare ingredient-independent stack and a response-driven server revision.
This route does not establish carried tab/filter input, stack counts beyond one, unchanged authored screens, native opacity, or native pixels.

This change does not complete carried-item opacity, native device production, default search/help controls, layout history, or visual parity.

## Authored toggle input contract

Published release 0.3.46 rejects all 15 toggle controls in fresh default cooking scenes from the packaged core fixtures.
The furnace fixture has seven controls; smoker and blast-furnace fixtures each have four because their category contents differ.
The resolved scenes retain the target's focused `menu_ok` mappings and the filter's implicit hover mapping.
This confirms the parser rejection seen during the ordinary BDS run. It does not establish unchanged native screen acceptance.

Original Bedrock 1.26.51.1, build 51061372, protocol 2193 supplies the input contract.
Input dispatch `1445056d0` executes in 4,320 cases covering mapping kind, control flags, device mode, bounds, phase history and consumption.
These cases execute the original pointer eligibility, empty-parent clip walk, cached-name lookup and event construction without replacement hooks.
Their mapping records, control geometry, flags, absent weak owner and fixed queue capacity are supplied boundaries.
Double-press tracking, pointer capture, dirty layouts, parent clips and focus production remain outside this control.

Another 288 sequences execute 1,440 original dispatch calls through the actual input and toggle vtables.
They run the original ToggleComponent constructor, event handler `144575660`, checked-state setter `144575910` and toggle-change event construction.
Binding publication, visual synchronization, radio sibling propagation and settings notification remain observed host interfaces.
Factory fields, control flags, geometry and event capacity are supplied. Complete construction and native settings persistence remain unverified.

Focused mapping eligibility uses the native control flags rather than pointer bounds.
Mouse and gamepad toggles activate on a new press; touch toggles activate on a new release.
Repeated phases do not create another toggle change. Radio controls still notify when already checked.
A private Java candidate matches every dispatch case and toggle step.
Four wrong candidates fail behavior assertions: focused input treated as pointer input, touch activation on press, repeated activation and discarded checked-radio notifications.
Those earlier controls used a private candidate. The current source consumer appears below.

Complete focus lifetime, downstream controller behavior, device translation and full event propagation remain requirements for complete scene admission.
The shared scene already retains focus identifiers, directional overrides and precedence fields; the client must consume their native semantics.
These controls do not establish controller navigation, unchanged authored screens or native pixels.

### Native focus ownership and hover production

Original focus admission `14464fd50` executes in 16,384 cases.
It acquires the control owner, publishes the manager, and rejects duplicate registration.
The optional disabled-control component remains unidentified. Its disjoint type ID and presence are supplied inputs.

Original focus construction `1444fd670`, default selection `14464a7d0` and indexed selection `144651290` execute in 3,840 default-selection cases.
The native ranking uses a zero precedence floor and separate binary32 operations for `y * weight + x`.
Equal scores retain registration order. Maximum-float scores do not select a control.
Geometry, the manager weight, component IDs, owner state and history storage are supplied interfaces.

Another 1,024 sequences execute 3,072 original directional-manager steps through `14464c7a0` on a four-control grid.
They cover both registration orders, all initial selections, all three-step directional paths, and enabled or disabled wrapping.
Original focus destruction `14450d050` runs after every case. Every focus-owned allocation completes its recorded free.
Supplied managers and control owners remain outside that ledger.
These controls do not establish arbitrary directional scoring, nonempty overrides, parent clipping, scrolling or selection listeners.

Original hover delivery `144506500` now feeds focused dispatch and the original toggle pipeline in 144 sequences.
All 720 hover calls and 720 dispatch calls execute original hover-state mutation, component callbacks, phase storage and toggle changes.
Hover delivery produces flag `0x02` and honors the delegated-hover marker.
Focused dispatch consumes the resulting flags instead of repeating pointer eligibility.
Strong-owner balance passes. Queued weak-event retirement and complete manager lifetime remain outside these controls.

A private Java candidate matches all new controls. Six wrong candidates fail behavioral assertions.
The rejected variants ignore authored focus disabling, inherited eligibility, the zero precedence floor, binary32 ranking, wrapping or delegated hover.
These earlier controls leave the selection listener and implicit binding construction outside their execution scope.
The factory and ScreenView controls below extend that evidence.
The [focus and hover notes](../../../docs/native-cooking-actions.md#native-focus-admission-and-hover-delivery) retain the integration limits.


### Factory-created focus and input delivery

The [shared scene change](0029-share-native-ui-scene-rendering.pr.md#native-component-flags-and-focus-defaults) now applies native component flag types and focus defaults.
Its native controls execute the actual input/focus factories and ScreenView selection-to-hover delivery before button dispatch.
Factory-created implicit hover bindings and manager history cleanup now execute in that combined route.
The container mapping admission policy remains unchanged.
Full native input routing, controller event handling, radio siblings, device-origin translation and unchanged authored screen acceptance remain open.


## Container component consumer

Container input now uses the shared native Input/Toggle state and release-capture router.
Stable controls retain phases, captures, checked state and directional focus across controller binding refreshes.
Component changes enter the queue before button scope filtering.
The preference adapter consumes the emitted checked value and composes non-consuming events before publishing the final options.
Blocked components retire phases without changing checked state.
Arrow navigation reveals focused controls. Focused keyboard actions retain their release ownership.

The implicit filter-hover event selects collection `filter_toggle`, cell zero.
It does not set a hover binding or establish keyboard focus.
Original callback registration and ScreenView/controller delivery cover 632 cases.
Original Input/Toggle factories compose with those callbacks in 96 scenes and 384 button steps.
The actual main container consumer and preference adapter match all 384 steps.
These comparisons supply bare controls, geometry, base callback owners, Furnace fields and downstream model/selection observation boundaries.
They do not construct the complete Furnace controller or verify native devices and pixels.

All 54 targeted component, geometry, scroll, presentation and screen tests pass.
Screen tests cover focused keyboard preference updates and non-consuming tab/filter changes without vanilla inventory dispatch.
The source parser accepts all 15 unchanged default toggle definitions.
The complete default screens still fall back because search, slider and other handlers remain unfinished.
Remaining VIEW focus-tab routes, recursive GLOBAL wildcards, unresolved toggle collection indices and unsupported modal/controller policies remain explicit admission limits.
This change does not establish complete authored-screen support or resolve the original inventory screenshot report.

## Recipe hover entry and exit

Cooking recipe controls now admit implicit collection-hover events.
Pointer entry selects the resolved collection cell.
Pointer exit clears it only if both the collection and index still match.
An older exit cannot erase a newer selection or change its revision.
The current selection survives a model refresh with unchanged authoritative selection.
Collection indices use native integral type checks and signed 32-bit narrowing.

The original native registrations, three hover closures, dispatcher and final exit clear pass 5,832 cases.
Both exit callbacks execute even when the first returns a handled result.
The fixture supplies collection resolution and observes the first selection/exit virtual methods.
It does not execute their Furnace enum, touch-held state or storage-item predicate internals.
All native-owned allocations are released.

The screen regression covers entry, retained highlighting through a model update, exit and re-entry without inventory or preference requests.
The presentation regression covers interleaved collection/index exits across all three cooking families.
All 42 targeted screen, presentation, input and geometry tests pass.
Unchanged default screens still require help, drop, search, input-panel and other controller handlers.
The full stack build passes 2,740 tests with 163 optional skips.
Packaged production index and selection consumers match 17,496 native cases across all three cooking families, within the fixture boundaries above.

## Native tab actions

Authored tab increment/decrement buttons and navigation-only input panels now use the existing native category transition model.
The controller consumes activation events and preserves furnace type, filtering and layout.
Ordinary survival layout retains the current tab; forced recipe layout still navigates.
A tab refresh clears cell selection, including a transition that returns the current tab.
That clear follows the original setter at `0x146c47780`; its held-item branches remain outside this adapter.
Changes wait for newer matching authoritative options. Tab actions permit a carried stack.
Zero-size global panels require preference transport before input begins.
Non-consuming mappings that could mix navigation with ordinary inventory dispatch retain the original screen.

Original callback registration, receiver/dispatcher, both tab callbacks and complete native category/vector operations pass 8,064 cases.
Selected-tab mutation and settings refresh remain observed downstream boundaries.
The fixture supplies a base-constructed callback owner, Furnace virtual table, category model and valid weak ownership.
It does not construct the complete Furnace controller.
Screen tests cover pointer and keyboard activation, repeated presses, a stale model response, carried items, selection clearing and missing transport.

The current default resolved controls lack screen-host tab mappings.
Screen-host input preservation, held-selection/reset commands, help, drop, search, remaining input panels and physical gamepad translation still need integration.
This change does not establish complete native workstation or input parity.
The full stack build passes 2,743 tests with 163 optional skips.
The packaged transition adapter matches 48,384 native cases across all three families and both filter states, within the boundaries above.

## Screen-host input ownership

Cooking scenes retain their real authored screen root.
Navigation-only screen hosts now share the existing button/input-panel consumer and retained component phases.
A host-owned press remains held across a model update, then releases before another activation.
The real screen regression fails against the previous content-only core.
Its fixture declares an actual screen and content hierarchy, with no substitute input wrapper.

The unimplemented player-hurt close policy retains the ordinary menu before input.
The complete default hosts retain focus-tab navigation, layout, cursor/drop and other commands that still need handlers.
Search/edit controls, held-input/reset flow, remaining policies, physical devices and pixels remain open.
Preserving the full host does not establish full default-screen admission.
All four builds pass: 2,745 tests, with 163 optional skips.
Final JARs pass the three desktop host structure checks and both actual host-owned screen regressions, with mandatory production class origins.
Pocket declarations now resolve through the shared definition store. Production pocket profile selection remains unfinished.


## Screen-owned arrow input

Authored VIEW arrows now use retained component phases and activation transitions.
Java key repeats no longer move focus directly. Release retires the authored mapping phase.
Focus-enabled panels participate without a controller action.
The screen reveals and lays out the selected control before the adapter calculates its logical pointer position.
Nested hover buttons reach the controller before the outer button queue.
Preference waits suppress focus changes while still retiring input phases.

Original 1.26.51.1/protocol2193 execution covers 147 composed ScreenView cases and 2,169 focus, pointer and hover steps.
The production adapter matches those states and all 840 captured controller button events.
The capture includes three input modes, registration orders, precedence types, wrapping, fractional geometry and mixed controller/VIEW queues.
All 91,920 native frees complete with no remaining native allocations.
Seven incorrect selection, type, repeat, pointer, admission and queue-order variants fail the comparisons.
Targeted tests also cover retained phases, reveal relayout, real key handlers and missing authored arrow mappings.

The fixture supplies ScreenView fields, input order, rectangles and empty controller children.
Original component factories, inline ScreenComponent constructor bytes, mapping, selection, hover and base controller delivery execute.
It does not construct the full screen or establish native input-order construction.
The 1,353 captured kind-5 controller pointer events remain outside this consumer.
Recursive GLOBAL wildcards, focus-tab groups, modal/deflection routing, full scroll geometry, devices and pixels remain unfinished.
The complete default-screen admission gate remains in place. The original reported bugs and all five goal areas remain open.

All four project builds pass 2,756 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies, and all 1,181 client classes match the final add-on.
The packaged add-on repeats the ranking and composed ScreenView comparisons with mandatory production class origins.
Five packaged screen and input regressions pass, including missing authored keys and reveal relayout.


## GLOBAL input reinjection

GLOBAL mappings now re-inject the target with the previous raw phase before the original controller event arrives.
The previous phase can be two. It must not become a press, release or collection-hover exit.
Implicit hover reinjection uses the current View mode and event time, rather than its zero-mode event header.
Physical pointer coordinates remain separate from focus hover coordinates for raw geometry and clip checks.
Recursive GLOBAL wildcards still retain the ordinary screen before input.
Inventory, recipe and close actions still use a separate direct pointer controller.
Cooking scenes with GLOBAL targets or cross-control aliases that could authorize those actions retain the ordinary screen.
Their complete event receivers remain required integration work.

The original raw mapping and View pipeline match 29 GLOBAL cases and 200 steps, including 286 controller button events.
These controls cover captured releases, prior phase two, hover recursion, physical/logical coordinates and all three input modes.
Another 48 cases match 240 Toggle/Furnace callback steps through the actual input and preference adapters.
All 49,930 native frees complete across these corpora with no native allocations left.
Ten deliberately incorrect phase, capture, mode, coordinate and ordering variants fail the comparisons.

The captures supply View fields/order, bare controls, inactive or supplied focus geometry, base callback containers and empty controller children.
Original component factories, mapping, recursion, callbacks and control/manager/controller/capture-map cleanup execute.
Preference setters and refresh remain observed boundaries. Immediate settings-notification timing remains outside the Java callback adapter.
The inspected Furnace constructor chain has no pointer callbacks of its own; complete child-controller population remains unverified.
The 36 new captured kind-5 pointer events remain unported, alongside the earlier pointer-event corpus.
Full screen construction, controller pointer handling, focus-tab groups, modal/deflection policies, physical devices and pixels remain unfinished.
Existing controller-command admission checks remain in place. This work does not resolve the original four reports or complete any of the five goal areas.

All four project builds pass 2,766 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies, and all 1,181 client classes match the final add-on.
The packaged add-on matches all 3,216 raw-phase steps, the 200 GLOBAL View steps and the 240 Toggle/Furnace callback steps.
It also retains the earlier 2,169 composed arrow steps and 840 controller button events.
Six packaged screen and input regressions pass with mandatory production class origins, including fallback before unsupported GLOBAL slot actions.

## VIEW tab groups

VIEW tab events traverse the visible, enabled `navigation_tab` toggles.
They choose the next authored index and wrap from an endpoint. Tree order decides the last checked control and duplicate-index owner.
This route differs from the separate Furnace category callback and its count-based rules.
Eligible toggles update together. The group change precedes old/new tab hover events and retains its native false notification flag.
Control-local hover leaves both View pointer positions unchanged.
Keyboard admission now checks the mapping's VIEW receiver.

Original 1.26.51.1/protocol2193 execution matches 208 cases and 2,117 steps, including 815 group changes and 906 controller buttons.
The corpus includes all three input modes, retained phases, disabled and hidden controls and parents, duplicate indices and zero-width geometry.
All 79,461 native frees complete with no native allocations left.
Nine incorrect selection, eligibility, phase, notification, ownership and pointer variants fail the comparisons.
The real screen regression covers authored selection, preference synchronization and a held key across the matching model update.

Fixtures supply the tree, component order, geometry and initial checked state.
Generic index probes also cover values outside cooking-screen admission. Their callback adapter constructs the corresponding preference record separately from installation.
Original factories, traversal, mutation, hover and Furnace callbacks execute; downstream setters, full screen update and settings timing remain observed boundaries.
The 585 captured kind-5 pointer events remain outside the controller consumer.
Focus-enabled VIEW delivery now follows the separate active-manager path described below. Default Furnace tabs explicitly disable focus.
Complete screen construction and admission, devices, pixels, the original reports and all five goal areas remain unfinished.

All four builds pass 2,770 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies; all 1,181 client classes match the final add-on.
The final add-on repeats the 208 tab cases, the earlier 147 arrow cases and all 29 GLOBAL View cases with mandatory class origins.
Ten packaged screen and input regressions pass, including authored VIEW tab preference synchronization and held input across a matching model update.

## Focus-enabled VIEW tabs

Focus-enabled tabs now select their native focus target and reveal it before calculating hover geometry.
Their whole-view hover queue reaches the controller before the group change.
Both stored View pointer positions stay unchanged. Non-focus tabs retain their separate group-change-first, local-hover route.
The screen regression covers focus transfer, preference synchronization and held input across the matching model update.
A separate regression verifies hover after reveal relayout.

Focus ownership no longer manufactures the native selection-latch flag.
Original overlapping controls can assign hover and focus to different owners.
The old flag activated an extra focused mapping and changed the preference twice.
The combined input corpus rejects that behavior and preserves the actual hover owner.

Original 1.26.51.1/protocol2193 execution matches 204 composed cases and 2,388 steps, including 804 group changes and 1,182 controller buttons.
The controls cover three input modes, mixed focus settings, radio states, input orders, hover consumption and overlapping or fractional bounds.
All 127,116 native frees finish with no native allocations. Nine incorrect variants fail the comparisons.
Original Input, Toggle, Focus and manager factories, registration, forced selection, reveal/hover and Furnace callbacks execute.
The inline ScreenComponent constructor executes before registration. Component vectors, tree/order, geometry, initial bindings, View fields and active manager state are supplied.

Full screen updates, downstream setters and settings timing remain observed boundaries.
Six paired inactive-manager probes show different hover delivery. Production manager activation and that inactive path remain unfinished.
The native fixture has no edit-box component. Its selection flag and the separate Button press state still need their native owners.
All 1,284 new kind-5 controller pointer events remain outside this adapter.
Full screen construction and admission, native scroll reveal, devices, pixels, the original reports and all five goal areas remain open.

All four project builds pass 2,773 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies; all 1,181 client classes match the final add-on.
The final JAR matches both focused-input corpora and repeats the 208 plain-tab, 147 arrow and 29 GLOBAL View cases with mandatory class origins.
Thirteen packaged screen and input regressions pass, including focus transfer, reveal relayout and the false-latch regression.


## Native Button consumption and appearance

Supported cooking controls now retain the native Button press byte independently of their applied visual state.
The control-level `consume_event` result reaches raw input and pointer dispatch.
The edit-box component owns selection flag `0x80`. Button appearance does not create that flag or derive it from focus.

Raw phases `0` and `1` change the press byte. Phase `2` preserves it.
Selection flags determine whether a transition updates visibility immediately.
Matching scene replacements retain the applied visibility, including a suppressed press that differs from the visible state.
Named setters run before layout, so the selected branch also determines content dimensions and hit bounds.
The renderer preserves those setters instead of choosing another branch during draw collection.

Named controls use the first breadth-first match. Setter order remains significant for shared state names.
Press and hover do not use a default fallback for missing state children. Disabled state uses the default child without a locked child.
Hover exit, hiding the Button, and disabling the Button clear the press byte.
An ancestor enabled change preserves it and broadcasts general event `17`, which updates visibility.
Attaching the same scene instance does not replay the setters or create a layout loop.

Raw component callbacks execute before later controls sample their context.
Implicit hover buttons enter the controller queue without another sibling Button callback.
This distinction preserves appearance when hover mappings and ordinary presses share a control.
Capture-priority release routing retains duplicate requests and skipped mapping phases.

Original 1.26.51.1/protocol 2193 execution supplies these comparisons:

| Native path | Cases | Steps |
| --- | ---: | ---: |
| Button state and named visibility | 184 | 5,888 |
| Own and ancestor property producers | 64 | 1,280 |
| Button/Input composition | 720 | 7,920 |
| Implicit hover composition | 12 | 84 |
| ScreenView and controller delivery | 288 | 1,728 |
| Overlapping Button propagation | 48 | 288 |
| Total | 1,316 | 17,188 |

All 201,090 native frees finish with no native allocations. Each fixture verifies all declared owner counts.
The factories, deferred name resolver, callbacks, property setters, ScreenView routing and destructors execute in their declared captures.
The ScreenView entry returns `void`. Its leftover return register is excluded from consumption comparisons.
The original Input component supplies consumption results. Eight incorrect variants fail the comparisons and lifecycle regressions.

The published 0.3.49 JAR reproduces the old consumption and pressed-child gaps.
The rebuilt JAR matches all six new corpora with mandatory production class origins.
Twenty-one packaged regressions cover the new Button consumers and earlier screen, focus, tab and GLOBAL behavior.
All four builds pass 2,781 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies. All 1,184 client classes match the final add-on.
The packaged add-on also repeats the 192 focused-tab, 12 focused-button, 208 plain-tab, 147 arrow and 29 GLOBAL View cases.

The fixtures supply trees, input order, geometry, properties, clocks, View fields and inactive or explicitly active manager state.
External UIContext sinks retire shared arguments through the original destructor. They do not replace state or visibility outputs.
The overlap fixture disables hover consumption so both controls acquire hover through the original pointer entry.
Complete screen construction, update/binding order, manager activation, Button audio, edit-box selection and controller pointer receivers remain unfinished.
These comparisons do not establish physical-device behavior or native pixels. The original reports and all five goal areas remain open.

## Visibility callbacks and input registration

Supported cooking controls now retain native visibility callbacks and input registration across scene updates.
Own `visible` and `ignored` changes invalidate every mapping phase in both directions.
Hiding an ancestor removes its descendants from normal input order and invalidates their mapping phases.
The hidden hover callback clears Button appearance without synthesizing implicit hover buttons for the controller.
Double-press history and captured control identity survive these transitions.

A hidden control can still receive its captured GLOBAL release.
Showing only its ancestor preserves that release phase. Showing the control itself triggers its own visibility callback and invalidates the phase.
Deleting the control still retires its captures before another control can reuse the identity.

The comparison executes these original 1.26.51.1/protocol 2193 producers:

- `144582b20`: the UIControl setter for visible and ignored state.
- `1448422c0`: the complete View function that drains pending updates.
- `144847310`: inherited visibility and hidden hover propagation.
- `144847620` and `1448491c0`: input admission, mapping invalidation, and sorted registration or removal.
- Original raw View routing, captured releases, base controller delivery, and native destructors.

The 144 cases cover three input modes, owner and parent changes, visible and ignored state, three mapping kinds, and independent capture policies.
All 2,592 steps and 1,452 controller buttons match the source consumer.
Twelve separate fixtures start with hidden raw flags and prove phase invalidation during initial registration.
Both captures complete 40,932 native frees with balanced allocations and owner counts.
The published 0.3.50 add-on fails the comparison when its first hovered control becomes hidden.

The fixture supplies the external notification queue and its scheduling boundary.
The real Input factory creates the modal root that establishes the admitted screen context.
Tree, geometry, clocks, input mode, and inactive manager state remain supplied.
No visibility, mapping phase, registration, or capture result uses a replacement function.
The raw View entry returns `void`, so its leftover return register remains excluded.
Whole screen construction, binding scheduling, synchronous named-child updates, modal transitions, manager activation, devices, and pixels remain open.
The four original reports and all five implementation areas remain unfinished.

The direct visibility callback comparison adds 12 cases, 120 steps, and 2,190 balanced native frees.
Its preserved hover exposes incorrect double-press history clearing that the screen sequence alone cannot distinguish.
The final add-on matches all three new corpora with mandatory production class origins.
Six incorrect variants fail behavioral assertions, including the history-clearing variant against the direct callback corpus.

Twenty-five packaged regressions pass, including four new mapping, registration, visibility, and capture regressions.
All four builds pass 2,785 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies. All 1,184 client classes match the final add-on.
The final JAR also matches all six earlier Button corpora and the earlier focus, tab, arrow, and GLOBAL comparisons.
The rebuilt modpack contains the exact verified ViaFabricPlus and add-on JARs.
These lifecycle changes remain outside published release 0.3.50.

## Synchronous named-control visibility

The host creates and indexes all input components before it resolves Button names.
Named visibility setters notify the target Input before its Button callback.
Inherited visibility, hover exit, and ordinary registration wait for the later View update.
Later controls in the same raw pass therefore retain native delivery and observe the correct mapping phase.
Matching scene copies restore cached appearance without replaying intermediate aliased property changes.

The new comparison executes the original tree constructor, deferred resolver, by-value notification methods, and complete pending-update drain.
Those notification methods populate and deduplicate the actual queues. The fixture does not insert queue entries directly.
The remaining notification queue at `+b8` has no established consumer in this corpus. Binding expressions remain outside its scope.

The 216 original 1.26.51.1/protocol 2193 cases cover nested controls, self references, and wildcard callbacks.
All 3,456 steps and 3,012 controller buttons match. All 73,002 native frees complete with balanced owners and allocations.
The prior packaged implementation fails the first named-child phase comparison.
An intermediate implementation also resets held input when cached visuals restore an aliased scene copy.
A separate regression preserves that Java representation boundary without claiming a native scene-copy event.

Root attachment, control trees, geometry, clocks, input mode, manager state, and drain boundaries remain supplied.
Full screen construction, binding expressions, physical frame scheduling, modal transitions, Button audio, devices, and pixels remain open.
Default/player inventory, the four original reports, and all five implementation areas remain unfinished.

The final JAR matches all 1,700 cases across twelve Button and visibility corpora.
Seven new incorrect variants fail behavioral assertions, including the scene-restoration regression.
All 33 packaged regressions and the earlier focus, tab, arrow, and GLOBAL comparisons pass.
All four builds pass 2,793 tests with 163 optional skips and no failures or errors.
All 1,448 core classes match both embedded copies. All 1,184 client classes match the final add-on.
The modpack contains the exact verified client JARs. These changes are the candidate for release 0.3.51.

## Native mode-change reference

The original ScreenComponent factory branch now executes allocation, inline construction, registration, and its complete property parser.
Its `gamepad_cursor` flag belongs to the component, separate from UIControl flags at a similar offset.
Seventeen property cases match the published Java reader, including integer coercion and rejection of real values.

The complete original mode-change producer now runs with the real tree context and its notification methods.
All 768 activation combinations preserve Input phases during sibling callbacks, then invalidate them during the queued root update.
Captured control identity survives. Another 36 sequences cover 360 steps, repeated notifications, three mapping kinds, and independent consumption and capture policies.
The kind-7 controller event retains its mode payload. All 171,588 native frees across these three captures balance.
The earlier bare-context probe omitted queue effects and therefore did not establish the complete mode lifecycle.

The wrapper constructor receives cursor policy from the native hide-cursor option and cursor sensitivity.
The reference still supplies those option values, raw transition and selection fields, root attachment, geometry, clocks, and manager state.
It executes a bounded factory branch rather than the entire control or screen constructor.
Physical notification admission, initial screen-install ordering, derived Furnace controller population, settings ownership, devices, and pixels remain unverified.
Production mode delivery and all five implementation areas remain open. These reference cases do not expand the production parity claim for release 0.3.51.

## Initial cooking input admission

Supported cooking screens initialize their input mappings once after the first accepted scene.
The initial phase is two, matching the original View before controller delivery.
Refreshes and resize preparation preserve held input instead of repeating initialization.

The reference executes the complete original wrapper constructor and destructor, resize, mode notification, activation, and frame paths.
All 144 initial-input cases cover 864 raw steps and 258 controller buttons, with 34,020 balanced native frees.
Bare control trees, geometry, empty layout queues, and external client services remain supplied.
The outer installer, physical notifications, authored layout construction, and derived cooking controllers remain outside this comparison.

The actual screen regression fails against published release 0.3.51 before this correction.
The four original reports and all five implementation areas remain unfinished.

All 1,844 cases across thirteen Button, visibility, and initialization corpora match the final JAR.
Three incorrect initialization variants fail behavioral assertions after both baselines pass.
All 34 packaged regressions and the earlier focus, tab, arrow, and GLOBAL comparisons pass.
All four builds pass 2,794 tests with 163 optional skips and no failures or errors.
The embedded core classes, compiled client classes, and exact bundled client JARs match.

## Stationary pointer admission

Cooking screens receive the current pointer after Java resynchronizes it, before the first frame.
The Gui hook uses the existing native viewport conversion and requires the same screen to remain installed.
A stationary pointer therefore selects and shows the hovered recipe without a movement event.
Refreshes and resize preparation keep their existing input lifetime.

The whole original installer now executes resize, initial mode notification, activation, and its optional wrapper/View pointer path.
All 96 cases match the published component implementation across 480 raw steps and 282 controller-button events.
All 25,602 native frees balance.
Client services supply the pointer, viewport, mode, empty screen stack, absent player, and empty service list.
Keyboard context handling remains an explicit external boundary.

The complete original `handleInputModeChanged` callback also executes its native screen lambda and GUI context construction.
Its 72 sequences cover 576 steps and 216 notifications, including repeated values and held input.
Mode notifications invalidate mappings while capture identities survive. All 18,480 native frees balance.
The one-screen enumeration service, GUI/context notifications, input subsystem, and telemetry remain supplied.
Physical notification admission and the client's actual screen selection policy remain unverified.
This capture does not add production gamepad delivery.

Java 26.3 calls `Screen.init`, resynchronizes its pointer, then returns from `Gui.setScreen`.
`Minecraft.setScreenAndShow` renders a frame before it returns.
Normal movement delivery requires nonzero accumulated movement.
The hook therefore runs inside `Gui.setScreen` after resynchronization.
The actual screen regression covers fresh pointer coordinates, unequal UI scales, recipe selection, matching model updates, and stale screen ownership.
The initial regression fails before this correction with no compilation or linkage error.

Bare native controls, empty layout queues, clocks, option values, and external services remain supplied.
Derived cooking controllers, authored layout and bindings, devices, and pixels remain separate gates.
Default/player inventory, other screens, all five implementation areas, and the four original reports remain unfinished.
These changes remain outside published release 0.3.52.

All four builds pass 2,794 tests with 163 optional skips and no failures or errors.
The final JAR matches 1,940 cases across fourteen Button, visibility, initialization, and admission corpora.
All 35 packaged regressions and the earlier focus, tab, arrow, and GLOBAL comparisons pass.
Three incorrect pointer-admission variants fail behavioral assertions after the unchanged baseline passes.
The isolated Java 26.3 client applies the hook after resynchronization and before the first forced frame.
A passive bytecode observer verifies that placement in the actual transformed Gui class.
This runtime check establishes hook application and order. The screen regression supplies external Minecraft and network services.
The 1,448 core classes match both embedded copies, and all 1,185 compiled client classes match the add-on.
The rebuilt modpack contains the exact verified client JARs.

## Player inventory opening ownership

The installed-screen hook now opens the native player inventory through a negotiated bridge.
Direct translation and ViaProxy share the same route.
Java reuses menu zero, so the client gives each real opening a separate token.
A presentation swap retains that token, while an ordinary reopen receives a new one.
The old constructor mixin is removed.

The core retains retired native opens until acknowledgment and waits for their close acknowledgment before a newer opening.
Retired screen clicks cannot replay into that newer opening.
Independent global actions can finish before the temporary inventory closes.
Server closes, form replacement and timeout target the owning client token.
Tokens stay monotonic across play-listener replacements, including reconfiguration.
An outstanding native open also prevents duplicate recovery requests.

Sixteen packaged regressions cover lifecycle races, capability changes, connection replacement and bounded codecs.
They require production classes from the final JARs.
All four builds pass 2,817 tests with 163 optional skips.
The full authored player inventory, recipes, tabs, search and physical controller input remain unfinished.
The bridge depends on the deferred core inventory-request work.
Standalone upstream compatibility remains unverified.
The bridge remains outside release 0.3.54.

The final isolated client completes four physical E-key open/close cycles through ViaProxy and Bedrock 1.26.51.1.
Two use survival inventory and two use the creative picker after a server command changes mode.
Both JVM observers confirm the four matching native acknowledgments without inventory clicks.
The persistent player-menu object stays the same, while opening tokens advance from one through four.
Constructing an unused inventory screen sends no native request.
Private screenshots show the ordinary Java screens.
Direct joins, real reconfiguration, packet-delay recovery and physical controller delivery remain separate gates.
