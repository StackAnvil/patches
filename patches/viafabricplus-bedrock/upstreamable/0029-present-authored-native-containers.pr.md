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

The current package rejects all 15 toggle controls in fresh default cooking scenes from the packaged core fixtures.
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
The candidate remains private; production input delivery is unchanged.

Complete native focus production and lifetime, hover callbacks, radio sibling state, device translation and full event propagation before admitting these mappings.
The shared scene already retains focus identifiers, directional overrides and precedence fields; the client must consume their native semantics.
These controls do not establish controller navigation, unchanged authored screens or native pixels.
