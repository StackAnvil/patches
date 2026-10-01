package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.RenderAudit;
import net.raphimc.viabedrock.api.model.entity.CustomEntity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/** Invisible actors still need to reach controller evaluation. */
@Mixin(value = CustomEntity.class, remap = false)
public abstract class MixinCustomEntity {
    @Inject(method = "evaluateRenderControllerChange", at = @At("RETURN"))
    private void evaluated(CallbackInfoReturnable<Boolean> callback) {
        RenderAudit.actor(((CustomEntity) (Object) this).type());
    }
}
