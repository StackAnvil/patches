## Purpose

Handle server item cooldown updates in ViaBedrock. Ordinary Java clients receive the same categories through ViaProxy and direct connections.

Custom categories can contain uppercase letters, spaces, punctuation, and Unicode. Encode their UTF-8 bytes in a Java resource identifier. Use this conversion for both the item component and the incoming packet. Preserve shared groups without merging distinct names.

## Versioned evidence

Target: Bedrock 1.26.51, protocol 2193, Java 26.3.

- [Mojang protocol 1.26.51 release](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51): PlayerStartItemCooldown contains a string category followed by a signed compressed tick count.
- An isolated Bedrock Dedicated Server 1.26.51.1, build 51061372, supplied its item registry. The custom component contains `category`, floating-point `duration` in seconds, and `type`. Legacy chorus fruit food metadata uses `cooldown_type: chorusfruit` and `cooldown_time: 20` in ticks.
- A Script API probe on that server reported ender pearl: 20 ticks; goat horn: 140 ticks; shield: 100 ticks. Their registry entries omit cooldown metadata, so these three items need defaults. Registry metadata supplies wind charge, spear categories, and legacy food durations.
- Calling `startItemCooldown` produced a shared custom category with 55 ticks, `minecraft:ender_pearl` with 20 ticks, `minecraft:chorusfruit` with 10 ticks, and the same custom category with zero ticks. Default namespaces are added without changing custom case or punctuation.
- Java 26.3 `ClientboundCooldownPacket.STREAM_CODEC` writes an identifier and VAR_INT duration. `ItemCooldowns.getCooldownGroup` reads `USE_COOLDOWN.cooldownGroup`, then falls back to the Java item ID. The translated item component therefore needs the same group as the packet.
- [Microsoft cooldown component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_cooldown?view=minecraft-bedrock-stable) describes shared categories and duration in seconds.

## Verification

Seven focused test cases passed. They cover registered packet translation, signed tick decoding, reset duration, shared Unicode groups, registry overrides, legacy food tick conversion, category collisions, and Java component wire round trips.

The complete 80-patch stack replayed successfully. `bun run build viabedrock` passed all 348 tests and Checkstyle.

## Remaining comparison

Native inventory overlay and use prediction still need a visual comparison. The attack cooldown component also needs separate native attack prediction work; this change translates its server group updates but does not claim attack parity. The original private server registry and probe logs remain outside the repository.
