package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.ReplayCamera;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Coerce;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "net.minecraft.client.renderer.entity.LivingEntityRenderer", remap = false)
public abstract class MixinPlayerFrame {
    @Inject(method = "submit(Lnet/minecraft/client/renderer/entity/state/LivingEntityRenderState;Lcom/mojang/blaze3d/vertex/PoseStack;Lnet/minecraft/client/renderer/SubmitNodeCollector;Lnet/minecraft/client/renderer/state/level/CameraRenderState;)V", at = @At("TAIL"))
    private void submitted(@Coerce Object state, @Coerce Object poses, @Coerce Object nodes, @Coerce Object camera, CallbackInfo callback) {
        ReplayCamera.submitted(this, state);
    }
}
