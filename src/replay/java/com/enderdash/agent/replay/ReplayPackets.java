package com.enderdash.agent.replay;

import com.viaversion.viaversion.api.type.Types;
import io.netty.buffer.*;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

public final class ReplayPackets {
    private ReplayPackets() { }

    /** Serve flattened, decrypted selected pack content from loopback, never the original CDN. */
    public static byte[] resourceInfo(byte[] packet, Path packs, int httpPort) throws IOException {
        ByteBuf input = Unpooled.wrappedBuffer(packet);
        ByteBuf output = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(output, Types.VAR_INT.readPrimitive(input));
            output.writeBytes(input, 4 + 16); // flags and world template UUID
            BedrockTypes.STRING.write(output, BedrockTypes.STRING.read(input));
            int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(output, count);
            for (int i = 0; i < count; i++) {
                UUID id = BedrockTypes.UUID.read(input);
                String version = BedrockTypes.STRING.read(input);
                Path file = packs.resolve(id + "_" + version + ".mcpack");
                if (!version.matches("[0-9]+(?:\\.[0-9]+)*") || !Files.isRegularFile(file)) throw new IOException("Missing recorded resource pack");
                BedrockTypes.UUID.write(output, id);
                BedrockTypes.STRING.write(output, version);
                input.skipBytes(8);
                output.writeLongLE(Files.size(file));
                BedrockTypes.BYTE_ARRAY.read(input);
                BedrockTypes.BYTE_ARRAY.write(output, new byte[0]);
                BedrockTypes.STRING.read(input); // subpack
                BedrockTypes.STRING.write(output, "");
                BedrockTypes.STRING.read(input); // content identity
                BedrockTypes.STRING.write(output, "");
                output.writeBytes(input, 3);
                BedrockTypes.STRING.read(input); // CDN
                BedrockTypes.STRING.write(output, "http://127.0.0.1:" + httpPort + "/" + file.getFileName());
            }
            if (input.isReadable()) throw new IOException("Unexpected resource pack info fields");
            return bytes(output);
        } finally { input.release(); output.release(); }
    }

    public static byte[] resourceStack(byte[] packet) throws IOException {
        ByteBuf input = Unpooled.wrappedBuffer(packet);
        ByteBuf output = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(output, Types.VAR_INT.readPrimitive(input));
            output.writeByte(input.readByte());
            int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(output, count);
            for (int i = 0; i < count; i++) {
                BedrockTypes.STRING.write(output, BedrockTypes.STRING.read(input));
                BedrockTypes.STRING.write(output, BedrockTypes.STRING.read(input));
                BedrockTypes.STRING.read(input);
                BedrockTypes.STRING.write(output, "");
            }
            output.writeBytes(input);
            return bytes(output);
        } finally { input.release(); output.release(); }
    }

    public static byte[] bytes(ByteBuf buffer) {
        byte[] payload = new byte[buffer.readableBytes()];
        buffer.getBytes(buffer.readerIndex(), payload);
        return payload;
    }
}
