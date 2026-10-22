Register form, NPC, HUD and inventory presentation channels over the [shared UI program](0095-share-native-ui-programs-and-resources.pr.md). Preserve packet ordering and authoritative inventory behavior.

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

## Shared program and native container presentation

One `JsonUiProgram` now owns pack declarations, named collections, scoped bindings, inheritance, factories, textures, and language data. `FormBindings` retains the existing response ordinals and custom input state. `ResourcePackStorage`, resource conversion, and built-in cache identity use the same program.

`ContainerUi` resolves three-row and six-row chests, ender chests, shulker boxes, barrels, hoppers, dispensers and droppers from actual Java menu slots and cursor presentation. The pinned native host and panel definitions retain each variant. External cells, 27 player storage cells, and nine hotbar cells remain distinct collections. Mirrored controls retain one slot identity. Title conditions use the available raw title, not the held item. Renderer property bags retain authored durability and storage flags.

The capability `viabedrock:native_container` delivers a bounded program after the ordinary Java `OPEN_SCREEN`. Its format includes target protocol 2193, the real menu ID, connection-local presentation sequence, storage family, and raw title condition. Versions 1 and 2 retain the two chest families. The separately negotiated `viabedrock:native_container_v3` admits all eight storage variants and rejects unsupported wire identities. The complete payload cannot exceed 1 MiB. Inventory content, cursor, clicks, requests, revisions, and close packets keep their existing authority. Clients without the capability and unsupported menu families retain their original open packet. Unsupported programs do not consume sequence numbers.

Target Bedrock 1.26.51.1 declarations distinguish singleton `factory/control_name` controls from repeating `grid.factory/control_name` collections. The shared resolver handles both. Collection snapshots exist only during one resolution. Explicit cross-collection indices retain the outer scope, and custom-form dropdowns retain their owning input index.

The bounded gate passes 66 tests without failures, errors, or skips, including the three parallel NPC suites. Main and test Checkstyle pass. Actual packet serialization verifies open-before-program order, both chest families, reused menu IDs, capability fallback, truncation, protocol rejection, and combined UTF-8 payload bounds. Existing form responses remain covered.

Private versioned baseline and accepted server-pack probes round-trip both scenes and the production wire codec without missing templates. The three-row scene retains slots 0 through 62; its encoded payload is 369,553 bytes. The six-row scene retains slots 0 through 89; its payload is 201,465 bytes. These checks establish resolution and address preservation, not native pixels or live click behavior.

Native actor title and size, lock and storage metadata, transient renderers, other menu families, and direct/ViaProxy graphical input remain verification requirements. The captured Social Menu item identifiers and counts do not establish a paper-conversion defect. No licensed assets are included in the patch.

Container labels retain typed count provenance from their authored text or binding source, including variable aliases and cursor counts. A later unrelated text binding clears that annotation. The client can draw actual Java stack counts at the authored box without duplicating labels. Unrelated numeric text remains ordinary text; control names are not used as heuristics. Thirty scoped UI/form tests and main/test Checkstyle pass for this correction.

The paired core candidate passes a fresh full build with 915 tests passed, 30 optional skips, and no failures or errors. Main, test, and tool Checkstyle pass. All 98 patches replay cleanly. The private candidate includes the verified baseline archive; installed artifacts remain unchanged. Addon rendering and joined input still require live verification.

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

## HUD title factories and lazy UI preparation

Accepted HUD definitions now resolve title factories before unrelated HUD collections. Native `insert_back` and `insert_front` modifications retain authored ancestors and inherited controls. Clients that advertise `viabedrock:native_hud_title` receive the resolved scene and title lifetime. Other clients retain Java title packets. Subtitle updates preserve the title clock; clear and reset remain distinct.

The saved CubeCraft 0.0.55 pack for Bedrock 1.26.51.1, protocol 2193, supplies the title marker, subtitle image binding, top banner and alpha/wait chain. A private production-resolver check produces the clean caption, its 30-by-30 icon and normalized texture identities. It does not establish native screenshot parity. Targeted tests cover inserted factories beside unrelated grids, timing chains, title ordering and message bounds.

Actor-only storage now creates its shared JSON UI program on first UI access. This avoids decoding UI textures in each equipment or actor storage. On the saved pack, actor storage falls from 1.7 to 2.0 seconds to 80 to 91 ms. These are local preparation measurements, not total join-time guarantees. The complete core build passes 1,066 tests: 1,036 passed and 30 skipped. All Checkstyle tasks pass.

## Bound HUD opacity

The saved CubeCraft HUD binds opacity to `#alpha` and propagation to `#propagateAlpha`.
The resolver now exports both values on each control and restores local defaults for descendants.
The converted-pack identity changes so existing caches do not retain scenes with omitted bindings.
The targeted UI and HUD gate passes all 20 tests with the bundled target UI.
The remaining custom title-image report has no current scene reproduction.
These checks do not establish live server or native pixel parity.

The complete core build passes 1,153 tests with no failures; 30 optional tests remain skipped.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md): Land the shared UI program and scene contracts before registering presentation channels.


## Client-authoritative chest actions

Authored count-one chest buttons now use normal inventory transactions when the server selects client authority.
The adapter sends both slot changes with their before and after items.
It does not require modern stack IDs or wait for an item stack response.
It publishes Java prediction after transport succeeds and accepts later server slot and content corrections.

Both inventory modes use the same native runtime-ID registry, immutable definitions, constructor-owned stack limits, action scope and destination selection.
The native combined provider checks compatible occupied slots before empty slots, with hotbar slots before main inventory slots.
Activation requires the current menu and exported presentation.
Closing the menu or withdrawing its channels clears the action state.

Native constructor controls target Bedrock 1.26.51.1, build 51061372, protocol 2193.
The executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
The controls execute normal wrapper `14266bd30`, outgoing body `1427324a0` and packet constructor `14272c690` with owned ordinary item stacks.
Both boolean input cases preserve the supplied container and player slot changes and complete cleanup with balanced item lifetimes.
These controls do not verify full controller execution, authority negotiation, native wire bytes or live acceptance.
The native graphical capture stops at a Microsoft licensing-response error before a game window opens.

Targeted tests cover count conservation, unsigned stack counts, merge order, scoped activation, stale presentations, transport failure and correction before the next action.
The production codec test writes and reads normal transactions with legacy network-item descriptors.
It does not compare captured native bytes.
This first adapter handles authored 27-slot and 54-slot chest presentations.
Other native providers remain incomplete.


The full four-project build passes 2,371 tests, with 152 optional tests skipped and no failures.
A 180-second live Fabric capture reaches the Galaxite lobby and receives three game-selection forms after two responses.
It contains no container-open packet and does not exercise the new chest adapter.
Live server acceptance of that adapter remains unverified.

## Native stack queries for authored transfers

Both authority modes now use the complete network-loaded native stack query matcher.
The transfer planner passes the destination as the query and the source as the candidate.
It supports wildcard auxiliary values, query-sided Block identity, numeric NBT equality, canonical restriction sets, and blocking ticks.
Cooking output admission shares this implementation through `ItemRewriter.matchesStackQuery`.
The former cooking-specific class and API are removed.

The target native transfer helper calls comparator `0x14248dac0` before submitting the action.
Its subtype and durability rules differ from the native item-return predicates.
The planner keeps those return rules separate.
Its scope covers retained network-loaded userdata, including derived charged children.
Independently mutated native child stacks remain outside this representation.

The moved native controls pass 3,278 valid-UTF-8 NBT comparisons, 361 populated-userdata cases, and 96 output-admission controls.
A planner regression checks merge selection across blocking ticks, restriction differences, mismatched Block pointers, wildcard auxiliary values, and signed floating zero.
It also checks destination metadata, source metadata, and count conservation.
These tests do not establish full native controller behavior or live server acceptance.

The full 104-patch core stack replays, and the complete four-project build passes.
This run passes 2,342 tests, skips 212 optional cases, and reports no failures or errors.
It enables the three private native matcher fixtures named above; other optional fixture controls remain skipped.
Offline tooling, regression tests, and patch metadata validation also pass.
