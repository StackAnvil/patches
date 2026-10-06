package com.enderdash.agent.replay;

import com.google.gson.*;
import com.viaversion.viaversion.api.type.Types;
import io.jsonwebtoken.Jwts;
import io.netty.bootstrap.*;
import io.netty.buffer.*;
import io.netty.channel.*;
import io.netty.channel.nio.NioIoHandler;
import io.netty.channel.socket.nio.NioDatagramChannel;
import net.raphimc.minecraftauth.MinecraftAuth;
import net.raphimc.minecraftauth.bedrock.BedrockAuthManager;
import net.raphimc.viabedrock.api.util.CryptUtil;
import net.raphimc.viabedrock.netty.*;
import net.raphimc.viabedrock.netty.raknet.*;
import net.raphimc.viabedrock.netty.nethernet.BedrockHttpSignaling;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import net.raphimc.viabedrock.protocol.data.enums.bedrock.generated.PacketCompressionAlgorithm;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;
import org.cloudburstmc.netty.channel.nethernet.NetherNetChannelFactory;
import org.cloudburstmc.netty.channel.nethernet.config.NetherChannelOption;
import org.cloudburstmc.netty.util.nethernet.OperatorIdentity;
import org.cloudburstmc.netty.channel.raknet.RakChannelFactory;
import org.cloudburstmc.netty.channel.raknet.config.RakChannelOption;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/** Raw native-client relay. Gameplay never enters ViaBedrock's translation protocol. */
public final class NativeCaptureProxy {
    record Identity(KeyPair keys, String token, boolean online) { }
    private record LoginIdentity(Identity identity, PublicKey clientKey) { }
    private final Path directory;
    private final InetSocketAddress target;
    private final String account;
    private final boolean netherNet;
    private final EventLoopGroup loops;
    private final AtomicBoolean used = new AtomicBoolean();

    private NativeCaptureProxy(Path directory, InetSocketAddress target, String account, boolean netherNet, EventLoopGroup loops) {
        this.directory = directory; this.target = target; this.account = account; this.netherNet = netherNet; this.loops = loops;
    }

    public static void main(String[] args) {
        try {
            if (args.length != 5 && (args.length != 6 || !args[5].equals("--nethernet"))) {
                throw new IllegalArgumentException("NativeCaptureProxy <private-directory> <loopback-port> <host> <port> <account-json|offline> [--nethernet]");
            }
            Path directory = Path.of(args[0]).toAbsolutePath();
            Files.createDirectories(directory);
            PrivateFiles.protectDirectory(directory);
            InetSocketAddress target = new InetSocketAddress(args[2], Integer.parseInt(args[3]));
            if (target.isUnresolved()) throw new IllegalArgumentException("Unresolved target");
            if (args[4].equals("offline") && !target.getAddress().isLoopbackAddress()) throw new IllegalArgumentException("Offline identity is restricted to a local backend");
            EventLoopGroup loops = new MultiThreadIoEventLoopGroup(2, NioIoHandler.newFactory());
            try {
                NativeCaptureProxy proxy = new NativeCaptureProxy(directory, target, args[4], args.length == 6, loops);
                String motd = "MCPE;StackAnvil native recorder;" + ProtocolConstants.BEDROCK_PROTOCOL_VERSION + ";" + ProtocolConstants.BEDROCK_VERSION_NAME + ";0;1;1;Capture;Survival;1;" + args[1] + ";" + args[1] + ";";
                Channel server = new ServerBootstrap().group(loops).channelFactory(RakChannelFactory.server(NioDatagramChannel.class))
                        .option(RakChannelOption.RAK_ADVERTISEMENT, Unpooled.copiedBuffer(motd, StandardCharsets.UTF_8))
                        .option(RakChannelOption.RAK_SUPPORTED_PROTOCOLS, new int[]{ProtocolConstants.BEDROCK_RAKNET_PROTOCOL_VERSION})
                        .option(RakChannelOption.RAK_MAX_CONNECTIONS, 1)
                        // Native login data fragments arrive in bursts over this loopback-only connection.
                        .option(RakChannelOption.RAK_PACKET_LIMIT, 4096)
                        .childHandler(new ChannelInitializer<Channel>() {
                            @Override protected void initChannel(Channel channel) {
                                if (!proxy.used.compareAndSet(false, true)) { channel.close(); return; }
                                pipeline(channel, true);
                                channel.pipeline().addLast("native-capture", proxy.new Session());
                            }
                        }).bind("127.0.0.1", Integer.parseInt(args[1])).sync().channel();
                Runtime.getRuntime().addShutdownHook(new Thread(() -> server.close()));
                System.out.println("StackAnvil native capture ready on " + server.localAddress());
                server.closeFuture().sync();
            } finally { loops.shutdownGracefully().sync(); }
        } catch (Throwable error) {
            // SDK exceptions can contain signed tokens or CDN URLs. Never print their messages.
            System.err.println("Native capture failed: " + error.getClass().getSimpleName());
            System.exit(1);
        }
    }

    static void pipeline(Channel channel, boolean rakNet) {
        if (rakNet) channel.pipeline().addLast("message", new MessageCodec());
        channel.pipeline().addLast("batch", new BatchLengthCodec());
    }

    static void enableEncryption(Channel channel, SecretKey key) throws GeneralSecurityException {
        // NetherNet already protects its data channels with DTLS. BDS still sends the Bedrock handshake,
        // but only RakNet switches subsequent game batches to the Bedrock AES stream.
        if (channel.pipeline().get(MessageCodec.class) != null) {
            channel.pipeline().addBefore("compression", "encryption", new AesEncryptionCodec(key));
        }
    }

    static String resignClient(String original, KeyPair keys, String destination, PublicKey clientKey) {
        var claims = NativeCaptureIdentity.clientClaims(original, clientKey);
        Map<String, Object> properties = new LinkedHashMap<>(claims);
        // This is the original native client's device, input, platform, skin and rendering data.
        properties.put("ServerAddress", destination);
        return Jwts.builder().header().add("x5u", Base64.getEncoder().encodeToString(keys.getPublic().getEncoded())).and()
                .claims(properties).signWith(keys.getPrivate(), Jwts.SIG.ES384).compact();
    }

    static ByteBuf login(Identity identity, String clientJwt) {
        JsonObject auth = new JsonObject();
        auth.addProperty("AuthenticationType", identity.online() ? 0 : 2);
        auth.addProperty("Certificate", "{\"chain\":[\"..\"]}\n");
        auth.addProperty("Token", identity.token());
        ByteBuf payload = Unpooled.buffer();
        ByteBuf packet = Unpooled.buffer();
        try {
            BedrockTypes.ASCII_STRING.write(payload, auth.toString());
            BedrockTypes.ASCII_STRING.write(payload, clientJwt);
            Types.VAR_INT.writePrimitive(packet, 1);
            packet.writeInt(ProtocolConstants.BEDROCK_PROTOCOL_VERSION);
            BedrockTypes.UNSIGNED_VAR_INT.writePrimitive(packet, payload.readableBytes());
            packet.writeBytes(payload);
            return packet;
        } catch (Throwable error) { packet.release(); throw error; }
        finally { payload.release(); }
    }

    static SecretKey exchange(PrivateKey privateKey, Key publicKey, byte[] salt) throws GeneralSecurityException {
        KeyAgreement ecdh = KeyAgreement.getInstance("ECDH");
        ecdh.init(privateKey); ecdh.doPhase(publicKey, true);
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        digest.update(salt); digest.update(ecdh.generateSecret());
        return new SecretKeySpec(digest.digest(), "AES");
    }

    private Identity identity() throws Exception {
        KeyPair keys = CryptUtil.generateEcdsa384KeyPair();
        if (account.equals("offline")) {
            String publicKey = Base64.getEncoder().encodeToString(keys.getPublic().getEncoded());
            String token = Jwts.builder().header().add("x5u", publicKey).and()
                    .claim("aud", "api://auth-minecraft-services/multiplayer").claim("iss", "self")
                    .claim("xname", "NativeCapture").claim("xid", "0")
                    .claim("leguuid", UUID.nameUUIDFromBytes("pocket-auth-1-xuid:0".getBytes(StandardCharsets.UTF_8)))
                    .claim("mid", "0").claim("nid", "").claim("nname", "").claim("pid", "").claim("pname", "")
                    .claim("cpk", publicKey).issuedAt(Date.from(Instant.now())).expiration(Date.from(Instant.now().plusSeconds(600)))
                    .signWith(keys.getPrivate(), Jwts.SIG.ES384).compact();
            return new Identity(keys, token, false);
        }
        JsonObject saved = JsonParser.parseString(Files.readString(Path.of(account))).getAsJsonObject();
        BedrockAuthManager previous = BedrockAuthManager.fromJson(MinecraftAuth.createHttpClient(), ProtocolConstants.BEDROCK_VERSION_NAME, saved);
        BedrockAuthManager fresh = BedrockAuthManager.create(MinecraftAuth.createHttpClient(), ProtocolConstants.BEDROCK_VERSION_NAME)
                .msaApplicationConfig(previous.getMsaApplicationConfig()).deviceType(previous.getDeviceType())
                .deviceKeyPair(previous.getDeviceKeyPair()).deviceId(previous.getDeviceId()).sessionKeyPair(keys)
                .login(previous.getMsaToken().getUpToDate());
        return new Identity(keys, fresh.getMinecraftMultiplayerToken().getUpToDate().getToken(), true);
    }

    private final class Session extends SimpleChannelInboundHandler<ByteBuf> {
        private Channel upstream;
        private volatile Channel downstream;
        private PacketJournal journal;
        private NativeCapturePacks packs;
        private boolean packObservationFailed;
        private volatile int phase;
        private boolean closing;

        @Override public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
            upstream = ctx.channel();
            journal = new PacketJournal(directory.resolve("packets.sbr"), ProtocolConstants.BEDROCK_PROTOCOL_VERSION);
            packs = new NativeCapturePacks(directory);
        }

        @Override protected void channelRead0(ChannelHandlerContext ctx, ByteBuf input) throws Exception {
            ByteBuf view = input.duplicate();
            int id = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(view) & 1023;
            if (phase == 0 && id == 193) {
                if (view.readInt() != ProtocolConstants.BEDROCK_PROTOCOL_VERSION) throw new IllegalArgumentException("Native version differs from journal protocol");
                ByteBuf settings = ctx.alloc().buffer();
                Types.VAR_INT.writePrimitive(settings, 143);
                settings.writeShortLE(0).writeShortLE(0).writeBoolean(false).writeByte(0).writeFloatLE(0);
                ctx.writeAndFlush(settings);
                ctx.pipeline().addBefore("batch", "compression", new CompressionCodec(PacketCompressionAlgorithm.ZLib, 0));
                phase = 1;
            } else if (phase == 1 && id == 1) {
                if (view.readInt() != ProtocolConstants.BEDROCK_PROTOCOL_VERSION) throw new IllegalArgumentException("Invalid native login version");
                int length = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(view);
                if (length != view.readableBytes() || length > PacketJournal.MAX_PACKET_BYTES) throw new IllegalArgumentException("Invalid native login length");
                JsonObject nativeAuth = JsonParser.parseString(BedrockTypes.ASCII_STRING.read(view)).getAsJsonObject();
                String nativeToken = nativeAuth.get("Token").getAsString(); // Authentication stays out of the journal.
                String clientJwt = BedrockTypes.ASCII_STRING.read(view);
                if (view.isReadable()) throw new IllegalArgumentException("Unexpected native login fields");
                phase = 2;
                CompletableFuture.supplyAsync(() -> {
                    try {
                        NativeCaptureIdentity verifier = account.equals("offline") ? null : NativeCaptureIdentity.official();
                        PublicKey clientKey = verifier == null ? NativeCaptureIdentity.offlineClientKey(clientJwt)
                                : verifier.nativeClientKey(nativeToken, clientJwt);
                        Identity identity = identity();
                        if (verifier != null) verifier.sameAccount(nativeToken, clientJwt, identity.token(), identity.keys().getPublic());
                        return new LoginIdentity(identity, clientKey);
                    }
                    catch (Exception error) { throw new CompletionException(error); }
                }).whenComplete((identity, error) -> ctx.executor().execute(() -> {
                    if (error != null) { fail(error); return; }
                    if (!upstream.isActive()) return;
                    try {
                        Identity relay = identity.identity();
                        connect(relay, resignClient(clientJwt, relay.keys(), target.getHostString() + ":" + target.getPort(), identity.clientKey()));
                    }
                    catch (Throwable failure) { fail(failure); }
                }));
            } else if (phase >= 3 && downstream != null && downstream.isActive()) {
                if (id == 129) {
                    ByteBuf cache = input.copy();
                    cache.setBoolean(view.readerIndex(), false);
                    record(false, cache);
                    downstream.writeAndFlush(cache);
                } else {
                    record(false, input);
                    downstream.writeAndFlush(input.retainedDuplicate());
                }
            }
        }

        private void connect(Identity identity, String clientJwt) {
            Bootstrap bootstrap = new Bootstrap().group(loops);
            if (netherNet) {
                OperatorIdentity operator = identity.online() ? OperatorIdentity.fromToken(identity.keys(), identity.token(),
                        "https://authorization.franchise.minecraft-services.net/") : null;
                bootstrap.channelFactory(NetherNetChannelFactory.client(new BedrockHttpSignaling()))
                        .option(NetherChannelOption.NETHER_CLIENT_HANDSHAKE_TIMEOUT_MS, 10000)
                        .option(NetherChannelOption.NETHER_CLIENT_MAX_HANDSHAKE_ATTEMPTS, 1)
                        .option(NetherChannelOption.NETHER_CLIENT_IDENTITY, operator);
            } else {
                bootstrap.channelFactory(RakChannelFactory.client(NioDatagramChannel.class))
                        .option(RakChannelOption.RAK_PROTOCOL_VERSION, ProtocolConstants.BEDROCK_RAKNET_PROTOCOL_VERSION)
                        .option(RakChannelOption.RAK_CONNECT_TIMEOUT, 10000L);
            }
            bootstrap.handler(new ChannelInitializer<Channel>() {
                @Override protected void initChannel(Channel channel) {
                    pipeline(channel, !netherNet);
                    channel.pipeline().addLast("native-relay", new SimpleChannelInboundHandler<ByteBuf>() {
                        @Override public void channelActive(ChannelHandlerContext ctx) {
                            downstream = ctx.channel();
                            System.out.println("Native backend transport connected");
                            ByteBuf request = ctx.alloc().buffer();
                            Types.VAR_INT.writePrimitive(request, 193);
                            request.writeInt(ProtocolConstants.BEDROCK_PROTOCOL_VERSION);
                            ctx.writeAndFlush(request).addListener(ChannelFutureListener.FIRE_EXCEPTION_ON_FAILURE);
                        }
                        @Override protected void channelRead0(ChannelHandlerContext ctx, ByteBuf input) throws Exception {
                            ByteBuf view = input.duplicate();
                            int id = BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(view) & 1023;
                            if (id == 143) {
                                System.out.println("Native backend network settings received");
                                int threshold = view.readUnsignedShortLE();
                                PacketCompressionAlgorithm algorithm = PacketCompressionAlgorithm.getByValue(view.readUnsignedShortLE());
                                ctx.pipeline().addBefore("batch", "compression", new CompressionCodec(algorithm, threshold));
                                ByteBuf login = login(identity, clientJwt);
                                System.out.println("Native backend login bytes: " + login.readableBytes());
                                ctx.writeAndFlush(login).addListener(ChannelFutureListener.FIRE_EXCEPTION_ON_FAILURE);
                                phase = 3;
                            } else if (id == 3) {
                                System.out.println("Native backend encryption handshake received");
                                var jwt = Jwts.parser().keyLocator(CryptUtil.X5U_KEY_LOCATOR).build().parseSignedClaims(BedrockTypes.STRING.read(view));
                                SecretKey key = exchange(identity.keys().getPrivate(), CryptUtil.X5U_KEY_LOCATOR.locate(jwt.getHeader()),
                                        Base64.getDecoder().decode(jwt.getPayload().get("salt", String.class)));
                                enableEncryption(ctx.channel(), key);
                                ByteBuf answer = ctx.alloc().buffer(); Types.VAR_INT.writePrimitive(answer, 4); ctx.writeAndFlush(answer);
                            } else {
                                record(true, input);
                                if (id == 85) { fail(new IllegalStateException("Transfer ends this single-host capture")); return; }
                                if (!packObservationFailed) {
                                    try { packs.accept(id, view); }
                                    catch (Exception error) { packFailure(error); }
                                }
                                upstream.writeAndFlush(input.retainedDuplicate());
                            }
                        }
                        @Override public void channelInactive(ChannelHandlerContext ctx) { upstream.close(); }
                        @Override public void exceptionCaught(ChannelHandlerContext ctx, Throwable error) { fail(error); }
                    });
                }
            }).connect(target).addListener((ChannelFutureListener) future -> { if (!future.isSuccess()) fail(future.cause()); });
        }

        private synchronized void record(boolean clientbound, ByteBuf input) throws Exception {
            if (!closing) journal.append(clientbound, ReplayPackets.bytes(input));
        }
        private void packFailure(Exception error) {
            packObservationFailed = true;
            // Preserve the raw scene for offline repair without interrupting native gameplay.
            System.err.println("Native pack observation failed: " + error.getClass().getSimpleName());
        }
        private void fail(Throwable error) {
            System.err.println("Native connection failed: " + error.getClass().getSimpleName());
            upstream.close();
            if (downstream != null) downstream.close();
        }
        @Override public void exceptionCaught(ChannelHandlerContext ctx, Throwable error) { fail(error); }
        @Override public void channelInactive(ChannelHandlerContext ctx) throws Exception {
            synchronized (this) {
                if (closing) return;
                closing = true;
                if (journal != null) journal.close();
            }
            if (downstream != null) downstream.close();
            if (packs != null) {
                try {
                    packs.close();
                    if (!packObservationFailed) System.out.println("StackAnvil native pack observation complete");
                }
                catch (Exception error) { packFailure(error); }
            }
            System.out.println("StackAnvil native capture connection closed");
        }
    }
}
