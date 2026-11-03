interface FilteredLines {
  lines: string[];
  removed: string[];
}

export interface PrPatch {
  patch: string;
  omittedTests: boolean;
}

function isTestPath(path: string): boolean {
  return (
    /(?:^|\/)(?:tests?|__tests__|testFixtures|integrationTest|functionalTest|fixtures|__snapshots__)(?:\/|$)/.test(
      path,
    ) ||
    /(?:^|\/)(?:junit-platform\.properties|\.codecov\.ya?ml|codecov\.ya?ml)$/.test(path) ||
    /\.(?:test|spec)\.[^/]+$/.test(path)
  );
}

function diffPaths(section: string): string[] {
  const header = section.split("\n", 1)[0]!;
  const match = /^diff --git ("a\/.*"|a\/.*) ("b\/.*"|b\/.*)$/.exec(header);
  if (!match) throw new Error(`Unsupported PR diff header: ${header}`);
  return match.slice(1).map((path) => {
    const decoded: string = path.startsWith('"') ? JSON.parse(path) : path;
    return decoded.slice(2);
  });
}

// Count delimiters outside ordinary Gradle strings and line comments.
function delimiterBalance(line: string): number {
  const code = line.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$/g, "");
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
    /^(?:test(?:Implementation|RuntimeOnly|CompileOnly|Compile|Runtime|AnnotationProcessor|Fixtures\w*)\b|sourceSets[.(]test\b|configurations[.(]test\w*\b|test\s*\{|testing\b|tasks\.test\b|tasks\.(?:named|register)(?:<Test>)?\(\s*["']test["']|tasks\.withType(?:<Test>|\(Test\)))/.test(
      code,
    ) ||
    /\b(?:mockitoAgent|MockitoAgentArgumentProvider)\b/.test(code) ||
    /^(?:import\s+.*\b(?:junit|mockito)\b|\/\/.*\b(?:JUnit|Mockito)\b)/i.test(code)
  );
}

function stripTestConfiguration(lines: string[], changed: Set<number>): FilteredLines {
  const removed = new Set<number>();
  const remove = (start: number, end: number) => {
    for (let index = start; index <= end; index++) removed.add(index);
    if (start > 0 && !lines[start - 1]!.trim()) removed.add(start - 1);
    else if (end + 1 < lines.length && !lines[end + 1]!.trim()) removed.add(end + 1);
  };
  for (let index = 0; index < lines.length; index++) {
    if (!testConfiguration(lines[index]!)) continue;
    let end = index;
    let balance = delimiterBalance(lines[index]!);
    while (balance > 0 && end + 1 < lines.length) balance += delimiterBalance(lines[++end]!);
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
    if (!/^\s*(?:dependencies|configurations|sourceSets)\s*\{\s*$/.test(lines[index]!)) continue;
    let end = index;
    let balance = 1;
    while (balance > 0 && end + 1 < lines.length) balance += delimiterBalance(lines[++end]!);
    if (balance !== 0) continue;
    const contents = lines.slice(index + 1, end);
    if (
      contents.some((_, offset) => removed.has(index + 1 + offset)) &&
      contents.every((line, offset) => !line.trim() || removed.has(index + 1 + offset))
    ) {
      remove(index, end);
    }
  }
  return {
    lines: lines.filter((_, index) => !removed.has(index)),
    removed: lines.filter((_, index) => removed.has(index)),
  };
}

function filterGradleDiff(section: string): { diff: string; omittedTests: boolean } {
  const parts = section.split(/(?=^@@ )/m);
  const header = parts.shift()!;
  if (!parts.length) return { diff: section, omittedTests: false };
  const hunks: string[] = [];
  let offset = 0;
  let omittedTests = false;
  for (const part of parts) {
    const lines = part.trimEnd().split("\n");
    const match = /^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@(.*)$/.exec(lines.shift()!);
    if (!match) throw new Error("Unsupported Gradle hunk in PR patch");
    if (lines.some((line) => line.startsWith("\\")))
      throw new Error("Gradle PR patches must end with a newline");
    const context = match[2]!.trim();
    const inTestBlock =
      context.endsWith("{") &&
      testConfiguration(context) &&
      !lines.some((line) => line.slice(1).trim() === context);
    const side = (sign: string) => {
      const source = [
        ...(inTestBlock ? [` ${context}`] : []),
        ...lines.filter((line) => line.startsWith(" ") || line.startsWith(sign)),
      ];
      return stripTestConfiguration(
        source.map((line) => line.slice(1)),
        new Set(source.flatMap((line, index) => (line.startsWith(sign) ? [index] : []))),
      );
    };
    const before = side("-");
    const after = side("+");
    omittedTests ||= before.removed.join("\n") !== after.removed.join("\n");
    if (before.lines.join("\n") === after.lines.join("\n")) continue;
    if (!before.lines.length && before.removed.length && after.lines.length) {
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
    const oldStart = Number(match[1]);
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
    diff: hunks.length ? header.replace(/^index .*\n/m, "") + hunks.join("") : "",
    omittedTests,
  };
}

/** Keep the saved full-stack patch intact and prepare only its production changes. */
export function projectPrPatch(patch: string): PrPatch {
  const normalized = patch.replaceAll("\r\n", "\n");
  const start = normalized.search(/^diff --git /m);
  if (start < 0) throw new Error("Patch has no file changes");
  const separator = normalized.lastIndexOf("\n---\n", start);
  const prefix = separator < 0 ? "" : normalized.slice(0, separator + "\n---\n".length) + "\n";
  const sections = normalized
    .slice(start)
    .replace(/\n-- \n[^\n]+\n?$/, "\n")
    .split(/(?=^diff --git )/m);
  const retained: string[] = [];
  let omittedTests = false;
  for (const section of sections) {
    if (!section) continue;
    const paths = diffPaths(section);
    if (paths.some(isTestPath)) {
      if (!paths.every(isTestPath))
        throw new Error("Separate renames between production and test paths before preparing a PR");
      omittedTests = true;
      continue;
    }
    if (paths.some((path) => /\.gradle(?:\.kts)?$/.test(path))) {
      const filtered = filterGradleDiff(section);
      omittedTests ||= filtered.omittedTests;
      if (filtered.diff) retained.push(filtered.diff);
    } else retained.push(section);
  }
  if (!retained.length) throw new Error("No production changes remain after excluding local tests");
  return { patch: prefix + retained.join(""), omittedTests };
}
