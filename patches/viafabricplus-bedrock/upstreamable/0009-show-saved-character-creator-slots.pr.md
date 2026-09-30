## Character Creator account editing

Use native account recipes and catalog items for saved character, limb, color, size, cape, and four-position emote edits. Profile hashes and exact readback protect each account write. Starter recipes match Bedrock 1.26.51.

Owned persona and emote assets use the current inventory receipt, PlayFab catalog, and official Xbox or PlayFab CDN download flow. The runtime decrypts assets in memory without a native installation, copied keys, or an external extractor. Receipts, content keys, screenshots, profiles, and assets stay private. The model service supplies static geometry for unresolved default and free assets.

## Owned emote playback

Play owned animation sources on the active character with Replay and Stop controls. Preserve root, waist, and body hierarchy and animate clothing surfaces in the same pose. Mocha supplies actor-local Molang expressions with host execution limits. Effects, delays, multiple animation sources, and entity-relative rotations remain unsupported.

The rebindable B key opens the four-position world wheel with mouse and 1-4 controls. Load entitled wheel assets, advertise `EMOTE_LIST`, and send native `EMOTE` with pack UUIDs and tick durations. Incoming emotes use the same pose sampler and authored model hierarchy. Movement and completion reset playback.

Private native 1.26.51 captures establish Battle Cry's pack UUID, 130 ticks, and zero flags. The metadata piece UUID differs. Walking clears `PlayerAuthInput` Emoting immediately; completion clears it at 130 ticks. Java relay playback matches the wire fields, completion transition, and movement cancellation. Native emotes visibly animate the tracked remote player in Java and reset at completion.

## Verification

- Full patch stack builds successfully.
- 68 add-on tests pass with private persona, login, and emote fixtures enabled.
- Private Battle Cry and Kadoosh tests sample every frame at 60 Hz.
- A Java GUI recording verifies visible Battle Cry motion, attached clothing, completion reset, and readable controls at the default GUI scale.
- Native arm writes, cape equips, sizes, and account wheel edits have capture evidence. The account is restored after temporary edits.

Default and unavailable remote emote assets, free limb side recipes, default face asset assembly, and animated tint maps remain incomplete. The Java preview recording uses an offline appearance fixture, so it does not establish live Java account download behavior.
