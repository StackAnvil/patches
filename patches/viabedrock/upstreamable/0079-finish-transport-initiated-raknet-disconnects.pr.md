# Complete the RakNet disconnect lifecycle

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

After a local close or a transport disconnect, the handler releases inbound application packets instead of passing them on.
RakNet keeps delivering ordered datagrams while it finishes the disconnect, and ViaVersion stops translating once the channel closes.
Without this, those packets reach the Java decoder as raw Bedrock bytes.
The batch codec emits one packet per decode call and stops once the session is closed.
Netty then hands each packet to the application before splitting the next one, so a Disconnect that closes the session synchronously also ends its own batch.
Packets read before the close pass through unchanged. Each connection gets a new handler, so reconnects start with a clean state.

Declare the Cloudburst repository and RakNet compile/test dependencies explicitly. Current upstream removes its unused transport dependencies. The setup compatibility patch retains unchanged legacy codecs for the pinned hosts and capture tooling; it remains outside upstream PRs.

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

### Late packets after a server disconnect

A live Galaxite session on Bedrock 1.26.60 (protocol 2225) ended with a server Disconnect.
Fifteen more packets arrived 4 ms later. The first, a 20-byte PlayerList (ID 63), was decoded as a Java pong response with 11 extra bytes.
Fourteen more Java decoder errors followed before the disconnect screen appeared.
Embedded transport tests now cover packets that arrive while RakNet finishes a local close, after a transport disconnect, and after a Disconnect in the same batch.
The complete core suite passes: 2,447 tests, no failures, 177 skipped.
Offline replay does not run recorded disconnects, so the fix was checked live.
With only the handler guard, a live repeat of the same Galaxite kick still logged two decoder errors from the rest of the Disconnect's batch.
With the batch guard, a third repeat shows the disconnect screen with no decoder errors.
