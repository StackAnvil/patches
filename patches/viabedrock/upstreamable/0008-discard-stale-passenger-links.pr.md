Resolve links received before their actors, preserve native player seat priority, and clear passenger membership and mount state when links or actors disappear. Remounting removes the passenger from its previous vehicle; a stale unlink cannot clear a newer remote mount.

Expose the optional finite native rider vector at metadata 56 for client adapters. Bedrock 1.26.51.1 protocol 2193 packets provide this vector on mounted actors. Two saved player/chair pairs independently place the player eye at vehicle position plus the vector rotated by negative vehicle yaw, within 1e-7 world units. The vector uses native actor-origin units; a Java adapter subtracts the passenger eye offset once.

The earlier core checkpoint passed 293 tests with no failures, errors or skips. Targeted tests cover finite and absent vectors, pending links, stale unlinks, remounts and vehicle removal. Ordinary Java clients behind ViaProxy retain Java attachment placement unless a native client adapter receives the metadata.


## Native membership decisions

Unknown link roles now leave pending and resolved relationships intact.
A repeated link for an existing passenger preserves its seat and mount state.
It emits no passenger update.
This prevents an unknown role from creating a passenger or replacing a valid pending link.

The pinned 1.26.51.1 client establishes these predicates through packet factory `1416b5540`, dispatcher `141733530`, and receiver `1413456e0`.
The receiver appends the raw link to `ActorLinkQueueComponent`.
Consumer `145947f80` resolves both actors and checks existing membership with the native unique ID and vehicle component getters.
Only roles one and two can start riding.
An existing member skips start-riding, angular-velocity changes, and the passenger locator update.
Other nonzero roles perform no action.

A private instruction fixture executes 160 complete consumer cases.
It covers actor resolution, existing membership, supported and unknown roles, unlink flags, and queue retirement.
The real typed getters and membership scan execute unchanged.
World actor lookup, mounting and removal side effects, locator updates, and iteration notifications are fixture boundaries.
A Java comparison covers all 40 resolved-actor cases from that fixture.
Separate regressions cover seat ownership and unknown roles around deferred actor arrival.
All three regressions fail before the fix and pass after it.

The native `has_rider` getter also passes 288 executable contexts.
It tests whether the vehicle component is nonempty, including entries with unresolved or invalid passenger handles.
Java's resolved passenger list does not establish that component's full state.

Those membership comparisons do not establish component mutations, queue timing, or mounted-camera rendering. The insertion comparisons below cover common seat ordering.
The native consumer clears unresolved links when it processes a level, while core retains pending links until actors arrive.
That scheduling difference and the native locator provider still need separate integration work.

The membership checkpoint core build passed 1,488 tests, with 90 optional skips and no failures or errors.
Main, test, and tool Checkstyle checks pass.
The occupied-stack, cooking identity, and native NBT comparison fixtures remain enabled during this build.


## Native passenger insertion

Both accepted link roles now use the same seat insertion rule.
A new player moves before the first passenger when that passenger resolves to a non-player.
An existing first player keeps its seat.
An unresolved first passenger also keeps its place.
Other new passengers append in arrival order.
The wire role no longer promotes a non-player or displaces a player.
Self-mount links cannot enter pending or resolved membership.

Native consumer `145947f80` sends both roles through the same start-riding call.
Base Actor insertion `1419fe0f0` and Mob wrapper `14207d700` establish the common ordering rule.
The actual Player constructor sets the tested player flag; the Actor constructors clear it.
The fixture executes those flag-writing instruction segments before insertion.
It does not execute the complete constructors.

A private fixture executes 224 complete Actor/Mob insertion calls.
The actual native routines write the passenger back-reference and vehicle vector.
They cover zero through 257 existing entries, unresolved first passengers, and empty, full, or spare capacity.
Native allocation and growth cross the aligned-allocation boundary.
The shared counter returns to its initial value after each call.
Four complete Actor/Mob start-riding controls reject self-mounts.

Core matches all 224 insertion results for each accepted role, giving 448 comparisons.
Mandatory regressions cover mixed actor types, preserved player ownership, repeated membership, and self-mounts before and after actor arrival.
The old role-based implementation fails four targeted checks.
All twelve tracker tests pass after the change, including both native comparison fixtures.

Typed component stores and storage factories remain fixture inputs.
Position, notification, changed-flag, and event callbacks remain side-effect boundaries.
The ordering logic and both component mutations execute in native code.
Derived vehicle overrides, complete cycle handling, queue timing, removal lifetimes, and mounted-camera rendering remain separate work.


The insertion checkpoint core build passes 1,491 tests, with 90 optional skips and no failures or errors.
Main, test, and tool Checkstyle checks and Maven POM generation pass.
All 104 exported patches replay to the identical tested source tree.
The four inventory comparison fixtures remain enabled alongside both passenger fixtures.
All four patch health and prerequisite tests pass.

A fresh mounted-scene capture remains unverified.
The recorder's copy-space preflight rejects the current 2.4 GiB of free space.
It requires the private profile size plus a 5 GiB reserve.
No client or server starts during this preflight.
