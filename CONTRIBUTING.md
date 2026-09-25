# Contributing to StackAnvil

Thanks for helping. A clear bug report, a build result, or a small patch all help us move a feature toward upstream.

## Choose a patch group

Add a change to `features` when it can become one focused upstream PR. Add it to `custom` when it is useful here but has no upstream PR planned. Keep branding limited to identifying our artifacts.

Each feature patch must apply to clean upstream after the features before it. The first feature must apply without the branding patch. Do not put unrelated changes in one patch.

## Edit an existing patch

1. Run `bun install --frozen-lockfile`.
2. Run `bun run stack edit <project> <patch-file>`.
3. Edit the source under `.worktrees/<project>`.
4. Stage the files with `git -C .worktrees/<project> add <paths>`.
5. Run `bun run stack rebuild <project>`.
6. Run `bun run stack sync <project>` and `bun run build <project>`.

The edit command saves later commits under a local backup ref. Rebuild amends your chosen commit, replays later commits, and writes the `.patch` files. If Git reports a conflict, resolve it in the source tree, stage the result, and run `bun run stack rebuild <project>` again. Do not erase `.stackanvil/<project>.json` during a conflict.

If `stack sync` stops during `git am`, resolve and stage the files in `.worktrees/<project>`, then run `bun run stack continue <project>`. To discard that apply, run `bun run stack abort <project>`. For a conflict in the PR-only checkout, add `--pr` to either command. The [patch workflow](docs/patch-workflow.md) explains how these sessions work.

## Add a feature patch

Apply the current series with `bun run stack sync <project>`. Make one commit in its detached source checkout. Use a Conventional Commit message. Then run `bun run stack add <project> features '<title>'`. Add `--source-pr <url>` when the feature came from a PR. The command updates the series and exports the patch.

Only maintainers run `bun run pr sync <project>`. It force-updates the dedicated `stackanvil/north-star` branch with a lease, then opens or updates one draft upstream PR. Run `bun run pr body <project>` to inspect the proposed text first. Add `--run-id <id>` to link a relevant test artifact run.

Run `bun run pr check <project>` before proposing a first feature. It applies only that feature to the pinned upstream base and verifies that branding and custom patches are not needed for it to apply.

## Report a problem

Include the project, upstream base commit, patch filename, steps to reproduce, expected behavior, and observed behavior. Attach logs with account tokens and session data removed. Use [SECURITY.md](SECURITY.md) for a vulnerability.
