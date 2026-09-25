import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";
import { gh, command } from "./process.ts";
import { root } from "./model.ts";

const toolsDir = join(root, ".stackanvil", "tools");

export function devSetup() {
  return Effect.gen(function* () {
    if (!Bun.which("git") || !Bun.which("gh") || !Bun.which("java")) {
      return yield* Effect.fail(new Error("Install Git, GitHub CLI, and a JDK before running dev setup."));
    }
    yield* Effect.promise(() => mkdir(toolsDir, { recursive: true }));
    const viaProxy = join(toolsDir, "ViaProxy.jar");
    if (!existsSync(viaProxy)) {
      const release = JSON.parse(yield* gh(["release", "view", "--repo", "ViaVersion/ViaProxy", "--json", "tagName,assets"], root)) as { tagName: string; assets: { name: string }[] };
      const asset = release.assets.find(({ name }) => /^ViaProxy-.*\.jar$/.test(name) && !name.includes("java8"));
      if (!asset) return yield* Effect.fail(new Error("No supported ViaProxy release JAR found."));
      yield* gh(["release", "download", "--repo", "ViaVersion/ViaProxy", "--pattern", asset.name, "--dir", toolsDir], root)
        .pipe(Effect.catchAll(() => command("curl", ["-fL", "--retry", "3", "--retry-all-errors", "-o", viaProxy,
          `https://github.com/ViaVersion/ViaProxy/releases/download/${release.tagName}/${encodeURIComponent(asset.name)}`], root)));
      if (!existsSync(viaProxy)) yield* Effect.promise(() => Bun.write(viaProxy, Bun.file(join(toolsDir, asset.name))));
    }
    const mitmdump = Bun.which("mitmdump") ?? join(toolsDir, "mitmproxy", "bin", "mitmdump");
    if (!existsSync(mitmdump)) {
      yield* command("python3", ["-m", "venv", join(toolsDir, "mitmproxy")], root);
      yield* command(join(toolsDir, "mitmproxy", "bin", "pip"), ["install", "mitmproxy"], root);
    }
    const server = process.env.BEDROCK_SERVER_HOME;
    const client = process.env.BEDROCK_CLIENT_COMMAND ?? process.env.BEDROCK_DEVICE_HOST;
    const missing: string[] = [];
    if (!server || !existsSync(join(server, "bedrock_server"))) missing.push("BEDROCK_SERVER_HOME: download the official Bedrock Dedicated Server and point this variable at its extracted directory (https://www.minecraft.net/en-us/download/server/bedrock)");
    if (!client) missing.push("BEDROCK_CLIENT_COMMAND or BEDROCK_DEVICE_HOST: provide an installed Bedrock client or device to test with");
    console.log(`ViaProxy: ${viaProxy}`);
    console.log(`mitmproxy: ${mitmdump}`);
    console.log("HTTPS capture: run mitmweb, point only your test client at its proxy, and trust its local test certificate on that client. Bedrock gameplay uses a separate UDP path.");
    if (missing.length) return yield* Effect.fail(new Error(`Development setup needs:\n${missing.map((item) => `- ${item}`).join("\n")}`));
    console.log("Bedrock server and client are configured. Development setup is ready.");
  });
}
