Share immutable UI programs, domain bindings, scene contracts and accepted resource conversion. Packet integration remains in the [following patch](0095-integrate-authored-native-ui-presentation.pr.md).

Run evaluator, binding, texture and message codec tests before the transport integration.

## Cooking program prerequisite

Share the pinned furnace, blast-furnace and smoker declarations, fixed slots, recipe ordering, progress arithmetic and navigation transitions.
Keep recipe preview references separate from real inventory slot addresses.
Bounded snapshot and action contracts retain the menu, presentation and inventory revisions.
These APIs do not advertise cooking screens or replace the existing workstation controls.
The authoritative catalog, client producer and complete input handling still need integration.

Native executable fixtures cover 2,700 tab queries, 140 tab callbacks, 64 layout transitions and 176 progress cases.
The progress cases include two signed-division traps.
The fixtures supply allocation, initialized models and downstream setter boundaries.
They do not establish complete controller execution or visible parity.

The full stack replays and all four projects build.
Java verification passes 2,204 tests, with 152 optional skips and no failures or errors.
The focused cooking, transport and container suite passes all 61 tests.

The cooking controller now supplies its seven native tab and layout constants.
The pinned publisher at `0x146c44040` assigns food/items/blocks/search/inventory indices `1..5` and survival/recipe-book layouts `1/2`.
Without these globals, grouped toggles lose their forced indices during scene resolution.
The bundled-scene regression checks resolved navigation and layout groups across export/import in all three cooking families.
It fails before this change. This restores control identity; complete pointer, keyboard, controller, and visual behavior require separate evidence.

## Brewing program and counters

The pinned Bedrock 1.26.51.1 assets supply the brewing screen, three indexed bottle cells, and fixed ingredient and fuel collections.
The shared controller binds all 41 real Java menu slots and the native empty-cell images.
Bound `clip_ratio` values reach the image renderer for bubbles, brewing progress, and fuel.

An executable probe covers 994 counter cases through the original target callbacks and helpers.
All Java float bits match, including large counters and partial fuel updates with a zero total.
The fixture supplies model and world lookup seams. It does not establish native GPU or complete controller parity.

Format 4 carries workstation programs and initial counters. A separate counter payload retains signed int32 values and the presentation sequence.
Older formats reject the new family before writing bytes. Storage formats remain unchanged.

## Prepare optional built-in UI assets

Use an officially acquired package for the pinned version. The build tool reads its extracted resource packs and preserves native file contents.
Choose a fresh output path and review the verbose dry run before writing files.

```bash
bun scripts/bundle-bedrock-ui.ts "PATH_TO_EXTRACTED_PACKAGE" 1.26.51.1 assets/bedrock/1.26.51.1/assets/viabedrock/builtin_ui.zip --dry-run --verbose
bun scripts/bundle-bedrock-ui.ts "PATH_TO_EXTRACTED_PACKAGE" 1.26.51.1 assets/bedrock/1.26.51.1/assets/viabedrock/builtin_ui.zip --verbose
bun run build viabedrock
```

The tool also writes a version, size and checksum manifest. Normal builds validate it before embedding the archive.
The runtime reads the packaged archive and includes its identity in resource-pack conversion fingerprints.
The archive remains optional; accepted pack providers can supply UI definitions instead.
Keep acquired native assets private. The current tracked add-on bundles do not contain baseline UI definitions.
A build without either source cannot resolve scenes that inherit missing native templates.

## Native slider state retention

Original executable fixtures pass 184 controls on the pinned Bedrock build.
They cover thumb offsets, pointer coordinates, state selection, progress clipping and value publication.
Native named-state setters activate authored hidden hover and locked branches.
The resolver now retains those branches and their bound descendants while their inactive computed visibility remains false.
Selected-state rendering can use each descendant's own bound visibility without activating unrelated hidden controls.
Original input indices, ignored controls and missing-template behavior remain unchanged.

Twenty-one targeted resolver tests pass, including three new state-retention cases.
The original source fails two of those cases because it discards required descendants.
Tests cover conditional bindings, serialized program updates, owner visibility and scalar/step response indices.
The actual captured Settings form resolves 177 definitions, fifteen input nodes and no missing templates.
These checks do not establish live slider drawing, native GPU output or coupled input dispatch.

The final state-retention source passes a clean replay of all 98 patches.
The Java 25 core build passes 910 tests: 880 passed, 30 skipped and no failures.
Main, test and tool Checkstyle checks pass.
The private candidate contains the same verified 208-definition baseline archive as core v6.
All 37 installed artifacts and all frozen v6 files remain unchanged.
Live addon state activation and submitted custom responses still require verification before release.

## Partial definition layers

Target Bedrock 1.26.51.1 UI and the accepted server pack both define the same `common.stack_count_label`. The upper declaration changes font and offset only. Whole-definition replacement removed its label type, text, and collection bindings. The same input pattern affects the chest title, keyboard helper image, and text-entry label.

Retain lower authored members and overlay upper members at the same namespace and control name. An upper declaration without `@` retains the lower parent. An explicit parent changes that parent. Controls and binding arrays still replace their prior arrays. This behavior is inferred from the versioned inputs. The original native definition-store merge probe is pending.

Four added regression cases failed before the change. The focused resolver and form suites pass 30 cases, with Checkstyle passing. Actual accepted-pack probes restore 63 and 90 count labels with their slot provenance, plus one title label for each chest family. The title remains the tracked `container.null` text. Native title acquisition and live pixel verification remain open.

The fresh paired core candidate passes the full clean build: 919 tests passed, 30 optional skips, and no failures or errors. Main, test, and tool Checkstyle pass; all 98 patches replay cleanly. The installed artifact inventory and previous frozen candidate remain unchanged.

### Inactive form controller regression

The target native definitions declare both `form_buttons` and `custom_form`.
The current form supplies rows only for its controller. The other known
collection and its length bindings remain empty. Unknown collections and
active option collections without a parent input still fail safely.

Both actual-shaped regression cases failed against the prior core. The three
new cases and 34 existing form/shared/container cases pass after this fix.
A private CPU probe using all five captured forms, the pinned native UI and
accepted server definitions now resolves all five, including Settings and
Wardrobe. The unchanged add-on accepts their visible controls and layouts.
This verifies resolution and consumer geometry, not live payload delivery or
GPU rendering. The same-name shallow definition overlay is retained.

## Shared templates in CubeCraft inventory menus

Shared button templates can retain form collection bindings inside an inventory screen.
The inventory controller supplies empty `form_buttons` and `custom_form` collections because neither form controller exists in that session.
Unknown collection names still fail instead of silently losing controls.

Program export includes template references inside control-name variables, such as `instance@namespace.template`, and relative references in their declaration namespace.
This preserves conditional templates when the client imports the bounded program.

A private probe uses the accepted CubeCraft pack from the saved replay with the bundled Bedrock 1.26.51.1 UI.
The Skyblock homepage resolves before and after export without missing templates.
Its manual action scope retains slots 1 through 20; the six-row chest retains ordinary slot coverage.
Synthetic tests cover both controller boundaries and conditional template selection after export.
The full stack build and all Checkstyle tasks pass: 996 tests passed, 30 optional tests skipped, and no failures.
This probe verifies resolution and action identities, but does not establish live server acceptance or pixel parity.

The final 99-patch core replay and build pass 1,027 tests: 997 passed and 30 optional skips.
Main, test, and tool Checkstyle pass with no failures or errors.

## Descendant declarations and texture filenames

The captured Enchanted pack redirects the native form factory with a declaration named
`main_screen_content/server_form_factory`. The resolver previously stored that declaration
without applying it to the factory child. It selected the default native form instead.

Apply descendant declarations within the current template and instance paths. Keep shared
templates isolated between sibling instances, and include descendant declarations in exported
programs. An explicit replacement parent supplies its namespace for relative child references.
Inline instance properties remain available after that replacement.

Six original-executable cases on Bedrock 1.26.51.1 confirm the control visitor's path construction.
It appends slash-separated child names and removes their `@template` suffixes. Cases include
nested siblings, heap strings, UTF-8 names, and a literal slash in a child name. This proves
path construction, not native definition-store overlay precedence or rendered pixels. The
existing layered overlay policy remains inferred from the versioned declarations.

The same pack uses texture filenames containing `~`. Loading and scene validation now share
the bounded relative-path check, so those images and their metadata survive conversion.
Six new regression tests cover path scope, shared inheritance, replacement parents, relative
namespaces, dynamic child arrays, export/import, factory responses, and texture pixels.
The full UI test suite passes with the bundled native definitions.

The captured Enchanted forms use locally counted factories after selecting their authored
layout. The count and binding support described below lets those factories create their rows.

## Locally counted factory collections

Collection panels can generate rows from their own bound integer length or control-ID list.
They do not require a server controller to supply that collection. The controller declares
which collections contain its data; generated rows keep a separate scope. Nested form buttons
retain their original response ordinals. Missing control IDs preserve the remaining list indices,
and rows beyond controller data have no response action. Unknown collections without a local
count still fail, and generated rows remain subject to the existing scene limits.

Twelve fixtures execute the pinned client's original property update dispatcher and verify its
stored collection count. They cover integers, ID lists, ignored real-valued updates, and empty
or invalid values. The factory component is absent in these fixtures. Layout notifications and
the external dirty-event sink use observation callbacks. These checks establish count conversion,
not the complete child-factory, scheduler, or rendering lifecycle.

Eight original expression cases show that boolean arithmetic retains an integer result.
The Java evaluator now preserves that type, so predicates such as `1 * (not condition)` can
activate a factory. Explicit real-valued inputs retain their real type.

Rendered properties come from the current control's authored fields and local bindings.
An ancestor's binding data can still feed an explicit reference, but it no longer replaces
a child's own rendered text or texture. Panel texture bindings remain available as data
without being treated as panel images. Enchanted uses that pattern for button visibility.

Eight added behavioral tests cover local scope isolation, export/import, typed counts, sparse
control IDs, nested response indices, missing controller rows, and rendered-property ownership.
Controller-supplied factory events also remain available without a local count binding.
The full UI suite passes with the bundled native definitions.

All three captured Enchanted forms now resolve authored scenes. The advertisement retains
visible responses 0 and 1; both kits forms retain responses 0 through 5. A referenced
`progress.form_progress_loading_bars` template is still missing. Resolution and response
identity do not establish native visual parity.

A fresh local Java replay draws the advertisement and six-card kits layout. Escape closes
the advertisement. A real pointer click on the third kit card sends Bedrock form ID 2 with
response index 2. Transport verification passes, and all seven owned Java/display processes
stop normally. The overall rendering verifier still fails on skin geometry, model processing,
and unresolved mappings. This establishes authored drawing and client response dispatch;
it does not establish public-server acceptance or native visual parity.

All 102 core patches replay cleanly. The four full builds pass with 2,147 tests passed,
152 optional skips, and no failures or errors. Core, test, and tool Checkstyle checks pass.
Offline validation passes all 263 tooling tests and patch metadata checks.

## Upstream prerequisites

Requires [0015-transport-native-resources-and-sound-commands.patch](0015-transport-native-resources-and-sound-commands.pr.md): Land accepted native resource transport before loading shared UI programs.

## Cooking progress transport (October 22, 2026)

Cooking progress now has a separate bounded message.
It retains four signed int32 properties and binds them to the exact menu, presentation, item update and data revision.
A progress update therefore does not replace the recipe/inventory authority or restart activation.
Wire tests preserve extreme signed values and reject truncated or trailing fields.
This contract does not establish authored screen behavior or native visual parity.

Recipe-action validation now examines only paths that own recipe controls.
A missing enabled binding on an unrelated search field no longer rejects valid recipe actions.
Every active recipe path still requires known visibility and enabled values, including its ancestors.
Tests cover unrelated unknown fields, unknown owning parents and hidden controls.
This change does not supply missing search-input behavior or establish native control parity.

## Cooking command identity (October 22, 2026)

The recipe-action envelope now retains the authored primary, secondary, or tertiary input command.
Version three rejects earlier envelopes because they cannot identify that command.
Results echo the complete action, including its input mode. Wire tests cover every mode, strict flags, truncation, and unknown modes.
This contract does not establish native quantity or cursor behavior.

The complete four-project build passes 2,344 tests, with 152 optional skips.
Core Checkstyle and the mode-preserving request/result codec tests pass.
All 102 core patches replay successfully. Offline tooling and patch metadata validation pass.

## Cooking command phases

Cooking action and result envelopes use version 5 and retain the controller mode and native event phase independently of the command.
Phases `0`, `1`, and `2` remain distinct through serialization and acknowledgement.
The original state-dispatch fixtures use phase `0` for initial primary selection and phase `2` for selected-state release.
The payload does not assign physical device meanings or transfer quantities to these phases.
Phase-free version 3 actions and unsupported phase values reject instead of acquiring a default phase.

Six targeted codec tests pass, including all command/phase combinations, identity bounds, incomplete envelopes, strict reply flags, and unsupported phases.
The old codec fails the added phase-free-envelope regression because it accepts that action.
All 104 core patches replay to the identical tested tree.
The four-project build passes 2,362 tests with 212 optional skips and no failures or errors.
Core passes 1,496 tests; the add-on passes 843.
Main/test Checkstyle and offline validation pass.
All 1,386 embedded core class entries match the newly built core.
These transport prerequisites do not advertise cooking actions or complete their input and transaction backend.

## Registered recipe input evidence

A fresh private fixture runs the original service registry and scheduler startup before the base input and router constructors.
Eight native worker entries initialize their own readiness fields and reach condition waits with separate stacks and TLS.
The original scheduler publishes the queue lifetime handle; the fixture does not supply game readiness or lifetime flags.
Ordinary OS, CRT, allocation, and authored source/focus access remain explicit external boundaries.

Original recipe registration, callback cloning, callback maps, event dispatch, and phase callbacks pass 48 raw-event controls.
Another 576 controls parse typed payloads through the original JsonCpp reader and parser.
Integer collection indices survive. Real `7.0`, strings, Boolean values, and other tested non-integer types yield index `-1`.
Phase `1` retains the index, command, source, and supplied screen coordinates; phase `2` clears the retained index.

The 288 uniform-result and 96 independent-result controls preserve phase order and combine callback results with bitwise OR.
The router remains a recording boundary in these fixtures.
These checks do not establish physical input mapping, recipe-provider index validity, native selection effects, transactions, or live acceptance.
The [cooking reference](../../../docs/native-cooking-actions.md#input-event-delivery) records the raw fields and remaining boundaries.

## Bind recipe authority to the displayed cell

The scope validator previously accepted any visible recipe ID, independently of the control's collection index.
A control could name another visible recipe or omit its native index and still receive action authority.
The validator now compares both fields with the exact sorted and filtered visible collection.
It rejects missing, real-valued, negative, out-of-range, and mismatched indices.
Recipe previews retain their separate identity and cannot become inventory slot actions.

Two behavioral regressions fail against the previous implementation.
They cover cross-cell identity changes, compacted visible indices, missing fields, JSON types, and integer bounds.
The focused cooking scene, message, and action suite passes 37 tests before the final stack replay.

A fresh native fixture separately passes 240 source-resolution controls and six installed selection/release steps.
The original cooking manager, registered input graph, ingredient matcher, selected Item/name update, and release reset execute.
Matching ingredients select the output without item transfers; release clears the input state while retaining that selected output.
The fixture supplies recipe data and external game interfaces. It does not establish placement, repeated selection, full controller ownership, or live acceptance.
The [cooking reference](../../../docs/native-cooking-actions.md#resolve-recipe-event-sources) records the source map and evidence limits.

All 104 core patches replay successfully after the change.
The full build passes 2,368 tests, with 212 optional skips and no failures or errors.
Main and test Checkstyle pass, as does offline stack validation.
All 1,386 core classes match the core JAR embedded in the Fabric add-on.

A separate fresh first-placement fixture also reaches native request action assembly.
A single raw recipe click moves seven hotbar items, then five inventory items, into the empty ingredient slot.
The second Place action retains the first source's positive stack ID as its destination ID.
This result covers controlled native action objects, not complete request serialization or live acceptance.
The [first-placement reference](../../../docs/native-cooking-actions.md#controlled-first-placement) records the fixture boundaries.

## Verify repeated native placement

A fresh native process passes thirty input steps and physical snapshots across five quantity cases.
Primary selection fills the ingredient slot up to the supplied Item's capacity of 64.
Selecting the same recipe again returns its ingredients to combined player provider 12 and clears the selected output.
A third selection places the returned items again. Release preserves inventory while resetting the input state.
The fixture verifies conservation and the shared player-provider views. Cursor provider 59 remains empty.

Each six-event sequence shares one open native request. Request submission and server acknowledgments do not occur.
The full controller/model-owner, other recipe types, complete serialization, live acceptance, and visual parity remain unverified.
The [repeated-placement reference](../../../docs/native-cooking-actions.md#repeat-placement-and-return) records the quantities and implementation implications.

## Controller text in cooking programs

Cooking exports now use the same menu snapshot as the published model.
Translation discovery includes the current tab label and authoritative title.
Computed search captions can therefore use the accepted language pack after export and import.
The exporter retains language keys and the existing translation lookup.

The regression compares complete scenes and action scopes for all three cooking families.
It fails when export omits the controller label and passes with the dependency restored.
Default smoker captions still carry a Java key; their native fallback source remains unverified.
The pinned desktop search tab inherits an inline text field from `common.text_edit_control`.
Its parent follows `#is_left_tab_search`. A resolved scene from another tab did not establish the field's absence.
Native text callbacks, full input handling, and pixel parity remain open in production.
The [cooking action reference](../../../docs/native-cooking-actions.md#search-edit-callbacks) records 38 native edit/tick/clear controls and 304 search predicate controls.
The original predicate checks normalized primary names, then normalized secondary labels without formatting codes.
The primary helper selects custom or ordinary names. The ordinary secondary label includes enchantment text.
Complete name and label production, language selection, physical editing, and the field's enabled binding still need evidence.

The pinned native tab-label getter also distinguishes filtered search captions from the all-recipes caption.
Its inventory tab uses the shared crafting survival key.
The shared navigation model now retains these exact keys.
Sixty unchanged native getter controls cover all families, both filter states, valid tabs, and signed invalid tabs.
The fixture verifies ingredient descriptors against the generated target enum.
Restoring either earlier label rule fails the native comparison; the corrected model passes.
Allocation and CRT copies are bounded test boundaries.
Field producers, final translation, and pixels remain separate checks.

The final four-project build passes 2,487 tests, with 212 optional skips and no failures or errors.
The native navigation and caption suite runs without skips.
All 104 core and 38 add-on patches replay, and all 1,404 embedded core classes match.

A controlled BDS 1.26.51.1 client fixture exercises fourteen preference changes and six recipe press/release replies.
All fourteen model caption keys match the native getter cases and the shipped English table.
Eleven visible caption draws match their exported translations.
Furnace, smoker, and blast-furnace cooking and same-world reconnect pass.
Two runtime inventories match 2,520 classes and four data resources each.
Normal cleanup removes the private observer, restores the driver, and leaves no managed-profile JVM.
The scene projection removes unfinished controls and mappings, so it does not establish full default-screen or native pixel parity.


## Mode-dependent recipe focus evidence

New native controls distinguish direct recipe presses from the mode-`2` focus path.
Across 288 three-event controls, the original state-`45` entry stores the focused collection and index.
The following recipe press enters state `25` with a nonempty carried Item.
Modes `0`, `1`, and `3` retain their direct-press empty-cursor requirement.
The recipe-selection entry remains a recording boundary, so this evidence does not establish transfer effects.

Seventy-two original getter controls establish that the input mode comes from the active device's map entry.
They cover missing device IDs and entries, all four tested mode values, and colliding bucket positions.
Active-device ID acquisition, physical event production, and complete controller construction remain supplied or unverified boundaries.
The [focus reference](../../../docs/native-cooking-actions.md#mode-dependent-recipe-focus) records functions, typed inputs, and limits.

Version-five actions now transport the verified controller mode separately from command and phase.
Earlier versions reject instead of receiving an implicit mode or phase.
The core and client sessions implement initial mode-`2` focus and its owned carried-item selection path.
The Java mouse adapter supplies mode `1`; physical mode-`2` production and complete active-device integration remain unfinished.
The [transfer reference](../../../docs/native-cooking-actions.md#focused-carried-item-transfers) records the subsequent original effects and serialized requests.
Default carried-item screen controls and full native parity remain separate requirements.

The final combined suites pass 2,621 tests, with 163 optional skips and no failures or errors.
All four projects build, and the final core rerun includes the integrated movement reference fixtures.
Cooking, camera, retained particle, attachable, and Iris GPU comparisons run without skips.
All 1,413 core classes match both packaged copies, and all 1,139 production client classes match the add-on.
The affected core and add-on stacks replay successfully.

A fresh BDS 1.26.51.1 route verifies version-five mouse actions in furnace, smoker, and blast-furnace screens.
All six press/release replies retain context `1` and their original authority across newer frames.
Each real ingredient starts cooking, all three ordinary follow-up cases pass, and same-world reconnect passes.
Both runtime inventories match 2,551 project class resources and four data resources.
Normal cleanup removes the observer, restores the private driver change, and leaves no managed-profile JVM.
The controlled scene projection preserves all 39 real slots while it removes unfinished controls and mappings.
This run does not establish unchanged authored screens, physical mode-`2` input, carried-item screen support, or native pixels.

## Shared cooking search APIs

The shared UI patch now exports the query matcher, target normalizer, and raw edit-coalescing state.
These APIs do not register a channel or replace the default cooking screen.
The production menu still publishes an empty query until name producers, transport, and widget integration are complete.

`CookingRecipeSearch` normalizes the query once and requests primary names lazily.
A primary match skips the secondary-label producer. An empty query skips both producers.
The secondary branch removes native formatting codes before normalization.
The matcher does not trim spaces, split words, or substitute Java preview names.

`CookingSearchText` retains the latest pending raw string until a ready tick.
Equal edits still apply. An empty string remains a pending edit until that tick.
A guarded mode-two clear preserves applied and pending text. Other clear events discard pending text and apply an empty value.
The caller remains responsible for model-clear effects, settings refresh, physical field admission, and exact menu ownership.
Repeated native eligibility checks and full recipe-predicate state remain outside these APIs.

The target uses utf8proc 1.1.5 tables for Unicode 5.0.
All 4,352 first-stage entries, 23,296 second-stage entries, 5,618 property records, and 22,500 composition entries match the immutable target data.
The data generator uses the checksum-pinned public source and retains its MIT and Unicode notices.
Its 45,618-byte compressed resource reproduces exactly. An altered public source fails before an existing output changes.

Fresh comparisons cover 17,987 executions of the original native normalizer and 1,122,310 production Java inputs against the licensed public algorithm.
Both comparisons report zero differences. The Java cases include every code point, invalid encodings, NUL handling, and mixed composition sequences.
Eight focused tests pass without skips. Retained native controls cover 304 matching compositions, 22 edit/tick cases, and 16 clear cases.
Those fixtures supply names, labels, model interfaces, and caller effects. They do not establish production name acquisition or physical editing.
Four deliberate regressions fail: unnormalized queries, query formatting removal, early edits, and pending-text loss after a guarded clear.

All four projects build with 2,634 passing tests, 163 optional skips, and no failures or errors.
The core and client stacks replay all 104 and 38 patches.
All eight search tests run without skips in this build.
The final packaged normalizer repeats the 1,122,310-input comparison with zero differences.
Its class and resource load from the verified JAR. All 1,417 core classes match both packaged copies.
The generated data and license notices also match across the standalone core, embedded core, and proxy.
All 1,139 production client classes match the add-on.


## Unfiltered primary names

`NativeItemNames` shares custom-name presence, written-book title fallback, and ordinary appended text.
It preserves typed-byte append admission, group/body precedence, and color argument order.
The caller still owns the ordinary definition name and language lookup.
The native primary selector returns unfiltered text. Filtered display names and titles remain separate.

Fresh controls execute the original 1.26.51.1 selector `142489b10`, base custom methods, written-book predicate `143f6d580`, and getter `143f6d2c0`.
The shared selector matches 2,286 applicable native rows. Three deliberate selector regressions fail by assertion.
The controls supply typed tag virtuals, locale, component and descriptor interfaces, the allocator, and CRT boundaries.
They do not establish full registry initialization, final language selection, physical editing, or native pixels.

A separate complete native registry capture records all 1,949 constructor-owned naming dispatch tables.
All use ordinary-name method `1424ce2a0`. Only `written_book` overrides the custom-name predicate and getter.
The capture completes all 2,627 static cleanup callbacks without owned allocation or lock leaks.
Pre-packet constructor facts do not establish later component updates or full ordinary-key and secondary-label production.


The current four-project build passes 2,644 tests, with 163 optional skips and no failures or errors.
All 104 core patches and 38 client patches replay. All three selector tests run without skips.
All 1,419 core classes match the embedded add-on and proxy copies. All 1,139 client classes match the add-on.
Four focused packaged checks pass, including the registry's book-class dispatch.
The packaged selector matches all 2,286 applicable native rows. Production class origins are verified against the current standalone core JAR.
This checkpoint does not establish full cooking search or native screen and pixel parity.
