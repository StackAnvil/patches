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

## Actions and presentation

Core owns requests, network stack IDs, transfer quantities, prediction, and server response reconciliation.
The add-on owns input delivery and presentation over authoritative slots and cursor state.
Keep player destinations, offhand permissions, item locks, and creative actions explicit.
A fallback acknowledgment must not consume a newer menu's request.

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

Complete installed player/controller publication and native recipe admission remain unfinished.
An unpositioned player inventory uses the fallback crafting context.
Native model-position initialization and arbitrary custom component admission remain unverified.
The original inventory-background, rollback, food-use, and locator-bar reports remain unresolved.
Native registry probes and local model tests do not establish complete live inventory parity.
