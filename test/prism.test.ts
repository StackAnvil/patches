import { expect, test } from "bun:test";
import { findPrismProcess } from "../src/prism.ts";

const data = "/home/player/.var/app/org.prismlauncher.PrismLauncher/data/PrismLauncher";
const game = (pid: number, instance: string) =>
  `${String(pid).padStart(6)} /usr/lib/jvm/java-25/bin/java -Duser.language=en -Xms512m -Xmx4096m -Djava.library.path=${data}/instances/${instance}/natives -cp /app/share/PrismLauncher/NewLaunch.jar:${data}/libraries/lwjgl.jar org.prismlauncher.EntryPoint`;

test("finds the game of an instance whose name is contained in another running instance's name", () => {
  const processes = [
    `  3900 prismlauncher --launch StackAnvil Integration 26.3`,
    game(4100, "Fabulously Optimized StackAnvil Integration 26.3"),
    game(4200, "StackAnvil Integration 26.3"),
    "",
  ].join("\n");
  expect(findPrismProcess(processes, "StackAnvil Integration 26.3")).toBe(4200);
  expect(findPrismProcess(processes, "Fabulously Optimized StackAnvil Integration 26.3")).toBe(4100);
  expect(findPrismProcess(processes.replace(game(4200, "StackAnvil Integration 26.3"), ""), "StackAnvil Integration 26.3")).toBeUndefined();
});
