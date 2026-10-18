# Render server camera effects

## Purpose

Draw ViaBedrock's resolved fades and apply its shared FOV transitions through direct and ViaProxy connections. Core owns packet decoding and fade combination.

## Design

The client subscribes to `viabedrock:camera_fade`. Each snapshot includes color, opacity points, and elapsed time. Rendering advances from that elapsed state and clears it at disconnect.

The overlay uses ordinary GUI extraction before the HUD. It also runs when the normal HUD is hidden. Rendering does not require a Microsoft Store account or game installation.

The client also subscribes to `viabedrock:camera_fov`.
Live commands use the previous rendered FOV and the unmodified local projection.
Snapshots resolve the local projection and advance by their elapsed time.
The shared core rules control easing, overshoot, interruption, and clear removal.
The world camera receives the result before projection and culling. The separate hand projection keeps its existing behavior.
Disconnect clears queued commands and transition state.

## Verification

The core compares numeric timelines with the matching Bedrock 1.26.51.1 executable. Rendered direct and ViaProxy checks and native screenshots are recorded in the coverage ledger.

## Remaining work

Preset movement, splines, fog, and aim assistance remain incomplete. Native opaque screenshots verify the overlay below the HUD. Partial opacity, exact frame timing, hidden-HUD behavior, and broader lifecycle comparisons remain unverified.

FOV snapshots retain elapsed progress. Historical local projection changes during an unsubscribed interval remain unverified.
Native local modifiers, first-person integration, pauses, transfers, and broader lifecycle comparisons remain incomplete.

Supplemental ordinary-clear playback restores local FOV on both routes.
The earlier ViaProxy report had stale skin audit data and an omitted private avatar marker.
Corrected ordinary-clear replays pass transport and rendering on both routes.
Unavailable built-in animation assets remain a separate gap, as recorded in the coverage ledger.

## Camera shake

Subscribe to `viabedrock:camera_shake` through direct connections and ViaProxy.
Use the shared queue and sampler after ordinary camera alignment, before projection and culling.
Apply position offsets in world space and rotation offsets to pitch and yaw.
Entity aim and outbound movement stay independent of the rendered camera.

The native Allow Camera Shake preference defaults to enabled.
Disabling it hides existing shake and ignores new additions.
Stop still clears the retained state.
Disconnect and level teardown release the queues.

Core owns packet decoding, queue rules, seed transport, and noise.
The add-on supplies its clock, local preference, and camera transforms.
Camera rendering requires neither a Store session nor a local game installation.

The default player-camera path has native codec and numeric evidence.
A complete direct replay changes the local preference during overlapping and strong shake commands.
It verifies hidden rendering, ignored additions, retained event lifetimes, re-enable, and stop.
Native preference-toggle screenshots, custom preset parameters, late registration, pauses, transfers, and first-person item integration need additional native comparisons.

## Core-resolved camera movement

The add-on subscribes to `viabedrock:camera_position` on direct and ViaProxy connections.
It supplies the previous rendered frame to the shared core blend updater.
Free-camera position and rotation apply before camera shake, projection, and culling.
The camera changes without moving the player or changing outbound aim.

Server perspectives override the effective camera type without changing the saved user setting.
Clear and disconnect release the override.
Perspective fields retain their source values during blends and switch at the endpoint.
Snapshots restore settled targets because the original interrupted frame is unavailable.
Exact mid-blend restoration remains incomplete.

Built-in first/third-person activation currently uses Java camera alignment.
Native third-person distance and collision still need implementation and comparison.
Player-effects application, native follow cameras, splines, attached actors, and aim assistance remain incomplete.
The listener section below records audio application.

Complete direct and ViaProxy replays pass transport and existing skin-rendering checks.
Both reproduce all five free-camera targets, the short yaw arc, overshoot, perspective activation, and clear.
Their complete scene hashes match the native capture, and core preset reports match byte for byte.
Stationary screenshots still differ in projection, lighting, and foliage.
This verification establishes movement behavior, with visible parity still incomplete.
One ViaProxy attempt timed out before presets; the completed retry does not establish a fix for that intermittent handshake.

## Camera audio listeners

The sound-engine listener follows the current preset's resolved listener choice.
Camera selection keeps Minecraft's rendered camera transform.
Player selection supplies the local interpolated eye position and current player angles to core's listener math.
The visual camera blend does not delay listener selection.
Clear and disconnect restore the ordinary camera listener.

The hook updates Minecraft's shared listener before its sound executor receives the transform.
Bedrock PCM playback, admission checks, and caption positioning already consume that listener.
They need no separate device or listener state.
Clients without an active server camera retain the normal sound transform.

Core tests compare player orientation against the target executable.
Private replay diagnostics read the actual sound-engine listener position, forward vector, and up vector.
Complete route checks and limits are recorded in the coverage ledger.
Native eye-height, vehicle/death behavior, listener activation timing, and audible panning remain unverified.
