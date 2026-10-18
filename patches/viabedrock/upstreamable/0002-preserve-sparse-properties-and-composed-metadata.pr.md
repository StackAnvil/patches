fix(metadata): preserve sparse properties and composed actor state

Retain the residual metadata corrections after upstream PR #456. PR #327 is closed; this change is no longer deferred to that proposal. Preserve ordinary Java metadata and spawn properties, and keep native picking transport in the following integration.

Track property definitions across configuration and play, resolve sparse values by their transmitted indices, and translate spawn values and later updates. Map cat variants through the Java registry, preserve sheep wool state across partial updates, and compose bee flags without clearing anger.

Bedrock sends reduced entity scale for several baby species while its renderer compensates with a second multiplier. Java already selects their baby models, so compensate for the verified species on both scale and age updates. Translate Bedrock item-use and blocking flags into Java active-hand metadata so remote shield poses follow the server state.

Map cushion colors, fish variants, boat paddles, and minecart displays with the metadata translation. Suppress names on non-nameable items, projectiles, fireballs, eyes of ender, and experience orbs while preserving names on actors that can legitimately show them.

Resolve bool, int, float and enum wire properties to named values before
notifying the actor renderer. Preserve previous values for omitted
properties and reject invalid enum indices and non-finite floats.
Semantic tests cover sparse typed updates and pre-animation selection.

Treat retained native SCALE zero as an invisible Java body while preserving
its independently transmitted name and NAMETAG_ALWAYS_SHOW metadata. The
recorded protocol 2193 CubeCraft scene contains 36 minecraft:armor_stand
hologram carriers with FLOAT metadata 38 equal to zero, no INVISIBLE flag,
and BYTE metadata 81 equal to one. The target Bedrock 1.26.51.1 renders
these names without their collapsed meshes. Java's living scale attribute
cannot represent zero, and the previous translation skipped that value.

Regenerate shared flags on sparse scale updates as well as either native
flag mask. Replace the shared-flags entry within each outgoing batch so
scale/flag ordering produces one final value. Restore ordinary visibility
when scale becomes nonzero, retaining a real native INVISIBLE flag and all
unrelated shared flags. Never write the derived visibility into native
flags or MoLang state.

Semantic tests exercise a named zero-scale armor stand, sparse scale and
both flag-mask updates, incoming ordering, real invisibility, and nonzero
or negative scale. 19 focused metadata/scale tests pass.

Keep ordinary nametag visibility conditional on a retained nonempty NAME.
The same protocol 2193 CubeCraft recording contains ten zero-scale armor
stands with NAME empty and NAMETAG_ALWAYS_SHOW one; native 1.26.51.1 shows
no label. Clearing Java CUSTOM_NAME while keeping CUSTOM_NAME_VISIBLE true
instead displays its localized entity type label.

Recompute and replace custom-name visibility after either name or visibility
metadata, using retained values for sparse updates and one final value per
batch. Preserve null CUSTOM_NAME clearing and player profile identity. Tests cover both metadata orders, sparse clearing
and restoring, an absent ordinary NAME, and default player names.

Expose immutable retained scaled actor bounds and publish Interaction dimensions after sparse scale or dimension updates. Target Bedrock 1.26.51.1 functions 141a1c130, 141e15010 and 14289a870 retain unscaled metadata53/54, multiply by actor scale, and clamp collapsed AABBs to .005 blocks. Reject missing or invalid bounds instead of guessing a name height. Tests cover ordering, sparse dimensions, scaling, collapse, and unrelated Java actor types.

Format native NAME components through the finalized immutable per-connection pack palette. This shares the effective UI material overrides with player team prefixes and sidebar text. The target Hive material_gold_color override and official native green Scallywag establish that default gold must not overwrite the server palette. Preserve LF, reset styles, blank-name clearing, sparse updates and independent emitted components. No renderer reads mutable network palette state, and supported pack storage is finalized before actors are created.

Native armor stands with explicitly retained zero base width and height
now publish Java marker state. The marker bit shares one metadata word
with the existing arms flag, so pose and dimension updates preserve each
other regardless of packet order. Sparse positive or invalid dimension
updates clear the derived marker. Scale zero alone still only hides the
body and never establishes marker semantics.

Versioned evidence: Bedrock 1.26.51.1/protocol 2193 CubeCraft capture
contains an armor stand with metadata WIDTH53=0, HEIGHT54=0 and SCALE38=0.
The native AABB clamps the empty box to .005 blocks. Java 26.3 client
bytecode shows marker bit0x10 selects EntityDimensions.fixed(0,0), refreshes
attachments on metadata changes and uses an AT_HEIGHT name attachment.
Stock Geyser maps Java marker bit0x10 to Bedrock width and height zero:
https://github.com/GeyserMC/Geyser/blob/1c8c193ef500ad759f066dff1555b313d5347ebe/core/src/main/java/org/geysermc/geyser/entity/type/living/ArmorStandEntity.java#L145

Validation: six targeted actual-metadata marker tests cover all batch
orders, sparse updates, restoration, invalid/missing dimensions, source
identity and scale/invisibility independence. Together with existing name
and visibility regressions, 19 tests pass with zero failures or skips.
Both main and test Checkstyle pass.

Prefer retained authoritative NAME metadata for Java player team labels,
including changes after spawning, without replacing the stored profile
username. The target Hive ADD_PLAYER packets contain compact untranslated
profile text and already-resolved multiline NAME metadata with coin glyphs.
Java player renderers use the team prefix rather than CUSTOM_NAME, so
translating metadata alone left the raw compact payload on screen.

Native Bedrock 1.26.51.1 functions 141a14970 and 1446b2f00 retain metadata
NAME unchanged and skip name rendering when that string is empty. Preserve
explicit empty clearing with a hidden team label; only an absent NAME uses
the existing profile fallback. Restore visibility when NAME returns and
retain per-connection RGB, styles, newlines and custom glyphs. Packet-level
tests cover initial fallback, metadata precedence, subsequent profile and
NAME changes, sparse updates, explicit clearing and restoration.

Preserve the schema's shared property indices across integer and float
wire arrays. The matching 1.26.51.1 native capture sends bool, int and enum
values at indices 0..2 and a float at index 3; splitting the definition
lists silently discarded that float. Reject a wire value whose type does
not match its indexed definition. Interleaved-type and sparse-update
tests cover both channels without renumbering the schema.

Translate native player crawling into Java pose metadata without setting the swimming shared flag. Strict BDS 1.26.51.1 metadata clears SWIMMING and sets CRAWLING (bit 114) under a ceiling while retaining the 0.6-block body. Compose the pose after all sparse flag words have been retained so packet field order cannot change the result. Restore standing, crouching, gliding or swimming when crawling ends. Java 26.3 remote players retain this pose; local players require the separate client integration because they recalculate it every tick.

Translate firework actor metadata field 16 as complete rocket item user
data, preserving the source tag and clearing components on empty updates.
Use the shared item converter and standard Java FIREWORKS_ITEM metadata
so the server explosion status can use the authoritative colors and shapes
on ordinary clients and through ViaProxy. Keep integer minecart display
data separate from the rocket compound type.

Target BDS 1.26.51.1 build 51061372/protocol 2193 sends compound field 16
with Fireworks for a crossbow-fired rocket and an empty compound for a
summoned rocket. Both emit raw explosion event 25. Matching native code
143346100 reads the same field and event. Direction field 17, attachment
field 18 and complete live flight/render comparisons remain requirements.

Fifteen core tests cover decoding, zero-volume entries, bounds, wire
validation, part lifetime, alias routing, sparse refresh and actual channel
gates. Three separate add-on state tests pass. User/captured Wumpus and
Discord no-hit evidence identifies the missing metadata path, not a verified
post-fix result. Native picker radius, inside tests, scheduler ordering and
live post-fix clicks remain explicit verification limits. This does not
change physical collision metadata or claim complete native reach parity.

Translate the Bedrock crystal beam clear sentinel (0,0,0) to an absent Java
beam target. A literal zero position creates a long beam toward the world
origin even when the crystal has no target. Preserve actual positions,
including targets directly above the origin. A metadata regression covers
setting, clearing, and retargeting the same crystal.

Geyser's EnderCrystalEntity.setBlockTarget maps Java's absent beam to
Vector3i.ZERO; native Bedrock 1.26.51.1 bundled crystal resources animate
three nested cubes without a camera-facing expression. Java 26.3's crystal
renderer draws a beam whenever its optional target is present. This fixes
the translation and retains the ordinary crystal animation.
Reference: https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/entity/type/EnderCrystalEntity.java

Target BDS 1.26.51.1 sulfur behavior variants small=1 and medium=2 use the Java shared cube SIZE metadata rather than a baby flag. Reconstruct thrown potion item data from native flags/AUX_VALUE_DATA and preserve cloud DATA_PARTICLE/EFFECT_COLOR so lingering trial potions retain appearance. Targeted actor metadata tests verify size and potion/cloud data.

Translate shulker dye variants from Bedrock black-to-white order into Java
white-to-black order, preserving the undyed variant. The native 1.26.51.1
shulker render controller establishes all seventeen variant textures.
Actual metadata rewrite tests cover each color and the undyed state.


Validation: replay the complete stack and run metadata, property index, pose, hitbox and interaction tests. Upstream PR #456 supplies the metadata foundation; closed PR #327 is not an active owner.

## Upstream prerequisites

Requires [0064-evaluate-named-actor-properties.patch](0064-evaluate-named-actor-properties.pr.md): Land retained native actor state and property evaluation before the metadata residuals.
