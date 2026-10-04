# Decode and transport native actor animation commands

## Core path

Packet 158 now decodes every field in the target protocol's wire order.
The command retains the animation, next state, stop expression, expression version, controller, and blend-out time.
Its target list uses unsigned runtime IDs.

Core resolves those IDs against the current entity tracker.
It sends current actor snapshots before a command, then binds each target to its Java identity and authoritative lifetime.
Removed or unknown runtime IDs have no current target.
Large target groups split into bounded payloads without changing command values or target order.

The payload requires negotiated actor-state and animation channels.
It has an explicit schema and Bedrock protocol version, immutable targets, size limits, and complete-input validation.
Arbitrary resource-defined bone animations require a client renderer.
Ordinary Java clients cannot execute this payload.

## Target evidence

Mojang's [AnimateEntity schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50/packets/animate-entity-packet/) identifies protocol 2193 and all seven wire fields.
Microsoft's [playanimation command reference](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/playanimation?view=minecraft-bedrock-experimental) describes the command arguments.
The packet includes a stop-expression version between its expression and controller strings.

Private captures use official Bedrock 1.26.51.1, build 51061372, protocol 2193.
The earlier capture contains seven animation commands.
A new 300-second native capture contains 13 commands and has scene SHA-256 `8febed2837f1535b30badff75e520bf3498fb5b560515a3cbc5314f1748a26db`.
The production codec reproduces all 20 captured command payloads byte for byte and consumes every field.
All captured commands use stop-expression version 1.

The new native screenshots establish that declared animation aliases resolve to their arm poses.
The capture also exercises repeated finite animations, two controller slots, a two-second blend, and a next state never commanded in that slot.
The video needs further timing analysis before those details can define the runtime implementation.
Raw captures, resource packs, and video remain private.

## Verification and remaining work

Targeted tests check independent native field encoding, unsigned runtime IDs, immutable targets, expression versions, malformed counts, truncation, and trailing payload data.
The full-stack build result is recorded in the coverage ledger.

This patch implements core decoding and negotiated transport.
The add-on does not advertise the animation channel yet.
Runtime controller playback, client lifetime checks, ordinary mob rendering, first-person behavior, and effect playback remain required work.
Direct and ViaProxy command delivery and visible playback still need end-to-end verification.
Passing codec tests does not establish animation parity.
