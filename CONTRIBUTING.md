# Contributing to StackAnvil

Thanks for helping. A clear bug report, a build result, or a small patch all help us move a feature toward upstream.

## Choose a patch group

Add a change to `features` when it can become one focused upstream PR. Add it to `custom` when it is useful here but has no upstream PR planned. Use branding for artifact identity and local dependency routing.

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

Apply the current series with `bun run stack sync <project>`. Make one commit in its detached source checkout. Use a Conventional Commit subject and a body that explains the change and any choices a future maintainer should know. Then run `bun run stack add <project> features`. The command takes the patch title and description from that commit, updates the series, and exports the patch. When you edit a commit subject, `stack rebuild` updates its title in `series.json`.

Before opening the first feature as a PR, add a Markdown file beside its patch with the same name and `.pr.md` instead of `.patch`. For example, `features/0001-cache-converted-resource-packs.pr.md`. Put PR-specific context, review guidance, and testing steps there. The PR body uses the patch commit body for the change summary and appends this Markdown file. The file must contain text; `pr body` and `pr sync` fail if it is missing or empty.

Only maintainers run `bun run pr sync <project>`. It force-updates the dedicated `stackanvil/north-star` branch with a lease, then opens or updates one draft upstream PR. Run `bun run pr body <project>` to inspect the proposed text first. Add `--run-id <id>` to link a relevant test artifact run. The PR body is checked before any branch push.

Run `bun run pr check <project>` before proposing a first feature. It applies only that feature to the pinned upstream base and verifies that branding and custom patches are not needed for it to apply.

## Report a problem

Include the project, upstream base commit, patch filename, steps to reproduce, expected behavior, and observed behavior. Attach logs with account tokens and session data removed. Use [SECURITY.md](SECURITY.md) for a vulnerability.
