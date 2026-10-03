# Resolve licensed native vanilla images

Bedrock servers can reference built-in texture images without including the pixels in their downloadable packs. The saved official Bedrock 1.26.51.1 Hive stack references native bread, bucket and potion images. ViaBedrock supplies vanilla definitions but does not distribute these images.

Register the typed `BuiltinResourcePackProvider` and load the matching official package through the selected account's licensed asset cache. ViaBedrock calls the provider on its resource-pack executor. First acquisition does not block Netty. With no selected account, return no additional packs and retain the baseline. Missing Store credentials, declined consent, cancelled login, and optional download errors return no licensed image layers. The server connection continues with available mappings and packs.

Return image-only layers in native order. Preserve exact path case and PNG, JPG and TGA variants. A higher native overlay can replace a lower PNG with a TGA. Keep the layers below bundled definitions and server packs, and copy the pixels so mutable pack content cannot alter the licensed library cache. Synthetic manifests identify each layer without replacing native atlas or actor definitions.

The existing licensed acquisition patch must first publish the complete texture projection with cache schema 6. Accounts, package bytes and saved captures remain private.

Targeted synthetic tests cover missing-account acquisition, layer order, exact-case lookup, metadata exclusion, pixel isolation, native extension replacement and server overrides. All three provider tests pass against the matching core provider API. Main and test compilation pass. Together with the asset-cache tests, 20 cases pass with no failures or errors; two private licensed probes are skipped.

A private probe also checks the actual licensed cache against the saved HiveSky pack. Both potion images with uppercase native path characters export correctly. Every exported pixel matches the effective native image. The cache contains all 11 native item images referenced by the captured Hive stack.

The saved Hive scene passes strict local transport and rendering checks with the licensed cache: playable spawn, complete scene bytes, 49 geometry skins, and actual remote-player and custom actor draws. All 36 registered custom actor types resolve. The previous 11 missing item images and forced white actor outlines are absent. This checks the captured scene and does not establish full visual parity; custom blocks without fluid support still lose a second water layer.

## Optional acquisition regression

A reported 0.3.1 connection rejected its resource-pack stack after `StoreSignInRequiredException`.
The provider now handles this exception and other optional download IO errors.
Private Linux client probes decline the real consent screen or press Escape, then complete pack preparation and enter the world.
The probes inject unavailable credentials, so they do not verify Microsoft authentication.
Targeted tests cover missing credentials and failed downloads alongside cached image layers and server precedence.
