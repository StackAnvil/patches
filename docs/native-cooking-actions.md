# Cooking actions

Use this reference when changing furnace, smoker, or blast-furnace recipe controls.
Core executes snapshot-bound recipe actions through native transfer batches.
The default cooking program retains ordinary Java controls until the authored bindings are complete.

## Ownership

Core owns recipe identity, ingredient matching, permissions, network stack IDs, requests, and responses.
The add-on receives cooking snapshots and progress and routes input for admitted authored scenes.
Bind every action to the connection, container, opening lifetime, and source snapshot.
Do not let stale focus or selection operate on a newer container.

## Recipe input

Resolve event source and phase before dispatch.
Preserve controller ordering and handled results across registered callbacks.
Input-mode differences affect focus, selection, and held-item admission.
Do not replace those rules with a universal click handler.

Keep selection, ingredient placement, repeated placement, and ingredient return as separate operations.
Keep held quantity selection separate from the initial pickup and its source.
Entering quantity selection retains a secondary source and starts its own timer.
The native View starts a separate 0.3-second countdown after controller admission.
It subtracts float frame durations and emits a hold event only when the countdown falls below zero.
That event retains the starting pointer; displacement greater than five native units on either axis blocks quantity-selection entry.
The View countdown and the quantity-selection timer have different owners and start times.
Pointer exit can finish the partial pickup before physical release.
A second button press preserves quantity selection.
Its delivered slot release completes selection while the initiating button remains held.
An unmapped button release cannot complete another button's selection.
Route that completion through the inventory request owner before clearing the controller state.
Core retains the starting frame while ordinary Place and Take requests return the cursor and pick up the selected quantity.
Completion waits for the return response and uses its renewed network stack ID.
Rejection, reopening, or transport retirement cancels queued completion.

Desktop drag distribution includes the initially pressed slot before the first pointer movement.
Use the ordinary slot admission checks for that cell and later destinations.
Native distribution changes the real inventory as each destination is entered, before pointer release.
A nine-item desktop drag places nine in the first cell, then redistributes to four in each of two cells, then three in each of three cells.
Closing with Escape while the button is still down retains the placed items.
The negotiated Java path sends each destination through the inventory request owner before release.
The client sends ordered click phases without Java menu prediction, which would distribute the same items again on release.
It retains the original budget after a placement empties the cursor and uses renewed stack IDs after server replies.
A close waits for earlier drag inputs and their replies. New input cannot extend that closing operation.
Consecutive queued destinations share one pointer path and retain their first-visit order.
Repeated visits do not consume more queue entries. Release and a new press separate gestures.
Resolve destinations through the complete menu, including player slots appended to a cooking container.
Rejection discards unaccepted visits and closes with reconciled items.
A retired close cannot affect a replacement menu or opening.
Unnegotiated clients and bundle extraction retain their existing paths.
Drag distribution and held quantity selection have different lifetimes.
Release over an empty recipe panel can retain the drag allocation.
Pointer entry then redistributes items without a held mouse button.
A delivered slot release or furnace-root reset retires that allocation.
During a retained primary drag, a secondary press preserves the allocation.
Its delivered slot release ends the original operation, even though another button started it.
Use the delivered authored callback to resolve this boundary. Physical release alone does not establish a reset.

Keep hover separate from the selected source used by `#is_recipe_selected_slot`.
Pointer entry and exit cannot replace or erase the selected-source snapshot.
Native layout and tab callbacks clear hover while core retains ownership of the selected source.
Read transfer quantities from native descriptors and current stack identity.
Respect item locks, source permissions, destination capacity, and carried stacks.
Reconcile ordinary transfer batches and recipe requests with the authoritative response owner.
Failed requests must restore the appropriate snapshot without changing another menu.

## Search and names

Retain raw input independently of normalized search text.
Search changes retire selection according to the native callback contract.
Resolve names through the connection registry, language context, item definition, and component updates.
Do not use Java display names as ingredient identity.

Cooking search retains separate raw text for each station family within the connection.
Closing and reopening a menu retains that text.
Only the Search tab applies the query. Category tabs retain their own lists and counts.
The optional search transport binds edits to the displayed opening and inventory snapshot.
Search and recipe commands share request ordering. A changed query retires the old recipe-cell authority.
The client queues the latest edit while an earlier edit or recipe gesture waits for completion.
A late reply cannot erase newer text.
The connection retains an unsent edit or explicit clear for the next opening. Disconnect clears this client state.
An acknowledgment without a replacement snapshot still reaches the response timeout.
The native editor retains its property-field name separately from bound display text.
Its embedded X follows raw text, including whitespace.
During active editing, X clears the query and preserves typing, including after the first Escape.
A reopened inactive editor retains its query when X is clicked.
Only a clear button owned by the admitted editor can use this behavior.
Search hover and exit use the shared [editor input lifetime](native-player-inventory.md#actions-and-presentation).
Local text updates while an older edit waits for a reply; recipe authority remains tied to the server snapshot.
Shared naming and recipe APIs belong in core rather than screen-specific copies.

## Progress and controls

Keep cooking progress and preferences independent of recipe requests.
Use authored component flags for visibility, focus, input, and toggle behavior.
Check controller registrations before treating an authored mapping as a required cooking action.
Shared screen definitions can name callbacks that belong to another controller.
Preserve the component's input consumption when the cooking controller has no callback.
Layout increment and decrement use the current native layout transition.
Forced recipe-book layouts consume these actions without changing preferences.
Layout changes retain the carried stack and wait for a matching profile snapshot.
The current profile tab is separate from the controller's retained Inventory tab.
Admitted pointer hosts use the shared [cursor-drop behavior](native-player-inventory.md#actions-and-presentation).

The available bindings do not establish complete support for the default authored cooking program.
Preserve ordinary controls when required native controls are unavailable.

## Validation

Run focused recipe selection, quantity, request recovery, search, and screen-action tests.
Use real slot and cursor updates when testing a container adapter.
Use [test packs](bedrock-test-packs.md) and the [capture lab](capture-lab.md) for physical input and live transfers.
Record both direct and ViaProxy results where the changed behavior crosses that boundary.

Official Bedrock 1.26.60.5 desktop controls establish search filtering, category transitions, clearing, and retention after reopening a furnace.
Separate smoker text does not replace the furnace query.
These private integrated-world controls do not establish controller input, exact timing, or retention across connections.

Official 1.26.60.5 desktop controls also establish held quantity selection in hotbar and furnace ingredient slots.
A nine-item source produces a partial pickup during a hold and retains the remaining items in its original slot.
Read-only observations of the live controller distinguish initial pickup, quantity selection, and completion on release or pointer exit.
Core regressions cover delayed responses, renewed stack IDs, rejection recovery, source capacity, and opening retirement.
The Java desktop controller now retains an ordinary primary pickup through held quantity selection.
It waits for a newer pickup snapshot and keeps the selected source through delayed replies.
Source and cursor previews do not change the real menu items.
Release or pointer exit submits the last displayed quantity through the inventory request owner.

Installed direct and ViaProxy controls use an admitted authored furnace fixture with the normal admission guards.
A short press picks up nine items. A 600-millisecond hold picks up three, and a longer hold picks up all nine.
Pointer exit completes a partial pickup before physical release without another request on release.
The hotbar and ingredient controls conserve all nine items through 18 successful inventory responses on each route.
These controls do not establish default cooking-screen support or exact native frame timing.

The incremental drag and interrupted-close reference uses the official 1.26.60.5 integrated world.
Read-only script observations establish real inventory changes before physical Escape and mouse release.
Installed direct and ViaProxy controls match the nine-item sequence before release and retain three items per destination after reopening.
Both routes also close visibly while incoming replies wait for about three seconds, then reconcile the earlier destinations before sending the native close.
Each complete journal contains 18 successful requests: 14 across the ordinary and delayed controls, plus four for secondary dragging.
Secondary dragging places one item in each visited destination before release. Release preserves those three placements and the six carried items.
The official 1.26.60.5 client also distributes 64 items across all 36 player slots before release.
The held native model and visible items agree on one item per destination and 28 carried items.
Installed direct and ViaProxy controls retain this allocation through delayed replies, Escape while held, and a fresh opening.
Each journal contains 173 accepted transfers. Replies finish before the native close.
Server inventory, response data, and the reopened menu agree. All 64 items remain accounted for, with no dropped items.
These controls use an admitted authored furnace fixture. Default cooking hosts retain their admission guards.
Native multiplayer transfer grouping and delayed or rejected native drag behavior remain unverified.

Official 1.26.60.5 controls distinguish release over the empty recipe panel from release over the furnace root.
After the recipe-panel release, an unheld pointer entry redistributes ten items from three stacks of three to four stacks of two.
The cursor changes from one item to two. Read-only allocation fields and inspected screenshots agree.
Installed direct and ViaProxy controls retain this behavior while replies wait.
Both routes preserve the allocation during a secondary hold and stop further visits after its slot release.
Each complete journal contains eleven successful transfers and preserves all ten items after reopening.
Official 1.26.60.5 controls also complete quantity selection after secondary release while the primary button remains held.
Read-only controller observations and physical button masks establish that event order.
Installed direct and ViaProxy controls retain selection during the second press and complete it before primary release.
Each journal contains four accepted transfers and retains all nine items after reopening.
These controls establish the input lifetime, not exact frame timing or equal selected counts at matching requested durations.
Broader reset, source selection, and same-frame pointer and press admission still need matching controls.

Earlier controlled references execute parts of Bedrock 1.26.51.1, build 51061372, protocol 2193.
Those references establish their supplied boundaries and require a version check before reuse for 26.60.
Keep binaries, native addresses, transcripts, and repeated probe results private.
The owning patch contains the durable rationale.

## Remaining limits

Complete authored control bindings, remaining input branches, and native parity remain unfinished.
Default hosts still need their remaining input actions. The editor binding alone does not admit them.
Native state registration and isolated callback execution do not establish live controller delivery.
A local request test does not establish native graphical behavior or complete server transaction recovery.
