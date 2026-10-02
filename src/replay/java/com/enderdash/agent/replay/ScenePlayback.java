package com.enderdash.agent.replay;

import com.viaversion.viaversion.api.minecraft.BlockPosition;
import com.viaversion.viaversion.api.type.Types;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/** Keeps recorded payload order while pacing subchunk replies against the local client's requests. */
final class ScenePlayback {
    // Cold native clients can take more than 15 seconds to initialize their first matching requests.
    private static final long REQUEST_TIMEOUT = TimeUnit.SECONDS.toNanos(45);
    private record Position(int dimension, int x, int y, int z) { }
    private record Frame(PacketJournal.Entry entry, Set<Position> subchunks) { }
    static final class RequestTimeout extends IllegalStateException {
        RequestTimeout() { super("Timed out waiting for matching local subchunk requests"); }
    }

    private final List<Frame> frames;
    private final Set<Position> requested = new HashSet<>();
    private final long started, origin;
    private int cursor;
    private long delayed, waitingSince = -1, frozenTime;

    ScenePlayback(List<PacketJournal.Entry> scene, long now, long origin) {
        if (scene.isEmpty()) throw new IllegalArgumentException("Empty replay scene");
        frames = new ArrayList<>(scene.size());
        for (var entry : scene) frames.add(new Frame(entry, entry.id() == 174 ? subchunks(entry.payload()) : Set.of()));
        this.origin = origin;
        started = now;
    }

    /** The caller has already consumed the SubChunkRequest packet ID. */
    void request(ByteBuf input) {
        ByteBuf body = input.duplicate();
        int dimension = BedrockTypes.VAR_INT.readPrimitive(body);
        int count = count(body);
        List<BlockPosition> offsets = new ArrayList<>(count);
        for (int i = 0; i < count; i++) offsets.add(BedrockTypes.SUB_CHUNK_OFFSET.read(body));
        int x = body.readIntLE(), y = body.readIntLE(), z = body.readIntLE();
        if (body.isReadable()) throw new IllegalArgumentException("Unexpected subchunk request fields");
        for (var offset : offsets) requested.add(new Position(dimension, Math.addExact(x, offset.x()), Math.addExact(y, offset.y()), Math.addExact(z, offset.z())));
        if (requested.size() > 262_144) throw new IllegalArgumentException("Too many outstanding local subchunk requests");
    }

    boolean advance(long now, Consumer<byte[]> output) {
        if (waitingSince >= 0) {
            if (!canRelease(frames.get(cursor))) {
                if (now - waitingSince >= REQUEST_TIMEOUT) throw new RequestTimeout();
                return false;
            }
            delayed = now - started - frozenTime;
            waitingSince = -1;
        }
        long elapsed = now - started - delayed;
        while (cursor < frames.size()) {
            Frame frame = frames.get(cursor);
            long due = Math.max(0, frame.entry().nanos() - origin);
            if (due > elapsed) break;
            if (!canRelease(frame)) {
                waitingSince = now;
                frozenTime = due;
                return false;
            }
            requested.removeAll(frame.subchunks());
            // A new scene or dimension invalidates requests made for the previous world.
            if (frame.entry().id() == 11 || frame.entry().id() == 61) requested.clear();
            output.accept(frame.entry().payload());
            cursor++;
        }
        return cursor == frames.size();
    }

    private boolean canRelease(Frame frame) {
        // Recorded batch boundaries belong to the recording client. Keep the whole
        // payload unchanged when at least one reply answers this client's request.
        return frame.subchunks().isEmpty() || frame.subchunks().stream().anyMatch(requested::contains);
    }

    private static int count(ByteBuf body) {
        int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(body);
        if (count < 0 || count > 8192) throw new IllegalArgumentException("Unbounded subchunk entries");
        return count;
    }

    private static Set<Position> subchunks(byte[] payload) {
        ByteBuf body = Unpooled.wrappedBuffer(payload);
        try {
            Types.VAR_INT.readPrimitive(body);
            boolean cached = body.readBoolean();
            int dimension = BedrockTypes.VAR_INT.readPrimitive(body);
            int x = body.readIntLE(), y = body.readIntLE(), z = body.readIntLE();
            int count = count(body);
            Set<Position> positions = new HashSet<>();
            for (int i = 0; i < count; i++) {
                BlockPosition offset = BedrockTypes.SUB_CHUNK_OFFSET.read(body);
                positions.add(new Position(dimension, Math.addExact(x, offset.x()), Math.addExact(y, offset.y()), Math.addExact(z, offset.z())));
                body.readByte(); // request result
                if (body.readBoolean()) BedrockTypes.BYTE_ARRAY.read(body);
                body.readByte(); // heightmap type
                if (body.readBoolean()) body.skipBytes(272);
                body.readByte(); // render heightmap type
                if (body.readBoolean()) body.skipBytes(272);
                if (body.readBoolean()) {
                    if (!cached) throw new IllegalArgumentException("Subchunk blob while caching is disabled");
                    body.readLongLE();
                }
            }
            if (body.isReadable()) throw new IllegalArgumentException("Unexpected subchunk reply fields");
            return Set.copyOf(positions);
        } finally { body.release(); }
    }
}
