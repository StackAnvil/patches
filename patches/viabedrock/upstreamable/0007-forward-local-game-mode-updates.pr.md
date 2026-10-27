# Refresh local and inherited player game modes

World-default changes previously refreshed only the local Java player.
Remote profiles kept their old mode, including stale spectator state.
Player-list refreshes also recreated profiles without their known game mode.

The patch retains decoded remote game types from `ADD_PLAYER` and `UPDATE_PLAYER_GAME_TYPE`.
A default change sends profile updates only for remote modes whose effective Java value changes.
Player-list additions include the retained effective mode.
The cache uses both profile UUID and actor unique ID, so list refreshes preserve state and replacement actors discard it.
Removal clears state even when the list entry is absent.

The existing local unique-ID lookup still accepts updates before a player-list entry exists.
Local profile updates and game-mode events keep their separate path.
Java's existing `Undefined` fallback stays unchanged.
This fallback does not establish the native spectator predicate used by aim assistance.

## Evidence and tests

The target is Bedrock 1.26.51.1, protocol 2193.
[Mojang's packet description](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/update-player-game-type-packet/) identifies the update as a cache refresh for all clients.
The [default-mode packet](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/set-default-game-type-packet/) changes the shared default.
These references support packet purpose, without supplying new enum values.

Six focused tests cover translated player updates, default transitions, Java packet fields, local events, and cache identity changes.
The previous packet handlers fail both remote-update regressions.
The corrected handlers pass all six tests after replay of the full 104-patch core stack.

The four-project build reports 2,941 passed tests, 312 optional skips, and no failures or errors.
Both core Checkstyle tasks pass.
All six new mode tests pass without skips.
The packaged client classes, core and converter dependencies, and four source snapshots match the tested outputs.
Optional native-reference and GPU controls from earlier rendering milestones are outside this build run.

These controls verify Java translation and cache behavior.
They do not establish native aim inputs, graphical equality, or complete remote skin parity.
