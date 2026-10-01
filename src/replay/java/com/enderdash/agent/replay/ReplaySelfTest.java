package com.enderdash.agent.replay;

import com.viaversion.viaversion.api.type.Types;
import com.viaversion.nbt.tag.CompoundTag;
import com.viaversion.nbt.tag.ListTag;
import io.netty.buffer.*;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;

import java.nio.file.*;
import java.util.*;

/** Checks binary replay boundaries and offline resource negotiation without any live service. */
public final class ReplaySelfTest {
    public static void main(String[] args) throws Exception {
        Path directory = Files.createTempDirectory("stackanvil-replay-test");
        try {
            Path journal = directory.resolve("packets.sbr");
            try (var writer = new PacketJournal(journal, 2193)) {
                writer.append(false, new byte[]{1, 99, 98});
                writer.append(true, new byte[]{3, 97});
                writer.append(true, new byte[]{11, 4, 5, 6});
                writer.append(false, new byte[]{8, 4, 0});
            }
            var entries = PacketJournal.read(journal, 2193);
            require(entries.size() == 2 && entries.getFirst().id() == 11 && Arrays.equals(entries.getFirst().payload(), new byte[]{11, 4, 5, 6}));
            byte[] original = Files.readAllBytes(journal);
            for (int i = 9; i < 25; i++) {
                Path truncated = directory.resolve("truncated");
                Files.write(truncated, Arrays.copyOf(original, i));
                try { PacketJournal.read(truncated, 2193); throw new AssertionError("Accepted truncated record"); }
                catch (java.io.IOException expected) { }
            }
            UUID id = UUID.randomUUID();
            String version = "1.2.3";
            Files.write(directory.resolve(id + "_" + version + ".mcpack"), new byte[]{1, 2, 3});
            ByteBuf info = Unpooled.buffer();
            ByteBuf local = null;
            try {
                Types.VAR_INT.writePrimitive(info, 6);
                info.writeInt(0); BedrockTypes.UUID.write(info, UUID.randomUUID()); BedrockTypes.STRING.write(info, "1");
                BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(info, 1);
                BedrockTypes.UUID.write(info, id); BedrockTypes.STRING.write(info, version); info.writeLongLE(999);
                BedrockTypes.BYTE_ARRAY.write(info, new byte[]{9, 8});
                BedrockTypes.STRING.write(info, "high"); BedrockTypes.STRING.write(info, "content-id");
                info.writeBoolean(true).writeBoolean(false).writeBoolean(false);
                BedrockTypes.STRING.write(info, "https://example.invalid/private-pack?secret=1");
                local = Unpooled.wrappedBuffer(ReplayPackets.resourceInfo(ReplayPackets.bytes(info), directory, 54321));
                require(Types.VAR_INT.readPrimitive(local) == 6);
                local.skipBytes(20); BedrockTypes.STRING.read(local);
                require(BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(local) == 1 && BedrockTypes.UUID.read(local).equals(id));
                require(BedrockTypes.STRING.read(local).equals(version) && local.readLongLE() == 3);
                require(BedrockTypes.BYTE_ARRAY.read(local).length == 0 && BedrockTypes.STRING.read(local).isEmpty() && BedrockTypes.STRING.read(local).isEmpty());
                require(local.readBoolean()); local.skipBytes(2);
                require(BedrockTypes.STRING.read(local).equals("http://127.0.0.1:54321/" + id + "_" + version + ".mcpack") && !local.isReadable());
                Files.delete(directory.resolve(id + "_" + version + ".mcpack"));
                try { ReplayPackets.resourceInfo(ReplayPackets.bytes(info), directory, 54321); throw new AssertionError("Accepted missing pack"); }
                catch (java.io.IOException expected) { }
            } finally { info.release(); if (local != null) local.release(); }
            registryFeatures();
            System.out.println("PASS replay journal integrity, secret exclusion, offline resource negotiation, and actor registry expectations");
        } finally {
            try (var paths = Files.walk(directory)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }
    private static void registryFeatures() throws Exception {
        List<PacketJournal.Entry> scene = new ArrayList<>();
        scene.add(registry("probe:before_start"));
        scene.add(new PacketJournal.Entry(true, 1, new byte[]{11, 14}));
        scene.add(registry("probe:declared"));
        for (String identifier : List.of("probe:declared", "probe:unregistered", "probe:before_start")) {
            ByteBuf input = Unpooled.buffer();
            try {
                Types.VAR_INT.writePrimitive(input, 13);
                BedrockTypes.VAR_LONG.writePrimitive(input, 7);
                BedrockTypes.UNSIGNED_VAR_LONG.writePrimitive(input, 7);
                BedrockTypes.STRING.write(input, identifier);
                scene.add(new PacketJournal.Entry(true, 2, ReplayPackets.bytes(input)));
            } finally { input.release(); }
        }
        Map<String, Object> features = SceneFeatures.features(scene);
        require(features.get("customActorIdentifiers").equals(Set.of("probe:declared")));
        require(features.get("unregisteredActorIdentifiers").equals(Set.of("probe:unregistered", "probe:before_start")));
    }

    private static PacketJournal.Entry registry(String identifier) {
        CompoundTag registry = new CompoundTag(), actor = new CompoundTag();
        actor.putString("id", identifier);
        ListTag<CompoundTag> actors = new ListTag<>(CompoundTag.class); actors.add(actor);
        registry.put("idlist", actors);
        ByteBuf input = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(input, 119);
            BedrockTypes.NETWORK_TAG.write(input, registry);
            return new PacketJournal.Entry(true, 0, ReplayPackets.bytes(input));
        } finally { input.release(); }
    }

    private static void require(boolean value) { if (!value) throw new AssertionError(); }
}
