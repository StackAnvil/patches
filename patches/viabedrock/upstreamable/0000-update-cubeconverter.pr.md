Update CubeConverter from `7cf736c4a5` to `8a7b73a8ed`.
The new commit includes optional geometry declarations, actor rendering controls, authored face UV rotations, and ordered material assignments.
The dependency remains non-transitive.

CubeConverter [PR #6](https://github.com/oryxel1/CubeConverter/pull/6) replaces the material map with an ordered assignment list.
Current upstream ViaBedrock does not call `materialsMap()` or construct `BedrockRenderController` records, so it needs no call-site migration.
The other upstream targets also contain no usages of those removed APIs.
StackAnvil's actor consumers already use `materialAssignments()` and assignment-list constructors.

Validation: `bun run pr build viabedrock --patch 0000-update-cubeconverter.patch` passes against the new upstream artifact.
The filtered checkout contains one commit and changes only the dependency pin.
StackAnvil setup and local regression tests are excluded.
