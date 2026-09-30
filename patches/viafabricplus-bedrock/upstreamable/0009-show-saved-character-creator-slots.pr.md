## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned persona and emote assets use the current inventory receipt, PlayFab catalog, and CDN download flow. Receipts, content keys, screenshots, profiles, and assets stay private. The model service supplies static geometry for unresolved default and free assets.

## Owned emote preview

Play owned animation sources on the active character with Replay and Stop controls. Preserve root, waist, and body hierarchy and animate clothing surfaces in the same pose. Mocha supplies actor-local Molang expressions with host execution limits. Effects, delays, multiple animation sources, and entity-relative rotations remain unsupported.

## Verification

- Full patch stack builds successfully.
- 66 add-on tests pass with private persona, login, and emote fixtures enabled.
- Private Battle Cry and Kadoosh tests sample every frame at 60 Hz.
- A Java GUI recording verifies visible Battle Cry motion, attached clothing, completion reset, and readable controls at the default GUI scale.
- Native arm writes, cape equips, sizes, and account wheel edits have capture evidence. The account is restored after temporary edits.

In-world emote playback, free limb side recipes, default face asset assembly, and animated tint maps remain incomplete. The Java preview recording uses an offline appearance fixture, so it does not establish live Java account download behavior.
