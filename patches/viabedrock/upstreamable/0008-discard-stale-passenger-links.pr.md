Resolve links received before their actors, preserve rider ordering, and clear passenger membership and mount state when links or actors disappear. Remounting removes the passenger from its previous vehicle; a stale unlink cannot clear a newer remote mount.

Expose the optional finite native rider vector at metadata 56 for client adapters. Bedrock 1.26.51.1 protocol 2193 packets provide this vector on mounted actors. Two saved player/chair pairs independently place the player eye at vehicle position plus the vector rotated by negative vehicle yaw, within 1e-7 world units. The vector uses native actor-origin units; a Java adapter subtracts the passenger eye offset once.

The complete core suite passes 293 tests with no failures, errors or skips. Targeted tests cover finite and absent vectors, pending links, stale unlinks, remounts and vehicle removal. Ordinary Java clients behind ViaProxy retain Java attachment placement unless a native client adapter receives the metadata.
