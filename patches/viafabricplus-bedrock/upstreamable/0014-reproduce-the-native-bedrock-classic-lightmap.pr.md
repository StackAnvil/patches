# Native classic lighting and vision effects

## Purpose

Use native classic lighting for accepted Bedrock Overworld and Nether sessions on direct and ViaProxy routes.
Remove Java's extra low-light vignette and preserve gradual blindness expiry with night vision.

## Design constraints

Only accepted server metadata or a direct Bedrock connection activates this pipeline.
Keep resource ownership through reload preparation, replacement, and disconnect. Reject stale completions.
Use immutable frame inputs and retire GPU resources with their owning lightmap.

For Overworld air, retain tick-based blindness dimming and attenuate night-vision strength by the same squared visibility.
Cap reciprocal brightness at 255. Preserve alpha, infinite duration, cancellation, and void darkness.
Other dimensions, fog media, and the Darkness effect retain their existing paths.

## Validation and remaining limits

The native 1.26.51.1 scalar builder supplies the light-image calculation and its input rules.
Private GPU fixtures cover supplied light combinations, gamma, weather, and native float vectors.
Synchronized native 1.26.60.5 Fancy color and distance controls establish 19 expiry steps at noon and midnight.
Native updates remain tick-based. The combined blend creates fractional color values; these do not establish interpolation between ticks.
The verified blend matches every native expiry step within 0.000002, including the gain cap at low brightness.
Blindness alone and the distance curve match the existing Java calculation.
The complete add-on build and its core dependencies pass.
Fresh direct and ViaProxy renderer samples match the native expiry curve within 0.00001 RGBA, including low-brightness gain limits.
The recordings verify cancellation after 20 server ticks and restoration of the pack's ordinary fog range. Both exit normally.

End light-image inputs, enhanced lighting, resource-pack lighting overrides, other effect combinations, and full sky sampling remain open.
The [owning patch](0014-reproduce-the-native-bedrock-classic-lightmap.patch) retains implementation rationale and versioned evidence.
