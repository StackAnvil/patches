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
