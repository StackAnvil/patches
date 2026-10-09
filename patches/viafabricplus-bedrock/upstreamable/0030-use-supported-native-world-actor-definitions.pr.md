# Native world actor definitions

Ordinary mapped entities now resolve the bundled Bedrock 1.26.51.1 client entity definition beneath accepted server packs. Supported definitions supply native geometry, textures, animation, visibility and materials. The Java entity continues to handle gameplay.

The target library's end crystal uses `animation.ender_crystal.move` and `controller.render.ender_crystal`. Its authored rotation uses lifetime and a random phase. It does not face the camera. The native draw retains server animation commands and the original Java shadow radius.

Replace the Java appearance only when every selected surface resolves. Missing queries, effect locators, equipment, sleeping, riding, unsupported materials and active crystal beams retain Java rendering. This fallback preserves features that the native world renderer cannot reproduce yet.

Targeted tests load the bundled crystal without server overrides. They cover camera independence, bottom visibility, texture resolution and unsupported override fallback. Full build and private runtime results are recorded in the release verification.

## Validation

The complete four-project build and modpack bundle pass. Core passes 1,045 tests with 30 optional skips. The add-on passes 700 tests with 120 optional skips. The cleaned patch stack replays to the same source tree. The north-star PR check also passes.
