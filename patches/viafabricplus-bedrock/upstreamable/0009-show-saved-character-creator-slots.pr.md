## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned and freely available persona and emote assets use the current inventory receipt, PlayFab catalog, and official Xbox or PlayFab CDN download flow. The runtime decrypts assets in memory without a native installation, copied keys, or an external extractor. Receipts, content keys, screenshots, profiles, and assets stay private. Resolved recipes use local body assembly, including animated shared body textures. Recipes without usable receipt keys still use the model service.

## Built-in persona package

The bundled Xodus-based helper signs into Microsoft Store with the selected Xbox account and obtains a device-bound license. It extracts persona files and the stable vanilla resource layers from the official package. Pin Bedrock 1.26.51.1 / package 1.26.5101.0 to protocol 2193. The pinned header anchors verification of the Merkle tree, metadata, and encrypted pages before decryption.

Read resident and ordinary multi-run NTFS streams or the package segment index. Unpack BR archives with shared offsets and empty stubs, then atomically publish a versioned cache with file checksums. Decode native PNG face strips and BGRA TGA tint masks and feed equipped built-in pieces into the asset loader. Wave, Clap, Over There, and Follow Me use their extracted animation sources for preview and world playback.

Local Linux tests acquired the official license and all 57 stable vanilla layers through the bundled helper. Fresh interactive Store sign-in and Windows and macOS runtime flows still need verification. CI builds the four supported helper variants. The runtime requires no installed game, copied keys, or user-supplied extractor.

Sources: [Pinned Xodus extraction](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/commands/streaming.rs), [license acquisition](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus-cli/src/license.rs), and [BR archive format](https://github.com/bedrock-crustaceans/brarchive/blob/main/FORMAT.md).

## Classic model library

Expand both base vanilla model archives under their original model paths. Index individual legacy and modern definitions and merge equal duplicates. Cache format 3 refreshes older persona-only and model-only caches before use. Actor compilation requires the player definition, animations, and controllers. Failed acquisition keeps the existing cache.

Classic imports resolve missing models and parents lazily through the licensed library. Pack definitions retain precedence. Loading runs on a worker; a changed account or closed screen prevents stale results from opening. Self-contained packs require no asset acquisition.

Licensed tests resolve all seven inherited entries from the base skin-model library, including the zombie parent from an entity file. They verify extraction, equal duplicate definitions, model decoding, cache reuse, and schema refresh. The loader now resolves versioned vanilla model overrides. Native visual comparisons remain pending. A broader check found an unresolved `rightarm` parent in the native legacy vex model; native parent-name behavior needs research before importing it.

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

Retain aliases whose declared animation or controller resource is absent. Their tracks contribute no pose and remain incomplete. Other tracks continue playback. Explicit empty aliases still remove tracks from completion checks. Undeclared aliases contribute no track. Malformed present resources, cycles, and invalid controller state targets remain errors.

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

The extracted base player graph does not reference these three variables. These checks establish authored track bindings. Complete native item poses remain incomplete. Post-use trident brandishing, local charging prediction, item-name mappings, exact native durations, first-person playback, and native visual comparisons remain pending.

Source: the generated [native use-animation enum](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/deps/shared_types/legacy/item/UseAnimation.h) names Spyglass, GoatHorn, and Brush. Activation and stack-selection evidence comes from independent execution of Bedrock 1.26.51.1.

## Native color picker eligibility research

Independent execution of Bedrock 1.26.51.1 `FUN_1470e7b90` verifies 224 picker cases. Cases cover piece types -1 through 26, loaded and unloaded pieces, and override bytes 0, 1, 2, and 255. The harness supplies the piece-validity accessor, runtime data, vector capacity, and memory-copy boundary. Native instructions select or reject the piece and supply its palette options and channel order.

The inspected picker accepts only loaded pieces whose override byte equals 1. Its supported types are skin, facial hair, mouth, eyes, and hair. Their channels match the existing editor: skin 0, facial hair 0, mouth 2, eyes 0/1/2, and hair 0. The picker and texture compositor read the same runtime flag at piece offset `0x410`.

This evidence covers the inspected legacy picker. It does not establish additional palette reachability through another UI implementation. The generated [PersonaColors header](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/resources/persona/PersonaColors.h) also declares a premium palette. Its declaration does not establish which target controls expose it.

Metadata-to-runtime flag construction and additional palette callers still need research. The unavailable-piece constructor supplies a false flag. Other inspected same-offset writers belong to unrelated objects. No production controls changed, and this research makes no account writes. Executables, probes, fixtures, and exports remain private.

## Native animation effect research

Earlier notes incorrectly identified `FUN_1401a0f40` as a sound callback. The target schema, record sizes, emitter methods, and actual sound queue establish separate particle and sound paths.

Independent execution of Bedrock 1.26.51.1 `FUN_1401a0f40` verifies 256 particle callback cases. Native instructions select events, resolve aliases, choose positions, attach emitters, and pass an initialization descriptor. The harness supplies actor accessors, locator results, particle engine allocation, and emitter methods. It captures the native requests at these boundaries without particle simulation.

Particle events use `previous < event <= current`. Missing aliases and unavailable particle engines produce no emitter request. An unbound emitter uses the resolved locator position. A missing locator falls back to the actor position.

A bound emitter retains the actor identity and authored locator. Native code passes the initialization descriptor after attachment. Authored particle defaults still need verification.

The descriptor at offset `0x60` contains a 16-byte Molang expression variant. The emitter vtable selects `FUN_1421603e0`, its initialization setter. This setter evaluates a complex program with the emitter's render context at offset `0xd8`. Constant variants, missing programs, and failed emitter preparation do not call the complex evaluator.

Independent execution verifies 16 initialization cases and 64 particle callback cases through the actual setter. The harness supplies emitter preparation and the complex-expression evaluation boundary. Native instructions select the program and its render context after locator attachment. Earlier raw byte captures establish descriptor transport only. These particle probes do not establish sound volume, pitch, captions, or audible output.

Another probe executes `FUN_141e68a20` across 38 clock frames, 16 render-context flag combinations, and suppression followed by re-enabling. Particle dispatch follows bone sampling and precedes sound queuing and Molang timeline scripts. It receives the current clock and previous event cursor. The clock cases cover initial delays, loop delays, held frames, zero weight, custom clocks, equal timestamps, and loop wrapping.

A suppressed native render context skips particle dispatch, sound queuing, and timeline scripts but still advances the event cursor. A later enabled pass does not replay that skipped interval. The probes verify raw context flags. Their mapping to Java preview and world render contexts remains unresolved.

The native timeline sound schema in `FUN_141bcfd40` declares an effect name and an optional locator. Its object and array callbacks, `FUN_141c008f0` and `FUN_141c009b0`, append 104-byte records. Each record contains two 48-byte hashed strings and a float timestamp. Fourteen native constructor cases verify empty strings, float conversion, and both declaration forms. Twenty-four native executions of `FUN_141e88370` verify stable ordering, including equal timestamps.

The sound path executes inside `FUN_141e68a20`. It resolves aliases through the table at player offset `0xc0`. It appends 80-byte requests with the resolved sound name and authored locator to an actor component. Nineteen native cases verify missing aliases, missing bindings, unavailable actor context, event boundaries, exact loop boundaries, wrapping, and suppression without catch-up. The harness supplies component lookup and memory-copy boundaries. The sound path follows particle dispatch and precedes timeline scripts.

These queue checks establish queue contents. The consumer and backend checks below establish position requests and some parameters. Audible output, captions, and production playback remain incomplete.

Independent execution of `FUN_1401c3340` verifies 64 resource availability and lifetime cases. The binder acquires the actor resource and animation definition through two weak references. It assigns the particle table through `FUN_141e69a40` and the sound table through `FUN_141e69a50`. The tables come from definition offsets `0x220` and `0x2b8`. The client-entity parser writes sound aliases to the latter table through `FUN_141d637a0`.

Absent or expired resources leave existing bindings unchanged. Both resource reference counts return to their initial values. This probe verifies native table assignment, not named actor events or production resource loading.

Inspection of `FUN_1414ba900` confirms the first declared emote source. The loader reads its file and adds the selected animation to the shared actor-animation library. The source loader alone does not resolve effect resources. Sound dispatch also requires the actor sound table above.

The extracted base vanilla player definition declares no sound or particle aliases. The two captured owned emotes contain neither effect type. These assets verify existing playback but cannot establish sound or particle behavior. Generic actor schemas establish effect declarations, not the resource bindings used by every persona emote.

Production sound, particle, and named actor event playback remain incomplete. The next implementation needs effect resource bindings, model locator transforms, audio loading, and effect lifecycle management. The renderer does not yet consume model locators. Native instruction probes do not establish audible results, captions, particle appearance, or multiplayer behavior. Executables, probes, fixtures, and exports remain private.

Sources: [Microsoft animation effects reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0?view=minecraft-bedrock-stable), [Mojang particle integration reference](https://mojang.github.io/bedrock-samples/Particles.html), [sound event declaration](https://github.com/LiteLDev/LeviLamina/blob/32fcaa02baa38371b705358801c7d185c284233e/src/mc/world/actor/animation/ActorSoundEffectEvent.h), and [particle emitter methods](https://github.com/LiteLDev/LeviLamina/blob/32fcaa02baa38371b705358801c7d185c284233e/src-client/mc/client/particlesystem/particle/ParticleEmitterActual.h). Generated declarations supplied leads. The target executable and independent execution establish the behavior and record layouts above.

## Licensed animation effect libraries

Extend the package helper's existing licensed acquisition to vanilla sounds, particles, and their texture atlases. The matching Bedrock 1.26.51.1 package stores sound definitions and particles in BR archives, with loose FSB5 sound banks. The root texture archive supplies the flame atlas. The particle texture archive supplies particle and campfire-smoke atlases. Shared directory selection keeps NTFS traversal and segment-index filtering consistent.

Cache format 4 retains all acquired resources and their checksums. Model-only and actor-only caches refresh before use. An incomplete library or failed refresh leaves the previous cache intact and removes staging files. Tests cover both older formats, binary byte preservation, missing effect resources, checksum reuse, and rollback.

The bundled production helper obtains the official license in a fresh Java test. The cache contains sound definitions, FSB banks, particle definitions, and all three referenced atlases. It resolves inherited models and built-in emotes after cache readback, then reuses the saved cache without another acquisition. The replayed full stack builds, and all 193 fixture-enabled add-on tests pass with no skips. Three native helper unit tests also pass; two live acquisition tests require private fixtures.

Private inspection identifies 4,691 FADPCM and 70 PCM16 banks. The particle archive contains 114 MCB definitions and one text definition. A private reference-decoder run restores all 114 MCB definitions using 72 schemas and references exported by the matching official server. This cache change preserves the original binary data. The following sections describe the production decoders. The effect runtime remains incomplete. The reference decoder, server, exported schemas, downloaded assets, and credentials remain private. Production requires no installed game or external extractor.

Sources: [MCB reference decoder](https://github.com/LPaicen/brarchive-extractor) and [server schema export workflow](https://github.com/SmokeyStack/brarchaeology/blob/main/tools/Dump-BdsSchema.ps1). These references guide format research; the live licensed package supplies the target-version data.

## Decode licensed sound banks

Decode the matching package's single-stream FSB5 version 1 banks through the asset loader. Preserve signed PCM16 samples and decode FADPCM prediction, shifts, clipping, frame histories, and stereo interleaving. Custom sample-rate chunks override the header rate. Loop metadata retains its inclusive end as an exclusive sample boundary. Padded final frames stop at the declared sample count.

Validate bank layout, chunk lengths, channel counts, rates, loops, and encoded frame availability. Reject unknown codecs and unsupported flags. Limit decoded PCM to 64 MiB before allocation. The loader resolves banks only beneath the vanilla sound directory and retains the original versioned cache data. The packaged ISC notice preserves vgmstream's copyright and license.

A private harness compiles the unmodified vgmstream FADPCM decoder with file-access adapters. Its PCM checksums match all 4,761 licensed banks through the production asset loader. Another 96 generated banks vary histories, predictors, shifts, clipping, channels, offsets, loop markers, and final-frame lengths. The same checks verify sample rates, channel counts, sample counts, and loop boundaries. Unit tests cover malformed dimensions, truncated metadata and frames, signed PCM, prediction, clipping, and stereo output. Private banks, harnesses, and reference results remain outside the repository.

Sound event parsing, alias bindings, locators, audio output, captions, and effect lifecycle remain incomplete. This change establishes decoding and makes no claim about audible emote playback.

The replayed full stack builds, and all 198 fixture-enabled add-on tests pass with no skips. This includes fresh licensed acquisition through the bundled helper and the complete sound-bank reference comparison.

Sources: [FSB5 layout](https://github.com/vgmstream/vgmstream/blob/7dc938fa2f210943b37c7b6511852b516ef432ab/src/meta/fsb5.c) and [FADPCM decoder](https://github.com/vgmstream/vgmstream/blob/7dc938fa2f210943b37c7b6511852b516ef432ab/src/coding/fadpcm_decoder.c).

## Decode compiled particle definitions

Read particle definitions through the licensed asset loader. The matching 1.26.51.1 base archive contains 114 MCB definitions with format version 1.26.10 and one text definition. The game version and compiled format version differ.

Declare the 70 reachable binary layouts in Java. Preserve ordered fields, optional presence, tagged variants, hashed component identities, maps, and collection order. Production decoding requires no native installation, exported schema files, or external decoder. Preserve the MIT reference decoder's license notice in the add-on resources.

Reject unsupported format versions, unknown or duplicate components, invalid tags, malformed UTF-8, truncated values, and trailing bytes. Bound input size, string length, collection counts, recursion depth, and total decoded nodes. Preserve raw float32 values instead of rounding to the reference exporter's seven significant digits.

Compare all 115 licensed definitions through the production loader against independent reference output. Targeted tests also cover truncation at every byte boundary and invalid counts, tags, booleans, versions, strings, and non-finite values. Acquired assets, schema exports, and reference tooling remain private.

Support MCB 1.26.30 after private licensed overlay acquisition identifies five definitions with that format. The same layouts decode all 108 overlay definitions against the independent reference. Comparisons cover 223 definitions across the base and overlay libraries. The overlay comparisons call the decoder directly. Production acquisition now selects all stable vanilla layers. Other compiled versions remain unsupported.

Definition decoding does not implement particle simulation or rendering. Animation effect parsing, resource bindings, locators, event dispatch, and effect lifecycle remain incomplete.

The full stack build passes with MCB 1.26.10 support. After the overlay format extension, the replayed add-on builds, and all 204 fixture-enabled tests pass with no skips. This includes fresh licensed acquisition and complete base sound and base and overlay particle reference comparisons.

Sources: [MCB reference decoder](https://github.com/LPaicen/brarchive-extractor/blob/503a8ce7ad94030241a3590c926ac36f72169c71/src/mcb-decoder.ts) and [server schema export workflow](https://github.com/SmokeyStack/brarchaeology/blob/main/tools/Dump-BdsSchema.ps1). Matching package bytes establish the compiled format version and reference comparisons.

## Versioned resource acquisition gap

A directory probe against the pinned official client package finds 58 `vanilla_*` entries, including `vanilla_base`. Versioned overlays reach `vanilla_1.26.51`. The probe reads the package index and stops before license acquisition or content extraction. It makes no account changes and requires no installed game.

The production helper currently traverses only `persona` and `vanilla`. The matching base sound archive contains 584 event definitions. These base resources do not establish the final library after versioned overlays apply. Acquisition and resource resolution still need the matching overlay stack, including its precedence and merge behavior. This affects model, animation, sound, and particle coverage. Package indexes, exports, and research helpers remain private.

A private helper then obtains the official license and extracts 303 overlay metadata files and archives. Unpacking yields 835 library files, including 108 particle definitions and 43 sound tables with 1,848 distinct event names. Its compiled particles include 92 files with format 1.26.10 and five with format 1.26.30. Eleven particle definitions use text JSON.

The newest overlay player definition has 68 animation aliases; the extracted base definition has 52. New aliases include crawling, brush, spyglass, goat horn, shield, and first-person and third-person spear tracks. Three base aliases disappear. None of the extracted player definitions declare sound or particle aliases. The production player graph still needs the overlay stack. This evidence broadens the resource and pose gap beyond effect dispatch. All acquired content remains private.

## Versioned vanilla library

Acquire `vanilla`, `vanilla_base`, and numeric vanilla directories from the pinned official package. The matching build supplies 57 layers. Older names such as `vanilla_1.14` imply patch version zero. Keep their paths and manifests separate. Cache format 5 refreshes base-only caches and validates pack UUIDs and overlay versions. Missing layers or mismatched manifests preserve the old cache.

Resolve models, animations, controllers, and client entities by identifier in pack order. Equal duplicates within a pack share a definition. Conflicting definitions remain errors. Preserve each controller's format version so a higher pack cannot change another controller's first-frame behavior. Merge sound catalog entries across both catalog formats. Resolve sound banks, particle files, and textures by pack order. Namespaced block models no longer prevent library loading.

The matching player definition has 68 aliases and comes from `vanilla_1.21.130`. Its root controller retains references to removed first-person aliases. Skip those undeclared references during compilation, consistent with playback allocation. Declared resources that cannot resolve still contribute incomplete tracks. Compile script arrays as one bounded program. The matching 8,141-character pre-animation script spans conditional blocks across JSON strings. Preserve temporary scope and early returns. Bone expressions retain their smaller limits.

A fresh production-helper acquisition loads all 57 layers and reuses the checksummed cache. Licensed fixtures compile the full player graph and sample 120 frames. Tests cover numeric ordering, overrides across filenames, controller format behavior, both sound catalogs, opaque files, archive roots, split scripts, and rollback. Rust tests and Clippy pass. Item query bindings, newer easing functions, first-person rendering, and effects remain incomplete. These tests do not establish native visible motion parity.

Sources: [Resource overrides](https://learn.microsoft.com/en-us/minecraft/creator/documents/overwritingassets?view=minecraft-bedrock-stable), [client-entity selection](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable), and [vanilla layer configuration](https://github.com/tryashtar/minecraft-version-history/blob/master/personal_config.yaml).

The replayed full stack builds and the Prism bundle assembles successfully. A rebuilt Java client passes 722 checks with licensed overlays and a synthetic skin texture. The probe verifies layer selection, the player definition, preview geometry, world-model geometry, and repeated-frame handling. It changes no account recipes. Native visible motion comparison remains pending.

The replayed add-on suite passes all 214 fixture-enabled tests with no skips, including fresh acquisition through the bundled helper.

## Native sound consumer and backend

Bedrock 1.26.51.1's sound queue consumer `FUN_146686950` calls `SoundEngine::playAttached`. Constructor and destructor references identify the engine vtable. A read-only lookup in the running target client identifies the backend method.

The position callback `FUN_14668ffd0` checks the actor's weak reference, registry, entity generation, component, and removal state. A valid locator supplies its current position. A missing locator uses actor position. An unavailable actor leaves the supplied properties unchanged. Independent execution verifies 256 availability, movement, property preservation, and reference cases. External boundaries supply locator resources and the locator lookup.

The engine method `FUN_1441c2ff0` resolves the catalog event before it invokes the backend. A missing event returns the invalid handle without invoking the position callback. The inspected backend method `FUN_14b3b53a0` initializes properties to zero and invokes the callback once. It passes the resulting position to ordinary playback with volume `2`, pitch `1`, and no server sound handle. It does not retain this callback for later movement.

Independent execution verifies 512 cases through the engine method, backend method, and actual position callback. The harness supplies catalog lookup and captures the final playback request. Native code executes the availability checks, position resolution, defaults, and reference cleanup. These cases do not produce audible output.

The backend's ordinary playback method selects a sample by its integer weight. Zero-weight samples receive no selection interval. An event with no total weight returns the invalid handle. Selected sample volume and pitch multiply the incoming values. A nonpositional override clears the selected sample's positional flag. Another 328 native cases verify selection boundaries, zero weights, multipliers, positional overrides, and handle allocation. The harness supplies the random draw and stops before sample loading.

These results establish requests and parameters for the inspected target backend. They do not establish attenuation, category volume, captions, audible output, or native multiplayer results. Production still needs effect resource bindings, locator transforms, dispatch, audio output, and cleanup. Private executables, memory leads, probes, and licensed assets remain outside the patch.

## Modern Molang curves and conditional assignments

Extend the standard math object with inverse interpolation and all 30 easing functions present in Bedrock 1.26.51.1. Preserve float operands, reversed ranges, overshoot, and extrapolation. Exponential curves retain the target's small endpoint offsets. Elastic curves retain explicit endpoint checks and the target's 0.3 period, including the in-out variant.

Independent execution of the target's constant-fold handlers verifies 13,578 cases across all 31 functions. The dispatcher and descriptor table establish their names and argument order. The harness supplies constant eligibility, argument cleanup, and imported exponential and square-root calls. Native instructions perform the curve calculations and sine-table indexing. The initialized target sine table is a private oracle input. Production generates its own table and requires no executable, installation, copied table, or external extractor. Tests allow small float rounding differences from the target's CRT sine implementation.

The licensed player script also exposes assignment precedence errors in Mocha's parser. A conditional assignment retained its boolean condition instead of the selected numeric value. Parse expressions with assignment below conditionals, right-associated nested conditionals, and unary operators around complete function calls. Retain Mocha's lexer, expression types, and evaluator. Bound parser recursion before building the expression tree, then apply the existing expression and execution limits.

Tests cover conditional assignments, explicit parentheses, nested branches, argument side effects, standard math functions, and excessive nesting. A private licensed fixture executes the unchanged player scripts through the actor and bone sampler. Its synthetic bone observes five spear attachment rotations across the raise interval. This proves script evaluation with supplied query values. It does not establish live spear query bindings, first-person rendering, or native visible motion parity. Native executables, oracle data, and licensed player scripts remain private.

Sources: [Microsoft math functions](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/mathfunctions?view=minecraft-bedrock-stable) and [Molang conditionals and versioned nesting behavior](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/syntax-guide?view=minecraft-bedrock-stable).

After integration with the server costume and custom block patches, the full 14-patch stack builds and the Prism bundle assembles. The rebuilt Java client's packaged evaluator passes all 13,578 native curve comparisons and a conditional-assignment check. The maximum absolute difference across these samples is approximately 0.0000763. The comparison permits eight float ULPs plus 0.00001, including cancellation near zero. These results do not prove bit-for-bit equality or native visible motion. The probe changes no account recipes.

The replayed add-on suite passes all 231 fixture-enabled tests with no skips, including fresh licensed acquisition through the bundled helper.

## Native sound catalog defaults and attenuation requests

Bedrock 1.26.51.1's catalog reader uses scalar float conversion for sample volume and pitch. Both default to one; weight defaults to one. The inspected converter returns zero for array and object values. This target behavior differs from the newer published schema's range forms. Preserve the matching reader's behavior until a versioned replacement path has evidence.

Category matching for `music` and `ui` ignores ASCII case. Both categories default to nonpositional samples. Other categories and an absent category default to positional samples. An explicit `is3D` value updates the default used by later samples in the same event. String samples default to no streaming, no interruption, and no concurrent streaming. Object samples default to no streaming, enabled interruption, and enabled concurrent streaming. Native setup and constructor execution verify 141 cases. The harness supplies JSON property lookup, string conversion, and memory copying. Native code performs category comparisons, scalar conversion, flag updates, and sample construction.

The distance setup passes FMOD minimum and maximum distances and chooses rolloff modes. Negative distances log a diagnostic and restore defaults. Default distances are one and 10,000. A positive minimum preserves the current rolloff mode and uses the supplied positive maximum, or 10,000. With only a positive maximum, setup requests linear rolloff from zero to that maximum. The legacy maximum-only path updates the parent sound directly. The ordinary helper also updates each available subsound. Default setup restores inverse rolloff when the loaded sound currently uses linear rolloff.

Independent execution of the setup function, helper, and actual closures verifies 400 cases. These cover minimum and maximum combinations, legacy mode, initial rolloff modes, subsounds, and failed subsound lookups. FMOD methods and diagnostics are supplied boundaries. The checks establish requests, including reversed distance ranges. They do not establish FMOD acceptance of every request, listener output, audible attenuation, category volume, or captions. Production effect playback remains incomplete. Executables, native exports, probes, fixtures, and licensed assets remain private.

The inspected mixer initializer creates effects, music, and text-to-speech groups under the master group. It creates seven named category groups under effects: ambient, block, hostile, neutral, player, record, and weather. The animation playback path searches these category keys with case-sensitive comparisons. A missing category uses the effects group. This also covers music and UI event categories, which have no entry in this map. Their nonpositional sample defaults do not select the separate music group.

Another 80 native cases execute weighted dispatch and the actual category map search up to stream construction. They verify category lookup, case differences, missing groups, fallback, and null group values. The harness supplies the random draw, allocation, and imported memory comparison. The initializer hierarchy is inspected evidence; these cases do not execute its creation or verify volume sliders and audible mixing.

Sources: [Mojang sound schema](https://github.com/Mojang/bedrock-schemas/blob/main/schemas/rp/sounds/index.schema.json), [FMOD mode flags](https://www.fmod.com/docs/2.03/api/core-api-common.html#fmod_mode), and [FMOD sound distance behavior](https://www.fmod.com/docs/2.03/api/core-api-sound.html#sound_set3dminmaxdistance). The target executable establishes the version-specific reader and setup behavior.

### Resolve authored sound samples

Parse the effective vanilla catalog into immutable sound events after versioned overrides. Preserve authored sample order, integer weights, scalar volume and pitch, streaming flags, subtitle keys, raw distances, and the legacy distance flag. Keep category defaults separate from the case-sensitive playback group lookup. An explicit `is3D` value remains the default for later samples. Selected FSB and OGG samples resolve through the same versioned library and bounded decoders.

Another 238 executable cases verify scalar conversions across null, boolean, integer, fractional, string, array, and object values. Null retains each field's default. Numeric strings, arrays, and objects convert to zero for numeric parameters. Nonempty strings and containers are true for boolean flags, including the string `false`. Java fixture comparisons now cover 1,187 native catalog, scalar, weighted-selection, category-routing, and attenuation cases.

An integration test traverses the matching licensed catalog, selects its positive-weight samples, and resolves available FSB banks. It compares decoded PCM, dimensions, and loop boundaries with the independent reference. Tests also check selection limits and cache rollback after a malformed catalog. Licensed assets, native executables, and oracle fixtures remain private.

This change establishes sound resource selection and requested parameters. It does not implement animation effect dispatch, locator transforms, audio channels, captions, or audible mixing. The acquired library contains unresolved sample references, including music assets. Their presence does not establish that the official package lacks those files.

The replayed full stack passes all 240 fixture-enabled add-on tests with no skips, including fresh licensed package acquisition and cache reuse. These checks do not establish audible effect playback.

### Resolve OGG replacements

Resolve formats within a pack before trying lower packs. A higher OGG sample can replace a lower FSB bank. The target executable's extension-list initializer `FUN_140275490` declares FSB, OGG, then WAV. The implemented formats retain that order. [Microsoft's replacement guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/addcustomsounds?view=minecraft-bedrock-stable) establishes replacement across formats. WAV decoding remains incomplete.

Use Minecraft's JOrbis reader after checking page bounds, stream identity, sequence, end-of-stream, Vorbis channel and rate dimensions, and the final sample count. Bound decoded PCM to 64 MiB before allocation. Missing, truncated, oversized, or inconsistent streams fail through the existing asset-loading error path. Convert floats into interleaved little-endian PCM16. This path needs neither a Bedrock installation nor an external decoder.

Private tests compare three licensed samples and six generated mono/stereo streams at 8,000 through 48,000 Hz with libvorbisfile. All 109,603 scalar samples differ by at most one PCM quantization step. Dimensions, exact frame counts, channel order, extensionless catalog selection, truncation, excessive granules, path safety, and format overrides pass. Vorbis loop comments, FMOD output equivalence, and audible playback remain unverified or incomplete. Independent reference files and licensed content stay private.


### Play timeline sound requests

Timeline sounds resolve through the actor's declared aliases. Missing bindings produce no request. Stable timestamps, suppression cursor advancement, repeat frames, and loop boundaries match 19 target executable queue fixtures. Sound events also contribute to inferred animation length, as [Mojang's schema](https://mojang.github.io/bedrock-samples/Schemas.html) specifies.

Static model locators follow the final sampled bone pose. Missing locators use actor position. The attached backend snapshots this position once with gain two and pitch one. Unit tests cover bone inheritance and scale suppression. Scaled world positions and dynamic locators still need native comparisons.

Decode selected FSB and OGG samples off the render thread. Bound pending decodes and active PCM. Use Minecraft's shared audio device, listener, source pools, and category sliders. Preserve authored pitch, source-relative playback, and distance requests. Release static buffers after channels, and invalidate pending requests on reload or disconnect.

Streaming uses the stream pool after full PCM decoding. Gain above one requires `AL_SOFT_gain_clamp_ex`. Native audible mixing, captions, stream concurrency, particles, dynamic emote resource assignment, and exact render suppression conditions remain incomplete.

All 246 fixture-enabled add-on tests pass with no failures or skips. The dependency build and bundle pass. Licensed content, executables, native exports, and runtime probes remain private.


A muted Java runtime test verifies static and streamed PCM channels, licensed FSB and OGG playback, server pack catalog overrides, and snapshot positions. It also verifies authored pitch and attenuation, pause exceptions, natural completion, restart after stopping all sounds, and cancellation of pending decodes. Source gain remains zero throughout. These checks do not establish native audible mixing or locator placement against a native scene.


### Play controller state sounds

Accept state `sound_effects` arrays and resolve their aliases through the actor's effective sound library. [Microsoft's controller example](https://learn.microsoft.com/en-us/minecraft/creator/documents/animationsandcontrollers?view=minecraft-bedrock-stable) establishes this resource shape. The target Bedrock 1.26.51.1 controller queues these sounds after child animation updates.

The controller effect gate also suppresses entry and exit scripts. State transitions still consume their entry, so later frames do not replay suppressed effects. Self transitions reset child players without repeating state effects. Initial-state handling retains the format boundary at 1.18.10. Source arrays retain their declared order.

Independent execution of the target controller update verifies 106 queue and script callback cases. They cover initial transitions, source order, suppression, unavailable bindings and actors, zero weights, reentry, self transitions, and crossfades. Child update and script evaluation functions are supplied boundaries. The checks inspect actual native sound queue writes. Java tests compare every queue and script callback count with these fixtures.

A muted Java client test loads a controller through the production server player factory. It verifies alias resolution to actual PCM channels, suppression of entry scripts without later playback, reentry, and duplicate frames. Source gain stays at zero. All 249 fixture-enabled add-on tests pass with no failures or skips. The dependency build and bundle pass.

Particles, complete native render-context gate bindings, audible mixing, captions, and dynamic emote resource assignment remain incomplete. Native exports, licensed assets, executable fixtures, and runtime probes remain private.


### Establish particle runtime calculations

Independent execution of Bedrock 1.26.51.1 now covers dynamic motion, billboard properties, and emitter component configuration. These checks extend the earlier particle dispatch probes. Production still rejects animation particle effects before playback.

The dynamic motion function, `1461c9ce0`, passes 200 cases with constant component fields. It converts nanoseconds to float seconds. Linear drag uses an exponential velocity update. Drag magnitudes at or below float epsilon use acceleration directly. Position uses the updated velocity. Rotation uses a separate acceleration and drag update. An exponential result at or above the largest finite float clears linear velocity.

The billboard update, `1462b1d70`, passes 492 cases. Sizes clamp to zero. Flipbooks use the imported `roundf`, so frames change at the half-frame boundary. Lifetime stretching computes its rate from the particle lifetime and frame count. Non-looping frames clamp to the last frame; looping frames use `fmodf`. Authored UV steps can be negative. Custom directions retain their magnitude. Derived directions retain the previous direction at or below the squared speed threshold. The definition reader squares the authored threshold.

Private Java implementations match all 6,022 finite scalar results from the motion and billboard cases exactly after float conversion. The native harness supplies the imported `expf`, `roundf`, and `fmodf` results. Billboard variable lookup supplies particle age and lifetime. These boundaries leave native math-library differences and complete Molang integration unverified.

Another 289 native cases cover instant, steady, and manual rates, plus once and looping lifetime configuration. These calls execute the target emitter's actual getter and setter methods. Instant requests stop after the emitted counter becomes nonzero and cap at 1,000. Manual capacity caps at 2,000. Steady emission keeps a float time remainder, uses `floorf` for the batch count, and applies a changed rate after the next batch emits. The probe also checks capacity initialization and conversion of active and sleep times to nanoseconds.

These component checks do not execute particle allocation, lifetime scheduling, collision, materials, or world rendering. The private Java calculations remain research code until the production runtime consumes them. Native exports, executable fixtures, and licensed assets remain private.

Sources: [Microsoft dynamic motion reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_motion_dynamic?view=minecraft-bedrock-stable), [instant emission reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_rate_instant?view=minecraft-bedrock-stable), and [Mojang particle integration reference](https://mojang.github.io/bedrock-samples/Particles.html). The documentation describes the component model. The matching executable establishes the calculations and limits above.

## Initial particle runtime

Connect timeline and controller particle declarations to actor aliases and the world particle pass. Preserve source order, suppression cursors, repeat frames, and replay. Capture the bone player's own Molang state before later timelines run. Controller particles follow sampled child effects and precede state sounds.

Support instant and steady emission, a single emitter lifetime, point and custom offsets, initial velocity and spin, and dynamic or parametric motion. Support gradient tinting, flipbooks, rectangular billboards, world lighting, and `rotate_xyz` or `lookat_xyz` facing. Other components fail explicitly. Particle definitions and PNG or TGA textures use the effective library's pack order.

The motion and billboard kernels consume the target executable fixtures documented above. Production tests compare 200 motion cases and 492 billboard cases, including angular updates and raw direction thresholds. A changing-rate test preserves the native cached rate until an emission. The fixture's direction threshold is already squared. JSON supplies the threshold before squaring.

Decode resources off the render thread. Bound emitters, particles, pending requests, cached definitions, and image memory. Invalidate asynchronous work across world and account changes. Release completed textures and handle failed asset futures during cleanup.

The native component fixtures do not establish the complete emitter scheduler or visible particle parity. Attachment rotation, local-space transforms, native tint quantization, collision, curves, other shapes and facing modes, and nested effect events remain separate work. The production path needs no native executable or external particle decoder.

Particle atlas decoding uses the bounded PNG reader and the existing true-color TGA decoder. A test compares their decoded RGBA pixels and rejects truncated input. A muted Java runtime probe displays a 4:1 TGA billboard and verifies server aliases, world extraction, failed asset cleanup, and texture release. It also verifies explicit rejection of collision effects. Screenshots and fixture assets remain private. This probe does not establish native visible particle parity.

The replayed 14-patch stack builds and produces the Prism bundle. All 261 fixture-enabled add-on tests pass with no failures or skips. This count covers implemented paths and does not establish complete skin, effect, or Dressing Room parity.


## Apply particle collision response

Apply collision after particle motion. Target functions `1461c7460` and `1461c80a0` establish the swept bounds and axis response. Checked motion retains only its last block. Terrain cells use ascending X and Z, with descending Y. The first pass collects boxes; subsequent passes reuse them.

Preserve strict broadphase overlap, parallel slab handling, Z/Y/X entry tie priority, and the target contact bias. Use up to three response passes. Reflect the contacted velocity axis through restitution and reduce speed along the surface through collision drag. Contact expiration removes the particle. The native reader clamps radius to zero through half a block. Its runtime constructor initializes radius, drag, and restitution to zero. Missing `enabled` selects true.

Private independent execution of Bedrock 1.26.51.1 supplies 364 cases. Production matches position, velocity, and ordered terrain queries exactly as float32. Cases include both directions, all axes, corners, radius boundaries, long motion, drag, restitution, disabled collision, translated origins, and expiration. Emitter tests verify contact removal and subsequent bounce motion through production updates.

The harness supplies world collision boxes, emitter accessors, and the imported floor operation. Native collection, sweep, response, drag, and expiration code execute. World playback queries block collision shapes and uses existing native custom-block overrides. A bounded cell cache lasts one extraction frame. Native shape ordering and visible collision parity remain unverified. Collision events still require the nested event runtime. Executables, licensed assets, and native reference fixtures stay private.

The replayed full stack passes all 264 fixture-enabled add-on tests with no failures or skips, including fresh package acquisition and cache reuse.

A muted Java runtime probe uses the rebuilt bundle and a temporary client-side stone platform. It verifies world terrain collision, rebound velocity, contact expiration, and texture release. This probe establishes Java integration and does not compare native visible effects.

## Complete emitter shapes

Add box, sphere, disc, and entity-bounds shapes through one sampler. Generalize point and custom sampling to preserve their interleaved expression order. Box and entity surfaces select faces by area. Rounded shapes use paired random values, disc projection, and the target volume radius calculation. Preserve rounded custom direction magnitudes at the shape boundary. Initial speed then normalizes directions before applying scalar speed. Its scalar expression evaluates separately for each axis. Vector speed overrides the sampled direction.

Target Bedrock 1.26.51.1 functions `1462a6be0`, `1462ad0e0`, `1462aa600`, `1462ab2c0`, and `1462a81f0` establish these behaviors. Constructors select outward direction by default for volume and entity shapes. Independent native execution supplies 646 cases. Production matches every position, direction, and ordered random call exactly as float32. The harness supplies random and entity-bounds accessors; actual native sampling, normalization, projection, and face selection execute.

Timeline and controller particle requests retain an actor attachment accessor. World extraction passes current actor bounds to attached emissions. Unbound emitters retain their fixed origin without actor bounds. Tests verify changing dimensions between births, expression order, and scalar versus vector speed. Licensed assets, executables, and native fixtures stay private. Local-space transforms and native visible parity remain separate work.

Sources: Microsoft's [box reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_shape_box?view=minecraft-bedrock-stable), [sphere reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_shape_sphere?view=minecraft-bedrock-stable), [disc reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_disc?view=minecraft-bedrock-stable), and [entity-bounds reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_shape_entity-aabb?view=minecraft-bedrock-stable). The matching executable establishes the target calculations.

The replayed full stack passes all 269 fixture-enabled add-on tests with no failures or skips. This includes fresh standalone package acquisition, license decryption, extraction, and cache reuse.

Native initial-speed function `1461c2690` supplies 128 additional reference cases. Production matches every velocity exactly as float32, including tiny directions and signed zeros. Tests also verify scalar expression side effects across all three axis evaluations.

The full stack build and bundle pass. A muted Java runtime probe verifies all four new shapes through server aliases and world extraction. It checks 64 sampled particles, live actor bounds, and texture release. A private screenshot confirms visible world rendering. Native visible parity remains unverified.

## Emitter lifetime scheduling

Generalize the emitter clock to once, looping, and expression lifetimes. Preserve nanosecond ages and the target float conversion for active and sleep durations. Expression emitters retain the constructor's 1,000,000-second active duration. Missing `active_time` defaults to zero in once and looping components, as the target schema and readers specify. An inactive expression suppresses emission; expiration permanently stops new births. Existing particles continue until their own expiration.

Target Bedrock 1.26.51.1 `142158a40` evaluates activation before per-update expressions. It then checks cycle reset and expression expiration. The initial update can emit even when it expires during that update. Later expired updates cannot emit. A cycle reset reevaluates durations, resets capacity and the emitted counter, refreshes emitter random variables, and runs creation expressions. It preserves existing particles and the steady rate remainder. It discards age overshoot and resets at most once per update. Molang retains the age and lifetime sampled before reset until the next update. Repeating cycles require an actor context. Expression lifetimes can accompany either duration component, as the official reverse portal definition demonstrates. Native repeat permissions combine across lifetime components, so an expression component can permit a once duration to reset repeatedly.

The native constructor `14216c59b` supplies the default duration. Duration setters, lifetime components, cycle reset `142157210`, and the emission gate establish these rules. The target retains deltas below 101 milliseconds; larger deltas become 100 milliseconds. Production uses the same elapsed interval for its emitter and particle updates. An instant rate retries when capacity prevented every requested birth, because the native counter tracks actual births.

Private independent execution supplies 52 schedules and 416 updates. Production matches birth counts, creation counts, Molang ages, and expiration state. The schedules cover both automatic rates, all three lifetimes, actor presence, zero duration, exact boundaries, sleep, expiration on the initial update, combined expression and duration lifetimes, and large frame deltas. Focused tests also cover expression evaluation order, changed loop times, retained pre-reset context, actor removal, and particle drainage.

The harness executes actual native scheduling, activation, expiration, duration setters, rate components, capacity setters, and cycle reset. It supplies weak resource and actor handles, actor-query refresh, expression callbacks, and birth allocation. It skips random generation and variable registration inside reset. It stops before physics, acknowledges the initial-update flag, and clears the particle population between updates. These checks do not prove native particle aging order, visible timing, local-space transforms, or nested event playback. Licensed assets, executables, exports, and fixtures remain private.

Sources: Microsoft's [expression lifetime reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_lifetime_expression?view=minecraft-bedrock-stable) and [Mojang particle reference](https://mojang.github.io/bedrock-samples/Particles.html). The matching executable establishes the target scheduling behavior.

### Lifetime verification

All 274 fixture-enabled add-on tests pass with no failures or skips. The full dependency build and bundle pass. A muted Java 26.3 probe resolves both emitter types through server player aliases and world extraction. It verifies repeated loop creation, expression deactivation and reactivation, expiration drainage, and resource release.

The existing local server advertises protocol 2169. The runtime probe uses its Java 1.21.11 proxy route. This verifies Java world integration; it does not verify a direct protocol 2193 join or native visible parity. The independent lifetime fixtures use target Bedrock 1.26.51.1.

### Particle birth and aging order

Bedrock 1.26.51.1 emits before updating its particle population. Newborns receive motion in the same frame. Capacity freed during removal becomes available on the next update. Update expressions and motion read the previous particle age. Render expressions read the advanced age, clamped to the lifetime. Lifetime expiration checks the previous age after motion. A particle therefore survives the update that reaches its lifetime.

Use integer nanosecond clocks and the target float-to-nanosecond conversion. Keep `per_update_expression` separate from `per_render_expression`. Remove expired particles by swapping the final particle into their slot, then process that particle before advancing the index. This preserves native population order and avoids delaying a swapped particle until the next frame.

Independent execution of `142158a40` with the actual dynamic motion kernel `1461c9ce0` supplies 40 schedules and 360 updates. Cases cover instant and steady emission, capacity limits, zero and short lifetimes, exact boundaries, overshoot, zero deltas, and expression expiration. Production matches births, callback order, population order, positions, and post-update ages. The probe supplies resource and actor accessors, query refresh, birth allocation, initial position and velocity, and callback bodies. Reset random registration, collision, and render interpolation remain outside these fixtures. Binaries and execution harnesses stay private.

Another 40 native context cases verify lifetime and age variables, including negative values and overshoot. The target query-refresh routine executes with supplied variable lookup and write boundaries. These cases establish the age clamp used by update and render expressions.

Source: [Microsoft particle lifetime reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_lifetime_expression?view=minecraft-bedrock-stable). The target execution establishes update ordering beyond that reference.

All 276 fixture-enabled add-on tests pass with no failures or skips. The full dependency build and bundle pass. A muted Java 26.3 world probe verifies update and render callbacks, nanosecond clocks, motion, loop creation, activation, expiration drainage, and resource release. It uses the existing older-protocol server through the Java proxy route. Direct protocol 2193 joins and native visible comparisons remain unverified.

## Attached particle transforms

Replace live position-only origins with actor and locator matrices. Attached emitters start at zero. Unbound emitters retain the original world position without actor bounds. Parse `minecraft:emitter_local_space` and preserve its position, rotation, and velocity flags.

Bedrock 1.26.51.1 `14215b3c0` retains the full locator matrix when position lookup succeeds. Its fallback uses `1419f7910` for actor translation and yaw. Disabled yaw retains the native 180-degree baseline. A found locator retains rotation and scale even when the rotation flag is false.

Birth function `14215a440` transforms position, velocity, and facing before particle initialization. It adds cached emitter velocity afterward. Main update `142158a40` calculates the next cached velocity after births. The first displacement is zero. Actor loss clears local-position particles while world-space particles drain. Render function `14215cc90` multiplies the attachment and original emitter matrices before transforming particle positions.

Independent native execution supplies 192 actor matrix cases, 60 birth cases, 192 emitter updates, and 180 render position cases. Production matches the captured float32 results and initialization observations. The probes execute the target instructions with supplied actor accessors, locator matrices, callback bodies, and imported float math. The render probe supplies interpolation factors and current/previous particle fields.

World playback samples interpolated actor position and body yaw. Posed bone matrices supply locator rotation and scale; translations convert from pixels. Each attachment owns its matrix snapshot. Geometry tests verify rotated bone axes, inherited scale, scale discard, and world translation.

Native authored rotation decoding, registry-only actor lookup, world locator construction, GPU billboard orientation, and visible native scale remain unverified. Production still needs native render interpolation comparisons. These checks do not establish complete particle or skin parity. Executables, probes, assets, screenshots, and fixtures remain private.

### Attachment verification

All 281 fixture-enabled add-on tests pass with no failures or skips. Fresh standalone package acquisition, license decryption, extraction, and cache reuse pass. The full dependency build and bundle pass.

A muted Java 26.3 world probe verifies the actor adapter and immutable matrix snapshots. World-space births stay fixed while local-position particles follow a moving locator. Unbound particles retain their original position. Actor loss clears local-position particles; world-space particles drain through their lifetime. Update and render callbacks execute, and cleanup releases textures.

The same probe compares 49 matrix products against independent execution of native function `140544f00`. Every float32 output matches exactly. These products use supplied matrices. They do not establish native locator construction or visible scale parity.

The world probe uses the existing protocol 2169 server through its Java proxy route. Direct protocol 2193 joins and native visible comparisons remain unverified.

### Complete native texture projection

The saved official Bedrock 1.26.51.1 Hive stack references built-in bread, bucket and potion images. Extend the licensed package projection from appearance and particle images to every native texture image and texture archive. Preserve path case and all versioned overlays. Cache schema 6 rejects the previous projection and requires a native item image library before atomic publication.

The native helper has four passing unit tests. Its two licensed package probes remain private and were not run for this change. Cache tests cover previous schemas and incomplete image refreshes. The matching package must be acquired again before the Java renderer can use the added images.

The complete matching texture projection measures 4,044 raw files and 149,413,613 bytes, expanding to 18,173 logical files and 211,829,122 bytes. Keep separate 256 MiB limits for raw input and logical output. Archive bytes must not be counted twice. Retain the 8,192-file input limit and bound expanded content at 32,768 files, including the cache readback path. The 32 MiB per-file limit remains in place.

Targeted Java validation passes: 20 tests pass with no failures or errors; two private licensed acquisition probes are skipped. Small synthetic archives exercise both byte budgets, shared offsets, cache roundtrip above the raw file limit, and the 32,768-file boundary. Main and test compilation pass. This add-on does not configure a Checkstyle task.

## Locator rotation and scale suppression

Modern geometry locators now retain authored rotation and compose it after the animated bone transform. Legacy document locators retain their existing offset behavior. Both forms preserve the scaled attachment position when `ignore_inherited_scale` is enabled. The renderer previously removed bone scale before translation, which moved the attachment point incorrectly.

Bedrock 1.26.51.1 locator update `141c362e0` composes translation and locator rotation before calling final matrix setter `142088320`. That setter normalizes the final direction axes when scale suppression is enabled. It preserves the matrix translation. Rotation uses stored radians and a Z-Y-X quaternion composition.

Independent execution supplies 144 cases with axis rotations, combined rotations, reflected and nonuniform scale, shear, and several offsets. Production matches the final matrix within 0.000005. The probe supplies resolved bone matrices, preprocessed locator offsets, stored radians, actor translation, and unit conversion. Actual composition, quaternion math, matrix multiplication, and final scale suppression execute. Imported float sine and cosine are supplied.

Tests also check modern rotation decoding, legacy behavior, and posed model integration. Native geometry parsing, bone hierarchy, actor transforms, and visible comparisons remain outside these fixtures. Licensed assets, executables, and execution fixtures stay private.

Sources: [Microsoft geometry reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/geometry.v1.21.0?view=minecraft-bedrock-stable) and [Blockbench locator import and export](https://github.com/JannisX11/blockbench/blob/master/js/formats/bedrock/bedrock.js). The matching executable establishes transform order and scale suppression.

After integrating current main, all 289 fixture-enabled add-on tests pass with no failures or skips. This includes fresh standalone package acquisition, license decryption, extraction, and cache reuse with the expanded texture projection. The full dependency build and bundle pass after replaying all 15 add-on patches. The locator tests exercise the production posed model and metadata reader. They do not establish native visible parity.

## Piece-specific color controls

Color controls now require the equipped piece's decoded assets and an enabled tint override flag. Skin, hair, facial hair, mouth, and eyes retain their native channel order. Fixed-color pieces offer no editable channels. Unavailable assets keep controls disabled during loading. Account, profile, and piece changes invalidate old results. The save path checks equipped metadata, then checks the account profile again before writing. A slow package download cannot bypass the profile hash check.

Bedrock 1.26.51.1 schema callbacks `148fa0750` and `148fa0960` map `allow_tint_override` to an optional boolean at metadata offset `0x298`. Live factory `1447526e0` uses that field for the piece's runtime flag at `0x410`. An omitted value defaults to enabled. Move constructor `14474a3b0` preserves the flag with the adjacent state bytes.

Independent execution runs the factory assignment, move, and inspected legacy picker branches across 186 cases. These cover native types -1 through 29, loaded and unloaded pieces, and absent, false, or true overrides. The harness supplies decoded optional metadata and the piece-validity accessor. Native instructions choose the default, copy the state, reject unavailable controls, and select channels. The JSON decoder and other UI implementations remain outside these cases.

The Java tests compare the same fixtures and read the licensed starter eye asset. They also reject conflicting metadata and invalid flags. Free pieces without usable receipt keys still lack decoded assets. Additional palette callers and native visible picker comparisons remain unverified. The first-group implementation and its verification limits are recorded below.

Source lead: [LeviLamina's versioned persona metadata definition](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/deps/shared_types/v1_26_40/actor/PersonaPieceMeta.h). The matching executable establishes the field mapping and omitted-value behavior.

All 293 fixture-enabled tests pass with no failures, errors, or skips. This includes fresh standalone package acquisition, extraction, and cache reuse. The new fixture cases establish metadata and channel decisions; the screen's asynchronous controls still need a native visible comparison.

After moving asset acquisition before the final profile hash check, all 18 targeted color, tint, and recipe tests pass with no skips.

## First color edit without saved channels

Eligible equipped pieces now open their color picker without a saved tint group. The first edit creates four transparent channels and replaces the selected channel. Existing groups keep their other colors. Invalid saved groups still fail. Metadata eligibility, palette validation, the final profile hash check, and exact service readback remain required.

Bedrock 1.26.51.1 picker `14713b490` routes single-channel writes through `1470e86f0` and wrapper `14496b9e0`. Interface slot `0x58` points to thunk `141429410`, which reaches editor `1486238a0`. The editor calls recipe setter `148618b90`. That setter initializes four transparent colors before inserting a missing group. It updates only the selected channel in an existing group. Skin edits update the global skin color.

Independent execution covers 240 combinations of type, channel, existing state, and selected color. The probe supplies decoded map state and the security-cookie call. Native instructions build the new key/color pair, observed at insertion boundary `1404b5b40`, or update the existing group directly. Allocation, JSON serialization, HTTPS writes, and visible native UI remain outside the probe.

Java tests compare every exposed color target against the applicable native cases. An unconditional regression test checks first-group creation and preservation of the source profile. All 20 targeted color, tint, and recipe tests pass with no failures, errors, or skips.

The complete fixture suite passes all 296 tests with no failures, errors, or skips. This includes fresh standalone package acquisition, extraction, and cache reuse.

## Native recipe color formats and live first edit

The captured target account uses both six-digit RGB and eight-digit ARGB colors. Palette selection now compares decoded color values through the shared tint parser. RGB and opaque ARGB select the same swatch. Transparent, invalid, absent, and unlisted colors select no swatch. Apply stays disabled for an unchanged color, and saved recipe strings retain their original format.

A muted native 1.26.51 capture opens the equipped eye picker without a saved tint group. The native preview is missing, so Equip stays disabled and the native UI sends no color write. A separate live HTTPS test uses the production request builder and captured native catalog. The service accepts the first iris group and returns its four channels exactly. The test preserves the other profiles, then restores all six original recipes with exact readback.

This verifies the production request shape and service acceptance. It does not verify the full asynchronous save path, native UI save, or visible rendering. Credentials, account snapshots, flows, screenshots, and the live test harness remain private.

After integration with the lighting patch, all 306 fixture-enabled add-on tests pass with no failures, errors, or skips. The two new tests cover palette matching across native color formats and rejection of invalid or unmatched colors. Fresh standalone package acquisition, extraction, and cache reuse also pass.

The full dependency build and Prism bundle pass after replaying all 16 add-on patches. The build verifies the pinned ViaFabricPlus Jenkins artifacts.
