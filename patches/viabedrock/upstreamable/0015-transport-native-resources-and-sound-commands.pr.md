# feat(effects): transport native resources and sound commands

## Purpose

Use the preceding sound wire codecs as the protocol prerequisite. Own the versioned rendering capability marker with accepted native resources, including proxy sessions.

## Design constraints

Negotiate native capabilities per connection. Preserve ordered sound commands, complete resource context, listener ownership, and Java fallbacks. Keep server-pack priority and world-version selection through ViaProxy.

Prerequisites:

- viabedrock/0015-decode-native-sound-packet-layouts.patch: Land the sound wire models before native playback transport.

## Validation and remaining limits

Regression coverage includes `NativeBlockViewTest`, `SoundCaptionsTest`, `NativeActorLibraryTest`, `NativeResourceArchiveTest`.

Wire and resource tests cover admission and replacement. Native audible attenuation, captions, concurrency, and complete effect playback remain incomplete.

The [owning patch](0015-transport-native-resources-and-sound-commands.patch) retains implementation rationale and versioned evidence.
