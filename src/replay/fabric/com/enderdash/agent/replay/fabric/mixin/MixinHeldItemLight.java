package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.HeldItemLightAudit;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Coerce;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "net.minecraft.client.renderer.item.ItemStackRenderState$LayerRenderState", remap = false)
public abstract class MixinHeldItemLight {
    @Inject(method = "submit", at = @At(value = "INVOKE", target = "Lnet/minecraft/client/renderer/SubmitNodeCollector;submitItem(Lcom/mojang/blaze3d/vertex/PoseStack;Lnet/minecraft/world/item/ItemDisplayContext;III[ILnet/minecraft/client/resources/model/geometry/ItemQuads;Lnet/minecraft/client/renderer/item/ItemStackRenderState$FoilType;)V"))
    private void submitted(@Coerce Object poses, @Coerce Object nodes, int packedLight, int overlay, int outline, CallbackInfo callback) {
        HeldItemLightAudit.submitted(this, poses, packedLight, overlay, outline);
    }
}
