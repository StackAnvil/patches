# feat(items): preserve native item context in Java data

## Purpose

Retain the original Bedrock identifier after Java item translation so client integrations can evaluate native item-name queries through ViaProxy. Java mappings can rename legacy items and collapse custom items to a shared Java type. Copy mapping-owned custom data before adding context.

## Design constraints

Keep original native identifiers, descriptors, and component ownership alongside Java mappings. Preserve unrelated custom data and distinguish aliases that share a Java item.

Carry explicit native air-continuation metadata alongside the item identity. Component presence and built-in subclass defaults differ from Java carrier types. Preserve an explicit false value when replacing an earlier stack's context.

Carry a separate release-on-stop flag for installed `minecraft:shooter` components. A Java carrier can send native use without entering Java active use. The flag lets an integration retain physical release ownership without enabling repeated air use for unrelated items.

## Validation and remaining limits

Regression coverage includes `NativeItemStackDataTest`, `ItemAnimationDataTest`, `ItemUseDurationTest`, `ItemIdentityTest`, and `ItemAirUsePropertiesTest`.

Construction, merge, naming, and descriptor regressions cover the implemented boundaries. Arbitrary custom definitions and complete native recipe admission remain open.

The [owning patch](0078-preserve-native-identifiers-in-java-item-data.patch) retains implementation rationale and versioned evidence.
