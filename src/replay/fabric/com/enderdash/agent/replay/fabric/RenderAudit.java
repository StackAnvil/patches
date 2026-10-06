package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.Gson;
import net.raphimc.viabedrock.api.model.entity.CustomEntity;
import net.raphimc.viabedrock.api.model.NativeSkinFragment;
import net.raphimc.viabedrock.protocol.model.SkinData;
import net.raphimc.viabedrock.protocol.types.primitive.ImageType;
import java.nio.file.*;
import com.enderdash.agent.replay.PrivateFiles;
import java.security.MessageDigest;
import java.util.*;

/** Counts actual native skin installation and model evaluation without exporting identities. */
public final class RenderAudit {
    private static long lastSave;
    private static boolean pending;
    private static int installedSkins, installedGeometrySkins, rejectedSkins, playerSelections, modelUpdates, emptyModels;
    private static int playerFrames, otherPlayerFrames;
    private static int nativeActorFrames, nativeActorModels;
    private static boolean thirdPerson;
    private static final Set<String> skins = new TreeSet<>(), models = new TreeSet<>(), actors = new TreeSet<>();
    private static final Map<String, Integer> fullSkinRecords = new TreeMap<>();

    private static final Map<String, Set<Float>> actorScales = new TreeMap<>();

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
            fullSkinRecords.merge(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(NativeSkinFragment.encode(data))), 1, Integer::sum);
        } catch (Exception error) { throw new IllegalStateException("Could not audit installed skin", error); }
        save();
    }

    public static synchronized void thirdPersonScene() { thirdPerson = true; save(); }
    public static synchronized void playerFrame() { playerFrames++; save(); }

    public static synchronized void otherPlayerFrame() { otherPlayerFrames++; save(); }

    public static synchronized void nativeActorModels(int resolved) {
        nativeActorModels += resolved;
        if (resolved > 0) save();
    }

    public static synchronized void nativeActorFrame() { nativeActorFrames++; save(); }

    public static synchronized void playerRenderer() { playerSelections++; save(); }

    public static synchronized void actor(String identifier) {
        if (actors.add(identifier)) save();
    }

    public static synchronized void models(String identifier, float scale, List<CustomEntity.EvaluatedModel> selected) {
        modelUpdates++;
        actorScales.computeIfAbsent(identifier, ignored -> new TreeSet<>()).add(scale);
        actors.add(identifier);
        if (selected.isEmpty()) emptyModels++;
        for (CustomEntity.EvaluatedModel model : selected) models.add(model.geometryValue() + ":" + model.textureValue());
        save();
    }

    /** Publish pending changes even when the connection has no local Bedrock recorder. */
    public static synchronized void tick() { publish(false); }

    public static synchronized void flush() { publish(true); }

    private static void save() {
        pending = true;
        publish(false);
    }

    private static void publish(boolean force) {
        if (!pending || !force && System.nanoTime() - lastSave < 200_000_000L) return;
        try {
            Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
            Path file = directory.resolve("render-audit.json");
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("installedSkins", installedSkins); stats.put("installedGeometrySkins", installedGeometrySkins); stats.put("rejectedSkins", rejectedSkins);
            stats.put("nativePlayerRenderFrames", playerFrames); stats.put("nativeOtherPlayerRenderFrames", otherPlayerFrames); stats.put("thirdPersonScene", thirdPerson);
            stats.put("nativeCustomActorRenderFrames", nativeActorFrames);
            stats.put("nativeCustomActorResolvedModels", nativeActorModels);
            stats.put("nativePlayerRendererSelections", playerSelections); stats.put("modelUpdates", modelUpdates);
            stats.put("emptyModelUpdates", emptyModels); stats.put("skinTextures", skins);
            stats.put("fullSkinRecords", fullSkinRecords);
            stats.put("actorIdentifiers", actors); stats.put("evaluatedModels", models); stats.put("actorScales", actorScales);
            Path temporary = directory.resolve("render-audit.json.tmp");
            PrivateFiles.write(temporary, new Gson().toJson(stats).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            Files.move(temporary, file, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            lastSave = System.nanoTime();
            pending = false;
        } catch (Exception error) { throw new IllegalStateException("Could not save render audit", error); }
    }
}
