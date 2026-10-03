Java retained a running day clock when a later Bedrock gamerule update disabled daylight. This made fixed-time lobbies drift into night.

The saved official Windows Bedrock 1.26.51.1 session uses protocol 2193. It sends `SetTime` 12445, then `GameRulesChanged` with `dodaylightcycle=false`. It sends no `SyncWorldClocks` updates. Native loopback replay preserves the same sky colors after the complete scene arrives.

The translator now snapshots the legacy Overworld clock against game age. Rule changes resend the current full tick count and rate. Resuming preserves the paused time and excludes ticks spent paused. Explicit Overworld clock updates clear legacy tracking, preserving their independent rates.

The patch also initializes the day clock from level time when no stop time is present. Complete tick counts preserve day counts and moon phases.

Targeted numerical tests cover pause, long waits, resume, new server times, independent explicit clocks, and packet serialization. All seven targeted tests pass. The full core suite passes with 279 tests and zero skips. `checkstyleMain` and `checkstyleTest` also pass.

## Configuration and explicit clocks

The pinned Bedrock Dedicated Server 1.26.51.1 (build 51061372, protocol 2193) sends a clock state sync before StartGame.
Its registry initialization follows StartGame.
Core now accepts clock packets during configuration and retains the latest state for known IDs.
Java receives those snapshots when the world opens, with elapsed client ticks applied only to running clocks.
An explicit Overworld snapshot takes precedence over the legacy StartGame time.
A legacy update replaces that snapshot without removing the registry ID needed by later explicit sync packets.

The native registry capture consumes every byte with the existing optional marker-period decoder.
All six advertised markers have a present period of 24,000 ticks.
The [target packet schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/sync-world-clocks-packet/) describes the period differently.
The capture establishes the wire layout used by this pinned build.
Production does not read captures or a local game installation.

Three additional numerical tests cover retained state, running ticks, paused values, independent clocks, registry replacement, and legacy fallback.
They also cover explicit sync after a legacy update.
The complete replayed core suite and Checkstyle pass.

The live server reports a running explicit Overworld clock even when `doDaylightCycle=false` keeps its queried daytime fixed.
Direct Java follows that explicit rate until the next server correction.
The native client's treatment of these conflicting signals remains unverified.
Explicit paused-clock integration and arbitrary custom-clock registry transport also need further native comparisons.

Live direct and ViaProxy joins retain the registry during supplemental custom-block pack loading.
The private state timeline records configuration, a populated clock snapshot, buffered world packets, and the transition to play.
Java starts at the captured 72,046 ticks on both routes.
These observations establish clock retention and initial projection through the pack gate.
They do not establish paused-clock or complete visual parity.
The final build passes 413 core tests with one optional fixture skip and no failures or errors.
