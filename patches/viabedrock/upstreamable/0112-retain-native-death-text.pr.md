# Retain native death text

Preserve translated DeathInfo text before Java formatting conversion and send it to negotiated native-screen clients before the Java death packet.
The payload carries the actor lifetime and the plain Java projection. Visibility changes hide or restore both representations.
Clients without both channels, and source text outside the bounded transport, keep the Java path.

The target gameplay formatter preserves spaces at formatting boundaries, uses palette-colored shadows, and treats code spelling differently from Java styles.
Original formatter controls establish these input requirements. Packet tests retain exact source text, ordering, visibility changes, capability gating and oversized-source fallback.
The full 109-patch core build and Checkstyle pass with the versioned UI bundle: 2,148 tests pass and 176 skip.
Packet controls cover the negotiated payload and unchanged Java fallback. They do not establish installed native-screen parity.

The add-on receiver, source association and complete native screen rendering remain separate integration work.
