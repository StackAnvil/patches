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
