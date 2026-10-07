## Purpose

Render server-authored Bedrock form scenes after ViaBedrock resolves pack definitions, variables, bindings and response actions. Keep each original form ID and button index. Use the existing Java click-action response path and a negotiated client payload.

The renderer uses accepted pack textures and bundled licensed UI definitions. Pack paths use accepted textures; public HTTPS image URLs load asynchronously without account credentials or another package acquisition. No local Bedrock installation is required. Ordinary Java controls remain the fallback when a visible control, texture or dimension cannot be rendered.

## Behavior

- Keep authored control hierarchy, anchors, signed offsets, stack and grid layouts, content dimensions, layers and clipping.
- Draw labels, accepted pack images, public HTTPS images and symmetric nine-slice borders. Select authored default, hover and locked visual branches. Support the native `hover_text_renderer` through formatted Java tooltips; other visible custom renderers retain the ordinary-form fallback.
- Play resolved alpha tracks, including initially transparent cards and hover branch reentry.
- Keep hidden controls in layout while excluding their rendering and hits. Do not compact hidden grid cells without evidence from the native layout cache.
- Use Java focus, narration, tooltips, keyboard navigation and pointer handling. Provide bounded vertical and horizontal scrolling with proportional, draggable thumbs.
- Reject stale-connection responses and send at most one response from a screen.
- Keep original buttons usable while remote images load or fail. Fetch and decode on four workers, validate redirects, share a 20-second deadline, and cap each image at 4 MiB and four million pixels, with a sixteen-million-pixel screen budget including pending uploads. Cache normalized PNGs by target version and full URL hash with 128-entry and 64 MiB limits. Release each screen's dynamic textures when it closes. Do not retain failed requests across reopened menus.

## Evidence and limits

Research uses the pinned official 1.26.51.1 native executable and actual captured resource-pack definitions. Original native controls bind scalar/equal-four-side nine-slice parsing, missing-template child omission, grid rescaling ratios, dimension token parsing and child/peer dependency enumeration. These results do not establish full native pixel layout or hidden metric cache behavior.

The Java layout solver still uses bounded iterative measurement. Its mixed-template grid extents, zero maximum-size sentinel, proportional scrollbar geometry and polynomial alpha easing need further native consumer comparison. Native font-size metrics and tooltip pixel placement, asymmetric nine-slice side order, size/UV/color tracks, loop behavior and named next-animation chains remain open. Authored final static dimensions remain usable when a size animation is present.

## Asset pipeline boundary

The addon provider can supply bundled `ui/*.json` definitions and textures to the core when its optional `builtin_ui.zip` is absent. The current five tracked addon asset ZIPs contain zero `ui/` entries, however. Expanding the producer whitelist does not add definitions to those existing bundles. A default CI build without the optional core UI ZIP therefore still lacks the native baseline templates. Server packs that depend on them may use ordinary form controls instead.

The provider currently reads only its packaged, version-checked asset library. It does not acquire missing UI definitions from a Microsoft Store session or a versioned runtime package cache. If the entire addon asset bundle is absent, its loader throws instead of returning an empty layer. These are separate pipeline and graceful-loading gaps. The verified private core candidate includes the official UI baseline; its successful build is not evidence that default CI has that baseline.

## Verification

- Seventeen targeted scene, layout, presentation, scrollbar and alpha tests cover anchors, sparse original actions, clipping, hidden siblings, grid rescaling, content measurement, drag clamps, resize and branch reentry.
- Three production HTTP fixture tests cover nonblocking deduplication, offline cache reuse, target-version isolation, redirects, stream bounds, corrupt caches and decoded pixel limits, rejected queues and reopening after a transient HTTP failure. All 18 distinct remote images from five actual captured raw forms download and decode through this loader in a private probe. That result does not prove actual client rendering.
- Private probes parse and lay out all four actual captured ActionForm scenes with inferred font and image metrics. Their original button counts are 19, 36, 8 and 25; all authored visible action boxes retain positive bounds and nonzero alpha. The Wardrobe scene includes sixteen bound native hover-text nodes. Earlier synthetic Game Selector and variant probes remain separate evidence. These checks do not claim native screenshot parity.
- The complete 31-patch replay and declared Gradle test, check and build gates pass: 636 tests, 117 skipped, no failures or errors. This project declares no Checkstyle task.
- The immutable reviewed core has SHA-256 `ef01b3d7d8d4ddc9bd0abbfa1ae618c525d75a82d558a8b36eb5b5b6db03adf4`. The addon candidate has SHA-256 `6fd611a85d0817b72612ac8dbf57b2c7dc81a943e22967bbf77af0c4364180b0`; all 1,272 embedded core file entries match, excluding the manifest and the Loom-added module descriptor. Detailed evidence remains private. No credentials, captures, screenshots, bundled official assets or private paths are added to this patch.

Actual client menu rendering, resource reloads and Iris routes must be checked with the final candidate before deployment.
