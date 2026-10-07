# Apply authoritative projectile owner changes

## Behavior

The client advertises `viabedrock:projectile_owner_v1` and consumes core-resolved owner updates.
This works through direct connections and ViaProxy.
ViaBedrock supplies standard spawn data for known owners and retains unresolved native references.
The add-on calls Java's normal owner setter after checking each projectile's spawn UUID and the owner's UUID.
Local-player targets require the actual current player instance.

The shared core registry handles either arrival order, owner removal, and owner return without scanning every entity.
Client tracking callbacks also cover chunk unloading.
Disconnects and world replacement clear the index and invalidate queued updates.

Java fishing bobbers discard themselves when their player owner is unavailable.
On a Bedrock connection, the client retains those pending bobbers for the authoritative server removal.
The client clears the prior player's fishing pointer before reassigning the bobber.
Normal Java connections retain their existing discard behavior.

## Evidence and dependency

This patch consumes the wire codec and reference index in ViaBedrock's entity reference change.
Actual BDS 1.26.51.1 traffic, build 51061372 and protocol 2193, contains blaze-owned small fireballs with full-width negative owner IDs.
Java 26.3 bytecode confirms owner reconstruction from spawn data and the absence of a later standard owner packet.
It also confirms the fishing bobber discard checks and player pointer update.
Raw traffic and bytecode inspection files remain private.

## Verification

The core's seventeen targeted regressions pass on the full stack and on pinned upstream.
They cover spawn data, late registration, both frontend arrival orders, owner replacement, removal, source replacement, and malformed payloads.
The full core build reports 763 tests, zero failures, and 19 skips.
The add-on build reports 594 tests, zero failures, and 114 skips.
ViaProxy builds successfully.
All original core files match the add-on bundle, apart from Loom's added Fabric metadata.
All core class files match ViaProxy.

Both rebuilt routes reach initialization and spawn against strict BDS 1.26.51.1, build 51061372, protocol 2193.
Movement, incoming small-fireball contact, and fireball reflection pass on each route, for six controls in total.
A read-only observer runs on each Java client's main thread.
It records the same fireball changing from an unavailable owner to the actual local player.
The corresponding BDS metadata changes OWNER from the ghast's full-width negative ID to the player's native ID.
The fixture removes each shooter after accepting its launch; client observations retain an unavailable owner afterward.
Both recorders exit successfully, and the owned server stops.
The reviewed nine artifact replacements preserve all 26 unrelated distribution and Maven files.
Rollback copies remain outside the active artifact directories.
These observations verify the sampled owner update through direct and ViaProxy connections.
Known-owner spawn fields have production packet coverage; these live controls use the add-on on both routes.

## Limits

These tests do not establish native visible fishing parity, projectile pickup, return, deflection physics, or complete combat behavior.
The native GPU safety guard remains enabled while host graphics recovery is unverified.
