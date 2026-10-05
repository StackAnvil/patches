# Decode camera instructions and transport native fades

## Purpose

Implement server camera fades in core. Keep the target instruction fields available to integrations that implement the remaining camera behavior.

## Target evidence

- Target: Bedrock 1.26.51.1, build 51061372, protocol 2193.
- The matching server emitted seven instructions: default fade, zero-duration fade, colored fade, FOV set, FOV clear, free-camera set, and camera clear. Both codecs consumed every byte. FOV easing uses a string on the wire.
- [Gophertunnel's camera codec](https://github.com/Sandertv/gophertunnel/blob/80c811b6186016b3860c358368cfa47e507f26e9/minecraft/protocol/camera.go) supplies an independent implementation for protocol 2193. The target schema also includes optional spline identifiers and JSON loading flags.
- Native fade application at `1466ee7d0`, timeline insertion at `146778300` and `1467780a0`, and the updater at `146707d00` establish defaults, overlapping fades, tolerance, and expiration. Private probes supply component storage, elapsed time, and memory operations. They execute the actual target timeline functions.
- [Microsoft's camera guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/CameraSystem/CameraCommandIntroduction?view=minecraft-bedrock-stable) describes overlapping fades and their minimum duration. Target executable comparisons establish the behavior for our pinned build.

## Design

Decode each optional field independently. Preserve absent versus false booleans, signed actor IDs, and bounded spline lists.

Core combines fades into a color and opacity timeline. A versioned payload carries the timeline and elapsed time after joining and channel registration. Late registration does not restart the fade. Clients without the rendering channel remain connected.

Invalid fade values leave the active timeline unchanged. Malformed wire layouts and excessive counts still fail decoding.

## Verification

Targeted tests cover state transport, expiration, overlapping colors, and invalid inputs. Optional private comparisons cover seven server packets, 42 independent fades, and 105 overlapping sequences with 735 samples.

Full stack builds and rendered connection checks are recorded in the coverage ledger.

## Remaining work

Only fade behavior is applied. Presets, camera movement, target tracking, FOV, splines, attachments, shake, and aim assistance remain incomplete. Retaining a decoded instruction does not establish camera state or behavioral parity.
