Player geometry can encode an unparented root bone as `parent: null`. The parser currently calls `JsonNull.getAsString()` and discards the whole model.
Treat the optional null value like an absent parent, while preserving named child relationships.

This PR targets `master` and includes the synthetic regression. StackAnvil setup remains excluded.

Validation on Java 17:

- The regression fails without the fix on both the standard Gson and ViaVersion Gson backends.
- `bun run pr check cubeconverter` and `bun run pr build cubeconverter` pass against merged `master`, with 23 tests passing per backend.
- `bun run build cubeconverter` passes through the full local stack, also with 23 tests per backend.

The fixture retains no player assets. The received player's final appearance has not been compared with an official client.

Created with GPT-6.1 Sol in T3 Code through the Codex harness.
