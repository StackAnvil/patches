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
Search focus clears through the parent GUI owner when clicking elsewhere, hiding the editor, or exiting.
Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 retain search text and explicit clearing after pointer close and reopening.
The first Escape removes editor focus; the next closes the inventory.
Controller regressions cover closing before a search reply, replacement commands, explicit clearing, late replies, and connection replacement.
Rebuilt direct and ViaProxy controls delay search handling by four seconds, close with unsent edits, and retain the latest text and explicit clear after reopening.
Both routes preserve the 32-log stack and the native two-step Escape behavior.
The [core inventory patch](../../viabedrock/deferred/0003-translate-server-authoritative-bedrock-requests.pr.md) owns close-wait admission and close acknowledgments.
Java can briefly display a local inventory before its correlated rejection arrives; client-side admission timing remains unverified.
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
The default-screen regression retains an empty bundle alongside an inactive recipe.
Installed direct and ViaProxy controls retain a server-issued empty bundle in Survival after reopening.
Unknown snapshots restore ordinary controls. Hovering or carrying storage items also restores ordinary controls until native tooltip rendering and selection are complete.
Unsupported visible glyphs, recipe auxiliary actions, and held-selection commands also restore ordinary controls.
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
