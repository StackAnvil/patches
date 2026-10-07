
## BDS HTTP capability compatibility

HTTP connections use ViaBedrock's shared signaling implementation.
The pinned BDS 1.26.51.1 endpoint returns successful capability status without JSON metadata.
The native 26.51 client accepts it and completes its SDP exchange.
Core handles that response and retains SDP validation and TLS failure handling.
The rebuilt account-free direct route joins the matching endpoint and reaches gameplay.

## Account-free HTTP identity, October 7, 2026

The add-on now uses core's `AuthData.createSelfSigned` for offline LAN and account-free HTTP connections.
The duplicate identity generator is removed.
HTTP connection setup signs its offer before the transport handshake.
Channel registration transfers the same token and key into ViaBedrock even when no LAN discovery metadata exists.
The subsequent account setup preserves this identity.
Signed online account connections keep their existing path.

An owned BDS 1.26.51.1 transport probe rejects an unsigned offer and opens the self-signed connection.
That probe validates transport establishment only.
The full add-on build passes against the shared factory through an isolated dependency repository.
Its suite reports 612 tests, including 117 optional fixture skips, with no failures or errors.
The rebuilt direct route reaches the strict BDS world and retains 30 seconds after local-player initialization.
Its journal records 619 continuing input packets.
The actual SDP token and key match the game-login token and key; offline and skin token signatures both validate.
The isolated add-on checksum and all 1,260 processed core file entries match the reviewed candidate.
Prism does not emit the requested class-load log, so that observation is recorded without repeating the successful join.
Offline LAN regression, online accounts, transfer reconnects, server-pack conversion, platform acceptance, and Iris with these authentication changes remain to verify.
