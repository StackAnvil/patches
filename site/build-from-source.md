---
layout: default
title: Build from source
nav_order: 4
description: Build and inspect a StackAnvil patch stack locally.
---

# Build from source

This guide is for contributors and developers. If you want to play, follow the [player guide]({{ '/getting-started/' | relative_url }}) to set up ViaProxy or a Fabric client with ViaFabricPlus and the Bedrock add-on.

## Requirements

Install [Bun](https://bun.sh/), Git, and the JDK for your project. The [project list]({{ '/projects/' | relative_url }}) gives each JDK version. Install the [GitHub CLI](https://cli.github.com/) if you plan to work with upstream PRs.

## Build ViaBedrock

1. Clone the [patches repository](https://github.com/StackAnvil/patches) and enter it.
2. Install the tooling dependencies.
3. Apply the pinned upstream source and patch series.
4. Build the project.

```bash
bun install --frozen-lockfile
bun run stack sync viabedrock
bun run build viabedrock
```

The source checkout lives in `.worktrees/viabedrock`. The JAR and its SHA-256 manifest go to `dist/viabedrock/`. A target build also builds the dependencies listed in `targets.json`.

## Inspect a stack

```bash
bun run stack status viabedrock
```

The command shows the pinned upstream commit and patch order. Read `patches/viabedrock/series.json` to see which changes are for setup, upstream review, or deferred work.

## Build the full set

```bash
bun run build all
bun run bundle
```

The bundle command creates a Prism Launcher instance ZIP with the pinned upstream ViaFabricPlus JAR and the patched Bedrock add-on. The add-on embeds the StackAnvil ViaBedrock and CubeConverter JARs. See [downloads]({{ '/releases/' | relative_url }}) if you want prebuilt artifacts.

To use a published JAR as a dependency, follow the [Maven and Javadocs guide]({{ '/libraries/' | relative_url }}). It gives the repository URL, Gradle coordinates, and API reference links.

For local client and server tests, use the [capture lab guide](https://github.com/StackAnvil/patches/blob/main/docs/capture-lab.md). Keep credentials, captures, and screenshots in ignored local paths.
