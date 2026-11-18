import { waylandTool } from "./lab/wayland.ts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { Data, Effect } from "effect";
import { command } from "./process.ts";
import { root } from "./model.ts";
import { artifact } from "./client-artifacts.ts";
import { print } from "./output.ts";

/** The development machine lacks a required tool. */
class DevSetupError extends Data.TaggedError("DevSetupError")<{ readonly message: string }> {}

const toolsDir = join(root, ".stackanvil", "tools");

export const devSetup = Effect.fn("devSetup")(function* () {
  if (!Bun.which("git") || !Bun.which("java")) {
    return yield* new DevSetupError({ message: "Install Git and a JDK before running dev setup." });
  }
  yield* Effect.promise(() => mkdir(toolsDir, { recursive: true }));
  const viaProxy = yield* Effect.promise(() =>
    artifact("viaproxy").catch(() => "run bun run build viaproxy"),
  );
  const mitmdump = Bun.which("mitmdump") ?? join(toolsDir, "mitmproxy", "bin", "mitmdump");
  if (!existsSync(mitmdump)) {
    yield* command("python3", ["-m", "venv", join(toolsDir, "mitmproxy")], root);
    yield* command(join(toolsDir, "mitmproxy", "bin", "pip"), ["install", "mitmproxy"], root);
  }
  const server = process.env.BEDROCK_SERVER_HOME ?? join(homedir(), "bedrock-server");
  const launcher =
    process.env.BEDROCK_LAUNCHER ?? join(homedir(), "AppImages", "bedrockonlinux.appimage");
  const missing: string[] = [];
  if (!Bun.which("cargo")) missing.push("Cargo: install Rust to build the Wayland capture helper");
  if (!existsSync(join(server, "bedrock_server")))
    missing.push(
      "BEDROCK_SERVER_HOME: download the official Bedrock Dedicated Server and point this variable at its extracted directory (https://www.minecraft.net/en-us/download/server/bedrock)",
    );
  if (
    !process.env.BEDROCK_DEVICE_HOST &&
    !process.env.BEDROCK_CLIENT_COMMAND &&
    !existsSync(launcher)
  ) {
    missing.push(
      "BEDROCK_LAUNCHER or BEDROCK_CLIENT_COMMAND: point to an installed Bedrock client, or set BEDROCK_DEVICE_HOST for a remote device",
    );
  }
  for (const tool of ["sway", "swaymsg", "grim", "wf-recorder", "pactl"]) {
    if (!waylandTool(tool))
      missing.push(`${tool}: required for the private Wayland lab and silent capture`);
  }
  print(`ViaProxy: ${viaProxy}`);
  print(`mitmproxy: ${mitmdump}`);
  print(
    "HTTPS capture: use bun run capture start and bun run capture launch. Bedrock gameplay uses a separate UDP path.",
  );
  if (missing.length)
    return yield* new DevSetupError({
      message: `Development setup needs:\n${missing.map((item) => `- ${item}`).join("\n")}`,
    });
  print("Bedrock server and client are configured. Development setup is ready.");
});
