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
            state.put("elapsedSeconds", (now - started) / 1_000_000_000D);
            state.put("identityMatches", identityMatches);
            state.put("playerPresent", player != null);
            Object screen = call(minecraft.getClass().getField("gui").get(minecraft), "screen");
            state.put("screen", screen == null ? null : screen.getClass().getName());
            Object options = minecraft.getClass().getField("options").get(minecraft);
            state.put("cameraType", call(options, "getCameraType").toString());
            Object renderer = minecraft.getClass().getField("gameRenderer").get(minecraft);
            Object camera = call(renderer, "mainCamera");
            state.put("cameraInitialized", call(camera, "isInitialized"));
            state.put("cameraDetached", call(camera, "isDetached"));
            state.put("cameraPosition", vector(call(camera, "position")));
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
                    int x = (int) Math.floor(((Number) call(player, "getX")).doubleValue()) >> 4;
                    int z = (int) Math.floor(((Number) call(player, "getZ")).doubleValue()) >> 4;
                    state.put("playerChunkLoaded", world.getClass().getMethod("hasChunk", int.class, int.class).invoke(world, x, z));
                    Object position = call(player, "blockPosition");
                    Class<?> blockPosition = Class.forName("net.minecraft.core.BlockPos");
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
        } catch (ReflectiveOperationException | java.io.IOException error) {
            throw new IllegalStateException("Could not observe private replay scene", error);
        }
    }

    private static Object call(Object target, String name) throws ReflectiveOperationException {
        return target.getClass().getMethod(name).invoke(target);
    }

    private static List<Object> vector(Object vector) throws ReflectiveOperationException {
        return List.of(vector.getClass().getField("x").get(vector), vector.getClass().getField("y").get(vector), vector.getClass().getField("z").get(vector));
    }
}
