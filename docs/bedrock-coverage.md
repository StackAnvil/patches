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
| Held block placement | Retained stationary build paths, next-cell ray selection, independent fresh block/air admission, frame retries after rejection, use timing, trapdoor orientation, cancellation, and prediction. | Native, direct, and proxy controls cover selected stationary paths, first rejection, last-stack placement, activation, re-aiming, and release. Moving placement, air/entity dispatch, build-height limits, and broader input scheduling remain open. |
| Fonts and UI | Native bitmap metrics and italic geometry, authored scenes, TrueType cache and atlas sampling, and primary font aliases. [Death reasons follow the visibility game rule](../patches/viabedrock/upstreamable/0111-honor-death-message-visibility.pr.md) and [retain the current screen](../patches/viafabricplus-bedrock/upstreamable/0042-retain-bedrock-death-screen-lifetimes.pr.md). | Selected bitmap and TrueType controls match at 1280 × 720. [Validation and limits](../patches/viafabricplus-bedrock/upstreamable/0029-share-native-ui-scene-rendering.pr.md). Complete screens, bold and shadowed text, other font families, mixed or scaled aliases, and broader viewports remain open. |
| Player inventory and crafting | Opening ownership, recipe catalogs, Creative catalog actions, Survival bulk and manual crafting actions, retained recipe queries, compressed snapshots, local Help, inactive item lighting, native storage weights, desktop bundle insertion/default extraction, and native stack identities. | Complete E-key/workbench presentation, bundle controller and tooltip lifetimes, query lifetime across connections, broader Survival recipes, and original live bug reports remain unresolved. See the [inventory reference](native-player-inventory.md). |
| Food use | Native components govern admission and Java food/consumable properties, with Creative and Peaceful exceptions. Local use retains native item identity across Java carriers. | Selected admission, input-deadline, timed-food, held-mode, release, and pause controls pass. Short input edges during active Java use, broader use cycles, and the original intermittent report remain open. See the [food-use evidence](../patches/viabedrock/deferred/0008-signal-sustained-bedrock-item-use.pr.md). |
| Cooking | Snapshot-bound recipe actions, transfer batches, preferences, search, and progress. | Default cooking screens retain ordinary controls until authored bindings are complete. See the [cooking reference](native-cooking-actions.md). |
| Skins and appearance | Complete skin transport, classic changes, persona assembly, animation graphs, costumes, and attachables. | Broader wardrobe masking, profile/LOD changes, shield rendering, remote appearances, and account/platform flows need further native comparisons. See [skin support](skin-flow.md). |
| Camera | Core-resolved poses, follow targets, blends, FOV commands, shake, fades, native ordinary player FOV, and the default death view. See [camera validation](../patches/viafabricplus-bedrock/upstreamable/0023-render-core-resolved-camera-movement.pr.md). | Selected stationary projections, swim-boost expiry, and settled death views have native comparisons. Death activation timing, varied angles and postures, native death-screen UI, other fluid effects, portrait scaling, transition timing, collision, aim assistance, and complete visual parity remain open. |
| Movement and effects | Completed physics frames, retained prediction history, correction replay, terrain queries, and authoritative impulses. [Local modes survive profile refreshes and physics replay](../patches/viafabricplus-bedrock/upstreamable/0025-send-completed-local-physics-to-viabedrock.pr.md). [Remote-player live and sparse movement origins remain separate](../patches/viabedrock/upstreamable/0106-align-retained-remote-spawn-origins.pr.md). [Negotiated remote movement retains native float steps, pitch history, and head targets](../patches/viafabricplus-bedrock/upstreamable/0041-interpolate-native-remote-player-movement.pr.md). Overworld air blindness attenuates night-vision strength and fog color together. Both Java routes match native water-boundary fall controls. | Selected reset, head, body, and queued-movement controls match native after packet/tick state alignment. Full trajectories and pose parity remain open. Readiness, ground state, exact timing, and mounted behavior remain unverified. Native Fancy controls establish the tick-based expiry blend and distance curve at noon and midnight. Other fluid movement, vision combinations and media, mount variants, network conditions, and broader replay behavior remain open. |
| Fog and picking | Fog commands, inherited legacy biome bindings, pack-defined defaults, Overworld clock modulation, End dragon distance rules, native actor picking transport, and native float camera rays. Disabling the daylight rule freezes explicit Overworld clocks. | Both routes match selected native fog colors and distances, three non-cardinal rays, and paired armor-stand and block reach controls. Eye precision, other actor shapes, multipart target ordering, spatial blending, timed command transitions, directional sunrise tint, sky sampling, and other render modes remain open. |
| Custom content | Resource-defined actors, materials, particles, sound, block geometry, lighting, and collision. | Unsupported material methods, missing assets, carrier capacity, and visual differences remain. Live-server admission does not establish parity. |
| Platforms | Linux build, replay, and selected native comparisons. | Windows and macOS launcher/account/rendering paths need their own results. See [platform testing](platform-testing.md). |

## Reported regressions

Retain these reports until a matching reproduction establishes the result:

- Lifeboat dialog text was reported as untranslated. Captured Navigator titles, captions, and response indices survive both [Java dialog projection](../patches/viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md) and [add-on render failures](../patches/viafabricplus-bedrock/upstreamable/0029-render-authored-forms-and-npc-dialogs.pr.md). These controls preserve the official 1.26.60.5 scene bytes. The original reported dialog remains unmatched.
- Lifeboat's opaque player-head obstruction matches a missing native near-camera fade. World player materials now use the [native ordered fade](../patches/viafabricplus-bedrock/upstreamable/0002-native-entities-and-skins.pr.md). GPU checks cover color and depth through native and Iris programs. A matching offline scene reveals the lobby through nearby players. Broader spawn and rendering parity remain open.
- WildFFA inventory opened with E shows items without the expected background.
- An update from 0.3.61 to 0.4.2 caused reported inventory lag spikes and overlapping menus.
- The oversized shield and distorted custom-skin pose in the confirmed 0.4.3 screenshots remain unresolved.
- The 0.4.3 bed-floor report matches a reproduced [MoreCulling interaction](../patches/viafabricplus-bedrock/upstreamable/0040-preserve-native-occlusion-with-moreculling.pr.md). Current direct and proxy controls preserve the floor. The affected player's mod list remains unknown.
- An ender pearl followed by a wind charge can cause repeated rollbacks. Selected [current native and Java controls](../patches/viafabricplus-bedrock/upstreamable/0025-send-completed-local-physics-to-viabedrock.pr.md) settle, including walking projectile combinations with added incoming delay. Timing for short presses and the original persistent loop remain unverified.
- Food can repeat its use animation without feeding the player.
- The locator bar can be absent.
- A Realms disconnect report shows NetherNet connectivity loss and repeated STUN 401 responses. Current networking updates still need a matching reproduction.

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
