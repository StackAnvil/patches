feat(entities): bridge authoritative native picking hitboxes

Keep native picking boxes, Java interaction proxies and negotiated client snapshots above the shared metadata state. Preserve alias click coordinates, connection lifetimes and ordinary Java interaction fallback.

The marker translation leaves source invisibility, equipment and entity
identity independent. Java marker dimensions are zero rather than the
native .005 clamp, and marker state suppresses picking and building
obstruction. The accepted native proxy add-on can reconstruct the proved
collapsed-box name anchor from marker state. Arbitrary armor-stand sizes
still require an explicit native metadata bridge.

Retain metadata118 picking boxes independently from physical dimensions53/54.
Target Bedrock 1.26.51.1/build51061372/protocol2193 decoder14337dc20 reads
FloatTag Min/Max/Pivot components, defaults missing or wrong types to zero,
sorts endpoints and recenters extents around actor position plus pivot.
Eight original parser/lookup/translation controls establish those CPU
operations; picker1435282e0 consumes the per-part list before physical
fallback. Do not infer scaling, radius inflation or arbitrary pick height.

Expose general nonphysical Java Interaction targets for each retained part,
refresh them on sparse metadata/position changes and remove aliases with
actor lifetime. Resolve interactions back to the authoritative owner while
preserving the target-relative click position. Negotiate exact rectangular
part dimensions separately for clients that support both native actor and
picking capabilities; ordinary Java retains enclosing Interaction widths.
Invalid or missing data never creates a guessed native picking rectangle.


Validation: replay the complete stack and run metadata, property index, pose, hitbox and interaction tests. Upstream PR #456 supplies the metadata foundation; closed PR #327 is not an active owner.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0002-preserve-sparse-properties-and-composed-metadata.pr.md): Land retained metadata and actor bounds before native picking integration.
