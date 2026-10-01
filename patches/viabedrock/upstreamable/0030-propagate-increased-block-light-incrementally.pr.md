Preserve light snapshots after block updates and propagate emission increases into a clean cached region. Emission decreases, opacity changes, and incomplete regions trigger full recomputation.

The opacity table also distinguishes single and double slabs. Java stores both under one identifier, which previously gave every slab opacity zero. Half slabs now filter one level, and double slabs block light.

An isolated official Bedrock Dedicated Server 1.26.51.1 probe measured sealed skylight shafts and block-light tunnels without client joins. The server reports build 51061372 and protocol 2193. Its Script API measurements show:

- Upper and lower oak and smooth-stone slabs read skylight 14, followed by 13 below them.
- Double slabs block both sky and block light.
- Upper and lower stairs transmit full skylight 15.
- Single slabs, leaves, and water pass block light 14, followed by 13.

Numerical propagation tests reproduce those measurements. The target results do not support importing Java directional face occlusion.

All 315 saved Hive columns contain 17,078 half slabs and 11,795 double slabs. A counterfactual spawn region changes 85 sky-light cells and 46 block-light cells in its center chunk. It resolves every captured vanilla state. One double slab changes sky light from 10 to 0 and block light from 14 to 0. The player cell remains sky 15 and block 4. Raw server outputs and captured world data remain private.

Validation: 274 core tests pass with no failures, errors, or skips. Both main and test Checkstyle tasks pass. Differential tests retain coverage of incremental propagation across chunk and section boundaries.
