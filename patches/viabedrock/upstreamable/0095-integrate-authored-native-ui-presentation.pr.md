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
- [Native block data](0054-render-native-block-state-geometry-and-materials.pr.md): Land canonical auxiliary descriptors and restriction lookup before native subtype-aware merge checks.


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
The adapter handles authored 27-slot and 54-slot chests, five-slot hoppers, and nine-slot dispensers and droppers.
Workstation actions and other native providers remain incomplete.


The full four-project build passes 2,371 tests, with 152 optional tests skipped and no failures.
A 180-second live Fabric capture reaches the Galaxite lobby and receives three game-selection forms after two responses.
It contains no container-open packet and does not exercise the new chest adapter.
Live server acceptance of that adapter remains unverified.

## Native stack queries

Recipe output admission uses the stable-registry full stack query API, `ItemRewriter.matchesStackQuery`.
It preserves wildcard auxiliary values, query-sided Block identity, numeric NBT equality, canonical restriction sets and blocking ticks.
The cooking transfer helper `14c54c010` uses comparator `14248dac0` before its action.
That helper does not establish ordinary authored container merge eligibility.

The shared query controls cover native NBT comparisons, populated userdata and output admission.
The ordinary occupied-slot predicate uses the same userdata comparator and separate stacking rules.
Independently mutated native charged children remain outside the retained network-stack representation.

## Client-authoritative redstone storage actions

Authored hopper, dispenser, and dropper buttons now use normal transactions in client-authoritative sessions.
Both authority modes share exact provider, type, size, and presentation-family checks.
The ordinary storage definitions and their opening foundation now precede their first action consumer.
Modern request-slot names remain in the deferred inventory adapter.

Actor-backed hoppers can retain the generic `CONTAINER` wire type after entity-based screen resolution.
Accept the resolved five-slot `HopperContainer` without rewriting that wire identity.
The former authoritative provider check rejected that valid combination.
Reject unrelated classes, wrong sizes, mismatched redstone families, and brewing workstations.
Require family-channel negotiation before sending these programs, and use the matching message codec.

The pinned Bedrock 1.26.51.1 `ui/redstone_screen.json` supplies the layout evidence.
Its hopper uses a five-by-one `container_items` grid.
The dispenser and dropper use three-by-three grids through the common container-item controls.
The adapters reuse the existing direct external slots and balanced ordinary transaction semantics.
This establishes implementation coverage and layout provenance, without native graphical or live acceptance claims.

All 55 targeted cases pass, with no skips or failures, and both Checkstyle tasks pass.
The new cases execute authored bindings and activation for each redstone family.
They inspect normal transaction identity, debit and credit snapshots, merge counts, tracked state, close rejection, and family codec negotiation.
Authoritative provider cases include generic-wire and explicit hopper-minecart identities.
All 104 core patches replay successfully.
Live client-authoritative acceptance remains unverified for these new families.

The complete four-project build passes 2,345 tests, with 212 optional skips and no failures or errors.
This run enables the NBT equality, populated-userdata, and cooking-admission fixtures.
Other optional fixture controls remain skipped.
All Checkstyle and publication tasks pass, and offline validation passes.

## Native occupied-slot merges


Both inventory modes now use the native occupied-slot merge predicate for authored count-one transfers.
Destination durability, typed `Unbreakable` data and constructed stack limits determine stackability.
Subtype items compare exact effective auxiliary values, including `32767` as an ordinary value.
Other items ignore auxiliary differences.
Native userdata, restriction and blocking-state comparisons remain part of merge eligibility.
Recipe output queries reuse the userdata comparator and retain their separate full identity check.

The pinned native state registration binds `button.container_auto_place_one` to state 12.
Its entry `144e4bf10` calls `144dfb400`, which invokes model auto-placement.
Base planner `1433eb800` reaches `1433e9e90` and `1433eab10`.
Occupied capacity passes through `1431b69d0` and `147c98ca0`, which calls `142488fe0` with the source first.
The executor also uses that predicate.
This linkage comes from static inspection of the verified target executable.

Fresh controls execute the complete native merge and destination stackability predicates for 756 cases.
They use real ComponentItem construction, registry ownership, binary NBT parsing and cleanup.
The matrix covers stack limits, subtype flags, durability, typed damage, unbreakable fields and auxiliary values.
Java predicate and destination-selection comparisons pass for every case.
The old raw planner fails the destination-selection regression.

These controls use standalone Item 259 without an associated Block, restrictions or a charged child.
Block auxiliary comparison uses the existing canonical descriptor resolver.
Unresolved subtype metadata cannot establish occupied-slot compatibility.
Definition replacement lifetimes, restriction hash collisions and specialized Item overrides remain unverified.
The controls do not establish complete controller execution, native wire bytes or live server acceptance.

The combined core build preserves the concurrent NBT fix and redstone provider support.
It passes 1,485 tests, with 90 optional tests skipped and no failures.
The run includes the 756 merge cases, native tag comparisons, populated-userdata controls and cooking-admission controls.
Main, test and tool Checkstyle and Maven POM generation pass.
All 104 exported core patches replay to the tested source tree.

## Inventory image failure report

The current release report shows inventory items without their panel background.
The opening action and active client screen type are unknown.
A verified failure path allowed a native container program before the converted pack loaded.
The core now keeps its ordinary menu until those resources load, without advancing presentation identity.
The shared client image loader now reports missing or corrupt pack images through the existing screen failure handler.
It preserves asynchronous remote-image loading and can recover when a new pack source supplies valid pixels.

Both regressions fail before their fixes and pass after them.
The full core build passes 1,494 tests with 90 optional skips, including the concurrent cooking return fix.
The paired add-on build passes 843 tests with 122 optional skips.
Both have zero failures or errors.
All 104 core and 38 add-on patches replay to their identical tested source trees.
Main, test and tool Checkstyle, both publication POMs, add-on access-widener validation and four patch metadata tests pass.

This fixes two asset-failure paths and does not confirm the screenshot's exact cause.
It does not establish native pixels or GUI scale parity.
The same report includes pearl/wind-charge rollback, repeated eating and a missing locator bar.
Those symptoms remain under investigation.
The capture lab cannot copy a private profile with the currently available disk space.
No new live client or server was launched for this report.


## Registry-owned custom names

Java item conversion now uses the registry's constructed class to select custom names.
Native written books fall back to `title` when `display.Name` is empty or has the wrong type.
A wrongly typed, present title selects empty custom text. Filtered fields do not replace the unfiltered name.

Component replacements keep base custom-name dispatch, even after a later legacy update.
The final network flag does not select this behavior. Removed runtime-ID owners cannot acquire custom names.
The shared selector and registry tests pass all 19 focused tests without skips, including 2,286 retained native comparisons.
Ordinary-key production, secondary labels, language selection, search transport, and authored text editing remain unfinished.


The current four-project build passes 2,644 tests, with 163 optional skips and no failures or errors.
All 104 core patches and 38 client patches replay. All three selector tests run without skips.
All 1,419 core classes match the embedded add-on and proxy copies. All 1,139 client classes match the add-on.
Four focused packaged checks pass, including the registry's book-class dispatch.
The packaged selector matches all 2,286 applicable native rows. Production class origins are verified against the current standalone core JAR.
This checkpoint does not establish full cooking search or native screen and pixel parity.
## Component description construction and conversion

The connection registry now resolves component description keys from actual construction and ordered metadata updates.
Explicit construction runs before every component reader. An existing component item accepts valid name strings from later None and Legacy entries.
Empty strings restore its ordinary description. Omitted and malformed values retain the previous name.
Unknown None entries receive their fallback class after these readers, so earlier metadata cannot name that new definition.

The builtin catalog records actual component-name dispatch separately from the factory version.
Its one default component description belongs to the warped-fungus-on-a-stick definition.
The recorded default retains that complete key. Explicit data-driven reconstruction selects the ordinary mutable component definition.
First explicit construction and final registered identity stay separate from later entry flags.

Java conversion uses these keys for mapped vanilla items and custom items through the resource text engine.
This name path uses its own registry snapshot and preserves the existing loaders for other item fields.
The superseded network-name reader and its three tests are removed. Resource-pack name parsing remains in the item-definition loader.
Custom-name presence and written-book class selection retain their separate native dispatch.

Original native execution supplies 23 final descriptions across ordered construction, update, type, empty-value, and fallback cases.
The latest authored admission control records 17 inputs, 16 actual virtual reader calls, and ten final definitions.
All 2,627 static cleanup callbacks complete without owned allocation or lock leaks.
The older thirteen-definition control supplies the remaining final descriptions.
These are authored inputs with actual native construction and getters. They do not establish normal packet identity translation or client asset precedence.

The old packaged Java converter fails twelve of twenty applicable component-name cases.
Both focused tests pass, including all 23 native results and registry snapshot/identity replacement.
Five deliberate regressions fail: filtering updates by their entry version, choosing the latest constructor, retaining a name after an empty value, applying metadata before fallback construction, and overwriting the builtin component default.

Another fresh native run executes 1,946 actual factory keys with an explicitly absent descriptor and no userdata.
Three potion methods remain deferred because they require a language owner.
All 1,949 factory profiles remain available, and the full native cleanup succeeds.
An earlier run exhausted its allocator during unrelated named-stack queries after the requested keys had run.
The verified control supplies an empty query fixture and retains the original allocator and cleanup assertions.

Full ordinary-key providers, appended primary text, secondary labels, asset precedence, cooking query transport, and unchanged authored-screen acceptance remain unfinished.

The final combined build passes 2,665 tests, with 163 optional skips and no failures or errors.
Both new tests run without skips. The three superseded reader tests are removed; their thirteen native results remain in the registry checks.
All 105 core and 38 client patches replay. All 1,427 compiled core classes match the standalone JAR after four standard token replacements.
Both embedded core copies match, and all 1,143 client classes match the add-on.
The new factory-description resource matches all three packaged copies.
The final packaged converter passes all twenty component cases, with five verified production class origins.

A fresh ordinary BDS 1.26.51.1 route passes furnace, smoker, blast furnace, and same-world reconnect.
Both selected client instances use the final add-on, and normal cleanup stops the private display.
This route does not inject the authored name-update cases or establish native screens and pixels.

## Constructor-owned ordinary names

The registry now retains 559 builtin translation keys across fourteen native methods that ignore descriptors and userdata.
These include base and alias descriptions, spawn eggs, boats, chest boats, cushions, coal, records, and fixed specialized keys.
Java item conversion resolves these keys through the current native language engine.
Explicit component construction replaces builtin naming before ordered metadata readers. Later network flags cannot select a different class.
Removed runtime-ID owners cannot retain a name.

The initialized native control queries 1,946 factory keys and retains all 1,949 constructor profiles.
It runs the real element registry initializer and completes all 2,630 static cleanup callbacks without tracked allocation or lock leaks.
Initialization corrects 118 element keys; the 559 descriptor-independent keys remain unchanged.
Three potion methods still require a language owner.

The installed 1.26.50 block archive contains exactly the 98 definitions absent from the compiled default block registry.
These are asset definitions, separate from aliases. Their presence does not establish native asset loading or final name selection.
Block, potion, and other descriptor-dependent methods still need their own providers.

Two registry tests cover all 559 native keys, construction precedence, network flags, and runtime identity replacement.
Three deliberate regressions fail assertions: guessing identifier suffixes, retaining builtin dispatch after reconstruction, and ignoring runtime ownership.

A packaged conversion control uses 2,076 typed protocol-2193 item registrations from the versioned cross-implementation resource fixture.
Its accepted language layer supplies distinct translations and exercises the real parser, lookup, converter, and text serializer.
All 557 applicable builtin names pass. Two explicitly reconstructed component items retain their separate naming path.
The previous package passes seven cases and fails 550, including 41 conversion exceptions.
The converter now handles a missing upgraded block-state set through its existing missing-visual fallback.
This control verifies supplied registry and language inputs. It does not establish fresh native packet decoding, asset precedence, or visible UI parity.

The combined build passes 2,681 tests, with 163 optional skips and no failures or errors.
All 105 core and 38 client patches replay. All 1,428 compiled core classes match their packaged bytes after four standard token replacements.
Both embedded core copies match. All 1,143 client classes and the updated factory-name resource match the final artifacts.
The final converter also retains all twenty component-description checks.
A fresh ordinary BDS route passes all three cooking families and same-world reconnect.
Both isolated launchers select the final add-on through the same installed integration instance.
Normal cleanup stops the private display and all observed owned processes. This route does not inject name fixtures or establish native screen parity.

## Descriptor-aware ordinary names

Builtin definitions now retain name providers for 41 definitions across thirteen additional native methods.
These cover buckets, dyes, written books, empty and filled maps, beds, balloons, banners, shields, medicine, glow sticks, sparklers, and boards.
Providers use constructor descriptions and variants separately from stack metadata, runtime IDs, and later factory flags.
The converter passes the actual descriptor metadata and unfiltered userdata to the registry.
Explicit component construction still takes precedence. Removed runtime owners cannot retain builtin naming.

Typed userdata reads preserve native distinctions between integers, other numeric tags, strings, absent values, and empty compounds.
Book filtering follows field presence and the constructor variant. Bucket naming uses its definition variant rather than stack metadata.
Map naming preserves exploration identities, signed map numbers, and the difference between absent and empty userdata.
Color providers retain each method's native masks, unsigned conversions, extended colors, and invalid-value defaults.

Original Bedrock 1.26.51.1 controls supply 10,906 composed results across all 41 actual registry receivers.
The base context retains 10,640 results for forty definitions. A second initialized context supplies all 266 filled-map results.
Both contexts query identical map input tuples and native methods. No expected key strings are authored for the composition.
The second context runs the complete structure-identity CRT initializer before registry and key startup.
That initialization corrects 66 cold-context map results. The other 200 map results remain unchanged.
The base context completes 2,630 cleanup callbacks; the map context completes 2,662. Both retain zero tracked allocations and locks.
The base control constructs, copies, and destroys 2,419 native userdata compounds. The map control constructs another 59 typed compounds.
These controls supply descriptor transport and userdata boundaries. They do not execute complete native descriptors, network decoding, world ownership, or client asset loading.

Another 9,089 bounded original-method controls cover typed tags, constructor variants, presence, and bit masks.
Nine focused registry and provider tests pass without skips.
Five deliberate regressions fail assertions: stack metadata as a bucket variant, numeric-tag coercion, absent/empty conflation, content-based filtered-title selection, and stale runtime ownership.

The packaged converter passes all 8,282 applicable nonnegative descriptor cases with no exceptions or missing runtime owners.
The previous package passes 1,010 and fails 7,272 under the same initialized fixture.
The control supplies a protocol-2193 registry and an accepted language layer, then exercises the real NBT parser, name provider, converter, and serializer.
It verifies ordinary item names, not final custom-name append composition or visible UI parity.
All 557 fixed-name checks and twenty component-description checks also pass against the final package.

The combined build passes 2,686 tests, with 163 optional skips and no failures or errors.
All 105 core patches replay. All 1,432 compiled core classes match the standalone package after the four standard token replacements.
Both embedded core copies match. All 1,143 client classes and the updated factory resource match the final artifacts.
Block providers and primary append composition gain the scoped coverage below.
Potion, arrow and compound providers, secondary labels, cooking query transport, and unchanged authored-screen acceptance remain unfinished.

A fresh ordinary BDS 1.26.51.1 run passes furnace, smoker, blast furnace, and same-world reconnect with the final add-on.
Both isolated launchers select that package through the same installed integration instance.
Normal cleanup stops all observed run-owned processes and the private display. This run does not inject descriptor fixtures or establish native screen parity.

## Ordinary name append composition

Production conversion now applies the native userdata append path to modeled ordinary name providers.
One implementation supplies the lazy primary selector and the underlying Java `ITEM_NAME` component.
Java `CUSTOM_NAME` keeps its separate override. Custom names still bypass ordinary production in the primary selector.
The append flag requires a nonzero byte tag. Group names precede body formatting and raw custom suffixes.
Group and color strings use the current language translator. Body formatting receives the native one-argument or two-argument color vector.
Unsupported ordinary providers retain their existing conversion path.

The target executable's I18n constructor selects the same vtable used by ordinary names.
Its two relevant slots execute the original no-argument wrapper and language-manager formatter.
A fresh control composes those virtual calls with the complete primary selector, ordinary append path, typed NBT lookups, and native dictionary lookup.
All 2,442 results match the shared implementation through the current language engine.
These include 2,286 retained selector inputs and 156 additional format, lookup, empty-value, malformed-byte, and custom-precedence cases.
The control supplies selected English table state, descriptor and tag interfaces, null shared ownership blocks, allocator/CRT calls, and single-thread locks.
It does not run the complete language constructor, asset loading, locale acquisition, native ownership lifetime, or graphical UI.

Four focused tests pass without skips. Four deliberate mutations fail assertions after successful compilation and test startup.
They admit numeric append flags, remove group precedence, skip color translation, or omit the second color argument.

Another native control executes the actual coal key method and records 39 primary and underlying ordinary name pairs.
Its supplied tables use lowercase keys and nonempty values without embedded NUL or malformed bytes, matching the language-file parser's contract.
The packaged control passes those raw files through the real parser and verifies the parsed table before conversion.
All 39 ordinary and 39 primary results match. The previous package passes six paired cases and fails 33.
Five production class origins point to the selected core package. The control uses the protocol-2193 registry and preserves builtin construction.
This establishes conversion for supplied inputs, not native packet decoding, complete asset precedence, or visible parity.

All 8,282 descriptor, 557 fixed-name, and twenty component-description converter checks remain green.
The combined build passes 2,687 tests, with 163 optional skips and no failures or errors.
Both embedded core copies retain all 1,432 classes, and all 1,143 client classes match the add-on.
The four-project build replays the complete stacks. Block, potion, arrow, compound, secondary labels, query transport, and unchanged authored screens remain open.

A fresh ordinary BDS run passes all three cooking families and same-world reconnect with the final add-on.
Both selected launcher paths resolve that package through the shared installed integration instance.
Normal cleanup stops every observed run-owned process and the private display. This run does not inject authored append metadata or establish native screens and pixels.


## Compiled block-backed item names

Block-backed builtin items now use their native constructor associations and canonical auxiliary block states to select ordinary name keys.
Generic block, leaf, wool/carpet and sapling providers preserve their separate native default and empty-name decisions.
Component reconstruction replaces builtin dispatch, and removed runtime owners cannot retain a name.
The block source stays lazy for other item methods.
Potion, arrow and compound providers remain separate work.

The compiled table retains 1,379 native block-definition keys.
All keys match the completed initialized native definition control.
All 1,343 item associations, receiver methods and applicable constructor descriptions match the completed native factory control.
Those two controls finish 2,629 and 2,630 static cleanup callbacks respectively, with no tracked allocations or locks left.
They use the supplied native version and experiment context, rather than proving later asset or client ownership.

Private block/leaf, wool and sapling controls cover 4,092 original native cases.
Four deliberately incorrect fallbacks fail assertions.
The packaged converter passes all 1,337 auxiliary-32767 cases from the native absent/sentinel equivalence control.
The previous package passes 220 and fails 1,117 under the same registry and language inputs.
Both runs report no conversion exceptions or missing runtime owners.
These results cover the declared sentinel inputs, not every auxiliary value or authored-screen pixels.
The broader 96,696-case native receiver audit continues separately; partial results do not count as completed validation.

The final combined build passes 2,703 repository tests, with 163 optional skips and no failures or errors.
All 105 core and 38 client patches replay.
All 1,441 compiled core classes match the standalone package after the four standard replacements for build constants.
Both embedded core copies match. All 1,144 client classes and both changed data resources match their final artifacts.
The four block oracle tests remain private and run against the final package.
A fresh ordinary BDS smoke check covers all three cooking families and same-world reconnect.
This smoke check does not inject authored block-name controls or establish native screen parity.

## World version ownership for potion names

Potion and arrow providers remain unimplemented. Their version source now has a bounded native control.
The target remains Bedrock 1.26.51.1, build 51061372, protocol 2193, with executable SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.

The native identity string names `LegacyClientNetworkHandler::handle(..., StartGamePacket)` at `1413323c0`.
Its copy call at `141332536` takes level settings from packet offset `30`.
The original settings copy at `1407f5740` copies the version member at offset `220` through `141e20310`.
The resulting local supplies the fifth argument of the client configure call at `1413340ab`.
The actual client constructor installs vtable `14e775c50`, whose configure slot is `18`.
The earlier `98` offset used the adjacent table's start and did not establish the caller.
Native schema registration also binds the named Base Game Version field to that settings member.

Thirty-six controls execute the complete native string parser and comparator, followed by original local-copy and virtual-dispatch instructions.
Inputs include partial versions, prerelease and build suffixes, wildcard, `beta`, malformed strings, whitespace and 16-bit component boundaries.
Native local and registered static cleanup leave no tracked allocations or locks after the parser control.
Reusing the existing loose session conversion disagrees on eighteen inputs. A fixed client-build version disagrees on twenty-four.
For example, native parsing removes a valid prerelease suffix before these comparisons and rejects a fourth numeric component.
These results reject the preserved candidate's direct use of the existing session version. Production integration needs native parsing semantics first.

The caller control supplies packet storage, frame storage, client and level holders, and the module allocation.
It executes the settings copy only through its version member, with declared boundaries for unrelated typed members.
It executes the constructor's vptr store and observes the configure entry, rather than running either complete function.
The parser uses the established allocator, CRT, OS and TLS hosting. The CFG dispatcher is also a declared boundary.
These checks do not run the packet wire decoder, complete registry initialization, game session lifetime, authored screens or visible pixels.
The earlier 2,844 potion key/I18n cases remain supplied-context evidence.
