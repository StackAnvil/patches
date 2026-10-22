# Present authored native containers

Server-authored container geometry needs real menu addresses and item authority.
This patch renders supported programs over the actual Java menu, with its actual slots, cursor, revisions, and ordinary inventory dispatch.
It retains the original screen object for recovery.

Supported families include template chests, ender chests, barrels, shulker boxes, hoppers, dispensers, droppers, and brewing stands.
Cooking programs use furnace, smoker, and blast-furnace menus with all 39 real inventory slots.
The default cooking program still uses ordinary controls because required handlers remain unfinished.

## Ownership and admission

Presentations bind to the current play listener, actual menu object, menu ID, family, and increasing opening sequence.
Cooking item updates also carry snapshot and inventory revisions.
Stale frames reject before item conversion. Invalid newer frames retire the previous authority.
Closing or retiring a menu preserves the sequence floor, so reused numeric IDs cannot revive it.
Reconfiguration on the same physical connection still requires a new play owner.

Full template menus require complete slot coverage.
Negotiated authored subsets retain only their declared slots and wait for actual contents and server activation acknowledgment.
Hidden or omitted slots cannot receive generic pickup, shift, number-key, drop, double-click, or drag actions in that subset.
Count-one actions use the existing negotiated backend, independently of template inventory dispatch.

Unknown required renderers, active unsupported item filters, storage bindings, and command mappings retain ordinary controls.
Known bundles retain ordinary controls while their storage bindings remain unsupported.
Native lock decoration reads exact retained ByteTag values and the owned connection's `showTags` rule.
Unknown storage values remain absent, rather than becoming fabricated zero values.

## Recipe pointer input

The client registers typed version-four cooking actions and replies.
Initial input requires an installed native screen, its exact owned menu, a resolved recipe scope, an empty cursor, and advertised capability.
The authored cooking backend currently requires server-authoritative inventory.
Recipe previews use copied translated stacks, independently of inventory-slot identities.

Slots, close commands, and recipe cells share clipped painter order, including equal-layer overlays and inactive controls.
Close commands honor their source input and pressed mapping.
A cooking slot's cancel-to-exit binding cannot close the menu on an ordinary primary or secondary click.

The Java adapter maps primary and secondary presses to phase zero, and releases to phase two.
Captured buttons retain the original recipe and command when newer scenes replace or remove the cell.
Drags, additional buttons, and duplicate releases cannot dispatch vanilla inventory input.
Unsupported mapping attributes, select/deselect constraints, and string booleans reject before the scene becomes actionable.
This adapter does not establish native physical event equivalence.

Replies must match the complete pending action. The sender records pending input before transport, including synchronous bridges.
Rejected or consumed authority requires a newer resolved frame before another gesture starts.
Capability loss, menu replacement, transport ambiguity, and response timeout retire the presentation.
A one-shot terminal release retains the original identity after retirement and cannot repeat transfers or retry an ambiguous terminal send.
Fallback restores the exact original screen on the same connected menu, even after controller retirement.
It cannot overwrite a later screen or a reused menu.

## Preference pointers

Supported tab, filtering, and layout toggles bind their actual authored group, index, and checked state.
They share clipped painter order with slots, recipe cells, and close commands.
The existing per-family transport carries changes after the installed screen checks its displayed snapshot and empty cursor.
Preference changes cannot interrupt a recipe gesture.
Further pointer, scroll, and inventory-key input waits for a newer matching model.
Capability loss, ambiguous transport, or a ten-second wait restores the original screen.

The pinned callbacks `0x146c99520` and `0x146c99b40` pass 74 controls with initialized controller/model state and valid weak ownership.
Tab events use the group index and skip refresh for the current tab. Filtering events publish the new checked byte.
Downstream setters, collection rebuild, and settings refresh remain observed external boundaries.
Layout pointers preserve the current tab/filter, use native indices `1` and `2`, and skip a current-layout selection.
They wait for newer matching model state in either direction. Forced-profile layout controls retain ordinary screens.
The unchanged direct layout callback at `0x146c99560` passes 480 controls over supplied state, profile/input values, and held-source validity.
Its saved-tab and held-selection branches are observed but remain unimplemented in this preference adapter.
Focused mappings and additional device mappings also remain unsupported.
This route does not establish complete default-screen, native input, or visual parity.

## Rendering and retained behavior

Authored item bounds, count labels, progress, transient flights, and ordinary slot decoration use genuine menu state.
Native images and item draws carry opacity once through premultiplied submission, including cached item textures.
Animation refresh preserves clocks through hierarchical control and inventory identity.
New controls start at their update time; removed controls retire without inventing slot addresses.

Native title, multiline tooltip, color, anchor, offset, constraint, and scroll behavior use the shared renderer.
Tooltip wrapping preserves styled runs, CRLF boundaries, and empty lines.
Furnace tab, filter, and layout preferences retain their independent negotiated state per family.
The remaining default cooking controllers still need their UI bindings.

## Evidence and validation

The pinned native target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Native CPU controls cover progress, flights, typed lock reads, UI callbacks, and mixed-unit vector animation.
These include 20 progress cases, seven flight timings, 25 NBT controls, 125 UI callbacks, and 1,536 animation samples across 32 easing selectors.
Their original fixture boundaries remain separate from GPU and complete controller behavior.

The paired four-project build passes 2,453 tests, with 213 optional skips and no failures or errors.
All 104 core patches and 38 client patches replay.
Checkstyle, access-widener validation, and Maven POM generation pass. All 1,401 embedded core classes match the rebuilt core.
The cooking action, presentation, controller, screen, and geometry suites pass all 42 tests.
All eight shared presentation tests also pass.
Disabling recipe pointer routing fails the interaction regression.
The mapping regression also fails before the unsupported-attribute guard.
Disabling preference or layout admission, or intrinsic toggle hover selection, fails the corresponding interaction and presentation regressions.

A private live fixture projects supported controls from real cooking scenes without changing the core or server.
It removes unfinished widgets, unsupported mappings, and unsupported renderer leaves.
A private color marker identifies the projection. The ordinary test driver waits twelve seconds before its first panel check.
Projection retains all 39 real inventory addresses, retained recipe metadata, and original mapping entries.
Actual installed screen handlers send fourteen tab/filter/layout changes and receive newer cooking models with the requested state.
These confirm the core round trip, independently of Bedrock settings acknowledgment.
The handlers then send primary presses and releases in all three cooking families.
BDS starts cooking after each placement, with one real ingredient and an empty cursor.
All six production replies match and accept the inputs.
The fixture restores ordinary screens, then the three normal cooking cases and same-world reconnect pass.
Private runtime inventories match all 2,445 core and client class resources plus four data resources.
Raw captures, rendered images, fixture programs, and observers remain private.

This live fixture is a controlled projection, not an unchanged server-authored screen or native reference image.
It does not establish OS mouse translation, broader recipes and quantities, nonempty-cursor behavior, or native pixel parity.

## Remaining work

Complete default search, help, focus, carried-item, tertiary, controller handlers, and layout selection history before replacing the default cooking program.
Navigation and filtering still need their remaining focus and device mappings.
Cross-input prediction, authoritative model watchers, additional workstation families, and complete inventory semantics remain unfinished.
Exit transitions, carried-item opacity, inactive filters, native fonts and pixels, resource reloads, and broader client routes also remain verification gaps.
Actor-backed authored storage acceptance and complete native GUI parity remain unverified.

## Prerequisite

- [Shared scene and GUI actor rendering](0029-share-native-ui-scene-rendering.pr.md).

See the [native cooking reference](../../../docs/native-cooking-actions.md) for dispatch, request, and native evidence boundaries.
