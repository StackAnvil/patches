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
List refreshes take the local profile mode from the authoritative local actor, including before an explicit mode event. The remote cache fallback applies only to remote profiles.
Java's existing `Undefined` fallback stays unchanged.
This fallback does not establish the native spectator predicate used by aim assistance.

## Evidence and tests

Current tests target Bedrock 1.26.60, protocol 2225.
[Mojang's packet description](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/update-player-game-type-packet/) identifies the update as a cache refresh for all clients.
The [default-mode packet](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/set-default-game-type-packet/) changes the shared default.
These references support packet purpose, without supplying new enum values.

Packet tests cover remote updates, inherited defaults, local events, cache identity changes, and repeated local profile refreshes in Creative, Spectator, and Survival. The refresh regression fails with the previous handler because it writes Survival for the local Creative profile. Remote Adventure state remains unchanged.

A controlled protocol-2225 replay preserves captured official Bedrock 1.26.60.5 skin and profile payloads, then adds declared mode transitions and a repeated captured list packet. Read-only installed-client observations compare the player entity, current profile, and movement controller. The add-on's [player profile refresh](../../viafabricplus-bedrock/upstreamable/0002-native-entities-and-skins.pr.md) handles Java's separate stale-profile cache.

The complete core build and both Checkstyle tasks pass. Direct and proxy replays check the selected mode/profile transitions and complete transport. These controls do not establish complete movement, aim, graphics, or remote skin parity.
