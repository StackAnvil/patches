package net.pistonmaster.stackanvil.foundry;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import net.fabricmc.loader.api.FabricLoader;

/** Holds the configured executable and the one server that this game hosts at a time. */
public final class FoundryCompanion {

    public static final String DOWNLOAD_URL = "https://github.com/StackAnvil/BedrockFoundry/releases/latest";

    private static volatile HostedServer hosted;
    private static volatile List<FoundryServer> knownServers = List.of();

    private FoundryCompanion() {
    }

    public static HostedServer hosted() {
        return hosted;
    }

    public static void host(final HostedServer server) {
        hosted = server;
    }

    /** The last listed servers. Foundry cannot list them again while it runs one. */
    public static List<FoundryServer> knownServers() {
        return knownServers;
    }

    public static void rememberServers(final List<FoundryServer> servers) {
        knownServers = List.copyOf(servers);
    }

    public static Optional<FoundryCli> cli() {
        return FoundryCli.locate(configuredExecutable(), System.getenv("BEDROCK_FOUNDRY"), System.getenv("PATH"),
                System.getProperty("os.name", "").toLowerCase(Locale.ROOT).startsWith("windows")).map(FoundryCli::new);
    }

    public static String configuredExecutable() {
        try {
            final Path file = configFile();
            if (!Files.isRegularFile(file)) {
                return null;
            }
            final JsonObject config = JsonParser.parseString(Files.readString(file, StandardCharsets.UTF_8)).getAsJsonObject();
            return config.has("executable") ? config.get("executable").getAsString() : null;
        } catch (final IOException | RuntimeException e) {
            return null;
        }
    }

    public static void configureExecutable(final String executable) throws IOException {
        final JsonObject config = new JsonObject();
        config.addProperty("executable", executable.strip());
        Files.createDirectories(configFile().getParent());
        Files.writeString(configFile(), config + "\n", StandardCharsets.UTF_8);
    }

    private static Path configFile() {
        return FabricLoader.getInstance().getConfigDir().resolve("stackanvil-foundry.json");
    }

}
