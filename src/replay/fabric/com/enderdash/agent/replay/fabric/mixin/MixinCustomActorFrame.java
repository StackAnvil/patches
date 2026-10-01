package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.RenderAudit;
import java.util.List;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Coerce;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/** Audit native geometry resolution and actual model submission, independently of protocol state. */
@Mixin(targets = "com.viaversion.viafabricplus.bedrock.render.BedrockEntityRenderer", remap = false)
public abstract class MixinCustomActorFrame {
    @Inject(method = "resolveModels", at = @At("RETURN"))
    private void resolved(@Coerce Object data, @Coerce Object packs, CallbackInfoReturnable<List<?>> callback) {
        RenderAudit.nativeActorModels(callback.getReturnValue().size());
    }

    @Inject(method = "submit(Lnet/minecraft/client/renderer/entity/state/EntityRenderState;Lcom/mojang/blaze3d/vertex/PoseStack;Lnet/minecraft/client/renderer/SubmitNodeCollector;Lnet/minecraft/client/renderer/state/level/CameraRenderState;)V", at = @At("TAIL"))
    private void submitted(@Coerce Object state, @Coerce Object poses, @Coerce Object nodes, @Coerce Object camera, CallbackInfo callback) {
        // The renderer may submit an intentionally empty actor. Only actual models count as a frame.
        if (!state.getClass().getName().equals("com.viaversion.viafabricplus.bedrock.render.BedrockEntityRenderer$State")) return;
        try {
            var models = state.getClass().getDeclaredField("models");
            models.setAccessible(true);
            if (!((List<?>) models.get(state)).isEmpty()) RenderAudit.nativeActorFrame();
        } catch (ReflectiveOperationException error) {
            throw new IllegalStateException("Could not audit native custom actor submission", error);
        }
    }
}
