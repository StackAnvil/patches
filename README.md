# StackAnvil patches

StackAnvil is a place to test changes across ViaBedrock, viafabricplus-bedrock, CubeConverter, and ViaFabricPlus. Each upstream-sized feature lives in one patch. Contributors can try the full build while upstream reviews one feature at a time.

We welcome bug reports, test results, and patches. You do not need to work on all four projects. Start with the project you know.

## How the stack works

Each project has three ordered groups in `patches/<project>/series.json`:

1. **Branding** marks StackAnvil builds. We do not propose this patch upstream.
2. **Features** contain changes intended for upstream. Each feature is one commit and one `.patch` file.
3. **Custom** contains changes we plan to keep downstream.

The full build applies every group. The upstream PR branch starts at clean upstream and applies only the first feature patch. It never includes branding or custom changes.

| Project | Upstream | Initial feature patches |
| --- | --- | --- |
| ViaBedrock | [ViaVersionAddons/ViaBedrock](https://github.com/ViaVersionAddons/ViaBedrock) | [#420](https://github.com/ViaVersionAddons/ViaBedrock/pull/420), [#425](https://github.com/ViaVersionAddons/ViaBedrock/pull/425), [#427](https://github.com/ViaVersionAddons/ViaBedrock/pull/427), [#429](https://github.com/ViaVersionAddons/ViaBedrock/pull/429) |
| viafabricplus-bedrock | [ViaVersionAddons/viafabricplus-bedrock](https://github.com/ViaVersionAddons/viafabricplus-bedrock) | [#7](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/7), [#9](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/9), [#11](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/11) |
| CubeConverter | [Oryxel/CubeConverter](https://github.com/Oryxel/CubeConverter) | Ready for contributions |
| ViaFabricPlus | [ViaVersion/ViaFabricPlus](https://github.com/ViaVersion/ViaFabricPlus) | Ready for contributions |

## Try a stack

Install [Bun](https://bun.sh/), Git, the [GitHub CLI](https://cli.github.com/), and the JDK needed by your project. Then run:

```bash
bun install --frozen-lockfile
bun run stack sync viabedrock
bun run build viabedrock
```

The tool clones upstream into `.worktrees/viabedrock`. The full source tree remains a normal Git repository. The build JAR and its SHA-256 manifest go to `dist/viabedrock/`.

Use `bun run stack status <project>` to see its pinned upstream commit and feature order. Use `bun run dev:setup` to prepare ViaProxy and mitmproxy, then check your Bedrock server and client paths. The [development guide](docs/development.md) explains traffic capture and manual tests.

## Contribute a patch

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [patch workflow](docs/patch-workflow.md) for the edit and conflict workflow. The patch workflow also explains what StackAnvil takes from Paper's old scripts and current paperweight tooling. The common path is:

```bash
bun run stack edit viabedrock 0001-cache-converted-resource-packs.patch
# Edit files under .worktrees/viabedrock, then stage your changes there.
bun run stack rebuild viabedrock
bun run pr check viabedrock
bun run stack sync viabedrock
```

When an upstream PR is ready, `bun run pr body <project>` generates its body. A maintainer can use `bun run pr sync <project>` to update the StackAnvil fork branch and open or update the single draft PR.

## Builds and licenses

[GitHub releases](https://github.com/StackAnvil/patches/releases) contain the full StackAnvil builds. The [Maven repository](https://github.com/StackAnvil/maven) serves published release artifacts. A full build can contain features that are still under upstream review. Test it before using it in a production server.

StackAnvil tooling is licensed under [GPL-3.0-or-later](LICENSE). Each upstream project keeps its own license and copyright notices. StackAnvil is an independent experiment and is not an official ViaVersion release.
