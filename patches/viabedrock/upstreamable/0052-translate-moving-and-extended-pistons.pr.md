Translate native moving blocks and piston arms into Java moving-piston states and carried-block data.

Java 26.3 `StateHolder` dispatches block states by `id`, with lowercase `properties`.
The former `Name` and `Properties` compound fails the real decoder and silently becomes air.
The producer now writes the target codec's representation.

The add-on integration test writes this producer's actual NBT through the network codec and loads it with Minecraft's piston entity.
All 24 combinations pass: six directions, extension or retraction, and stone or property-bearing stairs.
The previous producer fails with a missing `id` diagnostic.
Core tests retain coverage of direction, progress reversal, stale arm tags and arm/base placement.

The full core and client stacks replay cleanly. All four projects build with 2,264 passing tests and 152 optional skips.
Offline tooling and patch metadata validation pass.
Native piston physics and graphical parity remain separate requirements.
