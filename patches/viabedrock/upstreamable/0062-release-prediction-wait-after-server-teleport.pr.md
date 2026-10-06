# Teleport acknowledgments and prediction waits

## Purpose

Release a local prediction wait when its current Java teleport acknowledgment arrives.
Track the signed ID sent to Java, so a positive acknowledgment cannot complete a negative local correction.
Ignore stale, duplicate, and zero IDs before changing movement state.

Track the latest server teleport separately from a later local correction.
Its acknowledgment still sends `HandledTeleport` to Bedrock once.
It cannot clear the newer local wait or grant that correction a position exception.
A new position sync also clears an unconsumed position exception from an earlier confirmed teleport.

## Evidence and testing

The target is native Bedrock 1.26.51.1, protocol 2193.
Strict-BDS recordings include server teleports followed by zero-velocity corrections.
These packets can overlap before Java returns its acknowledgment.
The [movement guide](https://mojang.github.io/bedrock-protocol-docs/guides/player-movement-overview/) describes server movement authority and client acknowledgment.
Native captures establish the target packet values; the latest guide describes a newer preview.

Four unit tests cover both replacement orders, wrong-sign IDs, stale IDs, duplicate IDs, and prediction wait state.
They also cover retirement of an earlier position exception.
The full stack builds with the correction handler tests.
This change does not implement movement history replay or vehicle reconciliation.
