package com.enderdash.agent.replay.fabric;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/** Selects a real third-person local-avatar scene only in an isolated offline replay. */
public final class ReplayCamera {
    private static boolean checked;
    private static UUID identity;
    private static Path directory;
    private static int localEntityId = Integer.MIN_VALUE;
    private static boolean ready;

    private ReplayCamera() { }

    public static void tick(Object minecraft) {
        try {
            if (!checked) {
                directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
                Path marker = directory.resolve("replay-self-uuid.txt");
                if (Files.exists(marker)) identity = UUID.fromString(Files.readString(marker).trim());
                checked = true;
            }
            Object player = minecraft.getClass().getField("player").get(minecraft);
            if (player != null) localEntityId = ((Number) player.getClass().getMethod("getId").invoke(player)).intValue();
            if (identity == null) return;
            boolean matches = player != null && identity.equals(player.getClass().getMethod("getUUID").invoke(player));
            ReplaySceneDiagnostics.sample(minecraft, player, directory, matches);
            if (!matches) return;
            Object options = minecraft.getClass().getField("options").get(minecraft);
            Class<?> camera = Class.forName("net.minecraft.client.CameraType");
            Object front = camera.getField("THIRD_PERSON_FRONT").get(null);
            options.getClass().getMethod("setCameraType", camera).invoke(options, front);
            if (!ready) {
                ready = true;
                RenderAudit.thirdPersonScene();
                System.out.println("StackAnvil replay third-person scene ready");
            }
        } catch (ReflectiveOperationException | java.io.IOException error) {
            throw new IllegalStateException("Could not prepare the replay's third-person scene", error);
        }
    }

    public static void submitted(Object renderer, Object state) {
        if (localEntityId == Integer.MIN_VALUE || !renderer.getClass().getName().equals("com.viaversion.viafabricplus.bedrock.render.BedrockPlayerRenderer")) return;
        try {
            if (state.getClass().getField("id").getInt(state) == localEntityId) {
                if (ready) RenderAudit.playerFrame();
            } else RenderAudit.otherPlayerFrame();
        } catch (ReflectiveOperationException error) {
            throw new IllegalStateException("Could not audit the replay's native player submission", error);
        }
    }
}
