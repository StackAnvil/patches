## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned and freely available persona and emote assets use the current inventory receipt, PlayFab catalog, and official Xbox or PlayFab CDN download flow. The runtime decrypts assets in memory without a native installation, copied keys, or an external extractor. Receipts, content keys, screenshots, profiles, and assets stay private. Resolved recipes use local body assembly. Recipes without usable receipt keys or with animated shared body textures still use the model service.

## Built-in persona package

The bundled Xodus-based helper signs into Microsoft Store with the selected Xbox account and obtains a device-bound license. It extracts persona files and base vanilla model and actor archives from the official package. Pin Bedrock 1.26.51.1 / package 1.26.5101.0 to protocol 2193. The pinned header anchors verification of the Merkle tree, metadata, and encrypted pages before decryption.

Read resident and ordinary multi-run NTFS streams or the package segment index. Unpack BR archives with shared offsets and empty stubs, then atomically publish a versioned cache with file checksums. Decode native PNG face strips and BGRA TGA tint masks and feed equipped built-in pieces into the asset loader. Wave, Clap, Over There, and Follow Me use their extracted animation sources for preview and world playback.

Local Linux tests acquired the official license and extracted 232 files through the bundled helper. Fresh interactive Store sign-in and Windows and macOS runtime flows still need verification. CI builds the four supported helper variants. The runtime requires no installed game, copied keys, or user-supplied extractor.

Sources: [Pinned Xodus extraction](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/commands/streaming.rs), [license acquisition](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/license.rs), and [BR archive format](https://github.com/bedrock-crustaceans/brarchive/blob/main/FORMAT.md).

## Classic model library

Expand both base vanilla model archives under their original model paths. Index individual legacy and modern definitions and merge equal duplicates. Cache format 3 refreshes older persona-only and model-only caches before use. Actor compilation requires the player definition, animations, and controllers. Failed acquisition keeps the existing cache.

Classic imports resolve missing models and parents lazily through the licensed library. Pack definitions retain precedence. Loading runs on a worker; a changed account or closed screen prevents stale results from opening. Self-contained packs require no asset acquisition.

Licensed tests resolve all seven inherited entries from the base skin-model library, including the zombie parent from an entity file. They verify extraction, equal duplicate definitions, model decoding, cache reuse, and schema refresh. Versioned vanilla model overrides and native visual comparisons remain pending. A broader check found an unresolved `rightarm` parent in the native legacy vex model; native parent-name behavior needs research before importing it.

## Classic actor graph

Compile reachable player animations and nested controllers from the matching licensed package. Apply classic aliases over the player defaults, including empty overrides. Preserve ordered weighted references, initialization, per-frame scripts, entry and exit scripts, state transitions, temporary remapped variables, and independent playback clocks.

Typed queries preserve item strings. Normalize native numeric float suffixes outside quoted text. Apply the graph to preview and world models through the same authored hierarchy as emotes. Entity-relative rotation cancels parent animation rotation before attachment flattening.

Private matching package tests establish the zombie-arm alias and additive riding pose. Targeted tests cover controller cycles, re-entry, nested variable restoration, typed queries, and simultaneous parent rotations. A running Java client passes eight checks for the injected bridge, preview alias, and player model pose. Its visible preview uses a synthetic texture and private licensed actor files.

Controller crossfades, completion queries, effects, full item-action bindings, geometry-provided alias precedence, and first-person playback remain incomplete. Native motion, mixed rotation spaces, and nontrivial scale composition still need comparison. The runtime probe does not establish live account import behavior.

Sources: [Controller semantics](https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationcontroller?view=minecraft-bedrock-stable) and [animation rotation spaces](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable).

## Face composition and tint blending

Compose equipped face textures in native piece order and repeat static layers across animated frames. Bind extracted head and hat geometry to the animated face surface. Two-frame faces retain the native blink expression.

Apply native four-channel weighted tint transfer to face layers and animated body pieces. Preserve skin-tone binding, recipe channels, source alpha, and output truncation. Independent limb recipes keep separate colors and texture tiles.

Private Bedrock 1.26.51.1 compositor observations establish the HSL, LCh, and luminance contributions. The Java compositor matches all 2,048 pixels of a captured two-frame face. Its tint math matches 512 deterministic native execution cases. Research binaries, execution harnesses, captured images, and assets remain outside the patch.

## Local body assembly

Select skeleton and body zone sources from the licensed package for the equipped height and arm width. Empty arm fields select shared sources. Preserve pose bones and locators when pieces replace body and clothing zones. Independent recipes select their source side before texture decoding. Join polygon layers on shared bones with separate vertex, normal, and UV index offsets.

Compose shared skin and clothing textures in native piece order. Apply compressed BGRA clothing maps before tint blending. Their red and green offsets identify an underlying texel to clear when the incoming source has no coverage there. Pack static surfaces with the native duplicated one-pixel border. Known built-in UUIDs also resolve from the package for free catalog recipes.

Private Bedrock 1.26.51.1 comparisons match all 16,384 captured body pixels and body mesh UVs. Tests assemble all nine starters across four heights and two arm widths. They also validate local body, face, and animated-arm bindings through the geometry parser. These comparisons cover the captured outfit. More overlapping outfits and texture resolutions need native comparison.

## Emote playback

Play owned and built-in animation sources on the active character with Replay and Stop controls. Preserve root, waist, and body hierarchy and animate clothing surfaces in the same pose. Mocha supplies actor-local Molang expressions with host execution limits. Entity-relative rotation uses the authored hierarchy. Effects, timelines, delays, and multiple animation sources remain unsupported.

The rebindable B key opens the four-position world wheel with mouse and 1-4 controls. Load entitled wheel assets, advertise `EMOTE_LIST`, and send native `EMOTE` with pack UUIDs and tick durations. Incoming emotes use the same pose sampler and authored model hierarchy. Movement and completion reset playback.

Private native 1.26.51 captures establish Battle Cry's pack UUID, 130 ticks, and zero flags. The metadata piece UUID differs. Walking clears `PlayerAuthInput` Emoting immediately; completion clears it at 130 ticks. Java relay playback matches the wire fields, completion transition, and movement cancellation. Native emotes visibly animate the tracked remote player in Java and reset at completion.

## Verification

- Full patch stack builds successfully.
- 106 add-on tests pass with private persona, login, emote, and legacy geometry fixtures enabled.
- Private Battle Cry, Kadoosh, and four built-in emote tests sample every frame at 60 Hz.
- Bundled-helper tests verify official acquisition, archive extraction, face-mask decoding, cache reuse, and failed refresh recovery.
- A Java GUI recording verifies the locally assembled body, face, and animated arms, including open and closed face frames. Geometry parser tests cover native null optional transforms.
- A Java GUI recording verifies visible Battle Cry motion, attached clothing, completion reset, and readable controls at the default GUI scale.
- Native arm writes, cape equips, sizes, and account wheel edits have capture evidence. The account is restored after temporary edits.

Unresolved free assets, animated shared body textures, native animation timing, unavailable remote emotes, and free limb side recipes remain incomplete. More face sizes and equipped combinations need native comparison. The Java preview recording uses an offline appearance fixture, so it does not establish live Java account download behavior.

### Local persona cape assembly

Equipped cape packs use the account receipt and PlayFab download flow. Their textures and tint masks bind to the licensed `geometry.cape` model. The cape follows the equipped body pivot without replacing the height skeleton. Atlas conversion preserves native bottom-face UV orientation and larger texture resolutions.

Authenticated Bedrock 1.26.51.1 Copper Cape service models establish rest geometry at all four heights. Fixture tests compare rendered positions, normals, UVs, and atlas pixels, then check persistence and skin-codec round trips. Synthetic tests cover mirrored mappings, larger textures, catalog ambiguity, and exclusion from persona piece handles. The research restored the account recipes. Cape motion and native multiplayer appearance still need comparison.

The full fixture-enabled add-on suite passes 109 tests with no skips. The replayed full stack builds successfully. A running Java client passes nine checks for local assembly and cape attachment in preview and world models. The inspected rear preview shows the entitled cape. This is an offline fixture run, so live account download and native multiplayer appearance remain unverified.

### Free persona assets

Some ordinary free packs share a content key with another account receipt entry. Try unique receipt keys when the equipped pack has no matching entitlement. Native catalog flags must permit free use without redemption. Published metadata must match the requested product, zero price, persona content type, and pack UUID. Paid and redemption-required pieces retain their entitlement requirement. The runtime uses no copied key or installed game path. Empty-key receipts remain unresolved.

Private fixtures decrypt unowned Asymmetric Button Up and A-Line hair packs and assemble their body and face locally. The clothing image matches all 16,384 model-service pixels. Independent target-game compositor execution matches all 2,048 face pixels across both frames, including translucent hair. The service static face differs at twelve translucent edge pixels. Preserve the game compositor rather than adjusting tint behavior to that service discrepancy.

Enable these fixtures with `STACKANVIL_FREE_PERSONA_ASSETS` and `STACKANVIL_OFFICIAL_PERSONA`. Shared-key tests cover incorrect candidates, duplicate keys, missing keys, wrapper archives, and pack identity. Catalog tests retain price, ownership, and redemption distinctions. Research restored account recipes and kept all downloaded assets and credentials private.

The replayed stack builds successfully. All 114 fixture-enabled add-on tests pass with no skips. A running Java client downloads both free packs through the production account loader, passes the body and face pixel comparisons, displays the assembled outfit, and creates its world renderer. Licensed starter assets come from private fixtures in this probe. No account recipe changes occur. Native multiplayer comparison remains pending.
