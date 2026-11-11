package net.pistonmaster.stackanvil.replay;

import java.nio.file.Path;
import java.util.Arrays;

public final class LongJournalSelfTest {
    public static void main(String[] args) throws Exception {
        var entries = PacketJournal.read(Path.of(args[0]), 2193);
        var last = entries.getLast();
        if (entries.size() != 250_002 || entries.getFirst().id() != 113
                || last.clientbound() || last.nanos() != 900_000_000_000L
                || !Arrays.equals(last.payload(), new byte[]{(byte) 144, 1, 99})) {
            throw new AssertionError("Long recording lost its final gameplay packet");
        }
    }
}
