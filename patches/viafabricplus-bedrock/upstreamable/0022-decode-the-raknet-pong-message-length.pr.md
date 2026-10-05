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
