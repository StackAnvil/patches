# feat(ui): share bounded native UI programs and resource conversion

## Purpose

Provide immutable JSON UI declarations, scoped expression evaluation, domain bindings and bounded scene contracts before packet integration. Keep accepted pack layering, textures, fonts and builtin UI identity in one resource lifecycle.

## Design constraints

Transport shared authored programs and resources before domain-specific adapters. Preserve accepted pack order, immutable snapshots, resource ownership, and bounded decoding on direct and proxy routes.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Land accepted native resource transport before loading shared UI programs.

## Validation and remaining limits

Grid factories populate each collection once and respect the bound maximum item count. Relative cell templates use the defining namespace.
The captured Lifeboat Navigator now resolves eight main cells, matching native Bedrock 1.26.60.5, instead of 46 duplicated cells.
Reduced regressions cover factory ownership, template lookup, and item limits.
The rebuilt add-on shows two columns and four rows during a live join.
World Games, Mini Games, and SkyWars open through their authored controls. Selecting Solo reaches the waiting lobby.
The recorded replies retain the original button indices. Complete native appearance remains unverified.

Regression coverage includes `NativeContainerActionTest`, `NativeContainerDataTest`, `NativeContainerMessageTest`, `NativeCookingActionResultTest`.

`InventoryStackCount` provides native count text separately from numeric binding quantities.
Bedrock 1.26.60.5 (protocol 2225) hides counts below two, uses decimal text through 99, and displays `99+` above that.
All 536 complete native formatter controls match the packaged Java producer.
The controls supply caller storage and CRT string operations; they do not establish source quantities or visual parity.

`InventoryItemFilter` separates disabled-item lighting from opacity and transports authored multiplier bindings.
Current 1.26.60.5 instruction controls cover 150 typed property combinations and native RGB conversion.
The packaged regression retains 50 object-property cases, including booleans, numeric extremes, and invalid types.
These controls supply property lookup and ABI storage. Complete item geometry, materials, and final pixels remain unverified.

`UiBindings.Window` selects cell views from a complete collection without changing its size or source indices.
A separate retained range supports offscreen keyboard focus and its neighbors.
Only fixed horizontal grids qualify. Row-dependent dimensions and redirected root indices are rejected.
Regression coverage compares complete and windowed sources, exported programs, source replacement, and the pinned inventory grid.
The scene node budget remains unchanged.

Program compilation, resource, and transport tests cover supported content. Transport acceptance does not establish screen interaction or visual parity.

Dynamic domain text uses the same native palette as ordinary labels.
Help regressions cover translated components and exported program round trips.

The [owning patch](0095-share-native-ui-programs-and-resources.patch) retains implementation rationale and versioned evidence.

View bindings can read an authored `toggle_view_binding_name` alias.
A regression checks section visibility when the destination has a different local toggle value.

Authored bindings accept raw value tokens and redundant trailing closing groups.
The captured Lifeboat protocol-2225 Navigator request resolves with all 23 original response indices.
The add-on accepts that scene and shows the authored Navigator GUI in a live join.
A live add-on check opens Mini Game Selector, returns through Back, and closes through Escape.
The journal retains the original response indices 0 and 8 and the user-close reason.
The full build and fresh-clone replay checks pass. Final typography and complete native appearance remain unverified.

Bounded relative UI paths preserve printable UTF-8 names and spaces. Converted identifiers still hash the original resource name.
Traversal, absolute paths, drive or URI syntax, backslash separators, control characters, and unpaired surrogates remain rejected.
A native Bedrock 1.26.60.5 capture shows Enchanted's authored hub menu and sends original response index 2 for OP SMP.
All 58 exported pack files match the add-on capture. The native run stops after transfer selection and does not establish gameplay after transfer.
The captured menu now resolves and passes visible-control admission with all 11 original responses.
Regressions retain bound image pixels and metadata and preserve form actions when a printable decorative texture is absent.
Frame strips can exceed 4,096 pixels on one side while preserving the previous 16-Mipixel total budget and source byte limits.
The current native pack uses a 963 × 5,916 logo atlas and a 5,880 × 480 background.
A shared dimension policy bounds conversion and client decoding. An encoded-strip regression preserves its endpoint pixels.
The rebuilt add-on opens the authored hub menu with all five trending cards and the three lower game cards.
A physical OP SMP selection sends the native original response index 2. The destination connection times out after Transfer; gameplay there remains unverified.
