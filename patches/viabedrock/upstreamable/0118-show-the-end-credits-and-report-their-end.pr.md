Entering the End exit portal froze Java players on BDS 1.26.60. The server sends `ShowCredits` with state 0 and waits for the client to finish the credits before returning the player to the Overworld. ViaBedrock dropped the packet.

A native 1.26.60.5 capture shows the credits and, after Skip, sends `ShowCredits` for its own runtime id with state 1. The server then respawns the player through `ChangeDimension`. This change shows Java's credits screen through the `WIN_GAME` event and sends the native end report when Java closes the credits with `PERFORM_RESPAWN`.

Validation: after killing the dragon on a local BDS 1.26.60 world, a Java player enters the exit portal, sees the credits, and returns to the Overworld spawn.
