## Purpose

Show discovered Bedrock LAN worlds in a separate account-free browser under Server Lists.
Preserve each world's selected transport, responder, network ID, nonce, and login mode through connection setup.
RakNet worlds require an explicit offline-login choice because their advertisements omit authentication flags.

## Transport and identity

Ordinary Bedrock addresses retain RakNet transport. Explicit `nethernet://` addresses select HTTP NetherNet.
The owning patch retains the RakNet channel, framing, status, and encryption infrastructure that upstream removed.
The browser follows upstream's current Server Lists popup.

LAN and account-free HTTP connections use core's `AuthData.createSelfSigned`.
The HTTP offer and game login share the same token and key, including connections without LAN discovery metadata.
Online account connections retain their authenticated identity.

## Validation and remaining limits

The current stack replays in a fresh clone without cached ancestors. The full build and add-on suite pass.
Discovery and response tests cover advertisement parsing and incomplete native SDP answers.

Earlier owned BDS 1.26.51.1 controls rejected unsigned HTTP offers and accepted the shared self-signed identity through gameplay.
The offer and login identities matched, and both signatures validated.
Those observations do not establish live behavior on the updated upstream client.
Current-pin LAN discovery, online accounts, transfers, platform acceptance, and Iris remain unverified.
