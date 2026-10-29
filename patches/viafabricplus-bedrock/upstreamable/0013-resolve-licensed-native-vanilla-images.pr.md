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

## World-version resource selection

The provider now receives the world cutoff from core. The shared raw vanilla
library creates immutable selected views before applying server overrides.
A bounded cache retains four views. An older view keeps its complete source,
so selecting a newer world restores later layers.

Accepted native archive format 2 supplies the same cutoff on direct and
ViaProxy paths. Actor storage, geometry, graphs, sounds, particles, and captions
retain it. Effect caches compare the whole accepted archive identity. Missing
world context selects the existing fallback instead of guessing latest vanilla.
Account-owned skin and emote assets remain independent of world version.

The [core evidence](../../viabedrock/upstreamable/0068-resolve-licensed-native-image-fallbacks.pr.md)
records BDS 1.26.60.6 packet inputs and Microsoft's selection rules.
New regressions switch texture bytes, sound definitions, and animation poses
together across newer/older/newer worlds. They also cover server priority,
earlier view immutability, cache eviction, absent context, and resource-manager
reuse with changed archive context. These are runtime/fixture checks.
Native and direct Java current/1.20.0/current controls now select matching baby-cat geometry, textures, script scales, and palette state.
The [world renderer](0030-use-supported-native-world-actor-definitions.pr.md) supplies the missing cat engine variables and verified tint materials.
Exact pose timing, shadows, and natural AI positioning remain separate acceptance work.

Native 1.26.60.5 and direct Java PCM captures establish sound selection across the same resource transitions.
`cauldron.explode` selects the current splash sample, an older explosion sample, then the splash sample again.
Normalized waveform correlations exceed 0.995 against the decoded bundled samples.
Sealed journals retain each connection's cutoff and sound request.

Two server packs supply different WAV files at the same vanilla sound path.
Native and direct Java select the first pack's 500 Hz sample in current and 1.20.0 worlds.
The second pack's 1320 Hz sample and the lower vanilla FSB do not win.
ViaProxy accepts the 1.20.0 context and selects the same first-pack WAV.
Native and direct reconnects without these packs restore the vanilla splash sample.

These captures use copied client profiles and a private PipeWire server with only a null sink.
They establish sample selection, server priority across formats, and retirement of server overrides.
They do not establish equal gain, attenuation, captions, looping, or broader mixing behavior.
PCM, licensed samples, pack fixtures, and journals remain private.
