Treat an explicit null optional bone parent as an unparented root. Lifeboat player geometries received on protocol 2225 otherwise throw from `JsonNull.getAsString()` and lose the complete model. Named child relationships retain their existing behavior.

The synthetic regression covers absent and null root parents alongside a named child. It passes on Java 17. The full feature, including that regression, applies to the pinned upstream base with `pr check`. The received player's final appearance has not been compared with an official client.
