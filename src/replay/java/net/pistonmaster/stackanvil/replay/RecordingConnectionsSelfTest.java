package net.pistonmaster.stackanvil.replay;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

public final class RecordingConnectionsSelfTest {
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("stackanvil-connections-test");
        try {
            var fixture = new RecordingConnections(root, false);
            require(fixture.next().equals(root));
            try { fixture.next(); throw new AssertionError("Replay accepted another connection"); }
            catch (IOException expected) { }
            var recording = new RecordingConnections(root, true);
            List<Path> connections = List.of(recording.next(), recording.next(), recording.next());
            for (int i = 0; i < connections.size(); i++) {
                try (var journal = new PacketJournal(connections.get(i).resolve("packets.sbr"), 2193)) {
                    journal.append(true, new byte[]{11, (byte) i});
                }
            }
            for (int i = 0; i < connections.size(); i++) {
                var entries = PacketJournal.read(connections.get(i).resolve("packets.sbr"), 2193);
                require(entries.size() == 1 && entries.getFirst().payload()[1] == i);
            }
            // An existing destination must never be reused or overwrite its journal.
            var repeated = new RecordingConnections(root, true);
            repeated.next();
            try { repeated.next(); throw new AssertionError("Reused a capture directory"); }
            catch (FileAlreadyExistsException expected) { }
            require(PacketJournal.read(connections.get(1).resolve("packets.sbr"), 2193).getFirst().payload()[1] == 1);
            System.out.println("PASS isolated transfer journals, replay connection guard, and existing capture protection");
        } finally {
            try (var paths = Files.walk(root)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }

    private static void require(boolean condition) { if (!condition) throw new AssertionError(); }
}
