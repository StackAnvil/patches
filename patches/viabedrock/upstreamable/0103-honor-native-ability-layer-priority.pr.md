# fix(abilities): honor native ability layer priority

## Purpose

Resolve each ability from the highest numbered declaring layer. Explicit false and zero values own the result; a lower layer must not override them. Share the ownership lookup between boolean and float consumers so standard Java ability flags, speed values and native model inputs agree.

## Design constraints

Resolve native ability layers in their authoritative priority order. Preserve world movement and interaction permissions across updates without inventing Java-only capabilities.

Prerequisites:

- viabedrock/0001-update-bedrock-to-1-26-60.patch: Land the test-source configuration before these packet and native-reference regressions.

## Validation and remaining limits

Regression coverage includes `GameTypeAbilitiesTest`, `PlayerAbilitiesTest`.

Layer and transition regressions cover supported permissions. Broader native interaction, spectator, and mounted behavior need dedicated controls.

The [owning patch](0103-honor-native-ability-layer-priority.patch) retains implementation rationale and versioned evidence.
