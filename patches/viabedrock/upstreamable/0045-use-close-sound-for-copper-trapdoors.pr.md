## Evidence

Mojang's vanilla sound table uses one Bedrock sound name for these distinct actions:

- [Copper trapdoors](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L892-L905) use `open_trapdoor.copper` for both opening and closing.
- [Wooden buttons](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L3814-L3827) and [stone buttons](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L3341-L3354) use one click sound for pressing and releasing. Bedrock gives the actions different pitches.
- [Tuff](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L3590-L3611) and [tuff bricks](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L3625-L3645) use their placement sound names for both placing and breaking.

The [Java sound registry](https://github.com/ViaVersionAddons/ViaBedrock/blob/6a21c9d051dcece20717a0223287e18e4866dacc/src/main/resources/assets/viabedrock/data/java/via_mappings.json#L40277-L40329) contains separate release and break events. It also contains a [copper trapdoor close event](https://github.com/ViaVersionAddons/ViaBedrock/blob/6a21c9d051dcece20717a0223287e18e4866dacc/src/main/resources/assets/viabedrock/data/java/via_mappings.json#L39118-L39119) and [wooden button release event](https://github.com/ViaVersionAddons/ViaBedrock/blob/6a21c9d051dcece20717a0223287e18e4866dacc/src/main/resources/assets/viabedrock/data/java/via_mappings.json#L40529-L40530).

The override file selects a Java sound by Bedrock event and sound name. Other packets still use the default sound mapping. The selected Bedrock sound keeps its category, pitch, and volume.

## Review focus

Please check the five event and sound pairs against Mojang's table. The loader rejects an unknown event, a sound that the event does not use, or an unknown Java sound.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0045-use-close-sound-for-copper-trapdoors.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; the standalone patch has no test source.

The full StackAnvil series replayed and passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. A data check found all five event and sound pairs in the Bedrock table and all five targets in the Java registry. In-game audio has not been captured for these cases.
