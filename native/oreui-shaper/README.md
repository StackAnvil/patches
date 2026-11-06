# OreUI shaping engine

This build applies the Bedrock 1.26.60.5 OreUI layout policy to HarfBuzz 14.3.0.
It rounds signed anchors separately and preserves native variation-device admission and scaling.
The source archive and compatibility patch have separate SHA-256 identities.
The library does not link FreeType. The Java adapter must supply callbacks from the game's FreeType library.

Install CMake 3.24 or newer, Git, and a C++ compiler on the build host.
From the repository root, build and test the engine:

```bash
cmake -S native/oreui-shaper -B .stackanvil/tools/oreui-shaper-build -DCMAKE_BUILD_TYPE=Release
cmake --build .stackanvil/tools/oreui-shaper-build --config Release --target oreui-shaping-test --parallel 2
ctest --test-dir .stackanvil/tools/oreui-shaper-build -C Release --output-on-failure
cmake --install .stackanvil/tools/oreui-shaper-build --config Release --prefix "$PWD/.stackanvil/tools/oreui-shaper-resources" --component OreUiShaper
bun src/oreui-shaper.ts .stackanvil/tools/oreui-shaper-resources linux-x64
```

Replace `linux-x64` with the host's platform and architecture.
The workflow builds Linux, Windows, and macOS libraries for x64 and arm64.
Linux workflow builds use Ubuntu 22.04. macOS workflow builds target macOS 13 or newer.
A local build uses the host's system libraries and does not establish compatibility with older systems.
For an existing source archive, set `-DSTACKANVIL_HARFBUZZ_ARCHIVE=/absolute/path/to/archive.tar.gz`.
The same archive checksum applies to local files and downloads.

The installation contains the library, its license, and a manifest under `assets/viafabricplus-bedrock/oreui-shaper/<platform>-<architecture>/`.
The verifier checks the source and patch identities, binary architecture, library checksum, and license.
The authored tests exercise mark positioning and a constant variation delta through the public shaping API.
They do not contain game fonts or captures.

The engine build is a prerequisite for the OreUI renderer.
The add-on does not load this library yet. Font fallback, layout, atlas upload, and screen integration remain unfinished.
The selected native comparisons remain private under `.stackanvil/research/`.
This helper uses the repository's GPL-3.0-or-later license. HarfBuzz retains its bundled [license](COPYING).
