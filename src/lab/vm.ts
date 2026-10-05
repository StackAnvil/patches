import { execFile, spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants, existsSync } from "node:fs";
import { access, chmod, copyFile, mkdir, open, readFile, readdir, rm, statfs, writeFile } from "node:fs/promises";
import { cpus, freemem, totalmem } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { root } from "../model.ts";
import { artifact, bundlePrism } from "../prism.ts";
import { displayEnv } from "./display.ts";
import { clickPointer, keyEvents, withNamedQmp, type QmpCommand } from "./qmp.ts";

const execute = promisify(execFile);
const vmRoot = join(root, ".stackanvil", "lab", "vms");
const shareRoot = join(vmRoot, "share");
type Guest = "windows" | "macos";
export interface VmSpec { version: 1; guest: Guest; release: string; name: string; cores: number; ramGiB: number; diskGiB: number }
const releases = { windows: ["11"], macos: ["monterey", "ventura", "sonoma", "sequoia", "tahoe"] };

function guest(value: string | undefined): Guest {
  if (value !== "windows" && value !== "macos") throw new Error("Choose windows or macos.");
  return value;
}

export function validateSpec(spec: VmSpec): VmSpec {
  if (spec.version !== 1 || !releases[spec.guest]?.includes(spec.release)
    || !/^sa-(windows|macos)-[0-9a-f]{12}$/.test(spec.name) || !spec.name.startsWith(`sa-${spec.guest}-`)) {
    throw new Error("Invalid VM profile. Use a separate private directory for another guest release.");
  }
  for (const { value, min, max } of [{ value: spec.cores, min: 2, max: 64 }, { value: spec.ramGiB, min: 4, max: 128 }, { value: spec.diskGiB, min: 64, max: 2048 }]) {
    if (!Number.isInteger(value) || value < min || value > max) throw new Error("Invalid VM CPU, RAM, or disk allocation.");
  }
  return spec;
}

function configName(spec: VmSpec): string { return `${spec.guest}-${spec.release}`; }
function directory(selected: Guest): string { return join(vmRoot, selected); }
function controlPath(selected: Guest): string { return join(directory(selected), "control.socket"); }
function pidPath(spec: VmSpec): string { return join(directory(spec.guest), configName(spec), `${spec.name}.pid`); }

function validatePaths(path: string, spec: VmSpec): void {
  for (const socket of [join(path, "control.socket"), join(path, configName(spec), `${spec.name}.sock`)]) {
    if (Buffer.byteLength(socket) > 107) throw new Error("Repository path is too long for a VM Unix socket. Use a shorter checkout path.");
  }
}

/** Override only the lab policy. Quickget retains ownership of boot media and firmware configuration. */
export function vmConfig(spec: VmSpec): string {
  validateSpec(spec);
  return `source './${configName(spec)}.conf'\narch="x86_64"\ncpu_cores="${spec.cores}"\nram="${spec.ramGiB}G"\ndisk_size="${spec.diskGiB}G"\ndisplay="spice"\nviewer="none"\ngl="off"\nsound_card="none"\npublic_dir="none"\nnetwork=""\nport_forwards=()\nssh_port="0"\nextra_args="-qmp unix:control.socket,server=on,wait=off"\n`;
}

/** Quickget can return success after a blocked download or save an HTML error page as an ISO. */
export async function validateInstallMedia(config: string): Promise<void> {
  const contents = await readFile(config, "utf8");
  for (const match of contents.matchAll(/^(?:iso|fixed_iso)=["']([^"'\n]+)["']\s*$/gm)) {
    const media = resolve(dirname(config), match[1]!);
    let handle;
    try { handle = await open(media, "r"); }
    catch { throw new Error(`Installation media is missing: ${media}. Read download.log and obtain the official ISO before starting the VM.`); }
    try {
      const header = Buffer.alloc(64 * 1024);
      const { bytesRead } = await handle.read(header, 0, header.length, 32 * 1024);
      const descriptors = header.subarray(0, bytesRead);
      if (!["CD001", "BEA01", "NSR02", "NSR03"].some((magic) => descriptors.includes(Buffer.from(magic)))) {
        throw new Error(`Invalid installation ISO: ${media}. The download may contain an HTML error page. Replace it with the official media.`);
      }
    } finally { await handle.close(); }
  }
}

async function privateDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true, mode: 0o700 });
  await chmod(path, 0o700);
}

async function loadSpec(selected: Guest): Promise<VmSpec> {
  const spec = validateSpec(JSON.parse(await readFile(join(directory(selected), "profile.json"), "utf8")) as VmSpec);
  if (spec.guest !== selected) throw new Error("VM profile belongs to another guest.");
  return spec;
}

/** Do not replace an installation or re-download its media during an ordinary repeat preparation. */
export async function prepareVm(path: string, spec: VmSpec, download: (args: string[], cwd: string) => Promise<void>): Promise<void> {
  validateSpec(spec);
  validatePaths(path, spec);
  await privateDirectory(path);
  const profile = join(path, "profile.json");
  if (existsSync(profile)) {
    const current = validateSpec(JSON.parse(await readFile(profile, "utf8")) as VmSpec);
    if (Object.keys(spec).some((key) => current[key as keyof VmSpec] !== spec[key as keyof VmSpec])) throw new Error("This directory already contains a different VM profile.");
  } else {
    if ((await readdir(path)).some((file) => file !== "operation.lock")) throw new Error("Refusing to adopt an existing VM directory.");
    await writeFile(profile, `${JSON.stringify(spec, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  }
  const original = join(path, `${configName(spec)}.conf`);
  if (!existsSync(original)) {
    if (existsSync(join(path, configName(spec), "disk.qcow2"))) throw new Error("VM disk exists without its Quickget configuration. Restore the configuration first.");
    await download([spec.guest, spec.release], path);
    if (!existsSync(original)) throw new Error("Quickget did not create the expected configuration. Read the private download log.");
  }
  await chmod(original, 0o600);
  const wrapper = join(path, `${spec.name}.conf`);
  if (!existsSync(wrapper)) await writeFile(wrapper, vmConfig(spec), { flag: "wx", mode: 0o600 });
  await validateInstallMedia(original);
}

async function locked<T>(path: string, operation: () => Promise<T>): Promise<T> {
  await privateDirectory(path);
  const lockPath = join(path, "operation.lock");
  const lock = await open(lockPath, "wx", 0o600).catch(() => { throw new Error(`Another VM operation owns ${lockPath}. If interrupted, verify its process exited before removing this lock.`); });
  try { await lock.writeFile(`${process.pid}\n`); return await operation(); }
  finally { await lock.close(); await rm(lockPath); }
}

async function kvmAvailable(): Promise<boolean> {
  return access("/dev/kvm", constants.R_OK | constants.W_OK).then(() => true, () => false);
}

async function requireHost(): Promise<void> {
  if (process.platform !== "linux" || process.arch !== "x64") throw new Error("This VM lab requires an x86_64 Linux host. ARM and macOS hosts need a separate validated configuration.");
  if (!await kvmAvailable()) throw new Error("KVM is unavailable. Enable virtualization and grant this user access to /dev/kvm.");
  for (const tool of ["quickemu", "quickget", "qemu-system-x86_64", "qemu-img", "swtpm"]) {
    if (!Bun.which(tool)) throw new Error(`Missing ${tool}. See docs/platform-testing.md.`);
  }
  const version = (await execute("quickemu", ["--version"])).stdout.trim().split(".").map(Number);
  if (version.length !== 3 || !version.every(Number.isInteger) || version[0]! < 4
    || (version[0] === 4 && (version[1]! < 9 || (version[1] === 9 && version[2]! < 9)))) {
    throw new Error("The VM lab needs Quickemu 4.9.9 or newer. Update the host package.");
  }
}

async function running(spec: VmSpec): Promise<boolean> {
  if (!existsSync(pidPath(spec))) return false;
  const pid = Number((await readFile(pidPath(spec), "utf8")).trim());
  if (!Number.isInteger(pid) || pid <= 0) throw new Error("Invalid Quickemu PID file.");
  try { process.kill(pid, 0); return true; } catch { return false; }
}

async function control<T>(spec: VmSpec, operation: (command: QmpCommand) => Promise<T>): Promise<T> {
  return withNamedQmp(controlPath(spec.guest), spec.name, operation);
}

async function runQuickemu(spec: VmSpec): Promise<void> {
  const path = directory(spec.guest);
  const log = await open(join(path, "launch.log"), "a", 0o600);
  try {
    const child = spawn("quickemu", ["--vm", `${spec.name}.conf`, "--display", "spice", "--viewer", "none", "--access", "local"], {
      cwd: path, env: { ...process.env, DISPLAY: "", WAYLAND_DISPLAY: "", PULSE_SINK: "stackanvil_silent" }, stdio: ["ignore", log.fd, log.fd],
    });
    await new Promise<void>((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Quickemu exited with ${code}. Read ${path}/launch.log.`)));
    });
  } finally { await log.close(); }
}

async function doctor(): Promise<void> {
  const binaries = Object.fromEntries(["quickemu", "quickget", "qemu-system-x86_64", "qemu-img", "swtpm", "spicy", "genisoimage", "jq", "xauth"].map((tool) => [tool, Bun.which(tool) ?? "missing"]));
  const version = Bun.which("quickemu") ? (await execute("quickemu", ["--version"])).stdout.trim() : "missing";
  const disk = await statfs(root);
  console.log(JSON.stringify({ host: `${process.platform}/${process.arch}`, quickemuVersion: version,
    kvm: await kvmAvailable(), cores: cpus().length, totalRamGiB: Math.floor(totalmem() / 2 ** 30), freeRamGiB: Math.floor(freemem() / 2 ** 30),
    freeDiskGiB: Math.floor(Number(disk.bavail) * Number(disk.bsize) / 2 ** 30), binaries,
    graphics: "Default guests have no validated Minecraft GPU acceleration. Record OpenGL and launcher evidence before claiming game coverage.",
    guide: join(root, "docs", "platform-testing.md") }, null, 2));
}

async function stageArtifacts(): Promise<void> {
  const prism = await bundlePrism();
  const proxy = await artifact("viaproxy");
  await privateDirectory(shareRoot);
  const files: { file: string; sha256: string }[] = [];
  for (const [source, name] of [[prism, "StackAnvil-Prism.zip"], [proxy, "ViaProxy.jar"]] as const) {
    const target = join(shareRoot, name);
    await copyFile(source, target);
    await chmod(target, 0o600);
    files.push({ file: name, sha256: createHash("sha256").update(await readFile(target)).digest("hex") });
  }
  const commit = (await execute("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim();
  await writeFile(join(shareRoot, "manifest.json"), `${JSON.stringify({ commit, stagedAt: new Date().toISOString(), files }, null, 2)}\n`, { mode: 0o600 });
  await writeFile(join(shareRoot, "SHA256SUMS"), files.map((file) => `${file.sha256}  ${file.file}\n`).join(""), { mode: 0o600 });
  console.log(`Staged verified build artifacts in ${shareRoot}. Run bun run lab vm serve.`);
}

/** Only build exports are reachable. Directory contents and guest credentials are never served. */
export function shareResponse(pathname: string, path: string): Response {
  const names = ["StackAnvil-Prism.zip", "ViaProxy.jar", "manifest.json", "SHA256SUMS"];
  if (pathname === "/") return new Response(names.join("\n") + "\n", { headers: { "Content-Type": "text/plain" } });
  const name = pathname.slice(1);
  if (!names.includes(name) || basename(name) !== name || !existsSync(join(path, name))) return new Response("Not found", { status: 404 });
  return new Response(Bun.file(join(path, name)), { headers: { "Content-Disposition": `attachment; filename="${name}"` } });
}

export async function vmMain(args: string[]): Promise<void> {
  const [action, selectedText, ...rest] = args;
  if (["doctor", "artifacts", "serve"].includes(action ?? "") && args.length !== 1) throw new Error("This VM command does not accept extra arguments.");
  if (action === "doctor") return doctor();
  if (action === "artifacts") return stageArtifacts();
  if (action === "serve") {
    if (!existsSync(join(shareRoot, "manifest.json"))) throw new Error("Run bun run lab vm artifacts first.");
    const server = Bun.serve({ hostname: "127.0.0.1", port: 18081, fetch: (request) => {
      if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
      return shareResponse(new URL(request.url).pathname, shareRoot);
    } });
    console.log(`Guest downloads: http://10.0.2.2:${server.port}/ (host loopback only). Stop with Ctrl+C.`);
    return;
  }
  if (!action || !["prepare", "start", "status", "stop", "view", "screenshot", "key", "click"].includes(action)) {
    throw new Error("Usage: bun run lab vm <doctor|prepare|start|status|stop|view|screenshot|key|click|artifacts|serve> [windows|macos] [arguments]");
  }
  if (["start", "status", "stop"].includes(action) && rest.length) throw new Error("This VM command accepts only the guest name.");
  const selected = guest(selectedText);
  const path = directory(selected);
  if (action === "prepare") {
    await requireHost();
    if (rest.length > 1) throw new Error("Usage: bun run lab vm prepare <windows|macos> [release]");
    await locked(path, async () => {
      const current = existsSync(join(path, "profile.json")) ? await loadSpec(selected) : undefined;
      const release = rest[0] ?? current?.release ?? (selected === "windows" ? "11" : "sonoma");
      if (current && current.release !== release) throw new Error("A different release already owns this VM directory. Preserve its installation.");
      const spec: VmSpec = current ?? { version: 1, guest: selected, release, name: `sa-${selected}-${randomUUID().replaceAll("-", "").slice(0, 12)}`, cores: 4, ramGiB: 8, diskGiB: 128 };
      console.log(`Preparing ${selected} ${release}. First preparation downloads official installation media. Private log: ${path}/download.log`);
      await prepareVm(path, spec, async (downloadArgs, cwd) => {
        const log = await open(join(path, "download.log"), "a", 0o600);
        try {
          const child = spawn("quickget", downloadArgs, { cwd, stdio: ["inherit", log.fd, log.fd] });
          await new Promise<void>((resolve, reject) => { child.on("error", reject); child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Quickget exited with ${code}. Read the private download log.`))); });
        } finally { await log.close(); }
      });
      console.log(`Prepared ${path}. Run bun run lab vm start ${selected}, then follow docs/platform-testing.md.`);
    });
    return;
  }
  if (action === "status" && !existsSync(join(path, "profile.json"))) { console.log(`${selected}: not prepared`); return; }
  const spec = await loadSpec(selected);
  if (action === "status") {
    console.log(JSON.stringify({ ...spec, directory: path, running: await running(spec),
      state: await running(spec) ? await control(spec, (command) => command("query-status")) : "stopped" }, null, 2));
    return;
  }
  if (action === "start") {
    await requireHost();
    await locked(path, async () => {
      validatePaths(path, spec);
      await validateInstallMedia(join(path, `${configName(spec)}.conf`));
      if (existsSync(controlPath(selected))) {
        try {
          await control(spec, (command) => command("query-status"));
          console.log(`${selected} is already running.`);
          return;
        } catch (error) {
          if (!["ENOENT", "ECONNREFUSED"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
        }
      }
      if (await running(spec)) { await control(spec, (command) => command("query-status")); console.log(`${selected} is already running.`); return; }
      await rm(controlPath(selected), { force: true });
      await runQuickemu(spec);
      await control(spec, (command) => command("query-status"));
      console.log(`Started ${selected} without a desktop viewer. Use vm screenshot/key/click or vm view ${selected} --allow-focus.`);
    });
    return;
  }
  if (!await running(spec)) throw new Error(`${selected} is stopped. Run bun run lab vm start ${selected}.`);
  if (action === "stop") {
    await locked(path, async () => {
      await control(spec, (command) => command("system_powerdown"));
      for (let attempt = 0; attempt < 60 && await running(spec); attempt++) await Bun.sleep(500);
      if (await running(spec)) throw new Error("Guest shutdown is still pending. Complete shutdown in the guest. No process was killed.");
      console.log(`Stopped ${selected}.`);
    });
    return;
  }
  if (action === "view") {
    if (rest.some((value) => value !== "--allow-focus")) throw new Error("Usage: bun run lab vm view <guest> [--allow-focus]");
    if (!Bun.which("spicy")) throw new Error("Install the SPICE GTK viewer (spicy).");
    await control(spec, (command) => command("query-status"));
    const uri = `spice+unix://${join(path, configName(spec), `${spec.name}.sock`)}`;
    const env = rest.includes("--allow-focus") ? process.env : await displayEnv(true);
    if (!env) throw new Error("A private lab display is required unless --allow-focus is explicit.");
    const child = spawn("spicy", ["--uri", uri, "--title", spec.name, "--spice-disable-audio", "--spice-disable-usbredir"], { env, stdio: "ignore", detached: true });
    await new Promise<void>((resolve, reject) => { child.on("error", reject); child.on("spawn", resolve); });
    child.unref();
    console.log(`Opened silent ${selected} viewer on ${rest.includes("--allow-focus") ? "your desktop" : "the private lab display"}.`);
    return;
  }
  if (action === "screenshot") {
    const name = rest[0] ?? `screen-${Date.now()}`;
    if (rest.length > 1 || !/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error("Use a screenshot name containing letters, digits, underscores, or hyphens.");
    const captures = join(path, "captures");
    await privateDirectory(captures);
    const file = join(captures, `${name}.ppm`);
    if (existsSync(file)) throw new Error("Screenshot already exists. Choose another name.");
    await control(spec, (command) => command("screendump", { filename: file }));
    await chmod(file, 0o600);
    console.log(file);
    return;
  }
  if (action === "key") {
    if (rest.length !== 1) throw new Error("Usage: bun run lab vm key <guest> <qcode+chord>");
    const keys = keyEvents(rest[0]!);
    await control(spec, (command) => command("send-key", { keys, "hold-time": 100 }));
    return;
  }
  if (action === "click") {
    if (rest.length < 2 || rest.length > 3) throw new Error("Usage: bun run lab vm click <guest> <x> <y> [left|right|middle]");
    const button = rest[2] ?? "left";
    await control(spec, (command) => clickPointer(command, Number(rest[0]), Number(rest[1]), button));
    return;
  }
  throw new Error("Usage: bun run lab vm <doctor|prepare|start|status|stop|view|screenshot|key|click|artifacts|serve> [windows|macos] [arguments]");
}
