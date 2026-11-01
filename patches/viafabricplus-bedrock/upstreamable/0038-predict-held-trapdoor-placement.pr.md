# Native held item use

Java's four-tick repeat path does not reproduce Bedrock's input timing.
Coordinate food retries and held block placement through one client input owner.
Inventory consumption and completion remain server-owned.

Food uses a strict 200 ms monotonic deadline, checked after camera input on each frame.
Gate fresh calls before local use or packet publication.
Set the deadline before main-hand food air use, including a request that hunger later refuses.
Select food from its transported component, including custom items carried as paper.
Physical release and item changes retain this connection deadline.
Connection replacement clears it.
Missing optional block-use channels do not clear the air-use hold or its deadline.

Keep the interaction mode until physical release or cancellation.
A hold started by admitted food air use continues main-hand air use after selecting a block item.
Initially refused food retains block mode, even without an initial block target.
The same air deadline applies to fresh calls, while held block continuation bypasses it.
Skip block and entity dispatch inside the use method without changing the visible raycast.
A placement hold keeps its block route after selecting food and cannot fall through to eating.
Retire offhand fallback while either route owns the hold.
Release permits a fresh press to choose another interaction mode.

Held placement waits 300 ms after a successful local block use.
Trapdoor holds also retain the established first-attempt delay.
Initially refused food retains untimed block continuation until a block use succeeds.
Failed repeats do not restart that delay.
Release, screens, and connection replacement clear the placement timer and retained trapdoor state.
Suppress Java's parallel repeat path while the frame route owns the attempt.

## Placement constraints

Retain the first predicted trapdoor facing, half, and world hit through material changes, temporary item-family changes, server correction, and stack exhaustion.
Apply that snap only while holding a trapdoor.
Other block items use fresh hits and suppress repeated activation; empty hands restore ordinary interaction.
Returning to a trapdoor restores the snap.

Send the physical lifetime and sequence-owned prediction before the concluding Java packet.
Prediction format 2 carries the result and native cursor; both consumers require the matching contract.
Express the retained hit relative to each later target, including coordinates outside its unit cube.
Keep the ordinary Java raycast packet unchanged.
Preserve each new block's water, power, open state, and material properties.
Separate trapdoors and the original support remain valid targets.

Select native outlines and occlusion from the active Bedrock connection, including ViaProxy sessions with a local Java protocol target.
Native bottom-face hits use approximately 0.8175; the earlier 0.8125 attribution came from the Java fixture.

## Evidence and validation

Official Bedrock 1.26.60.5 against BDS 1.26.60.6 establishes these controls on protocol 2225.
Native runtime tracing observes the 200 ms deadline before air use and the strict check in the shared fresh-press and held-input function.
A 2.1-second instant-food hold consumes nine items with or without the debugger.
Frame cadence determines retry quantization, so equal counts alone do not establish timing parity.

Installed direct and ViaProxy food controls check the deadline, rapid clicks after release, pause cancellation, admission, hunger, and settled server counts.
The [food-use validation](../../viabedrock/deferred/0008-signal-sustained-bedrock-item-use.pr.md) records the current build and remaining use-cycle limits.
Native tracing observes fresh flags 176 followed by held air-only flag 16 across a food-to-trapdoor change.
Only the initial call visits block use; later frames retry air use after the deadline.
Unattached stone and late trapdoor controls agree.
The reverse trapdoor-to-food control retains simulation block uses and consumes no food.
Installed direct and proxy controls check both directions and fresh placement after release or Pause.
The previous installed client placed blocks after food use and ate food during the placement hold.
Seven input-state tests cover retained modes, hand and target routing, variable frames, release, connection reset, independent delays, strict boundaries, and rollover.
Five block-state tests cover retained orientation, materials, independent properties, targets, frozen hits, release, and ordinary blocks.

Earlier installed placement fixtures match native camera changes, material changes, and fresh activation after release.
Both routes consume two items, leaving 62 from 64.
Native and direct Java retry a rejected first placement within the same hold.
Both Java routes cancel the session on Pause before physical release.
Fresh native and proxy sessions match repeated rejection followed by rotation without consumption.
After a preceding successful hold, both instead place a neighbor and consume one item.

## Remaining limits

Other initial air-use families, live entity transitions, competing use handlers, exact input-flag phase counts, and full use-cycle timing need more native comparisons.
The original intermittent animation-without-feeding report remains open.

Timed-food controls distinguish an early switch, a switch after completion, and a held three-completion cycle.
Initial refusal sends one air payload without `StartUsingItem`, then keeps block continuation.
An admitted air hold keeps its route after hunger fills.

Ordinary Stone placement still differs after the ray reaches another face: both installed routes place four blocks where native places two.
The first two successes follow the 300 ms delay. The later placement selection remains unresolved.
Do not treat these mode and timing fixes as complete held-placement parity.
