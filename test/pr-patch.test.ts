import { expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { projectPrPatch } from "../src/pr-patch.ts";
import { command } from "../src/process.ts";
import { assertPrProductionChanges } from "../src/stack.ts";

test("PR commits keep runtime changes while local tests and Gradle test setup remain in the saved patch", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-pr-patch-"));
  const git = (args: string[]) => Effect.runPromise(command("git", args, directory, {
    ...process.env, GIT_CONFIG_GLOBAL: "/dev/null",
  }));
  const write = async (path: string, content: string | Uint8Array) => {
    await mkdir(join(directory, path, ".."), { recursive: true });
    await writeFile(join(directory, path), content);
  };
  try {
    await git(["init", "-b", "main"]);
    await git(["config", "user.name", "PR Test"]);
    await git(["config", "user.email", "test@example.invalid"]);
    const original = 'dependencies {\n    implementation("runtime:1")\n}\n';
    await write("build.gradle", original);
    await write("build.gradle.kts", original);
    const upstreamTests = `tasks.test {\n${Array.from({length: 10}, (_, index) => `    systemProperty("setting${index}", "kept")\n`).join("")}    maxHeapSize = "1G"\n}\n`;
    await write("gradle/quality.gradle", upstreamTests);
    await write("src/main/AlphaTest.java", "old runtime\n");
    await write("src/test/existing.txt", "upstream fixture\n");
    await git(["add", "."]);
    await git(["commit", "-m", "chore: create fixture"]);
    const base = await git(["rev-parse", "HEAD"]);
    const runtime = 'dependencies {\n    implementation("runtime:2")\n}\n';
    await write("gradle/quality.gradle", upstreamTests.replace('"1G"', '"2G"'));
    await write("build.gradle", runtime.replace("\n}", '\n\n    testImplementation "org.junit.jupiter:junit-jupiter:6.1.3"\n    testRuntimeOnly "org.junit.platform:junit-platform-launcher:6.1.3"\n}') + `
test {
    useJUnitPlatform()
}

configurations {
    mockitoAgent
}

dependencies {
    mockitoAgent("org.mockito:mockito-core:5.24.0") {
        transitive = false
    }
}

tasks.withType(Test).configureEach {
    jvmArgumentProviders.add(new MockitoAgentArgumentProvider(
        objects.fileCollection().from(configurations.mockitoAgent)))
}

class MockitoAgentArgumentProvider implements org.gradle.process.CommandLineArgumentProvider {
    @Classpath
    final ConfigurableFileCollection classpath

    Iterable<String> asArguments() {
        return ["-javaagent:$classpath"]
    }
}
`);
    await write("build.gradle.kts", runtime.replace("\n}", '\n\n    testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")\n}') + '\ntasks.test {\n    useJUnitPlatform()\n    maxHeapSize = "2G"\n}\n');
    await write("src/main/AlphaTest.java", "fixed runtime\n");
    await write("src/test/existing.txt", "local fixture\n");
    await write("src/test/java/RegressionTest.java", "local regression\n");
    await write("src/test/resources/reference.bin", new Uint8Array([0, 1, 255, 0]));
    await git(["add", "."]);
    await git(["commit", "-m", "fix: repair runtime", "-m", "Keep the regression local."]);
    const saved = await git(["format-patch", "--binary", "--stdout", "-1"]);
    await write(".git/saved.patch", saved);
    const projected = projectPrPatch(saved);
    expect(projected.omittedTests).toBe(true);
    await write(".git/pr.patch", projected.patch);
    await git(["reset", "--hard", base]);
    await git(["am", "--3way", join(directory, ".git/pr.patch")]);
    expect(await git(["rev-list", "--count", `${base}..HEAD`])).toBe("1");
    expect(await readFile(join(directory, "build.gradle"), "utf8")).toBe(runtime);
    expect(await readFile(join(directory, "build.gradle.kts"), "utf8")).toBe(runtime);
    expect(await readFile(join(directory, "gradle/quality.gradle"), "utf8")).toBe(upstreamTests);
    expect(await readFile(join(directory, "src/main/AlphaTest.java"), "utf8")).toBe("fixed runtime\n");
    expect(await readFile(join(directory, "src/test/existing.txt"), "utf8")).toBe("upstream fixture\n");
    await expect(readFile(join(directory, "src/test/java/RegressionTest.java"))).rejects.toThrow();
    await expect(readFile(join(directory, "src/test/resources/reference.bin"))).rejects.toThrow();
    expect(await readFile(join(directory, ".git/saved.patch"), "utf8")).toBe(saved);
    await Effect.runPromise(assertPrProductionChanges(directory, base));

    // Conflict resolutions and the final publish check share this validation.
    await write("src/test/java/AccidentalTest.java", "must stay local\n");
    await git(["add", "."]);
    await expect(Effect.runPromise(assertPrProductionChanges(directory, base, true))).rejects.toThrow(/include local tests/);
    await git(["commit", "-m", "test: accidentally include regression"]);
    await expect(Effect.runPromise(assertPrProductionChanges(directory, base))).rejects.toThrow(/include local tests/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("PR preparation rejects a change that contains only local tests", () => {
  expect(() => projectPrPatch(`diff --git a/src/test/a.txt b/src/test/a.txt
new file mode 100644
--- /dev/null
+++ b/src/test/a.txt
@@ -0,0 +1 @@
+local fixture
`)).toThrow(/No production changes/);
});

test("PR preparation does not guess where production code belongs after its test-only anchor disappears", () => {
  expect(() => projectPrPatch(`diff --git a/build.gradle b/build.gradle
--- a/build.gradle
+++ b/build.gradle
@@ -20,3 +20,5 @@
 test {
     useJUnitPlatform()
 }
+
+implementation("runtime:2")
`)).toThrow(/need non-test context/);
});

