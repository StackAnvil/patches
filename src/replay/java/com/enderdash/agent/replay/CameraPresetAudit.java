package com.enderdash.agent.replay;

import com.google.gson.Gson;
import com.viaversion.viaversion.api.connection.UserConnection;
import com.viaversion.viaversion.api.type.Types;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import net.raphimc.viabedrock.protocol.ClientboundBedrockPackets;
import net.raphimc.viabedrock.protocol.model.CameraPreset;
import net.raphimc.viabedrock.protocol.model.CameraPresetRegistry;
import net.raphimc.viabedrock.protocol.storage.CameraEffectsStorage;
import net.raphimc.viabedrock.protocol.storage.CustomBlockPackStorage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;

/** Observe core state after the real decoder runs, without changing captured packets. */
public final class CameraPresetAudit {
    private CameraPresetAudit() { }

    public static byte[] capture(Object message) {
        if (!(message instanceof ByteBuf packet)) return null;
        ByteBuf input = packet.duplicate();
        if ((Types.VAR_INT.readPrimitive(input) & 0x3FF) != ClientboundBedrockPackets.CAMERA_PRESETS.getId()) return null;
        byte[] received = new byte[input.readableBytes()];
        input.readBytes(received);
        return received;
    }

    public static boolean afterPacket(UserConnection user, byte[] received, Path directory) throws IOException {
        if (received == null) return true;
        // Core owns decoding after the Java client acknowledges the custom-block pack.
        if (user.get(CustomBlockPackStorage.class) != null) return false;
        CameraEffectsStorage storage = user.get(CameraEffectsStorage.class);
        if (storage == null) throw new IOException("Core camera storage is unavailable after the preset packet");
        CameraPresetRegistry registry = storage.presets();
        ByteBuf encoded = Unpooled.buffer();
        try {
            CameraPreset.LIST_TYPE.write(encoded, registry.presets());
            byte[] retained = new byte[encoded.readableBytes()];
            encoded.readBytes(retained);
            if (!Arrays.equals(received, retained)) throw new IOException("Core did not retain the received preset table unchanged");
        } finally { encoded.release(); }
        var resolved = new ArrayList<CameraPresetRegistry.Resolved>();
        for (int i = 0; i < registry.presets().size(); i++) resolved.add(registry.get(i));
        final String hash;
        try { hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(received)); }
        catch (NoSuchAlgorithmException error) { throw new IOException(error); }
        record Snapshot(String wireSha256, int received, int unresolved, List<CameraPresetRegistry.Resolved> presets) { }
        Path output = directory.resolve("camera-presets-core.json");
        Files.writeString(output, new Gson().toJson(new Snapshot(hash, registry.presets().size(), registry.unresolved().size(), resolved)));
        Files.setPosixFilePermissions(output, PosixFilePermissions.fromString("rw-------"));
        System.out.println("StackAnvil core retained " + registry.presets().size() + " camera presets; unresolved=" + registry.unresolved().size());
        return true;
    }
}
