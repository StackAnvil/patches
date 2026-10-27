# Featured Bedrock server browser

Show the live Gatherings catalog with server details, artwork, status and hosted-experience address resolution.
Use the existing Bedrock connection path to join a selected experience.

Keep Realms, LAN and featured-server launch policies in `BedrockServerList`.
The main footer uses these destinations and creates each browser only when its button is pressed.
Realms requires an account. All three browsers require a disconnected client.
Friends stays separate because it also works while connected.
Button order, labels, account tooltips and return navigation stay the same.

The new upstream VFP server-list popup can host these destinations after a successful dependency build is available.
[VFP Jenkins build 2285](https://ci.viaversion.com/job/ViaFabricPlus/2285/) fails because Loom requires Java 25 and Jenkins uses Java 21.
Keep the verified VFP pin until the required Jenkins artifact and checksums can be verified.
The popup migration is still pending.

All four projects build with 2,995 passing tests, 152 optional skips and no failures or errors.
All 38 add-on patches replay, and all 1,193 compiled client classes match the packaged JAR.
No live popup migration or new visual layout is claimed by this refactor.
