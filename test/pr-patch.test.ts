import { expect, test } from "bun:test";
import { rejects } from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { projectPrPatch } from "../src/pr-patch.ts";
import { command } from "../src/process.ts";
import { assertPrProductionChanges } from "../src/stack.ts";

test.each(["legacy", "lean"])(
  "%s PR commits keep runtime changes while local tests and Gradle test setup remain in the saved patch",
  async (format) => {
    const directory = await mkdtemp(join(tmpdir(), "stackanvil-pr-patch-"));
    const git = (args: string[], trimOutput = true) =>
      Effect.runPromise(
        command(
          "git",
          args,
          directory,
          {
            ...process.env,
            GIT_CONFIG_GLOBAL: "/dev/null",
          },
          trimOutput,
        ),
      );
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
      const upstreamTests = `tasks.test {\n${Array.from({ length: 10 }, (_, index) => `    systemProperty("setting${index}", "kept")\n`).join("")}    maxHeapSize = "1G"\n}\n`;
      await write("gradle/quality.gradle", upstreamTests);
      await write("src/main/AlphaTest.java", "old runtime\n");
      await write("src/test/existing.txt", "upstream fixture\n");
      await git(["add", "."]);
      await git(["commit", "-m", "chore: create fixture"]);
      const base = await git(["rev-parse", "HEAD"]);
      const runtime = 'dependencies {\n    implementation("runtime:2")\n}\n';
      await write("gradle/quality.gradle", upstreamTests.replace('"1G"', '"2G"'));
      await write(
        "build.gradle",
        runtime.replace(
          "\n}",
          '\n\n    testImplementation "org.junit.jupiter:junit-jupiter:6.1.3"\n    testRuntimeOnly "org.junit.platform:junit-platform-launcher:6.1.3"\n}',
        ) +
          `
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
`,
      );
      await write(
        "build.gradle.kts",
        runtime.replace(
          "\n}",
          '\n\n    testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")\n}',
        ) + '\ntasks.test {\n    useJUnitPlatform()\n    maxHeapSize = "2G"\n}\n',
      );
      await write("src/main/AlphaTest.java", "fixed runtime\n");
      await write("src/test/existing.txt", "local fixture\n");
      await write("src/test/java/RegressionTest.java", "local regression\n");
      await write("src/test/resources/reference.bin", new Uint8Array([0, 1, 255, 0]));
      await git(["add", "."]);
      await git(["commit", "-m", "fix: repair runtime", "-m", "Keep the regression local."]);
      const saved = await git(
        [
          "format-patch",
          "--binary",
          "--full-index",
          ...(format === "lean" ? ["--zero-commit", "--no-signature", "--no-stat"] : []),
          "--stdout",
          "-1",
        ],
        false,
      );
      await write(".git/saved.patch", saved);
      const complete = projectPrPatch(saved, "cubeconverter");
      expect(complete.omittedTests).toBe(false);
      await write(".git/cubeconverter.patch", complete.patch);
      await git(["reset", "--hard", base]);
      await git(["am", "--3way", join(directory, ".git/cubeconverter.patch")]);
      expect(await readFile(join(directory, "src/test/java/RegressionTest.java"), "utf8")).toBe(
        "local regression\n",
      );
      expect(await readFile(join(directory, "src/test/resources/reference.bin"))).toEqual(
        Buffer.from([0, 1, 255, 0]),
      );
      expect(await readFile(join(directory, "build.gradle"), "utf8")).toContain(
        "junit-jupiter:6.1.3",
      );
      await Effect.runPromise(assertPrProductionChanges(directory, base, false, "cubeconverter"));
      await rejects(
        Effect.runPromise(assertPrProductionChanges(directory, base)),
        /include local tests/,
      );
      await git(["reset", "--hard", base]);
      const projected = projectPrPatch(saved);
      expect(projected.omittedTests).toBe(true);
      await write(".git/pr.patch", projected.patch);
      await git(["reset", "--hard", base]);
      await git(["am", "--3way", join(directory, ".git/pr.patch")]);
      expect(await git(["show", "-s", "--format=%an <%ae>%n%B", "HEAD"])).toBe(
        "PR Test <test@example.invalid>\nfix: repair runtime\n\nKeep the regression local.",
      );
      expect(await git(["rev-list", "--count", `${base}..HEAD`])).toBe("1");
      expect(await readFile(join(directory, "build.gradle"), "utf8")).toBe(runtime);
      expect(await readFile(join(directory, "build.gradle.kts"), "utf8")).toBe(runtime);
      expect(await readFile(join(directory, "gradle/quality.gradle"), "utf8")).toBe(upstreamTests);
      expect(await readFile(join(directory, "src/main/AlphaTest.java"), "utf8")).toBe(
        "fixed runtime\n",
      );
      expect(await readFile(join(directory, "src/test/existing.txt"), "utf8")).toBe(
        "upstream fixture\n",
      );
      await rejects(readFile(join(directory, "src/test/java/RegressionTest.java")), {
        code: "ENOENT",
      });
      await rejects(readFile(join(directory, "src/test/resources/reference.bin")), {
        code: "ENOENT",
      });
      expect(await readFile(join(directory, ".git/saved.patch"), "utf8")).toBe(saved);
      await Effect.runPromise(assertPrProductionChanges(directory, base));

      // Conflict resolutions and the final publish check share this validation.
      await write("src/test/java/AccidentalTest.java", "must stay local\n");
      await git(["add", "."]);
      await rejects(
        Effect.runPromise(assertPrProductionChanges(directory, base, true)),
        /include local tests/,
      );
      await git(["commit", "-m", "test: accidentally include regression"]);
      await rejects(
        Effect.runPromise(assertPrProductionChanges(directory, base)),
        /include local tests/,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);

test("PR preparation rejects a change that contains only local tests", () => {
  expect(() =>
    projectPrPatch(`diff --git a/src/test/a.txt b/src/test/a.txt
new file mode 100644
--- /dev/null
+++ b/src/test/a.txt
@@ -0,0 +1 @@
+local fixture
`),
  ).toThrow(/No production changes/);
});

test("PR Gradle changes after an edited upstream test block keep that block as their anchor and apply", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-pr-anchor-"));
  const git = (args: string[], trimOutput = true) =>
    Effect.runPromise(
      command(
        "git",
        args,
        directory,
        { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null" },
        trimOutput,
      ),
    );
  const upstream = `dependencies {
    implementation("runtime:1")
}

tasks.test {
    useJUnitPlatform()
}
`;
  const production = `
val bundledAssets = providers.gradleProperty("bundledAssets")
if (bundledAssets.isPresent) {
    sourceSets.main { resources.srcDir(bundledAssets) }
}
`;
  try {
    await git(["init", "-b", "main"]);
    await git(["config", "user.name", "PR Test"]);
    await git(["config", "user.email", "test@example.invalid"]);
    await writeFile(join(directory, "build.gradle.kts"), upstream);
    await git(["add", "."]);
    await git(["commit", "-m", "chore: create fixture"]);
    const base = await git(["rev-parse", "HEAD"]);
    await writeFile(
      join(directory, "build.gradle.kts"),
      upstream.replace("useJUnitPlatform()", 'useJUnitPlatform()\n    maxHeapSize = "2G"') +
        production,
    );
    await git(["commit", "-am", "feat: bundle assets", "-m", "Keep the test heap local."]);
    const saved = await git(
      [
        "format-patch",
        "--full-index",
        "--zero-commit",
        "--no-signature",
        "--no-stat",
        "--stdout",
        "-1",
      ],
      false,
    );
    // The default three lines of context hold only the edited test block and a blank line.
    expect(saved).toContain("@@ -4,4 +4,10 @@ dependencies {");
    const projected = projectPrPatch(saved);
    expect(projected.omittedTests).toBe(true);
    await writeFile(join(directory, ".git/pr.patch"), projected.patch);
    await git(["reset", "--hard", base]);
    await git(["am", join(directory, ".git/pr.patch")]);
    expect(await readFile(join(directory, "build.gradle.kts"), "utf8")).toBe(upstream + production);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("PR preparation keeps production sources in non-test source sets with a test package", () => {
  const tool = "src/tool/java/net/raphimc/viabedrock/test/ResourcePackConverterTest.java";
  const projected = projectPrPatch(`diff --git a/${tool} b/${tool}
--- a/${tool}
+++ b/${tool}
@@ -1 +1 @@
-new ResourcePackStorage(packs);
+new ResourcePackStorage(packs, servers);
diff --git a/src/test/java/StorageTest.java b/src/test/java/StorageTest.java
--- a/src/test/java/StorageTest.java
+++ b/src/test/java/StorageTest.java
@@ -1 +1 @@
-old
+new
`);
  expect(projected.omittedTests).toBe(true);
  expect(projected.patch).toContain(`+new ResourcePackStorage(packs, servers);`);
  expect(projected.patch).not.toContain("StorageTest.java");
});

test("PR Gradle changes keep upstream test configuration and blank lines as context and apply", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-pr-context-"));
  const git = (args: string[], trimOutput = true) =>
    Effect.runPromise(
      command(
        "git",
        args,
        directory,
        { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null" },
        trimOutput,
      ),
    );
  const upstream = `dependencies {
    implementation("runtime:1")
    testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")
    implementation("library:1")

    implementation("other:1")
}

tasks.test {
    useJUnitPlatform()
}
`;
  try {
    await git(["init", "-b", "main"]);
    await git(["config", "user.name", "PR Test"]);
    await git(["config", "user.email", "test@example.invalid"]);
    await writeFile(join(directory, "build.gradle.kts"), upstream);
    await git(["add", "."]);
    await git(["commit", "-m", "chore: create fixture"]);
    const base = await git(["rev-parse", "HEAD"]);
    await writeFile(
      join(directory, "build.gradle.kts"),
      upstream
        .replace(
          'library:1")',
          'library:2")\n    testImplementation("org.mockito:mockito-core:5.24.0")',
        )
        .concat('\ntesting.suites.test {\n    useJUnitJupiter("6.1.3")\n}\n'),
    );
    await git(["commit", "-am", "fix: update library", "-m", "Keep the regression local."]);
    const saved = await git(
      [
        "format-patch",
        "--full-index",
        "--zero-commit",
        "--no-signature",
        "--no-stat",
        "--stdout",
        "-1",
      ],
      false,
    );
    const projected = projectPrPatch(saved);
    expect(projected.omittedTests).toBe(true);
    await writeFile(join(directory, ".git/pr.patch"), projected.patch);
    await git(["reset", "--hard", base]);
    await git(["am", join(directory, ".git/pr.patch")]);
    expect(await readFile(join(directory, "build.gradle.kts"), "utf8")).toBe(
      upstream.replace('library:1")', 'library:2")'),
    );
    await Effect.runPromise(assertPrProductionChanges(directory, base));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
