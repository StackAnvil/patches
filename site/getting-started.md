---
layout: default
title: Getting started
nav_order: 2
description: Build and try a StackAnvil patch stack locally.
---

# Getting started

Build one project first. The commands below use ViaBedrock as an example.

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

The bundle command creates a PrismLauncher instance ZIP with the pinned upstream ViaFabricPlus JAR and the patched Bedrock add-on. The add-on embeds the StackAnvil ViaBedrock and CubeConverter JARs. See [releases]({{ '/releases/' | relative_url }}) if you want prebuilt artifacts.

For local client and server tests, use the [capture lab guide](https://github.com/StackAnvil/patches/blob/main/docs/capture-lab.md). Keep credentials, captures, and screenshots in ignored local paths.
