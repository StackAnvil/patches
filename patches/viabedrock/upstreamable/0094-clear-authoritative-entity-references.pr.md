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
This change stays in ViaBedrock core and requires no add-on implementation.

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

The full core build passes with 755 tests, zero failures, and 19 skips.
The patch applies independently to pinned upstream without StackAnvil setup.
Its nine standalone tests pass with an external init script that supplies the full stack's test classpath and JUnit configuration.

The add-on build passes with 594 tests, zero failures, and 114 skips; ViaProxy also builds successfully.
Every original core file matches the add-on's bundled core, with only Loom's added Fabric metadata.
ViaProxy contains identical translator bytecode.
Both rebuilt routes reach initialization and spawn against strict BDS, then pass a real movement control.
Both recorders exit successfully, and the owned server stops.
These route controls verify integration and do not establish live guardian beam or ownership parity.

## Limits

The live BDS session observes an active guardian target and the first wither head's active target.
It does not establish an active elder guardian cycle, active cycles for the other heads, or a live tameable ownership removal.
Those paths have sequence and wire-codec coverage.
Projectile ownership transport remains a separate gap.
An existing strict-BDS capture contains small-fireball owner IDs that resolve to the corresponding blaze actors.
Java 26.3 projectile reconstruction reads the owner from spawn data, while ViaBedrock currently writes zero there.
Tameable owner metadata cannot substitute for projectile spawn ownership or later owner changes.
This change does not establish complete entity relationship or visible beam parity.
