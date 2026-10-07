export interface SceneFeatures {
  skinUpdates: number;
  geometrySkinUpdates: number;
  localGeometrySkinUpdates: number;
  skinTextures: string[];
  fullSkinRecords: Record<string, number>;
  customActorIdentifiers: string[];
  unregisteredActorIdentifiers?: string[];
}

export interface RenderAudit {
  installedSkins: number;
  installedGeometrySkins: number;
  rejectedSkins: number;
  nativePlayerRendererSelections: number;
  nativePlayerRenderFrames: number;
  nativeOtherPlayerRenderFrames: number;
  thirdPersonScene: boolean;
  actorIdentifiers: string[];
  evaluatedModels: string[];
  nativeCustomActorResolvedModels: number;
  nativeCustomActorRenderFrames: number;
  skinTextures: string[];
  fullSkinRecords: Record<string, number>;
}

export interface ControllerAudit {
  schema: number;
  transformed: boolean;
  identifiers: Record<string, number>;
  failures: string[];
}

export interface ControllerObservation {
  required: boolean;
  audit?: ControllerAudit;
}

/** Compare packet expectations with client drawing and controller evaluation on the active route. */
export function verifyRendering(expected: SceneFeatures, actual: RenderAudit | undefined, clientLog: string, hasOtherPlayers: boolean, controller?: ControllerObservation): string[] {
  const failures: string[] = [];
  const unregistered = new Set(expected.unregisteredActorIdentifiers ?? []);
  let proxyActors: string[] = [];
  if (controller?.required) {
    const audit = controller.audit;
    if (!audit || audit.schema !== 1 || typeof audit.transformed !== "boolean"
      || (expected.customActorIdentifiers.length > 0 && !audit.transformed)
      || !Array.isArray(audit.failures) || audit.failures.length
      || !audit.identifiers || typeof audit.identifiers !== "object" || Array.isArray(audit.identifiers)
      || Object.values(audit.identifiers).some((count) => !Number.isSafeInteger(count) || count <= 0)) {
      failures.push("The proxy produced no valid controller evaluation audit.");
    } else proxyActors = Object.keys(audit.identifiers);
  }

  if (expected.skinUpdates || expected.customActorIdentifiers.length) {
    if (!actual) return [...failures, "The native renderer produced no audit."];
    if (actual.installedSkins !== expected.skinUpdates || actual.rejectedSkins) failures.push("The client did not install every recorded skin update.");
    if (actual.installedGeometrySkins !== expected.geometrySkinUpdates) failures.push("The client did not install every recorded skin geometry.");
    const installed = new Set(actual.skinTextures);
    if (expected.skinTextures.some((texture) => !installed.has(texture)) || installed.size !== expected.skinTextures.length) failures.push("Installed skin dimensions or pixels differ from the recording.");
    const records = actual.fullSkinRecords ?? {};
    if (Object.entries(expected.fullSkinRecords).some(([hash, count]) => records[hash] !== count)
      || Object.keys(records).length !== Object.keys(expected.fullSkinRecords).length) failures.push("Installed skin records differ from the recording.");
    if (hasOtherPlayers && !actual.nativePlayerRendererSelections) failures.push("The client did not select the native player renderer.");
    if (expected.localGeometrySkinUpdates && (!actual.thirdPersonScene || !actual.nativePlayerRenderFrames)) failures.push("The client did not render the recorded local avatar in the third-person scene.");
    if (hasOtherPlayers && expected.geometrySkinUpdates > expected.localGeometrySkinUpdates && !actual.nativeOtherPlayerRenderFrames) failures.push("The client did not submit recorded remote-player geometry to the native renderer.");
    const evaluated = controller?.required ? proxyActors : actual.actorIdentifiers;
    const actors = new Set(evaluated);
    if (controller?.required && evaluated.some((identifier) => unregistered.has(identifier))) failures.push("An unregistered actor reached proxy controller evaluation.");
    if (actual.actorIdentifiers.some((identifier) => unregistered.has(identifier))) failures.push("An unregistered actor unexpectedly reached custom model evaluation.");
    if (expected.customActorIdentifiers.some((identifier) => !actors.has(identifier))) failures.push("Some recorded custom actors never reached native model evaluation.");
    if (expected.customActorIdentifiers.length) {
      if (!actual.evaluatedModels.length) failures.push("The client evaluated no custom actor models.");
      if (!(actual.nativeCustomActorResolvedModels > 0) || !(actual.nativeCustomActorRenderFrames > 0)) failures.push("The native custom actor renderer did not resolve and submit drawable models.");
    }
  }
  if (/Couldn't parse item model|Failed to load model|Unable to bake model|Failed to bake|Multiple atlases|Failed to evaluate render controller|Failed to initialize custom entity variables|Could not evaluate the server's player render controllers|Could not load the server's player animation graph|Could not load native actor graph|Could not load classic skin animations|Failed to parse Bedrock (?:player geometry|persona geometry|skin options)/.test(clientLog)) failures.push("The replay reported model parsing, baking, or controller failures.");
  if (/Missing textures in model|Missing texture references in model|Missing bedrock -> java block state mapping|Missing bedrock entity type|Unresolved server player costume|Unresolved native entity (?:geometry|texture)|Selected unresolved custom entity model/.test(clientLog)) failures.push("The scene has unresolved block, entity, or texture mappings.");
  if ([...clientLog.matchAll(/Unknown bedrock entity type: ([^\s]+)/g)].some((match) => !unregistered.has(match[1]!))) failures.push("The client rejected an advertised actor type.");
  if (/Client disconnected with reason|Failed to handle packet|ReadTimeoutException|(?:Unreported|Reported) exception thrown!|A fatal error has been detected by the Java Runtime Environment|Mixin transformation .* failed|handlerAdded\(\) has thrown/.test(clientLog)) failures.push("The replay client disconnected or failed to handle a packet.");
  return failures;
}
/** Protocol 2193: client initialization plus movement proves more than a server spawn notification. */
export function hasGameplayAcknowledgments(ids: Record<number, number>): boolean {
  return (ids[113] ?? 0) > 0 && ((ids[144] ?? 0) > 0 || (ids[19] ?? 0) > 0);
}
