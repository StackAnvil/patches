# Native classic lighting and vision effects

## Purpose

Use native classic lighting for accepted Bedrock Overworld and Nether sessions on direct and ViaProxy routes.
Remove Java's extra low-light vignette and preserve gradual blindness expiry with night vision.

## Design constraints

Only accepted server metadata or a direct Bedrock connection activates this pipeline.
Keep resource ownership through reload preparation, replacement, and disconnect. Reject stale completions.
Use immutable frame inputs and retire GPU resources with their owning lightmap.

For Overworld air, interpolate blindness duration within each tick.
Apply blindness dimming after night-vision normalization. Preserve alpha, infinite duration, cancellation, and void darkness.
Other dimensions, fog media, and the Darkness effect retain their existing paths.

## Validation and remaining limits

The native 1.26.51.1 scalar builder supplies the light-image calculation and its input rules.
Private GPU fixtures cover supplied light combinations, gamma, weather, and native float vectors.
Native 1.26.60.5 controls establish gradual blindness expiry and immediate cancellation.
Current native fog samples contain visibility between ticks; the original Java output advances in 0.05 increments.
Focused lighting and fog tests and the complete four-project build pass.
Fresh direct and ViaProxy recordings confirm fades between ticks, with and without night vision.
Removing blindness after 20 server ticks immediately restores the night-vision baseline. Both recordings exit normally.

End light-image inputs, enhanced lighting, resource-pack lighting overrides, exact effect timing, and full sky sampling remain open.
The [owning patch](0014-reproduce-the-native-bedrock-classic-lightmap.patch) retains implementation rationale and versioned evidence.
