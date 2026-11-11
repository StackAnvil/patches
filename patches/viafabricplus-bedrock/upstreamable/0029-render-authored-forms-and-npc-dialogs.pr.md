# Authored Bedrock forms and NPC dialogs

## Purpose

Present core-resolved forms and NPC dialogs through the [shared scene renderer](0029-share-native-ui-scene-rendering.pr.md).
Keep each original form ID, action index, and typed response.
Container presentation has its [own patch](0029-present-authored-native-containers.pr.md).

## Design constraints

The core owns pack selection, authored bindings, and scene contracts.
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
