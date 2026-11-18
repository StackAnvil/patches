# feat(bedrock): add classic Dressing Room

## Purpose

Import the appearance controls from viafabricplus-bedrock PR #11. Carry the native skin-rendering callback into the new appearance provider so the earlier rendering patch remains functional.

## Design constraints

Keep local preview, selected appearance, and server-confirmed skin state separate. Retain geometry, cape, trust, profile identity, and connection lifetime through classic selection.

## Validation and remaining limits

Regression coverage includes `BedrockAppearanceStoreTest`, `BedrockClassicModelTest`, `BedrockClassicOptionsTest`, `BedrockClassicSkinPackTest`.

Selection and upload tests cover supported records. Live account acquisition, platform behavior, and complete native preview parity remain unverified.

The [owning patch](0003-classic-dressing-room.patch) retains implementation rationale and versioned evidence.

## Saved skins

Each imported skin, including a skin chosen from a pack, is added to a per-account Saved skins list.
A player can wear an earlier skin again or remove it without importing its pack again.
Entries are snapshots of the custom slot, named by a content hash, so repeated imports share one entry.
Wearing an entry replaces the custom slot and keeps the separately imported cape.
`BedrockAppearanceStoreTest` covers wearing an earlier geometry skin after another import, deduplication, removal, name cleanup, and rejected entry names.

A Wayland file drag of a 4D `.mcpack` onto the Dressing Room opens the pack screen in a live session.
The lab drop uses a GTK4 drag source on the private display, so it exercises the client's real drop handling.

The pack reader ignores a UTF-8 byte order mark at the start of `en_US.lang`.
Marketplace packs such as Archer's Strike begin with one, which hid the translated pack title.
Across 66 owned Marketplace skin packs, all 877 skins import and build renderer geometry.
