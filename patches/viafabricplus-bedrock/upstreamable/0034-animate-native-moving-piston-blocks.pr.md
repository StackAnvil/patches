The Enchanted protocol-2193 capture crashes while chunk lighting asks a new moving-piston entity for its collision shape.
Java's empty constructor leaves direction unset until block-entity data arrives.

Create a pending native entity with direction from its translated block state and empty carried geometry.
Keep its animation ticker stopped until the separate data loads.
Otherwise Java eventually replaces the unresolved moving block with air.
After loading, resume the ordinary ticker and renderer.
Keep the existing suppression of duplicate Java actor pushes in Bedrock sessions.
Ordinary Java piston instances retain their ticker.

The constructor regression reproduces the null-direction exception with the old constructor.
The fixed entity has safe collision and renderer offsets in all six directions.
A second test loads the actual core producer through Java's network NBT and block-state codecs.
It verifies 24 combinations of direction, motion and carried-block properties.

A private transformed-client probe passes all six production factory directions and 600 pending ticks.
It verifies six authoritative loads and resumed animations, plus an ordinary Java ticker control.
The captured Enchanted replay reaches the prior trader-approach location without the null-direction error.
These checks establish client lifecycle and codec behavior. They do not establish complete scene or native visual parity.

All 38 client and 102 core patches replay cleanly.
All four projects build with 2,264 passing tests and 152 optional skips.
Offline tooling and metadata checks pass.

The complete 120-second replay passes transport verification.
Overall rendering verification still fails on unresolved block, entity and texture mappings.
No null-direction piston failure occurs. All seven owned process identities close, and the private display stops.
