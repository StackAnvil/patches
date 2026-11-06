# feat(ui): share native scene rendering and GUI actors

## Purpose

Share bounded scene, layout, image, text and actor rendering primitives before registering domain-specific forms and containers.

## Design constraints

GUI camera overrides retain their existing yaw values. World player queries use the [appearance layer's native head limits](0009-manage-character-creator-accounts-and-wardrobes.pr.md).

Share authored scene, layout, image, text, actor, and focus primitives. Preserve same-pack bitmap metadata, legacy layouts, native atlas sampling, and GUI raster coverage.

OreUI text retains its own font engine, shaping size, cache images, distance fields, atlas, and float tint pipeline.
It remains separate from classic JSON UI typography.
Default preparation follows the target Windows host's ordinary outline-font settings: bitmap below 10 display pixels or for a face that opts out, otherwise the 52-pixel CPU distance cache.
Sixteen original mode/size controls establish this selection. Eight executions of the shipped GUI-scale component establish five root pixels per scale unit.
Body text therefore crosses the default threshold from 8 to 16 pixels at GUI scales 1 and 2.
The image regression covers the threshold, face opt-out, independent shaping size, and distance-cache reuse.
Installed automatic and explicitly resolved modes produce identical pixels in seven regions under both filters, including the 8- and 10-pixel probes.
Active Bedrock 1.26.60.5 death labels confirm automatic mode and the 52-pixel CPU distance cache at display sizes 16, 20, and 32.
Retained native records match Java bearings and image dimensions for all 76 compared glyph instances.
Seventy-four positions match bit for bit. Two reason-glyph instances differ by one float rounding step.
Five representative Seven-font distance images match the original native parser, rasterizer, and distance converter byte for byte.
Actual atlas texels, sampler bindings, material attribution, and final compositing remain unverified.
Original Bedrock 1.26.60.5 controls establish selected shaping, raster, distance, ordinary run coverage, and supplied-position arithmetic.
Prepared runs retain vertical face metrics independently of the glyph cache size.
Native line boxes preserve negative leading and fractional content origins.
Content boxes apply borders and padding before optional node-selected snapping.
The Java content bounds match all 20 original native controls bit for bit. Six policy controls establish the supplied style/global flag combinations.
The active native death view enables snapping for the title, reason, Respawn label, and Game menu label.
The live paint wrapper centers each intrinsic text box before snapping its origin, then adds the cached baseline offset.
At 1280 × 720, the button label boxes start 10 and 12 pixels below their respective button tops.
Complete CSS cascade and other active view flags remain unverified.
The Java calculation matches all 72 original native font-span and baseline controls bit for bit.
Eight style-height controls and 14 rectangle/fragment controls establish separate height resolution and placement boundaries.
Regressions cover explicit and normal line heights, negative half ties, real font metrics, atlas lifetimes, and Minecraft vertex emission.

`OreUiCharacters` retains source UTF-16 offsets through native CR/LF policies and normal/nowrap whitespace collapse.
It keeps nonbreaking Unicode spaces and preserves whitespace in preformatted modes.
The trailing-space fitting reserve stays separate from displayed characters.
Target-version native controls match scalar arrays, offsets, and float reserves in 195 cases.
Regressions also map a wrapped line back to its original source. Java rejects unpaired UTF-16 surrogates before UTF-8 encoding.
These controls supply the newline and CSS whitespace policies. They do not establish policy selection, invalid native UTF-8 handling, or complete screen integration.

Ordinary text measurement keeps a separate native feature profile from drawing.
It selects nominal advances, space-excluding legacy kerning, or GPOS from the face and character count.
Original 1.26.60.5 dispatch, feature records, and FreeType/HarfBuzz controls establish the tested paths.
Authored regressions preserve per-scalar advances and drawing substitutions across measurement calls.
Installed Ten advances match original controls for `fi`, `office`, and `Respawn`.
Ten selected draw regions retain identical pixels across measurement and mode return.
Ordinary font assignment fills unresolved scalar ranges in the caller's ordered face list and preserves their measurement context.
Eligible interior whitespace uses its neighbors' shared font while retaining its advance and omitting its draw glyph.
Eighteen original constructor controls cover ownership and advances through the line-builder boundary, with supplied font interfaces.
A separate target-native parser control and a packaged-engine regression cover the authored disjoint-coverage fallback face.
Regular gameplay faces follow the shipped locale-dependent fallback order after the caller's primary family.
Thirteen selector, original font-parser, and assignment controls match packaged-engine glyph ownership while preserving primary Latin glyphs.
The API accepts native-case locale identifiers and resolves registered 400-weight normal faces, including unavailable slots.
Complete CSS family matching, weight/style substitution, complex-script/bidi dispatch, and final multi-font drawing remain unverified.
Ordinary lines consume measured advances and preserve nonfinal tracking, whitespace ranges, explicit endings, soft wraps, and float alignment.
Font identity separates fragments and can cause a wrap within a word. Alias slots that share an identity keep one fragment.
Each fragment retains its own baseline. Row height uses the greatest fragment advance, including zero-width whitespace fragments.
Twenty-two single-font construction/alignment controls and 37 mixed-font controls establish the compared native geometry.
One hundred additional mixed-font sequences and 100 retained single-font sequences match Java fragment records, row geometry, and extents bit for bit.
The controls supply the font map, metrics, advances, and style flags; original layout helpers execute.
Regressions retain 24 mixed-font boundary controls and connect packaged-engine fallback coverage and per-face metrics to line construction.
Collapsed trailing whitespace can reserve row width before alignment without changing fragment advances.
Twenty-six original adjustment controls establish full, partial and rejected reserves, first-row indentation, negative values, and the native float tolerance.
These controls cover geometry. Measurement-cache ownership and fitting policy selection remain unverified.
Installed single-font paragraph ranges and placement match original native results at three supplied widths. Eleven selected draw regions remain unchanged across preparation modes and return.
The complete measurement wrapper/cache, CSS text policies, bidi, ellipsis, parent CSS sizing, and complete mixed-font screen rendering remain unverified.

The full add-on build passes with 1,406 tests passing and 154 skipped, including software font GPU checks.
An installed software-rendered Minecraft 26.3 diagnostic submits four labels and a `drawLine` probe through the production font engine, atlas, GUI extraction, and shaders.
Four executions of the shipped death and button components establish shadows on the title, reason, and enabled hero label. The disabled hero and secondary label omit them.
Five complete original zero-blur shadow controls establish reverse paint order, offset arithmetic, inherited color, and parent-color restoration. The shadow paint flag's downstream interpretation remains unverified.
The diagnostic applies the shipped black shadows through the unchanged font backend. Colored and blurred shadows remain outside this comparison.
Bitmap and distance-field modes each run with nearest and linear filters at 1280 × 720.
All five regions remain unchanged after returning to the original mode. Installed artifact hashes match the tested build.
The eight nearest-filtered label crops differ from the CPU raster reference by at most one color byte.
Linear-filtered crops differ from that idealized reference by up to 13 color bytes. Exact native sampling remains unverified.
The diagnostic uses production measurement and line construction. It supplies outer boxes, insets, spacing, colors, font modes, and node snap choices.
The diagnostic centers intrinsic text boxes before node snapping, matching the observed native order.
Fixed comparisons with the saved native frame give 98.5% to 100% foreground-mask overlap across four label regions at three thresholds each, without position fitting.
Final sampling, colors, complete button styling, and complete screen pixels remain unverified. Complete OreUI screen consumers, CSS layout and fallback, reloads, and input remain unfinished.

The acquired OreUI bundle also registers the original loading GIF and retains all previous font, stylesheet, and translation bytes.
The decoder preserves frame durations, transparency, and disposal within a 16 MiB decoded-frame limit.
Five regressions cover image ownership, invalid registrations, decoded limits, frame disposal, and the acquired spinner.
The original spinner has ten 28 × 28 frames at 100ms each. Independent ImageIO and Pillow decodes agree on all ten frames.
These checks establish software decoding. Installed animation sampling and the complete death-screen consumer remain unfinished.

Prerequisites:

- viabedrock/0095-share-native-ui-programs-and-resources.patch: Publish shared UI scene and program contracts before the client renderer.

- viafabricplus-bedrock/0002-native-entities-and-skins.patch: Preserve native actor material depth state and dynamic pipeline selection in GUI portrait consumers.

## Validation and remaining limits

Opacity revisions let container screens reuse their draw lists between visual changes.
Alpha samples and reset events invalidate retained opacity.
Layout changes retain a separate revision.

Regression coverage includes `BedrockBitmapFontResourcesTest`, `BedrockGuiActorAppearanceTest`, `BedrockGuiActorContextTest`, `BedrockResourceLibraryTest`.

Text channels follow the native cached-glyph conversion: multiply by 255, truncate, then clamp to a byte.
Bedrock 1.26.60.5 original instructions cover 140 cases, including fractional byte boundaries and independent RGBA channels.
Fresh native hopper glyph writes use that path and convert authored 0.3 to byte 76.
The renderer regression fails with the previous rounding and covers mixed channels, defaults, and opacity bounds.
Image component tint retains its separate conversion path.
At 1280 × 720 and native UI scale 2, both installed Java routes match all 672 glyph pixels in two chest labels.
The complete title and inventory-label rectangles also match, including their panel backgrounds.
Other controls, world pixels, items, and frame timing remain outside that comparison.

At 1280 × 720, all 16 current-font labels match native 26.60 at UI scales 1 and 2. All 16 legacy labels match at UI scale 2. Direct and ViaProxy controls pass Java GUI scale changes and resource reloads. The point-sampling GPU regression fails before the correction and passes on Intel and software rendering.

Grouped scrollbar panels release their layout space when content fits, unless `scrollbar_always_visible` is set.
The verified path requires named content, viewport, track, thumb, and panel controls.
Forms that omit these names still need matched native controls to align layout and painting behavior.
Twenty-four original-instruction controls from Bedrock 1.26.60.5 verify both orientations and the exact fit boundary, including the native visibility setter and dimension reset.
The fixture supplies settled geometry, control storage, and event boundaries. Native construction, complete scheduling, input, and GPU parity remain outside that fixture.
Regressions preserve declared dimensions across resize and keep identical panel names in separate scroll views independent.
The rebuilt add-on passes an unchanged 240-second Navigator replay. Close sends the original response index 8 exactly once.
At the matched 1280 × 720 viewport, selected left-label offsets fall from 7–8 pixels to 3–4, and right-label offsets fall from 11–12 pixels to 0–1.
Scissors retain floating parent intersections before truncating the scaled origin and extent.
Each draw carries physical clip data through extraction and batching, with conservative Java GUI bounds for overlap checks.
Native 1.26.60.5 controls cover fractional origins, all four edges, and nested parents.
At 1280 × 720 and native UI scale 2, the installed add-on matches all 36 selected glyph masks at Java GUI scales 1, 2, and 3.
Return to scale 1 retains those masks.
A batch-boundary regression keeps distinct physical clips separate when their coarse GUI bounds match.
Labels admit complete rows using the rounded line metric and a two-unit allowance on the final row.
Glyph placement retains the fractional metric.
Native Bedrock 1.26.60.5 bitmap controls establish scaled admission heights 8, 18, and 28.
Twenty-four MinecraftTen controls establish heights 10, 22, and 34 at font scales 0.5, 1, and 1.5.
Each preceding float excludes the next line. The glyph baselines retain their 11.8125-unit advance.

Truncated labels cache a width-fitted three-dot marker with the original line-ending style, including trailing formatting changes.
A marker that cannot fit contributes no pixels. Empty paragraphs still consume rows.
Labels retain inherited parent scissors because admitted native glyphs can cross the label's own height.

Regressions cover draw submission at adjacent float boundaries, fractional placement, blank rows, marker width, style, and retained wrapping across resize.
Disabling admission makes the boundary regression fail.
At 1280 × 720 and native UI scale 2, the installed add-on matches all 56 selected bitmap glyph masks.
Java GUI scales 1, 2, 3, and return to 1 retain those masks.
These controls cover short heights, scaled labels, explicit newlines, automatic wrapping, and overflow markers.

At the same viewport and scale controls, all 24 installed MinecraftTen cases admit the native number of lines.
These controls establish line admission. The current raster comparisons appear below.

Labels preserve carriage-return glyphs during measurement and drawing, including before LF.
NUL terminates label traversal across styled runs and excludes suffixes from measurement.
The installed control matrix matches all 63 selected bitmap masks across the four GUI-scale controls.
Tooltips retain their separate CR/CRLF normalization.
The [shared program](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md) selects whole-string font fallbacks before rendering.

Nine-slice regions draw when their destination has area, including regions that sample a single texture point.
Bedrock 1.26.60.5 uses this layout for its opaque 2×2 Black texture with one-pixel borders.
The draw regression fails with the previous UV filter and also checks that an empty destination emits no graphics calls.
The installed add-on matches all 266,072 sampled background pixels at 1280 × 720 and native UI scale 2.
Java GUI scales 1, 2, 3, and return to 1 retain that match and all 63 selected bitmap glyph masks.
The background comparison excludes text bounds and the separate action button.
The complete 180-second replay preserves the source scene payload and verifies the installed add-on bytes.

Selected TrueType labels use their native 1.5 display grid.
Origin conversion follows native float operations and truncates toward zero, including negative coordinates.
Regressions cover submitted draw positions and the UI-scale-3 precision boundary.

TrueType labels use FreeType to read font files and STB to turn checked outlines into pixels.
Font bytes never reach STB. The provider reads the cache height from the selected font pack and preserves older exports without this descriptor.
It bounds files, outlines, raster dimensions, and compound glyphs. Java owns glyph texture upload and retirement.
Regressions cover original native pixels, translated and scaled components, malformed data, cycles, close/reload, and pack ownership.

Original Bedrock 1.26.60.5 instructions supply 36 raster controls across two fonts and heights 32, 64, and 96.
Five authored fixture controls also match, including curves and composite coordinates that FreeType normally shifts.
At 1280 × 720 and native UI scale 2, the shipping add-on matches all 72 tested label crops without an experimental mod.
Java GUI scales 1, 2, 3, and return to 1 retain all 63 bitmap and nine TrueType matches.
A completed resource reload retains all 72 matches. The full build and 180-second replay pass.

TrueType GUI vertices retain half precision in cache coordinates before the 1.5 display transform.
The owned native bitmaps keep exact atlas bounds. A baked-glyph regression checks vertex submission before the pose and preserves world text.
At 1280 × 720 and native UI scale 2, all 32 font-selection labels match native Bedrock 1.26.60.5.
The controls include `AgW@éj`, formatted text, the primary MinecraftTenEmoticon alias, and explicit Unicode.
Java GUI scales 1, 2, 3, return to 1, and a completed resource reload retain these matches.
GUI italics use fixed cache-space edge shear before half-float conversion and display scaling.
Original Bedrock 1.26.60.5 bitmap and TrueType glyph writers and shared quad instructions establish that geometry.
Eighteen bitmap instruction cases retain the same shear across three cell heights and offsets.
Baked-glyph regressions cover tall cells, the TrueType normalization boundary, conservative bounds, and unchanged Java world vertices.
A fresh 24-label native scene covers plain and italic text at three font scales.
All 24 selected labels match across Java GUI scales 1, 2, 3, and return to 1.
Paired native and Java GPU captures establish the native TrueType UV packing and zero atlas gutters.
The renderer preserves that sampling phase after Java relocates glyphs and clears their reserved trailing gutters.
Regressions cover relocated UVs, unchanged world sampling, zero padding, and uploads at the atlas edge.
A normal resource reload preserves all 24 crops. The full build and complete 180-second replay pass.
Bold, shadow, other font families, mixed or scaled aliases, and complete screens remain open.

Other background layouts, action appearance, and complete column placement remain open.

Unanchored manual-grid cells use their grid origins.
The regression uses the native four-row armor shape, which previously shifted down and overlapped the main inventory.
Explicit anchors and full-parent percentage dimensions retain separate regression coverage.
Live player and horse portraits apply control opacity when Java composites their GUI textures.
Color controls cover premultiplied RGB and alpha, transparent frames, and independent perspectives.
The existing independent actor material-coverage path remains separate.
Fixed collection grids retain their full logical height while layout positions each instantiated cell by its original source index.
Regressions compare complete and windowed geometry, distant scroll positions, resize, final rows, and offscreen keyboard neighbors.
Overlapping windows retain animation clocks by source identity.

The scene lifecycle tracks authored pop exits through their completion events.
It waits for all participating tracks, including a shorter size track alongside a longer fade.
Binding refresh retains pending completions by control identity.
Tests cover different durations, repeated requests, successor chains, missing completion paths, and refresh during an exit.
Native Bedrock 1.26.60.5 Escape frames retain the fade after the size track finishes.
This mechanism does not establish exact native frame timing.
These controls do not establish identical native pooling or frame timing.
Broader viewports, complete inventory pixels, entrance timing, and other TrueType families remain open.

The shared hurt receiver binds queued events to the connection and local actor lifetime.
It consumes pending events against the current scene and retains the counter across ordinary screen changes.
Accepted events use the existing screen exit lifecycle.
Regressions reject stale connections and actor lifetimes and retain scene selection at consumption.
Installed direct and ViaProxy controls cover cause filtering, gated events, a false inventory policy, and remote actor damage.
Native Bedrock 1.26.60.5 runtime controls establish the server-event policy order.
Client-predicted damage and exact native frame timing remain unverified.

Alpha tracks honor `scale_from_starting_alpha` and retain their initial scale across scene refreshes.
Native Bedrock 1.26.60.5 captures ImageComponent alpha when creating the track and multiplies the interpolated value by that scale.
The default Survival backdrop uses this flag with opacity 0.4. Ignoring it makes the settled backdrop opaque.
A regression fails before the correction and covers the fade, potential-opacity bound, retained clock, and absolute-track behavior.
Leaf controls skip child-state selection after contributing their own draw state.
Animation updates reuse an index of controls with authored tracks. Root replacement and binding refreshes rebuild that index.
The scoped-clock regression checks that an update leaves unrelated registered controls unchanged.

The [owning patch](0029-share-native-ui-scene-rendering.patch) retains implementation rationale and versioned evidence.

Local image controls honor `allow_debug_missing_texture: false` when the resource is absent.
The renderer omits that decoration and preserves the rest of the authored scene. Required and malformed images keep their existing error behavior.
Native Bedrock 1.26.60.5 shows Enchanted's hub menu with these optional decorations. All 58 exported native pack files match the add-on capture.
The image regression checks omission, required-image failure, and recovery after a source change. Client decoding shares the converted-pack dimension policy and retains the previous 16-Mipixel budget for tall or wide frame strips.
Regression cases accept the native atlas shape through eviction and reload and release buffers rejected by the pixel or side bounds.
Stack fill allocation preserves sibling-derived dimensions on the other axis.
A reduced regression fails before the correction and retains visible child controls in both orientations.
Enchanted's native hub uses this layout for its four smaller trending cards.
Fractional grid capacity tolerates a one-ULP round-down at an exact fit on either axis. Larger cells still wrap.
The rebuilt add-on opens Enchanted's authored hub with all five trending cards and the three lower game cards.
A physical OP SMP selection sends original response index 2 and receives Transfer, matching native. The destination connection times out.
Complete gameplay after transfer, final typography, screen overlays, and animation parity remain unverified.

Local native UI JPEGs use a bounded reloadable texture. The texture manager owns upload, replacement, reload, and retirement.
Tests compare decoded pixels with the previous PNG conversion, check replacement resources after reload, and reject oversized headers before decoding.
A private control checks all 126 matched JPEGs in the captured MegaSMP packs without a decoded pixel difference.
An installed-client GPU control renders the captured bundle banner with identical pixels through the JPEG and previous PNG paths, including after resource reload.
The full four-project build passes. These controls do not establish complete native screen appearance or frame timing.

Cursor placement uses the resolved native anchor after grid layout and scrolling. Seventeen original Bedrock 1.26.60.5 controls establish local offsets, centering precedence, edge flips and zero-size hiding. Layout regressions cover actual grid-parent bounds, viewport clipping and unchanged authored offsets. Active tooltip sources, input actions and live pixels remain open.

Factory creation IDs separate replacement clocks from binding refreshes. Completed named destruction queues the affected factory roots for host retirement. Ten original 1.26.60.5 instruction controls establish exact current-control and ancestor target lookup, expired-parent termination, and completion gating. Regressions cover replacement clocks, late retirement, and unrelated sibling preservation. These controls stop before native hierarchy removal and do not establish rendered parity.
