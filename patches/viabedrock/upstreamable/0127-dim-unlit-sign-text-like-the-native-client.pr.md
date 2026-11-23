Bedrock draws colored text on an unlit sign at half the strength of the same text on a glowing sign. ViaBedrock kept the full colors, so dyed and formatted text on ordinary signs looked twice as bright as on Bedrock.

Native evidence from the 1.26.60.5 Windows client, static analysis only:

- The sign renderer (`0x146a7f670`) treats a row as colored when the face color is not opaque black or the row holds a formatting code. When `IgnoreLighting` is off, a colored row gets the tint `(0.5, 0.5, 0.5, 1)` (`0x14f0feab0`) multiplied by the light color at the sign (`0x146bf7610`).
- `UIText.material.bin` from the same build declares `TintColor` at constant buffer offset `0x10`. Its fragment shader multiplies the glyph sample and the vertex color by `TintColor`.

This halves every text color on faces that do not ignore lighting. Java's text shader already multiplies by the light map, so the result is color x 0.5 x light, as on Bedrock. Glowing faces keep the full colors.

Validation: a unit test converts an unlit undyed sign with `§c` and `§r` and an unlit blue sign, and checks the halved Java colors. Faces that ignore lighting keep the colors in the existing tests. No in-game capture was taken.

Remaining limits: the renderer also checks two global render flags (`0x1528da498`, `0x1528da486`) before it applies the tint, and in one graphics mode it uses white instead of the light color. Static analysis did not resolve either case.
