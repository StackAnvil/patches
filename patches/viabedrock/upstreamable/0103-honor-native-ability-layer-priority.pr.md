# Native ability layer ownership

A higher ability layer must override a lower layer even when its value is false or zero.
The previous model reads CustomCache and Base first, which can override Spectator, Commands, Editor or LoadingScreen.
Resolve each ability through the highest numbered layer that declares it.
Use the same ownership lookup for boolean and float values.

Serialized entries also address native layer ownership.
Layer IDs above five normalize to Base, independently of packet order.
A later entry for the same normalized layer replaces that layer, including clearing fields omitted by the later entry.
The previous codec redirects unknown IDs to CustomCache and keeps the first duplicate.

Local flight prediction writes Base, while game-mode fallback values stay in CustomCache.
The native setters at `0x14d38ada0` and `0x14d38ae20` write Base Flying at component offsets `0x174` and `0x178`.
This setter evidence comes from static decompilation, without complete setter execution.
With the corrected getter, the old CustomCache write loses a quick stop before server acknowledgment.
A regression invokes the registered Java abilities handler twice and checks both requests and Base state.
An explicit layer accessor replaces the cache-only accessor for both producers.

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
The original serialized application at `0x140c4d650` maps layer IDs directly to six slots and normalizes unknown IDs to one.
It resets all six layers through `0x1401d7c50` and applies each entry through `0x1401d1010` and `0x140cd0cc0`.
The native default-type constructor is `0x1401cfde0`.
The ability-name table at `0x1517ea2b0` identifies Instabuild as index 11 and walk speed as index 14.

The model predicate at `0x1434358a0` checks Instabuild through the actual sparse actor-component getter at `0x1401d1930`.
It scans layer five through layer zero.
The original walk-speed selection at `0x144762726` through `0x1447627a1` uses the same order.
Instabuild is a separate input from effective creative game mode. The player recipe evaluator must preserve that distinction.

Private original-executable controls provide 729 complete Instabuild queries, 1,305 walk-speed slices and 112 complete serialized applications.
The Java comparison sends the same data through the production abilities codec before reading the model.
It checks selected values, each packet layer's field ownership, duplicate replacement and invalid-layer normalization.
Float controls include zero, signed zero, infinities, NaN payloads and subnormal values.
Six targeted tests pass with Checkstyle, including the real Java abilities packet producer.

The serialized application control supplies packet fields and present actor sparse backing.
Its actor-change notification is an observed void boundary. The original reset, permission defaults, readers and predicates execute.
The walk-speed slice stops before movement arithmetic uses the selected value.
These controls do not prove complete permission-default delivery, real game-mode updates, physical flight or Actor/Level lifetime.
The authored E-key player screen and its full recipe evaluator remain unfinished.

The full stack replays 106 patches and passes 2,933 tests with 161 optional skips and no failures or errors.
Checkstyle and repository offline validation pass.
The packaged core passes six ability checks, all 34 frame cases, five retained layout checks and 83 permission/action checks.
All six new checks fail by assertion against the preceding packaged core.
Six deliberate priority, per-field ownership, truthy-value, unknown-layer, duplicate-layer and flight-producer changes also fail value assertions.
Implementation origins are verified for packaged and mutated comparisons.

The frame patch corrects three flying fixtures to declare flying in Base.
Their position, velocity and frame expectations remain unchanged.
All 1,522 core classes match both embedded copies; all 1,191 client classes match the tested add-on.
All 198 assets remain unchanged from the default-layout build.
All 1,503 other core classes remain byte-identical to the default-layout build.
The 19 changed classes comprise four implementations, twelve compiler-owned nested classes and three build-identity classes.
All twelve nested classes retain identical declarations and instruction disassembly.
No new live flight or authored inventory capture ran for this change.
See the [player availability input reference](../../../docs/native-player-inventory.md#ability-input-to-recipe-availability) for integration limits.
