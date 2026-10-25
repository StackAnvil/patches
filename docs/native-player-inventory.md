# Native player inventory

This reference supports the remaining player-inventory implementation. It describes the target renderer and the current Java integration gaps.

## Current integration

Release 0.3.53 synchronizes player-inventory preferences and preserves independent inventory and workbench layouts.
The E-key path still opens Java's inventory screen.
The native inventory asset requires `live_player_renderer`, armor and crafting collections, recipe controls, tabs and search.
The shared Java renderer now supports `live_player_renderer` through the actual local player.
It preserves separate actor, body and head rotations and applies the native model transform after Java's portrait translation.
Form, NPC and container adapters admit the new renderer. Release 0.3.54 includes these portrait changes.

## Installed-screen lifecycle

Release 0.3.55 includes the installed-screen lifecycle bridge.
The client sends an opening request after `Gui.setScreen` installs the actual inventory screen.
Constructing an unused screen does not open the Bedrock inventory.
The bridge supports direct translation and ViaProxy through the same negotiated payload.
Java creative inventory also opens the native player inventory, while its item picker retains its existing presentation.

Each installed opening receives a monotonic token for its connection.
An ordinary reopen receives a new token, even though Java retains the same player menu object.
A genuine native presentation swap retains the token.
Tokens remain monotonic across play-listener replacements and physical reconnects.
A late capability announcement does not replace an existing legacy opening or send a duplicate native request.

The Bedrock open acknowledgment does not carry this token.
The core therefore serializes openings and retains retired requests until their acknowledgments arrive.
A new screen waits for the previous native close acknowledgment.
Old screen clicks cannot replay into that new opening.
Independent global inventory actions can use a retired acknowledgment before the temporary inventory closes.
Timeout closes the matching client screen and retains the unresolved native request.

Server closes identify the owning client token through a separate payload.
A stale close cannot close a newer screen or another connection.
The bridge replaces the constructor trigger and preserves the legacy installed-screen fallback for older direct translators.
The full authored inventory layout, recipes, tabs, search and physical controller input remain unfinished.

## Controller state and collection reference

The target constructor is `0x144e0f520`. Its binding registrations use 32-bit FNV-1a hashes of the complete property names, including `#`.
The registered callback at `0x144e5b410` implements `#is_creative_mode` and calls `0x144923190`.
This shared helper checks creative mode. It does not identify the active input device.
The earlier cooking reference called it an input accessor without establishing its meaning.

The helper reads actor component `0x88d3eddf` through the original sparse registry.
Raw game type `1` returns true. Raw game type `5` returns true only when the fallback getter returns `1`.
An absent player, absent component, missing page, stale entity generation or raw value `-1` returns false.
The reference executes 640 cases through both the original helper and the registered callback, for 1,280 calls.
Actor delivery, component backing and the fallback virtual getter remain supplied interfaces.

The constructor also stores an independent profile predicate at offset `0x1319`.
Its producer compares a virtual service result with `1`; the service comes from client vtable offset `0x578`, then service vtable offset `0x70`.
The native inventory factory uses the same getter to choose the desktop root for zero and the pocket root for nonzero values.
Only value one sets the constructor predicate. Other nonzero values still select the pocket root but leave that predicate false.
This state must remain separate from effective creative mode and controller input mode.

Seven raw signed values execute the original factory selection and constructor comparison, including the native client getter at `0x145dc2800`.
The factory slice runs from `0x14052eb9c` to `0x14052ec1b`; the constructor slice runs from `0x144e0f832` to `0x144e0f86a`.
The service getter result, context backing, allocator and CRT boundaries are supplied.
These slices do not execute complete screen construction, settings acquisition, physical input or rendering.
The service's concrete type remains unverified. The client getter reads field `0xe10`, whose shared owner occupies `0xe18`.

### Layout and tabs

The original property getters select these numeric values:

| State | Value | Property |
| --- | --- | --- |
| Layout | 1 | `#is_survival_layout` |
| Layout | 2 | `#is_recipe_book_layout` |
| Layout | 3 | `#is_creative_layout` |
| Left tab | 1 | `#is_left_tab_construct` |
| Left tab | 2 | `#is_left_tab_equipment` |
| Left tab | 3 | `#is_left_tab_items` |
| Left tab | 4 | `#is_left_tab_nature` |
| Left tab | 5 | `#is_left_tab_search` |
| Left tab | 6 | `#is_left_tab_inventory` |
| Right tab | 1 | `#is_right_tab_fullscreen` |
| Right tab | 2 | `#is_right_tab_crafting` |
| Right tab | 3 | `#is_right_tab_armor` |

The constructor selects the active saved layout for inventory or workbench and retains the other layout separately.
Its default is `3` for creative inventory and `2` otherwise. Workbench always uses default `2`.
Saved `0` and positive values greater than `3` use that default. Negative values remain unchanged.
The independent constructor flag forces the default. Saved layout `3` becomes `2` outside creative inventory.
These rules do not change the raw saved preferences.

The constructor normalizes tabs too. Without the independent flag, left tab `6` becomes search tab `5`.
With that flag, input mode `3` and noncreative state select inventory/armor tabs or search/crafting tabs, according to screen type.
Noncreative fullscreen right tab `1` becomes crafting tab `2`.
The raw filtering preference remains separate from the recipe model's effective filter, which is disabled in creative mode.

The bounded constructor reference executes 3,472 combinations of layouts, tabs, filtering, both flags, screen type and controller input mode.
Each case then executes sixteen original property getters, for 55,552 getter calls.
The reference supplies model-filter updates and initial collection refresh. It disables the separate restricted-tab policy.
Full construction, restricted-tab availability, device delivery and visible pixels remain unverified.

### Ability input to recipe availability

The model predicate at `0x1434358a0` reads Instabuild, independently of effective creative mode.
The native name table at `0x1517ea2b0` identifies Instabuild as ability index 11.
The predicate uses actor component `0x68b75d48` through the original sparse lookup at `0x1401d1930`.
It reads the highest numbered layer that declares the ability, from layer five through layer zero.
The original walk-speed selection uses the same order for ability index 14.

The shared connection model now applies that priority to boolean and float reads.
Explicit false and zero values override lower layers.
Serialized application at `0x140c4d650` maps layer IDs directly to those slots and normalizes IDs above five to Base.
Each later entry replaces the same normalized layer, including clearing fields absent from the later entry.
The previous codec selected CustomCache for unknown IDs and retained the first duplicate.

The comparison decodes Java abilities before checking 729 complete native Instabuild queries, 1,305 walk-speed slices and 112 serialized applications.
The packet cases check field ownership and values in each affected layer.
The original default-type constructor, layer reset, per-entry readers and sparse actor lookup execute.
Actor-change notification is an observed void boundary. Complete Actor/Level lifetime and real game-mode delivery remain unverified.
The walk-speed slice stops before movement arithmetic uses the selected float.

Local flight prediction now writes Base, matching native setters `0x14d38ada0` and `0x14d38ae20` at component offsets `0x174` and `0x178`.
Game-mode fallback values remain in CustomCache; higher layers retain ownership.
The setter evidence comes from static decompilation, without full setter execution.
A quick Java start and stop before server acknowledgment now retains both flight requests.
The regression fails with the corrected getter and the previous CustomCache producer.

Six targeted tests also cover explicit overrides, invalid and repeated layers, and the actual Java abilities packet producers.
Three frame-history fixtures now declare their intended flying state in Base, while retaining their existing position, velocity and frame assertions.
This correction supplies a faithful shared input. Installing the player recipe evaluator and authored E-key screen remains unfinished.

The complete build replays 106 patches and passes 2,933 tests with 161 optional skips.
Checkstyle and repository offline validation pass.
The packaged core passes the six ability tests, all 34 frame tests, five retained layout tests and 83 permission/action checks.
Six deliberate ownership, codec and flight-producer regressions fail value assertions, with implementation origins verified.
All 1,522 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
All 198 assets and 1,503 core classes remain unchanged from the default-layout build.
Twelve changed nested classes retain identical declarations and instruction disassembly.
This change has no new live flight or inventory-screen capture.

### Java projection of default layouts

The Java recipe-book projection now opens for saved layout zero and positive values greater than three.
The native constructor replaces these values with layout two or three, both of which show the recipe pane.
Previously, Java retained its previous visibility and could keep the pane closed.
This applies independently to player inventory and the crafting table.
Filter changes preserve both raw saved layouts and the saved tabs.

Negative values do not select a native layout binding.
The Java compatibility projection retains its previous visibility for those unsupported values.
It does not claim to reproduce their native screen result.
The independent profile that forces a default layout remains outside this projection.

The recorded constructor slice and registered getters provide 1,480 ordinary nonnegative controls.
Both previous Java visibility states match, for 2,960 comparisons.
The packaged regression also checks incoming options, filter changes and switching between the two saved layouts.
These checks concern Java recipe-pane visibility. They do not establish authored player-screen or pixel parity.

The complete four-project build passes 2,927 tests with 161 optional skips and no failures or errors.
Checkstyle and repository offline validation pass.
All 1,522 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
All 198 assets remain unchanged from the collection-priority build.

### Logical item and recipe collections

The original initializer at `0x1431bd020` constructs 67 collection names.
The executed slice uses supplied map nodes and sufficient string capacity. Native hash insertion and string allocation remain outside this reference.
The player model requires these distinct collections:

| Native ID | Collection |
| --- | --- |
| 6 | `armor_items` |
| 12 | `combined_hotbar_and_inventory_items` |
| 13 | `crafting_input_items` |
| 14 | `crafting_output_items` |
| 15 | `recipe_construction` |
| 16 | `recipe_nature` |
| 17 | `recipe_items` |
| 18 | `recipe_search` |
| 20 | `recipe_equipment` |
| 28 | `hotbar_items` |
| 29 | `inventory_items` |
| 34 | `offhand_items` |
| 59 | `cursor_items` |
| 60 | `creative_output_items` |

Model builder `0x1434360d0` creates the item collections and four category recipe collections through `0x143438210`.
It also creates a separate search collection. These recipe collections share constructor `0x143443e50`.
The category counts use the source category's group references; search uses the complete source list.
This model construction evidence comes from disassembly. The player search source now uses definition categories from the connection registry.
The connection catalog now retains the category membership sources.
Installed-screen tick delivery, recipe availability evaluation and model publication remain unfinished.
The player screen must retain the complete catalog and recipes that need a crafting table.
A fabricated empty recipe catalog cannot establish support for the default inventory asset.

## Player search and category catalogs

This section describes the unreleased player catalog changes.

The model constructor receives the local player and stores it at offset `0x30`.
The player owns the search vector at offsets `0x600` through `0x610`.
The original rebuild routine is `0x14020ec60`.
It copies creative registry entries in their existing order and admits definition categories one through four.
An absent definition or any other category excludes the entry.
The rebuild reads the current definition byte after creative membership updates.
Item count, Java fallback identity and crafting-grid size do not select this source.

Text search, unlocks and craftability run later through separate evaluators.

The connection registry now retains each definition's category byte.
Built-in defaults come from complete native registration and cover all 1,949 factory identifiers in the existing table.
New ordinary and component definitions start at category four.
Explicit component construction replaces a built-in default before any ordered component updates.
Legacy component readers preserve this category.

For component items, a compound `item_properties` reads the integer property `creative_category` and takes its low byte.
A missing or mistyped property sets the byte to zero.
An absent or mistyped `item_properties` block preserves the previous byte.
Unknown `None` registrations receive their fallback definition after component updates.
Final runtime-ID replacement selects the surviving definition.

Creative content registers categories one through five in packet order.
The first named declaration within each category retains its icon.
Anonymous groups remain separate and use an empty icon.
Repeated named declarations and unsupported categories do not take a group slot.
Item group indices address the registered vector directly.

Membership updates the shared definition category in entry order.
The final assignment controls search admission for every variant of that definition.
A later catalog preserves categories for definitions that receive no new membership.
The complete palette, search source and category sources remain separate snapshots.
Category sources visit groups in registration order, then members in entry order.

`CreativeCatalog` retains a separate search list when `ItemRewriter` receives the server catalog.
This list uses the connection registry and preserves the admitted entries' identities, variants, duplicates and order.
The complete creative catalog remains available independently.
The search list does not discard recipes that require a crafting table.
The authored player screen and its evaluator still need integration.

Complete original creative-registry construction, content replacement, category setup, group registration and member assignment execute 186 controls.
Definition rewrites, search rebuilding and registry destruction execute too, with no remaining native allocations.
Descriptor conversion, typed item backing, item copy/destruction, diagnostics and ordinary allocator/CRT calls remain supplied boundaries.
These controls cover replacement, duplicate names, anonymous groups, unsupported categories, direct registered indices and shared definition updates.
The prior committed catalog admits two search rows after hidden membership; the corrected packaged core and native reference both admit zero.

### Native collection adapter

The unreleased catalog retains each native group icon beside its Java presentation.
`ItemRewriter.creativeCollectionSource` binds a catalog snapshot to the shared `RecipeCollection`.
The caller must supply current availability evaluation; the adapter does not invent an unlock or craftability policy.

Population copies each source stack and retains its first matching creative entry before availability evaluation.
Refreshes use that stored reference when they select a group.
The comparison uses native metadata wildcards, userdata, directional block state and restrictions.
Root quantity and network ID do not select the matching entry.
The source entry's advertised group cannot override this first match.

A header needs at least two registered members and a defined native icon.
The icon may have zero quantity.
Expansion history compares native icon identity and quantity, independently of the Java fallback item.
Anonymous groups retain empty icons and produce individual rows.

Complete original creative registration, item comparison, source assignment, bucket ordering, header construction and projection execute together in 300 controls.
Three retained-state flows also execute native header toggles and refreshes with zero-count icons.
Parsed descriptor backing, stable ordinary definitions, descriptor conversion, item copy/destruction, availability results, change notifications and allocator/CRT calls remain supplied interfaces.
The packaged comparison checks stored catalog references, collection order, eligible counts, visible rows and retained expansion.
Full player-controller lifetime, actual availability evaluation, frame delivery and visible screen behavior remain unverified.

The zero-count controls supply an icon with an existing definition.
They do not establish raw descriptor construction at zero count.

### Population into recipe collections

The unreleased `CreativeInventoryModel` owns the five creative collection buffers and their retained refresh state.
`ItemRewriter.creativeInventoryModel` binds a connection catalog with explicit per-view availability evaluation.
The installed player screen still needs to own this model and deliver its ticks.

Original provider `0x143439c20` visits search first, then construction, nature, equipment and items.
One budget covers all five sources and derives from their combined count divided by eight.
Group, member and destination cursors persist between ticks.
The model retains fixed-capacity empty rows until population replaces them with owned snapshots and catalog references.
The original collection constructor stores `-1` for an unpopulated source reference.

The executed guard consumes work only when the combined count exceeds seven.
Smaller controls retain their initial phase; the Java model preserves that behavior.
This controlled result does not establish the behavior of a fully constructed screen with a small catalog.

The call after the final write phase reports completion once.
Controller tick `0x144e168b0` then dirties the active left tab.
Dispatcher `0x144e1f430` refreshes that collection and retains the other dirty tabs.
An initial dirty tab can refresh before population completes.
Inventory tab six clears its bit without selecting a recipe collection.
Population order remains separate from the left-tab mapping.

Source assignment runs `0x1434463c0` and `0x143446410`.
It stores the first matching creative entry index, with native metadata wildcard matching and independent stack counts.
The collection then resolves that entry's group reference.
This index is not the selected entry's packet group index.
The catalog adapter retains this distinction when it supplies group identity to `RecipeCollection`.

Complete original creative setup, five collection constructors and destructors, progressive population, controller tick, refresh dispatch, ordering and projection execute together in 508 controls.
The packaged model is compared across all 9,438 frames, including row references, phases, cursors, dirty masks, visible rows and eligible counts.
The reference supplies parsed descriptors, stable ordinary definitions, descriptor conversion, item copies/destruction, labels, name/receiver lookup, availability functions, unrelated base-controller ticking and allocator/CRT calls.
Gesture, focus and delayed-action flags remain inactive during these complete tick controls.
Native allocation cleanup completes with no remaining allocations.

Three additional weak-owner flows execute 68 native frames.
They establish that a missing strong owner prevents population while ordinary dirty-tab dispatch can still run.
The Java screen's opening and retirement ownership is not integrated by these controls.
Full screen construction, raw packet/item construction, actual availability policy, rendering and physical input remain unverified.

The earlier provider-only reference retains 181 controls across 2,296 frames with independently supplied category/group/member sources.
Those broader input controls remain separate from the coherent creative-content and controller comparisons above.

The complete original search rebuild and vector growth execute 906 controls.
They cover all category bytes, absent definitions, duplicates, allocation boundaries and repeated replacement.
Item copy/destruction, allocator and CRT calls use supplied boundaries.

Separate controls execute complete component construction, binary NBT parsing, property reading and destruction.
These cover 279 inputs and five retained-update steps; the complete legacy reader preserves the constructor category for the same inputs.
Built-in registration executes with the retained versioned block bootstrap and an empty packet vector.
This establishes constructor defaults rather than a server packet baseline.
Physical inventory rendering, unlock policy, recipe solving and controller input remain unverified.

All four projects build with 2,841 tests passed, 163 optional skips and no failures or errors.
The packaged core matches 1,949 factory defaults, 563 typed-update comparisons and 906 search rebuilds.
It also retains all 7,728 original eligibility and collection/history comparisons.
All 1,471 core classes and the factory table match the embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on.

## Shared recipe collections

Release 0.3.56 includes this shared collection model.

The shared `RecipeCollection` model implements the target collection ordering and retained header expansion.
Cooking uses the same partitioner for its flat visible recipe prefix.
The player controller still needs installed-screen tick delivery, opening ownership and its availability evaluator before it can publish these bound collections.

Entries retain four stable evaluator buckets.
A contiguous catalog group moves as one run: state zero wins, then state one; otherwise the first member selects state two or three.
Unfiltered grouped refreshes skip availability evaluation.
Flat refreshes still evaluate entries and merge states one and two when filtering is disabled.
Invalid entries do not split a pending group or invoke the evaluator.
Grouped projection includes valid groups beyond the flat eligible prefix.

Grouping uses catalog object identity. Expansion history instead matches the header icon and count.
Refresh retains expanded headers across ordering and filtering changes, including an intervening flat refresh.
An explicit reset clears that history. Header expansion reports its visible position and member count.
The caller must validate the selected header before invoking this operation.
Native action admission and arbitrary item activation remain separate controller work.

The original routines are `0x143445150`, `0x143446b90`, `0x143447710` and `0x143447ab0`.
The shared Java implementation matches 4,128 original collection cases and sixteen retained-state steps.
The steps cover expansion history and groups with equal icons but different identities or counts.
Native vector allocation and cleanup execute. Item copy/destruction, icon equality, availability evaluation and external callbacks use supplied boundaries.
These checks do not establish recipe acquisition, unlocks, craftability, full controller ownership, physical input or visible screen parity.
Six focused regressions cover ordering, representative identity, filtering, invalid entries, expansion history and immutable snapshots.
The collection milestone's complete build passed 2,823 tests, with 163 optional skips and no failures or errors.
All 1,465 core classes match the embedded add-on and proxy copies; all 1,191 client classes match the tested add-on.
The packaged core repeats all 4,144 recipe comparisons with its class origin verified.

## Current recipe-row eligibility

The continuation after 0.3.56 adds a query for current row availability without refreshing or reordering its retained snapshot.
Flat collections disable evaluator states two and three.
Grouped collections disable only state two, with an exception for headers that match a retained representative by icon and count.
The exception applies to expanded and collapsed headers. It does not apply to member rows.
Representatives come from the last collection refresh; the query does not recompute them.

Original getter `0x1434461c0` supplies 3,584 cases with fresh evaluator values after collection construction.
Every captured query passes byte one to the evaluator interface.
The shared API keeps that query separate from the refresh evaluator.
It requires the caller to supply current availability and exact representative/header item comparison.
Original count checks and representative traversal execute. Item copy/destruction, icon equality and evaluator results use supplied boundaries.
Three regressions cover fresh queries, unchanged snapshots, representative identity, icon/count matching and grouped member behavior.
This query supplies presentation state. It does not authorize a recipe action or establish full player-controller support.

The eligibility milestone's complete build passes 2,826 tests, with 163 optional skips and no failures or errors.
All 1,466 core classes match both embedded copies, and all 1,191 client classes match the tested add-on.
The packaged core matches all 3,584 eligibility cases and repeats the 4,144 collection/history checks with its class origin verified.

## Registry and catalog source reference

The lookup at `0x143491110` locks an `ItemRegistryRef` and reads the registry's field at offset `0x430`.
The target's diagnostics identify `ItemRegistryRef::_lockRegistry()` and the downstream `NonOwnerPointer<CreativeItemRegistry>` access.
It copies an activation pointer, lifetime owner and source pointer.
The lookup does not test the activation byte itself; callers must still admit the returned handle.

The complete original lookup passes 192 supplied registry/owner/holder cases.
Input reference counts remain balanced. Successful copies retain the output owner.
Failed-lock diagnostic calls return false at an explicit external boundary.
The checks observe returned references before caller release.
They do not construct a registry or acquire its data from a server.

The category constructor's slice from `0x1434382ec` to `0x143438361` passes 500 capacity cases.
It sums the member-vector lengths of referenced groups, counts repeated references again and skips invalid unsigned group indices.
An absent category owner or group-data pointer produces zero capacity.
The fixture supplies category, group and member-vector backing and stops before allocation.

The original phase table at `0x14e880e90` contains these collection/selector pairs:

| Phase | Collection ID | Internal selector |
| --- | --- | --- |
| 0 | 18, search | 6 |
| 1 | 15, construction | 1 |
| 2 | 16, nature | 2 |
| 3 | 20, equipment | 3 |
| 4 | 17, items | 4 |

Disassembly of `0x143439c20` uses selector six for the full search list and the other selectors for registry category groups.
These selectors describe the internal model; they do not establish network enum values.
Complete catalog registration, recipe matching, unlocks, craftability, incremental publication and live mutation still need implementation and verification.

## Recipe collection refresh admission

Function `0x144e1f430` refreshes a dirty selected collection. It does not change or publish the selected tab.
Left tabs one through five resolve collection IDs 15, 20, 17, 16 and 18 respectively.
The corresponding dirty bit clears only after the dispatcher locks a live collection and calls its refresh receiver.
An absent lookup result, missing weak owner, expired strong count or absent collection leaves the bit set for a later retry.
Tab six clears the inventory bit without a recipe lookup. Other unsupported tab values leave the mask unchanged.
The dispatcher forwards its refresh argument without changing its 32-bit value.

The complete original dispatcher passes 2,880 cases across tab values, dirty masks, lookup results, owner state and refresh arguments.
Its switch, string handling, mask transitions and shared/weak reference operations execute through normal return.
Global-name lookup, model collection lookup and the final refresh receiver use supplied boundaries.
All observed reference counts remain balanced, and native temporary allocations are released.
This reference does not execute full controller construction, collection production, physical input or rendering.

## Target and original functions

The reference uses Bedrock 1.26.51.1, build 51061372, protocol 2193.
The binary SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.

| Function or component | Address or identifier | Role |
| --- | --- | --- |
| Live player draw | `0x148ddd910` | Reads the local actor and constructs the preview |
| Cursor delta helper | `0x148de0020` | Reads `#look_at_cursor` and the current input source |
| Body-yaw getter | `0x14207f2b0` | Reads current and previous body yaw |
| Body-yaw setter | `0x14204d890` | Writes current and previous body yaw |
| Actor rotation | Actor offset `0x228` | Stores pitch and yaw separately from yaw history |
| Body-yaw history | Component hash `0xd7f64bba` | Stores two body-yaw values |
| Head-yaw history | Component hash `0xbabe7211` | Stores two head-yaw values |

The renderer factory selects different draw functions for live player and horse controls.
The live player draw uses the local actor directly. It does not select an actor through the horse control's `#entity_id`.

## Framing and pose

The control center determines the preview position. The smaller control dimension determines its scale.
The actor rotation, body-yaw history and head-yaw history remain separate throughout the draw.

| Native state | Preview behavior |
| --- | --- |
| Standing | Uses the control center and the smaller dimension |
| Swimming or crawling | Moves the preview center upward by 20 logical units |
| Gliding | Moves the center downward by 15 units, uses 60% scale and a fixed 10-degree tilt |

Gliding takes precedence over swimming and crawling. Its actor rotation remains unchanged.
Its body yaw becomes zero, while its head yaw retains the difference between the original head and body values.

For ordinary poses, cursor deltas use the control center minus the cursor position.
Their angles use `atan(delta / 40)`.
The pitch multiplier is `-20`, the actor/head-yaw multiplier is `40`, and the body-yaw multiplier is `20`.

The cursor helper requires a true boolean `#look_at_cursor` property.
Raw input mode `1` reads the native mouse coordinates and GUI scale.
Other captured modes use a separate cursor object and two admission getters.
An absent or inactive cursor contributes zero deltas.
The admission getters' physical producers remain unverified.
The current Java adapter supplies mouse coordinates. Physical controller and touch delivery remain unfinished.

The draw temporarily changes the admitted mount's body yaw too.
The normal return restores actor rotation, both yaw histories and the mount's body yaw.

## Executed reference and limits

The private reference executes 672 original draw calls through normal return with an absent renderer result.
It covers seven pose combinations, three control shapes, eight cursor configurations, mount presence and head-yaw component presence.
The original sparse component lookups, body-yaw getter/setter, matrix arithmetic and restoration instructions execute.
Every case restores the supplied player and mount values.

The fixture supplies local actor delivery, flags, cursor admission values, matrix-stack bookkeeping and renderer-context boundaries.
Host float math supplies `atanf`, `sinf` and `cosf`.
The absent renderer result skips successful renderer submission, renderer variables and effects.
The reference does not establish GPU output, clipping, physical input delivery or visible native parity.

## Java implementation checks

The installed-screen milestone's complete build passed 2,817 tests, with 163 optional skips.
Three packaged camera regressions pass and reject four deliberately incorrect implementations.
The native comparison covers framing, actor rotation and body yaw in all 672 cases.
Head-yaw comparisons cover the 336 cases with that component present.
The prior 35 screen regressions and 1,940 UI input reference cases also pass.

Two private Java 26.3 clients verify actual entity submission at 854 by 480 and 1920 by 1013 pixels.
Their Java/native GUI scale pairs are 2/1 and 3/4.
The checks retain 36 submission samples across twelve supplied scene stages.
They cover cursor tracking, pose-specific framing and a malformed horse-style entity ID that the local-player renderer ignores.
Every observed preview draw preserves the world player's rotation fields.
Private screenshots show the local player at both viewport sizes.

These client checks supply the scene and native pose flags. They do not reproduce genuine world gliding or the authored inventory controller.
Native visible comparisons, successful native renderer variables, converted skins, equipment, emotes, GUI effects and Iris comparisons remain incomplete.
Actual mounted preview queries and seat ownership also need verification.
An isolated Java 26.3 client completes four real E-key openings through ViaProxy and Bedrock 1.26.51.1.
Two openings use survival inventory, then two use the creative picker after a server mode change.
Each receives a matching native open and close acknowledgment without an inventory click.
All four retain the same persistent player-menu object and use distinct opening tokens.
Constructing an unused inventory screen sends no native request.
Private screenshots confirm that these remain Java's ordinary survival and creative screens.

The installed-screen bridge has sixteen packaged lifecycle and codec regressions.
The full player-inventory controller and physical input delivery remain unfinished.
Direct joins, creative item actions, reconfiguration and recovery under packet delay still need live verification.
All five implementation areas and the four original bug reports remain open.

## Player search policies

`NativeRecipeSearch` shares normalized query bytes between cooking and player search.
Callers select an explicit mode. Cooking preserves primary-name formatting.
Both player modes remove native formatting from primary names and secondary display labels.
A primary match skips the secondary producer. An empty normalized query skips both producers.
Search does not remove query formatting, trim spaces or substitute Java preview names.

`PLAYER_SUBSTRING` requires the complete normalized query to occur in either normalized name.
`PLAYER_WORD_PREFIX` requires that literal match plus a prefix match between any query token and any name token.
It does not require every query token to match. Only ASCII space separates tokens.
Leading and repeated spaces produce empty tokens. A trailing space does not produce a final empty token.
Tabs, newlines and Unicode spaces remain inside tokens after target normalization.

For example, `on` matches `stone` only in substring mode.
It matches `stone onyx` in both player modes.
The query `en sto` matches `wooden stone bricks` in word-prefix mode because `sto` prefixes `stone`.
The complete query still occurs literally in that name. The query `wood brick` fails that literal check.

The pinned client is Bedrock 1.26.51.1, build 51061372, protocol 2193.
Complete original functions `0x143438780` and `0x143438da0` supply 1,136 player-search cases and 1,220 normalized word controls.
Comparisons include malformed UTF-8, embedded NULs, formatting, Unicode normalization, repeated spaces and lazy name acquisition.
Native formatting, normalization, empty-item checks, matching, vector allocation and cleanup execute.
The harness supplies name and unlock providers, raw/fallback game types, stable item definitions and standard byte/stream interfaces.
Thirty invalid-stack controls confirm that an empty query returns state one before native validity checks.
Eighteen secondary-label controls confirm the raw/fallback creative flag delivered to the name provider.
These additional controls describe native dependencies; the shared matcher does not own item admission or game mode.

The shared API returns a text match. The full player availability evaluator remains unfinished.
Native function `0x14341c4c0` installs separate search and category evaluators after collection construction.
Search combines text matching, recipe unlocking and craftability. Category views also depend on filtering and an actor ability predicate.
The ability predicate is not established as creative mode.
The player screen still needs authoritative name producers, concrete recipe matching, actual context inputs and installed-screen callbacks.
The four original reports and all five goal areas remain unresolved.

The packaged core matches all 2,660 search comparisons, including 304 retained cooking compositions.
Four deliberate regressions fail: omitting the literal check, accepting trailing empty tokens, preserving player-name formatting and requiring every query token.
The retained progressive player model still matches 508 controls across 9,438 frames.
All four projects build with 2,842 passing tests, 163 optional skips and no failures or errors.
Checkstyle passes after full replay. All 1,472 core classes match the embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on. Captures and verifiers remain private.

## Output unlocking

`CraftingDataTracker.isOutputUnlocked` reads current connection game rules, registered recipes and unlocked recipe IDs.
Disabled or unavailable `recipesUnlock` rules admit the output before lookup, as the native predicate does.
With unlocking enabled, the query uses the native output index independently of displayed recipes and ingredient placement capacity.

Registration indexes only the first fixed result. It reconstructs a count-one Item key before selecting the exact definition/auxiliary bucket.
This construction preserves associated-block resolution, metadata normalization and the native wildcard value.
Ingredient wildcard comparison does not select output-index buckets.
The query applies full native stack identity after it selects the bucket.
Root quantity does not determine that identity.

Each output bucket retains the latest recipe with a given ID, including registrations under different station tags.
Context, stack and unlock filtering happen after that replacement.
An earlier unlocked recipe cannot remain visible when its replacement belongs to another context or has different stack data.
Different output buckets retain their own replacements.

The tracker caches the private index against the catalog revision and connection rewriters.
Recipe additions, catalog clears and unlock updates invalidate that snapshot.
Each query reads current rules and unlock membership. It does not cache the unlocked result or reuse Java recipe-book visibility.
The tests also compose actual associated-block construction with the stripped-oak-wood auxiliary-eight alias and wildcard metadata.

The pinned client remains Bedrock 1.26.51.1, build 51061372, protocol 2193.
The original registration region `0x14324d3bf` through `0x14324e422` executes key construction, tree/hash insertion, replacement and rehash.
Complete output queries `0x143249b10` and `0x143249870` execute context hashing, per-query deduplication and full stack matching.
Complete functions `0x143439200`, `0x14344d180` and `0x142895850` execute rule checks, actor-component lookup and unlock membership.
Negative input auxiliaries use the original count-one constructor before the harness sets controlled quantities.
Query temporaries return to the persistent index's allocation baseline.

The reference has 589 controls. The packaged tracker and real Item rewriter match 553 ordinary controls across 1,659 unlock-state comparisons.
Four retained catalog flows add 12 update/clear comparisons.
Thirty-six missing-component controls remain native references for later screen-ownership integration.
Six deliberate regressions fail: first-registration retention, early context filtering, early stack filtering, stale index reuse, ignored rules and collapsed metadata buckets.

The harness supplies admitted static recipe objects, result getters, context/Level/actor backing, stable ordinary definitions and connection definition lookup.
Item copies/destruction, empty userdata loading, derived item refresh, clocks and allocator/CRT remain supplied interfaces.
The complete wire registration, concrete recipe-class admission, actual recipe-context production and actor-component construction remain unverified.
Nonordinary block canonicalization retains its earlier constructor evidence; these new full-query controls use ordinary definitions and controlled block pointers.

All four projects build with 2,843 passing tests, 163 optional skips and no failures or errors.
Checkstyle passes. All 1,475 core classes match both embedded copies; all 1,191 client classes match the tested add-on.

The player availability evaluator still needs concrete ingredient matching, actual context inputs, evaluator installation and screen lifecycle integration.
The four original reports and all five goal areas remain active.

## Ingredient availability rounds

`NativeRecipeCounter` counts available ingredients independently of Java placement capacity and item request authority.
The concrete recipe supplies ingredient emptiness and matching. It must contain at least one nonempty ingredient.
The original counter does not terminate for empty or all-empty ingredient vectors within the execution bounds.
The Java boundary rejects those inputs. Concrete registration and admission remain unfinished.

The counter groups source stacks by their concrete descriptor hash.
Only the first stack with a nonzero quantity for each hash determines its compatible ingredient slots.
Later stacks retain that decision, including an empty match set. Stack request IDs do not determine count eligibility.
The counter sorts groups once by compatible-slot count, then by descending aggregate quantity.
The shared `NativeSort` retains the target STL ordering of equivalent groups above the insertion-sort threshold.
Cooking priorities use the same extracted algorithm, with the original license notice intact.

Each round distributes a group's remaining quantity evenly among its unfilled compatible slots.
Earlier slots receive the remainder. Each nonzero assignment retains all contributing collection and slot references.
The smallest allocation among nonempty ingredients adds to the total.
Each active ingredient then consumes that quantity from its chosen group, including repeated consumption from a shared group.
The result retains every round, including the final partial or zero round.
Ingredient descriptor quantities do not divide allocations inside this counter. The concrete matcher can still depend on those quantities.

`InventoryTracker.craftingSources` captures the current owner's native collections in this order:

| Collection | Player inventory | Crafting table |
| --- | --- | --- |
| `CraftingInputContainer` | HUD slots 28 through 31 | Table slots 32 through 40 |
| `HotbarContainer` | Inventory slots 0 through 8 | Inventory slots 0 through 8 |
| `InventoryContainer` | Inventory slots 9 through 35 | Inventory slots 9 through 35 |
| `CursorContainer` | Optional HUD slot 0 | Optional HUD slot 0 |

The optional flag controls cursor inclusion. Both paths always include the crafting grid.
Armor, offhand and preview stacks do not enter these collections.
The producer copies stack data and rejects a missing, stale or unsupported owner.
Result slots remain collection-relative. They require translation before any future item request uses them.
`ItemRewriter.countRecipeInputs` binds the snapshots to the connection's concrete descriptor conversion and hashing.
This API does not publish a second item authority or replace placement and request admission.

The pinned client remains Bedrock 1.26.51.1, build 51061372, protocol 2193.
Complete original counter `0x14297b140` executes source grouping, matching dispatch, allocation rounds and nested cleanup.
Source descriptor construction `0x142486a70` and `0x1424d0b30`, hashing `0x1424e54b0`, and pair sorting `0x142982a00` also execute.
Source-reference construction and copying preserve actual collection names and relative slot indices.
Constructor `0x1434360d0` establishes collection order and the four-input or nine-input grid capacity.

The reference covers 755 cases, 7,282 allocation rounds and 55,549 matcher calls.
Fifty controls exercise large sorts, including comparator-equivalent groups above 32 entries.
The Java comparison checks total counts, every allocation, every source reference and exact matcher-call order.
Separate tests compose the real connection rewriter with player and table snapshots, cursor inclusion, immutable copies and owner rejection.

The harness supplies immutable source models, collection names, vectors, stable ordinary definitions and connection definition lookup.
It supplies the concrete recipe's matching interface through typed per-stack matching sets.
Ingredient descriptor types, emptiness and quantities are controlled inputs. No count or availability decision uses a supplied result.
Native temporary allocation and nested cleanup return to the ingredient baseline; final descriptor cleanup leaves no allocations.
Actual actor/provider capture, concrete recipe admission and matching, full availability evaluation, installed-screen delivery, actions and pixels remain unverified.

The packaged core matches all 755 counter controls and the six focused counter/source regressions.
Six deliberate changes fail value comparisons: ascending quantity, stable ties, repeated empty-hash matching, zero-quantity inclusion, omitted partial rounds and reversed remainder order.
The retained packaged comparisons pass all 2,660 searches, 1,671 output-unlock/update checks and 508 progressive controls across 9,438 frames.

All four projects build with 2,850 passing tests, 163 optional skips and no failures or errors.
Checkstyle passes after full replay. All 1,483 core classes match both embedded copies; all 1,191 client classes match the tested add-on.

The four original reports and all five goal areas remain active.


## Player output availability count state

`NativeRecipeCounter.availability` evaluates admitted output candidates in native priority order.
It skips candidates that require a crafting table when the player uses the two-by-two grid.
A complete ingredient count returns state zero with filtering, or state one without filtering.
A positive allocation for any nonempty ingredient retains partial state two across later alternatives.
Otherwise, the retained selected stack can supply state two. A different selection returns state three.
Partial input skips the selected-stack query. Invalid output skips the entire decision.
This calculation is separate from placement capacity and stack-request authority.

`ItemRewriter.playerRecipeAvailability` captures the current owner's grid, hotbar, inventory and optional single cursor slot.
Valid-output queries reject stale owners and exclude armor, offhand and preview slots.
Its selected-stack comparison uses the connection's native stack identity.
The recipe owner must supply admitted candidates, their priority, their concrete grid requirement and its retained selection.
The API does not infer those values from a network recipe type.

The native reference executes the complete original `0x143439420` output-count evaluator in 1,344 controls.
It executes output lookup, priority sorting, grid requirements, cursor enum/model-map lookup, concrete matching, the full counter and selected-stack comparison.
The controls include 33-, 41- and 65-candidate sorts and compare exact counter visitation.
They execute 2,916 counter calls and 18,918 matcher calls.
The Java comparison uses the real current-owner source bridge and resolved ordinary ingredient matching.

The reference supplies context tags, stable ordinary definitions, model/vector backing, one output-vector getter and registry/CRT services.
Other tested virtual methods use copied original shaped/shapeless tables.
Evaluation temporaries return to the retained backing baseline.
Complete registry retirement, wire admission, tag/Molang payloads, actor/controller capture and visible screen publication remain outside this control.

The complete installed player recipe evaluator remains unfinished.
Output-candidate acquisition, descriptor ownership, search/unlock policy and model publication remain integration work.
The authored E-key screen and the original background/scale report remain unfinished.

The complete four-project build passes 2,936 tests with 161 optional skips.
Checkstyle and repository offline validation pass.
The packaged core passes the three availability tests and 128 retained ability, frame, layout and permission/action checks.
Seven deliberate priority, table, partial, selected-stack, filter and source-bridge regressions fail value assertions, with implementation origins verified.
All 1,523 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
All 198 assets and 1,509 existing core classes remain unchanged from the ability milestone.
Eight changed nested classes retain identical declarations and instruction disassembly. The candidate record is new.
No new live inventory-screen capture ran for this change.

## Resolved ingredient matching

`RecipeIngredientMatcher` implements the shared native Recipe matcher after ordinary descriptors resolve.
`ItemRewriter.matchesResolvedRecipeIngredient` supplies connection descriptor conversion and canonical associated block ownership.
`countResolvedRecipeInputs` combines that matcher with current-owner snapshots and the verified counter.
The input vector retains null keys as empty ingredient positions. The counter still requires at least one nonempty ingredient.
Outer ingredient quantities do not change this resolved matcher or divide counter allocations.

The source guard runs before the matcher converts the stack.
An `ench` ListTag rejects the source, including an empty list. Other `ench` tag types do not activate that guard.
A nonzero `minecraft:item_lock` ByteTag also rejects the source. Zero ByteTags and other tag types do not activate that guard.
Cooking now shares these guards through the same helper.

An empty ingredient matches an empty source descriptor only when source userdata is absent.
A present empty CompoundTag remains distinct from absent userdata in this matcher.
Nonempty descriptors retain wildcard auxiliaries and canonical associated block comparison.
These rules belong to Recipe source matching. The separate shaped and shapeless grid matchers use different paths and keep their existing behavior.

The counter still caches the first nonzero stack's match result for each descriptor hash.
If that first stack is enchanted or locked, later ordinary stacks with the same hash remain unavailable.
If the first stack passes, later enchanted or locked stacks with that hash still contribute their quantities and source references.
Repeated source eligibility checks would change native counts.

The original shaped factory `0x1432697f0` installs vtable `0x14e872280`.
The shapeless factory `0x14326a0a0` installs vtable `0x14e872300`.
Both tables select source matcher `0x14297a2e0` and descriptor comparison `0x14297a710`.
Both return true from virtual slot `0x50`, which activates output validation in registration `0x14324b590`.
This table evidence does not establish complete wire admission or every recipe class.

The reference executes the original Item constructor before it supplies typed userdata.
That constructor clears the Item reference at zero quantity. Earlier raw zero-quantity seeds did not represent that construction and were corrected.
Original CompoundTag lookups `0x142548a90` and `0x142548b90`, descriptor construction/comparison, and the complete counter execute.
The capture contains 1,443 direct matches and 260 counter controls with 496 rounds and 3,305 matcher calls.
Thirty-nine shapeless controls also match the shared path.
Separate Java tests cover lazy conversion after source guards, real owner snapshots, empty positions and canonical associated block ownership.

The harness supplies typed tag trees and metatype getters, stable ordinary definitions, registry lookup, source model backing and allocator/CRT interfaces.
Temporary native descriptor and counter allocations return to their baseline.
The capture does not execute binary NBT loading, complete source Item retirement, native actor/provider capture, installed screens, actions or pixels.

The packaged core matches all 1,703 direct/counter controls and the three focused integration regressions.
Six deliberate regressions fail value comparisons: ignored enchantment lists, rejected non-list enchantment tags, rejected zero locks, ignored empty userdata, exact-only metadata and repeated source eligibility.
The retained 755 counter controls, 2,660 searches, 1,671 unlock/update comparisons and 508 progressive controls across 9,438 frames also pass.
All four builds pass with 2,854 tests, 163 optional skips and no failures or errors. Checkstyle passes.
All 1,485 core classes match both embedded copies; all 1,191 client classes match the tested add-on.

Deferred wire names require another resolution stage before this API can consume their results.
Original resolver `0x142522910` can select a runtime alias descriptor or fall back to a block definition.
Treating every wire name as an ordinary Item key would skip those branches and can misclassify empty ingredients.
The model below implements deferred names and alias behavior against explicit registry interfaces.
Production registry acquisition, tag/Molang payload resolution, full wire admission, actual recipe contexts and installed availability remain unfinished.
The four original reports and all five goal areas remain active.


## Deferred names and complex aliases

`NativeRecipeDescriptor` retains empty, ordinary, complex-alias and deferred values.
Name resolution narrows the requested auxiliary to a signed short before selecting a branch.
Only a wildcard request can select a registered complex alias before ordinary name lookup.
Ordinary lookup can rewrite the auxiliary. The resolver narrows that result before associated block validation and clamps it afterward.
A found Item with an invalid associated block state resolves empty. It does not fall back to another block.
An absent Item can use block fallback, which produces a wildcard descriptor independently of the requested auxiliary.
An empty name resolves empty without registry queries.

Each ingredient position owns its deferred value.
The first query retains the resolved descriptor, including a missing result.
Source guards and source descriptor conversion precede deferred source matching.
The native clone and wrapper conversion establish this ownership and mutation behavior.
A complete recipe loader still needs to create and retire these values with their native owners.

Alias representatives, emptiness and matching are separate data.
The representative can exist while every alias member is unavailable. It does not become an implicit member.
Emptiness enumerates current members and requires a definition other than `minecraft:air`.
Matching enumerates current members independently and compares their definition IDs with wildcard metadata.
An air-only alias can therefore count as empty yet match an air definition.
An ordinary air descriptor also retains its identity while its emptiness predicate returns true.
The model preserves those results instead of replacing every empty descriptor with a null key.
Member enumeration and lookup stay live and stop at the first qualifying member.

The rich `ItemRewriter.countResolvedRecipeInputs` overload requires a complete native registry context.
It combines these descriptors with copied current-owner sources and the shared matcher/counter.
The counter now queries emptiness during each minimum and consumption phase after source matching.
An early cached active-slot vector changed native lookup phases and could hide changing alias membership.
Default descriptor double dispatch also visits the candidate first. The source matcher now retains that block-query order.
The separate generic key API retains its own query contract.

The reference executes complete resolver `0x142522910`, legacy/default constructors, alias construction, enumeration, matching and wrapper emptiness.
Original deferred clone `0x142521bc0` owns the copied name and auxiliary before counter evaluation.
Native air predicate `0x142525430` reads the definition name independently of its numeric ID.
The original global initializer supplies the `minecraft:air` symbol used by that predicate.
Original string/hash construction, allocation, result destruction and counter cleanup execute.
The capture covers 1,904 resolution/emptiness controls and 4,032 descriptor comparisons.
A separate 220-case mixed counter capture covers 514 rounds and 1,179 registry calls.
It checks total counts, every round and source reference, and exact lookup order through deferred resolution and repeated emptiness queries.
All post-resolution ingredient payloads and counter temporaries are destroyed, leaving no tracked native allocations.

The captures supply registry name lookup and auxiliary rewriting, alias existence, representatives, member vectors and member lookup.
They also supply BlockLegacy fallback/state interfaces, stable ordinary definitions, typed source backing and allocator/CRT/TLS services.
The mixed counter corpus uses ordinary sources without associated blocks; associated block controls remain in the resolver corpus.
Diagnostics use a supplied boundary and are excluded from Java lookup-order comparisons.
These controls do not establish actual registry acquisition, full block/registry implementations, wire admission, actor construction or complete source Item retirement.

The packaged core matches both corpora and three focused rich-descriptor integration regressions.
Nine deliberate changes fail value or lookup-order comparisons, including early emptiness caching and repeated deferred resolution.
The retained counter, source matcher, search, unlock and progressive-model comparisons also pass.
All four builds pass with 2,859 tests, 163 optional skips and no failures or errors. Checkstyle passes.
All 1,493 core classes match both embedded copies; all 1,191 client classes match the tested add-on.

The registry interface has no default empty tables or replacement data.
The ItemRegistry section below supplies built-in alias registrations and ordered member names.
Production must still supply auxiliary rewriting, live definition ownership and block fallback from the same native context.
Tag/Molang resolution, recipe contexts, installed evaluators, screen lifecycle, physical input, actions and native pixels remain unfinished.
The four original reports and all five goal areas remain active.


## Constructor-owned ItemRegistry aliases

The connection ItemRegistry now exposes native alias admission and ordered member names.
It loads 89 name redirects and 60 complex aliases with 561 member names from the pinned target.
Each getter applies one exact redirect before reading the complex table.
It does not qualify names, parse legacy metadata or follow redirect chains.
An unregistered name returns the native empty member list. Missing or mismatched asset data fails immediately.

ItemRegistry aliases have their own registrations and member order.
For example, the ItemRegistry `wood` group places all ordinary woods before stripped woods.
It also includes item groups such as boats, buckets, dyes and spawn eggs.
Its `double_stone_slab` redirect selects `stone_block_slab`.
The block registry and restriction tables cannot supply these ItemRegistry queries.

The reference executes complete original ItemRegistry initialization `0x143480dc0` after native vanilla block and state construction.
It uses target 1.26.51.1, build 51061372, protocol 2193, the original 1.26.50 BaseGameVersion and owned default Experiments.
The empty parsed network vector establishes constructor-owned data before packet updates.
It does not establish normal server packet contents or wire admission.
All 60 aliases also have constructed native factory definitions at that point.
Input, registry, TLS, static and CRT cleanup finish with no remaining native allocations or held locks.

The alias predicates and member getters expose names. The model below supplies metadata callback rewrites separately.
Ordinary named lookup can use a redirect with metadata, then a complex-alias callback, and reset the auxiliary after that callback.
Each alias's ordered members do not define that callback's metadata mapping.
Live member and representative ownership, full ordinary definition lookup, block fallback and complete Java registry construction remain unfinished.
The rich descriptor model still requires that complete registry context before installed recipe evaluation can use it.
All four original reports and all five goal areas remain active.

The packaged connection registry matches all 2,127 original getter controls, including 86 registered results and 767 member-name comparisons.
The controls query every constructed factory key and both names in each native redirect.
Three deliberate changes fail value comparisons: ignored redirects, reversed member order and substituted block tables.
The retained descriptor, counter, source matcher, search, unlock and progressive-model comparisons also pass.
All four builds pass with 2,860 tests, 163 optional skips and no failures or errors. Checkstyle passes after full replay.
All 1,495 core classes and the alias asset match both embedded copies; all 1,191 client classes match the tested add-on.


## Native name parsing and metadata rewrites

`NativeItemName.parse` produces a name and auxiliary value before definition lookup.
It preserves ASCII case folding, native colon fields, tile-prefix removal and numeric suffix rules.
Empty input produces no query. Invalid or out-of-range numeric suffixes retain the incoming auxiliary.
The second-field digit test reads a C string from that field's start, including later colon fields until a NUL.
A namespaced third field accepts a C-locale numeric prefix. It does not require the complete field to be numeric.

`ItemRegistry.rewriteLegacyName` accepts an already parsed query after the caller checks the priority name map.
It applies one name redirect, or the metadata-qualified redirect when no direct redirect exists.
It parses the redirect target and then applies that target's complex callback.
It does not follow another name redirect.
For example, `minecraft:double_stone_slab` with auxiliary 3 becomes `minecraft:cobblestone_slab` with auxiliary 0.
Stopping at `minecraft:stone_block_slab` would omit the callback.
Each callback clears the auxiliary after selecting its target, even when the selected name remains equal.
Keep deferred wildcard alias selection on its earlier raw-name path.

The pinned asset now requires all 60 callback definitions.
Thirty-eight callbacks index their registered members. The other 22 use 439 explicit metadata values and native default targets.
Preserve signed-short callback arguments, the low-byte guards and the signed remainder rules.
Missing callback data fails instead of selecting an inferred member rule.
Some high-word metadata combinations pass a native byte guard but index outside its vectors.
The Java fallback rejects those unsupported inputs explicitly. Complete caller admission remains unfinished.
These guards do not establish a normal native result for the excluded inputs.

The reference executes complete parser `0x140ad1110` and name/auxiliary rewriter `0x1434735e0` after actual block/state and ItemRegistry construction.
It supplies read-only UTF-8 caller backing, allocation services and ordinary C-runtime imports.
The supplied numeric import follows the [Windows C-runtime conversion contract](https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strtol-wcstol-strtol-l-wcstol-l?view=msvc-170).
Native conversion dispatch, range checks, name parsing, redirects, alias callbacks and owned string retirement still execute.
The capture covers 2,501 parser controls and 22,917 rewrites. It records 46 unsupported callback input combinations separately.
Input, registry, TLS, static and CRT cleanup finishes with no remaining native allocations or held locks.
A separate primitive parser capture also matches 552 controls.

The shared registry now resolves saved names to constructed definitions, including both secondary maps and independent numeric owners.
Complete recipe admission, member/representative integration, actual Item construction and registry retirement remain unfinished.
The rich descriptor Registry still requires that integration before installed availability can use it.
All four original reports and all five goal areas remain active.

The packaged core matches all 2,501 parser controls, 22,917 rewrites and 46 explicit unsupported-index guards.
Nine deliberate parser or callback changes fail native value comparisons.
The 2,127 alias getter controls and three retained alias regressions also pass, along with the earlier descriptor, counter, search, unlock and progressive comparisons.
All four builds pass with 2,862 tests, 163 optional skips and no failures or errors. Checkstyle passes after full replay.
All 1,498 core classes and the alias asset match both embedded copies; all 1,191 client classes match the tested add-on.


## Live definitions and runtime-ID ownership

Native named definitions and numeric lookup owners have separate lifetimes.
A runtime-ID collision does not remove either named definition.
The earlier Java registry removed colliding names through its bidirectional ID map.
A packaged reproduction confirmed this mismatch. The runtime now retains both named definitions and selects numeric owners separately.

The reference uses 20 explicit typed ItemData registrations under the same pinned target, version and experiment configuration.
These synthetic controls cover repeated names, colliding IDs, constructor classes, invalid IDs and metadata aliases.
They do not establish a normal server packet baseline.
Original block/state construction, complete ItemRegistry initialization, named/numeric ItemStack construction and all destructors execute.
Read-only observations record named maps, numeric maps, strong ownership vectors and the definition selected before stack initialization.
The harness supplies typed input backing and ordinary allocator, CRT, TLS and OS interfaces.

| Control | Retained named definitions | Final numeric owner |
| --- | --- | --- |
| Two custom names use ID 30010 | Both names remain | `test:second_id` |
| A custom name uses apple ID 257 | Both names remain | `minecraft:apple` |
| A component item uses coal ID 304 | Both names remain | `minecraft:coal` |
| Bucket receives IDs 30026, then 30027 | The bucket definition remains | ID 30026 has no owner, ID 30027 owns bucket |

A named stack can retain a different definition from the initial named lookup result.
For `test:first_id`, lookup selects its own definition, then numeric initialization selects `test:second_id`.
The stack retains quantity one and auxiliary three in this control.
The apple and coal collisions follow the same sequence.
These observations rule out a single bidirectional map as the complete definition model.
They do not establish a general last-registration policy for numeric ownership.

Invalid network ID `-1` also differs from missing construction.
The Legacy and DataDriven controls retain auto-assigned definitions at IDs 858 and 857, respectively.
The None control with that ID constructs no definition.
The invalid stick update preserves the builtin definition at ID 323.
Repeated custom constructor declarations retain the first selected class in these controls, independently of later declared versions and runtime IDs.
Four additional definitions remain in the native spare ownership vector, including replaced planks and wood definitions.

A DataDriven class alone does not select the priority name map.
All component controls occupy the ordinary map at registry offset `0x98`.
The priority map at `0xd8` and the fallback map at `0x118` remain empty in this capture.
The DataDriven `minecraft:planks` definition therefore does not bypass its ordinary metadata alias.
Named stack construction with auxiliary three still produces `minecraft:jungle_planks` with auxiliary zero.
That capture did not exercise nonempty priority-map registration.
The populated constructor control below adds both secondary maps.

The observation at the return from `0x143ee0830` contains only air.
It does not establish a complete builtin snapshot.
The later observation, before runtime-ID reassignment, contains 1,954 ordinary definitions and four spare definitions.
Final state contains 1,958 ordinary definitions and 1,967 numeric map nodes, including 12 nodes with no owner.
Only 1,955 distinct definitions own a numeric lookup entry after the three collisions.
Map node counts therefore do not measure live definition counts.

The reference completes 150 named and 1,987 numeric ItemStack controls.
Native input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.
Stack auxiliary and quantity observations use offsets `0x20` and `0x22`, respectively.
At that checkpoint, these controls established native ownership behavior and a packaged Java mismatch. The production correction appears below.

The implementation requirements at that checkpoint included separate definition identity, advertised IDs and numeric lookup ownership.
It must account for constructor order, retained spare definitions, alias lookup and block construction before exposing a complete recipe Registry.
The registry API change requires an audit of existing wire-ID consumers.
Exact wire admission, recipe contexts, actor ownership, installed screens, physical actions and pixels remain unfinished.
All four original reports and all five goal areas remain active.


## Constructor staging and secondary names

The shared registry foundation owns definition construction, saved-name parsing, alias getters, metadata callbacks and their tests.
These APIs precede recipe and active-use consumers in the patch stack.
The recorded builtin and component contexts have coupled coverage. Complete recipe integration and other version/experiment contexts remain unfinished.

The empty-input reference separates three constructor phases.
The ordinary map first owns air at ID -158. A separate staging map holds 1,241 definitions.
After the staging drain, block registration creates another 707 definitions.
The final registry contains all 1,949 definitions in the factory metadata asset. Its constructor counter remains 850.
These counts describe the recorded version and experiment configuration, rather than normal server packet contents.

Staging keys and canonical definition names differ in 119 entries.
For example, the raw key `element_39` refers to a definition named `minecraft:element_39`.
Constructor selection queries the raw staging key. Normalizing these keys together changes that lookup.
The later block-registration callback also queries current numeric and named owners before it constructs or associates an Item.
The constructed-registry implementation below now uses these inputs and executed predicates.

A further 31-entry control distinguishes raw staging selection from ordinary name replacement.
Input `element_39` removes its raw staged key and retains the component definition under `minecraft:element_39`.
Input `minecraft:element_40` leaves its raw staged key present. The staging drain later replaces that component definition with the builtin.
The replaced component definition remains in the main ownership vector, despite losing its named lookup entry.
A DataDriven air registration also retains the original ordinary air definition and places the new component definition in the spare vector.
The constructor model therefore needs more than a first-version map.

Explicit component and Legacy definitions for `minecraft:birch_standing_sign` and `minecraft:polished_basalt` survive the later block phase in these controls.
A None declaration for `minecraft:nether_gold_ore` receives its builtin block definition before runtime-ID assignment, despite its component flag.
The capture completes 234 named and 2,006 numeric ItemStack controls and releases all native allocations and locks.
These controls use empty component data. Full component predicates and wire admission remain unfinished.

The populated reference supplies 24 explicit typed ItemData registrations and exercises both secondary lookup maps.
The priority map at `0xd8` registers `test:marker` for the definition named `tile.test:marker`.
The fallback map at `0x118` registers `test:fallback` for the definition named `test:tile.fallback`.
The latter definition comes from input `test:tile.tile.fallback`, because parsing removes one local tile prefix.
The priority map precedes alias rewriting. The fallback map follows ordinary lookup after rewriting.
These registrations depend on parsed name fields, independently of the DataDriven class.

Native registration and rehash observations also establish the ordinary map's iteration order.
The hash uses FNV-1 over UTF-8 bytes. Colliding bucket entries precede earlier entries, and a resize regroups the existing sequence.
Observed bucket counts progress through 8, 64, 512, 1,024 and 2,048.
The final numeric ownership pass follows this iteration order.
An independent ordering model matches all 7,833 insertion steps across four complete captures.
FNV-1a hashing and reversed bucket insertion each fail concrete native comparisons.
The production registry now uses this ordering model to select final numeric owners.

The empty-input capture completes 126 named and 1,965 numeric ItemStack controls.
The populated capture completes 192 named and 1,995 numeric controls, including priority and fallback lookup.
Both captures retain original block/state construction, registry construction, ItemStack construction and complete cleanup.
Neither capture leaves native allocations or held locks.
The foundation patch also passes its three parser and alias tests before the recipe patch applies.
After full replay, all four projects pass 2,862 tests with 163 optional skips and no failures or errors.
Checkstyle passes, and all eight retained packaged comparison suites pass.
All 1,498 core classes and both registry assets match their embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on. The patch move preserves the verified runtime implementation.

## Constructed registry ownership

The runtime now constructs definitions before it assigns network IDs.
It retains raw staging keys, definition identities, spare allocations and the constructor counter.
Ordered component readers update the actual receiver after the staging drain.
Late block registration uses current numeric and named owners before it creates a block item.

Names and numeric IDs have separate owners.
Two names can retain the same ID. The final native map traversal selects the numeric owner.
Consumers now request that owner explicitly instead of inverting a one-to-one map.
The registry retains builtins absent from the packet, so packet receipt uses a separate session flag.
Network declarations remain immutable packet snapshots, separate from constructed definitions.

Pinned target 1.26.51.1, build 51061372, protocol 2193 controls provide 36,310 comparisons.
The production engine matches construction order, receiver identity, retained allocations, counters, lookup results and numeric ownership.
All three controls also match the production bootstrap names, IDs and numeric owners.
The block producer uses 1,379 original block inputs and executed slab predicates.
Expected post-registration results do not supply its registration decisions.

The controls cover the recorded builtin context and empty component data.
They do not establish complete custom-block, experiment or version-dependent construction.
The component controls below add the measured nonempty branches.
Class-specific ItemStack output and complete caller admission still need coupled native coverage.
The recipe registry interfaces, installed player screen and physical input remain unfinished.
All four original reports and all five goal areas remain active.

The complete four-project build passes 2,851 tests with 163 optional skips and no failures or errors.
Checkstyle passes. All nine packaged comparison suites pass, including the new construction checks.
Native comparisons reject both FNV-1a hashing and named-definition eviction after a numeric collision.
All 1,513 core classes and three registry resources match their embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on.
The test worker uses a 1 GB heap for the complete construction fixtures.

## Coupled component updates

Two additional original controls add 8,540 packaged comparisons across 22 typed ItemData declarations.
They execute nonempty component readers inside complete registry construction and late block registration.
The controls distinguish omitted components, missing fields, malformed selectors, mismatched owners and replacement flags 0, 1 and 255.

Component updates use exact raw names after constructor selection and the staging drain.
A canonical definition can exist while an uppercase or unqualified update key misses it.
Readers follow the definition that survives the staging drain, including builtin ComponentItems selected by a Legacy declaration.
Twelve receivers also match native stacking, legacy durability, associated block, food-predicate and block-placer observations.
The property getters use a genuinely constructed empty ItemStack.

Both controls use the existing default Experiments and base-game version 1.26.50 context in native build 51061372, protocol 2193.
Original input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.
These results do not establish all component types, custom blocks, other version/experiment contexts or class-specific ItemStack output.
Complete caller admission, recipe contexts, installed player screens and physical input remain unfinished.

The optional regression belongs to the inventory consumer patch because it also compares cooking properties.
The complete ViaBedrock suite passes 1,721 tests with 86 optional skips and no failures or errors.
Checkstyle passes. Packaged comparisons reject normalized update keys and flag resets after invalid selectors.
Runtime sources, resources and build configuration match the previously verified four-project build exactly.


## Constructed recipe context

Named recipe matching now retains constructed definitions and their receiver-owned block associations.
Numeric collisions do not replace the selected recipe definition with the numeric owner.
Recipe-source matching retains typed guards before deferred lookup.
Descriptor comparison leaves source admission to its manual or automatic caller.

The adapter uses normal saved-name lookup for recipe names and narrows the requested auxiliary value to a signed short first.
Complex-alias representatives use normal named lookup with auxiliary zero.
Alias members use parsed direct lookup without metadata rewriting.
Block fallback uses registered BlockLegacy numeric ownership independently of auxiliary conversion or archetype support.
The descriptor and source guards now precede recipe consumers in the inventory patch.

An original native control supplies 24 typed ItemData declarations under target 1.26.51.1, build 51061372, protocol 2193.
It constructs the global block/state registry and complete ItemRegistry with default Experiments and base-game version 1.26.50.
Original named descriptor construction, lazy resolution, repeated emptiness checks and deleting destructors execute.
All 540 resolved recipes match the packaged adapter's kinds, selected/representative names and IDs, auxiliary values and emptiness results.
All 1,379 registered block numeric identities also match.
Native comparisons reject numeric-owner substitution and direct alias-representative lookup.
Input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.
This control does not execute complete client/level setup or establish custom-archetype, registry-retirement or installed availability behavior.

A broader control covers 4,440 named stacks, 1,987 numeric initializations, 1,920 zero-runtime network constructors and 20,685 block selections.
Named lookup and numeric ownership match throughout that control.
That control exposed five missing positive-count coal-to-charcoal conversions at auxiliary one.
The canonical network construction section records their correction. At that checkpoint, complete named and NBT construction remained unfinished.
A private network-header projection also differs for air ID zero. The named and definition construction section below adds the proper named API comparison.

The broad control differs on 12 block selections. A focused range finds 107 differences across barrel, jigsaw, glow lichen, campfire and tube coral.
The earlier server sweep queried Script API `ItemStack.matches`; it did not directly read the legacy converter's selected block pointer.
The Script API path and complete client/level cache setup need comparison before the legacy-conversion data changes.
These observations remain separate caller contexts. The existing auxiliary data remains unchanged.

The four-project build passes 2,861 tests with 162 optional skips and no failures or errors.
The complete core run passes 1,730 tests with 85 optional skips. Checkstyle passes.
All nine retained packaged suites and the nonempty-component suite pass.
All 1,514 core classes and three registry resources match the embedded client and proxy copies.
All 1,191 client classes match the tested add-on.
All four original reports and all five goal areas remain active.

## Canonical network construction

Network construction now retains the selected definition independently of numeric ownership.
Canonical lookup uses the existing constructed name without another saved-name parse.
The constructor uses the selected Block's canonical auxiliary, or the stack auxiliary without a Block.
A changed definition resets the stack auxiliary and can replace the Block with its associated default.
Runtime candidate validation follows this upgrade before the constructor selects its fallback.

Merge admission compares exact definition objects.
Full stack queries compare definition names and numeric IDs.
Stacking and cooking properties follow the retained receiver.
Copies retain the definition, and container snapshot equality detects a different selected definition.
Explicit identifier changes clear the retained selection.

An original control remaps charcoal to ID 257 while numeric lookup for 257 still selects apple.
Coal metadata one constructs the charcoal definition, despite that numeric collision.
Native query and merge functions distinguish charcoal from apple and expose different stacked-by-data properties.
The control uses 23 typed ItemData declarations and executes 672 complete zero-runtime network constructors.
It also executes five identity pairs and ten property observations through original functions.
Input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.

The target remains 1.26.51.1, build 51061372, protocol 2193, with default Experiments and base-game version 1.26.50.
The packaged ItemRewriter matches all 672 constructors, five pairs and ten property observations.
The earlier 1,920-constructor control also matches, including its five previously missing coal-to-charcoal conversions.
The 540 recipe resolutions and 1,379 registered block identities still match.
Mutation controls reject lost definition ownership, skipped canonical upgrade and snapshots that ignore the selected definition.

A runtime Block does not need an auxiliary converter when priority lookup or metadata-independent aliases establish the selected definition.
Metadata-dependent selection requires the missing auxiliary context.
No replacement auxiliary or missing-block answer substitutes for that context.
The earlier primitive fixture retains its declared warm cache and empty alias tables, separately from the complete registry control.

This evidence does not establish complete wire admission, negotiated nonzero runtime palettes, nonempty userdata or native registry retirement.
The private network-header projection remains separate from the named API added below and from NBT outer-loader admission.
Some legacy actions still compare encoded fields through `BedrockItem.isDifferent`.
Mixed raw snapshots, complete player screens, physical input and native pixels remain unfinished.
The 12 broad and 107 focused block-state differences remain open, and the auxiliary data remains unchanged.
All five goal areas and four original reports remain active.

The four-project build passes 2,861 tests with 162 optional skips and no failures or errors.
The complete core suite passes 1,730 tests with 85 optional skips. Checkstyle passes.
All retained packaged comparison suites pass.
All 1,514 core classes and three registry resources match the embedded client and proxy copies.
All 1,191 client classes match the tested add-on.

## Named and definition stack construction

The shared constructor now separates named strings, definition pointers and network input.
Each path resolves the original Item's associated Block before numeric initialization selects its owner.
For an ordinary Item, named-string construction disables canonical upgrade; definition-pointer and network construction enable it.
Associated-Block paths enable upgrade in all three cases.

Named lookup parses the saved name and applies its metadata rewrite before construction.
Direct definition input keeps the existing constructed name through canonical lookup.
The constructor keeps signed 32-bit count and auxiliary values until the native branch narrows them.
Negative counts clamp to zero before byte conversion.
The BlockLegacy wildcard check compares the original integer with 32767, including after count invalidation.
The wider value 98303 narrows to the same short but does not select that wildcard branch.
Numeric zero can retain raw count and Block fields without a resolved Item.
The actual native air definition has an associated Air Block, which remains part of this comparison.

The original named-string constructor `14247ebe0` and definition-pointer constructor `14247ead0` execute against the complete registry and actual Block metadata converter.
The control supplies 25 typed ItemData declarations, eight counts and sixteen auxiliary values.
It includes charcoal remapped to apple's numeric ID, original associations that differ from numeric owners, and constructed `tile.` names.
The target remains 1.26.51.1, build 51061372, protocol 2193, with default Experiments and base-game version 1.26.50.
Original instructions remain unchanged, and complete input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.

The packaged ItemRewriter matches all 2,304 named and 1,536 definition constructions.
It also matches all 4,440 named outputs from the earlier complete control.
These comparisons check the selected definition, raw count, auxiliary and exact typed runtime Block state.
They replace the earlier network-header projection as evidence for the named API.
The projection remains a separate caller and does not become a network admission failure.

Cooking input expansion now passes the selected descriptor definition to the shared default constructor.
Output-index registration passes the output's retained definition to its count-one constructor.
The original cooking extractor `146989830` and output-registration call at `14324d432` use this definition-pointer path.
Focused regressions reject numeric-owner substitution before association and confirm that registration preserves the original output.
Primitive extractor fixtures retain their declared ordinary definitions, empty aliases and warm Block caches.
They remain separate from the complete registry controls.

Five deliberate constructor changes fail native value comparisons: incorrect named or direct upgrade flags, early owner substitution, early wildcard narrowing and negative-count wrapping.
Both consumer regressions also reject their previous numeric-construction paths.
Retained network identity, registry, component, recipe and matcher controls still pass.

These results establish the tested construction paths, without establishing NBT outer-loader admission or installed recipe availability.
Complete client/level setup, negotiated nonzero runtime palettes, nonempty userdata and native registry retirement remain unverified here.
Some legacy actions still use `BedrockItem.isDifferent` to compare encoded fields.
The 12 broad and 107 focused Block-state differences remain open, and the auxiliary data remains unchanged.
All five goal areas and the four original reports remain active.

The four-project build passes 2,866 tests with 162 optional skips and no failures or errors.
The complete core suite passes 1,735 tests with 85 optional skips. Checkstyle passes.
All nine retained packaged suites and the nonempty-component suite pass.
All 1,514 core classes, three registry resources and unchanged Block auxiliary data match their embedded client and proxy copies.
All 1,191 client classes match the tested add-on.


## Saved NBT stack loading

Saved items now use a shared NBT loader with separate ItemInstance and ItemStack constructor tails.
Merchant offers use this loader without a second Block write that could restore cleared ownership.
Block-entity item conversion also uses the shared path.

The loader preserves typed admission.
An existing `Name` field takes precedence over `id`, including an empty or mistyped `Name`.
Without `Name`, the loader accepts a string ID or a short legacy ID.
The pinned table contains 292 saved ID names and five legacy ID upgrades.
This table is separate from current numeric Item ownership.
`Damage` requires a short tag, and `Count` requires a byte tag.
The byte count retains its unsigned value.

Named lookup precedes numeric owner selection.
The numeric owner's association supplies the fallback Block after initialization.
An absent or mistyped `Block` field uses that association.
A present compound instead follows serialized Block loading, which can return no Block.
Exact legacy-group membership remains separate from registered Block-name lookup.
Block selection can then rebind the Item before its post-load callback.

The loader copies compound userdata, retains restrictions and reads the typed pickup flag.
For measured durable definitions, the post-load callback migrates effective auxiliary damage into userdata only when its `Damage` key is absent.
Wildcard normalization follows that callback.
ItemInstance assignment preserves the loaded fields.
ItemStack reconstructs its header, clears raw auxiliary for a retained Block and invalidates zero-count Item and Block ownership.
Userdata, restrictions and the pickup flag survive that header invalidation.

Two shared lookup corrections support this path.
Restriction expansion selects exact legacy groups first, then uses normal registered lookup for individual Blocks.
Thus `minecraft:stone` expands its group, while `Minecraft:Stone` resolves the individual stone Block.
The earlier 116-case group fixture retains its explicitly supplied case-sensitive primary lookup.
It does not represent the complete registry lookup.
An empty alias callback result now preserves the original name and auxiliary value.
The raw callback API remains unchanged.
This distinction preserves a generic spawn egg when its metadata has no nonempty alias target.

The original loader `14248e620` and constructors `14247f1f0` and `142483da0` execute against the complete native registry and Block converter.
The target remains 1.26.51.1, build 51061372, protocol 2193, with default Experiments and base-game version 1.26.50.
Four controls cover 819 baseline inputs, 1,319 expanded inputs, 33 empty-registry cases and 83 follow-up cases.
These controls overlap.
The expanded cases include durable definitions, books, potions and actual serialized Block tags.
The follow-up covers malformed fields, unknown Block states, spawn eggs and mixed-case restrictions.
Original game instructions remain unchanged.
Original input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.

The packaged core matches all 4,508 ItemInstance and ItemStack outputs and eleven exact group-membership observations.
The comparison checks selected definitions, raw counts and auxiliary values, exact typed Block states, userdata, restrictions and pickup flags.
The Java input NBT remains unchanged after conversion.
Nine deliberate changes fail native value comparisons across typed admission, ownership, constructor tails, wildcard handling, pickup state and shared lookup behavior.
Retained named, definition, network, component, recipe and matcher controls still pass.

The four-project build passes 2,872 tests with 161 optional skips and no failures or errors.
The core suite passes 1,741 tests with 84 optional skips. Checkstyle passes.
All nine retained packaged suites and the nonempty-component suite pass.
All 1,520 core classes and four registry resources match their embedded client and proxy copies.
All 1,191 client classes match the tested add-on.
The Block auxiliary data remains unchanged.

These typed-input controls establish the measured saved constructors, including nonempty saved userdata.
They do not establish complete wire admission, arbitrary versioned or custom Block loading, nonfinite data, or native weak-owner retirement.
Ordinary named and network userdata admission remains outside these controls.
Complete client/level setup, installed recipe availability, player screens and physical input remain unfinished.
Some legacy actions still use `BedrockItem.isDifferent` to compare encoded fields.
The 12 broad and 107 focused Block-state differences remain open.
All five goal areas and the four original reports remain active.


## Ordinary inventory merge actions

Ordinary Java pickup, shift-click, drag distribution and pickup-all now use the connection's native occupied-slot merge predicate.
Each check passes the moving stack first and its destination second.
The predicate checks retained definition identity, destination stackability, subtype metadata, native userdata equality, restrictions and blocking state.
Items without the subtype flag can merge across auxiliary values.
Items with matching encoded fields can still fail admission through their definitions or other retained state.

An occupied merge preserves the destination's fields and increases its count.
An empty destination receives a copy of the source.
Pickup keeps its existing swap behavior when occupied merge admission fails.
Drag eligibility filters incompatible destinations before count distribution or the single-slot pickup fallback.
Pickup-all treats each collected stack as the source and the cursor as its destination.

The complete target executor `1433e8380` calls merge predicate `142488fe0` with that argument order.
Its separate count-plus-full-query branch calls `14248dac0`.
The current change preserves that distinction and leaves `BedrockItem.isDifferent` unchanged.
The original functions come from target 1.26.51.1, build 51061372, protocol 2193.

The action regression constructs real registry definitions and executes the Java click, request and prediction paths.
Nine ordinary cases cover definition collisions, restrictions, blocking state, subtype metadata, damage, destination preservation and rejected prediction restoration.
The optional matrix applies 756 original native merge results to all four Java action paths, for 3,024 decision checks.
The fixture declares non-bundle classification, a small registered Block-name set and intercepted packet transport.
These checks preserve existing Java slot order; they do not establish native destination ordering.
The action fixture passes all ten tests, including the optional matrix.
The packaged JAR passes the same tests with verified implementation origins.
Four deliberate raw-comparator reversions fail native decision comparisons through pickup, quick move, drag and pickup-all.
The targeted inventory, bundle, response and native stacking run passes all 39 tests. Checkstyle passes.

Crafting outputs, merchant and specialized workstation consumers still have separate encoded-field comparisons that need caller-specific audits.
Legacy offhand and cursor acknowledgments also retain their existing stale-state checks.
Complete native controller delivery, remaining locked-item permissions and live wire/server acceptance remain separate requirements.
All five goal areas and the four original reports remain active.


The four-project build passes 2,882 tests with 161 optional skips and no failures or errors.
The core suite passes 1,751 tests with 84 optional skips.
All 1,520 core classes match their embedded add-on and proxy copies. All 1,191 client classes match the tested add-on.
All 198 core asset resources match the previous validated JAR exactly.
Apart from the Container implementation and three build-identity classes, the remaining 1,516 core classes are unchanged.
This preserves the prior constructor, registry, recipe and component evidence through exact artifact comparison.
Their separate packaged suites were not rerun for this consumer-only change.


## Provider item-lock permissions

Ordinary actions now distinguish removal permission from incoming permission.
Player hotbar, inventory and offhand removal reject typed byte lock mode `1`.
Other byte values, including `2` and unknown unsigned values, do not trigger that removal filter.
Generic storage and cursor removal omit this filter.
Generic storage incoming callbacks reject every nonzero byte lock mode.
Player and cursor incoming providers omit that callback.

The lock getter reads only `minecraft:item_lock` with the NBT byte type.
It preserves unsigned values from zero through 255 and ignores other tag types.
The shared count-one planner no longer rejects locked menu items before these provider rules apply.
Both authority adapters retain typed lock state, counts and their existing identity checks.
The legacy adapter leaves tracked slots unchanged after a failed send.

Pickup, shift-click, hotbar swaps and pickup-all check removal permission before prediction.
Pickup, swaps and drag retain incoming permission checks.
Rejected allowed actions restore the lock state with the item snapshot.
The checks preserve existing slot routing and destination order.

The original backing constructor `147c96d60` and standard installer `1431afb60` register nine measured provider roles.
The source method `147c98300`, installed incoming callbacks and getter `14247fc00` execute without instruction changes.
The target remains 1.26.51.1, build 51061372, protocol 2193, with default Experiments and base-game version 1.26.50.
The control uses the complete native registry and saved ItemStack constructor.
Its declared storage interface supplies 36 slots and the current constructed item.
The ordinary provider context has wire type zero.

Eighty typed inputs cover absent userdata, byte values, mistyped tags, wrong key case and four counts.
All 17,280 source decisions, 240 incoming callback executions and 80 getter results match Java.
Another 300 incoming results follow omitted callbacks and the separately inspected native default branch.
Those 300 results are derived defaults, not callback executions.
The provider roles include generic storage, combined inventory, hotbar, inventory, offhand, cursor, barrel, shulker and dynamic storage.
Original backing, input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.

Two failed fixture attempts remain archived privately.
The first lacked a storage cleanup interface.
The second registered interface addresses without their scoped execution hooks.
The successful control installs all three scoped storage callbacks and checks positive source results before accepting its output.
It also observes the original backing destructor and its storage unsubscribe call.

The armor-removal extension below separately covers actor mode and Curse of Binding.
World drops, bundles, specialized outputs, complete destination capacity and full controller delivery need separate caller controls.
These permission checks do not establish wire or live server acceptance.
All five goal areas and the four original reports remain active.


The final four-project build passes 2,890 tests with 161 optional skips and no failures or errors.
The core suite passes 1,759 tests with 84 optional skips. Checkstyle passes.
All 1,520 core classes match their embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on.
All 198 core asset resources match the archived saved-NBT milestone, including the unchanged Block auxiliary data.
The remaining 1,506 core classes are byte-identical to that archive.
Changed classes stay within Container, NativeContainerTransfer, BedrockItem, their nested classes and build identity.

The packaged JAR passes all 30 permission, ordinary-action and authority-adapter tests with verified implementation origins.
Seven deliberate permission regressions fail value assertions.
Player-inventory shift-click and hotbar swaps isolate source removal from menu incoming rules.
The retained native merge matrix still checks 3,024 Java action decisions from 756 original predicate cases.


## Armor source permission

Ordinary armor removal now checks the registered native armor source policy.
Typed byte lock mode `1` blocks removal before the creative bypass.
Other byte modes do not trigger this filter.
Native player mode `Creative` bypasses Curse of Binding.
Player mode `Default` inherits that bypass only from a creative world mode.
`Undefined` and other modes do not inherit the bypass.
The general Java display-mode conversion remains unchanged.

Other cases reject the first matching Curse of Binding entry only when its typed short level is positive.
Zero, negative and mistyped levels do not activate binding.
The enchantment ID uses its unsigned low byte after typed short admission.
Duplicate entries retain their first-match order.
The existing enchantment-level helper remains unchanged.

The original backing constructor and standard installer register armor callback `1431bb690`.
That callback and source method `147c98300` execute against the complete native registry and original saved ItemStack construction.
The target remains 1.26.51.1, build 51061372, protocol 2193, with default Experiments and base-game version 1.26.50.
The declared armor storage supplies four slots with the current constructed item.
The native range follows that backing capacity.
The supplied actor interface contains the game-type sparse component and a fallback mode virtual service.
Original actor getter `14253dc40` executes against those inputs.

The control covers 129 typed ItemStacks and 40 actor-mode states.
Java matches all 103,200 original source decisions.
The native control also executes 5,160 registered callbacks and observes 129 lock and binding-presence pairs.
Forty original actor getter results establish the mode inputs.
The nonempty Java items match every observed binding-presence result.
Zero-count saved stacks retain header byte one but clear Item ownership, so source admission rejects them.
Original backing, input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.

Two failed fixture attempts remain archived privately and supply no expected decisions.
One incorrectly expected the zero-count header byte to clear.
The other supplied player-storage capacity instead of armor-storage capacity.
The final control uses the measured header contract and four-slot armor backing.

Non-compound enchantment-list elements remain outside this control.
Static native code selects a null element receiver and immediately reads that receiver in the typed getter.
The reference records these two unexecuted cases without assigning a native boolean result.

Action regressions cover pickup, shift-click and hotbar swaps through actual Java request prediction.
They distinguish `Default` from `Undefined`, preserve slot locks in creative mode and restore rejected armor removal after a mode change.
The fixtures supply cached mode fields and suppress independent attribute transport.
World drops and direct creative edits remain separate callers. Armor destination policy is covered below.
Complete Actor, Level and controller construction, physical input and live server acceptance remain unfinished.
All five goal areas and the four original reports remain active.


At the armor-source milestone, the four-project build passed 2,893 tests with 161 optional skips and no failures or errors.
That core suite passed 1,762 tests with 84 optional skips. Checkstyle passed.
All 1,520 core classes match their embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on.
All 198 core asset resources match the previous provider-policy milestone, including the unchanged Block auxiliary data.
Only ArmorContainer and three build-identity classes differ from that artifact.
The remaining 1,516 core classes are byte-identical, including the prior provider, merge and enchantment implementations.

The packaged JAR passes all 33 permission, ordinary-action and authority-adapter tests with verified implementation origins.
Seven deliberate armor regressions fail value assertions.
These controls detect a missing policy, incorrect lock modes, incorrect inherited modes, negative-level handling and reversed duplicate order.
Prior provider and merge mutation evidence remains supported by byte-identical implementation classes and unchanged data.

## Armor destination permission

Armor placement now uses the selected Item definition and the actual transfer count.
A nonempty incoming stack must transfer exactly one item to its native equipment slot.
The four player armor slots have capacity one, independently of the item's ordinary stack maximum.
Stackable head items therefore place one item and retain the remainder.
Whole-stack swaps reject an incoming stack with more than one item.

The shared provider policy also selects empty armor destinations for shift-click.
It replaces the earlier item-name suffix shortcut.
Pickup, shift-click and drag calculate the transfer count before checking admission.
Bundle extraction checks its whole extracted stack.
Recipe planners pass their calculated counts through the same API.
The separate offhand and specialized output policies retain their existing contracts.

Equipment state belongs to the constructed definition.
Thirty builtin armor factories supply their native slot, including elytra.
Head admission follows the definition's associated Block type, including carved pumpkin and the seven head types.
A stack's runtime Block field does not replace that association.
Numeric collisions and copies retain the selected receiver's equipment state.
Armor-statistic tables do not control admission.

Component wearables use typed string slots.
The tested uppercase spelling selects the same slot.
Missing, mistyped or unrecognized slot fields retain an existing value; a newly installed empty component starts at native enum value `-1`.
The native enum covers main hand, offhand, head, chest, legs, feet and body.
Armor admission covers the last five enum values and subtracts two for the slot index.
A body wearable therefore passes the raw slot-four predicate but fails the four-slot provider's bounds check.
Omitted components remain installed.
With `componentBased=true`, version `None` constructs a component receiver without running these readers.

The reference executes installed callback `1431bb5c0`, armor getters `14248fb50` and `142488390`, and destination method `147c98480`.
The standard installer and original backing constructor install the policy.
Original function `149978ee0` constructs the stateless armor capacity policy; its armor branch does not consume the unused context argument.
The actual capacity function returns one.
No capacity, Item lookup or Block lookup result is supplied.
The storage interface supplies four slots containing empty or original constructed ItemStacks.

Three controls compare 94,104 complete destination decisions and 37,872 registered callback decisions with Java.
The first records all 1,989 constructed definitions, including version-None wearable declarations.
The second reads DataDriven declarations and repeated wearable updates, then checks 53 selected definitions.
The third checks 62 definitions with invalid string updates and custom head Block associations.
A head-associated component can report a negative native slot; the complete provider still applies its bounds check.
Saved inputs independently vary count, typed banner Type data and lock bytes.
The native destination distinguishes empty placement, swap, merge and rejection; these controls observe no successful armor merge.
The Java admission check compares acceptance. Action tests separately check transfer quantities, prediction and rollback.
Original backing, inputs, registry, TLS, static and CRT cleanup leaves no allocations or held locks in all three controls.

These checks do not establish native controller ordering or complete input delivery.
Drops, direct creative edits, specialized output admission and live server acceptance still need their own caller controls.
The authored E-key screen and all four original bug reports remain unresolved.

The four-project build passes 2,902 tests with 161 optional skips and no failures or errors.
The core passes 1,771 tests with 84 optional skips. Checkstyle and repository offline validation pass.
All 59 packaged permission, action, bundle and authority-adapter tests pass with verified implementation origins.
Twenty-three deliberate source, incoming, capacity, identity, typed-field and retained-update regressions fail value assertions.

All 1,521 core classes match the embedded client and proxy copies.
Packaged classes match test-compiled classes with four declared build-identity replacements.
All 1,191 client classes match the tested add-on.
The factory resource adds equipment metadata without changing its previous fields.
The other 197 core assets, including Block auxiliary data, remain byte-identical to the armor-source milestone.
One factory metadata holder class is added; implementation changes stay within placement, definition properties and recipe callers.
Twelve changed nested classes retain matching declarations and instruction disassembly.

The other 1,495 existing core classes remain byte-identical.

## Inventory discard and creative admission

Inventory drops require both source permission and an unlocked item.
The shared discard policy requires typed byte lock mode zero.
Ordinary removal and discard therefore have different contracts.
A menu item can permit pickup while refusing discard.
Mistyped lock tags retain the existing typed-field behavior.

Slot throws and cursor drops use this policy before prediction or request allocation.
The action helper rejects nonpositive transfer counts.
The raw native predicate can admit zero or negative counts when its other conditions pass.
The native UI executor normalizes counts before constructing an action.
The Java action guard preserves that distinction.

Direct creative packets use the cached raw player mode.
Only `Default` inherits the level mode for this permission; `Undefined` does not.
The Java display mode does not establish creative permission.
The armor source policy uses the same shared mode helper.

Creative destination checks use the provider policy and the whole incoming count.
Creative catalog drops reject nonzero typed lock bytes.
Both checks run before temporarily opening inventory.
Replacing or clearing an existing stack also requires discard permission and a stack network ID.
That source check runs after inventory opening and source refresh.
Denied operations allocate no request and make no predicted inventory change.
An actual rejected response restores the previous stack after a mode change.

The native target remains 1.26.51.1, build 51061372, protocol 2193.
The control uses default Experiments and base-game version 1.26.50.
Original source method `147c98300` and discard predicate `1431b6390` execute for every recorded row.
The reference contains 56,760 source/discard pairs, or 113,520 original calls.
It covers 129 typed saved ItemStacks and collection roles 6, 7, 12, 28, 29, 30, 34, 58, 59 and 63.
Armor uses five representative actor states; other roles do not consume those mode inputs.
The control retains 40 original actor getter observations.
A separate packaged comparison checks the shared creative-mode helper against all 40 observations.
Every recorded discard decision equals source permission combined with typed lock mode zero.

Original backing constructor `147c96d60` and installer `1431afb60` establish the storage policies.
Original weak-view factory `1431abbb0` constructs the views used by the discard predicate.
A supplied pinned collection-root ABI exposes the role, backing and start offset zero.
Its shared ownership header and read-only metadata are declared interfaces.
The control does not construct or retire the complete native collection root.
Read-only storage supplies four armor slots or 36 slots for the other roles.
Sparse actor-mode and fallback services remain supplied interfaces.
No permission result, Item lookup or Block lookup result is supplied.

Original view destruction returns the foreign root's strong and weak pins to their baseline.
Original backing, input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.
Expired roots and malformed enchantment-list children receive no invented native decision.

Static caller inspection finds the discard check before Drop, Destroy and Consume construction in UI executor `1433f0390`.
This does not establish the policy for every recipe Consume producer.
Gameplay drops outside inventory use a separate caller and remain unaudited here.
Complete creative catalog production, output ownership, Actor mode delivery and controller lifetimes also remain unfinished.
The executed controls do not establish complete input, wire or live server parity.
The authored E-key screen and all four original reports remain unresolved.

The four-project build passes 2,910 tests with 161 optional skips and no failures or errors.
The core passes 1,779 tests with 84 optional skips. Checkstyle passes.
The packaged core passes 67 repository permission and action tests plus the private 40-mode comparison.
Thirty-two deliberate permission, action, capacity, identity and reader regressions fail value assertions.
Implementation origins are checked against the packaged JAR.

All 1,521 core classes match their embedded add-on and proxy copies.
Packaged classes match test-compiled classes with four declared build-identity replacements.
All 1,191 client classes match the tested add-on.
All 198 core assets remain byte-identical to the armor-placement milestone, including Block auxiliary data.
No production class is added; 1,501 existing core classes remain byte-identical.
Twelve changed nested classes retain matching declarations and instruction disassembly.

## Live E-key action controls

A private Java 26.3 client exercises the preceding discard-milestone build through ViaProxy and Bedrock 1.26.51.1.
The server negotiates server-authoritative inventory.
The client uses an 854 by 480 viewport and Java GUI scale two.
Real E-key input opens survival, creative and survival inventory in sequence.
All three openings receive distinct native tokens and matching acknowledgments.
The final E-key close receives its native acknowledgment too.
The client retains Java's ordinary player screens, with visible backgrounds.

Sixteen physical input controls cover pickup, cursor drops, locked-item refusals, creative placement and armor admission.
Server commands create the fixtures, including both typed item-lock modes.
Inventory-locked items permit ordinary pickup and return but refuse cursor and slot drops.
Slot-locked items refuse the tested pickup and drop inputs.
Client and core observations retain the expected inventory and cursor state after each refusal.
The creative picker accepts a real catalog placement and retains locked items after refused edits.

A stack of three carved pumpkins places one item in the head slot and leaves two on the cursor.
An occupied head-slot swap with the remaining stack makes no request.
The return, removal and merge controls receive successful responses.
Physical shift-click equips one pumpkin and preserves two in inventory.
That shift-click sends two Place actions: one to armor slot zero, then two items to inventory slot nine.
Its source hotbar slot becomes empty.
This observation establishes accepted routing and item conservation, while native destination ordering remains unverified.

The complete capture records thirteen requests and thirteen successful Bedrock responses.
This includes an additional accepted creative replacement beyond the explicitly asserted catalog placement.
The response count does not represent thirteen independent native parity comparisons.
Physical refusal controls establish end-to-end behavior without independently locating every refusal in the client or core.
The packaged tests establish core admission behavior separately.

The installed add-on matches its recorded distribution artifact.
All 1,521 embedded core classes match the built core, and the running proxy JAR matches its distribution artifact.
Observers record state and request results without replacing policy answers or invoking inventory action handlers.
The integration driver completes normally, and its client and proxy processes retire.
An earlier run exceeded its harness timeout and assumed an unproven shift-click remainder location.
Those failures remain separate from the completed control and its native response observations.

This run does not reproduce the affected WildFFA session, server pack or mod configuration.
Direct joins, client-authoritative inventory, deliberate live rejection and recovery under packet delay remain unverified by this control.
The full authored player screen, physical controller navigation and complete native action ordering remain unfinished.
The E-key background/scale, pearl/wind-charge rollback, endless eating and missing locator reports remain unresolved.

## Offhand destination permission and player routing

Offhand admission now follows the selected constructed Item definition.
The installed native callback `1431bbfc0` accepts empty stacks or offhand flag mode one at Item offset `0x210`.
Eight builtin definitions carry that flag in the complete target registry.
These include arrows, maps, fireworks and totems as well as shields.
Numeric ID collisions do not transfer permission between retained definitions.

The common `item_properties` reader accepts only a nonzero byte `allow_off_hand` value.
Omitted properties retain the previous flag; present properties with a missing or mistyped field clear it.
The qualified `minecraft:allow_off_hand` component instead retains its installed typed value across omitted or mistyped updates.
Its initial value is false.
Installed components finalize after every reader update, including updates that omit them.
An offhand wearable forces admission even when the qualified component says false.
Armor wearables force compiled capacity one unless an installed `minecraft:max_stack_size` component owns that capacity.

`OffhandContainer` applies slot and count bounds before permission.
An empty destination also requires sufficient native Item capacity, including zero capacity for an empty incoming Item.
Pickup, swaps and drag use this shared admission.
The legacy survival adapter now checks incoming permission and source removal before reserving or sending its transaction.
A refused click resynchronizes Java contents without changing the cursor, equipment or pending ownership.
Incoming lock mode one remains permitted; source removal still rejects that mode.
Admitted legacy transfers retain their server-content confirmation barrier.

Native route builder `144e1dfa0` lists armor, offhand and main inventory destinations for hotbar sources.
For main inventory sources, it lists armor, offhand and hotbar destinations.
Equipment routes depend on separate workbench and profile flags.
The ordinary Java player inventory now keeps both equipment ranges instead of selecting one empty armor slot or a shield-only offhand slot.
Quick move now applies those ranges in logical collection order, as described in the collection-order reference below.
Static route construction does not establish complete native transfer ordering or controller execution.
Crafting outputs, workbench profile combinations and physical controller navigation remain separate boundaries.

Four complete native controls execute 64,872 destination decisions and 64,872 installed callbacks across 4,086 stack inputs.
They record 2,106 definition observations, including builtin flags, typed values, retained updates, locks and all six three-component declaration orders.
Earlier mixed-case conflict names establish raw-name admission only; the separate lowercase control establishes property precedence.
Original backing, input, registry, TLS, static and CRT cleanup leaves no allocations or held locks in each control.
Read-only storage supplies two empty hand slots.
No permission, Item lookup, Block lookup or capacity result is supplied.
Occupied destination outcomes, complete native controller construction, wire acceptance and live offhand actions remain unverified by these controls.

The earlier live E-key capture uses the preceding discard-milestone artifacts.
Its successful responses do not verify the new offhand changes.
The four original reports and all five broader goal areas remain unresolved.

The four-project offhand build passes 2,921 tests with 161 optional skips and no failures or errors.
The core passes 1,790 tests with 84 optional skips. Checkstyle and offline validation pass, and all 105 patches replay.
The packaged core passes 78 repository permission and action tests plus the private 40-mode comparison.
Implementation origins point to the packaged JAR.
All 1,521 core classes match their embedded add-on and proxy copies, and all 1,191 client classes match the tested build.
Of 198 core assets, only the eight measured offhand flags change; the other 197 assets remain byte-identical.
Earlier factory metadata and Block auxiliary data remain unchanged.
No production class is added; 1,499 existing classes remain byte-identical to the discard milestone.
Eleven changed nested classes retain matching declarations and instruction disassembly.

Forty-five deliberate permission, action, capacity, identity and component-reader regressions fail value assertions.
Each mutant also passes implementation-origin checks.

## Live offhand action controls

A new private Java 26.3 control uses the offhand build artifacts through ViaProxy and Bedrock 1.26.51.1.
The server negotiates server-authoritative inventory.
The client has ViaFabricPlus and the StackAnvil Bedrock add-on installed, with no additional client mod JARs.
Its viewport is 854 by 480 at Java GUI scale two.
Physical E-key input opens Java's ordinary player inventory, whose background remains visible.
The authored native player screen is still unfinished.

Twenty-four physical controls include 21 accepted actions and three refusals.
All 21 requests receive matching successful Bedrock responses.
Arrows enter an empty offhand slot, merge from six to ten items, and return to inventory.
Physical shift-click routes ten arrows from the hotbar to offhand.
A totem also completes placement, removal and return.
Apple placement in offhand makes no request and preserves the cursor stack.

Typed slot-locked arrows refuse hotbar pickup and offhand removal.
Inventory-locked arrows permit the tested pickup, offhand placement, removal and return.
Server commands create the typed-lock fixtures, including the two offhand states.
Client and core observations retain the expected counts and cursor state after each refusal.
These end-to-end refusals do not independently locate every refusal in the client or core.
The packaged tests verify core admission separately.

The installed add-on matches the built distribution artifact.
All 1,521 embedded core classes match the built core and distribution proxy copies.
The harness launches the explicit distribution proxy path; it does not independently record the running proxy's complete bytes.
Passive observers record screen, cursor, equipment, request and response state without supplying policy decisions or invoking inventory actions.
The final physical E-key close receives its native acknowledgment.
The integration driver completes normally, and all processes started by the run retire.

This control verifies the tested Java/ViaProxy/Bedrock path, including occupied arrow merges and the observed shift-click destination.
It does not establish native controller construction, complete transfer ordering, direct joins, client-authoritative legacy acceptance or delayed rejection recovery.
The affected WildFFA session, server pack and mod configuration remain unreproduced.
All four original reports and all five broader goal areas remain open.

## Player destination collection ordering

Quick move now completes each destination collection before visiting the next.
It merges occupied stacks first, then fills admissible empty slots within that collection.
An existing stack in later inventory no longer takes priority over earlier empty armor or offhand equipment.
For three hotbar pumpkins and two matching inventory pumpkins, one enters the head slot and two merge into inventory.
For six hotbar arrows and a matching inventory stack, the arrows enter the earlier offhand destination.

The shared planner groups consecutive slots by container identity and full collection name.
Split Java ranges for combined inventory remain one logical destination, so their occupied merges still precede empty placement.
Distinct workstation collections remain separate even when they share a container object.
Slot traversal, permission checks, capacity, prediction snapshots and response handling retain their existing contracts.

The native player constructor installs adapter `14340cf80`, whose vtable `14e8808a0` dispatches offset `0x78` to `1434116e0`.
Ordinary sources reach `1433eb800`, `1433e9e90` and destination planner `1433eab10`.
Callback `144e4be80` supplies the all-count value `2147483647`; `144e4bf10` supplies count one.
The complete planner runs 24 controls with one-item, exact-count and all-count descriptors.
Six of nine all-count physical plans differ from the previous packaged Java implementation.
The new optional comparison checks all nine all-count plans against the shared Java quick-move path.
Three focused regressions cover armor priority, offhand priority and combined-inventory fragment grouping.

The control executes original collection-name initialization `1431bd020`, base model construction `1433e3ac0`, view construction and registration, backing policies and destination planning.
Read-only backend and collection-root interfaces supply names, roles, counts, offsets and stored ItemStack pointers.
The collection-root slot check executes the original method from the actual armor, offhand and inventory class tables.
An empty supplied observer map supports original model retirement.
Model, view, backing, input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.
Foreign strong and weak pins return to their baseline.
No native permission, merge, capacity, Item lookup or Block lookup answer is supplied.

The comparison checks ordered physical destinations after normalizing Java's combined inventory and native view offsets.
It does not establish native wire-role encoding, controller-produced routes, physical native button binding, mutation or complete root/backend construction.
The authored player screen, full Actor/Level delivery and arbitrary workstation routes remain unfinished.
All four original reports and all five broader goal areas remain open.

The four-project collection-order build passes 2,925 tests with 161 optional skips and no failures or errors.
The core passes 1,794 tests with 84 optional skips. Checkstyle and offline validation pass; all 105 patches replay.
The packaged core passes 82 repository checks plus the private 40-mode comparison.
Forty-seven deliberate regressions fail value assertions with verified implementation origins, including global-pass ordering and split combined-inventory grouping.
All 1,522 core classes match the embedded add-on and proxy copies; all 1,191 client classes match the tested build.
All 198 assets remain byte-identical to the offhand build, including factory and Block auxiliary metadata.
The implementation adds one private destination-group record.
Of the 1,521 prior core classes, 1,510 remain byte-identical; seven changed nested classes retain matching declarations and instruction disassembly.

A new live control uses these collection-order artifacts through Java 26.3, ViaProxy and Bedrock 1.26.51.1.
Four physical pickup/place actions create the two existing inventory stacks.
Physical shift-click then equips one pumpkin and merges two into the existing stack, leaving four in inventory.
The next shift-click puts six arrows in offhand while the existing inventory stack remains at two.
All six requests receive successful responses; the pumpkin request contains ordered Place counts one and two, and the arrow request contains count six.
Client and core states match after reconciliation, and the final native close is acknowledged.
Installed artifact and embedded-class checks pass, the driver completes normally, and all processes started by the run retire.
This server-authoritative control verifies those final states, not frame-by-frame native prediction, direct joins, legacy authority or complete native controller parity.

## Definition-owned item tags

Item tags belong to the selected constructed definition, independently of its name and numeric runtime owner.
Copies retain that definition; raw network stacks select the current numeric owner.
ItemRewriter transports the same tags in emitted animation data.

The registry applies tag stages in native order:

1. Genuine builtin constructors provide their initial tags.
2. DataDriven component readers append nonempty string entries from `item_tags`.
3. Late Block registration can append Block tags to its selected component receiver.
4. The final named pass appends tags through exact ordinary-name lookup.

Component reads preserve insertion order and deduplicate exact, case-sensitive values.
Omitted fields, empty lists and mistyped values retain earlier tags.
Legacy receivers ignore compiled component tag updates.
Replacing a builtin with a generic component does not copy the displaced constructor's tags.
A newly constructed prefixed BlockItem also does not update the displaced component.

The target metadata records 450 nonempty builtin constructor vectors, 1,379 Block inputs and 387 final named registration rules.
Thirty-two generated names remain absent under the default experiments.
A separate control declares generic components with those names and executes both native registration loops.
It verifies tag updates for those declarations without adding the absent Block feature.

Six controls execute complete original registry initialization, typed component updates, late Block registration and runtime-ID reassignment.
The coupled comparison checks all 11,773 final definition tag vectors.
Each run completes input, registry, TLS, static and CRT retirement without remaining allocations or held locks.
The inputs are declared typed NBT controls, not a normal server packet baseline.

Original `14252d8e0` separately checks 89,252 tag predicates over retained definition and vector backing.
Native HashedString construction and byte comparison execute without supplied predicate results.
Query storage is retired; definition backing remains declared retained storage for this predicate control.
This separate check does not establish full registry or client lifetime.

Existing recipe predicates, cooking expansion and Java recipe displays now use receiver-owned tags.
Expansion filters definitions before constructing matched default items, preserving the constructor's independent numeric and Block selection.
At this milestone, the restricted Molang tag parser used the same data.
The [recipe expression follow-up](#native-recipe-molang-context) replaces that parser with the shared expression engine.

Wire descriptor admission, owned Tag/Molang payloads and installed player recipe publication remain unfinished.
The authored E-key screen and all four original reports remain open.

The four-project build passes 2,943 tests with 161 optional skips; ViaBedrock passes 1,812 tests with 84 optional skips.
The packaged core passes 138 focused checks, including seven new tag and consumer checks.
Five deliberate regressions fail value assertions: discarded earlier tags, folded case, inherited generic defaults, numeric tag ownership and numeric cooking enumeration.
Implementation origins are verified, and mutation checks leave production sources unchanged.

All 1,523 core classes match both embedded copies, and all 1,191 client classes match the compiled add-on.
The comparison retains 1,486 byte-identical core classes and 196 unchanged assets from the output-availability build.
Twenty-one other classes retain identical declarations and instruction disassembly despite compiler metadata changes.
Only the factory and registry assets change; their existing metadata remains semantically unchanged after removing the new tag fields.
No new live inventory or animation capture ran for this milestone.

## Native ingredient payload ownership

Native ingredient emptiness and matching have separate contracts.
A Molang payload can report an empty representative and still match a constructed Item.
Candidate acquisition must preserve that distinction.

The parser control executes the original global constructors and all 319 query bindings.
It retains native initialization guards, callback selectors and security-cookie checks.
The loaded UCRT supplies its original math and string code.
Seven expressions execute 56 predicates against genuine constructed definitions.
Constants and tag queries produce distinct matching results, while all seven wrappers report empty.
Descriptor, Item, registry, Block, TLS, static and CRT cleanup completes without remaining allocations or held locks.
These controls declare typed inputs; they do not establish packet decoding or complete client lifetime.

A separate ownership control executes the actual ingredient vector adapter and recipe base constructor.
Thirty cases cover six expressions and five unsigned ingredient counts, including zero and 65,535.
The adapter clones each present payload and preserves count bits.
The constructor moves that vector into the shaped recipe owner.
Original recipe, payload and global retirement completes without remaining allocations or held locks.
Other constructor fields remain declared inputs; this control does not establish recipe registry admission.

A further control executes complete registration and output lookup for nine typed shaped recipes with a 1 × 1 grid.
It covers Empty, Name, present and missing Tag descriptors, plus five Molang inputs.
All nine reach the output index, including recipes whose ingredients report empty or match none of the tested sources.
Thirty-six source comparisons execute the original concrete recipe matcher against genuine constructed Items.
Complete recipe, Item, Block, TLS, static and CRT retirement leaves no allocations or held locks.
The control declares typed recipe inputs and does not execute all-empty ingredient counting.

Tag descriptor admission also depends on the registry index, independently of a definition's owned tag vector.
The default registry control observes 89 tag sets, 1,171 entries and 765 distinct tagged definitions.
The original index builder also checks version and flag fields.
Those default counts do not establish index membership under other contexts.
An unfiltered scan of definition tags cannot replace that index.

Source conversion can retain a Block-derived descriptor when its representative matches the source's numeric ID.
Otherwise the ordinary descriptor constructor resolves the source numeric ID through the registry.
The descriptor now retains that selected definition alongside its numeric key and auxiliary value.
The original source receiver can differ from this selected definition after an ID collision.
The existing ordinary and alias comparisons remain numeric.

Complete wire decoding, other concrete recipe classes, owned Tag/Molang integration and installed player recipe publication remain unfinished.
These controls do not close the E-key inventory, movement, eating or locator reports.

## Packet-created counter ownership

The earlier counter reference supplied ingredient matching callbacks.
A new 160-packet reference runs actual shaped owners, descriptor resolution, concrete matching and counting.
The production resolved-descriptor path matches all 264 rounds and 1,268 ingredient rows, including source references.

Ingredient quantities zero, one, two and 64 produce identical availability results within each controlled group.
A zero-quantity Name descriptor still reports nonempty.
Keep placement quantities separate from availability counting.
The shaped grid getter uses full dimensions, including unoccupied positions: width or height at least three requires a crafting table.

Complete native cleanup, sixteen focused source tests and the packaged comparison pass.
The new optional test belongs to the owning recipe patch. Production behavior and artifacts remain unchanged.
Full retained descriptor admission and player publication remain unfinished.
See the [packet-created counter reference](bedrock-coverage.md#packet-created-recipe-counting-october-25-2026) for inputs and verification limits.


## Native recipe Molang context

Recipe predicates now compile general expressions through the shared Molang engine instead of a literal-only tag parser.
The native recipe loader selects the `tags` query group at Molang version 13.
Original registration places only `query.any_tag` and `query.all_tags` in that group; the other 317 bindings belong to `default`.
An unavailable query rejects the whole expression, including an inactive branch.
Do not substitute a zero-valued Actor query.

Each predicate uses a fresh ItemInstance frame without an Actor or context-variable provider.
Temporary values remain local to that evaluation; an unset temporary read stops evaluation.
Actor-variable assignments return their value but do not create persistent storage in this frame.
`this` is zero.
Bare tag queries are implicit calls that return false, while explicit empty argument lists fail compilation.
Tag arguments short-circuit and compare native case-sensitive HashedString values.
A string result uses the native result union's float view, independently of ordinary string coercion.

Compiler admission also checks native math signatures, read-only targets and assignment argument syntax.
The shared parser exposes explicit compound-node grouping without changing rendering evaluation trees or bindings.
Existing item predicates, cooking expansion and Java recipe displays use the new recipe compiler.

The [coverage reference](bedrock-coverage.md#native-recipe-molang-context-october-25-2026) records original packet, compiler, frame and packaged comparisons.
These checks extend the predicate path; they do not complete retained Tag/Molang payload ownership or the installed player evaluator.
The shared [assignment-result follow-up](bedrock-coverage.md#native-molang-assignment-results-october-25-2026) now matches all 232 measured recipe-frame predicates.
It separates the selected result slot from operand snapshots and closes the twelve earlier numeric assignment-result differences.
Broader caller lifetime, value/cast behavior and complete VM parity remain unfinished.
Native Tag index filtering and source-definition identity still need integration.
The four original reports and all five goal areas remain open.


## Retained Molang ingredient counting

The retained descriptor API now admits recipe Molang expressions through the shared recipe compiler.
Each payload retains its compiled expression and reports an empty representative.
Its predicate can still match a concrete Item.
Availability counting must preserve both results independently.

Source conversion now returns the selected definition and normalized auxiliary value together.
The existing numeric key still controls counter grouping.
Molang reads tags from the converted definition, including after an ID collision.
The native fallback constructor performs numeric registry lookup before it retains that definition.
It does not directly retain the original stack receiver.

The retained counter path matches 320 packet-created native shaped owners.
These cases cover 2,560 ingredient comparisons, 636 rounds and 1,272 ingredient rows with exact source references.
Ingredient quantities zero, one, two and 64 retain the same availability behavior.
The Java control decodes the complete packets, then explicitly constructs retained descriptors from their decoded fields.
The existing wire Molang predicate consumer now uses the converted definition through this retained API.
Production recipe registration and installed player publication do not yet retain the complete recipe model.

The existing native reference executes complete descriptor, recipe, Item, Block, TLS, static and CRT retirement without outstanding allocations or held locks.
Version-filtered Tag admission, other recipe families and all-empty counter behavior remain unfinished.
A separate six-case control supplies a borrowed source header after complete original Item and Block registry initialization.
Its declared inputs select the retained definition cell, null Block and zero auxiliary value.
Original conversion and Molang matching select the current numeric owner independently of that input receiver.
Original cleanup leaves no outstanding allocations or held locks.
The borrowed header does not own its copied references, and the control does not establish its construction or retained lifetime.
No new live capture closes the inventory, movement, eating or locator reports.


## Versioned Tag admission and retained wire ingredients

The registry now retains constructor minimum versions and builds its Tag index from all owned definitions.
It uses the active connection base-game version, including parsed empty and wildcard values.
The pinned data includes 299 initial factory minima and 540 Block minima.
New component and legacy definitions keep their own constructor defaults instead of inheriting a minimum from their names.
Version filtering preserves each definition's owned tag vector.
Numeric ID collisions do not remove owned receivers from the index.

Tag payload admission requires a nonempty index entry.
An admitted payload retains its name and matches the converted receiver's own tags independently of later index membership.
Index enumeration controls emptiness, including an admitted index that contains only air definitions.
The shared wire factory retains lazy Name, Empty, Tag and compiled Molang payloads for each decoded ingredient position.
The existing wire Tag consumer now uses the index guard and converted receiver.

Eight fresh native registries cover empty, wildcard and six numeric version contexts under the same constructed Block catalog.
All 15,672 minimum versions, 676 Tag sets and 7,765 member references match the model.
The complete mixed-packet counter now compares all 608 cases, 4,864 predicates, 1,056 rounds and 2,112 ingredient rows.
The earlier 89,252-call reference still matches the concrete Tag payload layer, which receives a selected definition directly.
See the [versioned Tag reference](bedrock-coverage.md#versioned-tag-admission-october-25-2026) for lifecycle and context boundaries.

The first diagnostic run retained a registry control block because the harness called scope reset without the saved-reference destructor.
The corrected run executes full native scope destruction and restores enclosing registry reference counts after every context.
Original registry, Item, Block, TLS, static and CRT cleanup leaves no allocations or held locks.

These controls use a fixed Block catalog and declared typed registry inputs.
They do not establish older client construction, arbitrary versioned Blocks or unknown version-discriminator producers.
Current captured constructor minima and parsed contexts all have the native discriminator set to zero.
Production recipe registration and installed player publication still need the complete retained model.
Other recipe families, all-empty counting and the original reported live bugs remain unfinished.
