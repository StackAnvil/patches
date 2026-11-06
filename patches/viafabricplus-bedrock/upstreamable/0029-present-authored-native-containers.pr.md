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
Complete default cooking host input, screen admission, and installed direct/proxy cooking comparisons remain unfinished.
