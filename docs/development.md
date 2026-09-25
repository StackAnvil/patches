# Development environment

Use this guide to build the four projects and start a local Bedrock test server.

## Build the stack

Install Bun, Git, JDK 17, and JDK 25. Set `STACKANVIL_JAVA_17` and `STACKANVIL_JAVA_25` if the JDKs are not in the standard paths. Install Xvfb, `xauth`, and `pactl` for focus free local tests. On Fedora, the packages include `xorg-x11-server-Xvfb`, `xorg-x11-xauth`, and `pulseaudio-utils`. Then run:

```bash
bun install --frozen-lockfile
bun run build all
bun run bundle
```

`targets.json` records the build graph. ViaBedrock uses the `vv-json` branch of `oryxel1/CubeConverter`, as its upstream build does. The build tool injects a private Gradle Maven repository and substitutes StackAnvil versions for downstream builds. It does not edit upstream build files for local dependency routing. Artifacts and manifests go to `dist/`. The PrismLauncher ZIP goes to `dist/prism/`.

The add-on build includes one downstream compatibility patch for the current ViaBedrock API. It is a custom patch, so it will not appear in the upstream PR branch.

## Run a local server

Download the [official Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock), extract it outside this repository, and set `BEDROCK_SERVER_HOME` to that directory. Then run:

```bash
bun run dev:setup
bun run lab doctor
bun run lab up
```

The lab starts a separate Xvfb display, the Bedrock server, ViaProxy, and the PrismLauncher instance. Both game clients stay off your active desktop, so their input cannot interrupt another game. The lab routes their audio to a silent sink and sets each game's master volume to zero. It detects services that you already started and leaves them under your control. `bun run lab down` stops only lab managed processes. `bun run lab status` lists the current processes. By default, ViaProxy listens on `127.0.0.1:25568` and connects to the local Bedrock server on `127.0.0.1:19132`. Set `STACKANVIL_VIAPROXY_BIND` and `STACKANVIL_BEDROCK_TARGET` to change these addresses.

PrismLauncher must be installed as a Flatpak for `bun run lab java start`. You can also import the ZIP from `dist/prism/` into another PrismLauncher installation. The ZIP contains Minecraft and Fabric version metadata plus the patched ViaFabricPlus and Bedrock add-on JARs. It does not contain the game itself or an account.

For HTTPS capture, client control, credentials, and JVM diagnostics, see the [capture lab guide](capture-lab.md). Bedrock gameplay packets use UDP and are outside the HTTPS proxy capture.

## Run join integration tests

The local join suite starts fresh servers on temporary ports. It launches the Java and Bedrock clients on a private Xvfb display with silent audio. Each case waits for a player spawn in the server log, then checks that the client stays connected and does not crash for 20 seconds. Java cases run once without Iris and once with Iris 1.11.6 and Sodium 0.9.2. The Java server case also summons a vanilla interaction entity near the player to exercise entity rendering. The suite downloads the Minecraft 26.3 server from Mojang and the pinned Iris and Sodium builds from Modrinth, then verifies their published hashes.

Install Flatpak PrismLauncher and sign in to a Java account in PrismLauncher. Install BedrockOnLinux and sign in to a Bedrock account for the native case. Run `bun run dev:setup` to get ViaProxy. Point the test at compatible Bedrock server installations:

```bash
BEDROCK_SERVER_HOME=/path/to/bedrock-1.26.51 \
STACKANVIL_JAVA_BEDROCK_SERVER_HOME=/path/to/bedrock-supported-by-viaproxy \
bun run test:integration
```

`BEDROCK_SERVER_HOME` is used for the native client. `STACKANVIL_JAVA_BEDROCK_SERVER_HOME` is used for Java through ViaProxy. You can omit the second variable when your ViaProxy build supports the same Bedrock version as the native client. Set `VIAPROXY_JAR` to select a different ViaProxy build. Use `--route java-java`, `--route java-bedrock`, or `--route bedrock-bedrock` to run one route. Use `--reuse-build` after a successful build when only changing the test runner.

The suite creates a managed Prism instance named `StackAnvil Integration 26.3`. It leaves your other instances alone. Server data and logs stay under `.stackanvil/integration/`. Native screenshots and HTTPS flows stay under `.stackanvil/captures/`. The test removes its temporary Bedrock server entry and stops only processes it started. The full join suite needs signed-in game clients, so the ordinary GitHub hosted CI job runs the tooling tests and build but does not claim to run account-based game joins.

The renderer regression from [this client log](https://mclo.gs/r01cqUJ) was a cast from a vanilla entity render state to the Bedrock renderer's state. The feature patch now selects its renderer only for tracked Bedrock actors and accepts a vanilla state safely. A focused Java test calls that failure path directly. The Java server join case also runs with Iris and a vanilla interaction entity in view. The local lab sets SDL3 to use EGL so Iris can start with OpenGL on the private display.
