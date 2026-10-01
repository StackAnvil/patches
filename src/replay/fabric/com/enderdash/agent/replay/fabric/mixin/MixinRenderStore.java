package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.RenderAudit;
import java.util.List;
import java.util.UUID;
import net.raphimc.viabedrock.api.model.entity.CustomEntity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "com.viaversion.viafabricplus.bedrock.render.CustomEntityRenderStore", remap = false)
public abstract class MixinRenderStore {
    @Inject(method = "update", at = @At("TAIL"))
    private static void models(UUID uuid, String identifier, List<CustomEntity.EvaluatedModel> models, CallbackInfo callback) {
        RenderAudit.models(identifier, models);
    }
}
