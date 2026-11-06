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
Local text updates while an older edit waits for a reply; recipe authority remains tied to the server snapshot.
Shared naming and recipe APIs belong in core rather than screen-specific copies.

## Progress and controls

Keep cooking progress and preferences independent of recipe requests.
Use authored component flags for visibility, focus, input, and toggle behavior.
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

Earlier controlled references execute parts of Bedrock 1.26.51.1, build 51061372, protocol 2193.
Those references establish their supplied boundaries and require a version check before reuse for 26.60.
Keep binaries, native addresses, transcripts, and repeated probe results private.
The owning patch contains the durable rationale.

## Remaining limits

Complete authored control bindings, remaining input branches, and native parity remain unfinished.
Default hosts still need their remaining input actions. The editor binding alone does not admit them.
Native state registration and isolated callback execution do not establish live controller delivery.
A local request test does not establish native graphical behavior or complete server transaction recovery.
