package com.enderdash.agent.replay.fabric;

import com.enderdash.agent.replay.CameraPresetAudit;
import com.enderdash.agent.replay.PacketJournal;
import com.viaversion.viaversion.api.Via;
import com.viaversion.viaversion.api.connection.UserConnection;
import com.viaversion.viaversion.api.type.Types;
import com.viaversion.viaversion.platform.ViaDecodeHandler;
import java.net.InetSocketAddress;
import java.util.UUID;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.util.ReferenceCountUtil;
import net.raphimc.viabedrock.api.resourcepack.ResourcePack;
import net.raphimc.viabedrock.netty.PacketCodec;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import net.raphimc.viabedrock.protocol.storage.ResourcePackStorage;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

public final class FabricRecorder {
    private static final AtomicBoolean USED = new AtomicBoolean();

    public static void install(ChannelHandlerContext context) throws IOException {
        Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
        if (!USED.compareAndSet(false, true)) throw new IOException("The replay fixture permits one connection");
        Path identityFile = directory.resolve("replay-self-uuid.txt");
        UUID replayIdentity = Files.exists(identityFile) ? UUID.fromString(Files.readString(identityFile).trim()) : null;
        PacketJournal journal = new PacketJournal(directory.resolve("packets.sbr"), ProtocolConstants.BEDROCK_PROTOCOL_VERSION);
        context.pipeline().addAfter(PacketCodec.NAME, "stackanvil-recording", new ChannelDuplexHandler() {
            private boolean packsSaved;
            private byte[] pendingPresets;
            private io.netty.util.concurrent.ScheduledFuture<?> export;

            @Override public void handlerAdded(ChannelHandlerContext ctx) {
                export = ctx.executor().scheduleAtFixedRate(() -> {
                    try { savePacks(ctx); auditPresets(ctx); RenderAudit.flush(); }
                    catch (Exception error) { ctx.fireExceptionCaught(error); ctx.close(); }
                }, 200, 200, TimeUnit.MILLISECONDS);
            }

            private void auditPresets(ChannelHandlerContext ctx) throws IOException {
                if (pendingPresets == null) return;
                ViaDecodeHandler decoder = ctx.pipeline().get(ViaDecodeHandler.class);
                if (decoder == null) throw new IOException("Replay connection has no ViaVersion decoder for camera observation");
                if (CameraPresetAudit.afterPacket(decoder.connection(), pendingPresets, directory)) pendingPresets = null;
            }

            private void savePacks(ChannelHandlerContext ctx) throws IOException {
                if (packsSaved) return;
                UserConnection connection = Via.getManager().getConnectionManager().getConnections().stream()
                    .filter(user -> user.getChannel() == ctx.channel()).findFirst().orElse(null);
                if (connection == null) return;
                ResourcePackStorage storage = connection.get(ResourcePackStorage.class);
                if (storage == null || storage.getPackStackTopToBottom().isEmpty()) return;
                Path packs = directory.resolve("packs");
                Files.createDirectory(packs, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rwx------")));
                for (ResourcePack pack : storage.getPackStackTopToBottom()) {
                    if (!storage.isServerPack(pack)) continue;
                    Path file = packs.resolve(pack.key() + ".mcpack");
                    Files.write(file, pack.content().toZip(), StandardOpenOption.CREATE_NEW);
                    Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rw-------"));
                }
                packsSaved = true;
                System.out.println("StackAnvil selected packs saved");
            }

            private void record(boolean clientbound, Object message) throws IOException {
                if (message instanceof ByteBuf buffer) {
                    byte[] bytes = new byte[buffer.readableBytes()];
                    buffer.getBytes(buffer.readerIndex(), bytes);
                    journal.append(clientbound, bytes);
                }
            }

            @Override public void channelRead(ChannelHandlerContext ctx, Object message) throws Exception {
                final byte[] presets;
                try {
                    presets = CameraPresetAudit.capture(message);
                    record(true, message);
                    if (replayIdentity != null && message instanceof ByteBuf buffer) {
                        ByteBuf packet = buffer.duplicate();
                        if (Types.VAR_INT.readPrimitive(packet) == 2 && packet.isReadable(4) && packet.readInt() == 0) {
                            if (!(ctx.channel().remoteAddress() instanceof InetSocketAddress address) || !address.getAddress().isLoopbackAddress()) {
                                throw new IOException("Replay identity is restricted to a loopback server");
                            }
                            ViaDecodeHandler decoder = ctx.pipeline().get(ViaDecodeHandler.class);
                            if (decoder == null) throw new IOException("Replay connection has no ViaVersion decoder");
                            decoder.connection().getProtocolInfo().setUuid(replayIdentity);
                        }
                    }
                }
                catch (Exception error) { ReferenceCountUtil.release(message); ctx.close(); throw error; }
                super.channelRead(ctx, message);
                if (presets != null) pendingPresets = presets;
                auditPresets(ctx);
            }

            @Override public void write(ChannelHandlerContext ctx, Object message, ChannelPromise promise) throws Exception {
                try { record(false, message); }
                catch (Exception error) { ReferenceCountUtil.release(message); promise.setFailure(error); ctx.close(); throw error; }
                super.write(ctx, message, promise);
            }

            @Override public void channelInactive(ChannelHandlerContext ctx) throws Exception {
                export.cancel(false);
                try { savePacks(ctx); }
                finally { journal.close(); RenderAudit.flush(); super.channelInactive(ctx); }
            }
        });
        System.out.println("StackAnvil native client recorder ready");
    }
}
