Keep valid modern and legacy geometry declarations when texture dimensions or the bones array are omitted.
Dimensions default to 64 by 64, and absent bones produce an empty model.
Recognize legacy declarations by their geometry key, since texture dimensions are optional there too.
Preserve explicit dimensions and source JSON.

[Upstream PR #2](https://github.com/oryxel1/CubeConverter/pull/2) now supplies invisible-cube export, missing UV defaults, locator-only fitting and source-preserving UV normalization.
Those changes and their tests remain in the pinned upstream base.
The remaining patch changes only optional-field parsing and its regression test.
Its filename remains stable within the series.

The matching Bedrock 1.26.51.1/protocol 2193 compiler caller `141c11ba0` supplies width and height 64 to `141c13a30`.
The existing private instruction probe executes the texture-dimension reader at `141c13bfd..141c13c6b`.
It verifies twelve cases with absent/null dimensions, independent numeric overrides and two caller defaults.
The probe executes original native JSON lookup and integer conversion helpers.
Its boundaries provide CRT byte/string operations, allocation, frees and a diagnostic backend.
It excludes schema dispatch, inherited/cached dimensions, complete bone loading, registration and rendering.
The executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.

The parser regression covers modern and legacy declarations, missing and empty bones, defaults, independent dimension overrides and source preservation.
Each result exports with finite metadata through every rotation mode.
Earlier capture and replay evidence remains historical evidence for the same optional-field behavior.
It does not establish complete native image parity.
