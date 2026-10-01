package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.ReplayCamera;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "net.minecraft.client.Minecraft", remap = false)
public abstract class MixinReplayCamera {
    @Inject(method = "tick", at = @At("TAIL"))
    private void thirdPersonScene(CallbackInfo callback) { ReplayCamera.tick(this); }
}
