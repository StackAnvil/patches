Bedrock cubes with no UV faces are intentionally invisible. An invented face referred to an undefined texture key, which mixed the missing block atlas with valid item textures and prevented Java models from baking.

Validation: two generated geometry tests pass on Java 17. Private CubeCraft recordings contain both affected turret and watermelon models; offline conversion removes their unresolved texture references while preserving every real face. No server assets are included.
