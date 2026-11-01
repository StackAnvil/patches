import { expect, test } from "bun:test";
import { pageEmbed } from "../scripts/generate-discord-embeds";
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
