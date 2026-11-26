# Development environment

Use this guide to build the four patch targets with pinned ViaFabricPlus and start a local Bedrock test server.

## Build the stack

Install Git, JDK 17, JDK 25, and the Bun version named by `packageManager` in [`package.json`](../package.json). CI installs the same version. ViaBedrock, ViaProxy, and the Bedrock add-on require Java 25. CubeConverter builds with JDK 17.

Set `STACKANVIL_JAVA_17` and `STACKANVIL_JAVA_25` if the JDKs are not in the standard paths.
The build reads each JDK's `release` file and stops if a variable names a JDK with another version.
Without a variable, it also accepts `JAVA_HOME` when that JDK has the required version.
The add-on also needs the [OreUI shaping library](../native/oreui-shaper/README.md).
With CMake 3.24 or newer and a C++ compiler installed, the build compiles it for your platform.
CI and release builds embed the libraries for all six platforms from their workflow.
Before the first Gradle build, `bun run build` checks the JDKs and bundled resources of every selected target and lists all missing inputs.

Install the [native Wayland lab dependencies](capture-lab.md#prepare-the-clients) for focus free local tests. Then run:

```bash
bun install --frozen-lockfile
bun run build all
bun run bundle
```

`targets.json` records the build order. CubeConverter tracks `master` and builds both Gson variants from shared sources. The build tool selects its `:vv-json` module for ViaBedrock. The `artifactProject` field selects that module's JAR and matching POM. ViaProxy embeds the ViaBedrock build from this stack. The build tool publishes each JAR and POM to `.stackanvil/maven/` and passes that path to Gradle. The setup patches use the local artifacts when the path is present. Direct Gradle builds use the upstream dependencies. Artifacts and manifests go to `dist/`.

The add-on setup includes one compatibility patch for the current ViaBedrock API. The upstream PR branch does not include setup patches.

`bun run bundle` creates `dist/modpack/StackAnvil-<minecraft>.mrpack` with the verified ViaFabricPlus and Bedrock add-on JARs. Import it into a launcher that supports Modrinth modpacks. The pack pins the Minecraft and Fabric Loader versions in `javaTarget` in [`src/client-artifacts.ts`](../src/client-artifacts.ts). The bundle stops if the client JARs depend on another Minecraft version. Managed Prism instance names and the integration test server use the same Minecraft version.

## Bundled Bedrock resources

[`bedrock-assets.json`](../bedrock-assets.json) pins the built-in resource bundle to Bedrock 1.26.60.5.
[`assets/bedrock/1.26.60.5/`](../assets/bedrock/1.26.60.5/) holds the tracked archives, their checksum manifest, and the native copyright notice.
The add-on JAR contains these resources once, as described in [the shared image bundle](#share-images-with-the-core).
Runtime loading uses these resources without Store sign-in or a downloaded asset cache.

The core also embeds `assets/viabedrock/builtin_ui.zip` from the same versioned resource directory.
This tracked bundle contains native UI templates, textures, image metadata, font metadata, font faces, and bitmap font pages.
ViaProxy includes it through its core dependency. The Fabric add-on reads it from its embedded core JAR and does not repeat it.
The stack build verifies its version, checksum, required templates, textures, and referenced font faces.
Missing or incomplete assets stop the build. Each finished JAR must contain the exact verified bundle before publication.

The add-on also embeds `assets/viafabricplus-bedrock/builtin_oreui.zip` for the OreUI screen port.
It contains the gameplay stylesheet, OpenType and TrueType faces, animation images, and OreUI translations from the same game version.
Its generated `oreui.json` records the stylesheet's font families, variants, and explicit `coh-font-sdf:off` declarations.
Faces without that property retain `default` in the descriptor.
The descriptor also lists the acquired GIF paths. Image access requires a registered path and returns a copy of its bytes.
These resources remain separate from classic JSON UI font registrations and their display transform.
The build verifies the bundle's checksum, referenced faces, and languages before and after packaging.
See [compatibility status](bedrock-coverage.md) for rendering support.

To regenerate the bundle from a matching installed game, run:

```bash
bun scripts/bundle-bedrock-assets.ts /path/to/bedrock-game 1.26.60.5
bun scripts/bundle-bedrock-ui.ts /path/to/bedrock-game 1.26.60.5 .stackanvil/builtin_ui.zip
bun scripts/bundle-bedrock-oreui.ts /path/to/bedrock-game 1.26.60.5 .stackanvil/builtin_oreui.zip
```

The game directory must contain `data/resource_packs/`.
The extractor checks the target vanilla manifest, expands native BR archives, and preserves file contents and paths.
It selects persona resources and stable vanilla models, animations, controllers, images, sounds, particles, and text.
It uses original `.bol-orig` files when an installation keeps patched copies beside them.

The UI extractor requires a fresh output path and writes a checksum manifest beside the ZIP.
After reviewing the output, replace both tracked files under `assets/bedrock/1.26.60.5/assets/viabedrock/`.
Keep the native copyright notice in the ZIP. Commit both files with changes to the version pin.

The OreUI extractor also reads `data/gui/dist/hbui/` and `data/resource_packs/oreui/`.
It keeps the original font, stylesheet, animation, and language bytes and prefers loose language files over archive entries.
Review its preview and copy the ZIP and checksum manifest to `assets/bedrock/1.26.60.5/assets/viafabricplus-bedrock/`.
It uses the same requirement for fresh output paths as the JSON UI extractor.

The normal stack build also derives an image-only bundle from the verified add-on archives.
It writes `builtin_images.zip` under `.stackanvil/builtin-images/<version>/` and embeds it in the core.
ViaProxy receives the same native images through that dependency.
Server images and atlases keep priority over these built-in layers.
The build verifies the exact image bundle in the core and both consumers.
Core builds require the full pinned native archive inputs alongside the tracked UI bundle.
Generated image bundles remain outside Git.

### Share images with the core

The add-on's embedded core JAR already carries `builtin_images.zip` and `builtin_ui.zip`.
A full stack build therefore gives the add-on a prepared resource directory under `.stackanvil/addon-assets/<version>/`.
It repacks the add-on archives without the images in the core bundle and leaves out the core UI bundle.
Its manifest keeps the complete library totals and records the image bundle's SHA-256 and counts.
At runtime, the add-on reads the remaining archives, then the core image bundle, and requires the same totals.
The build checks that the finished JAR holds the complete library this way and no top-level `assets/viabedrock/` copy.

`bun run pr` builds use the tracked directory unchanged, because upstream ViaBedrock does not carry these bundles.

The normal stack build passes the resource directory to Gradle.
For a direct add-on Gradle build, pass `-PbedrockBuiltinAssets=/absolute/path/to/assets/bedrock/1.26.60.5`.
That self-contained directory works with any core, but repeats the core images and UI bundle in the JAR.
Also pass `-PbedrockOreUiShaper=/absolute/path/to/oreui-shaper-resources` for the [OreUI shaping libraries](../native/oreui-shaper/README.md).
For a direct core Gradle build, pass `-PbedrockBuiltinUi=/absolute/path/to/assets/bedrock/1.26.60.5/assets/viabedrock/builtin_ui.zip`.
To include the required image bundle in a direct core Gradle build, also pass `-PbedrockBuiltinImages=/absolute/path/to/builtin_images.zip`.
When changing the target Bedrock version, regenerate the bundle and update the pin together.
The runtime rejects bundles that do not match ViaBedrock's target version.

## Run a local server

Download the [official Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock), extract it outside this repository, and set `BEDROCK_SERVER_HOME` to that directory. Then run:

```bash
bun run dev:setup
bun run lab doctor
bun run lab up
```

The lab starts a separate headless Wayland display, the Bedrock server, ViaProxy, and the PrismLauncher instance. Both game clients stay off your active desktop, so their input cannot interrupt another game. The lab routes their audio to a silent sink and sets each game's master volume to zero. It detects services that you already started and leaves them under your control. `bun run lab down` stops only lab managed processes. `bun run lab status` lists the current processes. By default, ViaProxy listens on `127.0.0.1:25568` and connects to the local Bedrock server on `127.0.0.1:19132`. Set `STACKANVIL_VIAPROXY_BIND` and `STACKANVIL_BEDROCK_TARGET` to change these addresses.

Install PrismLauncher as a Flatpak for `bun run lab java start`. Run `bun run lab java prepare` to create the local test instance with the built mods.

For HTTPS capture, client control, credentials, and JVM diagnostics, see the [capture lab guide](capture-lab.md). Bedrock gameplay packets use UDP and are outside the HTTPS proxy capture.

For Windows and macOS launcher tests on a Linux host, use the [manual platform testing guide](platform-testing.md). Run `bun run lab vm doctor` to inspect Quickemu and KVM support. The guide covers private guest installation, input, screenshots, artifact transfer, and graphics limits.

## Run join integration tests

StackAnvil uses NetherNet for all Bedrock connections. The [Geyser fixture](bedrock-test-packs.md#geyser-fixtures) has no supported live route.

The offline Geyser fixture installs the checksum-pinned [Boar extension](https://github.com/opencollab-incubator/Boar) from `integration/geyser.json`.
Startup requires its enabled-extension message before client tests begin.
Keep its checks enabled and do not grant test players `boar.exempt`.
Boar provides an additional movement check; a clean result does not prove native movement parity.
The suite also enables `server-authoritative-movement-strict=true` in its owned BDS copies.
It does not restart an external server or change its running configuration.

Movement verification must cover direct and ViaProxy connections, with a native client baseline.
Record walking, sprinting, sneaking, jumps, falls, collisions, steps, climbing, fluids, effects, knockback, vehicles, latency, and corrections.
Retain server prediction errors, setbacks, violations, and disconnects as failures to investigate.
Do not disable checks to make a case pass.

The local join suite starts fresh servers on temporary ports. It launches the Java and Bedrock clients on a private Wayland display with silent audio. Each case waits for a player spawn in the server log. Then it checks that the client stays connected for 20 seconds. Each Java route runs with plain StackAnvil and with the full Fabulously Optimized modpack. The Java server case also summons a vanilla interaction entity near the player. The suite downloads the target Minecraft server from Mojang and checks its published hash.

The test modpack is the official Fabulously Optimized 15.0.0 alpha.3 `.mrpack` for Minecraft 26.3. The archive and its version lock are in [`integration/modpacks/`](../integration/modpacks/). The installer reads the pack manifest, downloads every client file, checks its SHA-512 hash, and installs the pack overrides. It adds the patched StackAnvil mods to a separate Prism instance. The pack's own Fabric loader version is used. The plain instance stays separate so the tests can catch pack-specific failures. Fabulously Optimized includes Iris, Sodium, and other client mods. The pack is under its [BSD-3-Clause license](../integration/modpacks/FABULOUSLY-OPTIMIZED-LICENSE.md).

Install Flatpak PrismLauncher and sign in to a Java account in PrismLauncher. Install BedrockOnLinux and sign in to a Bedrock account for the native case. Run `bun run build all` to build ViaProxy with the stack. Point the test at compatible Bedrock server installations:

```bash
BEDROCK_SERVER_HOME=/path/to/bedrock-1.26.60 \
STACKANVIL_JAVA_BEDROCK_SERVER_HOME=/path/to/bedrock-supported-by-viaproxy \
bun run test:integration
```

`BEDROCK_SERVER_HOME` is used for the native client. `STACKANVIL_JAVA_BEDROCK_SERVER_HOME` is used for Java through ViaProxy. You can omit the second variable when your ViaProxy build supports the same Bedrock version as the native client. The lab and join suite use the verified `dist/viaproxy/` artifact by default. Set `VIAPROXY_JAR` to select a different ViaProxy build. Use `--route java-java`, `--route java-bedrock`, or `--route bedrock-bedrock` to run one route. Use `--reuse-build` after a successful build when only changing the test runner.

Use `--modpack-only` to skip the plain Java cases. To update the pinned modpack, run `bun run integration:modpack:update`. You can select a specific 26.3 release with `bun run integration:modpack:update --version VERSION`. Commit both the `.mrpack` and its JSON lock file. Run the join suite after an update.

Use `--entity-probe`, `--gameplay-probe`, or `--resource-pack-probe` with `--route java-bedrock` to run the Bedrock probes. Select individual gameplay cases with `--gameplay-cases case-one,case-two`. See [the Bedrock probe guide](bedrock-test-packs.md) for case IDs, assertions, and known limits.

The suite creates managed Prism instances named `StackAnvil Integration 26.3` and `Fabulously Optimized StackAnvil Integration 26.3`. It leaves your other instances alone. Server data and logs stay under `.stackanvil/integration/`. Native screenshots and HTTPS flows stay under `.stackanvil/captures/`. The test removes its temporary Bedrock server entry and stops only processes it started. The full join suite needs signed-in game clients. GitHub hosted CI runs the tooling tests and build, but does not run account-based game joins.

To test with shaders, add `--shaders` to the join command:

```bash
bun run test:integration -- --route java-bedrock --modpack-only --shaders --reuse-build
```

The shader run uses the full Fabulously Optimized pack with Iris 1.11.7 and Complementary Reimagined r5.9.3.
These versions match [the macOS rendering report](https://mclo.gs/er8RPm6).
The files and SHA-512 checksums are pinned in `integration/modpacks/bedrock-shaders.json`.
The installer replaces the pack's Iris version, so the instance contains one Iris JAR.

The profile enables the shader's High preset, entity shadows, bloom, light shafts, and water reflections.
LambDynamicLights uses Fancy mode with entity and held-item lights enabled.
Both the live configuration and first-launch defaults enable these features.
This provides a Java approximation for comparisons with Vibrant Visuals; it does not reproduce Bedrock's renderer or the Apple GPU driver.

To prepare the profile without a server join, use:

```bash
bun run integration:graphics:prepare
```

This command requires the current client builds in `dist/`.
It creates `Fabulously Optimized Shaders StackAnvil Integration 26.3` in Prism.
The standard Fabulously Optimized run explicitly disables shaders.
The shader run fails if Iris does not activate the pinned pack or reports missing Bedrock pipeline overrides.
A successful join alone does not prove correct geometry.
Use [a recorded scene replay](server-replay.md) to exercise custom actors and geometry skins.

## Try native UI scale offsets

Development builds expose a separate scale preference for supported native presentations.

1. Open the Bedrock tab in ViaFabricPlus settings.
2. Select `Bedrock UI scale offset` to cycle through the available offsets.
3. Open a supported native screen to inspect the result.

`Default (0)` keeps the native desktop default.
Negative offsets make native presentations smaller, within the limits of the current window.
The preference remains selected when a small window limits its visible effect.
Java GUI scale remains separate.
The same viewport supplies native drawing and pointer coordinates.
