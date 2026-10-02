CubeCraft updates an existing sidebar objective from a text title to a pack image. The previous translation discarded that title update.

Preserve objective and score identities, emit title changes, hide sidebar numbers with Java BlankFormat, and send styled row components. Apply finite static ordinary and named material color overrides from effective server UI globals. CubeCraft supplies §9 as RGB 58,169,255. Convert float colors to the nearest representable Java RGB; native reverse lookup does not establish framebuffer rounding.

Convert bounded active scoreboard UI image definitions into dedicated fonts, original textures, and metadata for the add-on. The recorded protocol 2193 CubeCraft pack declares a 66×21 title image and 10-pixel rows. Unsupported dynamic UI definitions retain text fallback. Bump the converted-pack cache version so old receipts cannot omit these assets.

Native Bedrock 1.26.51.1 UI reader 1403f9760 reads ordinary and 13 named formatting variables into the shared palette. Font parser 144444200 consumes that palette when formatting is enabled. The same per-connection palette now formats actor NAME components and player team prefixes. The saved Hive pack maps `$material_gold_color` to `[.541,.824,.173]`; native Scallywag uses that green rather than the default gold. This pack declaration, the target palette writer, and the native replay establish the name-color behavior.

Validation covers actual objective and score packets, title replacement, number format, score ordering, palette priority, bounded UI parsing, metadata emission, and disk cache rollover. Captured server resources and native binaries remain private.

The bounded static panel also carries its original background texture, alpha, nine-slice borders, padding, and bottom-left row offsets. The saved CubeCraft pack declares a 6×6 background, two-pixel borders, alpha 0.5, padding 3×5, and offset (+2,-1). Unsupported layout expressions retain text fallback. Conversion and eight add-on HUD tests pass, including preserved corners and same-pack background validation.

Keep global palette parsing in `TextFormattingDefinitions`, separate from scoreboard layout. Each connection holds an immutable result with the effective pack priority. This includes minecoin, material colors, resin, and party blue. The native reader binds `$party_blue_color` to §w at table address 1517f8420. The dependency lacks that code, so the target default is handled by the extended formatting patch.

Preserve active bold and italic styles across palette color codes, including codes the dependency does not know. Entity metadata tests exercise player and custom actor names, sparse updates, blank names, independent connection palettes, and immutable emitted components. Pack storage finishes before supported entity creation; the protocol rejects replacement pack information within an existing connection.

The converted-pack identity advances to version 9 after correcting equipped attachable selectors. This prevents earlier cached exports with doubled variant names from reaching the item selector or worn renderer. Cache regressions and the full 334-test core suite pass.
