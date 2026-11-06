# Retain native death text

Preserve translated DeathInfo text before Java formatting conversion and send it to negotiated native-screen clients before the Java death packet.
The payload carries the actor lifetime and the plain Java projection. Visibility changes hide or restore both representations.
Clients without both channels, and source text outside the bounded transport, keep the Java path.

Original 1.26.60.5 formatter controls establish boundary spaces, palette-colored shadows and case-sensitive codes.
Packet tests cover source retention, ordering, visibility, capability gating and oversized-source fallback.
The full 109-patch core build and Checkstyle pass: 2,148 tests pass and 176 skip.

Installed software controls use an isolated screen candidate on direct and freshly rebuilt ViaProxy routes.
Both routes pass 25 stages covering packet order, visibility, capability changes, source updates with identical Java components, and usable fallback for oversized sources.
Declared searching/ready respawn responses at the loaded spawn verify retry cancellation and source retirement across Java player replacement, followed by another death.
Complete journals retain the original bootstrap and all 26 declared Bedrock packets in order.

Screen presentation remains a separate patch. BDS respawn readiness, native activation timing, complete styled layout and native final pixels remain unverified.
