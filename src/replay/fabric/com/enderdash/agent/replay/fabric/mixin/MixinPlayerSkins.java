package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.RenderAudit;
import java.util.UUID;
import net.raphimc.viabedrock.protocol.model.SkinData;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(targets = "com.viaversion.viafabricplus.bedrock.render.BedrockPlayerSkins", remap = false)
public abstract class MixinPlayerSkins {
    @Inject(method = "install", at = @At("RETURN"))
    private static void installed(UUID uuid, SkinData skin, CallbackInfoReturnable<?> result) {
        RenderAudit.skin(uuid, skin, result.getReturnValue() != null);
    }

    @Inject(method = "renderer(Ljava/util/UUID;)Lnet/minecraft/client/renderer/entity/player/AvatarRenderer;", at = @At("RETURN"))
    private static void selected(UUID uuid, CallbackInfoReturnable<?> result) {
        if (result.getReturnValue() != null) RenderAudit.playerRenderer();
    }
}
