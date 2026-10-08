## Problem

The RakNet encapsulation codec writes an unsigned two-byte length before the status message.
The status protocol previously interpreted that length as UTF-8 text.
If either byte equals `0x3B`, it becomes a semicolon and shifts the MOTD and all subsequent fields.

The parser now reads the advertised length before decoding the message.
It retains empty trailing fields and rejects incomplete messages.

## Verification

Regression tests decode complete pong packets with lengths `0x013B` and `0x3B01`.
They check the MOTD, player counts, and complete consumption of the payload.
A separate test rejects a truncated message.
The reported server and mod build are unknown, so the original server remains unverified.

The complete add-on build passes with 462 passing tests and 113 optional skips.
This build verifies the pinned ViaFabricPlus artifacts and builds CubeConverter and ViaBedrock in dependency order.
Both pong decoder regressions pass.

## Independent PR validation, October 8, 2026

`./gradlew --no-daemon --console=plain clean check build` passes.
Both packet regression tests pass, with no failures or skips.
The tests cover delimiter bytes in the length prefix, complete payload consumption, and truncated packets.

Each PR starts from upstream [14f31f4](https://github.com/ViaVersionAddons/viafabricplus-bedrock/commit/14f31f44c0b018f3bf57c030c117abf1bfe9ff6e) and contains one independent change.
The build uses upstream ViaBedrock `0.0.31-SNAPSHOT`, resolved as `20261003.172326-5`.
No StackAnvil setup patch or local Maven repository enters the build.

The three networking patches touch separate files.
All six application orders pass and produce the same source tree.

Upstream draft: [viafabricplus-bedrock #13](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/13).
The fork branch is `codex/bedrock-raknet-status`.
The standalone branch includes the JUnit harness against the upstream build file.
The saved full-stack patch adds the same configuration to the existing test task.
