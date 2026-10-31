# Inherit native air fog defaults

## Purpose

Biomes without an air color inherit the pack-defined data default before the native `#ABD2FF` fallback.
The synthetic `the_void` biome uses the same default.

## Design constraints

Resolve the actual legacy default binding instead of assuming the asset name `minecraft:fog_default`.
Preserve explicit biome colors, including black. Keep water fog separate.

## Validation and remaining limits

`JavaRegistriesFogTest` covers color precedence and missing media.
Native 1.26.60.5 Fancy controls confirm a custom green default beneath a replacement water-only biome binding.
The resource and transport patches cover binding selection and distance composition.
Complete native sky shading remains separate.

The [owning patch](0070-inherit-native-air-fog-defaults.patch) retains the rationale and native evidence.
