## Evidence

Mojang's [Bedrock block metadata](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/metadata/vanilladata_modules/mojang-blocks.json#L2527-L2549) lists `propagule_stage` values 0 through 4. ViaBedrock's [Java block-state registry](https://github.com/ViaVersionAddons/ViaBedrock/blob/6a21c9d051dcece20717a0223287e18e4866dacc/src/main/resources/assets/viabedrock/data/java/via_mappings.json#L53-L88) contains hanging mangrove propagules with `age` 0 through 4. The current custom mapping sends every Bedrock stage to Java age 0.

This patch keeps each Bedrock stage in the corresponding Java age state. It does not change the independent Java `stage` property or non-hanging propagules.

## Review focus

Check the five values and the Java target states. This preserves the ordinal progression rather than collapsing four distinct Bedrock states into the youngest appearance.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0059-preserve-hanging-mangrove-propagule-growth.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
