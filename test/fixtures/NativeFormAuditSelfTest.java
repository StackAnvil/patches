package net.pistonmaster.stackanvil.replay.fabric;

import com.viaversion.viaversion.libs.gson.JsonObject;
import com.viaversion.viaversion.libs.gson.JsonParser;
import com.viaversion.viafabricplus.bedrock.screen.ui.NativeUiSceneScreen;
import com.viaversion.viafabricplus.bedrock.screen.form.BedrockFormController;
import com.viaversion.viafabricplus.bedrock.screen.form.BedrockFallbackFormScreen;
import com.viaversion.viafabricplus.bedrock.screen.container.BedrockNativeContainerScreen;
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

        for (var malformed : List.of("null", "[]", "false", "\"private\"")) {
            JsonObject invalid = new JsonObject();
            invalid.add("input", JsonParser.parseString(malformed));
            Box mixed = new Box(new Node("button", invalid, true, 9), bounds, clip, clip, List.of(child));
            Map<String, Object> observed = NativeFormAudit.project(mixed);
            List<?> inputs = (List<?>) observed.get("rows");
            require(inputs.size() == 2);
            require(!((Map<?, ?>) inputs.getFirst()).containsKey("input"));
            require(((Map<?, ?>) inputs.get(1)).get("input").equals(Map.of("kind", "slider", "index", 4)));
            require(!observed.toString().contains("private"));
        }

        Map<String, Object> authored = NativeFormAudit.observe(new NativeUiSceneScreen(new BedrockFormController(37), root));
        require(authored.get("nativeForm").equals(true));
        require(authored.get("presentation").equals("authored-form"));
        require(authored.get("formId").equals(37));
        require(authored.get("rows").equals(rows));
        require(authored.get("pointer").equals(List.of(12d, 24d)));
        Map<String, Object> shared = NativeFormAudit.observe(new NativeUiSceneScreen(new Object(), root));
        require(shared.get("nativeForm").equals(false));
        require(shared.get("nativeScene").equals(true));
        require(shared.get("presentation").equals("authored-scene"));
        require(!shared.containsKey("formId"));
        require(shared.get("rows").equals(rows));
        Map<String, Object> fallback = NativeFormAudit.observe(new BedrockFallbackFormScreen(37));
        require(fallback.get("nativeForm").equals(false));
        require(fallback.get("presentation").equals("addon-fallback-form"));
        require(fallback.get("formId").equals(37));
        require(NativeFormAudit.observe(new OrdinaryDialog()).get("presentation").equals("java-dialog"));
        require(NativeFormAudit.observe(null).get("presentation").equals("other"));

        BedrockNativeContainerScreen inventory = new BedrockNativeContainerScreen();
        inventory.tooltip(2, "hotbar_items", 2);
        Map<String, Object> bundle = NativeFormAudit.observe(inventory);
        require(bundle.get("nativeInventory").equals(true));
        require(bundle.get("inventoryInputAudit").equals("available"));
        require(bundle.get("inventoryBundleAudit").equals("available"));
        require(bundle.get("inventoryBundleTooltipMode").equals(2));
        require(bundle.get("inventoryBundleSource").equals(Map.of("collection", "hotbar_items", "index", 2)));
        inventory.tooltip(0, "hotbar_items", 2);
        Map<String, Object> missing = NativeFormAudit.observe(inventory);
        require(missing.get("inventoryBundleTooltipMode").equals(0));
        require(missing.get("inventoryBundleSource").equals(Map.of("collection", "", "index", -1)));
        require(missing.get("inventoryBundleHover").equals(bundle.get("inventoryBundleHover")));
        inventory.tooltip(2, "private source identifier", 2);
        Map<String, Object> restored = NativeFormAudit.observe(inventory);
        require(restored.get("inventoryBundleSource").equals(Map.of("collection", "other", "index", 2)));
        require(!restored.toString().contains("private"));
        require(inventory.mode() == 2);

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

    private static final class OrdinaryDialog extends net.minecraft.client.gui.screens.dialog.DialogScreen { }

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
