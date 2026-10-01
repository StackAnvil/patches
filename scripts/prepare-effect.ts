import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const repos = join(import.meta.dir, "..", ".repos");
const repository = join(repos, "effect");

if (!existsSync(join(repository, ".git"))) {
  await mkdir(repos, { recursive: true });
  const clone = Bun.spawn(["git", "clone", "https://github.com/Effect-TS/effect", repository], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  process.exitCode = await clone.exited;
}
