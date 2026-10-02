## Classic Dressing Room

Import PNG skins and local Classic Skin packs. Preserve selected custom geometry through account storage, previews, login claims, and live skin changes. Wrapped archives use one manifest root. The importer rejects unsafe paths, duplicate files, ambiguous roots, and oversized archives.

## Legacy geometry inheritance

Resolve `geometry.child:geometry.parent` definitions within the pack before conversion to modern geometry. Keep parent surfaces and append child cubes on matching bones. Child bones supply their pose and flags. Each texture dimension inherits separately, with a 64×64 default. Preserve visible bounds and cube mirror and inflation defaults. Polygon layers retain separate position, normal, and UV indices.

Explicit pack models named `geometry.humanoid.custom` or `geometry.humanoid.customSlim` take precedence over built-in Steve and Alex models. Resolve missing parents through an injected model source. Reject unresolved parents, ambiguous identifiers, inheritance cycles, and inheritance in formats 1.12 and later.

Private Bedrock 1.26.51.1 observations establish the inheritance version check, texture-size fallback, parent surface copy, and child cube append. The research binary and decompiler output remain private.

## Sources

- [Official legacy geometry properties](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/geometry.v1.8.0?view=minecraft-bedrock-stable).
- [Pinned Mojang legacy model library](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/models/mobs.json).
- [Matching zombie parent definition](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/models/entity/zombie.v1.0.geo.json).

## Classic animation aliases and render flags

Native Bedrock 1.26.51.1 copies skin animation aliases and three render flags into `SkinResourcePatch`: `enable_attachables`, `held_item_ignores_lighting`, and `hide_armor`. Preserve explicit false flags and empty aliases. Do not put these declarations in `SkinAnimationData`.

Store the options for standard and custom models. Preserve them across preset selection, width changes, cape changes, previews, and transport. A new PNG import clears the previous pack options. Bound aliases and validate field types before storage.

Private loader and constructor observations establish the serialized fields. Tests cover metadata decoding, preset switching, persistence, PNG replacement, malformed input, and protocol round trips. The account asset patch supplies local alias playback through the licensed player graph. Selected legacy geometry flags override conflicting skin aliases in native conversion order.

Apply equipment flags to both ordinary and custom player renderers through the shared layer submission call. Disable armor, wings, held items, and equipped head items when attachables are disabled. Hide armor and wings independently when `hide_armor` is true. Apply full brightness only to held-item layers. Keep clothing, face, and cape layers. Resolve flags from the installed texture so replacement, release, and disconnect cannot retain stale options.

Bedrock 1.26.51.1 reads each present flag into its actor resource definition without resetting absent fields. Its player definition enables attachables. The [Microsoft client entity reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction?view=minecraft-bedrock-stable#enable_attachables) establishes equipment semantics and armor precedence.

## Verification and remaining limits

Eighteen classic tests pass with the private model library enabled. Tests cover additive cubes, child flags, dimensions, polygon indices, invalid chains, and account store and wire round trips. The optional library test resolves all seven inheritance chains after combining the matching official files. The full add-on suite passes 106 tests with no skips. The exported stack and add-on build pass. Captured and downloaded assets remain outside the repository.

A private running-client probe passed 208 checks across standard and custom models, flag combinations, layer submissions, lighting, replacement, and release. The client loads the injected layer handler. Native visual and first-person comparisons of the equipment flags remain pending.

The account asset patch supplies the licensed base vanilla model library through the model-source interface. Pack definitions retain precedence across library chains. Tests cover external parents, modern library models, absent selections, cross-library cycles, and persistence. The account asset patch compiles the licensed player graph for classic alias playback. Versioned vanilla overrides, native parent-name behavior, item-action bindings, first-person playback, and native visual comparisons remain pending.

## Geometry animation flags

Convert the nine geometry animation flags into classic aliases before storage and transport. Apply geometry-derived aliases after explicit skin aliases. False flags retain existing bindings. Unrelated aliases, empty bindings, and explicit render flags retain their values.

Bedrock 1.26.51.1 converts arm posture flags in order: arms down, arms out front, Statue of Liberty, then single arm. Stationary legs override single legs. Upside-down legs override both. Head bob, riding arms, holding, sneaking, base pose, and look-at-target aliases also follow native conversion.

Independent execution of `FUN_141433350` verifies all 512 legacy conversion combinations. Execution of the alias merge block in `FUN_141444960` verifies another 512 combinations. These cases include conflicting skin aliases and empty or non-string internal metadata. Native inheritance edge cases remain pending.

The native inverted-crouch flag emits `animation.player.move.sneaking.inverted`. That resource is absent from the matching licensed package. Preserve the native alias. The actor graph follows native missing-resource behavior instead of rejecting the pack or substituting an animation.

Tests cover geometry selection, precedence, persistence, and skin claims. Executable files, execution fixtures, probes, and licensed assets remain private.

The replayed full stack builds, and all 174 fixture-enabled add-on tests pass with no skips. A running Java client passes 1,059 checks. These cover the 1,024 native flag and merge cases, pack import, persistence, skin claims, and all nine licensed legacy graphs. The imported zombie-arm alias reaches both preview and world model geometry. The probe changes no account profiles. Native visible motion comparison remains pending.

## Modern and library geometry animation flags

Read animation flags from the resolved model. Modern pack models and library-provided models now retain their flags through the same import path. Standard models without custom geometry retain their explicit skin aliases.

Derive aliases during direct imports and saved appearance loads. Older saved models retain their geometry flags even when their stored options omit the aliases. These models now receive the derived aliases without another pack import. The skin identity and unrelated options retain their values.

Independent execution of Bedrock 1.26.51.1 verifies 512 flag-reader and alias-precedence combinations. The harness starts after model construction in `FUN_141c13a30` and supplies decoded JSON accessors and allocated storage. Native instructions read the flags. The runtime writer `FUN_14144f000` constructs the aliases. The inspected merge block then applies metadata precedence. This evidence covers the flag and alias paths, not complete native rendering.

Integration tests cover modern pack and library imports, conflicting aliases, unrelated models, direct imports, older saved options, and transport. The licensed player graph consumes all nine flag cases through the resolved-model API. Native visual, first-person, and inheritance edge comparisons remain pending. Executable files, fixtures, and probes remain private.

The replayed full stack builds. All 191 fixture-enabled add-on tests pass with no skips. This change makes no account writes.

## Native cape eligibility boundary

Bedrock 1.26.51.1's classic pack loader consults `cape` only when its pack-access callback succeeds and the origin byte is 2 or 8. Independent execution of that native branch passes all 24 combinations of the supplied callback result and origin bytes 0 through 11. This check verifies the branch. A later live startup trace records both actual origin callbacks returning true.

A private local test pack loads its three skins in the native client. Its declared blue cape does not appear in the preview. The test changes no saved character recipe. Cleanup removes only the verified test pack and confirms that all six native profiles match the original snapshot.

The current [LeviLamina pack-access declaration](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/resources/PackAccessStrategy.h) identifies this virtual slot as `isTrusted`. Its [origin enum](https://github.com/LiteLDev/LeviLamina/blob/main/src/mc/deps/core/resource/PackOrigin.h) names 2 Package and 8 PremiumCache. Older SDK enum names differ, so the inspected target build's numeric branch is the evidence for this version.

The account-pack reader in patch 0009 now preserves trusted provenance after receipt, published identity, and decrypted content checks. Its bundled cape reaches preview, persistence, and skin transport. Local imports still omit declared capes, matching the observed gate. Manual PNG capes remain an independent local extension. Their precedence against native account and persona capes still needs comparison. The executable, native branch harness, test pack, and captures remain private.
