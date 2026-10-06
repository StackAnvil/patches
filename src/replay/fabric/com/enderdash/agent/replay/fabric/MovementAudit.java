package com.enderdash.agent.replay.fabric;

import com.enderdash.agent.replay.PrivateFiles;
import com.viaversion.viaversion.libs.gson.Gson;
import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/** Private local physics observations. Does not change input, pose, motion, or world state. */
public final class MovementAudit {
    private static final Gson JSON = new Gson();
    private static BufferedWriter output;
    private static int samples;
    private static boolean failed;

    private MovementAudit() { }

    public static synchronized void sample(Object player, String phase) {
        if (failed || samples >= 18_000) return;
        try {
            if (output == null) {
                Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
                output = new BufferedWriter(new OutputStreamWriter(
                        PrivateFiles.newOutputStream(directory.resolve("movement-audit.jsonl")), StandardCharsets.UTF_8));
                Runtime.getRuntime().addShutdownHook(new Thread(MovementAudit::close, "movement-audit-close"));
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("phase", phase);
            row.put("tick", player.getClass().getField("tickCount").getInt(player));
            row.put("position", Map.of("x", call(player, "getX"), "y", call(player, "getY"), "z", call(player, "getZ")));
            row.put("motion", vector(call(player, "getDeltaMovement")));
            row.put("swimming", call(player, "isSwimming"));
            row.put("swimAmount", player.getClass().getMethod("getSwimAmount", float.class).invoke(player, 1F));
            row.put("sprinting", call(player, "isSprinting"));
            row.put("inWater", call(player, "isInWater"));
            row.put("underWater", call(player, "isUnderWater"));
            row.put("pose", call(player, "getPose").toString());
            row.put("eyeY", call(player, "getEyeY"));
            row.put("height", call(player, "getBbHeight"));
            Object water = Class.forName("net.minecraft.tags.FluidTags").getField("WATER").get(null);
            Class<?> tag = Class.forName("net.minecraft.tags.TagKey");
            row.put("eyesInWater", player.getClass().getMethod("isEyeInFluid", tag).invoke(player, water));
            row.put("waterHeight", player.getClass().getMethod("getFluidHeight", tag).invoke(player, water));
            row.put("ground", call(player, "onGround"));
            row.put("horizontalCollision", player.getClass().getField("horizontalCollision").getBoolean(player));
            row.put("verticalCollision", player.getClass().getField("verticalCollision").getBoolean(player));
            row.put("usingItem", call(player, "isUsingItem"));
            row.put("useRemainingTicks", call(player, "getUseItemRemainingTicks"));
            row.put("useElapsedTicks", call(player, "getTicksUsingItem"));
            Object usedItem = call(player, "getUseItem");
            row.put("usedItem", call(call(usedItem, "getItem"), "getDescriptionId"));
            row.put("usedItemCount", call(usedItem, "getCount"));
            row.put("heldItemCount", call(call(player, "getMainHandItem"), "getCount"));
            output.write(JSON.toJson(row));
            output.newLine();
            if (++samples % 40 == 0) output.flush();
        } catch (Exception error) {
            failed = true;
            System.err.println("Private movement observation failed: " + error.getClass().getSimpleName());
            close();
        }
    }

    private static Object call(Object target, String name) throws ReflectiveOperationException {
        return target.getClass().getMethod(name).invoke(target);
    }

    private static Map<String, Object> vector(Object value) throws ReflectiveOperationException {
        return Map.of("x", call(value, "x"), "y", call(value, "y"), "z", call(value, "z"));
    }

    private static synchronized void close() {
        if (output == null) return;
        try { output.close(); }
        catch (Exception error) { System.err.println("Private movement observation close failed: " + error.getClass().getSimpleName()); }
        output = null;
    }
}
