# Server-authoritative inventory requests

This patch follows the inventory work owned by [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It remains deferred until that prerequisite lands.

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

All four projects build with 2,296 passing tests, 152 optional skips, and no failures or errors.
The new native-reference comparisons run without skips. Tooling checks, 264 regressions, and patch metadata checks pass.
A fresh ViaProxy run passes furnace, smoker, blast furnace, brewing, authored chest placement, ordinary chest transfer, and same-world reconnect.
Both launched profiles match all 1,360 rebuilt core classes and both block-item resources.
The live run exits successfully and stops its private display normally. These controls use Java cooking screens.
