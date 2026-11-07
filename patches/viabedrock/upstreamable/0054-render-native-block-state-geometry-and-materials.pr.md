# feat(blocks): render Bedrock state geometry and materials

## Purpose

Resolve custom block properties and ordered permutations after StartGame, including per-face textures, geometry, transforms, shapes and lighting. Reserve free note-block and redstone-wire states deterministically and deduplicate identical visual and physical definitions. Preserve the original vanilla mapping when a definition or a required custom texture cannot be represented.

## Design constraints

Resolve ordered permutations and preserve original native block identities. Assign deterministic Java carriers only for representable states. Keep physical properties, culling, lighting, and supplemental-pack admission with their authoritative owner.

Resolve physical collision separately from visual compilation and Java pack acceptance. Native base-factory registrations retain collision planes, transforms, random offsets, and default friction. Known native classes keep their own providers. Missing physical data remains distinct from an empty shape.

## Validation and remaining limits

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

Hardcoded slab geometry follows the exact target registration family. Ordinary slabs select lower or upper primary bounds from the decoded half state.
Double slabs use a full block for either half. Other classes and unresolved half values retain the existing provider.
The provider feeds the same nonvisual world dictionary and accepted-level camera consumer.

Original property construction, class factories, half-property admission, registry enumeration, and finalization reproduce all 244 slab state hashes.
The built provider matches 1,462 native primary-bound queries after metadata encoding and decoding, including the installed grid positions and far float collapse.
Installed direct and ViaProxy controls cover all 244 states through swaps, resource reload, and dimension return.
The full core, add-on, and proxy builds pass. The whole main registration configuration and loaded native world remain outside the constructor controls.

The [owning patch](0054-render-native-block-state-geometry-and-materials.patch) retains implementation rationale and versioned evidence.
