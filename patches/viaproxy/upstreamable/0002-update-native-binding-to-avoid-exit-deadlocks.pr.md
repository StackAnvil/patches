Update the libdatachannel bundle to the version already used by the Bedrock add-on.
The owning patch records the native registry lifetime change and exact source revisions.

The published Java API and native bundle match their advertised Maven SHA-256 checksums.
Callback-overlap, explicit-close, and awaited-close controls pass on Linux with JDK 17 and 25.
The previous bundle hangs during the same callback-overlap control.

The [process regression](../../../src/replay/java/net/pistonmaster/stackanvil/replay/NativeShutdownSelfTest.java) opens a real loopback data channel and exits its JVM while the native callback remains active.
The parent requires a normal exit and verifies that callback overlap occurred.
The full proxy stack and standalone upstream patch build pass.
Transport self-tests and the native process regression pass with the rebuilt proxy.
Its Java API classes and all eight native binaries match the verified Maven artifacts.

An installed Lifeboat attempt stopped before gameplay after an HTTP 503 response.
Cancellation stopped all owned processes normally and retained the artifact receipts.
This attempt does not establish successful gameplay with the updated bundle.

These checks establish selected Linux lifecycle behavior.
Windows, macOS, and broader networking and native gameplay parity require separate validation.
