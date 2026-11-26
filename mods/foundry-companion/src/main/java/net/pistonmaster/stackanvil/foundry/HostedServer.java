package net.pistonmaster.stackanvil.foundry;

import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;

/**
 * A server that this game started through {@code bedrock-foundry server run --json}.
 *
 * <p>Foundry stops BDS when its input closes. The game never kills Foundry, because BDS would then keep running without
 * an owner. Closing input also happens when the game exits or crashes, since the operating system closes the pipe.</p>
 */
public final class HostedServer {

    public enum State { STARTING, READY, STOPPING, STOPPED, FAILED }

    private static final int KEPT_ERROR_LINES = 20;

    private final FoundryServer server;
    private final Process process;
    private final Deque<String> errors = new ArrayDeque<>();
    private final Thread errorReader;
    private volatile State state = State.STARTING;
    private volatile String lastLog = "";
    private volatile String host;
    private volatile int port;
    private volatile String failure;

    HostedServer(final FoundryServer server, final Process process) {
        this.server = server;
        this.process = process;
        this.errorReader = daemon("Foundry errors " + server.name(), this::readErrors);
        daemon("Foundry events " + server.name(), this::readEvents);
    }

    public FoundryServer server() {
        return this.server;
    }

    public State state() {
        return this.state;
    }

    /** True until Foundry exits. A stopping server still owns its port. */
    public boolean active() {
        return this.state != State.STOPPED && this.state != State.FAILED;
    }

    public String lastLog() {
        return this.lastLog;
    }

    public String address() {
        return this.host + ":" + this.port;
    }

    public String failure() {
        return this.failure;
    }

    /** Asks Foundry to stop BDS. Foundry saves the world and exits on its own. */
    public void stop() {
        if (this.state == State.STARTING || this.state == State.READY) {
            this.state = State.STOPPING;
        }
        try {
            this.process.getOutputStream().close();
        } catch (final IOException ignored) {
            // The pipe is already closed when Foundry has exited.
        }
    }

    private void readEvents() {
        boolean stopped = false;
        try (BufferedReader reader = reader(this.process.getInputStream())) {
            String line;
            while ((line = reader.readLine()) != null) {
                final JsonObject event;
                try {
                    event = JsonParser.parseString(line).getAsJsonObject();
                } catch (final JsonParseException | IllegalStateException e) {
                    continue;
                }
                switch (event.has("event") ? event.get("event").getAsString() : "") {
                    case "log" -> this.lastLog = event.get("line").getAsString();
                    case "ready" -> {
                        this.host = event.get("host").getAsString();
                        this.port = event.get("port").getAsInt();
                        if (this.state == State.STARTING) {
                            this.state = State.READY;
                        }
                    }
                    case "stopped" -> stopped = true;
                    default -> {
                    }
                }
            }
        } catch (final IOException ignored) {
            // Foundry closed its output. Its exit code decides the final state.
        }
        try {
            final int exit = this.process.waitFor();
            // Read Foundry's last error before reporting the failure.
            this.errorReader.join();
            if (stopped && exit == 0) {
                this.state = State.STOPPED;
            } else {
                this.failure = this.errorText(exit);
                this.state = State.FAILED;
            }
        } catch (final InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void readErrors() {
        try (BufferedReader reader = reader(this.process.getErrorStream())) {
            String line;
            while ((line = reader.readLine()) != null) {
                synchronized (this.errors) {
                    this.errors.addLast(line);
                    while (this.errors.size() > KEPT_ERROR_LINES) {
                        this.errors.removeFirst();
                    }
                }
            }
        } catch (final IOException ignored) {
            // Foundry closed its error output.
        }
    }

    private String errorText(final int exit) {
        synchronized (this.errors) {
            for (final String line : this.errors.reversed()) {
                if (!line.isBlank()) {
                    return line.strip();
                }
            }
        }
        return this.lastLog.isBlank() ? "Bedrock Foundry exited with code " + exit + "." : this.lastLog;
    }

    private static BufferedReader reader(final InputStream stream) {
        return new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
    }

    private static Thread daemon(final String name, final Runnable task) {
        final Thread thread = new Thread(task, name);
        thread.setDaemon(true);
        thread.start();
        return thread;
    }

}
