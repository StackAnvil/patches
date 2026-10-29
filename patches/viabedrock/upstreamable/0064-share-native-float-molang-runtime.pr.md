# feat(molang): share bounded native float evaluation

## Purpose

Move the interpreter migration, native trigonometry, parser and control-flow bounds into the shared runtime prerequisite. Preserve undefined values, float rounding and return/break behavior for both core and client consumers. Require the preceding Java 25 language baseline and adapt existing custom-entity imports without introducing actor transport.

## Design constraints

Share float arithmetic and native expression behavior across protocol and rendering consumers. Preserve assignment results, scope lifetimes, evaluation order, and unavailable-query semantics.

Prerequisites:

- viabedrock/0000-adopt-java-25-language-baseline.patch: Adopt Java 25 before the float interpreter runtime.

## Validation and remaining limits

Regression coverage includes `BedrockTrigonometryTest`, `MoLangAssignmentResultTest`, `MoLangEngineTest`, `MoLangMathTest`.

Controlled native references cover specific arithmetic, curves, assignments, and query boundaries. They do not establish every Molang expression or rendered actor result.

The [owning patch](0064-share-native-float-molang-runtime.patch) retains implementation rationale and versioned evidence.
