# Forward empty-bucket fluid hits

Java sends empty-bucket use without the source-fluid hit that Bedrock needs. Raycast source fluids at the actual interaction reach and forward the hit through normal block use. Preserve the selected slot and prediction sequence. Apply this behavior on negotiated direct and ViaProxy Bedrock connections.

Tests cover source water and lava, flowing fluids, occlusion, and reach limits. Java 26.3 bucket bytecode and Geyser's inventory transaction implementation establish the different client paths.

A live BDS 1.26.51.1 control with the previous build leaves source water unchanged and does not produce a water bucket. The updated ViaProxy build removes that source water and gives the player a water bucket. BDS confirms both results.
