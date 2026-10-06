package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.Gson;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import com.enderdash.agent.replay.PrivateFiles;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Records actual first-person item submissions without changing their pose or light. */
public final class HeldItemLightAudit {
    private static final long started = System.nanoTime();
    private static long previous;
    private static int samples;

    private HeldItemLightAudit() { }

    public static synchronized void submitted(Object layer, Object poses, int packedLight, int overlay, int outline) {
        long now = System.nanoTime();
        if (samples >= 256 || now - started > 360_000_000_000L || now - previous < 1_000_000_000L) return;
        try {
            Object owner = field(layer, "this$0");
            String context = field(owner, "displayContext").toString();
            if (!context.startsWith("FIRST_PERSON_")) return;
            previous = now;
            samples++;
            Map<String, Object> state = new LinkedHashMap<>();
            state.put("capturedAtUtc", Instant.now().toString());
            state.put("displayContext", context);
            state.put("packedLight", packedLight);
            state.put("blockLight", (packedLight >> 4) & 15);
            state.put("skyLight", (packedLight >> 20) & 15);
            state.put("overlay", overlay);
            state.put("outline", outline);
            Object pose = call(poses, "last");
            Object quads = field(layer, "quads");
            Object tints = field(layer, "tintLayers");
            state.put("tintLayers", tints == null ? List.of() : call(tints, "toIntArray"));
            List<Map<String, Object>> rows = new ArrayList<>();
            Class<?> vector = Class.forName("org.joml.Vector3f");
            Class<?> vectorInterface = Class.forName("org.joml.Vector3fc");
            for (Object quad : (Iterable<?>) call(quads, "all")) {
                if (rows.size() >= 64) break;
                Object direction = call(quad, "direction");
                Object normal = pose.getClass().getMethod("transformNormal", vectorInterface, vector)
                        .invoke(pose, call(direction, "getUnitVec3f"), vector.getConstructor().newInstance());
                float x = ((Number) call(normal, "x")).floatValue();
                float y = ((Number) call(normal, "y")).floatValue();
                float z = ((Number) call(normal, "z")).floatValue();
                Object material = call(quad, "materialInfo");
                Object renderType = call(material, "itemRenderType");
                int emission = ((Number) call(material, "lightEmission")).intValue();
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("direction", direction.toString());
                row.put("worldNormal", List.of(x, y, z));
                row.put("javaLevelShade", Math.min(1F, .4F + .6F * (Math.max(0F, (.2F * x + y - .7F * z) / (float) Math.sqrt(1.53F))
                        + Math.max(0F, (-.2F * x + y + .7F * z) / (float) Math.sqrt(1.53F)))));
                row.put("lightEmission", emission);
                row.put("packedLightWithEmission", Class.forName("net.minecraft.util.LightCoordsUtil")
                        .getMethod("lightCoordsWithEmission", int.class, int.class).invoke(null, packedLight, emission));
                Object pipeline = call(renderType, "pipeline");
                row.put("pipeline", call(pipeline, "getLocation").toString());
                row.put("tintIndex", call(material, "tintIndex"));
                rows.add(row);
            }
            state.put("quads", rows);
            Object minecraft = Class.forName("net.minecraft.client.Minecraft").getMethod("getInstance").invoke(null);
            Object renderer = minecraft.getClass().getField("gameRenderer").get(minecraft);
            Object levelState = call(renderer, "gameRenderState").getClass().getField("levelRenderState").get(call(renderer, "gameRenderState"));
            Object playerState = levelState.getClass().getField("playerRenderState").get(levelState);
            Object avatar = playerState.getClass().getField("avatarRenderState").get(playerState);
            state.put("avatarPackedLight", avatar == null ? null : avatar.getClass().getField("lightCoords").get(avatar));
            Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
            Path file = directory.resolve("held-item-light-audit.jsonl");
            PrivateFiles.append(file, (new Gson().toJson(state) + "\n").getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (ReflectiveOperationException | java.io.IOException error) {
            throw new IllegalStateException("Could not audit the first-person item submission", error);
        }
    }

    private static Object field(Object value, String name) throws ReflectiveOperationException {
        for (Class<?> type = value.getClass(); type != null; type = type.getSuperclass()) {
            try {
                Field field = type.getDeclaredField(name);
                field.setAccessible(true);
                return field.get(value);
            } catch (NoSuchFieldException inherited) {
                // GUI item states inherit their display context from the base state.
            }
        }
        throw new NoSuchFieldException(value.getClass().getName() + '.' + name);
    }

    private static Object call(Object value, String name) throws ReflectiveOperationException {
        return value.getClass().getMethod(name).invoke(value);
    }
}
