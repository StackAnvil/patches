Complete the remaining Bedrock 1.26.60 compatibility work on top of upstream [#466](https://github.com/ViaVersionAddons/ViaBedrock/pull/466).
The upstream base supplies protocol 2225, generated data, packet layouts, actor hand fields, and full-height biome decoding.
This patch preserves those changes and the newer upstream player metadata.

The remaining changes apply dimension cloud settings, accept all 57 player UI inventory entries, and preserve legacy block connections.
They also decode resource-pack response variants, supplement generated packet IDs from matching schemas, and share actor swing encoding.
The passenger tests use the upstream codec.
The converted vanilla pack retains its native glyph images.

Sources and asset hashes remain in `Data Asset Sources.md`.
Dimension bounds also use the earlier native Hive fixture.
The native BDS 1.26.60.6 inventory fixture establishes the 57-entry capacity.
Experimental fallbacks do not establish complete native parity.

The first patch applies independently to the pinned upstream base without StackAnvil setup or deferred inventory patches.
Its standalone build, Checkstyle tasks, and all 22 packet-boundary and compatibility tests pass.

The complete four-project build and modpack bundle also pass against the rebased pins.
