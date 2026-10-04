Render server minecraft:player overrides against native actor properties, including costume geometry, materials, UV animation and controller playback. CubeCraft uses these definitions for hats, gloves, shoes and back accessories.

Validation: controller and supplied skin geometry regressions pass, together with the full addon test suite. Private recorded scene replay exercises the actual client renderer without another public connection. Active unresolved assets remain visible as failures.


Server player sound aliases now bind to the effective server pack stack. The shared sound library keeps catalog overrides and supported sample files in bottom-to-top order. Sample files can remain in a lower pack when a higher pack replaces their event definition. File, total byte, and entry limits apply before graph construction.

Controller particle effects, selection of costume locators, and unavailable native sample references remain incomplete. The muted Java runtime test passes with private synthetic server packs and licensed samples. It verifies catalog overrides across packs, sample fallback, and actual PCM channel playback.

Controller state sounds now use the shared actor alias and PCM path. A muted client test loads the controller through the production server player factory. It verifies actual sound channels, suppressed entry scripts without later playback, state reentry, and duplicate frames. Source gain stays at zero.

## Server particle resources

Resolve particle definitions with the server's sound resources in pack order. Retain referenced PNG and TGA textures from every layer so an upper texture can replace a lower definition's image. Keep unrelated textures outside this effect library. Apply the existing resource size and file limits to definitions and images together.

A targeted test changes the emission count through an identifier override and replaces a lower PNG with an upper TGA. Runtime component admission and emitter playback belong to the Character Creator patch.

Missing particle images no longer abort the player graph. The saved CubeCraft
1.26.51.1 pack includes an unused emitter with texture `_`. The library retains
safe relative references and returns no image when that file is absent. Path
traversal checks and resource limits still apply. Runtime support for particle
components and materials stays separate.

All nine resource library tests pass with the private fixtures. They cover
missing placeholders, supported emission, image lookup and traversal rejection.
Retain root `sounds.json` in the bounded server effect library. Particle sound events use its generic configurations before catalog lookup. The pack override test resolves an upper configuration and decodes its sample from a lower pack. This tests Java resource precedence and playback parameters; native server playback remains outside this check.


### Shared actor visibility

Server actor resource selection now retains render-controller JSON alongside sounds and particles. The actor graph can evaluate primary-model visibility in its animation variable scope. Pack overrides retain their native order. A targeted test verifies that the higher pack changes the selected hand and that first-person context changes the same scope. This broadens the existing server resource loader and reuses the licensed graph evaluator. It does not complete native camera or held-item transforms.


### WAV actor samples

Include loose WAV files in the bounded server effect library. This lets actor aliases and particle sound events use the shared WAV decoder. The layered effect test now resolves and decodes a lower-pack WAV after an upper configuration override. The full build passes. This file-selection check does not establish audible actor parity.


### Particle caption resources

Retain pack language files with server effect catalogs, so local particle sound captions receive the same translation ordering as their definitions. Effect-library tests select level-sound metadata separately from sample decoding. Proxy actor/effect graph transport remains incomplete; the shared sound resource transport is independent of that gap.

## Shared effect selection

Direct server actors now select audio, captions, particle definitions, controllers, and images through the core resource APIs. Preserve empty source indexes and texture-only overrides. Resolve a definition's texture when that definition is used; an unused invalid reference does not prevent unrelated effects from loading. Targeted tests verify ordinary overlays, missing textures, and rejected escaping references. This does not complete native actor state transport through ViaProxy.

## Costume resources through ViaProxy

Player costume selection now reads the accepted actor resource snapshot on both routes. Preserve the source pack's server provenance, so transported built-in definitions do not become server overrides. The same animation, geometry, material, and controller loaders serve direct and proxy connections. This resource path does not provide missing actor state or account synchronization.

## Animated persona visibility under costumes

Apply the server controller's body visibility to persona surface drawing as well as the base skin. The recorded target persona has a separate animated face image and model. The native client hides that original face when the server costume replaces the body. Java previously continued drawing it over the costume's head.

Persona surfaces remain visible when the original body is selected. This change affects third-person drawing. First-person hands, additional visibility combinations, and resource or world transitions still require native comparisons.

Final direct and ViaProxy screenshots show the costume's uniform head without the persona face overlay. Both retain the green wings without duplicate chest armor. The chunk request correction also restores the recorded ground on both routes. Camera angle, lighting, complete animation timing, original-body restoration, and additional persona visibility combinations remain unverified.

## Transported player properties

Costume selection now reads immutable core snapshots on direct connections and ViaProxy.
Named property queries, variants, charging, and spell color use the shared actor registry.
The renderer no longer retains a direct Bedrock player object.
World and disconnect cleanup release actor inputs.
Complete animation timing, actor events, and account synchronization remain open.

**Recorded-scene verification:** Matching native capture `2026-10-04T14-17-15.690Z-record-local` supplies the property changes and dimension round trip.
Direct playback `2026-10-04T14-42-19.663Z-replay-scene` and ViaProxy playback `2026-10-04T14-38-50.359Z-replay-scene` preserve the complete scene payload hash.
Both load the accepted pack without a frontend Store account.
Each route receives 587 actor updates.
All message fields match after connection-specific UUIDs, lifetime tokens, and timestamps are excluded.
The local property sequence is orange, blue, orange, and blue.
The bool, int, enum string, and float retain their values and types.
Both routes remove and restore local inputs at each dimension change.
Final screenshots show the grounded blue costume and green equipment on both routes, consistent with the native selection.
Camera framing, lighting, full animation timing, and broader lifecycle behavior remain unverified.

## Command graphs for classic players

Server costumes retain the existing first-person hand path.
Their body resource selection does not yet resolve the selected native hand surfaces.
The shared first-person actor renderer therefore admits classic and persona appearances only until costume selection supports that view.

A classic player without a server costume can load the accepted built-in player graph when an animation command arrives.
The renderer reevaluates graph demand after an earlier lookup without commands.
The resource cache retains server provenance separately from graph availability.
Built-in player definitions therefore remain ordinary skin resources and do not become costume overrides.
Players without commands or server overrides retain their existing renderer selection.

A targeted resource test loads built-in command resources after an earlier lookup without commands, then samples their production graph.
It also checks server provenance and resource-cache replacement.
Native command playback remains part of the shared actor graph patch.
