# Live skin changes through direct translation and ViaProxy

## Purpose

Apply the selected classic skin or account character in an existing world.
Use the same negotiated Java transport on both connection routes.
The previous direct path required local Bedrock storages, so ViaProxy could only retain the next-login selection.

## Target evidence

The target is Bedrock 1.26.51.1, protocol 2193, with Java 26.3.
The existing target `SkinData` codec supplies the complete native record.
The matching [preview skin schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/types/serialized-skin/) describes the nearby protocol 2192.
Target packet recordings establish the field order used here.
A local target server echoes a direct classic skin change to its sender.
Sending a packet or installing a local preview does not establish that echo.

## Behavior

The add-on registers complete appearance and result channels, then waits for core to advertise live uploads.
It sends complete classic or persona data in fragments below the Java serverbound size limit.
Capes, animated images, geometry, resource patches, persona pieces, tints and other target metadata remain in the record.
The ordinary classic geometry comes from the actual bundled native skin pack.
Loading that pack does not initialize a local translator on proxy connections.

Core selects the native local player and checks the authoritative server reply.
The add-on correlates results with the actual Java connection and request UUID.
A new selection rejects the previous request.
Disconnect and a 45-second client timeout also reject it.
That timeout allows time for upload and native confirmation.
Late replies cannot complete a request on another connection.
Character screen status also checks the current selection generation.

The local preview remains immediate.
The screen reports synchronization only after a matching native server appearance.
Core compares all appearance data and excludes only the server-owned trust flag.
Geometry comparison uses JSON values and retains the profile hash.
The old direct-only acknowledgment provider override is removed.

## Tests and limits

Targeted tests preserve every serialized classic and persona field, including animation and cape pixels.
Additional tests cover connection ownership, replacement, timeout cleanup, disconnect and real bundled geometry parsing.
Core tests cover upload bounds, native actor identity, ordering, malformed records, failed sends and authoritative confirmation.
The full stack passes 3,040 tests, with 152 optional skips and no failures.
The add-on passes 1,117 tests, with 73 optional skips.
All 1,202 compiled client classes match the packaged add-on.

Fresh direct and ViaProxy sessions each send a classic skin with a cape and a complete persona record to BDS 1.26.51.1.
Both production requests receive confirmed results on each route.
Independent packet comparison verifies the native local actor, every image pixel, all metadata and the profile hash.
The classic and persona records contain 78,454 and 142,192 bytes before the server reformats geometry and selects trust.
The body images are 128 by 128 pixels.
The persona includes a valid animated-face binding, one animated image, one piece and four tint channels.
Runtime JAR hashes match the verified build.
Screenshots show the local skins and capes on both routes.
These are controlled fixtures, without account writes or a native graphical baseline.

Account writes, purchases, remote-client appearance, complete native rendering and animation timing require separate evidence.
The controlled skin fixtures do not establish those behaviors.
