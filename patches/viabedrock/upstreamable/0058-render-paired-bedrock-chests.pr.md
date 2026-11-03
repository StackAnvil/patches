## Purpose

Render paired Bedrock chests with the correct Java left and right block states.
Bedrock supplies the adjacent half through block-entity `pairx` and `pairz` coordinates.
Its block palette does not supply the Java chest type.

## Review focus

Apply the pairing coordinates relative to the mapped chest facing.
Preserve the existing lootable-container data and the fallback for missing, invalid, or non-adjacent pairs.
The state conversion covers regular, trapped, and copper chests.
Inventory capacity and request handling remain separate from this rendering change.

## Validation

Local regression fixtures cover both sides, every horizontal facing, chest variants, and invalid pairing coordinates.
Those tests stay in the local stack and do not form part of the upstream PR.
Build the filtered production patch independently against the pinned upstream base before publication.
