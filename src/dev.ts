import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
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
    const server = process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server");
    const launcher = process.env.BEDROCK_LAUNCHER ?? join(homedir(), "AppImages", "bedrockonlinux.appimage");
    const missing: string[] = [];
    if (!existsSync(join(server, "bedrock_server"))) missing.push("BEDROCK_SERVER_HOME: download the official Bedrock Dedicated Server and point this variable at its extracted directory (https://www.minecraft.net/en-us/download/server/bedrock)");
    if (!process.env.BEDROCK_DEVICE_HOST && !process.env.BEDROCK_CLIENT_COMMAND && !existsSync(launcher)) {
      missing.push("BEDROCK_LAUNCHER or BEDROCK_CLIENT_COMMAND: point to an installed Bedrock client, or set BEDROCK_DEVICE_HOST for a remote device");
    }
    if (!Bun.which("Xvfb") && !existsSync(join(toolsDir, "xvfb-root", "usr", "bin", "Xvfb"))) {
      missing.push("Xvfb: install xorg-x11-server-Xvfb so game automation cannot take focus from your desktop");
    }
    if (!Bun.which("xauth") || !Bun.which("pactl")) missing.push("xauth and pactl: required for the private display and silent audio sink");
    console.log(`ViaProxy: ${viaProxy}`);
    console.log(`mitmproxy: ${mitmdump}`);
    console.log("HTTPS capture: use bun run capture start and bun run capture launch. Bedrock gameplay uses a separate UDP path.");
    if (missing.length) return yield* Effect.fail(new Error(`Development setup needs:\n${missing.map((item) => `- ${item}`).join("\n")}`));
    console.log("Bedrock server and client are configured. Development setup is ready.");
  });
}
