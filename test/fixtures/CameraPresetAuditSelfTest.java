package com.enderdash.agent.replay;

import com.viaversion.viaversion.api.type.Types;
import com.viaversion.viaversion.api.connection.UserConnection;
import io.netty.buffer.Unpooled;
import net.raphimc.viabedrock.protocol.ClientboundBedrockPackets;
import net.raphimc.viabedrock.protocol.model.CameraPreset;
import net.raphimc.viabedrock.protocol.model.CameraPresetRegistry;
import net.raphimc.viabedrock.protocol.storage.CameraEffectsStorage;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;

import java.io.IOException;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;

public final class CameraPresetAuditSelfTest {
    public static void main(String[] args) throws Exception {
        Path directory = Path.of(args[0]);
        var packet = Unpooled.buffer();
        Types.VAR_INT.writePrimitive(packet, ClientboundBedrockPackets.CAMERA_PRESETS.getId());
        BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, 1);
        BedrockTypes.STRING.write(packet, "minecraft:free");
        BedrockTypes.STRING.write(packet, "");
        packet.writeZero(20).writeBoolean(true).writeBoolean(false);
        int reader = packet.readerIndex();
        byte[] captured = CameraPresetAudit.capture(packet);
        require(packet.readerIndex() == reader);
        // The actual decoder owns the message and can consume and release it before observation.
        packet.skipBytes(packet.readableBytes());
        packet.release();
        require(packet.refCnt() == 0);

        var stored = new HashMap<Class<?>, Object>();
        var user = (UserConnection) Proxy.newProxyInstance(UserConnection.class.getClassLoader(),
                new Class<?>[]{UserConnection.class}, (instance, method, arguments) -> switch (method.getName()) {
                    case "get" -> stored.get(arguments[0]);
                    case "put" -> { stored.put(arguments[0].getClass(), arguments[0]); yield null; }
                    default -> throw new UnsupportedOperationException(method.toString());
                });
        var storage = new CameraEffectsStorage(user);
        user.put(storage);
        boolean rejected = false;
        try { CameraPresetAudit.afterPacket(user, captured, directory); }
        catch (IOException expected) { rejected = true; }
        require(rejected);
        require(!Files.exists(directory.resolve("camera-presets-core.json")));

        var input = Unpooled.wrappedBuffer(captured);
        try { storage.setPresets(new CameraPresetRegistry(CameraPreset.LIST_TYPE.read(input))); }
        finally { input.release(); }
        CameraPresetAudit.afterPacket(user, captured, directory);
        require(Files.isRegularFile(directory.resolve("camera-presets-core.json")));

        var other = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(other, ClientboundBedrockPackets.SET_TIME.getId());
            require(CameraPresetAudit.capture(other) == null);
            require(other.readerIndex() == 0);
        } finally { other.release(); }
        CameraPresetAudit.afterPacket(null, null, directory);
    }

    private static void require(boolean condition) {
        if (!condition) throw new AssertionError();
    }
}
