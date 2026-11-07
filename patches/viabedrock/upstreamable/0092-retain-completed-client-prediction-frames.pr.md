# feat(movement): retain completed client prediction frames

## Purpose

Native 1.26.51.1 protocol 2193 packets distinguish completed fluid motion from air gravity. At eye Y 103.4815826 a native idle-water frame reports -0.022315647 blocks per tick, while the previous air approximation reports -0.0996117 for the matching translated position. Preserve a negotiated client motion sample instead of reconstructing it from rounded positions.

## Design constraints

Pair input, completed motion, item state, and authoritative frame identity. Retain correction history and ordered effects without allowing stale actor or world state into replay.

The version-4 native block dictionary carries explicit friction coefficients from resolved per-state components, independently of Java carriers and pack acceptance.
Unknown defaults remain separate from supplied coefficients. Original legacy description and cache controls establish the supported Float conversion.

The prerequisite entries in `series.json` supply actor snapshots, block dictionaries, and resolved custom-block components.

## Validation and remaining limits

Regression coverage includes `ActorMotionCommandTest`, `ActorSpatialCommandTest`, `CollisionContactTest`, `FlightMovementTest`.

History, clock, correction, and ordering regressions cover retained-frame behavior. Native world history, mixed mechanics, network conditions, and broader replay parity remain open.

Friction regressions follow registered state overlays through pack refusal, failed visual compilation, dictionary encoding, both native block layers, and world reset.
Installed direct and proxy controls retain explicit coefficients through native block-state swaps and restoration. Blocks without the component retain an unknown coefficient.
These controls use actual 1.26.60.6 server definitions and the version-4 dictionary, with no resource-pack models for the custom blocks.
Full core, add-on, and proxy builds pass. Vanilla friction defaults, native boat tick integration, trajectories, and visual parity remain unverified.

Original Bedrock 1.26.60.5 Dolphin Boost kernel controls establish that the swim multiplier uses effect-marker presence, including the final zero-duration frame. The shared timeline exposes that multiplier from retained values. A regression checks actor and effect-kind isolation, the swimming gate, expiry, and restoration after clearing state. Full world scheduling at the swim-expiry boundary remains unverified.

The [owning patch](0092-retain-completed-client-prediction-frames.patch) retains implementation rationale and versioned evidence.
