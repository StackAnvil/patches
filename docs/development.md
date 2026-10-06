# Development environment

Use this guide to build the four patch targets with pinned ViaFabricPlus and start a local Bedrock test server.

## Build the stack

Install Bun, Git, JDK 17, and JDK 25. ViaBedrock, ViaProxy, and the Bedrock add-on require Java 25. CubeConverter still builds with JDK 17.

Set `STACKANVIL_JAVA_17` and `STACKANVIL_JAVA_25` if the JDKs are not in the standard paths.

Install Xvfb, `xauth`, and `pactl` for focus free local tests. On Fedora, the packages include `xorg-x11-server-Xvfb`, `xorg-x11-xauth`, and `pulseaudio-utils`. Then run:

```bash
bun install --frozen-lockfile
bun run build all
bun run bundle
```

`targets.json` records the build order. ViaBedrock uses the `vv-json` branch of `oryxel1/CubeConverter`, as its upstream build does. ViaProxy embeds the ViaBedrock build from this stack. The build tool publishes each JAR and POM to `.stackanvil/maven/` and passes that path to Gradle. The setup patches use the local artifacts when the path is present. Direct Gradle builds use the upstream dependencies. Artifacts and manifests go to `dist/`. The PrismLauncher ZIP goes to `dist/prism/`.

The add-on setup includes one compatibility patch for the current ViaBedrock API. The upstream PR branch does not include setup patches.

## Bundled Bedrock resources

[`bedrock-assets.json`](../bedrock-assets.json) pins the built-in resource bundle to Bedrock 1.26.51.1.
The build adds [`assets/bedrock/1.26.51.1/`](../assets/bedrock/1.26.51.1/) to the add-on's resources.
The JAR contains five archives, their checksum manifest, and the native copyright notice.
Runtime loading uses these resources without Store sign-in or a downloaded asset cache.

To regenerate the bundle from a matching installed game, run:

```bash
bun scripts/bundle-bedrock-assets.ts /path/to/bedrock-game 1.26.51.1
```

The game directory must contain `data/resource_packs/`.
The extractor checks the target vanilla manifest, expands native BR archives, and preserves file contents and paths.
It selects persona resources and stable vanilla models, animations, controllers, images, sounds, particles, and text.
It uses original `.bol-orig` files when an installation keeps patched copies beside them.

The normal stack build passes the resource directory to Gradle.
For a direct add-on Gradle build, pass `-PbedrockBuiltinAssets=/absolute/path/to/assets/bedrock/1.26.51.1`.
When changing the target Bedrock version, regenerate the bundle and update the pin together.
The runtime rejects bundles that do not match ViaBedrock's target version.

## Run a local server

Download the [official Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock), extract it outside this repository, and set `BEDROCK_SERVER_HOME` to that directory. Then run:

```bash
bun run dev:setup
bun run lab doctor
bun run lab up
```

The lab starts a separate Xvfb display, the Bedrock server, ViaProxy, and the PrismLauncher instance. Both game clients stay off your active desktop, so their input cannot interrupt another game. The lab routes their audio to a silent sink and sets each game's master volume to zero. It detects services that you already started and leaves them under your control. `bun run lab down` stops only lab managed processes. `bun run lab status` lists the current processes. By default, ViaProxy listens on `127.0.0.1:25568` and connects to the local Bedrock server on `127.0.0.1:19132`. Set `STACKANVIL_VIAPROXY_BIND` and `STACKANVIL_BEDROCK_TARGET` to change these addresses.

PrismLauncher must be installed as a Flatpak for `bun run lab java start`. You can also import the ZIP from `dist/prism/` into another PrismLauncher installation. The ZIP contains Minecraft and Fabric version metadata, the pinned upstream ViaFabricPlus JAR, and the patched Bedrock add-on JAR. It does not contain the game itself or an account.

For HTTPS capture, client control, credentials, and JVM diagnostics, see the [capture lab guide](capture-lab.md). Bedrock gameplay packets use UDP and are outside the HTTPS proxy capture.

For Windows and macOS launcher tests on a Linux host, use the [manual platform testing guide](platform-testing.md). Run `bun run lab vm doctor` to inspect Quickemu and KVM support. The guide covers private guest installation, input, screenshots, artifact transfer, and graphics limits.

## Run join integration tests

The Geyser fixture installs the checksum-pinned [Boar extension](https://github.com/opencollab-incubator/Boar) from `integration/geyser.json`.
Startup requires its enabled-extension message before client tests begin.
Keep its checks enabled and do not grant test players `boar.exempt`.
Boar provides an additional movement check; a clean result does not prove native movement parity.
The suite also enables `server-authoritative-movement-strict=true` in its owned BDS copies.
It does not restart an external server or change its running configuration.

Movement verification must cover direct and ViaProxy connections, with a native client baseline.
Record walking, sprinting, sneaking, jumps, falls, collisions, steps, climbing, fluids, effects, knockback, vehicles, latency, and corrections.
Retain server prediction errors, setbacks, violations, and disconnects as failures to investigate.
Do not disable checks to make a case pass.

The local join suite starts fresh servers on temporary ports. It launches the Java and Bedrock clients on a private Xvfb display with silent audio. Each case waits for a player spawn in the server log. Then it checks that the client stays connected for 20 seconds. Each Java route runs with plain StackAnvil and with the full Fabulously Optimized modpack. The Java server case also summons a vanilla interaction entity near the player. The suite downloads the Minecraft 26.3 server from Mojang and checks its published hash.

The test modpack is the official Fabulously Optimized 15.0.0 alpha.3 `.mrpack` for Minecraft 26.3. The archive and its version lock are in [`integration/modpacks/`](../integration/modpacks/). The installer reads the pack manifest, downloads every client file, checks its SHA-512 hash, and installs the pack overrides. It adds the patched StackAnvil mods to a separate Prism instance. The pack's own Fabric loader version is used. The plain instance stays separate so the tests can catch pack-specific failures. Fabulously Optimized includes Iris, Sodium, and other client mods. The pack is under its [BSD-3-Clause license](../integration/modpacks/FABULOUSLY-OPTIMIZED-LICENSE.md).

Install Flatpak PrismLauncher and sign in to a Java account in PrismLauncher. Install BedrockOnLinux and sign in to a Bedrock account for the native case. Run `bun run build all` to build ViaProxy with the stack. Point the test at compatible Bedrock server installations:

```bash
BEDROCK_SERVER_HOME=/path/to/bedrock-1.26.51 \
STACKANVIL_JAVA_BEDROCK_SERVER_HOME=/path/to/bedrock-supported-by-viaproxy \
bun run test:integration
```

`BEDROCK_SERVER_HOME` is used for the native client. `STACKANVIL_JAVA_BEDROCK_SERVER_HOME` is used for Java through ViaProxy. You can omit the second variable when your ViaProxy build supports the same Bedrock version as the native client. The lab and join suite use the verified `dist/viaproxy/` artifact by default. Set `VIAPROXY_JAR` to select a different ViaProxy build. Use `--route java-java`, `--route java-bedrock`, or `--route bedrock-bedrock` to run one route. Use `--reuse-build` after a successful build when only changing the test runner.

Use `--modpack-only` to skip the plain Java cases. To update the pinned modpack, run `bun run integration:modpack:update`. You can select a specific 26.3 release with `bun run integration:modpack:update --version VERSION`. Commit both the `.mrpack` and its JSON lock file. Run the join suite after an update.

Use `--entity-probe`, `--gameplay-probe`, or `--resource-pack-probe` with `--route java-bedrock` to run the Bedrock probes. Select individual gameplay cases with `--gameplay-cases case-one,case-two`. See [the Bedrock probe guide](bedrock-test-packs.md) for case IDs, assertions, and known limits.

The suite creates managed Prism instances named `StackAnvil Integration 26.3` and `Fabulously Optimized StackAnvil Integration 26.3`. It leaves your other instances alone. Server data and logs stay under `.stackanvil/integration/`. Native screenshots and HTTPS flows stay under `.stackanvil/captures/`. The test removes its temporary Bedrock server entry and stops only processes it started. The full join suite needs signed-in game clients. GitHub hosted CI runs the tooling tests and build, but does not run account-based game joins.

The renderer regression from [this client log](https://mclo.gs/r01cqUJ) was a cast from a vanilla entity render state to the Bedrock renderer's state. The feature patch now selects its renderer only for tracked Bedrock actors and accepts a vanilla state safely. A focused Java test calls that failure path directly. The Java server join case also runs with Fabulously Optimized and a vanilla interaction entity in view. The local lab sets SDL3 to use EGL so Iris can start with OpenGL on the private display.
