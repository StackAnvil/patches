# OreUI shaping engine

This build applies the Bedrock 1.26.60.5 OreUI layout policy to HarfBuzz 14.3.0.
It rounds signed anchors separately and preserves native variation-device admission and scaling.
The source archive and compatibility patch have separate SHA-256 identities.
The library does not link FreeType. The Java adapter must supply callbacks from the game's FreeType library.

## Build locally

Install CMake 3.24 or newer, Git, and a C++ compiler.
`bun run build` compiles the engine for your platform when it is missing or does not match the pinned source and patch.
To build it without the add-on, run this from the repository root:

```bash
bun run shaper build
```

The command configures, compiles, tests, installs, and verifies the engine.
It installs into `.stackanvil/tools/oreui-shaper-resources/`, or into `STACKANVIL_OREUI_SHAPER_RESOURCES` when you set it.
Use `--output <directory>` to choose another directory.
Pass extra CMake configure arguments after `--`, for example `bun run shaper build -- -DSTACKANVIL_HARFBUZZ_ARCHIVE=/absolute/path/to/archive.tar.gz`.
The archive checksum applies to local files and downloads.

The installation contains the library, its license, and a manifest under `assets/viafabricplus-bedrock/oreui-shaper/<platform>-<architecture>/`.
The verifier checks the source and patch identities, binary architecture, library checksum, and license.
The authored tests exercise mark positioning and a constant variation delta through the public shaping API.
They do not contain game fonts or captures.

A local add-on embeds every engine in the resource directory and needs at least your platform's engine.
It does not shape OreUI text on platforms without an engine.
The build prints the embedded platforms.
A local build uses the host's system libraries and does not establish compatibility with older systems.

## Build for release

CI and release builds embed all six platform engines.
[The shared native workflow](../../.github/workflows/oreui-shaper.yml) runs `bun run shaper build --target <platform-architecture>` on each platform.
Linux workflow builds use Ubuntu 22.04. macOS workflow builds target macOS 13 or newer.
Set `STACKANVIL_REQUIRE_ALL_OREUI_SHAPERS=1` to require all six engines in a local build.
In this mode, the build does not compile the engine. `bun run validate release` always uses this mode.
Combine the six `oreui-shaper-*` workflow artifacts into the resource directory, with each artifact's `assets/` tree at the root.
Run `bun run shaper verify` to check all six installations, or `bun run shaper verify <directory> <platform-architecture>` to check one.
The stack build checks them again and compares every embedded library, manifest, and license with the finished add-on JAR.
For a direct add-on Gradle build, pass `-PbedrockOreUiShaper=/path/to/resources`.

## Runtime

The Java text backend loads and checks this library.
Set `STACKANVIL_NATIVE_FONT_GPU_TESTS=1` to run the optional EGL font shader tests.
The CI and release builds run these tests with Mesa software rendering.
Complete font fallback, layout, sampling, and native screen integration remain unfinished.
The selected native comparisons remain private under `.stackanvil/research/`.
This helper uses the repository's GPL-3.0-or-later license. HarfBuzz retains its bundled [license](COPYING).
