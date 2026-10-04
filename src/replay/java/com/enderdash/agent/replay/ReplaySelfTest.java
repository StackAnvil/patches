package com.enderdash.agent.replay;

import com.viaversion.viaversion.api.type.Types;
import com.viaversion.viaversion.api.minecraft.BlockPosition;
import com.viaversion.nbt.tag.CompoundTag;
import com.viaversion.nbt.tag.ListTag;
import io.netty.buffer.*;
import net.raphimc.viabedrock.protocol.model.SkinData;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;

import java.awt.image.BufferedImage;
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
            playerAppearanceFeatures();
            packNegotiationPacing();
            requestPacing();
            System.out.println("PASS replay journal integrity, secret exclusion, offline resource negotiation, actor registry expectations, and request-aware scene pacing");
        } finally {
            try (var paths = Files.walk(directory)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }

    private static void packNegotiationPacing() {
        long packReady = java.util.concurrent.TimeUnit.SECONDS.toNanos(70);
        List<PacketJournal.Entry> scene = List.of(
                new PacketJournal.Entry(true, 5, new byte[]{86, 1}),
                new PacketJournal.Entry(true, 10, new byte[]{9, 1}),
                new PacketJournal.Entry(true, packReady + 20, new byte[]{11, 0}),
                new PacketJournal.Entry(true, packReady + 30, new byte[]{9, 2}));
        ScenePlayback playback = new ScenePlayback(scene, 100, packReady);
        List<byte[]> emitted = new ArrayList<>();
        require(!playback.advance(100, emitted::add) && emitted.size() == 2);
        require(!playback.advance(119, emitted::add) && emitted.size() == 2);
        require(!playback.advance(120, emitted::add) && emitted.size() == 3);
        require(!playback.advance(129, emitted::add) && emitted.size() == 3);
        require(playback.advance(130, emitted::add) && emitted.size() == 4);
        for (int i = 0; i < scene.size(); i++) require(Arrays.equals(scene.get(i).payload(), emitted.get(i)));
    }

    private static void requestPacing() {
        List<BlockPosition> offsets = List.of(new BlockPosition(-1, 0, 2), new BlockPosition(0, 1, 0));
        byte[] reply = subchunkReply(0, offsets);
        byte[] snapshot = reply.clone();
        List<PacketJournal.Entry> scene = List.of(
                new PacketJournal.Entry(true, 0, new byte[]{11, 0}),
                new PacketJournal.Entry(true, 10, reply),
                new PacketJournal.Entry(true, 20, new byte[]{9, 1}),
                new PacketJournal.Entry(true, 30, reply.clone()),
                new PacketJournal.Entry(true, 40, new byte[]{9, 2}));
        ScenePlayback playback = new ScenePlayback(scene, 0, 0);
        List<byte[]> emitted = new ArrayList<>();
        require(!playback.advance(0, emitted::add) && emitted.size() == 1);
        require(!playback.advance(10, emitted::add) && emitted.size() == 1);
        request(playback, 1, offsets); // Correct coordinates in the wrong dimension do not release it.
        request(playback, 0, List.of(new BlockPosition(1, 0, 2))); // Wrong coordinate does not release it.
        require(!playback.advance(20, emitted::add) && emitted.size() == 1);
        request(playback, 0, offsets.subList(0, 1));
        // A different client can omit an entry in the original client's batch.
        require(!playback.advance(100, emitted::add) && emitted.size() == 2);
        require(!playback.advance(109, emitted::add) && emitted.size() == 2);
        require(!playback.advance(110, emitted::add) && emitted.size() == 3);
        // Native retry replies stay unchanged even when Java does not repeat its request.
        require(!playback.advance(120, emitted::add) && emitted.size() == 4);
        require(playback.advance(130, emitted::add) && emitted.size() == scene.size());
        for (int i = 0; i < scene.size(); i++) require(Arrays.equals(scene.get(i).payload(), emitted.get(i)));
        require(Arrays.equals(reply, snapshot));

        byte[] airReply = subchunkAirReply(0, offsets);
        ScenePlayback air = new ScenePlayback(List.of(new PacketJournal.Entry(true, 0, airReply)), 0, 0);
        List<byte[]> airOutput = new ArrayList<>();
        require(air.advance(0, airOutput::add) && airOutput.size() == 1);
        require(Arrays.equals(airReply, airOutput.getFirst()));

        ScenePlayback cold = new ScenePlayback(scene.subList(0, 3), 0, 0);
        List<byte[]> coldOutput = new ArrayList<>();
        require(!cold.advance(10, coldOutput::add) && coldOutput.size() == 1);
        long initialized = java.util.concurrent.TimeUnit.SECONDS.toNanos(20);
        require(!cold.advance(initialized, coldOutput::add) && coldOutput.size() == 1);
        request(cold, 0, offsets.subList(0, 1));
        require(!cold.advance(initialized, coldOutput::add) && coldOutput.size() == 2);
        require(cold.advance(initialized + 10, coldOutput::add) && coldOutput.size() == 3);
        for (int i = 0; i < coldOutput.size(); i++) require(Arrays.equals(scene.get(i).payload(), coldOutput.get(i)));

        ScenePlayback timeout = new ScenePlayback(scene, 0, 0);
        timeout.advance(10, ignored -> { });
        require(!timeout.advance(java.util.concurrent.TimeUnit.SECONDS.toNanos(45) + 9, ignored -> { }));
        try { timeout.advance(java.util.concurrent.TimeUnit.SECONDS.toNanos(45) + 10, ignored -> { }); throw new AssertionError("Replay waited without a deadline"); }
        catch (ScenePlayback.RequestTimeout expected) { }

        ScenePlayback changed = new ScenePlayback(List.of(scene.getFirst(),
                new PacketJournal.Entry(true, 1, new byte[]{61, 0}), new PacketJournal.Entry(true, 2, reply)), 0, 0);
        List<byte[]> changedOutput = new ArrayList<>();
        changed.advance(0, changedOutput::add);
        request(changed, 0, offsets);
        require(!changed.advance(2, changedOutput::add) && changedOutput.size() == 2);
        request(changed, 0, offsets);
        require(changed.advance(3, changedOutput::add) && changedOutput.size() == 3);
    }

    private static void request(ScenePlayback playback, int dimension, List<BlockPosition> offsets) {
        ByteBuf packet = Unpooled.buffer();
        try {
            BedrockTypes.VAR_INT.writePrimitive(packet, dimension);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, offsets.size());
            for (var offset : offsets) BedrockTypes.SUB_CHUNK_OFFSET.write(packet, offset);
            packet.writeIntLE(10).writeIntLE(4).writeIntLE(-10);
            playback.request(packet);
            require(packet.readerIndex() == 0);
        } finally { packet.release(); }
    }

    private static byte[] subchunkAirReply(int dimension, List<BlockPosition> offsets) {
        ByteBuf packet = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(packet, 174);
            packet.writeBoolean(false); BedrockTypes.VAR_INT.writePrimitive(packet, dimension);
            packet.writeIntLE(10).writeIntLE(4).writeIntLE(-10);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, offsets.size());
            for (var offset : offsets) {
                BedrockTypes.SUB_CHUNK_OFFSET.write(packet, offset);
                packet.writeByte(6).writeBoolean(false);
                packet.writeByte(0).writeBoolean(false);
                packet.writeByte(0).writeBoolean(false).writeBoolean(false);
            }
            return ReplayPackets.bytes(packet);
        } finally { packet.release(); }
    }

    private static byte[] subchunkReply(int dimension, List<BlockPosition> offsets) {
        ByteBuf packet = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(packet, 174);
            packet.writeBoolean(true); BedrockTypes.VAR_INT.writePrimitive(packet, dimension);
            packet.writeIntLE(10).writeIntLE(4).writeIntLE(-10);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, offsets.size());
            for (var offset : offsets) {
                BedrockTypes.SUB_CHUNK_OFFSET.write(packet, offset);
                packet.writeByte(1).writeBoolean(true); BedrockTypes.BYTE_ARRAY.write(packet, new byte[]{1, 2, 3});
                packet.writeByte(1).writeBoolean(true).writeZero(272); // heightmap
                packet.writeByte(1).writeBoolean(true).writeZero(272); // render heightmap
                packet.writeBoolean(true).writeLongLE(42); // cached blob
            }
            return ReplayPackets.bytes(packet);
        } finally { packet.release(); }
    }
    private static void registryFeatures() throws Exception {
        List<PacketJournal.Entry> scene = new ArrayList<>();
        scene.add(registry("probe:before_start"));
        scene.add(startGame(7));
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

    private static void playerAppearanceFeatures() throws Exception {
        UUID local = UUID.randomUUID(), remote = UUID.randomUUID();
        List<PacketJournal.Entry> absent = List.of(startGame(999), playerList(remote, 1000, true), playerSkin(remote, true));
        require(SceneFeatures.selfIdentity(absent).isEmpty());
        appearanceCounts(absent, 2, 2, 0);
        appearanceCounts(List.of(startGame(999)), 0, 0, 0);
        // A skin update alone does not establish that its UUID belongs to the local player.
        appearanceCounts(List.of(startGame(999), playerSkin(local, true)), 1, 1, 0);

        List<PacketJournal.Entry> present = new ArrayList<>(List.of(startGame(999), playerSkin(local, true),
                playerList(remote, 1000, true), playerList(local, 999, true), playerList(local, 999, true),
                playerSkin(local, false), playerRemoval(local)));
        // Count every update, including one preceding the identity entry. Repeated adds
        // for the same UUID and later removal do not make that identity ambiguous.
        require(SceneFeatures.selfIdentity(present).orElseThrow().equals(local));
        appearanceCounts(present, 5, 4, 3);
        PacketJournal.Entry unrelated = playerList(UUID.randomUUID(), 999, true);
        present.add(new PacketJournal.Entry(false, 0, unrelated.payload()));
        appearanceCounts(present, 5, 4, 3);

        List<PacketJournal.Entry> classicLocal = List.of(startGame(999), playerList(local, 999, false), playerList(remote, 1000, true));
        require(SceneFeatures.selfIdentity(classicLocal).orElseThrow().equals(local));
        appearanceCounts(classicLocal, 2, 1, 0);

        present.add(unrelated);
        try { SceneFeatures.selfIdentity(present); throw new AssertionError("Accepted ambiguous local player identities"); }
        catch (IllegalArgumentException expected) { }
        try { SceneFeatures.features(present); throw new AssertionError("Derived appearance counts from ambiguous local identities"); }
        catch (IllegalArgumentException expected) { }
    }

    private static void appearanceCounts(List<PacketJournal.Entry> scene, int skins, int geometry, int localGeometry) throws Exception {
        Map<String, Object> features = SceneFeatures.features(scene);
        require(features.get("skinUpdates").equals(skins));
        require(features.get("geometrySkinUpdates").equals(geometry));
        require(features.get("localGeometrySkinUpdates").equals(localGeometry));
    }

    private static PacketJournal.Entry startGame(long uniqueId) {
        ByteBuf packet = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(packet, 11);
            BedrockTypes.VAR_LONG.writePrimitive(packet, uniqueId);
            BedrockTypes.UNSIGNED_VAR_LONG.writePrimitive(packet, uniqueId);
            return new PacketJournal.Entry(true, 0, ReplayPackets.bytes(packet));
        } finally { packet.release(); }
    }

    private static PacketJournal.Entry playerList(UUID uuid, long uniqueId, boolean geometry) {
        ByteBuf packet = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(packet, 63); BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, 1);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, 1); packet.writeByte(0); BedrockTypes.UUID.write(packet, uuid);
            BedrockTypes.VAR_LONG.writePrimitive(packet, uniqueId);
            for (int field = 0; field < 3; field++) BedrockTypes.STRING.write(packet, "");
            packet.writeIntLE(0); BedrockTypes.SKIN.write(packet, appearance(geometry)); packet.writeZero(7);
            return new PacketJournal.Entry(true, 0, ReplayPackets.bytes(packet));
        } finally { packet.release(); }
    }

    private static PacketJournal.Entry playerRemoval(UUID uuid) {
        ByteBuf packet = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(packet, 63); BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, 1);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, 2); packet.writeByte(0); BedrockTypes.UUID.write(packet, uuid);
            return new PacketJournal.Entry(true, 0, ReplayPackets.bytes(packet));
        } finally { packet.release(); }
    }

    private static PacketJournal.Entry playerSkin(UUID uuid, boolean geometry) {
        ByteBuf packet = Unpooled.buffer();
        try {
            Types.VAR_INT.writePrimitive(packet, 93); BedrockTypes.UUID.write(packet, uuid); BedrockTypes.SKIN.write(packet, appearance(geometry));
            BedrockTypes.STRING.write(packet, ""); BedrockTypes.STRING.write(packet, "");
            return new PacketJournal.Entry(true, 0, ReplayPackets.bytes(packet));
        } finally { packet.release(); }
    }

    private static SkinData appearance(boolean geometry) {
        return new SkinData("fixture", "", "", new BufferedImage(2, 2, BufferedImage.TYPE_INT_ARGB), List.of(), null,
                geometry ? "{\"minecraft:geometry\":[]}" : "", "1.26.51", "", false, false, false, false,
                "", "fixture", "Wide", "#FFFFFFFF", List.of(), List.of(), false, "", "");
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
