package com.enderdash.agent.replay;

import com.google.gson.*;
import io.netty.buffer.ByteBuf;
import net.raphimc.viabedrock.api.resourcepack.ResourcePack;
import net.raphimc.viabedrock.api.resourcepack.content.ZipContent;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;

import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/** Observes downloaded pack bytes without altering native resource-pack negotiation. */
final class NativeCapturePacks implements AutoCloseable {
    private static final int MAX_PACK_BYTES = 256 * 1024 * 1024;
    private final Path directory;
    private final Map<ResourcePack.Key, Pack> packs = new LinkedHashMap<>();
    private final List<CompletableFuture<Void>> downloads = new ArrayList<>();
    private long allocated;
    private boolean closed;
    private boolean described;
    private volatile Throwable failure;

    private static final class Pack {
        final ResourcePack.Key key;
        final byte[] contentKey;
        final String contentId;
        String selection = "";
        byte[] bytes;
        byte[] expectedHash;
        int chunkSize;
        BitSet received;
        ResourcePack parsed;
        Pack(ResourcePack.Key key, byte[] contentKey, String contentId) {
            this.key = key; this.contentKey = contentKey; this.contentId = contentId;
        }
    }

    NativeCapturePacks(Path recording) throws IOException {
        directory = recording.resolve("packs");
        Files.createDirectory(directory, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rwx------")));
    }

    synchronized void accept(int id, ByteBuf input) throws Exception {
        if (failure != null) throw new IOException("Resource pack export failed", failure);
        if (closed) return;
        if (id == 6) info(input);
        else if (id == 7) stack(input);
        else if (id == 82) dataInfo(input);
        else if (id == 83) chunk(input);
    }

    private void info(ByteBuf input) throws Exception {
        input.skipBytes(20);
        BedrockTypes.STRING.read(input);
        int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
        if (count < 0 || count > 256 || described) throw new IOException("Invalid resource pack list");
        described = true;
        JsonArray keys = new JsonArray();
        for (int i = 0; i < count; i++) {
            UUID id = BedrockTypes.UUID.read(input);
            String version = BedrockTypes.STRING.read(input);
            if (!version.matches("[A-Za-z0-9][A-Za-z0-9.+-]{0,127}")) throw new IOException("Invalid pack version");
            long size = input.readLongLE();
            if (size < 0 || size > MAX_PACK_BYTES) throw new IOException("Pack exceeds size limit");
            byte[] contentKey = BedrockTypes.BYTE_ARRAY.read(input);
            BedrockTypes.STRING.read(input); // Informational pack label; the stack selects subpacks.
            String contentId = BedrockTypes.STRING.read(input);
            input.skipBytes(3);
            String cdn = BedrockTypes.STRING.read(input);
            Pack pack = new Pack(new ResourcePack.Key(id, version), contentKey, contentId);
            if (packs.putIfAbsent(pack.key, pack) != null) throw new IOException("Duplicate pack identity");
            JsonObject key = new JsonObject();
            key.addProperty("id", id.toString()); key.addProperty("version", version);
            key.addProperty("contentKey", Base64.getEncoder().encodeToString(contentKey));
            key.addProperty("contentId", contentId); keys.add(key);
            if (!cdn.isEmpty()) {
                URI uri = URI.create(cdn);
                if (!Set.of("http", "https").contains(uri.getScheme())) throw new IOException("Unsupported resource pack URL");
                downloads.add(CompletableFuture.runAsync(() -> {
                    try {
                        HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15))
                                .followRedirects(HttpClient.Redirect.NORMAL).build();
                        HttpResponse<InputStream> response = http.send(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(30)).GET().build(), HttpResponse.BodyHandlers.ofInputStream());
                        try (InputStream body = response.body()) {
                            if (response.statusCode() != 200) throw new IOException("Resource pack HTTP download failed");
                            byte[] data = body.readNBytes(MAX_PACK_BYTES + 1);
                            if (data.length > MAX_PACK_BYTES) throw new IOException("Pack exceeds size limit");
                            synchronized (NativeCapturePacks.this) {
                                if (!closed) {
                                    reserve(data.length); complete(pack, data);
                                }
                            }
                        }
                    } catch (Throwable error) { failure = error; throw new CompletionException(error); }
                }));
            }
        }
        writePrivate(directory.resolve("keys.json"), new Gson().toJson(keys).getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private void stack(ByteBuf input) throws Exception {
        input.skipBytes(1);
        int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
        if (count < 0 || count > 256) throw new IOException("Invalid pack stack");
        for (int i = 0; i < count; i++) {
            ResourcePack.Key key = new ResourcePack.Key(UUID.fromString(BedrockTypes.STRING.read(input)), BedrockTypes.STRING.read(input));
            String selection = BedrockTypes.STRING.read(input);
            Pack pack = packs.get(key);
            if (pack != null) {
                pack.selection = selection;
                if (pack.parsed != null) export(pack);
            }
        }
    }

    private Pack get(String name) throws IOException {
        if (name.contains("_")) {
            final ResourcePack.Key key;
            try { key = ResourcePack.Key.fromString(name); }
            catch (IllegalArgumentException invalid) { throw new IOException("Invalid downloaded pack identity", invalid); }
            Pack pack = packs.get(key);
            if (pack == null) throw new IOException("Unknown downloaded pack");
            return pack;
        }
        Pack match = null;
        for (Pack pack : packs.values()) {
            if (!pack.key.id().toString().equalsIgnoreCase(name)) continue;
            if (match != null) throw new IOException("Ambiguous downloaded pack identity");
            match = pack;
        }
        if (match == null) throw new IOException("Unknown downloaded pack");
        return match;
    }

    private void reserve(int size) throws IOException {
        if (size < 0 || size > MAX_PACK_BYTES || allocated + size > PacketJournal.MAX_JOURNAL_BYTES) throw new IOException("Resource packs exceed capture limit");
        allocated += size;
    }

    private void dataInfo(ByteBuf input) throws Exception {
        Pack pack = get(BedrockTypes.STRING.read(input));
        long chunkSize = input.readUnsignedIntLE();
        input.readUnsignedIntLE();
        long size = input.readLongLE();
        byte[] hash = BedrockTypes.BYTE_ARRAY.read(input);
        if (size < 1 || size > MAX_PACK_BYTES || chunkSize < 1 || chunkSize > MAX_PACK_BYTES || pack.bytes != null || (hash.length != 0 && hash.length != 32)) throw new IOException("Invalid pack chunk description");
        reserve((int) size);
        pack.bytes = new byte[(int) size]; pack.chunkSize = (int) chunkSize;
        pack.expectedHash = hash; pack.received = new BitSet();
    }

    private void chunk(ByteBuf input) throws Exception {
        Pack pack = get(BedrockTypes.STRING.read(input));
        long index = input.readUnsignedIntLE();
        long offset = input.readLongLE();
        byte[] data = BedrockTypes.BYTE_ARRAY.read(input);
        if (pack.bytes == null || index > Integer.MAX_VALUE || offset != index * pack.chunkSize || offset < 0 || offset >= pack.bytes.length
                || data.length != Math.min(pack.chunkSize, pack.bytes.length - offset)) throw new IOException("Invalid resource pack chunk");
        System.arraycopy(data, 0, pack.bytes, (int) offset, data.length);
        pack.received.set((int) index);
        int chunks = (int) (((long) pack.bytes.length + pack.chunkSize - 1) / pack.chunkSize);
        if (pack.received.cardinality() == chunks) {
            if (pack.expectedHash.length != 0 && !MessageDigest.isEqual(pack.expectedHash, MessageDigest.getInstance("SHA-256").digest(pack.bytes))) throw new IOException("Resource pack digest mismatch");
            complete(pack, pack.bytes);
            pack.bytes = null;
        }
    }

    private void complete(Pack pack, byte[] data) throws Exception {
        ResourcePack parsed = new ResourcePack(new ZipContent(data));
        if (!parsed.key().equals(pack.key)) throw new IOException("Downloaded pack identity mismatch");
        if (parsed.isContentEncrypted()) {
            if (pack.contentKey.length == 0) throw new IOException("Missing content key");
            parsed.decryptContent(pack.contentKey, pack.contentId);
        }
        pack.parsed = parsed;
        export(pack);
    }

    private void export(Pack pack) throws IOException {
        var manifest = pack.parsed.content().getJson("manifest.json");
        // Hive sends display labels in the stack even when the manifest has no subpacks.
        String selection = manifest.has("subpacks") && !manifest.getAsJsonArray("subpacks").isEmpty() ? pack.selection : "";
        writePrivate(directory.resolve(pack.key + ".mcpack"), pack.parsed.selectSubpack(selection).content().toZip());
    }

    private static void writePrivate(Path file, byte[] data) throws IOException {
        if (!Files.exists(file)) Files.createFile(file, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rw-------")));
        Files.write(file, data, StandardOpenOption.TRUNCATE_EXISTING);
    }

    @Override public void close() throws Exception {
        CompletableFuture<?>[] pending;
        synchronized (this) { pending = downloads.toArray(CompletableFuture[]::new); }
        try {
            CompletableFuture.allOf(pending).get(35, TimeUnit.SECONDS);
            synchronized (this) {
                if (failure != null) throw new IOException("Resource pack export failed", failure);
                for (Pack pack : packs.values()) if (pack.parsed == null) throw new IOException("Incomplete native pack capture");
            }
        } finally { synchronized (this) { closed = true; } }
    }
}
