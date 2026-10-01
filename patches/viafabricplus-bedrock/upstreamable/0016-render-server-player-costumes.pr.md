Render server minecraft:player overrides against native actor properties, including costume geometry, materials, UV animation and controller playback. CubeCraft uses these definitions for hats, gloves, shoes and back accessories.

Validation: controller and supplied skin geometry regressions pass, together with the full addon test suite. Private recorded scene replay exercises the actual client renderer without another public connection. Active unresolved assets remain visible as failures.


Server player sound aliases now bind to the effective server pack stack. The shared sound library keeps catalog overrides and supported sample files in bottom-to-top order. Sample files can remain in a lower pack when a higher pack replaces their event definition. File, total byte, and entry limits apply before graph construction.

Controller particle effects, selection of costume locators, and unavailable native sample references remain incomplete. The muted Java runtime test passes with private synthetic server packs and licensed samples. It verifies catalog overrides across packs, sample fallback, and actual PCM channel playback.

Controller state sounds now use the shared actor alias and PCM path. A muted client test loads the controller through the production server player factory. It verifies actual sound channels, suppressed entry scripts without later playback, state reentry, and duplicate frames. Source gain stays at zero.

## Server particle resources

Resolve particle definitions with the server's sound resources in pack order. Retain referenced PNG and TGA textures from every layer so an upper texture can replace a lower definition's image. Keep unrelated textures outside this effect library. Apply the existing resource size and file limits to definitions and images together.

A targeted test changes the emission count through an identifier override and replaces a lower PNG with an upper TGA. Runtime component admission and emitter playback belong to the Character Creator patch.
