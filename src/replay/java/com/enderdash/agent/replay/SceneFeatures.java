package com.enderdash.agent.replay;

import com.viaversion.viaversion.api.type.Types;
import com.viaversion.nbt.tag.CompoundTag;
import com.viaversion.viaversion.libs.gson.Gson;
import com.viaversion.viaversion.util.Key;
import io.netty.buffer.*;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import net.raphimc.viabedrock.protocol.model.SkinData;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;
import net.raphimc.viabedrock.protocol.types.primitive.ImageType;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.util.*;

/** Appearance expectations derived from incoming packets, independent of the client renderer. */
public final class SceneFeatures {
    public static void main(String[] args) throws Exception {
        if (args.length == 3 && args[0].equals("--self-identity")) {
            UUID identity = selfIdentity(PacketJournal.read(Path.of(args[1]), ProtocolConstants.BEDROCK_PROTOCOL_VERSION));
            Path output = Path.of(args[2]);
            Files.writeString(output, identity.toString(), java.nio.file.StandardOpenOption.CREATE_NEW);
            Files.setPosixFilePermissions(output, PosixFilePermissions.fromString("rw-------"));
            return;
        }
        System.out.println(new Gson().toJson(features(PacketJournal.read(Path.of(args[0]), ProtocolConstants.BEDROCK_PROTOCOL_VERSION))));
    }

    static Map<String, Object> features(List<PacketJournal.Entry> entries) throws Exception {
        Set<String> textures = new TreeSet<>(), actors = new TreeSet<>(), registered = new HashSet<>();
        int skins = 0, geometrySkins = 0;
        boolean started = false, hasRegistry = false;
        for (PacketJournal.Entry entry : entries) {
            if (!entry.clientbound()) continue;
            if (entry.id() == 11) { started = true; continue; }
            if (!Set.of(13, 63, 93, 119).contains(entry.id())) continue;
            ByteBuf input = Unpooled.wrappedBuffer(entry.payload());
            try {
                int id = Types.VAR_INT.readPrimitive(input);
                if (id == 119) {
                    if (!started) continue;
                    CompoundTag registry = (CompoundTag) BedrockTypes.NETWORK_TAG.read(input);
                    for (CompoundTag actor : registry.getListTag("idlist", CompoundTag.class)) {
                        String identifier = actor.getString("id");
                        if (identifier != null) registered.add(Key.namespaced(identifier));
                    }
                    hasRegistry = true;
                } else if (id == 13) {
                    BedrockTypes.VAR_LONG.readPrimitive(input); BedrockTypes.UNSIGNED_VAR_LONG.readPrimitive(input);
                    String identifier = Key.namespaced(BedrockTypes.STRING.read(input));
                    if (!identifier.startsWith("minecraft:")) actors.add(identifier);
                } else if (id == 93) {
                    BedrockTypes.UUID.read(input); geometrySkins += skin(textures, BedrockTypes.SKIN.read(input)); skins++;
                } else {
                    int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
                    if (count > 4096) throw new IllegalArgumentException("Unbounded player list");
                    for (int i = 0; i < count; i++) {
                        int action = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
                        input.readUnsignedByte(); BedrockTypes.UUID.read(input);
                        if (action != 1) continue;
                        BedrockTypes.VAR_LONG.readPrimitive(input);
                        for (int field = 0; field < 3; field++) BedrockTypes.STRING.read(input);
                        input.readIntLE(); geometrySkins += skin(textures, BedrockTypes.SKIN.read(input)); skins++;
                        input.skipBytes(7); // teacher, host, subclient, ARGB color
                    }
                }
            } finally { input.release(); }
        }
        Set<String> unregistered = new TreeSet<>();
        if (hasRegistry) for (String actor : actors) if (!registered.contains(actor)) unregistered.add(actor);
        actors.removeAll(unregistered);
        return Map.of("skinUpdates", skins, "geometrySkinUpdates", geometrySkins, "skinTextures", textures,
                "customActorIdentifiers", actors, "unregisteredActorIdentifiers", unregistered);
    }

    static UUID selfIdentity(List<PacketJournal.Entry> entries) {
        PacketJournal.Entry start = entries.stream().filter(entry -> entry.clientbound() && entry.id() == 11).findFirst().orElseThrow();
        long self;
        ByteBuf first = Unpooled.wrappedBuffer(start.payload());
        try { Types.VAR_INT.readPrimitive(first); self = BedrockTypes.VAR_LONG.readPrimitive(first); }
        finally { first.release(); }
        Set<UUID> matches = new HashSet<>();
        for (PacketJournal.Entry entry : entries) {
            if (!entry.clientbound() || entry.id() != 63) continue;
            ByteBuf input = Unpooled.wrappedBuffer(entry.payload());
            try {
                Types.VAR_INT.readPrimitive(input);
                int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
                if (count > 4096) throw new IllegalArgumentException("Unbounded player list");
                for (int index = 0; index < count; index++) {
                    int action = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
                    input.readUnsignedByte();
                    UUID uuid = BedrockTypes.UUID.read(input);
                    if (action != 1) continue;
                    long uniqueId = BedrockTypes.VAR_LONG.readPrimitive(input);
                    if (uniqueId == self) matches.add(uuid);
                    for (int field = 0; field < 3; field++) BedrockTypes.STRING.read(input);
                    input.readIntLE(); BedrockTypes.SKIN.read(input); input.skipBytes(7);
                }
            } finally { input.release(); }
        }
        if (matches.size() != 1) throw new IllegalArgumentException("The recording does not identify one local player for scene rendering");
        return matches.iterator().next();
    }

    private static int skin(Set<String> textures, SkinData skin) throws Exception {
        if (skin.skinData() == null) throw new IllegalArgumentException("Missing recorded skin image");
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(ImageType.getImageData(skin.skinData())));
        textures.add(skin.skinData().getWidth() + "x" + skin.skinData().getHeight() + ":" + hash);
        return skin.geometryData() != null && !skin.geometryData().isBlank() && !skin.geometryData().equals("null") ? 1 : 0;
    }
}
