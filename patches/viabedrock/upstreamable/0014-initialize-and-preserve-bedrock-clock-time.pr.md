# Native world clock semantics

## Purpose

Initialize full clock counts and preserve paused time across legacy packets, explicit clock snapshots, and daylight-rule changes.
Retain configuration snapshots through join and supplemental resource-pack loading.

## Design constraints

Keep game age independent from the day clock.
A legacy update replaces the Overworld snapshot. An explicit update replaces legacy tracking.
For the Overworld, combine the wire pause flag with the daylight-cycle rule.
Keep the wire flag so a rule change cannot resume an explicitly paused clock.
Re-anchor current time on pause and resume. Exclude ticks spent paused.
Other named clocks retain their independent state.

## Validation and remaining limits

Native 1.26.51.1 controls establish legacy pause behavior in fixed-time lobbies.
Native 1.26.60.5 and BDS 1.26.60.6 controls resolve the explicit-clock case:
BDS reports time 13000 with `IsPaused=false` and daylight cycling disabled, while native remote fog stays fixed.
The old Java clock advances between syncs and changes the twilight color.

Packet-to-state regressions cover initialization, repeated syncs, rule changes, resume anchoring, wire pause, and unrelated clocks.
Focused tests and the complete four-project build pass.
Fresh direct and ViaProxy recordings hold the full clock count at dusk and resume without counting paused ticks.
Arbitrary custom-clock transport and broader native clock commands still need comparisons.
The [owning patch](0014-initialize-and-preserve-bedrock-clock-time.patch) retains protocol and implementation evidence.
