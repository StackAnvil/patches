## Purpose

Preserve PlaySound coordinates in their native units and decode the complete payload with a signed loop count.

## Evidence

A controlled native capture uses Bedrock 1.26.51.1, build 51061372, and protocol 2193. Its beta script API plays `note.harp` at `(-4.125, 70.875, -2.25)` with volume 0.5, pitch 1, and loop count -1. The packet carries signed coordinate integers `(-33, 567, -18)`. Each integer represents eighths of a block.

The former patch multiplied these fields by eight. That conclusion came from interpreting the `BlockPos` type name as a unit. The native capture disproves it. The corrected handler preserves all three integers, including fractional negative positions, without a floating-point conversion.

[Gophertunnel's sound position reader](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/reader.go) also divides the three signed integers by eight. Its [PlaySound codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/packet/play_sound.go) reads the loop count as a signed variable integer.

The [matching Mojang schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/play-sound-packet/) lists the position and remaining fields. Its type name does not establish coordinate units.

Java 26.3 `ClientboundSoundPacket` stores its position as three integers in eighths of a block. Its constructor multiplies world coordinates by eight; its getters divide the stored values by eight. The [official client JAR](https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar) was inspected with `javap`.

## Review focus

The handler reads a typed PlaySound value. It preserves the signed loop count, listener-range flag, optional unsigned handle bits, and optional playback position. The Java translation uses the same fixed-point integers without scaling or a block-center offset.

This change does not implement loops, server handle controls, seeking, or listener-range overrides. Those need a playback path that can reproduce their behavior. Ordinary Java SOUND packets cannot express them.

## Testing

The targeted tests check Java packet coordinates for fractional negative positions and integer limits. They check signed loop counts, independent optional-field combinations, unsigned handle bits, following-value alignment, and codec round trips.

The patch applies alone to the pinned upstream base with `bun run pr check viabedrock --patch 0015-scale-play-sound-coordinates.patch`. Its two tests and both Checkstyle tasks pass in that isolated checkout.

The full 91-patch ViaBedrock stack replays successfully. `bun run build all` passes with the matching StackAnvil dependencies: 898 tests pass and 110 optional asset tests skip across CubeConverter, ViaBedrock, and the client add-on. ViaProxy also builds.

The controlled native session reaches StartGame and spawn. Its packet values establish the wire units. It does not establish audible parity.

Private captures and game assets remain outside the repository.
