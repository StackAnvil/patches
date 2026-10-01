package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.FabricRecorder;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageCodec;
import net.raphimc.viabedrock.netty.PacketCodec;
import org.spongepowered.asm.mixin.Mixin;

/** Installed only in the isolated replay instance, before protocol translation. */
@Mixin(value = PacketCodec.class, remap = false)
public abstract class MixinPacketCodec extends ByteToMessageCodec<ByteBuf> {
    @Override public void handlerAdded(ChannelHandlerContext context) throws Exception {
        super.handlerAdded(context);
        FabricRecorder.install(context);
    }
}
