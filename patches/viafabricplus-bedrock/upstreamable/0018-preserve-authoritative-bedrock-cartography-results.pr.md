# Preserve server cartography results

## Why the add-on is needed

Java 26.3 recomputes cartography output when each menu slot changes.
It removes an existing result when either input is empty.
That also happens while Java applies a server inventory packet.
Bedrock paper-only creation and rename-only crafting therefore lose their valid output on the Java client.
Sending the same result again cannot fix this behavior.

The add-on cancels local recipe recomputation when the menu contains ViaBedrock's native item context.
ViaBedrock core still selects recipes, predicts consumption, sends requests, and reconciles authoritative results.
The guard uses existing item components, so it works through ViaProxy without depending on local protocol selection.
Java server menus without native context keep their normal behavior.

## Evidence

The comparison uses Java 26.3 and Bedrock 1.26.51.1, build 51061372, protocol 2193.
A private Java client connects through the current ViaProxy build.
It opens cartography and places paper in the first input.
Core retains recipe 1172 and a one-map result, but Java clears the output slot.
The naming dialog opens, accepts a name, and returns to the same cartography menu.

Inspection of the matching Java classes confirms the cause.
`Slot.set` calls `setChanged`, and the cartography result container calls `slotsChanged`.
That method removes the output when either input is empty.

## Remaining work

Native inline naming and operation previews remain incomplete.
Direct connections, native item input behavior, rejected requests, and complete container operations need further comparisons.

## Verification

The patched Java 26.3 client receives paper-only output through ViaProxy and keeps it visible.
Taking the map consumes one paper.
The metadata refresh completes, and the client places the crafted map in its hotbar through another accepted request.
The remaining input and the next result remain visible.
The add-on suite reports 519 tests, no failures or errors, and 109 optional fixture skips.

Naming cancellation preserves input counts and restores the result through the core dialog lifecycle.
Saving a name and crafting produces an acknowledged item with the requested name.
These comparisons establish the tested ViaProxy flows, not complete native UI or direct connection parity.
