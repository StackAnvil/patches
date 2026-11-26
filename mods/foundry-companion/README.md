# Foundry companion

This Fabric mod starts [Bedrock Foundry](https://github.com/StackAnvil/BedrockFoundry) servers from Minecraft Java Edition and joins them through the StackAnvil Bedrock add-on. It needs Bedrock Foundry 0.2.0 or newer. It adds **Bedrock Foundry** to ViaFabricPlus' server lists. The [player guide](https://stackanvil.pistonmaster.net/getting-started/) describes its use.

The mod is StackAnvil source, not a patch target. `bun run build all` builds it after the add-on, against the ViaFabricPlus and ViaBedrock builds from the same run. The client modpack, the Prism bundle, and each release include it.

## Foundry contract

The mod runs the `bedrock-foundry` command line and never reads Foundry's files:

- `server list --json` lists the servers.
- `server run ID --json` starts one and prints JSON Lines `log`, `ready`, and `stopped` events. The mod joins the address in `ready`.
- Closing the command's input stops BDS. The mod stops a server this way and never kills Foundry, because BDS would then keep running without an owner. The operating system also closes the input when the game exits or crashes.

Foundry locks its data directory while it runs a server. The mod therefore keeps the last server list and disables listing and the desktop app until the server stops.

## Build and test alone

Build the stack first, so `.stackanvil/maven` holds the pinned ViaFabricPlus and the built ViaBedrock. Then run from this directory with a Java 25 JDK:

```bash
./gradlew build -PstackanvilMavenRepo=../../.stackanvil/maven \
  -PstackanvilViaFabricPlusVersion=<version> -PstackanvilViaBedrockVersion=<version>
```

Use the versions in `dist/viafabricplus-bedrock/manifest.json`. The unit tests run a fake `bedrock-foundry` script and need a POSIX shell.
