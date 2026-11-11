CubeConverter keeps separate standard-Gson and ViaVersion-Gson branches. This change builds both artifacts from one source tree on `master`.
It also brings the geometry and controller fixes from `vv-json` PRs #2 through #6 into that shared source.

The `vv-json` Gradle module generates its main sources and tests by replacing the Gson package name.
Each backend compiles and runs the same tests against its actual Gson dependency.
Each publication has its own POM and source JAR. Neither JAR bundles Gson, ViaVersion, JOML, or Lombok.
The existing material-map constructor and accessor remain available as deprecated compatibility APIs.

Consumers select `com.github.oryxel1.CubeConverter:cubeconverter:<version>` or `com.github.oryxel1.CubeConverter:vv-json:<version>`.
The repository-wide JitPack dependency can include both modules, so the README directs consumers to select one named artifact.
Existing pinned `vv-json` commits remain usable. ViaBedrock can switch to the named module after this reaches upstream.

Validation:

- Java 17: `./gradlew clean build publishToMavenLocal` passes with 22 tests per backend.
- Separate Gradle consumer projects compile and run a geometry parse and export through each published Gson API.
- JitPack builds both modules from [the fork commit](https://github.com/StackAnvil/CubeConverter/commit/7f2e4e1624ad1eff04762b87ce01989be4aa9ac8). Separate consumers also compile and run against both downloaded JitPack modules at `7f2e4e1624`. [JitPack build log](https://jitpack.io/com/github/StackAnvil/CubeConverter/7f2e4e1624/build.log)
- Generated POMs expose the correct Gson backend and JOML. Generated ViaVersion sources use the ViaVersion Gson namespace.
- `bun run pr check cubeconverter` and `bun run pr build cubeconverter` pass against pinned `master`, without StackAnvil setup.
- The full local CubeConverter stack passes 23 tests per backend, including the separate null-parent patch.
- The full local ViaBedrock stack compiles against the selected StackAnvil `vv-json` artifact.
- StackAnvil tooling checks and the focused artifact, PR-content, description, health, and prerequisite tests pass.

The null-parent patch remains separate and depends on this shared-source build before submission to `master`.
This PR excludes StackAnvil identity and dependency-routing setup.

Created with GPT-6.1 Sol in T3 Code through the Codex harness.
