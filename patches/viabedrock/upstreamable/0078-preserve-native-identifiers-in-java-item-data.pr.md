# feat(items): preserve native item context in Java data

## Purpose

Retain the original Bedrock identifier after Java item translation so client integrations can evaluate native item-name queries through ViaProxy. Java mappings can rename legacy items and collapse custom items to a shared Java type. Copy mapping-owned custom data before adding context.

## Design constraints

Keep original native identifiers, descriptors, and component ownership alongside Java mappings. Preserve unrelated custom data and distinguish aliases that share a Java item.

## Validation and remaining limits

Regression coverage includes `NativeItemStackDataTest`, `ItemAnimationDataTest`, `ItemUseDurationTest`, `ItemIdentityTest`.

Construction, merge, naming, and descriptor regressions cover the implemented boundaries. Arbitrary custom definitions and complete native recipe admission remain open.

The [owning patch](0078-preserve-native-identifiers-in-java-item-data.patch) retains implementation rationale and versioned evidence.
