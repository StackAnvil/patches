# Inherit client entity fields across resource-pack layers

## Behavior

Resolve descriptions by client entity identifier in the existing bottom-to-top pack order.
Merge objects by key. Higher arrays and scalar values replace lower values.
This preserves an omitted animation alias or script field while allowing a higher layer to override another field.
Parse converter data from the merged description.
Publish its raw snapshot only after the converter parser succeeds.
Callers receive independent copies, including fields outside the converter data model.

The core owns this resolution for direct and ViaProxy connections.
The add-on reads the effective core description for server graphs. Its licensed reader shares the public core merger across its Gson boundary.
Attachable descriptions retain their existing reader; their layer semantics need separate native evidence.

## Target evidence

The reference is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Three isolated native runs use authored right-arm and left-arm animations.
An upper player definition omits animation roots and overrides script scale from 0.9375 to 0.875.
The native root uses 0.875 while both lower poses survive.
Another upper definition replaces only the right-arm alias.
Native posed bone translations become right `[8, 15, 10]` and left `[1, 18, -1]`.
The lower `scripts.animate` list and untouched left alias therefore survive that override.
Native model bones already include the 24-pixel bind origin.
Runtime probes, authored fixtures, packages, and captures remain private.

This evidence establishes the tested alias and script inheritance.
It does not establish every description field, duplicate identifiers within one pack, or attachable inheritance.

## Testing

Three regression tests cover partial overrides, inherited roots, explicit empty lists, parsed aliases, and independent snapshots.
The patch supplies the dependencies needed to execute these tests on clean upstream.
Clean upstream on Java 17 passes all three regression tests and Checkstyle.
The complete dependency build passes 1,012 tests with 115 optional skips and no failures or errors.
The shared server actor reader and hand coordinate tests also run in the full stack.
Direct and ViaProxy replays retain the complete selected 75-second native packet prefix.
Their Minecraft hand-entry probes select two independent surfaces and reproduce both native bone translations and scale.
The fixture defines only first-person controllers, so the generic third-person avatar check reports no avatar draw.
That result is recorded separately from the passing hand probe and transport checks.
Matched native and Java viewport masks place the standing fixture within one pixel on both routes. Lighting, movement, equipped items, and full visible parity remain unfinished.
