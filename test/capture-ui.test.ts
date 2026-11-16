import { expect, test } from "bun:test";
import { createCaptureUi, type UiExecutor } from "../src/capture/ui.ts";
import { expectRejection } from "./helpers/expect-rejection.ts";

const window = { id: "0x123", title: "Minecraft 26.3", x: 0, y: 0, width: 854, height: 480 };
const isolated = {
  DISPLAY: ":102",
  XAUTHORITY: "/private/display.auth",
  STACKANVIL_UI_ISOLATED: "1",
};

function fixture(environment: NodeJS.ProcessEnv | undefined, desktop: NodeJS.ProcessEnv = {}) {
  const calls: { args: string[]; env: NodeJS.ProcessEnv }[] = [];
  let windows = [window];
  let lookups = 0;
  const execute: UiExecutor = async (_program, args, _cwd, env) => {
    calls.push({ args, env });
    return args[0] === "list" ? JSON.stringify(windows) : "";
  };
  const ui = createCaptureUi({
    execute,
    prepareNative: async () => "/test/capture-x11",
    desktopEnvironment: desktop,
    environment: async () => {
      lookups++;
      return environment;
    },
  });
  return {
    ui,
    calls,
    replaceWindows(value: typeof windows) {
      windows = value;
    },
    lookups: () => lookups,
  };
}

test("repeated private input stays on one owned display and revalidates its window", async () => {
  const f = fixture(isolated);
  await f.ui.command(["ui", "key-hold", "d", "650", "--client", "java"]);
  await f.ui.command(["ui", "button-hold", "left", "200", "--client", "java"]);
  expect(f.lookups()).toBe(1);
  expect(f.calls.every((call) => call.env === isolated)).toBe(true);
  expect(f.calls.filter((call) => call.args[0] === "focus")).toHaveLength(0);
  const input = f.calls.filter((call) => ["key-hold", "button-hold"].includes(call.args[0]!));
  expect(input.map((call) => call.args)).toEqual([
    ["key-hold", window.id, "d", "650"],
    ["button-hold", window.id, "left", "200"],
  ]);
  f.replaceWindows([]);
  await expectRejection(f.ui.command(["ui", "key", "d", "--window-id", window.id]));
  expect(f.calls.filter((call) => call.args[0] === "key")).toHaveLength(0);
});

test("verified pointer movement positions the selected window without pressing a button", async () => {
  const f = fixture(isolated);
  await f.ui.command(["ui", "move", "0.5", "0.25", "--client", "java"]);
  expect(f.calls.filter((call) => call.args[0] !== "list").map((call) => call.args)).toEqual([
    ["move", window.id, "426", "119"],
  ]);
  f.replaceWindows([]);
  await expectRejection(f.ui.move(0.5, 0.25, window.id, "java"), "not visible");
  expect(f.calls.filter((call) => call.args[0] === "move")).toHaveLength(1);
});

test("verified pointer movement rejects invalid positions and desktop input", async () => {
  const f = fixture(isolated);
  await expectRejection(f.ui.move(-0.1, 0.5, window.id, "java"), "between 0 and 1");
  expect(f.calls).toHaveLength(0);
  const desktop = fixture(undefined, { DISPLAY: ":99", STACKANVIL_USE_DESKTOP: "1" });
  await expectRejection(desktop.ui.move(0.5, 0.5, window.id, "java"), "private X11 display");
  expect(desktop.calls).toHaveLength(0);
});

test("capture input cannot fall back to desktop or focus it without explicit permission", async () => {
  const unavailable = fixture(undefined, { DISPLAY: ":99" });
  await expectRejection(unavailable.ui.command(["ui", "key", "d", "--client", "java"]));
  expect(unavailable.calls).toHaveLength(0);
  const desktop = fixture(undefined, { DISPLAY: ":99", STACKANVIL_USE_DESKTOP: "1" });
  await expectRejection(desktop.ui.command(["ui", "key", "d", "--client", "java"]));
  expect(
    desktop.calls.filter((call) => call.args[0] === "focus" || call.args[0] === "key"),
  ).toHaveLength(0);
  await desktop.ui.command(["ui", "key", "d", "--client", "java", "--allow-focus"]);
  expect(
    desktop.calls
      .filter((call) => call.args[0] === "focus" || call.args[0] === "key")
      .map((call) => call.args[0]),
  ).toEqual(["focus", "key"]);
});

test("GNOME clicks retain the selected button and require desktop authorization", async () => {
  const f = fixture(undefined, {
    DISPLAY: ":0",
    STACKANVIL_USE_DESKTOP: "1",
    XDG_CURRENT_DESKTOP: "GNOME",
  });
  await expectRejection(f.ui.click(0.5, 0.5, window.id, "java", false, "right"));
  expect(
    f.calls.filter((call) => call.args[0] === "focus" || call.args.includes("click")),
  ).toHaveLength(0);
  for (const button of ["left", "right"] as const) {
    await f.ui.click(0.5, 0.5, window.id, "java", true, button);
    const args = f.calls.at(-1)!.args;
    expect(args.slice(2)).toEqual(["click", "426", "239", button]);
  }
});

test("invalid input bounds and ambiguous windows never emit input", async () => {
  const f = fixture(isolated);
  for (const duration of ["0", "-1", "1.5", "10001", "NaN", "Infinity"]) {
    await expectRejection(f.ui.command(["ui", "key-hold", "d", duration, "--client", "java"]));
    await expectRejection(
      f.ui.command(["ui", "mouse-hold", "0.5", "0.5", "left", duration, "--client", "java"]),
    );
    await expectRejection(
      f.ui.command(["ui", "button-hold", "left", duration, "--client", "java"]),
    );
  }
  for (const args of [
    ["key", "d", "--window-id"],
    ["key", "d", "--window-id", "--client", "java"],
    ["click", "1.01", "0.5"],
    ["key", "d", "--client", "other"],
  ]) {
    await expectRejection(f.ui.command(["ui", ...args]));
  }
  expect(f.calls).toHaveLength(0);
  f.replaceWindows([window, { ...window, id: "0x456" }]);
  await expectRejection(f.ui.command(["ui", "key", "d", "--client", "java"]));
  expect(f.calls.filter((call) => call.args[0] === "key")).toHaveLength(0);
});

test("a closed client window is reported separately from an ambiguous selection", async () => {
  const f = fixture(isolated);
  f.replaceWindows([{ ...window, id: "0x789", title: "Prism Launcher" }]);
  await expectRejection(
    f.ui.command(["ui", "pixel", "0.5", "0.5", "--client", "java"]),
    "No visible java window is open",
  );
  f.replaceWindows([window, { ...window, id: "0x456" }]);
  await expectRejection(
    f.ui.command(["ui", "pixel", "0.5", "0.5", "--client", "java"]),
    "2 java windows match (0x123, 0x456)",
  );
  expect(f.calls.filter((call) => call.args[0] === "pixel")).toHaveLength(0);
});

test("drag sends the complete ordered path in one native call on the bound private display", async () => {
  const f = fixture(isolated);
  await f.ui.drag(
    [
      { x: 0, y: 0 },
      { x: 0.5, y: 0.25 },
      { x: 1, y: 1 },
    ],
    "left",
    120,
    window.id,
    "java",
  );
  await f.ui.command([
    "ui",
    "drag",
    "right",
    "200",
    "0.25",
    "0.5",
    "0.75",
    "0.5",
    "--client",
    "java",
  ]);
  expect(f.calls.filter((call) => call.args[0] === "drag").map((call) => call.args)).toEqual([
    ["drag", window.id, "left", "120", "0", "0", "426", "119", "853", "479"],
    ["drag", window.id, "right", "200", "213", "239", "639", "239"],
  ]);
  expect(f.lookups()).toBe(1);
  expect(f.calls.every((call) => call.env === isolated)).toBe(true);
  expect(f.calls.filter((call) => call.args[0] === "focus")).toHaveLength(0);
  f.replaceWindows([]);
  await expectRejection(
    f.ui.drag(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      "left",
      100,
      window.id,
      "java",
    ),
  );
  expect(f.calls.filter((call) => call.args[0] === "drag")).toHaveLength(2);
});

test("invalid drag paths and duration bounds emit no native calls", async () => {
  const f = fixture(isolated);
  const points = [
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.5 },
  ];
  for (const duration of [0, -1, 1.5, 1001, NaN, Infinity]) {
    await expectRejection(f.ui.drag(points, "left", duration));
  }
  for (const path of [
    [],
    points.slice(0, 1),
    Array.from({ length: 65 }, () => points[0]!),
    [{ x: -0.01, y: 0.5 }, points[1]!],
    [{ x: 1.01, y: 0.5 }, points[1]!],
    [{ x: NaN, y: 0.5 }, points[1]!],
    [{ x: 0.5, y: Infinity }, points[1]!],
  ]) {
    await expectRejection(f.ui.drag(path, "right", 100));
  }
  await expectRejection(
    f.ui.drag(
      Array.from({ length: 11 }, () => points[0]!),
      "left",
      1000,
    ),
  );
  for (const args of [
    ["right", "200", "0.5", "0.5", "0.6"],
    ["middle", "200", "0.5", "0.5", "0.6", "0.5"],
    ["left", "200", "0.5", "0.5"],
    ["left", "1001", "0", "0", "1", "1"],
  ]) {
    await expectRejection(f.ui.command(["ui", "drag", ...args]));
  }
  expect(f.calls).toHaveLength(0);
});

test("drag enforces the total hold boundary and resolves an explicit window among candidates", async () => {
  const f = fixture(isolated);
  f.replaceWindows([window, { ...window, id: "0x456" }]);
  const path = Array.from({ length: 10 }, (_, index) => ({ x: index / 10, y: 0.5 }));
  await expectRejection(f.ui.drag(path, "left", 1000, undefined, "java"));
  expect(f.calls.filter((call) => call.args[0] === "drag")).toHaveLength(0);
  await f.ui.drag(path, "left", 1000, "0x456", "java");
  const emitted = f.calls.find((call) => call.args[0] === "drag")!;
  expect(emitted.args.slice(0, 4)).toEqual(["drag", "0x456", "left", "1000"]);
  expect(emitted.args).toHaveLength(24);
});

test("drag refuses desktop and unsupported GNOME input before focusing", async () => {
  const points = [
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.5 },
  ];
  const unavailable = fixture(undefined, { DISPLAY: ":0" });
  await expectRejection(unavailable.ui.drag(points, "left", 100));
  expect(unavailable.calls).toHaveLength(0);
  const desktop = fixture(undefined, { DISPLAY: ":0", STACKANVIL_USE_DESKTOP: "1" });
  await expectRejection(desktop.ui.drag(points, "right", 100, window.id, "java"));
  expect(desktop.calls.filter((call) => ["focus", "drag"].includes(call.args[0]!))).toHaveLength(0);
  await desktop.ui.drag(points, "right", 100, window.id, "java", true);
  expect(
    desktop.calls
      .filter((call) => ["focus", "drag"].includes(call.args[0]!))
      .map((call) => call.args[0]),
  ).toEqual(["focus", "drag"]);
  const gnome = fixture(undefined, {
    DISPLAY: ":0",
    STACKANVIL_USE_DESKTOP: "1",
    XDG_CURRENT_DESKTOP: "GNOME",
  });
  await expectRejection(gnome.ui.drag(points, "left", 100, window.id, "java", true));
  expect(gnome.calls.filter((call) => ["focus", "drag"].includes(call.args[0]!))).toHaveLength(0);
});
