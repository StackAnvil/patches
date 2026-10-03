# Preserve direct sessions during resource-pack prompts

## Cause and implementation

Java's application `ReadTimeoutHandler` closes a direct Bedrock connection after 30 seconds without decoded game packets.
The resource-pack prompt can pause those packets while the underlying RakNet session remains healthy.
Its heartbeats do not reach Java's application handler.

Remove that handler only from a `RakClientChannel` when it has the expected type.
Keep RakNet's 30-second session timeout and its connection timeout.
TCP and other transport handlers keep their existing behavior.
This requires the add-on because core cannot change Minecraft's direct channel initialization.

Cloudburst's [session codec](https://github.com/CloudburstMC/Network/blob/develop/transport-raknet/src/main/java/org/cloudburstmc/netty/handler/codec/raknet/common/RakSessionCodec.java) updates activity on datagrams and checks the configured session timeout.
Bytecode inspection confirms these paths in the resolved `2.0.0.CR4-20260922.202324-5` dependency.
The pinned VFP runtime loads NetworkCompatible 1.7.0, whose [versioned source](https://github.com/Kas-tle/NetworkCompatible/blob/1.7.0/transport-raknet/src/main/java/org/cloudburstmc/netty/handler/codec/raknet/common/RakSessionCodec.java) uses the same activity timeout.

## Comparison

The private comparison uses Java 26.3 and Bedrock 1.26.51.1, build 51061372, protocol 2193.
The server supplies a converted resource pack over a direct connection.
Before the change, the client reports `ReadTimeoutException` after 30 seconds at the consent prompt.
With the built patch, it waits 46 seconds, accepts the pack, and spawns successfully.
Pipeline inspection confirms that the application handler is absent and `RAK_SESSION_TIMEOUT` remains 30000 milliseconds.

## Verification

The add-on and its dependencies build.
The add-on suite reports 521 tests, no failures or errors, and 109 optional fixture skips.
Core tests and main and test Checkstyle pass.
The patch applies independently to the pinned add-on upstream base without setup patches.

The silent-peer comparison exposed a separate recursive close in core.
The [core disconnect patch](../../viabedrock/upstreamable/0079-finish-transport-initiated-raknet-disconnects.pr.md) handles the transport event before closing.
With both changes, the direct client waits 75 seconds at the prompt and then spawns.
Pausing the private server produces a disconnect after 30 seconds.
The rebuilt ViaProxy route retains Java's TCP timeout handler and opens the native cartography screen.
Pausing its Bedrock backend closes the connection after 30 seconds.
Other transports and platforms remain unverified.

## Reported joining failure

A subsequent 0.3.0 report shows `ReadTimeoutException` and an interrupted `ProcessImpl.waitFor` during built-in image acquisition.
That release does not contain this timeout patch.
Disconnect cancels the resource-pack task, which can interrupt its package helper.
The report is consistent with the tested timeout failure; its exact platform and acquisition state remain unverified.
[StackAnvil 0.3.1](https://github.com/StackAnvil/patches/releases/tag/stack-v0.3.1) includes both timeout and transport-disconnect fixes.
