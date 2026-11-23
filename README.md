# StackAnvil patches

**Website:** [stackanvil.pistonmaster.net](https://stackanvil.pistonmaster.net) · [Player guide](https://stackanvil.pistonmaster.net/getting-started/) · [Build from source](https://stackanvil.pistonmaster.net/build-from-source/) · [Downloads](https://stackanvil.pistonmaster.net/releases/)

StackAnvil is a place to test changes across ViaBedrock, viafabricplus-bedrock, CubeConverter, and ViaProxy. It uses a pinned upstream ViaFabricPlus build. Each upstream-sized feature lives in one patch. Contributors can try the full build while upstream reviews one feature at a time.

We welcome bug reports, test results, and patches. You do not need to work on all four patch targets. Start with the project you know.

## Play from Java Edition

**Bedrock add-on downloads:** [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus).

Use the [player guide](https://stackanvil.pistonmaster.net/getting-started/) to run ViaProxy beside a regular Java client or use ViaFabricPlus with the Bedrock add-on. The [latest release](https://github.com/StackAnvil/patches/releases/latest) has the JARs and a `.mrpack` with the tested Fabric client mods. Import the pack into a launcher that supports Modrinth modpacks.

## Use the libraries in a project

The four patched projects are published to the [StackAnvil Maven repository](https://stackanvil-maven.pistonmaster.net/) under the group ID `io.github.stackanvil`. The [Maven and Javadocs guide](https://stackanvil.pistonmaster.net/libraries/) gives the Gradle setup, artifact IDs, version links, and API references.

## How the stack works

Each project has three ordered groups in `patches/<project>/series.json`:

1. **Setup** prepares builds for StackAnvil. It marks artifacts, routes local dependencies, and fixes build compatibility.
2. **Upstreamable** contains changes that can become focused upstream PRs. Each patch has one commit and one `.patch` file.
3. **Deferred** contains changes that another contributor is already taking upstream. Each entry records a reason and a link to that PR.

The full build applies every group in that order. Our upstream PR branch starts at clean upstream and applies only the first upstreamable patch. It excludes setup and deferred changes.

| Project               | Upstream                                                                                            | Patch series                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| ViaBedrock            | [ViaVersionAddons/ViaBedrock](https://github.com/ViaVersionAddons/ViaBedrock)                       | [`series.json`](patches/viabedrock/series.json)            |
| viafabricplus-bedrock | [ViaVersionAddons/viafabricplus-bedrock](https://github.com/ViaVersionAddons/viafabricplus-bedrock) | [`series.json`](patches/viafabricplus-bedrock/series.json) |
| CubeConverter         | [oryxel1/CubeConverter](https://github.com/oryxel1/CubeConverter/tree/vv-json)                      | [`series.json`](patches/cubeconverter/series.json)         |
| ViaProxy              | [ViaVersion/ViaProxy](https://github.com/ViaVersion/ViaProxy)                                       | [`series.json`](patches/viaproxy/series.json)              |

## Try a stack

StackAnvil ViaBedrock, ViaProxy, and the Bedrock add-on require Java 25. CubeConverter builds with JDK 17.

Install [Bun](https://bun.sh/), Git, the [GitHub CLI](https://cli.github.com/), and the JDK needed by your project. Then run:

```bash
bun install --frozen-lockfile
bun run stack sync viabedrock
bun run build viabedrock
```

The tool clones upstream into `.worktrees/viabedrock`. The full source tree remains a normal Git repository. The build JAR and its SHA-256 manifest go to `dist/viabedrock/`. A target build also builds its dependencies. `bun run build all` builds CubeConverter before ViaBedrock, then builds the Bedrock add-on and ViaProxy against that library. It downloads the pinned ViaFabricPlus Jenkins JAR before building the add-on. The local Maven repository in `.stackanvil/maven/` gives the add-on that exact JAR and the patched ViaBedrock dependency.

The ViaFabricPlus pin is in [`viafabricplus.json`](viafabricplus.json). It records the upstream Jenkins build, commit, and SHA-256 checksums for the JAR, API JAR, and Maven POMs. The `mavenVersion` field selects the exact Maven publication, including its timestamp for snapshot builds. `bun run build viafabricplus` downloads and verifies these upstream artifacts. It does not build a VFP checkout.

To update the pin, choose a successful Jenkins build for the target Minecraft version. Record its commit, version, Maven publication version, and artifact checksums in `viafabricplus.json`. Check that the Maven API JAR matches the API JAR embedded in the Jenkins JAR. Then run `bun run build viafabricplus-bedrock` and `bun run bundle`. The add-on gets its ViaFabricPlus version from the pin.

`bun run bundle` creates `dist/modpack/StackAnvil-26.3.mrpack`. It checks both client JARs against their build manifests and pins Minecraft and Fabric Loader. The pack includes those JARs as client overrides in the [Modrinth modpack format](https://support.modrinth.com/en/articles/8802351-modrinth-modpack-format-mrpack).

The add-on embeds the StackAnvil ViaBedrock and CubeConverter JARs. Our [capture lab guide](docs/capture-lab.md) explains the local server, ViaProxy, Bedrock client, Java client, screenshots, and private HTTPS capture workflow. The lab keeps both game windows off your active desktop and sets their master volume to zero. Use the [server replay lab](docs/server-replay.md) to capture a bounded public server session and run later rendering regressions locally.

Use `bun run stack status <project>` to see its pinned upstream commit and patch order. Run `bun run build viaproxy` to build the patched proxy and its dependencies. Use `bun run dev:setup` to prepare mitmproxy and check your Bedrock server and client paths. The [development guide](docs/development.md) explains traffic capture and manual tests.

Use the [Quickemu platform guide](docs/platform-testing.md) for manual Windows and macOS launcher tests from Linux. Start with `bun run lab vm doctor`. The VM commands provide private installation media, guest input, screenshots, artifact transfer, and graceful shutdown.

Use [automated validation](docs/automated-validation.md) for patch health reports, offline regressions, release evidence, and repeated local resource-pack checks. Start with `bun run validate offline` or `bun run stack health all`.

## Showcase videos

The `video/` submodule contains the Remotion editor for recorded gameplay showcases. It supports narration, aligned captions, overlays, transitions, original music, and YouTube exports.

```bash
git submodule update --init video
cd video
bun install --frozen-lockfile
bun run dev
```

Read the [video production guide](video/README.md) for recording and export commands. Gameplay uses the private capture lab. Raw recordings, account data, and licensed pack exports remain private.

## Contribute a patch

For website changes, read the [website development guide](site/README.md).

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

[GitHub releases](https://github.com/StackAnvil/patches/releases) provide four StackAnvil JARs, the pinned upstream ViaFabricPlus JAR, and a `.mrpack` for the Fabric client. The [Maven repository](https://stackanvil-maven.pistonmaster.net/) serves the StackAnvil release artifacts. A full build can contain features that are still under upstream review. Test it before using it in a production server.

Maintainers can use the [VFP Bedrock add-on publishing guide](docs/publishing-vfp-vb-addon.md) to manage the StackAnvil listings on mod platforms.

StackAnvil tooling is licensed under [GPL-3.0-or-later](LICENSE). Each upstream project keeps its own license and copyright notices. StackAnvil is an independent experiment and is not an official ViaVersion release.
