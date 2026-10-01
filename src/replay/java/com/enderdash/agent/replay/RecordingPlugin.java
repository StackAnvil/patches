package com.enderdash.agent.replay;

import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import net.lenni0451.lambdaevents.EventHandler;
import net.raphimc.viabedrock.api.resourcepack.ResourcePack;
import net.raphimc.viabedrock.netty.PacketCodec;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import net.raphimc.viabedrock.protocol.storage.ResourcePackStorage;
import net.raphimc.viaproxy.ViaProxy;
import net.raphimc.viaproxy.plugins.ViaProxyPlugin;
import net.raphimc.viaproxy.plugins.events.Proxy2ServerChannelInitializeEvent;
import net.raphimc.viaproxy.plugins.events.types.ITyped;
import net.raphimc.viaproxy.proxy.session.ProxyConnection;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public final class RecordingPlugin extends ViaProxyPlugin {
    private final AtomicBoolean used = new AtomicBoolean();

    @Override public void onEnable() { ViaProxy.EVENT_MANAGER.register(this); }

    @EventHandler
    public void channel(Proxy2ServerChannelInitializeEvent event) throws IOException {
        if (event.getType() != ITyped.Type.POST || event.getChannel().pipeline().get(PacketCodec.NAME) == null) return;
        // A bounded capture represents one connection, never a silent automatic reconnect.
        if (!used.compareAndSet(false, true)) { event.setCancelled(true); return; }
        Path directory = Path.of(System.getProperty("stackanvil.recording"));
        PacketJournal journal = new PacketJournal(directory.resolve("packets.sbr"), ProtocolConstants.BEDROCK_PROTOCOL_VERSION);
        ProxyConnection connection = ProxyConnection.fromChannel(event.getChannel());
        event.getChannel().pipeline().addAfter(PacketCodec.NAME, "stackanvil-recording", new ChannelDuplexHandler() {
            private boolean packsSaved;
            private ScheduledFuture<?> packExport;
            @Override public void handlerAdded(ChannelHandlerContext ctx) {
                packExport = ctx.executor().scheduleAtFixedRate(() -> {
                    try { savePacks(); if (packsSaved) packExport.cancel(false); }
                    catch (IOException error) { ctx.fireExceptionCaught(error); ctx.close(); }
                }, 200, 200, TimeUnit.MILLISECONDS);
            }
            private void savePacks() throws IOException {
                ResourcePackStorage storage = connection.getUserConnection().get(ResourcePackStorage.class);
                if (packsSaved || storage == null) return;
                Path packs = directory.resolve("packs");
                Files.createDirectory(packs, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rwx------")));
                for (ResourcePack pack : storage.getPackStackTopToBottom()) {
                    if (!storage.isServerPack(pack)) continue;
                    Path file = packs.resolve(pack.key() + ".mcpack");
                    Files.write(file, pack.content().toZip(), StandardOpenOption.CREATE_NEW);
                    Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rw-------"));
                }
                packsSaved = true;
            }
            private void record(boolean clientbound, Object message) throws IOException {
                if (message instanceof ByteBuf buffer) {
                    byte[] payload = new byte[buffer.readableBytes()];
                    buffer.getBytes(buffer.readerIndex(), payload);
                    journal.append(clientbound, payload);
                }
                savePacks();
            }
            @Override public void channelRead(ChannelHandlerContext ctx, Object message) throws Exception {
                try { record(true, message); }
                catch (Exception error) { io.netty.util.ReferenceCountUtil.release(message); ctx.close(); throw error; }
                super.channelRead(ctx, message);
                savePacks();
            }
            @Override public void write(ChannelHandlerContext ctx, Object message, ChannelPromise promise) throws Exception {
                try { record(false, message); }
                catch (Exception error) { io.netty.util.ReferenceCountUtil.release(message); promise.setFailure(error); ctx.close(); throw error; }
                super.write(ctx, message, promise);
            }
            @Override public void channelInactive(ChannelHandlerContext ctx) throws Exception {
                packExport.cancel(false);
                try { savePacks(); }
                finally { journal.close(); super.channelInactive(ctx); }
            }
        });
        System.out.println("StackAnvil packet recorder ready");
    }
}
