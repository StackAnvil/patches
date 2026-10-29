package net.pistonmaster.stackanvil.replay;

import com.viaversion.viaversion.api.type.Types;
import com.viaversion.viaversion.api.connection.UserConnection;
import com.viaversion.viaversion.api.connection.ProtocolInfo;
import com.viaversion.viaversion.api.protocol.packet.State;
import io.netty.buffer.Unpooled;
import net.raphimc.viabedrock.protocol.ClientboundBedrockPackets;
import net.raphimc.viabedrock.protocol.model.CameraPreset;
import net.raphimc.viabedrock.protocol.model.CameraPresetRegistry;
import net.raphimc.viabedrock.protocol.storage.CameraEffectsStorage;
import net.raphimc.viabedrock.protocol.storage.WorldPacketBuffer;
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
        var state = new State[]{State.PLAY};
        var info = (ProtocolInfo) Proxy.newProxyInstance(ProtocolInfo.class.getClassLoader(),
                new Class<?>[]{ProtocolInfo.class}, (instance, method, arguments) -> {
                    if (method.getName().equals("getServerState")) return state[0];
                    throw new UnsupportedOperationException(method.toString());
                });
        var user = (UserConnection) Proxy.newProxyInstance(UserConnection.class.getClassLoader(),
                new Class<?>[]{UserConnection.class}, (instance, method, arguments) -> switch (method.getName()) {
                    case "getProtocolInfo" -> info;
                    case "get" -> stored.get(arguments[0]);
                    case "put" -> { stored.put(arguments[0].getClass(), arguments[0]); yield null; }
                    default -> throw new UnsupportedOperationException(method.toString());
                });
        // Core ignores these packets before START_GAME, without retaining or publishing them.
        for (var early : new State[]{State.LOGIN, State.CONFIGURATION}) {
            state[0] = early;
            require(CameraPresetAudit.afterPacket(user, captured, directory));
            require(!Files.exists(directory.resolve("camera-presets-core.json")));
            stored.put(WorldPacketBuffer.class, new WorldPacketBuffer());
            require(!CameraPresetAudit.afterPacket(user, captured, directory));
            stored.clear();
        }
        state[0] = State.PLAY;
        var storage = new CameraEffectsStorage(user);
        user.put(storage);
        boolean rejected = false;
        try { CameraPresetAudit.afterPacket(user, captured, directory); }
        catch (IOException expected) { rejected = true; }
        require(rejected);
        require(!Files.exists(directory.resolve("camera-presets-core.json")));

        // A received table can wait for custom models or Java play-listener initialization.
        stored.put(WorldPacketBuffer.class, new WorldPacketBuffer());
        require(!CameraPresetAudit.afterPacket(user, captured, directory));
        require(!Files.exists(directory.resolve("camera-presets-core.json")));

        var input = Unpooled.wrappedBuffer(captured);
        try { storage.setPresets(new CameraPresetRegistry(CameraPreset.LIST_TYPE.read(input))); }
        finally { input.release(); }
        require(!CameraPresetAudit.afterPacket(user, captured, directory));
        stored.remove(WorldPacketBuffer.class);
        require(CameraPresetAudit.afterPacket(user, captured, directory));
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
