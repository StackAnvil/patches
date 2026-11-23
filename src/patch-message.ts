export interface PatchMessage {
  title: string;
  description: string;
}

function decodeQuoted(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === "_") bytes.push(0x20);
    else if (character === "=" && /^[0-9A-Fa-f]{2}$/u.test(text.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(text.slice(index + 1, index + 3), 16));
      index += 2;
    } else bytes.push(text.codePointAt(index) ?? 0);
  }
  return Uint8Array.from(bytes);
}

// git format-patch MIME-encodes non-ASCII subjects (RFC 2047); git am decodes them.
function decodeHeader(value: string): string {
  return value
    .replaceAll(/(\?=)\s+(?==\?)/gu, "$1")
    .replaceAll(
      /=\?([^?\s]+)\?([BbQq])\?([^?\s]*)\?=/gu,
      (_, charset: string, encoding: string, text: string) =>
        new TextDecoder(charset).decode(
          encoding.toUpperCase() === "B" ? Buffer.from(text, "base64") : decodeQuoted(text),
        ),
    );
}

export function parsePatchMessage(patch: string): PatchMessage {
  const normalized = patch.replaceAll("\r\n", "\n");
  const [headers, message] = normalized.split("\n\n", 2);
  if (!headers || message === undefined) throw new Error("Patch has no commit message");

  const subject = headers.match(/^Subject: (.*(?:\n[ \t].*)*)$/mu)?.[1];
  const title =
    subject &&
    decodeHeader(subject.replaceAll(/\n[ \t]+/gu, " "))
      .replace(/^\[PATCH(?: \d+\/\d+)?\] /u, "")
      .trim();
  if (!title) throw new Error("Patch has no commit subject");

  const bodyStart = headers.length + 2;
  const separator = normalized.indexOf("\n---\n", bodyStart);
  const diffStart = normalized.search(/^diff --git /mu);
  const bodyEnd =
    separator >= 0 && (diffStart < 0 || separator < diffStart) ? separator : diffStart;
  if (bodyEnd < bodyStart) throw new Error(`Patch ${title} has no file changes`);
  return { title, description: normalized.slice(bodyStart, bodyEnd).trim() };
}
