# Cartography in ViaBedrock core

## Implementation

Core opens the Java cartography menu and retains Bedrock input slots 12 and 13 and result slot 50.
It selects paper and paper-with-compass creation recipes from the server's advertised ingredients and output.
Dynamic recipes use advertised UUIDs and network IDs for cloning, extension, locking, and locator conversion.
Rename-only requests use recipe ID zero.

Extension uses the next ID in the server's map family.
Unknown scale or lock state prevents extension and locking until map data arrives.
Lock previews request a separate map ID through `MAP_CREATE_LOCKED_COPY`.
Crafted results use the inventory metadata refresh from the authoritative request patch.
Predictions never reuse an input's network ID.

Full inventory updates rebuild the preview after both inputs arrive.
Map and recipe updates also refresh the result.
Closing returns temporary inputs through the shared container lifecycle.
Input transfers, acknowledgments, rejection restoration, and reconciliation use the core inventory implementation.

A single Shift-click crafts one result and places it in inventory.
It does not automatically repeat the remaining ingredients.
The ordinary Java naming control is a text dialog opened by Shift-right-clicking the output slot.
Opening the dialog restores authoritative content to undo Java's predicted Shift-click craft.
Cancellation also restores the preview that Java clears while changing screens.
Each dialog has a unique response ID and closes when its container closes.
The existing rename packet also accepts cartography names for clients with an inline field.

Recipe selection and requests run in core.
A live Java 26.3 comparison through ViaProxy confirms opening, paper placement, and the naming dialog's return behavior.
Java clears valid output when either input is empty.
The [client preservation patch](../../viafabricplus-bedrock/upstreamable/0018-preserve-authoritative-bedrock-cartography-results.pr.md) addresses that client limitation.
Native operation previews and full direct and proxy comparisons remain incomplete.

## Native evidence

Private captures use Bedrock 1.26.51.1, build 51061372, protocol 2193.
They establish creation, extension, cloning, locking, rename-only requests, and locator conversion.
Paper creation and empty-map renaming also work in the lower input slot when the upper slot is empty.
An empty map plus paper in occupied inputs produces no result.
Empty-map locator conversion produces subtype 2.
Filled-map locator conversion preserves the map ID and adds `map_display_players`.

A clone consumes one filled map and one empty map and produces two maps.
Right-clicking that two-map output with an empty cursor sends no request in the inspected build.
A single Shift-click places one pair in inventory and leaves remaining ingredients in the inputs.
Naming uses `FilterStrings[0]` with `CartographyText` origin.
The final locked map identity can differ from its preview ID.
The authoritative metadata refresh reconciles that difference before queued interactions proceed.

Mojang's [cartography UI source](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/ui/cartography_screen.json) provides naming and preview structure.
Its current source specifies a 30-character field limit.
The target build's limit still needs a native boundary comparison.

Raw captures, account data, proprietary assets, and screenshots remain private.

## Remaining verification

- Inline naming and previews have verified ViaProxy flows. Direct, locking, and zoom comparisons remain required.
- Further Java menu operations and crafted metadata edge cases need live comparisons.
- Bulk operations, drop keys, hotbar exchanges, close timing, and rejected requests need further native comparisons.
- Direct connections and ViaProxy need visible and behavioral verification.
- The additional advertised multi-recipe UUID remains unidentified and is not assigned invented behavior.

This patch implements the main core path.
It does not establish complete cartography parity.

## Testing

Seven recipe and request tests cover advertised counts and output, sparse map families, unknown scales, locator and lock metadata, naming, network identity, request actions, and destination capacity.
The complete core suite reports 407 tests, no failures or errors, and one optional fixture skip.
Main and test Checkstyle pass.

A private Java 26.3 client with the preservation patch verifies paper-only output through ViaProxy.
It crafts one map, retains three remaining paper items, and places the acknowledged result in its hotbar.
Further direct and proxy operations remain unverified.

The final naming test confirms cancellation retains all four paper items and restores the output without a phantom map.
Saving a name and Shift-clicking crafts one named map into the hotbar.
The server's final item retains that name and its acknowledged network ID, with no pending synchronization.
All four targets build after the patch updates.

## Native presentation transport

Core sends `viabedrock:cartography` before `OPEN_SCREEN`, including an empty table.
Payload format 1 carries the pinned protocol, window ID, edit acknowledgements, operation, and map name.
Names and operation values have explicit bounds.
Core derives the operation from its selected recipe.
The client sends ordinary Java rename packets and retains newer typing until core acknowledges those edits.

The resource converter exports the seven cartography images from the effective pack stack.
Higher packs retain precedence, including extension changes.
Oversized images do not reveal a lower pack's image.
The conversion cache version changes with this output.
Licensed built-in images remain private; none are included in this patch.

Four additional tests cover state encoding, bounds, image precedence, and oversized overrides.
Main and test Checkstyle pass.

## Inline naming and preview comparisons

The private Java 26.3 client opens the native layout through ViaProxy with an empty table.
Six rapid edits finish with six core acknowledgements and retain the final text.
Keyboard typing also works, including the inventory key while the field has focus.
Crafting consumes one paper and retains the name in the server's acknowledged item.
Synchronization finishes without pending requests.

A private resource pack contains the seven images from the licensed matching package.
The converter transports them through ViaProxy, and the client draws accepted server images.
Captures verify creation, copy, and locator mode transitions and captions.
The client has no Bedrock account selected during this server-image comparison.
The missing-image message is also checked separately.
Licensed acquisition, direct connections, resize timing, locking and zoom visuals, and complete operations remain unverified here.

The core suite reports 407 tests, no failures or errors, and one optional fixture skip.
The add-on suite reports 521 tests, no failures or errors, and 109 optional fixture skips.
All four targets build; main and test core Checkstyle pass.
