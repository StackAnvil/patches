package com.enderdash.agent.replay;

import com.google.gson.*;
import com.sun.net.httpserver.HttpServer;
import com.viaversion.viaversion.api.type.Types;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Jwks;
import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.*;
import io.netty.channel.*;
import io.netty.channel.nio.NioIoHandler;
import io.netty.channel.socket.nio.NioDatagramChannel;
import net.raphimc.viabedrock.api.util.CryptUtil;
import net.raphimc.viabedrock.netty.CompressionCodec;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import net.raphimc.viabedrock.protocol.data.enums.bedrock.generated.PacketCompressionAlgorithm;
import net.raphimc.viabedrock.protocol.data.enums.bedrock.generated.ResourcePackResponse;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;
import org.cloudburstmc.netty.channel.raknet.RakChannelFactory;
import org.cloudburstmc.netty.channel.raknet.config.RakChannelOption;

import java.nio.file.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.io.*;
import java.util.zip.*;
import javax.crypto.Cipher;
import javax.crypto.spec.*;
import java.security.*;
import java.util.*;
import java.util.concurrent.*;

/** Protocol and crypto fixtures. This is not an official-client rendering baseline. */
public final class NativeCaptureSelfTest {
    public static void main(String[] args) throws Exception {
        KeyPair original = CryptUtil.generateEcdsa384KeyPair(), relay = CryptUtil.generateEcdsa384KeyPair();
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("DeviceOS", 7); properties.put("CurrentInputMode", 1);
        properties.put("SkinData", "opaque-native-skin"); properties.put("ServerAddress", "127.0.0.1:19312");
        String source = sign(properties, original);
        String rewritten = NativeCaptureProxy.resignClient(source, relay, "target.example:19132", original.getPublic());
        var claims = Jwts.parser().verifyWith(relay.getPublic()).build().parseSignedClaims(rewritten).getPayload();
        properties.put("ServerAddress", "target.example:19132");
        if (!new Gson().toJsonTree(properties).equals(new Gson().toJsonTree(claims))) throw new AssertionError("Native claims changed");
        authenticatedIdentity(original, relay, source);
        if (!NativeCaptureIdentity.offlineClientKey(source).equals(original.getPublic())) throw new AssertionError("Offline client key changed");
        KeyPair remote = CryptUtil.generateEcdsa384KeyPair();
        byte[] salt = new byte[16]; new SecureRandom().nextBytes(salt);
        if (!Arrays.equals(NativeCaptureProxy.exchange(relay.getPrivate(), remote.getPublic(), salt).getEncoded(),
                NativeCaptureProxy.exchange(remote.getPrivate(), relay.getPublic(), salt).getEncoded())) throw new AssertionError("ECDH keys differ");
        for (boolean bareInfo : List.of(false, true)) {
            for (boolean bareChunk : List.of(false, true)) packExport(bareInfo, bareChunk);
        }
        packIdentityRejections();
        packStackSelection();
        packHttpClose(200);
        packHttpClose(503);
        if (args.length == 2) smoke(Integer.parseInt(args[0]), Path.of(args[1]));
        System.out.println("PASS native relay JWT claim preservation, trusted multiplayer identity and proof of possession, ECDH, and encrypted chunk-pack export" + (args.length == 2 ? ", local backend reached StartGame" : ""));
    }

    private static void authenticatedIdentity(KeyPair client, KeyPair relay, String clientJwt) throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA"); generator.initialize(2048);
        KeyPair issuer = generator.generateKeyPair(), attacker = generator.generateKeyPair();
        var key = Jwks.builder().key((java.security.interfaces.RSAPublicKey) issuer.getPublic()).id("fixture").algorithm("RS256").build();
        JsonObject discovery = new JsonObject();
        discovery.addProperty("issuer", NativeCaptureIdentity.ISSUER);
        discovery.addProperty("jwks_uri", NativeCaptureIdentity.KEYS.toString());
        JsonArray algorithms = new JsonArray(); algorithms.add("RS256");
        discovery.add("id_token_signing_alg_values_supported", algorithms);
        NativeCaptureIdentity verifier = new NativeCaptureIdentity(discovery, "{\"keys\":[" + Jwks.json(key) + "]}");
        Map<String, Object> nativeClaims = tokenClaims(client), savedClaims = tokenClaims(relay);
        String nativeToken = multiplayer(nativeClaims, issuer), savedToken = multiplayer(savedClaims, issuer);
        if (!verifier.sameAccount(nativeToken, clientJwt, savedToken, relay.getPublic()).equals(client.getPublic())) {
            throw new AssertionError("Authenticated client key changed");
        }
        if (!verifier.nativeClientKey(nativeToken, clientJwt).equals(client.getPublic())) throw new AssertionError("Native token verification lost cpk");
        // A token signed by an attacker's advertised x5u key must never authenticate.
        rejected(() -> verifier.sameAccount(multiplayer(nativeClaims, attacker), clientJwt, savedToken, relay.getPublic()));
        // Modifying an otherwise valid token's payload must invalidate the RSA signature.
        String[] parts = nativeToken.split("\\.");
        JsonObject forged = JsonParser.parseString(new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8)).getAsJsonObject();
        forged.addProperty("xid", "43");
        String tampered = parts[0] + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(forged.toString().getBytes(StandardCharsets.UTF_8)) + "." + parts[2];
        rejected(() -> verifier.sameAccount(tampered, clientJwt, savedToken, relay.getPublic()));
        for (Map.Entry<String, Object> invalid : Map.<String, Object>of(
                "iss", "https://attacker.invalid/", "aud", "wrong-audience", "exp", new Date(0),
                "nbf", new Date(System.currentTimeMillis() + 600_000), "xid", "43", "cpk", publicKey(relay)).entrySet()) {
            Map<String, Object> altered = new LinkedHashMap<>(nativeClaims); altered.put(invalid.getKey(), invalid.getValue());
            String token = multiplayer(altered, issuer);
            rejected(() -> verifier.sameAccount(token, clientJwt, savedToken, relay.getPublic()));
        }
        for (String missing : List.of("exp", "cpk", "iss", "aud", "xid")) {
            Map<String, Object> altered = new LinkedHashMap<>(nativeClaims); altered.remove(missing);
            String token = multiplayer(altered, issuer);
            rejected(() -> verifier.sameAccount(token, clientJwt, savedToken, relay.getPublic()));
        }
        rejected(() -> verifier.sameAccount(nativeToken, sign(Map.of("DeviceOS", 7), relay), savedToken, relay.getPublic()));
        rejected(() -> verifier.sameAccount(nativeToken, clientJwt, savedToken, client.getPublic()));
        rejected(() -> verifier.sameAccount(nativeToken, clientJwt, multiplayer(savedClaims, attacker), relay.getPublic()));
        // Algorithm confusion and unknown key identities cannot fall back to token-provided keys.
        String selfSigned = Jwts.builder().header().add("kid", "fixture").add("x5u", publicKey(client)).and()
                .claims(nativeClaims).signWith(client.getPrivate(), Jwts.SIG.ES384).compact();
        rejected(() -> verifier.sameAccount(selfSigned, clientJwt, savedToken, relay.getPublic()));
        String unknown = Jwts.builder().header().add("kid", "unknown").and().claims(nativeClaims)
                .signWith(issuer.getPrivate(), Jwts.SIG.RS256).compact();
        rejected(() -> verifier.sameAccount(unknown, clientJwt, savedToken, relay.getPublic()));
        JsonObject changedDiscovery = discovery.deepCopy(); changedDiscovery.addProperty("jwks_uri", "https://attacker.invalid/keys");
        rejected(() -> new NativeCaptureIdentity(changedDiscovery, "{\"keys\":[" + Jwks.json(key) + "]}"));
    }

    private static Map<String, Object> tokenClaims(KeyPair client) {
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("iss", NativeCaptureIdentity.ISSUER); claims.put("aud", NativeCaptureIdentity.AUDIENCE);
        claims.put("exp", new Date(System.currentTimeMillis() + 600_000)); claims.put("xid", "42"); claims.put("cpk", publicKey(client));
        return claims;
    }

    private static String publicKey(KeyPair keys) { return Base64.getEncoder().encodeToString(keys.getPublic().getEncoded()); }

    private static String multiplayer(Map<String, Object> claims, KeyPair issuer) {
        return Jwts.builder().header().add("kid", "fixture").add("x5u", publicKey(issuer)).and()
                .claims(claims).signWith(issuer.getPrivate(), Jwts.SIG.RS256).compact();
    }

    private static void rejected(Runnable action) {
        try { action.run(); }
        catch (RuntimeException expected) { return; }
        throw new AssertionError("Accepted an unauthenticated native identity");
    }

    private static void packExport(boolean bareInfo, boolean bareChunk) throws Exception {
        Path recording = Files.createTempDirectory("stackanvil-native-pack-test");
        UUID id = UUID.randomUUID(); String name = id + "_1.0.0", contentId = "test-content";
        byte[] key = "0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8);
        byte[] texture = new byte[]{1, 2, 3, 4, 5};
        ByteArrayOutputStream contentHeader = new ByteArrayOutputStream();
        contentHeader.write(new byte[]{0, 0, 0, 0, (byte) 0xFC, (byte) 0xB9, (byte) 0xCF, (byte) 0x9B});
        contentHeader.write(new byte[8]); contentHeader.write(contentId.length()); contentHeader.write(contentId.getBytes(StandardCharsets.UTF_8));
        contentHeader.write(new byte[256 - contentHeader.size()]);
        contentHeader.write(encrypt(key, ("{\"content\":[{\"path\":\"textures/test.bin\",\"key\":\"" + new String(key, StandardCharsets.UTF_8) + "\"}]}").getBytes(StandardCharsets.UTF_8)));
        ByteArrayOutputStream archive = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(archive)) {
            Map<String, byte[]> files = Map.of(
                    "manifest.json", ("{\"format_version\":2,\"header\":{\"uuid\":\"" + id + "\",\"version\":[1,0,0],\"name\":\"fixture\"}}").getBytes(StandardCharsets.UTF_8),
                    "contents.json", contentHeader.toByteArray(), "textures/test.bin", encrypt(key, texture));
            for (var file : files.entrySet()) { zip.putNextEntry(new ZipEntry(file.getKey())); zip.write(file.getValue()); zip.closeEntry(); }
        }
        byte[] bytes = archive.toByteArray(); int split = (bytes.length + 1) / 2;
        try (NativeCapturePacks packs = new NativeCapturePacks(recording)) {
            ByteBuf info = Unpooled.buffer();
            try {
                info.writeInt(0); BedrockTypes.UUID.write(info, UUID.randomUUID()); BedrockTypes.STRING.write(info, "1");
                BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(info, 1); BedrockTypes.UUID.write(info, id);
                BedrockTypes.STRING.write(info, "1.0.0"); info.writeLongLE(bytes.length); BedrockTypes.BYTE_ARRAY.write(info, key);
                BedrockTypes.STRING.write(info, "Informational display label"); BedrockTypes.STRING.write(info, contentId); info.writeZero(3); BedrockTypes.STRING.write(info, "");
                packs.accept(6, info);
            } finally { info.release(); }
            ByteBuf descriptor = Unpooled.buffer();
            try {
                BedrockTypes.STRING.write(descriptor, bareInfo ? id.toString() : name); descriptor.writeIntLE(split).writeIntLE(2).writeLongLE(bytes.length);
                BedrockTypes.BYTE_ARRAY.write(descriptor, MessageDigest.getInstance("SHA-256").digest(bytes));
                packs.accept(82, descriptor);
            } finally { descriptor.release(); }
            // Reversed delivery must still assemble, validate, and decrypt the whole pack.
            for (int index : new int[]{1, 0}) {
                ByteBuf chunk = Unpooled.buffer();
                try {
                    BedrockTypes.STRING.write(chunk, bareChunk ? id.toString().toUpperCase(Locale.ROOT) : name); chunk.writeIntLE(index).writeLongLE((long) index * split);
                    BedrockTypes.BYTE_ARRAY.write(chunk, Arrays.copyOfRange(bytes, index * split, Math.min(bytes.length, (index + 1) * split)));
                    packs.accept(83, chunk);
                } finally { chunk.release(); }
            }
            ByteBuf stack = Unpooled.buffer();
            try {
                stack.writeBoolean(false); BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(stack, 1);
                BedrockTypes.STRING.write(stack, id.toString()); BedrockTypes.STRING.write(stack, "1.0.0");
                BedrockTypes.STRING.write(stack, "Informational display label");
                packs.accept(7, stack);
            } finally { stack.release(); }
            boolean found = false;
            try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(recording.resolve("packs").resolve(name + ".mcpack")))) {
                for (ZipEntry entry; (entry = zip.getNextEntry()) != null;) {
                    if (entry.getName().equals("textures/test.bin")) { found = true; if (!Arrays.equals(texture, zip.readAllBytes())) throw new AssertionError("Export remains encrypted"); }
                }
            }
            if (!found) throw new AssertionError("Export lost a pack file");
            JsonArray keys = JsonParser.parseString(Files.readString(recording.resolve("packs/keys.json"))).getAsJsonArray();
            if (!Arrays.equals(key, Base64.getDecoder().decode(keys.get(0).getAsJsonObject().get("contentKey").getAsString()))) throw new AssertionError("Content key lost");
        } finally {
            try (var paths = Files.walk(recording)) { for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path); }
        }
    }

    private static void packIdentityRejections() throws Exception {
        Path recording = Files.createTempDirectory("stackanvil-native-pack-identity-test");
        UUID id = UUID.randomUUID();
        Map<String, byte[]> archives = new LinkedHashMap<>();
        archives.put("1.0.0", identityPack(id, "1.0.0", (byte) 1));
        archives.put("2.0.0", identityPack(id, "2.0.0", (byte) 2));
        try (NativeCapturePacks packs = new NativeCapturePacks(recording)) {
            ByteBuf info = Unpooled.buffer();
            try {
                info.writeInt(0); BedrockTypes.UUID.write(info, UUID.randomUUID()); BedrockTypes.STRING.write(info, "1");
                BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(info, archives.size());
                for (var archive : archives.entrySet()) {
                    BedrockTypes.UUID.write(info, id); BedrockTypes.STRING.write(info, archive.getKey()); info.writeLongLE(archive.getValue().length);
                    BedrockTypes.BYTE_ARRAY.write(info, new byte[0]); BedrockTypes.STRING.write(info, "");
                    BedrockTypes.STRING.write(info, ""); info.writeZero(3); BedrockTypes.STRING.write(info, "");
                }
                packs.accept(6, info);
            } finally { info.release(); }
            byte[] first = archives.get("1.0.0");
            for (String rejected : List.of(id.toString(), UUID.randomUUID().toString(), id + "_3.0.0", "invalid", "invalid_1.0.0")) {
                rejectPackIdentity(() -> describePack(packs, rejected, first));
                rejectPackIdentity(() -> deliverPack(packs, rejected, first));
            }
            // An ambiguous UUID must not select the first advertised version, while exact
            // identities must route data and chunks to their own manifest and payload.
            for (var archive : archives.entrySet()) describePack(packs, id + "_" + archive.getKey(), archive.getValue());
            rejectPackIdentity(() -> deliverPack(packs, id.toString(), first));
            for (var archive : archives.entrySet()) deliverPack(packs, id + "_" + archive.getKey(), archive.getValue());
            int expected = 1;
            for (String version : archives.keySet()) {
                byte[] payload = null;
                try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(recording.resolve("packs").resolve(id + "_" + version + ".mcpack")))) {
                    for (ZipEntry entry; (entry = zip.getNextEntry()) != null;) {
                        if (entry.getName().equals("textures/identity.bin")) payload = zip.readAllBytes();
                    }
                }
                if (!Arrays.equals(new byte[]{(byte) expected++}, payload)) throw new AssertionError("Pack versions were mixed");
            }
        } finally {
            try (var paths = Files.walk(recording)) { for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path); }
        }
    }

    @FunctionalInterface
    private interface PackAction { void run() throws Exception; }

    private static void packStackSelection() throws Exception {
        Path recording = Files.createTempDirectory("stackanvil-native-subpack-test");
        UUID id = UUID.randomUUID(); String version = "1.0.0", name = id + "_" + version;
        ByteArrayOutputStream archive = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(archive)) {
            Map<String, byte[]> files = Map.of(
                    "manifest.json", ("{\"format_version\":3,\"header\":{\"uuid\":\"" + id + "\",\"version\":\"" + version + "\",\"name\":\"fixture\"},"
                            + "\"subpacks\":[{\"folder_name\":\"chosen\"},{\"folder_name\":\"other\"}]}").getBytes(StandardCharsets.UTF_8),
                    "textures/value.bin", new byte[]{1}, "textures/base.bin", new byte[]{4},
                    "subpacks/chosen/textures/value.bin", new byte[]{2}, "subpacks/chosen/textures/selected.bin", new byte[]{5},
                    "subpacks/other/textures/value.bin", new byte[]{3}, "subpacks/other/textures/unselected.bin", new byte[]{6});
            for (var file : files.entrySet()) { zip.putNextEntry(new ZipEntry(file.getKey())); zip.write(file.getValue()); zip.closeEntry(); }
        }
        byte[] bytes = archive.toByteArray();
        try (NativeCapturePacks packs = new NativeCapturePacks(recording)) {
            ByteBuf info = Unpooled.buffer();
            try {
                info.writeInt(0); BedrockTypes.UUID.write(info, UUID.randomUUID()); BedrockTypes.STRING.write(info, "1");
                BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(info, 1); BedrockTypes.UUID.write(info, id);
                BedrockTypes.STRING.write(info, version); info.writeLongLE(bytes.length); BedrockTypes.BYTE_ARRAY.write(info, new byte[0]);
                // Even a label equal to a declared subpack must not select that subpack.
                BedrockTypes.STRING.write(info, "other"); BedrockTypes.STRING.write(info, ""); info.writeZero(3); BedrockTypes.STRING.write(info, "");
                packs.accept(6, info);
            } finally { info.release(); }
            describePack(packs, id.toString(), bytes); deliverPack(packs, id.toString(), bytes);
            Path exported = recording.resolve("packs").resolve(name + ".mcpack");
            if (!Arrays.equals(new byte[]{1}, exportedFiles(exported).get("textures/value.bin"))) throw new AssertionError("Info label selected a subpack");
            ByteBuf stack = Unpooled.buffer();
            try {
                stack.writeBoolean(false); BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(stack, 1);
                BedrockTypes.STRING.write(stack, id.toString()); BedrockTypes.STRING.write(stack, version); BedrockTypes.STRING.write(stack, "chosen");
                BedrockTypes.STRING.write(stack, "1.26.51"); stack.writeIntLE(0).writeBoolean(false).writeBoolean(false);
                packs.accept(7, stack);
            } finally { stack.release(); }
            Map<String, byte[]> selected = exportedFiles(exported);
            if (!selected.keySet().equals(Set.of("manifest.json", "textures/value.bin", "textures/base.bin", "textures/selected.bin"))
                    || !Arrays.equals(new byte[]{2}, selected.get("textures/value.bin"))
                    || !Arrays.equals(new byte[]{4}, selected.get("textures/base.bin"))
                    || !Arrays.equals(new byte[]{5}, selected.get("textures/selected.bin"))) throw new AssertionError("Stack-selected overlay differs");
        } finally {
            try (var paths = Files.walk(recording)) { for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path); }
        }
    }

    private static Map<String, byte[]> exportedFiles(Path file) throws IOException {
        Map<String, byte[]> files = new LinkedHashMap<>();
        try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(file))) {
            for (ZipEntry entry; (entry = zip.getNextEntry()) != null;) files.put(entry.getName(), zip.readAllBytes());
        }
        return files;
    }

    private static void packHttpClose(int status) throws Exception {
        Path recording = Files.createTempDirectory("stackanvil-native-http-pack-test");
        UUID id = UUID.randomUUID();
        byte[] archive = identityPack(id, "1.0.0", (byte) 7);
        CountDownLatch requested = new CountDownLatch(1), respond = new CountDownLatch(1);
        ExecutorService httpExecutor = Executors.newSingleThreadExecutor();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        CompletableFuture<Throwable> closed = new CompletableFuture<>();
        Thread closer = null;
        try {
            server.setExecutor(httpExecutor);
            server.createContext("/pack", exchange -> {
                requested.countDown();
                try {
                    if (!respond.await(10, TimeUnit.SECONDS)) throw new IOException("Fixture response was not released");
                    byte[] body = status == 200 ? archive : new byte[0];
                    exchange.sendResponseHeaders(status, body.length);
                    exchange.getResponseBody().write(body);
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw new IOException("Fixture response interrupted", interrupted);
                } finally { exchange.close(); }
            });
            server.start();
            NativeCapturePacks packs = new NativeCapturePacks(recording);
            ByteBuf info = Unpooled.buffer();
            try {
                info.writeInt(0); BedrockTypes.UUID.write(info, UUID.randomUUID()); BedrockTypes.STRING.write(info, "1");
                BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(info, 1); BedrockTypes.UUID.write(info, id);
                BedrockTypes.STRING.write(info, "1.0.0"); info.writeLongLE(archive.length); BedrockTypes.BYTE_ARRAY.write(info, new byte[0]);
                BedrockTypes.STRING.write(info, ""); BedrockTypes.STRING.write(info, ""); info.writeZero(3);
                BedrockTypes.STRING.write(info, "http://127.0.0.1:" + server.getAddress().getPort() + "/pack");
                packs.accept(6, info);
            } finally { info.release(); }
            if (!requested.await(5, TimeUnit.SECONDS)) throw new AssertionError("Pack HTTP download did not start");
            closer = new Thread(() -> {
                try { packs.close(); closed.complete(null); }
                catch (Throwable error) { closed.complete(error); }
            }, "native-pack-close-test");
            closer.start();
            awaitPackCloseWaiting(closer, closed);
            Path exported = recording.resolve("packs").resolve(id + "_1.0.0.mcpack");
            if (Files.exists(exported)) throw new AssertionError("Pack was exported before its HTTP response");
            respond.countDown();
            Throwable failure = closed.get(5, TimeUnit.SECONDS);
            if (status == 200) {
                if (failure != null) throw new AssertionError("Successful HTTP pack failed during close", failure);
                if (!Arrays.equals(new byte[]{7}, exportedFiles(exported).get("textures/identity.bin"))) {
                    throw new AssertionError("Close returned before HTTP pack export completed");
                }
            } else {
                if (failure == null) throw new AssertionError("Close accepted a failed HTTP pack download");
                Throwable cause = failure;
                while (cause.getCause() != null) cause = cause.getCause();
                if (!(cause instanceof IOException)) throw new AssertionError("HTTP failure was not reported by close", failure);
                if (Files.exists(exported)) throw new AssertionError("Failed HTTP response produced a pack archive");
            }
        } finally {
            respond.countDown();
            server.stop(0);
            httpExecutor.shutdownNow();
            if (closer != null) {
                closer.join(5_000);
                if (closer.isAlive()) { closer.interrupt(); closer.join(5_000); }
                if (closer.isAlive()) throw new AssertionError("Pack close thread did not stop");
            }
            if (!httpExecutor.awaitTermination(5, TimeUnit.SECONDS)) throw new AssertionError("Fixture HTTP server did not stop");
            try (var paths = Files.walk(recording)) { for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path); }
        }
    }

    private static void awaitPackCloseWaiting(Thread closer, CompletableFuture<Throwable> closed) {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        while (System.nanoTime() < deadline) {
            if (closed.isDone()) throw new AssertionError("Close returned while the HTTP response was withheld");
            Thread.State state = closer.getState();
            if ((state == Thread.State.WAITING || state == Thread.State.TIMED_WAITING)
                    && Arrays.stream(closer.getStackTrace()).anyMatch(frame -> frame.getClassName().equals(NativeCapturePacks.class.getName())
                    && frame.getMethodName().equals("close"))) return;
            Thread.yield();
        }
        throw new AssertionError("Close did not wait for the pending HTTP pack download");
    }

    private static void rejectPackIdentity(PackAction action) throws Exception {
        try { action.run(); }
        catch (IOException expected) { return; }
        throw new AssertionError("Accepted unknown or ambiguous resource pack identity");
    }

    private static void describePack(NativeCapturePacks packs, String name, byte[] bytes) throws Exception {
        ByteBuf descriptor = Unpooled.buffer();
        try {
            BedrockTypes.STRING.write(descriptor, name); descriptor.writeIntLE(bytes.length).writeIntLE(1).writeLongLE(bytes.length);
            BedrockTypes.BYTE_ARRAY.write(descriptor, MessageDigest.getInstance("SHA-256").digest(bytes));
            packs.accept(82, descriptor);
        } finally { descriptor.release(); }
    }

    private static void deliverPack(NativeCapturePacks packs, String name, byte[] bytes) throws Exception {
        ByteBuf chunk = Unpooled.buffer();
        try {
            BedrockTypes.STRING.write(chunk, name); chunk.writeIntLE(0).writeLongLE(0); BedrockTypes.BYTE_ARRAY.write(chunk, bytes);
            packs.accept(83, chunk);
        } finally { chunk.release(); }
    }

    private static byte[] identityPack(UUID id, String version, byte value) throws IOException {
        ByteArrayOutputStream archive = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(archive)) {
            zip.putNextEntry(new ZipEntry("manifest.json"));
            zip.write(("{\"format_version\":3,\"header\":{\"uuid\":\"" + id + "\",\"version\":\"" + version + "\",\"name\":\"fixture\"}}").getBytes(StandardCharsets.UTF_8));
            zip.closeEntry(); zip.putNextEntry(new ZipEntry("textures/identity.bin")); zip.write(value); zip.closeEntry();
        }
        return archive.toByteArray();
    }

    private static byte[] encrypt(byte[] key, byte[] bytes) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/CFB8/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new IvParameterSpec(Arrays.copyOf(key, 16)));
        return cipher.doFinal(bytes);
    }

    private static String sign(Map<String, Object> properties, KeyPair keys) {
        return Jwts.builder().header().add("x5u", Base64.getEncoder().encodeToString(keys.getPublic().getEncoded())).and()
                .claims(properties).signWith(keys.getPrivate(), Jwts.SIG.ES384).compact();
    }

    private static ByteBuf response(ChannelHandlerContext ctx, ResourcePackResponse status) {
        ByteBuf response = ctx.alloc().buffer(); Types.VAR_INT.writePrimitive(response, 8);
        BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(response, status.getValue());
        BedrockTypes.STRING.write(response, switch (status) {
            case Downloading -> "downloading";
            case DownloadingFinished -> "downloadingfinished";
            case ResourcePackStackFinished -> "resourcepackstackfinished";
            default -> throw new IllegalArgumentException();
        });
        return response;
    }

    private static void smoke(int port, Path nativeProperties) throws Exception {
        JsonObject json = JsonParser.parseString(Files.readString(nativeProperties)).getAsJsonObject();
        Map<String, Object> properties = new GsonBuilder().setObjectToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE).create().fromJson(json, new com.google.gson.reflect.TypeToken<Map<String, Object>>() { }.getType());
        KeyPair keys = CryptUtil.generateEcdsa384KeyPair();
        String jwt = sign(properties, keys);
        EventLoopGroup loops = new MultiThreadIoEventLoopGroup(1, NioIoHandler.newFactory());
        CompletableFuture<Void> ready = new CompletableFuture<>();
        Channel client = null;
        try {
            client = new Bootstrap().group(loops).channelFactory(RakChannelFactory.client(NioDatagramChannel.class))
                    .option(RakChannelOption.RAK_PROTOCOL_VERSION, ProtocolConstants.BEDROCK_RAKNET_PROTOCOL_VERSION)
                    .handler(new ChannelInitializer<Channel>() {
                        @Override protected void initChannel(Channel channel) {
                            NativeCaptureProxy.pipeline(channel);
                            channel.pipeline().addLast("test", new SimpleChannelInboundHandler<ByteBuf>() {
                                private final Map<String, Set<Long>> chunks = new HashMap<>();
                                private final Map<String, Long> expected = new HashMap<>();
                                @Override public void channelActive(ChannelHandlerContext ctx) {
                                    ByteBuf request = ctx.alloc().buffer(); Types.VAR_INT.writePrimitive(request, 193);
                                    request.writeInt(ProtocolConstants.BEDROCK_PROTOCOL_VERSION); ctx.writeAndFlush(request);
                                }
                                @Override protected void channelRead0(ChannelHandlerContext ctx, ByteBuf input) {
                                    int id = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input) & 1023;
                                    if (id == 143) {
                                        int threshold = input.readUnsignedShortLE();
                                        var algorithm = PacketCompressionAlgorithm.getByValue(input.readUnsignedShortLE());
                                        ctx.pipeline().addBefore("batch", "compression", new CompressionCodec(algorithm, threshold));
                                        ctx.writeAndFlush(NativeCaptureProxy.login(new NativeCaptureProxy.Identity(keys, "local-fixture", false), jwt));
                                    } else if (id == 6) {
                                        input.skipBytes(20); BedrockTypes.STRING.read(input);
                                        int count = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
                                        List<String> ids = new ArrayList<>();
                                        for (int i = 0; i < count; i++) {
                                            String name = BedrockTypes.UUID.read(input) + "_" + BedrockTypes.STRING.read(input);
                                            ids.add(name); chunks.put(name, new HashSet<>());
                                            input.skipBytes(8); BedrockTypes.BYTE_ARRAY.read(input);
                                            BedrockTypes.STRING.read(input); BedrockTypes.STRING.read(input); input.skipBytes(3); BedrockTypes.STRING.read(input);
                                        }
                                        ByteBuf response = response(ctx, count == 0 ? ResourcePackResponse.DownloadingFinished : ResourcePackResponse.Downloading);
                                        if (count != 0) BedrockTypes.STRING_ARRAY.write(response, ids.toArray(String[]::new));
                                        ctx.writeAndFlush(response);
                                    } else if (id == 82) {
                                        String name = BedrockTypes.STRING.read(input);
                                        long chunkSize = input.readUnsignedIntLE(); input.skipBytes(4);
                                        long size = input.readLongLE(); long count = (size + chunkSize - 1) / chunkSize;
                                        expected.put(name, count);
                                        for (long i = 0; i < count; i++) {
                                            ByteBuf request = ctx.alloc().buffer(); Types.VAR_INT.writePrimitive(request, 84);
                                            BedrockTypes.STRING.write(request, name); request.writeIntLE((int) i); ctx.writeAndFlush(request);
                                        }
                                    } else if (id == 83) {
                                        String name = BedrockTypes.STRING.read(input); long index = input.readUnsignedIntLE();
                                        chunks.get(name).add(index);
                                        if (expected.size() == chunks.size() && chunks.entrySet().stream().allMatch(e -> e.getValue().size() == expected.get(e.getKey()))) {
                                            ctx.writeAndFlush(response(ctx, ResourcePackResponse.DownloadingFinished));
                                        }
                                    } else if (id == 7) {
                                        ctx.writeAndFlush(response(ctx, ResourcePackResponse.ResourcePackStackFinished));
                                    } else if (id == 11) ready.complete(null);
                                    else if (id == 5) ready.completeExceptionally(new IllegalStateException("Local backend disconnected"));
                                }
                                @Override public void exceptionCaught(ChannelHandlerContext ctx, Throwable error) { ready.completeExceptionally(error); ctx.close(); }
                            });
                        }
                    }).connect("127.0.0.1", port).sync().channel();
            ready.get(25, TimeUnit.SECONDS);
        } finally { if (client != null) client.close().sync(); loops.shutdownGracefully().sync(); }
    }
}
