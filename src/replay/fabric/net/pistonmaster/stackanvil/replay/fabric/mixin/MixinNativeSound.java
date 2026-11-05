package net.pistonmaster.stackanvil.replay.fabric.mixin;

import net.pistonmaster.stackanvil.replay.fabric.NativeSoundAudit;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Coerce;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "com.viaversion.viafabricplus.bedrock.appearance.BedrockSoundPlayback", remap = false)
public abstract class MixinNativeSound {
    @Inject(method = "playLevel", at = @At("HEAD"), require = 0)
    private static void level(@Coerce Object resources, String event, @Coerce Object position, CallbackInfo callback) {
        NativeSoundAudit.level(event, position);
    }

    @Inject(method = "start", at = @At("TAIL"), require = 0)
    private static void started(@Coerce Object state, @Coerce Object handle, @Coerce Object channel,
                                @Coerce Object sound, @Coerce Object position, @Coerce Object engine,
                                @Coerce Object request, CallbackInfo callback) {
        NativeSoundAudit.started(sound, position);
    }
}
