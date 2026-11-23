Keep resource image decoding and PNG export independent of temporary disk storage.
The source and destination bytes already reside in memory.
Use memory-backed ImageIO streams without changing the JVM-wide cache policy.
Read each image header first and reject images whose decoded pixels need more than an eighth of the heap or a Java array, because a few compressed bytes can otherwise make ImageIO allocate gigabytes.
The bound scales with the heap rather than a fixed size, so it accepts textures that the native client loads; a 2 GiB heap accepts 8192 x 8192 textures.

A regression checks decoded pixels, PNG export, and forced PNG re-encoding with an unwritable ImageIO cache.
The live failure was a missing bundled default skin during login under an exhausted host temporary quota.
The standalone upstream patch and full stack build pass.
A separate probe preserves PNG pixels with the JVM's default temporary storage unavailable.
Regressions cover the heap scaling and reject a header past the Java array bound without decoding; they ran in the full stack only.
