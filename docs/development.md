# Development environment

This guide prepares a local test setup. It checks for a Bedrock client, Bedrock Dedicated Server, ViaProxy, and an HTTPS capture tool.

## Prepare the tools

Install Bun, Git, the GitHub CLI, and a JDK. Use JDK 25 for ViaFabricPlus and viafabricplus-bedrock. Use a compatible JDK for the other two projects.

Download the [official Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock) for your system. Extract it outside this repository. Install a Bedrock client on a supported device.

Set these variables before you run the setup command:

```bash
export BEDROCK_SERVER_HOME=/path/to/bedrock-server
export BEDROCK_DEVICE_HOST=192.0.2.10
bun run dev:setup
```

Use `BEDROCK_CLIENT_COMMAND` instead of `BEDROCK_DEVICE_HOST` when the client runs on this computer. The setup command downloads ViaProxy from its official GitHub release. It installs mitmproxy in an ignored Python environment when `mitmdump` is not already present. It stops with a clear message if the server or client is missing.

## Test a build

Run `bun run build <project>`. Start the Bedrock server from `BEDROCK_SERVER_HOME`. Start the patched mod or proxy with the JAR from `dist/<project>/`. Use a separate test account and world. Test the behavior changed by the patch, then test a nearby unchanged behavior.

ViaProxy can bridge a Java client to Bedrock. Its [usage guide](https://github.com/ViaVersion/ViaProxy) lists the CLI and configuration modes. Some account or NetherNet paths still need live credentials and cannot be tested with offline mode.

## Capture traffic

Start mitmweb from `.stackanvil/tools/mitmproxy/bin/mitmweb` or your system install. Route only the test client's HTTPS traffic through it. Trust the mitmproxy certificate on that test client when you need to inspect TLS traffic.

Bedrock game packets use a separate UDP path. Use protocol logs or a packet capture tool for those packets. Never commit raw traffic captures or account credentials.
