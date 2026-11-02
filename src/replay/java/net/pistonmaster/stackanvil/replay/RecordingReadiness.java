package net.pistonmaster.stackanvil.replay;

import net.raphimc.viabedrock.protocol.ServerboundBedrockPackets;

import java.io.IOException;
import java.nio.file.Path;

/** Admit a gameplay scene only after this connection initializes its player and sends input. */
public final class RecordingReadiness {
    private final Path directory;
    private boolean initialized;
    private boolean ready;

    public RecordingReadiness(Path directory) {
        this.directory = directory;
    }

    public void record(boolean clientbound, byte[] payload) throws IOException {
        if (clientbound || ready) return;
        int packet = PacketJournal.packetId(payload);
        if (packet == ServerboundBedrockPackets.SET_LOCAL_PLAYER_AS_INITIALIZED.getId()) initialized = true;
        if (packet == ServerboundBedrockPackets.PLAYER_AUTH_INPUT.getId() && initialized) {
            try (var output = PrivateFiles.newOutputStream(directory.resolve("gameplay-ready"))) {
                output.write(new byte[] {1});
            }
            ready = true;
        }
    }
}
