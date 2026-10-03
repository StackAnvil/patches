# Translate jigsaw settings and edit requests

## Behavior

Core preserves `selection_priority` and `placement_priority` in translated Java block-entity data.
It translates Java 26.3's `SET_JIGSAW_BLOCK` into Bedrock's complete `BlockActorData` compound.
The update includes names, target pool, replacement state, joint, and both signed priorities.

The handler requires a cached jigsaw block and its matching block entity.
It rejects an unknown joint value.
It copies the server snapshot, preserves unknown fields, and leaves authoritative cached state unchanged while the request is pending.
The server decides whether to accept the edit.
This uses standard Java packets and requires no new add-on integration.

## Target evidence

The comparison uses Bedrock 1.26.51.1, build 51061372, protocol 2193, and Java 26.3.
The native local-world editor exposes both priorities and aligned or rollable joints.
Reopening retains selection priority `-7` and placement priority `13`.
Its saved block entity stores both priorities as signed NBT integers.

A request to the matching dedicated server persists custom names, a replacement state, a rollable joint, and priorities `-17` and `29`.
This establishes the accepted request encoding; it is not a capture of the native client's outbound packet.
The matching server's generated metadata schema and saved NBT establish target types.

## Verification

The standard Java screen shows the server's names, replacement state, and priorities on a direct connection.
Submitting priorities `-19` and `31` persists them across a reconnect through ViaProxy.
Submitting `-23` and `37` through ViaProxy persists both values in the dedicated server's saved block entity.
Normal right-click interaction also opens the standard Java editor on direct and ViaProxy connections after the server grants operator permission. These comparisons use the add-on client.

A numerical round-trip test covers coordinates, signed priority limits, retained unknown fields, and unchanged authoritative state.
The complete stack builds.
Core reports 445 tests with one optional skip; the add-on reports 530 tests with 109 optional skips.
The converter reports 16 tests without skips.
All suites have zero failures and errors, and core main and test Checkstyle pass.

## Remaining coverage

Native container lifecycle remains incomplete: Bedrock sends `JIGSAW_EDITOR`, which still reaches the unsupported-container path. Rejection flows and ordinary clients without the add-on remain unverified.
The Java screen also exposes generation controls absent from the inspected native in-game screen.
The documented [jigsaw structure data](https://mojang.github.io/bedrock-protocol-docs/1.26.50/packets/jigsaw-structure-data-packet/) carries rules for client world generation.
Handling that data, world-generation rules, and generation requests remains incomplete.
These results establish settings and edit requests on the tested Linux routes, not full editor parity.

The patch applies to the pinned upstream base without setup, and standalone production compilation passes.
The full stack supplies test dependencies absent from the standalone upstream test classpath.
