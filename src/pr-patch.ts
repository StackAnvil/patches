import { Schema } from "effect";
import { parseJson } from "./guards.ts";

interface FilteredLines {
  lines: string[];
  removed: string[];
}

export interface PrPatch {
  patch: string;
  omittedTests: boolean;
}

const testDirectory =
  /^(?:tests?|__tests__|testFixtures|integrationTest|functionalTest|fixtures|__snapshots__)$/u;

function isTestPath(path: string): boolean {
  // Below src/<source set>/, directories are packages or resources, such as a tool's test package.
  const sourceSet = /(?:^|\/)src\/([^/]+)\//u.exec(path)?.[1];
  return (
    (sourceSet === undefined
      ? path.split("/").some((segment) => testDirectory.test(segment))
      : testDirectory.test(sourceSet)) ||
    /(?:^|\/)(?:junit-platform\.properties|\.codecov\.ya?ml|codecov\.ya?ml)$/u.test(path) ||
    /\.(?:test|spec)\.[^/]+$/u.test(path)
  );
}

function diffPaths(section: string): string[] {
  const header = section.split("\n", 1)[0] ?? "";
  const match = /^diff --git ("a\/.*"|a\/.*) ("b\/.*"|b\/.*)$/u.exec(header);
  if (!match) throw new Error(`Unsupported PR diff header: ${header}`);
  return match.slice(1).map((path) => {
    const decoded = path.startsWith('"') ? parseJson(Schema.String, path) : path;
    return decoded.slice(2);
  });
}

// Count delimiters outside ordinary Gradle strings and line comments.
function delimiterBalance(line: string): number {
  const code = line.replaceAll(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$/gu, "");
  let balance = 0;
  for (const character of code) {
    if ("{([".includes(character)) balance++;
    if ("})]".includes(character)) balance--;
  }
  return balance;
}

function testConfiguration(line: string): boolean {
  const code = line.trim();
  return (
    /^(?:test(?:Implementation|RuntimeOnly|CompileOnly|Compile|Runtime|AnnotationProcessor|Fixtures\w*)\b|sourceSets[.(]test\b|configurations[.(]test\w*\b|test\s*\{|testing\b|tasks\.test\b|tasks\.(?:named|register)(?:<Test>)?\(\s*["']test["']|tasks\.withType(?:<Test>|\(Test\)))/u.test(
      code,
    ) ||
    /\b(?:mockitoAgent|MockitoAgentArgumentProvider)\b/u.test(code) ||
    /^(?:import\s+.*\b(?:junit|mockito)\b|\/\/.*\b(?:JUnit|Mockito)\b)/iu.test(code)
  );
}

function stripTestConfiguration(
  lines: string[],
  changed: Set<number>,
  unchanged: (start: number, end: number) => boolean,
  synthetic: boolean,
): FilteredLines {
  const removed = new Set<number>();
  // Drop the blank separator the patch added with a test block, never an upstream blank line.
  const addedBlank = (index: number) =>
    changed.has(index) && !removed.has(index) && !lines[index]?.trim();
  const remove = (start: number, end: number) => {
    for (let index = start; index <= end; index++) removed.add(index);
    if (addedBlank(start - 1)) removed.add(start - 1);
    else if (addedBlank(end + 1)) removed.add(end + 1);
  };
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if (!testConfiguration(line)) continue;
    let end = index;
    let balance = delimiterBalance(line);
    while (balance > 0 && end + 1 < lines.length) balance += delimiterBalance(lines[++end] ?? "");
    // Upstream test configuration that the patch leaves alone is context the PR patch needs.
    if (unchanged(index, end)) {
      index = end;
      continue;
    }
    if (
      balance > 0 &&
      lines.slice(index, end + 1).some((_, offset) => changed.has(index + offset))
    ) {
      throw new Error("Gradle test changes need complete block context before PR export");
    }
    remove(index, end);
    index = end;
  }
  // Test-only dependency and configuration blocks must not leave empty scaffolding.
  for (let index = 0; index < lines.length; index++) {
    if (!/^\s*(?:dependencies|configurations|sourceSets)\s*\{\s*$/u.test(lines[index] ?? ""))
      continue;
    let end = index;
    let balance = 1;
    while (balance > 0 && end + 1 < lines.length) balance += delimiterBalance(lines[++end] ?? "");
    if (balance !== 0) continue;
    const contents = lines.slice(index + 1, end);
    if (
      contents.some((_, offset) => removed.has(index + 1 + offset)) &&
      contents.every((line, offset) => !line.trim() || removed.has(index + 1 + offset))
    ) {
      remove(index, end);
    }
  }
  // When a run of patch lines holds only test configuration, its blank separators go with it.
  for (let start = 0; start < lines.length; start++) {
    if (!changed.has(start)) continue;
    let end = start;
    while (changed.has(end + 1)) end++;
    const run = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
    const code = run.filter((index) => lines[index]?.trim());
    if (code.length > 0 && code.every((index) => removed.has(index)))
      for (const index of run) removed.add(index);
    start = end;
  }
  return {
    // A synthetic block opener from the hunk header is never part of the hunk itself.
    lines: lines.filter((_, index) => !removed.has(index) && !(synthetic && index === 0)),
    removed: lines.filter((_, index) => removed.has(index)),
  };
}

function filterGradleDiff(section: string): { diff: string; omittedTests: boolean } {
  const parts = section.split(/(?=^@@ )/mu);
  const header = parts.shift() ?? "";
  if (parts.length === 0) return { diff: section, omittedTests: false };
  const hunks: string[] = [];
  let offset = 0;
  let omittedTests = false;
  for (const part of parts) {
    const lines = part.trimEnd().split("\n");
    const match = /^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@(.*)$/u.exec(lines.shift() ?? "");
    const [, oldStartText, hunkContext] = match ?? [];
    if (oldStartText === undefined || hunkContext === undefined)
      throw new Error("Unsupported Gradle hunk in PR patch");
    if (lines.some((line) => line.startsWith("\\")))
      throw new Error("Gradle PR patches must end with a newline");
    const context = hunkContext.trim();
    const inTestBlock =
      context.endsWith("{") &&
      testConfiguration(context) &&
      !lines.some((line) => line.slice(1).trim() === context);
    const side = (sign: string) => {
      const source = [
        ...(inTestBlock ? [{ line: ` ${context}`, position: -1 }] : []),
        ...lines.flatMap((line, position) =>
          line.startsWith(" ") || line.startsWith(sign) ? [{ line, position }] : [],
        ),
      ];
      // Only consecutive hunk context is unchanged; the other side may insert lines in between.
      const unchanged = (start: number, end: number) =>
        source
          .slice(start, end + 1)
          .every(
            ({ line, position }, index) =>
              line.startsWith(" ") &&
              (index === 0 || position === (source[start + index - 1]?.position ?? 0) + 1),
          );
      return stripTestConfiguration(
        source.map(({ line }) => line.slice(1)),
        new Set(source.flatMap(({ line }, index) => (line.startsWith(sign) ? [index] : []))),
        unchanged,
        inTestBlock,
      );
    };
    const before = side("-");
    const after = side("+");
    omittedTests ||= before.removed.join("\n") !== after.removed.join("\n");
    if (before.lines.join("\n") === after.lines.join("\n")) continue;
    if (
      before.lines.every((line) => !line.trim()) &&
      before.removed.length > 0 &&
      after.lines.length > 0
    ) {
      throw new Error(
        "Gradle production changes need non-test context before PR export. Expand the patch context or separate the test configuration.",
      );
    }
    let prefix = 0;
    while (
      prefix < Math.min(before.lines.length, after.lines.length) &&
      before.lines[prefix] === after.lines[prefix]
    )
      prefix++;
    let suffix = 0;
    while (
      suffix < Math.min(before.lines.length, after.lines.length) - prefix &&
      before.lines[before.lines.length - suffix - 1] ===
        after.lines[after.lines.length - suffix - 1]
    )
      suffix++;
    const oldStart = Number(oldStartText);
    const newStart = oldStart === 0 ? 1 : oldStart + offset;
    const body = [
      ...before.lines.slice(0, prefix).map((line) => ` ${line}`),
      ...before.lines.slice(prefix, before.lines.length - suffix).map((line) => `-${line}`),
      ...after.lines.slice(prefix, after.lines.length - suffix).map((line) => `+${line}`),
      ...before.lines.slice(before.lines.length - suffix).map((line) => ` ${line}`),
    ];
    hunks.push(
      `@@ -${oldStart},${before.lines.length} +${newStart},${after.lines.length} @@\n${body.join("\n")}\n`,
    );
    offset += after.lines.length - before.lines.length;
  }
  return {
    diff: hunks.length > 0 ? header.replace(/^index .*\n/mu, "") + hunks.join("") : "",
    omittedTests,
  };
}

/** CubeConverter publishes its complete feature; other projects retain tests locally. */
export function projectPrPatch(patch: string, project?: string): PrPatch {
  const normalized = patch.replaceAll("\r\n", "\n");
  const start = normalized.search(/^diff --git /mu);
  if (start < 0) throw new Error("Patch has no file changes");
  if (project === "cubeconverter") return { patch: normalized, omittedTests: false };
  const separator = normalized.lastIndexOf("\n---\n", start);
  const prefix =
    separator < 0
      ? normalized.slice(0, start)
      : `${normalized.slice(0, separator + "\n---\n".length)}\n`;
  const sections = normalized
    .slice(start)
    .replace(/\n-- \n[^\n]+\n?$/u, "\n")
    .split(/(?=^diff --git )/mu);
  const retained: string[] = [];
  let omittedTests = false;
  for (const section of sections) {
    if (!section) continue;
    const paths = diffPaths(section);
    if (paths.some((value) => isTestPath(value))) {
      if (!paths.every((value) => isTestPath(value)))
        throw new Error("Separate renames between production and test paths before preparing a PR");
      omittedTests = true;
      continue;
    }
    if (paths.some((path) => /\.gradle(?:\.kts)?$/u.test(path))) {
      const filtered = filterGradleDiff(section);
      omittedTests ||= filtered.omittedTests;
      if (filtered.diff) retained.push(filtered.diff);
    } else retained.push(section);
  }
  if (retained.length === 0)
    throw new Error("No production changes remain after excluding local tests");
  return { patch: prefix + retained.join(""), omittedTests };
}
