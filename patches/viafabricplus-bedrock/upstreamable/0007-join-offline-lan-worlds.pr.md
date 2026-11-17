## Purpose

Show discovered Bedrock LAN worlds in a separate account-free browser under Server Lists.
Preserve each world's responder, network ID, nonce, and login mode through connection setup.

## Transport and identity

Ordinary Bedrock addresses and explicit `nethernet://` addresses use HTTP NetherNet.
LAN discovery and connections use NetherNet only.
Preserved upstream status classes remain unchanged and are not connected to StackAnvil queries.
The browser follows upstream's current Server Lists popup.
Standalone PR preparation requires the social, appearance, and core HTTP identity prerequisites recorded in `series.json`.

LAN and account-free HTTP connections use core's `AuthData.createSelfSigned`.
The HTTP offer and game login share the same token and key, including connections without LAN discovery metadata.
Online account connections retain their authenticated identity.

## Validation and remaining limits

The full stack replays and builds. The add-on suite passes after the transport changes.
Discovery and response tests cover advertisement parsing and incomplete native SDP answers.

Earlier owned BDS 1.26.51.1 controls rejected unsigned HTTP offers and accepted the shared self-signed identity through gameplay.
The offer and login identities matched, and both signatures validated.
Those observations do not establish live behavior on the updated upstream client.
Current-pin LAN discovery, online accounts, transfers, platform acceptance, and Iris remain unverified.
