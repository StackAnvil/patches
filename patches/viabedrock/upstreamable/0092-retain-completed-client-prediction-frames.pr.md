# feat(movement): retain completed client prediction frames

## Purpose

Native 1.26.51.1 protocol 2193 packets distinguish completed fluid motion from air gravity. At eye Y 103.4815826 a native idle-water frame reports -0.022315647 blocks per tick, while the previous air approximation reports -0.0996117 for the matching translated position. Preserve a negotiated client motion sample instead of reconstructing it from rounded positions.

## Design constraints

Pair input, completed motion, item state, and authoritative frame identity. Retain correction history and ordered effects without allowing stale actor or world state into replay.

The version-6 native block dictionary carries native vanilla coefficients and explicit friction from resolved per-state components.
Both remain independent of Java carriers and pack acceptance. Defaults apply only to hardcoded types from the pinned palette.
Server-defined vanilla types and custom registrations retain an unknown default. Original legacy description and cache controls establish the supported Float conversion.

World resets carry the exact base-game version text and signed generator ID from `StartGame` with dimension and terrain bounds.
Consumers read both fields from one immutable reset. Unknown generator IDs retain their original values.
The mirror replaces these settings with each reset and clears them on disconnect. Resource cutoffs and client protocol versions remain separate inputs.

The prerequisite entries in `series.json` supply actor snapshots, block dictionaries, and resolved custom-block components.

## Validation and remaining limits

Regression coverage includes `ActorMotionCommandTest`, `ActorSpatialCommandTest`, `CollisionContactTest`, `FlightMovementTest`.

History, clock, correction, and ordering regressions cover retained-frame behavior. Native world history, mixed mechanics, network conditions, and broader replay parity remain open.

Friction regressions follow registered state overlays through pack refusal, failed visual compilation, dictionary encoding, both native block layers, and world reset.
Installed direct and proxy controls retain explicit coefficients through native block-state swaps and restoration. Custom blocks without the component retain an unknown coefficient.
These controls use actual 1.26.60.6 server definitions and the version-6 dictionary, with no resource-pack models for the custom blocks.
Both routes preserve the server's `*` version and generator `2` through Overworld, Nether, and return transitions.
Both settings and the dictionary become unavailable during level replacement. Each replacement receives a fresh mirror, and the original block coefficients return with the Overworld.
Regressions cover wire encoding, reset replacement, disconnect, unknown generator IDs, and exact wildcard, suffix, and malformed version text.
The [boat provider controls](../../viafabricplus-bedrock/upstreamable/0025-send-completed-local-physics-to-viabedrock.pr.md) establish the bounded native version-selection path.
A stable read-only snapshot of the original 1.26.60.5 registry covers all 1,480 palette names and 23,960 finalized state caches.
Every state agrees with its type's default. The compiled coefficients match native bits for all 1,382 hardcoded types.
A regression carries vanilla coefficients through dictionary encoding and both block layers while preserving unknown custom and server-defined defaults.
The full 109-patch core build passes. Earlier full add-on and proxy builds and installed controls cover explicit custom friction and world settings.
Installed vanilla-coefficient checks, different-version server transfers, whole native world and actor lifecycles, primary collision shapes, boat ticks, trajectories, and visual parity remain unverified.

Original Bedrock 1.26.60.5 Dolphin Boost kernel controls establish that the swim multiplier uses effect-marker presence, including the final zero-duration frame. The shared timeline exposes that multiplier from retained values. A regression checks actor and effect-kind isolation, the swimming gate, expiry, and restoration after clearing state. Full world scheduling at the swim-expiry boundary remains unverified.

The [owning patch](0092-retain-completed-client-prediction-frames.patch) retains implementation rationale and versioned evidence.
