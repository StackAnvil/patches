# feat(ui): share bounded native UI programs and resource conversion

## Purpose

Provide immutable JSON UI declarations, scoped expression evaluation, domain bindings and bounded scene contracts before packet integration. Keep accepted pack layering, textures, fonts and builtin UI identity in one resource lifecycle.

The frontend builds its complete UI program from the accepted nested Bedrock packs and their English texts. A confirmation binds the program to the source index, Bedrock protocol, exact core build and bundled UI identity. Every UI input message names the confirmed resource generation. Distinct input channels keep incompatible clients on ordinary Java presentation. Converted-pack identification reads only `pack.mcmeta`.

The wire carries form JSON, HUD values and retained bindings, NPC/editor inputs, and authoritative container/recipe state. It carries no exported UI programs or resolved UI scenes. Backend resolution remains for presentation selection and vanilla dialogs. Ordinary Java fonts remain available to clients without the add-on.

## Design constraints

Share authored programs and resources before domain-specific adapters. Preserve accepted pack order, immutable snapshots, resource ownership, and bounded decoding on direct and proxy routes.

Prerequisites:

- viabedrock/0015-transport-native-resources-and-sound-commands.patch: Land accepted native resource transport before loading shared UI programs.
- viabedrock/0001-cache-converted-resource-packs.patch: Provide converted-pack futures and bounded resource preparation before warming UI programs on cache hits.
- viabedrock/0050-decode-bedrock-tga-textures.patch: Share the native TGA decoder with build-time image preparation.

The Java pack no longer copies UI images. Scenes keep path-derived texture identifiers, because bindings choose paths at runtime. `UiTextureSources` resolves an identifier from the bundled UI layer and the accepted Bedrock packs nested in the same Java pack. It uses the program's layer order, format priority, validation and conversion, and converts an image only when a client requests it. Both sides sort each accepted pack's texture paths before the per-pack file limit, so admission does not depend on map iteration. Above the program's total file limit, `UiTextureSources` replays the program's admission eagerly. In the recorded Galaxite conversion this removes 7,424 UI images (22,649,245 bytes) and the 170,944-byte compressed `server_ui_textures.json` alias table. `UiTexturesTest` compares every image the backend program selects with client resolution, including an unusable top image, JPEG naming and over-limit admission with a reversed file order and a selected subpack.

Cache hits skip converters, so prepare the immutable UI program on the bounded resource workers in parallel with the converted-pack lookup. Wait for both before advertising the pack. The first HUD packet can then reuse the program without initializing it on the event loop. Publication keeps the current connection and accepted-storage guard.

Cold preparation overlaps independent layers on two bounded workers, with at most three layers in flight. Declarations, fonts, texture replacement and metadata still apply in accepted pack order. Workers stop after construction or failure. Encoded image dimension checks use memory-backed streams, preserving reader selection and limits without temporary files or global ImageIO changes. Regressions compare parallel resource application with sequential layers and retain valid images after the configured disk cache disappears.

## Validation and remaining limits

Prepared UI layers retain normalized image bytes and compact declarations in a versioned, checksummed cache. The limits are 64 MiB in memory, 512 MiB on disk and 128 entries. Identity uses sorted names and contents, while application preserves the current source order. Programs share private image bytes and copy exported arrays. Translations, fonts and mutable state remain local to each program. Disabled pack caching bypasses this cache.

The build prepares fixed bundled TGA images with the production decoder and PNG writer. An optional catalog matches complete source bytes by SHA-256, so changed server textures use ordinary conversion. Runtime admission, layer order, metadata and ownership remain unchanged. Missing or damaged catalogs also use ordinary conversion. The catalog holds at most 32768 images and 64 MiB of encoded bytes; the current verified source produces 2997 images in a 3.21 MB resource. Packaging checks the source-bundle digest, each payload checksum and dimensions in the core, proxy and nested add-on. Generated licensed images remain build outputs.

With runtime pack caches disabled, two cold Galaxite recordings initialize UI in 0.62 and 0.55 seconds, versus 1.17 seconds for the preceding build. The complete recorded backend span union is 3.75 and 3.97 seconds, versus 4.49 seconds for that control. Overlap counts once, from the first journal packet through first gameplay input. This includes more work than the older main-stage totals: it includes actor setup, animation loading and join callbacks too. Instrumentation omits uninstrumented work and spans below 1 ms, so these are measured processing windows, not exact added join latency. Startup prewarming is reported separately. One control and two candidate recordings do not establish a statistical speedup or meet the 2-second cold target.

The normal empty-disk-cache join records 4.40 seconds of backend windows, including cache writes. Its same-JVM reconnect records 1.39 seconds. A fresh process with populated disk caches records 2.60 seconds. Those cache hits skip conversion, native archive encoding and outer ZIP packaging. The bundled-resource startup load takes about 1.4 to 1.5 seconds before the connection begins and is excluded from these join windows. Captured packet pacing prevents using elapsed first-input times as a controlled end-to-end speedup.

Both cold conversions preserve all 10,318 logical UI images byte for byte, including aliases, all 2,220 custom block models and normalized physical/culling metadata. The combined four-project build passes 3,995 tests with 336 optional skips. Regressions cover deterministic generation, changed-source misses, independently owned outputs, damaged or incomplete catalogs, unsupported inputs and consumer packaging. Live probes load an aliased image through the resource manager, UI loader and texture manager. Complete native appearance remains unverified because existing unresolved mappings fail broad rendering checks.

Official Bedrock 1.26.60.5 desktop controls open Encyclopedia topic 31, Furnace, from all three cooking families.
Furnace and blast-furnace controls retain carried items after returning from Help.
Language data distinguishes encyclopedia topic labels from Survival guide title keys.
Regressions retain the selected topic, localized heading, body text, and cooking payload bound across local scene resolution.
Player inventory uses the same Help resolver with its existing guide choice.
Native multiplayer Help traffic and complete visual parity remain unverified.

Storage views resolve the complete host graph, including backdrop, close controls, and animation tracks.
Synthetic screen fixtures declare their content controls explicitly.
The bundled-family regression retains authoritative slots and the host hurt policy across local scene resolution.

The versioned hurt payload retains the original cause and local actor lifetime before Java damage translation.
Native Bedrock 1.26.60.5 runtime controls establish the cause filter, pending-state consumption, and 100-update gate.
A false screen policy still starts the gate. Gated events do not become delayed closures.
Regressions cover that order, both hurt event IDs, strict decoding, and unknown causes.
Programs without the core contract cannot advertise supported hurt policy.
Installed direct and ViaProxy controls preserve item totals and the shared gate across screen changes.
Client-predicted damage and the live producer for event 81 remain unverified.

Grid factories populate each collection once and respect the bound maximum item count. Relative cell templates use the defining namespace.
The captured Lifeboat Navigator now resolves eight main cells, matching native Bedrock 1.26.60.5, instead of 46 duplicated cells.
Reduced regressions cover factory ownership, template lookup, and item limits. Event-driven factories accept immutable creation snapshots, keep event properties and control bindings local, and retain creation IDs across refreshes. Tests cover dormant factories, per-event control IDs, exact-name exclusivity, late retirement, and local scene resolution. Native 1.26.60.5 controls verify strict boolean exclusivity and complete runtime-name matching; full factory construction and pixels remain outside those controls.
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
Regression coverage compares complete and windowed sources, source-built programs, source replacement, and the pinned inventory grid.
The scene node budget remains unchanged.

Source compilation, resource selection and input codec tests cover supported content. These checks do not establish screen interaction or visual parity.

TrueType labels use one font for the visible formatted string.
NUL ends that string before font selection, while the original binding values remain intact.
Missing glyphs select the bitmap or Unicode fallback and exclude the declared TrueType line metrics.
Each side derives bounded Unicode coverage from the same accepted font bytes, so bound-text refresh selects the same fallback.
Native Bedrock 1.26.60.5 MinecraftTen controls cover newline, tab, carriage return, space, formatting, accent, Han, and snowman text.
The parser matches all eight captured selections with the original font bytes, including during local resolution.

Native controls also cover all 32 C0 inputs in bitmap and MinecraftTen labels, plus distinguishing NUL suffixes.
Bitmap conversion retains raw control cells alongside printable aliases. CR/LF keeps the CR glyph on the first line.
The conversion namespace invalidates older fonts without these aliases.

The installed add-on matches all 63 selected bitmap glyph masks at 1280 × 720 and native UI scale 2.
Java GUI scales 1, 2, 3, and return to 1 retain these masks.
The complete 180-second replay preserves the source scene payload and verifies the installed JAR.

Regressions cover bound-text changes across local scene resolution, winning-file replacement, missing glyphs before and after delta adjustment, and supplementary coverage.
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
Selected TrueType labels carry their 1.5 display grid through local scene resolution. Bitmap fallbacks retain their own grid.
TrueType exports retain original font bytes and a descriptor with the native cache height.
The add-on reads that descriptor from the selected font pack. Older exports retain Java font loading.
The [client provider](../../viafabricplus-bedrock/upstreamable/0029-share-native-ui-scene-rendering.pr.md) owns bounded outline rendering and resource retirement.

Native font registrations survive downloaded font metadata. Unrestricted, unscaled primary aliases retain their face, coverage, and line height during local resolution.
Explicit `unicode` labels select Unicode even for ASCII. Canonical font-file overrides remain unverified.
Regressions cover these selection boundaries and cyclic alias rejection.
Native Bedrock 1.26.60.5 controls cover server declarations, the built-in primary alias, and explicit Unicode.

UI labels and dynamic domain text use the fully merged globals, including the bundled default palette.
Local scene resolution retains these colors. Protocol text keeps server-only overrides.
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

Local scene resolution retains the texture metadata the UI resolver consumes: nine-slice dimensions and Aseprite frames/metadata. Generic item/terrain atlas indexes and geometry JSON stay out of that payload. The installed Mineville program included a 197-KiB item atlas it could not use; this made Settings exceed the bound even after removing the duplicate root. A regression rebuilds identical nine-slice controls with a large unrelated atlas present, and the Aseprite controls retain their animation metadata.

The final installed Mineville check opens Settings through the authored PvP Pit menu. It shows the clean SETTINGS heading, toggles and sliders; the former generic routing-title fallback no longer appears. The captured form also round-trips through the codec in 880,464 bytes and rebuilds all twelve inputs. Full native appearance remains unverified.

Ordinary chat with pack row filters: with the exact installed builtin UI and all nine accepted MegaSMP packs, a server permission denial now stays Java-visible, while a `%toast%` message stays hidden there and still produces its authored notification. A synthetic regression covers the same row shape. Native rendering of MegaSMP's chat panel is not compared.

The form controller creates its form control in every factory named `server_form_factory`, including a factory hosted by a panel.
The built-in 1.26.60.5 `server_form.json` declares that factory on a `factory` control with `long_form` and `custom_form` IDs. Dimension Clash adds a panel with the same factory name that maps only `long_form`.
Before this change, only factory-typed hosts selected the form key, so the panel stayed empty and the splash and tutorial forms fell back to Java dialogs with encoded `dc_menus` titles and 453 generic buttons.
`FormBindings` now supplies one factory creation for the current form type. Other factory names keep their declarative expansion.
`ServerFormUiTest` covers a panel-hosted long form with a header row and original response indices, an unrelated empty panel factory, and a custom form whose panel maps only `long_form`. The custom form still resolves through the built-in factory and rebuilds from its exported program.
With the bundled native UI and the single accepted Dimension Clash pack, evaluated privately, the captured splash resolves 583 nodes and 12 response actions in 232,774 transport bytes. The tutorial resolves 151 nodes and its Start control at original index 94. No templates are missing, and the add-on scene parser admits both scenes.

The rebuilt add-on renders the splash, menu drawer and tutorial prompt through the authored scene. Selecting Replay Tutorial and Start sends original response 94 and starts the arena flyover. The tutorial then returns to first-person control. No full tutorial or match was completed. The direct Join Game path and official-client visual parity remain unverified.

Action-form search fields: official Bedrock 1.26.60 on protocol 2225 shows CubeCraft's Wardrobe search box and magnifier in an action form. Typing `red` and pressing the magnifier sends `ModalFormResponse` `["red"]` and does not filter the tiles locally.
An action-form edit box that names the `custom_form` collection now becomes text value 0, and its `button.submit_custom_form` control becomes a submit command. `#submit_button_visible` is true for action forms, as the native magnifier shows.
Two edit boxes for one value, or an explicit collection index, leave the text controls and submit command inert. Button controls keep their original response ordinals.
`ServerFormUiTest` covers the search scene, ordinary row ordinals and the inert cases. With the bundled 1.26.60.5 UI and the accepted CubeCraft pack, evaluated privately, the captured Wardrobe form resolves one text value with the authored `search...` placeholder, a limit of 100 and a visible submit control.
Official 1.26.60.5 sends `[null]` for a search field that never gained focus and `[""]` after focus alone or a cleared field; the integrating patch keeps that distinction. Forms with several text values remain unmeasured.

Variable-size containers: an actor-backed generic container can declare a positive `CONTAINER_SIZE` up to 1024. The presentation retains that size even below Java chest capacity, and shared row sizing gives the visible prefix enough Java rows, capped at six. In the accepted CubeCraft packs the EggWars shop has 549 slots and Skyblock quests have 126; official 1.26.60.5 renders both in the small chest host. `Kind.LOGICAL_CHEST` carries that size beside the family on the families channel, and authored grids see every logical slot. `NativeContainerItems` carries Java items keyed by full logical slot as a reset followed by changed slots, split under the 1 MiB payload bound. `NativeContainerAction` accepts a full source slot below 1024. Scene expansion allows 32768 nodes and container scenes, which never cross the network, allow 16 MiB. Evaluated privately with the bundled 1.26.60.5 UI and the accepted pack, the shop resolves to 15,296 nodes (6.5 MB) with all 549 cells, 293 of them above slot 255, and a count-one scope of 83 slots that includes Set Favourite at slot 487. Quests resolve to 1,980 nodes with a 101-slot count-one scope; their item data was not decoded, so that check used named placeholder items. The shop's cannot-afford predicate omits its last parenthesis; the end of an expression now closes open groups, which matches the native screenshot where that button shows only on the priced row. `NativeContainerMessageTest`, `NativeContainerActionTest` and `UiExpressionTest` cover the contracts. Scene resolution cost grows with the slot count; the shop parse and layout were not profiled in a running client.

String formats: `'<format>' * value` now accepts a printf string conversion with an optional zero flag, width and precision, all counted in UTF-8 bytes. CubeCraft's Skyblock buttons show their tooltip control only when `('%0700s' * #hover_text_bound) = #hover_text_bound`, that is when the hover text reaches 700 bytes. The former rule turned every format except `'%.Ns'` into `''`, so the Quest tooltip control stayed hidden. The official 1.26.60.5 client shows that tooltip. `UiExpressionTest` covers the width boundary in bytes and short values. A private control resolves the accepted pack's 126-slot Quest contents from the exact recorded prefix: both quest tooltip controls are now visible. Native padding characters for values shorter than the width have not been observed; the pack's equality test does not depend on them.

Item hover text accepts definition-owned name color and complete sections before lore. Enchantment and dye fields still require that context; unknown stack fields retain the unsupported result. The integrating patch resolves those sections and transports the completed text with the item. The add-on therefore receives the same string that the core uses to resolve native actions, before Java tooltip conversion changes its styles or contents.

Local component bindings can supply a toggle state by its control name or authored view alias. Inventory bindings remain authoritative. A transported-program regression switches two panels independently of item contents. This lets container integrations keep radio-tab selection across item updates without hardcoding pack names.

Large action forms can retain their UI program when repeating templates expands the resolved scene beyond 1 MiB. Format 3 omits the root and keeps the original form, response ordinals and text-input contract. The wire limit stays at 1 MiB; local expansion is bounded at 16 MiB and the existing scene node limit. The integrating patch negotiates this separately from older action-form clients. A regression rebuilds the same 160 response controls from the compact message. The private original 36-row Galaxite Match Scoreboard resolves 1,031 nodes, has no missing templates, and travels in about 569 KB.

`ScoreboardUi` supplies the raw objective title and `scoreboard_players` rows to accepted sidebar definitions before formatting. This resolves authored images and text rather than displaying routing markers as labels. A binding regression covers objective text, formatted raw row names and removal of all rows. Native 1.26.60.5 visual controls show Galaxite's logo, gem count and match HUD. Full cross-pack appearance and animation timing remain unverified.

String relational operands compare their UTF-8 contents instead of being coerced to numeric zero. The accepted Galaxite actionbar uses a string range to hide routing tokens while its crosshair factory draws images; the official 1.26.60.5 match shows the crosshair without that token. Numeric comparisons retain their existing behavior. A regression covers routing-prefix boundaries. An accepted boss-grid replacement also suppresses its duplicate Java bar; unchanged grids retain Java presentation. Native progress is supplied as the image clipping fraction, with a regression for partial progress.

HUD event factories resolve both `$screen_content` and `$screen_bg_content` from the native HUD screen. Screen entrance and exit animations stay with the screen rather than restarting for each event. This admits accepted crosshair factories hosted outside `hud.root_panel`; a synthetic background-factory regression also preserves ordinary actionbar text.

Array `remove` modifications drop the first `controls` entry named by `control_name`, or the first object matching every `where` field. Other entries keep their identities and order. An absent target is a no-op, and a modification without `array_name` edits `controls`. Mineville's accepted BedWars HUD (Bedrock 1.26.60, protocol 2225) removes vanilla chat children and adds custom chat and killfeed factories. The rejected operation previously left the scene unresolved, so Java chat showed raw `killf.` markers. Chat events now also carry `#text`, which authored rows read after replacing `hud.chat_label`'s binding with a view filter. Chat factories also supply `$chat_item_lifetime`, the native chat duration option. Without it, rows that inherit `hud.chat_label` resolve a null wait and fade after one second. The 1.26.60.5 options are 3, 10 and 30 seconds, and an untouched native profile stores index 1, so the default is 10 seconds. Rows from `hud.chat_grid_item` stay out of the notification scene because Java chat already presents them when `javaVisible` keeps a message. Evaluated privately with the exact nine-pack stack, all recorded BedWars lines resolve. Ordinary lines appear in the authored chat, and markers become killer and victim killfeed labels. An offline sweep of 14 recorded chat-factory stacks keeps Pit, Galaxite and CubeCraft unchanged and removes Enchanted's duplicate notification rows. `JsonUiProgramTest` and `HudChatUiTest` cover removal targets, sibling order, the replacement hosts and the duplicate exclusion. Native rendering of the Mineville scene was not compared.

UI files drop the `null` that Gson's lenient reader inserts for a trailing array comma. Bedrock reads that form, and MegaSMP's accepted `ui/mineville/hud.json` (Bedrock 1.26.60, protocol 2225) ends `titles_panel` controls with one. The null made title-factory selection throw, so Java drew the repeating `%obj%Tutorial [3/10]` title as a huge clipped line across the world. Across the captured MegaSMP and Galaxite stacks and the builtin UI, only that file contains such a null. Root decorations also select an authored `hud_screen` `$screen_bg_content`, which base_screen draws behind the HUD and vanilla leaves empty. They keep binding-only data panels beside drawn siblings and accept view bindings over known controller values, earlier bindings or a named source control. `UiRetainedBindings` lets a long-lived view evaluate `binding_condition: visibility_changed` only when the control's visibility changes. MegaSMP's objective panel uses this to keep the last `%obj%` title while unrelated titles arrive. A non-reference entry in an `anims` array is skipped, leaving that control static. Galaxite's hidden `scoreboard_anim.banner` declares an inline flip-book object, which previously failed the whole Prop Hunt lobby sidebar and left raw `<anim><prophunt>` and `<gems>` markers in Java's sidebar. Vanilla `anims` arrays contain only references, and the native meaning of the inline object is unverified. A private control with the shipped core, bundled UI and exact captured stacks resolves the recorded inputs. MegaSMP's title factory now draws nothing for `%obj%` text. Its root shows the objective at `font_scale_factor` 0.5 on the pack's tooltip background, and the objective remains after an unrelated title. The Galaxite lobby rows `[0]<anim><prophunt>` and `[1]<gems>70` resolve to the authored Prop Hunt images and a `70` gem label with its glyph; the shipped build resolved neither. `HudFactoryUiTest`, `HudRootUiTest` and `ScoreboardUiTest` cover the trailing comma, retained objective and inline animation; the first two new cases fail on the previous stack. Native visual parity was not compared.

Optional texture metadata no longer rejects an entire authored screen when its JSON syntax is malformed. The valid image remains available without slicing hints; valid higher-priority metadata and semantic animation validation retain their existing behavior. The Venity selector supplied the failing metadata. A small form regression covers retained pixels, texture identity and response indices. Rendered validation is recorded separately from parser behavior.

Validation: the full dependency build passes with 2,519 core tests and 1,720 add-on tests, no failures, plus Checkstyle. The 111-patch stack replays to the tested source tree. The selector is verified live with original response indices; the recorded Fate/Mace arena now has a lit floor and skylight 15 below its double barrier roof. A fresh live arena match and official-client visual parity were not established.

## Source-built presentation validation

The full four-project build passes: CubeConverter 46 tests, ViaBedrock 2,562 tests, the add-on 1,733 tests and ViaProxy 4 tests. Optional fixtures skip 336 tests in total. Tooling and offline patch validation pass.

A paired Galaxite cold replay records one form and 13 HUD payloads. The form drops from 328,862 to 5,046 bytes. HUD payloads drop from 26,984 to 752 bytes. The form retains its ID, 761 nodes, 13 interactive or tooltip controls, and every recorded path/action identity. The independent pack audit finds identical standard Java resources, fonts, source indexes and nested payload bytes.

JFR records client UI construction at 281 ms on a resource worker. Source decoding moves from the client main thread around 14.1 seconds to a resource worker around 2.7 seconds. Selected backend windows, counted without overlap, total 2.63 seconds before and 2.63 seconds after. First gameplay input occurs at 23.28 and 23.49 seconds. These single replays retain recorded packet timing and do not establish a join-latency improvement.

Direct cold, populated disk-cache and ViaProxy runs retain the known unresolved-mapping failure. A 90-second same-JVM reconnect has the same additional skin failures on both builds, with 82 installed skins, 76 geometry installs and no rejected skins. It does not establish full skin parity. The frontend builds its UI program once and confirms it on both connections. Raw traces, pack audits, JAR receipts and detailed timelines remain private under `.stackanvil/research/resource-cleanup/codex-ui/`.

An add-on-free Java run loads the custom-block supplement with ViaFabricPlus and the Bedrock add-on absent. It uses only a passive Fabric observer. All 117 baseline warning/error messages remain after normalizing download paths and hashes. The release adds two warnings from a failed Mojang profile lookup. It adds no pack or model errors; the eight known invalid models remain. The observer has no native renderer audit, as expected. This verifies the ordinary Java pack path, not a pristine official-client installation or native rendering parity.

## Once bindings and factory identity

Retained state now keeps a `once` binding's first evaluated value, including a valid empty value, for the control's lifetime; an unsupplied source stays pending. Each created title factory has its own retained state, carried to the frontend with its inputs. Event-created factory children key retained state by creation identity. Regressions cover the installed A/B/C persistent-label pair, factory retention across a subtitle update, a fresh factory, snapshot transport and concurrent/replacing factory instances. No shipped controller combines retained state with event factory instances yet. Collection recycling is unmeasured.

Confirmed container contexts retain conditioned bindings across item, cursor and toggle resolutions. Each opening gets fresh state; the cached pack template stays stateless. Native 1.26.60.5 and the installed add-on both show count pairs 2/2, 2/5, 2/blank, 2/7 and, after reopening, 7/7. Empty inventory collection counts become empty text after numeric brewing flags are computed; raw slot counts remain available to request validation. The regression supplies numeric counts and covers retained values, empty slots and a fresh opening.

Positive fixed grid dimensions bound generated cells when rescaling is disabled. The native observer draws one pair in a 1×1 grid; the add-on previously expanded 27 overlapping pairs. Capacity admission removes redundant base-grid rows in the accepted EggWars shop while preserving all 83 visible count-one action slots and their input identities, including slot 487. Dynamic rescaling retains its existing behavior. The full UI suite, container-screen tests and combined build pass; the installed observer completes and cleans up normally.

Large-inventory resolution shares immutable binding scopes instead of copying each inherited value map. Registered source controls keep their snapshots while decorated children inherit later writes. In repeated CPU controls over the accepted 549-slot shop, warmed resolution medians drop from 355–358 ms to 242 ms, with identical serialized scene hashes for all ten supplied updates. This isolates scope sharing before the separate capacity correction intentionally changes the scene. JFR identifies map copying as the dominant cost. Full scene rebuilding remains, and native frame timing is unmeasured.

Contextual furnace, blast furnace and smoker views now retain binding state across item and progress updates. Title refreshes keep that state, and new openings start fresh. Original 1.26.60.5 binding-condition instructions and compiled resolver controls establish first-evaluation retention. Regressions cover changing counts, empty slots, title updates and reopening. The full stack build passes. These controls do not establish installed cooking-screen parity or reproduce the reported inventory backgrounds, overlapping menus or lag.

Declaration array modifications follow the native resource-file boundary. A supported modification edits the same file's lower pack declaration before inheritance; a new declaration or a different file cannot use it to edit another declaration's inherited arrays. Global non-array overlays and inline/path instance behavior stay unchanged. The official 1.26.60.5/protocol-2225 control shows ADDED alone for a lower declaration without own controls, INHERITED alone for a new inherited declaration, and both labels when the lower declaration owns controls. A same-pack cross-file control keeps INHERITED. REA wire Evidence `ev_a0575a2b33d518df7d4724f7d468c016ad2d961e5346e18e761b167529af8a57` verifies the exact two resource ZIPs and their native stack order. The regression asserts these labels through raw layers, real storage normalization and exported frontend payloads, and fails on the baseline. The focused core UI suite plus cooking ownership tests passes (288 tests, 8 skipped) at the unchanged 1 GiB heap, with both Checkstyle tasks clean. An older cross-file HUD fixture now uses an explicit controls replacement to test its intended ordinary namespace overlay. Per-file provenance shares immutable published values and reuses identical declaration views. A real cooking-program memory control reduces exclusive provenance from 11,671,784 to 297,688 bytes per program without increasing the test heap. Only modification evaluation copies before editing; separate own-field views remain for genuine file differences. The combined full stack build passes. The installed add-on uses the same two resource packs and matches all four native modification panels, the retained count sequence and the fresh reopen value, with normal panels and background visible. Pack bytes, accepted stack order, staged add-on JAR and reviewed screenshot hashes are verified by REA `ev_5cead31b9acc4a6b486b5dfbd40a7423f5435ec5661dc5d91b37a6d19211bb3b`. Recipe-category tabs and avatars differ between the clients; complete visual parity is not claimed. These controls establish this array boundary and one player-inventory lifetime, not public-server background fixes, complete parser semantics, focus or collection recycling.
