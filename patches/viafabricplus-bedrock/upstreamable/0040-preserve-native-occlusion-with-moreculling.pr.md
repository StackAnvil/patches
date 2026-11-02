# fix(blocks): preserve native occlusion with MoreCulling

## Purpose

Keep the terrain beneath Bedrock beds visible when MoreCulling derives an opaque face from the converted model.
Use the existing native face occlusion while accepted Bedrock metadata owns the world.
Preserve MoreCulling's cache and ordinary Java behavior outside that context.

## Design constraints

This optional integration requires the custom block face hooks and accepted rendering metadata.
It changes the face query without disabling MoreCulling or altering its global settings.
The mod remains optional and adds no compile dependency.

## Validation and remaining limits

The pinned Fabulously Optimized profile includes MoreCulling 1.9.0-beta.1 and Sodium 0.9.2 on Java 26.3.
With BDS 1.26.60.6/protocol 2225, the live bed has an empty occlusion face and MoreCulling caches a full bottom face.
Disabling block-state culling and rebuilding the affected sections restores the stone floor.
Enabling the same setting and rebuilding reproduces the hole without changing the final block states.

BedrockBlockOcclusionTest covers both bed halves, solid neighbors, and entry into and exit from the accepted context.
Official Bedrock 1.26.60.5 keeps the stone floor visible beneath the same bed in the same BDS scene.
Rebuilt direct and ViaProxy clients preserve that floor with the complete graphics modpack and MoreCulling enabled.
Both live probes retain the host's full cached face while the adapted bed face remains empty.
The stone neighbor retains a full face.
An installed ViaProxy resource reload completes with the floor still visible and the same query results.
A current plain client without MoreCulling also reaches gameplay and retains the floor.
Other models, graphics mod combinations, and complete native visual parity remain open.
The original oversized-shield and custom-skin pose reports remain unresolved.

The [owning patch](0040-preserve-native-occlusion-with-moreculling.patch) records the implementation rationale.
