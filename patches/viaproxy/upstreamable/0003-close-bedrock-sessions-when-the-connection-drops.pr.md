NetherNet 2.0.0.CR4-20261001 keeps a client channel open when its peer connection fails after the handshake. ViaProxy then leaves the Java player in a frozen world until the Java client's keepalive times out about 30 seconds later.

NetherNet closes these channels since its 2026-10-18 change "Close NetherNet channels with the reason their connection ended", and fires `TransportDisconnectReason.CONNECTION_LOST` for a failed ICE path. This updates to 2.0.0.CR6-20261030.131938-23, the build the ViaFabricPlus Bedrock add-on already ships, with the same libdatachannel 0.24.6.0-20261029 bundle.

Evidence: against a public BDS server whose shared UDP port answers some ICE consent checks with STUN 401, a CR4 session logged `juice: Lost connectivity`. The player then stayed connected with no traffic until the 30 second keepalive timeout. An upstream NetherNet loopback test that cuts the only ICE path closes the CR6 channel with `CONNECTION_LOST` once consent expires.

Remaining limit: libjuice still fails the selected pair on one STUN 401, so these sessions still end. They now end right away with a disconnect.
