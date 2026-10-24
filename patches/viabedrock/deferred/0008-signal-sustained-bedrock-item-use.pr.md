# Sustained item use and food admission

Java sends an air-use packet before its local food eligibility check.
Bedrock Dedicated Server accepts that transaction even at full hunger.
Holding ordinary food therefore consumes an extra item after the Java client stops its eating animation.

This patch checks advertised native food properties before sending the main-hand transaction or setting `StartUsingItem`.
It uses the current native hunger value and maximum.
Food with `can_always_eat` and creative use retain their existing admission.
Items without advertised food data retain their existing route.
Unsupported offhand use retains its container resynchronization.

## Target evidence

The target is Bedrock 1.26.51.1, protocol 2193, with Java 26.3.
Its recorded `ITEM_REGISTRY` supplies `minecraft:food.can_always_eat` for component and legacy items.
The inspected definitions include apple, rotten flesh, honey, chorus fruit, and both golden apple variants.
The implementation retains ordered component updates and resolves them through the current registry identity.
It does not infer native food behavior from a Java item or a fixed whitelist.

Microsoft documents the property in the [food component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_food?view=minecraft-bedrock-stable).
The target capture establishes that this property exists in the pinned version.
This admission change uses captured metadata and server behavior, without claiming an original-instruction oracle for the complete eligibility predicate.

The existing completion handling decodes the signed item ID and use method from `COMPLETED_USING_ITEM`.
It ignores replaced held items and methods outside the native range of zero through sixteen.
The owning patch records the original handler trace and packet controls.

## Regression controls

Model tests cover omitted and replaced component definitions, registry identity replacement, native hunger maxima, creative use, and always-edible food.
Actual packet mappings cover both raw hand paths.
A rejected main-hand request changes neither the canonical inventory nor the queued use flag.
Offhand requests retain the existing container resynchronization.
Existing completion controls still cover signed IDs, method boundaries, and replaced items.

A private BDS fixture starts with hunger four and sixteen apples.
The original candidate consumes five apples in both grounded and delayed-correction phases.
Each phase includes a server use start at hunger twenty.
The fixed candidate consumes four apples and stops at hunger twenty, leaving twelve apples.
Both ordinary-food phases record four starts, four completions, and no start at full hunger.

A separate full-hunger golden-apple phase starts with eight items and completes four uses.
All five starts occur at full hunger; releasing the key cancels the final incomplete use.
The server and client settle at hunger twenty with four golden apples.

The direct run executes five historical replays with fifty-four physical steps.
Three replays occur during active eating and preserve use timers of twelve, twenty-eight, and eighteen ticks.
Every replay boundary preserves tick count, hunger, held count, and active-use state.
The fixture samples a removed player after disconnect; those later errors are excluded from active-session evidence.
The read-only client observers report no errors.

The same three-phase fixture also passes through ViaProxy.
Its ordinary-food phases each stop after four completions, with no start at full hunger.
The full-hunger golden-apple phase completes four uses and cancels the fifth on release.
The proxy and client artifacts match their full-build checksums.

The proxy run executes six historical replays with fifty-five physical steps.
Three active-use replays preserve timers of twenty-three, seventeen, and ten ticks.
Every replay boundary preserves tick count, hunger, held count, and active-use state.
Its private inbound control delivers 101,773 events in order, with no pending events at shutdown.
Observed delays range from 300.003 to 304.419 milliseconds.
The first, shorter proxy capture stops during the final hold and remains excluded from these results.

The tested food candidate passes 2,520 tests across all four projects, with 215 optional skips and no failures or errors.
All 1,411 core classes match both packaged copies.
Offline tooling, static, and patch metadata checks pass.

The combined build also preserves the newer explicit-binding renderer update.
It passes 2,523 full-build tests, with 216 optional skips and no failures or errors.
All 1,411 core classes match both packaged copies.
A focused run passes 8 native binding, native slot, and Iris GPU controls without skips.
The core source tree and proxy artifact match the live-tested candidate.
All 119 compared movement/input entries and mixin configurations also match.
Only two indexed production client classes change, both in the renderer.
This comparison does not establish fresh whole-package runtime or visible rendering parity.

## Boundaries

These controls establish the observed ordinary-food overconsumption fix and the stated replay counter preservation.
They do not establish all native custom-food constructors, ability exceptions, use cycles, or trajectories.
Late completion for a new use of the same item still needs verification.
Prediction, rejection, and reconciliation across every negotiated inventory authority mode remain unfinished.
The full five-area production goal remains active.

This patch remains deferred behind [ViaBedrock #276](https://github.com/ViaVersionAddons/ViaBedrock/pull/276).
It does not belong in an independent upstream PR branch.
