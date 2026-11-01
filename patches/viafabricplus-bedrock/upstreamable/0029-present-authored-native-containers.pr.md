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
Creative hotbar destruction restores ordinary controls before item changes or requests.
Passive hover notifications do not trigger the fallback for unsupported recipe actions.
Full Creative catalog expansion, initial bundle insertion, bulk recipe actions, and Creative cursor replacement remain unresolved.
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
Generic storage resolves selected content without its complete host shell, so its default exit animations remain absent.
Closing on hurt still needs complete native pending-state controls. The cooking host-policy guard remains.
Broader modpack timing, the reported menu overlap, and shield presentation still need verification.

The [owning patch](0029-present-authored-native-containers.patch) retains implementation rationale and versioned evidence.
