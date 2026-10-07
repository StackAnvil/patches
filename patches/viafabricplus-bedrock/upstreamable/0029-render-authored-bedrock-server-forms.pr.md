## Purpose

Render server-authored Bedrock form scenes after ViaBedrock resolves pack definitions, variables, bindings and response actions. Keep each original form ID and button index. Use the existing Java click-action response path and a negotiated client payload.

The renderer uses accepted pack textures and bundled licensed UI definitions. Opening a form does not start another asset download or require a local Bedrock installation. Ordinary Java controls remain the fallback when a visible control, texture or dimension cannot be rendered.

## Behavior

- Keep authored control hierarchy, anchors, signed offsets, stack and grid layouts, content dimensions, layers and clipping.
- Draw labels, accepted pack images and symmetric nine-slice borders. Select authored default, hover and locked visual branches.
- Play resolved alpha tracks, including initially transparent cards and hover branch reentry.
- Keep hidden controls in layout while excluding their rendering and hits. Do not compact hidden grid cells without evidence from the native layout cache.
- Use Java focus, narration, tooltips, keyboard navigation and pointer handling. Provide bounded vertical and horizontal scrolling with proportional, draggable thumbs.
- Reject stale-connection responses and send at most one response from a screen.

## Evidence and limits

Research uses the pinned official 1.26.51.1 native executable and actual captured resource-pack definitions. Original native controls bind scalar/equal-four-side nine-slice parsing, missing-template child omission, grid rescaling ratios, dimension token parsing and child/peer dependency enumeration. These results do not establish full native pixel layout or hidden metric cache behavior.

The Java layout solver still uses bounded iterative measurement. Its mixed-template grid extents, zero maximum-size sentinel, proportional scrollbar geometry and polynomial alpha easing need further native consumer comparison. Native font-size metrics, asymmetric nine-slice side order, size/UV/color tracks, loop behavior and named next-animation chains remain open. Authored final static dimensions remain usable when a size animation is present.

## Asset pipeline boundary

The addon provider can supply bundled `ui/*.json` definitions and textures to the core when its optional `builtin_ui.zip` is absent. The current five tracked addon asset ZIPs contain zero `ui/` entries, however. Expanding the producer whitelist does not add definitions to those existing bundles. A default CI build without the optional core UI ZIP therefore still lacks the native baseline templates. Server packs that depend on them may use ordinary form controls instead.

The provider currently reads only its packaged, version-checked asset library. It does not acquire missing UI definitions from a Microsoft Store session or a versioned runtime package cache. If the entire addon asset bundle is absent, its loader throws instead of returning an empty layer. These are separate pipeline and graceful-loading gaps. The verified private core candidate includes the official UI baseline; its successful build is not evidence that default CI has that baseline.

## Verification

- Sixteen targeted scene, layout, presentation, scrollbar and alpha tests cover anchors, sparse original actions, clipping, hidden siblings, grid rescaling, content measurement, drag clamps, resize and branch reentry.
- Private probes parse and lay out Loot, Lobby, Wardrobe and Game Selector scenes against actual captured pack files. Their form inputs are synthetic and do not claim actual wire or native screenshot parity.
- The complete 31-patch replay and declared Gradle test, check and build gates pass: 632 tests, 117 skipped, no failures or errors. This project declares no Checkstyle task.
- The immutable reviewed core has SHA-256 `8d72943d7104b6a7d19da12af2e4e68fde1402fbe4e2e7c507f64808b320ad2e`. The addon candidate has SHA-256 `96b5785f5d0e785c8b0c030f48b640eef650f83a6a97ef9f446413583d0b4012`; all 1,272 embedded core file entries match, excluding the manifest and the Loom-added module descriptor. Detailed evidence remains private. No credentials, captures, screenshots, bundled official assets or private paths are added to this patch.

Actual client menu rendering, resource reloads and Iris routes must be checked with the final candidate before deployment.
