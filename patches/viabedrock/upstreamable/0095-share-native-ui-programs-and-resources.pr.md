# feat(ui): share bounded native UI programs and resource conversion

## Purpose

Provide immutable JSON UI declarations, scoped expression evaluation, domain bindings and bounded scene contracts before packet integration. Keep accepted pack layering, textures, fonts and builtin UI identity in one resource lifecycle.

## Design constraints

Transport shared authored programs and resources before domain-specific adapters. Preserve accepted pack order, immutable snapshots, resource ownership, and bounded decoding on direct and proxy routes.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Land accepted native resource transport before loading shared UI programs.

## Validation and remaining limits

Official Bedrock 1.26.60.5 desktop controls open Encyclopedia topic 31, Furnace, from all three cooking families.
Furnace and blast-furnace controls retain carried items after returning from Help.
Language data distinguishes encyclopedia topic labels from Survival guide title keys.
Regressions retain the selected topic, localized heading, body text, and cooking payload bound across program transport.
Player inventory uses the same Help resolver with its existing guide choice.
Native multiplayer Help traffic and complete visual parity remain unverified.

Storage programs export and resolve the complete host graph, including backdrop, close controls, and animation tracks.
Synthetic screen fixtures declare their content controls explicitly.
The bundled-family regression retains authoritative slots and the host hurt policy across program transport.

The versioned hurt payload retains the original cause and local actor lifetime before Java damage translation.
Native Bedrock 1.26.60.5 runtime controls establish the cause filter, pending-state consumption, and 100-update gate.
A false screen policy still starts the gate. Gated events do not become delayed closures.
Regressions cover that order, both hurt event IDs, strict decoding, and unknown causes.
Programs without the core contract cannot advertise supported hurt policy.
Installed direct and ViaProxy controls preserve item totals and the shared gate across screen changes.
Client-predicted damage and the live producer for event 81 remain unverified.

Grid factories populate each collection once and respect the bound maximum item count. Relative cell templates use the defining namespace.
The captured Lifeboat Navigator now resolves eight main cells, matching native Bedrock 1.26.60.5, instead of 46 duplicated cells.
Reduced regressions cover factory ownership, template lookup, and item limits. Event-driven factories accept immutable creation snapshots, keep event properties and control bindings local, and retain creation IDs across refreshes. Tests cover dormant factories, per-event control IDs, exact-name exclusivity, late retirement, and program transport. Native 1.26.60.5 controls verify strict boolean exclusivity and complete runtime-name matching; full factory construction and pixels remain outside those controls.
The rebuilt add-on shows two columns and four rows during a live join.
World Games, Mini Games, and SkyWars open through their authored controls. Selecting Solo reaches the waiting lobby.
The recorded replies retain the original button indices. Complete native appearance remains unverified.

Regression coverage includes `NativeContainerActionTest`, `NativeContainerDataTest`, `NativeContainerMessageTest`, `NativeCookingActionResultTest`.

`InventoryStackCount` provides native count text separately from numeric binding quantities.
Bedrock 1.26.60.5 (protocol 2225) hides counts below two, uses decimal text through 99, and displays `99+` above that.
All 536 complete native formatter controls match the packaged Java producer.
The controls supply caller storage and CRT string operations; they do not establish source quantities or visual parity.

`InventoryItemFilter` separates disabled-item lighting from opacity and transports authored multiplier bindings.
Current 1.26.60.5 instruction controls cover 150 typed property combinations and native RGB conversion.
The packaged regression retains 50 object-property cases, including booleans, numeric extremes, and invalid types.
These controls supply property lookup and ABI storage. Complete item geometry, materials, and final pixels remain unverified.

`UiBindings.Window` selects cell views from a complete collection without changing its size or source indices.
A separate retained range supports offscreen keyboard focus and its neighbors.
Only fixed horizontal grids qualify. Row-dependent dimensions and redirected root indices are rejected.
Regression coverage compares complete and windowed sources, exported programs, source replacement, and the pinned inventory grid.
The scene node budget remains unchanged.

Program compilation, resource, and transport tests cover supported content. Transport acceptance does not establish screen interaction or visual parity.

TrueType labels use one font for the visible formatted string.
NUL ends that string before font selection, while the original binding values remain intact.
Missing glyphs select the bitmap or Unicode fallback and exclude the declared TrueType line metrics.
Compressed Unicode coverage accompanies exported font identifiers, so bound-text refresh retains this decision on both routes.
Native Bedrock 1.26.60.5 MinecraftTen controls cover newline, tab, carriage return, space, formatting, accent, Han, and snowman text.
The parser matches all eight captured selections with the original font bytes, including after coverage transport.

Native controls also cover all 32 C0 inputs in bitmap and MinecraftTen labels, plus distinguishing NUL suffixes.
Bitmap conversion retains raw control cells alongside printable aliases. CR/LF keeps the CR glyph on the first line.
The conversion namespace invalidates older fonts without these aliases.

The installed add-on matches all 63 selected bitmap glyph masks at 1280 × 720 and native UI scale 2.
Java GUI scales 1, 2, 3, and return to 1 retain these masks.
The complete 180-second replay preserves the source scene payload and verifies the installed JAR.

Regressions cover bound-text changes across program transport, winning-file replacement, missing glyphs before and after delta adjustment, and supplementary coverage.
Malformed tables and truncated or oversized coverage are rejected or select the bitmap fallback.
Disabling coverage selection makes the binding-refresh regression fail.
The target native font uses cmap format 4. Supplementary format-12 behavior has synthetic coverage and still needs matching native controls.
Other font families, mixed aliases, ranged or scaled fallbacks, and complete typography remain open.

Bedrock 1.26.60.5 derives the base TrueType scale from the target render height and hhea ascent/descent range.
Its glyph cache doubles that scale for 2×2 oversampling and retains fractional packed metrics.
Stock Java 26.3 rounds the FreeType EM pixel size after multiplying the provider size by its oversample value.
For MinecraftTen at target height 64, the native base scale corresponds to about 51.61 EM pixels and the raster scale to 103.23.
The stock Java provider requests 77. Changing oversampling alone does not reproduce the native raster path.

Original initializer, glyph lookup, outline, rectangle, raster, and filter instructions supply 36 CPU cache controls.
All cache pixels and packed metrics match the installed LWJGL 3.4.3 STB rasterizer.
The controls cover six glyphs at heights 32, 64, and 96 for MinecraftTen and an additional curved-outline font.
The fixture supplies atlas placement and external allocation, memory, and rounding interfaces.
It does not execute cache I/O, GPU upload, shaders, or complete native screens.
Original page packing and raster instructions produce a 1,024-pixel atlas with 256 glyph records.
All atlas bytes and packed records match LWJGL STB with the native placements.
Selected TrueType labels carry their 1.5 display grid through program transport. Bitmap fallbacks retain their own grid.
TrueType exports retain original font bytes and a descriptor with the native cache height.
The add-on reads that descriptor from the selected font pack. Older exports retain Java font loading.
The [client provider](../../viafabricplus-bedrock/upstreamable/0029-share-native-ui-scene-rendering.pr.md) owns bounded outline rendering and resource retirement.

Native font registrations survive downloaded font metadata. Unrestricted, unscaled primary aliases retain their face, coverage, and line height across transport.
Explicit `unicode` labels select Unicode even for ASCII. Canonical font-file overrides remain unverified.
Regressions cover these selection boundaries and cyclic alias rejection.
Native Bedrock 1.26.60.5 controls cover server declarations, the built-in primary alias, and explicit Unicode.

UI labels and dynamic domain text use the fully merged globals, including the bundled default palette.
Program transport retains these colors. Protocol text keeps server-only overrides.
Help regressions cover translated components and exported program round trips.

The [owning patch](0095-share-native-ui-programs-and-resources.patch) retains implementation rationale and versioned evidence.

View bindings can read an authored `toggle_view_binding_name` alias.
A regression checks section visibility when the destination has a different local toggle value.

Authored bindings accept raw value tokens and redundant trailing closing groups.
The captured Lifeboat protocol-2225 Navigator request resolves with all 23 original response indices.
The add-on accepts that scene and shows the authored Navigator GUI in a live join.
A live add-on check opens Mini Game Selector, returns through Back, and closes through Escape.
The journal retains the original response indices 0 and 8 and the user-close reason.
The full build and fresh-clone replay checks pass. Final typography and complete native appearance remain unverified.

Bounded relative UI paths preserve printable UTF-8 names and spaces. Converted identifiers still hash the original resource name.
Traversal, absolute paths, drive or URI syntax, backslash separators, control characters, and unpaired surrogates remain rejected.
A native Bedrock 1.26.60.5 capture shows Enchanted's authored hub menu and sends original response index 2 for OP SMP.
All 58 exported pack files match the add-on capture. The native run stops after transfer selection and does not establish gameplay after transfer.
The captured menu now resolves and passes visible-control admission with all 11 original responses.
Regressions retain bound image pixels and metadata and preserve form actions when a printable decorative texture is absent.
Frame strips can exceed 4,096 pixels on one side while preserving the previous 16-Mipixel total budget and source byte limits.
The current native pack uses a 963 × 5,916 logo atlas and a 5,880 × 480 background.
A shared dimension policy bounds conversion and client decoding. An encoded-strip regression preserves its endpoint pixels.
The rebuilt add-on opens the authored hub menu with all five trending cards and the three lower game cards.
A physical OP SMP selection sends the native original response index 2. The destination connection times out after Transfer; gameplay there remains unverified.

Validated native UI JPEGs retain their original encoding in converted packs.
Program export preserves the selected format and pack-layer precedence. PNG preference within a pack and TGA conversion remain unchanged.
Regressions cover byte preservation, both override directions, program round trips, metadata, and resource export.
The rebuilt add-on accepts MegaSMP's converted pack under Java's existing download cap and reaches a visible lobby.
A fresh walking control remains grounded. The attempted hotbar menu input opens no screen; complete gameplay remains unverified.

Java dialog projection uses visible authored labels and the original translated caption for image-only actions.
The captured 1.26.60.5 Navigator Close action previously exposed a narration key.
The corrected projection retains Close at response index 8 and preserves the other eight captions and indices.
Regressions cover image-only captions, authored labels, hidden actions, and translated source captions without changing raw binding values.
A client-facing projection regression accepts the scene depth boundary and rejects an overdeep tree before caption traversal.
A rebuilt Java dialog shows the captured Navigator labels and sends response 8 when the source Close action is clicked.
The local diagnostic control disables authored-form capability without changing the recorded scene packets.
The original reported dialog remains unmatched.

Collection-details bindings now populate each control event bag without requiring binding_name. Named lookups, zero fallback, prefixes and unnamed scope maps match fifteen original Bedrock 1.26.60.5 execution controls; eight parser controls establish the binding type. Local regressions cover evaluated property replacement, control-local bags and export/import. Full controller input and installed parity remain separate gates.

Optional cooking query contracts retain raw text and bind edits to the displayed opening, snapshot, and request sequence.
Codec regressions retain Unicode and embedded NUL text and reject malformed source lengths, trailing fields, and invalid result flags.
The backend owns filtering and execution. Complete default cooking screen admission remains unfinished.

Optional held-quantity messages retain the starting frame, source slot, phase, and ordered request identity.
Results report local phase admission; inventory responses retain final authority.
Codec regressions cover round trips, source identity, bounds, and trailing data.

Native 1.26.60.5 property-value controls preserve hash-prefixed names in property data and expand dollar variables without converting the result into a binding lookup.
Regressions cover direct and variable-supplied property bags, explicit binding updates, and exported cooking editors for all three station families.
Cooking clear-button visibility follows raw search text, including whitespace.
These controls do not establish complete loader or cooking-screen parity.

Current 1.26.60.5 original-instruction controls cover both layout callbacks across 384 supplied controller states, including forced layouts and inline or heap hover text.
Leaving Inventory with retention enabled saves Inventory tab 5 independently of the selected recipe category.
The downstream settings refresh is an observed boundary. These controls do not establish physical input or full cooking-screen parity.

Desktop held-quantity progress retains the original source total and the selected item count.
Forty original Bedrock 1.26.60.5 getter controls establish these values and visibility under supplied item and input services.
An exported cooking-program regression resolves active progress and clears it after selection ends.
Touch visibility policy and complete native pixels remain unverified.

Accepted HUD decorations can bind to the native `boss_bars` collection.
`HudRootUi` publishes each active bar as a row with `#bossName` and `#bar_visible`, plus the HUD controller values those decorations reference.
The client draws native boss bars itself, so an unchanged native collection grid stays out of the decoration root.
The same rows evaluate the authored `hud.boss_health_grid` for each bar, so packet integration can hide a Java bar whose authored panel draws nothing.
CubeCraft's accepted pack (Bedrock 1.26.60, protocol 2225) presents `cc_hotbar_text*NNN` boss bars as text above the hotbar this way.
Its colored-bar predicates close one group too many between conjunctions.
The evaluator now treats an unmatched closing parenthesis as the end of every open operation and continues with that value.
This keeps the authored prefix checks in effect. It is inferred from the pack's working native presentation; the native parser was not inspected.
Synthetic regressions cover the expression form, per-bar panel visibility, the authored hotbar text grid, and the native grid exclusion.
The resource-pack UI suite passes (215 tests) with the bundled native UI.
The captured CubeCraft pack, evaluated locally and not committed, hides the hotbar-text bar, keeps the Skyblock introduction bar, and resolves the hotbar label `New Event`.
The native `#exp_bar_and_text_offset_y` value is not reported by the Java client and stays at its rest value 0.

Bindings with `resolve_sibling_scope` now resolve their `source_control_name` among the binding control's parent: the first earlier sibling or descendant with that name, otherwise the control itself.
Previously a global last-named lookup could return a control from another button.
On Galaxite's game selector, the image panel and its child are both named `image`, and the panel shows only when `(not (#texture = ''))`.
The first tiles after textureless buttons read an empty texture, so BlasterWars, Alien Blast, Melvin's Prison and the Alien Blast Survival tile stayed black.
A JFR exception capture during offline replay showed no download attempt for those URLs; HTTP fetches and decoding of the same images succeed.
The captured forms now resolve every tile image with its HTTPS URL. `ServerFormUiTest` covers a pictured tile after a tile without an image.
Offline replay of the captured selector downloads all six visible tile images. A live Galaxite selector shows the BlasterWars, Alien Blast and Melvin's Prison thumbnails.

Same-path UI overrides inherit an omitted namespace from the lower file. Variable factory maps and explicit local binding defaults remain scoped to their controls. Fixed collection indices use the nearest declared collection. An empty supported factory remains a valid scene, so hidden routing titles do not escape into Java fallback. Explicit bound captions retain their authored result instead of being overwritten by an unrelated implicit `#text` binding. Reduced regressions cover each boundary without redistributing server packs. Live Mineville and Zeqa checks open authored selectors, and Mineville's hidden hub routing title stays hidden.

HUD chat factories receive independent, bounded creation snapshots and retain their original identities across refreshes. Ordinary Java chat follows the accepted `hud.chat_grid_item` visibility; unsupported controllers retain Java fallback. Tests cover independent formatted captions, empty factories, host limits and ordinary chat. Complete native controller timing and appearance remain unverified.

Custom-form transport omits the resolved root because the client reconstructs it from the retained program and typed input state. The same payload limit remains in force. A large-form regression verifies that the transported program rebuilds identical controls and inputs without the duplicate root. This addresses Mineville Settings exceeding the previous combined size.

Program transport retains the texture metadata the UI resolver consumes: nine-slice dimensions and Aseprite frames/metadata. Generic item/terrain atlas indexes and geometry JSON stay out of that payload. The installed Mineville program included a 197-KiB item atlas it could not use; this made Settings exceed the bound even after removing the duplicate root. A regression rebuilds identical nine-slice controls with a large unrelated atlas present, and the Aseprite controls retain their animation metadata.

The final installed Mineville check opens Settings through the authored PvP Pit menu. It shows the clean SETTINGS heading, toggles and sliders; the former generic routing-title fallback no longer appears. The captured form also round-trips through the codec in 880,464 bytes and rebuilds all twelve inputs. Full native appearance remains unverified.

Ordinary chat with pack row filters: with the exact installed builtin UI and all nine accepted MegaSMP packs, a server permission denial now stays Java-visible, while a `%toast%` message stays hidden there and still produces its authored notification. A synthetic regression covers the same row shape. Native rendering of MegaSMP's chat panel is not compared.
