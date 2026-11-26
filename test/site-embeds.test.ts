import { expect, test } from "bun:test";
import { jsonLdScript, pageEmbed, pageHead } from "../site/src/lib/metadata";
import { serializeDiscordEmbed } from "../scripts/discord-embed";

test("download previews use the supplied release and Minecraft version", () => {
  const component = pageEmbed(
    { title: "Downloads", description: "Choose a build" },
    "releases",
    { title: "StackAnvil", url: "https://example.com", description: "Play" },
    { version: "stack-v9.8.7", minecraft: "26.4" },
  );
  if (!component) throw new Error("Expected a download preview");
  const content = serializeDiscordEmbed(component);
  expect(content).toContain("stack-v9.8.7");
  expect(content).toContain("Minecraft 26.4");
  expect(content).toContain("https://example.com/releases/");
});

test("guide previews and canonical URLs preserve the published paths", () => {
  const head = pageHead(
    { title: "Build from source", description: "Build a stack" },
    "build-from-source",
  );
  expect(head.links).toContainEqual({
    rel: "canonical",
    href: "https://stackanvil.pistonmaster.net/build-from-source/",
  });
  expect(head.meta).toContainEqual({
    property: "og:url",
    content: "https://stackanvil.pistonmaster.net/build-from-source/",
  });
  expect(head.scripts[0]?.children).toContain(
    "https://stackanvil.pistonmaster.net/build-from-source/",
  );
});

test("Discord preview JSON cannot close its containing script element", () => {
  const head = pageHead(
    { title: "</script><script>alert(1)</script>", description: "A guide" },
    "contributing",
  );
  expect(head.scripts[0]?.children).not.toContain("</script>");
  expect(() => JSON.parse(head.scripts[0]!.children)).not.toThrow();
});

test("a page title that already names the site does not repeat it", () => {
  const head = pageHead({ title: "Download StackAnvil", description: "Get the files" }, "releases");
  expect(head.meta).toContainEqual({ title: "Download StackAnvil" });
});

test("structured data cannot close its containing script element", () => {
  const script = jsonLdScript({ "@type": "Question", name: "</script><script>alert(1)</script>" });
  expect(script.children).not.toContain("</script>");
  expect(JSON.parse(script.children)).toMatchObject({
    "@context": "https://schema.org",
    name: "</script><script>alert(1)</script>",
  });
});
