## Review focus

Leaving a Java bed sends `STOP_SLEEPING`.
The upstream command switch falls through to its unhandled-action exception.
Add one case that sends Bedrock `StopSleeping` through the existing player-action helper.
Other command mappings remain unchanged.

## Validation

`bun run pr build viabedrock --patch 0035-forward-bed-wake-command-to-bedrock.patch` passes, including compilation and Checkstyle.
The patch applies alone to the pinned upstream base and adds one production line.
A fresh live sleep/wake check was not part of this PR preparation.
