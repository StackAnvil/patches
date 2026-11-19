import { waylandToolEnvironment } from "../lab/wayland.ts";
import { spawn } from "node:child_process";
import { chmod, link, mkdir, mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Schema } from "effect";
import { errorCode, parseJson } from "../guards.ts";
import { root } from "../model.ts";
import { displayEnv } from "../lab/display.ts";
import { captureUiEnvironment } from "./ui-environment.ts";
import { createCaptureWaylandBuilder } from "./native.ts";
import { execFileAsync as execute } from "../process.ts";

export interface WindowInfo {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
const bedrockTitle = /^minecraft(?: for windows| bedrock)?$/iu;
const WindowListSchema = Schema.mutable(
  Schema.Array(
    Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      x: Schema.Finite,
      y: Schema.Finite,
      width: Schema.Finite,
      height: Schema.Finite,
    }),
  ),
);
export type Client = "bedrock" | "java";
export interface DragPoint {
  x: number;
  y: number;
}
export type UiExecutor = (
  program: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
) => Promise<string>;
const executeUi: UiExecutor = async (program, args, cwd, env) => {
  const { stdout } = await execute(program, args, { cwd, env, maxBuffer: 16 * 1024 * 1024 });
  return stdout.trimEnd();
};

/** Runs a long-lived helper until the caller interrupts it. */
export type UiRecorder = (
  program: string,
  args: string[],
  env: NodeJS.ProcessEnv,
) => { stop: () => Promise<void> };

const spawnRecorder: UiRecorder = (program, args, env) => {
  const child = spawn(program, args, { cwd: root, env, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk: Buffer) => {
    stderr = (stderr + chunk.toString()).slice(-4000);
  });
  const exited = new Promise<number | null>((done) => {
    child.once("exit", (code) => {
      done(code);
    });
  });
  return {
    stop: async () => {
      child.kill("SIGINT");
      const code = await exited;
      if (code !== 0) throw new Error(`The window recorder failed: ${stderr.trim() || code}`);
    },
  };
};

const checkId = (id: string) => {
  if (!/^[a-z0-9][a-z0-9-]{0,90}$/u.test(id))
    throw new Error("Use lowercase letters, digits, and hyphens for a screenshot name.");
};

/** One UI session binds its display once and emits input without starting another Bun process. */
export function createCaptureUi(
  options: {
    captureDirectory?: () => Promise<string>;
    environment?: () => Promise<NodeJS.ProcessEnv | undefined>;
    desktopEnvironment?: NodeJS.ProcessEnv;
    execute?: UiExecutor;
    prepareNative?: (env: NodeJS.ProcessEnv) => Promise<string>;
    sleep?: (ms: number) => Promise<void>;
    record?: UiRecorder;
  } = {},
) {
  const sleep = options.sleep ?? ((ms: number) => Bun.sleep(ms));
  const desktopEnvironment = options.desktopEnvironment ?? process.env;
  const uiEnvironment = captureUiEnvironment(
    options.environment ?? (() => displayEnv()),
    desktopEnvironment,
  );
  const run = async (program: string, args: string[], cwd = root, env?: NodeJS.ProcessEnv) =>
    (options.execute ?? executeUi)(
      program,
      args,
      cwd,
      waylandToolEnvironment(env ?? (await uiEnvironment())),
    );
  const captureDirectory =
    options.captureDirectory ??
    (() =>
      Promise.reject(new Error("Supply --output-dir for a screenshot outside a capture session.")));
  const prepareNative =
    options.prepareNative ??
    createCaptureWaylandBuilder(async (args, cwd, env) => {
      await run("cargo", args, cwd, env);
    });
  let nativeBinary: string;

  async function compileUi(): Promise<void> {
    if (!(await uiEnvironment())["WAYLAND_DISPLAY"])
      throw new Error("Set WAYLAND_DISPLAY to the game's native display.");
    nativeBinary = await prepareNative(await uiEnvironment());
  }

  async function windows(): Promise<WindowInfo[]> {
    await compileUi();
    return parseJson(
      WindowListSchema,
      await run(nativeBinary, ["list"], root, await uiEnvironment()),
    );
  }

  async function chosenWindow(id?: string, client: Client = "bedrock"): Promise<WindowInfo> {
    const available = await windows();
    if (id) {
      const chosen = available.find((window) => window.id === id);
      if (chosen) return chosen;
      throw new Error(`Window ${id} is not visible. Run bun run capture ui list.`);
    }
    const matches = available.filter((window) =>
      client === "bedrock"
        ? bedrockTitle.test(window.title)
        : /^minecraft\*?\s/iu.test(window.title),
    );
    const [match] = matches;
    if (match && matches.length === 1) return match;
    if (matches.length === 0)
      throw new Error(
        `No visible ${client} window is open on this display. Check that the client is still running and read its log.`,
      );
    throw new Error(
      `${matches.length} ${client} windows match (${matches.map((window) => window.id).join(", ")}). Select one with --window-id <id>. Run bun run capture ui list.`,
    );
  }

  async function screenshot(
    name: string,
    windowId?: string,
    client?: Client,
    outputDir?: string,
  ): Promise<string> {
    checkId(name);
    const window = await chosenWindow(windowId, client);
    const directory = outputDir ? resolve(outputDir) : await captureDirectory();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const imagePath = join(directory, `${name}.png`);
    const temporary = await mkdtemp(join(directory, ".capture-"));
    const ppmPath = join(temporary, "capture.ppm");
    const converted = join(temporary, "capture.png");
    try {
      await run(nativeBinary, ["screenshot", window.id, ppmPath], root, await uiEnvironment());
      await run("ffmpeg", ["-loglevel", "error", "-n", "-i", ppmPath, converted]);
      await chmod(converted, 0o600);
      // Publish only a complete private image, without replacing an earlier capture.
      try {
        await link(converted, imagePath);
      } catch (error) {
        if (errorCode(error) === "EEXIST")
          throw new Error(`Screenshot ${name}.png already exists. Choose another name.`, {
            cause: error,
          });
        throw error;
      }
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
    return imagePath;
  }

  /** Records one window of the private display for a bounded time, without a capture session. */
  async function record(
    name: string,
    seconds: number,
    fps = 30,
    windowId?: string,
    client?: Client,
    outputDir?: string,
  ): Promise<string> {
    checkId(name);
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 120)
      throw new Error("Record 1 to 120 seconds.");
    if (!Number.isInteger(fps) || fps < 1 || fps > 120)
      throw new Error("Video frame rate must be an integer from 1 to 120.");
    if (!outputDir) throw new Error("Supply --output-dir for a recording.");
    const env = await uiEnvironment();
    if (env["STACKANVIL_UI_ISOLATED"] !== "1")
      throw new Error("Recording requires the private display so your desktop is never captured.");
    const window = await chosenWindow(windowId, client);
    const directory = resolve(outputDir);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const file = join(directory, `${name}.mp4`);
    // The helper refuses to replace an existing file.
    const recorder = (options.record ?? spawnRecorder)(
      nativeBinary,
      ["record", window.id, String(fps), file],
      waylandToolEnvironment(env),
    );
    await sleep(seconds * 1000);
    await recorder.stop();
    return file;
  }

  async function pixel(x: number, y: number, windowId?: string, client?: Client): Promise<string> {
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
      throw new Error("Pixel coordinates must be ratios between 0 and 1.");
    }
    const window = await chosenWindow(windowId, client);
    const localX = Math.floor(x * (window.width - 1));
    const localY = Math.floor(y * (window.height - 1));
    return run(
      nativeBinary,
      ["pixel", window.id, String(localX), String(localY)],
      root,
      await uiEnvironment(),
    );
  }

  async function move(x: number, y: number, windowId?: string, client?: Client): Promise<void> {
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1))
      throw new Error("Pointer coordinates must be ratios between 0 and 1.");
    const env = await uiEnvironment();
    if (env["STACKANVIL_UI_ISOLATED"] !== "1")
      throw new Error("Pointer positioning requires the private Wayland display.");
    const window = await chosenWindow(windowId, client);
    await run(
      nativeBinary,
      [
        "move",
        window.id,
        String(Math.floor(x * (window.width - 1))),
        String(Math.floor(y * (window.height - 1))),
      ],
      root,
      env,
    );
  }

  async function look(dx: number, dy: number, windowId?: string, client?: Client): Promise<void> {
    if (![dx, dy].every((value) => Number.isInteger(value) && Math.abs(value) <= 2000))
      throw new Error("Look deltas must be integers within 2000 pixels.");
    const env = await uiEnvironment();
    if (env["STACKANVIL_UI_ISOLATED"] !== "1")
      throw new Error("Relative pointer motion requires the private Wayland display.");
    const window = await chosenWindow(windowId, client);
    await run(nativeBinary, ["look", window.id, String(dx), String(dy)], root, env);
  }

  async function click(
    x: number,
    y: number,
    windowId?: string,
    client?: Client,
    allowFocus = false,
    button: "left" | "right" = "left",
    durationMs?: number,
    doubleClick = false,
  ): Promise<void> {
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
      throw new Error("Click coordinates must be ratios between 0 and 1.");
    }
    if (
      durationMs !== undefined &&
      (!Number.isInteger(durationMs) || durationMs < 1 || durationMs > 10_000)
    ) {
      throw new Error("Mouse hold must be 1 to 10000 ms.");
    }
    const window = await chosenWindow(windowId, client);
    const localX = Math.floor(x * (window.width - 1));
    const localY = Math.floor(y * (window.height - 1));
    const env = await uiEnvironment();
    const isolated = env["STACKANVIL_UI_ISOLATED"] === "1";
    if (!isolated && !allowFocus)
      throw new Error(
        "Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.",
      );
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    if (bedrockTitle.test(window.title) && durationMs === undefined && !doubleClick) {
      // Bedrock under winewayland ignores a press on a control it has not seen the pointer hover,
      // and a press shorter than one frame. Hover first, then hold for several frames.
      await run(nativeBinary, ["move", window.id, String(localX), String(localY)], root, env);
      await sleep(400);
      await run(
        nativeBinary,
        ["mouse-hold", window.id, String(localX), String(localY), button, "150"],
        root,
        env,
      );
      return;
    }
    await run(
      nativeBinary,
      durationMs === undefined
        ? [
            doubleClick ? "double-click" : "click",
            window.id,
            String(localX),
            String(localY),
            button,
          ]
        : ["mouse-hold", window.id, String(localX), String(localY), button, String(durationMs)],
      root,
      env,
    );
  }

  async function key(
    name: string,
    windowId?: string,
    client?: Client,
    allowFocus = false,
    durationMs?: number,
    doubleTap = false,
  ): Promise<void> {
    if (!/^[A-Za-z0-9_+]{1,32}$/u.test(name))
      throw new Error("Use a key name such as Escape, Return, Tab, or Control+b.");
    if (
      durationMs !== undefined &&
      (!Number.isInteger(durationMs) || durationMs < 1 || durationMs > 10_000)
    ) {
      throw new Error("Key hold must be 1 to 10000 ms.");
    }
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env["STACKANVIL_UI_ISOLATED"] === "1";
    if (!isolated && !allowFocus)
      throw new Error(
        "Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.",
      );
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    await run(
      nativeBinary,
      durationMs === undefined
        ? [doubleTap ? "double-key" : "key", window.id, name]
        : ["key-hold", window.id, name, String(durationMs)],
      root,
      env,
    );
  }

  async function buttonHold(
    button: "left" | "right",
    durationMs: number,
    windowId?: string,
    client?: Client,
    allowFocus = false,
  ): Promise<void> {
    if (!Number.isInteger(durationMs) || durationMs < 1 || durationMs > 10_000)
      throw new Error("Button hold must be 1 to 10000 ms.");
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env["STACKANVIL_UI_ISOLATED"] === "1";
    if (!isolated && !allowFocus)
      throw new Error(
        "Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.",
      );
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    await run(nativeBinary, ["button-hold", window.id, button, String(durationMs)], root, env);
  }

  async function drag(
    points: readonly DragPoint[],
    button: "left" | "right",
    dwellMs: number,
    windowId?: string,
    client?: Client,
    allowFocus = false,
  ): Promise<void> {
    if (
      points.length < 2 ||
      points.length > 64 ||
      !points.every((point) =>
        [point.x, point.y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1),
      )
    ) {
      throw new Error("Drag needs 2 to 64 points with coordinates between 0 and 1.");
    }
    if (
      !Number.isInteger(dwellMs) ||
      dwellMs < 1 ||
      dwellMs > 1000 ||
      points.length * dwellMs > 10_000
    ) {
      throw new Error("Drag dwell must be 1 to 1000 ms per point, totaling at most 10000 ms.");
    }
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env["STACKANVIL_UI_ISOLATED"] === "1";
    if (!isolated && !allowFocus)
      throw new Error(
        "Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.",
      );
    const coordinates = points.flatMap((point) => [
      String(Math.floor(point.x * (window.width - 1))),
      String(Math.floor(point.y * (window.height - 1))),
    ]);
    if (!isolated) await run(nativeBinary, ["focus", window.id], root, env);
    await run(
      nativeBinary,
      ["drag", window.id, button, String(dwellMs), ...coordinates],
      root,
      env,
    );
  }

  async function typeText(
    value: string,
    windowId?: string,
    client?: Client,
    allowFocus = false,
  ): Promise<void> {
    if (!/^[a-z0-9 .-]{1,120}$/u.test(value))
      throw new Error(
        "Text must contain 1 to 120 lowercase ASCII letters, digits, spaces, periods, or hyphens.",
      );
    const window = await chosenWindow(windowId, client);
    const env = await uiEnvironment();
    const isolated = env["STACKANVIL_UI_ISOLATED"] === "1";
    if (!isolated && !allowFocus)
      throw new Error(
        "Input on your desktop would steal focus. Start the virtual display or pass --allow-focus explicitly.",
      );
    await run(nativeBinary, ["type", window.id, value], root, env);
  }

  async function command(args: string[]): Promise<string> {
    const [prefix, action, ...input] = args;
    if (prefix !== "ui") throw new Error("Expected a capture UI command.");
    const windowId = input.includes("--window-id")
      ? input[input.indexOf("--window-id") + 1]
      : undefined;
    if (input.includes("--window-id") && (!windowId || windowId.startsWith("--")))
      throw new Error("--window-id needs an ID.");
    const clientInput = input.includes("--client")
      ? input[input.indexOf("--client") + 1]
      : "bedrock";
    if (clientInput !== "bedrock" && clientInput !== "java")
      throw new Error("--client must be bedrock or java.");
    const client: Client = clientInput;
    const allowFocus = input.includes("--allow-focus");
    const outputDir = input.includes("--output-dir")
      ? input[input.indexOf("--output-dir") + 1]
      : undefined;
    if (input.includes("--output-dir") && (!outputDir || outputDir.startsWith("--")))
      throw new Error("--output-dir needs a directory.");
    switch (action) {
      case "list":
        return JSON.stringify(await windows(), null, 2);
      case "screenshot":
        if (!input[0]) throw new Error("Supply a screenshot name.");
        return screenshot(input[0], windowId, client, outputDir);
      case "record": {
        if (!input[0]) throw new Error("Supply a recording name.");
        const fpsIndex = input.indexOf("--fps");
        return record(
          input[0],
          Number(input[1]),
          fpsIndex >= 0 ? Number(input[fpsIndex + 1]) : 30,
          windowId,
          client,
          outputDir,
        );
      }
      case "pixel":
        return pixel(Number(input[0]), Number(input[1]), windowId, client);
      case "move":
        await move(Number(input[0]), Number(input[1]), windowId, client);
        return "";
      case "look":
        await look(Number(input[0]), Number(input[1]), windowId, client);
        return "";
      case "click":
      case "double-click": {
        if (input[2] && !input[2].startsWith("--") && input[2] !== "left" && input[2] !== "right") {
          throw new Error("Use left or right mouse button.");
        }
        await click(
          Number(input[0]),
          Number(input[1]),
          windowId,
          client,
          allowFocus,
          input[2] === "right" ? "right" : "left",
          undefined,
          action === "double-click",
        );
        return "";
      }
      case "mouse-hold": {
        const button = input[2];
        if (button !== "left" && button !== "right")
          throw new Error("Use left or right mouse button.");
        await click(
          Number(input[0]),
          Number(input[1]),
          windowId,
          client,
          allowFocus,
          button,
          Number(input[3]),
        );
        return "";
      }
      case "button-hold": {
        const button = input[0];
        if (button !== "left" && button !== "right")
          throw new Error("Use left or right mouse button.");
        await buttonHold(button, Number(input[1]), windowId, client, allowFocus);
        return "";
      }
      case "drag": {
        const flag = input.findIndex((value) => value.startsWith("--"));
        const values = flag < 0 ? input : input.slice(0, flag);
        const [button, dwell, ...coordinates] = values;
        if (button !== "left" && button !== "right")
          throw new Error("Use left or right mouse button.");
        if (coordinates.length % 2)
          throw new Error("Supply an x and y coordinate for each drag point.");
        const points = Array.from({ length: coordinates.length / 2 }, (_, index) => ({
          x: Number(coordinates[index * 2]),
          y: Number(coordinates[index * 2 + 1]),
        }));
        await drag(points, button, Number(dwell), windowId, client, allowFocus);
        return "";
      }
      case "key":
        if (!input[0]) throw new Error("Supply a key name.");
        await key(input[0], windowId, client, allowFocus);
        return "";
      case "double-key":
        if (!input[0]) throw new Error("Supply a key name.");
        await key(input[0], windowId, client, allowFocus, undefined, true);
        return "";
      case "key-hold":
        if (!input[0]) throw new Error("Supply a key name.");
        await key(input[0], windowId, client, allowFocus, Number(input[1]));
        return "";
      case "type":
        if (!input[0]) throw new Error("Supply text.");
        await typeText(input[0], windowId, client, allowFocus);
        return "";
      default:
        throw new Error(
          "Usage: bun run capture ui <list|screenshot|record|pixel|move|look|click|double-click|mouse-hold|button-hold|drag|key|double-key|key-hold|type>",
        );
    }
  }
  return {
    command,
    windows,
    chosenWindow,
    screenshot,
    record,
    pixel,
    click,
    key,
    buttonHold,
    drag,
    typeText,
    move,
    look,
  };
}
