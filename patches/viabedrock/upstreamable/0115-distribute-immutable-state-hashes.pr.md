# Distribute immutable block-state hashes

The native palette uses logical states as keys in several large maps. Its property hashes collide heavily when numeric and boolean values trade places. Lookups then compare many unrelated states.

Mix each property pair before an order-independent sum and retain the result on the immutable state. Copy constructor properties in their existing iteration order. Equality, unsorted state strings and derivation methods keep their behavior. Native network palette IDs use the separate NBT hasher and remain unchanged.

The local regression mutates constructor input, retrieves an equal state with reversed property order, and checks the original state string and immutable derivation. Existing runtime-palette and custom-block regressions pass. The final four-project build passes 3,991 tests with 336 optional skips. The filtered production patch applies to the pinned upstream base without setup. The local test configuration prerequisite is test-only.

A private benchmark loads the pinned 23,960-state palette. Distinct hashes rise from 15,338 to 23,960, and the largest collision group falls from 70 states to one. Ten map construction and lookup cycles take about 553 to 659 ms with the old keys and 22 to 46 ms with prototype keys. Those prototype timings exclude construction of the replacement keys and do not establish a whole-join speedup. Final installed measurements are recorded with the owning block conversion notes.
