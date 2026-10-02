# Inherit native air fog defaults

Biomes without an air fog color currently receive Java's `#C0D8FF`. Bedrock 1.26.51.1 supplies `#ABD2FF` through `minecraft:fog_default` instead.

Use an explicit biome air color first, then the effective resource pack's default air color, then `#ABD2FF` if both are absent. The synthetic `the_void` biome follows the same default. This preserves server overrides and valid black colors. Water fog behavior stays unchanged.

The installed 1.26.51.1 vanilla fog archives contain `#ABD2FF` in their default fog settings. The 1.19.0 overlay archive has SHA-256 `74fd138548bcead6bd466ac26a5e10f7ad3988def3dff9277b7aceb94fe59e94`; its `default_fog_setting.json` entry has SHA-256 `373bd242339101bea36d7f1cc3cbb5b03d8b5a8d23d7759e46d0950d3549f45b`. All three bundled overlays defining `minecraft:fog_default` also contain this air color. A private Java probe loads all 60 configured vanilla packs into `ResourcePackStorage`; the effective parsed default air color is `0xABD2FF`, or RGB `(171, 210, 255)`.

Validation: the full core suite passes with 281 tests executed, none skipped, and no failures. Both main and test Checkstyle tasks pass. Focused tests cover explicit biome precedence, black, inherited defaults, missing air entries, and the final fallback.

This patch corrects the air fog input. It does not port the complete native sky shader or establish complete sky pixel parity.
