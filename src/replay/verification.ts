export interface SceneFeatures {
  skinUpdates: number;
  geometrySkinUpdates: number;
  skinTextures: string[];
  customActorIdentifiers: string[];
  unregisteredActorIdentifiers?: string[];
}

export interface RenderAudit {
  installedSkins: number;
  installedGeometrySkins: number;
  rejectedSkins: number;
  nativePlayerRendererSelections: number;
  nativePlayerRenderFrames: number;
  thirdPersonScene: boolean;
  actorIdentifiers: string[];
  resolvedModels: string[];
  skinTextures: string[];
}

/** Compare packet-derived expectations with actual client installation and evaluation. */
export function verifyRendering(expected: SceneFeatures, actual: RenderAudit | undefined, clientLog: string, hasOtherPlayers: boolean): string[] {
  const failures: string[] = [];
  const unregistered = new Set(expected.unregisteredActorIdentifiers ?? []);
  if (expected.skinUpdates || expected.customActorIdentifiers.length) {
    if (!actual) return ["The native renderer produced no audit."];
    if (actual.installedSkins !== expected.skinUpdates || actual.rejectedSkins) failures.push("The client did not install every recorded skin update.");
    if (actual.installedGeometrySkins !== expected.geometrySkinUpdates) failures.push("The client did not install every recorded skin geometry.");
    const installed = new Set(actual.skinTextures);
    if (expected.skinTextures.some((texture) => !installed.has(texture)) || installed.size !== expected.skinTextures.length) failures.push("Installed skin dimensions or pixels differ from the recording.");
    if (hasOtherPlayers && !actual.nativePlayerRendererSelections) failures.push("The client did not select the native player renderer.");
    if (expected.geometrySkinUpdates && (!actual.thirdPersonScene || !actual.nativePlayerRenderFrames)) failures.push("The client did not render the recorded local avatar in the third-person scene.");
    const actors = new Set(actual.actorIdentifiers);
    if (actual.actorIdentifiers.some((identifier) => unregistered.has(identifier))) failures.push("An unregistered actor unexpectedly reached custom model evaluation.");
    if (expected.customActorIdentifiers.some((identifier) => !actors.has(identifier))) failures.push("Some recorded custom actors never reached native model evaluation.");
    if (expected.customActorIdentifiers.length && !actual.resolvedModels.length) failures.push("The native renderer resolved no custom actor models.");
  }
  if (/Couldn't parse item model|Unable to bake model|Failed to bake|Multiple atlases|Failed to evaluate render controller|Failed to initialize custom entity variables|Could not evaluate the server's player render controllers|Could not load the server's player animation graph|Could not load classic skin animations|Failed to parse Bedrock (?:player geometry|persona geometry|skin options)/.test(clientLog)) failures.push("The client reported model parsing, baking, or controller failures.");
  if (/Missing textures in model|Missing texture references in model|Missing bedrock -> java block state mapping|Missing bedrock entity type|Unresolved server player costume|Unresolved native entity (?:geometry|texture)|Selected unresolved custom entity model/.test(clientLog)) failures.push("The scene has unresolved block, entity, or texture mappings.");
  if ([...clientLog.matchAll(/Unknown bedrock entity type: ([^\s]+)/g)].some((match) => !unregistered.has(match[1]!))) failures.push("The client rejected an advertised actor type.");
  if (/Client disconnected with reason|Failed to handle packet|ReadTimeoutException/.test(clientLog)) failures.push("The replay client disconnected or failed to handle a packet.");
  return failures;
}
