# Synchronize authoritative entity references

## Behavior

ViaBedrock skips explicit empty owner and attack-target updates in the pinned upstream base.
After a populated update, Java therefore retains the previous owner UUID, guardian beam target, or wither head target.

The translator now emits the Java empty value when Bedrock clears these fields.
Tameable owners use a null optional UUID.
Guardian attack targets and all three wither head targets use Java entity ID zero.
Elder guardians share the guardian translation.
Known targets still resolve through the entity tracker, without truncating native actor IDs.
An unavailable target clears the Java value immediately while the native reference remains available.
Indexed dependencies restore the reference after the target's Java spawn packet.
Target removal clears dependent metadata and retains the native ID for a later return.
A returning actor resolves to its new Java entity ID or UUID.
Explicit clearing, reference replacement, source removal, and respawn preparation discard obsolete bindings.
Multiple changed fields on one source share one metadata packet.
The dependency index avoids scanning every actor on each spawn.
Metadata translation and known projectile owner spawning stay in ViaBedrock core.
Later projectile changes use the independently advertised `viabedrock:projectile_owner_v1` channel.
The add-on applies those owners when Java entities become available.
The core also provides the frontend dependency index and bounded wire codec.
Ordinary Java clients receive the standard owner spawn field.

## Target evidence

An official BDS 1.26.51.1 session, build 51061372 and protocol 2193, supplies the reference values.
Its guardian target changes from zero to actor ID `-231928233983`, then back to zero.
Its first wither head target changes from minus one to actor ID `-231928233974`, then back to minus one.
The elder guardian's default target is zero.
All three wither heads default to minus one, and an untamed wolf's owner defaults to minus one.

These observations establish different empty values for guardian and wither targets.
Large negative values are valid actor IDs, so a general negative-ID check would discard real targets.
Java 26.3 client bytecode confirms that guardian target zero clears the active target and that wither targets use Java entity IDs.
Raw server traffic, command logs, and client inspection files remain private.

## Verification

The original three sequence regressions fail before the clearing fix and pass afterward.
They exercise real entity updates and the entity tracker, then serialize every result through the Java 26.3 metadata codec.
The sequences cover guardian and elder guardian bind/clear/restore, independent clearing of all wither heads, and owner clear/reassignment.
They also retain the large negative native IDs from the BDS observation.
Six additional regressions cover late arrival, target unload and return, coalesced wither updates, owner UUID changes, superseded references, source replacement, and respawn cleanup.
The real actor packet handler test verifies that Java spawning precedes dependent metadata.
Repeated spawn notifications do not emit duplicate reference updates.

The full core build passes with 765 tests, zero failures, and 19 skips.
The patch applies independently to pinned upstream without StackAnvil setup.
Its nineteen standalone tests pass with an external init script that supplies the full stack's test classpath and JUnit configuration.

The add-on build passes with 594 tests, zero failures, and 114 skips; ViaProxy also builds successfully.
Every original core file matches the add-on's bundled core, with only Loom's added Fabric metadata.
ViaProxy contains identical translator bytecode.
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

The live BDS session observes an active guardian target and the first wither head's active target.
It does not establish an active elder guardian cycle, active cycles for the other heads, or a live tameable ownership removal.
Those paths have sequence and wire-codec coverage.
An existing strict-BDS capture contains small-fireball owner IDs that resolve to the corresponding blaze actors.
Java 26.3 projectile reconstruction reads the owner from spawn data.
The translator now supplies that field when the owner exists.
ViaVersion groups fireballs separately from its projectile metadata family, so the owner check covers both families.
Java has no standard packet for later owner changes.
A capable client receives clearing, delayed resolution, reassignment, unload, and return updates on the new channel.
Per-spawn Java UUIDs prevent native actor-ID reuse from binding replacement projectiles.
A local-player marker resolves the actual client player when the Java and translated UUIDs differ.

Eight additional regressions exercise actual spawning across seven projectile families and owner channel registration.
They also cover both frontend arrival orders, removal after lookup deletion, source replacement, explicit clearing, and malformed payloads.
Known owners use real Java spawn data; updates pass through the ownership codec.
Late updates and fishing bobber lifecycle require the companion add-on integration.
Visible native comparisons, fishing behavior, pickup, return, and complete projectile action behavior remain required.
This change does not establish complete entity relationship or visible beam parity.

## Fishing targets

BDS 1.26.51.1, build 51061372 and protocol 2193, supplies fishing-hook TARGET updates after genuine rod input.
A new hook sends zero, then sends the hooked cow's signed actor ID.
The original translator ignores that update, and the actual Java hook retains `HOOKED_ENTITY=0`.
Java 26.3 decodes a positive hooked value as Java entity ID plus one.
The core now translates that reference through its existing dependency index.
Target removal clears the Java attachment even when Bedrock retains the native TARGET value.
Late arrival and returning targets resolve after Java spawning.
Explicit clearing, replacement, and hook removal detach obsolete bindings.
No client channel is required for this metadata translation.

Two additional sequence regressions exercise offset encoding, late arrival, unload, return, explicit clearing, replacement, and source removal.
They serialize the translated results through the Java metadata codec.
The updated patch applies independently to pinned upstream, and all nineteen targeted tests pass there.

Rebuilt direct and ViaProxy clients each perform genuine water and entity casts, target removal, and reeling against strict BDS.
Read-only client observers record actual hooked cow objects, the correct Java offset, and clearing after native target removal.
Reeling removes each hook and clears the local player's fishing pointer.
The live clients use the add-on on both routes.
The target translation requires only standard Java metadata and adds no client code.
The reviewed nine artifact replacements preserve all 26 unrelated distribution and Maven files.
Rollback copies remain outside the active artifact directories.
Native bite effects, rewards, live-target retrieval, interrupted use, and visible native comparisons remain required.
