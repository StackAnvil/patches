Java retained a running day clock when a later Bedrock gamerule update disabled daylight. This made fixed-time lobbies drift into night.

The saved official Windows Bedrock 1.26.51.1 session uses protocol 2193. It sends `SetTime` 12445, then `GameRulesChanged` with `dodaylightcycle=false`. It sends no `SyncWorldClocks` updates. Native loopback replay preserves the same sky colors after the complete scene arrives.

The translator now snapshots the legacy Overworld clock against game age. Rule changes resend the current full tick count and rate. Resuming preserves the paused time and excludes ticks spent paused. Explicit Overworld clock updates clear legacy tracking, preserving their independent rates.

The patch also initializes the day clock from level time when no stop time is present. Complete tick counts preserve day counts and moon phases.

Targeted numerical tests cover pause, long waits, resume, new server times, independent explicit clocks, and packet serialization. All seven targeted tests pass. The full core suite passes with 279 tests and zero skips. `checkstyleMain` and `checkstyleTest` also pass.
