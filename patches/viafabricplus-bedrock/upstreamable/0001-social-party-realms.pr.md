## Behavior

Carry forward [viafabricplus-bedrock PR #7](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/7) and complete its Realm community and party travel flows for Bedrock 1.26.51, protocol 2193.

- Community: text and screenshot stories, account-scoped drafts, image previews, paginated comments, post and comment likes, deletion, reporting, moderation, unread badges, and read acknowledgements.
- Members: presence and in-Realm filters, permission and name sorting, profiles, Admin roles, player permissions, blocked players, and the Admin Log.
- Management: invite links and expiry; manual and automatic saves; quota-aware replacement; restore, rename, conversion, deletion, and download; world upload and reset; typed world settings and recipe unlock; resource and behavior pack order and variants; region selection, tier limits, and subscription details.
- Parties: advertise host destinations and follow Realm, external server, and Xbox P2P joins while the party screen is closed. Include the native party ID and leader flag in login data, decode the server destination cookie, and return its acknowledgement. Automatic travel waits seven seconds; an OptIn destination requires Join host. The party screen exposes Travel with host and Join host controls.

Permission queries, counts, comments, media, and current world size load independently. A delayed query keeps the navigation and resolved content available. Account and destination changes prevent stale callbacks from updating the active session.

## Native evidence

The reference client is licensed Bedrock 1.26.51.1. Its Windows executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`. Native binaries, account files, raw HTTPS flows, images, and Ghidra output remain private.

Signed-in native HTTPS captures establish the club feed, Realm event pages, unread results, roles, and story settings. The available account has joined Realms and owns none. Read-only comment requests against captured story roots returned valid empty comment pages. These captures do not validate owner mutations.

Ghidra establishes these additional contracts:

| Native path | Evidence used |
| --- | --- |
| `1415c1170`, `1415c4230` | Comment fields and full comment paths |
| `1477e4aa0`, `1477e57f0` | Ordered like summaries and full-path user likes |
| `147a395a0`, `147a3a110`, `147a397d0` | Xbox post/comment deletion and contract version 2 |
| `1477e67a0`, `1477e8330`, `1477bcfc0` | MediaHub screenshot creation, upload, publication, and post locators |
| `140ff6f20` | Current world size in `result.sizeInBytes` |
| `1450865d0`, `140f72350` | Seven-day invite default, millisecond expiry, and omitted zero expiry |
| `140f7f640`, `146189cb0` | Typed Realm configuration and five pack settings |
| `140f89620` | Active-world reset route |
| `1413fcbd0`, `142275810`, `142274e60` | Host cookies, travel choices, and seven-second notifications |
| `140479280` | Authenticated party ID and leader login claims |

The packet handshake follows Mojang's [protocol 2193 destination cookie](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/send-party-destination-cookie-packet/349) and [response](https://mojang.github.io/bedrock-protocol-docs/1.26.51/packets/party-destination-cookie-response-packet/350), cross-checked against the nearby preview schemas and native handler. Archive selection follows Microsoft's [Bedrock file extensions](https://learn.microsoft.com/en-us/minecraft/creator/documents/minecraftfileextensions?view=minecraft-bedrock-stable).

## Validation

Targeted Java tests cover permission hierarchy and Realm scoping, stable event/post merging, full comment-path likes, screenshot selection, text limits, destination identity, archive validation, upload targets, and save quota arithmetic. The standalone patch compiles against upstream dependencies and passes all 18 targeted tests. The full stack passes 924 tests with zero failures and 120 skips when run with the configured Bedrock asset bundle.

All 36 patches replay successfully. The feature patch applies to the pinned upstream base without setup. The packaged build passes. Private-display Java checks confirm the signed-in Realm list, unread badges, live story/event feed, comment screen, member filters and sorting controls, and Hub/server settings. The composer restores a draft after closing and reopening. Private-party creation and leaving work, and the party screen displays Join host and Travel with host controls. The test draft was discarded and the test party was left. No stories, comments, reports, or invitations were sent.

Live owner mutations, screenshot publication, a second-account party transfer, and pack installation remain unverified. The native launch guard prevented another native UI session after the host reboot. Gathering destinations are decoded but require a gathering client; this add-on joins Realms, external servers, and Xbox P2P sessions.

## Integration details

Minecraft 26.3 numbers the left mouse button as 1. Shared action lists use `InputConstants.MOUSE_BUTTON_LEFT` so double-click activation works across social and Realm lists.

The patch follows upstream convention plugins, version catalogs, and `jarInJar`. SignalR uses a current MessagePack adapter with aligned Jackson 2 dependencies to avoid loading the older bundled annotations on Jackson 3 hosts.
