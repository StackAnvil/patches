package net.pistonmaster.stackanvil.replay.fabric;

import com.viaversion.viaversion.libs.gson.JsonObject;
import com.viaversion.viaversion.libs.gson.JsonParser;
import java.nio.file.Files;
import java.nio.file.Path;

public final class NativeSoundAuditSelfTest {
    public static void main(String[] args) throws Exception {
        Path report = Path.of(args[0]).resolve("native-sound-audit.json");
        Position position = new Position(12.25, -33.5, 4096.125);
        NativeSoundAudit.level("bundle.insert", position);
        JsonObject first = read(report);
        require(first.getAsJsonArray("rows").size() == 1);
        require(first.getAsJsonArray("rows").get(0).getAsJsonObject().get("phase").getAsString().equals("level"));
        require(first.getAsJsonArray("rows").get(0).getAsJsonObject().getAsJsonArray("position").get(1).getAsDouble() == -33.5);
        NativeSoundAudit.started(new Sound(new Definition("subtitles.test.bundle"),
                new Selection(new Sample("sounds/item/bundle/insert1"), .25F, 1.2F, true),
                new Audio(new byte[]{1, 2, 3}, 48000, 1)), position);
        JsonObject started = read(report).getAsJsonArray("rows").get(1).getAsJsonObject();
        require(started.get("phase").getAsString().equals("started"));
        require(started.get("sample").getAsString().equals("sounds/item/bundle/insert1"));
        require(started.get("subtitle").getAsString().equals("subtitles.test.bundle"));
        require(started.get("pcmSha256").getAsString().equals("039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81"));
        require(started.get("pcmBytes").getAsInt() == 3);
        require(started.get("sampleRate").getAsInt() == 48000);
        require(started.get("volume").getAsFloat() == .25F);
        require(started.get("pitch").getAsFloat() == 1.2F);
        for (int index = 0; index < 130; index++) NativeSoundAudit.level("bundle.remove_one", position);
        JsonObject bounded = read(report);
        require(bounded.get("observations").getAsInt() == 132);
        require(bounded.getAsJsonArray("rows").size() == 128);
        require(bounded.getAsJsonArray("rows").get(0).getAsJsonObject().get("sequence").getAsInt() == 5);
        require(!Files.exists(report.resolveSibling("native-sound-audit.json.tmp")));
    }

    private static JsonObject read(Path report) throws Exception {
        return JsonParser.parseString(Files.readString(report)).getAsJsonObject();
    }

    private static void require(boolean condition) {
        if (!condition) throw new AssertionError();
    }

    public static final class Position {
        public final double x, y, z;
        Position(double x, double y, double z) { this.x = x; this.y = y; this.z = z; }
    }
    private record Sample(String name) { }
    private record Selection(Sample sample, float volume, float pitch, boolean positional) { }
    private record Definition(String subtitle) { }
    private record Audio(byte[] pcm, int sampleRate, int channels) { }
    private record Sound(Definition event, Selection selection, Audio audio) { }
}
