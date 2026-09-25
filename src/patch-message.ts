export interface PatchMessage {
  title: string;
  description: string;
}

export function parsePatchMessage(patch: string): PatchMessage {
  const normalized = patch.replaceAll("\r\n", "\n");
  const [headers, message] = normalized.split("\n\n", 2);
  if (!headers || message === undefined) throw new Error("Patch has no commit message");

  const subject = headers.match(/^Subject: (.*(?:\n[ \t].*)*)$/m)?.[1];
  const title = subject?.replace(/\n[ \t]+/g, " ").replace(/^\[PATCH(?: \d+\/\d+)?\] /, "").trim();
  if (!title) throw new Error("Patch has no commit subject");

  const bodyStart = headers.length + 2;
  const separator = normalized.indexOf("\n---\n", bodyStart);
  if (separator < 0) throw new Error(`Patch ${title} has no diff separator`);
  return { title, description: normalized.slice(bodyStart, separator).trim() };
}
