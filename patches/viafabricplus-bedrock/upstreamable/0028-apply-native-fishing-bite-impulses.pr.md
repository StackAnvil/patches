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

## Native bite particles

The same guarded callback now samples the current hook position, box minimum, and width for particle playback.
Core supplies the surface-floor and direction calculations and the ordered effect list.
The native handler emits one hook effect and two wake effects because legacy WaterWake forwards to the named wake graph.
Each emitter has separate Molang state and a fixed world origin.
Reeling or removing the hook does not move existing particles.

The shared resource library supplies accepted server graphs and available licensed built-ins.
Missing resources or failed wake playback fall back to Java fishing particles.
A missing hook graph has no supported Java mapping.
Async completion requires the same world before creating a fallback.
Cold resource and Molang preparation runs off the render thread, with at most 32 pending requests.
Completion checks both the world and resource generation.
The earlier synchronous path delayed the observed render callback by about 850 ms and disrupted rod input.
The message format, connection checks, actor type, and spawn UUID remain unchanged.

Core reports 769 tests with zero failures and 19 optional skips.
The add-on reports 594 tests with zero failures and 114 optional skips.
ViaProxy builds against the same core; all 1,240 core entries match both bundles, excluding bundle metadata.
All 97 core patches replay, and the unchanged reference patch applies alone to the pinned upstream base.
Configured native distance gates and visible native comparisons remain open.

The first private particle observer failed bytecode verification before rod input.
A later observer recorded requests but could not read the package-private emitter origin.
Corrected observers supply the fresh startup evidence; the failed probes provide no positive startup proof.

## Live particle verification

Fresh strict BDS runs on Linux verify direct/add-on, ViaProxy/add-on, and ViaProxy/ordinary Java.
Both add-ons start one hook effect and two wake effects on the render thread.
Each uses the sampled integral surface and direction `(6, 0, 0.25)`.
The stock Java profile has no mods and receives two standard fishing wake packets.
Each route verifies early reeling, a native bite reward in server inventory, cow retrieval, and durability changes 0, 1, and 3.
All nine hooks disappear and clear the local fishing pointer; actual cow attachment metadata remains verified.
The existing splash packet and resolved engine requests also pass.
Direct and ViaProxy splash callbacks now reach the render thread in about 15 and 28 ms in these runs.
Native visible particles, displayed rewards, configured distance settings, and complete fishing behavior remain required.
The private fixture is restored, the owned BDS instances stop, and both user-owned servers remain unchanged.
