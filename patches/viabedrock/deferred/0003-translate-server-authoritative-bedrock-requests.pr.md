# feat(inventory): translate server-authoritative Bedrock requests

## Purpose

Port inventory actions and crafting data onto the existing container tracker instead of the parallel PR 276 container hierarchy. Track predicted changes by request ID, apply server responses to the owning container, and restore snapshots after rejected requests. Include focused response and routing tests.

## Design constraints

Own predictions and responses by request, container object, and opening lifetime. Preserve native stack IDs, cursor state, transfer quantities, offhand permissions, and authoritative rollback.

## Validation and remaining limits

Regression coverage includes `ContainerTest`, `HorseContainerTest`, `NativeArmorPermissionsTest`, `NativeContainerActionSessionTest`.

Late replies and replacement menus have targeted regressions. Complete native response-manager behavior, live transactions, and every container remain unfinished.

The [owning patch](0003-translate-server-authoritative-bedrock-requests.patch) retains implementation rationale and versioned evidence.
