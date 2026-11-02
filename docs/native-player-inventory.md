# Player inventory implementation

Use this reference when changing the E-key inventory, creative catalogs, or authored player-screen integration.
The [compatibility status](bedrock-coverage.md) lists unresolved reports.

## Use Java inventory screens

In the ViaFabricPlus Bedrock settings, turn off **Bedrock inventory screens**.
Then reopen the inventory or container.
This setting covers player inventory, crafting, cooking, and storage screens on direct and ViaProxy connections.
It leaves server forms, HUD rendering, and inventory protocol handling unchanged.

Bedrock inventory screens are enabled by default.
Server resource packs can depend on their layouts and controls.
Java screens do not reproduce those custom layouts.

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

Escape starts the authored pop exit before the screen closes.
The gameplay HUD appears behind the outgoing scene.
The host consumes input and waits for all participating `screen.exit_end` tracks.
A repeated close request does not restart the exit.
Completion can close only the same screen and menu.
A scene without a completion path closes immediately.

Storage scenes retain the complete authored host, including the backdrop, close button, and exit tracks.
Server-delivered hurt events retain the original damage cause and local actor lifetime.
The shared player state applies the native cause filter and pending-event check before the screen policy.
At a zero counter, a pending event starts the 100-update gate even when the current screen stays open.
Events during that gate are consumed rather than deferred.
Health changes alone do not trigger this policy.

Programs advertise this behavior through the versioned core hurt contract.
Without that contract, screens that require the hurt policy retain ordinary controls.
Separate admission checks still exclude unfinished cooking bindings.

The installed opening also owns a read-only recipe context while the native acknowledgment is pending.
It reads the real cached crafting grid, hotbar, inventory, and cursor.
The acknowledgment retains this model and its captured search policy.
Item requests still require the acknowledged container and its generation.
A workbench model belongs to its exact container generation.

`NativePlayerRecipeState` advances the retained collections and refreshes them when sources, recipes, unlocks, rules, or preferences change.
Catalog replacement refreshes source collections without reconstructing the backend or replacing its query and selected output.
The native player profile starts with Search, Crafting, filtering off, and automatic layouts.
The controller reads this profile before an inventory-options packet arrives.
Server packets replace all five fields, including explicit zero tabs.
Java filter changes retain the native tabs and automatic layouts.
Fresh direct and ViaProxy sessions retain this state across first opening and reopening without an inventory-options packet.

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

Retain the latest local search edit within its connection before waiting for a command reply.
Closing a screen retires its commands but preserves unsent text and explicit clearing.
A replacement presentation submits that text with its own opening, generation, revision, and request sequence.
Disconnect clears the client's retained edit.
In Bedrock 1.26.60.5, Escape first removes search focus. The next Escape closes the inventory.

Native 1.26.60.5 classic-screen controls distinguish recipe selection from crafting.
A normal recipe click fills the grid. Taking its output sends a separate craft request.
A workbench recipe Shift-click uses `CraftRecipeAuto` with explicit ingredient descriptors, followed by results, consumption, and placement actions.
Core plans this request for shaped and shapeless recipes from their server-supplied results.
The planner uses the first eligible ingredient allocation.
Ordinary named ingredients retain their resolved recipe metadata, including wildcard auxiliary values.
Tag and Molang ingredients use the selected source descriptor.
Requests use the request ID for later references to a changed slot.
Rejected requests restore the crafting grid, inventory, and cursor.

Native 1.26.60.5 plank controls convert 16 of 32 logs into 64 planks per Shift-click.
Output merges existing stacks and can use a slot freed by consumption.
An unrelated held apple stays unchanged while output fits inventory.
When inventory is full, an empty cursor receives the output.
Held logs increase displayed availability, but bulk crafting leaves them unchanged.
With full inventory, a full compatible cursor or an incompatible held stack prevents the craft request.
A partially filled compatible cursor instead drops its held stack and receives the full crafted stack.
Captured requests cover cursors with 60 and 63 planks; both produce 64 new planks.
With one free inventory item-space, native crafting places one plank, drops any held stack, and takes the remaining 63.
This behavior also applies to an incompatible cursor or a full compatible cursor.
The initial capacity check precedes consumption.
A full inventory and incompatible cursor prevent crafting even when consumption can free a source slot.
An empty cursor admits that same craft. Output can then use the freed source slot.
Native wooden-sword bulk crafting produces one sword despite ingredients for 32.
The primary output stack limit caps the craft count. Returned containers do not reduce it.
Recipe data includes returned buckets and bottles, so core does not need a separate remainder mapping.
For two-output catalog recipes, native selects the secondary output before the primary output with `Create` actions.
Each created stack chunk starts another merge pass before using empty inventory slots.
Six cakes return 18 buckets as stacks of 16 and 2.
When inventory is full, returned bottles drop directly from created-output slot 50.
The primary honey blocks still use the cursor fallback.
Complete request fixtures preserve split placement, repeated source references, and cursor replacement.
The matching server accepts these native requests.
Planner tests cover these request and prediction boundaries, including rejection rollback.
Installed direct and ViaProxy controls each complete 11 server-accepted requests.
Both routes match the captured split-placement, cursor-replacement, and freed-slot requests after stack-ID normalization.
Additional controls consume the player crafting grid and produce one wooden sword with repeated references to its plank source.
Reopening retains completed output and the returned cursor stack.
The incompatible-cursor control sends no craft request until the cursor is empty.
Separate installed direct and ViaProxy controls verify bucket chunks, returned bottles using a freed source slot, and bottle drops with a full inventory.
The three craft requests per route match the native cake and honey captures after stack-ID normalization.
Authoritative responses confirm inventory and cursor quantities. Reopening retains completed output.
Rejected requests remain unit-tested. These live controls do not induce server rejection.

Direct output-slot clicks craft once onto the cursor, including right-click.
Manual crafting selects the primary output before returned containers and places returns in inventory, with overflow dropped from created output.
Manual Shift-click leaves the cursor unchanged and uses combined inventory capacity.
It sends the remaining stack-sized craft requests in one packet, with each request referring to earlier predicted stack identities.
The native 20-millisecond click control crafts 128 planks through two requests of 64.
State regressions cover both grids, returned containers, capacity across partial stacks, linked requests, and partial rejection.
Installed direct and ViaProxy controls each match nine native craft requests and their authoritative response quantities across eight player/workbench cases.
The controls cover right-click, linked Shift-click requests, returned containers, full inventory, partial bottle stacks, and retained output after reopening.

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
Returning to search after a recipe click restores text input without closing the inventory.
Search text survives player and workbench reopenings within a connection, including an explicit clear.
Each opening starts with a fresh model and no selected output.
Installed direct and ViaProxy controls cover retained text and matching rows, replacement queries, explicit clearing, and a server-accepted player craft.

The default player and workbench graphs resolve real slots, recipe rows, and local Help views.
Survival Help opens Your First Craft. Creative Help opens the Encyclopedia at Creative Mode.
Screen tests retain the opening, search, recipe sources, and carried stack across Back and Escape.
Installed direct and ViaProxy checks retain the Survival recipe layout, including unavailable rows, after reopening.
Both routes return from Help with a carried stack and confirm its placement through server responses.
Inactive item icons use separate lighting and opacity. The default disabled light multiplier is 0.25.
Typed overrides and RGB conversion match selected native instruction controls. Complete material and pixel parity remain unverified.
Storage bars read a native weight snapshot independently of Java bundle contents.
Installed direct and ViaProxy controls insert eight logs into a server-issued empty bundle, extract them, and insert them again.
Both routes retain the filled bundle after reopening, with server responses that accept each request.
These checks use ordinary Java 26.3 controls after the storage-tooltip fallback. Left-click inserts items; right-click extracts them.
The first insertion request from the official Bedrock client remains unverified.
Filled-bundle bars still need installed native comparison.
Unknown storage snapshots restore ordinary controls.
Hovering or carrying storage items also restores ordinary controls until native tooltips and selection are complete.
Unsupported visible Help glyphs, recipe auxiliary actions, and held-selection commands also restore ordinary controls.
The Creative catalog-only toolbar binds Shift-left-click and Shift-right-click to full-stack destruction.
The action preserves the cursor, requires a current acknowledged opening, and leaves empty slots unchanged.
Inventory-only and recipe-book layouts use the authored quick-move command to preserve an occupied cursor during stack transfer.
Backends without the separate destruction capability restore ordinary controls before item changes or requests.
Installed direct and ViaProxy controls confirm destruction and occupied-cursor transfer through successful server responses and retained inventory after reopening.
Installed direct and ViaProxy controls retain the complete 1,980-item catalog from a local protocol-2225 server.
Tab and layout controls use the target inventory indices.
Both routes search for rails and place a server-accepted stack of 64 in the hotbar.

Official Bedrock 1.26.60.5 controls establish the Creative catalog pointer actions.
Primary click takes a full stack into an empty cursor or discards the entire held stack.
Secondary click takes one item into an empty cursor or discards one held item.
Shift-left-click and Shift-right-click place a full stack in inventory without changing the cursor.
Bulk placement merges existing stacks before filling empty hotbar and main-inventory slots, then stops at the available capacity.
A full inventory accepts the input without an inventory request.

Unchanged Java Creative slot echoes preserve the existing native stack and network ID.
Installed direct and ViaProxy controls confirm these pointer, capacity, and reopening cases through successful server responses.

Recipe families beyond the captured plank, cake, and honey controls, recipes with more than two outputs, and complete installed native parity remain unfinished.
Native query lifetime across disconnects and world changes remains unverified.
Under a forced search-processing stall, a rapid player-inventory reopen can close again.
The close producer remains unverified.
Native constructor timing relative to the open acknowledgment and frame-level population timing remain unverified.
An unpositioned player inventory uses the fallback crafting context.
Native model-position initialization and arbitrary custom component admission remain unverified.
The original inventory-background, rollback, food-use, and locator-bar reports remain unresolved.
Native registry probes and local model tests do not establish complete live inventory parity.
Installed direct and ViaProxy controls cover complete chest, hopper, brewing, and large-chest hosts, including exits and the close button.
Both routes retain 64 logs after server-accepted pickup and return requests.
Damage controls cover accepted and excluded causes, gated events, a false inventory policy, and remote actors.
Native Bedrock 1.26.60.5 runtime controls establish the pending-state and counter order for server-delivered hurt events.
Client-predicted damage, the live producer for actor event 81, and exact frame timing remain unverified.
The historic hurt-and-heal nonclosure with a 5.6-millisecond packet gap remains unexplained.
Text channels use native byte truncation and clamping, including opacity.
Complete screen pixels remain unverified.
