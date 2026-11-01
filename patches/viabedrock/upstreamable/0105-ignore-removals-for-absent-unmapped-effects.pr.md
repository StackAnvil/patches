# fix(effects): ignore removals for absent unmapped effects

Cancel removal of an unmapped effect after consuming the complete MobEffect payload.
Unsupported additions and updates still fail. Known effects keep their existing state and Java packet projection.

MegaSMP clears effect IDs through 38 during login.
Native Bedrock 1.26.60.5 registers experimental Freezing as ID 38, which has no translated Java effect mapping.
An isolated native control keeps Speed active after removing absent ID 38, removes Speed on its own request, and completes the recording.
The control uses an owned loopback server and explicitly injected effect packets. It does not represent unmodified public-server traffic.

Packet regressions cover retained known state, complete payload consumption, known removal, and rejected unsupported additions and updates.
Discarding other unmapped removals is an absent-state robustness policy. The native control establishes ID 38 only.
The implementation applies alone to pinned upstream. Its packet fixture requires the shared test dependencies and JVM test-suite configuration recorded in `series.json`.
The ordinary standalone build cannot compile that fixture until those prerequisites land.
The earlier failing recording replays all 39 removals without the unknown-effect error and preserves the complete scene payloads.
The [shared UI resource patch](0095-share-native-ui-programs-and-resources.pr.md) fixes the separate converted-pack size failure.
The earlier recording now passes pack admission but fails the rendering check on missing custom block mappings.
A current fresh run receives all 39 removals with complete payload framing, loads the pack, reaches a visible lobby, and remains grounded during walking.
Complete gameplay, custom block rendering, and native movement parity need further work.

The [owning patch](0105-ignore-removals-for-absent-unmapped-effects.patch) retains the implementation rationale and versioned evidence.
