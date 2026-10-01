package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.Gson;
import net.raphimc.viabedrock.api.model.entity.CustomEntity;
import net.raphimc.viabedrock.protocol.model.SkinData;
import net.raphimc.viabedrock.protocol.types.primitive.ImageType;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.util.*;

/** Counts actual native skin installation and model evaluation without exporting identities. */
public final class RenderAudit {
    private static long lastSave;
    private static int installedSkins, installedGeometrySkins, rejectedSkins, playerSelections, modelUpdates, emptyModels;
    private static int playerFrames;
    private static boolean thirdPerson;
    private static final Set<String> skins = new TreeSet<>(), models = new TreeSet<>(), actors = new TreeSet<>();

    public static synchronized void skin(UUID uuid, SkinData data, boolean installed) {
        if (installed) installedSkins++; else rejectedSkins++;
        if (installed) try {
            Class<?> store = Class.forName("com.viaversion.viafabricplus.bedrock.render.BedrockPlayerSkins");
            var entries = store.getDeclaredField("APPEARANCES"); entries.setAccessible(true);
            Object appearance = ((Map<?, ?>) entries.get(null)).get(uuid);
            var geometry = appearance.getClass().getDeclaredField("geometry"); geometry.setAccessible(true);
            if (geometry.get(appearance) != null) installedGeometrySkins++;
            String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(ImageType.getImageData(data.skinData())));
            skins.add(data.skinData().getWidth() + "x" + data.skinData().getHeight() + ":" + hash);
        } catch (Exception error) { throw new IllegalStateException("Could not audit installed skin", error); }
        save();
    }

    public static synchronized void thirdPersonScene() { thirdPerson = true; save(); }
    public static synchronized void playerFrame() { playerFrames++; if (playerFrames == 1) save(); }

    public static synchronized void playerRenderer() { playerSelections++; if (playerSelections == 1) save(); }

    public static synchronized void actor(String identifier) {
        if (actors.add(identifier)) save();
    }

    public static synchronized void models(String identifier, List<CustomEntity.EvaluatedModel> selected) {
        modelUpdates++;
        actors.add(identifier);
        if (selected.isEmpty()) emptyModels++;
        for (CustomEntity.EvaluatedModel model : selected) models.add(model.geometryValue() + ":" + model.textureValue());
        save();
    }

    public static synchronized void flush() { lastSave = 0; save(); }

    private static void save() {
        if (System.nanoTime() - lastSave < 200_000_000L) return;
        lastSave = System.nanoTime();
        try {
            Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
            Path file = directory.resolve("render-audit.json");
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("installedSkins", installedSkins); stats.put("installedGeometrySkins", installedGeometrySkins); stats.put("rejectedSkins", rejectedSkins);
            stats.put("nativePlayerRenderFrames", playerFrames); stats.put("thirdPersonScene", thirdPerson);
            stats.put("nativePlayerRendererSelections", playerSelections); stats.put("modelUpdates", modelUpdates);
            stats.put("emptyModelUpdates", emptyModels); stats.put("skinTextures", skins);
            stats.put("actorIdentifiers", actors); stats.put("resolvedModels", models);
            Path temporary = directory.resolve("render-audit.json.tmp");
            Files.writeString(temporary, new Gson().toJson(stats));
            Files.setPosixFilePermissions(temporary, PosixFilePermissions.fromString("rw-------"));
            Files.move(temporary, file, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception error) { throw new IllegalStateException("Could not save render audit", error); }
    }
}
