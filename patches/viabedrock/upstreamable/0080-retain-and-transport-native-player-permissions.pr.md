# Native player input permissions

## Purpose

Decode packet 196 for Bedrock 1.26.51, protocol 2193. Retain the latest permission mask per connection.
Apply the category hierarchy to Bedrock auth input, including changes while controls remain held.
A registered client receives versioned snapshots through direct connections and ViaProxy.
Late channel registration receives the current snapshot after the Java join packet.

## Target evidence

A private BDS 1.26.51.1 script disabled each of eleven permission categories, then restored all permissions.
Each packet contained one unsigned varint and no remaining bytes.
The masks were 2, 4, 16, 32, 64, 128, 256, 512, 1024, 2048, and 4096.
The movement category sent only bit 4, so clients must apply its child permissions.
The unused bit 8 and unknown high bits survive transport without affecting known categories.

The [Creator category reference](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/inputpermissioncategory) describes the hierarchy.
The captured target build establishes the numeric masks and packet layout.

## Testing and limits

Targeted tests cover hierarchy, directional filtering, passenger dismount filtering, unsigned masks, incompatible payloads, and held auth input replacement.
The full build passes with 867 tests passed and 110 skipped, including core Checkstyle.
Live direct and ViaProxy joins deliver authoritative movement and camera masks, directional restrictions, and resets.
Java has no standard protocol operation for these local input restrictions.
The client integration applies movement prediction and camera controls.
Manual mounting behavior and native visual comparisons remain incomplete.
Ordinary Java clients receive filtered auth input but retain their local prediction behavior.
