import { expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

// These modules stand in for the bundled launcher's documented configuration
// and capability checks. No account files or installed game engine are used.
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "stackanvil-bedrock-wayland-"));
  const modules = join(root, "bol");
  await mkdir(modules);
  await writeFile(join(modules, "__init__.py"), "");
  await writeFile(join(modules, "proton.py"), "def proton_path(): return 'engine'\n");
  await writeFile(
    join(modules, "waylanddrv.py"),
    "import os\ndef engine_wayland_driver_problem(path): return os.environ.get('TEST_DRIVER_PROBLEM')\n",
  );
  await writeFile(
    join(modules, "util.py"),
    "import os, json\ndef load_settings(): return json.loads(os.environ.get('TEST_SETTINGS', '{}'))\ndef custom_env_map(text): return dict(value.split('=', 1) for value in text.split())\n",
  );
  const launcher = join(root, "bedrock-on-linux");
  await writeFile(launcher, "import sys\nprint('native launch ' + ' '.join(sys.argv[1:]))\n");
  return {
    root,
    run(settings: object = {}, problem = "") {
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        WAYLAND_DISPLAY: "wayland-private",
        BOL_INPUT: "wayland",
        BOL_GAMESCOPE: "0",
        TEST_SETTINGS: JSON.stringify(settings),
        TEST_DRIVER_PROBLEM: problem,
      };
      delete env["DISPLAY"];
      return spawnSync("python3", [resolve("scripts/bedrock-wayland.py"), launcher, "play"], {
        env,
        encoding: "utf8",
      });
    },
  };
}

test("Bedrock launcher refuses XWayland fallback before starting the game", async () => {
  const f = await fixture();
  try {
    const compatible = f.run();
    expect(compatible.status).toBe(0);
    expect(compatible.stdout).toBe("native launch play\n");
    const missingDriver = f.run({}, "Wayland driver missing");
    expect(missingDriver.status).not.toBe(0);
    expect(missingDriver.stderr).toContain("XWayland fallback is disabled");
    expect(missingDriver.stdout).toBe("");
    const gamescope = f.run({ gamescope: "1" });
    expect(gamescope.status).not.toBe(0);
    expect(gamescope.stderr).toContain("Disable Gamescope");
    expect(gamescope.stdout).toBe("");
    const overrides = f.run({ custom_env: "DISPLAY=:0" });
    expect(overrides.status).not.toBe(0);
    expect(overrides.stderr).toContain("Remove display and input overrides");
    expect(overrides.stdout).toBe("");
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
