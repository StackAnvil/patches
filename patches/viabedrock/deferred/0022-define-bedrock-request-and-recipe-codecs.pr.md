# feat(inventory): define Bedrock request and recipe codecs

## Purpose

Introduce the request, response, and recipe models with their versioned codecs before wiring inventory behavior. Keep enum mappings and codec tests with the protocol foundation so the later container patch starts from a typed Bedrock interface.

## Design constraints

Separate semantic enum values from Cereal variant indexes. Use protocol-2225 explicit values and preserve dynamic recipe identifiers, native descriptors, and signed stack counts.

## Validation and remaining limits

Regression coverage includes `ItemStackCodecTest`, `ItemStackAutoCraftTypeTest`, `ItemStackRequestResultTypeTest`, `NetworkItemCountTest`, `CraftingDataReaderTest`.

An official 1.26.60.5 capture verifies the automatic-craft action from a physical workbench Shift-click.
The regression matches its complete ingredient payload. Separate schema vectors cover descriptor variants and field widths.

Independent wire vectors and malformed-input tests protect codec boundaries. Encoding does not establish installed recipe actions or complete inventory parity.

The [owning patch](0022-define-bedrock-request-and-recipe-codecs.patch) retains implementation rationale and versioned evidence.
