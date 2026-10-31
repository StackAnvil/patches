# Bedrock compatibility status

StackAnvil targets Bedrock **1.26.60 / protocol 2225** and Java **26.3**.
This page describes current support and known gaps. It is not a change log.
Read the [source guide](bedrock-development-sources.md) before using evidence from another build.

## Ownership

| Project | Responsibility |
| --- | --- |
| ViaBedrock | Protocol, authoritative state, inventory requests, resource conversion, and Java translation. |
| Bedrock add-on | Native input, local physics, rendering, audio, and authored UI on the Java client. |
| ViaProxy | Preserve negotiated state and resources across the proxy route. |
| CubeConverter | Convert supported Bedrock geometry and materials. |

## Current status

A production implementation is not proof of native parity.
A successful unit test establishes only the behavior it exercises.
Native comparisons apply to their recorded build, fixture, and connection route.
No complete area has verified Bedrock parity.

| Area | Implemented behavior | Remaining limits |
| --- | --- | --- |
| Protocol 2225 | Updated packet layouts, explicit enum values, stonecutter notifications, cursor drags, skin identity, and sound unions. | Block seating, signed content playback, matchmaking UI, and environment layers remain partial or unsupported. |
| World resources | World base-game version selects vanilla metadata, textures, actor graphs, and audio before server overrides. The context survives ViaProxy. Server legacy biome bindings retain unqualified names across versions. | Native current/older/current cat, sound, and remote biome-name controls cover selected paths. Broader pose and audio behavior need comparisons. |
| Held trapdoors | Retained facing and half, interaction suppression, use timing, cancellation, rejection, and prediction reconciliation. | Native, direct, and proxy controls cover specific held-placement histories. Other placement and interaction families need separate comparisons. |
| Fonts and UI | Bitmap metadata, extended mapping, same-pack ownership, legacy layouts, authored scenes, and native GUI sampling. | At 1280 × 720, current controls match all 16 labels at native UI scales 1 and 2; legacy scale-2 controls match 16/16. Both routes pass Java GUI scale changes and reloads. Broader viewports and TrueType comparisons remain open. |
| Player inventory and crafting | Opening ownership, recipe catalogs, compressed snapshots, inventory-only Help, and native stack identities. | Default E-key/workbench presentation, bulk recipe actions, cursor replacement, and original live bug reports remain unresolved. See the [inventory reference](native-player-inventory.md). |
| Cooking | Snapshot-bound recipe actions, transfer batches, preferences, search, and progress. | Default cooking screens retain ordinary controls until authored bindings are complete. See the [cooking reference](native-cooking-actions.md). |
| Skins and appearance | Complete skin transport, classic changes, persona assembly, animation graphs, costumes, and attachables. | Broader wardrobe masking, profile/LOD changes, shield rendering, remote appearances, and account/platform flows need further native comparisons. See [skin support](skin-flow.md). |
| Movement and effects | Completed physics frames, retained prediction history, correction replay, terrain queries, and authoritative impulses. Overworld air blindness attenuates night-vision strength and fog color together. Both Java routes match native water-boundary fall controls. | Native Fancy controls establish the tick-based expiry blend and distance curve at noon and midnight. Other fluid movement, vision combinations and media, mount variants, network conditions, and broader replay behavior remain open. |
| Fog and picking | Fog commands, inherited legacy biome bindings, pack-defined defaults, Overworld clock modulation, End dragon distance rules, native actor picking transport, and native float camera rays. Disabling the daylight rule freezes explicit Overworld clocks. | Both routes match selected native fog colors and distances, three non-cardinal rays, and paired armor-stand and block reach controls. Eye precision, other actor shapes, multipart target ordering, spatial blending, timed command transitions, directional sunrise tint, sky sampling, and other render modes remain open. |
| Custom content | Resource-defined actors, materials, particles, sound, block geometry, lighting, and collision. | Unsupported material methods, missing assets, carrier capacity, and visual differences remain. Live-server admission does not establish parity. |
| Platforms | Linux build, replay, and selected native comparisons. | Windows and macOS launcher/account/rendering paths need their own results. See [platform testing](platform-testing.md). |

## Reported regressions

Retain these reports until a matching reproduction establishes the result:

- WildFFA inventory opened with E shows items without the expected background.
- An ender pearl followed by a wind charge can cause repeated rollbacks.
- Food can repeat its use animation without feeding the player.
- The locator bar can be absent.

Release fixes and successful local controls do not close an unmatched report.
Record the client build, mods, server, input path, and reproduction with a new result.

## Validation and evidence

Use [automated validation](automated-validation.md) for build and release checks.
Use the [capture lab](capture-lab.md) and [server replay](server-replay.md) for runtime comparisons.
Choose focused cases from the [gameplay guide](bedrock-complex-gameplay.md) and [test packs](bedrock-test-packs.md).

Keep durable rationale in the owning patch and concise review context in its adjacent `.pr.md` file.
Keep raw captures, native probes, addresses, and repeated runs private under `.stackanvil/research/`.
Git and release notes retain historical changes.
Replace current status when the evidence changes instead of appending another experiment entry.
