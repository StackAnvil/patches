package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.MovementAudit;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "net.minecraft.client.player.LocalPlayer", remap = false)
public abstract class MixinMovementAudit {
    @Inject(method = "aiStep", at = @At("HEAD"))
    private void beforeStep(CallbackInfo callback) {
        MovementAudit.sample(this, "ai-step");
    }

    @Inject(method = "applyInput", at = @At("HEAD"))
    private void beforeInput(CallbackInfo callback) {
        MovementAudit.sample(this, "input");
    }

    @Inject(method = "sendChanges", at = @At("HEAD"))
    private void completed(CallbackInfo callback) {
        MovementAudit.sample(this, "completed");
    }
}
