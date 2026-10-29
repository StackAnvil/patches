# feat(players): render server player controllers and costumes

## Purpose

A server can replace minecraft:player with property-driven geometry, textures and animation controllers. Evaluate that graph against the native actor snapshot, retain the player's supplied skin model, and render selected costume surfaces with their material and UV animation bindings. Keep mutable controller variables per player and release server textures when the pack stack changes. Report unresolved active costume assets.

## Design constraints

Evaluate accepted server player graphs against native actor snapshots. Keep wearer appearance, material bindings, UV animation, and effect lifetimes separate from unrelated players.

## Validation and remaining limits

Regression coverage includes `BedrockEntityResourcesTest`, `BedrockPlayerCommandResourcesTest`, `BedrockPlayerControllersTest`, `BedrockResourceLibraryTest`.

Recorded costume and held-context controls cover selected inputs. Shield rendering, remote appearance, mounted cases, and complete native motion remain unfinished.

The [owning patch](0016-render-server-player-costumes.patch) retains implementation rationale and versioned evidence.
