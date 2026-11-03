Render controllers must retain repeated material patterns in their declared positions.
The existing map removes earlier expressions and keeps repeated keys at their first positions.
An immutable `MaterialAssignment` list preserves every expression and its override order.
Parsing stays separate from expression evaluation and final material selection.

This intentionally changes the public API: `materialAssignments()` replaces `materialsMap()`, and constructors accept assignment lists instead of maps.
Consumers must migrate to the list to evaluate every declared expression in order.
No map compatibility wrappers are included.

CubeConverter PRs [#3](https://github.com/oryxel1/CubeConverter/pull/3), [#4](https://github.com/oryxel1/CubeConverter/pull/4), and [#5](https://github.com/oryxel1/CubeConverter/pull/5) supply the earlier parser and geometry changes.
This PR contains only the remaining ordered-material behavior.

The [Molang reference](https://mojang.github.io/bedrock-samples/Molang.html) specifies ordered material expression evaluation.
The [animation reference](https://mojang.github.io/bedrock-samples/Animations.html) specifies later material overrides.
Target Bedrock 1.26.51.1 assets contain multiple material rules; authored repeated-pattern native execution remains unverified.

Local regressions cover wildcard, arm, repeated wildcard order, list immutability, and constructor defaults.
This CubeConverter PR includes the API migrations and regression tests, as explicitly requested.
StackAnvil setup remains excluded.

[Upstream PR #6](https://github.com/oryxel1/CubeConverter/pull/6) contains the production changes and all owning tests.
The standalone Java 21 build passes all 21 tests, including the repeated-pattern regression and API migrations.
