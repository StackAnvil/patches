The three Bedrock actor flag words are unsigned bit masks. A signed low word with bit 63 set previously invented flags in the next word.

Mask each word to 64 bits before combining them. Retain sparse words independently, including metadata ID 139 for flags 128 through 130.

### Native evidence

The matching Bedrock 1.26.51.1 executable registers the same flag handler for metadata IDs 0, 92, and 139 in function `0x142a3f010`.
Its value reader `0x142a397a0` selects consecutive 64-bit words.
The initial merge kernel `0x142dea7a0` uses the same word order.
The final strict-BDS ViaProxy recording contains six ID 139 updates with LONG values of zero.

The third word exposes uniform air drag, nameplate depth, and inside-pickability flags to core state consumers.
Their physics, rendering, and interaction behavior remain separate requirements.

### Verification

Two semantic tests cover unsigned boundaries, third-word replacement, sparse updates, and clearing.
The full stack replays successfully.
The build passes 16 converter and 649 core test cases, with 19 skips and no failures or errors.
