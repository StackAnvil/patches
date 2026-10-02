# Native item identifiers in Java item data

Java item mappings can rename a Bedrock item or represent several native items with one Java item type. Client animation queries need the original identity. This patch adds `viabedrock:item_identifier` to the Java item's standard custom data after translation. The field reaches ordinary Java clients through ViaProxy.

The translation copies existing custom data before adding the identifier. It preserves mapping fields and creative entry IDs. Native items with different identifiers remain distinct even when they share a Java mapping. The field supplies rendering context; inventory requests still use the existing native inventory and creative catalog lookup.

## Evidence and verification

Bedrock **1.26.51.1**, build **51061372**, protocol **2193**, query callback `FUN_14221b950` resolves an item raw-name hash from the legacy item or its component-backed data. Independent execution covers 44 combinations of source, empty stacks, and query arguments. The harness supplies item objects, virtual hand getters, expression values, thread-local setup, name resolution, and error callbacks. It executes the native source and argument branches. It does not establish every custom item name or constructor path.

The [Creator query reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions/query_get_equipped_item_name?view=minecraft-bedrock-stable) documents equipped and rendered hand selection. The target executable establishes behavior for this version.

A live Java 26.3 client through ViaProxy received `minecraft:banner` as a Java `minecraft:white_banner`. Its item data retained the native identifier. A probe on the Minecraft thread invoked the production actor query and received `banner`.

All four build targets passed. ViaBedrock passed 380 tests with no failures or skips, including custom-data copy, retained fields, and distinct native aliases. The client integration passed its native query fixtures. Native executables, fixtures, captures, and runtime probes remain private.

Use durations, local charging prediction, additional equipment-slot queries, custom component name comparisons, and first-person rendering remain separate work.
