package net.pistonmaster.stackanvil.foundry;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.function.BooleanSupplier;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.io.TempDir;

@DisabledOnOs(OS.WINDOWS)
class FoundryCliTest {

    private static final UUID ID = UUID.fromString("2b5f0d8e-8f3c-4a43-9c55-0c9f4a1f2d11");
    private static final FoundryServer SERVER = new FoundryServer(ID, "Friends", 19140, "1.26.60.6", List.of());

    @TempDir
    Path directory;

    @Test
    void listsInstalledAndUninstalledServers() throws IOException {
        final FoundryCli cli = this.fake("""
                [ "$*" = "server list --json" ] || exit 2
                printf '%s' '[{"id":"2b5f0d8e-8f3c-4a43-9c55-0c9f4a1f2d11","name":"Friends","port":19140,"version":"1.26.60.6","public":false,"addons":[{"id":"0b4c6ad1-1b6c-4f7e-9d0e-1f7f3f0d2a10","name":"Poisonous Potato Add-On"}]},{"id":"7d2e3c44-5a1b-4c3d-8e9f-001122334455","name":"New","port":19150,"version":null,"public":false,"addons":[]}]'
                """);

        assertEquals(List.of(
                new FoundryServer(ID, "Friends", 19140, "1.26.60.6", List.of("Poisonous Potato Add-On")),
                new FoundryServer(UUID.fromString("7d2e3c44-5a1b-4c3d-8e9f-001122334455"), "New", 19150, null, List.of())
        ), cli.servers());
    }

    @Test
    void reportsFoundrysErrorWhenListingFails() throws IOException {
        final FoundryCli cli = this.fake("""
                echo 'Bedrock Foundry is already using this data directory. Close its other window or CLI process.' >&2
                exit 1
                """);

        final IOException error = assertThrows(IOException.class, cli::servers);
        assertEquals("Bedrock Foundry is already using this data directory. Close its other window or CLI process.", error.getMessage());
    }

    @Test
    void joinsTheReportedAddressAndStopsByClosingFoundrysInput() throws Exception {
        // Foundry stops BDS when its input closes. The fake records that it saw the close instead of being killed.
        final Path closed = this.directory.resolve("input-closed");
        final FoundryCli cli = this.fake("""
                [ "$*" = "server run %s --json" ] || exit 2
                echo '{"event":"log","line":"[INFO] Server started."}'
                echo '{"event":"ready","host":"127.0.0.1","port":19140}'
                while read -r line; do :; done
                touch '%s'
                echo '{"event":"stopped"}'
                """.formatted(ID, closed));

        final HostedServer hosted = cli.run(SERVER);
        await(() -> hosted.state() == HostedServer.State.READY);
        assertEquals("127.0.0.1:19140", hosted.address());
        assertEquals("[INFO] Server started.", hosted.lastLog());

        hosted.stop();
        await(() -> hosted.state() == HostedServer.State.STOPPED);
        assertEquals(true, Files.exists(closed));
    }

    @Test
    void reportsWhyAServerStoppedBeforeItWasReady() throws Exception {
        final FoundryCli cli = this.fake("""
                echo 'Install BDS before starting this server' >&2
                exit 1
                """);

        final HostedServer hosted = cli.run(SERVER);
        await(() -> hosted.state() == HostedServer.State.FAILED);
        assertEquals("Install BDS before starting this server", hosted.failure());
    }

    private FoundryCli fake(final String script) throws IOException {
        final Path executable = this.directory.resolve("bedrock-foundry");
        Files.writeString(executable, "#!/bin/sh\n" + script);
        Files.setPosixFilePermissions(executable, PosixFilePermissions.fromString("rwx------"));
        return new FoundryCli(executable);
    }

    private static void await(final BooleanSupplier condition) throws InterruptedException {
        final Instant deadline = Instant.now().plus(Duration.ofSeconds(10));
        while (!condition.getAsBoolean()) {
            if (Instant.now().isAfter(deadline)) {
                throw new AssertionError("Condition was not met within 10 seconds");
            }
            Thread.sleep(20);
        }
    }

}
