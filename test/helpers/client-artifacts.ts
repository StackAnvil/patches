import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function writeClientJar(directory: string, file: string, project: string, minecraft = "26.3") {
  const staging = join(directory, ".jar");
  await mkdir(staging, { recursive: true });
  await writeFile(join(staging, "fabric.mod.json"), JSON.stringify({
    id: project,
    version: "1",
    depends: { minecraft },
    ...(project === "viafabricplus-bedrock" ? { jars: [
      { file: "META-INF/jars/ViaBedrock-1-StackAnvil.jar" },
      { file: "META-INF/jars/cubeconverter-1-StackAnvil.jar" },
    ] } : {}),
  }));
  await rm(join(directory, file), { force: true });
  execFileSync("zip", ["-q", join(directory, file), "fabric.mod.json"], { cwd: staging });
  await rm(staging, { recursive: true });
  return createHash("sha256").update(await readFile(join(directory, file))).digest("hex");
}
