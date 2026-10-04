package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.RenderAudit;
import net.raphimc.viabedrock.api.model.NativeCustomEntityMessage;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** Observes the immutable model payload after the current client store applies it. */
@Pseudo
@Mixin(targets = "com.viaversion.viafabricplus.bedrock.render.CustomEntityRenderStore", remap = false)
public abstract class MixinRenderStore {
    @Inject(method = "apply", at = @At("RETURN"), require = 1)
    private static void applied(final NativeCustomEntityMessage message, final CallbackInfo callback) {
        if (message instanceof NativeCustomEntityMessage.Snapshot snapshot) {
            RenderAudit.models(snapshot.identifier(), snapshot.scale(), snapshot.models());
        }
    }
}
