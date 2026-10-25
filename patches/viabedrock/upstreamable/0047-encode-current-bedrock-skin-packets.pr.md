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

## Live skin uploads

Clients register the incoming skin and result channels before core advertises live requests.
Both direct translation and ViaProxy use the same Java play transport.
Requests contain a transfer UUID and complete target skin bytes, without a player identity.
Each request fragment contains at most 16 KiB because Java serverbound custom payloads allow only 32,767 bytes.
The existing 64 MiB record limit remains a transport memory bound.

Core resolves the spawned local actor through the native player list.
A complete upload sends one native `PlayerSkinPacket` for that actor.
Invalid ranges, ordering, native fields, missing actors and failed sends cannot confirm a change.
A new upload rejects its predecessor.
Partial uploads expire after 30 idle seconds; native confirmation expires after ten seconds.
Capability withdrawal removes the session and its pending data.
The channel event loop owns uploads, confirmation and cleanup.
Unrelated channel changes leave this state alone.

Core publishes the incoming native appearance before its confirmation result.
Confirmation compares the native player identity and every encoded appearance field and pixel.
Only the server-owned trust flag is excluded from that comparison.
Geometry comparison uses JSON values, including array order.
The target server changes numeric formatting, such as `0.5` to `0.50`, without changing the model.
The profile hash remains part of the comparison.
Geometry parsing has a separate nesting bound of 128 levels.
An older skin ID with different pixels or metadata cannot confirm the current appearance.
The Java connection and request UUID correlate the result at the client.
A local preview never confirms server synchronization.

## Verification

Targeted tests compare the complete re-encoded classic and persona records after fragmentation and reconstruction.
They cover every image pixel and metadata field in records larger than five MiB.
Additional tests cover ordering, replacement, disconnect cleanup, invalid ranges, protocol versions, malformed counts, and image overflow.
Negotiation tests cover configuration, late registration, failed sending, ordered delivery, and connection isolation.
Pre-join tests verify copied payloads, ordering, count limits, and empty-packet rejection.
Ownership tests cover different login UUIDs and negative actor IDs.
Live-upload tests also cover reused skin IDs with changed pixels, confirmation identity, timeout, withdrawal and failed native sends.
Fourteen focused tests pass against the packaged core JAR, with four production class origins verified.
All 1,557 core classes and 199 assets match both embedded consumers.

The latest full stack builds with Java 25: 3,040 tests pass, 152 optional tests are skipped, and none fail.
The saved native math fixtures remain enabled during this build.
Earlier bundle and north-star patch application checks pass.

An authored target-session fixture adds three records, each exceeding five MiB and using 21 fragments.
Direct and ViaProxy playback install all five skin updates, including the original early and repeated player-list records.
Hashes of the complete records at renderer installation match the producer records.
Neither route rejects a skin, and both submit the local avatar through the native renderer.
The proxy check uses its actual Java UUID without changing the login identity.
These sparse playback observations do not establish visible native parity or remote-player lifecycle behavior.

Fresh direct and ViaProxy sessions each send a classic skin with a cape and a complete persona record to BDS 1.26.51.1.
Both production requests receive confirmed results on each route.
Independent packet comparison verifies the native local actor, every image pixel, all metadata and the profile hash.
The classic and persona records contain 78,454 and 142,192 bytes before the server reformats geometry and selects trust.
The body images are 128 by 128 pixels.
The persona includes a valid animated-face binding, one animated image, one piece and four tint channels.
Runtime JAR hashes match the verified build.
Screenshots show the local skins and capes on both routes.
These are controlled fixtures, without account writes or a native graphical baseline.

## Remaining scope

This transport does not supply server actor graphs, actor properties, equipment, attachable resources, or emote asset graphs.
Complete rendering and account synchronization require their separate production paths and native comparisons.
