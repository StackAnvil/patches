## Evidence

Mojang's [goat behavior](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/entities/goat.json#L196-L205) includes `minecraft:behavior.jump_to_block`. Its [sound table](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L8007-L8011) maps the `jump_to_block` event to `component.jump_to_block`, while the [frog has its own override](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L4687-L4696). The current ViaBedrock mapping sends `component.jump_to_block` to Java's player sweep attack sound, which is unrelated to the event.

This patch maps it to Java's goat long jump sound, which is present in ViaBedrock's Java sound registry. This is a semantic sound choice, not an assertion that the two editions use identical audio assets.

## Review focus

Please check whether another Bedrock entity uses the generic `jump_to_block` sound and needs a distinct Java mapping. The frog override remains unchanged.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0041-map-goat-jumps-to-their-java-sound.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
