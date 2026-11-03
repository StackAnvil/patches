Update the CubeConverter dependency from `7cf736c4a5` to `ee11a32b2e`.
The upstream commits preserve optional geometry declarations, actor rendering controls, and authored face UV rotations.
The dependency remains non-transitive. This PR changes only the upstream dependency pin.

The relevant CubeConverter PRs are [#4](https://github.com/oryxel1/CubeConverter/pull/4), [#3](https://github.com/oryxel1/CubeConverter/pull/3), and [#5](https://github.com/oryxel1/CubeConverter/pull/5).
StackAnvil branding, local dependency routing, and unmerged material-list APIs are excluded.

Validation: `bun run pr build viabedrock --patch 0000-update-cubeconverter.patch` passes against the new upstream artifact.
The filtered checkout contains one commit and changes only the dependency pin.
No StackAnvil setup or local tests are included.
