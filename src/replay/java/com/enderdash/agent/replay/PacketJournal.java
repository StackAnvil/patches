package com.enderdash.agent.replay;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.*;

/** Decrypted packet payloads. Authentication packets never enter this journal. */
public final class PacketJournal implements AutoCloseable {
    public static final int MAGIC = 0x53425231;
    public static final int MAX_PACKET_BYTES = 32 * 1024 * 1024;
    public static final long MAX_JOURNAL_BYTES = 512L * 1024 * 1024;
    private final DataOutputStream output;
    private final long start = System.nanoTime();
    private long written = 8;

    public record Entry(boolean clientbound, long nanos, byte[] payload) {
        public int id() { return packetId(payload); }
    }

    public PacketJournal(Path file, int protocol) throws IOException {
        output = new DataOutputStream(new BufferedOutputStream(Files.newOutputStream(file, StandardOpenOption.CREATE_NEW)));
        Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rw-------"));
        output.writeInt(MAGIC);
        output.writeInt(protocol);
        output.flush();
    }

    public static boolean recordable(boolean clientbound, int id) {
        return clientbound ? id != 3 && id != 143 : id != 1 && id != 4 && id != 193 && id != 94;
    }

    public synchronized void append(boolean clientbound, byte[] payload) throws IOException {
        if (!recordable(clientbound, packetId(payload))) return;
        if (payload.length > MAX_PACKET_BYTES || written + 13L + payload.length > MAX_JOURNAL_BYTES) {
            throw new IOException("Packet recording exceeded its size limit");
        }
        output.writeBoolean(clientbound);
        output.writeLong(System.nanoTime() - start);
        output.writeInt(payload.length);
        output.write(payload);
        output.flush();
        written += 13L + payload.length;
    }

    public static List<Entry> read(Path file, int protocol) throws IOException {
        if (Files.size(file) > MAX_JOURNAL_BYTES) throw new IOException("Packet journal exceeded its size limit");
        try (var input = new DataInputStream(new BufferedInputStream(Files.newInputStream(file)))) {
            if (input.readInt() != MAGIC || input.readInt() != protocol) throw new IOException("Incompatible packet journal");
            List<Entry> entries = new ArrayList<>();
            long previous = -1;
            for (;;) {
                int direction = input.read();
                if (direction == -1) return entries;
                long nanos = input.readLong();
                int length = input.readInt();
                if (direction > 1 || nanos < previous || length < 1 || length > MAX_PACKET_BYTES || entries.size() >= 250_000) {
                    throw new IOException("Invalid packet journal entry");
                }
                byte[] payload = input.readNBytes(length);
                if (payload.length != length) throw new EOFException("Truncated packet journal");
                int id = packetId(payload);
                if (!recordable(direction == 1, id)) throw new IOException("Authentication packet in journal");
                entries.add(new Entry(direction == 1, nanos, payload));
                previous = nanos;
            }
        }
    }

    public static int packetId(byte[] payload) {
        int value = 0;
        for (int i = 0; i < Math.min(5, payload.length); i++) {
            int part = Byte.toUnsignedInt(payload[i]);
            value |= (part & 127) << (i * 7);
            if ((part & 128) == 0 && value >= 0 && value < 1024) return value;
            if ((part & 128) == 0) break;
        }
        throw new IllegalArgumentException("Invalid Bedrock packet ID");
    }

    @Override public synchronized void close() throws IOException { output.close(); }
}
