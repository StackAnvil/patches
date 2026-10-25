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
The existing network model misses five positive-count coal-to-charcoal conversions at auxiliary one.
Canonical saved-name construction and retained stack definition identity still need correction.
A private network-header projection also differs for air ID zero. That projection does not establish complete production named construction.

The broad control differs on 12 block selections. A focused range finds 107 differences across barrel, jigsaw, glow lichen, campfire and tube coral.
The earlier server sweep queried Script API `ItemStack.matches`; it did not directly read the legacy converter's selected block pointer.
The Script API path and complete client/level cache setup need comparison before the legacy-conversion data changes.
These observations remain separate caller contexts. The existing auxiliary data remains unchanged.

The four-project build passes 2,856 tests with 163 optional skips and no failures or errors.
A separate complete core run passes 1,725 tests with 86 optional skips. Checkstyle passes.
All nine retained packaged suites and the nonempty-component suite pass.
All 1,514 core classes and three registry resources match the embedded client and proxy copies.
All 1,191 client classes match the tested add-on.
All four original reports and all five goal areas remain active.
