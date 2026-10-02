# Native item context in Java item data

Java item mappings can rename a Bedrock item or represent several native items with one Java item type. Client animation queries need the original identity. This patch adds `viabedrock:item_identifier` to the Java item's standard custom data after translation. The field reaches ordinary Java clients through ViaProxy.

The translation copies existing custom data before adding the identifier. It preserves mapping fields and creative entry IDs. Native items with different identifiers remain distinct even when they share a Java mapping. The field supplies rendering context; inventory requests still use the existing native inventory and creative catalog lookup.

## Evidence and verification

Bedrock **1.26.51.1**, build **51061372**, protocol **2193**, query callback `FUN_14221b950` resolves an item raw-name hash from the legacy item or its component-backed data. Independent execution covers 44 combinations of source, empty stacks, and query arguments. The harness supplies item objects, virtual hand getters, expression values, thread-local setup, name resolution, and error callbacks. It executes the native source and argument branches. It does not establish every custom item name or constructor path.

The [Creator query reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions/query_get_equipped_item_name?view=minecraft-bedrock-stable) documents equipped and rendered hand selection. The target executable establishes behavior for this version.

A live Java 26.3 client through ViaProxy received `minecraft:banner` as a Java `minecraft:white_banner`. Its item data retained the native identifier. A probe on the Minecraft thread invoked the production actor query and received `banner`.

All four build targets passed. ViaBedrock passed 380 tests with no failures or skips, including custom-data copy, retained fields, and distinct native aliases. The client integration passed its native query fixtures. Native executables, fixtures, captures, and runtime probes remain private.

## Compiled native use durations

The same custom data now carries `viabedrock:item_use_duration` when the server supplies compiled item properties. Its integer value is ticks. Missing legacy values remain unspecified. A mapping-owned duration marker is removed when the current native definition has no duration.

The target Bedrock 1.26.51.1 server sends 2,077 item entries. Thirty-two entries contain this property: seven spear types use 1,440,000 ticks, apple uses 32 ticks, and 24 non-use items use zero. Eight entries also carry authored use modifiers. Their seconds multiplied by 20 match the compiled ticks. The [Creator use-modifiers reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_modifiers?view=minecraft-bedrock-stable) specifies seconds for that authored component.

The full dependency build passes all four targets. Core passes 383 tests, with no failures or skips and the private registry fixture enabled. Tests cover compiled units, missing and invalid data, duration bounds, copied metadata, and removal of stale markers.

A live Java 26.3 client through ViaProxy receives the spear's native maximum of 1,440,000 ticks. Its Java maximum is 72,000 ticks. Production animation queries preserve elapsed time: at 17 elapsed ticks, native remaining time is 1,439,983. After release, remaining time is zero while the maximum persists.

These fields supply animation context. They do not change Java's input timeout or replace inventory request validation. Legacy duration discovery, local charging prediction, additional equipment-slot queries, custom component name comparisons, and first-person rendering remain separate work.
