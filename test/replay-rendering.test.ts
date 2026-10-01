import { expect, test } from "bun:test";
import { verifyRendering, type RenderAudit, type SceneFeatures } from "../src/replay/verification.ts";

const expected: SceneFeatures = { skinUpdates: 3, geometrySkinUpdates: 3, skinTextures: ["64x64:abc", "128x128:def"], customActorIdentifiers: ["probe:dragon"] };
const actual: RenderAudit = { installedSkins: 3, installedGeometrySkins: 3, rejectedSkins: 0, nativePlayerRendererSelections: 2, nativePlayerRenderFrames: 4, thirdPersonScene: true, skinTextures: [...expected.skinTextures], actorIdentifiers: ["probe:dragon"], resolvedModels: ["geometry.dragon:dragon"] };

test("validates native installation independently of transport and ignores duplicate identical skins", () => {
  expect(verifyRendering(expected, actual, "", true)).toEqual([]);
  expect(verifyRendering(expected, { ...actual, skinTextures: ["64x64:abc", "128x128:changed"] }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, installedSkins: 2 }, "", true)).toHaveLength(1);
});

test("detects dropped actors, generic player rendering, and malformed assets", () => {
  expect(verifyRendering(expected, { ...actual, actorIdentifiers: [], resolvedModels: [], nativePlayerRendererSelections: 0 }, "", true)).toHaveLength(3);
  expect(verifyRendering(expected, actual, "Couldn't parse item model: Empty case list\nFailed to handle packet", true)).toHaveLength(2);
  expect(verifyRendering(expected, undefined, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, actual, "Missing texture references in model viabedrock:block/custom/slot_1:\n    particle", true)).toHaveLength(1);
});

test("requires an actual third-person local-avatar submission rather than selection alone", () => {
  expect(verifyRendering(expected, { ...actual, nativePlayerRenderFrames: 0 }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, thirdPersonScene: false }, "", true)).toHaveLength(1);
});

test("keeps unadvertised actors separate from failures to render advertised assets", () => {
  const recorded = { ...expected, unregisteredActorIdentifiers: ["probe:unregistered"] };
  expect(verifyRendering(recorded, actual, "Unknown bedrock entity type: probe:unregistered", true)).toEqual([]);
  expect(verifyRendering(recorded, actual, "Unknown bedrock entity type: probe:dragon", true)).toHaveLength(1);
  expect(verifyRendering(recorded, { ...actual, actorIdentifiers: [...actual.actorIdentifiers, "probe:unregistered"] }, "", true)).toHaveLength(1);
});


test("rejects costume and animation errors even when native skin installation succeeds", () => {
  for (const warning of [
    "Could not evaluate the server's player render controllers",
    "Could not load the server's player animation graph",
    "Could not load classic skin animations",
  ]) {
    expect(verifyRendering(expected, actual, warning, true)).toHaveLength(1);
  }
});
