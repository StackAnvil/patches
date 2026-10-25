# Server-authoritative inventory requests

This patch follows the inventory work owned by [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It remains deferred until that prerequisite lands.

## Empty display-name components

An empty `minecraft:display_name` component now retains ordinary naming instead of installing a blank Java label.
The definition accessor applies this rule to resource-pack definitions.
Registry-owned component descriptions handle network construction and updates.
An empty upper-pack definition replaces a lower override. Whitespace and later nonempty values remain valid overrides.

Fresh controls on Bedrock 1.26.51.1/build 51061372 execute 1,299 primary-name cases, including ComponentItem getter `0x143fd2be0`.
The native getter ignores an empty display-name component and retains its ordinary description.
Typed NBT lookups, custom-name selection, ordinary naming, and three translation-key families execute unchanged.
Language translation, component lookup, allocation, and runtime services remain supplied boundaries.
Full specialized-name, secondary-label, language, search-input, and visual parity remain unfinished.

The initial regressions covered repeated network updates and upper-pack precedence across primitive and object component forms.
The network cases now run through the registry-owned naming checks. This patch retains the pack-precedence check.
The full 104-patch core stack replays, and all four projects build.
Verification passes 2,623 tests, with 163 optional skips and no failures or errors.
All 1,413 packaged core classes match the copies in the add-on and proxy.

## Brewing stand addressing

The target BDS 1.26.51.1 inventory exposes ingredient slot 0, bottle slots 1 through 3, and fuel slot 4.
Map them to Java ingredient slot 3, bottle slots 0 through 2, and fuel slot 4.
The previous mapping swapped ingredient and fuel. The native request collections now follow the corrected addresses.
The slot regression fails before the correction and passes afterward.

The authored screen requires both workstation and counter capabilities. It retains ordinary inventory operations and item authority.
Container properties remain signed int32 snapshots under the current presentation sequence.
Live observations confirm property 0 as remaining brewing ticks, property 1 as fuel, and property 2 as total fuel.
Completion reaches counters `[0, 19, 20]`, consumes the ingredient, and transfers three awkward potions to player inventory.
Counter updates do not advance item revisions.

## Crafted item metadata

A successful stack response supplies counts, names, and stack network IDs.
It omits complete item tags and the item's final subtype.
A crafted map can therefore retain a preview UUID after the response assigns its new stack ID.

Core identifies transfers from `CreatedOutputContainer` and correlates their destinations with the response.
An `InventoryMismatch` transaction requests full inventory data while the workstation remains open.
Queued interactions wait for matching destination IDs and counts and complete player, cursor, armor, and offhand snapshots.
Later snapshots can invalidate an earlier matching update.
This barrier prevents queued predictions from running between snapshots of the same refresh.
The existing inventory recovery handles a refresh timeout.

The [target inventory transaction schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/inventory-transaction-packet/) documents the transaction union.
The [map-copy schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/map-create-locked-copy-packet/) documents the preview map identity request.
Numeric values and response behavior come from the matching native build.

## Verification

- Native Bedrock 1.26.51.1, build 51061372, protocol 2193, with a matching dedicated server.
- An injected mismatch after an accepted map-locking craft returns full player, armor, HUD, offhand, and workstation contents.
- Cartography stays open. HUD slot zero contains the final map UUID and subtype; its UUID differs from the preview.
- A subsequent native placement succeeds using the refreshed item's acknowledged network ID.
- Five correlation tests cover final map metadata, stale IDs and amounts, wrong slots, multiple destinations, inventory aliases, and superseding snapshots.
- The complete ViaBedrock build and tests pass after replaying the 84-patch stack.

Raw captures and account data remain private.
This native comparison establishes the refresh mechanism.
Java UI integration, other server implementations, and direct and ViaProxy crafting comparisons remain unverified.
Cartography's Java screen and request generation remain incomplete.

## Recovery refresh

A request timeout now sends `InventoryMismatch` after reopening the player inventory.
The old recovery path reopened the inventory without requesting the cursor and equipment snapshots that its barrier requires.
It now shares the refresh transaction used for crafted metadata.
The native comparison above establishes that this transaction returns all required containers on Bedrock 1.26.51.1.
The barrier and disconnect timeout remain active if the server cannot supply fresh state.
The report lacks the original server and request log.
This change fixes a recovery defect, but the original timeout trigger remains unknown.
The complete core build passes with 557 passing tests and five optional skips, including the inventory recovery and crafted-item synchronization tests.

## Complete inventory snapshots

Core installs every slot from a full snapshot before it notifies slot observers.
Recipe observers therefore see the complete replacement, rather than a mixture of old and new contents.
Full item equality suppresses unchanged snapshot notifications and preserves count, tag, subtype, and stack network ID changes.
Single-slot predictions retain their existing notification behavior because some predictions mutate the stored item before the update.

Strict BDS sends a release transaction and then full player and offhand snapshots after food consumption.
The previous callback loop sent duplicate mainhand equipment and unchanged offhand equipment after that transaction.
The [matching equipment schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/mob-equipment-packet/) requires updates for held slot or content changes.
Actual changes still produce an equipment update.

Two tests cover repeated snapshots, count and network ID changes, complete contents during callbacks, and ownership of the snapshot array.
All four projects build, and both complete patch stacks replay.
There are 16 converter, 669 core, and 584 add-on test cases, with 133 skips and no failures or errors.

Direct and ViaProxy strict-BDS recordings both reach join and spawn with protocol 2193.
Each route contains ten food completions across controlled eating, additional repeated eating, and last-item consumption.
Every completion now sends one equipment update, compared with three in the preceding recordings.
Both routes consume the last item and restore full movement input.

Eating corrections remain in these recordings.
The direct route receives one during controlled eating and one during additional repeated eating.
ViaProxy receives two during controlled eating, three during additional repeated eating, and two after last-item consumption.
This change verifies snapshot consistency and removal of duplicate equipment updates.
Native completion prediction, correction history, and the cause of those corrections remain incomplete.

## Horse, donkey, and mule menus

Core handles `UPDATE_EQUIP` and `CONTAINER_OPEN` through one mount-opening flow.
Receiving both packets preserves the same container and contents.
Supported mounts use Java's ordinary mount screen, including five cargo columns for chested donkeys and mules.
The menu uses standard Java packets and needs no add-on-specific screen in ViaProxy.
Live route comparisons remain pending.

Bedrock capacity, content indices, request slots, and Java menu slots have separate meanings.
Java reserves two equipment cells; Bedrock donkeys and mules use one.
Native cargo indices 1 through 15 therefore map to Java cells 2 through 16.
Player contents begin at Java cell 17.
An unchested mule can retain native capacity 16 while displaying only two Java cells.
The hidden armor cell and inaccessible cargo cannot create item requests.
Compact unchested snapshots and complete native snapshots both retain correct identity.

The [target equipment packet schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/update-equip-packet/) establishes the packet fields.
[Geyser's fixed mount opener](https://github.com/GeyserMC/Geyser/blob/f66329d9d21b3c836edc014fbb9d8312fbe34285/core/src/main/java/org/geysermc/geyser/translator/protocol/java/inventory/JavaMountScreenOpenTranslator.java) sends a zero size and server equipment rules.
Its [chested mount translator](https://github.com/GeyserMC/Geyser/blob/f66329d9d21b3c836edc014fbb9d8312fbe34285/core/src/main/java/org/geysermc/geyser/translator/inventory/horse/ChestedHorseInventoryTranslator.java) corroborates equipment and cargo mappings.
Supported actor metadata and chest state determine our menu layout.
Equipment predictions honor server item names, auxiliary values, and empty accepted-item lists.

A headless client joined official BDS 1.26.51.1, build 51061372, protocol 2193, in an isolated loopback network namespace.
The server reported a tamed mule capacity of 16 before chest attachment and set `CHESTED` after attachment.
Script API observed four emeralds at cargo index 1 and two diamonds at index 15.
These checks establish target capacity, chest state, and cargo indices.
They do not establish native screen-opening packet order or live translated inventory requests.
The headless screen-opening probe timed out; its processes stopped cleanly.
The existing lab display and current-boot native GPU guard remain intact.

Eight added tests cover native and Java slot separation, all cargo and player cells, hidden slots, both opening packet orders, complete payload consumption, equipment restrictions, compact snapshots, and rollback identity.
Native UI, saddle transfers, shift-clicks, rejection recovery, reopening, destruction, direct connections, and ViaProxy comparisons remain required.
Other mount types and their storage layouts remain unsupported.

The full 95-patch stack replays successfully.
CubeConverter and the complete ViaBedrock build pass, including Checkstyle and 672 passing core tests with 19 optional skips.

## Server hotbar selection

Protocol 2193's [PlayerHotbar packet](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/player-hotbar-packet/) carries a slot, container, and selection flag.
Core previously forwarded the slot to Java without updating its inventory model.
Later use, drop, interaction, and equipment translations read that stale model.
Accepted selections now update the core slot before Java receives `SET_HELD_SLOT`.
The state update does not itself send a client equipment request.
Invalid slots and notifications without selection leave the held state unchanged.
The existing wrong-container rejection remains active.

Java carried-item requests now validate the full short value before narrowing it to a byte.
Values such as 256 and 264 previously became valid slots 0 and 8.
Invalid requests now cancel without changing the selected stack.
Eighteen packet tests cover repeated server selections, held-stack identity, unchanged inventory, ignored notifications, unsigned bounds, and Java aliases.
This behavior lives in core and requires no add-on channel.

The complete converter, core, add-on, and ViaProxy builds pass after replaying the stack.
All 146 tooling tests pass.
Two new strict-BDS cases force selection during bow or crossbow charging, then use the selected snowballs.
Both pass through direct connections and ViaProxy, alongside all four existing charging-through-knockback cases.
Neither weapon spends an arrow during cancellation; each follow-up uses one snowball and produces one owned projectile.
Both Java clients have the add-on installed, but this fix changes only core.
Both recordings exit successfully, and the owned server stops.
Fresh native comparisons remain blocked by the current-boot GPU guard.
The [complex gameplay record](../../../docs/bedrock-complex-gameplay.md#server-hotbar-selection-during-charging-october-6-2026) retains the verification scope.

## Bundle identity zero

Dynamic storage ID zero is a valid unsigned identity.
Core requires an exact `IntTag` for `bundle_id` and shares that lookup between rendered contents and holder tracking.
Missing or malformed tags cannot alias storage zero.
Present unsigned IDs retain every bit, including the signed Java representations above `2^31 - 1`.

An isolated official BDS 1.26.51.1, build 51061372, protocol 2193 probe allocates bundle IDs zero and one.
Insertion, extraction, and compaction succeed with zero.
The server rejects a stale stack network ID and accepts a retry with the authoritative ID.
It reports complete 64-slot contents in this probe.
Partial dynamic snapshots retain their existing prefix update semantics.

Three tests cover separate zero and one contents, malformed identities, and unsigned container-ID encoding.
These tests fail when zero is rejected again.
The probe uses a headless protocol client and does not establish native graphical or Java bundle UI parity.
Java insertion, extraction, selection, nesting, weights, and rejection recovery now have core paths described below.
Graphical native and translated route comparisons remain required.
Raw captures stay private.

## Bundle actions and selection

Core translates primary and secondary pickup clicks for bundles in a slot or on the cursor.
Insertion retains native capacity, item stack sizes, nesting overhead, and dynamic storage identity.
Merged stacks move through accepted Swap and Place actions. Selected extraction uses Take and compaction Place actions.
Unavailable nested contents, cycles, shulker boxes, and full bundles cannot create insertion requests.

Java 26.3 sends bundle selection as two VarInts: slot ID and selected item index, without a container ID.
The registered handler resolves the current screen, validates the full slot value, and queues selection before later clicks.
Pending native closes cannot accept a selection. Large signed slot values cannot alias valid slots after narrowing.
Rejected predictions restore dynamic containers by complete identity, including zero, while preserving newer authoritative revisions.
Partial server snapshots retain prefix update semantics.

Ten stateful tests exercise actual click dispatch, nesting, ordering, network identity, acknowledgment, and rollback.
Nine packet tests execute the actual registered mapping against raw packet buffers.
They verify full decoding, player inventory fallback, queued selection and extraction, invalid slots, and pending-close controls.
Only the packet transport boundary is mocked; production registration, decoding, container state, and request construction execute.
Mockito remains a test-only dependency with its explicit JVM agent.

Isolated official BDS 1.26.51.1, build 51061372, protocol 2193 accepts insertion, merge reordering, selected extraction, nesting, and cursor-held bundle actions.
It rejects overweight and shulker requests with result 55, and an atomic request with a stale second action with result 49.
A retry with the original authoritative identity succeeds after rejection.
These probes use a headless protocol driver. Native graphical, Java direct and ViaProxy, ordinary Java, and in-use dropping comparisons remain required.

## Nested bundle refresh and bounded metadata conversion

Dynamic bundle updates resolve the visible root through nested storage identities.
The Java packet refreshes that root slot or screen, while Bedrock requests retain their immediate storage address.
Full external-menu refreshes include the player's 36 inventory slots.
Unattached storage still receives authoritative revisions, so rejected predictions cannot overwrite later server updates.

Cursor-held bundles use Java's cursor packet for full and single-slot updates.
Ordinary HUD snapshots retain inventory and crafting contents, with a separate cursor update for an open external menu.
Java 26.3 applies menu-zero contents to the inventory menu, which does not refresh the external menu's carried item.

Bundle metadata conversion checks cycles and the minimum capacity cost of nested bundle occurrences before recursion.
Memoized counts bound shared graphs; each occurrence still contributes its nesting cost and stack amount.
Unrepresentable contents omit the optional Java component and log a diagnostic.
The real item identity and authoritative storage remain intact, allowing a later repaired update to render normally.
This bound follows Java's nesting cost; it is not described as a packet codec depth limit.

Eighteen targeted tests cover registered packet handling, orphan attachment, revisions, rollback, cursor routing, root slot counts, cycles, shared graphs, and capacity boundaries.
A private probe with real mappings handles a cyclic registered slot update without a stack overflow.
After repair, it round-trips a depth-sixteen bundle through the Java item wire codec.
The earlier production artifact's recursive failure remains retained as a negative control.
Graphical native, direct and ViaProxy menu interactions remain separate verification requirements.

## Single-slot quick craft and cursor bundles

Core delegates one eligible quick-craft destination to the ordinary pickup handler, with the original mouse mode.
Slot validation precedes this fallback. Unresolved, output, equipment, and incompatible occupied slots cannot trigger an unrelated pickup or swap.
Ordinary multi-slot distribution remains unchanged.
Java 26.3 `AbstractContainerMenu` resets drag state and invokes `PICKUP` when its selected slot set contains one slot.

An isolated strict official BDS 1.26.51.1 ViaProxy run exposed this difference with an ordinary Java client.
The actual right-click gesture sent three `QUICK_CRAFT` packets with buttons 4, 5, and 6.
The HUD bundle identity, storage registry, and four diamonds remained valid before all three packets.
Core instead requested `Place` for the bundle holder. The server accepted that request, leaving the cursor empty.
The first post-response server inventory and actual Java inventory screen agree on the resulting bundle position and contents.
The correct pickup path requests `Take` for the diamonds and retains the bundle on the cursor.

All 15 stateful bundle action tests pass after the full 97-patch replay.
Four tests fail on the previous core behavior with the same incorrect `Place` action.
The new cases cover duplicate adds, invalid slot sets, empty bundles, mismatched phases, queued rejection and retry, and ordinary multi-slot distribution.
The earlier ordinary Java baseline verifies cursor extraction, but it does not retain the exact three packets.
A fresh ordinary Java 26.3 client now verifies the fix through ViaProxy and strict official BDS.
The same three drag packets produce accepted Take actions for four diamonds from dynamic storage zero.
The server inventory confirms the diamonds in the destination; the actual client retains the empty bundle on the cursor.
Loaded support, dry air blocks, health, stationary position, and advancing Survival ticks precede the input.
Script API cannot observe the UI cursor directly; the client components and matched native response establish its identity and contents.
Fresh native graphical comparison, broader phase-one selection rules, and creative clone behavior remain required.
The failed live run also records later authoritative drowning damage and a DeathInfo packet reporting drowning.
The preceding platform fall remains unexplained. Those later events are separate from the paired cursor result.

## Server-owned menu lifecycle

Core distinguishes physical block containers from server-owned and actor-owned menus.
Only physical containers close after block removal or excessive distance.
Missing or pending chunk data leaves the binding unresolved until a complete section supplies the block state.
A late barrel or shulker binding also updates the native request address.
Known air positions and actor placeholder positions do not impose a physical lifetime on a server menu.
Snapshot copies retain the binding, and generic containers use the chest title instead of `container.null`.

An actual CubeCraft desktop trace uses Java 26.3 and Bedrock protocol 2193 with the previous core artifact.
The observer verifies the loaded core contents and forwards the original traffic unchanged.
A main-hand `USE_ITEM` for `cubecraft:social_menu` produces native `Use` (1), `Unknown` trigger (0) and `Failure` prediction (0).
The server opens container 6 after 45 ms, with actor unique ID 51447 and position (-1012, 43, -1).
The old core sends `CONTAINER_CLOSE` 6 ms later after its invalid-block check, and the server echoes the close 24 ms later.
This trace establishes that right-click reaches the server and opens the menu.
It supports the general lifecycle repair without changing item-use flags or adding server-specific rules.

All eight lifecycle regression cases pass:

- Known air retains contents and ignores physical distance. An actor menu ignores a misleading chest placeholder.
- A physical chest still closes after block removal or excessive distance. Snapshot copies retain its physical binding.
- Missing and pending chunks defer binding. A later air update resolves a server menu without closing it.
- Late barrel and shulker updates produce the correct pickup request addresses. Physical barrel titles and custom names remain intact.

The first live trace verifies the old defect.
A second bounded capture verifies the repaired desktop client on the same server and protocol.
Right-click opens an actor-owned Social Menu, and twelve samples retain its container screen across 1,149 ms.
The first close originates from the client after those samples; the invalid-block close does not recur.
The actual desktop screen also uses the chest title.
The capture reaches its 512-packet limit during repeated menu opens and closes.
Cleanup removes both observer handlers, preserves the original pipeline and keeps the connection active.
The first capture contains no left-click `ATTACK` or `MODAL_FORM_REQUEST`.
The second capture records five raw forms for separate resolver checks.
It does not establish a native graphical or left-click comparison.
Raw traffic, server assets and client data remain private.

## Native container opening identity

Core retains the original CONTAINER_OPEN type, packet position, and actor unique ID separately from the translated menu and physical block binding.
Unknown actors and actor placeholder positions retain their actual packet values.
An accepted menu receives a connection-local generation. Reopening a reused protocol ID advances that generation.
Pending close retains the original generation and opening context until acknowledgment or recovery clears it.
UPDATE_EQUIP can open a mount before CONTAINER_OPEN. The later packet enriches the same menu without advancing its generation or replacing contents.
An equipment-only or trade-driven opening has no fabricated CONTAINER_OPEN context.
Read-only binding state distinguishes unresolved chunks, physical blocks, and server-owned menus.
This extends the server-owned lifecycle feature under the existing ViaBedrock #276 prerequisite.

Verification uses real packet translation and stateful tracker transitions.
It covers reused IDs, pending close, rejected competing opens, stale enrichment, unknown actor identity, late block resolution, both mount opening orders, and recovery.
Titles, actor capacity, item request semantics, and native graphical inventory rendering remain unchanged.
This component supplies metadata for a future general inventory UI bridge. It does not establish native title construction or native pixels.

Targeted verification passes all 29 cases, with no skips, failures, or errors. Main and test Checkstyle tasks pass.

The complete 98-patch replay preserves all seven tested source files byte-for-byte. Full combined build and live native inventory presentation remain pending.

## Authored count-one container requests

The negotiated authored subset uses the existing server-authoritative inventory request engine.
The client supplies only the current menu, opening sequence, revision and clicked source ordinal.
Core derives source identity, destination permissions, stack network IDs and stack capacity from its current inventory model.

Admission requires the exact ordinary ChestContainer provider and server-authoritative request mode.
The native count-one planner prefers compatible occupied inventory cells before empty cells in provider order.
It creates one Place action and preserves the carried stack.
Locked or unsupported providers retain ordinary fallback.
Prediction, acknowledgments and rollback use the existing inventory tracker and request storage.

The original Bedrock 1.26.51.1 callback, model, provider and planner controls establish the scoped count-one behavior.
They do not establish full native physical input routing or Windows serializer parity.
Java uses the existing tested packet 147 writer; no native wire serialization success is claimed.

The combined private core gate passes 1,015 cases with 30 optional skips.
Stateful tests cover source count one, stale or reused menus, forbidden destinations, unchanged cursor, send failure and response recovery.
Legacy backend rejection leaves ordinary Java clicks available.
Controller navigation and full native keyboard interaction parity remain outside this change.

## Reported-slot reconciliation for authored actions

The recorded protocol-2193 Social interaction returns a successful response containing only an empty cursor.
That response does not confirm the predicted source or destination transfer.
Core previously retained both predictions, which can remove a menu icon without an accepted transfer.

Authored count-one requests now use a reported-slot response policy.
Core restores omitted predicted changes before applying the slots that the response actually reports.
Restoration requires the same container owner, opening generation, server item revision, and still-predicted item contents.
Newer authoritative contents remain intact. Inventory response aliases resolve to their real backing slots.
Successful responses and rejection rollback from an earlier opening cannot overwrite a reopened menu, including the same object with a new generation.
Restored predictions also retire queued clicks that depended on their contents.
Ordinary Java requests retain their existing prediction policy.

The matching [protocol 2193 response schema](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/item-stack-response-packet/)
and [nearby preview container schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/types/item-stack-response-container-info/)
describe the response and named slot records. No packet ID, enum value, or wire format changes in this fix.
The missing-transfer case comes from the recorded target-server interaction above, rather than a new native-client comparison.

Six regression cases execute the genuine authored-action session, prediction storage, and response reconciler.
They cover cursor-only, complete and partial responses, inventory aliases, newer server contents, queued clicks, and reused menu generations.
The suite passes alongside the existing request-tracker and native-action tests: 16 cases, no skips or failures.
Main and test Checkstyle checks pass.
Working Social navigation, native serializer behavior, and fresh direct and ViaProxy menu comparisons remain open.

The full 101-patch stack replays after folding this change into its owning inventory patch.
The converter and complete core build pass, including all Checkstyle tasks.
Core runs 1,205 test cases: 1,175 pass, 30 optional cases skip, and none fail.

The complete downstream build also passes: 18 converter tests, 816 add-on tests, and four ViaProxy tests pass.
The add-on skips 120 optional cases. The final rejection-generation control passes before rebuilding these matching artifacts.

A private local run uses the official BDS 1.26.51.1 archive with SHA-256
`ad91d3b824e51ea50b5bb601c295cbd8f543a29b14315c2ad89ff27311e2d860`.
The client reaches spawn, remains connected for 20 seconds, and reconnects successfully through ViaProxy.
The chest-transfer fixture reports that the chest screen did not open.
Later screenshot inspection confirms that the native chest screen was already open.
The probe assumed Java GUI scale two and sampled outside the native panel.
The same run reports repeated cached-chunk NBT decode errors before the inventory interaction.
This run does not establish native menu behavior or transfer acceptance. Its processes and private display stop cleanly.
An earlier attempt with the default BDS 1.26.45.1 installation fails protocol detection and supplies no target-version evidence.
The home filesystem also refuses the initial private copy at its five-GiB reserve.
The target-version run uses a private temporary checkout on a filesystem with sufficient free space and keeps that reserve check enabled.


The corrected probe detects native desktop scale and uses exact capture-pixel coordinates for sampling and slot clicks.
With the independent full-dimension biome fix, a fresh target-server ViaProxy run passes chest transfer.
The server confirms zero items in the chest and all four items in the player inventory.
Join, 20-second stability, reconnect, and reconnect stability also pass.
Cached-chunk decoding errors fall from 1,058 in the earlier run to zero in the rebuilt run.
This verifies ordinary chest interaction with these artifacts; authored Social navigation remains open.


## Authored action live verification

Two isolated BDS 1.26.51.1 cases now exercise the negotiated authored count-one path through ViaProxy.
The client places a named chest and opens a title-selected manual grid with one exposed source slot.
It clicks an omitted slot before activating the exposed slot.

The empty-destination case leaves three source emeralds and both hidden diamonds in the chest.
One emerald reaches hotbar slot zero.
The merge case leaves the same chest contents and increases the existing player stack in slot 15 from 62 to 63.
Hotbar slot zero remains empty, which verifies merge preference over an earlier empty cell.
The ordinary four-item chest-transfer control also passes with the same installed resource pack.
Join, stability, reconnect, and reconnect stability pass. Chunk decoding errors remain zero.

An ordinary-controls fixture attempt changes the hidden slot and fails both assertions.
A missed authored hit target leaves all contents unchanged and also fails.
The corrected fixture uses explicit manual-grid anchors and retains its open-menu screenshots.
These controls prevent fallback or an ignored click from passing as a native action.
The current custom-description scope requires matching custom names on the source and merge target.
The cases do not establish default-name presentation or full native physical input routing.

A separate private comparison verifies two retained target-native Social requests against the current request codec.
Each complete 27-byte request matches byte for byte. Both 18-byte successful cursor-only responses also round-trip exactly.
The original protocol-2193 journal confirms that each response precedes a form, and the form precedes the client's container close.
This verifies those serialized examples from the original recording; it does not establish a fresh Social interaction with the current client.
A success response containing only an empty cursor therefore does not, by itself, prove that menu navigation failed.
A subsequent offline replay uses the unchanged first 210 seconds of the original native journal and its accepted resource pack.
The current add-on reaches the authored Friends form after the container and cursor-only success response.
A saved screenshot confirms the visible form, and the screen audit records the container-to-scene transition.
The replay passes transport, spawn, payload completeness, and Java resource-pack loading.
Overall rendering verification fails because the scene contains unresolved mappings, including `cubecraft:empty.entity`.
This result verifies form takeover during recorded delivery. It does not establish fresh interactive Social request acceptance or complete scene rendering.

The tooling check, probe-pack build, all 261 offline tests, and patch metadata validation pass.
Raw recordings, packet extracts, screenshots, JVM probes, and run logs remain private.

## Late responses after menu replacement

Ordinary inventory requests previously bypassed the menu-lifetime check used by authored count-one actions.
A delayed success response could overwrite a replacement chest through its shared container name.
A rejected request could also restore old crafting cells from its full cursor snapshot.

Both response policies now retain the captured menu lifetime.
Reusing a container ID or reopening the same object does not authorize an old reply.
The permanent player inventory and cursor still accept their own response data after a screen transition.
Other HUD cells retain the captured menu lifetime.
This includes workstation slots that fall back to the player UI after closure.
Rejected requests preserve those later cells. Crafted-result refresh also ignores obsolete destinations.
Dynamic bundle replies retain the captured registry object, so reusing a removed bundle's ID cannot overwrite its replacement.
Generation history also survives an intervening open/close cycle when the request starts without an open menu.

The expanded ordinary-click regression fails before this change by overwriting a reopened chest.
The bundle regression also fails before its identity guard by overwriting a replacement with the same dynamic ID.
The closed-menu control fails before the generation-history correction.
Behavioral tests cover both policies, success and rejection, object reuse, HUD fallback, and persistent inventory and cursor controls.
The crafted-result test checks an active destination before it closes or reopens.
Test fixtures capture predictions at the production sender's boundary.
These checks establish translator lifecycle behavior. They do not establish a new native response-manager or graphical parity comparison.

All 102 core patches replay cleanly. All four projects build with 2,154 passing tests and 152 optional skips.
Offline validation passes 263 tooling tests and metadata checks. All four replay self-test groups pass.

A fresh isolated BDS 1.26.51.1 run passes both authored count-one cases and the ordinary chest-transfer control through ViaProxy.
The empty case transfers one emerald to hotbar slot zero; the merge case increases slot 15 from 62 to 63.
Both preserve the hidden diamonds and leave three source emeralds.
The ordinary control transfers all four items. Join, reconnect, and their 20-second stability checks pass.
The test services and private display stop normally.
These live cases verify normal requests with the rebuilt artifacts. Delayed response and replacement coverage comes from the behavioral tests above.

Native item registration keeps ordered component updates separate from runtime-ID ownership.
The first explicit version selects the constructed factory; later invalid-ID entries can update it without taking a runtime ID.
Constructor defaults and typed updates now own stack capacity, replacing the static table and pack-definition override.
Inventory keeps native zero and unsigned-byte values. Only the Java component narrows them to its valid range.
Cooking food and block traits use that same construction history. Their catalog integration remains incomplete.

All 57 focused tests pass, including retained native component and legacy fixtures.
The zero-capacity bundle regression fails with division by zero before the guard and passes afterward.
The fixtures cover 26 component cases, 93 legacy cases and their update sequences.
They do not establish a Player flow or graphical parity. Private executable provenance is recorded in the asset-source guide.

The complete 102-patch core stack replays cleanly, and all four projects build.
The build passes 2,262 tests with 152 optional skips. Offline validation passes the 264 tooling tests and metadata checks.
A fresh BDS 1.26.51.1 ViaProxy run passes furnace, smoker and blast-furnace recipe-book cooking, brewing, authored count-one chest placement and ordinary chest transfer.
Join and reconnect stability checks pass. Both installed client profiles match all 1,346 core classes in the built artifact.
The private display and owned services stop normally. These controls use Java cooking screens and do not establish native cooking presentation.

## Concrete recipe identity (October 22, 2026)

The item registry now exposes concrete recipe keys for constructed items and network-stack inputs.
The conversion follows numeric Item ownership before it selects block auxiliary metadata.
It preserves wildcard descriptors, unsigned item IDs, missing registrations, and the native descriptor hash.
Runtime block ownership and associated block ownership remain separate inputs.

A fresh target-executable comparison checks 3,600 supplied registry, stack, and block combinations.
The comparison covers the original descriptor conversion and numeric lookup functions.
It supplies constructed storage and does not parse a complete network item packet.
Focused tests also cover runtime ownership and associated-block boundaries.
These APIs do not yet replace production network Item construction or populate the cooking catalog.

A fresh comparison also checks network recipe keys and hashes against 2,250 complete parsed native constructor and descriptor-conversion executions.
It supplies runtime candidates, associated defaults and warm auxiliary caches, registry/palette storage, and an empty user-data load boundary.
Actual built-in/archetype initialization, cold auxiliary registration, and production constructor integration remain unfinished.

All four projects build with 2,296 passing tests, 152 optional skips, and no failures or errors.
The new native-reference comparisons run without skips. Tooling checks, 264 regressions, and patch metadata checks pass.
A fresh ViaProxy run passes furnace, smoker, blast furnace, brewing, authored chest placement, ordinary chest transfer, and same-world reconnect.
Both launched profiles match all 1,360 rebuilt core classes and both block-item resources.
The live run exits successfully and stops its private display normally. These controls use Java cooking screens.

## Production recipe matching (October 22, 2026)

Named ingredients now use the connection Item registry and the native network-stack descriptor conversion.
The matcher compares associated blocks by exact palette ownership.
Different auxiliary values can select the same block; a different axis still fails the match.
Both descriptor positions accept wildcard 32767.
Named metadata narrows to signed-short storage and clamps negative values to zero.
Value -1 therefore does not act as a wildcard.

A fresh executable fixture verifies 440 cases against Bedrock 1.26.51.1, build 51061372.
It executes parsed Cereal conversion, named construction, deferred resolution, canonical registry lookup, descriptor construction and query-first comparison.
Warm auxiliary caches, empty alias maps, allocation, CRT, TLS and locks are supplied boundaries.
The Java comparison covers all 440 cases, including negative and wide int32 metadata before signed-short narrowing.
A separate regression executes the production matcher after both item codecs and checks the stripped-wood default and alternate axis.

Both network codecs now resolve raw headers through the connection registry before user-data loading.
Incoming runtime candidates require matching numeric Item ownership; outgoing headers use native descriptor identity.
Actual alias initialization, unmodeled custom archetypes, saved-item construction and the native cooking-source collector also remain open.
These changes establish recipe matching progress, not complete native inventory or cooking-screen parity.

All four projects build with 2,301 passing tests, 152 optional skips, and no failures or errors.
The expanded native-reference and consumer tests pass all 43 selected cases without skips.
Tooling checks and all 264 regressions pass. The complete 102-patch core stack replays.

A fresh ViaProxy run passes the three cooking stations, brewing, authored chest placement, chest transfer, manual crafting and bulk crafting.
Its recipe-book check selects the unavailable bamboo recipe instead of the plank recipe and fails its item-count assertion.
The test now filters craftable entries before selection.
A focused rerun places both planks and produces four sticks; reconnect passes in both runs.
All nine gameplay actions therefore pass across the two recordings; the initial recording retains its failed test result.
All four launched profiles match the 1,360 rebuilt core classes and both block-item resources.
Both runs stop their private displays normally. These controls use Java screens and do not establish native UI parity.

## Connection-aware network Item construction (October 22, 2026)

Both network item codecs now pass raw auxiliary bits and runtime IDs to the connection constructor before loading user data.
The constructor validates runtime Block ownership against the original Item, then resolves the associated Legacy only when necessary.
It keeps exact runtime slots even when an archetype's canonical auxiliary descriptor remains unknown.
Recipe results use the same constructor, and recipe matching consumes the constructed Item without reconstructing it.

Count invalidation clears Item and Block ownership and skips user-data loading.
The native block-item constructor can reapply wildcard metadata after that invalidation; the implementation retains this detail.
Outgoing headers use the concrete descriptor's numeric ID and canonical auxiliary value.
Empty descriptors retain independent stack network IDs and omit user data.

Both Java decoder paths match 2,250 native parsed-header constructor results in each wire format.
The comparison covers resolved Item ID, auxiliary metadata, count, Block presence, exact runtime slot, descriptor identity and hash.
Both outgoing headers match 384 complete native descriptor-producer executions.
Six further native empty-stack producer cases retain outer network IDs and produce no user-data bytes.
The recipe-result count sweep runs through the registry constructor for all 65,536 signed-short inputs.

These fixtures execute Bedrock 1.26.51.1, build 51061372, with supplied registry/palette storage, warm auxiliary caches and runtime seams.
They do not establish binary reader equivalence, actual item installation, specialized user-data loading, saved-NBT construction or all custom archetypes.
The native cooking-source collector and authored workstation controls remain unfinished.
The movement, mount, camera and rendering requirements of the five-area goal also remain active.

All four projects build with 2,309 passing tests, 152 optional skips, and no failures or errors.
The core suite contains 1,489 cases. New native-reference comparisons run without skips.
Tooling checks, all 264 regressions and offline patch metadata checks pass.
All 102 core patches and 38 client patches replay cleanly.

A fresh strict-BDS ViaProxy run passes all eleven controls.
Cooking passes on the furnace, smoker and blast furnace.
Brewing, authored chest placement, ordinary chest transfer, manual crafting, recipe-book crafting, bulk crafting and both creative replacement cases also pass.
Join and same-world reconnect pass. Both installed profiles match all 1,363 rebuilt core classes and both block-item resources.
The runtime probe mutates three temporary Items before the fix and preserves all three afterward. No observer errors occur.
The run exits successfully and stops the private display normally.
These controls use Java cooking screens; native workstation presentation and the other goal areas remain open.

## Item userdata without NBT (October 22, 2026)

A zero userdata marker omits NBT but still precedes both restriction arrays and shield timing.
The shared loader now reads those fields instead of returning at the marker.
Both item wire formats retain the fields, and a truncated tail retains earlier completed fields.
The target 1.26.51.1 generic reader and shield reader establish this control flow.
Positive legacy NBT markers and invalid-version behavior remain outside this correction.


## Native transfer quantities and request identities

Pickup requests and authored count-one transfers now share the native quantity decoder.
It preserves explicit counts, the two distinct descriptor domains, unsigned-byte narrowing, and rejection of unknown values.
Source validity, maximum-stack resolution, permissions and destination capacity remain separate steps.

The native count-one backend rejects sources without a positive server stack network ID.
It skips occupied merge destinations with unresolved IDs and retains zero for empty destinations.
These guards prevent a missing-ID exception and requests with unresolved identities before prediction starts.

A private fixture executes the unchanged decoder in Bedrock 1.26.51.1, build 51061372, protocol 2193.
The comparison covers 1,638 cases, including signed extremes, byte narrowing, invalid descriptors and the separate one branch.
All 28 selected Java tests pass with the native fixture enabled. Both Checkstyle tasks pass.
The fixture establishes the internal quantity calculation. It excludes source validation, permission callbacks, destination limits, mutation, requests and UI behavior.
Native cooking dispatch, item return behavior and authored workstation controls remain unfinished.

The complete four-project build passes 2,348 Java tests, with 152 optional skips and no failures or errors.
All 102 core patches and 38 client patches replay cleanly. Tooling checks, 264 regressions and patch metadata checks pass.

A fresh strict-BDS ViaProxy run passes both authored chest transfers, ordinary chest transfer, pickup-all, and all three cooking controls.
Initial join and same-world reconnect also pass. The runner stops its private display normally.
These controls verify the existing request paths with the rebuilt artifacts. They do not establish authored cooking control or native visual parity.

## Ordinary transfer batches

The request tracker can retain separately scoped ordinary transfers as one pending batch.
Each request preserves its intermediate prediction. Responses wait for the complete batch and reconcile in request order.
Reconciliation restores the oldest snapshots and replays accepted deltas before server acknowledgments.
A later rejection preserves earlier accepted counts and confirmed stack IDs.
Newer server revisions and replacement menu generations retain their existing protections.
Queued clicks remain blocked until the batch completes. A rejection discards them.

Eight regressions cover reversed and duplicate responses, queued input, partial and complete rejection, newer contents, menu replacement, registration guards, and failed submission.
Each buffered response retains its arrival revision, so newer contents supersede an earlier acknowledgment before batch completion.
Failed packet submission restores the snapshots and releases pending ownership.
All 22 selected inventory tests pass, and both Checkstyle tasks pass before stack replay.

A fresh pinned native control confirms the false default for `enable_client_container_simulation` and executes the original disabled cooking initializer.
The controlled input still emits two owned requests in one packet, with the second destination referencing the first request ID.
The complete native controller, model owner, and independent frame scopes remain unverified.
This batch API does not activate authored cooking controls. Their backend remains unfinished.

The full four-project build passes 2,399 tests, with 213 optional skips and no failures or errors.
All 104 core patches replay. Offline validation passes.
All 1,392 core classes match the add-on's embedded core byte for byte.


## Retain native display-name updates

The registry-owned component description path preserves the last display name across omitted or wrongly typed updates.
Only a valid `StringTag` value replaces it. A valid empty string restores the ordinary description.
The superseded network-name reader and its three tests have been removed from this patch.
The remaining item-definition loader handles icons, cooldowns, use metadata, and resource-pack names.

Fresh native 1.26.51.1 controls construct 29 ordered updates for 13 actual component definitions.
They execute the populated registry initializer, named stack construction, description getter `143fd2be0`, and key method `143fd6ac0`.
All 13 results now form part of the registry's 23 native description checks.
All 2,630 static cleanup callbacks complete without owned allocation or lock leaks.
The registry checks cover the constructor, reader, and fallback phases. Five deliberate regressions fail by assertion.

The controls supply authored ItemData through the real typed vector and registry lifecycle.
They do not establish normal packet decoding, full native pack/client precedence, language selection, or screen parity.
The [component naming notes](../upstreamable/0095-integrate-authored-native-ui-presentation.pr.md#component-description-construction-and-conversion) retain the current production path and limits.


The earlier reader build passed 2,646 tests, with 163 optional skips and no failures or errors.
All 104 core and 38 client patches replayed. Its six item-definition checks ran without skips.
The packaged reader passes the same six tests, with five production class origins verified against the current core JAR.
All 1,419 core classes match both packaged copies. All 1,139 production client classes match the add-on.
Tooling, offline tests, and patch metadata checks pass.

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
Armor incoming-slot validation, world drops, direct creative edits and full destination policy remain separate callers.
Complete Actor, Level and controller construction, physical input and live server acceptance remain unfinished.
All five goal areas and the four original reports remain active.


The four-project build passes 2,893 tests with 161 optional skips and no failures or errors.
The core suite passes 1,762 tests with 84 optional skips. Checkstyle passes.
All 1,520 core classes match their embedded add-on and proxy copies.
All 1,191 client classes match the tested add-on.
All 198 core asset resources match the previous provider-policy milestone, including the unchanged Block auxiliary data.
Only ArmorContainer and three build-identity classes differ from that artifact.
The remaining 1,516 core classes are byte-identical, including the prior provider, merge and enchantment implementations.

At the armor-source milestone, the packaged JAR passed all 33 permission, ordinary-action and authority-adapter tests with verified implementation origins.
Seven deliberate armor regressions fail value assertions.
These controls detect a missing policy, incorrect lock modes, incorrect inherited modes, negative-level handling and reversed duplicate order.
Prior provider and merge mutation evidence remains supported by byte-identical implementation classes and unchanged data.


## Armor destination admission

Use the selected Item receiver and actual transfer count for armor placement.
The native incoming predicate requires one item and the matching equipment slot.
Armor capacity stays one even for stackable head items.
Shift-click now selects armor through the provider policy; pickup, drag, swaps and bundle extraction check their actual quantities.
Recipe callers use the quantity-bearing API in their owning patch.

Three complete-registry controls compare 94,104 destination decisions and 37,872 installed callbacks.
They cover builtin factories, definition collisions, associated head Blocks, typed wearable slots, retained updates and saved-stack counts.
All three controls complete original backing, input, registry, TLS, static and CRT cleanup without allocations or held locks.
The first uses version-None wearable declarations; the second uses DataDriven declarations that execute the readers.

See [the armor destination reference](../../../docs/native-player-inventory.md#armor-destination-permission) for control boundaries and validation.
Controller ordering, specialized outputs, drops, creative edits and live server acceptance remain separate.

The four-project build passes 2,902 tests and all 105 patches replay.
The packaged core passes 59 focused tests; 23 deliberate regressions fail value assertions.
Checkstyle, artifact comparisons and repository offline validation pass.

## Inventory discard admission

Keep ordinary source permission separate from discard permission.
Inventory slot throws and cursor drops require source admission and typed byte lock mode zero before prediction.
The shared helper rejects nonpositive action counts without changing the raw predicate's signed-count contract.
Expose incoming admission for creative callers and share the raw creative-mode permission helper with armor removal.

The original native source and discard predicates produce 56,760 decision pairs across 129 typed stacks and ten collection roles.
Every discard decision equals source admission combined with typed lock mode zero.
The control executes the original weak-view factory, backing constructor and policy installer.
A pinned foreign collection-root ABI supplies role, backing and start offset zero; complete root construction remains outside the control.
Native view destruction returns its foreign pins to baseline.
Original backing, input, registry, TLS, static and CRT cleanup leaves no allocations or held locks.

The four-project build passes 2,910 tests. All 105 patches replay.
The packaged core passes 67 repository tests plus a private comparison against 40 original actor mode observations.
Thirty-two deliberate regressions fail value assertions with verified implementation origins.
All 198 assets remain unchanged from the armor-placement milestone.

See [the discard reference](../../../docs/native-player-inventory.md#inventory-discard-and-creative-admission) for caller and lifetime boundaries.
Gameplay drops, specialized recipe Consume producers, complete controller input and live server acceptance remain separate.

## Live installed-screen controls

A private Java 26.3 client completes sixteen physical input controls through the preceding discard-milestone ViaProxy build and Bedrock 1.26.51.1.
Three E-key openings receive distinct native tokens and matching acknowledgments, followed by a confirmed final close.
The capture records thirteen requests with thirteen successful server responses.
Locked-item refusals preserve client and core state, while ordinary cursor drops and one-item head placement succeed.
The installed add-on, running proxy and all 1,521 embedded core classes match that recorded build.

Shift-click equips one pumpkin and sends the other two to inventory slot nine.
Native full-action destination ordering remains unverified; accepted server requests alone do not prove that contract.
The client still uses Java's player screens. The original rendering report remains unreproduced.
See [the live control boundaries](../../../docs/native-player-inventory.md#live-e-key-action-controls) for scope and failed fixture attempts.

## Native offhand admission and ordinary player routes

Use the selected definition's native offhand flag and measured builtin metadata instead of a shield-name shortcut.
Retain typed common properties, installed component values and wearable finalization across updates.
Validate empty-slot capacity before incoming placement.
Keep full armor and offhand destination ranges for ordinary player quick move.
Preserve merge-before-empty order within each logical collection, including combined-inventory fragments.

Four original protocol-2193 controls compare 64,872 full destination decisions and 64,872 installed callbacks across 4,086 inputs.
Each control completes original backing, input, registry, TLS, static and CRT cleanup without allocations or held locks.
Read-only two-hand storage supplies empty destinations.
No native permission, lookup or capacity result is supplied.
The lowercase control verifies conflicting components in every declaration order; earlier mixed-case rows establish raw-name admission only.

Native route construction supplies the provider list, while full model execution and transfer ordering remain unfinished.
The earlier live E-key run predates these changes.
See [the offhand reference](../../../docs/native-player-inventory.md#offhand-destination-permission-and-player-routing) for component rules and verification limits.

The complete four-project build passes 2,921 tests with 161 optional skips.
The packaged core passes 78 repository permission and action checks plus the private 40-mode comparison.
All 1,521 embedded core classes and 1,191 client classes match the tested artifacts.
Only the eight measured offhand flags change among 198 core assets; prior factory and Block auxiliary metadata remain unchanged.
All 105 patches replay, and Checkstyle and offline validation pass.
Forty-five deliberate regressions fail value assertions with verified implementation origins.

## Live offhand actions

The offhand build artifacts complete 24 physical Java inventory controls through ViaProxy and Bedrock 1.26.51.1.
All 21 accepted requests receive successful responses.
Arrows enter and merge in offhand, physical shift-click routes arrows there, and totems complete placement and removal.
Apple placement and typed slot-locked removal make no request; inventory-locked transfers remain permitted.
The installed add-on and all 1,521 embedded core classes match the built artifacts.
The driver completes normally, the final native close is acknowledged, and all processes started by the run retire.

This server-authoritative control retains Java's ordinary player screen at 854 by 480 and GUI scale two.
It does not verify the legacy adapter, complete native controller ordering, direct joins, delayed recovery or the affected WildFFA session.
See [the live offhand boundaries](../../../docs/native-player-inventory.md#live-offhand-action-controls).

## Destination collection priority

Run occupied merges and empty placement within each logical destination collection before visiting the next.
Later inventory merges cannot bypass earlier empty armor or offhand slots.
Keep split combined-inventory ranges together by container identity and full collection name, while retaining their traversal order.

The original model/planner control executes 24 quantity cases and complete native cleanup.
Six of nine all-count physical plans differ from the previous packaged implementation.
The coupled Java comparison checks those nine plans; three regressions cover equipment priority and combined-inventory grouping.
Read-only backend/root interfaces supply metadata and stored stacks; original policies and the actual class slot-check method execute.
Foreign pins return to baseline, and native model/view/backing/input/registry/TLS/static/CRT cleanup leaves no allocations or held locks.
Physical destinations are normalized across Java's combined inventory and native view offsets.
Native wire-role encoding, complete controller/root construction and physical native button binding remain separate boundaries.
See [the collection-order reference](../../../docs/native-player-inventory.md#player-destination-collection-ordering).

The collection-order build passes 2,925 tests with 161 optional skips, including the nine-case original-planner comparison.
The packaged core passes 82 repository checks plus the private 40-mode comparison.
All 47 deliberate regressions fail value assertions with verified origins.
All 1,522 embedded core classes and 1,191 client classes match the tested artifacts; all 198 assets remain unchanged from the offhand build.

A new physical Java/ViaProxy/Bedrock control creates existing inventory stacks and exercises both priority cases.
Shift-click places one pumpkin in armor before merging two into inventory, and routes six arrows to offhand before the later inventory merge.
All six fixture and shift-click requests receive successful responses.
Final client/core state, native close acknowledgment, installed artifacts and process cleanup pass verification.
These server-authoritative final states do not establish frame-by-frame native prediction, legacy authority or complete controller parity.
