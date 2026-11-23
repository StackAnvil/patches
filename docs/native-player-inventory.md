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

Request the Bedrock inventory at the actual GUI admission attempt.
Constructing a screen alone does not open a server container.
Each requested opening receives a monotonic connection token.
An authored presentation swap retains that token. An ordinary reopen receives a new one.

The Bedrock open acknowledgment has no client token.
Core serializes native openings and retains retired requests until their acknowledgments arrive.
Native ignores the inventory key while a previous player or workbench close awaits acknowledgment.
Core rejects a player opening received during that wait by its own opening token.
It requires fresh input after acknowledgment instead of queuing the rejected opening.
Client-initiated close acknowledgments retire native state without forwarding another Java screen close.
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

A negotiated player opening keeps the world visible until its native container acknowledgment arrives.
Movement continues during that wait.
Repeated E sends another open interaction under the same opening token.
Escape or chat cancels the pending intent.
A late acknowledgment cannot replace that other screen or reopen the inventory after exit.
This admission applies with Bedrock inventory screens enabled or disabled.
Older translators retain their existing screen behavior.

A requested opening also owns a read-only recipe context while the native acknowledgment is pending.
It reads the real cached crafting grid, hotbar, inventory, and cursor.
The acknowledgment retains this model and its captured search policy.
Item requests still require the acknowledged container and its generation.
A workbench model belongs to its exact container generation.
An unpositioned player inventory uses the fallback crafting context.

`NativePlayerRecipeState` advances the retained collections and refreshes them when sources, recipes, unlocks, rules, or preferences change.
Catalog replacement refreshes source collections without reconstructing the backend or replacing its query and selected output.
The native player profile starts with Search, Crafting, filtering off, and automatic layouts.
The controller reads this profile before an inventory-options packet arrives.
Server packets replace all five fields, including explicit zero tabs.
Java filter changes retain the native tabs and automatic layouts.

The same negotiated messages serve direct and ViaProxy connections.
Late capability announcements must not duplicate a legacy opening.
Java creative inventory shares the native opening lifetime while retaining its item picker.

## Catalogs and recipes

Keep the complete creative catalog, player search source, and category collections separate.
Search admission uses the connection's native item definitions and category membership.
Preserve runtime identity, variants, duplicates, and order.
Do not substitute Java fallback items or an empty catalog.

In Bedrock 1.26.60.5, primary click on a Creative catalog item takes a full stack into an empty cursor or discards the entire held stack.
Secondary click takes one item into an empty cursor or discards one held item.
Shift-left-click and Shift-right-click place a full stack in inventory without changing the cursor.
Bulk placement merges existing stacks before filling empty hotbar and main-inventory slots, then stops at the available capacity.
A full inventory accepts the input without an inventory request.
Unchanged Java Creative slot echoes preserve the existing native stack and network ID.
Tab and layout controls use the target inventory indices.

The Creative catalog-only toolbar binds Shift-left-click and Shift-right-click to full-stack destruction.
The action preserves the cursor, requires a current acknowledged opening, and leaves empty slots unchanged.
Inventory-only and recipe-book layouts use the authored quick-move command to preserve an occupied cursor during stack transfer.
Backends without the separate destruction capability restore ordinary controls before item changes or requests.

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

Storage bars read a native weight snapshot independently of Java bundle contents.
Unknown storage snapshots restore ordinary controls.
Player and workbench screens route desktop bundle insertion and default extraction through the native input transport, with the bundle in either the cursor or the clicked slot.
Retained bundle navigation uses padded display cells. Directional callbacks stop at row edges, while previous and next callbacks wrap over item cells.
A separate optional channel carries selected-cell extraction against the published source snapshot. Core resolves the physical slot and rejects padding, overflow labels, and stale contents.
Bundle hover survives temporary source removal and returns when the source becomes available, without another pointer event.
Operation sounds follow local prediction through current native resources and captions. Each attempt plays once.
Stale commands, locally unsuccessful extraction, and a later server error play nothing.
BDS rejects a bundle command with status 49 and no container data. Batch reconciliation restores the predicted state without disconnecting.
Cooking uses the same transfer owner with its [complete source contract](native-cooking-actions.md).

Retain the latest local search edit within its connection before waiting for a command reply.
Closing a screen retires its commands but preserves unsent text and explicit clearing.
A replacement presentation submits that text with its own opening, generation, revision, and request sequence.
Disconnect clears the client's retained edit.
Each opening starts with a fresh recipe model and no selected output.
Creative search survives Overworld and Nether transitions and clears after a disconnect.
In Bedrock 1.26.60.5, Escape first removes the search highlight. A second Escape closes the inventory.
Typing after Escape or a blank-area click resumes editing. Selecting another recipe or inventory slot stops search input.
Returning to search restores text input without closing the inventory.
Retain the editor and its selection through screen rebuilds, viewport changes, and GUI-scale changes.
An inactive editor must stay inactive after opening or resizing.
An authored search hover temporarily admits text without selecting the editor.
A first character starts editing. Leaving before typing retires the temporary text input.
The inventory key enters text while search is hovered and closes the screen outside an inactive editor.
Escape closes an inactive editor without starting a text session.

Pointer cursor drops follow the authored host bindings.
Primary input drops the carried stack. Secondary input drops one carried item per press.
Holding secondary input does not repeat the drop. Blank recipe panels retain the cursor.
Player pointer and keyboard drops share the ordinary inventory request owner.
Empty cursors, pending native commands, and the transition into Help do not start a cursor-drop request.
Admitted cooking pointer hosts use this same path. Partial container scopes retain ordinary controls when they require cursor drops.

Bedrock 1.26.60.5 desktop drop keys follow the authored bindings for recipe, Creative catalog, and real inventory slots.
With a held stack, Q and Shift+Q drop one carried item. Ctrl+Q leaves the cursor and pointed slot unchanged.
With an empty cursor, Q drops one item from a real slot and Ctrl+Q drops its whole stack.
Empty-cursor drops over recipe or catalog rows do nothing.
Plain panels and areas outside controls ignore these keys.

A held drop key acts once until release.
Search editing and pending native commands suppress these actions.

Native 1.26.60.5 classic-screen controls distinguish recipe selection from crafting.
A normal recipe click fills the grid. Taking its output sends a separate craft request.
Selecting an unavailable recipe shows ingredient and output previews without moving items or sending an inventory request.
The previews cover empty crafting slots. Real items and active drag previews take precedence.
Search edits preserve the previews. Closing and reopening clears them.
Candidate selection uses current ingredient allocations and the native priority order.
Tagged ingredient previews prefer a wood family from the hotbar and inventory, with oak as the default.
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
Reopening retains completed output and the returned cursor stack.

Direct output-slot clicks craft once onto the cursor, including right-click.
Manual crafting selects the primary output before returned containers and places returns in inventory, with overflow dropped from created output.
Manual Shift-click leaves the cursor unchanged and uses combined inventory capacity.
It sends the remaining stack-sized craft requests in one packet, with each request referring to earlier predicted stack identities.
The native 20-millisecond click control crafts 128 planks through two requests of 64.

Admit an authored player screen only when its required collections and controls are available.
The default player and workbench graphs resolve real slots, recipe rows, and local Help views.
Survival Help opens Your First Craft. Creative Help opens the Encyclopedia at Creative Mode.
Back and Escape from Help retain the opening, search, recipe sources, and carried stack.
Inactive item icons use separate lighting and opacity. The default disabled light multiplier is 0.25.
Text channels use native byte truncation and clamping, including opacity.
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

- Complete E-key and workbench screen pixels, inactive item materials, and the exact fallback ingredient variant order are unverified.
- Recipe families beyond the captured plank, cake, and honey controls, and recipes with more than two outputs, are unverified.
- Unsupported visible Help glyphs, recipe auxiliary actions, and held-selection commands restore ordinary controls.
- Selected-cell bundle extraction has no physical input binding and no installed control.
- Native bundle wire grouping, larger rejected bundle plans, touch and retained detail gestures, audible output, exact timing, and complete controller and rendering parity are unfinished. The official client's complete bundle rejection path is unverified.
- Search retention across server transfers and other world changes, and complete search input parity, are unverified.
- Native model constructor timing, frame-level population, model-position initialization, and arbitrary custom component admission are unverified.
- Client-predicted damage, the live producer for actor event 81, and exact hurt-policy frame timing are unverified. A historic hurt-and-heal case with a 5.6-millisecond packet gap that did not close the screen is unexplained.
- Native registry probes and local model tests do not establish complete live inventory parity.
