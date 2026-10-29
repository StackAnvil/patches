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

- Use `net.pistonmaster.stackanvil` for StackAnvil-owned Java packages. Preserve each upstream project's package names in upstream patches. Never introduce `com.enderdash` packages.
- Use Bun, TypeScript, and Effect for the stack tooling. Keep the command behavior clear from the CLI and avoid shell-specific behavior.
- Use Conventional Commit messages in the form `<type>(<scope>): <description>`. Add a body for non-trivial changes. Do not bypass Git hooks or Lefthook.
- Do not create a branch unless the user explicitly asks for one.
- Run `bun run check` after tooling changes. Add targeted tests for behavior that could lose patch work or change PR contents.
- Keep `targets.json` dependencies in build order. A downstream build must resolve the StackAnvil JARs that the same run built.
- ViaFabricPlus is a pinned upstream dependency in `viafabricplus.json`, not a patch target. Verify its Jenkins build, commit, JAR, API JAR, and Maven POM checksums before building the Bedrock add-on.
- For Bedrock development, read [the Bedrock source guide](docs/bedrock-development-sources.md). Start with metadata for the target protocol and its explicit enum values. Compare matching beta/preview schemas when values are missing or disputed. Verify numeric mappings against implementation or captures; enum values can differ from Cereal variant indexes.
- Port a Bedrock feature only when the target Bedrock version has that feature. Use versioned evidence to establish its behavior, then reproduce that behavior on Java. Do not change a sound, caption, UI, or other result merely because a Java equivalent seems more fitting. Record the evidence in the patch commit body or `.pr.md`.
- Use `bun run lab` and `bun run capture` for local Bedrock and Java tests. Keep their virtual display and zero volume defaults. Desktop input requires an explicit `--allow-focus`. Follow [the capture lab guide](docs/capture-lab.md). Keep credentials, raw flows, screenshots, and JVM dumps private.
- Do not commit `.worktrees/`, `.stackanvil/`, `dist/`, downloaded servers, credentials, or traffic captures.
- Treat the patches repository as GPL-3.0-or-later tooling. Keep upstream projects' license and copyright notices in generated source and builds.

## Documentation

- Write for a reader's current task: installation, development, patch maintenance, testing, or troubleshooting.
- Keep one source for each fact. Link to it instead of repeating it across the coverage page, feature guides, and patch notes.
- Keep `docs/bedrock-coverage.md` as a short current-status reference. Replace outdated status when behavior changes. Do not append a chronological change ledger.
- Keep `.pr.md` files focused on purpose, design constraints, validation, and remaining limits. Put enduring implementation rationale in the owning patch's commit body or code comments.
- Keep experiment transcripts, addresses, raw outputs, and repeated validation runs in private `.stackanvil/research/` artifacts. Keep released change history in Git and release notes.
- Remove obsolete prose instead of moving it into another tracked archive. Git preserves earlier revisions.
- Follow the task-based approach in [Paper's docs](https://docs.papermc.io/) and [Purpur's docs](https://purpurmc.org/docs/). Do not document every development step.

## Tests

- Add a test for a concrete failure risk or regression. State the observable behavior in its name.
- Favor packet-to-state, resource selection, inventory reconciliation, patch recovery, and other boundaries where a defect affects users or loses work.
- Keep native comparison fixtures for behavior that depends on Bedrock rendering, input, or timing. A unit test does not establish native parity.
- Do not add tests solely to increase coverage, count tests, or exercise every helper. There is no coverage quota.
- Remove tests that only restate constants, getters, source text, or the implementation's branch structure. Keep assertions on strings when the string is an observable protocol, parser, or rendering result.
- Prefer one representative boundary test over duplicate checks at every layer. Keep separate cases only when they catch distinct failures.
- Use small, explicit fixtures. Do not generate large expected outputs from the same algorithm under test.
- Run checks appropriate to the change. Do not add redundant tests for mechanical renames or documentation edits.
- Apply Google's guidance on [behavior tests](https://testing.googleblog.com/2014/04/testing-on-toilet-test-behaviors-not.html), [change detectors](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html), and [coverage](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html).

## Java conventions

- Import Java types instead of using fully qualified class names in code.
- Use PascalCase for Java class names. Preserve the existing package roots.
