package com.enderdash.agent.replay.fabric;

import com.enderdash.agent.replay.PrivateFiles;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Private recorder control, polled on the client render thread even while gameplay is paused. */
public final class ReplayClientControl {
    private final Path directory;
    private boolean requested;

    public ReplayClientControl(Path directory) throws IOException {
        this.directory = directory;
        try (var output = PrivateFiles.newOutputStream(directory.resolve("client-control-ready"))) {
            output.write(1);
        }
    }

    public void poll(Runnable stop) {
        if (!this.requested && Files.exists(this.directory.resolve("stop-client"))) {
            this.requested = true;
            stop.run();
        }
    }
}
