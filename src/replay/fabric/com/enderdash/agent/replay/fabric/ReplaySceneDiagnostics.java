package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.Gson;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Private, bounded scene observations. Never changes player, camera, or world state. */
final class ReplaySceneDiagnostics {
    private static final long started = System.nanoTime();
    private static long previous;

    private ReplaySceneDiagnostics() { }

    static void sample(Object minecraft, Object player, Path directory, boolean identityMatches) {
        long now = System.nanoTime();
        if (now - previous < 1_000_000_000L || now - started > 360_000_000_000L) return;
        previous = now;
        try {
            Map<String, Object> state = new LinkedHashMap<>();
            state.put("capturedAtUtc", java.time.Instant.now().toString());
            state.put("elapsedSeconds", (now - started) / 1_000_000_000D);
            state.put("identityMatches", identityMatches);
            state.put("playerPresent", player != null);
            Object screen = call(minecraft.getClass().getField("gui").get(minecraft), "screen");
            state.put("screen", screen == null ? null : screen.getClass().getName());
            Object options = minecraft.getClass().getField("options").get(minecraft);
            state.put("cameraType", call(options, "getCameraType").toString());
            state.put("gamma", call(call(options, "gamma"), "get"));
            Object renderer = minecraft.getClass().getField("gameRenderer").get(minecraft);
            Object camera = call(renderer, "mainCamera");
            state.put("cameraInitialized", call(camera, "isInitialized"));
            state.put("cameraDetached", call(camera, "isDetached"));
            state.put("cameraPosition", vector(call(camera, "position")));
            state.put("cameraRotation", List.of(call(camera, "xRot"), call(camera, "yRot")));
            state.put("cameraUsesLocalPlayer", call(minecraft, "getCameraEntity") == player);
            if (player != null) {
                state.put("playerPosition", List.of(call(player, "getX"), call(player, "getY"), call(player, "getZ")));
                state.put("playerMotion", vector(call(player, "getDeltaMovement")));
                state.put("onGround", call(player, "onGround"));
                state.put("invisible", call(player, "isInvisible"));
                state.put("spectator", call(player, "isSpectator"));
                state.put("rotation", List.of(call(player, "getYRot"), call(player, "getXRot")));
                Object world = minecraft.getClass().getField("level").get(minecraft);
                if (world != null) {
                    state.put("overworldClockTime", call(world, "getOverworldClockTime"));
                    state.put("defaultClockTime", call(world, "getDefaultClockTime"));
                    state.put("skyDarken", call(world, "getSkyDarken"));
                    state.put("rainLevel", world.getClass().getMethod("getRainLevel", float.class).invoke(world, 0F));
                    int x = (int) Math.floor(((Number) call(player, "getX")).doubleValue()) >> 4;
                    int z = (int) Math.floor(((Number) call(player, "getZ")).doubleValue()) >> 4;
                    state.put("playerChunkLoaded", world.getClass().getMethod("hasChunk", int.class, int.class).invoke(world, x, z));
                    Object position = call(player, "blockPosition");
                    Class<?> blockPosition = Class.forName("net.minecraft.core.BlockPos");
                    Class<?> lightLayer = Class.forName("net.minecraft.world.level.LightLayer");
                    for (String layer : List.of("SKY", "BLOCK")) {
                        Object value = lightLayer.getField(layer).get(null);
                        state.put(layer.toLowerCase(java.util.Locale.ROOT) + "LightAtPlayer",
                                world.getClass().getMethod("getBrightness", lightLayer, blockPosition).invoke(world, value, position));
                    }
                    Object probe = call(camera, "attributeProbe");
                    Class<?> attribute = Class.forName("net.minecraft.world.attribute.EnvironmentAttribute");
                    Object skyFactor = Class.forName("net.minecraft.world.attribute.EnvironmentAttributes").getField("SKY_LIGHT_FACTOR").get(null);
                    state.put("skyLightFactor", probe.getClass().getMethod("getValue", attribute, float.class).invoke(probe, skyFactor, 0F));
                    Map<String, Object> colors = new LinkedHashMap<>();
                    Class<?> attributes = Class.forName("net.minecraft.world.attribute.EnvironmentAttributes");
                    for (String name : List.of("SKY_COLOR", "FOG_COLOR", "CLOUD_COLOR", "SUNRISE_SUNSET_COLOR")) {
                        Object value = probe.getClass().getMethod("getValue", attribute, float.class)
                                .invoke(probe, attributes.getField(name).get(null), 0F);
                        colors.put(name, new Gson().toJsonTree(value));
                    }
                    state.put("environmentColors", colors);
                    nativeLightmap(renderer, state);
                    Object foot = world.getClass().getMethod("getBlockState", blockPosition).invoke(world, position);
                    Object below = world.getClass().getMethod("getBlockState", blockPosition).invoke(world, call(position, "below"));
                    state.put("footIsAir", call(foot, "isAir"));
                    state.put("belowIsAir", call(below, "isAir"));
                    int entities = 0;
                    for (Object ignored : (Iterable<?>) call(world, "entitiesForRendering")) entities++;
                    state.put("loadedEntities", entities);
                }
            }
            Path file = directory.resolve("camera-audit.jsonl");
            if (!Files.exists(file)) Files.createFile(file, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rw-------")));
            Files.writeString(file, new Gson().toJson(state) + "\n", StandardOpenOption.APPEND);
            TerrainLightAudit.sample(minecraft, directory);
        } catch (ReflectiveOperationException | java.io.IOException error) {
            throw new IllegalStateException("Could not observe private replay scene", error);
        }
    }

    private static Object call(Object target, String name) throws ReflectiveOperationException {
        return target.getClass().getMethod(name).invoke(target);
    }

    private static void nativeLightmap(Object renderer, Map<String, Object> state) throws ReflectiveOperationException {
        Class<?> bridge;
        try {
            bridge = Class.forName("com.viaversion.viafabricplus.bedrock.injection.access.IBedrockLightmapState");
        } catch (ClassNotFoundException ignored) {
            state.put("nativeLightmap", false);
            return;
        }
        Object frame = call(renderer, "gameRenderState");
        Object lightmap = frame.getClass().getField("lightmapRenderState").get(frame);
        Object parameters = bridge.getMethod("viaFabricPlusBedrock$lightmap").invoke(lightmap);
        state.put("nativeLightmap", parameters != null);
        if (parameters == null) return;
        state.put("nativeSkyLightFactor", call(parameters, "skyFactor"));
        state.put("nativeGammaFactor", call(parameters, "gammaFactor"));
        state.put("nativeDarknessPulse", call(parameters, "darknessPulse"));
        state.put("nativeNightVision", call(parameters, "nightVision"));
        state.put("nativeSunriseColor", new Gson().toJsonTree(call(parameters, "skyColor")));
    }

    private static List<Object> vector(Object vector) throws ReflectiveOperationException {
        return List.of(vector.getClass().getField("x").get(vector), vector.getClass().getField("y").get(vector), vector.getClass().getField("z").get(vector));
    }
}
