# feat(movement): retain completed client prediction frames

## Purpose

Native 1.26.51.1 protocol 2193 packets distinguish completed fluid motion from air gravity. At eye Y 103.4815826 a native idle-water frame reports -0.022315647 blocks per tick, while the previous air approximation reports -0.0996117 for the matching translated position. Preserve a negotiated client motion sample instead of reconstructing it from rounded positions.

## Design constraints

Pair input, completed motion, item state, and authoritative frame identity. Retain correction history and ordered effects without allowing stale actor or world state into replay.

Prerequisites:

- viabedrock/0018-preserve-sparse-actor-spatial-updates.patch: Retain complete received spatial state before local-control admission. The registered vehicle comparisons require this cache independently of the live actor pose.

## Validation and remaining limits

Regression coverage includes `ActorMotionCommandTest`, `ActorSpatialCommandTest`, `CollisionContactTest`, `FlightMovementTest`.

History, clock, correction, and ordering regressions cover retained-frame behavior. Native world history, mixed mechanics, network conditions, and broader replay parity remain open.

The [owning patch](0092-retain-completed-client-prediction-frames.patch) retains implementation rationale and versioned evidence.
