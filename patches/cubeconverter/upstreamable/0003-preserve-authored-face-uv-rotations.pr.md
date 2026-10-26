Preserve per-face `uv_rotation` when parsing Bedrock geometry.
Keep each angle through cloning, UV normalization and Java item export.
When fitting requires another cube rotation, add it to the authored angle.

Bedrock added entity face rotation in geometry format 1.21.0.
The [1.26.40 geometry reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/visualreference/geometry.v1.26.40?view=minecraft-bedrock-stable)
specifies clockwise rotations of 0, 90, 180 and 270 degrees.
Both versions precede the target Bedrock 1.26.51.1, protocol 2193.
This patch preserves valid authored values without adding geometry version dispatch.

The regression parses all six faces at all four angles.
It checks signed UV rectangles, absent faces, independent clones, added rotations, normalization and exported item faces.
The original implementation fails the regression.
The complete converter test suite passes with the change.
These checks establish parsed and exported coordinates, not native image parity.
