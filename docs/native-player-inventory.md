# Player inventory implementation

Use this reference when changing the E-key inventory, creative catalogs, or authored player-screen integration.
The [compatibility status](bedrock-coverage.md) lists unresolved reports.

## Screen lifetime

Open the Bedrock inventory only after Java installs the actual screen.
Constructing a screen does not open a server container.
Each installed opening receives a monotonic connection token.
An authored presentation swap retains that token. An ordinary reopen receives a new one.

The Bedrock open acknowledgment has no client token.
Core serializes native openings and retains retired requests until their acknowledgments arrive.
A new opening waits for the previous close acknowledgment.
Bind clicks, data, and closes to the connection, menu object, menu ID, and opening token.
A stale reply must not operate on a replacement screen.
Keep global player-inventory reconciliation independent of a retired temporary menu.

The installed opening also owns a read-only recipe context while the native acknowledgment is pending.
It reads the real cached crafting grid, hotbar, inventory, and cursor.
The acknowledgment retains this model and its captured search policy.
Item requests still require the acknowledged container and its generation.
A workbench model belongs to its exact container generation.

`NativePlayerRecipeState` advances the retained collections and refreshes them when sources, recipes, unlocks, rules, or preferences change.
Catalog replacement refreshes source collections without reconstructing the backend or replacing its query and selected output.
Missing profile preferences remain absent.
The backend starts with the observed native filtering value, then accepts actual profile settings.
No selected tab is inferred from Java recipe-book defaults.

The same negotiated messages serve direct and ViaProxy connections.
Late capability announcements must not duplicate a legacy opening.
Java creative inventory shares the native opening lifetime while retaining its item picker.

## Catalogs and recipes

Keep the complete creative catalog, player search source, and category collections separate.
Search admission uses the connection's native item definitions and category membership.
Preserve runtime identity, variants, duplicates, and order.
Do not substitute Java fallback items or an empty catalog.

Retain recipes that require a crafting table in the player catalog.
Evaluate search, unlocks, ingredient availability, and output availability in their owning stages.
Resolve descriptors against the connection registry and original native item identity.
Do not infer recipe matching from a display name or Java carrier state.

Item construction, component updates, category assignment, and registry replacement have distinct ownership.
Read the current definition after ordered updates.
Preserve raw search text separately from normalized matching text.
A change in raw text can retire selection even when normalized text is unchanged.

`PlayerRecipeModel.outputCount` reads the displayed recipe quantity separately from collection availability.
Survival counts combine candidate recipes and share their source budget. Creative counts read the current game mode and source output amount.
The displayed total can exceed the quantity that one selected candidate can craft.

Fixed recipe grids use cell windows over the complete retained collection.
The source keeps its original order, item identities, and total scroll extent.
Each view expands the visible rows and a one-row buffer on each side.
An offscreen keyboard selection also retains its neighboring rows.
Resize and scroll changes preserve the original collection indices and action targets.
Window changes do not advance the authoritative snapshot revision.

Only horizontal grids with fixed cell geometry support this contract.
Row-dependent dimensions and redirected root indices restore ordinary controls.
The node budget remains unchanged.
These windows preserve authored geometry but do not establish identical native pooling or frame timing.

## Actions and presentation

Core owns requests, network stack IDs, transfer quantities, prediction, and server response reconciliation.
The add-on owns input delivery and presentation over authoritative slots and cursor state.
Keep player destinations, offhand permissions, item locks, and creative actions explicit.
A fallback acknowledgment must not consume a newer menu's request.

Native 1.26.60.5 classic-screen controls distinguish recipe selection from crafting.
A normal recipe click fills the grid. Taking its output sends a separate craft request.
A workbench recipe Shift-click uses `CraftRecipeAuto` with explicit ingredient descriptors, followed by results, consumption, and placement actions.
The request codec supports this format. Installed authored recipe actions remain unfinished.

Admit an authored player screen only when its required collections and controls are available.
The shared UI renderer supports the local player portrait and separate body/head rotations.
Portrait rendering alone does not establish a complete native inventory.
Keep controller callbacks, recipe availability, and installed-model publication separate from catalog construction.

## Validation

Run the affected core inventory/request tests and add-on screen lifecycle/action tests.
For native comparisons, record the exact build, game mode, input method, screen path, and connection route.
Exercise opening, closing, reopening, stale acknowledgments, item movement, and rejected requests.
Use the [capture lab](capture-lab.md) for E-key controls and physical input.
Use the [source guide](bedrock-development-sources.md) for versioned native references.

## Remaining limits

Core publishes the retained player/workbench rows and full item previews in compressed snapshots.
Commands bind to the opening, container generation, snapshot revision, and request sequence.
The add-on buffers search edits while a command awaits its reply.

The default player and workbench graphs resolve real slots, recipe rows, and local Help views.
Survival Help opens Your First Craft. Creative Help opens the Encyclopedia at Creative Mode.
Screen tests retain the opening, search, recipe sources, and carried stack across Back and Escape.
Installed direct and ViaProxy checks retain the Survival recipe layout, including unavailable rows, after reopening.
Both routes return from Help with a carried stack and confirm its placement through server responses.
Inactive item icons use separate lighting and opacity. The default disabled light multiplier is 0.25.
Typed overrides and RGB conversion match selected native instruction controls. Complete material and pixel parity remain unverified.
Storage bars read a native weight snapshot independently of Java bundle contents.
Installed direct and ViaProxy controls retain a server-issued empty bundle in the Survival menu after reopening.
Filled-bundle bars still need installed native comparison.
Unknown storage snapshots restore ordinary controls.
Hovering or carrying storage items also restores ordinary controls until native tooltips and selection are complete.
Unsupported visible Help glyphs, recipe auxiliary actions, and held-selection commands also restore ordinary controls.
Creative hotbar destruction restores ordinary controls before item changes or requests.
Large Creative catalogs exceed the current scene work budget. Viewport expansion remains unfinished.
Initial bundle insertion, bulk recipe actions, Creative cursor replacement, and complete installed native parity remain unfinished.
Native constructor timing relative to the open acknowledgment and frame-level population timing remain unverified.
An unpositioned player inventory uses the fallback crafting context.
Native model-position initialization and arbitrary custom component admission remain unverified.
The original inventory-background, rollback, food-use, and locator-bar reports remain unresolved.
Native registry probes and local model tests do not establish complete live inventory parity.
