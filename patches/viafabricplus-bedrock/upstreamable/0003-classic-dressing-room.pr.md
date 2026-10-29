# feat(bedrock): add classic Dressing Room

## Purpose

Import the appearance controls from viafabricplus-bedrock PR #11. Carry the native skin-rendering callback into the new appearance provider so the earlier rendering patch remains functional.

## Design constraints

Keep local preview, selected appearance, and server-confirmed skin state separate. Retain geometry, cape, trust, profile identity, and connection lifetime through classic selection.

## Validation and remaining limits

Regression coverage includes `BedrockAppearanceStoreTest`, `BedrockClassicModelTest`, `BedrockClassicOptionsTest`, `BedrockClassicSkinPackTest`.

Selection and upload tests cover supported records. Live account acquisition, platform behavior, and complete native preview parity remain unverified.

The [owning patch](0003-classic-dressing-room.patch) retains implementation rationale and versioned evidence.
