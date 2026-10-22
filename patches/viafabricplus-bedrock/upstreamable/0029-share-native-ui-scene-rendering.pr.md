Shared native scene, layout, image, text, HUD and GUI actor rendering precedes the form and inventory adapters.

## Actor-backed UI portraits

The shared renderer accepts the pinned `live_horse_renderer` for verified real player actors.
The negotiated actor-state v3 channel maps the authored signed native UID to the actual Java UUID.
The legacy v2 channel remains byte-compatible and has no inferred UID.
Missing or removed actors produce no portrait. Unverified actor classes retain ordinary controls.

Original target CPU controls establish string UID parsing, missing ID `-1`, player-family admission, mouse input mode and camera rotation.
The camera uses the authored box center and width through the normal Java entity GUI pipeline.
A scoped transform separates depth from Java's uniform GUI scale.
Portrait controllers, equipment and emotes retain separate playback, variables and caches.
Scene changes, actor replacement and screen closure retire those retained resources.
World animation clocks and effect dispatch remain unchanged.
Active GUI particle or sound cues retain ordinary controls until their submission is implemented.
Unsupported portrait opacity also retains ordinary controls.

Grid capacities use integer count bounds independently of pixel geometry bounds.
The accepted Social definitions contain a million-cell capacity with only a bounded number of actual children.
Sparse measurement visits those children without allocating or iterating the declared capacity.
Malformed, fractional and overflowing capacities remain rejected.
The prior fixed-grid position formula remained a native comparison boundary.

The focused suite passes 42 cases: 39 passed and three optional fixtures skipped.
It covers independent playback, failure-safe scope restoration, transform preservation, resource retirement, signed UID parsing and bounded grid measurement.
The actual accepted ordinary chest scene passes 63 slot addresses and 65 image regions.
That prior supplied profile-title scene passes parsing and layout, then correctly rejects an unresolved close-button mapping.
Its authored portrait UID is 150150. These supplied title and empty-menu inputs do not establish actual Social metadata delivery or actor presence.
Native projection, pixels, transformed startup, resource reloads and Iris compatibility remain required client gates.
The clean combined build passes 706 cases: 588 passed and 118 optional fixtures skipped.
The normal 31-patch replay, Gradle check, build, POM and access-widener gates pass.
All 1,304 embedded core entries match the private actor-UID candidate.
The 38 installed artifacts and all 58 frozen v10 files remain unchanged.
The private portrait candidate is not installed; actual client and Iris gates remain pending.

### Manual grid sizing and positions

Grids without an item template use each child's authored `grid_position`, with `[0,0]` when absent.
Their children measure percentages, anchors and offsets against the full parent extent.
The cell stride changes placement without dividing the child's measurement context.
Template grids retain their existing collection placement and sizing.
Only actual bounded children are measured; million-cell capacities allocate no additional nodes.

Original native property readers, GridItem writer and fresh dependency scheduler bind these rules.
The target layout suite passes 32 cases, including positions, constraints, hidden controls, templates and absent positions.
Zero or missing manual capacities retain ordinary fallback because their native secondary inactivity lifecycle remains unbound.
Malformed and overflowing positions also retain fallback; native machine overflow is not presented as a Java exception rule.

The accepted profile diagnostic selects 19 distinct addresses with full-parent geometry.
Its supplied hover strings remain separate from production values and captured Social data.
Production hover text, the native one-item autoplacement action and intentional subset admission remain open.
The strict action and full-slot completeness guards are unchanged.
Native portrait pixels, current client acceptance, resource reloads and Iris compatibility remain required client gates.

The final paired clean build passes 726 cases: 608 passed and 118 optional fixtures skipped.
Normal replay retains all 31 patches; Gradle check, build, POM and access-widener validation pass.
All 1,311 approved core entries match the private manual-grid core candidate.
The 38 installed artifacts, 58 frozen v10 files and 45 prior actor-candidate files remain unchanged.
These private candidates do not establish current client or Iris acceptance.


## Loose maximum constraints in shared menu templates

CubeCraft's accepted UI pack uses `max_size: [100000, 100000]` on shared button labels.
These values remove a practical upper constraint; they do not request a control of that size.
Cap finite maximum constraints at the existing layout limit.
Continue to reject oversized actual sizes, oversized offsets, and non-finite dimensions.

A targeted test covers numeric, pixel, and percentage maximum constraints without changing the resulting geometry.
A private client projection of the exported Skyblock homepage passes at 640 by 360 and 427 by 240 logical pixels.
Both projections retain 171 visible draws and authored coverage for the expected slot actions.
A separate CubeCraft long-form click probe sends the correct original button index.
These CPU checks do not establish live Pillars of Fortune acceptance, GPU pixels, or shader compatibility.

The repeated-control test also clicks the retained middle widget and checks its original response index.
A later click on the same closing screen produces no second response.
The full add-on build passes 751 tests: 632 passed and 119 optional skips, with no failures or errors.
The final JAR's UI and actor bundles pass checksum and entry verification against the approved local assets.


## HUD title rendering

The shared UI renderer now displays core-resolved HUD title factories with authored images, captions, size and anchors. Alpha animations follow fade, wait and fade-out chains. Subtitle updates retain the original title clock. Late updates cannot revive an expired title, and disconnects invalidate queued work and release resources. Ordinary titles remain available for scenes the core cannot resolve.

Targeted tests sample the alpha chain before, during and after each phase, including replacement scene nodes on the same clock. The complete addon suite passes 799 tests: 679 passed and 120 skipped. All four full-stack builds and bundle checks pass.


## Persistent HUD image metadata

The persistent HUD previously rejected later icons after its metadata cache reached 256 entries.
Both success and failure metadata now evict the least recently used entry instead of retiring a valid title.
The resource manager retains ownership of pack textures.
Tests cover more than 256 icons, frequent cache hits, evicted entries and changed resource sources.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md): Publish shared UI scene and program contracts before the client renderer.

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
