# feat(effects): transport native resources and sound commands

## Purpose

Use the preceding sound wire codecs as the protocol prerequisite. Own the versioned rendering capability with accepted native resources, including proxy sessions. The format and Bedrock protocol in the `pack.mcmeta` source section mark that capability, so the pack has no separate `client_rendering.json`.

## Design constraints

Negotiate native capabilities per connection. Preserve ordered sound commands, complete resource context, listener ownership, and Java fallbacks. Keep server-pack priority and world-version selection through ViaProxy.

Prerequisites:

- viabedrock/0015-decode-native-sound-packet-layouts.patch: Land the sound wire models before native playback transport.
- viabedrock/0025-apply-dependencies-and-selected-subpacks.patch: Preserve complete source packs and selected subpack metadata in native transport.

Complete accepted Bedrock ZIPs travel as stored `.mcpack` assets inside the ordinary Java resource pack. Its `pack.mcmeta` section records pack order, provenance, selected subpacks, protocol and base-game version. Unchanged received ZIPs pass through. Decrypted or edited content becomes a complete accepted ZIP. No native-library binary envelope or separate asset transfer remains.

The shared archive exposes every source file and selected subpack metadata. Existing actor and effect consumers retain their established resource view so unrelated block/UI definitions do not enter actor reconstruction. Future parsers can use the complete sources without changing backend export. Java resources, the block supplement and their loading sequence remain intact. UI images now resolve from these sources. Block supplement metadata remains in the Java packs because it depends on StartGame state that the sources do not carry.

The frontend opens each referenced ZIP directly from the server pack that owns its metadata. It verifies length and SHA-256 before a decoded-cache hit, then bounds ZIP directories, expanded bytes, file counts and paths and validates entry checksums. ZIP64, prepended and directory-heavy inputs use complete accepted snapshots. Cache accounting includes source-only bytes. The old `actor_library.bin` reader and writer are removed; converted-pack cache revision 12 regenerates older local outputs.

Caption translations load per locale on first use. The table keeps pack order and server overrides, falls back to English, and caches only locales that the packs provide. Splitting on a literal newline avoids a regular expression for every language file. An isolated benchmark of the actual classes constructs the caption table and resolves one English caption in a median 9.2 ms versus 207.7 ms in the eager baseline, across seven measured rounds after three warmups. Temporary allocation falls from 325.9 MiB to 36.4 MiB. All 29 bundled locale values compare equal outside the timed section. This measures first-use caption work, not complete join time.

## Validation and remaining limits

Regression coverage includes `NativeBlockViewTest`, `SoundCaptionsTest`, `SoundTranslationsTest`, `NativeActorLibraryTest`, `BedrockResourcePackPayloadsTest`.

The full four-project build passes 4,000 tests with 336 optional skips, including the new payload and cache boundary tests. Offline tooling and patch-metadata validation pass.

Final Galaxite replays pass transport with caches disabled, an empty disk cache, a populated disk cache, and a same-process reconnect. The addon also loads the new payloads through ViaProxy without a direct Bedrock connection. Live checks load all 2,220 custom-block and culling definitions and resolve a shared UI image from its owning server pack. Every one of the 21 recorded server ZIPs passes through byte for byte. The Java block supplement is byte-identical to the baseline. Other generated Java assets compare equal after normalizing JSON order and cosmetic CubeConverter model names and their derived filenames; geometry, UVs, materials and physics remain in the comparison. Actor consumers receive the same 19,334 files and bytes. Complete sources expose 770 additional files.

A separate ViaProxy replay removes ViaFabricPlus and the StackAnvil frontend from the Java client. Only a private Fabric observer remains to accept normal pack prompts, record loaded packs and stop the client. Baseline and candidate both reach gameplay with the same two server-pack reloads. Both report the same eight out-of-bounds Java models; the nested payloads introduce no new model-load errors. This checks the ordinary Java resource loader without frontend hooks, rather than claiming a pristine vanilla installation or full pixel parity.

The current build records 3.81 seconds of instrumented backend windows on a cache-disabled join, 2.64 seconds with a populated disk cache, and 1.91 seconds on reconnect. Overlapping windows count once and stop at first gameplay input. Cold source export takes 0.51 seconds and accepted-source loading takes 0.39 seconds. These are replay observations with recorded packet pacing and varying host load, not a controlled latency improvement or a two-second cold-join result.

Wire and resource tests cover admission and replacement. Broad scene rendering still reports existing unresolved mappings. Native audible attenuation, captions, concurrency, and complete effect playback remain incomplete. Raw recordings, ZIPs, profiler data and detailed comparisons stay private.

The [owning patch](0015-transport-native-resources-and-sound-commands.patch) retains implementation rationale and versioned evidence.
