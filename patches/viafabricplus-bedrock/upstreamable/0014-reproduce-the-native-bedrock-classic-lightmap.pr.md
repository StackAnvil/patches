Java 26.3 applies a different lightmap gamma transform from Bedrock 1.26.51.1. Its Nether brightness calculation also applies ambient light at a different stage.

This patch uses a dedicated shader for actual Bedrock Overworld and Nether connections. It reproduces the classic native light-image calculation, including its float table, colored block light, sunrise tint, weather factor, quartic gamma, and byte truncation. Nether keeps the native white sky and full sky factor.

Immutable render snapshots refresh the lightmap when inputs change between ticks. This covers brightness changes, darkness animation, and transitions between supported and unsupported connections. The shader joins the normal resource reload pipeline. Its uniform buffer closes with its owning lightmap.

Native evidence comes from the official Bedrock 1.26.51.1 executable, identified by SHA-256 `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`. The port follows scalar builder `146619c50`, table initializer `142313be0`, Overworld producers `1423122e0`/`14230e620`/`146235f20`, and Nether producer `14692cd30`. Caller `1448018f0` fixes both bias stages on and the white boost off. The native contribution fixes the previous boss value to zero, so the port omits that inactive branch.

Validation passed eight targeted tests for inputs, snapshot equality, and uniform packing. A private Mesa EGL check compiled the actual fragment shader and rendered all 256 light combinations. All 11,520 pixels across 45 scenarios matched an independent float32 reference byte for byte. Fractional cosine inputs also matched native reference vectors.

The End retains the existing Java pipeline because its animated native sky producer is incomplete. Darkness uses Java's effect blend lifecycle, whose exact native fade timing remains unverified. Enhanced lighting and resource-pack lighting overrides remain outside this port. The GPU checks establish the calculation for supplied inputs, not complete visual parity with a running native client.

The full dependency-ordered build passes: six CubeConverter tests, 276 core tests, and 241 executed add-on tests. Another 63 add-on cases require private fixtures and remain skipped. Both core Checkstyle tasks pass. Tooling checks and all 49 tooling tests pass.

The complete saved Hive scene passes local transport and rendering checks after the server resource-pack reload. Render-state observations confirm the native lightmap is active at gamma 0.5. All supplied geometry skins retain their pixels, and remote-player and custom-actor draws are verified. The native day factor reaches its measured night floor of 0.2. No new public Hive connection was made. Captures and screenshots remain private.
