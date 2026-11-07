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

Desktop Return activates the slot through its authored confirmation mapping.
Its separate Return callback retains keyboard-held state and completes the matching quantity selection on release.
The same inventory request owner handles pointer and Return pickup, source return, and partial pickup.
Repeated Return presses cannot start another pickup while that hold remains active.
Return callbacks use raw held-input edges independently of the activation flag.
Only a release after that component received a press can clear Return or complete its quantity owner.
An unmatched release from a newly visible mapping preserves the original source and timer.
Installed direct and ViaProxy controls cover a mapping that becomes visible during a physical Return hold.
Both routes keep quantity selection active through its unmatched release and finish once on the real Return release.
Space does not activate an ordinary desktop cooking slot.

Cooking reset uses the raw phase retained by the authored component.
Every pressed phase updates the empty-source context, including repeated presses.
A released phase finishes an operation only when its previous phase differs from pressed.
A release after that component received its own press does not finish the operation.
Keep component consumption active while the controller waits for inventory replies.
A child can consume the press before a parent receives the release.
Recipe, quantity, and drag completion retain their existing request owners and original sources.
A repeated release cannot send another completion or retire the opening.
Declined preference changes restore their model-bound toggles without changing this input history.

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
Touch distribution retains the selected inventory slot as its source and keeps the cursor empty.
It retains a separate quantity budget instead of picking that quantity up onto the cursor first.
Redistribution can return items to the original source while preserving items outside that budget.
For a four-item selection from nine, three destinations receive one each and the source retains six.
Repeated visits do not add a destination or transfer more items.
Source-selection release clears the previous drawing destination while retaining the selected item source.
The first drawing event retains its destination without transferring items.
The second event enters distribution with that retained destination, then distributes to the current destination.
An arrow hold blocks this entry but preserves the latest drawing destination.
After arrow release, distribution starts with that destination and the next entered destination.
Ordinary selected-source drawing keeps the cursor empty and sends no cursor-drag start signal.
Release preserves placed items and clears the selected source and distribution allocation.
Native component, controller, and legacy-model controls establish these results for hotbar, inventory, and furnace ingredient sources.
They do not establish physical touch delivery, native multiplayer request grouping, or complete screen behavior.
The negotiated Java drag path currently supports cursor-origin desktop distribution.
Selected-source transport and its client input owner remain unfinished.
Release over an empty recipe panel can retain the drag allocation.
Pointer entry then redistributes items without a held mouse button.
A delivered slot release or furnace-root reset retires that allocation.
During a retained primary drag, a secondary press preserves the allocation.
Its delivered slot release ends the original operation, even though another button started it.
Use the delivered authored callback to resolve this boundary. Physical release alone does not establish a reset.

Route bundle insertion and extraction through the shared physical transfer owner.
Cooking bundle commands retain all six source fields and share request ordering with search, recipes, and held-item input.
Resolve selected display cells against the published bundle contents before extracting a physical slot.
Dynamic bundle changes replace the publication even when the root stack and container revisions stay unchanged.
A reply states whether the original authority remains current. Wait for a new snapshot only when it retires that authority.
Retain newer search text while a bundle command waits. Late replies cannot release another opening or play its sound.
Pending item commands do not clear physical hover.
Retain the bundle source through mouse release and renewed snapshots without requiring pointer movement.

Keep hover separate from the selected source used by `#is_recipe_selected_slot`.
Ordinary recipe hover preserves selection.
The native source controller clears selected bundle context during its admitted desktop transitions.
An empty-source press preserves bundle hover when the primary source is already empty.
Retain a local source reset through publications with unchanged selected-source data.
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
Cooking recipe cells use the shared inventory drop input owner.
With a carried stack, the desktop drop key drops one item and the whole-stack drop key leaves that stack alone.
With an empty cursor, neither key takes an item from the recipe preview.
A held drop key acts once until release, including when its modifier changes.
Cooking Help opens the Encyclopedia at Furnace for all three station families.
Help retains the inventory opening, carried items, and pending search while its own view receives input.
Back and Escape return to that inventory without closing its container.
The shared Help renderer uses the localized encyclopedia heading and scrolls the selected topic into view.
Help starts with its selected topic focused.
Moving the pointer hides the keyboard highlight.
Hovering another topic changes the focus without changing the chapter.
Arrow keys resume from that topic, and confirmation selects its chapter.
Installed direct and ViaProxy controls retain nine carried items through Back and Escape, then retain all nine after reopening.
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
Installed direct and ViaProxy reset controls retain drag allocation after a release whose previous phase is pressed.
A later qualifying reset ends the allocation once. Pointer entry cannot redistribute items after that completion.
Each journal contains seven accepted transfers and one drag start/end pair.
Server inventory and reopened menus retain three stacks of three, without dropped items.
Other input modes, broader source selection, and same-frame pointer and press admission still need matching controls.

Earlier controlled references execute parts of Bedrock 1.26.51.1, build 51061372, protocol 2193.
Those references establish their supplied boundaries and require a version check before reuse for 26.60.
Keep binaries, native addresses, transcripts, and repeated probe results private.
The owning patch contains the durable rationale.

## Remaining limits

Complete authored control bindings, remaining input branches, and native parity remain unfinished.
Default hosts still require arrow-key state and scrollbar input integration.
Broader source-selection transitions and other input modes remain unfinished.
The shared bundle controller retains padded selection through publication-bound extraction and replies.
Native physical bundle navigation bindings remain unverified.
Installed selected-cell extraction uses an admitted authored fixture. See the [container validation](../patches/viafabricplus-bedrock/upstreamable/0029-present-authored-native-containers.pr.md).
Native state registration and isolated callback execution do not establish live controller delivery.
A local request test does not establish native graphical behavior or complete server transaction recovery.
