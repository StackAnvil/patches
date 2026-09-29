---
layout: default
title: Patch workflow
nav_order: 6
description: How StackAnvil applies, edits, and exports focused patches.
---

# Patch workflow

Each patch target has an ordered `series.json`. StackAnvil applies `setup`, then `upstreamable`, then `deferred` patches.

| Group | Purpose | Included in an upstream PR? |
| --- | --- | --- |
| Setup | Build identity, dependency routing, compatibility | No |
| Upstreamable | Focused changes for upstream review | The first patch only |
| Deferred | Work another upstream PR already covers | No |

The full build uses all three groups. The upstream PR checkout starts from clean upstream and applies only the first upstreamable patch.

## Edit an existing patch

```bash
bun run stack sync viabedrock
bun run stack edit viabedrock 0001-cache-converted-resource-packs.patch
# Edit and stage files in .worktrees/viabedrock.
bun run stack rebuild viabedrock
bun run pr check viabedrock
```

`stack rebuild` exports the edited commit to its existing patch filename. Patch order comes from `series.json`, not from a changing commit hash.

## Resolve a conflict

If `stack sync` stops, resolve the files in `.worktrees/<project>`, stage them, then run:

```bash
bun run stack continue <project>
```

If `stack rebuild` stops during a cherry-pick, resolve and stage the files, then run `bun run stack rebuild <project>` again. The [full patch workflow](https://github.com/StackAnvil/patches/blob/main/docs/patch-workflow.md) explains recovery, backup refs, and the design behind this tooling.

## Prepare an upstream PR

Each upstream-sized change has one commit and one `.patch` file. Give the commit a Conventional Commit subject and a body that explains its purpose. Add a non-empty `.pr.md` file beside the first upstreamable patch before opening or updating its PR.

```bash
bun run pr body <project>
bun run pr check <project>
```

The [contributor guide](https://github.com/StackAnvil/patches/blob/main/CONTRIBUTING.md) covers PR preparation and review.
