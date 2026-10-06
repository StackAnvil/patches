# StackAnvil contributor instructions

This repository stores patch files and the tools that apply them. The generated source checkouts under `.worktrees/` are local Git repositories. Edit and commit there, then export the result back to this repository with `bun run stack rebuild <project>`.

## Patch order and upstream PRs

- Read `patches/<project>/series.json` before changing a stack. Apply `setup`, then `upstreamable`, then `deferred` in that order.
- Keep `setup` limited to StackAnvil build identity, dependency routing, and compatibility. Never include it in an upstream PR.
- Give each upstream-sized change one commit and one `.patch` file. Only the first `upstreamable` patch is the north-star PR. It must apply to the pinned upstream base without `setup`.
- Before adding a patch, inspect earlier patches that introduced the affected code or behavior.
- If a change fixes or broadens the same feature, edit its owning patch and make the shared design general.
- Do not leave a later patch that only repairs or generalizes an earlier patch when both form one upstream-sized change.
- Keep changes separate when they are independently reviewable, have different upstream owners, or need different prerequisites.
- After folding a patch into an earlier one, remove its patch file and `series.json` entry. Replay and test the full stack.
- Keep each upstreamable patch's purpose in its commit body. Before creating or updating its upstream PR, add a non-empty `.pr.md` file beside the patch with the same base filename for PR-specific context and testing.
- Use `deferred` only when another upstream PR already covers the change. Record a non-empty reason with a link to that PR in `series.json`. Never include deferred patches in our upstream PR branches.
- Explain non-obvious choices in the patch commit body. The commit body becomes part of the exported patch and helps reviewers maintain it later.
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
- Keep `targets.json` dependencies in build order. A downstream build must resolve the StackAnvil JARs that the same run built.
- ViaFabricPlus is a pinned upstream dependency in `viafabricplus.json`, not a patch target. Verify its Jenkins build, commit, JAR, API JAR, and Maven POM checksums before building the Bedrock add-on.
- For Bedrock development, read [the Bedrock source guide](docs/bedrock-development-sources.md). Use beta/preview protocol docs for enum research, then match the target protocol and verify numeric mappings against implementation or captures. Stable protocol pages can contain incorrect enum mappings.
- Port a Bedrock feature only when the target Bedrock version has that feature. Use versioned evidence to establish its behavior, then reproduce that behavior on Java. Do not change a sound, caption, UI, or other result merely because a Java equivalent seems more fitting. Record the evidence in the patch commit body or `.pr.md`.
- Use `bun run lab` and `bun run capture` for local Bedrock and Java tests. Keep their virtual display and zero volume defaults. Desktop input requires an explicit `--allow-focus`. Follow [the capture lab guide](docs/capture-lab.md). Keep credentials, raw flows, screenshots, and JVM dumps private.
- Do not commit `.worktrees/`, `.stackanvil/`, `dist/`, downloaded servers, credentials, or traffic captures.
- Treat the patches repository as GPL-3.0-or-later tooling. Keep upstream projects' license and copyright notices in generated source and builds.

## Rollout dry runs and logging

Before every deployment or rollout, perform a dry run and review verbose logs of the exact planned changes.
This applies to artifact uploads, staged replacements, configuration changes, migrations, restarts, releases, and pushes that trigger automatic deployments.

- Verify the target environment, cluster context, namespace, service, and destination paths before any mutation.
- Record the current state and a complete artifact inventory, including filenames, plugin identities, versions, and checksums where applicable.
- Build one explicit change plan. List every file or resource to create, replace, remove, migrate, or restart.
- Use exact artifact names and paths for replacements and removals. Do not use broad globs or shared name prefixes.
- Keep related plugins distinct. `AuthMe*.jar` also matches AuthMeVelocity and must never select AuthMeReloaded files for removal.
- Use the tool's native dry-run or plan mode and verbose output when available. Review the resulting diff before applying it.
- If no native dry run exists, produce a non-mutating preview from the same selection logic and explicit change plan.
- For custom scripts, provide dry-run and verbose modes. Both modes must use the same plan as the real operation.
- Log each planned and applied action with its exact target and reason. Include before-and-after identities, versions, and checksums where applicable.
- Redact secrets and personal data before output. Do not print whole credential-bearing configurations or enable shell tracing around secrets.
- Stop if the preview includes unrelated changes, unexpected removals, ambiguous targets, or unverified artifacts. Correct the plan before proceeding.
- Prepare rollback copies outside active and staged artifact directories before replacing or removing artifacts.
- Apply only the reviewed plan. If the target state changes, repeat the dry run before applying it.
- Compare complete inventories after applying the plan. Exclude only the exact intended filenames, never a shared prefix.
- Verify unrelated artifacts remain present and unchanged. Account explicitly for documented self-updating artifacts.
- Verify the affected user flow after rollout. Healthy pods and successful authentication alone do not prove cross-plugin handoffs work.
- For authentication changes, verify login, the message to the proxy, and transfer from the login server to the destination.
- Report the dry-run result, applied changes, rollback location, and live verification. Preserve existing user authorization requirements.
