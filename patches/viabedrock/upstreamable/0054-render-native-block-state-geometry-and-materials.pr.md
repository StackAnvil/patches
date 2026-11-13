# feat(blocks): render Bedrock state geometry and materials

## Purpose

Resolve custom block properties and ordered permutations after StartGame, including per-face textures, geometry, transforms, shapes and lighting. Reserve free note-block and redstone-wire states deterministically and deduplicate identical visual and physical definitions. Preserve the original vanilla mapping when a definition or a required custom texture cannot be represented.

## Design constraints

Resolve ordered permutations and preserve original native block identities. Assign deterministic Java carriers only for representable states. Keep physical properties, culling, lighting, and supplemental-pack admission with their authoritative owner.

Resolve physical collision separately from visual compilation and Java pack acceptance. Native base-factory registrations retain collision planes, transforms, random offsets, and default friction. Known native classes keep their own providers. Missing physical data remains distinct from an empty shape.

Reuse decoded terrain images and alpha summaries within each compilation or conversion pass. Release these caches after the pass. Shared PNG resources use content hashes, while models retain their material flags and particle references. Bulk raster rows preserve the existing alpha thresholds. The custom-visual cache identity excludes older packs that contain a separate texture copy for each carrier.

Build the block-state rewriter on the bounded resource pack workers once Java has loaded the server pack. A holding buffer queues every later clientbound packet in arrival order while the worker runs. The result publishes on the event loop only for the same active connection, buffer and accepted storage. After publication, pre-play packets resume in order and world packets wait for the supplemental pack. A full worker queue fails the join through the existing error path; the event loop never builds the rewriter. The accepted base pack stays loaded while a separate supplement supplies only resolved block models, textures, block-state selectors and physical/culling metadata. The base no longer exports speculative terrain carrier models before StartGame. UI aliases, accepted native assets and appearance provenance stay in the base. A destination base still removes every earlier server pack, including its supplement. Conversion identity versions both forms so an older complete pack cannot be appended as a supplement. The block-only conversion preserves accepted-base converter metadata. This removes the temporary native-archive stage cache and its extra copies.

Serialize culling directions in enum order so equivalent states retain the same disk-cache identity across JVMs. Include canonical texture bindings and pixel-method definitions in the supplemental fingerprint; two runtime dictionaries that select different pixels must not share a cached pack. Regressions cover both boundaries and insertion-order independence.

## Validation and remaining limits

The final four-project build passes 3,995 tests with 336 optional skips, Checkstyle and no failures. Tooling, offline regressions and patch metadata checks pass. The two stale-publication regressions fail against the preceding callback and pass with accepted-storage ownership checks.

Three cold Galaxite recordings per build with runtime caches disabled count 3.39 to 3.71 seconds across all recorded backend windows, versus 3.76 to 4.03 seconds for the preceding build. The final guarded build records 3.71 seconds versus 4.03 seconds in its paired control. One CubeCraft pair records 3.79 versus 4.12 seconds; one Lifeboat pair records 2.68 versus 2.81 seconds. The supplement conversion, including ZIP output, takes 0.32 to 0.45 seconds on Galaxite, versus 0.66 to 0.82 seconds for a complete replacement. Its ZIP is 2.48 MB instead of about 111 MB. CubeCraft and Lifeboat supplements are about 0.91 MB and 0.09 MB instead of about 81 MB and 65 MB. These small samples do not establish a statistical speedup or meet the 2-second cold target.

The first twelve recordings use the frozen measurement build. The final pair adds accepted-storage publication guards and removes unused texture wrappers; the converter path is unchanged. Final live probes load all 2,220 physical and culling definitions from the supplement while UI aliases and the native archive come from the retained base. The served block metadata hash matches the converted file.

The metric merges every recorded backend method span from the first journal packet through first gameplay input. Nested and parallel work counts once. It includes actor/model setup and join callbacks omitted from older main-stage totals. Uninstrumented work and spans below 1 ms remain outside the metric. Startup prewarming is recorded separately. Captured packet pacing prevents using these totals as exact added join latency or a native-client latency difference.

The candidate records 2.48 seconds with populated disk caches and 1.60 seconds on a same-JVM reconnect. Those joins skip converters, native archive encoding and ZIP packaging. A two-core affinity control records 13.20 seconds versus 15.03 seconds for the preceding build. It limits parallel capacity and increases software-rendering/JIT contention on the same host; no slower physical CPU was tested. Block-state samples still place the largest cost in visual model compilation. No broader compiler cache or parallel compilation change is included.

Base-plus-supplement comparisons retain every logical UI image byte, custom model, carrier selector, physical/culling value and accepted native archive byte in the three fixtures. Galaxite covers 10,318 UI images and 2,220 custom models; CubeCraft covers 10,262 and 630; Lifeboat covers 8,778 and 50. JSON object order and unordered culling direction sets are normalized. General converted actor/item geometry is outside this output comparison. Live transport, UI alias and outbound codec checks pass across the recorded conditions. Existing unresolved mappings still fail broad rendering verification, so these checks do not establish complete native appearance.

Regression coverage includes `BlockItemDescriptorsTest`, `BlockItemStatesTest`, `BlockRegistryNamesTest`, `RuntimeBlockPaletteTest`, and `VanillaBlockStatesTest`.

`KeepAliveTaskTest` covers configuration acknowledgments, a transition after task scheduling, and clients without a configuration phase.
Synthetic keepalives wait for the direct client's outbound protocol to become ready during supplemental-pack reconfiguration.
The focused test passes. Installed Lifeboat testing passes without the outbound-protocol exception.

Official Bedrock 1.26.60.5 captures identify 98 vanilla block types that require server definitions in `StartGame`.
BDS advertises these types; Lifeboat omits them. All 22,543 shared native state IDs match after excluding their 1,417 unadvertised states.
The palette now follows that registration boundary. Installed add-on and ViaProxy tests spawn in air and walk through the rendered lobby.
The authored Navigator opens on both routes. Full native appearance remains unverified.

Upstream [ViaBedrock #472](https://github.com/ViaVersionAddons/ViaBedrock/pull/472) now supplies the NBT asset and loads its registry once.
The palette filter reads that mapping registry and retains the native registration checks.

The registration names now come directly from the unmodified [CloudburstMC/Data NBT snapshot](https://github.com/CloudburstMC/Data/blob/0021592b1a4253528bad1e1d8b537e306e097557/data_driven_blocks.nbt).
Its 98 root keys exactly match the captured list. The JSON copy and conversion step are unnecessary.
`Data Asset Sources.md` records the source revision, checksum, license, and update procedure.
Palette regressions read the bundled definitions and retain the native BDS and Lifeboat state IDs.
A fresh full-stack replay and the four-project build pass.
Core, add-on, and proxy packages retain the original NBT bytes and its license.

Shape, state, culling, and conversion tests cover supported definitions. Carrier capacity, unsupported materials, and complete native appearance remain limits.

Camera bounds combine local component boxes before translating them with native float arithmetic. Retain flat bounds through metadata and cache identity; camera queries discard volumes that collapse after world translation.

Collision components require the native Byte enabled flag and Float coordinates. Missing or differently typed values decode to false and zero. Endpoints clamp to 16 pixels horizontally and 24 vertically; an enabled empty list supplies a full block.

Selection components require a Byte enabled flag and Float origin/size lists. Clamp all axes to one block, reflect X using the native rounded center and half extent, and retain flat bounds before transformation. Missing list entries decode to zero; malformed descriptions without both lists do not gain a full-block selection shape.

Physical transformations require integer quarter turns and Float scale, translation, and pivot fields. Preserve the native missing-field defaults, quaternion reconstruction, matrix products, and paired AABB sums. Keep this path separate from model vertices. A missing physical component retains its Legacy fallback bounds.

Compiled converter and metadata controls match original 1.26.60.5 decoding, typed component application, Block finalization, and primary bounds. They include all quarter-turn combinations and mixed scales, pivots, and translations. Component storage, tag IDs, empty property maps, unrelated cache values, and libc boundaries remain supplied inputs. Installed software-rendered BDS controls cover the transformed collision and selection metadata on direct and ViaProxy routes, including resource reload and dimension return. Full native world publication, other shape providers, native picking and movement trajectories, and visual transformation parity remain open.

The independent physical decoder and version-7 dictionary match nine original native description chains and all 36 primary-bound queries.
Registration regressions retain geometry through pack refusal and unavailable visuals while leaving recognized nonbase classes unresolved.
Installed direct and ViaProxy controls preserve the same bounds without visual definitions across state changes, resource reload, and dimension return.

Hardcoded primary geometry covers 1,051 registered types: 203 empty providers, 710 fixed providers, and 138 slab providers.
Fixed providers use their finalized collision component before the Legacy fallback. This preserves the lectern's 0.9-block height and the rounded chest and egg bounds.
Empty providers ignore collision and offset components. Slabs retain their decoded half behavior.
Other classes retain their existing fallback. Physical metadata remains independent of visual models and pack acceptance.

Original static initialization, main registration, and state enumeration produce all 1,382 built-in types and 22,543 states.
All ordinary state hashes match the pinned palette. The `unknown` entry still differs from the pinned fallback ID and remains outside ID-parity claims.
Corrected shared constants, finalized caches, and original primary/friction queries establish the fixed and empty profiles.
The observed feature bit affects two unsupported classes and leaves these providers unchanged.

The compiled provider matches 34,530 original bounds queries across 8,495 states after metadata encoding and decoding.
Installed direct and ViaProxy controls cover all 18 fixed profiles, representative empty states, an inherited slab, and an unresolved fence.
These controls retain the bounds through swaps, resource reload, and dimension return. Full core, add-on, and proxy builds pass.
Other shape providers, loaded native world publication, full camera trajectories, and mounted movement parity remain unverified.

`BlockStatePreparationTest`, `WorldPacketBufferTest`, `CustomBlockPackPublicationTest` and `JavaResourcePackLifecycleTest` cover queue rejection, stale successes and failures after accepted-storage replacement, held packet order, destination stack replacement and keeping the accepted base for a supplement. `CustomBlockTextureReuseTest` verifies that the supplement exports block resources without replacing UI aliases or native archives, preserves converter metadata, and retains shared sprite pixels and material flags.

An immutable visual cache retains compiled models and logical carrier assignments. Runtime palettes, physics and connection mappings remain local. Keys include the protocol, accepted resources, typed block definitions, available carriers and the server voxel grids. Grid identity includes dimensions, cell data, coordinate boundaries and sorted name handles. Advancing the cache format prevents reuse of older incomplete keys. A reopened-disk regression changes cells, coordinates and name handles independently and checks the resulting culling slices. It reproduces stale slices with the previous cache class and passes with the corrected identity. Live upgrade, reconnect and fresh-process cache controls pass. The cache retains at most eight entries, 32 MiB in memory and 128 MiB on disk. Checksummed entries fail closed to compilation. The cache requires viabedrock/0001-cache-converted-resource-packs.patch.

The keepalive task also checks native outbound codec readiness on the event loop. The add-on reports the temporary configuration encoder as unavailable. A regression covers this transition without publishing a packet through an unconfigured codec.

Cold compilation also reuses each accepted geometry within one preparation pass. Each state receives a copy before material binding, transforms and culling. The compiler belongs to that pass and retains no connection state afterward. A regression alternates carriers, materials and transforms on one geometry and checks independent output.

The [owning patch](0054-render-native-block-state-geometry-and-materials.patch) retains implementation rationale and versioned evidence.

## Native material shading

Protocol 2225 materials carry face dimming in bit 0 of `packed_bools`; the explicit `face_dimming` field remains supported. The emitter applies `clamp(directional * powf(AO, exponent), 0, 1)`, and the shared dimming rule weights a continuous normal by the coefficient for each component's sign. Inset faces use the native per-vertex sampler: biased-centroid cache cell, dependency and skip masks, center weight 1.331558, radius 1.5 and `1 / (d² + 0.001)` weights.

Regressions use original Bedrock 1.26.60.5 results: emitter cases for exponents 0, 1 and 2, axis and 30-degree tilted dimming factors, serialized `packed_bools` 4 and 5, and the live-captured inset neighborhood. That neighborhood reproduces the native AO values 0.8888823, 0.7967659, 0.7549734 and 0.8560161 bit for bit, with block light 14 on all four vertices. Outer-plane faces keep the corner path. Registered screenshot parity, Java runtime light propagation and other render modes are not established.
