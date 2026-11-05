package net.pistonmaster.stackanvil.replay.fabric;

import com.viaversion.viaversion.libs.gson.Gson;
import net.pistonmaster.stackanvil.replay.PrivateFiles;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Observe level requests and decoded channel starts without changing sound playback. */
public final class NativeSoundAudit {
    private static final int MAX_ROWS = 128;
    private static final List<Map<String, Object>> rows = new ArrayList<>();
    private static long sequence;
    private static boolean disabled;

    private NativeSoundAudit() { }

    public static synchronized void level(String event, Object position) {
        if (disabled) return;
        try {
            Map<String, Object> row = row("level", position);
            row.put("event", bounded(event));
            save(row);
        } catch (Exception error) { disable(error); }
    }

    public static synchronized void started(Object sound, Object position) {
        if (disabled) return;
        try {
            Object selection = call(sound, "selection"), audio = call(sound, "audio");
            Map<String, Object> row = row("started", position);
            row.put("sample", bounded((String) call(call(selection, "sample"), "name")));
            row.put("subtitle", bounded((String) call(call(sound, "event"), "subtitle")));
            row.put("volume", call(selection, "volume"));
            row.put("pitch", call(selection, "pitch"));
            row.put("positional", call(selection, "positional"));
            byte[] pcm = (byte[]) call(audio, "pcm");
            row.put("pcmBytes", pcm.length);
            row.put("pcmSha256", HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(pcm)));
            row.put("sampleRate", call(audio, "sampleRate"));
            row.put("channels", call(audio, "channels"));
            save(row);
        } catch (Exception error) { disable(error); }
    }

    private static Map<String, Object> row(String phase, Object position) throws ReflectiveOperationException {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("sequence", ++sequence);
        row.put("millis", System.currentTimeMillis());
        row.put("phase", phase);
        List<Double> coordinates = new ArrayList<>();
        for (String name : List.of("x", "y", "z")) {
            double value = position.getClass().getField(name).getDouble(position);
            if (!Double.isFinite(value)) throw new IllegalArgumentException("Non-finite sound position");
            coordinates.add(value);
        }
        row.put("position", coordinates);
        return row;
    }

    private static Object call(Object owner, String name) throws ReflectiveOperationException {
        Method method = owner.getClass().getDeclaredMethod(name);
        method.setAccessible(true);
        return method.invoke(owner);
    }

    private static String bounded(String value) {
        return value.length() <= 512 ? value : value.substring(0, 512);
    }

    private static void save(Map<String, Object> row) throws Exception {
        if (rows.size() == MAX_ROWS) rows.removeFirst();
        rows.add(row);
        Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
        Path temporary = directory.resolve("native-sound-audit.json.tmp");
        PrivateFiles.write(temporary, new Gson().toJson(Map.of("observations", sequence, "rows", rows)).getBytes(StandardCharsets.UTF_8));
        Files.move(temporary, directory.resolve("native-sound-audit.json"), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
    }

    private static void disable(Exception error) {
        disabled = true;
        System.err.println("StackAnvil sound observation disabled: " + error.getClass().getSimpleName());
    }
}
