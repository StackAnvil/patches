package com.enderdash.agent.replay;

import com.sun.net.httpserver.HttpServer;
import com.viaversion.viaversion.api.type.Types;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.*;
import io.netty.channel.*;
import io.netty.channel.nio.NioIoHandler;
import io.netty.channel.socket.nio.NioDatagramChannel;
import net.raphimc.viabedrock.netty.*;
import net.raphimc.viabedrock.netty.raknet.MessageCodec;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import net.raphimc.viabedrock.protocol.data.enums.bedrock.generated.PacketCompressionAlgorithm;
import net.raphimc.viabedrock.protocol.types.BedrockTypes;
import org.cloudburstmc.netty.channel.raknet.RakChannelFactory;
import org.cloudburstmc.netty.channel.raknet.config.RakChannelOption;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

/** A recorded scene server. It never opens a connection to the captured host. */
public final class ReplayServer {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("ReplayServer <recording-directory> <port>");
        Path directory = Path.of(args[0]).toAbsolutePath();
        List<PacketJournal.Entry> entries = PacketJournal.read(directory.resolve("packets.sbr"), ProtocolConstants.BEDROCK_PROTOCOL_VERSION);
        byte[] info = entries.stream().filter(e -> e.clientbound() && e.id() == 6).findFirst().orElseThrow().payload();
        byte[] stack = entries.stream().filter(e -> e.clientbound() && e.id() == 7).findFirst().orElseThrow().payload();
        if (entries.stream().noneMatch(e -> e.clientbound() && e.id() == 11)) throw new IllegalStateException("Recording did not reach StartGame");
        List<PacketJournal.Entry> scene = entries.stream().filter(e -> e.clientbound() && !Set.of(3, 5, 6, 7, 82, 83, 85, 143).contains(e.id()))
                .filter(e -> !(e.id() == 2 && e.payload().length == 5 && e.payload()[4] == 0)).toList();
        HttpServer http = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        http.createContext("/", exchange -> {
            String name = exchange.getRequestURI().getPath().substring(1);
            if (!Set.of("GET", "HEAD").contains(exchange.getRequestMethod()) || !name.matches("[0-9a-fA-F-]{36}_[0-9]+(?:\\.[0-9]+)*\\.mcpack")) {
                exchange.sendResponseHeaders(404, -1); exchange.close(); return;
            }
            Path file = directory.resolve("packs").resolve(name);
            if (!Files.isRegularFile(file)) { exchange.sendResponseHeaders(404, -1); exchange.close(); return; }
            exchange.getResponseHeaders().set("Content-Type", "application/zip");
            exchange.getResponseHeaders().set("Content-Length", Long.toString(Files.size(file)));
            if (exchange.getRequestMethod().equals("HEAD")) { exchange.sendResponseHeaders(200, -1); exchange.close(); return; }
            exchange.sendResponseHeaders(200, Files.size(file));
            try (var output = exchange.getResponseBody()) { Files.copy(file, output); }
        });
        byte[] localInfo = ReplayPackets.resourceInfo(info, directory.resolve("packs"), http.getAddress().getPort());
        byte[] localStack = ReplayPackets.resourceStack(stack);
        http.start();
        EventLoopGroup loops = new MultiThreadIoEventLoopGroup(2, NioIoHandler.newFactory());
        try {
            String motd = "MCPE;StackAnvil recorded scene;" + ProtocolConstants.BEDROCK_PROTOCOL_VERSION + ";" + ProtocolConstants.BEDROCK_VERSION_NAME + ";0;1;1;Replay;Creative;1;" + args[1] + ";" + args[1] + ";";
            Channel server = new ServerBootstrap().group(loops).channelFactory(RakChannelFactory.server(NioDatagramChannel.class))
                    .option(RakChannelOption.RAK_ADVERTISEMENT, Unpooled.copiedBuffer(motd, StandardCharsets.UTF_8))
                    .option(RakChannelOption.RAK_SUPPORTED_PROTOCOLS, new int[]{ProtocolConstants.BEDROCK_RAKNET_PROTOCOL_VERSION})
                    .option(RakChannelOption.RAK_MAX_CONNECTIONS, 1)
                    .childHandler(new ChannelInitializer<Channel>() {
                        @Override protected void initChannel(Channel channel) {
                            channel.pipeline().addLast("rak-message", new MessageCodec());
                            channel.pipeline().addLast("batch", new BatchLengthCodec());
                            channel.pipeline().addLast("packet", new PacketCodec());
                            channel.pipeline().addLast("replay", new SimpleChannelInboundHandler<ByteBuf>() {
                                private int phase;
                                private ScheduledFuture<?> playback;
                                private ScheduledFuture<?> heartbeat;
                                @Override protected void channelRead0(ChannelHandlerContext ctx, ByteBuf input) {
                                    int id = Types.VAR_INT.readPrimitive(input);
                                    if (phase == 0 && id == 193) {
                                        if (input.readInt() != ProtocolConstants.BEDROCK_PROTOCOL_VERSION) { ctx.close(); return; }
                                        ByteBuf settings = ctx.alloc().buffer();
                                        Types.VAR_INT.writePrimitive(settings, 143);
                                        settings.writeShortLE(0).writeShortLE(0).writeBoolean(false).writeByte(0).writeFloatLE(0);
                                        ctx.writeAndFlush(settings);
                                        ctx.pipeline().addBefore("batch", "compression", new CompressionCodec(PacketCompressionAlgorithm.ZLib, 0));
                                        phase = 1;
                                    } else if (phase == 1 && id == 1) {
                                        // Offline loopback session: no recorded JWT or encryption keys.
                                        phase = 2;
                                        ctx.writeAndFlush(Unpooled.buffer().writeByte(2).writeInt(0));
                                        ctx.writeAndFlush(Unpooled.wrappedBuffer(localInfo));
                                    } else if (id == 8 && input.isReadable()) {
                                        BedrockTypes.UNSIGNED_VAR_INT.readPrimitive(input);
                                        String response = BedrockTypes.STRING.read(input);
                                        if (phase == 2 && response.equals("downloadingfinished")) {
                                            phase = 3;
                                            ctx.writeAndFlush(Unpooled.wrappedBuffer(localStack));
                                        } else if (phase == 3 && response.equals("resourcepackstackfinished")) {
                                            phase = 4;
                                            long origin = scene.getFirst().nanos();
                                            long started = System.nanoTime();
                                            int[] cursor = {0};
                                            playback = ctx.executor().scheduleAtFixedRate(() -> {
                                                try {
                                                    while (cursor[0] < scene.size() && scene.get(cursor[0]).nanos() - origin <= System.nanoTime() - started) {
                                                        ctx.write(Unpooled.wrappedBuffer(scene.get(cursor[0]++).payload()));
                                                    }
                                                    ctx.flush();
                                                    if (cursor[0] == scene.size()) {
                                                        playback.cancel(false);
                                                        System.out.println("StackAnvil replay scene complete");
                                                        heartbeat = ctx.executor().scheduleAtFixedRate(() -> {
                                                            ByteBuf ping = ctx.alloc().buffer();
                                                            Types.VAR_INT.writePrimitive(ping, 115);
                                                            ping.writeLongLE(System.currentTimeMillis()).writeBoolean(true);
                                                            ctx.writeAndFlush(ping);
                                                        }, 1, 5, TimeUnit.SECONDS);
                                                    }
                                                } catch (Throwable error) { ctx.fireExceptionCaught(error); ctx.close(); }
                                            }, 10, 10, TimeUnit.MILLISECONDS);
                                        }
                                    }
                                }
                                @Override public void channelInactive(ChannelHandlerContext ctx) throws Exception {
                                    if (playback != null) playback.cancel(false);
                                    if (heartbeat != null) heartbeat.cancel(false);
                                    super.channelInactive(ctx);
                                }
                                @Override public void exceptionCaught(ChannelHandlerContext ctx, Throwable error) {
                                    System.err.println("Replay connection failed: " + error.getClass().getSimpleName());
                                    ctx.close();
                                }
                            });
                        }
                    }).bind("127.0.0.1", Integer.parseInt(args[1])).sync().channel();
            System.out.println("StackAnvil replay ready on " + server.localAddress());
            server.closeFuture().sync();
        } finally { http.stop(0); loops.shutdownGracefully().sync(); }
    }
}
