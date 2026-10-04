# Complete target skin records and Java client transport

## Purpose

Preserve the complete Bedrock skin record in both native packets and supported Java clients.
The legacy utility channels omit persona fields, animated images, and other metadata.
The new `viabedrock:player_skin` channel uses the existing target `SkinData` codec.
It works through ViaProxy and direct translation without a separate proxy implementation.

## Evidence

The pinned target is Bedrock 1.26.51.1, protocol 2193, and Java 26.3.
The closest [Mojang preview skin schema](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/types/serialized-skin/) describes protocol 2192.
It identifies the image, animation, geometry, persona, tint, trust, and profile fields retained by this codec.
Target recordings and the existing native codec establish the production field order.
Later protocol 2207 removes PlayFab ID and moves fields. This patch keeps the target format.

## Design

Clients advertise the channel through Java registration.
Core retains ordered, immutable skin records until Java join and registration complete.
It also retains early player-list and skin packets until StartGame initializes their Java state.
The target server recording includes a player-list update before StartGame.
After join, core replays these packets through the normal handlers without repeating base protocol processing.
Each transfer has a player UUID, local-player flag, transfer UUID, total length, offset, format version, and target protocol.
Core identifies the local player by login UUID or authoritative actor ID.
The client applies local updates to its actual avatar UUID because ViaProxy can retain a different Java login UUID.
Fragments contain at most 256 KiB, below Java's one MiB custom payload limit.
The receiver assembles one contiguous transfer per connection and allocates only received data.
A new first fragment replaces an incomplete transfer. Invalid sequencing clears that transfer.

The transport limits one record to 64 MiB.
Each pending queue has a separate limit of 128 MiB and 10,000 entries.
Cache overflow discards the oldest pending update with a warning.
These limits protect transport memory; they do not define native skin dimensions.
Clients without the new channel retain the existing utility path.
Tab-list removal does not delete appearance data because servers can hide visible player actors from that list.

## Verification

Targeted tests compare the complete re-encoded classic and persona records after fragmentation and reconstruction.
They cover every image pixel and metadata field in records larger than five MiB.
Additional tests cover ordering, replacement, disconnect cleanup, invalid ranges, protocol versions, malformed counts, and image overflow.
Negotiation tests cover configuration, late registration, failed sending, ordered delivery, and connection isolation.
Pre-join tests verify copied payloads, ordering, count limits, and empty-packet rejection.
Ownership tests cover different login UUIDs and negative actor IDs.

The full stack builds with Java 25 and passes 967 Java tests; 109 optional tests are skipped.
The saved native math fixtures remain enabled during this build.
The bundle and both north-star patch application checks pass.

An authored target-session fixture adds three records, each exceeding five MiB and using 21 fragments.
Direct and ViaProxy playback install all five skin updates, including the original early and repeated player-list records.
Hashes of the complete records at renderer installation match the producer records.
Neither route rejects a skin, and both submit the local avatar through the native renderer.
The proxy check uses its actual Java UUID without changing the login identity.
These sparse playback observations do not establish visible native parity or remote-player lifecycle behavior.

## Remaining scope

This transport does not supply server actor graphs, actor properties, equipment, attachable resources, or emote asset graphs.
Complete rendering and account synchronization require their separate production paths and native comparisons.
