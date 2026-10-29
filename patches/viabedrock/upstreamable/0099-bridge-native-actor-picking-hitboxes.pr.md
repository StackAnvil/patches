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

Ordinary entity clicks use the displayed Java base position before conversion
to Bedrock world coordinates. Bedrock's boat hull and player eye origins
must not shift the target-relative Java hit.
Two regression tests cover boat movement and player origins.
The existing proxy test retains the separate alias origin.

Matching protocol 2225 captures use native 1.26.60.5 and BDS 1.26.60.6.
A boat interaction at player position (-497.5, 64, -115.5), yaw 0 and pitch 30,
hits native Y64.555. The old Java conversion reports Y64.93747.
The correction removes the 0.375 hull-origin offset.
A separate difference of approximately 0.0075 remains in the picked hull surface.
This comparison does not establish exact hull geometry parity or attack hit positions.
Fresh direct and ViaProxy recordings report corrected Y64.56247 and receive
the server's boarding acknowledgment. Both recordings finish without a packet failure.
The complete core suite passes 2,054 tests, with 176 optional skips.
The focused interaction suite passes all ten tests.


Validation: replay the complete stack and run metadata, property index, pose, hitbox and interaction tests. Upstream PR #456 supplies the metadata foundation; closed PR #327 is not an active owner.

## Upstream prerequisites

- [viabedrock patch](../../viabedrock/upstreamable/0002-preserve-sparse-properties-and-composed-metadata.pr.md): Land retained metadata and actor bounds before native picking integration.

## Atomic native attack hits, October 29, 2026

Native 1.26.60.5 protocol-2225 captures include the picked world position in actor attacks.
Java 26.3 sends only the attacked entity ID, so the translated transaction previously carried a zero hit.
Supporting clients now replace that packet with one negotiated message containing the target, owner, lifetime, and world hit.
Core accepts only the current published owner and lifetime, including proxy aliases.
The shared attack writer retains the selected item, main hand, and explicit swing.
Unavailable capabilities retain ordinary Java attacks.
No pending hit state carries coordinates into another attack.

Four core regressions cover the codec, malformed input, finite coordinates, current ownership, alias removal, and capability loss.
Three client regressions cover exact world coordinates, proxy ownership, unrelated picks, and absent lifetimes.
Full builds pass 2,075 core cases and 1,309 add-on cases, with no failures or errors.
Core and add-on optional skips remain 176 and 145.
CubeConverter passes 21 cases, and ViaProxy passes four.

Direct and matching ViaProxy controls each attack the original boat and its replacement exactly once.
Both transmitted hits equal the read-only client pick after float conversion.
Neither applies a hull or eye offset, and an intervening block prevents an entity attack.
Both boats receive the native nine-to-zero hurt countdown on each route.
The older proxy build lacks the capability and retains its ordinary zero-hit fallback.
Matching core, proxy, and add-on builds are required for native attack hits.

These controls establish hit transport and target lifetime handling.
The separate hull-surface difference of approximately 0.0075 blocks remains open.
Broader block-outline and picking geometry comparisons also remain open.
Captures, runtime class hashes, and licensed assets remain private.
