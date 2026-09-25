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
