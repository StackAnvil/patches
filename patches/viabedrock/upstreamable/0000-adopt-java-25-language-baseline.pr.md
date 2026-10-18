Adopt Java 25 before features that use sequenced collections and unnamed lambda parameters. Keep this upstream language decision separate from the float interpreter migration.

The cache remains the first upstreamable patch and builds on Java 17 without this prerequisite. Run the full core tests and Checkstyle after the baseline applies.

## Upstream prerequisites

Land the test/build foundation, then regenerate this language decision on upstream without StackAnvil setup context. See the [cache foundation](0001-cache-converted-resource-packs.pr.md).
