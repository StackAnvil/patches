# Recover a chunk radius request that receives no response

Keep the requested Java distance on the first request. Retry it after five seconds.
If a smaller radius remains unacknowledged after ten seconds, request radius eight once.
Stop retries on acknowledgment, spawn, removal, or disconnect.
Settings changes replace the pending request. A thirty-second limit reports the missing response.

This belongs in ViaBedrock core so direct and ViaProxy connections use the same behavior.
It does not fabricate chunks, spawn status, or local-player initialization.
The fallback is a server compatibility response, without a claim that all native clients require radius eight.

## Evidence

The macOS CubeCraft regression uses Bedrock 1.26.51.1, protocol 2193, and Java 26.3.
Two radius-four attempts receive StartGame and continuing server traffic, but no radius acknowledgment, chunks, or spawn status.
A repeated radius-four request on the same connection does not recover delivery.
A radius-eight request immediately receives acknowledgment, level chunks, and spawn status.
The client then sends initialization and 3,177 input packets before the recording closes.
It continues for more than two minutes after recovery.
Raw journals and diagnostic probes remain private.

[Mojang's nearby preview request schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.24/packets/request-chunk-radius-packet/)
and [response schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.24/packets/chunk-radius-updated-packet/)
describe the existing signed radius and maximum-radius byte.
They use protocol 2181, so the protocol 2193 implementation and captures establish the target behavior.

## Tests

Netty's embedded event loop verifies retries, acknowledgment cancellation, timeout bounds,
settings replacement, spawn cancellation, removal, and closed-channel handling without real-time sleeps.
The targeted tests and core Checkstyle pass. The full stack replays with 94 patches.
The current stack automatically recovers the macOS CubeCraft radius-four join and reaches a visible lobby with a 2 GiB client heap.
The closed macOS journal confirms requests at four, four, and eight, with acknowledgment 54 ms after the fallback.
It records spawn, one initialization packet, 2,856 input packets, and 172 chunks over 168 seconds.
The authenticated strict BDS regression reaches StartGame and spawn, with one radius request and acknowledgment, one initialization packet, and 793 input frames.
The unauthenticated HTTP attempt fails before Bedrock packets and remains a separate identity compatibility gap.
Native radius comparison remains open.
Complete builds pass with 624 core tests and 600 add-on tests, with no failures.
The rebuilt Windows guest reaches the CubeCraft lobby on retry and unloads its pack with a confirmed 2 GiB heap.
Live core diagnostics verify spawn and advancing player ticks during more than four minutes of gameplay.
The first Windows resource reload still disconnects. Windows radius recovery remains unverified without a packet journal.
