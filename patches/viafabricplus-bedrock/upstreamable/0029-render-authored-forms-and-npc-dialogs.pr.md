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
