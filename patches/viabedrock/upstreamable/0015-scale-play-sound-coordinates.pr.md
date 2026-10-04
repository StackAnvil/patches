## Purpose

Decode native server sound playback and controls in core. Transport the complete commands and ordered sound resources through direct connections and ViaProxy. Preserve standard Java playback when the client does not advertise native sound support.

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
Listener-range eligibility, captions, and native stream interruption policies remain incomplete.

## Testing

Seven targeted tests pass with both Checkstyle tasks in a checkout containing only this patch on the pinned upstream base.
They cover coordinate limits, optional fields, signed loops, each control layout, final-variant selection, malformed messages, archive overrides, deterministic ordering, and invalid paths.

Both complete stacks replay successfully: 91 ViaBedrock patches and 23 add-on patches.
`bun run build all` passes with matching StackAnvil dependencies: 907 tests pass and 110 optional asset tests skip.
ViaProxy also builds.

A controlled native 1.26.51.1 capture reaches StartGame and spawn and supplies all seven controls.
The unchanged session replays through both the direct add-on and ViaProxy routes.
Both routes spawn and load the converted resource pack.
Private instrumentation observes actual OpenAL state: playback spans repeated PCM buffers, pitch changes to 1.3, seek resets the stream to 0.01 seconds, pause enters AL_PAUSED, and resume enters AL_PLAYING.
The ViaProxy route also samples the volume envelope changing from 0.3 to 0.2 over two seconds.
Stop removes the direct route's handle; the ViaProxy route stops producing active voice samples.

The lab uses zero volume. These observations establish the tested control path, not audible parity.
The sample uses a mapped Java fallback without Store sign-in.
Live custom samples, finite-loop controls, replacement races, global pause interactions, and broader lifecycle comparisons remain unverified.
The direct replay's existing skin rendering gate fails; the sound checks use the transport-only gate.
Mixed wire variants are covered by tests and Gophertunnel's implementation, but have not been compared with the pinned native client.

Private captures, instrumentation, and game assets remain outside the repository.
