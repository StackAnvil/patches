Falling blocks always rendered as Java's default block. Bedrock sends the block runtime ID in the falling block's `VARIANT` field, while Java reads the block state from the spawn packet's data field. This translates the ID with the same block-state mapping used for chunks; an unknown ID keeps Java's default.

Validation: a unit test covers a mapped, an unknown and a missing variant. Lifeboat's lobby spawns falling blocks with variants such as 17713.
