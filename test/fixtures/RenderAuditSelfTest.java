package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.JsonParser;
import java.nio.file.Files;
import java.nio.file.Path;

public final class RenderAuditSelfTest {
    public static void main(String[] args) throws Exception {
        Path report = Path.of(args[0]).resolve("render-audit.json");
        RenderAudit.playerRenderer();
        RenderAudit.playerRenderer();
        Thread.sleep(250);
        RenderAudit.tick();
        require(selections(report) == 2);

        var published = Files.getLastModifiedTime(report);
        Thread.sleep(250);
        RenderAudit.tick();
        RenderAudit.flush();
        require(Files.getLastModifiedTime(report).equals(published));

        RenderAudit.playerRenderer();
        RenderAudit.playerRenderer();
        RenderAudit.flush();
        require(selections(report) == 4);
    }

    private static int selections(Path report) throws Exception {
        return JsonParser.parseString(Files.readString(report)).getAsJsonObject()
                .get("nativePlayerRendererSelections").getAsInt();
    }

    private static void require(boolean condition) {
        if (!condition) throw new AssertionError();
    }
}
