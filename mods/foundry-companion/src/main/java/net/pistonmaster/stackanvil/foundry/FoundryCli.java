package net.pistonmaster.stackanvil.foundry;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/** Runs the Bedrock Foundry command line, which owns add-on downloads, server files, and BDS processes. */
public final class FoundryCli {

    private static final long LIST_TIMEOUT_SECONDS = 30;

    private final Path executable;

    public FoundryCli(final Path executable) {
        this.executable = executable;
    }

    public Path executable() {
        return this.executable;
    }

    /**
     * Finds the executable: the configured path first, then {@code BEDROCK_FOUNDRY}, then each {@code PATH} entry.
     */
    public static Optional<Path> locate(final String configured, final String environment, final String path, final boolean windows) {
        for (final String candidate : new String[]{configured, environment}) {
            if (candidate != null && !candidate.isBlank()) {
                final Path file = Path.of(candidate.trim());
                return Files.isRegularFile(file) && Files.isExecutable(file) ? Optional.of(file) : Optional.empty();
            }
        }
        if (path == null) {
            return Optional.empty();
        }
        final String name = windows ? "bedrock-foundry.exe" : "bedrock-foundry";
        for (final String directory : path.split(File.pathSeparator)) {
            if (directory.isBlank()) {
                continue;
            }
            final Path file = Path.of(directory).resolve(name);
            if (Files.isRegularFile(file) && Files.isExecutable(file)) {
                return Optional.of(file);
            }
        }
        return Optional.empty();
    }

    public List<FoundryServer> servers() throws IOException {
        final Process process = new ProcessBuilder(this.executable.toString(), "server", "list", "--json")
                .redirectInput(ProcessBuilder.Redirect.PIPE)
                .start();
        process.getOutputStream().close();
        final CompletableFuture<String> output = read(process.getInputStream());
        final CompletableFuture<String> errors = read(process.getErrorStream());
        try {
            if (!process.waitFor(LIST_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
                process.destroy();
                throw new IOException("Bedrock Foundry did not list its servers within " + LIST_TIMEOUT_SECONDS + " seconds.");
            }
            if (process.exitValue() != 0) {
                throw new IOException(firstLine(errors.join(), "Bedrock Foundry could not list its servers."));
            }
            return parseServers(output.join());
        } catch (final InterruptedException e) {
            Thread.currentThread().interrupt();
            process.destroy();
            throw new IOException("Listing Bedrock Foundry servers was interrupted.", e);
        }
    }

    /** Starts the server. Closing the returned server's input stops it, also when this game exits. */
    public HostedServer run(final FoundryServer server) throws IOException {
        final Process process = new ProcessBuilder(this.executable.toString(), "server", "run", server.id().toString(), "--json").start();
        return new HostedServer(server, process);
    }

    /** Opens the desktop app, where players sign in, download add-ons, and install BDS. */
    public void openDesktop() throws IOException {
        new ProcessBuilder(this.executable.toString())
                .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                .redirectError(ProcessBuilder.Redirect.DISCARD)
                .start();
    }

    static List<FoundryServer> parseServers(final String json) {
        final JsonArray array = JsonParser.parseString(json).getAsJsonArray();
        final List<FoundryServer> servers = new ArrayList<>(array.size());
        for (final JsonElement element : array) {
            final JsonObject server = element.getAsJsonObject();
            final List<String> addons = new ArrayList<>();
            for (final JsonElement addon : server.getAsJsonArray("addons")) {
                addons.add(addon.getAsJsonObject().get("name").getAsString());
            }
            final JsonElement version = server.get("version");
            servers.add(new FoundryServer(
                    UUID.fromString(server.get("id").getAsString()),
                    server.get("name").getAsString(),
                    server.get("port").getAsInt(),
                    version == null || version.isJsonNull() ? null : version.getAsString(),
                    List.copyOf(addons)
            ));
        }
        return List.copyOf(servers);
    }

    static String firstLine(final String text, final String fallback) {
        return text.lines().map(String::strip).filter(line -> !line.isEmpty()).findFirst().orElse(fallback);
    }

    private static CompletableFuture<String> read(final InputStream stream) {
        return CompletableFuture.supplyAsync(() -> {
            try (stream) {
                return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            } catch (final IOException e) {
                return "";
            }
        });
    }

}
