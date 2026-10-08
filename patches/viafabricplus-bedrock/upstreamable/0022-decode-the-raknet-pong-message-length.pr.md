## Problem

The RakNet encapsulation codec writes an unsigned two-byte length before the status message.
The status protocol previously interpreted that length as UTF-8 text.
If either byte equals `0x3B`, it becomes a semicolon and shifts the MOTD and subsequent fields.

The existing packet handler now reads exactly the advertised message length.
It retains empty trailing fields and rejects truncated messages through the fixed-length byte reader.

## Verification, October 8, 2026

`./gradlew --no-daemon --console=plain clean check build` passes on the independent upstream branch.
Four local packet checks pass against the production handler.
They cover lengths `0x013B` and `0x3B01`, the MOTD, player counts, version fields, an empty subtitle, the payload boundary, and truncation.
The checks use a private Gradle init script outside the PR source tree.

`bun run stack sync viafabricplus-bedrock` replays the full stack without conflicts.
`bun run build viafabricplus-bedrock` passes with the pinned ViaFabricPlus artifacts and the StackAnvil dependencies.
The rendering patch owns the existing JUnit configuration for the full stack.
The status patch contains only the fix in the existing handler.

The reported server and mod build are unknown, so the original server remains unverified.

## Independent PR

Upstream draft: [viafabricplus-bedrock #13](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/13).
The fork branch is `codex/bedrock-raknet-status`.
It starts from upstream [14f31f4](https://github.com/ViaVersionAddons/viafabricplus-bedrock/commit/14f31f44c0b018f3bf57c030c117abf1bfe9ff6e).
The build uses public ViaBedrock `0.0.31-SNAPSHOT` without StackAnvil setup patches or a local Maven repository.

The three networking PRs touch separate files.
All six application orders pass and produce the same source tree.

## Review changes

The upstream review requested fewer classes and the established Gradle conventions.
The revision removes the helper class, the test class, and all Gradle changes from the upstream PR.
The local packet checks retain validation without additional upstream test infrastructure.
