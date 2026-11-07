# feat(blocks): render Bedrock state geometry and materials

## Purpose

Resolve custom block properties and ordered permutations after StartGame, including per-face textures, geometry, transforms, shapes and lighting. Reserve free note-block and redstone-wire states deterministically and deduplicate identical visual and physical definitions. Preserve the original vanilla mapping when a definition or a required custom texture cannot be represented.

## Design constraints

Resolve ordered permutations and preserve original native block identities. Assign deterministic Java carriers only for representable states. Keep physical properties, culling, lighting, and supplemental-pack admission with their authoritative owner.

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

Camera bounds combine local component boxes before continuous world-float translation.
Two one-pixel boxes within one block retain their native envelope at X/Z 1,048,576, where each translated box collapses separately.
The compiled helper matches 64 original 1.26.60.5 envelope controls, including 312 float fields. State/shared offset lookup and the boat friction probe execute with the original shape method.
These controls supply component storage and primary cell reads. Nonbase shape overrides, authored decoding, installed camera behavior, and complete trajectories remain unverified.
Collision components use the native Byte enabled flag and Float coordinates. Missing or differently typed values decode to false and zero.
Endpoints clamp to 16 pixels horizontally and 24 vertically before conversion; an enabled empty list supplies a full block.
Retain flat bounds through conversion, metadata, camera envelopes, and cache identity. Movement queries discard empty translated volumes.
The compiled converter and metadata path match 13 original NBT-to-finalized-cache-to-shape controls, including mixed flat and solid bounds.
Two supplied-matrix controls also show that native rotation can give a flat box positive volume.
Original decoding and finalization use supplied component storage, tag IDs, empty property maps, and unrelated cache defaults.
The full 109-patch core replay and build pass. Exact transformed float order, full publication, nonbase providers, and installed camera or movement trajectories remain open.

The [owning patch](0054-render-native-block-state-geometry-and-materials.patch) retains implementation rationale and versioned evidence.
