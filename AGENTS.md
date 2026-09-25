# StackAnvil contributor instructions

This repository stores patch files and the tools that apply them. The generated source checkouts under `.worktrees/` are local Git repositories. Edit and commit there, then export the result back to this repository with `bun run stack rebuild <project>`.

## Patch order and upstream PRs

- Read `patches/<project>/series.json` before changing a stack. Apply `branding`, then `features`, then `custom` in that order.
- Keep branding limited to artifact identity. Never include it in an upstream PR.
- Give each upstream-sized feature one commit and one `.patch` file. Only the first feature in the series is the north-star PR. It must apply to the pinned upstream base without branding.
- Keep each feature's purpose in its commit body. Before creating or updating its upstream PR, add a non-empty `.pr.md` file beside the patch with the same base filename for PR-specific context and testing.
- Keep downstream-only work in `custom`. Do not include custom patches in upstream PR branches.
- Explain non-obvious choices in the feature commit body. The commit body becomes part of the exported patch and helps reviewers maintain it later.
- Do not change an existing patch filename just because its commit hash changes. Its place in `series.json` is the ordering source of truth.

## Commands

```bash
bun install --frozen-lockfile
bun run stack sync <project>
bun run stack edit <project> <patch-file>
# Edit and stage files in .worktrees/<project>.
bun run stack rebuild <project>
bun run pr check <project>
bun run pr assign <project>
bun run build <project>
bun run build all
bun run bundle
bun run test:integration
```

If `stack sync` stops at a conflict, resolve it in the generated checkout, stage the files, and run `bun run stack continue <project>`. To discard that apply, run `bun run stack abort <project>`. Add `--pr` to those commands for a conflict in the PR-only checkout. If `stack rebuild` stops during a cherry-pick, resolve and stage the files, then run `stack rebuild` again. See [the patch workflow](docs/patch-workflow.md) before changing a patch stack.

## Repository work

- Use Bun, TypeScript, and Effect for the stack tooling. Keep the command behavior clear from the CLI and avoid shell-specific behavior.
- Use Conventional Commit messages in the form `<type>(<scope>): <description>`. Add a body for non-trivial changes. Do not bypass Git hooks or Lefthook.
- Do not create a branch unless the user explicitly asks for one.
- Run `bun run check` after tooling changes. Add targeted tests for behavior that could lose patch work or change PR contents.
- Keep `targets.json` dependencies in build order. A downstream build must resolve the StackAnvil JARs that the same run built, including the ViaFabricPlus API artifact.
- For Bedrock development, read [the Bedrock source guide](docs/bedrock-development-sources.md). Use beta/preview protocol docs for enum research, then match the target protocol and verify numeric mappings against implementation or captures. Stable protocol pages can contain incorrect enum mappings.
- Use `bun run lab` and `bun run capture` for local Bedrock and Java tests. Keep their virtual display and zero volume defaults. Desktop input requires an explicit `--allow-focus`. Follow [the capture lab guide](docs/capture-lab.md). Keep credentials, raw flows, screenshots, and JVM dumps private.
- Do not commit `.worktrees/`, `.stackanvil/`, `dist/`, downloaded servers, credentials, or traffic captures.
- Treat the patches repository as GPL-3.0-or-later tooling. Keep upstream projects' license and copyright notices in generated source and builds.
