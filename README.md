# StackAnvil patches

**Website:** [stackanvil.pistonmaster.net](https://stackanvil.pistonmaster.net) · [Player guide](https://stackanvil.pistonmaster.net/getting-started/) · [Build from source](https://stackanvil.pistonmaster.net/build-from-source/) · [Downloads](https://stackanvil.pistonmaster.net/releases/)

StackAnvil is a place to test changes across ViaBedrock, viafabricplus-bedrock, CubeConverter, and ViaProxy. It uses a pinned upstream ViaFabricPlus build. Each upstream-sized feature lives in one patch. Contributors can try the full build while upstream reviews one feature at a time.

We welcome bug reports, test results, and patches. You do not need to work on all four patch targets. Start with the project you know.

## Play from Java Edition

**Bedrock add-on downloads:** [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus).

Use the [player guide](https://stackanvil.pistonmaster.net/getting-started/) to run the StackAnvil ViaProxy JAR beside a regular Java client, or install the matching ViaFabricPlus and Bedrock add-on JARs in a Fabric client. The [latest release](https://github.com/StackAnvil/patches/releases/latest) has all three JARs. An optional Prism Launcher ZIP provides a prepared Fabric client.

## Use the libraries in a project

Add the [StackAnvil Maven repository](https://stackanvil-maven.pistonmaster.net/) to your existing Gradle build. Use a StackAnvil release version without the `stack-v` tag prefix:

```kotlin
repositories {
    maven("https://stackanvil-maven.pistonmaster.net/")
}

dependencies {
    implementation("io.github.stackanvil:viabedrock-stackanvil:0.2.2")
}
```

This example uses release `stack-v0.2.2`. Choose the version you need from [StackAnvil releases](https://github.com/StackAnvil/patches/releases) and keep the other repositories required by your dependencies. The [Javadocs site](https://stackanvil-jd.pistonmaster.net/) documents the latest release.

| Project | Artifact ID | Maven versions | API reference |
| --- | --- | --- | --- |
| ViaBedrock | `viabedrock-stackanvil` | [Metadata](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/viabedrock-stackanvil/maven-metadata.xml) | [Javadocs](https://stackanvil-jd.pistonmaster.net/viabedrock/) |
| ViaFabricPlus Bedrock add-on | `viafabricplus-bedrock-stackanvil` | [Metadata](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/viafabricplus-bedrock-stackanvil/maven-metadata.xml) | [Javadocs](https://stackanvil-jd.pistonmaster.net/viafabricplus-bedrock/) |
| CubeConverter | `cubeconverter-stackanvil` | [Metadata](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/cubeconverter-stackanvil/maven-metadata.xml) | [Javadocs](https://stackanvil-jd.pistonmaster.net/cubeconverter/) |
| ViaProxy | `viaproxy-stackanvil` | [Metadata](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/viaproxy-stackanvil/maven-metadata.xml) | [Javadocs](https://stackanvil-jd.pistonmaster.net/viaproxy/) |

All four coordinates use group ID `io.github.stackanvil`. The Maven repository keeps published versions. The Javadocs links show the latest release at stable paths. The [website guide](https://stackanvil.pistonmaster.net/libraries/) has the same usage steps and reference links.

## How the stack works

Each project has three ordered groups in `patches/<project>/series.json`:

1. **Setup** prepares builds for StackAnvil. It marks artifacts, routes local dependencies, and fixes build compatibility.
2. **Upstreamable** contains changes that can become focused upstream PRs. Each patch has one commit and one `.patch` file.
3. **Deferred** contains changes that another contributor is already taking upstream. Each entry records a reason and a link to that PR.

The full build applies every group in that order. Our upstream PR branch starts at clean upstream and applies only the first upstreamable patch. It excludes setup and deferred changes.

| Project | Upstream | Initial upstreamable patches |
| --- | --- | --- |
| ViaBedrock | [ViaVersionAddons/ViaBedrock](https://github.com/ViaVersionAddons/ViaBedrock) | [#420](https://github.com/ViaVersionAddons/ViaBedrock/pull/420), [#425](https://github.com/ViaVersionAddons/ViaBedrock/pull/425), [#427](https://github.com/ViaVersionAddons/ViaBedrock/pull/427), [#429](https://github.com/ViaVersionAddons/ViaBedrock/pull/429) |
| viafabricplus-bedrock | [ViaVersionAddons/viafabricplus-bedrock](https://github.com/ViaVersionAddons/viafabricplus-bedrock) | [#7](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/7), [#9](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/9), [#11](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/11) |
| CubeConverter | [oryxel1/CubeConverter](https://github.com/oryxel1/CubeConverter/tree/vv-json) | Ready for contributions |
| ViaProxy | [ViaVersion/ViaProxy](https://github.com/ViaVersion/ViaProxy) | Ready for contributions |

## Try a stack

StackAnvil ViaBedrock, ViaProxy, and the Bedrock add-on require Java 25. CubeConverter builds with JDK 17.

Install [Bun](https://bun.sh/), Git, the [GitHub CLI](https://cli.github.com/), and the JDK needed by your project. Then run:

```bash
bun install --frozen-lockfile
bun run stack sync viabedrock
bun run build viabedrock
```

The tool clones upstream into `.worktrees/viabedrock`. The full source tree remains a normal Git repository. The build JAR and its SHA-256 manifest go to `dist/viabedrock/`. A target build also builds its dependencies. `bun run build all` builds CubeConverter before ViaBedrock, then builds the Bedrock add-on and ViaProxy against that library. It downloads the pinned ViaFabricPlus Jenkins JAR before building the add-on. The local Maven repository in `.stackanvil/maven/` gives the add-on that exact JAR and the patched ViaBedrock dependency.

The ViaFabricPlus pin is in [`viafabricplus.json`](viafabricplus.json). It selects [Jenkins build 2261](https://ci.viaversion.com/job/ViaFabricPlus/2261/) and upstream commit [9913d32](https://github.com/ViaVersion/ViaFabricPlus/commit/9913d32266be9243ee31fc84539913ae79ae6aa2). It records SHA-256 checksums for the JAR, API JAR, and Maven POMs. The `mavenVersion` field selects the exact Maven publication, including its timestamp for snapshot builds. `bun run build viafabricplus` downloads and verifies these upstream artifacts. It does not build a VFP checkout.

To update the pin, choose a successful Jenkins build for the target Minecraft version. Record its commit, version, Maven publication version, and artifact checksums in `viafabricplus.json`. Check that the Maven API JAR matches the API JAR embedded in the Jenkins JAR. Then run `bun run build viafabricplus-bedrock` and `bun run bundle`. The add-on gets its ViaFabricPlus version from the pin.

Run `bun run bundle` after `bun run build all` to make the optional Prism Launcher instance ZIP with the two Fabric mods. The add-on embeds the StackAnvil ViaBedrock and CubeConverter JARs. Our [capture lab guide](docs/capture-lab.md) explains the local server, ViaProxy, Bedrock client, Java client, screenshots, and private HTTPS capture workflow. The lab keeps both game windows off your active desktop and sets their master volume to zero. Use the [server replay lab](docs/server-replay.md) to capture a bounded public server session and run later rendering regressions locally.

Use `bun run stack status <project>` to see its pinned upstream commit and patch order. Run `bun run build viaproxy` to build the patched proxy and its dependencies. Use `bun run dev:setup` to prepare mitmproxy and check your Bedrock server and client paths. The [development guide](docs/development.md) explains traffic capture and manual tests.

## Contribute a patch

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [patch workflow](docs/patch-workflow.md) for the edit and conflict workflow. The patch workflow also explains what StackAnvil takes from Paper's old scripts and current paperweight tooling. The common path is:

```bash
bun run stack edit viabedrock 0001-cache-converted-resource-packs.patch
# Edit files under .worktrees/viabedrock, then stage your changes there.
bun run stack rebuild viabedrock
bun run pr check viabedrock
bun run stack sync viabedrock
```

When an upstream PR is ready, add a non-empty `.pr.md` file beside the first upstreamable patch, using the same base filename. `bun run pr body <project>` combines that file with the patch commit description. A maintainer can use `bun run pr sync <project>` to update the StackAnvil fork branch and open or update the single draft PR. It checks both descriptions before pushing.
The sync command adds the project's default PR assignees when your GitHub account has access. Run `bun run pr assign <project>` to update assignees without pushing the branch.

## Builds and licenses

[GitHub releases](https://github.com/StackAnvil/patches/releases) provide four StackAnvil JARs, the pinned upstream ViaFabricPlus JAR, and a PrismLauncher instance ZIP. The [Maven repository](https://stackanvil-maven.pistonmaster.net/) serves the StackAnvil release artifacts. A full build can contain features that are still under upstream review. Test it before using it in a production server.

Maintainers can use the [VFP Bedrock add-on publishing guide](docs/publishing-vfp-vb-addon.md) to manage the StackAnvil listings on mod platforms.

StackAnvil tooling is licensed under [GPL-3.0-or-later](LICENSE). Each upstream project keeps its own license and copyright notices. StackAnvil is an independent experiment and is not an official ViaVersion release.
