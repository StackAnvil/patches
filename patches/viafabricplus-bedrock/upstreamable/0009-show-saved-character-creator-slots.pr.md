## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned and freely available persona and emote assets use the current inventory receipt, PlayFab catalog, and official Xbox or PlayFab CDN download flow. The runtime decrypts assets in memory without a native installation, copied keys, or an external extractor. Receipts, content keys, screenshots, profiles, and assets stay private. Resolved recipes use local body assembly, including animated shared body textures. Recipes without usable receipt keys still use the model service.

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

Effects, full item-action bindings, and first-person playback remain incomplete. The classic importer supplies selected legacy geometry aliases in native conversion order. Native motion, mixed rotation spaces, and nontrivial scale composition still need comparison. The runtime probe does not establish live account import behavior.

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

Play owned and built-in animation sources on the active character with Replay and Stop controls. Preserve root, waist, and body hierarchy and animate clothing surfaces in the same pose. Mocha supplies actor-local Molang expressions with host execution limits. Entity-relative rotation uses the authored hierarchy.

Select the first declared animation source, as the target native loader does. Accept additional source declarations without mixing them or using them as fallback files. Sounds, particles, and named actor events remain unsupported.

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

Free assets without usable receipt keys and unavailable remote emotes remain incomplete. The renderer patch corrects texture timing from the licensed controllers. Native multiplayer timing comparison remains pending. More face sizes and equipped combinations need native comparison. The Java preview recording uses an offline appearance fixture, so it does not establish live Java account download behavior.

### Local persona cape assembly

Equipped cape packs use the account receipt and PlayFab download flow. Their textures and tint masks bind to the licensed `geometry.cape` model. The cape follows the equipped body pivot without replacing the height skeleton. Atlas conversion preserves native bottom-face UV orientation and larger texture resolutions.

Authenticated Bedrock 1.26.51.1 Copper Cape service models establish rest geometry at all four heights. Fixture tests compare rendered positions, normals, UVs, and atlas pixels, then check persistence and skin-codec round trips. Synthetic tests cover mirrored mappings, larger textures, catalog ambiguity, and exclusion from persona piece handles. The research restored the account recipes. Cape motion and native multiplayer appearance still need comparison.

The full fixture-enabled add-on suite passes 109 tests with no skips. The replayed full stack builds successfully. A running Java client passes nine checks for local assembly and cape attachment in preview and world models. The inspected rear preview shows the entitled cape. This is an offline fixture run, so live account download and native multiplayer appearance remain unverified.

### Free persona assets

Some ordinary free packs share a content key with another account receipt entry. Try unique receipt keys when the equipped pack has no matching entitlement. Native catalog flags must permit free use without redemption. Published metadata must match the requested product, zero price, persona content type, and pack UUID. Paid and redemption-required pieces retain their entitlement requirement. The runtime uses no copied key or installed game path. Empty-key receipts remain unresolved.

Private fixtures decrypt unowned Asymmetric Button Up and A-Line hair packs and assemble their body and face locally. The clothing image matches all 16,384 model-service pixels. Independent target-game compositor execution matches all 2,048 face pixels across both frames, including translucent hair. The service static face differs at twelve translucent edge pixels. Preserve the game compositor rather than adjusting tint behavior to that service discrepancy.

Enable these fixtures with `STACKANVIL_FREE_PERSONA_ASSETS` and `STACKANVIL_OFFICIAL_PERSONA`. Shared-key tests cover incorrect candidates, duplicate keys, missing keys, wrapper archives, and pack identity. Catalog tests retain price, ownership, and redemption distinctions. Research restored account recipes and kept all downloaded assets and credentials private.

The replayed stack builds successfully. All 114 fixture-enabled add-on tests pass with no skips. A running Java client downloads both free packs through the production account loader, passes the body and face pixel comparisons, displays the assembled outfit, and creates its world renderer. Licensed starter assets come from private fixtures in this probe. No account recipe changes occur. Native multiplayer comparison remains pending.

### Emote source selection

Focused inspection of Bedrock 1.26.51.1, protocol 2193, establishes source selection. The native piece validator imposes no source-count restriction. The emote loader requires a nonempty source vector, resolves its first animation name, and loads that source file. It does not iterate through later sources.

Accept multiple declarations and preserve their order. Missing first files or animation names remain errors. Targeted tests compare the selected duration and bone pose after reordering sources. They also cover unused missing files, an unavailable first source, and empty lists. Private native binaries and exports remain outside the repository. A native multi-source asset playback comparison remains pending.

The replayed full stack builds. All 117 fixture-enabled add-on tests pass with no skips.

### Animation clock and delays

Focused inspection and independent execution of Bedrock 1.26.51.1 establish playback timing. The native animation player evaluates start delay once and passes an overshooting frame remainder into its time expression. Exact delay expiry retains the full delta. Loop time wraps only after crossing the final frame. Hold mode clamps the clock. Ordinary playback contributes no pose after its final frame.

The native completion flag persists after the first cycle. Consequently, the player reevaluates loop delay on each subsequent active update, including updates within later cycles. Preserve this target behavior despite the more general Creator description of delay evaluation after each loop.

The matching native update routine is `FUN_141e68a20`. Reset is `FUN_141e69a60`, and the completion getter is `FUN_141e76b30`. Private execution fixtures cover initial and loop delays, exact boundaries, overshoot, custom clocks, completion, and held frames. The fixtures execute the native clock with isolated expression and geometry callbacks. Binaries and harnesses remain private.

Use the same sampler for classic tracks, Dressing Room previews, and world emotes. Previews stop from playback state. Incoming emotes retain their packet duration without truncation to the declared animation length. Repeated elapsed-time samples reuse the pose. Timeline scripts, sounds, and particles remain explicit errors until their execution paths exist.

Source: [Microsoft animation reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable).

The replayed full stack builds successfully. All 123 fixture-enabled add-on tests pass with no skips. A running Java client passes 15 checks for delayed preview poses, geometry transforms, replay, packet deadlines, and completion reset. The runtime probe uses a synthetic animation and does not establish visible native motion equivalence.

### Molang timelines

Read timestamped Molang scripts and arrays of scripts. Sort entries stably so scripts at equal timestamps retain their declaration order. Include event timestamps when the animation has no explicit length. Tracks without bones can still update actor variables.

Bedrock 1.26.51.1 samples bones before scripts. Timeline scripts use the current animation clock and effective frame delta. Entries run when their timestamp exceeds the previous event cursor and does not exceed the current clock. A loop wrap resets the cursor. Only events within the new segment run, including timestamp zero. Outgoing tails and skipped complete cycles do not replay. A backward custom clock updates the cursor without immediately replaying scripts. Replay starts with a new cursor. Repeated Java render passes retain their sampled pose and do not repeat scripts.

The shared sampler supplies timeline playback to emotes and classic actor tracks. Timeline writes reach later tracks in the same actor update. Named actor events, sounds, and particles remain explicit errors.

Independent execution of the licensed target's stable timeline normalizer and animation player verifies these rules with synthetic inputs. Tests cover initial and loop delays, ordinary completion, held frames, custom clocks, chronological ordering, and equal timestamps. The replayed full stack builds successfully. All 128 fixture-enabled add-on tests pass with no skips. Native binaries, fixtures, and execution harnesses stay private.

A running Java client passes 37 checks for timeline poses, preview geometry, world playback, delays, replay, and completion reset. The runtime probe uses synthetic animation data. It does not establish visible native motion equivalence.

### Controller completion and transition blending

Read all-completion, any-completion, and state-time queries from the native state context before updating the current frame. Preserve completion for looping and zero-weight tracks. Empty states satisfy all-completion and fail any-completion. Nested controllers expose their current state's completion and clear the shared query binding after their update.

Keep outgoing state playback during crossfades. Use the target's curve weights directly, then restore the parent weight when the fade ends. Shortest-path blending interpolates Euler axes, position, and scale before composition with the existing pose. Preserve the negative direction for a 180-degree tie. Re-entry resets child playback; nested controllers retain their selected state. Self-transitions reset clocks without repeating entry or exit scripts.

Retain controller format versions. The target constructor uses the 1.18.10 boundary to choose immediate initial transitions or initial-state entry. The older licensed player graph keeps its first-update posture behavior. Repeated render passes reuse the pose. A rewound lifetime starts a fresh graph and variable environment.

Private independent execution of Bedrock 1.26.51.1 verifies query handlers, controller state clocks, child weights, fade completion, and shortest-path composition. Fixtures compare Java samples with native results, including a fade that ends in its transition frame. The version comparator independently verifies the 1.18.10 boundary. Executable files, assets, and probes remain private. Native visual motion, mixed rotation spaces, and constant-only animation length defaults remain unverified.

The replayed full stack builds successfully. All 138 fixture-enabled add-on tests pass with no skips. A running Java client passes 46 checks for preview and world model geometry, completion-triggered crossfades, repeated frames, and rewind. The runtime checks use synthetic controller data and do not establish visible native motion equivalence.

### Animated shared body textures

Compose shared skin and clothing strips locally in native piece order. Static layers repeat beneath animated layers. Tint masks follow each source frame. Clothing-map offsets can clear texels across a frame boundary. Body surfaces move to the animated model, while static attachments and capes retain their atlas.

Use native 32-pixel and 128-pixel texture groups. Source frames are square, with a power-of-two count. Each group uses its longest strip and repeats shorter strips. Pack geometry collections as horizontal columns. Shared body strips can join geometry in the 128-pixel group. Map polygon UVs against the rectangular atlas dimensions.

Independent Bedrock 1.26.51.1 execution verifies the source validator and animated compositor packing path. Native compositor output matches all 32,768 pixels of a synthetic body fixture. This includes changing tint masks, translucent pixels, and a clothing-map offset across a frame boundary. Pixel blending uses cached results from independent execution of the native blend function. The harness preserves native sampling and clearing instructions. Binaries, harnesses, and output remain private.

Targeted tests cover static attachments, mixed body and geometry animations, independent limb tints, rectangular polygon UVs, persistence, and native input limits. Native equipped-outfit and multiplayer comparisons remain pending.

The replayed full stack builds, and all 144 fixture-enabled add-on tests pass with no skips. A running Java client passes 58 checks for local assembly, texture groups, preview uploads, world uploads, frame phases, and release. The runtime probe combines licensed starter assets with synthetic animated clothing and geometry. It changes no account recipes. These checks do not establish native visible outfit parity.

## Mouth and facial hair colors

Expose mouth and facial hair color editing in their wardrobe categories. Mouths use the native 29-color palette and recipe channel two. Facial hair uses the hair palette and channel zero. Eye channel order remains iris, eyebrows, and sclera. Category declarations supply the available controls, and each color target owns its palette and recipe channel.

Independent execution of Bedrock 1.26.51.1's palette initializer verifies all five exposed palettes. Execution of the native picker selection verifies channel order for skin, hair, facial hair, eyes, and mouths. Targeted tests check recipe preservation and rejection of invalid colors, mismatched categories, and incomplete channel arrays. The native capture launcher reports locked shared game files, so this change has no fresh native HTTPS write capture. Premium piece channels remain pending.

The replayed full stack builds, and all 148 fixture-enabled add-on tests pass with no skips. A running Java client passes 33 checks for control availability, labels, palette selection, saved swatches, Apply availability, eye channel cycling, and returning to the wardrobe. This probe uses a local recipe fixture and writes no account changes.

## Free and built-in limb sides

Preserve source flags while changing limb sides. Owned pieces use bare UUIDs, `/l`, and `/r`. Free pieces use `/f`, `/fl`, and `/fr`. Built-in pieces use `/d`, `/dl`, and `/dr`. Independent execution of Bedrock 1.26.51.1's recipe encoder, `FUN_14142d750`, establishes all 18 source, limb, and side combinations. Its piece types match protocol 2193: legs 19-21 and arms 22-24. Native binaries and execution harnesses stay private.

Enable free arm and leg controls. Mixed owned and free replacements preserve the opposite side, separate colors, complete recipes, and wheel positions. Combined flags select the correct packet handles and local geometry side. Animated sides retain separate atlas columns and tint masks. Unknown flags remain errors. Fresh native leg HTTPS write and multiplayer visual comparisons remain pending.

The replayed full stack builds, and all 158 fixture-enabled add-on tests pass with no skips. A running Java client passes 40 checks for free arm and leg controls, recipe splitting, tint preservation, wheel ordering, saved-side recognition, and packet types. This probe uses local recipe fixtures and makes no account writes.

## Account-owned classic skin packs

Add Owned packs to the Dressing Room. Load the authenticated `MultiItemPage_PersonaSkinSelector` page and open selected packs in the existing classic preview. Keep list selection on Back, discard stale requests after screen or account changes, and prevent duplicate downloads. Six Dressing Room actions use two rows so their labels remain readable.

Share receipt decoding, catalog requests, official HTTPS CDN downloads, and archive decryption with persona assets. Classic downloads require the selected pack's receipt key. Validate the published product, skin-pack identity, and Store version. Use the Store product ID because inventory IDs can refer to shell products with no downloadable content. Match catalog versions between Store and PlayFab metadata. Earth Skin's manifest version differs from its Store version, so the payload check uses the pack UUID.

Accept the native single-ZIP wrappers without assuming a filename. Read decrypted classic packs in memory through the same parser as local imports. Preserve custom geometry, texture layout, animation aliases, render flags, and existing appearance persistence. Remove null root-parent fields before model parsing. Self-contained packs require no official package extraction.

Bedrock 1.26.51.1 HTTPS captures establish the native empty request body, ownership response, and `skinbinary` content type. Fresh authenticated production requests downloaded Birdie Wings and Earth Skin. Licensed tests cover both wrappers, receipt decryption, geometry, saved pixels, and login claims. The replayed stack builds and passes 163 fixture-enabled tests with no skips. A running Java client passes 32 checks for both downloads, list loading, controls, preview, and Back navigation. The probe changes no account profiles. Receipts, keys, downloaded packs, screenshots, and probe code stay private.

Paid purchases, redemption, and remote classic selection synchronization remain incomplete. Native multiplayer comparison of these custom models remains pending.

## Native tint override and fallback selection

Honor `allow_tint_override` in face layers, shared body layers, static surfaces, and animated surfaces. Use authored base colors when selected tint metadata is absent. Fixed-color pieces retain their authored selection instead of recipe channels. Resolve alpha tint from the equipped skin's selected red channel. Missing skin assets preserve existing piece alpha. Skin pieces use the slot tone on all channels only when overrides are allowed. The native assembler bypasses selected cape tint.

The generated [PersonaPieceMeta reference](https://lamina.levimc.org/api/d7/df2/structSharedTypes_1_1v1__26__40_1_1PersonaPieceMetaDef_1_1PersonaPieceMeta.html) identifies the optional override flag. Target executable schema registration retains `allow_tint_override`. Independent execution of Bedrock 1.26.51.1 `FUN_141490e10` verifies 448 palette-selection combinations. The probe supplies decoded colors at metadata accessor boundaries and executes native selection, recipe lookup, and skin-alpha branches. It isolates selection from JSON parsing and pixel transfer. Captured face and body pixel tests retain their reference results.

The full stack builds and passes 166 fixture-enabled tests with no skips. A running Java client passes 506 checks for the native selection cases, animated preview and world uploads, frame phases, and release. The probe changes no account profiles.

Premium picker availability, additional palette reachability, and native visible outfit comparisons remain pending. This change corrects rendering selection and does not expose unverified controls. Native executable, probes, fixtures, and rendered pixels remain private.

## Native emote chat announcements

Load normal and alternate announcements from each emote pack's translations. Support both owned-pack and built-in translation layouts. Resolve the selected language per key, then fall back to English. Keep explicitly empty translations empty. Actor names use aqua, and highlighted phrases use green. Preserve native marker order and escape behavior without rescanning actor names.

Track repeats per actor. The native gate uses float milliseconds, a 1.5-second cooldown, and a 30-second repeat window. Rejected attempts extend the deadline. The fifth accepted repeat selects the alternate announcement and resets the chain. Changing emotes resets the count without bypassing the cooldown.

Independent execution of Bedrock 1.26.51.1 `FUN_1447677d0` and `FUN_1402046e0` verifies 134 formatting cases and 23 repeat steps. The native remote handler, `FUN_14130ac60`, ignores local actor echoes and suppresses announcements for incoming flag bit 2. The outgoing constructor keeps flags zero. StartGame world muting and the local emote-chat setting also suppress announcements. Muting chat leaves remote animation playback active.

Expose a local Mute emote chat setting. Respect Java chat permissions and blocked players. Native platform-specific communication filtering remains incomplete. Its native implementation aggregates filters using XUID and platform identity, which these Java checks do not reproduce.

The replayed full stack builds. All 170 fixture-enabled add-on tests pass with no skips. A running Java client passes 157 checks for native formatting fixtures, four official built-in emotes' translations, HUD colors, cooldown, world and local muting, provider flags, animation playback, and local echoes. The probe uses a mock connection and temporarily controls callback scheduling. It restores chat, settings, player, and playback state and makes no account writes. Live native multiplayer comparison remains pending. Licensed text, binaries, fixtures, and research probes stay private.

## Unresolved classic animation resources

Retain aliases whose declared animation or controller resource is absent. Their tracks contribute no pose and remain incomplete. Other tracks continue playback. Explicit empty aliases still remove tracks from completion checks. Malformed present resources, missing aliases, cycles, and invalid controller state targets remain errors.

Independent execution of Bedrock 1.26.51.1 `FUN_141e68a20` and `FUN_141e6d180` verifies 16 missing-resource updates. Cases cover absent handles and handles with absent definitions. Player state, pose, and context remain unchanged. Native completion getters return false. Missing animation players skip their weight expression. Missing controller players evaluate their weight expression before returning.

This behavior permits the stale inverted-crouch resource emitted by the native legacy converter. Tests verify controller all-completion and any-completion, weight side effects, ordinary track playback, empty overrides, rewind, and all nine legacy flags against licensed player resources. Native binaries, fixtures, and probes stay private.

The replayed full stack builds, and all 174 fixture-enabled add-on tests pass with no skips. A running Java client passes 1,059 checks. These cover the 1,024 native flag and merge cases, pack import, persistence, skin claims, and all nine licensed legacy graphs. The imported zombie-arm alias reaches both preview and world model geometry. The probe changes no account profiles. Native visible motion comparison remains pending.

## Classic player item queries

Bind item queries to remaining use ticks, equipped hands, rendered hands, and per-hand crossbow charge state. Empty hands use an empty item name. Native slot parsing accepts main-hand and off-hand names or numeric indices. Invalid slots return the native empty result.

Independent execution of Bedrock 1.26.51.1's query callbacks verifies 410 duration, normalization, empty-item, and charged-item cases. `FUN_142214ef0` supplies maximum use ticks. `FUN_142214fe0` supplies remaining use ticks. `FUN_1422189d0` implements remaining-duration arguments, and `FUN_14221d2f0` selects the charged hand. The current duration callback returns seconds without arguments. It retains a conversion bug for an explicit slot without normalization, returning remaining ticks multiplied by 20. Preserve that target behavior. Older engine query versions remain outside these bindings.

Evaluate bone-channel Molang `this` against the pose from earlier ordered tracks. The licensed crossbow animation uses `-this` to cancel the holding pose. Default channel values caused that offset to apply twice. Absent channels contribute their identity values. Authored pose overrides reset the expression context. Tests cover weighted position, rotation, and scale expressions and the licensed crossbow graph's charge, hold, and release states.

The replayed full stack builds. All 178 fixture-enabled add-on tests pass with no skips. A running Java client passes 368 checks: 360 independent native duration cases and eight checks through actual item stacks, the production pose bindings, and world model geometry. The probe uses an untracked player and private licensed resources. It changes no account profiles or tracked players. Executables, query fixtures, and probes stay private.

Native charging flags, item-name mappings, and Bedrock use-duration differences remain incomplete. First-person playback and visible native motion comparisons also remain pending. The runtime checks establish the Java pose path, not native timing equivalence.

Sources: [remaining-duration arguments](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions/query_item_remaining_use_duration?view=minecraft-bedrock-stable), [Molang expression context](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/syntax-guide?view=minecraft-bedrock-stable), and [ordered animation composition](https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationsoverview?view=minecraft-bedrock-stable). The slot-only conversion above comes from target executable execution, rather than the documented seconds contract.

## Active food use and trident charge

Supply startup and interval progress from the active use stack. Determine timed spear state and charge amount from the carried main-hand item. Keep both inputs separate from rendered hands. Stopping use clears the timed bindings while retaining the equipped holding pose.

Native player startup getter `FUN_1401edf60` separates the first use phase from the final 24 ticks. Its interval getter, `FUN_1401ee100`, cycles through four steps during those final ticks. Both use the elapsed duration from `FUN_1401edff0`. Preserve floating-point operation order, fast-use behavior, and the raw undefined startup value for a 24-tick item at zero elapsed ticks. Molang pose evaluation retains its existing finite-result guard.

The target actor update, `FUN_142069380`, selects brandishing for native use animation 6 with an active item and positive remaining ticks. It clamps charge over ten elapsed ticks. Map Java's trident use animation to these inputs. The target item constructor sets animation 6 and 72,000 maximum use ticks at `143ef3f5f` and `143ef3f63`. This mapping does not include Java's separate modern spear animation.

Independent execution of the two player getters verifies 300 active and inactive timing cases. Another 90 cases execute the target actor update across use-animation types, item-use state, and remaining ticks. The harness supplies item accessors, actor flags, and Molang storage boundaries. It executes the native branch selection, elapsed-time lookup, progress math, charge math, and variable assignments. Binaries, native execution fixtures, and probes stay private.

The replayed full stack builds. All 181 fixture-enabled add-on tests pass with no skips. Licensed player graph tests cover food startup, interval cycles, trident charge, and stopped-use poses. A running Java client passes 807 checks. These include 750 native query and active-use cases and 57 production checks through actual crossbow, apple, dried kelp, and trident stacks, pose reset, and world model rotations. Compare world rotations as quaternions so equivalent Euler angle wrapping does not fail the probe. It changes no account profiles or tracked players.

Native visible motion and multiplayer timing remain unverified. Native charging actor flags, other specialized use states, item-name mappings, exact Bedrock durations for other items, and first-person playback remain incomplete.

Source: the generated [native use-animation enum](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/deps/shared_types/legacy/item/UseAnimation.h) names animation 6 as Spear. Timing and activation evidence above comes from independent execution of Bedrock 1.26.51.1.

## Replicated player charging state

Bind `query.is_charging` to accepted Bedrock actor metadata. The target callback, `FUN_142216b60`, reads actor flag 43 independently of item use. An absent actor returns zero. Independent execution verifies 16 cases across actor presence, flag state, and query arguments. The harness supplies the actor flag accessor and executes the native callback's selection and return paths.

Publish immutable snapshots on the connection's network thread after ViaBedrock accepts metadata. The renderer reads the current connection's snapshot without accessing mutable entity metadata. Actor removal clears its snapshot. An older actor's removal preserves a replacement with the same UUID. Connection storage keeps sessions separate, and rejected metadata retains the accepted state.

The licensed player graph uses this query to select its charging track. That track replaces earlier arm rotation through Molang `this`. Tests cover charging transitions independently of item use, connection isolation, snapshot publication, replacement removal, and the native callback fixtures.

The replayed full stack builds, and all 185 fixture-enabled add-on tests pass with no skips. A running Java client passes 21 checks through the actual metadata mixin, network thread, licensed graph, and world model. The probe verifies rejected metadata and both actor removal cases. It uses untracked actors and makes no account writes or tracked player changes. Native binaries, fixtures, and probe code remain private.

Local prediction of native charging state remains incomplete. Other specialized use states, item-name mappings, exact Bedrock item durations, first-person playback, and native visible motion comparisons remain pending.

## Specialized carried-item use states

Supply `variable.is_holding_spyglass`, `variable.is_tooting_goat_horn`, and `variable.is_using_brush` from the carried main-hand item. Native actor update `FUN_142069380` selects use animations 10, 11, and 12 when the carried item is valid and remaining ticks are positive. Target metadata does not gate these three states. The initializer `FUN_1420b1110` registers their exact variable names.

Read food startup and interval progress from the separate active-use stack. Read trident charge from the carried item's maximum duration. Native Player getter `FUN_140203320` selects the carried item from the inventory slot. An off-hand special item cannot select these main-hand states. A carried special item remains their source when the active stack differs. Zero remaining ticks clear the timed states. Ordinary item-use animations retain food progress without selecting a specialized state. Java's separate modern spear animation remains outside this mapping.

Independent execution verifies 364 combinations of carried and active stack validity, target metadata, use animation, and remaining ticks. Four cases use different carried and active durations. The harness executes the target actor update, selected-slot getter, active-use getters, and native math. It supplies inventory, item-accessor, actor-flag, and Molang storage boundaries. Executable files and fixtures remain private.

The replayed full stack builds, and all 188 fixture-enabled add-on tests pass with no skips. A running Java client passes 1,324 checks, including 364 specialized native cases. Actual spyglass, goat-horn, and brush stacks reach authored animation tracks through the production pose bindings and world model. Mixed-hand cases verify separate active-use and carried-item inputs. Earlier food, trident, and crossbow runtime checks also pass. The probe uses untracked players and makes no account writes or tracked player changes.

The extracted default player graph does not reference these three variables. These checks establish authored track bindings. Complete native item poses remain incomplete. Post-use trident brandishing, local charging prediction, item-name mappings, exact native durations, first-person playback, and native visual comparisons remain pending.

Source: the generated [native use-animation enum](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/deps/shared_types/legacy/item/UseAnimation.h) names Spyglass, GoatHorn, and Brush. Activation and stack-selection evidence comes from independent execution of Bedrock 1.26.51.1.

## Native color picker eligibility research

Independent execution of Bedrock 1.26.51.1 `FUN_1470e7b90` verifies 224 picker cases. Cases cover piece types -1 through 26, loaded and unloaded pieces, and override bytes 0, 1, 2, and 255. The harness supplies the piece-validity accessor, runtime data, vector capacity, and memory-copy boundary. Native instructions select or reject the piece and supply its palette options and channel order.

The inspected picker accepts only loaded pieces whose override byte equals 1. Its supported types are skin, facial hair, mouth, eyes, and hair. Their channels match the existing editor: skin 0, facial hair 0, mouth 2, eyes 0/1/2, and hair 0. The picker and texture compositor read the same runtime flag at piece offset `0x410`.

This evidence covers the inspected legacy picker. It does not establish additional palette reachability through another UI implementation. The generated [PersonaColors header](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/resources/persona/PersonaColors.h) also declares a premium palette. Its declaration does not establish which target controls expose it.

Metadata-to-runtime flag construction and additional palette callers still need research. The unavailable-piece constructor supplies a false flag. Other inspected same-offset writers belong to unrelated objects. No production controls changed, and this research makes no account writes. Executables, probes, fixtures, and exports remain private.

## Native animation effect research

Independent execution of Bedrock 1.26.51.1 `FUN_1401a0f40` verifies 256 sound callback cases. Native instructions select events, resolve aliases, choose positions, attach channels, and pass channel parameters. The harness supplies actor accessors, locator results, sound service allocation, and channel methods. It captures the native requests at these boundaries without audio output.

Sound events use `previous < event <= current`. Missing aliases and unavailable sound services produce no sound request. A fixed-position sound uses the resolved locator position. A missing locator falls back to the actor position. An attached sound binds its channel to the actor identity and authored locator. Native code passes the descriptor's channel parameters after the attachment step. The parameter interpretation and authored defaults still need verification.

Another probe executes `FUN_141e68a20` across 38 clock frames, 16 render-context flag combinations, and suppression followed by re-enabling. Sound dispatch follows bone sampling and precedes Molang timeline scripts. Both receive the current clock and previous event cursor. The clock cases cover initial delays, loop delays, held frames, zero weight, custom clocks, equal timestamps, and loop wrapping.

A suppressed native render context skips sound dispatch and timeline scripts but still advances the event cursor. A later enabled pass does not replay that skipped interval. The probe verifies raw context flags. Their mapping to Java preview and world render contexts remains unresolved.

The matching licensed vanilla player definition declares no sound or particle aliases. The two captured owned emotes contain neither effect type. These assets verify existing playback but cannot establish sound or particle behavior. Generic actor schemas establish effect declarations, not the resource bindings used by every persona emote.

Production sound, particle, and named actor event playback remain incomplete. The next implementation needs effect resource bindings, model locator transforms, audio loading, and effect lifecycle management. The renderer does not yet consume model locators. Native instruction probes do not establish audible results, captions, particle appearance, or multiplayer behavior. Executables, probes, fixtures, and exports remain private.

Sources: [Microsoft animation effects reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable) and [Mojang particle integration reference](https://mojang.github.io/bedrock-samples/Particles.html). The target executable establishes the callback behavior and render-context suppression above.
