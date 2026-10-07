## Purpose

Resolve server form layouts from the accepted Bedrock resource-pack stack. Keep templates, variables, bindings, textures and response indices together in ViaBedrock core.

Ordinary Java clients receive resolved captions through Java dialogs. Clients that advertise `viabedrock:native_form` receive a bounded scene through the same connection. The renderer sends the existing form click response, preserving the original form ID and button index.

## Behavior

- Load named UI files in pack order and inherit templates without server-specific names or layout rules.
- Evaluate bounded expressions, variable defaults, collection bindings, explicit collection indices and variable-defined child controls.
- Preserve visibility, original indices and authored controls. Export accepted texture bytes with their nine-slice metadata.
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
The custom form retains its existing settings controls.
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

## Verification and limits

The full core build passes 899 tests: 869 passed, 30 skipped, no failures. Tests cover expression bounds, native results, variable defaults, hidden indices, explicit indices, texture priority, malformed metadata and the scene wire format.
Additional cases cover both form schemas, empty and null precedence, typed factories, button ordinals, HTTPS image bindings and formatted hover text. The full 98-patch replay also passes.

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
