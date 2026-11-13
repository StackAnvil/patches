# feat(movement): retain completed client prediction frames

## Purpose

Native 1.26.51.1 protocol 2193 packets distinguish completed fluid motion from air gravity. At eye Y 103.4815826 a native idle-water frame reports -0.022315647 blocks per tick, while the previous air approximation reports -0.0996117 for the matching translated position. Preserve a negotiated client motion sample instead of reconstructing it from rounded positions.

## Design constraints

Pair input, completed motion, item state, and authoritative frame identity. Retain correction history and ordered effects without allowing stale actor or world state into replay.

The version-7 native block dictionary carries physical geometry, random offsets, and friction separately from visual models.
Verified base-factory registrations use the native default coefficient when no explicit friction component applies.
Hardcoded types retain their pinned coefficients. Other server-defined classes retain unknown physical data.
An empty geometry value remains distinct from unknown geometry through section updates, unloading, and world replacement.

World resets carry the exact base-game version text and signed generator ID from `StartGame` with dimension and terrain bounds.
Consumers read both fields from one immutable reset. Unknown generator IDs retain their original values.
The mirror replaces these settings with each reset and clears them on disconnect. Resource cutoffs and client protocol versions remain separate inputs.

The prerequisite entries in `series.json` supply actor snapshots, block dictionaries, and resolved custom-block components.

## Validation and remaining limits

Regression coverage includes `ActorMotionCommandTest`, `ActorSpatialCommandTest`, `CollisionContactTest`, `FlightMovementTest`, and `MotionFrictionTest`.

The shared motion-friction policy follows the full original 1.26.60.5 callback: cut each horizontal axis at `abs(velocity) <= 2^-23` before friction, retaining signed zero. A small-impulse sequence and boundary regressions cover continued drift below Java's threshold and its eventual stop. Flight uses the same policy. Ordinary vertical motion, liquid, glide and mounted stages remain separate.

History, clock, correction, and ordering regressions cover retained-frame behavior. Native world history, mixed mechanics, network conditions, and broader replay parity remain open.

Friction regressions follow registered state overlays through pack refusal, failed visual compilation, dictionary encoding, both native block layers, and world reset.
Installed direct and proxy controls retain explicit coefficients through native block-state swaps and restoration. Verified base-factory blocks without the component now use the native coefficient of 0.6. Other custom classes retain an unknown coefficient.
These controls use actual 1.26.60.6 server definitions, with no resource-pack models for the custom blocks.
Both routes preserve the server's `*` version and generator `2` through Overworld, Nether, and return transitions.
Both settings and the dictionary become unavailable during level replacement. Each replacement receives a fresh mirror, and the original block coefficients return with the Overworld.
Regressions cover wire encoding, reset replacement, disconnect, unknown generator IDs, and exact wildcard, suffix, and malformed version text.
The [boat provider controls](../../viafabricplus-bedrock/upstreamable/0025-send-completed-local-physics-to-viabedrock.pr.md) establish the bounded native version-selection path.
A stable read-only snapshot of the original 1.26.60.5 registry covers all 1,480 palette names and 23,960 finalized state caches.
Every state agrees with its type's default. The compiled coefficients match native bits for all 1,382 hardcoded types.
A regression carries vanilla coefficients through dictionary encoding and both block layers while preserving unresolved class defaults.
Geometry regressions distinguish unknown bounds, empty collision, planes, and random offsets through the version-7 dictionary and mirror lifecycle.
Nine original native component chains match all 36 primary-bound queries after encoding and decoding.
Complete installed direct and ViaProxy recordings retain geometry without visual definitions across swaps, reload, and dimension return.
The full core, add-on, and proxy builds and fresh replays pass.
Installed vanilla-coefficient checks, different-version server transfers, whole native world and actor lifecycles, nonbase physical providers, boat ticks, trajectories, and visual parity remain unverified.

Original Bedrock 1.26.60.5 Dolphin Boost kernel controls establish that the swim multiplier uses effect-marker presence, including the final zero-duration frame. The shared timeline exposes that multiplier from retained values. A regression checks actor and effect-kind isolation, the swimming gate, expiry, and restoration after clearing state. Full world scheduling at the swim-expiry boundary remains unverified.

The [owning patch](0092-retain-completed-client-prediction-frames.patch) retains implementation rationale and versioned evidence.

## Near teleports

A mode-2 MovePlayer for the client player is queued into retained history when the replay channel is negotiated, the tick is retained, the player is not riding and the float distance is below 16. It is paired with a version-3 correction marked as a teleport: position written, motion cleared, ground left to the replayed frame. Exactly 16 or more, mode 1, missing history and riding players keep the Java teleport. `NearTeleportReplayPacketTest` covers these branches from the original receiver controls. Native actor exclusion tags, the final transfer acceptance gate and the full numerical trajectory gap remain unresolved.

Shallow overlap recovery uses the original 1.26.60.5 contact kernel and ActorMove pass order. A fresh ordinary local-player capture supplies the 0.01 per-axis allowance, flags and list admission; larger policy-one fixture results are not generalized to players. Original-instruction controls cover signed faces, threshold rounding, ties and later movement away. The helper preserves ordinary clipping when no initial overlap is admitted. Installed native/add-on traces reproduce the small-overlap gap, and the rebuilt add-on now publishes the native recovered position. This checks the settled result, without claiming first-frame scheduler parity.
