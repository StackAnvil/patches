# feat(camera): resolve server presets and camera movement

## Purpose

Protocol 2193 carries independent optional camera fields, including named spline references, little-endian signed actor IDs and string-encoded FOV and keyframe easing. Decode every instruction field before applying the fade, retain the decoded instruction for integrations, and bound spline allocations. Resolve named references through the received spline table.

## Design constraints

Core resolves camera instructions, retained timelines, targets, audio listeners, and ownership. Send versioned state to the add-on and retire it on connection or actor replacement.

## Validation and remaining limits

Regression coverage includes `CameraAimAssistActivationTest`, `CameraAimAssistBlocksTest`, `CameraAimAssistClientStateTest`, `CameraAimAssistControlsTest`.

Controlled camera and transport references cover selected commands. Complete native timing, collision, aim assistance, and visual composition remain partial.

The [owning patch](0089-resolve-and-transport-native-camera-instructions.patch) retains implementation rationale and versioned evidence.
