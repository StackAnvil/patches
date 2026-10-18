## Review focus

Replace the unsigned decoder with the existing signed VarLong decoder.
The change affects only the player-list actor ID field.
For example, actor ID 1 previously decoded as 2, so later actor lookups could fail or select another actor.

The protocol 2193 schemas define a compressed signed 64-bit actor ID:

- [PlayerListAddEntry](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/PlayerListAddEntry.json)
- [ActorUniqueID](https://github.com/Mojang/bedrock-protocol-docs/blob/v1.26.51/json/ActorUniqueID.json)

## Validation

`bun run pr build viabedrock --patch 0060-decode-signed-player-list-actor-ids.patch` passes, including compilation and Checkstyle.
The patch applies alone to the pinned upstream base and changes one production line.
The existing skin-relay observation is recorded in the commit body; this preparation did not repeat a live server capture.
