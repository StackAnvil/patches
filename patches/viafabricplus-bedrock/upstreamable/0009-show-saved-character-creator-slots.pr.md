## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned persona and emote assets use the current inventory receipt, PlayFab catalog, and official Xbox or PlayFab CDN download flow. The runtime decrypts assets in memory without a native installation, copied keys, or an external extractor. Receipts, content keys, screenshots, profiles, and assets stay private. The model service supplies static geometry for unresolved default and free assets.

## Built-in persona package

Bundle an Xodus-based helper that signs into Microsoft Store with the selected Xbox account, obtains a device-bound license, and extracts only the persona directory from the official package. Pin Bedrock 1.26.51.1 / package 1.26.5101.0 to protocol 2193. The pinned header anchors verification of the Merkle tree, metadata, and encrypted pages before decryption.

Read resident and ordinary multi-run NTFS streams or the package segment index. Unpack BR archives with shared offsets and empty stubs, then atomically publish a versioned cache with file checksums. Decode native PNG face strips and BGRA TGA tint masks and feed equipped built-in pieces into the asset loader. Wave, Clap, Over There, and Follow Me use their extracted animation sources for preview and world playback.

Local Linux tests acquired the official license and extracted 227 persona files through the bundled helper. Fresh interactive Store sign-in and Windows and macOS runtime flows still need verification. CI builds the four supported helper variants. The runtime requires no installed game, copied keys, or user-supplied extractor.

Sources: [Pinned Xodus extraction](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/commands/streaming.rs), [license acquisition](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/license.rs), and [BR archive format](https://github.com/bedrock-crustaceans/brarchive/blob/main/FORMAT.md).

## Emote playback

Play owned and built-in animation sources on the active character with Replay and Stop controls. Preserve root, waist, and body hierarchy and animate clothing surfaces in the same pose. Mocha supplies actor-local Molang expressions with host execution limits. Effects, delays, multiple animation sources, and entity-relative rotations remain unsupported.

The rebindable B key opens the four-position world wheel with mouse and 1-4 controls. Load entitled wheel assets, advertise `EMOTE_LIST`, and send native `EMOTE` with pack UUIDs and tick durations. Incoming emotes use the same pose sampler and authored model hierarchy. Movement and completion reset playback.

Private native 1.26.51 captures establish Battle Cry's pack UUID, 130 ticks, and zero flags. The metadata piece UUID differs. Walking clears `PlayerAuthInput` Emoting immediately; completion clears it at 130 ticks. Java relay playback matches the wire fields, completion transition, and movement cancellation. Native emotes visibly animate the tracked remote player in Java and reset at completion.

## Verification

- Full patch stack builds successfully.
- 74 add-on tests pass with private persona, login, and emote fixtures enabled.
- Private Battle Cry, Kadoosh, and four built-in emote tests sample every frame at 60 Hz.
- Bundled-helper tests verify official acquisition, archive extraction, face-mask decoding, cache reuse, and failed refresh recovery.
- A Java GUI recording verifies visible Battle Cry motion, attached clothing, completion reset, and readable controls at the default GUI scale.
- Native arm writes, cape equips, sizes, and account wheel edits have capture evidence. The account is restored after temporary edits.

Unavailable remote emote assets, free limb side recipes, default face compositing, and animated tint blending remain incomplete. The Java preview recording uses an offline appearance fixture, so it does not establish live Java account download behavior.
