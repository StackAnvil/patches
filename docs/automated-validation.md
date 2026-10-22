# Run automated validation

This guide covers patch health, offline regressions, release evidence, and repeated local resource-pack checks for maintainers.
These checks cover specific contracts and known regressions. They do not establish complete Bedrock parity.

## Inspect patch health

For an offline metadata report, run:

```bash
bun run stack health all --output dist/patch-health.json
```

The report lists prerequisites and missing PR context. It rejects dependency cycles and prerequisites absent from their project's series.
It also verifies the patch subjects, commit bodies, and files through the existing series loader.
Without `--output`, the command writes JSON to standard output.

For upstream application checks, run:

```bash
bun run stack health all --upstream --output dist/patch-health.json
bun run stack health cubeconverter --upstream --output dist/cubeconverter-health.json
```

The command clones each selected upstream into a temporary directory. It leaves generated editing checkouts and saved patches untouched.
It performs these checks:

1. Apply each upstreamable patch without recorded prerequisites to the pinned base, independently.
2. Replay the full stack against the pinned base.
3. Identify equivalent upstream commits and verify that their patches reverse cleanly at the inspected tip.
4. Apply independent candidates to the inspected upstream tip.
5. Rehearse the full stack against that tip, omitting equivalent patches.

A failed pinned replay or invalid metadata produces a nonzero exit status.
An upstream replay conflict is advisory because the configured base remains pinned.
Independent application failures appear in the report. They do not establish whether a patch compiles.
Independent checks use the same three-way Git application as `pr check` and reset the temporary source tree after each patch.
Missing PR context remains advisory until a maintainer prepares that PR.

Git patch equivalence detects matching changes. It cannot recognize every upstream rewrite or prove semantic equivalence.
Historical matches that no longer reverse cleanly remain advisory. The upstream rehearsal does not omit those patches.
An existing prerequisite remains unresolved until a maintainer reviews and removes it.

The scheduled `patch-health.yml` workflow runs every Monday at 07:23 UTC.
It also accepts manual dispatch. Each run uploads JSON and Markdown reports and adds the Markdown to its job summary.

## Run offline and build checks

Install dependencies first:

```bash
bun install --frozen-lockfile
bun run validate offline
```

The offline profile runs the tooling checks, existing Bun regression tests, and patch metadata checks.
It does not start game clients or contact public game servers.
The existing regression fixtures cover packet journals, disconnect detection, resource-pack changes, and process cleanup.

For the existing build checks, run:

```bash
bun run validate build
```

This profile runs the two north-star application checks, Java probe build, full stack build, replay self-tests, and modpack creation.
It requires the build dependencies from [the development guide](development.md).

The CI workflow runs the offline and build profiles in separate jobs.
Each job uploads its evidence even after a failed check.

## Repeat the local resource-pack checks

Prepare the server, private display tools, Prism account, and verified builds using [the integration guide](development.md#run-join-integration-tests).
Keep the lab display available for the integration suite.
Then run:

```bash
bun run validate lifecycle --cycles 3
```

The default is three cycles. The command accepts one to ten cycles and stops after the first failure.
Each cycle runs the existing plain Java client resource-pack probe through ViaProxy against owned local Bedrock servers.
It checks initial conversion, cache reuse after reconnect, conversion of changed content, and service cleanup.
The suite retains its private display and silent audio defaults. It refuses an occupied lab display.

This profile reuses existing builds and compares their checksums before and after the cycles.
It does not open a public server connection or require a fresh Store sign-in.
It does not cover direct add-on connections, native clients, complete inventory interactions, or persistent-client memory growth.
Each cycle starts fresh processes. Timing results include the complete integration command and are not conversion benchmarks.

## Read validation evidence

The latest report for each profile appears at `dist/validation/<profile>.json` and its adjacent Markdown file.
A separate directory under `dist/validation/` retains each run's report.
Reports record the source revision, dirty state, environment, command arguments, exit codes, durations, and coverage limits.
Successful build and lifecycle runs also record JAR and build-manifest checksums.

Each check starts as `not-run`, then becomes `running`, `passed`, or `failed`.
After a failure, subsequent checks remain `not-run`. An interrupted report retains its unfinished state.
The command writes each JSON update through a temporary file and atomic rename.

Raw command logs remain under `.stackanvil/validation/<run-id>/` with private permissions.
Offline and build profiles also print their command output. Lifecycle command output remains private.
Public evidence excludes log contents, account details, screenshots, and packet payloads.
Manual comparisons remain separate evidence and do not become automatic passes.

## Validate a release

From a clean source checkout, run:

```bash
bun run validate release
```

The release profile combines the offline and build profiles. It stops on failure and records the finished artifacts' checksums.
The release workflow uses this profile before publication.

Release preparation requires successful evidence for the exact source revision and artifact set.
It rejects missing checks, changed commands, dirty source, incomplete runs, and mismatched JAR or manifest checksums.
The release includes `validation.json` and `validation.md` beside its downloads.
The modpack is rebuilt from the verified client JARs during release preparation.

Account-based joins and native comparisons remain outside the automatic release gate.
The report names these limits even after every automatic check passes.
