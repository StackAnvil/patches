## Purpose

Resolve server form layouts from the accepted Bedrock resource-pack stack. Keep templates, variables, bindings, textures and response indices together in ViaBedrock core.

Ordinary Java clients receive resolved captions through Java dialogs. Clients that advertise `viabedrock:native_form` receive a bounded scene through the same connection. The renderer sends the existing form click response, preserving the original form ID and button index.

## Behavior

- Load named UI files in pack order and inherit templates without server-specific names or layout rules.
- Evaluate bounded expressions, variable defaults, collection bindings, explicit collection indices and variable-defined child controls.
- Preserve visibility, original indices and authored controls. Export accepted texture bytes with their nine-slice metadata.
- Normalize JPEG and TGA UI images to PNG with the existing content decoders. Retain pack priority and PNG-before-JPEG-before-TGA lookup order, and check dimensions before decoding. Resolve explicit source extensions and their metadata to the normalized image identity.
- Decode legacy `buttons` and typed `elements` through the existing form codec. Non-null `buttons` takes precedence, including an empty array.
- Keep header, label and divider collection positions separate from button response ordinals.
- Preserve public HTTPS image bindings for asynchronous client loading. Core does not fetch images on its packet or conversion threads.
- Export resolved hover text and formatting for the native hover-text renderer. Keep its authored width and response ownership.
- Include the versioned built-in UI identity in conversion fingerprints.
- Omit missing child templates as the native factory does. Fall back to ordinary forms for unsupported or oversized scenes.
- Accept an optional licensed UI archive at build time. Runtime code does not reference a local Bedrock installation.

## Evidence

Research targets official Bedrock 1.26.51.1, build 51061372, protocol 2193. Original executable controls establish native string subtraction and slicing, generated value conversion, variable precedence and missing-template factory behavior. Grid and dimension research provides further renderer evidence.

A bounded desktop capture records five actual CubeCraft forms: four action forms and one custom settings form.
All four action forms resolve against the accepted pack and licensed baseline definitions.
The custom form resolves all thirteen original content positions against the complete baseline definitions.
These packet and resolver checks do not establish native screenshots or font parity.

Original native form decoding and click routines execute four private controls on the target build.
Legacy buttons take precedence over elements; an empty legacy array wins, while null legacy buttons defer to elements.
Typed prose retains collection positions, but only buttons increment response ordinals.
The click routine converts the selected collection position to that ordinal before serialization.
Transport, allocation and text translation remain fixture boundaries.

A separate live capture confirms right-click reaches CubeCraft and opens an actor-owned Social Menu.
The old core closes that menu locally.
The repaired client retains the menu across twelve samples until a client-origin close after 1,149 ms.
The lifecycle fix belongs to the existing server-authoritative inventory patch.

## Custom forms

Clients can advertise `viabedrock:native_custom_form` separately from the existing action-form channel.
Custom scenes use format 2 and include a bounded program for the shared core resolver.
The client can update local input state and resolve the same definitions without another server request.
Older clients keep the existing action scene format and Java dialogs.

The supported types are label, header, divider, toggle, input, slider, step slider and dropdown.
Responses retain every original content position, including null entries for prose.
Nested dropdown choices retain their owning input index and option index.
The program includes language translations, texture metadata, submit and cancel commands, and widget state bindings.
Optional bindings with type `none` or `ignored` do not overwrite authored widget state.

Unsupported multiselect controls keep the ordinary form flow because the pinned form library does not expose that model.
Missing definitions, oversized scenes and client rendering errors also retain the existing Java dialog.
The explicit fallback request rebuilds that dialog from the tracked form without clearing its response identity.
Degenerate scalar ranges use this fallback rather than exporting a non-finite slider fraction.

Original custom normalization and response routines preserve null entries and typed values in twelve controlled content positions.
Private native controls also establish scalar slider fractions, raw step indices and option counts.
Scalar and step captions use the resource translation `options.sliderLabelFormat`.
A separate native callback fixture covers 36 scalar and eight step input coordinates.
Its scalar `roundf` boundary uses host finite-value arithmetic, not the official Windows CRT.
The later slider fixtures establish CPU coordinate production and thumb offsets.
Generated tick instantiation, live drawing and coupled input dispatch remain separate verification work.

Eighteen targeted core tests pass for both action and custom scenes.
The actual captured settings form resolves 177 required definitions, fifteen enabled input nodes and no missing templates.
The serialized program resolves again after a toggle state change and retains the language format.
These checks use the complete private baseline with 208 UI definitions.
They do not establish live addon drawing or submitted custom responses.
The full 98-patch replay passes.
The current core build passes 910 tests: 880 passed, 30 skipped and no failures.
Main, test and tool Checkstyle checks pass.

## Verification and limits

The full core build passes 910 tests: 880 passed, 30 skipped, no failures. Tests cover expression bounds, native results, variable defaults, hidden indices, explicit indices, texture priority, malformed metadata and the scene wire format.
Additional cases cover both form schemas, empty and null precedence, typed factories, button ordinals, HTTPS image bindings and formatted hover text. The full 98-patch replay also passes.

An actual accepted pack supplies its Loot and gifting images as JPEGs.
The previous PNG-only export omitted these images and triggered the renderer's ordinary-form fallback.
Private checks run the production resolver and resource rewriter against that pack and compare the decoded pixels of three affected images with their exported PNGs.
Tests also cover image priority across layers, TGA orientation and alpha, malformed image headers, oversized dimensions, and upper-layer replacements at the texture limit.
Valid PNG bytes retain their original encoding after a dimension check; compressed pixel data can still fail later decoding, which the client handles as an individual unavailable image.
The UI conversion revision changes the cache identity so existing conversions are regenerated.

Native GPU rendering, font metrics, dynamic binding controllers, forward control references and additional animation types remain open. If licensed base definitions are unavailable, inherited scenes can use ordinary-form fallback. Native assets and raw captures remain private.


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

## Shared program and native container presentation

One `JsonUiProgram` now owns pack declarations, named collections, scoped bindings, inheritance, factories, textures, and language data. `FormBindings` retains the existing response ordinals and custom input state. `ResourcePackStorage`, resource conversion, and built-in cache identity use the same program.

`ContainerUi` resolves three-row and six-row chest scenes from actual Java menu slots and cursor presentation. External cells, 27 player storage cells, and nine hotbar cells remain distinct collections. Mirrored controls retain one slot identity. Title conditions use the available raw title, not the held item. Renderer property bags retain authored durability and storage flags.

The capability `viabedrock:native_container` delivers a bounded program after the ordinary Java `OPEN_SCREEN`. Its format includes target protocol 2193, the real menu ID, connection-local presentation sequence, chest family, and raw title condition. The complete payload cannot exceed 1 MiB. Inventory content, cursor, clicks, requests, revisions, and close packets keep their existing authority. Clients without the capability and unsupported menu families retain their original open packet. Unsupported programs do not consume sequence numbers.

Target Bedrock 1.26.51.1 declarations distinguish singleton `factory/control_name` controls from repeating `grid.factory/control_name` collections. The shared resolver handles both. Collection snapshots exist only during one resolution. Explicit cross-collection indices retain the outer scope, and custom-form dropdowns retain their owning input index.

The bounded gate passes 66 tests without failures, errors, or skips, including the three parallel NPC suites. Main and test Checkstyle pass. Actual packet serialization verifies open-before-program order, both chest families, reused menu IDs, capability fallback, truncation, protocol rejection, and combined UTF-8 payload bounds. Existing form responses remain covered.

Private versioned baseline and accepted server-pack probes round-trip both scenes and the production wire codec without missing templates. The three-row scene retains slots 0 through 62; its encoded payload is 369,553 bytes. The six-row scene retains slots 0 through 89; its payload is 201,465 bytes. These checks establish resolution and address preservation, not native pixels or live click behavior.

Native actor title and size, lock and storage metadata, transient renderers, other menu families, and direct/ViaProxy graphical input remain verification requirements. The captured Social Menu item identifiers and counts do not establish a paper-conversion defect. No licensed assets are included in the patch.

Container labels retain typed count provenance from their authored text or binding source, including variable aliases and cursor counts. A later unrelated text binding clears that annotation. The client can draw actual Java stack counts at the authored box without duplicating labels. Unrelated numeric text remains ordinary text; control names are not used as heuristics. Thirty scoped UI/form tests and main/test Checkstyle pass for this correction.

The paired core candidate passes a fresh full build with 915 tests passed, 30 optional skips, and no failures or errors. Main, test, and tool Checkstyle pass. All 98 patches replay cleanly. The private candidate includes the verified baseline archive; installed artifacts remain unchanged. Addon rendering and joined input still require live verification.

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

## Actor-owned container titles

Select the opened actor's retained string metadata at container open. A nonempty `FILTERED_NAME` (132) takes precedence over `NAME` (4). Wrong metadata types and empty names retain the existing Java default. The title does not come from the held item or placeholder block position.

One title result supplies the Java caption and native program. The Java actor caption uses the resource language translator and existing formatting parser. The native program retains the raw title and `$localize_title` independently. Both `$container_title` and its `$thistext` alias use that raw title for authored conditions. Program import preserves these variables instead of replacing them with the translated Java menu caption. The wire format and capability remain unchanged.

Pinned Bedrock 1.26.51.1, build 51061372, protocol 2193 provides the title chain. The actor getter resolves the opened UID, rejects a removed actor, reads typed name metadata, and prefers the nonempty filtered name. Twelve original native controls establish selection, type rejection, formatting preservation, removal rejection and empty-name fallback dispatch. Level lookup, allocation and the actor's empty-name virtual return remain explicit fixture boundaries.

The original chest controller publishes the raw title with actor localization enabled. The pinned chest label reads that localization variable. Its native label loader and text consumer keep translation separate from the raw string used by conditions. The publication is linked to initial scene construction. No title-update observer is added after opening.

Physical Java custom-name translation and default captions retain their current behavior. Native custom-name captions retain the raw source with localization disabled. The original physical publisher uses a separate block predicate; its complete semantic name remains unverified. Actor size, empty-name class captions, full native admission and actual Social metadata delivery remain separate checks.

A regression through the actual `CONTAINER_OPEN` handler fails against the previous core, which emits a default caption instead of the selected actor name. Packet tests cover filtered-name precedence, empty and malformed metadata, language keys, formatting, placeholder block isolation, initial snapshot behavior and open-before-program order. UI round-trip tests keep raw title conditions while translating only the caption. Oversized native title presentation retains the ordinary Java screen.

The final clean core build passes 957 cases: 927 passed, 30 optional skips, and no failures or errors. Main, test and tool Checkstyle pass. All 98 patches replay cleanly. The 23 packet, UI round-trip and existing container lifecycle cases pass. The private title candidate contains 1,304 core entries. The installed 38 artifacts and 58 files in the frozen previous candidates remain unchanged.

A private probe uses the accepted server declarations with a supplied `cc_custom*profile` title and unrelated Java caption. The core selects `cubecraft_profile.main_panel`. The unchanged addon rejects its visible `live_horse_renderer` portrait control and retains ordinary-screen fallback. The ordinary accepted chest passes parser, 63-slot geometry and 65 image-region checks. This probe does not establish actual actor metadata delivery, coupled input or pixels.

### Resolve authored container button mappings

Container decoration now publishes resolved source, target and mapping type fields.
It also publishes the resolved boolean for an ignored mapping.
The translated inventory action and the consumer's validation see the same target.
Unknown actions remain visible to strict validation; ignored mappings remain explicit.
A scoped close button no longer sends `$pressed_button_name` to the add-on.

The regression covers both chest families, scoped action variables, ignored unknown actions and exported program replay.
Repeated resolution leaves the source program unchanged.
All 98 patches replay, and the full core build passes 965 tests with 30 optional skips.
Main, test and tool Checkstyle and POM generation pass.

An immutable candidate and the accepted d28 profile declarations pass close-action validation.
That prior profile candidate fails slot completeness: its manual grid cells lack indexed collection scope.
That candidate also produces near-zero cell widths from the authored large grid capacity.
The profile omits player inventory and hotbar controls, while admission currently requires all 63 Java slots.
The ordinary chest retains all 63 slots and 65 image regions.
No fake profile contents or actor were supplied, and no live interaction or portrait pixels are claimed.
These remaining producer, layout and subset-admission gaps require target evidence before further changes.

### Manual GridItem collection addresses

Manual grid children now receive their authored collection address before bindings run.
The original GridItem writer computes `columns * row + column`.
Its lookup takes precedence over an explicit CollectionItem index and preserves unrelated nested collection scopes.
Missing positions use the native `[0,0]` default.
Malformed, overflowing and unavailable addresses retain ordinary fallback without allocating the declared capacity.
Checked overflow is a Java work limit, not a native exception claim.

Pinned Bedrock 1.26.51.1/protocol2193 fixtures pass 16 index controls and six fresh layout controls.
Nine additional original property-reader and writer controls bind missing positions and zero dimensions.
They supply initialized component masks, references and trees; they do not execute the complete UI factory or GPU.
The core suite passes 998 cases: 968 passed and 30 optional fixtures skipped.
All 98 patches replay, and main, test and tool Checkstyle, clean build and POM generation pass.
The private core candidate contains the verified built-in UI input and 1,311 approved entries.

The accepted profile diagnostic now selects addresses 0 through 18 correctly.
Production nonempty Java stacks still lack the native `#hover_text` producer.
A separately supplied hover binding exposes unsupported `button.container_auto_place_one` mappings.
That diagnostic does not establish actual Social contents, names, actor delivery or native request semantics.
The frontend still requires full slot completeness; intentional authored subset admission remains a separate review.

## Negotiated authored container actions

Portable UI resolution now identifies the authored manual slot subset and its referenced slot identities.
Full template chests retain complete slot coverage.
The legacy presentation channel retains its exact format 1 bytes.
A separate versioned channel carries action capability, opening sequence and activation status.

The shared presentation state accepts one genuine current-menu backend interface.
Request planning, prediction, packet hooks and recovery remain in deferred inventory patch 0003, which follows ViaBedrock PR #276.
An empty opening waits for real container contents before the client prepares its authored presentation.
Closing or replacing that exact menu retires the pending presentation and action ownership.

Native item text execution supports a conservative typed custom-name and lore subset.
It preserves actual line breaks, blank lore entries and native formatting prefixes.
Default names, translation-bearing rawtext, filtering and other unsupported item fields retain ordinary fallback.
No numeric caption or server-title heuristic supplies missing hover text.

The private combined core gate passes 1,015 cases: 985 passed and 30 optional skips.
All three Checkstyle tasks, the build and Maven POM generation pass.
Tests cover codec bounds, stale and reused menus, empty opening followed by contents, backend rejection and scoped visibility.
The actual controlled named physical chest supplies separate projection evidence.
Actual actor-backed Social title timing, live Place request acceptance and native pixel parity remain unverified.

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
