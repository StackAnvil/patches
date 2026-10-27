# Bedrock request codecs

Keep inventory request, response, and recipe codecs together before the container implementation.

## Enum values and wire variants

Protocol 2225 metadata explicitly defines `TextProcessingEventOrigin.unknown=-1`.
The old protocol-2193 generator correction is no longer necessary.
The retained merchant and anvil wire tests cover the same signed origin values.

Keep generated item action values unchanged.
The Cereal variant list omits enum values 7 and 8, so the codec translates later action values to variant indexes.
For example, `CraftCreative` remains enum value 14 and uses variant index 12.
The existing byte-level tests cover both discriminators.

`InventorySourceType.Non_Implemented_Feature_TODO` is 99999 in the
[2225 metadata](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.60).
Its field uses `Enum-as-Value`, so the codec writes 99999 directly, not declaration index 4.
The [Cloudburst inventory-source model](https://github.com/CloudburstMC/Protocol/blob/3.0/bedrock-codec/src/main/java/org/cloudburstmc/protocol/bedrock/data/inventory/transaction/InventorySource.java) also assigns 99999.
Remove the generated enum override and cover the complete unsigned-varint encoding and decoding.

This codec foundation belongs to the inventory work in [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).

## Loom requests

The action codec now writes `CraftLoom`: union index 15, stable action byte 17, a pattern string, and an unsigned craft count. Bedrock 1.26.51.1 build 51061372, protocol 2193, native captures verify `hh` and `cre` requests followed by result, consume, and place actions. A byte-level test also covers count 255. Captures stay private.

## Dynamic recipes

Retain the multi-recipe array instead of discarding its UUIDs and network IDs.
Each entry represents a server-enabled recipe whose result depends on item data.
Keep unknown UUIDs and unsigned network IDs intact.
The recipe-book patch preserves these entries when it adds unlock metadata.

Native Bedrock 1.26.51.1, build 51061372, protocol 2193, captures identify three cartography switches:

| Operation | Recipe UUID |
| --- | --- |
| Clone | `442d85ed-8272-4543-a6f1-418f90ded05d` |
| Extend | `8b36268c-1829-483c-a0f1-993b7156a8f2` |
| Lock | `602234e4-cac1-4353-8bb7-b1ebff70024b` |

The native client sends their server-assigned IDs through `CraftRecipeOptional`.
Its requests also include consume and place actions, filter strings, and the `CartographyText` origin.
These captures establish the decoder prerequisite, not a complete Java cartography implementation.

Two focused wire tests pass.
They cover the three switches, an unknown UUID, an unsigned network ID, following-array alignment, and truncated input rejection.
The complete 84-patch core stack replays successfully.
`bun run build all` passes for all four targets, including Checkstyle.
Core reports 387 tests with no failures or errors and one optional fixture skip.
The add-on reports 519 tests with no failures or errors and 109 optional fixture skips.
Cartography screens, authoritative result metadata, and full native crafting comparisons remain incomplete.


## Native authored count-one packets

The current codecs match two retained Social-menu request/response pairs from native Bedrock 1.26.51.1, protocol 2193.
A private probe encodes both requests through the current request-array and action codecs.
Each complete 27-byte packet matches its original native recording byte for byte.
The current response-array codec also decodes and re-encodes both 18-byte success responses without changes.

A separate parser checks the extracted packets against the original protocol-2193 journal.
Both native flows receive a cursor-only success, then a form, before the client closes its container.
The packet captures and comparison harness remain private.
These two complete examples establish selected native serialization behavior; other action variants retain their own verification requirements.

## Shared native stack counts (October 22, 2026)

Both network item codecs now clamp their signed-short count before unsigned-byte narrowing.
For example, packet count 32769 previously became one item. It now becomes zero.
Positive counts retain native byte wrapping, including 256 becoming zero and 257 becoming one.
Counts 128 through 255 remain nonempty. Their existing presence correction now belongs to this shared codec foundation.
CraftingData results use a separate descriptor adapter, with its own count conversion in the recipe patch.

The byte-buffer regression fails before the correction and passes afterward.
Both codecs match 264 fresh target-native constructor executions.
The cases cover four Item IDs, eleven counts, two runtime-block paths, and three association modes.
The fixture executes the parsed ItemStack constructor, numeric lookup, palette lookup, association handling, descriptor conversion, and destruction.
It supplies parsed headers, captured registry tables, palette storage, warm auxiliary caches, allocator/CRT/TLS/locks, and an empty user-data load boundary.
Raw binary reading, actual built-in and archetype construction, cold auxiliary registration, transfer behavior, and UI remain outside this comparison.

Separate fresh probes retain 2,250 constructor cases and 3,600 subsequent recipe-matcher cases.
These references guide the remaining production Item construction work.
They do not establish complete native inventory or cooking integration.

All 102 core patches replay, and all four projects build.
The final suites pass 2,299 tests with 152 optional skips. New native-reference comparisons run without skips.
Tooling checks, 264 regressions, and metadata checks pass.
A fresh ViaProxy run passes all six workstation/chest controls and same-world reconnect.
Both client profiles match all 1,360 rebuilt core classes. The private display stops normally.
These live controls use valid counts. Malformed-count coverage comes from the byte-buffer and native-constructor tests.


## Native CraftingData descriptor maps (October 25, 2026)

CraftingData ingredients contain a string map, auxiliary value and stack size.
The map prefers `tags`, then `name`, then `item_tag`, independently of entry order.
Duplicate keys keep their last value. Unknown keys do not prevent later fields from decoding.
A map with no recognized key becomes an empty descriptor.

Molang expressions use `tags` and the packet context's fixed version 13.
The previous codec expected `molang` and a transmitted version, which misread the native layout.
The writer rejects model versions that this packet context cannot represent.
StackRequest descriptors retain their separate format.

The decoder and writer enforce ingredient counts from zero through 64.
Native reads accept zero, one and 64; they reject negative one, 65 and 300.
The earlier typed constructor controls did not establish these wire bounds.

Twenty-three complete native packet controls cover empty packets, descriptor maps, duplicate precedence and count limits.
Twenty controls decode successfully; three reject invalid counts.
All execute original schema, binary parsing, descriptor conversion, packet and static cleanup.
Rejected reads also execute original error-tree cleanup.
The actual default metadata CRT initializer and destructor close their shared context.
No native allocations or held locks remain.

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Only valid read-only byte I/O and standard CRT, heap and synchronization services are hosted.
Stream and registry backing remain declared inputs. Result vectors are empty.
These controls do not establish physical network delivery, concrete recipe admission or installed inventory behavior.

All 106 ViaBedrock patches replay after this change.
The four-project build passes 2,945 tests, with 161 optional skips and no failures or errors.
ViaBedrock passes 1,814 tests, including eight descriptor codec checks. Repository offline validation and patch metadata checks pass.

The packaged core passes those eight codec checks and all 23 native packet comparisons.
Successful packets consume all bytes. Invalid counts reject at the same byte position as the native loader.
The preceding core fails five codec checks and differs on 18 packet comparisons.
The packet comparisons use the production reader with a declared connection and the production empty result-array codec.
They do not decode output items or admit recipes.

All 1,523 core classes match both embedded copies.
Compared with the preceding core, 1,518 classes and all 198 assets remain byte-identical.
Only the descriptor codec, its compiler switch class and three build-identity classes change.
The switch class retains identical declarations and instructions.
No new installed inventory capture ran for this change.
