# feat(blocks): render Bedrock state geometry and materials

## Purpose

Resolve custom block properties and ordered permutations after StartGame, including per-face textures, geometry, transforms, shapes and lighting. Reserve free note-block and redstone-wire states deterministically and deduplicate identical visual and physical definitions. Preserve the original vanilla mapping when a definition or a required custom texture cannot be represented.

## Design constraints

Resolve ordered permutations and preserve original native block identities. Assign deterministic Java carriers only for representable states. Keep physical properties, culling, lighting, and supplemental-pack admission with their authoritative owner.

Resolve physical collision separately from visual compilation and Java pack acceptance. Native base-factory registrations retain collision planes, transforms, random offsets, and default friction. Known native classes keep their own providers. Missing physical data remains distinct from an empty shape.

Reuse decoded terrain images and alpha summaries within each compilation or conversion pass. Release these caches after the pass. Shared PNG resources use content hashes, while models retain their material flags and particle references. Bulk raster rows preserve the existing alpha thresholds. The custom-visual cache identity excludes older packs that contain a separate texture copy for each carrier.

Build the block-state rewriter on the bounded resource pack workers once Java has loaded the server pack. A holding buffer queues every later clientbound packet in arrival order while the worker runs. The result publishes on the event loop only for the same active connection, buffer and accepted storage. After publication, pre-play packets resume in order and world packets wait for the supplemental pack. A full worker queue fails the join through the existing error path; the event loop never builds the rewriter. The supplemental conversion reuses the native resource archive from the first conversion through a per-storage stage cache with a shared 128 MiB budget.

Serialize culling directions in enum order so equivalent states retain the same disk-cache identity across JVMs. Include canonical texture bindings and pixel-method definitions in the supplemental fingerprint; two runtime dictionaries that select different pixels must not share a cached pack. Regressions cover both boundaries and insertion-order independence.

## Validation and remaining limits

The four-project build passes 3,968 tests with 336 optional skips and no failures. Four new regressions cover image reuse, pack precedence, material pixels and shared sprite references.

An earlier paired cold Galaxite replay reduced block-state setup from 4.44 seconds to 1.04 seconds. The following conversion, including ZIP output, falls from 5.07 seconds to 1.11 seconds. Its texture worker falls from 4.49 seconds to 0.49 seconds. These are measured StackAnvil stages, not a predicted live join duration. The replay preserves recorded packet timing and chunk reply gates.

The final pack retains all 2,220 carrier models with the same geometry, material flags, particle pixels and physical metadata. The comparison resolves sprite references to PNG byte hashes and treats culling direction sets as unordered. Shared texture output uses 173 PNGs instead of 2,220 copies. Both replays pass complete-payload transport checks. Existing unresolved mappings still fail rendering verification, so this comparison does not establish complete native appearance.

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

`BlockStatePreparationTest`, `WorldPacketBufferTest` and `ResourcePackStageCacheTest` cover queue rejection, stale publication, held packet order, isolated stage outputs and budget eviction.

An immutable visual cache retains compiled models and logical carrier assignments. Runtime palettes, physics and connection mappings remain local. Keys include the protocol, accepted resources, typed block definitions and available carriers. The cache retains at most eight entries, 32 MiB in memory and 128 MiB on disk. Checksummed entries fail closed to compilation. The cache requires viabedrock/0001-cache-converted-resource-packs.patch.

The keepalive task also checks native outbound codec readiness on the event loop. The add-on reports the temporary configuration encoder as unavailable. A regression covers this transition without publishing a packet through an unconfigured codec.

The final cold Galaxite recordings build block states on a worker in 0.74 and 0.86 seconds. A fresh JVM with a populated disk cache takes 0.57 seconds, and a same-JVM reconnect takes 0.29 seconds. The cached cases skip both conversions. Two cold recordings count 3.53 and 3.92 seconds of overlapping processing windows once, against the previous build's single 4.51-second recording. The 2-second cold target remains open. These totals exclude gaps, vanilla reloads and bundle startup work. They do not measure a native-client latency difference. The comparison includes main's native-lighting correction.

Cold compilation also reuses each accepted geometry within one preparation pass. Each state receives a copy before material binding, transforms and culling. The compiler belongs to that pass and retains no connection state afterward. A regression alternates carriers, materials and transforms on one geometry and checks independent output.

The full four-project build passes 3,991 tests with 336 optional skips. Final transport, UI alias and outbound codec probes pass. All 2,220 custom models, physical metadata and culling metadata match the previous build. JSON object order and unordered direction sets are normalized. Existing unresolved mappings still fail broad rendering checks.

The [owning patch](0054-render-native-block-state-geometry-and-materials.patch) retains implementation rationale and versioned evidence.
