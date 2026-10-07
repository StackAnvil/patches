package com.enderdash.agent.replay.fabric;

import com.viaversion.viaversion.libs.gson.JsonObject;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class NativeFormAuditSelfTest {
    public static void main(String[] arguments) throws Exception {
        JsonObject properties = new JsonObject();
        properties.addProperty("hover_text", "private caption\r\n\nlast\n");
        properties.addProperty("texture", "https://private.example/image.png");
        JsonObject input = new JsonObject();
        input.addProperty("kind", "slider");
        input.addProperty("index", 4);
        input.addProperty("text", "private input");
        properties.add("input", input);
        Node control = new Node("button", properties, true, 7);
        Rect bounds = new Rect(10, 20, 30, 40);
        Rect clip = new Rect(15, 25, 10, 12);
        Box child = new Box(control, bounds, clip, new Rect(15, 25, 10, 12), List.of());
        JsonObject hidden = new JsonObject();
        hidden.addProperty("visible", false);
        Box root = new Box(new Node("panel", hidden, false, Integer.MIN_VALUE), bounds, clip, clip, List.of(child));
        Map<String, Object> report = NativeFormAudit.project(root);
        List<?> rows = (List<?>) report.get("rows");
        Map<?, ?> row = (Map<?, ?>) rows.getFirst();
        require(report.get("nodeCount").equals(2));
        require(row.get("visible").equals(false));
        require(row.get("visibleBounds").equals(List.of(15d, 25d, 10d, 12d)));
        require(row.get("tooltipBreaks").equals(3));
        require(row.get("input").equals(Map.of("kind", "slider", "index", 4)));
        require(!report.toString().contains("private"));
        require(NativeFormAudit.lineBreaks("\\n\r\n\r\n") == 2);

        List<Box> many = new ArrayList<>();
        for (int index = 0; index < 600; index++) many.add(child);
        Box large = new Box(new Node("panel", new JsonObject(), false, Integer.MIN_VALUE), bounds, clip, clip, many);
        Map<String, Object> bounded = NativeFormAudit.project(large);
        require(((List<?>) bounded.get("rows")).size() == 512);
        require(bounded.get("rowsTruncated").equals(true));
        require(bounded.get("nodeCount").equals(601));

        for (int index = 0; index < 64; index++) root = new Box(control, bounds, clip, clip, List.of(root));
        try { NativeFormAudit.project(root); throw new AssertionError("Deep scene accepted"); }
        catch (IllegalStateException expected) { }
        try {
            NativeFormAudit.project(new Box(control, new Rect(Double.NaN, 0, 1, 1), clip, clip, List.of()));
            throw new AssertionError("Non-finite observed bounds accepted");
        } catch (IllegalStateException expected) { }
    }

    public record Rect(double x, double y, double width, double height) { }
    public record Box(Node node, Rect bounds, Rect clip, Rect visibleBounds, List<Box> children) {
        public float layer() { return 0; }
    }
    public record Node(String type, JsonObject properties, boolean interactive, int action) {
        public boolean flag(String key, boolean fallback) { return properties.has(key) ? properties.get(key).getAsBoolean() : fallback; }
        public String string(String key, String fallback) { return properties.has(key) ? properties.get(key).getAsString() : fallback; }
        public float number(String key, float fallback) { return properties.has(key) ? properties.get(key).getAsFloat() : fallback; }
    }
    private static void require(boolean condition) { if (!condition) throw new AssertionError(); }
}
