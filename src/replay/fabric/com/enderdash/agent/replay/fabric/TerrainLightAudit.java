package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.Gson;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import com.enderdash.agent.replay.PrivateFiles;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Bounded, private ray and quad observations; does not submit geometry or change the world. */
public final class TerrainLightAudit {
    private static long previous;
    private static int samples;

    private TerrainLightAudit() { }

    public static void sample(Object minecraft, Path directory) {
        long now = System.nanoTime();
        if (samples >= 18 || now - previous < 10_000_000_000L) return;
        Object world;
        try {
            world = minecraft.getClass().getField("level").get(minecraft);
            if (world == null) return;
        } catch (ReflectiveOperationException error) {
            return;
        }
        Map<String, Object> audit = new LinkedHashMap<>();
        audit.put("capturedAtUtc", Instant.now().toString());
        List<Map<String, Object>> rays = new ArrayList<>();
        audit.put("rays", rays);
        try {
            Object renderer = minecraft.getClass().getField("gameRenderer").get(minecraft);
            Object camera = call(renderer, "mainCamera");
            Object origin = call(camera, "position");
            audit.put("cameraPosition", vector(origin));
            double fov = number(call(camera, "getFov"));
            // The world can exist before the first render initializes the camera projection.
            if (!Double.isFinite(fov) || fov <= 0 || fov >= 180) return;
            audit.put("fov", fov);
            audit.put("clock", call(world, "getOverworldClockTime"));
            Object window = call(minecraft, "getWindow");
            int width = ((Number) call(window, "getWidth")).intValue();
            int height = ((Number) call(window, "getHeight")).intValue();
            audit.put("framebuffer", List.of(width, height));
            Class<?> matrix = Class.forName("org.joml.Matrix4f");
            Object inverse = camera.getClass().getMethod("getViewRotationProjectionMatrix", matrix)
                    .invoke(camera, matrix.getConstructor().newInstance());
            inverse = call(inverse, "invert");
            if (!(Boolean) call(inverse, "isFinite")) return;
            previous = now;
            samples++;
            audit.put("sample", samples);
            audit.put("inverseViewRotationProjection", new Gson().toJsonTree(inverse));
            Object options = minecraft.getClass().getField("options").get(minecraft);
            boolean ao = (Boolean) call(call(options, "ambientOcclusion"), "get");
            audit.put("ambientOcclusion", ao);
            audit.put("quadObservation", "Recomputed current Java model output; does not inspect cached chunk GPU vertices");
            // Normalized positions cover the registered CubeCraft floor ROI, plus two roof probes.
            List<double[]> points = new ArrayList<>();
            for (double y : new double[] {.73, .77, .81}) {
                for (double x : new double[] {.05, .12, .20}) points.add(new double[] {x, y});
            }
            points.add(new double[] {.45, .30});
            points.add(new double[] {.65, .25});
            Object entity = call(camera, "entity");
            Class<?> vec3 = Class.forName("net.minecraft.world.phys.Vec3");
            Class<?> vec3f = Class.forName("org.joml.Vector3f");
            Class<?> clip = Class.forName("net.minecraft.world.level.ClipContext");
            Class<?> blockMode = Class.forName("net.minecraft.world.level.ClipContext$Block");
            Class<?> fluidMode = Class.forName("net.minecraft.world.level.ClipContext$Fluid");
            Class<?> entityType = Class.forName("net.minecraft.world.entity.Entity");
            for (double[] point : points) {
                Map<String, Object> row = new LinkedHashMap<>();
                rays.add(row);
                row.put("pixel", List.of(point[0] * width, point[1] * height));
                Object direction = vec3f.getConstructor(float.class, float.class, float.class)
                        .newInstance((float) (point[0] * 2 - 1), (float) (1 - point[1] * 2), 1F);
                direction = inverse.getClass().getMethod("transformProject", vec3f).invoke(inverse, direction);
                direction = call(direction, "normalize");
                Object delta = vec3.getConstructor(double.class, double.class, double.class).newInstance(
                        number(call(direction, "x")) * 96, number(call(direction, "y")) * 96,
                        number(call(direction, "z")) * 96);
                row.put("direction", List.of(call(direction, "x"), call(direction, "y"), call(direction, "z")));
                Object end = vec3.getMethod("add", vec3).invoke(origin, delta);
                Object context = clip.getConstructor(vec3, vec3, blockMode, fluidMode, entityType)
                        .newInstance(origin, end, blockMode.getField("VISUAL").get(null), fluidMode.getField("NONE").get(null), entity);
                Object hit = world.getClass().getMethod("clip", clip).invoke(world, context);
                row.put("hitType", call(hit, "getType").toString());
                if (!call(hit, "getType").toString().equals("BLOCK")) continue;
                Object position = call(hit, "getBlockPos");
                Object face = call(hit, "getDirection");
                row.put("hitPosition", vector(call(hit, "getLocation")));
                row.put("blockPosition", blockPosition(position));
                row.put("face", face.toString());
                Object state = world.getClass().getMethod("getBlockState", Class.forName("net.minecraft.core.BlockPos")).invoke(world, position);
                row.put("blockState", state.toString());
                row.put("rawLightNeighborhood", neighborhood(world, position));
                row.put("quads", quads(minecraft, world, position, state, face, ao));
            }
        } catch (ReflectiveOperationException | RuntimeException error) {
            audit.put("diagnosticError", error.toString());
            if (error.getCause() != null) audit.put("diagnosticCause", error.getCause().toString());
        }
        try {
            Path file = directory.resolve("terrain-light-audit.jsonl");
            PrivateFiles.append(file, (new Gson().toJson(audit) + "\n").getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (java.io.IOException error) {
            throw new IllegalStateException("Could not write private terrain observations", error);
        }
    }

    private static List<Map<String, Object>> neighborhood(Object world, Object position) throws ReflectiveOperationException {
        Class<?> pos = Class.forName("net.minecraft.core.BlockPos");
        Class<?> layer = Class.forName("net.minecraft.world.level.LightLayer");
        List<Map<String, Object>> rows = new ArrayList<>();
        // Includes the exposed face and all adjacent corner samples for a full cube.
        for (int y = -1; y <= 1; y++) for (int z = -1; z <= 1; z++) for (int x = -1; x <= 1; x++) {
            Object neighbor = pos.getMethod("offset", int.class, int.class, int.class).invoke(position, x, y, z);
            Object state = world.getClass().getMethod("getBlockState", pos).invoke(world, neighbor);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("position", blockPosition(neighbor));
            row.put("state", state.toString());
            for (String name : List.of("SKY", "BLOCK")) row.put(name.toLowerCase(java.util.Locale.ROOT),
                    world.getClass().getMethod("getBrightness", layer, pos).invoke(world, layer.getField(name).get(null), neighbor));
            rows.add(row);
        }
        return rows;
    }

    private static List<Map<String, Object>> quads(Object minecraft, Object world, Object position,
            Object state, Object face, boolean ao) throws ReflectiveOperationException {
        Class<?> pos = Class.forName("net.minecraft.core.BlockPos");
        Class<?> blockState = Class.forName("net.minecraft.world.level.block.state.BlockState");
        Class<?> output = Class.forName("net.minecraft.client.renderer.block.BlockQuadOutput");
        Class<?> getter = Class.forName("net.minecraft.client.renderer.block.BlockAndTintGetter");
        Class<?> modelType = Class.forName("net.minecraft.client.renderer.block.dispatch.BlockStateModel");
        Class<?> colors = Class.forName("net.minecraft.client.color.block.BlockColors");
        Object modelSet = call(call(minecraft, "getModelManager"), "getBlockStateModelSet");
        Object model = modelSet.getClass().getMethod("get", blockState).invoke(modelSet, state);
        Class<?> rendererType = Class.forName("net.minecraft.client.renderer.block.ModelBlockRenderer");
        Object renderer = rendererType.getConstructor(boolean.class, boolean.class, colors)
                .newInstance(ao, true, call(minecraft, "getBlockColors"));
        List<Map<String, Object>> rows = new ArrayList<>();
        Object sink = Proxy.newProxyInstance(output.getClassLoader(), new Class<?>[] {output}, (proxy, method, args) -> {
            if (!method.getName().equals("put")) return null;
            Object quad = args[3];
            if (!call(quad, "direction").equals(face) || rows.size() >= 16) return null;
            Object instance = args[4];
            Map<String, Object> row = new LinkedHashMap<>();
            Object material = call(quad, "materialInfo");
            Object sprite = call(material, "sprite");
            row.put("sprite", call(call(sprite, "contents"), "name").toString());
            row.put("lightEmission", call(material, "lightEmission"));
            row.put("tintIndex", call(material, "tintIndex"));
            List<Map<String, Object>> vertices = new ArrayList<>();
            for (int i = 0; i < 4; i++) {
                Map<String, Object> vertex = new LinkedHashMap<>();
                Object coordinate = quad.getClass().getMethod("position", int.class).invoke(quad, i);
                vertex.put("localPosition", List.of(call(coordinate, "x"), call(coordinate, "y"), call(coordinate, "z")));
                vertex.put("packedUV", quad.getClass().getMethod("packedUV", int.class).invoke(quad, i));
                int light = ((Number) instance.getClass().getMethod("getLightCoords", int.class).invoke(instance, i)).intValue();
                vertex.put("packedLight", light);
                vertex.put("smoothBlock", light & 255);
                vertex.put("smoothSky", (light >> 16) & 255);
                vertex.put("packedColor", instance.getClass().getMethod("getColor", int.class).invoke(instance, i));
                vertices.add(vertex);
            }
            row.put("vertices", vertices);
            rows.add(row);
            return null;
        });
        long seed = ((Number) state.getClass().getMethod("getSeed", pos).invoke(state, position)).longValue();
        rendererType.getMethod("tesselateBlock", output, float.class, float.class, float.class, getter,
                pos, blockState, modelType, long.class).invoke(renderer, sink, 0F, 0F, 0F, world, position, state, model, seed);
        return rows;
    }

    private static double number(Object value) { return ((Number) value).doubleValue(); }

    private static Object call(Object target, String name) throws ReflectiveOperationException {
        Method method = target.getClass().getMethod(name);
        method.setAccessible(true);
        return method.invoke(target);
    }

    private static List<Object> vector(Object value) throws ReflectiveOperationException {
        return List.of(value.getClass().getField("x").get(value), value.getClass().getField("y").get(value), value.getClass().getField("z").get(value));
    }

    private static List<Object> blockPosition(Object value) throws ReflectiveOperationException {
        return List.of(call(value, "getX"), call(value, "getY"), call(value, "getZ"));
    }
}
