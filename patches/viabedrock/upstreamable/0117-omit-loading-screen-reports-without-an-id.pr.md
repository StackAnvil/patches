Respawning after a death in another dimension disconnected Java players from BDS 1.26.60 with `UnexpectedPacket`. The server answers the respawn with `ChangeDimension` without a loading screen id, and ViaBedrock still reported a start and an end loading screen without an id.

A native 1.26.60.5 client capture of the same respawn sends no `ServerboundLoadingScreen` packet. It reports loading screens only for dimension changes that carry an id. The join sequence still sends its id-less reports, as the native client does.

Validation: a Java client dies in the Nether of a local BDS 1.26.60 world, presses Respawn and stays connected in the Overworld. Before the change, the same steps disconnected it.
