package com.enderdash.agent.replay.fabric;

import com.enderdash.agent.replay.PrivateFiles;
import com.viaversion.viaversion.libs.gson.Gson;
import com.viaversion.viaversion.libs.gson.JsonObject;
import com.viaversion.viaversion.libs.gson.JsonParser;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Read-only, bounded form geometry observation on the client tick thread. */
public final class NativeFormAudit {
    private static final String SCREEN = "com.viaversion.viafabricplus.bedrock.screen.form.BedrockNativeFormScreen";
    private static final int MAX_NODES = 8192;
    private static final int MAX_ROWS = 512;
    private static final int MAX_SCREENS = 32;
    private static long lastSample;
    private static int transitions;
    private static Object previousScreen;
    private static boolean disabled;

    private NativeFormAudit() { }

    public static void tick(Object minecraft) {
        if (disabled || System.nanoTime() - lastSample < 1_000_000_000L) return;
        lastSample = System.nanoTime();
        try {
            Object gui = minecraft.getClass().getField("gui").get(minecraft);
            Object screen = call(gui, "screen");
            Object window = call(minecraft, "getWindow");
            Map<String, Object> report = new LinkedHashMap<>();
            report.put("screenClass", screen == null ? "none" : screen.getClass().getName());
            report.put("nativeForm", screen != null && screen.getClass().getName().equals(SCREEN));
            report.put("guiScale", finite(call(window, "getGuiScale")));
            report.put("pixelWidth", call(window, "getWidth"));
            report.put("pixelHeight", call(window, "getHeight"));
            report.put("guiWidth", call(window, "getGuiScaledWidth"));
            report.put("guiHeight", call(window, "getGuiScaledHeight"));
            if (Boolean.TRUE.equals(report.get("nativeForm"))) {
                report.put("formId", field(screen, "formId"));
                report.put("pointer", List.of(finite(field(screen, "pointerX")), finite(field(screen, "pointerY"))));
                Object root = field(screen, "root");
                if (root != null) report.putAll(project(root));
            }
            Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
            byte[] bytes = new Gson().toJson(report).getBytes(StandardCharsets.UTF_8);
            if (bytes.length > 1024 * 1024) throw new IllegalStateException("Form audit exceeds output limit");
            Path temporary = directory.resolve("native-form-audit.json.tmp");
            PrivateFiles.write(temporary, bytes);
            Files.move(temporary, directory.resolve("native-form-audit.json"), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            if (screen != previousScreen && transitions < MAX_SCREENS) {
                previousScreen = screen;
                try (var output = PrivateFiles.newOutputStream(directory.resolve("native-form-audit-" + transitions++ + ".json"))) {
                    output.write(bytes);
                }
            }
        } catch (Throwable error) {
            disabled = true;
            // Do not export exception messages, which can contain authored text or resource locations.
            System.err.println("StackAnvil form observation disabled: " + error.getClass().getSimpleName());
        }
    }

    static Map<String, Object> project(Object root) throws ReflectiveOperationException {
        List<Map<String, Object>> controls = new ArrayList<>();
        List<Map<String, Object>> other = new ArrayList<>();
        int[] count = {0};
        walk(root, "0", true, 0, count, controls, other);
        int retained = controls.size();
        for (Map<String, Object> row : other) {
            if (controls.size() == MAX_ROWS) break;
            controls.add(row);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rootBounds", rect(call(root, "bounds")));
        result.put("rootClip", rect(call(root, "clip")));
        result.put("nodeCount", count[0]);
        result.put("retainedInteractiveOrTooltip", retained);
        result.put("rowsTruncated", count[0] > controls.size());
        result.put("rows", controls);
        return result;
    }

    private static void walk(Object box, String path, boolean inheritedVisible, int depth, int[] count,
                             List<Map<String, Object>> controls, List<Map<String, Object>> other) throws ReflectiveOperationException {
        if (depth > 64 || ++count[0] > MAX_NODES) throw new IllegalStateException("Form audit exceeds scene limits");
        Object node = call(box, "node");
        boolean visible = inheritedVisible && (Boolean) call(node, "flag", new Class<?>[] {String.class, boolean.class}, "visible", true)
            && !(Boolean) call(node, "flag", new Class<?>[] {String.class, boolean.class}, "ignored", false);
        String hover = (String) call(node, "string", new Class<?>[] {String.class, String.class}, "hover_text", "");
        boolean interactive = (Boolean) call(node, "interactive");
        List<Map<String, Object>> target = interactive || !hover.isEmpty() ? controls : other;
        if (target.size() < MAX_ROWS) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("path", path);
            row.put("type", call(node, "type"));
            row.put("visible", visible);
            row.put("bounds", rect(call(box, "bounds")));
            row.put("clip", rect(call(box, "clip")));
            row.put("visibleBounds", rect(call(box, "visibleBounds")));
            row.put("layer", finite(call(box, "layer")));
            row.put("action", call(node, "action"));
            row.put("interactive", interactive);
            if (!hover.isEmpty()) {
                row.put("tooltip", true);
                row.put("tooltipBreaks", lineBreaks(hover));
                row.put("tooltipMaxWidth", finite(call(node, "number", new Class<?>[] {String.class, float.class}, "hover_text_max_width", 0f)));
            }
            Object properties = call(node, "properties");
            Object input = call(properties, "get", new Class<?>[] {String.class}, "input");
            if (input != null && input.toString().length() <= 4096) {
                JsonObject values = JsonParser.parseString(input.toString()).getAsJsonObject();
                Map<String, Object> metadata = new LinkedHashMap<>();
                for (String key : List.of("index", "option")) {
                    if (values.has(key) && values.get(key).isJsonPrimitive() && values.get(key).getAsJsonPrimitive().isNumber())
                        metadata.put(key, values.get(key).getAsInt());
                }
                if (values.has("kind") && values.get("kind").isJsonPrimitive()) {
                    String kind = values.get("kind").getAsString();
                    if (List.of("toggle", "slider", "step_slider", "input", "dropdown", "multiselect", "submit").contains(kind)) metadata.put("kind", kind);
                }
                row.put("input", metadata);
            }
            target.add(row);
        }
        List<?> children = (List<?>) call(box, "children");
        for (int index = 0; index < children.size(); index++) walk(children.get(index), path + "/" + index, visible, depth + 1, count, controls, other);
    }

    static int lineBreaks(String value) {
        int breaks = 0;
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            if (character == '\r') {
                breaks++;
                if (index + 1 < value.length() && value.charAt(index + 1) == '\n') index++;
            } else if (character == '\n') breaks++;
        }
        return breaks;
    }

    private static List<Double> rect(Object value) throws ReflectiveOperationException {
        return List.of(finite(call(value, "x")), finite(call(value, "y")), finite(call(value, "width")), finite(call(value, "height")));
    }

    private static double finite(Object value) {
        double number = ((Number) value).doubleValue();
        if (!Double.isFinite(number)) throw new IllegalStateException("Non-finite observed geometry");
        return number;
    }

    private static Object field(Object object, String name) throws ReflectiveOperationException {
        Field field = object.getClass().getDeclaredField(name);
        field.setAccessible(true);
        return field.get(object);
    }

    private static Object call(Object object, String name) throws ReflectiveOperationException {
        return call(object, name, new Class<?>[0]);
    }

    private static Object call(Object object, String name, Class<?>[] types, Object... arguments) throws ReflectiveOperationException {
        Method method = object.getClass().getMethod(name, types);
        method.setAccessible(true);
        return method.invoke(object, arguments);
    }
}
