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


## Native tags and kinetic timing

The animation context also carries compiled item tags, swing ticks, and four kinetic-weapon timing values. It uses `viabedrock:item_animation` in standard custom data. The parser copies tags into an immutable list and removes stale context when a definition has none.

Bedrock 1.26.51.1 sends the spear's delay and condition durations as NBT shorts. Delay preserves unsigned bits; condition durations preserve signed values. The network component has a second `minecraft:kinetic_weapon` wrapper. Missing conditions produce zero. Swing duration comes from authored seconds and is converted to ticks before the client query returns seconds.

The matching native callbacks are `141cecf30`, `141ced0a0`, `141ced220`, `141ced3a0`, and `141cef920`. Independent execution covers 112 kinetic cases and 12 swing cases. It supplies item objects, virtual getters, component lookup, actor category, and thread-local setup. The native callbacks execute their optional-condition checks, unsigned delay reads, signed duration reads, and float conversion. Native tag callback `14221ca30` passes 32 slot, argument, and tag cases. Its harness supplies the slot registry, tag hashes, expression values, and item storage. These checks do not prove every component constructor or malformed input path.

The [Creator kinetic-weapon reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_kinetic_weapon?view=minecraft-bedrock-stable) documents tick units. The [Creator query reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions?view=minecraft-bedrock-stable) describes main-hand kinetic queries and equipped tag matching. The target player definition uses these queries in its spear hold, use, and attack tracks.

All four build targets and the Prism bundle pass. Core passes 385 tests with no failures or skips. Tests cover copied metadata, optional conditions, both NBT widths, signed and unsigned boundaries, invalid swing values, and immutable tags. The add-on reports 482 tests, no failures, and 96 optional fixture skips. Native kinetic, swing, tag, item-name, and duration query fixtures are enabled.

A rebuilt Java 26.3 client through ViaProxy receives the real spear's tag, delay 15, condition durations 300/200/100, and 13 swing ticks. Production queries return these values. The licensed player graph, sampled with those production queries and controlled use ticks, produces right-arm X rotations of -30, -62, and -30 degrees for hold, use, and release. This verifies graph activation and query binding. It does not establish visible native motion or complete attack timing parity.


## Original decoded item snapshots

The same standard custom data now carries `viabedrock:item_stack` with schema version 2.
Core captures this immutable context before Java mapping and NBT rewriting.
It retains native item identity, auxiliary data, block runtime identity, shield blocking ticks, ordered restrictions, and typed original user data.
Absent user data remains distinct from an empty compound.
Count stays in the current Java stack, and inventory network IDs stay in the inventory tracker.

Version two preserves declared element types for empty user-data lists.
ViaNBT serialization and Java 26.3 `NbtIo` discard those declarations.
Segmented paths and type IDs travel beside the original compound and restore its types on an independent copy.
Compound keys remain literal, including numeric keys and slashes.
List indices use canonical decimal notation.
The parser rejects unknown versions, incorrect widths, invalid paths, conflicting types, and duplicate targets.

Lists and compounds remain independent from source items, encoded tags, and returned accessor values.
The snapshot represents decoded values after the existing codec's normalization.
It does not replace raw packet capture or inventory validation.

Bedrock 1.26.51.1 build 51061372 reads these inputs in its retained-hand classifiers.
The [classifier research](../../../docs/bedrock-coverage.md#native-item-classification-research) records the versioned evidence and remaining gaps.
Java component equality cannot reconstruct these inputs after translation.
This patch supplies their transport contract without claiming native classification.

Six focused tests cover typed NBT, ownership, absent compounds, count and network-ID separation, schema versions, and malformed data.
They also cover empty typed lists inside compounds and lists, untyped empty lists, and invalid restoration metadata.

An independent byte fixture verifies type loss through both ViaNBT and the actual Minecraft 26.3 codec.
Instruction probes execute 504 comparison cases in the matching native binary.
Native list equality compares declared types even when empty.
Float and double equality equate signed zero and reject NaNs, including shared references.
These probes establish transport requirements, without implementing native item classification.

Direct and ViaProxy clients each preserve nine authored inventory cases through the production decoder, translator, and Minecraft item stack.
They cover typed nested NBT, restriction ordering and duplicates, shield timestamp bits, map identifier widths, auxiliary data, and block runtime identity.
Each route restores four typed empty lists and preserves one untyped empty list.
They include nested compound keys and empty lists inside another list.
These additional packets enter after the private scene recorder and have separate byte receipts and expected fields.
Both routes independently preserve the complete recorded 75-second scene prefix.

Dependency builds and final Java suites pass 1,031 tests, with 115 optional skips and no failures or errors.
All 90 core patches replay successfully.
Native item-specific classifiers, restriction hashes, derived auxiliary data, charged-item construction, and complete visible timing remain incomplete or unverified.
Snapshot overhead remains unmeasured.
The [coverage ledger](../../../docs/bedrock-coverage.md#original-bedrock-item-comparison-data) records the complete evidence and limits.


### Native NBT and full-stack comparison research

**Verified research:** Additional probes execute Bedrock 1.26.51.1, build 51061372, using the corrected PE loader.
The native NBT comparators pass 3,486 cases covering all eleven value types, strings, arrays, compounds, lists, and type mismatches.
The earlier 504 float and list cases also pass with zero-filled virtual section tails.

String equality compares lengths and bytes, including embedded zero bytes.
Small and heap-backed strings produce the same comparison result.
Byte and integer arrays compare their byte lengths and contents.
Compound equality compares key membership and typed child values, independently of tree shape or key storage.
A shared compound containing NaN still compares unequal to itself.
Signed zero compares equally, and empty lists retain their declared type distinction.

Another 784 cases execute native user-data comparison, full-stack comparison, and the default item classifier together.
For these valid ordinary stacks, absent user data and an empty compound compare equally.
Changed user data requests an immediate update when the default relevant-data comparison accepts the items.
Equal user data with equal counts retains the item unless the selected slot changes.
A selected-slot change requests animation.
These fixtures supply the default relevant-data callback and do not establish dispatch for every item.

The full-stack comparator passes another 11,833 cases: 11,664 parent-field combinations and 169 charged-stack combinations.
Raw auxiliary value `32767` acts as a wildcard on either side.
Block comparison is asymmetric: a present left block requires the same right block, while an absent left block imposes no block check.
The comparator requires equal restriction hashes and blocking ticks.
For present charged stacks, it compares count and recursively compares the nested stack.
Invalid or physically empty charged stacks follow the absent-stack branch.
These fixtures directly construct charged fields and supply restriction hashes.
They do not execute charged-item loading, resolve restrictions, or establish their wire-to-object construction.

| Native probe | Cases | Supplied boundaries |
| --- | --- | --- |
| NBT value comparison | 3,486 | Synthetic tag objects, string allocation, compound trees, and CRT byte comparison |
| Earlier float/list comparison | 504 | Synthetic values and list storage |
| User data through default classification | 784 | Valid ordinary stacks, inventory context, and default relevant-data callback |
| Remaining full-stack fields | 11,833 | Block identities, derived restriction hashes, and charged-stack fields |

All comparison, type-check, lookup, and recursive native instructions execute in these probes.
The CRT boundary supplies standard byte comparison; it does not replace tag equality or compound lookup.
Raw executables, memory layouts, generated inputs, and emulator programs remain private.

**Incomplete:** These results verify comparison rules, not production classifier integration or complete native object construction.
Restriction resolution, charged-item loading, item-specific dispatch, selected-slot lifetime, and final held-item pixels still require implementation and verification.


### Native restriction and charged-item construction research

**Verified research:** New probes execute the matching Bedrock 1.26.51.1 executable, build 51061372.
They retain the corrected PE loader and actual native tag comparison routines.
Together, 1,371 cases cover restriction processing, charged-item loading, and the selected default method after loading.

The restriction helper adds `minecraft:` only when the input contains no colon.
It preserves the supplied bytes otherwise.
Its hashed-string constructor retains the string length but hashes bytes only before the first zero byte.

The append helper deduplicates resolved block pointers.
An expansion stops at its first unresolved member and retains the earlier appended members.
The surrounding caller can continue with later restriction entries.
These probes supply registry membership, expansion, and block lookup answers.
They do not establish the registry's real tag, alias, or case rules.

The native sort orders block pointers by unsigned name hash, then name bytes and length.
It does not order them by pointer address.
The hash helper then combines hashes of the pointer bytes in that order.
It preserves duplicate inputs supplied directly to that helper.
The earlier append helper removes repeated resolved pointers before this stage.
Tests cover independent restriction vectors, permutations, equal hashes, duplicate inputs, and vectors of up to 512 entries.

The charged-item setter transfers the outer user-data compound and reads its `chargedItem` compound.
The saved-tag loader reads `Damage` as Short and `Count` as Byte.
Other tested numeric tag types produce the missing-field defaults.
Negative saved auxiliary values clamp to zero.
Count preserves all eight bits.

For the selected non-durable path, wildcard auxiliary value `32767` becomes zero after the item method runs.
An unresolved saved name produces an empty charged stack in these registry fixtures.
Native copies and destructors balance the tested item and registry reference counts.

The selected default item method reads maximum damage as a signed short.
For a positive result and an absent `Damage` key, it creates an Int tag from the signed effective auxiliary value.
It preserves other user-data keys and clears raw auxiliary data.
An existing `Damage` key prevents that migration, including each of the eleven tested value types.
The charged-stack probe also executes the migration, native compound copies, and destruction with the resulting user data.
These synthetic definitions do not establish maximum damage or method dispatch for the real item catalog.

| Native probe | Cases | Supplied boundaries |
| --- | --- | --- |
| Restriction sort and hash | 668 | Synthetic block names, pointers, and CRT byte operations |
| Restriction processing caller | 252 | Registry answers, allocations, and CRT operations |
| Charged saved-tag loader and copies | 144 | Item registry, maximum-damage field, allocations, TLS, and CRT operations |
| Default method after loading | 307 | Maximum-damage field, allocations, registry context, and CRT operations |

Native instruction execution includes normalization, pointer deduplication, expansion control, tag lookup, compound allocation, Int-tag insertion, copies, and tested destructor paths.
Registry answers and allocator behavior remain supplied rather than reconstructed from the native game catalog.
The probes retain raw executable bytes, object layouts, generated fixtures, and emulator programs privately.

**Incomplete:** Production still transports decoded wire snapshots and uses Java hand-item classification.
Real registry resolution, legacy saved IDs, full saved-tag construction, item-specific loading methods, dispatch, renderer lifetime, and final pixels remain incomplete or unverified.
The saved-tag findings do not establish normalization for every inbound network item.
These results narrow the production design.
They do not claim a completed native classifier.

### Native registry dispatch and Education-item loading research

**Verified research:** A live Bedrock 1.26.51.1 client reached the CubeCraft lobby with its resource packs loaded.
The selected registry contained 2,621 distinct item names, internal IDs, and item objects.
Of these definitions, 545 had server-defined namespaces.
The numeric and name tables each contained those 2,621 definitions.
The other two inspected name-lookup tables were empty in this snapshot.

The live numeric lookup, name lookup, registry wrapper, default classifier, and hand-tick code matched the inspected executable bytes.
This comparison covered five selected code ranges in build 51061372.
It did not compare the complete running image.
Raw registry data, component trees, screenshots, and executable bytes remain private.

| Captured virtual method | Definitions | Selected behavior |
| --- | --- | --- |
| Hand-swap classifier | 2,620 default, 1 shield | The shield uses its specialized classifier |
| Relevant-metadata predicate | 2,619 default, 1 filled map, 1 firework star | Map and firework-star predicates retain their existing specialized paths |
| Method after loading | 2,449 default, 172 specialized | Six specialized methods cover Education items, leaves, decorated pots, and banners |
| Maximum-damage getter | 2,097 field, 524 component | Component definitions resolve the `minecraft:durability` entry |

The specialized loading methods cover 119 element items and 46 other Education items.
Glow sticks and sparklers share another method.
Three leaf items, decorated pots, and banners account for the remaining five definitions.
These counts describe this initialized registry, including its server definitions.
They do not establish dispatch for every possible server or registry configuration.

**Verified numeric lookup:** The actual native lookup passed 65,546 inputs against a reconstructed table of the captured internal IDs.
The probe covered every 16-bit input and ten additional truncation boundaries.
Lookup interprets the low 16 bits as a signed ID and rejects zero and minus one.
Resolved weak references gained exactly one tested reference.
The hash table, weak cells, TLS, and empty fallback were initialized by the probe.
Bedrock network item IDs require a separate mapping.

**Verified maximum damage:** Both native getter methods passed for all 2,621 captured definitions.
The component cases used 524 captured object trees and executed the native component lookup.
The field cases used 2,097 captured maximum-damage fields.
Seventeen component definitions had nonzero maximum damage in this snapshot.
TLS initialization guards and CRT operations were supplied.
Complete registry construction and lifecycle verification remain open.

**Verified Education loading:** The native glow-stick and sparkler method passed 66,256 cases.
Tests covered every raw auxiliary bit pattern, block-derived auxiliary values, all eleven existing `Damage` types, and preservation of other user-data keys.
An existing `Damage` key skips the migration.
Otherwise, the method writes Int `Damage` from bits 6 through 12 of the effective auxiliary value.
It retains auxiliary bits selected by `0xe03f`, then clamps a nonpositive signed result to zero.
This method differs from the previously tested default durability migration.

The Education probe executed native lookup, compound allocation, Int-tag insertion, and comparison.
Allocator, CRT, and registry boundaries remained supplied.
The 134,423 new instruction-execution cases exclude the live dispatch inventory and selected code-range comparisons.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Native name remapping, restriction registry resolution, complete specialized construction, complete saved-tag construction, and renderer lifetime remain incomplete or unverified.
These results establish broader dispatch evidence and additional construction rules.
They do not establish complete network-item normalization, visible timing, or first-person parity.


### Specialized native item-loading research

**Verified research:** Five additional probes executed specialized methods from Bedrock 1.26.51.1, build 51061372.
They passed 77,324 cases across banners, decorated pots, leaf states, the Education gate, and legacy element dispatch.
These probes cover the remaining specialized methods in the captured registry.
They do not complete native registry construction or network-item normalization.
Executable bytes, object data, emulation programs, and reference outputs remain private.

| Native method | Passing cases | Verified behavior |
| --- | --- | --- |
| Banner loading | 192 | Absent or empty user data becomes Int `Type:0`; nonempty user data remains unchanged |
| Decorated-pot loading | 1,682 | The first four `sherds` entries determine whether the key remains |
| Education gate | 256 | Disabled chemistry invalidates the stack and releases its item and user data |
| Leaf loading | 8,306 | Clear `update_bit`, then `persistent_bit`, with native state selection and fallback |
| Legacy element dispatch | 66,888 | Effective auxiliary bits select remapping or invalidation before the Education gate |

**Banners:** The method inserts Int `Type:0`, rather than a `Base` tag.
Any nonempty compound skips insertion, even when `Type` is missing or has another tag type.
The probe executed compound creation, Int insertion, ownership transfer, and typed comparison.
It covered absent and empty compounds, all eleven existing tag types, and auxiliary boundaries.

**Decorated pots:** A typed list supplies up to four string entries.
Missing entries and entries with another tag type act as empty strings.
If all four strings are empty or exactly `minecraft:brick`, native tree removal deletes the `sherds` key.
Later list entries do not affect this decision.
A non-list `sherds` value remains unchanged.
Other keys, the allocated compound, and auxiliary bits remain unchanged.

The pot probe executed the native list reader, predicate, tree removal, and child destruction.
A selected native initializer fragment supplied the `minecraft:brick` string.
Fixtures used valid small trees and covered list lengths, types, string boundaries, storage forms, and preservation of other data.

**Education gate:** The actual context acquisition, gate, invalidation, and release methods balanced the tested references.
Bit zero of the supplied chemistry flag controls admission.
Enabled chemistry preserves the complete stack in these cases.
Disabled chemistry clears the item reference, user data, count, and auxiliary value.
Context objects and mutex operations remained supplied.

**Leaves:** Native initializer fragments identify the first property as `update_bit` and the second as `persistent_bit`.
An enabled static property clears its mask from the block's auxiliary value before lookup in the state vector.
An absent or invalid vector entry retains the current block.
A missing static property can use a dynamic resolver, then the legacy default when its fallback flag permits it.
A disabled static property retains the current block without that fallback.
The second pass uses the block and legacy definition selected by the first.

The leaf probe covered both passes, their composition, masks, bounds, empty candidates, duplicate dynamic entries, and absent blocks.
Only the block pointer changed in the tested stack snapshots.
Property names and IDs came from native initializer fragments.
Registry definitions, state vectors, and dynamic resolver answers remained supplied.

**Elements:** The method selects block-derived auxiliary bits except for the raw wildcard value or an absent block.
For a matching legacy identity and nonzero effective value, the low byte must be below 119.
The low seven bits then select a nonempty element-table entry.
Valid entries dispatch the selected block and original count to the stack constructor; invalid entries invalidate the stack.
The Education gate follows either path.

The element probe covered all 65,536 raw auxiliary values and 1,352 additional block, identity, count, and chemistry combinations.
It executed dispatch, the chemistry gate, invalidation, context release, and item-reference cleanup.
Legacy identities, element definitions, and the block-construction callback remained supplied.
It did not execute complete block-to-item construction.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Complete network construction, block-to-item construction, native name remapping, restriction registry resolution, and renderer lifetime remain incomplete or unverified.
Allocator, CRT, TLS, and registry boundaries remained supplied where the probes required them.
These results establish construction rules at specific boundaries, not complete first-person behavior or visible parity.
