# feat(ui): share bounded native UI programs and resource conversion

## Purpose

Provide immutable JSON UI declarations, scoped expression evaluation, domain bindings and bounded scene contracts before packet integration. Keep accepted pack layering, textures, fonts and builtin UI identity in one resource lifecycle.

## Design constraints

Transport shared authored programs and resources before domain-specific adapters. Preserve accepted pack order, immutable snapshots, resource ownership, and bounded decoding on direct and proxy routes.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Land accepted native resource transport before loading shared UI programs.

## Validation and remaining limits

Regression coverage includes `NativeContainerActionTest`, `NativeContainerDataTest`, `NativeContainerMessageTest`, `NativeCookingActionResultTest`.

`InventoryStackCount` provides native count text separately from numeric binding quantities.
Bedrock 1.26.60.5 (protocol 2225) hides counts below two, uses decimal text through 99, and displays `99+` above that.
All 536 complete native formatter controls match the packaged Java producer.
The controls supply caller storage and CRT string operations; they do not establish source quantities or visual parity.

Program compilation, resource, and transport tests cover supported content. Transport acceptance does not establish screen interaction or visual parity.

The [owning patch](0095-share-native-ui-programs-and-resources.patch) retains implementation rationale and versioned evidence.
