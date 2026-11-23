package net.pistonmaster.stackanvil.replay;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

public final class RecordingReadinessSelfTest {
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("stackanvil-readiness-test");
        try {
            // Protocol 2225 headers: SetLocalPlayerAsInitialized=113, PlayerAuthInput=144, MovePlayer=19.
            byte[] initialized = {113};
            byte[] input = {(byte) 0x90, 1};
            byte[] move = {19};
            Path marker = root.resolve("gameplay-ready");
            var readiness = new RecordingReadiness(root);
            readiness.record(true, initialized);
            readiness.record(false, input);
            require(!Files.exists(marker), "Input without serverbound initialization admitted gameplay");
            readiness.record(false, initialized);
            readiness.record(true, input);
            require(!Files.exists(marker), "Initialization without subsequent serverbound input admitted gameplay");
            readiness.record(false, input);
            require(Files.readAllBytes(marker)[0] == 1, "Initialized input did not admit gameplay");
            readiness.record(false, input);
            require(Files.readAllBytes(marker).length == 1, "Repeated input replaced readiness evidence");

            Path moving = root.resolve("moving");
            PrivateFiles.createDirectory(moving);
            var movePlayer = new RecordingReadiness(moving);
            movePlayer.record(false, move);
            require(!Files.exists(moving.resolve("gameplay-ready")), "Movement without serverbound initialization admitted gameplay");
            movePlayer.record(false, initialized);
            movePlayer.record(false, move);
            require(Files.exists(moving.resolve("gameplay-ready")), "Initialized MovePlayer did not admit gameplay");

            Path next = root.resolve("next");
            PrivateFiles.createDirectory(next);
            new RecordingReadiness(next).record(false, input);
            require(!Files.exists(next.resolve("gameplay-ready")), "Another connection inherited initialized state");
            System.out.println("PASS connection-owned gameplay admission after initialized player movement");
        } finally {
            try (var paths = Files.walk(root)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
