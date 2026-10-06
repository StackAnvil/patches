import { expect, test } from "bun:test";
import { createCaptureUi, type UiExecutor } from "../src/capture/ui.ts";

const window = { id: "0x123", title: "Minecraft 26.3", x: 0, y: 0, width: 854, height: 480 };
const isolated = { DISPLAY: ":102", XAUTHORITY: "/private/display.auth", STACKANVIL_UI_ISOLATED: "1" };

function fixture(environment: NodeJS.ProcessEnv | undefined, desktop: NodeJS.ProcessEnv = {}) {
  const calls: { args: string[]; env: NodeJS.ProcessEnv }[] = [];
  let windows = [window];
  let lookups = 0;
  const execute: UiExecutor = async (_program, args, _cwd, env) => {
    calls.push({ args, env });
    return args[0] === "list" ? JSON.stringify(windows) : "";
  };
  const ui = createCaptureUi({ execute, desktopEnvironment: desktop,
    environment: async () => { lookups++; return environment; } });
  return { ui, calls, replaceWindows(value: typeof windows) { windows = value; }, lookups: () => lookups };
}

test("repeated private input stays on one owned display and revalidates its window", async () => {
  const f = fixture(isolated);
  await f.ui.command(["ui", "key-hold", "d", "650", "--client", "java"]);
  await f.ui.command(["ui", "button-hold", "left", "200", "--client", "java"]);
  expect(f.lookups()).toBe(1);
  expect(f.calls.every(call => call.env === isolated)).toBe(true);
  expect(f.calls.filter(call => call.args[0] === "focus")).toHaveLength(0);
  const input = f.calls.filter(call => ["key-hold", "button-hold"].includes(call.args[0]!));
  expect(input.map(call => call.args)).toEqual([["key-hold", window.id, "d", "650"], ["button-hold", window.id, "left", "200"]]);
  f.replaceWindows([]);
  await expect(f.ui.command(["ui", "key", "d", "--window-id", window.id])).rejects.toBeInstanceOf(Error);
  expect(f.calls.filter(call => call.args[0] === "key")).toHaveLength(0);
});

test("capture input cannot fall back to desktop or focus it without explicit permission", async () => {
  const unavailable = fixture(undefined, { DISPLAY: ":99" });
  await expect(unavailable.ui.command(["ui", "key", "d", "--client", "java"])).rejects.toBeInstanceOf(Error);
  expect(unavailable.calls).toHaveLength(0);
  const desktop = fixture(undefined, { DISPLAY: ":99", STACKANVIL_USE_DESKTOP: "1" });
  await expect(desktop.ui.command(["ui", "key", "d", "--client", "java"])).rejects.toBeInstanceOf(Error);
  expect(desktop.calls.filter(call => call.args[0] === "focus" || call.args[0] === "key")).toHaveLength(0);
  await desktop.ui.command(["ui", "key", "d", "--client", "java", "--allow-focus"]);
  expect(desktop.calls.filter(call => call.args[0] === "focus" || call.args[0] === "key").map(call => call.args[0]))
    .toEqual(["focus", "key"]);
});

test("invalid input bounds and ambiguous windows never emit input", async () => {
  const f = fixture(isolated);
  for (const duration of ["0", "-1", "1.5", "10001", "NaN", "Infinity"]) {
    await expect(f.ui.command(["ui", "key-hold", "d", duration, "--client", "java"])).rejects.toBeInstanceOf(Error);
    await expect(f.ui.command(["ui", "mouse-hold", "0.5", "0.5", "left", duration, "--client", "java"])).rejects.toBeInstanceOf(Error);
    await expect(f.ui.command(["ui", "button-hold", "left", duration, "--client", "java"])).rejects.toBeInstanceOf(Error);
  }
  for (const args of [["key", "d", "--window-id"], ["key", "d", "--window-id", "--client", "java"],
    ["click", "1.01", "0.5"], ["key", "d", "--client", "other"]]) {
    await expect(f.ui.command(["ui", ...args])).rejects.toBeInstanceOf(Error);
  }
  expect(f.calls).toHaveLength(0);
  f.replaceWindows([window, { ...window, id: "0x456" }]);
  await expect(f.ui.command(["ui", "key", "d", "--client", "java"])).rejects.toBeInstanceOf(Error);
  expect(f.calls.filter(call => call.args[0] === "key")).toHaveLength(0);
});
