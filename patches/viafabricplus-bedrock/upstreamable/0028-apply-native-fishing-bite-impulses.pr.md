# Apply native fishing bite impulses

## Behavior and dependency

This patch consumes ViaBedrock's `viabedrock:fishing_bite_v1` message and its native float calculation.
Core handles Bedrock event decoding, actor identity, and the capability check.
The add-on applies the impulse on the client thread, using the hook's current motion.
It preserves horizontal motion and subtracts `0.5F` from the vertical motion with native float rounding.

The callback requires the active connection, a live fishing hook, and the matching spawn UUID.
Messages for replaced hooks, other entity types, and other connections cannot affect a current hook.
The callback retains no timer or pending state.
Java's normal biting timer remains unchanged because it does not reproduce the inspected handler.

## Target evidence

The target is Bedrock 1.26.51.1, build 51061372, protocol 2193.
The matching Windows event function `0x14205a350` handles bite event 13.
Its executable SHA-256 is `537c0aee2e79afbdc94b44b28e00f466ae62bc50e2733d953b430db9dbaa9ee7`.
The production helper matches all 108 bounded native impulse cases bit for bit.
Proprietary instructions and execution fixtures remain private.

## Build verification

The core build reports 767 tests, zero failures, and 19 optional skips.
The add-on build reports 594 tests, zero failures, and 114 optional skips.
ViaProxy builds successfully against the same core artifact.
Core contents match the nested add-on dependency and ViaProxy, apart from bundle metadata.

## Live verification

Strict BDS 1.26.51.1 produces bite event 13 after genuine rod input on both direct and ViaProxy connections.
An observer records the original setter and its actual result on the client render thread.
Both routes apply the exact float impulse to current vertical motion and preserve horizontal motion.
The message's UUID identifies the same hook lifetime in the client observer.
Wrong spawn UUID, wrong entity type, and another connection leave motion unchanged on each route.
Early reeling gives no reward or durability damage on either route.
Bite-triggered reeling gives one cod and one durability point.
Reeling a live cow pulls the target and uses three durability points.
All six casts remove their hooks and clear the actual local player's fishing pointer.
Both recorders exit successfully, and the owned BDS stops.
These server reward observations do not establish the client's displayed reward inventory.
The first observer attempt failed because Fabric could not load the private callback class.
The fresh runs use a corrected observer and establish the motion results.

## Remaining coverage

Audio resolution, particle playback, later hook physics, and complete visible native parity remain required.
Ordinary Java feedback needs a faithful standard translation where one exists.
The complete fishing matrix includes enchantments, repeated casts, interrupted use, and displayed rewards.
The native GPU safety guard remains enabled until host graphics recovery is verified.
