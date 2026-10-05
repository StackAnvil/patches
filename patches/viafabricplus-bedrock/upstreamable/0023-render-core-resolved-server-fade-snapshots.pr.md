# Render server camera fades

## Purpose

Draw ViaBedrock's resolved fade timeline through direct and ViaProxy connections. Core owns packet decoding and fade combination.

## Design

The client subscribes to `viabedrock:camera_fade`. Each snapshot includes color, opacity points, and elapsed time. Rendering advances from that elapsed state and clears it at disconnect.

The overlay uses ordinary GUI extraction before the HUD. It also runs when the normal HUD is hidden. Rendering does not require a Microsoft Store account or game installation.

## Verification

The core compares numeric timelines with the matching Bedrock 1.26.51.1 executable. Rendered direct and ViaProxy checks and native screenshots are recorded in the coverage ledger.

## Remaining work

This patch does not implement camera transforms, FOV, splines, shake, fog, or aim assistance. Native opaque screenshots verify the overlay below the HUD. Partial opacity, exact frame timing, hidden-HUD behavior, and broader lifecycle comparisons remain unverified.
