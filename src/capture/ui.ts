import { execFile } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { root } from "../model.ts";
import { displayEnv } from "../lab/display.ts";
import { captureUiEnvironment } from "./ui-environment.ts";

export interface WindowInfo {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
export type Client = "bedrock" | "java";
export type UiExecutor = (program: string, args: string[], cwd: string, env: NodeJS.ProcessEnv) => Promise<string>;
const execute = promisify(execFile);
const executeUi: UiExecutor = async (program, args, cwd, env) => {
  const { stdout } = await execute(program, args, { cwd, env, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trimEnd();
};

/** One UI session binds its display once and emits input without starting another Bun process. */
export function createCaptureUi(options: {
  captureDirectory?: () => Promise<string>;
  environment?: () => Promise<NodeJS.ProcessEnv | undefined>;
  desktopEnvironment?: NodeJS.ProcessEnv;
  execute?: UiExecutor;
} = {}) {
  const desktopEnvironment = options.desktopEnvironment ?? process.env;
  const uiEnvironment = captureUiEnvironment(options.environment ?? (() => displayEnv()), desktopEnvironment);
  const run = async (program: string, args: string[], cwd = root, env?: NodeJS.ProcessEnv) =>
    (options.execute ?? executeUi)(program, args, cwd, env ?? await uiEnvironment());
  const captureDirectory = options.captureDirectory ?? (async () => { throw new Error("Supply --output-dir for a screenshot outside a capture session."); });
  const nativeSource = join(root, "native", "capture-x11.c");
  const nativeBinary = join(root, ".stackanvil", "tools", "capture-x11");
  const gnomeRemote = join(root, "scripts", "gnome_remote.py");
  const checkId = (id: string) => {
    if (!/^[a-z0-9][a-z0-9-]{0,90}$/.test(id)) throw new Error("Use lowercase letters, digits, and hyphens for a screenshot name.");
  };

  async function compileUi(): Promise<void> {
    if (!(await uiEnvironment()).DISPLAY) throw new Error("Set DISPLAY to the game's X display.");
    await mkdir(join(root, ".stackanvil", "tools"), { recursive: true });
    if (!existsSync(nativeBinary) || statSync(nativeBinary).mtimeMs < statSync(nativeSource).mtimeMs) {
      await run("cc", ["-O2", "-Wall", "-Wextra", "-o", nativeBinary, nativeSource, "-lX11", "-lXtst"]);
    }
  }

  async function windows(): Promise<WindowInfo[]> {
    await compileUi();
    return JSON.parse(await run(nativeBinary, ["list"], root, await uiEnvironment())) as WindowInfo[];
  }

  async function chosenWindow(id?: string, client: Client = "bedrock"): Promise<WindowInfo> {
    const available = await windows();
    if (id) {
      const chosen = available.find((window) => window.id === id);
      if (chosen) return chosen;
      throw new Error(`Window ${id} is not visible. Run bun run capture ui list.`);
    }
    const matches = available.filter((window) => client === "bedrock"
      ? /^minecraft(?: for windows| bedrock)?$/i.test(window.title)
      : /^minecraft\*?\s/i.test(window.title));
    if (matches.length === 1) return matches[0]!;
    throw new Error(`Select the ${client} window with --window-id <id>. Run bun run capture ui list.`);
  }

  async function screenshot(name: string, windowId?: string, client?: Client, outputDir?: string): Promise<string> {
    checkId(name);
    const window = await chosenWindow(windowId, client);
    const directory = outputDir ? resolve(outputDir) : await captureDirectory();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const imagePath = join(directory, `${name}.png`);
    const ppmPath = join(directory, `${name}.ppm`);
    try {
      await run(nativeBinary, ["screenshot", window.id, ppmPath], root, await uiEnvironment());
      await run("ffmpeg", ["-loglevel", "error", "-y", "-i", ppmPath, imagePath]);
    } finally {
      await rm(ppmPath, { force: true });
    }
    return imagePath;
  }

  async function pixel(x: number, y: number, windowId?: string, client?: Client): Promise<string> {
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
      throw new Error("Pixel coordinates must be ratios between 0 and 1.");
    }
    const window = await chosenWindow(windowId, client);
    const localX = Math.floor(x * (window.width - 1));
    const localY = Math.floor(y * (window.height - 1));
    return run(nativeBinary, ["pixel", window.id, String(localX), String(localY)], root, await uiEnvironment());
  }

  async function click(x: number, y: number, windowId?: string, client?: Client, allowFocus = false,
    button: "left" | "right" = "left", durationMs?: number, doubleClick = false): Promise<void> {
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
      throw new Error("Click coordinates must be ratios between 0 and 1.");
    }
    if (durationMs !== undefined && (!Number.isInteger(durationMs) || durationMs < 1 || durationMs > 10_000)) {
      throw new Error("Mouse hold must be 1 to 10000 ms.");
    }
    const window = await chosenWindow(windowId, client);
    const localX = Math.floor(x * (window.width - 1));
    const localY = Math.floor(y * (window.height - 1));
    const env = await uiEnvironment();
    const isolated = env.STACKANVIL_UI_ISOLATED === "1";
    if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    if (!isolated && env.XDG_CURRENT_DESKTOP?.toLowerCase().includes("gnome")) {
      if (button !== "left" || durationMs !== undefined || doubleClick) {
        throw new Error("Right clicks, double clicks, and mouse holds require the private display on GNOME Wayland.");
      }
      await run("python3", [gnomeRemote, nativeBinary, "click", String(window.x + localX), String(window.y + localY)]);
    } else {
      await run(nativeBinary, durationMs === undefined
        ? [doubleClick ? "double-click" : "click", window.id, String(localX), String(localY), button]
        : ["mouse-hold", window.id, String(localX), String(localY), button, String(durationMs)], root, env);
    }
  }

  async function key(name: string, windowId?: string, client?: Client, allowFocus = false,
    durationMs?: number, doubleTap = false): Promise<void> {
    if (!/^[A-Za-z0-9_+]{1,32}$/.test(name)) throw new Error("Use a key name such as Escape, Return, Tab, or Control+b.");
    if (durationMs !== undefined && (!Number.isInteger(durationMs) || durationMs < 1 || durationMs > 10_000)) {
      throw new Error("Key hold must be 1 to 10000 ms.");
    }
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env.STACKANVIL_UI_ISOLATED === "1";
    if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    if (!isolated && env.XDG_CURRENT_DESKTOP?.toLowerCase().includes("gnome")) {
      if (doubleTap) throw new Error("Double key presses require the private display on GNOME Wayland.");
      if (durationMs !== undefined) throw new Error("Key holds require the private display on GNOME Wayland.");
      await run("python3", [gnomeRemote, nativeBinary, "key", name]);
    } else {
      await run(nativeBinary, durationMs === undefined
        ? [doubleTap ? "double-key" : "key", window.id, name]
        : ["key-hold", window.id, name, String(durationMs)], root, env);
    }
  }

  async function buttonHold(button: "left" | "right", durationMs: number, windowId?: string, client?: Client,
    allowFocus = false): Promise<void> {
    if (!Number.isInteger(durationMs) || durationMs < 1 || durationMs > 10_000) throw new Error("Button hold must be 1 to 10000 ms.");
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env.STACKANVIL_UI_ISOLATED === "1";
    if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
    if (!isolated && env.XDG_CURRENT_DESKTOP?.toLowerCase().includes("gnome")) {
      throw new Error("Button holds require the private display on GNOME Wayland.");
    }
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    await run(nativeBinary, ["button-hold", window.id, button, String(durationMs)], root, env);
  }

  async function typeText(value: string, windowId?: string, client?: Client, allowFocus = false): Promise<void> {
    if (!/^[a-z0-9 .-]{1,120}$/.test(value)) throw new Error("Text must contain 1 to 120 lowercase ASCII letters, digits, spaces, periods, or hyphens.");
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env.STACKANVIL_UI_ISOLATED === "1";
    if (!isolated && !allowFocus) throw new Error("Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.");
    await run(nativeBinary, ["type", window.id, value], root, env);
  }

  async function command(args: string[]): Promise<string> {
    const [prefix, action, ...input] = args;
    if (prefix !== "ui") throw new Error("Expected a capture UI command.");
    const windowId = input.indexOf("--window-id") >= 0 ? input[input.indexOf("--window-id") + 1] : undefined;
    if (input.includes("--window-id") && (!windowId || windowId.startsWith("--"))) throw new Error("--window-id needs an ID.");
    const clientInput = input.indexOf("--client") >= 0 ? input[input.indexOf("--client") + 1] : "bedrock";
    if (clientInput !== "bedrock" && clientInput !== "java") throw new Error("--client must be bedrock or java.");
    const client: Client = clientInput;
    const allowFocus = input.includes("--allow-focus");
    const outputDir = input.indexOf("--output-dir") >= 0 ? input[input.indexOf("--output-dir") + 1] : undefined;
    if (input.includes("--output-dir") && (!outputDir || outputDir.startsWith("--"))) throw new Error("--output-dir needs a directory.");
    switch (action) {
      case "list": return JSON.stringify(await windows(), null, 2);
      case "screenshot": if (!input[0]) throw new Error("Supply a screenshot name."); return screenshot(input[0], windowId, client, outputDir);
      case "pixel": return pixel(Number(input[0]), Number(input[1]), windowId, client);
      case "click":
      case "double-click": {
        if (input[2] && !input[2].startsWith("--") && input[2] !== "left" && input[2] !== "right") {
          throw new Error("Use left or right mouse button.");
        }
        await click(Number(input[0]), Number(input[1]), windowId, client, allowFocus,
          input[2] === "right" ? "right" : "left", undefined, action === "double-click");
        return "";
      }
      case "mouse-hold": {
        const button = input[2];
        if (button !== "left" && button !== "right") throw new Error("Use left or right mouse button.");
        await click(Number(input[0]), Number(input[1]), windowId, client, allowFocus, button, Number(input[3]));
        return "";
      }
      case "button-hold": {
        const button = input[0];
        if (button !== "left" && button !== "right") throw new Error("Use left or right mouse button.");
        await buttonHold(button, Number(input[1]), windowId, client, allowFocus);
        return "";
      }
      case "key": if (!input[0]) throw new Error("Supply a key name."); await key(input[0], windowId, client, allowFocus); return "";
      case "double-key": if (!input[0]) throw new Error("Supply a key name."); await key(input[0], windowId, client, allowFocus, undefined, true); return "";
      case "key-hold": if (!input[0]) throw new Error("Supply a key name."); await key(input[0], windowId, client, allowFocus, Number(input[1])); return "";
      case "type": if (!input[0]) throw new Error("Supply text."); await typeText(input[0], windowId, client, allowFocus); return "";
    }
    throw new Error("Usage: bun run capture ui <list|screenshot|pixel|click|double-click|mouse-hold|button-hold|key|double-key|key-hold|type>");
  }
  return { command, windows, chosenWindow, screenshot, pixel, click, key, buttonHold, typeText };
}
