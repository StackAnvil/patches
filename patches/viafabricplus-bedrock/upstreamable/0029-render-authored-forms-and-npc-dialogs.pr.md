# Authored Bedrock forms and NPC dialogs

## Purpose

Resolve forms and NPC dialogs from the confirmed source program through the [shared scene renderer](0029-share-native-ui-scene-rendering.pr.md).
Keep each original form ID, action index, and typed response.
Container presentation has its [own patch](0029-present-authored-native-containers.pr.md).

## Design constraints

The core owns pack selection and scene contracts. The add-on evaluates authored bindings from the same accepted source files.
The client owns rendering, input, focus, scrolling, narration, and resource lifetimes.
Shared controls retain their identities across scene refreshes.

After an action-form renderer fails, ordinary controls use the shared resolved title, prose, and visible captions.
Each displayed button retains its source response index.
Authored action validation uses the full source count, independently of the displayed count.
An unusable projection retains the intact original form. Custom forms retain their typed protocol fallback.

Prerequisite: [shared scene rendering](0029-share-native-ui-scene-rendering.patch) must land before these controllers.

## Validation and remaining limits

`BedrockFormSceneTest` covers rejected controls, invalid actions, resolved fallback captions, sparse indices, malformed projections, and custom-form titles.
`BedrockNativeFormWidgetIdentityTest` exercises repeated controls, retained widget identities, fallback clicks, and duplicate-response prevention.
Other form and NPC regressions cover typed inputs, ownership, dismissal, and conversation lifetimes.

The official Bedrock 1.26.60.5 Navigator supplies eight menu choices, an image-only Close action, and fourteen placeholder buttons.
Paired 240-second Java renderer-failure controls preserve the recorded scene packets.
The old fallback exposes the selector title and fourteen empty buttons. The corrected fallback shows Navigator and nine intended actions.
Clicking Close sends the original response 8 exactly once.
Private screenshots and traffic evidence remain outside Git.

These selected controls do not establish complete form, NPC, font, or rendering parity.
The original reported untranslated dialog remains unmatched.

Action-form search fields are editable. The authored placeholder becomes the edit box hint, typing does not refresh or filter the scene, and the submit control sends the typed values in the core's `text_values` payload. Ordinary buttons still send their original ordinal. `BedrockActionFormTextTest` covers typing, submission, ordinals and the length limit.

Unset text: official 1.26.60.5 sends `[null]` for a Wardrobe search that never gained focus and `[""]` after focus alone or a cleared field. The form keeps a field unset until it gains focus or text and sends a `text_set` flag per value. `BedrockActionFormTextTest` covers the untouched and focus-only submissions and, with nested CubeCraft-style controls, checks that the editor draws above the edit box background at the text control's inset.

The rebuilt client passes a live CubeCraft Wardrobe check: typed `red` is visible, its placeholder hides, and submission sends `["red"]`. Untouched, focused-empty and typed-then-cleared fields send the same responses as the native controls. Featured Loot navigation still sends numeric response `0` and restores the tiles. No purchase or multiple-field form was tested.

The form input channel sends the original form JSON and confirmed resource generation. The client resolves action and custom forms locally. Local expansion does not pass through another 1 MiB network envelope. Original response indices and text fields remain unchanged. Missing contexts and invalid forms request ordinary controls. Queued messages from an old listener are ignored. A regression resolves a scene larger than the wire budget from a small form message.

Server-requested dialog closure reaches authored and local fallback forms after Java processes the translated clear-dialog packet. Only the current listener can dispatch the event. The shared host asks its domain controller to admit closure, so unrelated authored screens stay open. Form controllers retire without another user cancellation. Regressions cover stale connections, unrelated screens, fallback retirement and later cancel/action calls. Native Bedrock 1.26.60.5 removes an accepted SDK form on the same protocol-2225 close packet that previously left the add-on form visible. The Java clear-dialog handler recognizes Java dialog classes only, which caused that gap.
The rebuilt installed client returns to gameplay on two server closes with a successful reopen and normal toggle submission between them. The current full add-on/dependency build passes. These supplied controls do not establish every form type, close timing or NPC-dialog parity.

Authored forms and their local action-form fallbacks now honor the resolved host screen's `force_render_below` value. The default form hides the underlying HUD. An explicit true value allows HUD extraction. Closing the form restores ordinary HUD rendering without changing the player's HUD options. A regression carries both policies from the core resolver into authored screens and rejected-scene fallbacks, then exercises the HUD cancellation hook. An unrelated screen retains its HUD. The version-matched native controls and their limits are recorded in the [core presentation notes](../../viabedrock/upstreamable/0095-share-native-ui-programs-and-resources.pr.md). Installed controls confirm the desktop toggle branch, default HUD hiding and restoration after close. Explicit render-below allows HUD extraction, but health and hotbar visibility remains intermittent across captured frames. The [shared renderer validation](0029-share-native-ui-scene-rendering.pr.md) now covers the corrected wrapped row and focused toggle skin, including a successful keyboard toggle submission. The cancellation test does not establish complete pixel behavior.
