Inventory actions now own separate snapshots of their before and after items.
Later changes to the original items cannot alter a queued transaction.
Passing the same item on both sides also creates independent snapshots.

## Evidence

The inspected native client is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Its executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
Action constructor `1401d4ad0` creates cached descriptors and copies each item through `142481ef0`.
Existing private constructor probes also preserve action counts after the input stacks are destroyed.

This patch changes item ownership at construction.
It preserves transaction sources, comparison rules and wire layout.
Native wire parity and live server acceptance remain separate checks.

## Testing

The regression fails against the original reference-only record.
It covers count, auxiliary data, nested NBT, restriction arrays, blocking state, runtime identity and network ID changes.
It also checks that mutation of the after item cannot alter the before item.
Focused action and authored chest tests and main/test Checkstyle pass before the deferred patches apply.
The full core build passes 1,442 tests, with 95 optional tests skipped and no failures.
Main, test and tool Checkstyle and Maven POM generation pass.
All 103 core patches replay successfully.
The offhand patch compares item contents instead of requiring shared object identity.

## Upstream prerequisite

The cache patch supplies the test-source configuration.
