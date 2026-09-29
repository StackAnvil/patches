## Evidence

Mojang's [vanilla sound table](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/resource_pack/sounds.json#L892-L905) assigns `open_trapdoor.copper` to both `trapdoor.open` and `trapdoor.close` for copper. Java has separate copper trapdoor open and close sound events in ViaBedrock's Java sound registry. Using only the Bedrock sound name therefore loses the action distinction.

This patch uses the Bedrock event name to select Java's close sound for the copper close event. It retains the existing mapping for opening and for other trapdoors.

## Review focus

Please check the event-name condition and confirm it stays specific to copper trapdoors. The source asset mapping remains faithful to Mojang's sound table.

## Testing

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0045-use-close-sound-for-copper-trapdoors.patch`.

The isolated checkout passed `./gradlew --no-daemon test checkstyleMain checkstyleTest`. Gradle reported `test NO-SOURCE`; this standalone patch adds no runnable test source.
