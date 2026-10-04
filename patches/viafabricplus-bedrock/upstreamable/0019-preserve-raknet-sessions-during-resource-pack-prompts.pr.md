# Preserve native sessions during asset prompts

## Cause and implementation

Java's application `ReadTimeoutHandler` closes a direct Bedrock connection after 30 seconds without decoded game packets.
Resource consent and licensed asset acquisition can pause those packets while the native transport remains healthy.
Transport heartbeats do not reach Java's application handler.

Remove that handler from `RakClientChannel` and `NetherNetClientChannel` when it has the expected type.
Keep RakNet's 30-second session timeout and its connection timeout.
Keep NetherNet's handshake deadline and native peer closure.
TCP handlers keep their existing behavior.
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
These comparisons cover RakNet. The NetherNet comparison below uses the pinned native transport on Linux.
Actual macOS and Windows clients remain unverified.

## Reported joining failure

A subsequent 0.3.0 report shows `ReadTimeoutException` and an interrupted `ProcessImpl.waitFor` during built-in image acquisition.
That release does not contain this timeout patch.
Disconnect cancels the resource-pack task, which can interrupt its package helper.
The report is consistent with the tested timeout failure; its exact platform and acquisition state remain unverified.
[StackAnvil 0.3.1](https://github.com/StackAnvil/patches/releases/tag/stack-v0.3.1) includes both timeout and transport-disconnect fixes.

## macOS and Modrinth report

The [reported client log](https://mclo.gs/2gcbHoK) uses Java 26.3, Fabric Loader 0.19.5, macOS 27.0, and a Modrinth profile.
It does not identify the StackAnvil patch revision.
Several connections use NetherNet, including a LAN discovery response.
At 16:31:40, resource downloads finish. At 16:32:10, `ReadTimeoutException` closes the connection.
The same 30-second interval repeats in later attempts.
Disconnect then interrupts the package helper at `ProcessImpl.waitFor`.
The interruption is cancellation after disconnect, not evidence that Modrinth failed to start the helper.

The earlier implementation removed the application timeout only for RakNet.
The updated implementation also covers NetherNet.
The pinned Cloudburst NetherNet channel closes its Netty channel when the reliable data channel closes.
Bytecode inspection verifies that callback in the resolved dependency.

A private loopback comparison uses the pinned NetherNet and libdatachannel binaries from the ViaProxy distribution.
The baseline receives a payload, then closes with `ReadTimeoutException` after 30 seconds without application traffic.
Without that handler, the connected peer survives 45 seconds without application traffic and exchanges another payload.
Suspending the owned server process then causes native connectivity loss and client closure after about 26 seconds.
Normal remote closure also reaches the client without an application timeout.
These probes verify transport liveness and failure detection. They do not reproduce the Minecraft UI or Xbox signaling.

The add-on and its converter and core dependencies build successfully.
The updated patch applies independently to the pinned upstream base without setup patches.
The log contains no friends-list error that establishes the cause of the reported slowdown.
Some CDN archives lack a manifest, but protocol downloads recover and finish before the timeout.
Their original archive contents remain unavailable for diagnosis.
Actual macOS Modrinth joining, Store acquisition, and friends-list behavior still need runtime verification.
