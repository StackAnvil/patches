## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned and freely available persona and emote assets use the current inventory receipt, PlayFab catalog, and official Xbox or PlayFab CDN download flow. The runtime decrypts assets in memory without a native installation, copied keys, or an external extractor. Receipts, content keys, screenshots, profiles, and assets stay private. Resolved recipes use local body assembly, including animated shared body textures. Recipes without usable receipt keys still use the model service.

## Built-in persona package

Load the matching Bedrock 1.26.51.1 persona and stable vanilla libraries from versioned classpath archives.
The StackAnvil build supplies them through the `bedrockBuiltinAssets` Gradle property.
Large native payloads stay outside the exported source patch.
The resource bundle retains native paths, file bytes, and copyright notices.

The supplied PistonDecompiler checkout contains only the executable.
The bundle comes from the matching installed game package and matches every file in the earlier licensed cache.
The build-time extractor handles BR shared offsets, identical overlaps, and loose replacements for installed streaming placeholders.
It rejects conflicting content, invalid paths, and excessive resource sizes.

Validate the protocol version, archive checksums, counts, paths, and expanded sizes before indexing the shared runtime library.
Built-in assets load without an account, network access, or writable cache.
Remove Store sign-in screens, package acquisition, platform helper binaries, and their CI jobs.
Owned Marketplace packs retain their receipt-authorized flow.
Wave, Clap, Over There, and Follow Me use bundled animation sources for preview and world playback.

Tests load the actual bundle without account state and exercise corruption, missing archives, version mismatches, duplicates, and unsafe paths.
Face-mask tests retain native TGA decoding coverage.
The complete native fixture tests use a 2 GiB heap.
All nine bundled-loader cases, two tint-mask cases, and four image-provider cases pass without skips.
The full add-on suite passes 470 tests; 114 optional private-fixture tests are skipped.
Earlier live acquisition and join comparisons remain recorded in the [coverage ledger](../../../docs/bedrock-coverage.md#licensed-archive-overlaps-and-native-collision-baseline-october-6-2026).
They describe the previous downloader, which this change removes.

Source: [BR archive format](https://github.com/bedrock-crustaceans/brarchive/blob/main/FORMAT.md).

## Classic model library

Index the bundled base vanilla model layers under their original paths. Merge equal legacy and modern definitions. Actor compilation requires the player definition, animations, and controllers.

Classic imports resolve missing models and parents lazily through the licensed library. Pack definitions retain precedence. Loading runs on a worker; a changed account or closed screen prevents stale results from opening. Self-contained packs require no asset acquisition.

Licensed tests resolve all seven inherited entries from the base skin-model library, including the zombie parent from an entity file. They verify equal duplicate definitions, model decoding, and native inheritance. The loader now resolves versioned vanilla model overrides. The classic importer applies the native ASCII lowercase rule before legacy bone merges and parent lookup. This rule resolves the Vex model's `rightArm`/`rightarm` mismatch. Native visual comparisons and other inheritance edges remain pending.

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
- Bundled-resource tests verify accountless loading, archive integrity, version checks, and face-mask decoding.
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

The extracted base player graph does not reference these three variables. These checks establish authored track bindings. Complete native item poses remain incomplete. Local charging prediction, item-name mappings, exact native durations, first-person playback, and native visual comparisons remain pending.

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

Resolve models, animations, and controllers by identifier in pack order. Merge client-entity description objects by key; higher lists and scalar values replace lower values. Equal duplicates within a pack share a definition. Conflicting definitions remain errors. Preserve each controller's format version so a higher pack cannot change another controller's first-frame behavior. Merge sound catalog entries across both catalog formats. Resolve sound banks, particle files, and textures by pack order. Namespaced block models no longer prevent library loading.

The matching player file declares 68 aliases and comes from `vanilla_1.21.130`. The effective description retains four aliases from lower layers. Only references absent from the merged dictionary are undeclared during compilation and playback allocation. Declared resources that cannot resolve still contribute incomplete tracks. Compile script arrays as one bounded program. The matching 8,141-character pre-animation script spans conditional blocks across JSON strings. Preserve temporary scope and early returns. Bone expressions retain their smaller limits.

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

Independent execution of the target's constant-fold handlers verifies 13,578 cases across all 31 functions. The dispatcher and descriptor table establish their names and argument order. The harness supplies constant eligibility, argument cleanup, and imported exponential and square-root calls. Native instructions perform the curve calculations and sine-table indexing. The initialized target sine table is a private oracle input. Production generates its own table and requires no executable, installation, copied table, or external extractor. Tests allow small float rounding differences from Wine's sine implementation in the Linux native-client capture.

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

This verifies the production request shape and service acceptance. The full asynchronous Java save path remains unverified. Credentials, account snapshots, flows, screenshots, and the live test harness remain private.

A later native capture restarts with populated assets and no saved eye tint group. The character preview appears, and the visible iris picker previews Light Blue. Equip applies the selection locally. The client sends its appearance PUT during shutdown, then service readback contains `['#ff86baea', '#0', '#0', '#0']` for Standard Eyes. Native serialization also updates the recipe version, supplies `cs_arm`, reorders pieces, and replaces an unresolved piece. The captured request matches service readback. All other profiles remain unchanged, and the test restores all six original recipes exactly. This establishes native first-color persistence and its ARGB format.

After integration with the lighting patch, all 306 fixture-enabled add-on tests pass with no failures, errors, or skips. The two new tests cover palette matching across native color formats and rejection of invalid or unmatched colors. Fresh standalone package acquisition, extraction, and cache reuse also pass.

The full dependency build and Prism bundle pass after replaying all 16 add-on patches. The build verifies the pinned ViaFabricPlus Jenkins artifacts.

## Native free claims and Minecoin acquisition

The native Store catalog puts `requiresRedeem` at item level. Its `flags` field is an array. Correct that mapping and retain paid offers with their exact integer price. The mutation builders reject unacquired items, while removal remains available for equipped pieces.

The wardrobe now offers Get for zero-price claims and a price confirmation for paid offers. Before purchase, refresh catalog ownership and published metadata. Reject changed prices, product IDs, content types, and pack identities. Submit one `/transaction/virtual` request with the confirmed Minecoin amount. Poll only catalog and receipt reads until both ownership and the specific pack key arrive. Do not automatically equip after acquisition.

A muted Bedrock 1.26.51.1 native capture uses an isolated profile with an empty persona cache. Its first inventory supplies 25 keys with one distinct decoded value. Native Get for Secret Handshake adds a new entitlement and key, then exposes Equip. The capture sends no appearance PUT. Separate `/transaction/redeem/xbox` calls synchronize Microsoft Store DLC. Its implementation follows below.

A live zero-cost Shadow Boxing claim uses the production request builder and correlation-only telemetry. The service accepts it and returns an opaque string transaction ID. Production validates the response, reads catalog ownership and the matching receipt key, and decrypts the six-file pack and parses its 3.13-second animation. All saved appearances remain unchanged. These two verification claims permanently add free entitlements. No Minecoins are spent.

Full asynchronous screen acquisition and paid transactions remain unverified. The captured inventory establishes the receipt key source for this account. Accounts without receipt keys still need separate evidence and implementation. Credentials, receipts, raw traffic, assets, and test probes remain private.

All 311 fixture-enabled tests pass with no failures, errors, or skips. Five new tests cover confirmed prices, stale or invalid purchase metadata, product and pack identity, response validation, and recipe mutation eligibility. Fresh licensed-package extraction and cache reuse also pass. The full dependency build verifies the pinned ViaFabricPlus Jenkins artifacts, and the Prism bundle passes after replaying all 16 add-on patches.

A real account probe also passes the asynchronous already-owned acquisition path and loads the claimed emote through the production account asset loader. This path sends no purchase request. The screen's transaction path still needs a live UI test. A separate Xbox redemption probe returns HTTP 401 with the account manager's general Xbox Live token. The PlayFab-scoped token resolves this rejection, as verified below.

## Microsoft Store redemption authentication and refresh

Character Creator and owned classic packs now synchronize purchases before refreshing their catalogs. Use the selected account's XUID and PlayFab-scoped Xbox token through MinecraftAuth. The native request nests them under `Redemption.MarketplaceData.userId` and `xboxAuthentication.XboxToken`. Production requires no local native installation or captured credentials.

Microsoft's [Store redemption reference](https://learn.microsoft.com/en-us/rest/api/playfab/economy/inventory/redeem-microsoft-store-inventory-items?view=playfab-rest) requires the PlayFab token audience. [MinecraftAuth's Bedrock manager](https://github.com/RaphiMC/MinecraftAuth/blob/main/src/main/java/net/raphimc/minecraftauth/bedrock/BedrockAuthManager.java) provides a dedicated holder for it. The general Xbox Live token receives HTTP 401 from the native Minecraft redemption endpoint. The PlayFab token receives HTTP 200 with correlation-only telemetry.

Parse successful and failed offer arrays and opaque transaction IDs. Existing synchronized purchases can succeed without a new transaction ID. Preserve partial results and refresh the current receipt before loading ownership. Screens continue loading their catalogs if synchronization fails. Retain existing rows and recipes during refresh, disable dependent mutations, and reject stale account or screen results.

A live asynchronous production probe synchronizes ten offers with no failures and no new transactions. It preserves every saved appearance and existing receipt key. Subsequent production catalog loads return two owned classic packs and the persona emotes, including the earlier acquired Shadow Boxing item. Interactive screen behavior and paid acquisition remain unverified.

All 316 fixture-enabled add-on tests pass with no failures, errors, or skips. Five new cases cover the redemption payload, invalid credentials, partial results, malformed results, and a private native request/response fixture. Fresh licensed-package extraction and cache reuse also pass. Captures, credentials, receipts, account snapshots, and probes stay private.

## Particle render curves

Support all four documented curve types: linear, Bezier, Catmull-Rom, and Bezier chains. [Microsoft's curve reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecurves) describes their definitions and render variables. The Bedrock 1.26.51.1 parser and evaluators establish the target behavior.

Evaluate curves before each particle's render expressions. Preserve independent variables, dynamic nodes, curve dependencies, and native node evaluation order. Empty chains leave registered values unchanged. Clamp horizontal ranges to float epsilon. Chain control offsets divide slopes by three without scaling by segment duration. Preserve the native grouping of float multiplications and additions near boundaries.

Independent execution supplies 196 evaluator cases and 90 range and variable publication cases. Production matches every result exactly. The harness supplies constant Molang nodes, parsed chain segments, imported floor, and variable lookup/write boundaries. Parsing, variable registration, render scheduling, and visible comparisons remain outside these fixtures.

Four additional executions record native Molang node access. Linear reads the right node before the left. Bezier reads all four from last to first, including a clamped input. Catmull-Rom reads its four segment nodes in order. The Java evaluator preserves these orders for expressions with side effects.

Five targeted tests cover native comparisons, particle state isolation, render callback order, dynamic ranges, expression dependencies, and malformed definitions. These tests exercise the emitter's visual output, but do not establish native visible parity. Raw binaries, decompilation, fixtures, and probes remain private.

All 321 fixture-enabled add-on tests pass with no failures, errors, or skips after replaying all 16 patches. Fresh licensed-package extraction and cache reuse also pass. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Manual particles and nested particle events

Support manual emission and particle creation, expiration, and timeline events. Resolve named event trees with ordered sequences and weighted random branches. Child effects support `particle`, `particle_with_velocity`, `emitter`, and `emitter_bound`. The [Creator event reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents) describes these forms. The [particle lifetime reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_lifetime_events) defines their triggers.

The Bedrock 1.26.51.1 particle component registration points to creation callback `FUN_1461c4e40`, expiration callback `FUN_1461c4f20`, and timeline callback `FUN_1461c5000`. Emitter events use separate callbacks, described below. Timeline intervals include the previous age and exclude the new age. Event times retain the native float conversion to nanoseconds.

Native graph dispatcher `FUN_142164cb0` chooses its random branch before it executes the sequence. It executes that branch after the sequence. Both inspected constructors omit leaf actions when a node contains `sequence` or `randomize`. Preserve those rules for JSON assets and decoded compiled assets.

Manual emission creates one particle immediately. Capacity getter `FUN_1462a4d10` evaluates the maximum on each request and caps it at 2,000. Preserve its unsigned conversion before the cap. Birth routine `FUN_14215a440` adds the supplied position and velocity to the shape sample before birth transforms and initialization.

Playback reuses manual child emitters by effect within each parent. Ordinary child emitters start at the event position. Bound child emitters inherit the parent's actor and locator supplier. When the actor is already absent, they start at the event position. Child effects own fresh Molang variables. Their initialization script runs after emitter creation. Particle events retain a copy of the source position and the requested velocity through asynchronous asset loading.

Dispatch children after the active emitter iterator closes. Apply existing world and account generation checks to pending loads. Limit active emitters to 512 and total particles to 16,384. Limit each emitter to 1,024 event nodes per update and child nesting to 16 levels. Bound pending loads, event requests, and diagnostic logs.

Private native execution covers 30 timeline cases, 16 event trees, and 15 manual capacity conversions. Native callbacks supply position, velocity, random draws, and expression execution. These probes do not execute asset lookup, JSON construction, or complete simulation scheduling. All private binaries and probes remain outside the patch.

Tests also cover immediate births, changing capacity, velocity inheritance, lifetime triggers, recursive limits, and the extracted lava-to-smoke flow. The target lava effect now emits manual smoke particles through its timed `particle_with_velocity` events.

Level sound events remain explicit unsupported cases. Native comparisons still need to establish bound child queries, event expression context, asynchronous timing, and visible particle results. This change does not establish complete particle parity.

All 328 fixture-enabled add-on tests pass with no failures, errors, or skips after replaying all 16 patches. Fresh licensed-package extraction and cache reuse also pass.

The final actor-fallback change passes all 45 particle tests. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

After integrating concurrent actor-material and lighting changes, all 334 fixture-enabled add-on tests pass with no failures, errors, or skips. The combined stack replays all 16 patches. The full dependency build and Prism bundle also pass.

## Dispatch collision events and filter splash particles by blocks

The extracted water-drip definition declares three collision events that spawn manual rain-splash particles. Its splash definition requires `minecraft:particle_expire_if_not_in_blocks`. Support that component and `minecraft:particle_expire_if_in_blocks` so both definitions enter production playback.

Native collision routine `FUN_1461c7460` dispatches once after its response passes. Thresholds use the incoming velocity projected onto the final contact normal. Contacts require a positive particle lifetime. Dispatch precedes contact expiration. Parser `FUN_1461c6e00` accepts a single trigger or an array and clamps `min_speed` to the native minimum of two.

Preserve the native contact frame without normalizing its tangent vectors. Native getter `FUN_142167190` supplies event coordinates from particle and emitter fields. Those coordinates can differ from render positions. Retain the frame through asynchronous child requests and fixed child construction.

Native block predicate `FUN_1461c3580` disables empty lists. It floors float32 particle coordinates plus the emitter origin. It compares membership with the component's inclusion flag. The emitter shares the first initialized block set between its expiration predicates. Getter `FUN_1421633b0` returns the base origin. Membership routine `FUN_142163290` compares block identities from the block source.

Production obtains original block identifiers from ViaBedrock's tracked primary palette and block-state rewriter. It does not infer identifiers from translated Java blocks. Effects with nonempty filters require explicit world access. Unknown identifiers count as nonmatches. Predicate evaluation follows motion and lifetime events, as inspected in `FUN_142158a40`.

Private native execution supplies 74 collision event cases, 16 coordinate cases, and 64 block expiration cases. The collision probe supplies an identity event-frame template, terrain, and source callbacks. It does not execute global startup initialization or child playback. The block probe executes the predicate, origin getter, cache flag, and membership lookup. It supplies a prepared block set and block-source identities. Native name resolution and complete scheduling remain outside those cases.

A production test loads the extracted water-drip and rain-splash definitions. It follows the authored hanging period, emits three impact requests, and advances their splash particles to expiration. Additional tests cover thresholds, dispatch order, event frames, block boundaries, empty filters, and expiration events. These checks do not establish native visible particle parity. Native assets, binaries, and research fixtures remain private.

After replaying all 16 patches, all 343 fixture-enabled add-on tests pass with no failures, errors, or skips.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts. The final block-filter tests also pass against the updated native fixtures.

## Play emitter lifecycle and travel events

Support the five fields in the [emitter lifetime events reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftemitter_lifetime_events?view=minecraft-bedrock-stable). Dispatch their named events through the existing bounded event graph and child asset loader.

Bedrock 1.26.51.1 uses `FUN_1462a3690` for creation, `FUN_1462a3710` for expiration, `FUN_1462a3790` for timelines, and `FUN_1462a3870` for travel. The emitter update calls creation once on its first update, after births and origin sampling. Lifetime loop resets do not repeat that event. Expiration runs once before the next origin sample; existing particles can continue draining. Actor loss dispatches expiration before activation and update expressions. Cycle expiration precedes its creation expression.

Timeline events run only during active updates of a live emitter. Their interval includes the previous age and excludes the current age after any loop reset. Event requests retain the emitter's cached world position and velocity. Those caches begin at zero, as inspected in constructor `FUN_14216ba90`.

Travel accumulates float32 displacement after the first update. Loop resets preserve that distance. Direct thresholds use the same half-open interval as timelines. Each repeating declaration fires once per update when its floor quotient changes, even when movement crosses several intervals. Preserve native integer conversion for zero, negative, and very small intervals.

Parser `FUN_1462a15d0` retains JSON member enumeration order for timeline and direct distance maps. Enumerator `FUN_14e01ece0` walks the native tree in order. Production uses lexical key order, consistent with [JsonCpp's key comparator and member enumerator](https://github.com/open-source-parsers/jsoncpp/blob/master/src/lib_json/json_value.cpp). This ordering follows source and decompilation inspection; the schedule probes supply prepared vectors rather than execute JSON parsing. Array declarations preserve authored order. Limit each map or array to 256 entries and reject nonfinite or excessive distances.

Independent execution supplies 52 schedules, 364 native updates, and 288 distance predicate cases. The schedule probe executes the native update, event callbacks, cached origin and velocity, expiry, and reset. It supplies actor, resource, and query accessors, translation matrices, expression callbacks, and named-event receipts. Automatic births are disabled, and reset random registration is skipped. These cases do not establish child scheduling, complete Molang context, asset lookup, or visible parity. Binaries, assets, probes, and fixtures remain private.

Production tests compare event order, source coordinates, inherited velocity, and expiration state against those native results. Additional checks cover malformed definitions, map order, expiration before loop initialization, and particle drainage.

All 347 fixture-enabled add-on tests pass after replaying the 16 patches, with no failures, errors, or skips. This includes 58 particle tests, fresh licensed-package extraction, and cache reuse.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Play particle level sound events

Resolve `sound_effect.event_name` as a level sound event, as the [Creator reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents?view=minecraft-bedrock-stable) specifies. Particle events pass no block or entity selector. Use `individual_event_sounds` from root `sounds.json`, then resolve the configured catalog sample. Acquire this root file with the official package assets and refresh caches through format seven.

Native dispatcher `FUN_142164cb0` dispatches particles, sound, expression, and log in that order. Unknown event value 614 suppresses only sound. Sound requests retain the event matrix translation, data -1, an empty actor identifier, and baby false. Independent execution supplies 56 prepared leaf cases. Level and Dimension accessors, expression and log boundaries, and sound receipts are supplied. These cases do not execute enum name lookup or audio output.

Native name resolver `FUN_143454f70` uses ASCII lowercase conversion from `FUN_1403201d0`. Production gets accepted names from ViaBedrock's pinned protocol 2193 mappings, including null Java mappings. This establishes the target data source, not independent native verification of every name or numeric value.

Read group defaults and per-event ranges through the inspected generic configuration path. `FUN_1441d0e40` initializes both group ranges to -1. `FUN_1441c9ac0` retains those ranges for string configurations and overrides them for object configurations. `FUN_140acfee0` accepts numbers, booleans, arrays, min/max objects, and numeric strings. Arrays use their first two values, sorting reversed endpoints. Objects clamp max to min. Unsupported scalar conversions produce zero; null fields retain their incoming defaults. Protect production with finite parameter, string, and catalog limits.

Independent execution of the full range reader supplies 34 numeric, boolean, object, and array cases. JSON member/index lookup and string-copy boundaries are supplied. Stringstream parsing follows inspected code and remains outside these execution fixtures. Production rejects malformed range strings rather than reproducing arbitrary failed stream state.

Native scalar samplers `FUN_1441b2ed0` and `FUN_1441b2f80` use two unsigned random draws for varying ranges. Their triangular float32 calculation preserves draw order and skips constant or reversed ranges. The level dispatcher samples pitch before volume. Independent execution supplies 70 sampling cases with supplied random integers. Another nine cases execute the command volume clamp and playback gate in `FUN_1441bf810`. Clamp volume to one before catalog sample multiplication. Suppress requests whose command volume is zero, including absent inherited volume.

Use the existing bounded decoder and shared PCM player for resolved samples. Fresh licensed extraction supplies 6,117 files, including all root sound configurations. An integration test resolves water dripstone, lava dripstone, and honey drip sounds through the official overlays and decodes their PCM. Server root configuration retention belongs to the server effect library patch.

These checks do not establish seeded random generation, native audible mixing, captions, native server comparisons, or a complete level-event context resolver. Executables, licensed assets, probes, and fixtures remain private.

All 365 fixture-enabled add-on tests pass with no failures, errors, or skips across 72 suites. The final particle sound and server override checks also pass after folding server configuration retention into its owning patch. All 16 patches replay. Fresh license acquisition, package extraction, and cache reuse pass with the bundled helper.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Render every particle facing mode

Support all eleven modes in the [billboard reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_billboard?view=minecraft-bedrock-stable). Use explicit columns for camera, direction, and emitter planes. A quaternion cannot preserve the target's reflected or sheared axes.

The owned Bedrock 1.26.51.1 name table in `FUN_142160da0` maps the modes to values 1 through 11. Its CPU quad builder in `FUN_142167710` consumes prepared particle records. The package shaders receive finished vertices. The native renderer independently normalizes emitter columns before the XZ and YZ quarter turns. World directions retain the full matrix product before normalization. Zero-length emitter columns produce nonfinite axes; production suppresses those quads before Java vertex submission.

Independent native instruction execution supplies 286 facing cases, 32 emitter basis cases, and 144 world direction cases. The facing probes execute all eleven branches and `FUN_14216add0`, the camera look-at helper. They cover vertical direction boundaries, coincident cameras, zero directions, scaled locators, shear, and reflection.

Another 440 cases execute the native spin matrix multiplication after each facing branch. Imported float32 `cosf` and `sinf` results are supplied at the math boundaries. Production applies spin to the explicit axes and computes frustum bounds from their corner extents. Tests also verify frame snapshots and sheared corner bounds.

These prepared probes supply inverse-view columns, particle state, normalized directions, emitter axes, and the runtime identity constant. They exclude camera selection, complete frame interpolation, vertex submission, and native visible output. Licensed package shaders, executables, licenses, account data, and native fixtures remain private. Production requires no external game installation or native research tool.

All 371 tests pass across 73 suites with no failures, errors, or skips. This includes fresh package license acquisition, extraction, and cache reuse. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.

## Preserve the native child emitter frame

The [particle event reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents?view=minecraft-bedrock-stable) distinguishes ordinary emitters, actor-bound emitters, and manual particles. Native factory `FUN_1421667d0` preserves the ordinary event matrix. Actor-bound factory `FUN_142166990` constructs an emitter at identity through `FUN_142130e20`, then binds the actor and locator through `FUN_142160260` and `FUN_14215ffc0`.

The setter stores the supplied offset in binding metadata. It does not replace the constructor's base origin or matrix. The actor-bound child therefore uses its sampled actor/locator frame without an additional collision rotation. Production previously retained the collision axes after removing translation. Use identity for bound children and manual emitters. Preserve the complete event frame for ordinary emitters and unbound fallbacks.

Independent native execution supplies 24 factory cases with ordinary and bound effects, different event matrices, valid and invalid handles, and present or absent weak actor references. The probe records constructor matrices and binding writes. Resource lookup, allocation/constructor, initialized identity and zero constants, binding liveness, string copying, and context cleanup are supplied. These cases do not execute event branch selection, actor query evaluation, asynchronous child scheduling, or native visible output.

Production tests compare the constructor transforms and resulting particle placement. A regression also checks a bound child on a scaled locator, the unbound contact-frame fallback, and manual emission coordinates. Native binding metadata and complete child expression context still need runtime comparisons. Executables, assets, probes, and fixtures remain private.

Another 12 cases execute the full native leaf dispatcher for ordinary requests and bound requests without an actor. Both retain the event matrix. Valid child handles run the child initialization callback before the source expression; invalid handles skip child initialization and retain the source expression. The probe supplies binding liveness and expression callbacks. Actor-present branch selection, actual Molang evaluation, and scheduling remain outside these receipts.

All 373 fixture-enabled tests pass across 73 suites with no failures, errors, or skips. Fresh package license acquisition, extraction, and cache reuse pass. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Refresh particle actor queries

Attached effects now use the player's sampled actor query bindings. Sample those bindings before the emote pose branch, so emotes retain water and motion queries. Water and motion callbacks read the current entity. Each emitter and particle retains its own Molang variables. Query refresh does not copy the parent's variables or animation clocks.

Refresh queries before child initialization, before each update, and before render expressions. Existing particles receive the same refreshed map. Camera distance uses the cached previous emitter position. Generic particle `anim_time`, `delta_time`, `frame_alpha`, and `life_time` retain the target context's zero defaults. Emitter and particle ages remain separate lifetime variables.

Native initialization gate `FUN_1421603e0` refreshes context through `FUN_142159bd0` before the child script callback. The actor pointer supplies actor queries. Native `ground_speed` callback `FUN_14220ecd0` scales all three motion components by 20, including vertical motion. Its assembly sums `z*z + (y*y + x*x)` before the float32 square root. Preserve that order to avoid a one-bit rounding difference from the decompiler's grouping.

Independent native execution supplies 54 prepared context cases. These cover absent actors, resolved actors, unresolved bindings, water membership, camera positions, and lifetime values. Seven scalar query callbacks execute against those contexts. Actor resolution, level access, variable access, expression callbacks, and motion component lookup are supplied boundaries. Native velocity scaling and length execute after the supplied component lookup.

Production tests compare all seven query values exactly as float32. Additional tests refresh existing particles, retain their local variables, and preserve parameterized actor queries. They also verify immutable binding maps and context removal. These cases exclude live actor updates, full query coverage, asynchronous scheduling, and native visible output. Spell-color structures, effect-count queries, and complete offscreen actor context remain incomplete. Executables, assets, probes, and fixtures remain private.

All 376 fixture-enabled tests pass across 74 suites with no failures, errors, or skips. This includes all 73 particle tests. Fresh license acquisition, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Preserve child binding offsets

The actor-present branch in native leaf dispatcher `FUN_142164cb0` passes the parent's base origin to `FUN_142166990`. The bound factory constructs at identity and writes that origin as binding metadata. The actor fallback branch in `FUN_14215b3c0` adds this offset to translation. A resolved locator supplies its complete matrix and ignores the offset.

Production now retains the offset separately from the actor and locator matrices. Each child replaces the offset with its parent's base origin. Nested children therefore do not accumulate ancestor offsets. The copied attachment retains the same bounds and query bindings. Root attachment matrices keep their existing behavior.

Independent execution supplies 48 combined native cases. The full leaf dispatcher, factory wrappers, binding setter, initialization gate, and context refresh execute. Resolved actors reach the initialization callback with the child actor context before the source expression. Ordinary requests and requests without bindings use the event frame. Invalid handles retain the source expression without child initialization.

Removed actors and missing actor components follow a separate registry path. They use the parent's base origin for construction, retain its previous binding metadata, and suppress child initialization. The adapter described below now covers this registry path. Native live lifecycle comparisons remain outstanding.

The probe supplies resource lookup, constructor allocation and fields, binding getters, weak registry resolution, level access, variable access, expression callbacks, and string copying. Actor component lookup executes against prepared ECS tables. Actual Molang evaluation, asynchronous loading, complete emitter updates, and visible native playback remain outside these cases.

The 192 native matrix comparisons now exercise the production binding offset adapter directly. Earlier tests added the offset before constructing the attachment. A new child/grandchild regression verifies offset replacement, actor fallback placement, rotation-only matrices, and scaled locator behavior. Native executables, assets, probes, and fixtures remain private.

All 377 fixture-enabled tests pass across 74 suites with no failures, errors, or skips. This includes all 74 particle tests. Fresh license acquisition, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Retain particle registry components after actor loss

Separate registry binding presence from actor query validity. Native transform helper `FUN_14215b3c0` resolves locators and position/yaw components without an actor object. Its fallback interpolates float32 positions and wrapped yaw, with a different rotation convention from the actor-object helper. It ignores the binding offset. A resolved locator supplies its complete matrix.

Java now samples retained render components when its avatar disappears but the original network actor remains tracked. The network owner identity invalidates removed or replaced actors. The same attachment supplier continues to provide matrices without actor queries or actor bounds. World changes still invalidate the supplier and pending asset work.

Registry-only bound children construct at the parent's base origin and retain its previous binding offset and locator. A missing actor context suppresses child initialization. The source event expression still runs. The combined 48 native dispatcher/context cases now compare these child frames and initialization gates through production code. Invalid asset handles remain outside the Java emitter comparison.

Native emitter update `FUN_142158a40` expires an invalid context before activation and update expressions. Its first-update flag still permits births. Local-position particles remain hidden through render gate `FUN_14215cc90`. Later invalid updates clear their population. World-space particles drain normally. Context recovery does not revive an expired emitter, but it can reveal retained local particles before the next invalid update.

Independent execution supplies 384 complete registry matrix cases. It executes registry handle validation, component lookup, locator caching and matrix copying, yaw wrapping, and position interpolation. Imported float32 sine, cosine, remainder, and byte comparison are supplied. Binding getters and weak registry resolution are supplied. Prepared component tables and initial identity outputs limit these checks.

Another 12 schedules supply 36 native updates. They cover initially missing contexts, actor loss after an update, and context recovery. The native update, expiry flag, first births, age advancement, and population removal execute. Resource/binding getters, query validity, identity transforms, particle allocation and initial values, and creation/update expression receipts are supplied. Motion components are disabled. Eight render-entry cases execute the enabled/context/local-position gate, then stop before resource and frame work.

Production tests compare all 384 matrices exactly as float32. They also compare schedule populations, enabled render gates, initialization suppression, and retained child offsets. The existing query-retention regression now uses world-space particles, because native local-position rendering stops after actor loss. Network state tests cover owner removal and replacement identities.

Live retained-component lifetime, registry locator construction, missing position components, unavailable actor bounds, complete query coverage, asynchronous child dispatch, and native visible output still need comparisons. These checks do not establish complete particle or skin parity. Executables, assets, probes, and fixtures remain private.

All 380 fixture-enabled tests pass across 75 suites with no failures, errors, or skips. This includes all 77 particle tests and network owner replacement checks. Fresh license acquisition, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Dispatch child events before source expressions

The [particle event reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particleeffectevents?view=minecraft-bedrock-stable) places each pre-effect script in the child emitter's separate Molang context. The existing 48 native dispatcher/context cases establish initialization before the source expression. Invalid handles and invalid actor contexts skip initialization while the source expression still runs.

Preload reachable child definitions and textures before root playback. Discovery covers every parsed sequence and random branch, including zero-weight branches. Shared definitions load once per graph. Visited identifiers terminate cycles. Missing child handles settle discovery without suppressing the source expression. Existing resource, image, emitter, and recursion limits remain active.

Replace the emitter's deferred event queue with a direct dispatcher. Child construction, query refresh, initialization, and manual emission finish before the event leaf evaluates its source expression. Manual children reuse their existing emitter. Population checks refresh during births so inline children cannot exhaust the shared budget unnoticed.

Update a snapshot of existing emitters, then collect visuals from the current population. This avoids mutation during iteration and includes newly emitted manual children in the same render extraction. Newly constructed emitters receive their first update on the next frame. The prepared manager checks described below now cover update batch membership. Live frame timing remains unverified.

Production tests compare initialization/source order across all 48 native cases, including invalid handles and registry contexts. They evaluate the child Molang script and verify variable isolation. Additional tests cover pending/shared/cyclic dependencies, missing handles, discovery limits, parsed branches, and population contention during manual child births. Existing event tests now observe direct callbacks.

These tests use the previously recorded native receipts. They do not execute native asynchronous asset loading or establish cold-load start timing, new-emitter frame order, or visible native playback. The loaded Java graph removes asynchronous dispatch between the event leaf and its child initialization. Full particle and skin parity remains incomplete.


All 385 fixture-enabled tests pass across 77 suites with no failures, errors, or skips. This includes all 82 particle tests. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Preserve native emitter batch membership

Native manager `FUN_14216d250` removes dead emitters before building a temporary update batch. Each removal replaces the dead entry with the last registered entry. Its update loop captures the batch end before any emitter callback runs. Child emitters appended by those callbacks wait for a later batch.

Production previously removed emitters immediately after their update and preserved the remaining list order. Move removal before batch capture and use the native replacement order. Emitters that die during an update remain registered until the next batch. The render pass still includes newly emitted manual particles.

Independent instruction execution supplies 16 manager schedules with 80 frames. The complete manager function executes against prepared primary and temporary arrays. Native expiry getter `FUN_142158a20` checks the expiry flag and empty population. Native population getter `FUN_14215cc70` computes the count from the particle range. Native removal, batch construction, loop bounds, clock conversion, skip gate, and callback order execute.

The probe supplies platform counter/frequency, ambient grid samples, metrics access and cleanup, and emitter identity/update/destructor callbacks. The update callback appends prepared child records or changes the parent expiry flag and population range. It does not execute real emitter updates, factory construction, resource loading, Molang, or visible playback.

Production tests compare callback order, registered membership, population sizes, and update counts across all 80 frames. The fixture selects initialization and skip frames. The Java batch comparison does not establish the client mapping for those native gates or platform clocks. A real emitter regression verifies that an emitter that dies during its update remains registered until the next batch.

Cold-load start timing, live frame timing, retained component lifetime, complete query context, and native visible playback remain incomplete. Executables, assets, native probes, and fixtures remain private.


All 387 fixture-enabled tests pass across 78 suites with no failures, errors, or skips. This includes all 84 particle tests. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay. The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Publish particle counts at native batch boundaries

The [Molang query reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions?view=minecraft-bedrock-stable) describes effect counts by particle type and total counts across the world. Native Bedrock 1.26.51.1 supplies the publication timing used here.

The registered callbacks are `14065a9e0`, `14065aa60`, `14065aae0`, and `14065ab60`. They dispatch through emitter slots `0x88`, `0x90`, `0x98`, and `0xa0`. The effect emitter reader uses the manager's live identifier map. The total emitter reader uses its registered vector size. The particle readers use the effect map and total published after the last completed update batch.

Register new emitters before child initialization. Remove dead emitters during pruning before the batch. Keep particle counts unchanged throughout updates. Sample each emitter's population immediately after its update, then publish all samples together. New children enter particle counts when they receive their own update. A later callback can add particles to an earlier emitter without changing that earlier sample.

The constructor initializes the query context's emitter owner to zero before the first restart. Initial creation expressions therefore see zero counts. A refreshed owner supplies live counts during later loop restarts. Preserve these bindings through query refreshes and particle copies. Matching definition identifiers share effect counts across resource libraries. Stop clears registration and published counts.

Independent execution supplies 84 prepared scalar cases and 672 callback calls. Cases cover missing contexts, matching and missing effect identifiers, inline and heap names, repeated reads after count changes, and unsigned 64-bit conversion to float32. Native callback dispatch, key lookup, cache reads, and conversion execute. Byte comparison is supplied.

Another probe executes four manager frames with 36 count receipts around updates, child initialization, manual births, removal, and publication. Native expiry/population getters, count readers, pruning, captured update batches, accumulation, and publication execute. Platform clocks, ambient grid access, map allocation/access helpers, cleanup, and emitter identity/update/destructor callbacks are supplied. Registration increments and prepared population changes come from supplied callbacks. These checks exclude real factory construction, emitter updates, Molang, and visible output.

Two prepared restart cases execute native component dispatch and read all four native count callbacks from the creation expression's context. Resource and actor access and the expression callback are supplied. Random variable registration is skipped; lifetime and rate vectors are empty. Prepared owner states follow the inspected constructor and refresh writes. These cases exclude full constructor execution and real expression evaluation.

Production tests compare native publication receipts through the shared batch implementation and real Molang bindings. Additional emitter tests cover zero counts on initial creation, bound loop restarts, child initialization, particle copies, refreshed queries, missing effect keys, and clearing counters.

Client frame gates, platform clocks, complete expression context, other world particle sources, and visible playback remain unverified. Full particle and skin parity remains incomplete. Executables, licenses, assets, probes, and fixtures stay private.


All 391 fixture-enabled tests pass across 79 suites with no failures, errors, or skips. This includes all 88 particle tests. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


## Bind native spell-color structures

The [Mojang Molang reference](https://mojang.github.io/bedrock-samples/Molang.html) describes `query.spellcolor` as an RGBA structure. Its fields return zero when the query has no actor.

Native Bedrock 1.26.51.1 registers functor `14e7ff500`, whose callback is `14220f9d0`. It reads actor metadata slot 77 only when the entry has type Int (2). Those numbers match `DATA_SPELL_CASTING_COLOR` and `DataItemType.Int` in ViaBedrock's target protocol 2193. Channels come from packed ARGB bytes, converted through float32 division by 255. Missing actors, short metadata arrays, missing entries, and other entry types produce four zero channels.

Publish immutable colors after accepted network metadata updates. The query captures the original network actor identity and reads its current snapshot. Existing particles receive metadata changes without waiting for another actor render. Removal or replacement produces zero. Initial emitter creation also sees zero, because its context has no actor. Refreshed child contexts consume the live color.

Represent the result as a Molang object with `r`, `g`, `b`, and `a` fields. Nested query access, explicit calls, and variable copies preserve its channels. Particle tint expressions consume the same structure.

Independent execution supplies 1,504 scalar cases. These cover missing actors, array spans, missing entries, six metadata types, boundary colors, and every byte value in each channel. Native gates, byte selection, float32 division, and result type publication execute. The probe supplies metadata type getters, color structure construction receipts, and temporary value cleanup.

Another 60 cases execute the native initialization gate and full context refresh before reading the spell-color callback. They cover actor, unbound, and unresolved registry bindings. Prepared weak references, component tables, camera, and metadata arrays supply native input. Actor resolution, level/resource access, variable/expression callbacks, metadata type getters, and structure construction/cleanup are supplied boundaries.

Production tests compare all channel receipts through real Molang structure access and network snapshots. Further checks cover refreshed particle tint, first creation, child initialization, actor removal/replacement, and snapshot isolation.

These checks exclude native object property lookup, real native expressions, live network captures, tint quantization, and visible playback. Complete offscreen actor context and full skin/Dressing Room parity remain unverified. Executables, probes, fixtures, and account data stay private.


All 396 fixture-enabled tests pass across 80 suites with no failures, errors, or skips. This includes all 88 particle tests and the spell-color structure and network snapshot checks. Fresh package licensing, extraction, and cache reuse pass. All 16 patches replay.

The full dependency build and Prism bundle pass against the pinned ViaFabricPlus Jenkins artifacts.


### Flatpak helper startup

A private native/Java comparison loaded the same account and identified its active Alex recipe in slot five. Native HTTPS and Java service responses have the same profile hash and persona collection. Preparing that recipe failed before extraction: Prism's Flatpak runtime lacks WebKitGTK, so the helper closes stdin during startup. The service avatar loaded, but that image does not verify local model rendering.

Flatpak now runs the bundled helper on the host through `flatpak-spawn --host --watch-bus`, with the client display preserved. The launcher must permit `org.freedesktop.Flatpak`; the host must provide WebKitGTK. Runtime checks reproduce denied access and confirm that permitted host execution reaches the helper protocol. Neither path reads an installed Bedrock game.

The process exchange drains output while delivering the request and parses bounded receipt lines throughout the stream. Startup failures receive a separate error. Raw helper output stays out of logs and UI. Five real child-process cases cover large diagnostics, simultaneous pipe traffic, missing receipts, failure receipts, and success before request delivery. A separate client JVM exit also stops its helper. Full visible parity and fresh interactive Store sign-in remain open.

The final run passes all 402 fixture-enabled tests across 81 suites, with zero failures, errors, or skips. It includes fresh license acquisition, official package extraction, and cache reuse. All 16 patches replay.

The rebuilt private Flatpak client acquires the official package through the host bridge. It uses its previous helper Store session. Extraction creates the versioned cache and assembles the active model. A second live failure exposed an eight-digit-only skin-color check: native Alex uses six-digit RGB. Accept both native RGB and ARGB strings and preserve them in model storage and `SkinData`. The expanded roundtrip test covers both formats, animations, atlas storage, and return to classic selection.

Reloading the compiled color fix in the private JVM lets the production retry save and render the matched nine-piece slim Alex. The preview's saved profile hash matches the native HTTPS profile. Its geometry identifier proves that this recipe still uses Microsoft's GLTF body fallback. The non-default Skin catalog piece is unresolved; the extracted face is assembled locally. Idle videos and screenshots remain private. Cameras, poses, lighting, and animation phases differ, so this verifies the working acquisition/assembly/render path without proving visible parity. Native current skin-color wire formatting and fresh interactive Store sign-in remain open.


### Zero-price assets that require redemption

The native 1.26.51.1 Bases layout lists Brawny at zero price with `requiresRedeem`. The equipped recipe references its pack, but the account has no pack-specific receipt key. Published metadata confirms the product, persona content type, zero price, and pack identity. The production decoder reads its body and face tint maps with the account's existing receipt keys.

Separate zero-price asset eligibility from permission to equip an unclaimed offer. Keep published metadata checks and the account receipt requirement. Preparing a saved recipe submits no purchase or redemption transaction. A parameterized guard test covers both redemption states and retains the equipment restriction. Paid and mismatched published items remain excluded from shared-key loading.

The full run passes 403 tests across 81 suites without failures, errors, or skips. All 16 patches replay. The dependency build and Prism bundle pass. A restarted isolated Flatpak client prepares the same nine-piece slim Alex profile with local body and face geometry. The saved identifiers are `geometry.persona.body` and `geometry.persona.face`. Its 128 by 128 body texture matches all 16,384 texels in the previous service model, after accounting for atlas padding. The production preview renders the locally assembled body and animated face.

This verifies local assembly for that recipe. It does not establish visible parity across camera, pose, lighting, or animation phase. Accounts without receipt keys, unavailable remote assets, and the remaining Dressing Room and classic-format checks stay open. Captures, decoded assets, receipts, and probes stay private.


### Owned arm strip runtime comparison

The current catalog identifies the previously captured animated arm pack as The Chill Arm. The authenticated account owns it and has its specific receipt key. The live production loader decodes its 16-frame texture and 16 geometry variants. A private unsaved recipe combines both slim, medium arms with the active Alex's body and face. It assembles locally with ten arm cubes, a two-frame blinking face, and a separate 16-frame arm binding. The account's saved recipe remains unchanged.

A read-only render-thread probe observes all 16 frames and 140 sequential steps at about 7.01 steps per second. Native and Java videos recorded at 120 fps show the corresponding drip columns. Three initial native 20-second windows match seven fps. Later native windows measure about 6.8 to 7.0 fps, while Java stays near seven. The cause remains unresolved. Independent clocks, changing native preview conditions, and capture timing still need investigation. This verifies the tested local assembly and Java frame sequence, without claiming exact native timing or complete animated-outfit parity. Assets, measurements, and probes stay private.

### Native preview clock and controlled recording

The native 1.26.51.1 `query.life_time` callback reads a float from its animation context. A temporary debugger watchpoint identifies the preview clock update. For a preview without a world actor, it adds the render frame delta to the stored life time. A separate actor path derives time from ticks and frame interpolation.

Independent execution covers 53 clock update cases, including zero delta, actor time reversal, interpolation, and float32 precision at large ages. The preview getter and update branch execute native instructions. The probe supplies the indirect-call dispatch. It excludes the frame gate, render delta producer, actor updates, and expression evaluation. Large accumulated ages can change effective increments through float32 rounding. The earlier recording's age is unknown, so these cases do not explain its slowdown.

After a fresh native launch, an uninterrupted 40-second editor sample tracks real time closely. During a 125-second arm recording, 12,264 direct context samples advance at 0.99994 times real time without rewinds. Six video windows measure about 7.00 to 7.02 arm frames per second. Their drip-pixel rates agree with the sampled clock. Debugger pauses occur before these measurements. Temporary breakpoints are removed, the recording is stopped, and the unsaved arm preview is canceled.

These results support the current seven-fps strip rate for this preview. The earlier slowdown remains unresolved. Long-running previews, native frame gates, other outfits, and world rendering still need verification. Full skin and Dressing Room parity remains incomplete. Account data, native instructions, recordings, and probes stay private.

### Live skin palette and input verification

The active nine-piece Alex recipe uses the zero-price Brawny base. Its native catalog entry requires redemption, while its metadata permits tint overrides. The native 1.26.51.1 client exposes its skin palette. Java previously hid that control because the color loader treated immediate equipment eligibility as asset availability. Use the shared catalog reference factory, as model assembly already does. Loading color metadata does not redeem or purchase an item.

A private production probe returns no skin target before the fix and `SKIN` afterward. The saved recipe remains unchanged. The restarted client also resolves `SKIN` from the corrected loader.

Real mouse input found another gap. Minecraft 26.3 defines the left mouse button as 1, while the manual wardrobe and palette handlers compared it with zero. Wardrobe tiles now use the named constant. Palette swatches use native button widgets with keyboard navigation, focus, tooltips, and narration. Their rows adapt to the GUI height and reserve space for color status above the footer. Remove the outdated hint that excludes animated details from saved characters.

Live Java tests select a swatch with the mouse, move focus right, and select the next swatch with Enter. The selected index and focused widget both become 1. A right click leaves that selection unchanged. The last skin swatch selects index 32 and enables Apply without saving. At a 640 by 480 window, all 33 swatches fit in the 320 by 240 GUI. Their bounds and status space remain above the footer. Screenshots also verify the 1280 by 694 layout.

Applying the first swatch through the real screen saves its ARGB color. An independent HTTPS readback verifies that only the active recipe's skin color changes; the other five profiles remain unchanged. A guarded restore rereads the profile hashes before writing, then verifies all six original recipes. The restored active recipe keeps its original RGB color. The locally saved appearance is also restored.

The fixture suite passes 403 tests across 81 suites with no failures, errors, or skips. All 16 patches replay, and the dependency build and Prism bundle pass. Widget placement uses the Minecraft rectangle API's size-before-position order, verified through live bounds. This verifies the tested skin palette flow; other palettes, outfits, world rendering, and complete Dressing Room parity still need broader verification. Credentials, account recipes, captures, assets, and probes remain private.
Cape box UV expansion retains native east and west face labels. The shared model consumer now converts both box and explicit layouts consistently, so the old producer swap would convert lateral faces twice. Top and bottom orientation rules remain separate. The unchanged licensed native cape oracle passes all four persona heights, checking mesh positions, normals, texture coordinates, and atlas pixels. All six focused cape and face-layout tests pass with no skipped cases.

Cape atlas expansion preserves all six native face labels. The general
renderer handles the model coordinate reflection for both box and explicit
UVs. Preserve upper-face reversal of both UV axes and lower-face reversal
of V. The unchanged captured native oracle passes for all four persona
heights, including positions, normals, texture coordinates and atlas pixels.

### Native free redemption and right-leg account save

Native 1.26.51.1 lists Coin Stacks and Prosthetic Leg as immediately available free pieces. Other zero-price legs require redemption. The native Coin Stacks right-leg recipe contains exactly one `id` field with the `/fr` suffix. This observation comes from the native client's local recipe data. That data marks the edit with `offlineUpdate`; no native appearance PUT is observed. It verifies the stored recipe format, without proving native cloud synchronization.

The Java screen selects Coin Stacks, chooses Right, and saves through its production account flow. Independent HTTPS readback verifies the exact native right-leg entry, with the active recipe's existing fields and the other five profiles preserved. A guarded restore verifies all six original cloud recipes. Local geometry masking and rendering for this leg remain unverified.

A separate native Brawny Get operation uses `/transaction/virtual` with Minecoin `Amount` set to the string `0`, followed by `/transaction/redeem/xbox`. Both requests return 200. The UI then permits Equip. This verifies an actual zero-price redemption flow; it does not test a paid purchase. The free entitlement is retained.

Native Equip changes the local base entry's free-source flag and sets `offlineUpdate`. Cleanup stops only the owned native process, restores its original active recipe from an earlier private snapshot, and preserves its other five local profiles. The current slot matches only those known changes before restoration. A private relaunch verifies that the original native recipe survives restart. Cloud recipes also remain restored. Native local format version and offline synchronization differ from the account service format and still need separate investigation.

Raw local data, transaction bodies, credentials, and screenshots remain private. These observations add coverage for a free right-leg account edit and native zero-price redemption; they do not establish complete Dressing Room or rendering parity.

### Free leg assembly and direct Default controls

The production assembler loads Coin Stacks with the native `/fr` recipe from licensed assets. It builds the persona body and animated face locally. The right leg has five cubes, with one right legging cube and two right boot cubes. The original left leg and pants retain their polygon surfaces. Both the earlier bundle and the refreshed renderer show the right leg in the Java Dressing Room. A fresh account read confirms that this unsaved assembly leaves the active recipe unchanged. This verifies one outfit and side selection, without establishing complete texture, lighting, pose, or world rendering parity.

Native Bedrock 1.26.51.1 equips Coin Stacks for both legs with a `/f` entry. Selecting Right and Default removes the right piece visually. The left piece remains visible after returning to the Dressing Room. The local recipe file still records `/f`, including after stopping the game. Treat this as visible behavior only; native persistence and cloud synchronization remain unresolved. Cleanup checks the known equip change before restoring the original active local recipe. It preserves the other five local profiles. An independent HTTPS read verifies all six original cloud recipes.

Java now exposes Default for arms and legs, with Both, Left, and Right selectors. The action clears the chosen sides through the existing profile hash guard and account readback. It preserves the opposite side, source flags, tint channels, other pieces, and emote order. Replacement and Default share the same masking routine. Users can reset an equipped limb while browsing another offer, including a locked offer. Unknown recipe flags disable the reset. The normal account save also refreshes the locally selected persona.

Targeted tests cover arms and legs, free and owned source flags, tint preservation, splitting a piece across sides, and restoring both sides. They also reject non-limb categories and unknown flags. Captures, native files, licensed assets, and account data remain private.

Live UI validation saves Coin Stacks for Both, resets Right while a locked offer is selected, then resets Both at 640 by 480. Independent HTTPS reads verify `/f`, then `/fl`, then the exact original recipe. Every step preserves the other five profiles. Default disables itself after the selected side is clear. Its widget fits inside the 320 by 240 GUI. The original locally saved appearance is restored after the test.

The full fixture run reports 451 tests across 90 suites, with no failures or errors and three skipped capture comparisons. Those three comparisons pass in a separate targeted run with their fixtures supplied. All 17 patches replay. The dependency build, pinned ViaFabricPlus verification, Prism bundle, and north-star patch check pass. This verifies the new limb controls and one free outfit; full skin and Dressing Room parity remains incomplete.

### Catalog emote previews and remote UUID lookup

Native Bedrock 1.26.51.1 previews locked Sneaking and unowned Robot Dance from the Emotes catalog. Robot Dance requests `Catalog/GetPublishedItem`, then downloads `personabinary` from an official CDN. The current account receipt decodes its 7.5-second animation. These actions send no purchase, redemption, or appearance write. Independent reads confirm that all six cloud recipes and six native local recipes remain unchanged.

Java now enables previews for catalog emotes, including locked and paid offers. Equipping retains its separate ownership checks. Received emotes can use the full current catalog. If a received UUID is absent, the loader searches the official PlayFab catalog by its pack UUID tag.

The UUID search requires the account manager's master-player token. Native-session requests and automated add-on account requests resolve Robot Dance with that token. The title-player token returns empty search results for the same product. The loader validates the product, persona type, pack UUID, and archive identity. It rejects ambiguous products and refreshes published metadata before downloading. Pending downloads and cached assets have fixed limits.

All 14 focused tests pass with native asset fixtures enabled and no skipped cases. The tests cover search identity, duplicate and ambiguous results, invalid metadata, shared receipt keys, and existing free and owned asset assembly. The full stack and bundle build. Assets, receipts, account data, and captures remain private.

The rebuilt production client also exercises the missing-catalog-entry route with Robot Dance. It resolves the product, downloads the archive, and samples 450 frames. The item remains unowned and cannot equip. All saved slot profiles match their prior values. Real UI input selects the paid offer and opens its active-character preview. A recording verifies changing poses, completion reset, Replay, and Stop. A fresh HTTPS read confirms all six original cloud recipes afterward.

This change does not establish complete emote parity. Assets absent from the official catalog or incompatible with available receipt keys remain unavailable. Dynamic actor queries, effect aliases, communication filters, and native world timing still need verification.

### Emote selection and responsive controls

The emote detail panel now shows Not owned for offers that cannot equip. Locked and paid offers retain their preview action and separate acquisition checks. Resizing recalculates the catalog page from the selected item. The wheel uses a diamond when all three rows fit, and a single row otherwise. Narrow windows reduce the button width to fit all four positions.

Live production checks select unowned Robot Dance at 1280 by 694, resize to 640 by 480, and return to the original size. The selected index stays 20. The small layout shows page 21 of 32, with Robot Dance in its single tile. All four buttons remain inside the 320 by 240 GUI and above the footer. At GUI scale 1, the taller layout retains the diamond and the same selected offer. The original scale is restored. Independent HTTPS reads confirm all six original cloud recipes. A fresh production profile load confirms the original active recipe. The dependency build and Prism bundle pass. Captures and account data remain private.

A read-only account loader inspection decodes all 32 current catalog emotes. None declares sound effects, particle effects, or timeline events. Hover uses actor lifetime expressions. These observations guide the next timing comparison; they do not establish complete effect or emote parity.

### Actor queries during world emotes

Hover's official seven-second animation uses actor lifetime for its root motion and limb oscillation. World emotes previously sampled with an empty query map, causing `query.life_time` to use elapsed emote time. Pass the player animation graph's actor context to the world emote sampler. Animation elapsed time remains a separate clock. Remove the unused sampling overloads.

The inspected Bedrock 1.26.51.1 actor-bound clock reads `(actor age ticks + frame alpha) / 20` and preserves monotonic lifetime. An independent instruction probe reruns 53 actor and preview clock cases. A [reported discrepancy in the Molang documentation](https://github.com/MicrosoftDocs/minecraft-creator/issues/772) is a research lead; the target build supplies the clock evidence.

All six emote tests pass with both licensed fixture directories supplied, without failures or skips. Hover's test varies lifetime independently of animation elapsed time and checks steady root position and rotation at 60 samples per second. The existing owned-animation test also handles subdirectories in the collected packs.

The rebuilt production client exercises its public world sampler on the Minecraft thread with Hover's licensed asset. Four supplied actor lifetimes match the authored root motion while emote elapsed time stays near two seconds. Moving the probe actor cancels playback. A fresh production account load confirms the original active recipe. This probe sends no account write. The dependency build, Prism bundle, and north-star patch check pass.

### Initial character selection and matching world check

Opening Change emotes in a world created a fresh screen with slot 1 selected, even when the account's active character was slot 5. On the first successful wardrobe load, select the valid active slot. Refresh keeps an existing selection. An account without a valid active slot keeps the initial selection.

The rebuilt JAR passes a clean client restart. The real screen initially selects active slot 5. Mouse input selects slot 2, and Refresh preserves slot 2 after the account load completes. Opening another fresh screen selects slot 5 again. An independent production account load verifies that the active recipe remains unchanged. These checks perform no appearance writes.

Java also joins a separate native Bedrock 1.26.51.1 server through NetherNet HTTP, using protocol 2193. The server reports PlayerSpawned. The production world renderer installs the saved persona geometry and one animated face surface. A closer pixel check resolves an apparent missing-eye discrepancy in the displayed screenshot: both green iris pixels are visible. All 64 front-face texels match the uploaded open-eye frame within one channel value after fitting the face's lighting factors. The stored and installed strips match exactly. This verifies the tested Java face frame, without establishing native world lighting, pose, or phase parity.

All 18 patches replay. The dependency build, Prism bundle, and north-star patch check pass. Client probes, licensed assets, screenshots, account data, and local server files remain private.

### Remaining scope after these checks

- **Faces and tints:** Production assembly consumes animated faces and tint masks. Native execution and fixture checks cover the implemented blend paths. The tested Java world face renders both irises correctly. Separate native and Java world recordings verify visible blinks for the saved default face. Native lighting and broader visible checks across facial combinations remain open.
- **Persona assembly:** Licensed package acquisition, extraction, versioned caching, and local assembly work for the tested default and free-leg recipes. Exhaustive free-piece coverage, additional layering combinations, accounts without usable receipt keys, and unavailable remote products remain open.
- **Animation:** Strip timing, blinking, multiple sources, timelines, delays, actor queries, rotations, and effect machinery have implementation and targeted checks. Native and Java world clocks and default-face closures now have separate live observations. Multiplayer phase and remote receive comparisons remain open. The matching vanilla player declares no emote effect aliases. Effect-only server player overrides retain their aliases when optional animations or scripts are absent. Effects from other products still need native world comparisons.
- **Dressing Room:** Saved characters, tested palettes, limb side/default edits, catalog previews, zero-price acquisition, and owned classic-pack browsing/downloads have checks. Remaining palette combinations, paid purchase/redemption behavior, native cloud synchronization, and broader interaction checks remain open. No paid transaction was tested here.
- **Classic formats:** Geometry inheritance and animation flag conversion have targeted tests and native execution evidence. Trusted account-pack capes now reach preview, storage, and skin transport. Native cape precedence and visible comparisons remain open. Native inheritance edges, first-person behavior, equipment interaction, and visible motion comparisons remain open.

This is progress on the six-part parity goal. It is not a full-parity result.

These checks verify query forwarding and authored motion evaluation. They do not compare native multiplayer phase or the full entity renderer. Native preview clock, visible effect comparisons, offscreen actor context, and broader visual parity remain open. Assets, executable instructions, account data, and runtime probes stay private.

### Interactive owned classic-pack downloads

The production Owned packs screen synchronizes Store purchases and lists Earth Skin and Birdie Wings for the selected account. Real mouse input opens each pack through the normal asynchronous download path. Both previews render their resolved custom geometry. At 640 by 480, the preview, navigation, and Use this skin action fit inside the 320 by 240 GUI. Next wraps correctly for these single-skin packs. Refresh preserves the pack rows during synchronization and returns the same owned entries.

Native Bedrock 1.26.51.1 also lists both owned packs. Selecting Birdie Wings opens its preview with an explicit Equip action. The Java and native views show the same character and its wings. This is a qualitative geometry and texture check, without a pixel, lighting, pose, or animation-phase comparison. Neither owned pack declares classic animation aliases, so the interaction does not verify animated classic packs.

No Equip or Use this skin action is selected. Independent HTTPS reads confirm all six original cloud recipes. A fresh production profile load confirms the original active appearance. Native browsing changes only the current local profile's `offlineUpdate` bookkeeping flag. Cleanup closes the owned native client, checks that exact difference, removes the flag, and verifies all six original local profiles before relaunch. The recipes survive relaunch. Raw traffic, licensed assets, and captures remain private.

### Native wallet and acquisition checks

Native Bedrock 1.26.51.1 shows the Minecoin count and a plus button in the top right of the Dressing Room. Its captured request uses `POST /api/v1.0/currencies/virtual/balances` on `entitlements.mktpl.minecraft-services.net`, with an empty body and Minecraft session authorization. The response separates Minecoins from PlayStation Tokens.

The Dressing Room, Character Creator, owned-pack browser, and classic-pack preview use that endpoint for the selected account. The balance loads independently from catalog rows and character previews. Refreshes follow account changes, game focus, item acquisition, and Store synchronization. A periodic refresh preserves a known balance while its request runs. A failed request shows unavailable, rather than a zero balance. Compact windows retain the full balance description in tooltips and narration.

The plus button opens the [official Minecoin shop](https://www.minecraft.net/en-us/marketplace/buy-minecoins) through Java's link confirmation screen. Minecraft documents this purchase route for Microsoft accounts. Fabric cannot invoke the native client's platform purchase UI. This implementation needs no external Bedrock installation and does not handle payment credentials.

The real Java catalog acquires the zero-price Prosthetic Foot offer through Get. An independent production read confirms its entitlement and receipt key. The asset loader downloads and decrypts all eight files. All five saved character recipes and the settings profile remain unchanged. Selecting Hacker Legs opens the 400-Minecoin confirmation; choosing No returns to the unowned offer. No paid transaction runs.

### Optional client entity sections and effect aliases

The matching licensed vanilla assets contain client entities without animations or scripts. The inspected vanilla player declares no sound or particle effect aliases. A generic persona fallback graph therefore has no supported aliases to supply from that file.

The actual loader failure affects server player overrides that declare effects without those optional sections. The constructor now treats absent sections as empty collections. Targeted tests retain sound and particle aliases, locator names, attachment flags, and caller animation overrides. Supplied malformed sections still fail validation. This follows the [client entity schema](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable).

The clean production client shows the same zero balance as the native capture. Independent backend reads match all four wallet screens. Mouse input refreshes the compact counter and opens the official shop link confirmation. Cancel returns to the Dressing Room. GUI widths 320, 427, and 640 keep the wallet clear of the centered header; compact tooltips retain the currency name. No payment runs.

The focused run reports 28 tests: 27 pass and one optional redemption capture comparison skips because its fixture is absent. The balance parser and optional actor section tests run without skips. The production server-player entry point now loads a minimal effect-only override and resolves both aliases, preserving the sound locator. All 18 patches replay. The dependency build, pinned ViaFabricPlus verification, Prism bundle, and north-star patch check pass. Traffic, account snapshots, downloaded assets, and client probes stay private.


### Trusted bundled classic capes

A live Bedrock 1.26.51.1 startup trace records the actual trust callbacks for Package origin 2 and PremiumCache origin 8. Both return true. The classic loader then enters its cape lookup. Package trust uses callback `1419b8a10`; PremiumCache uses `1400848a0`. Independent instruction decoding confirms their observed results.

Account downloads preserve trusted provenance after receipt, published identity, and decrypted pack checks. Local skin-pack imports remain untrusted. The reader accepts cape paths shorter than 1024 UTF-8 bytes. It resolves the final component after either slash, matching the target loader. Bounded PNG decoding checks dimensions before appearance files change.

The preview includes the pack cape. Storage keeps its pixels and stable identity in a separate account file. Standard presets hide that bundled cape. Returning to the imported skin restores it. Skin transport carries the same pixels and identity. A new skin import replaces or clears the bundled cape.

Manual PNG capes retain their existing priority as a local extension. This behavior does not establish native account, persona, and bundled cape precedence. A visible native comparison with an entitled cape pack remains open.

Three cape tests cover trust, path resolution, decoded pixels, persistence, preset selection, wire round trips, replacement, and invalid input. Native executables, traces, synthetic format fixtures, and account files remain private.

Wallet requests now complete while the purchase confirmation covers their screen. Account and request identity still reject stale results. Returning to the Dressing Room can therefore retain the completed balance instead of leaving the request pending.


The focused run reports 31 tests: 30 pass and one optional redemption capture comparison skips because its fixture is absent. All three cape tests pass. The final full build reports 466 tests, with 370 passing and 96 optional fixture tests skipped. It has no failures or errors. All 18 patches replay. Pinned ViaFabricPlus verification, the dependency build, Prism bundle, and north-star patch check pass.

The clean production client starts a real balance request, then opens the shop confirmation before that request finishes. Its completed wallet reports zero Minecoins while the confirmation remains open. Cancelling returns to the same completed counter. An independent backend read matches it. These checks perform no payment or appearance write. The cape format tests use synthetic fixtures; they do not establish visible native cape parity.

After the concurrent equipment patches reached main, all 19 patches replay. The integrated dependency build also passes.

## Player trident category check

Bedrock 1.26.51.1 actor update `FUN_142069380` clears timed player poses when remaining use ticks reach zero. Its separate target-dependent trident branch excludes the Player category. The target checks bit zero at actor offset `0x210`. The player lookup `FUN_14117a6d0` uses the same category check. The generated [ActorCategory definition](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/world/actor/ActorCategory.h) names bit zero Player.

Independent execution covers 96 combinations of category, item identity predicate, target metadata presence and value, and remaining ticks. Player cases clear brandishing at zero or negative remaining ticks. Non-player cases can retain brandishing with a matching item and nonzero target. The harness supplies the item predicate and executes the native category and metadata branches. The retained non-player pose is outside the current player binding. The existing player reset requires no production change. Local charging prediction and the other documented item gaps remain open.

### Native item names through ViaProxy

Player animation queries now read the original Bedrock identifier from the standard Java item custom data. They use its raw name and preserve the Java name fallback when the native marker is absent. This fixes translated identities such as Bedrock `banner` becoming Java `white_banner`. Custom items can retain their name when their Java representation is paper.

Bedrock 1.26.51.1 callback `FUN_14221b950` selects the legacy or component-backed raw-name hash. Native execution covers 44 source, empty-stack, and argument combinations. Production tests compare those receipts through the item-name query. Name resolution, expression arguments, hand getters, item allocation, error callbacks, and thread-local state are supplied boundaries. The callback uses the rendered hand only with exactly two arguments. With more arguments, it reads the equipped hand and ignores the extras; production now follows that branch.

The full dependency build passes all four targets. ViaBedrock passes 380 tests with no failures or skips. The add-on run reports 479 tests, including 96 skips, with no failures; both native name and duration query fixtures are enabled. A live Java 26.3 client connects through ViaProxy to Bedrock 1.26.51.1. Its Java white banner retains `minecraft:banner`, and the production actor query returns `banner` on the Minecraft thread. This verifies transport and query binding. It does not prove complete pose, first-person, custom component constructor, or visible equipment parity.


### Native item-use clocks through ViaProxy

Read the compiled native duration from standard Java item custom data. Preserve elapsed Java ticks when deriving native remaining ticks. Both the actor queries and specialized pose variables use this clock. A released or completed use returns zero. Missing legacy durations retain the Java fallback.

Bedrock 1.26.51.1 sends spear durations of 1,440,000 ticks; Java 26.3 uses 72,000 ticks. A live spear test through ViaProxy invokes the production actor queries on the Minecraft thread. At 17 elapsed ticks, native remaining ticks equal 1,439,983. After release, native remaining ticks equal zero and the native maximum stays 1,440,000.

The full dependency build and Prism bundle pass. The core suite passes 383 tests with its native registry fixture enabled. The add-on suite reports 480 tests, no failures, and 96 optional fixture skips. Targeted tests cover differing clocks, elapsed ticks, startup, release, completion, short native durations, and integer bounds. Native name and duration query fixtures are enabled.

This verifies transmitted duration context and live query binding. Java's input timeout, legacy native durations, local charging prediction, spear tag and kinetic bindings, first-person playback, and visible native motion comparisons remain incomplete.


### Native spear and equipment queries

Read immutable item animation context from standard Java custom data. Bind equipped tag matching across the main hand, offhand, and five armor slots. Bind the four kinetic-weapon queries to the main hand. Bind base swing duration to native ticks with the target float conversion and 0.3-second empty-hand default.

The matching Bedrock 1.26.51.1 callbacks pass 112 kinetic, 12 swing, and 32 tag cases. The harness supplies item storage, virtual getters, component lookup, slot registry, tag hashes, expression values, category, and thread-local setup. Production comparisons cover those callback outputs. Constructor behavior and malformed native input handling remain outside that evidence.

A live Java 26.3 client through ViaProxy receives the actual spear context. Its production queries return the native spear tag and timing fields. The licensed graph runs with those queries and controlled remaining-use ticks. Right-arm X is -30 degrees during hold, -62 during the tested use phase, and -30 after release. The probe runs on the Minecraft thread. The full dependency build and Prism bundle pass: 385 core tests, and 482 add-on tests with 96 optional skips, all without failures.

This enables the native spear graph through transmitted context. First-person playback, visible native comparisons, Java swing and input timing, local charging prediction, and additional equipment queries remain incomplete.

### Authored bone pivots and render tick fractions

Bind `get_default_bone_pivot` to an immutable snapshot of the body geometry. Keep absolute native pixel coordinates before parent transforms and render conversion. The query requires a bone name and an axis. Numeric axes use the target float conversion. Named axes accept `x`, `y`, and `z`. Missing bones and invalid requests return zero. Shared equipment queries exclude body pivots because attachables have their own geometry context.

Pass the render state's partial tick to `frame_alpha`. Preserve its supplied value without a clamp. Preview graphs use their own body geometry and the current render tick fraction.

The matching Bedrock 1.26.51.1 executable supplies the version evidence. The pivot callback at `14221efc0` scans native bone records and reads the stored pivot components. It passes 110 execution cases for axes, fractional indices, numeric bounds, missing bones, argument counts, and unavailable contexts. The frame callback at `14221abb0` passes 14 cases and returns the context fraction even without an actor. The harness supplies the model records, expression values, and client predicate. This verifies callback behavior; it does not verify native model construction. Sources: [Mojang Molang query reference](https://mojang.github.io/bedrock-samples/Molang.html) and the matching executable.

A Java 26.3 runtime probe through ViaProxy uses a private synthetic geometry and the licensed player graph. Production body and preview frames expose the authored pivots. Shared equipment queries exclude those body pivots. Seven supplied frame fractions pass through unchanged. The licensed first-person graph places its held-item bone at Y=2 and Z=2.5 for the fixture. With controlled remaining-use ticks, fractions 0.125 and 0.875 produce use phases of 6.125 and 6.875 ticks. These graph samples do not verify first-person submission or visible native motion.

The full dependency build and Prism bundle pass. The core suite passes 385 tests. The add-on suite reports 484 tests with 96 optional fixture skips, no failures, and no errors. Native pivot, equipment, item-name, and duration fixtures are enabled. First-person hand and item submission, camera transforms, walking bob, charging prediction, and visible native comparisons remain incomplete.

### Native classic account selections

Keep native pack identity through the shared reader and appearance store. The wire skin ID combines the manifest UUID and the skin's localization name. The account recipe combines that UUID with the original definition index. Missing textures can remove entries from the preview without renumbering account references. Account downloads also check the manifest UUID against the selected owned pack.

Owned skin selection saves the active account slot before importing its appearance. Preserve the persona header, pieces, masks, capes, emotes, and account settings. Set `skin=true`, set `cs_arm`, upgrade the appearance version, and replace the classic reference. Require the service receipt and exact collection readback. Check the active slot and collection again before writing. Keep the preview mounted during the save and disable selection controls. Ignore callbacks after navigation or account changes.

Active account loading handles classic and persona characters through separate prepared types. Download the classic pack with fresh receipt authorization and resolve its original index. Do not render its retained persona recipe. Check the complete active collection after loading because a model hash can stay unchanged when classic mode changes. The saved recipe and width identify the locally selected account classic character.

Body edits restore persona mode while preserving the classic recipe and width. Cape and emote edits preserve the selected mode. Emote wheel discovery and insertion keep classic references after the four positions. This follows the observed native layout.

The evidence comes from Bedrock 1.26.51.1 build 51061372, protocol 2193. Native HTTPS captures show the appearance objects, version change, classic flag, width, and pack/index entry. They preserve the global settings skin ID. The selected full skin ID remains a local option. A later native return to Character Creator clears the classic flag and retains the pack reference.

The rebuilt Java preview selects Birdie Wings and Earth Skin through the production asynchronous account flow. The action is disabled during saving. Service receipts and fresh profile reads confirm both writes. Fresh production downloads and imports into a separate cache preserve their pixels and native IDs. After selecting Earth Skin in Java, restarting the native client displays Earth Skin in its main menu and Dressing Room. Research restores all six account collections and the isolated Java appearance files.

Five new tests cover original indices, native IDs, persistence and width edits, preserved account collections, classic preparation, emote positions, and persona restoration. All four build targets and the Prism bundle pass. The full suites report 385 core tests and 490 add-on tests, with no failures or errors. One core test and 100 add-on tests need optional fixtures and are skipped in this run. Imported images without pack references, paid acquisition, and additional cross-platform flows remain incomplete.

### Native walking inputs

The player graph now receives `query.walk_distance` from a separate accumulator on each local or remote player. This accumulator also runs through ViaProxy. Java accumulates its hand-bobbing distance per local movement call and does not populate that value for remote players.

The matching Bedrock 1.26.51.1 build 51061372 accumulates horizontal travel once per tick. Its query extrapolates the current and previous distances with `frame_alpha`, then applies a 0.6 scale. Native float arithmetic preserves that order, including fractional frames and large coordinates. Java snap teleports reset the previous position and do not add their displacement to walking distance. The query remains separate from `modified_distance_moved` and `modified_move_speed`.

Private executable probes run the actual native component update and query callbacks. They cover 60 query cases, seven component updates, and 1,000 repeated updates. Fixture-enabled Java tests compare the native query results and update sequence. The default regression also compares the 1,000-tick result by its float bits. This supplies a missing first-person graph input. It does not establish native first-person drawing, camera transforms, or item transforms.

A rebuilt Java 26.3 client connected through ViaProxy passed the live binding probe. Both local and remote players expose separate walking state. Remote tick samples match six frame fractions. Standing stops extrapolation, and snap teleports preserve the accumulated walking phase. A licensed first-person player graph consumes the production query and changes its arm position with the walking phase.

All four build targets, the client bundle, and the north-star PR check passed. The final add-on rebuild ran 493 tests without failures or errors; 101 optional cases were skipped. All three walking tests passed with the native fixture enabled and no skips. These checks cover the walking input and graph sampling, not visible first-person parity.


### Native first-person hand visibility

The licensed downloader now selects `render_controllers` JSON files and their `.brarchive` containers. Cache format 8 refreshes older downloads before player graph loading. Fresh acquisition through the bundled helper decrypts the matching package, expands its controllers, and reuses the verified cache. Production does not require a local Bedrock installation.

The Bedrock 1.26.51.1 package selects its latest player definition and render controller by resource identifiers and overlay order. Its first-person rules select right and left arms and sleeves from map, shield, item-use, charged, and spectator state. JSON booleans, conditional controller references, ordered wildcard rules, and primary geometry selection reach the evaluator. Other geometry controllers cannot expose hidden body parts.

Render visibility uses the sampled animation scope. It does not repeat initialization or pre-animation scripts. First-person playback has separate clocks, variables, and controller state from world playback. Its frame supplies first-person query, variable, and context values. This playback suppresses sound and particle events. Persona skins now load the licensed player graph too.

Java hand submission applies the selected arm and sleeve visibility. A scoped wrapper restores its previous frame after nested calls and exceptions. It preserves Java hand transforms until native camera and item transforms are verified. Native graph drawing, held-item attachment, walking bob, and visible motion comparison remain incomplete.

The matching private library passes 144 equipment, use, charged, and spectator combinations. Tests also cover actor scope isolation, ordered overrides, geometry isolation, and cache refresh from format 7. The fresh helper and cache test passes in 183 seconds. All four build targets pass. That add-on run reports 498 tests, no failures or errors, and 100 optional skips. These checks establish asset acquisition and visibility decisions, not complete first-person rendering parity.


A rebuilt Java 26.3 client connected through ViaProxy passed a controlled live submission probe. Production queries and the licensed graph selected arms and sleeves for six equipment and spectator states. The renderer submitted no model parts for hidden hands. Nested scopes and exceptional submissions restored the previous frame. The probe used temporary client appearances and restored held items and appearance ownership. It did not write account recipes or purchase content.

The final add-on build reports 499 tests, no failures or errors, and 101 optional skips. All four visibility tests pass with the licensed fixture enabled. The server pack override test also passes. The client bundle and north-star PR check pass. Native camera transforms, held-item transforms, and visible motion comparison remain unfinished.

### First-person equip heights and arm offsets

Bedrock 1.26.51.1 build 51061372 sets four pose inputs in `renderFirstPerson` at `0x1447ca170`. Main-hand height uses `v.player_arm_height`. Offhand height uses `c.player_offhand_arm_height`. Each value interpolates the previous and current equip heights with frame alpha. The native path does not invert these values or apply Java's swap scale.

The same renderer computes each short-arm offset as 22 minus the authored arm pivot Y. It skips this block when geometry is unavailable. A loaded model without an arm uses a zero pivot and produces an offset of 22. The binding preserves other actor variables, queries, and context values. It samples the existing separate first-person graph.

Private probes execute the target's height arithmetic at `0x1447ca5b1`, right-arm offset at `0x1447cad3b`, and left-arm offset at `0x1447cadea`. The fixture covers 343 height combinations and 100 pivot combinations. The optional `STACKANVIL_FIRST_PERSON_INPUTS` test compares raw float bits against these native results. Portable tests cover preserved scopes, authored pivots, and unavailable versus empty geometry.

These bindings use Java's equip clock. They do not establish native equip update timing, camera transforms, item transforms, or visible first-person pose parity. The hand renderer still needs native graph drawing.

The rebuilt Java 26.3 client passes a private live ViaProxy probe. Six equipment and spectator states receive different main-hand and offhand heights in their correct Molang scopes. Hidden hands submit no geometry. Independent playback, nested calls, and exception restoration still pass. The probe restores the player's held items and client appearance.

All four build targets pass. The add-on suite reports 502 tests, no failures or errors, and 101 optional skips with the input and visibility fixtures enabled. The core suite reports 385 tests, no failures or errors, and one optional skip. The client bundle and north-star PR check pass.

### First-person target rotations

The matching renderer clears actor rotation at `0x1447cae89` before actor dispatch. It also clears head rotation and body rotation. Their FNV32 component hashes are `babe7211` and `d7f64bba`. The [head rotation fields](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/entity/components/ActorHeadRotationComponent.h) and [body rotation fields](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/entity/components/MobBodyRotationComponent.h) identify current and previous yaw values. The native renderer restores these values after drawing.

The registered target-pitch callback is `0x14065a550`. The target-yaw callback is `0x14065a660`. First-person pitch and yaw queries therefore sample zero-valued actor rotations. The renderer preserves real camera pitch separately in `v.player_x_rotation`. Map tilt continues to use that variable.

The hand-frame binding now isolates these query values from the world and preview frames. Private executable probes run the actual actor clear and target-pitch callback for 567 angle and frame-alpha combinations. Portable tests preserve camera pitch, authored geometry queries, and the original actor scope.

A rebuilt Java 26.3 client through ViaProxy passes six controlled equipment and spectator states. The production graph receives zero target rotations and a separate camera pitch of 37 degrees. Existing equip inputs, visibility, independent playback, nested scopes, and exception restoration still pass. The probe restores held items and client appearance ownership.

The add-on and its two dependency build targets pass. The add-on suite reports 502 tests, no failures or errors, and 101 optional skips. The bundled client passes the live probe. Native graph drawing and camera and item transforms remain unfinished.

Further native tracing identifies `0x1404c4400` as the first-person camera and projection setup. It calls `renderFirstPerson` with flags `0x21`. This path applies view bobbing through `0x1446bd990` and integrates a time-based rotation spring before actor drawing. The actor path also applies its world matrix, model scale, and global animations. These calculations require integration and visible comparison before Java hand transforms can be removed.


### Entity-relative bone matrices

Entity-relative animation preserves the translated bone origin and replaces the inherited matrix basis before local rotation and scale. This removes parent scale and shear too. The previous quaternion cancellation retained those transforms and included ancestor bind rotations.

The evidence comes from `BoneOrientation::updateBoneTransform` at `0x141bc3d20` in Bedrock 1.26.51.1 build 51061372. Its relative flag clears the first three matrix columns after position translation. The [native orientation fields](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/world/actor/animation/BoneOrientation.h) identify the transform state. Private executable probes run the complete function for 840 combinations. These cover parent rotation, nonuniform scale, shear, zero scale, translation, local rotation, and signed local scale.

The animated model now retains full matrices for drawing and geometry bounds. Scoped hooks preserve external actor and preview transforms. Authored cube pivots still use their local transforms. Matrix composition does not invert parent transforms, so an entity-relative child remains visible under a parent scaled to zero. Weak model references avoid retaining discarded previews. Nested calls and exceptions restore the previous scope.

All 840 native comparisons pass. Targeted model, locator, attachment, and scope tests pass. The full add-on build reports 506 tests, no failures or errors, and 103 optional skips. Its dependency builds, client bundle, and north-star PR check pass.

A rebuilt Java 26.3 client passes the production drawing and bounds probe. Two synthetic cubes produce 48 vertices at native-transformed corners under nonuniform and zero parent scale. Normals remain finite. External transforms remain outside the bone scope, and failed visits release that scope. These checks verify bone matrix composition. Native first-person camera transforms, graph submission, and held-item rendering remain incomplete.


### Native first-person rotation spring

Native appearances now use the target camera spring instead of Java's fixed angle-difference sway. Each appearance retains separate pitch, yaw, angular velocity, spring velocity, and clock state. The first-person frame applies these angles to the production camera matrix. Nested submissions and exceptions restore the previous frame.

Bedrock 1.26.51.1 build 51061372 computes this spring in `0x1404c4400`. The arithmetic starts at `0x1404c4bed`. Pitch and yaw samples interpolate wrapped actor angles. The previous angular velocity contributes 0.8, and the new velocity contributes 0.2. The clock caps elapsed time at 0.2 seconds. Spring integration uses steps of at most 1/120 second, damping of 42, stiffness of 900, and a drive factor of 90. The target clamps angular velocity to 50 degrees per second in each direction.

Private probes run the actual interpolation and spring instructions through `0x1404c4ebd`. The harness supplies actor rotations, camera state, frame alpha, a clock, and the `fmodf` import. It covers 435 independent cases and 948 retained frames at 30, 60, 144, and 240 frames per second. Java matches the native float bits, with NaN checks for zero-length frames. Portable tests also cover wrapped yaw, long frames, independent springs, and clock ownership.

A rebuilt Java 26.3 client through ViaProxy passes the production camera submission probe. Its matrix uses the executable-verified spring angles. Disabling bobbing removes sway and preserves the spring clock. A missing native appearance retains ordinary Java sway. Existing equip inputs, licensed hand visibility, nested scopes, and exception restoration pass six equipment and spectator cases. The probe restores player rotations, held items, the bobbing setting, and client appearance ownership.

The add-on and its two dependency builds pass. The add-on suite reports 509 tests, no failures or errors, and 104 optional skips. All three camera tests pass with the native fixture enabled. The client bundle and north-star PR check pass. This change covers angular camera sway. Projection, walking bob, native graph drawing, held-item transforms, and visible native motion comparison remain incomplete.

### Native first-person walking bob and airborne tilt

Native appearances now use separate walking-bob and tilt state for the hand view. The renderer uses native walking distance, the shared native sine lookup, a sideways factor of 0.65, and the target rotation order. It preserves existing camera transforms. The hook replaces only the first-person bob call when the submitted skin has a native actor graph. World-camera bob and ordinary Java skins retain their existing paths.

Bedrock 1.26.51.1 build 51061372 updates `PlayerBobComponent` in `PlayerTickBobSystem` at `0x14900c6c0`. It caps horizontal velocity at 0.1 and smooths toward it with a factor of 0.08. Airborne, swimming, and dead actors smooth toward zero. `PlayerTickBobPassengerSystem` resets current bob and retains its previous sample at `0x14900e360`. Mob tilt at `0x1401ef976` uses `atan(-velocityY * 0.2) * 15` while airborne and alive. It smooths with a factor of 0.4. The health accessor rounds positive fractional health upward. Grounded and dead actors smooth tilt toward zero.

The view matrix at `0x1446bd990` interpolates bob and tilt with frame alpha. It translates sideways and downward, then rotates around Z, around X for walking, and around X for tilt. The private probe runs the actual bob update and passenger reset. It also runs the tilt arithmetic and matrix block with supplied component accessors and CRT trigonometry imports. Its 472 update cases include grounded, airborne, swimming, riding, dead, and fractional-health inputs. All bob samples match native float bits. Tilt matches within 0.000001. The 300 matrix cases include existing camera transforms and match within 0.000002.

The rebuilt Java 26.3 client through ViaProxy passes a controlled live probe of the applied `GameRenderer` hook. Its matrix matches the native executable result. Missing native graphs and unmatched skins delegate to Java. The probe restores the player's walking and bob state. Existing camera-spring, equip-input, visibility, nested-scope, and exception-restoration checks pass too.

The full add-on suite reports 512 tests, no failures or errors, and 104 optional skips. All three bob tests and all three camera-spring tests pass with their private fixtures enabled. The add-on, its two dependency builds, the client bundle, and the north-star PR check pass. Player velocity still comes from translated Java movement. Native projection, full hand and item geometry submission, vehicle and movement timing comparison, and visible motion parity remain unfinished.

### Native first-person projection

Matching native appearances now use the ordinary hand camera's FOV and near plane. The first-person hook changes the HUD projection through Java's `Projection` API. This preserves reversed depth, the GPU depth range, the far plane, and window dimensions. Missing actor graphs, unmatched skins, third-person views, and panoramic views retain Java projection.

Bedrock 1.26.51.1 build 51061372 calls `0x1446bd180` with its world-FOV branch disabled at `0x1404c470b`. The base FOV is 70 degrees. The native effects toggle gates water narrowing to 60 degrees and the ordinary death curve. Lava uses a separate camera flag and does not narrow this FOV. The native counter getter at `0x142082df0` reads a signed short. The curve uses that counter plus frame alpha without Java's 20-tick cap. The result clamps to 5 through 130 degrees. The hand projection block at `0x1404c4710` uses a near plane of 0.025.

Java's `deathTime` keeps advancing on the client after 20 ticks. The binding uses this existing counter with the native signed-short conversion. It does not introduce another clock. A positive Java FOV-effects scale enables the native boolean toggle. Intermediate Java slider values therefore enable the full native effect.

Private probes execute the complete native FOV function and the actual signed-short getter. They supply option, actor-health, and death-camera tag accessors. The probe executes the native projection instructions with a supplied CRT `tanf` import. All 440 ordinary-camera cases match Java float bits, including counter wrap and frame-alpha edges. The 54 native matrices match both Java GPU depth ranges after depth conversion. All four targeted projection tests pass.

The executable also has an alternate branch for `MinecraftCamera::DeathCameraComponent`. That branch uses sine easing over 120 ticks and needs a separate camera-controller integration. These checks cover the ordinary hand camera. Native death timing, full hand and item geometry submission, and visible projection parity still require comparison.

A rebuilt Java 26.3 client through ViaProxy passes all 440 ordinary FOV cases through the applied `GameRenderer` projection hook. The probe checks the native near plane, lava exclusion, unchanged far plane and window dimensions, and all four fallback paths. It uses a controlled native actor appearance and restores player health, death ticks, options, and appearance ownership. This verifies the hook binding and projection inputs. It does not compare final rendered pixels against the native client.

The full add-on suite reports 516 tests, no failures or errors, and 104 optional skips. The projection, walking-bob, and camera-spring tests pass with their private fixtures enabled. The add-on, both dependency builds, client bundle, and north-star PR check pass.

## Microsoft Store sign-in consent

Built-in model, animation, and image loads first reuse available caches and Store credentials.
The **Microsoft Store sign-in** setting defaults to **Ask**.
Missing credentials show Minecraft's standard confirmation screen before the helper opens a login window.
**Sign in** permits interactive login. **Continue without it**, Escape, and screen removal decline it.
The decision applies to that account for the game session, and concurrent requests share the same prompt.
**Allow** and **Never** remain explicit settings.

The resource-image provider returns no licensed layers after missing credentials, declined consent, cancelled login, or optional download errors.
Normal mappings and server packs remain available, so these errors do not reject resource-pack preparation.
The provider retains errors outside optional acquisition, including interruption.
The reported 0.3.1 exception reached this provider and disconnected the client.

Private Linux client probes inject a missing-credentials response at the acquisition boundary.
The production consent screen appears at the default window size.
Declining, Escape, and a simulated cancelled interactive download all permit pack preparation and a playable dedicated-server connection.
These probes verify the client and provider integration. They do not establish fresh Microsoft authentication.
Automated tests cover silent reuse, shared consent, remembered refusal, accepted consent, explicit settings, and unavailable optional images.

Fresh Linux enrollment exposed Xodus's `pkexec` hardware probe before the login window appeared.
The helper now reports unavailable hardware with the same enrollment components instead of requesting elevation.
It retains an independent device identity and propagates enrollment errors.
Sign-in starts after the package header check, before full index inspection.
A fresh private Linux state enrolls the device and reaches Microsoft's sign-in page without elevation.
This verifies startup through the login page, not completed authentication or passkey support.
Closing the login window without issued tokens now stops acquisition before index inspection.
A private Linux window-close test returns a failed receipt immediately.
The Java helper bridge still bounds acquisition and terminates subprocesses on cancellation.

Fresh interactive Store sign-in remains a required check on Linux, macOS, and Windows 11.
The official Minecraft Launcher with Fabric also needs a runtime comparison.
All four platform helpers compile in release CI, but these builds do not verify interactive authentication or passkeys.
[WebKitGTK WebAuthn tracking](https://bugs.webkit.org/show_bug.cgi?id=205350) and a
[WebView2 missing-prompt report](https://github.com/MicrosoftEdge/WebView2Feedback/issues/5663) remain investigation leads.
Existing Bedrock MSA token reuse is verified below. A default-browser Store flow still needs protocol research.

The replayed stack reports 448 core tests, 539 add-on tests, and 16 converter tests, with no failures or errors.
There are 110 optional skips. Full core Checkstyle passes.
Interactive Rust tests pass five cases with two optional skips; headless tests pass six with two optional skips.

## Existing account tokens and initial Dressing Room selection

An unselected Dressing Room now downloads the account's active character on first open.
This uses the existing classic-pack and persona preparation paths.
A local selection made during download takes precedence at the synchronized store boundary.
Failures leave the current preview available and direct the user to Characters for a retry.
Existing local imports stay selected; imported account images without downloadable pack references remain unsupported.

The helper first tries existing Store credentials.
If credentials are missing, Java exchanges the Bedrock app's MSA refresh token for `service::www.microsoft.com::MBI_SSL`.
It retains the original app identity and obtains the PUID from that response.
The helper checks the original Xbox ticket against the selected XUID before licensing the package.
Short-lived credentials travel through private stdin. Receipts contain no tokens or license keys.
The response and process input limits bound these credentials.

A private Linux experiment obtains the matching 1.26.51.1 package license with this audience.
Fresh production helper state then extracts 6,146 files without a Store window or external game installation.
A mismatched selected XUID fails before extraction.
Java's original Bedrock refresh scope still works after the licensing-scope request.
These exchanges use the existing [MinecraftAuth ticket convention](https://github.com/RaphiMC/MinecraftAuth/blob/main/src/main/java/net/raphimc/minecraftauth/xbl/request/XblUserAuthenticateRequest.java)
and [Xodus licensing request](https://github.com/xodus-gaming/xodus/blob/a3afa0569332e32ce2677c0edc643ef85477ee3e/crates/xodus/src/licensing/content.rs).

Default Prism Flatpak permissions cannot invoke `flatpak-spawn --host`.
The headless helper now runs inside the sandbox with its C runtime.
A fresh in-game test with default Prism Flatpak permissions downloads the active account persona and renders its Dressing Room preview.
No Store window opens. The fixture starts without saved appearance metadata or cached licensed assets.
The CI-built Linux helper also extracts all 6,146 files inside Prism Flatpak with default permissions.
The CI-built Windows helper enrolls fresh private device state and extracts the same files under Wine 11.
Every extracted path and byte matches across these two runs. This does not establish Windows 11 interactive authentication.
The [0.3.2 workflow](https://github.com/StackAnvil/patches/actions/runs/37161239901) passes all four helper builds and tests and the full stack build.
The published add-on checksum and all eight embedded helper checksums are verified after download.
The embedded interactive helper retains its host runtime requirement.
Ask still controls interactive fallback when silent token acquisition is unavailable.
Default-browser fallback, fresh interactive authentication, Windows 11, macOS, and official-launcher runtime checks remain required.


### Browser authentication after 0.3.2

Replace the native WebView login with MinecraftAuth's device-code flow under the selected Bedrock application identity.
The default **Ask** setting still tries existing credentials and silent MSA licensing before requesting consent.
The browser screen shows a code with reopen, copy-link, and cancel actions.
It waits up to 15 minutes, keeping authentication on a separate cancellable worker.
Cancellation leaves the pack worker uninterrupted and suppresses later automatic prompts for that account during this game session.
Only successful licensing and selected-XUID verification permit replacing the current MSA session.

Remove native UI dependencies and the duplicate helper variant.
One helper per platform now performs licensed extraction inside the launcher environment, including default Prism Flatpak permissions.
Existing licensed Store sessions remain usable.
This change follows the selected account's existing application identity, rather than requesting a refresh under Xodus's unrelated application.
Microsoft issues a real device code through the LIVE endpoint, and the browser reaches the Minecraft sign-in page.

A private Linux client renders the production screen with a synthetic code and uses its Cancel button.
The previous screen returns, its worker stops, and the caller remains uninterrupted.
Automated tests cover cancellation, successful completion followed by screen closure, and cancellation suppressing subsequent automatic prompts.
The replayed stack passes 896 Java tests with 110 optional skips.
Six native tests pass with two optional skips, and all 92 tooling tests pass.
Fresh browser authentication, passkeys, Windows 11, macOS, and official-launcher runtime behavior remain unverified.
These changes follow the published 0.3.2 release and are not included in that tag.

All four updated helper builds and tests pass in [CI](https://github.com/StackAnvil/patches/actions/runs/37164336981).
Downloaded artifacts contain exactly one helper per platform with a matching checksum.
The new Linux helper licenses and extracts 6,146 files from fresh state inside default Prism Flatpak permissions.
All paths and bytes match the previous Windows extraction.
The real browser code expires without completed authentication, so that boundary remains unverified.


### Server sound playback

The shared native backend now accepts complete core sound commands on direct and ViaProxy connections.
It resolves ordered server resources, assets already loaded under a valid license, or mapped Java samples.
Audio resolution does not acquire Store assets or open sign-in screens.

PCM streams preserve signed finite and infinite loop counts without copying repeated samples.
Processed OpenAL buffers supply the playback count used when seeking.
Server handles support volume, pitch, timed fades, seek, pause, resume, and stop.
Pending controls retain packet order while a sample decodes.
Cancellation and generation checks cover queued decoding, channel allocation, engine resets, and disconnects.
Animation cleanup uses a separate generation and leaves server voices active.

Four targeted tests cover PCM frame alignment, finite and infinite repetition, remaining loops, and fade replacement.
The full stack build passes 915 tests with 110 optional asset skips across all projects.
A captured native control session replays through direct and ViaProxy routes, reaches spawn, and loads the converted pack.
Private OpenAL instrumentation observes looping, pitch 1.3, seek to 0.01 seconds, independent pause and resume, and stop.
The ViaProxy route's envelope reaches 0.2 from 0.3 over two seconds.
The fixture uses the mapped Java sample without a Store account.

The lab remains at zero volume. Audible parity, listener-range eligibility, captions, stream interruption policies, handle replacement, finite-loop seeking, and broader pause/reset comparisons remain unverified or incomplete.
These additions follow 0.3.2 and are not included in that release.


### Caption research for the pinned client

Private probes execute 587 caption dispatch cases and 96 caption storage cases in the 1.26.51.1 executable.
Dispatch uses caption enablement, supplied volume, caption metadata, sound name, ambient/weather key prefixes, and native direction math.
Storage removes expired entries and refreshes duplicate localized text with the latest duration, direction, and marker.
The duration setting supplies milliseconds; stored lifetimes use seconds.
The marker's originating caller remains unverified.

The [coverage ledger](../../../docs/bedrock-coverage.md#native-caption-behavior) records the supplied boundaries and remaining work.
These findings guide caption transport and playback integration; they do not add a production caption HUD or establish visible parity.

### WAV resources and custom server audio

Resolve FSB, OGG, then WAV within the highest pack before trying lower packs.
Dispatch WAV decoding to ViaBedrock core and include WAV files in server effect libraries.
An adapter test checks sample data and dimensions; resolver tests cover cross-format overrides and precedence.
The updated core patch passes fourteen tests and both Checkstyle tasks alone on the pinned upstream base.
Both full stacks replay and all four projects build: 915 tests pass with 110 optional asset skips.

A pinned native session loads PCM WAV, IMA WAV, and OGG samples from a custom server pack.
Its unchanged capture passes complete transport checks through direct and ViaProxy connections.
Neither test client has a Store account, and all three custom events have an empty Java fallback.
Private OpenAL observations show looping, pitch 1.3, fading from 0.3 to 0.2, seek to 0.25 seconds, pause, and resume.
ViaProxy stop commands remove all tracked requests and handles.

The lab stays muted. Native audible mixing, WAV loop metadata, multichannel output, other WAVE codecs, and native quantization comparisons remain required.
The separate skin rendering gates remain incomplete.
These changes follow the published 0.3.2 release.


### Loose WAV extraction

The licensed package selector now admits WAV files under `sounds/`. Cache format 9 invalidates older selections. The resource validator accepts WAV as a sound asset. Path checks and size limits still apply.

Validation: the Rust selector test passes with admitted WAV paths and rejected misleading extensions. The full build passes with 915 Java tests passing and 110 optional asset tests skipped. Native WAV playback and decoder comparisons are described in the audio coverage ledger.


### Native server sound admission

Apply core's native request distance comparison against the client's audio listener before registering handles or decoding samples. A distant replacement must leave the existing handle intact. Use request volume for eligibility; sample positional flags and attenuation do not change this gate.

Validation: the Java comparison matches 1,188 native packet-domain cases. The full build passes with 919 Java tests passing and 110 optional asset skips. Muted direct and ViaProxy fixture replays verify the four eligible OpenAL voices, rejection of two new handles, preservation after a rejected replacement, and cleanup to zero requests and handles. The fixture changes sound requests over a native recording. Audible parity, other range paths, and broader camera contexts remain unverified.


## Server closed captions

The client snapshots player/listener pose after native sound range admission and resolves caption metadata independently of sample decoding and channel allocation. Core owns admission, direction, duplicate refresh, time, and fade state. The client supplies persisted controls and HUD drawing. Server translations arrive through the shared core native archive on direct and ViaProxy routes. Already licensed catalogs remain available without initiating Store sign-in.

The pinned native factory and duration-vector initializer establish disabled caption/filter defaults, top-right placement, a 1,500 millisecond default, and half-second duration steps from 1,000 to 4,000 milliseconds. The HUD uses the native 30% area, 50-unit inset, arrows, centered text, chat background, and final one-second quartic fade.

Private direct and proxy sessions reach spawn, load the recorded server translations without a Store account, show all five positive-volume cues in HUD state, exclude the zero-volume cue, and expire entries. HUD screenshots confirm visible text and arrows on both routes. The proxy image shows all five rows with Java's tutorial disabled in the lab; the direct image has a tutorial toast over two rows. The transport-only replays retain separate skin/actor rendering failures. Complete native layout parity, actor/local caption sources, marked-source integration, settings-change timing, localization precedence, custom fonts, and audio-device-unavailable behavior remain incomplete or unverified.

The independent licensed helper now retains `texts/*.lang` and text archives. Cache format 10 requires the English catalog, which refreshes older incomplete extractions. Targeted Rust selector tests and Java cache tests pass. Fresh licensed acquisition with this language selection remains unverified. [Microsoft documents English fallback](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Reference/Content/MCToolsValReference/langfiles.md).


## Local particle sound caption admission

Share the native float listener gate with local particle sound emitters. Preserve their original float positions; PlaySound still converts its fixed-point coordinates before calling the same calculation. The Java helper matches 444 native local-emitter admission cases. Particle configuration and caption metadata resolve before PCM loading, so unavailable samples do not suppress captions. This path uses marker zero in the pinned native alias caller. Network actor-marker integration and attached-animation caption behavior remain unfinished.


Validation: the complete build passes 926 Java tests with 110 optional asset skips. The core audio patch builds alone with 24 tests and both Checkstyle tasks. The targeted particle/resource-library run passes 12 tests with private native references enabled and two unrelated optional conditions skipped. Synthetic direct and ViaProxy sessions invoke the production local-emitter entry point, retain a caption for a missing PCM sample, exclude quiet/distant cues, and expire rows. Screenshots show caption output with concurrent-row clipping. These checks do not cover incoming particle packets, proxy actor/effect graph transport, complete layout, or audible parity.

## Shared server resource snapshots

Use one library snapshot for server audio, captions, particle graphs, controllers, and textures. Merge accepted archives by source pack index, including empty layers. Reject conflicting paths, mismatched indexes, and aggregate limits. Rebuild snapshots after world/resource lifecycle changes or a change to already loaded licensed assets. Loading this snapshot does not initiate Store sign-in.

Direct server actors share core selection APIs with converted resource packs. Tests verify archive merging, immutable maps, mismatched layers, and domain collisions. The complete stack passes 933 Java tests, with 110 optional asset tests skipped. Incoming particle packets, actor binding, typed Molang evaluation, and visible effect parity remain incomplete.

**Resource availability check:** An authored pack contains three particle definitions and one texture. Private main-thread instrumentation reads all three definitions and the identical texture bytes from the accepted converted resource pack on direct and ViaProxy connections. Both full replays reach spawn, transport every recorded payload, and load the Java resource pack without Store sign-in. This verifies resource availability, not incoming particle dispatch or visible effects. The existing direct skin-update failures and missing ViaProxy actor/appearance state remain open.


## Shared native block mirror

Receive the core's authoritative block identity channel and bind its mirror to the current client world. Preserve the mirror during resource reloads and clear it on disconnect. Native particles use this shared mirror instead of reading a direct-only ChunkTracker. Filtered effects require initialized world data. Unfiltered effects can start through ViaProxy.

The full build passes 940 Java tests with 110 optional asset skips. A targeted filter test verifies the core mirror after an update at negative coordinates. Live direct and ViaProxy sessions each receive 2,712 initial section snapshots. Every client lookup matches the transported state and dictionary. Direct producer hashes also match the decoded snapshots. Updates match on both routes. These checks do not establish incoming particle dispatch, visible effect parity, or live dimension/unload/disconnect behavior.


## Native server particle receiver

Register the native particle channel and receive complete requests through direct connections and ViaProxy.
Use shared server resources and already loaded licensed assets without starting Store sign-in.
Apply core's typed Molang values with native member hashing and duplicate rules.
Copy structs across emitters, assignments, and query-value assignment.
Normal script assignment names remain case insensitive.

Bind actor requests to Java entity ID, UUID, object identity, and world lifetime.
Sample position, yaw, bounds, and supported physical queries from that entity.
Return start success from the particle runtime and decode the complete Java fallback when an effect cannot start.
Discard fallback work for replaced worlds or removed actors.

The full stack passes 947 Java tests with 110 optional asset skips.
Two client tests cover struct isolation, nested assignment, query copies, script casing, and Minecraft decoding of core's fallback body.
The standalone core particle patch passes eight tests and both Checkstyle tasks.

An authored fixture verifies production packet dispatch on direct and ViaProxy connections.
Both routes admit four requests, start two emitters, and decode one fallback on the main thread.
Their typed size, tint, position, and fallback records match exactly.
Missing actors and other dimensions do not reach the receiver.
These profiles have no Store session.

Visible native parity, complete actor queries, remote actor transport, interpolation, removal, ID reuse, world transitions, and reload timing remain unverified.
The fixture has a sparse world and an unstable camera; runtime records do not prove visible parity.
Malformed JSON compatibility and further native variable forms remain open.

### Shared float interpreter

Use MochaFloats 6.1.0 from Maven Central with the same parser, lexer, and interpreter modules as ViaBedrock. Replace double AST constants with float constants. Retain typed packet variables, native easing functions, query bindings, precedence, and loop limits. The bytecode compiler is unused and is not bundled.

Numeric regressions cover rounding before comparisons, persistent assignments, and query inputs. Broader native animation and particle comparisons remain required.

Validation: the add-on suite passes 446 tests with 108 optional tests skipped, including 13,578 saved native easing cases. The add-on bundles the fork's lexer, parser, and runtime modules. Its nested ViaBedrock JAR retains the MIT notice.

### Core math integration

Animation and view bobbing now use core's native easing, angle functions, and regenerated sine lookup. The duplicate client math classes are removed. Finite scalar results above 32,768 remain intact. Non-finite checks and parser and execution limits remain.

Bedrock 1.26.51.1 constant and runtime paths match across 9,367 angle cases. The probes cover directed endpoints, half-turn ties, extrapolation, large finite inputs, and overflow intermediates. Their prepared numeric contexts and host C remainder import do not establish visible animation parity.

Validation: the full build passes 958 Java tests, including both native math fixtures. The bundle builds. Direct and ViaProxy particle graphs exercise all three shared functions and produce matching dimensions. Their downloaded archives retain the authored expressions. Visible parity and the existing actor and appearance gaps remain open.

## Shared native actor inputs

Replace the direct connection's player-state mixin with the negotiated core actor channel.
The receiver applies immutable snapshots on the current Minecraft connection's client thread.
Connection generation checks reject queued updates from a previous world or session.
A local-player flag resolves the current Java profile identity.
Charging and spell-color particle callbacks use actor lifetime tokens, so replacement actors cannot inherit stale callbacks.

Four client tests cover flags, typed colors, local identity, and cleanup.
The optional native fixtures pass when enabled, including 1,504 spell-color cases and the captured charging inputs.
This change does not complete all particle queries, interpolation, actor events, or effect timing.


### Native first-person actor drawing

The matching 1.26.51.1 executable draws the actor before its separate item pass.
`renderFirstPerson` at `0x1447ca170` passes zero position and clears actor rotations.
The actor root block at `0x14558da04` subtracts the render height offset, converts axes, and applies model scale.
Its ordinary offset is `24 * modelScale + 1/128` blocks before bone drawing.
The earlier half-collision-height assumption does not describe the live standing hand pass.
Runtime inspection of the matching build reads a render offset of `1.6200100183486938` blocks and model scale `1/16`.

The add-on now retains the sampled first-person pose and submits the complete hierarchy before Java item transforms.
It keeps separate models for this view and applies the same pose to persona surfaces.
Authored visibility hides a bone's surfaces while preserving independently visible descendants and their parent transforms.
The existing camera and projection remain scoped to the same appearance.
Minecraft's individual hand submission is suppressed while this native actor is submitted.
Unknown visibility or unavailable graphs retain the existing hand path.
Render materials are cached per surface and lighting family.

The private executable fixture covers 324 root matrices with signed script scales, zero model scale, arbitrary input matrices, and skipped offsets.
The optional `STACKANVIL_ACTOR_ROOT` test checks those results.
Portable tests cover camera-space positions, axis conversion, collapsed scale, and hidden parent surfaces with animated children.
The complete stack build passes 996 tests, skips 114 optional cases, and has no failures or errors.
The focused native root and hierarchy tests also pass with the private fixture enabled.

This path combines ordinary player scale with authored script scale, described below.
Global actor animations, server costume selection, and native held-item transforms remain incomplete.
The server costume patch retains its existing hand path until its selected first-person surfaces can resolve.
Native visible motion, persona overlap, and timing still require comparison.
Native assets, executable exports, and capture fixtures remain private.

The first live screenshot exposed a pivot-name mismatch.
The native model parser folds bone and parent names to ASCII lowercase; the query hashes retain their literal spelling.
A prior executable probe covers all byte values, SIMD lengths, and mixed-case UTF-8 names across 443 inputs.
The query snapshot now folds stored bone names by that rule.
Queries remain literal, and non-ASCII letters retain their original bytes.
The regression uses camel-case geometry with lowercase native arm/item queries and checks the resulting short-arm offset.
This prevents a missing arm pivot from adding 22 pixels of incorrect vertical displacement.

The final direct and ViaProxy tests connect to an isolated server with the matching game build.
A private fixture supplies the licensed classic-player graph to each client.
The actual Minecraft entry submits one complete actor, suppresses duplicate Java arms, and restores its pose and appearance scopes.
Both final screenshots show the posed arm after the pivot correction.
These tests verify drawing through both routes, not account downloads or native pixel parity.
Persona overlap, equipped items, script scaling, and visible motion remain unverified.

An earlier attempt used an older server and correctly failed before gameplay.
The first matching runs passed entry checks but showed no arm.
Those screenshots exposed the pivot fault and demonstrate why submission checks alone cannot establish visible behavior.

### Authored scale in first-person drawing

The shared actor graph now parses `scripts.scale`, `scaleX`, `scaleY`, and `scaleZ`.
The [Creator reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable) describes geometry scale as an actor script.
The matching 1.26.51.1 player definition supplies the uniform value `0.9375`.

The native root at `0x14558d230` requests uniform scale first.
Its presence excludes all axis expressions, including when its result is zero.
Without uniform scale, the root requests Z, Y, and X in that order, with missing axes set to one.
The accessor at `0x141c40240` evaluates expressions in the existing actor context.
Root scaling precedes the render-controller work in `0x141c362e0`.

First-person drawing follows that order after graph sampling.
It does not rerun initialization or animation scripts to obtain scale.
Expressions retain their changes to actor variables, and independent perspectives retain separate scopes.
The renderer applies signed and zero values before the ordinary model offset and model scale.
Other actor drawing paths still require scale integration and native comparison.

The expanded private executable fixture covers 354 matrices.
Its additional cases exercise every combination of missing, zero, and negative axes, plus uniform precedence over conflicting axis values.
The native call trace verifies both request order and skipped axis access.
Three portable tests cover shared-variable side effects, defaults, signed and zero results, perspective isolation, and time rewinds.
The complete build passes 999 tests with 114 optional skips and no failures or errors.
The focused suite also passes with the licensed controller and native matrix fixtures enabled.

Final direct and ViaProxy clients pass the actual Minecraft entry check with the licensed `0.9375` scale.
A private adaptation resets a variable during pre-animation and sets it in the scale expression.
Controller visibility requires that variable, so the visible arm checks scale-before-visibility ordering through the production renderer.
Both routes retain the complete hierarchy, suppress duplicate Java hands, and restore their pose and appearance scopes.
Both final screenshots show the scaled arm.
These supplied resources do not verify account acquisition, persona overlap, or native pixel and motion parity.

### First-person global actor transforms

The matching 1.26.51.1 global pass at `0x141d5d280` applies death roll and exact upside-down names.
The death helper at `0x141d5d070` uses the frame fraction and virtual death counter before the player roll.
The progress is `sqrt(((deathTicks + frameAlpha - 1) / 20) * 1.6)`, capped at one.
The player roll reaches 90 degrees.
Exact raw names `Dinnerbone` and `Grumm` then add a half turn and the collision-height translation.
Case changes and formatting remain significant.

The first-person entry at `0x1447ca170` sets the local player property around actor and item drawing.
That property suppresses gliding and riptide branches in the global pass.
Executable probes verify unchanged matrices for both movement flags, separately and together, with supplied local first-person inputs.
The private global fixture covers 415 matrices, including arbitrary input matrices and combined death and name transforms.
The existing private root fixture covers 354 matrices.

The hand renderer keeps the native ordering: height offset, half-turn basis, global transforms, axis conversion, script scale, and model offset.
This replaces the collapsed basis that was valid only without an intervening global transform.
Core transports the raw name through the versioned actor-state channel on both connection routes.
The renderer uses the Java entity death counter and frame fraction.
A portable composition test covers the root order and exact name matching.
Both native matrix fixtures pass in the complete dependency build.
That build passes 1,002 tests with 113 optional skips and no failures or errors.

Native death-counter lifecycle, player-name initialization from gamertags, and visible native timing remain unverified.
Other actor drawing roots, selected costume hands, held items, and persona overlap remain incomplete or unverified.
All native executable data and licensed resources remain private.

Final direct and ViaProxy checks inject private authored `SET_ENTITY_DATA` packets before the production decoder.
Each frontend receives the unchanged formatted name `§aDinnerbone`, followed by the exact `Dinnerbone` name.
Both actual Minecraft hand entries submit the expected matrix for combined death and name transforms with the licensed `0.9375` scale.
They suppress duplicate Java hands and restore the pose and appearance scopes.
The fixture then clears the name, and both final screenshots show the native arm.
These supplied packet and graph inputs verify transport and draw-time composition, not native lifecycle or pixel parity.

### Hand-view controller selection

The shared render selector can use the sampled actor scope after animation and scale expressions.
It does not rerun initialization or pre-animation scripts for the hand view.
This scope retains controller entry changes, query inputs, scale side effects, and independent perspective clocks.
The full selection includes the original body alongside custom geometries and multiple texture draws.

A portable test selects geometry through an animation entry variable and admits draws through a scale mutation.
It verifies UV values, lighting inputs, independent perspectives, repeated selection, and original-body classification.
The selector now belongs to the shared actor graph patch.
Costumes and equipped items use the same implementation.

### Live hand geometry origin

Use local eye height for the actor root.
Native posed bones and the converted `ModelPart` hierarchy already contain the same 24-pixel Y bind origin.
Remove the extra translation that counted this origin twice.
The earlier corner comparison omitted the native bone transform and was insufficient evidence.

Live Bedrock 1.26.51.1 probes capture both posed bone matrices and the actor root after `0x14558dfa1`.
The corrected portable test compares all corners of two authored cubes using both transforms.
Supplied yaw-zero root cases and global death/name cases also pass without the extra translation.

Direct and ViaProxy hand-entry probes select two distinct model submissions, preserve scale 0.875, and restore scopes.
With layered server definitions, their right `[8, 15, 10]` and left `[1, 18, -1]` bone translations match native.
The shared server graph obtains its effective description from the core layer resolver.

At matched 1280 by 694 viewports, both fixture silhouettes agree with native within one pixel. The earlier smaller Java viewport let the hotbar hide most of the cyan cube. Lighting, movement, equipped items, and general raster parity still need comparisons.
Native render-offset changes across poses and dimensions remain unverified.
Java eye height differs from the captured standing value by about `0.00001` blocks.
Fixture assets, native runtime records, and screenshots remain private.

### Licensed descriptions use the core merger

The licensed library now merges description objects through the same core implementation as server graphs.
The reader retains duplicate identifier rejection within each pack and returns independent merged snapshots.
The latest matching player file declares 68 aliases; the full stack resolves 72.
Four earlier aliases cover item attack rotation, crossbow hold, breathing bob, and fishing-rod animation.
The optional licensed test verifies those mappings and samples the real graph for 120 frames.
A synthetic partial overlay verifies both arm poses, script scale, retained roots, and explicit empty-list replacement.
Production still acquires assets independently and requires no local Bedrock installation.

### Matched standing hand raster comparison

The native and Java viewports both use 1280 by 694 pixels.
The ordinary hand camera uses 70 degrees, and the stable Java hand projection records near plane 0.025.
Both Java routes reproduce the selected scene prefix, scale, posed bones, and cube submissions.
Orange bounds are native `(640,488)-(715,584)` and Java `(640,487)-(715,584)`.
Cyan bounds are native `(771,647)-(910,693)` and Java `(770,647)-(910,693)`.
The same Java bounds occur through direct connections and ViaProxy.
The isolated color masks establish placement within one pixel for this standing fixture.
World lighting and HUD timing differ, so this comparison does not establish full color or scene parity.
Rotations, movement, death, equipment, persona overlap, and other dimensions still require native comparisons.
Captures and probe data remain private.


### Rendered hands during item swaps

First-person graphs now read retained item stacks from `FirstPersonHandsAndItemsRenderState`.
The avatar's ordinary render state still supplies third-person rendered stacks.
Equipped names, charge state, and use durations retain their separate inventory inputs.
Hand submission copies the actor frame before replacing item queries, so the changes do not escape that scope.

Minecraft 26.3 retains previous stacks while its swap animation lowers the hands.
The [official item-name query](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/queryfunctions/query_get_equipped_item_name?view=minecraft-bedrock-stable) distinguishes equipped and currently rendered items through its second argument.
Earlier execution of the matching Bedrock 1.26.51.1 callback verifies its argument handling and raw-name resolution.
This change supplies the actual first-person stacks to that existing query implementation.

An expression-driven bone test samples retained, replaced, and empty main-hand stacks, plus an independent offhand transition.
It checks equipped-name selection, charge state, duration, and preservation of the actor frame.
The target executable height and arm-offset fixtures still pass with the expanded hand input.

Native swap timing, native held-item transforms, first-person equipment, and full visible item parity remain incomplete or unverified.

**Runtime verification:** Direct and ViaProxy replays reach spawn and load the same selected 75-second packet prefix.
The production hand-frame sampler passes 12 query checks on direct connections and 18 through ViaProxy.
The controlled states retain a bow, replace it with a crossbow, and clear it while equipped inventory remains unchanged.
The ViaProxy probe explicitly checks all three rendered names, including the empty name.
Both probes check independent offhand inputs and scope restoration.
The existing two-surface hand submission and layered pose checks still pass through Minecraft's hand entry.
The generic third-person audit reports no avatar draw because this fixture defines only first-person controllers.
These controlled runtime checks establish query binding, not native swap timing or final held-item pixels.

**Validation:** The dependency build and Java suites pass 1,013 tests with 115 optional skips and no failures or errors.
The focused hand input suite also passes with native height and arm-offset fixtures enabled.
The full coverage goal remains active.


### Native hand height without Java cooldown scaling

The matching Bedrock 1.26.51.1 executable, build 51061372, advances each hand height by at most 0.4 per tick.
Its animated-replacement classification targets zero; other classifications target one.
Native instruction execution covers 900 independent combinations of both initial heights and classifications.
These checks isolate the arithmetic inside native function `1447af310`.
They do not establish the complete native item comparison rules.

Minecraft 26.3 scales its retained main-hand target by the cube of `getItemSwapScale(1)`.
That method uses the item swap ticker and attack strength delay.
The complete native height update now runs when the local skin texture matches a loaded native appearance graph.
The fallback retains ordinary Java updates, and attack strength and inventory state remain unchanged.
Missing, pending, failed, and mismatched graphs retain ordinary Java hand behavior.
Both licensed appearance graphs and server graphs use the existing shared appearance selection.

The [official first-person sample](https://github.com/Mojang/bedrock-samples/blob/main/resource_pack/animations/player_firstperson.animation.json) shows how hand height drives the swap pose.
Its current branch is a research lead; the matching executable establishes the target arithmetic.

Native item classification, full swap timing, held-item drawing, and final visible parity remain incomplete or unverified.
Reference inputs, executable exports, and live probes remain private.


**Runtime verification:** Direct and ViaProxy clients each pass all 900 reference cases through Minecraft's actual hand tick with Java swap scale zero.
Their old hand heights retain the previous values for interpolation.
Both routes also pass four fallback cases: missing appearance, mismatched texture, pending graph, and failed graph.
The existing two-model submission, layered poses, rendered-item queries, and scope restoration still pass.
The controlled fixtures use matching stacks, equivalent copied stacks, and animated replacements.
They do not establish the classifier for every native item pair.
The generic third-person audit reports no avatar submission because the fixture defines only first-person controllers.
The hand-specific probes provide separate evidence.

**Validation:** The dependency build passes 1,013 Java tests with 115 optional skips and no failures or errors.
The full add-on stack replays all 23 patches.

Both clients reach playable spawn, load the converted packs, and complete the unchanged 75-second scene prefix.
These checks establish transport and hand behavior for this fixture, not complete visual parity.

### Native item comparison evidence

The matching native client supplies dispatch evidence for 19 item identifiers.
Shield, firework star, and filled map use separate comparison rules.
The glow-stick and sparkler color exception also has identifier evidence from native globals.
Unicorn executes 2,176 base and shield classifier cases with valid synthetic stacks and absent user data.
These checks establish classifier branches, not complete NBT behavior or final swap pixels.
A later live watchpoint identifies the successful-block timer, its guard, and its rising-edge behavior.
The local blocking-start branch and live timestamp write now have matching executable evidence.
Complete network timing and remote-player lifecycle remain unverified.
Production still uses Java item comparison, while core supplies the native height update and copy threshold.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-item-classification-research) records the verified rules and remaining work.


### Native player blocking query

Player animation graphs now bind `query.blocking` to the actor flag supplied by core.
The matching Bedrock 1.26.51.1 build 51061372 callback reads `BLOCKING` (72), including during `TRANSITION_BLOCKING`.
A missing native actor snapshot retains Java's existing result.
The existing core snapshot format already carries the flag on direct connections and ViaProxy.

Unit tests cover actor replacement, stale removal, matching removal, cleanup, and native-state precedence.
A private instruction fixture matches all 64 callback cases.
The dependency build and complete add-on suite pass 1,016 Java tests, with 115 optional skips and no failures or errors.
All 23 add-on patches replay successfully.

Direct and ViaProxy clients each match all 64 cases through the actual player animation query method.
Both retain the 900 native hand-height cases, four Java fallback cases, selected hand models, and retained item queries.
Both preserve the complete recorded 75-second scene prefix and reach playable spawn.
The probe supplies snapshots and restores the registry afterward.
It does not establish final shield pixels or complete network flag lifecycle behavior.

The generic third-person audit still reports no local avatar submission for this fixture's first-person-only controllers.
The direct CLI reports that audit failure.
The ViaProxy CLI retains the audit report with its transport-only option.
The hand-specific probes provide separate evidence.

Complete network timing and visible shield parity remain incomplete or unverified.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-player-blocking-query) records the native evidence and runtime checks.


### Native shield timeline binding

Player graphs now bind `query.shield_blocking_bob` to the core actor registry.
The add-on supplies one clock increment per active Minecraft tick and clears the registry when the world unloads.
Core owns the three timestamp updates, native arithmetic, and lifetime cleanup.
The existing snapshot channel supplies native flags through direct connections and ViaProxy.

Bedrock 1.26.51.1 build 51061372 supplies the matching instruction evidence.
The callback requires blocking and a positive blocking-start timestamp, but measures elapsed time from the damaged-block timestamp.
The [official Molang reference](https://mojang.github.io/bedrock-samples/Molang.html) describes shield movement after a hit.

Direct and ViaProxy clients each match 2,700 native callback cases through the actual animation query method.
They also observe one core clock increment for each of 20 active Minecraft ticks.
The private probe supplies snapshots and timestamps and restores the registry afterward.
Both routes retain the existing hand checks and preserve the complete 75-second scene prefix.

The dependency build and final Java suites pass 1,019 tests, with 115 optional skips and no failures or errors.
The final suites include the private native timestamp, bob, and blocking fixtures.
All 23 add-on patches replay successfully.

The generic third-person audit still reports no avatar submission for the fixture's first-person-only controllers.
Both runs retain that report through the transport-only option.
Unlicensed built-in asset requests log unavailable-account warnings without preventing the accepted server graphs or hand probes from completing.
Complete network timing, remote-player behavior, pause behavior, shield item classification, and final shield pixels remain incomplete or unverified.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-shield-blocking-timeline) records the implementation and limits.


### Native hand height and retained-copy lifecycle

The matching native appearance now selects a complete hand update through `NativeHandItemState` in core.
The add-on preserves prior heights, applies independent height updates, and copies retained stacks after the native copy decision.
The retained stacks remain independent from equipped inventory stacks.
The native path omits Java hands-busy suppression and attack-delay scaling.
Absent, pending, failed, or mismatched appearances retain the complete Java update.
The obsolete cooldown-only mixin and scale helper are removed.

Bedrock 1.26.51.1 build 51061372 supplies 2,304 height-and-copy instruction cases and 24 exact copy boundaries.
The probe observes and skips native stack-copy calls rather than emulate their internals.
Direct and ViaProxy runtime checks each match 4,608 cases through Minecraft's actual hand tick with hands busy enabled and disabled.
They compare old heights, new heights, copy decisions, and retained stack contents.
All four Java fallback modes retain busy-hand suppression.

Both routes preserve the complete recorded 75-second scene prefix and retain the existing height, blocking, shield bob, and hand rendering checks.
The generic third-person audit reports no local avatar submission for this fixture's first-person-only controllers.
Both runs retain that report through the transport-only option.
Account warnings for unavailable built-in assets do not prevent the accepted server graphs or hand checks from completing.
The dependency builds and final Java suites pass 1,022 tests, with 115 optional skips and no failures or errors.
All 23 add-on patches replay successfully.

Item comparison still uses Java selection rules, with full stack equality as the retain case.
Item-specific classifiers, selected-slot timing, and complete visible swap parity remain incomplete or unverified.
The following section records original Bedrock comparison data transport.
The [coverage ledger](../../../docs/bedrock-coverage.md#native-hand-height-and-retained-item-lifecycle) records the evidence and limits.


### Original item data and Java fallback comparisons

Core now transports decoded original item data in the versioned `viabedrock:item_stack` custom-data compound.
The retained Minecraft stack keeps this context independently from the equipped stack.
The add-on removes only this compound from temporary Java fallback comparison views and normalizes empty custom data there.
Other components, native identifiers, and compiled animation fields remain comparison inputs.
A metadata-only change immediately refreshes the retained copy without triggering a swap animation.

Direct and ViaProxy runtime probes each preserve seven authored inventory cases through the production decoder and Minecraft stack.
Both clients pass 32 metadata-refresh cases through the actual hand tick, including busy hands and absent or empty custom data.
Four additional cases retain Java's comparison behavior for changed identifiers and unrelated custom data.
The original native scene prefix remains complete on both routes.
The additional authored packets enter after scene recording and have separate receipts.

Existing hand height, copy, blocking, bob, clock, and rendering checks still pass.
The fixture's first-person-only controllers still produce the expected generic third-person audit failure.
Account warnings for unavailable built-in assets do not prevent accepted server graphs or hand checks from completing.
Dependency builds and final Java suites pass 1,026 tests, with 115 optional skips and no failures or errors.
All 23 add-on patches replay successfully.

Item selection still uses Java fallback rules.
Native item-specific comparison, restriction hashing, derived auxiliary data, charged items, selected-slot timing, and final visible parity remain incomplete or unverified.
The [coverage ledger](../../../docs/bedrock-coverage.md#original-bedrock-item-comparison-data) records the contract and limits.


## Reuse the accepted archive for effects

Sound, caption, and particle loaders use the core actor archive's shared effect view.
The view preserves previous file admission, layer order, empty layers, texture overlays, and caption locales.
Accepted resources share their decoded bytes with actor loaders.
Already licensed built-in assets retain their existing fallback order.
Reload and disconnect invalidate the shared archive cache.

The separate effect archives and their merge helper no longer serve production paths, so remove them.
The existing resource-library tests retain sound, caption, particle, and overlay behavior.
The matching core emits one archive, and new converted packs require this matching add-on.

The derived effect library also keys its snapshot by the shared decoded layers.
Actor-cache invalidation and resource-manager replacement therefore refresh effects without a separate sound reset.
A targeted regression test covers retained data before invalidation and refreshed texture bytes after both transitions.


### Native color exceptions, copies, and selected-slot state

**Verified research:** The matching Bedrock 1.26.51.1 executable, build 51061372, supplies the color predicate and its complete hand-tick caller.
Static initializers bind the two native identifiers to `minecraft:glow_stick` and `minecraft:sparkler`.
Both initializer constants match the identifiers' FNV-1 hashes.
The predicate checks the hash and name bytes, with a mutual-pointer cache fast path for the first identifier.
These identifiers cover the Education color exception, not banners or shields.

The caller skips color handling after a retain result or when both stack counts are zero.
For an update or animated replacement, the helper requires equal native item IDs and a recognized current item.
It uses the block-derived auxiliary value when a block exists, except for raw wildcard value `32767`.
Otherwise, it uses the raw auxiliary value.
The helper masks the value with `31` and replaces results of `16` or more with `5`.

Both equal and unequal normalized colors copy the current stack into the retained stack.
Equal colors force retention, including after a selected-slot change.
Unequal colors leave the original update or animation result in place.
The color copy does not update the cached selected slot.
Only the ordinary main-hand copy updates that cache, after an immediate update or the existing height threshold.
The offhand receives no selected-slot change argument and never updates the main-hand slot cache.

The owner constructor prefix initializes the cached slot and all four height fields to zero.
It calls both native empty-stack constructors and retains the supplied client bridge.
Six sentinel cases execute those constructors and verify empty stacks, valid flags, auxiliary values, counts, restrictions, and variant tags.
The probe supplies the later owner allocation and stops before the remaining constructor body.
This proves initialization for that prefix, not world changes, appearance transitions, or the owner's complete lifetime.

| Native instruction probe | Cases | Scope |
| --- | --- | --- |
| Identifier predicate | 120 | Name and hash checks, storage, missing pointers, and cache branches |
| Color postprocessor | 26,136 | Raw/block auxiliary values, wildcard values, normalization, and observed copy calls |
| Base copy construction and destruction | 30 | Actual field writes and balanced weak-reference counts |
| Color helper with native copies | 1,728 | Actual construction, destruction, assignment, and empty variants |
| Complete hand-tick caller with native copies | 64,800 | Both hands, supplied classifications, heights, selected slots, cache writes, and retained fields |
| Owner constructor prefix | 6 | Actual empty-stack constructors, initial slot, heights, and bridge |

The larger caller probe executes actual native copy and empty-variant instructions instead of skipping them.
It verifies retained auxiliary values and counts as well as height results and selected-slot state.
The fixtures use synthetic stacks without user data, restrictions, or a charged item.
Virtual classifications, inventory getters, global string allocations, and CRT boundaries remain supplied.
The predicate fixtures also exercise synthetic cache states that do not establish valid live object construction.
These checks do not establish every item's virtual dispatch or final rendered pixels.

The private PE loader now zero-fills virtual section tails instead of reading adjacent raw-file bytes for uninitialized globals.
The two identifier globals occupy that zero-filled region before their initializers run.
All 2,176 earlier base and shield classifier cases still pass with the corrected loader.
Executable bytes, exports, synthetic fixtures, and emulator programs remain private.

**Incomplete:** Production still uses Java item classification.
Complete native NBT comparison, resolved restriction hashes, charged-item construction, item dispatch, and renderer lifetime transitions require further verification and implementation.
The color and selected-slot rules above are verified instruction behavior, not a claim that their production integration is complete.


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


### Native block-to-item construction research

**Verified research:** The actual block constructor and replacement setter passed 108,432 cases in Bedrock 1.26.51.1, build 51061372.
The probe executed numeric lookup, registry wrappers, name lookup, empty alias-table paths, user-data copies, assignment, and destruction.
These cases execute the constructor itself.
The captured inventory supplied 2,621 canonical names and internal IDs, including 545 names from server-defined namespaces.
Registry objects, item objects, weak cells, and tables were reconstructed test inputs.

| Construction checks | Passing cases |
| --- | --- |
| Every legacy block-ID bit pattern, with count one | 65,536 |
| Captured internal IDs across sixteen count boundaries | 41,936 |
| Typed user data, auxiliary boundaries, empty and missing items | 624 |
| Replacement of an existing stack through the full setter | 336 |

**ID conversion:** A legacy block ID below 256 supplies the same internal item ID.
Otherwise, the constructor uses `255 - legacyId`, then interprets the low sixteen bits as a signed internal ID.
These IDs differ from Bedrock network item IDs.
An unresolved nonzero ID clears the count and raw auxiliary value.
ID zero follows a separate valid-empty path and can retain a nonzero count without an item reference.

**Counts:** The constructor clamps a nonpositive signed 32-bit count to zero, then stores the low byte.
A positive count of 256 therefore becomes zero.
A resulting zero count triggers native invalidation before the constructor copies optional user data.
The probes cover signed limits, byte boundaries, and larger positive counts.
They do not establish these rules for every network descriptor constructor.

**Data and ownership:** The block constructor initializes raw auxiliary bits to zero and retains the supplied block definition for a nonempty result.
Optional user data becomes a separate native compound, even when the resulting stack has zero count.
Tests cover all eleven tag types, empty compounds, absent compounds, and preservation of the original data.
The replacement setter constructs a temporary stack, replaces the existing stack, and destroys the temporary stack.
Tested item and context reference counts return to their starting values after destruction.

**Boundaries:** Numeric and canonical name tables use the captured inventory.
Alias tables remain empty test inputs; this does not verify the live alias registry or its construction.
The final admission check uses a supplied context with its feature gate disabled.
TLS initialization, allocation, CRT operations, and clock values remain supplied.
Fixtures do not contain nested charged items or fully initialized item-component objects.
Executable bytes, emulation programs, and reference outputs remain private.

**Incomplete:** Production still uses Java hand-item classification and decoded wire snapshots.
Complete network-descriptor construction, live alias and restriction resolution, component lifecycle, and renderer lifetime remain incomplete or unverified.
These constructor checks do not establish complete visible timing or first-person parity.


## Invisible particle carriers and opaque descendants

**Evidence:** The October 5 CubeCraft capture uses Bedrock protocol 2193 and five accepted server packs.
Its zombie-hands graph includes an invisible opaque carrier, a dirt effect, and a visible opaque rubble effect.
The carrier declares a zero-size billboard, an unused texture path, block expiration, and a child event at 0.13 seconds.
The previous loader rejected its texture path before admitting the graph.
Fixing that admission exposed the visible rubble material as a separate failure in the same chain.

The matching licensed Bedrock 1.26.5101.0 package defines opaque particles without alpha testing or blending.
Opaque and alpha-test materials retain culling and depth writes, and disable alpha writes.
The target Particle AlphaTest fragment tests texture alpha against 0.5 before applying vertex color.
Its comparison and output instructions confirm that tint alpha does not change the cutoff.
The existing native billboard fixture confirms size clamping, including zero and negative dimensions.
Licensed assets, executable bytes, shader disassembly, captures, and probe outputs remain private.

**Implemented:** The add-on separates emitter simulation from optional GPU resources.
A constant nonpositive billboard dimension proves that its area remains zero after clamping.
Those particles retain scripts, motion, block expiration, counts, timelines, and child dispatch without decoding or allocating a texture.
Per-render scripts and other visual expressions still run.
Dynamic sizes still require render resources, even when their initial value is zero.
Path validation remains active for unused textures.

Visible opaque particles use a separate render pipeline with culling, depth writes, and RGB-only writes.
They do not apply Java's particle alpha cutoff.
Alpha-test particles use the target texture-only cutoff of 0.5.
Both pipelines preload with the client's required pipelines.
The core's existing shared archive transports these definitions and textures through direct connections and ViaProxy.
No server-specific identifiers or fallback textures enter production code.

**Verified tests:** Synthetic tests exercise the production texture-loading decision, per-render script effects, child-event boundaries, and block expiration.
They also cover dynamic-size admission and invalid paths.
The targeted suite passes all nine tests with the private native motion and billboard fixtures enabled.
Those fixtures contain 200 motion cases and 492 billboard cases.
All four projects build, with 1,040 passing Java tests, 118 optional skips, and no failures or errors.

A private GPU probe compiles the production fragment shader with the matching Java includes.
All 120 cases pass on the NVIDIA GPU.
Cases cover texture alpha around 0.5, independent tint and modulator alpha, winding, and destination-alpha preservation.
The probe supplies vertex inputs, fog values, and raster state.
It verifies shader output against the inspected alpha-test instructions and declared opaque material state, without establishing complete native image parity.

**Verified runtime:** Complete direct and ViaProxy replays preserve the captured scene hash `925a9e0873059dee3a1556f3ccf3e5bf4ac951a79a0d447171c51fd9b648e5b3`.
Both pass transport and rendering checks and retain all 154 recorded skin updates unchanged.
Both load all four zombie-hands definitions and admit the carrier without GPU resources.
Their emitter chains reach depth three and create six rubble particles.
Neither reports particle loading or initialization errors.
A private observer reads existing emitter and asset state without sampling visuals or advancing scripts.
ViaProxy's live opaque and alpha pipelines confirm culling, depth writes, disabled blending, and disabled alpha writes.
These checks establish graph loading and lifecycle behavior, without proving complete native draw timing or visible parity.

**Remaining:** Additive visible parity, other material families, missing textures on visible effects, complete fog, and lighting still need implementation or native comparisons.
Native opaque shader selection, complete effect timing, actor-event behavior, and visible parity remain unverified.
All other skin, account, inventory, gameplay, protocol, UI, and platform requirements remain active.


## Authored custom particle directions

**Evidence:** The next live CubeCraft capture exposed a witch arrow-trail definition with `direction.mode` set to `custom`.
The add-on rejected it before loading the texture or creating particles.
The target 1.26.51 schema lists `derive_from_velocity` and `custom` as the direction modes.
The matching 1.26.51.1 executable reader compares the six-character `custom` value before reading its `custom_direction` vector.
The vector field keeps its existing name.
The older [public billboard reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_appearance_billboard?view=minecraft-bedrock-stable) uses `custom_direction` for both names.
That reference does not describe the target reader accurately.

**Implemented:** The add-on decodes the target mode name and retains the existing component and render stages.
Custom vector expressions run in order on each visual sample.
The component retains their raw magnitude, and the render stage normalizes the transformed direction.
The core's existing archive and request channels carry this behavior through direct connections and ViaProxy.
Production contains no server-specific identifiers or alternate spelling shim.

**Verified tests:** A synthetic test covers repeated expressions, ordered variable writes, raw magnitude, and age-dependent direction changes during emitter playback.
An existing locator test now uses the target mode name.
The full build passes 1,041 Java tests with 118 optional skips and no failures or errors.
The targeted effect and facing suites pass all 16 tests with private native references enabled.
These include 200 motion, 492 billboard, 286 facing, 32 emitter-plane, 144 direction-normalization, and 440 spin cases.
The fixtures verify sampled calculations, without establishing complete native visible parity.


**Verified runtime:** Complete direct and ViaProxy replays preserve the fresh CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both pass transport and rendering checks and retain all 311 recorded skin updates unchanged.
Both load the witch burst and silhouette definitions with render resources.
The burst creates eight particles with both authored directions, and the steady silhouette reaches seven particles.
Neither reports particle loading or initialization errors.
A private observer reads raw direction and population fields without sampling visuals or advancing scripts.
These checks verify graph loading and simulation, without proving native visible orientation, timing, or blending.

**Remaining:** The direction reader behavior is verified below. Other component defaults, interpolation, and visible native comparisons remain open.
Additive visible comparisons, complete fog, lighting, and the other coverage requirements remain active.

The additive investigation identifies separate alpha-factor inheritance in the target material parser.
Omitted alpha factors inherit color factors only when the corresponding color factor is explicitly supplied.
Explicit alpha factors take precedence, while absent color factors preserve existing values.
A private executable probe passes 192 presence, override, inheritance, and write-mask cases.
Its factor reader supplies declared bytes and presence flags.
Native field selection, inheritance, and write-mask calculations execute unchanged.
Constructor defaults, factor-name decoding, material inheritance, and final GPU state remain outside that probe.
This evidence supports the material implementation below and does not establish additive rendering parity.


## Translucent and additive particle materials

**Evidence:** The matching licensed `particles.material` disables culling and depth writes for `particles_blend`.
The native material constructor initializes color factors to `SourceAlpha` and `OneMinusSrcAlpha`.
Its alpha factors are `One` and `OneMinusSrcAlpha`.
A private executable probe verifies those fields and the initializer's nine factor names and codes.
This probe supplies allocation and map insertion, while native field and string construction execute unchanged.
The earlier 192-case parser probe verifies explicit factor inheritance and overrides.

`particles_add` inherits the translucent state and explicitly selects `SourceAlpha` and `One` for color.
The parser copies those factors into omitted alpha factors.
The matching Particle Transparent SM60 fragment retains the texture/tint alpha product without an alpha cutoff.
It interpolates RGB fog twice with the same parameters.
Material inheritance, RenderDragon selection, and final native GPU output remain outside these executable probes.

**Implemented:** Visible additive effects now load through the existing particle asset path.
Both translucent materials use native forward blend factors, two-sided rendering, and disabled depth writes.
The fragment preserves low-alpha pixels and evaluates both fog interpolations before transparency accumulation.

Separate Java depth-bounds, transmittance, and accumulation pipelines retain the renderer's stage targets and bindings.
Additive particles contribute color without reducing transmittance or recording opaque depth bounds.
The depth-bounds stage preserves particles below Java's usual alpha cutoff.
Opaque and alpha-test particles retain their existing state and fragment behavior.

**Verified tests:** Two targeted tests verify forward blend factors, culling, depth writes, stage bindings, target states, and pipeline registration.
All four projects build with 1,043 passing Java tests, 118 optional skips, and no failures or errors.
A private NVIDIA GPU probe passes 1,440 pixel cases using the production fragment and matching Java includes.
Cases cover both materials, low alpha, independent tint and modulator alpha, both face directions, and fog interpolation.
They also exercise each transparency stage, including additive transmittance exclusion and non-occluding depth bounds.

The probe supplies raster state and zero scene absorption.
These checks verify isolated formulas and integration contracts, without establishing complete native image parity.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 recorded skin updates and pass transport and rendering checks.
A private fixture loads two authored effects through the production resource library and playback path.
Both effects allocate render resources, create particles, and complete draw calls in forward rendering and all three improved-transparency stages.
The fixture switches renderer modes during each replay and retries after the initial world transition.
These checks establish packaged integration through both connection routes, without proving complete native pixel or timing parity.

**Remaining:** Native fog parameter mapping, cross-texture ordering, overlapping transparency, material selection, lighting, and other material families remain unverified or incomplete.
The other protocol, inventory, gameplay, UI, skin, account, and platform requirements remain active.


## Particle direction reader defaults and recovery

**Evidence:** A private probe executes the matching 1.26.51.1 JSON reader, billboard constructor, component reader, and billboard sampler.
The constructor stores a squared speed threshold of `0.01` directly.
An absent direction section preserves that field.
An explicit empty or null section selects derived direction with a zero threshold.
An explicit numeric threshold converts to float before squaring, including negative values and large values that overflow to infinity.

The component reader retains its component after direction errors.
A non-object section or missing custom vector stops the reader before UV parsing.
Unknown mode strings retain the constructor direction state and continue UV parsing.
Non-string modes use derived direction, while inactive custom-vector fields remain unread.

Malformed custom vectors select custom mode with a zero vector and continue UV parsing.
A malformed axis becomes zero independently, and valid neighboring axes survive.
Direction numeric readers accept booleans as zero or one.

The probe covers 38 declarations and 190 samples through the loaded native component.
Cases include absent and null sections, malformed vectors, ignored fields, mode selection, numeric conversion, float boundaries, and preserved UV defaults.
It supplies private allocation, exact CRT byte operations, decimal conversion, empty diagnostic scopes, and age/lifetime variable lookup.
Native JSON dispatch, field reads, float squaring, component control flow, and billboard calculations execute unchanged.
Native logging messages remain private.

**Implemented:** The production reader preserves these direction defaults and recovery paths.
It reads direction before UV settings and keeps valid effects loaded after the verified declaration errors.
It reports warnings once through the existing cached asset-loading path.
Custom expressions still run in order through the existing bounded Molang parser.
No alternative mode spelling or server-specific branch is added.

**Verified tests:** Three targeted tests cover speed boundaries, inactive fields, per-axis recovery, UV read order, and complete emitter initialization after errors.
A private-reference test compares all 38 native declarations and 190 loaded-component samples exactly.
The targeted effect and facing suites pass all 20 tests with private references enabled.
All four projects build with 1,046 passing Java tests, 119 optional skips, and no failures or errors.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Six authored fixtures use the production resource library, asset loader, simulation, and visual extraction.
Both routes retain the expected thresholds, UV defaults, diagnostics, and sampled directions without loading or initialization errors.
The same runs complete forward rendering and all three improved-transparency stages for translucent and additive particles.
These checks establish packaged behavior and complete scene transport, without proving native image parity.

**Remaining:** The expression and numeric-axis behavior verified below closes part of this reader gap. Typed schema dispatch, other component errors, interpolation, and native visible comparisons remain unverified.
The other material, protocol, inventory, gameplay, UI, skin, account, and platform requirements remain active.


## Custom particle expression recovery

**Evidence:** The target 1.26.51.1 array reader independently processes each direction axis.
A rejected expression becomes zero, while valid neighboring axes and subsequent UV settings survive.
Numeric axes retain their converted float value, including overflow to infinity.

A private probe executes the native JSON reader, constructor, array reader, Molang parser, and billboard sampler.
Seven declarations produce 35 sampled results.
Numeric and addition controls evaluate to two and three.
Empty expressions produce zero.
Malformed controls include an unmatched parenthesis and a missing right operand.
Large numeric inputs cover finite values and float overflow.

The harness supplies allocation, exact CRT operations, decimal conversion, and successful single-thread lock operations.
Native thread-guard initialization executes unchanged.
The optional SDK observer is absent, while a non-mutating hook records diagnostic calls.
Frees and exit registrations remain supplied process boundaries.
Sampling supplies only particle age and lifetime lookup.

Return-expression evaluation is outside the completed probe.

**Implemented:** Custom direction axes now retain native numeric overflow.
A Molang syntax rejection replaces only its own axis with zero and reports a loading diagnostic.
Expression length, nesting, and node limits retain their existing rejection behavior.
The parser reports nesting limits separately from syntax errors so recovery cannot bypass those limits.
Other particle, actor, and animation fields retain their existing parsing behavior.

**Verified tests:** An emitter test verifies per-axis syntax recovery and normalized visual directions after loading.
A limit test verifies that long, deeply nested, and complex expressions still fail their existing gates.
A private-reference test matches all seven native declarations and 35 sampled directions and UV results.
The targeted suites pass 28 tests, with two unrelated private Molang references skipped.
All four projects build with 1,048 passing Java tests, 120 optional skips, and no failures or errors.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Eight direction fixtures load through the production resource library, including both malformed-expression controls.
The malformed controls retain their UV settings, allocate rendering resources, create particles, and expose the expected recovered direction.
No particle loading, initialization, or observer errors occur.

Both runs also complete forward rendering and all three improved-transparency stages for translucent and additive particles.
These checks establish packaged behavior through both routes, without proving native visible image parity.

**Remaining:** Complete expression admission, lexer error recovery, SDK runtime context, typed schema dispatch, interpolation, and native visible comparisons remain unverified.
All other coverage requirements remain active.


## Molang statement admission and decimal fractions

**Evidence:** The matching 1.26.51.1 parser rejects expressions that start with a semicolon after whitespace.
Expressions containing assignment or statement-separator tokens must end with a semicolon.
Comparisons and punctuation inside single-quoted strings do not activate that requirement.
The native token table and parser branches identify assignment and separator tokens separately from comparisons.
The target also accepts decimal fractions such as `.5` and numeric suffixes such as `2F`.
The suffix case retains the existing normalization path; the new executable controls verify `.5`, `1.`, `2f`, and `2F`.

A private probe observes 41 native compilation results and 130 billboard samples for constant or rejected expressions.
It executes the native JSON reader, component reader, Molang compiler, parser, and applicable billboard calculations unchanged.
The harness supplies allocation, CRT operations, decimal conversion, single-thread locks, and an absent optional SDK observer.
PE virtual section tails contain zeros rather than unrelated file bytes.
A supplied service-availability marker satisfies the compiler's null assertion without replacing parsing or admission decisions.
Compiled statement evaluation and variable registration remain outside this completed probe.

**Implemented:** The shared client parser tracks tokens and enforces the verified statement boundaries before evaluation.
Unfinished assignments cannot alter runtime variables.
Leading decimal fractions now produce float expressions while property access retains its existing parsing path.
Custom particle direction axes use the existing syntax recovery path for rejected statement declarations.
Their neighboring axes, UV settings, and emitter resources survive.
Expression length, nesting, node, and execution limits remain enforced.

**Verified tests:** A targeted test verifies rejected statements, preserved variables, comparisons, quoted punctuation, and trailing whitespace.
Existing float tests now exercise leading fractions, negative fractions, and trailing decimal points.
The native-reference test matches all 41 compilation admission results.
Emitter tests retain valid particles after unfinished or leading-semicolon direction expressions.
All four projects build with 1,049 passing Java tests, 121 optional skips, and no failures or errors.
The selected Molang and effect suites pass 22 tests with four unrelated optional references skipped.

**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Eleven authored direction fixtures use production resource loading, simulation, and visual extraction.
The new controls preserve malformed-statement recovery and expose the expected `.5` direction value.
Both routes also complete forward rendering and all three improved-transparency stages for translucent and additive particles.
No particle loading, initialization, or observer errors occur.
These checks verify packaged integration without establishing native image or timing parity.

**Remaining:** Complete lexical admission, complex-expression results, SDK runtime context, typed schema dispatch, interpolation, and native visible comparisons remain unverified or incomplete.
Core Molang processing still uses a separate parser and needs the same admission review.
All other coverage requirements remain active.


## Consume core Molang parsing and statement results

Animation and particle programs now use ViaBedrock core parsing and evaluation.
This removes the duplicate client parser and numeric-suffix normalizer.
Actor queries, variables, and execution limits remain in the client.
Native constant statement evaluation verifies zero default results, explicit returns, and selected conditional returns.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-core-molang-grammar-and-statement-results) records the native boundaries, route tests, and remaining gaps.


**Verified tests:** All four projects build with 1,052 passing Java tests, 122 optional skips, and no failures or errors.
Core Checkstyle also passes.
The selected core and add-on suites pass 30 tests, with five unrelated optional references skipped.
Core matches all 41 earlier admission cases and all 25 new constant-statement declarations.
The particle component test matches all 125 native direction and UV samples, including recovered rejected declarations.
Tests also preserve variable side effects, reader parsing, string returns, assignment boundaries, and client execution limits.


**Verified runtime:** Complete direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Thirty-six authored direction fixtures load through production resource processing, simulation, and visual extraction on each route.
All reader diagnostics and sampled direction values match their expected states.
No particle loading, initialization, or observer errors occur.
Both routes submit forward draws for translucent and additive particles.
Improved transparency stages were not verified in this parser run.
Screenshot review confirms custom lobby models and hotbar icons.
Overlapping labels and the Java tutorial toast remain presentation gaps.
These checks verify packaged integration without establishing native image or timing parity.


## Shared core jumps and native float loop counts

Animation and particle programs now use core control flow and its shared execution budget.
Nested returns preserve numeric and string results and stop later mutations.
The pinned native VM executes positive fractional counts and does not clamp a count of 1,025 to 1,024.
The duplicate client equality helper, loop clamp, and iteration guard are removed.
AST size and depth limits remain at the client boundary.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-core-molang-jumps-and-float-loops) records native evidence, supplied boundaries, and remaining gaps.

**Verified tests:** All four projects build with 1,061 passing Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core evaluation and particle components match all 57 native declarations and 285 direction and UV samples.
Regression tests cover nested return mutation order, fractional counts, nearest-loop jumps, array bindings, and the shared host budget.
Both numeric and string client consumers use the same control flow.
Reader diagnostics are compared against compiler rejection, separately from later VM diagnostics.

Particle starts now release their pending slot before completing the public future.
Cached completions can invoke callbacks inline; those callbacks must see capacity from work that has already finished.
The previous ordering could reject chained starts against the 32-slot limit.
Two regressions exercise 128 nested cached starts with an almost-full queue, runtime failures, and rejected starts.
The existing pending-start, cached-graph, emitter, and image-memory limits remain in effect.

Early direct runs passed coarse scene checks while several authored starts were rejected.
A thread sample in an OpenGL draw did not establish a graphics fault.
The pending-slot completion order was corrected and receives separate regression coverage.
The private observer also kept scheduling an obsolete fixture queue after a resource reload canceled it.
That duplicate queue filled the bounded cache; the observer now stops scheduling when its playback generation changes.
Resource reload cancellation remains expected, and cache capacity is not raised for the test.

**Verified runtime:** Complete 240-second direct and ViaProxy replays preserve the CubeCraft scene hash `ede0e43b2874418cbb6b62135898efe0553009307d33fecd0f258383643d5d83`.
Both retain all 311 skin updates and pass transport and rendering checks.
Each route loads 68 authored direction definitions through production loading, simulation, and visual extraction.
Every reader diagnostic and sampled direction matches its expected state.
Translucent and additive controls also start, giving 70 distinct authored effects on each route.
No capacity rejection or observer error occurs in the successful runs.
The final ViaProxy observer records one expected start cancellation during a resource reload.
Both routes submit forward draws; improved-transparency stages remain unverified in this run.
Screenshots show the custom lobby models and hotbar icons, alongside overlapping labels and the Java tutorial toast.
These saved-scene checks do not establish a new live-server join, native image parity, or animation timing parity.

## Shared billboard temporaries

Billboard size, ordinary UV fields, and custom direction expressions now share a core evaluation group.
Nested evaluation uses the active group, and completion or failure releases it.
Copied actor environments retain persistent variables without inheriting temporary storage.
Tests cover native field order, repeated samples, nested groups, current values, copied actors, and failure cleanup.
Particle component tests match 66 native declarations and 330 samples.
The [coverage ledger](../../../docs/bedrock-coverage.md#shared-temporary-variables-in-billboard-expressions) records the native boundaries and remaining scope, flipbook, and missing-value gaps.
All four projects build with 1,065 passing Java tests and 120 optional skips.
Complete 240-second CubeCraft replays pass through direct and ViaProxy routes.
Each preserves 311 skin updates and verifies 77 authored direction cases plus two material controls.
No active capacity rejection or observer error occurs; native image and timing parity remain unverified.

## Shared missing-value semantics

Client numeric, string, animation, and particle programs now receive missing-member fault behavior from ViaBedrock core.
Null coalescing retains zero and empty strings, and failed reads preserve earlier writes.
Rejected assignment chains recover through the existing particle expression boundary.
The regression verifies that neighboring fields and the emitter remain available after recovery.

The [coverage ledger](../../../docs/bedrock-coverage.md#missing-molang-values-and-fault-propagation) records target-build comparisons and the remaining embedded-assignment gap.

Source syntax and compiled runtime expressions now have separate boundaries.
The client validates source length, node count, and depth before core generates helper calls.
Generated instructions therefore cannot consume a valid script's source budget.
The existing aggregate-script regressions cover this boundary without increasing any limit.
Counter fixtures now initialize their variables or use explicit null coalescing before increments.

Validation: all four builds pass with 1,071 Java tests, 120 optional skips, and no failures or errors.
Core Checkstyle passes.
Core matches 67 validity declarations and the previous 57 control-flow cases.
Particle components match 133 combined native declarations and 665 samples.

Complete 240-second direct and ViaProxy CubeCraft replays pass with the unchanged scene payload and all 311 skin updates.
Each verifies 87 authored direction fixtures plus two material controls through production loading, simulation, and visual extraction.
All reader states and sampled directions match, with no active capacity rejection or observer error.
Each route records one expected start cancellation during resource reload.
Both controls submit forward draws; improved transparency remains unverified in this run.
Screenshots retain custom lobby models, the hanging cube, hotbar icons, overlapping labels, and the Java tutorial toast.
These saved-scene checks do not establish a fresh live-server join or native image and timing parity.

## Native flipbook reader and component order

The client stores flipbook size and step as constant floats, separate from base-coordinate and frame-count Molang programs.
Frame count evaluates before base V and base U within the shared core group.
The reader uses zero FPS by default, recovers typed fields independently, and preserves native integral texture dimensions.
A present invalid flipbook section ignores ordinary UV expressions; null retains the enabled component with defaults.
Rejected expressions recover, while source length, node, and depth limits still fail explicitly.

The [coverage ledger](../../../docs/bedrock-coverage.md#flipbook-field-types-and-evaluation-order) records the matching build, reader behavior, and execution boundaries.
The matching native reader/compiler/VM/updater passes 104 declarations and 520 samples.
The 492 earlier numeric frame samples and 133 expression declarations also pass.
All four builds pass with 1,121 Java tests, 75 optional skips, and no failures or errors.
Core Checkstyle passes.
Older scheduling fixtures now initialize their supplied counters or coalesce an unavailable source field explicitly.
Their native expression callbacks do not establish Molang evaluation behavior.


Complete 240-second direct and ViaProxy CubeCraft replays preserve the unchanged scene payload and all 311 skin updates.
Each starts 95 flipbook definitions, 20 earlier direction and sharing definitions, and two material controls through production loading and playback.
Reader states and 475 controlled samples from the loaded components match the native reference on each route.
Both final runs report no active capacity rejection or observer error.
The runtime batch excludes three nonfinite-UV cases and six additional dimension cases; the full native unit comparison retains them.
An initial oversized fixture batch reached the unchanged asset-cache limit; reducing the test batch leaves room for real scene assets.
Both material controls submit forward draws.
Improved transparency, complete actor/world contexts, native images, and timing remain unverified.
Reviewed screenshots retain custom lobby models, banners, the hanging cube, hotbar icons, overlapping labels, and the Java tutorial toast.

Forward native particle materials now register opaque or translucent shader families for Iris.
The pinned shader replay reports missing particle overrides before this integration.
The mapping preserves native blending and depth state; shader packs use the forward path.
Semantic tests cover all four material families and their vertex bindings.

The full add-on build and all nine pipeline mapping/state tests pass.
The pinned CubeCraft shader replay passes transport and rendering checks with no missing Bedrock pipeline overrides.
The shader screenshot shows drawable custom actors and supplied player geometry without the corrupt triangles.
Validation uses the private Linux/NVIDIA lab; macOS/Apple GPU confirmation remains outstanding.

The matching replay without Iris installed also passes transport and rendering verification.
It preserves all 216 recorded geometry skins, local and remote native submissions, and all 31 custom actor types.
Its screenshot retains the ordinary first-person arm and drawable actor geometry.

## Native particle frame scheduling, October 7, 2026

The pinned PC client uses two frames between particle dynamics and appearance updates.
The platform getter `0x140159bb0` returns two through virtual slot `0x6d8`.
Caller `0x1447e9561` passes that value into `ParticleSystemEngine`.
The engine stores it at offset `0x10f0`, and emitter creation copies it to offset `0xd0`.
The target remains Bedrock `1.26.51.1`, protocol `2193`.

The add-on now drives particles from a monotonic render clock.
Each emitter keeps separate dynamics and appearance counters.
Each incoming delta retains values below 101 ms and caps larger values at 100 ms.
Skipped dynamics frames accumulate those capped deltas.
A scheduled dynamics update consumes their sum without another cap.
These changes apply to the shared renderer for server, actor, animation, and fishing effects.

The runtime stores previous position, direction, and rotation before scheduled dynamics updates.
Newborn particles initialize that history after their first motion update.
Appearance preparation stores previous size and float RGBA channels.
Newborn appearance history initializes after preparation.
The dynamics counter controls position, direction, and rotation interpolation.
The appearance counter controls size and color interpolation.
UVs retain the current prepared values.
Color channels retain float precision until the renderer packs the final interpolated color.

Native render startup suppresses output while appearance or dynamics history is insufficient.
A nonzero particle duration below `150_000_001` ns allows early output and forces a second appearance preparation.
New manual particles receive appearance preparation even during skipped refresh frames.
Their first appearance sample cannot interpolate from an empty size or tint.

Independent native execution covers 240 scheduling frames across 40 schedules.
It executes the elapsed cap, accumulation, counters, motion snapshots, and render startup gate.
The probe supplies resource pointers, context validity, and prepared particle durations.
Appearance preparation records its native force argument without executing component callbacks.
The probe stops before full simulation and final render construction.

Another 72 cases execute the native rotation, size, scale, and float RGBA interpolation instructions.
They supply snapshots and independent interpolation factors.
All results match the production float helper exactly.
The existing 180 native position cases now use the same interpolation helper as production rendering.
These fixtures exclude complete component dispatch, GPU output, and native visible comparisons.

Portable runtime sequences cover separate motion and appearance histories, current UVs, float tint precision, and newborn initialization.
They also cover short-particle startup, manual births, skipped updates, and elapsed accumulation above 100 ms.
The full add-on build reports 601 tests, zero failures or errors, and 69 optional skips with the private native fixtures enabled.
The owning patch retains these changes, and all 30 add-on patches replay.
Binaries, licensed assets, native fixtures, and observers remain private.

Fresh Linux strict BDS runs exercise actual rod input through direct and ViaProxy connections.
The observer records 667 particle render frames directly and 942 through ViaProxy.
Their update cadence, startup visibility, and independent interpolation factors match the native counter schedules.
Another 733 halfway-position triplets match production world-space output within the documented float rounding allowance.
Both casts remove their hooks. The ViaProxy cast also records one durability point.
These observations cover renderer extraction, not final GPU pixels or native image parity.
The direct run ends after its controls through the recorder's cancellation path.
The ViaProxy run ends through the reviewed private completion marker.
Both preserve spawn and gameplay evidence. The cancellation exit is not a connection failure.
The final artifact passes a fresh direct BDS join after removal of the unused partial-tick argument.
It verifies another 222 render frames and 100 halfway-position triplets.
The fixture returns to its original checksum, and both user-owned servers retain their process identities.

## Fishing tease splash expiration, October 7, 2026

The licensed target splash graph expires particles outside `minecraft:air`.
Its point shape places a new particle half a block above the integral tease origin.
Water at that sampled cell therefore expires the particle; air retains it.
This follows the [documented block-expiration predicate](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponents/minecraftparticle_expire_if_not_in_blocks?view=minecraft-bedrock-stable).
The target asset and executed native predicate establish the version-specific result.

Twenty native controls use recorded tease origins, negative heights, water, and air.
They execute the real predicate, origin getter, cache flag, and hash membership.
Prepared block identities, the resolved air set, and CRT floor remain supplied.
The production test loads the licensed graph privately and verifies its birth offset, block query, survivor count, expiration, and available visuals.
A zero-time update isolates birth and expiration; it does not reproduce the full native frame scheduler or collision sequence.

This explains the empty simulation output at water cells without removing the native asset's expiration rule.
Full native scheduling, collision, final pixels, audio, later fishing physics, and the complete gameplay matrix remain required.
No new live-server, CubeCraft, Boar, Windows, or macOS join is claimed by these component checks.

Validation: core passes 779 tests with 19 optional skips, and the add-on passes 602 tests with 69 optional skips.
Both counts include the new private reference checks, with no failures or errors.
Core, add-on, and ViaProxy builds pass. Both standalone reference PR checks pass.
The final add-on and ViaProxy bundles retain all 1,243 core content files byte-for-byte, excluding bundle metadata.
Reviewed artifact replacements preserve 32 unrelated files and keep private rollback copies. No service restarts occur.

## Windows sine-table verification, October 7, 2026

The captured Linux native-client table uses Wine's `sinf`, not Microsoft's Windows runtime.
Executing Wine's complete function reproduces all 65,536 captured entries exactly.
The installed Windows guest supplies official UCRT `10.0.26100.9444` through a read-only disk extraction.
Its complete SSE function differs from Wine at one entry and from rounded double sine at 85 entries.
Independent hardware executions of the Windows SSE and FMA paths produce identical tables.

The pinned game's complete initializer now executes with the official Windows sine import in one emulated address space.
Only stack probing and the final byte copy remain supplied.
A portable producer matches every resulting float bit through bounded range reduction and polynomials.
Its arithmetic derives from [AMD's BSD-licensed AOCL-LibM implementation](https://github.com/amd/aocl-libm-ose/blob/29fd054f383e6c5e2dec2fce781d5220059f1836/src/isa/avx/masm/sinf.asm).
The source and packaged resources retain the license notice.
Production ships no runtime DLL, captured table, or dependency on a Bedrock installation.

Nine portable controls distinguish Windows rounding from rounded double sine and Wine.
The private all-entry test verifies the complete production table against the linked native initializer.
Reexecuting 8,732 glide cases and 720 fishing approach and tease cases uses the Windows table.
The glide comparison matches every production motion bit, including boosted cases.
These probes still supply status slots, boost components, random samples, world getters, and other documented boundaries.
Windows process initialization, other runtime versions, Android and console math, live movement, and complete visible parity remain separate requirements.

Validation: core passes 781 tests with 19 optional skips. The add-on passes 602 tests with 69 optional skips.
Both suites report no failures or errors. Core, ViaProxy, and add-on builds pass.
Both standalone reference PR checks pass, and the complete 97-patch core stack replays from its pinned base.
Both downstream bundles retain all 1,246 core files byte-for-byte, excluding the JAR manifest, including the AMD license.

Reviewed artifact replacements preserve 32 unrelated files per project and retain private rollback copies under `.stackanvil/research/fishing-feedback/crt/build-rollback/`.
No service restarts or new live-server joins occur in this verification.

## First-person visibility for normalized legacy skin bones

The official EarthSkin geometry uses `rightArm` and `rightSleeve`. The legacy importer applies the verified native ASCII lowercase conversion to bone names. CubeCraft retains camel case in its first-person visibility rules. The old exact matcher hid the converted arm and sleeve after the controller hid `*`. A planned native surface then suppressed the Java hand fallback.

Read-only inspection of the joined client confirmed empty actual and rendered main-hand stacks. The matching surface used `humanoidNames=true`, with hidden arm and sleeve cubes. The client used Vulkan after its OpenGL context failed to initialize. This observation identifies the visibility error independently of that backend difference.

The fix caches exact and ASCII case-insensitive patterns when resources load. Humanoid models select the case-insensitive pattern. Custom actor models retain exact matching. Actor and costume samples reuse the compiled patterns. Explicit hides, ordered wildcard overrides, and controller unions keep their existing behavior.

Two actual model-cube tests failed before the fix. The regressions cover visible arms, hidden body cubes, wildcard order, controller unions, and exact custom actor controls. Candidate runtime checks for Vulkan and Iris reloads remain separate gates. No general change to native custom actor case semantics is inferred.

The complete 30-patch add-on stack replays with normal hooks. The focused suite passes 16 tests with one optional skip. The full build passes 616 tests with 117 optional skips and no failures or errors. The immutable candidate retains all 1,260 embedded core files. Cached rule objects preserve their previous value equality. The candidate is not installed; actual desktop and Iris checks remain pending.

## Native actor picking

The addon accepts `viabedrock:actor_picking` separately from `actor_state_v2`.
ViaBedrock supplies one nonphysical Interaction target per native picking box.
The addon applies exact X/Y/Z bounds to those owned targets.
The original actor retains its physical dimensions and position.

Private Bedrock 1.26.51.1 (build 51061372, protocol 2193) execution binds metadata 118 to the native `HitboxComponent`.
The decoder reads FloatTag `Min`, `Max`, and `Pivot` components from the `Hitboxes` list.
Missing or differently typed components become zero.
The position producer sorts endpoints and recenters extents around actor position plus pivot.
Finite zero extents remain valid entries.
The captured Discord actor supplies a separate 1×2×1 picking box despite zero physical width and height.

Existing Java 26.3 predicates determine owner eligibility.
Proxy targets inherit root-vehicle and inside-pick behavior from their owners.
The original actor stops participating only while current negotiated picking parts exist.
Empty metadata restores the ordinary actor target.
Connection identity, generation, and actor lifetime reject stale updates.
Local player targets and conflicting proxy identities are rejected.

Eighteen targeted core and addon tests pass in private compilation.
They cover typed decoding, sparse updates, multipart movement, alias hit coordinates, empty restoration, removal, codec bounds, and lifecycle rejection.
Exact rectangular clipping tests retain multipart gaps and rays shortened by blocks or reach.
These tests do not establish native radius callbacks or exact boundary behavior.
The addon retains Java clipping without guessed margins.
Full stack builds and live joined NPC click acceptance remain pending for this candidate.
