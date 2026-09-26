import { system, world } from "@minecraft/server";
import { catalog } from "./catalog.js";
import { gameplayIds, prepareGameplay, resetGameplay, verifyGameplay } from "./gameplay.js";

const TAG = "viabedrock_entity_probe";
const entries = new Map(catalog.map((entry) => [entry.type, entry]));
const scenarios = [
  { name: "hurt", group: "status", type: "minecraft:zombie", run: (entity) => entity.applyDamage(1) },
  { name: "death", group: "status", type: "minecraft:zombie", run: (entity) => entity.kill() },
  { name: "tame", group: "status", type: "minecraft:wolf", run: (entity) => entity.triggerEvent("minecraft:on_tame") },
  { name: "sheep-eat", group: "status", type: "minecraft:sheep", run: (entity) => entity.triggerEvent("minecraft:on_eat_block") },
  { name: "creeper-prime", group: "status", type: "minecraft:creeper", run: (entity) => entity.triggerEvent("minecraft:start_exploding_forced") },
  { name: "zombie-convert", group: "status", type: "minecraft:zombie", run: (entity) => entity.triggerEvent("minecraft:start_transforming_into_drowned") },
  { name: "ravager-roar", group: "status", type: "minecraft:ravager", run: (entity) => entity.triggerEvent("minecraft:start_roar") },
  { name: "name", group: "metadata", type: "minecraft:cow", run: (entity) => { entity.nameTag = "ViaBedrock metadata probe"; },
    verify: (entity) => entity.nameTag === "ViaBedrock metadata probe" },
  { name: "fire", group: "metadata", type: "minecraft:cow", run: (entity) => entity.setOnFire(8, false) },
  { name: "invisible", group: "metadata", type: "minecraft:cow", run: (entity) => entity.addEffect("invisibility", 160),
    verify: (entity) => Boolean(entity.getEffect("invisibility")) },
  { name: "effect", group: "metadata", type: "minecraft:cow", run: (entity) => entity.addEffect("speed", 160, { amplifier: 1 }),
    verify: (entity) => entity.getEffect("speed")?.amplifier === 1 },
  { name: "sheared", group: "metadata", type: "minecraft:sheep", run: (entity) => entity.triggerEvent("minecraft:on_sheared") },
  { name: "wolf-variant", group: "metadata", type: "minecraft:wolf", run: (entity) => entity.setProperty("minecraft:sound_variant", "grumpy"),
    verify: (entity) => entity.getProperty("minecraft:sound_variant") === "grumpy" },
  { name: "bee-nectar", group: "metadata", type: "minecraft:bee", run: (entity) => entity.setProperty("minecraft:has_nectar", true),
    verify: (entity) => entity.getProperty("minecraft:has_nectar") === true },
  { name: "copper-oxidation", group: "metadata", type: "minecraft:copper_golem", run: (entity) => entity.setProperty("minecraft:oxidation_level", "oxidized"),
    verify: (entity) => entity.getProperty("minecraft:oxidation_level") === "oxidized" },
];

let queue = [];
let position = 0;
let interval;
let operator;
let queueGroup;
let passed = 0;
let failed = 0;

function say(message, quiet = false) {
  console.warn(`[ViaBedrock Entity Probe] ${message}`);
  if (!quiet) world.sendMessage(`§7[VB probe] §f${message}`);
}

function normalizeType(type) {
  return type.includes(":") ? type : `minecraft:${type}`;
}

function currentPlayer(source) {
  if (source?.isValid && source.typeId === "minecraft:player") return source;
  if (operator?.isValid) return operator;
  return world.getAllPlayers()[0];
}

function clearProbeEntities() {
  for (const dimensionId of ["overworld", "nether", "the_end"]) {
    const dimension = world.getDimension(dimensionId);
    for (const entity of dimension.getEntities({ tags: [TAG] })) {
      try { entity.remove(); } catch (error) { console.warn(`[ViaBedrock Entity Probe] cleanup: ${error}`); }
    }
  }
}

async function execute(test, source, quiet = false) {
  const player = currentPlayer(source);
  if (!player) {
    say("A player must be online to locate the probe.");
    return false;
  }

  clearProbeEntities();
  const location = player.location;
  let entity;
  try {
    entity = player.dimension.spawnEntity(test.type, {
      x: location.x + 8,
      y: location.y,
      z: location.z + 8,
    });
    entity.addTag(TAG);

    if (test.kind === "event") entity.triggerEvent(test.event);
    if (test.kind === "property") entity.setProperty(test.property, test.value);
    if (test.kind === "scenario") test.run(entity);

    await new Promise((resolve) => system.runTimeout(() => resolve(), 1));
    const verified = test.kind === "property" ? entity.getProperty(test.property) === test.value
      : test.verify ? test.verify(entity) : true;
    if (!verified) {
      say(`${test.label}: server state did not match the requested value.`, quiet);
      return false;
    }

    say(`${test.label}: script action accepted${test.verify || test.kind === "property" ? " and server state verified" : ""}. Inspect the Bedrock packet trace.`, quiet);
    return true;
  } catch (error) {
    say(`${test.label}: failed: ${error}`, quiet);
    return false;
  }
}

function eventCases(type) {
  const selected = type === "all" ? catalog : [entries.get(normalizeType(type))];
  if (selected.some((entry) => !entry)) return null;
  return selected.filter((entry) => entry.summonable).flatMap((entry) =>
    entry.events.map((event) => ({
      kind: "event", type: entry.type, event, label: `${entry.type} ${event}`,
    }))
  );
}

function propertyCases(type) {
  const selected = type === "all" ? catalog : [entries.get(normalizeType(type))];
  if (selected.some((entry) => !entry)) return null;
  return selected.filter((entry) => entry.summonable).flatMap((entry) =>
    entry.properties.flatMap((property) => property.values.map((value) => ({
      kind: "property", type: entry.type, property: property.id, value,
      label: `${entry.type} ${property.id}=${value}`,
    })))
  );
}

function scenarioCases(group) {
  return scenarios.filter((scenario) => group === "all" || scenario.group === group).map((scenario) => ({
    ...scenario, kind: "scenario", label: scenario.name,
  }));
}

function stop() {
  if (interval !== undefined) system.clearRun(interval);
  interval = undefined;
}

async function next() {
  if (position >= queue.length) {
    stop();
    say(`${queueGroup} sweep complete: ${queue.length} attempted, ${passed} passed, ${failed} failed.`);
    return;
  }
  const test = queue[position++];
  say(`Case ${position}/${queue.length}: ${test.label}`, interval !== undefined && position % 25 !== 1);
  if (await execute(test, operator, interval !== undefined)) passed++;
  else failed++;
}

function begin(cases, source, automatic, group) {
  stop();
  if (!cases) {
    say("Unknown entity type. Use a type from the vanilla catalog.");
    return;
  }
  queue = cases;
  position = 0;
  queueGroup = group;
  passed = 0;
  failed = 0;
  operator = currentPlayer(source);
  say(`${cases.length} cases queued. Use /scriptevent vbprobe:next or /scriptevent vbprobe:auto.`);
  if (automatic) {
    interval = system.runInterval(() => { void next(); }, 40);
  } else if (cases.length > 0) {
    void next();
  }
}

function parseValue(text, definition) {
  if (definition.type === "bool") {
    if (text !== "true" && text !== "false") return undefined;
    return text === "true";
  }
  if (definition.type === "int" || definition.type === "float") return Number(text);
  return text;
}

function handle(event) {
  const action = event.id.slice("vbprobe:".length);
  const args = event.message.trim().split(/\s+/).filter(Boolean);
  const source = event.sourceEntity ?? event.initiator;

  switch (action) {
    case "help":
      say("Commands: status, metadata, all, events, properties, event, property, prepare <case> <run>, verify <case> <run>, cases, next, auto, stop, clear.");
      return;
    case "cases":
      say(`Gameplay cases: ${gameplayIds().join(", ")}`);
      return;
    case "prepare":
      void prepareGameplay(args[0], args[1], currentPlayer(source));
      return;
    case "verify":
      verifyGameplay(args[0], args[1], currentPlayer(source));
      return;
    case "status":
    case "metadata":
      begin(scenarioCases(action), source, args[0] === "auto", action);
      return;
    case "all":
      begin([...scenarioCases("all"), ...eventCases("all"), ...propertyCases("all")], source, args[0] === "auto", "all");
      return;
    case "events":
      begin(eventCases(args[0] || "all"), source, args[1] === "auto", "events");
      return;
    case "properties":
      begin(propertyCases(args[0] || "all"), source, args[1] === "auto", "properties");
      return;
    case "event": {
      const [type, name] = args;
      const entry = entries.get(normalizeType(type || ""));
      if (!entry || !entry.events.includes(name)) {
        say("Unknown type or event in the vanilla catalog.");
        return;
      }
      void execute({ kind: "event", type: entry.type, event: name, label: `${entry.type} ${name}` }, source);
      return;
    }
    case "property": {
      const [type, name, rawValue] = args;
      const entry = entries.get(normalizeType(type || ""));
      const definition = entry?.properties.find((property) => property.id === name);
      if (!definition || rawValue === undefined) {
        say("Unknown type or synced property in the vanilla catalog.");
        return;
      }
      const value = parseValue(rawValue, definition);
      if (!definition.values.includes(value)) {
        say(`Invalid value. Use one of: ${definition.values.join(", ")}`);
        return;
      }
      void execute({ kind: "property", type: entry.type, property: name, value, label: `${entry.type} ${name}=${value}` }, source);
      return;
    }
    case "next":
      void next();
      return;
    case "auto":
      if (interval === undefined && position < queue.length) interval = system.runInterval(() => { void next(); }, 40);
      say("Automatic sweep started. Each case runs 40 ticks apart.");
      return;
    case "stop":
      stop();
      say(`Sweep stopped after ${position}/${queue.length} cases.`);
      return;
    case "clear":
      stop();
      queue = [];
      position = 0;
      clearProbeEntities();
      resetGameplay();
      say("Probe entities removed.");
      return;
    default:
      say("Unknown command. Use /scriptevent vbprobe:help.");
  }
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (!event.id.startsWith("vbprobe:")) return;
  const command = {
    id: event.id,
    message: event.message,
    sourceEntity: event.sourceEntity,
    initiator: event.initiator,
  };
  system.run(() => {
    try { handle(command); } catch (error) { say(`Probe error: ${error}`); }
  });
});

console.warn("[ViaBedrock Entity Probe] ready");
