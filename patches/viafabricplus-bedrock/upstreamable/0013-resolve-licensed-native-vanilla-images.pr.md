# Resolve licensed native vanilla images

Bedrock servers can reference built-in texture images without including the pixels in their downloadable packs. The saved official Bedrock 1.26.51.1 Hive stack references native bread, bucket and potion images. ViaBedrock supplies vanilla definitions but does not distribute these images.

Register the typed `BuiltinResourcePackProvider` and load the matching official package through the selected account's licensed asset cache. ViaBedrock calls the provider on its resource-pack executor. First acquisition does not block Netty. With no selected account, return no additional packs and retain the baseline. Acquisition errors propagate through normal resource preparation.

Return image-only layers in native order. Preserve exact path case and PNG, JPG and TGA variants. A higher native overlay can replace a lower PNG with a TGA. Keep the layers below bundled definitions and server packs, and copy the pixels so mutable pack content cannot alter the licensed library cache. Synthetic manifests identify each layer without replacing native atlas or actor definitions.

The existing licensed acquisition patch must first publish the complete texture projection with cache schema 6. Accounts, package bytes and saved captures remain private.

Targeted synthetic tests cover missing-account acquisition, layer order, exact-case lookup, metadata exclusion, pixel isolation, native extension replacement and server overrides. All three provider tests pass against the matching core provider API. Main and test compilation pass. Together with the asset-cache tests, 20 cases pass with no failures or errors; two private licensed probes are skipped.
