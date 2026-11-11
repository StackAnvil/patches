# feat(effects): transport native resources and sound commands

## Purpose

Use the preceding sound wire codecs as the protocol prerequisite. Own the versioned rendering capability marker with accepted native resources, including proxy sessions.

## Design constraints

Negotiate native capabilities per connection. Preserve ordered sound commands, complete resource context, listener ownership, and Java fallbacks. Keep server-pack priority and world-version selection through ViaProxy.

Prerequisites:

- viabedrock/0015-decode-native-sound-packet-layouts.patch: Land the sound wire models before native playback transport.

Caption translations load per locale on first use. The table keeps pack order and server overrides, falls back to English, and caches only locales that the packs provide. Splitting on a literal newline avoids a regular expression for every language file. An isolated benchmark of the actual classes constructs the caption table and resolves one English caption in a median 9.2 ms versus 207.7 ms in the eager baseline, across seven measured rounds after three warmups. Temporary allocation falls from 325.9 MiB to 36.4 MiB. All 29 bundled locale values compare equal outside the timed section. This measures first-use caption work, not complete join time.

## Validation and remaining limits

Regression coverage includes `NativeBlockViewTest`, `SoundCaptionsTest`, `SoundTranslationsTest`, `NativeActorLibraryTest`, `NativeResourceArchiveTest`.

Wire and resource tests cover admission and replacement. Native audible attenuation, captions, concurrency, and complete effect playback remain incomplete.

The [owning patch](0015-transport-native-resources-and-sound-commands.patch) retains implementation rationale and versioned evidence.
