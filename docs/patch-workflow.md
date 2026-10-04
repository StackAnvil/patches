# Patch workflow and Paper research

StackAnvil keeps one ordered patch series per upstream project. The source checkout under `.worktrees/<project>` is a disposable Git repository; the `.patch` files and `series.json` in this repository are the saved work. This design comes from Paper's patch workflow, adapted for normal upstream Git repositories and a single upstream PR at a time.

## What Paper does today

Paper's [current contribution guide](https://github.com/PaperMC/Paper/blob/main/CONTRIBUTING.md) separates patches into `sources`, `resources`, and `features`. Source and resource patches change individual Minecraft files. Feature patches are larger commits that can span files. Contributors run `./gradlew applyPatches`, edit the generated checkout, then run `./gradlew rebuildPatches`. To edit an older feature, they amend or autosquash into its commit, replay later commits, and rebuild the patch files. Paper asks for patch notes in commit bodies when a future maintainer will need the reasoning.

In [paperweight's feature apply task](https://github.com/PaperMC/paperweight/blob/main/paperweight-core/src/main/kotlin/io/papermc/paperweight/core/tasks/patching/ApplyFeaturePatches.kt), Git starts from a generated base commit and applies feature patches with three-way merge support. A failed apply leaves Git's recovery state in place and reports how to finish. Its [rebuild task](https://github.com/PaperMC/paperweight/blob/main/paperweight-lib/src/main/kotlin/io/papermc/paperweight/tasks/RebuildGitPatches.kt) exports commits with `git format-patch`. It also avoids showing patch-file changes that only reflect generated header differences.

## How the older scripts worked

The [PaperSpigot 1.8.8 apply script](https://github.com/PaperMC/Paper-archive/blob/ver/1.8.8/applyPatches.sh) reset generated API and server repositories to their upstream branches, then ran `git am --3way` over numbered patch files. On conflict, it left the apply unfinished and told the contributor to repair it and rebuild. The [matching rebuild script](https://github.com/PaperMC/Paper-archive/blob/ver/1.8.8/rebuildPatches.sh) ran `git format-patch` from the upstream base, staged the patch directory, and filtered header-only changes. The [1.12.2 scripts](https://github.com/PaperMC/Paper-archive/tree/ver/1.12.2/scripts) added whitespace-tolerant apply, a Windows command-length workaround, and a partial save path during an unfinished apply. The [1.12.2 contribution guide](https://github.com/PaperMC/Paper-archive/blob/ver/1.12.2/CONTRIBUTING.md) described interactive rebase and fixup commits for editing a patch in the middle of a series.

## What StackAnvil uses

| Paper idea | StackAnvil behavior |
| --- | --- |
| Generated checkout with one commit per patch | `bun run stack sync <project>` applies the ordered series into `.worktrees/<project>`. |
| Rebuild patches from commits | `bun run stack rebuild <project>` exports every series commit to its existing filename. |
| Edit an earlier patch and replay later ones | `bun run stack edit <project> <patch-file>` saves a backup ref and resets to that commit. `stack rebuild` amends it and cherry-picks later commits. |
| Keep generated headers out of review noise | `stack rebuild` leaves a patch file alone when only its generated commit ID or Git version footer changed. |
| Keep failed apply state for repair | `stack sync` saves an apply session. Resolve and stage a conflict, then run `stack continue`. Run `stack abort` to discard the failed apply. |
| Patch notes in commit messages | Put the purpose and maintenance details in the commit body. They remain in the exported patch and become the PR change summary. `stack add` requires a body, and `stack rebuild` keeps the series title aligned with the commit subject. |
| Independently test an upstreamable patch | `bun run pr check <project>` applies the first patch to clean upstream. Add `--patch <file>` to check another patch. |

StackAnvil keeps `setup`, `upstreamable`, and `deferred` separate in `series.json`. Full builds apply them in that order. Setup prepares StackAnvil builds. Upstreamable patches can become focused PRs. Deferred patches track work that another contributor already owns upstream, with a reason and PR link for each entry. The PR checkout applies only the first upstreamable patch to the pinned upstream base. The exact patch filenames and order come from `series.json`; rebuilding does not renumber them.

Paper's per-file source and resource patches solve the problem of editing decompiled Minecraft code. Our four patch targets are existing Git repositories, so they do not need that layer. We also apply patches one at a time instead of building a large `git am` argument list. This keeps conflict recovery tied to one explicit `series.json` entry and avoids the older Windows command-length issue. We do not add Paper-specific source markers to upstream code.

## Daily commands

```bash
bun run stack sync viabedrock
bun run stack edit viabedrock 0001-cache-converted-resource-packs.patch
# Edit and stage files in .worktrees/viabedrock.
bun run stack rebuild viabedrock
bun run pr check viabedrock
bun run build viabedrock
```

Before opening a PR, add a non-empty `.pr.md` file beside its `.patch` file. Use it for evidence, review guidance, and test results that do not belong in the commit message. Run `bun run pr body <project>` to inspect the first patch's PR text. Run `bun run pr sync <project>` to update the fork's north-star branch and its PR.

To open another upstreamable patch as a separate PR, select its filename with `--patch`. The selected patch must apply alone to the pinned upstream base. The tool uses a separate checkout and fork branch for each patch. It checks for one PR commit before it pushes. The default command still selects the first patch.

```bash
bun run pr check viabedrock --patch 0085-resolve-server-effects-relative-to-their-actor.patch
bun run pr body viabedrock --patch 0085-resolve-server-effects-relative-to-their-actor.patch
bun run pr sync viabedrock --patch 0085-resolve-server-effects-relative-to-their-actor.patch
```

Use the same `--patch` option with `pr build` and `pr assign`. If a selected patch conflicts with upstream, use `bun run stack continue <project> --pr --patch <file>` after you resolve and stage the conflict. Use `stack abort` with the same options to discard that apply.

## PR assignees and reviewers

`targets.json` lists the default people for each upstream PR. `bun run pr sync <project>` assigns them and requests their reviews on a ready PR. Run `bun run pr assign <project>` to update both without pushing the branch. The tool keeps people added manually and does not request another review from someone who has already reviewed.

| Project | Default assignees and reviewers |
| --- | --- |
| ViaBedrock | `RaphiMC` (RK_01), `Exterminate5573` |
| viafabricplus-bedrock | `RaphiMC`, `Exterminate5573`, `florianreuth` |
| ViaProxy | `RaphiMC` (RK_01) |
| CubeConverter | `oryxel1` |

Draft PRs receive assignees. Review requests wait until the PR is ready; then run `bun run pr assign <project>` or `bun run pr sync <project>`. Add `--patch <file>` to target a standalone PR. Assignment needs upstream triage or write access. Review requests need upstream write access. The command reports actions it could not complete, so an upstream maintainer can finish them.

## Conflict recovery

During `stack sync`, Git may stop in the middle of `git am`. Inspect `git status` in `.worktrees/<project>`, resolve the files, stage them, and run `bun run stack continue <project>`. The tool finishes the stopped patch, then applies the remaining entries. For a PR-only checkout, use `bun run stack continue <project> --pr`. If the attempt should be discarded, use `stack abort` with the same project and optional `--pr`, then run `stack sync` again. Do not delete the apply session by hand.

During `stack rebuild`, a later commit can conflict with an edited earlier patch. Resolve and stage it in the full checkout, then rerun `bun run stack rebuild <project>`. The edit session tracks how many later commits have replayed. Its backup ref keeps the pre-edit stack reachable until the rebuild succeeds.
