# Native language parsing and formatting

The text path previously used a generic language parser and formatter.
It lost native key folding, raw byte identity, whitespace, and argument semantics.
This patch uses the native byte parser, lookup cache, and formatter in resource text and early disconnect messages.
A file replacement invalidates its parsed cache. Existing text snapshots retain their own tables.

The existing accepted English source policy stays in effect.
Locale acquisition, language registration and selection, full asset-provider ownership, and visible parity remain separate work.

Fresh original 1.26.51.1 controls cover 1,099 parser cases, 6,689 lookup cases, five cache transitions, 752 formatter cases, and 777 fallback cases.
Another 780 compositions run the real parser, map/cache lookup, and formatter on the same table without a supplied lookup result.
All ten focused checks pass without skips. Restoring the old parser and three deliberate regressions fail behavioral assertions.

The probes supply declared raw files, controlled tables, argument vectors, and allocator, CRT, and single-thread lock boundaries.
They do not establish full native locale, provider, client, or rendering ownership.
The NBT scalar prerequisite supplies the lossless byte/string bridge.


The existing cache-concurrency test now supplies actual file bytes to the new reader.
A fresh native control confirms its trailing value space. The test retains all reader-count, table-identity, and immutability assertions.

The combined build includes the newer ticked actor-motion replay changes.
It passes 2,666 tests, with 163 optional skips and no failures or errors.
All 105 core and 38 client patches replay. All ten new language tests run without skips.
Eleven packaged tests pass, including content-cache concurrency, with eleven verified production class origins.
All 1,427 core classes match the embedded add-on and proxy copies. All 1,143 production client classes match the add-on.
Build outputs match the relevant packaged classes after standard build-token replacement.

The ordinary BDS 1.26.51.1 route passes all three cooking families and same-world reconnect.
All final cooking counts match. The active integration copies use the current add-on, and normal cleanup stops the private display.
This route does not establish native authored-screen acceptance or pixels.

The primary-name integration test compares the selected-definition producer through current text resources with 1,182 original native cases.
Ordinary, component and written-book methods cover custom-name types, append data, malformed UTF-8 and defined zero-count stacks.
A simplified formatter in the first control disagreed on missing arguments. The control now composes the original native language formatter.
The Java producer passes with the existing language implementation.
A second test verifies retained definitions and lazy source acquisition.
Native receiver fields and locale lookup remain supplied. Full locale and registry lifetime are not established.
