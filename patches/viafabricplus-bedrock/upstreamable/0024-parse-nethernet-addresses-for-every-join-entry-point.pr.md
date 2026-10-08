## Shared NetherNet address parsing

Quick Play calls `ServerAddress.parseString` directly in Java 26.3.
It skips the multiplayer screen wrapper that previously attached the NetherNet socket address.
Supported URI schemes now enter through the shared parser.
The screen retains protocol-specific default ports for ordinary addresses.
The parser constructs its placeholder directly, without recursive parsing.

This fixes upstream connection code and remains separate from the offline LAN feature.
ViaBedrock continues to own HTTP signaling and protocol processing.

## Verification

The complete StackAnvil dependency build passes with 624 core tests and 600 add-on tests.
The suites report no failures or errors, with 19 and 116 tests skipped respectively.
TypeScript checks pass for the direct recording tooling.

The standalone upstream check needed one context adjustment for the upstream `bedrockLatest` field name.
StackAnvil setup renames that field to `BEDROCK_LATEST` for its pinned core dependency.
The resolved check removes the same redundant screen parser and applies the shared parser.
It does not change upstream dependency routing.

Prism appends a Java port to its `--server` value, including URI values.
The private recorder supplies URI joins through an instance component's exact Quick Play argument instead.
Raw traces, account files, package caches, and screenshots remain private.

The direct HTTP route completes initialization and spawn against strict BDS 1.26.51.1, protocol 2193.
The final recording has 676 chunks and 3,619 gameplay inputs.
Eight forward-input segments receive no prediction corrections during movement.
Two stationary corrections follow fixture teleports.
The optional asset attempt does not publish its current-format cache; fallback allows the join to continue.
This run verifies the connection entry point and basic movement, without establishing licensed asset or full movement parity.

## Independent PR validation, October 8, 2026

`./gradlew --no-daemon --console=plain clean check build` passes.
This standalone patch has no test sources.
A fresh Quick Play comparison with this upstream-only JAR remains pending.

Each PR starts from upstream [14f31f4](https://github.com/ViaVersionAddons/viafabricplus-bedrock/commit/14f31f44c0b018f3bf57c030c117abf1bfe9ff6e) and contains one independent change.
The build uses upstream ViaBedrock `0.0.31-SNAPSHOT`, resolved as `20261003.172326-5`.
No StackAnvil setup patch or local Maven repository enters the build.

The three networking patches touch separate files.
All six application orders pass and produce the same source tree.

Upstream draft: [viafabricplus-bedrock #15](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/15).
The fork branch is `codex/bedrock-nethernet-parsing`.
