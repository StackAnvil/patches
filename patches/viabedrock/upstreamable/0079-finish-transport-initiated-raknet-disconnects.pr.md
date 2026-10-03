# Finish transport-initiated RakNet disconnects

## Cause and implementation

RakNet emits a `RakDisconnectReason` before it closes the application pipeline.
Core's close handler then starts another disconnect because it still considers the session active.
The transport is already in `DISCONNECTING` state, so that second request does not complete.
The client remains in the world after its session timeout.

Mark a RakNet disconnect event as an initiated disconnect and propagate it.
The following close can then finish without another handshake.
Local closes keep their existing orderly disconnect path.
This shared core handler serves direct connections and ViaProxy.

The [NetworkCompatible 1.7.0 session source](https://github.com/Kas-tle/NetworkCompatible/blob/1.7.0/transport-raknet/src/main/java/org/cloudburstmc/netty/handler/codec/raknet/common/RakSessionCodec.java) emits the event before closing.
The resolved Cloudburst session codec follows the same order.
Runtime inspection establishes that the pinned VFP client loads NetworkCompatible 1.7.0.
The implementation uses their shared public event type.

## Evidence and verification

The comparison uses Java 26.3 and Bedrock 1.26.51.1, build 51061372, protocol 2193.
Before this change, pausing the private server leaves the client channel active after its 30-second session timeout.
Inspection finds a timed-out session in `DISCONNECTING` state.

Two embedded transport tests cover every RakNet disconnect reason and local close completion.
The suite passes with the stack's existing test harness from the resource-pack cache patch.
Main and test Checkstyle pass.
The rebuilt direct client waits 75 seconds at a resource-pack prompt, accepts it, and spawns.
Pausing the private server then produces a disconnect at 30 seconds instead of leaving an active channel.
The complete core suite reports 409 tests, no failures or errors, and one optional fixture skip.
All four targets build.
The patch applies independently to the pinned core upstream base.
The rebuilt ViaProxy route opens the native cartography screen over Java TCP.
The client retains its application timeout handler.
Pausing the Bedrock backend closes the proxy connection at the configured 30-second RakNet timeout.
The Java client then displays its disconnect screen.
