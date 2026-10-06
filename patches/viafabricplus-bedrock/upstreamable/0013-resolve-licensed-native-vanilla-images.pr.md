# Resolve bundled native vanilla images

Bedrock servers can reference built-in images without including their pixels in downloadable packs.
The saved Bedrock 1.26.51.1 Hive stack references native bread, bucket, and potion images.
ViaBedrock supplies vanilla definitions but needs a provider for those images.

Register the typed `BuiltinResourcePackProvider` and load the matching bundled library on ViaBedrock's resource executor.
The provider works without a selected account and performs no Store authentication or package download.
A missing or damaged bundle reports an installation error instead of silently dropping built-in images.

Return image-only layers in native order, below bundled definitions and server packs.
Preserve exact path case and PNG, JPG, and TGA variants.
A higher native overlay can replace a lower PNG with a TGA.
Copy pixels so mutable resource-pack content cannot alter the shared native library.
Synthetic manifests identify each layer without replacing native atlas or actor definitions.

Tests load real bundled images without account state and report loader failures.
They also cover layer order, case-sensitive paths, metadata exclusion, pixel isolation, extension replacement, and server precedence.

Earlier licensed-cache probes resolved all 11 item images referenced by the captured Hive stack.
The saved scene reached playable spawn and rendered its tracked remote players and custom actors.
Those comparisons establish the captured scene's image resolution, not full visual parity.
The new bundled path uses the matching installed package bytes.

The four provider tests pass with the actual bundle.
The complete add-on build and test suite also pass; optional private-fixture tests remain skipped.
