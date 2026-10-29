package net.pistonmaster.stackanvil.replay;

import java.io.IOException;
import java.nio.file.Path;

/** Gives each live connection its own journal and resource-pack directory. */
public final class RecordingConnections {
    private final Path root;
    private final boolean transfers;
    private int sequence;

    public RecordingConnections(Path root, boolean transfers) {
        this.root = root;
        this.transfers = transfers;
    }

    public synchronized Path next() throws IOException {
        if (sequence > 0 && !transfers) throw new IOException("The replay fixture permits one connection");
        int connection = ++sequence;
        if (connection == 1) {
            PrivateFiles.protectDirectory(root);
            return root;
        }
        return PrivateFiles.createDirectory(root.resolve("connection-" + connection));
    }
}
