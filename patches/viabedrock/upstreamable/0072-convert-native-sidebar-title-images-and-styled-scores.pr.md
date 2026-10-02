CubeCraft updates an existing sidebar objective from a text title to a pack image. The previous translation discarded that title update.

Preserve objective and score identities, emit title changes, hide sidebar numbers with Java BlankFormat, and send styled row components. Apply finite static `$0_color_format` through `$f_color_format` overrides from effective server UI globals. CubeCraft supplies §9 as RGB 58,169,255. Convert float colors to the nearest representable Java RGB; native reverse lookup does not establish framebuffer rounding.

Convert bounded active scoreboard UI image definitions into dedicated fonts, original textures, and metadata for the add-on. The recorded protocol 2193 CubeCraft pack declares a 66×21 title image and 10-pixel rows. Unsupported dynamic UI definitions retain text fallback. Bump the converted-pack cache version so old receipts cannot omit these assets.

Native Bedrock 1.26.51.1 UI reader 1403f9760 reads the formatting variables into the shared palette. Font parser 144444200 consumes that palette when formatting is enabled. World nametag draw flags remain unverified, so this change applies server overrides to sidebar text only.

Validation covers actual objective and score packets, title replacement, number format, score ordering, palette priority, bounded UI parsing, metadata emission, and disk cache rollover. Captured server resources and native binaries remain private.
