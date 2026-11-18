Crack particles for blocks other players punch were dropped with "Missing block state" warnings.

Servers send the crack level event data as `runtimeId | (face << 24)`, as PocketMine's `BlockPunchParticle` does. InPVP sent `0x050033E2` and `0x010033E2` for one block punched from two faces. The translation now looks up the full value first, because hashed block ids use all 32 bits, and falls back to the low 24 bits.

Validation: a unit test covers a face-encoded id, a plain runtime id, a hashed id and an unknown id. A live InPVP session no longer logs missing block states for punched blocks.
