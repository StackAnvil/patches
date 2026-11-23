Keep resource image decoding and PNG export independent of temporary disk storage.
The source and destination bytes already reside in memory.
Use memory-backed ImageIO streams without changing the JVM-wide cache policy.
Read each image header first and reject images above 4096 x 4096 pixels, because a few compressed bytes can otherwise make ImageIO allocate gigabytes.

A regression checks decoded pixels, PNG export, and forced PNG re-encoding with an unwritable ImageIO cache.
The live failure was a missing bundled default skin during login under an exhausted host temporary quota.
The standalone upstream patch and full stack build pass.
A separate probe preserves PNG pixels with the JVM's default temporary storage unavailable.
A regression rejects a header one pixel row and column past the dimension limit; it ran in the full stack only.
