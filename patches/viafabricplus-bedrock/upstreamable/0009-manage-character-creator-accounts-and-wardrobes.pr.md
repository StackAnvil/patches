Account slots, recipes, wardrobes and catalog writes consume the preceding [native runtime](0008-share-native-actor-and-resource-runtime.pr.md). Player appearance and account emote adapters remain here. The evidence below records the existing target behavior; full native parity remains bounded by the stated limits.

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

## First-person visibility for normalized legacy skin bones

The official EarthSkin geometry uses `rightArm` and `rightSleeve`. The legacy importer applies the verified native ASCII lowercase conversion to bone names. CubeCraft retains camel case in its first-person visibility rules. The old exact matcher hid the converted arm and sleeve after the controller hid `*`. A planned native surface then suppressed the Java hand fallback.

Read-only inspection of the joined client confirmed empty actual and rendered main-hand stacks. The matching surface used `humanoidNames=true`, with hidden arm and sleeve cubes. The client used Vulkan after its OpenGL context failed to initialize. This observation identifies the visibility error independently of that backend difference.

The fix caches exact and ASCII case-insensitive patterns when resources load. Humanoid models select the case-insensitive pattern. Custom actor models retain exact matching. Actor and costume samples reuse the compiled patterns. Explicit hides, ordered wildcard overrides, and controller unions keep their existing behavior.

Two actual model-cube tests failed before the fix. The regressions cover visible arms, hidden body cubes, wildcard order, controller unions, and exact custom actor controls. Candidate runtime checks for Vulkan and Iris reloads remain separate gates. No general change to native custom actor case semantics is inferred.

The complete 30-patch add-on stack replays with normal hooks. The focused suite passes 16 tests with one optional skip. The full build passes 616 tests with 117 optional skips and no failures or errors. The immutable candidate retains all 1,260 embedded core files. Cached rule objects preserve their previous value equality. The candidate is not installed; actual desktop and Iris checks remain pending.

## Follow-up: crouching hand and armor locators

The first-person root uses the native player render height of 1.62001, separately from camera posture. The target constructor and executed first-person matrix establish this offset. Java crouching eye height previously raised the hand's model root.

Owner geometry queries expose authored root locator offsets in model coordinates. Bone pivot subtraction and render-axis conversion apply only to drawing locators. The target armor animations use these owner offsets for custom bodies. A numerical test covers rotated bones and raw axis values.

The crouching root error is corrected. The reported low standing hand only on CubeCraft still needs a matched pose comparison. Visible armor parity still needs the reported skin identity.

## Default native player playback

Classic skins now use the bundled target player graph for bodies and dressing-room previews. Preview playback keeps its own animation clock and variables. Body models apply the graph's visibility rules. The Java hand preference affects first-person rendering only.

Equipment setup runs after the owner's per-frame resets and before its animations. A numerical regression covers repeated setup and removal on unequip. Missing-query tracking also reaches nested bone evaluation without changing Molang's existing zero defaults.

## Upstream prerequisites

- [viafabricplus-bedrock patch](../../viafabricplus-bedrock/upstreamable/0008-share-native-actor-and-resource-runtime.pr.md): Land shared actor and resource playback before account appearance selection.
