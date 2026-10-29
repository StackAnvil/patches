# feat(entity-events): translate Bedrock actor events to Java statuses

## Purpose

Forward supported actor feedback through the current Java 26.3 status packet so taming, shaking, breeding, and other entity effects appear in the client. Preserve damage and death handling, add the missing non-player death effect, and cancel events without a translated output. Keep the mapping in a switch so unsupported Bedrock events remain explicit.

## Design constraints

Preserve sparse native event IDs, actor lifetime, and ordered fishing feedback. Keep unsupported outputs explicit rather than substituting unrelated Java effects.

## Validation and remaining limits

Regression coverage includes `NativeFishingEventTest`, `NativeParticleRangeTest`, `EntitySoundTest`, `EntityPacketsTest`.

Native fishing controls establish selected bite, wake, tease, and distance paths. Other actor feedback and complete audiovisual parity remain unverified.

The [owning patch](0001-translate-bedrock-actor-events-to-java-statuses.patch) retains implementation rationale and versioned evidence.
