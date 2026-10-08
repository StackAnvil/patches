# Native player input permissions

## Purpose

Decode packet 196 for Bedrock 1.26.51, protocol 2193. Retain the latest permission mask per connection.
Apply the category hierarchy to Bedrock auth input, including changes while controls remain held.
A registered client receives versioned snapshots through direct connections and ViaProxy.
Late channel registration receives the current snapshot after the Java join packet.
Preserve raw movement and jump/sneak edges independently of the filtered gameplay controls.
A negotiated client sample channel retains physical input before the client applies local restrictions.
Ordinary Java clients supply raw samples through their standard input packets.
Latch edges between auth ticks and keep shield use out of raw sneak input.

## Target evidence

A private BDS 1.26.51.1 script disabled each of eleven permission categories, then restored all permissions.
Each packet contained one unsigned varint and no remaining bytes.
The masks were 2, 4, 16, 32, 64, 128, 256, 512, 1024, 2048, and 4096.
The movement category sent only bit 4, so clients must apply its child permissions.
The unused bit 8 and unknown high bits survive transport without affecting known categories.

The [Creator category reference](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/inputpermissioncategory) describes the hierarchy.
The captured target build establishes the numeric masks and packet layout.

The [target auth-input reference](https://mojang.github.io/bedrock-protocol-docs/1.26.50-preview.26/packets/player-auth-input-packet/)
separates the raw movement vector from permission-filtered controls.
Native 1.26.51.1 Script API comparisons preserve raw movement, jump, and sneak while movement is disabled.
Keyboard diagonals have components of about 0.70710677. Raw X is positive for left and negative for right.
The position stays fixed throughout these locked-input comparisons.
The [InputInfo reference](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/inputinfo)
describes current button state and separate events for fast presses.

## Testing and limits

Targeted tests cover hierarchy, directional filtering, passenger dismount filtering, unsigned masks, incompatible payloads, and held auth input replacement.
Raw-input tests cover opposing directions, keyboard normalization, held button state, fast press/release edges, and separate-stream precedence.
Live BDS 1.26.51.1 tests through direct connections and ViaProxy preserve raw diagonal movement, jump, and sneak while the permission mask remains 4.
The native client and Java connection report the same diagonal components, about (-0.70710677, 0.70710677), for forward and right.
The server position stays fixed, and release returns the raw vector and buttons to their idle state.
The full build passes with 872 tests passed and 110 skipped, including core Checkstyle.
Live direct and ViaProxy joins deliver authoritative movement and camera masks, directional restrictions, and resets.
Java has no standard protocol operation for these local input restrictions.
The client integration applies movement prediction and camera controls.
Manual mounting behavior and native visual comparisons remain incomplete.
Ordinary Java clients receive filtered auth input but retain their local prediction behavior.

## Raw-input capability withdrawal

Unregistering the permission channel restores the latest standard input and discards old raw button edges.
Re-registering alone does not reactivate a stale sample.
A fresh raw sample can select the separate route again.
The combined private core gate passes 1,015 cases, with 30 optional skips.
The final-stack actual handler tests remain with the existing completed-frame fixture in patch 0092.
