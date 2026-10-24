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

The new lifecycle bridge remains outside release 0.3.54.
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
