# Render native cartography and preserve server results

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

Inline naming and operation previews have verified ViaProxy flows. Further comparisons remain listed below.
Further native item input behavior, rejected requests, and complete container operations need comparisons.

## Verification

The patched Java 26.3 client receives paper-only output through ViaProxy and keeps it visible.
Taking the map consumes one paper.
The metadata refresh completes, and the client places the crafted map in its hotbar through another accepted request.
The remaining input and the next result remain visible.
The add-on suite reports 521 tests, no failures or errors, and 109 optional fixture skips.

Naming cancellation preserves input counts and restores the result through the core dialog lifecycle.
Saving a name and crafting produces an acknowledged item with the requested name.
These comparisons establish the tested ViaProxy flows. Full native UI parity still needs the comparisons listed below.

## Native client screen

An empty-table core payload selects the screen through direct connections or ViaProxy.
The screen uses the real menu slots and sends standard Java rename packets.
Fabric registers the payload codec and receiver and advertises the channel.
Core omits the fallback naming hint for clients that advertise this channel.
Recipes, consumption, result metadata, acknowledgements, and rejection recovery stay in core.
Shift-right-clicking output follows the native quick-move path in this screen.
Ordinary clients retain the core naming dialog.

The layout follows Mojang's [cartography UI source](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/ui/cartography_screen.json).
Its dimensions and captions are compared with Bedrock 1.26.51.1, build 51061372, protocol 2193.
Accepted converted server images override independently licensed images from the selected account.
Image acquisition runs off the game thread, and closing releases its textures.
Missing images leave the inventory usable and show an explicit message.
Production never reads a local Bedrock installation.

Two focused tests cover delayed name echoes and authoritative input changes.

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
Licensed acquisition, resize timing, and complete operations remain unverified here.

The core suite reports 407 tests, no failures or errors, and one optional fixture skip.
The add-on suite reports 521 tests, no failures or errors, and 109 optional fixture skips.
All four targets build; main and test core Checkstyle pass.

## Direct cartography comparison

A private direct connection initializes an empty map through the server's normal item-use path.
The table recognizes its advertised map family and displays the native zoom image and caption.
Taking the result consumes one paper and receives the server's final map UUID without pending requests.
Replacing paper with a glass pane displays the native lock image and caption.
This verifies these direct previews with accepted matching server images.
Further lock result reconciliation and complete operations remain open.
