# Resolve bundled native vanilla images

Bedrock servers can reference built-in images without including their pixels in downloadable packs.
The saved Bedrock 1.26.51.1 Hive stack references native bread, bucket, and potion images.
ViaBedrock supplies vanilla definitions but needs a provider for those images.

Register the typed `BuiltinResourcePackProvider` and load the matching bundled library on ViaBedrock's resource executor.
The provider works without a selected account and performs no Store authentication or package download.
A missing or damaged bundle reports an installation error instead of silently dropping built-in images.

Return native resource layers in version order, below core definitions and server packs.
Preserve exact path case and PNG, JPG, and TGA variants.
A higher native overlay can replace a lower PNG with a TGA.
Cache the projected packs and share their native byte buffers with consumers that treat the buffers as immutable.
Materialized actor storage still copies its selected files.
Synthetic manifests identify each layer without replacing native atlas or actor definitions.

Tests load real bundled images without account state and report loader failures.
They also cover layer order, exact paths, metadata exclusion, shared payload identity, extension replacement and server precedence.

Earlier licensed-cache probes resolved all 11 item images referenced by the captured Hive stack.
The saved scene reached playable spawn and rendered its tracked remote players and custom actors.
Those comparisons establish the captured scene's image resolution, not full visual parity.
The new bundled path uses the matching installed package bytes.

The four provider tests pass with the actual bundle.
The complete add-on build and test suite also pass; optional private-fixture tests remain skipped.

## Include native actor dependencies

The provider now supplies equipment definitions, geometry, animations, controllers and materials beside native images.
These layers retain native version order and remain below server packs.
Core-owned entity definitions remain excluded.
The provider includes `textures/item_texture.json` and `textures/terrain_texture.json`.
Item icons can resolve native atlas entries beneath server overrides.
The real bundle test constructs the resource stack and resolves both ordinary and emissive alpha-test families.

The extractor reads native material comments and trailing commas, then emits equivalent JSON for the runtime parser.
Empty archive placeholders and unsupported HDR and source-image files are excluded.
Build checks verify required dependencies, archive totals, checksums and exact bytes in the finished add-on JAR.
UI templates and supported UI assets remain in their separately required core bundle.

Smooth MSDF fonts and HDR panoramas still need renderer support.
Including their source files alone does not make those features work.
The current UI renderer retains its supported TrueType and Java fallback paths.

## Shared actor preparation

Actor and equipment preparation share one accepted-resource selection and parsed model library per resource generation.
The native projection previously copied about 50 MiB of textures for each request.
The projection now shares the bundle bytes and caches its pack list and actor layers.
Parsed native animation documents also remain shared when actor storage makes defensive copies.
Different server documents preserve their override order and do not enter the global native cache.
Tests cover byte identity, duplicate native layers, server provenance, inherited definitions and changed server documents.

The complete add-on suite passes 880 tests with no failures; 120 optional fixture tests remain skipped.
