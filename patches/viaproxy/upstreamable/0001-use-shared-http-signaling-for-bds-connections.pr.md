Use ViaBedrock's shared HTTP signaling and self-signed identity for account-free BDS connections.
The pinned upstream routes ordinary Bedrock socket addresses through HTTP NetherNet.
It removes the separate HTTP address type and the RakNet backend.
LAN discovery and Xbox signaling keep their existing providers.

The Java handshake has no player name.
The proxy waits for one real `LoginHello` before opening an account-free HTTP backend.
It uses the core identity's token and key for both signaling and game login.
The saved packet then follows normal login validation and online-mode verification.
Disconnect, unexpected input, and the configured deadline cancel the wait.

Three `EmbeddedChannel` tests cover packet consumption, read control, deadline cancellation, disconnect cleanup, and unexpected input.
The route case covers login, transfer, status, online accounts, LAN discovery, both Xbox providers, and Java targets.
The tests replace the network callback and do not establish game-login acceptance.

Earlier native BDS 1.26.51.1 captures establish the empty capability response and signed identity requirements.
The rebased build does not establish a fresh native join or transfer reconnect.

This patch still requires the [core HTTP signaling and identity API](../../viabedrock/upstreamable/0090-accept-bds-http-capability-responses.pr.md).
The updated upstream ViaProxy dependency does not contain that unmerged API.
The standalone PR check therefore stops at its recorded prerequisite.
The full StackAnvil build uses the locally patched core.

The rebased full build passes all four proxy tests.
