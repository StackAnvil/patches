import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assetZip } from "../scripts/bundle-bedrock-assets.ts";
import {
  builtinAssetsResource,
  prepareSharedAddOnAssets,
  verifyBuiltinAssets,
  verifyEmbeddedBuiltinAssets,
} from "../src/bedrock-assets.ts";
import { builtinImageBundle } from "../src/bedrock-images.ts";
import { zipEntries } from "../src/zip.ts";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function fixture(mutate: (files: Map<string, Buffer>) => void = () => {}) {
  const directory = await mkdtemp(join(tmpdir(), "stackanvil-actors-"));
  directories.push(directory);
  const files = new Map(
    [
      "entity/player.entity.json",
      "models/mobs.json",
      "animations/player.animation.json",
      "animation_controllers/player.animation_controllers.json",
      "render_controllers/player.render_controllers.json",
      "materials/entity.material",
      "attachables/shield.json",
    ].map((path) => [`library/vanilla/${path}`, Buffer.from("{}")]),
  );
  mutate(files);
  const bytes = assetZip(files);
  await writeFile(join(directory, "builtin-01.zip"), bytes);
  await writeFile(
    join(directory, "manifest.json"),
    JSON.stringify({
      format: 1,
      version: "1.26.51.1",
      protocolVersion: "1.26.51",
      files: files.size,
      expandedBytes: [...files.values()].reduce((sum, file) => sum + file.length, 0),
      archives: [
        {
          name: "builtin-01.zip",
          files: files.size,
          expandedBytes: [...files.values()].reduce((sum, file) => sum + file.length, 0),
          sha256: createHash("sha256").update(bytes).digest("hex"),
        },
      ],
    }),
  );
  return directory;
}

describe("bundled actor dependencies", () => {
  test("verifies exact archives in the distributable and rejects omitted archives", async () => {
    const directory = await fixture();
    const resources = await verifyBuiltinAssets(directory, "1.26.51.1");
    const artifact = join(directory, "addon.jar");
    await writeFile(
      artifact,
      assetZip(
        new Map([...resources].map(([name, bytes]) => [`${builtinAssetsResource}/${name}`, bytes])),
      ),
    );
    await verifyEmbeddedBuiltinAssets(artifact, directory, "1.26.51.1");
    await writeFile(
      artifact,
      assetZip(
        new Map([
          [
            `${builtinAssetsResource}/manifest.json`,
            await readFile(join(directory, "manifest.json")),
          ],
        ]),
      ),
    );
    await expect(verifyEmbeddedBuiltinAssets(artifact, directory, "1.26.51.1")).rejects.toThrow();
  });

  test("rejects damaged archives and incomplete actor dependencies", async () => {
    const directory = await fixture();
    await writeFile(join(directory, "builtin-01.zip"), Buffer.from("damaged"));
    await expect(verifyBuiltinAssets(directory, "1.26.51.1")).rejects.toThrow();
    for (const path of ["materials/entity.material", "attachables/shield.json"]) {
      const incomplete = await fixture((files) => files.delete(`library/vanilla/${path}`));
      await expect(verifyBuiltinAssets(incomplete, "1.26.51.1")).rejects.toThrow();
    }
    const empty = await fixture((files) =>
      files.set("library/vanilla/models/placeholder.json", Buffer.alloc(0)),
    );
    await expect(verifyBuiltinAssets(empty, "1.26.51.1")).rejects.toThrow();
  });
});

describe("shared add-on resources", () => {
  const texture = "library/vanilla/textures/entity/pig.png";

  /** A tracked asset root with one texture, its derived core image bundle, and an OreUI bundle. */
  async function source() {
    const library = await fixture((files) => files.set(texture, Buffer.from("pig")));
    const root = await mkdtemp(join(tmpdir(), "stackanvil-addon-assets-"));
    directories.push(root);
    const addOn = join(root, "assets", "viafabricplus-bedrock");
    await mkdir(join(root, builtinAssetsResource), { recursive: true });
    for (const name of ["builtin-01.zip", "manifest.json"])
      await writeFile(join(root, builtinAssetsResource, name), await readFile(join(library, name)));
    await writeFile(join(root, builtinAssetsResource, "NOTICE.txt"), "notice");
    await writeFile(join(addOn, "builtin_oreui.zip"), "oreui");
    await mkdir(join(root, "assets", "viabedrock"), { recursive: true });
    await writeFile(join(root, "assets", "viabedrock", "builtin_ui.zip"), "core ui");
    const archive = zipEntries(await readFile(join(library, "builtin-01.zip")));
    const images = builtinImageBundle(
      new Map([...archive].map(([path, read]) => [path, read()])),
      "1.26.51.1",
    );
    const imagesPath = join(root, "builtin_images.zip");
    await writeFile(imagesPath, images);
    return { root, images, imagesPath };
  }

  test("keeps each resource once while the add-on and core JARs still hold the whole library", async () => {
    const { root, images, imagesPath } = await source();
    const output = join(root, "prepared");
    await prepareSharedAddOnAssets(root, "1.26.51.1", imagesPath, output);
    const library = join(output, builtinAssetsResource);
    const resources = await verifyBuiltinAssets(library, "1.26.51.1", images);
    const archived = new Set(
      [...resources]
        .filter(([name]) => name.endsWith(".zip"))
        .flatMap(([, bytes]) => [...zipEntries(bytes).keys()]),
    );
    expect(archived.has(texture)).toBe(false);
    expect(archived.has("library/vanilla/models/mobs.json")).toBe(true);
    expect(
      await readFile(join(output, "assets", "viafabricplus-bedrock", "builtin_oreui.zip"), "utf8"),
    ).toBe("oreui");
    expect(
      await readFile(join(output, "assets", "viabedrock", "builtin_ui.zip")).catch(() => undefined),
    ).toBeUndefined();

    const core = assetZip(new Map([["assets/viabedrock/builtin_images.zip", images]]));
    const jarFiles = new Map<string, Buffer>([
      ["META-INF/jars/ViaBedrock-1.0.jar", core],
      ...[...resources].map(
        ([name, bytes]) => [`${builtinAssetsResource}/${name}`, bytes] as const,
      ),
    ]);
    const artifact = join(root, "addon.jar");
    await writeFile(artifact, assetZip(jarFiles));
    await verifyEmbeddedBuiltinAssets(artifact, library, "1.26.51.1");

    jarFiles.set("assets/viabedrock/builtin_ui.zip", Buffer.from("core ui"));
    await writeFile(artifact, assetZip(jarFiles));
    await expect(verifyEmbeddedBuiltinAssets(artifact, library, "1.26.51.1")).rejects.toThrow(
      "repeats the core resource",
    );
    jarFiles.delete("assets/viabedrock/builtin_ui.zip");
    jarFiles.set("META-INF/jars/ViaBedrock-1.0.jar", assetZip(new Map([["x", Buffer.from("x")]])));
    await writeFile(artifact, assetZip(jarFiles));
    await expect(verifyEmbeddedBuiltinAssets(artifact, library, "1.26.51.1")).rejects.toThrow();
  });

  test("refuses a core image bundle that differs from the add-on textures", async () => {
    const { root, imagesPath } = await source();
    const other = builtinImageBundle(new Map([[texture, Buffer.from("cow")]]), "1.26.51.1");
    await writeFile(imagesPath, other);
    await expect(
      prepareSharedAddOnAssets(root, "1.26.51.1", imagesPath, join(root, "prepared")),
    ).rejects.toThrow("does not match");
  });
});
