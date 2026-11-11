ViaBedrock currently pins a commit from CubeConverter's separate `vv-json` branch. Switch to the tagged ViaVersion Gson module built from shared sources on `master`.

Use `com.github.oryxel1.CubeConverter:vv-json:1.3.1` instead of `com.github.oryxel1:CubeConverter:8a7b73a8ed`.
The named module preserves the ViaVersion Gson API and avoids the repository aggregate, which can include both Gson variants.
Keep `transitive = false` so ViaBedrock retains its dependency choices. No Java source changes are required.

[CubeConverter 1.3.1](https://github.com/oryxel1/CubeConverter/tree/1.3.1) includes the merged null-parent fix from [CubeConverter PR #8](https://github.com/oryxel1/CubeConverter/pull/8), alongside the geometry and rendering fixes already used by ViaBedrock.
Geometry with `parent: null` now retains its root and named child hierarchy instead of failing in `JsonNull.getAsString()`.

Validation:

- CubeConverter's tagged commit passes 23 tests per Gson backend on Java 17.
- [JitPack successfully builds and publishes the tagged modules](https://jitpack.io/com/github/oryxel1/CubeConverter/1.3.1/build.log).
- Separate consumers compile and run against both public JitPack artifacts. Both preserve absent and null root parents and named child relationships through their public Gson APIs.
- The standalone PR applies to current ViaBedrock `main` without StackAnvil setup. `./gradlew clean build` passes on Java 25, including Checkstyle and tool compilation, against the public tagged JitPack artifact.
- The full local stack compiles main, tool, and test sources and passes 20 focused model-resource, entity-binding, plane-geometry, and skin-provider tests.
- The local published POM selects the matching StackAnvil ViaVersion module. StackAnvil setup and local tests are excluded from this PR.

Created with GPT-6.1 Sol in T3 Code through the Codex harness.
