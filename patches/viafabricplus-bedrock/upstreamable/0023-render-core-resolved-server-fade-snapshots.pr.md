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

This patch does not implement camera transforms, splines, shake, fog, or aim assistance. Native opaque screenshots verify the overlay below the HUD. Partial opacity, exact frame timing, hidden-HUD behavior, and broader lifecycle comparisons remain unverified.

FOV snapshots retain elapsed progress. Historical local projection changes during an unsubscribed interval remain unverified.
Native local modifiers, first-person integration, pauses, transfers, and broader lifecycle comparisons remain incomplete.

Supplemental ordinary-clear playback restores local FOV on both routes.
The direct fixture passes broader rendering checks. The uncached ViaProxy fixture fails skin installation and geometry checks.
Those limitations remain recorded in the coverage ledger; the complete CubeCraft fixture passes rendering on both routes.
