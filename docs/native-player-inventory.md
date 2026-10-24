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

The constructor also stores an independent flag at offset `0x1319`.
Its producer compares a virtual service result with `1`; the service comes from client vtable offset `0x578`, then service vtable offset `0x70`.
The service type remains unverified. The implementation must not substitute the effective creative predicate or the input mode for this flag.

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
The reference supplies model-filter updates and initial tab publication. It disables the separate restricted-tab policy.
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
This model construction evidence comes from disassembly. Recipe ordering, grouping, evaluation and mutation still need executed references and a production implementation.
The player screen must retain the complete catalog and recipes that need a crafting table.
A fabricated empty recipe catalog cannot establish support for the default inventory asset.

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

The full stack passes 2,817 tests, with 163 optional skips.
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
