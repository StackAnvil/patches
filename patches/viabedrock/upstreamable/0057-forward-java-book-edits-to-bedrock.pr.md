# Edit and read native books

Forward Java book edits and signing through native book operations. Open the Java reader when the selected native item is a signed book. Bedrock opens this reader locally, while Java 26.3 requires an `OPEN_BOOK` packet.

A live BDS 1.26.51.1 control saves a writable book, then preserves its text after dropping and picking it up. Signing also produces the named item. The previous build never opens the signed reader on right-click.

Packet tests cover signed-book use in three hotbar slots and verify that reading does not mutate inventory.

The updated ViaProxy build opens the signed reader after signing, dropping, and picking up the book. The live reader preserves the authored text.
