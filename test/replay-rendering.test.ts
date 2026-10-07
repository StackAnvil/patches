import { expect, test } from "bun:test";
import { hasGameplayAcknowledgments, verifyRendering, type RenderAudit, type SceneFeatures } from "../src/replay/verification.ts";

test("gameplay requires local initialization and either movement protocol", () => {
  const incomplete: Record<number, number>[] = [{}, { 113: 1 }, { 144: 20 }, { 19: 20 }, { 113: 0, 144: 20 }];
  for (const ids of incomplete) {
    expect(hasGameplayAcknowledgments(ids)).toBeFalse();
  }
  expect(hasGameplayAcknowledgments({ 113: 1, 144: 20 })).toBeTrue();
  expect(hasGameplayAcknowledgments({ 113: 1, 19: 20 })).toBeTrue();
});

const expected: SceneFeatures = { skinUpdates: 3, geometrySkinUpdates: 3, localGeometrySkinUpdates: 1, skinTextures: ["64x64:abc", "128x128:def"], fullSkinRecords: { abc: 2, def: 1 }, customActorIdentifiers: ["probe:dragon"] };
const actual: RenderAudit = { installedSkins: 3, installedGeometrySkins: 3, rejectedSkins: 0, nativePlayerRendererSelections: 2, nativePlayerRenderFrames: 4, nativeOtherPlayerRenderFrames: 5, thirdPersonScene: true, skinTextures: [...expected.skinTextures], fullSkinRecords: { ...expected.fullSkinRecords }, actorIdentifiers: ["probe:dragon"], evaluatedModels: ["geometry.dragon:dragon"], nativeCustomActorResolvedModels: 2, nativeCustomActorRenderFrames: 3 };
test("validates native installation independently of transport and ignores duplicate identical skins", () => {
  expect(verifyRendering(expected, actual, "", true)).toEqual([]);
  expect(verifyRendering(expected, { ...actual, skinTextures: ["64x64:abc", "128x128:changed"] }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, installedSkins: 2 }, "", true)).toHaveLength(1);
});
test("detects changed skin metadata with identical pixels and installation counts", () => {
  expect(verifyRendering(expected, { ...actual, fullSkinRecords: { abc: 2, changed: 1 } }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, fullSkinRecords: { ...actual.fullSkinRecords, extra: 1 } }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, fullSkinRecords: { abc: 1, def: 2 } }, "", true)).toHaveLength(1);
});
test("detects dropped actors, generic player rendering, and malformed assets", () => {
  expect(verifyRendering(expected, { ...actual, actorIdentifiers: [], evaluatedModels: [], nativePlayerRendererSelections: 0 }, "", true)).toHaveLength(3);
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
    "Failed to load model viabedrock:models/entities/probe/invisible.json",
  ]) {
    expect(verifyRendering(expected, actual, warning, true)).toHaveLength(1);
  }
});

test("requires actual native custom actor model resolution and draw submission", () => {
  expect(verifyRendering(expected, { ...actual, nativeCustomActorResolvedModels: 0 }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, nativeCustomActorRenderFrames: 0 }, "", true)).toHaveLength(1);
});


test("fails a crashed replay even if appearance updates completed", () => {
  for (const crash of ["Unreported exception thrown!", "Reported exception thrown!", "A fatal error has been detected by the Java Runtime Environment", "handlerAdded() has thrown"]) {
    expect(verifyRendering(expected, actual, crash, true)).toHaveLength(1);
  }
});


test("requires remote native submissions when the recording omits local-player geometry", () => {
  const remoteOnly = { ...expected, localGeometrySkinUpdates: 0 };
  const remoteDraw = { ...actual, nativePlayerRenderFrames: 0, thirdPersonScene: false };
  expect(verifyRendering(remoteOnly, remoteDraw, "", true)).toEqual([]);
  expect(verifyRendering(remoteOnly, { ...remoteDraw, nativeOtherPlayerRenderFrames: 0 }, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, remoteDraw, "", true)).toHaveLength(1);
  expect(verifyRendering(expected, { ...actual, nativeOtherPlayerRenderFrames: 0 }, "", true)).toHaveLength(1);
});

test("uses required proxy controller observations independently of client drawable models", () => {
  const audit = { schema: 1, transformed: true, identifiers: { [expected.customActorIdentifiers[0]!]: 2 }, failures: [] };
  const drawableOnly = { ...actual, actorIdentifiers: [] };
  expect(verifyRendering(expected, drawableOnly, "", true, { required: true, audit })).toEqual([]);
  expect(verifyRendering(expected, actual, "", true, { required: true })).not.toHaveLength(0);
  for (const invalid of [
    { ...audit, transformed: false },
    { ...audit, failures: [new Error("observer failure").toString()] },
    { ...audit, identifiers: {} },
    { ...audit, identifiers: { [expected.customActorIdentifiers[0]!]: 0 } },
  ]) expect(verifyRendering(expected, actual, "", true, { required: true, audit: invalid })).not.toHaveLength(0);
  expect(verifyRendering(expected, { ...drawableOnly, nativeCustomActorRenderFrames: 0 }, "", true, { required: true, audit })).not.toHaveLength(0);
  expect(verifyRendering(expected, actual, "Failed to evaluate render controller", true, { required: true, audit })).not.toHaveLength(0);
});

test("accepts an idle proxy observer when the recording has no custom controllers", () => {
  const vanilla = { ...expected, customActorIdentifiers: [] };
  const audit = { schema: 1, transformed: false, identifiers: {}, failures: [] };
  expect(verifyRendering(vanilla, actual, "", true, { required: true, audit })).toEqual([]);
  expect(verifyRendering(vanilla, actual, "", true, { required: true })).not.toHaveLength(0);
  expect(verifyRendering(expected, actual, "", true, { required: true, audit })).not.toHaveLength(0);
});
