---
layout: default
title: Contributing
nav_order: 6
description: Report a problem, test a build, or contribute a focused patch.
---

# Contributing

You can help with one patch target without working on all four. Start with the project you know.

## Report or test

Open an [issue](https://github.com/StackAnvil/patches/issues) with the project name, the build you tested, steps to reproduce, and the result you expected. Remove credentials and private traffic data from logs before sharing them.

## Contribute a patch

1. Read [CONTRIBUTING.md](https://github.com/StackAnvil/patches/blob/main/CONTRIBUTING.md) and the [patch workflow]({{ '/patch-workflow/' | relative_url }}).
2. Edit the generated source checkout in `.worktrees/<project>`.
3. Stage the source change and rebuild the patch file.
4. Run the targeted build and `bun run pr check <project>`.
5. Add PR context in the matching `.pr.md` file when the patch is ready for upstream review.

Keep setup changes out of upstream PRs. Keep each upstreamable change small enough for one focused review.

## Development guides

- [Local development and traffic capture](https://github.com/StackAnvil/patches/blob/main/docs/development.md)
- [Bedrock source research](https://github.com/StackAnvil/patches/blob/main/docs/bedrock-development-sources.md)
- [Capture lab](https://github.com/StackAnvil/patches/blob/main/docs/capture-lab.md)

StackAnvil tooling uses GPL-3.0-or-later. Each generated upstream source tree keeps its own license and copyright notices.
