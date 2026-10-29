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

Earlier controlled references execute parts of Bedrock 1.26.51.1, build 51061372, protocol 2193.
Those references establish their supplied boundaries and require a version check before reuse for 26.60.
Keep binaries, native addresses, transcripts, and repeated probe results private.
The owning patch contains the durable rationale.

## Remaining limits

Complete authored control bindings, remaining input branches, and native parity remain unfinished.
Native state registration and isolated callback execution do not establish live controller delivery.
A local request test does not establish native graphical behavior or complete server transaction recovery.
