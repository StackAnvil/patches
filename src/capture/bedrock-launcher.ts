import { spawn } from "node:child_process";
import { closeSync, existsSync, openSync, statSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { displayEnv } from "../lab/display.ts";
import { nativeWaylandEnvironment } from "../lab/wayland.ts";
import { root } from "../model.ts";

export const launcher =
  process.env["BEDROCK_LAUNCHER"] ??
  Bun.which("bedrock-on-linux") ??
  join(homedir(), "AppImages", "bedrockonlinux.appimage");
const extractedLauncher = join(root, ".stackanvil", "tools", "bedrock-on-linux");

export async function muteBedrockSettings(): Promise<void> {
  const users = join(
    homedir(),
    ".local",
    "share",
    "bedrock-on-linux",
    "compatdata",
    "pfx",
    "drive_c",
    "users",
    "steamuser",
    "AppData",
    "Roaming",
    "Minecraft Bedrock",
    "Users",
  );
  if (!existsSync(users)) return;
  for (const entry of await readdir(users, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+$/u.test(entry.name)) continue;
    const file = join(users, entry.name, "games", "com.mojang", "minecraftpe", "options.txt");
    if (!existsSync(file)) continue;
    const options = await readFile(file, "utf8");
    const muted = /^audio_main:.*$/mu.test(options)
      ? options.replace(/^audio_main:.*$/mu, "audio_main:0")
      : `${options}\naudio_main:0\n`;
    if (muted !== options) await writeFile(file, muted);
  }
}

/**
 * Starts the official client on the private display without the HTTPS proxy, for gameplay
 * comparisons and joins. Xbox Live and server joins then behave as in an ordinary installation.
 * The client runs as its own process group, so stop it with stopBedrockDirect.
 */
export async function launchBedrockDirect(
  logPath = join(root, ".stackanvil", "lab", "bedrock-direct.log"),
): Promise<{ pid: number; log: string }> {
  if (!existsSync(launcher)) throw new Error(`BedrockOnLinux launcher not found: ${launcher}`);
  const isolated = await displayEnv(true);
  if (!isolated) throw new Error("A direct launch requires the private display.");
  await muteBedrockSettings();
  const appDir = launcher.toLowerCase().endsWith(".appimage") ? await prepareLauncher() : undefined;
  await mkdir(dirname(logPath), { recursive: true, mode: 0o700 });
  const log = openSync(logPath, "a", 0o600);
  const child = spawn(
    appDir ? join(appDir, "usr", "python", "bin", "python3.12") : "python3",
    [
      join(root, "scripts", "bedrock-wayland.py"),
      appDir ? join(appDir, "usr", "bin", "bedrock-on-linux") : launcher,
      "play",
    ],
    {
      cwd: root,
      detached: true,
      stdio: ["ignore", log, log],
      env: {
        ...nativeWaylandEnvironment(isolated),
        ...(appDir ? { APPDIR: appDir, APPIMAGE: launcher } : {}),
      },
    },
  );
  closeSync(log);
  child.unref();
  if (!child.pid) throw new Error("Could not launch BedrockOnLinux.");
  return { pid: child.pid, log: logPath };
}

function groupAlive(pid: number): boolean {
  try {
    process.kill(-pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Ask the launcher's process group to exit, then kill whatever remains after the grace period. */
export async function stopBedrockDirect(pid: number, graceMs = 30_000): Promise<void> {
  if (!groupAlive(pid)) return;
  process.kill(-pid, "SIGTERM");
  for (const until = Date.now() + graceMs; Date.now() < until && groupAlive(pid);)
    await Bun.sleep(250);
  if (groupAlive(pid)) process.kill(-pid, "SIGKILL");
}

/** Extract the AppImage once and reuse it until the launcher file changes. */
export async function prepareLauncher(): Promise<string> {
  if (!existsSync(launcher)) throw new Error(`BedrockOnLinux launcher not found: ${launcher}`);
  if (!launcher.toLowerCase().endsWith(".appimage")) return launcher;
  const signature = `${statSync(launcher).size}:${statSync(launcher).mtimeMs}`;
  const marker = join(extractedLauncher, "source.txt");
  const appDir = join(extractedLauncher, "squashfs-root");
  if (
    existsSync(marker) &&
    existsSync(join(appDir, "usr", "python", "bin", "python3.12")) &&
    (await readFile(marker, "utf8")).trim() === signature
  )
    return appDir;
  await rm(extractedLauncher, { recursive: true, force: true });
  await mkdir(extractedLauncher, { recursive: true, mode: 0o700 });
  const log = openSync(join(extractedLauncher, "extract.log"), "a", 0o600);
  const child = spawn(launcher, ["--appimage-extract"], {
    cwd: extractedLauncher,
    stdio: ["ignore", log, log],
  });
  closeSync(log);
  const code = await new Promise<number | null>((resolveCode, reject) => {
    child.once("error", reject);
    child.once("close", resolveCode);
  });
  if (code !== 0 || !existsSync(join(appDir, "usr", "python", "bin", "python3.12"))) {
    throw new Error(
      `BedrockOnLinux extraction failed. Read ${join(extractedLauncher, "extract.log")}.`,
    );
  }
  await writeFile(marker, `${signature}\n`, { mode: 0o600 });
  return appDir;
}
