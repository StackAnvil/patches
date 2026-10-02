Java clients behind ViaProxy cannot inspect a local Bedrock connection to select native lighting. Converted server packs now carry a small rendering marker with schema and network protocol versions. Client integrations can use it after pack acceptance and clear it on reload or disconnect. The marker carries no player data.

The conversion cache version changes so older cached packs cannot omit the marker. This patch establishes the resource contract; it does not forward native actor or player appearance state. Offline ViaProxy replay checks the client integration separately.
