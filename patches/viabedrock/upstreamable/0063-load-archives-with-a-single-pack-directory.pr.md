Minehut's Bedrock endpoint sends a Geyser skull pack with its manifest and assets inside `skull_resource_pack/`. The download passes its advertised SHA-256 check, but ViaBedrock rejects the archive before world join.

Normalize a single manifest directory before parsing the pack. Preserve asset and subpack paths, prefer an explicit root manifest, and reject ambiguous archives containing multiple nested packs.

Validation: targeted archive and subpack tests cover relative asset preservation, unchanged source content, root precedence, and ambiguity rejection. The raw server archive remains a private fixture.
