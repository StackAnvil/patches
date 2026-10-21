Share immutable UI programs, domain bindings, scene contracts and accepted resource conversion. Packet integration remains in the [following patch](0095-integrate-authored-native-ui-presentation.pr.md).

Run evaluator, binding, texture and message codec tests before the transport integration.

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
