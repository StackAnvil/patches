# feat(inventory): translate Bedrock cartography in core

## Purpose

Open cartography through ordinary Java menus and select creation, rename, clone, extension, lock, and locator operations from advertised recipes and retained map state. Preserve native slot identities, input consumption, naming filters, locked-copy requests, inventory acknowledgments, and crafted metadata synchronization across direct and proxy connections.

## Design constraints

Use advertised recipes and retained map state for rename, clone, extend, lock, and locator operations. Preserve slot identity, name filtering, input consumption, and response ownership across both routes.

## Validation and remaining limits

Regression coverage includes `CartographyStateTest`, `CartographyRecipesTest`, `CartographyUiResourceRewriterTest`.

Native captures establish selected recipe and count behavior. Complete live operations, locking/zoom visuals, direct presentation, and resize timing remain unverified.

The [owning patch](0016-translate-bedrock-cartography-in-core.patch) retains implementation rationale and versioned evidence.
