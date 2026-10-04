## Purpose

Decode native server sound playback and controls in core. Transport complete sound commands and ordered audio, captions, and particle resources through direct connections and ViaProxy. Preserve standard Java playback when the client does not advertise native sound support.

## Upstream base

[ViaBedrock PR #435](https://github.com/ViaVersionAddons/ViaBedrock/pull/435) merged the earlier coordinate-only fix. This patch retains the later native decoding correction, sound controls, resource transport, and captions. Its diff now starts from the merged upstream implementation. The native evidence in the next section establishes the fixed-point units.

## Evidence

A controlled native capture uses Bedrock 1.26.51.1, build 51061372, and protocol 2193. Its beta script API plays `note.harp` at `(-4.125, 70.875, -2.25)` with volume 0.5, pitch 1, and loop count -1. The packet carries signed coordinate integers `(-33, 567, -18)`. Each integer represents eighths of a block.

The former patch multiplied these fields by eight. That conclusion came from interpreting the `BlockPos` type name as a unit. The native capture disproves it. The corrected handler preserves all three integers, including fractional negative positions, without a floating-point conversion.

[Gophertunnel's sound position reader](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/reader.go) also divides the three signed integers by eight. Its [PlaySound codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/packet/play_sound.go) reads the loop count as a signed variable integer.

The [matching Mojang schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/play-sound-packet/) lists the position and remaining fields. Its type name does not establish coordinate units.

Java 26.3 `ClientboundSoundPacket` stores its position as three integers in eighths of a block. Its constructor multiplies world coordinates by eight; its getters divide the stored values by eight. The [official client JAR](https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar) was inspected with `javap`.

## Review focus

The typed PlaySound codec preserves fixed-point coordinates, signed loops, listener-range flags, optional unsigned handle bits, and optional playback position.
Packet 348 now decodes all seven control variants. Each message carries seven tagged values; the final value supplies the effective command.
The decoder rejects unknown tags and preserves following-value alignment.
The captured fade command carries duration before target volume.

Clients advertise `viabedrock:sound_playback` through Java channel registration.
Core forwards playback, stop commands, and handle controls in packet order.
The converted Java resource pack carries bounded native sound files and definitions in bottom-to-top pack order.
This lets the add-on use the same resources through ViaProxy.
Archive decoding validates paths, sizes, pack indexes, duplicate entries, and the protocol header.

Ordinary Java clients retain the mapped SOUND and STOP_SOUND translations.
Java packets cannot express server instance handles, arbitrary loops, seeking, or independent pause controls.
These controls require the client add-on.
Core exposes the native request range comparison. The add-on evaluates it against the actual audio listener before registering handles. Actor/local captions, broader caption comparisons, other sound-source range paths, and native stream interruption policies remain incomplete.

## Testing

Eighteen targeted tests pass with both Checkstyle tasks in a checkout containing only this patch on the pinned upstream base.
They cover coordinate limits, optional fields, signed loops, each control layout, final-variant selection, malformed messages, archive overrides, deterministic ordering, invalid paths, strict radius boundaries, volume scaling, large-coordinate float rounding, and unordered distances.

Both complete stacks replay successfully: 91 ViaBedrock patches and 23 add-on patches.
`bun run build all` passes with matching StackAnvil dependencies: 919 tests pass and 110 optional asset tests skip.
ViaProxy also builds.

A controlled native 1.26.51.1 capture reaches StartGame and spawn and supplies all seven controls.
The unchanged session replays through both the direct add-on and ViaProxy routes.
Both routes spawn and load the converted resource pack.
Private instrumentation observes actual OpenAL state: playback spans repeated PCM buffers, pitch changes to 1.3, seek resets the stream to 0.01 seconds, pause enters AL_PAUSED, and resume enters AL_PLAYING.
The ViaProxy route also samples the volume envelope changing from 0.3 to 0.2 over two seconds.
Stop removes the direct route's handle; the ViaProxy route stops producing active voice samples.

The lab uses zero volume. These observations establish the tested control path, not audible parity.
The sample uses a mapped Java fallback without Store sign-in.
The custom sample checks below also pass. Finite-loop controls, replacement races, global pause interactions, and broader lifecycle comparisons remain unverified.
The direct replay's existing skin rendering gate fails; the sound checks use the transport-only gate.
Mixed wire variants are covered by tests and Gophertunnel's implementation, but have not been compared with the pinned native client.

Private captures, instrumentation, and game assets remain outside the repository.

## WAV resources and decoder

Include WAV samples in the same bounded archive used by both connection routes.
Decode RIFF/WAVE in core, keeping the client adapter limited to its existing PCM player.
The pinned 1.26.51.1 extension initializer at `0x140275490` declares FSB, OGG, then WAV.
[Microsoft](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontosound?view=minecraft-bedrock-stable) documents these formats.
[Its extensible format specification](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ksmedia/ns-ksmedia-waveformatextensible) establishes valid-bit alignment and subtype identity.

Seven additional tests cover integer and floating-point PCM, extensible precision, stereo IMA groups, final sample counts, chunk ordering and padding, malformed headers, and incomplete frames.
Fourteen private FFmpeg comparisons cover 252,000 scalar samples.
Integer PCM and IMA match exactly, and floating-point PCM differs by at most one quantization step.
IMA comparison excludes block padding beyond the RIFF fact count.
The converted-pack cache includes the implementation commit in its fingerprint, so older archives cannot hide newly included WAV files.
Native audible mixing, quantization comparisons, loop metadata, and multichannel playback remain required.

A pinned native session downloads a server pack with PCM WAV, IMA WAV, and OGG samples and captures three custom instances with 21 controls.
The unchanged capture passes full scene transport checks through both direct and ViaProxy routes.
Both clients use the transported samples with no Store account and an empty Java fallback.
Private OpenAL instrumentation verifies repeating playback, pitch 1.3, fade from 0.3 to 0.2, seek to 0.25 seconds, pause, and resume for each sample.
ViaProxy's stop controls reduce tracked requests and handles from three to zero.
Both routes retain their separate skin rendering limitations.
These muted observations establish resource resolution and controls, not audible parity.


## Native request admission

The pinned executable's `144719f20` request callback applies a float distance gate before playback or caption dispatch. It uses a radius of `16 × max(volume, 1)` blocks and rejects the boundary itself. Bypass skips the comparison. The calculation uses request volume, not catalog gain or attenuation distances.

Core preserves the native operation order. A private Java comparison matches all 1,188 native execution cases in the packet coordinate domain. The cases cover different listener positions, float rounding at large coordinates, volumes, bypass, and non-finite inputs. The native probe stops at the admission branch.

A private synthetic fixture over a native recording passes through direct and ViaProxy connections. It verifies eligible OpenAL voices, rejected requests, distant bypass, increased-volume admission, preservation of an active handle after a rejected replacement, and final cleanup. Both clients load the server samples without a Store account. The lab is muted. These checks do not establish audible parity, all camera contexts, other sound-source gates, or exact bypass behavior in an ordinary Java client.


## Server closed captions

Core now supplies native caption admission and float direction calculations, localized duplicate refresh, elapsed-time state, and quartic fade values. A separate bounded, pack-ordered translation archive keeps the existing audio archive compatible with older readers. The add-on supplies player/listener pose, controls, and HUD drawing.

Pinned native dispatch comparisons match 587 cases. A further 105 native executable cases verify the wall-clock float countdown at explicit performance-counter boundaries. The standalone patch passes 23 tests and both Checkstyle tasks. Direct and ViaProxy sessions load the recorded server translations without Store credentials, show five positive-volume cues in HUD state, reject the zero-volume cue, and expire them. HUD screenshots confirm rendered text and arrows on both routes; the proxy image shows all five rows with Java's tutorial disabled in the lab. Both transport-only replays retain separate skin/actor rendering failures. These observations do not establish complete native layout or audible parity.

Actor/local sources, marked-source integration, settings-change timing, complete localization precedence, exact layout/font behavior, and audio-device-unavailable behavior remain incomplete or unverified. [Microsoft documents English fallback](https://github.com/MicrosoftDocs/minecraft-creator/blob/main/creator/Reference/Content/MCToolsValReference/langfiles.md), and [Mojang describes the caption controls](https://www.minecraft.net/en-us/article/closed-captions-for-bedrock-edition).


## Local particle sound caption admission

Share the native float listener gate with local particle sound emitters. Preserve their original float positions; PlaySound still converts its fixed-point coordinates before calling the same calculation. The Java helper matches 444 native local-emitter admission cases. Particle configuration and caption metadata resolve before PCM loading, so unavailable samples do not suppress captions. This path uses marker zero in the pinned native alias caller. Network actor-marker integration and attached-animation caption behavior remain unfinished.


Validation: the complete build passes 926 Java tests with 110 optional asset skips. The core audio patch builds alone with 24 tests and both Checkstyle tasks. The targeted particle/resource-library run passes 12 tests with private native references enabled and two unrelated optional conditions skipped. Synthetic direct and ViaProxy sessions invoke the production local-emitter entry point, retain a caption for a missing PCM sample, exclude quiet/distant cues, and expire rows. Screenshots show caption output with concurrent-row clipping. These checks do not cover incoming particle packets, proxy actor/effect graph transport, complete layout, or audible parity.

## Shared particle resource transport

Export particle definitions, render controllers, and PNG/TGA images in a separate native archive. Preserve empty pack indexes and texture-only overlays. Include images without discovering references through licensed built-in assets. The shared bounded codec keeps existing sound and caption archive bytes unchanged in 100 private comparison cases.

The core selectors also support direct consumers without compression. Targeted tests verify ordering, child definitions, overlay images, protocol validation, and rejected paths. This patch builds alone with 26 passing tests and both Checkstyle tasks. The full stack passes 933 Java tests, with 110 optional asset tests skipped.

Converted-pack format 3 belongs to the separate cache patch. Client resource snapshots belong to the Character Creator patch. Incoming particle dispatch, typed Molang variables, persistent actor binding, and visible particle comparisons remain incomplete.

**Resource availability check:** An authored pack contains three particle definitions and one texture. Private main-thread instrumentation reads all three definitions and the identical texture bytes from the accepted converted resource pack on direct and ViaProxy connections. Both full replays reach spawn, transport every recorded payload, and load the Java resource pack without Store sign-in. This verifies resource availability, not incoming particle dispatch or visible effects. The existing direct skin-update failures and missing ViaProxy actor/appearance state remain open.


## Authoritative block identities for native effects

Transport the core's primary Bedrock state IDs and names through the native block channel. Preserve palette identity before Java mapping. Split dictionary fragments before section references, replay loaded state on late registration, and clear the client mirror after dimension resets or unloads. Uniform sections carry no cell array.

The codec, section packing, and client mirror live in core. This allows direct and ViaProxy clients to use the same authoritative block filters. Clients that do not advertise the channel retain the standard translation.

Validation: the patch applies alone to clean upstream and passes 32 tests and both Checkstyle tasks. The full stack passes 940 Java tests with 110 optional asset skips. The bundle builds. Tests cover packing widths, every coordinate, palette expansion and compaction, negative coordinates, updates, empty sections, malformed data, unknown IDs, and resets.

An isolated target-build server supplies 2,712 section snapshots on each connection route. The direct producer matches all 11,108,352 cells against its source tracker. Every decoded section hash matches the producer. Both clients resolve every cell from the transported dictionary without a mismatch. Direct updates and six ViaProxy updates also match. Incoming particle dispatch, visible filter behavior, and live dimension/unload/disconnect observations remain unverified.
