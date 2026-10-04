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
