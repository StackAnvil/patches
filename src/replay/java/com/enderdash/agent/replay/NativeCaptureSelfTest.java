package com.enderdash.agent.replay;

import com.google.gson.*;
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
        packExport();
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

    private static void packExport() throws Exception {
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
                BedrockTypes.STRING.write(info, ""); BedrockTypes.STRING.write(info, contentId); info.writeZero(3); BedrockTypes.STRING.write(info, "");
                packs.accept(6, info);
            } finally { info.release(); }
            ByteBuf descriptor = Unpooled.buffer();
            try {
                BedrockTypes.STRING.write(descriptor, name); descriptor.writeIntLE(split).writeIntLE(2).writeLongLE(bytes.length);
                BedrockTypes.BYTE_ARRAY.write(descriptor, MessageDigest.getInstance("SHA-256").digest(bytes));
                packs.accept(82, descriptor);
            } finally { descriptor.release(); }
            // Reversed delivery must still assemble, validate, and decrypt the whole pack.
            for (int index : new int[]{1, 0}) {
                ByteBuf chunk = Unpooled.buffer();
                try {
                    BedrockTypes.STRING.write(chunk, name); chunk.writeIntLE(index).writeLongLE((long) index * split);
                    BedrockTypes.BYTE_ARRAY.write(chunk, Arrays.copyOfRange(bytes, index * split, Math.min(bytes.length, (index + 1) * split)));
                    packs.accept(83, chunk);
                } finally { chunk.release(); }
            }
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
