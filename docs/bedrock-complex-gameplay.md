# Test Bedrock gameplay

Use this guide to choose a focused native comparison for a gameplay change.
The current target and known gaps are in [compatibility status](bedrock-coverage.md).

## Choose the behavior

State the player-visible failure and the expected native result before adding cases.
Choose inputs that distinguish the suspected defect from a working path.
Use one positive control and a relevant rejection or boundary control.
Add combinations only when shared state creates a distinct failure risk.
Do not build a Cartesian matrix solely to increase coverage.

| Area | Useful boundaries |
| --- | --- |
| Movement | Start/stop, water or solid contact, posture, corrected motion, and overlapping impulses. |
| Item use | Interrupted use, slot changes, consumption, cooldowns, and server rejection. |
| Combat | Reach, occlusion, ownership, charge state, and damage or effect updates. |
| Placement | Hit face, held orientation, interaction suppression, target changes, and rejected predictions. |
| Mounts | Authority, passenger identity, mounting/dismounting, and corrected vehicle state. |
| Inventories | Cursor/slot identity, menu replacement, delayed replies, rejection, and loss or duplication. |
| Lifecycle | Teleports, respawns, dimensions, reconnects, and stale queued work. |

Mojang's [movement guide](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/)
explains prediction and input ticks. Numeric constants and ordering still need matching versioned evidence.
The [source guide](bedrock-development-sources.md) describes that process.

## Run a local fixture

Prepare the clients and owned server with the [development guide](development.md).
Run the existing BDS complex cases with:

```bash
bun run test:integration -- --route java-bedrock --gameplay-complex
```

Select individual cases through the [test-pack guide](bedrock-test-packs.md).
The suite exercises ranged use, potion effects, fireballs, powder snow, fluids, and creative ascent.
It is a runnable subset, not an exhaustive Bedrock simulation.
The Java/Geyser fixture does not implement every BDS complex case.

## Compare the result

Record the build, pack stack, game mode, input path, and route.
Compare the actual native and Java outcomes under the same fixture.
Packet arrival, an animation start, or a server-side assertion proves only that boundary.
Measure visible motion, item consumption, hit results, or recovery when the change concerns those results.
Retain a useful regression at the smallest boundary that catches the defect.

Keep raw traces and experiment history private.
Put the lasting reason in the owning patch and update its remaining limits.
Do not append each test run to a shared document.

## Current limits

Water-edge falls, combined vision effects, native picking, and broader correction replay need focused comparisons.
Server-authoritative mount behavior, mixed item use, and network conditions also remain partial.
A test-driver defect and a production mismatch are separate findings.
Neither one establishes parity for an unobserved result.
