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
Raw captures, resource packs, and video remain private.

### Runtime controller evidence

Executable inspection uses the matching licensed build, with SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
The packet handler at `141327de0` updates a state definition, then queues that state's selection for the next controller update.
The state builder at `141bbe700` finds or creates a controller by the command's controller name.
Each animation name identifies a retained state inside that controller.

The builder creates a named next state even before that state receives a command.
It binds that state's actor animation alias when the alias exists.
An unavailable alias leaves the state without that animation child.
A transition requires both a next-state name and a nonempty stop expression.
Existing transitions remain in order.
Transition insertion at `141e6bfa0` skips a duplicate target and expression text, without comparing expression versions.

Each command replaces its state's blend curve and enables rotation blending through the shortest path.
A nonzero blend time creates curve points `(0, 1)` and `(blend_out_time, 0)`.
The controller at `141e6d180` uses the outgoing state's curve during a transition.
The incoming command's blend time therefore describes its later departure.

Six private executable probes exercise the real selection and controller-update routines with synthetic child callbacks.
They cover no curve, an outgoing curve, an incoming curve, both curves, successive selections, and a pending selection with a true condition.
The probes establish these controller behaviors:

- Selecting the current state resets its state time and child playback.
- The last selection before an update wins.
- A pending selection takes priority over transition expressions in that update.
- An incoming state's curve does not start a blend when the outgoing state lacks a curve.
- Selecting the current state with an outgoing curve samples that same state twice during the blend.
- At 0.25 seconds into a two-second outgoing curve, the ordinary blend weights are 0.875 and 0.125.

These probes establish selection, clock, and weight behavior.
They use synthetic children and do not establish rendered poses, shortest-path rotation output, first-person playback, or effect timing.
The native video still needs visible timing comparisons against the production client implementation.

## Verification and remaining work

Targeted tests check independent native field encoding, unsigned runtime IDs, immutable targets, expression versions, malformed counts, truncation, and trailing payload data.
The full-stack build result is recorded in the coverage ledger.

This patch implements core decoding and negotiated transport.
The add-on does not advertise the animation channel yet.
Runtime controller playback, client lifetime checks, ordinary mob rendering, first-person behavior, and effect playback remain required work.
Direct and ViaProxy command delivery and visible playback still need end-to-end verification.
Passing codec tests does not establish animation parity.
