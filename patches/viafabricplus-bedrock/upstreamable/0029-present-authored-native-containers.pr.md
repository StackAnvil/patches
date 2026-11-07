# feat(inventory): present authored native containers

## Purpose

Bind authored container geometry to authoritative Java menus, slots and cursor state without changing inventory request ownership.

## Design constraints

Bind authored geometry and controls to the actual menu, cursor, slots, connection, and opening token. Keep request ownership in core and use ordinary screens when required components are unavailable.

The **Bedrock inventory screens** setting retains ordinary Java screens when disabled.
It gates storage, cooking, and player presentations before scene construction, including presentations that wait for container contents.
The default remains enabled for server packs that depend on authored layouts.
The setting does not disable forms or change inventory request ownership.

Prerequisites:

- viafabricplus-bedrock/0029-share-native-ui-scene-rendering.patch: Land shared scene and GUI actor rendering before container presentation.

## Validation and remaining limits

Regression coverage includes `BedrockNativeContainerScreenTest`, `NativeContainerButtonTest`, `NativeContainerGeometryTest`, `NativeContainerInputTest`, and `NativeContainerDrawsTest`.

Three receiver regressions cover malformed replacements, unsupported preparation, and failure after replacement.
Recovery restores the original ordinary screen with the same menu, carried stack, and slot contents.
Installed direct and ViaProxy controls inject a supported legacy replacement and a render failure into a real chest.
Both retain nine carried ingots and complete a server-accepted pickup and ordinary return.
These controls do not reproduce the reported WildFFA background or menu overlap failures.

An installed BDS control with Bedrock inventory screens disabled retains Java inventory, chest, furnace, and crafting screens.
Pickup, return, and reopening preserve all 64 logs.
BDS accepts both observed inventory requests without a synchronization timeout.
The production cooking test also retains ordinary controls when a ready presentation encounters the disabled setting.

Authored slot labels use [shared native count text](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md).
The consumer regression keeps raw binding quantities and genuine quickcraft preview text independent of display capping.

Player and workbench snapshots retain actual menu slots, recipe identities, and full item previews.
Commands carry the opening, generation, snapshot revision, and request sequence.
Buffered search edits survive an acknowledgment that advances the container generation.
The connection retains the latest local edit before command serialization, including an explicit clear.
Closing retires pending commands. A replacement presentation sends retained text under its own opening and generation.
Disconnect clears this client state; late replies cannot replace it.
Keep SDL text input separate from the editor highlight. Blank-area clicks and Escape remove the highlight but allow typing to resume.
Another focused control, a hidden editor, or screen exit releases text input.
Honor authored search selection and deselection flags instead of reactivating the field on a global deselection callback.
Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 retain search text and explicit clearing after pointer close and reopening.
Official Bedrock 1.26.60.5 local-world controls retain active Creative and Survival editing through viewport changes.
A Creative Ctrl+A selection survives a GUI-scale change. An inactive editor stays inactive through resizing.
The first Escape removes the highlight; the next closes the inventory.
Full Screen initialization and resize regressions preserve the same editor, registration, selection replacement, and inactive state.
Resize and GUI-scale rebuild failures use the ordinary-menu fallback, including presentation retirement before tick cleanup.
The resize regression retains the cursor stack and restores only the same still-open menu; it cannot revive a replacement menu.
An installed direct control retires a real player presentation during resize and retains its menu and three-item cursor through fallback.
Physical pickup and placement receive two successful BDS replies, and reopening retains all three items. This injected retirement does not reproduce the original inventory-background report.
Installed direct and ViaProxy controls use ordinary typing and retain a Ctrl+A selection through an actual window resize.
Both routes preserve inactive search, resume typing after Escape and blank clicks, and stop typing after recipe and slot selection.
A read-only observer confirms one registered editor and SDL input ownership throughout these transitions.
These controls do not establish complete keybinding, IME, controller, touch, or pixel parity.
Controller regressions cover closing before a search reply, replacement commands, explicit clearing, late replies, and connection replacement.
Rebuilt direct and ViaProxy controls delay search handling by four seconds, close with unsent edits, and retain the latest text and explicit clear after reopening.
Both routes preserve the 32-log stack and the native two-step Escape behavior.
The [core inventory patch](../../viabedrock/deferred/0003-translate-server-authoritative-bedrock-requests.pr.md) owns close-wait admission and close acknowledgments.
The optional acknowledgment-bound bridge keeps the world visible until the native player open acknowledgment.
This gate also applies with Bedrock inventory screens disabled.
Repeated E retains its token and reissues the native interaction.
Escape or chat cancels the pending intent, and late readiness cannot replace another screen.
Controller regressions cover actual screen admission, cancellation, old tokens, capability withdrawal, and connection replacement.
Initialization redirects retain the acknowledged token, including Java inventory switching to Creative during initialization.
Replacement player menus retire the pending opening before its acknowledgment can display the old screen.
Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls establish these visible behaviors with a four-second raw relay delay on protocol 2225.
Movement continues during the wait. Internal model constructor timing and complete frame-level population parity remain unverified.
Rebuilt direct and ViaProxy controls retain the world through delayed Survival, Creative, and workbench openings.
Both routes retain movement, repeated input, Pause and Chat ownership, and the 32-log stack.
The journals verify the repeated open interactions and native cleanup after cancellation.
A real-editor screen regression clicks a recipe, returns to search, and types the inventory key without closing the screen.
Installed direct and ViaProxy controls craft once, enter three replacement queries in the same opening, and retain completed output after reopening. Each route records one server-accepted craft request.
Late replies and hover exits cannot affect a replacement opening or selection.

Default player and workbench graphs retain all 46 menu slots and real recipe rows.
Help uses the native How to Play or Encyclopedia graph and the client key bindings.
Screen regressions cover slot confirmation, keyboard Back, Escape, repeated Help openings, and a retained carried stack.
Model regressions retain the opening and pending search across Help and source updates.
Cooking recipe drop keys share the player inventory drop owner.
Official 1.26.60.5 Furnace controls drop one carried item with Q and retain that stack with Ctrl+Q.
Both keys leave an empty recipe cursor alone.
Regressions distinguish recipe previews from real slots across the three default cooking geometries.
An admitted scene also covers held-key repeats and modifier release without extra requests.
Other default host actions retain their admission guards.
Registered directional callbacks navigate the retained bundle grid, with separate row and wrap rules.
The selected cell must resolve to the physical bundle slot before extraction and reply reconciliation.
Installed direct and ViaProxy controls each accept a nine-item pickup, two one-item drops, and a seven-item return.
Their cursor responses are 9, 8, 7, and 0. Reopening accounts for all nine items across inventory and dropped items.
A separate direct control retains seven carried items and two inventory items after the server rejects the return destination.
The installed controls use an admitted authored furnace fixture with normal guards. They do not establish complete default-screen support.

Cooking uses that same Help lifetime with the native Furnace encyclopedia topic.
Regressions retain pending search, source updates, carried items, and the inventory owner across Back and Escape.
The selected topic starts visible and focused, and encyclopedia headings use their localized prefix and topic label.
Official 1.26.60.5 controls distinguish the selected chapter from keyboard and pointer focus.
Pointer movement clears the keyboard highlight and retains the navigation anchor.
Hovering another topic moves that anchor without selecting its chapter.
Arrow keys resume from the anchor, and confirmation selects the chapter.
Cached drawing retains the active keyboard highlight and avoids highlighting the parked pointer at the same time.
The release of the opening click preserves Help focus because the replacement view retains the physical pointer position.
Installed direct and ViaProxy controls match the scoped native green and gray focus pixels at 1280 × 720.
Both routes retain nine carried items through pointer handoff, resumed keyboard navigation, Back, Escape, and reopening.
Settled backdrop samples match the native opaque color. Selector layout, inline input glyphs, Java overlays, and complete screen parity remain open.
Installed direct and ViaProxy controls each open Furnace Help and return with Back and Escape while carrying nine items.
Each complete journal contains only the two accepted pickup and return transfers, followed by ordinary container closes.
Fresh openings, authoritative responses, and server inventory agree on all nine items.
These controls use an authored furnace fixture with normal admission guards and software rendering.
Other input modes, native multiplayer Help traffic, and complete visual parity remain unverified.
Live direct and ViaProxy checks retain the real Survival recipe layout and its inactive row after reopening.
Both routes open translated Help and return on Escape.
Server responses confirm placement of the retained eight-log cursor stack.
Inactive recipe icons carry separate lighting and opacity through extraction, cached atlas entries, and oversized item submission.
Regressions retain a real unavailable recipe and restore both properties after nested extraction failures.
Closed storage-item previews and bars read the core's native weight snapshot.
Physical bundle preview tables decode into owned Minecraft stacks and explicit tooltip views without using Java bundle compaction. Identity and counts must match the retained source snapshot. Storage, cooking, player, and workbench presentations accept these views. The decoder requires the core preview API. The renderer consumes physical items and count labels from the same owned snapshot that built the frame. Reference checks reject stale identities, holes, and fractional indices. A screen extraction regression preserves full counts, native opacity/filter state, authored transforms, and the Java menu. Full action lifetime, physical-slot input, and installed comparisons remain unfinished.
The default-screen regression retains an empty bundle alongside an inactive recipe.
Installed direct and ViaProxy controls retain a server-issued empty bundle in Survival after reopening.
Unknown snapshots restore ordinary controls. Player and workbench screens accept complete carried-bundle snapshots and desktop hover views. Touch selection and the full controller lifetime remain unfinished.
Unsupported visible glyphs, `button.shape_drawing` recipe actions, and held-selection commands also restore ordinary controls.
Desktop drop keys follow the [native cursor behavior](../../../docs/native-player-inventory.md#actions-and-presentation) through the authored input router and keep the screen.
Screen regressions cover Survival and Creative slots, cursor ownership, held keys, modifier release order, outside controls, and pending commands.
Installed direct and ViaProxy controls each complete 14 server-accepted requests across Survival and Creative.
Six drops per route remove one carried item each. Four further drops use real slots with an empty cursor.
An 800-millisecond hold acts once. Outside controls and Ctrl+Q with a held stack add no requests.
Both routes retain the same screen, menu, and presentation, then reopen with the exact remaining items.
These checks include one immediate move from a real slot to a recipe before Q.
Full native pointer/key timing, workbench controls, other devices, and complete pixels remain unverified.
The installed drop artifact predates the pointer-coordinate change. A combined full-stack build also passes after reconciliation.
These builds include the private death-screen consumer. They do not establish a released artifact or complete death-screen parity.
Rejected presentations remain retired until the next opening, so subsequent updates do not repeat the failed installation.
Fixed recipe grids expand visible cells and retained keyboard neighbors over the complete catalog.
Local window changes preserve the menu opening and authoritative revision.
Screen regressions use 2,000 retained items in the recipe-book and Creative layouts.
They cover distant scrolling, resize, original action IDs, and keyboard navigation.
The Creative catalog-only toolbar binds the authored `container_auto_destroy` command to a separate optional backend capability.
Shift-left and Shift-right preserve the cursor and discard the selected stack.
Inventory-only and recipe-book layouts dispatch the authored quick-move command directly, including with an occupied cursor.
This avoids Java pointer handling that swaps the held and selected stacks.
Screen regressions cover both layouts and preserve the cursor.
Backends without that capability restore ordinary controls before item changes or requests.
The reference is official Bedrock 1.26.60.5, protocol 2225, and its matching inventory UI declarations.
Installed direct and ViaProxy controls each complete seven server-accepted requests for hotbar destruction and inventory-only transfer.
Both routes preserve the occupied cursor, leave empty slots unchanged, and retain the resulting inventory after reopening without Creative replacement requests.
The installed add-ons and proxy match the rebuilt artifact hashes.
Passive hover notifications do not trigger the fallback for unsupported recipe actions.
Installed direct and ViaProxy controls retain all 1,980 catalog entries from a local protocol-2225 server.
Physical category and layout changes preserve their native indices through exported programs.
Physical Shift-left and Shift-right catalog controls bind the authored menu_auto_place source to the bulk action.
Mouse release retains the pressed source even after Shift is released.
Screen regressions repeat both chords and then perform an ordinary click through the exported player program.
Both routes search for rails and place a server-accepted stack of 64 in the hotbar.
ViaProxy retains both stacks after reopening.
Installed direct and ViaProxy controls cover initial bundle insertion, extraction, reinsertion, and retention after reopening through ordinary Java controls.
The [inventory reference](../../../docs/native-player-inventory.md) states the verified input behavior and remaining native comparison limit.

Installed direct and ViaProxy controls each complete 14 server-accepted requests for these catalog actions.
The controls cover one-item quantities, cursor preservation, split bulk placement, partial capacity, and full-inventory no-op.
Reopening preserves both stacks without Creative replacement requests.
Both installed add-ons and the running proxy match the rebuilt artifact hashes.
Bulk Survival recipe actions remain unresolved.
Complete cooking integration, live transfers, and filled-bundle pixels also remain unresolved.

Player snapshot revisions retain the parsed UI while its program bytes are unchanged.
The presentation consumer decodes each accepted snapshot once.
Regression coverage retains search through changed resources and rejects malformed replacement bytes.
Installed E-opened Creative controls complete 24 physical queries on each route with program reuse.
JFR profiles no longer sample repeated program decoding in these controls.
Overall frame-rate gains and the reported modpack regression remain unverified.

Stable frames reuse the draw list, parsed hit regions, and input ancestor geometry.
Changed pointer coordinates, component state, or animated opacity refresh the draw list.
Toggle changes include keyboard tab selection.
Regressions preserve fades, alpha resets, and a toggle change with a stationary pointer.
Relayout, changed painter order, enablement, or a zero-opacity transition rebuilds the affected regions.
Collection windows rescan after layout or keyboard focus changes, and rendering uses the shared draw order directly.
Input, scrolling, focus, and screen regressions cover these boundaries. A hit-region regression checks hidden, disabled, moved, and removed controls.
Cumulative authored layers use separate Java GUI strata to bound overlap-ordering work.
Matched installed scene profiles preserve static recipe, slot-grid, and crafting-background pixels.
The optimized profile no longer samples repeated draw-list traversal.
These profiles do not establish stable FPS or native frame-time parity.
The installed Survival screen retains the translucent backdrop after its entrance animation.
Live direct checks cover pickup, drag distribution, return to the hotbar, and reopening.
Bedrock accepts every observed stack request, and the client and server retain matching item totals.
Authored containers suppress gameplay HUD extraction while they are the current screen.
Official Bedrock 1.26.60.5 keeps the held log and shield visible behind the Survival inventory but hides the gameplay HUD.
Escape starts the authored pop exit and shows the gameplay HUD behind the outgoing scene.
The host consumes input until all participating completion tracks finish.
Repeated close requests retain the clock. Completion cannot close a replacement screen or retired menu.
Tests cover those ownership boundaries and input retirement.
Installed player-inventory controls show the slide and fade before removal and retain every slot after reopening.
Native Bedrock 1.26.60.5 Escape frames provide the visual reference; exact frame timing and complete pixels remain unverified.
Storage resolves its complete host shell with the backdrop, close button, and default exit tracks.
Installed direct and ViaProxy controls cover chest, hopper, brewing, and large-chest screens, including exits and the close button.
Both routes retain 64 logs after accepted pickup and return requests.
The native hurt policy uses the original server cause, local actor lifetime, pending-event consumption, and a shared 100-update gate.
Controls cover excluded fire damage, accepted magic damage, gated events, a false inventory policy, and remote actors.
Native Bedrock 1.26.60.5 runtime controls establish that a false policy still starts the gate.
Programs without the versioned core contract retain ordinary controls when the scene requires this policy.
The separate cooking binding and visible-control checks remain.
Client-predicted damage, the live producer for actor event 81, and exact native frame timing remain unverified.
The historic hurt-and-heal nonclosure with a 5.6-millisecond packet gap remains unexplained.
Shared text conversion corrects the measured one-byte label-shade difference.
Complete screen pixels remain unverified.
Broader modpack timing, the reported menu overlap, and shield presentation still need verification.

The [owning patch](0029-present-authored-native-containers.patch) retains implementation rationale and versioned evidence.

Authored container draws use the [shared physical-pixel scissor path](0029-share-native-ui-scene-rendering.pr.md).
This preserves fractional layout bounds for labels, items, portraits, and nested inputs.
The selected native glyph comparisons cover static form controls. Complete container GPU parity remains open.

Container labels share the renderer's height admission and retain inherited parent scissors.
The [shared renderer notes](0029-share-native-ui-scene-rendering.pr.md) describe the native controls and remaining font limits.

Unavailable recipes retain separate ingredient and output previews for the current opening.
Real items and active drag previews take precedence over empty-slot previews.
Core and client tests cover request rejection, search persistence, reopening, item ownership, pending publication, and count controls before item draws.
Installed direct and ViaProxy controls show four-plank and four-stick outputs over empty real crafting slots without allocating inventory requests.
Search edits and blank-slot focus preserve the previews. Reopening clears them and retains the query.
With one log available, an ordinary recipe click places the real input and shows four output planks.
Bedrock 1.26.60.5 provides the native selection and lifetime reference.
Complete native pixels, fallback variant order, variant cycling, and broader recipe families remain unverified.

Container layout supplies the desktop UI pointer to shared cursor placement and invalidates active placement when the pointer moves. Initial hover after installation uses the same per-axis [shared pointer conversion](0029-share-native-ui-scene-rendering.pr.md) as later input. Input validation rejects enabled unsupported controls and repeats validation when a disabled control becomes enabled.

Tooltip sources retain primary, pending, secondary and hover contexts independently of recipe selection. Desktop hover resolves the retained bundle against actual menu slots and native collection aliases. Regressions cover restoration, carried-item priority, source replacement, touch retention, alias leave events and physical-cell selection. Thirteen original source controls and 22 cell-input controls establish the ported state boundaries. Selected physical children request exclusive detail creations with their supplied native hover text. Popup snapshots retain independent lifetime and ignore late retirement of a replaced creation. Client retirement runs after animation traversal, and input reconciliation discards captures from replaced creations. Regressions cover these boundaries. The full action graph, transfer quantity, native detail visibility, child-description formatting, and installed renderer comparison remain open. Enabled unsupported controls still restore ordinary controls.

Inventory hover events read the evaluated control property bag. A routed slot-event regression distinguishes the event source from render-slot annotations, observes retained updates and rejects missing or wrongly typed fields. Native 1.26.60.5 controls establish the retained bag and typed source getter. These typed sources also feed desktop bundle input; installed input parity remains unverified.

Retained bundle navigation separates row-bound directional input from wrapping previous/next input.
Original Bedrock 1.26.60.5 controls establish the padded cell range, input-mode gates, and the empty selected-stack requirement.
Player and workbench callbacks retain that cell through the optional selected-extraction transport.
Screen and backend regressions cover source ownership, pending input, sparse physical slots, and rejected transfers.
Cooking slot gestures use their own publication-bound bundle channel and retain pending selection across snapshots.
A matching reply either releases the current frame or waits for renewed authority. Buffered search, timeout, capability withdrawal, and late-reply sound ownership share that lifetime.
Screen regressions cover insertion and selected extraction without duplicate Java actions. Backend regressions cover rejection recovery and replacement openings.
Physical input bindings and the remaining default cooking host callbacks remain unfinished.
Pending cooking commands retain physical hover through captured-button release. Regressions preserve the source and selected cell while duplicate item input stays blocked.
Installed direct and ViaProxy controls insert two distinct stacks, select the older bundle entry, extract both stacks, and retain all items after reopening.
Stationary hover and cell selection survive a delayed server reply. An overlapping transfer sends no extra item request.
Each complete journal contains nine successful requests. These controls use an admitted authored furnace fixture with explicit navigation mappings.
They do not establish native physical bindings, complete default-screen support, or native pixels.

Desktop player/workbench bundle inputs use the optional core transport and share the presentation's request sequence, reply handling, timeout, and retirement with search and crafting. Real exported-program tests exercise insertion and default extraction with either cursor or clicked roots, including filled hover views and a bundle moved to the cursor. They check exact payload scope, buffered search, stale replies, desktop cell/hide callbacks, and suppression of duplicate Java actions while a request is pending. A frame-extraction regression covers physical bundle hover.

The optional bundle-result channel plays a sound only for the matching pending bundle command. Duplicate, unrelated, retired, and wrong-kind replies cannot play it or release a different command. Playback uses current accepted Bedrock level-event resources, bank definitions, and captions. Original Bedrock 1.26.60.5 sound helper 144fe5060 and position helper 140ba2af0 select the actor AABB center with float arithmetic; 24 combined insertion-handler controls verify success and failure dispatch. Client regressions cover reply lifetime, resource selection, missing actors, and body-center coordinates. Installed direct and ViaProxy controls each observe seven level-event requests followed by decoded native PCM channel starts with the matching caption keys, including a full-bundle insertion failure. Ordinary pickups, placements, close, and reopen add no bundle sounds. Silent lab audio does not establish audible comparison or exact timing.

Installed direct and ViaProxy controls each complete ten server-accepted requests, including five native bundle commands. Screen audits observe the shared sequence through both insertion/extraction directions and its reset under a new opening after reopening. The screens stay native throughout. Installed add-on hashes match the rebuilt artifact, and the proxy transport classes match the current core.

Source regressions restore bundle hover after temporary source removal and retain independent selection.
Real screen regressions preserve hover while pending commands suppress duplicate actions.
Original Bedrock 1.26.60.5 source getter and update blocks cover 72 availability updates across desktop, touch, and gamepad profiles.
Storage admission and intervening controller work remain supplied probe boundaries.
Installed direct and ViaProxy fault controls each cover seven item requests, including one BDS rejection of an ordinary filled-bundle pickup.
The pointer stays still through predicted disappearance and tooltip restoration. The accepted retry, return, and extraction retain all five ingots and the bundle.
These controls do not establish the official client's complete rejection path.
Installed native-command rejection controls and their remaining limits are recorded in the [core inventory notes](../../viabedrock/deferred/0003-translate-server-authoritative-bedrock-requests.pr.md).
Native wire grouping, larger rejected bundle plans, touch and retained detail gestures, full controller composition, and complete pixels remain unfinished.

Cooking search uses the optional core query transport and shares ordering, acknowledgments, timeouts, and retirement with recipe commands.
The client queues the latest raw edit and preserves newer typing when an earlier reply arrives.
Closing retains an unsent edit or explicit clear for the next opening. Disconnect clears this client state.
A reply without the replacement snapshot still reaches the response timeout.
Bound cooking editors use the shared search widget and retain ordinary controls when a required binding or capability is unavailable.
Official Bedrock 1.26.60.5 desktop controls retain furnace search after reopening and keep smoker text independent.
Screen regressions use the exported 1.26.60.5 editor and its embedded X.
They cover active clearing during a pending query, continued typing, the first Escape, whitespace, and inactive retained text after resize.
Geometry regressions reject an unowned clear control and preserve front-to-back slot protection.
The matching native desktop controls establish these editor input lifetimes.
Current native registration tables and callback controls also establish layout increment/decrement transitions.
Screen regressions cover screen, panel, global-panel, and pointer-button dispatch, retained carried items, held input, matching snapshots, and forced-layout suppression.
Shared component events route cursor-drop input to the ordinary inventory request owner.
Screen regressions cover player pointer and keyboard delivery, held presses, empty and pending cursors, Help transitions, and admitted cooking pointer hosts.
Official 1.26.60.5 player and furnace desktop controls retain nine carried ingots through a blank-panel click, drop one on secondary input, and drop the remainder on primary input. An 800-millisecond secondary hold acts once.
Installed direct and ViaProxy [player controls](../../../docs/native-player-inventory.md#actions-and-presentation) each receive three successful matched replies and retain the screen, menu, presentation, and total item count. Empty-cursor input adds no requests.
Official 1.26.60.5 furnace controls also establish temporary search-hover text admission and inventory-key exclusion over that field.
Leaving before typing permits inventory-key closure. A first character starts editing that survives pointer departure and the first Escape.
Screen regressions distinguish temporary hover from editing and preserve cursor items through authored exit actions.
Installed direct and ViaProxy player controls admit physical text on hover, retain editing after Escape, and preserve the query after reopening.
Both routes close through E outside inactive search and Escape over inactive search. Inventory and cursor counts stay unchanged without item requests.
Cooking selected-source snapshots remain separate from ordinary recipe hover. Original 1.26.60.5 getter controls distinguish the primary and hover contexts.
The shared source controller also handles native bundle transitions that clear the primary context.
Screen regressions preserve ordinary recipe selection and retain local reset through unchanged model refreshes.
Layout changes clear the shared hover context and prevent a stale bundle tooltip from returning after source restoration.
Installed direct and ViaProxy controls use an admitted authored furnace scene with the normal admission guards.
Hover leaves the recipe unselected. A held recipe action retains selection after pointer exit, and release clears it.
Both routes retain the same screen, menu, and presentation. Server replies confirm all nine cobblestone in the furnace input.
Official 1.26.60.5 desktop holds establish a partial pickup from both hotbar and furnace ingredient slots.
Live controller observations retain a separate source and timer for quantity selection. Pointer exit can complete the pickup before physical release.
Original 1.26.60.5 View countdown and event-construction controls establish the [hold timing contract](../../../docs/native-cooking-actions.md#recipe-input).
The produced event passes unchanged through the original controller dispatcher and secondary-transition predicate in separate composition controls.
Item lookup and final state entry remain declared boundaries in those controls.
Core now retains the return and partial-pickup transaction phases across delayed responses and renewed stack IDs.
Desktop primary pickup now retains its source through the shared View countdown and a separate quantity timer.
Official 1.26.60.5 desktop Return controls enter quantity state 15 and end it on key release. Space over the same ordinary slot leaves items unchanged.
Return uses authored slot confirmation and a separate held-input callback. It shares the existing quantity request owner and retains the routed slot as its origin.
Original 1.26.60.5 producer and dispatcher controls establish Return's held-edge filters in all three input modes.
The production handler matches all 54 combinations of mode, phase, previous phase, and initial held state.
A release without the same component's prior press cannot clear Return or finish its quantity owner.
Real-menu regressions preserve the source and timer after unmatched releases, then complete once on the matching release.
Installed controls reveal a second Return mapping during a physical hold. Its first release has no prior press in that component.
The previous build completes at two items while Return remains down. Current direct and ViaProxy controls retain selection until the real release.
Each fixed route completes four accepted transfers and retains all nine items after reopening, with the same screen and menu throughout the gesture.
Screen regressions cover pickup, key repeats, completion while the hold owns input, duplicate release, and unchanged menu previews. Unsupported keyboard quick-move still restores ordinary controls.
Installed direct and ViaProxy Return controls each complete ten accepted requests across short pickup, partial and full holds, return, and reopening.
Both routes retain six items after the partial release and nine after the full release. Held input uses the loaded client's Return key constant.
These controls do not establish equal native timing, complete default-screen support, or native pixels.
Quantity previews leave the real menu unchanged. Delayed pickup snapshots cannot admit an overlapping query or recipe action.
Official 1.26.60.5 physical controls retain quantity selection while both buttons are held and complete it after secondary release before primary release.
Screen regressions cover that delivered release, an unmapped button, and duplicate completion.
Installed direct and ViaProxy controls retain selection during the second press and complete it before primary release.
Each route receives four accepted transfer replies and retains nine items after reopening. Exact native frame timing remains unverified.
Regressions cover cached completion, delayed frames, correction, capability loss, transport retirement, and one physical screen pickup.
Installed direct and ViaProxy controls verify short, partial, and full hotbar holds, partial ingredient pickup, and completion before physical release on pointer exit.
Each journal contains 18 successful transfers. Both routes retain all nine items with the same screen, menu, and presentation.
Official 1.26.60.5 desktop registries agree across furnace, smoker, and blast-furnace controllers.
Six shared controller targets have no registered callback in those cooking scenes.
Their consuming mappings now retain authored presentation without invoking crafting-screen handlers or Java item input.
Original producer and dispatcher controls cover 35 input cases. Screen regressions preserve carried items and pointer and keyboard input ownership.
Installed direct and ViaProxy controls retain the same screen, menu, and cursor through all six actions.
Each route sends only the pickup and return requests and retains nine items after reopening.
Unknown, registered but unfinished, and nonconsuming custom mappings still restore ordinary controls.
Default cooking host admission, other input modes, exact frame scheduling, and native graphical parity remain unfinished.

Negotiated desktop drags submit the pressed cell and later destinations before release, including visits after the real cursor empties.
Client regressions cover both buttons, close, and a late release without another action.
A real-menu regression prevents Java from distributing the same items again on secondary release.
Installed direct and ViaProxy controls match the official 1.26.60.5 integrated-world distribution: nine in the first cell, four in each of two cells, then three in each of three cells.
Escape while held retains that distribution after reopening, including a control that holds incoming replies for about three seconds.
Each complete journal contains 18 successful requests across ordinary drag, delayed close, and secondary drag.
Secondary release retains one item per destination and six carried items.
The [cooking reference](../../../docs/native-cooking-actions.md#recipe-input) describes ownership and the remaining limits.
These controls use an admitted furnace fixture and do not establish default cooking-screen support.
An unhandled release over an empty recipe panel retains drag ownership, including subsequent pointer entry without a held button.
A delivered slot release or qualifying reset callback ends the drag. Closing and fallback still retire it.
The delivered slot release can come from another button. Pressing that button preserves the retained allocation.
The real-menu regression covers both release buttons, duplicate release, unheld entry, and close.
Installed direct and ViaProxy controls match the selected native allocation through delayed replies and preserve every item after reopening.
Original 1.26.60.5 producer and dispatcher controls establish the raw reset phases. The client decoder matches all 216 recorded controls.
Every pressed phase updates empty-source context. A released phase completes an operation only when its previous phase differs from pressed.
Component consumption continues while inventory replies wait. A child can consume the press before a parent receives the release.
Completion uses the existing recipe, quantity, and drag owners without retiring the opening or duplicating a later release.
Screen regressions cover delayed recipe replies, source refresh, retained drag, and declined preference toggles. Held-quantity regressions preserve the original source through completion.
Installed direct and ViaProxy reset controls each complete seven accepted transfers with one drag start/end pair.
A release after the reset component receives its own press preserves the allocation. A later qualifying release ends it once.
Server inventory and reopened menus retain three stacks of three, without dropped items or a transfer after completion.
Broader source selection, other input modes, default-host bindings, and exact native frame timing remain unfinished.
Native multiplayer request grouping and delayed or rejected native drag behavior remain unverified.
