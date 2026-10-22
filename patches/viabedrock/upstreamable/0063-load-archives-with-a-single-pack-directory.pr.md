Minehut's Bedrock endpoint sends a Geyser skull pack with its manifest and assets inside `skull_resource_pack/`. The download passes its advertised SHA-256 check, but ViaBedrock rejects the archive before world join.

Normalize a single manifest directory before parsing the pack. Preserve asset and subpack paths, prefer an explicit root manifest, and reject ambiguous archives containing multiple nested packs.

Validation: targeted archive and subpack tests cover relative asset preservation, unchanged source content, root precedence, and ambiguity rejection. The raw server archive remains a private fixture.

Enchanted exposes another archive layout: stored ZIP entries with data descriptors.
The downloaded archive has 73 entries, including 58 files, and passes its CRC checks.
Java's streaming reader rejects it before resource negotiation can finish.

Read the central directory with the existing Commons Compress dependency and an in-memory seekable channel.
Keep physical entry order, normalized paths, entry sizes, and CRC checks.
[Apache's ZIP guide](https://commons.apache.org/proper/commons-compress/zip) explains why a seekable reader handles these descriptors reliably.

The regression includes a stored entry whose payload is another ZIP, with embedded header and descriptor signatures.
It also rejects changed payload bytes.
The private server archive reproduces the original exception and loads all 58 files with the new reader.
All four projects build successfully, with 2,133 passing tests and 152 optional skips.
A fresh live Enchanted run loads the pack and reaches its authored hub UI.
The UI still has presentation problems, but its response button initiates a server transfer.
The archive fix does not establish UI or destination-world parity.
