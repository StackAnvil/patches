package com.enderdash.agent.replay.fabric.mixin;

import com.enderdash.agent.replay.fabric.ReplayClientControl;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(targets = "net.minecraft.client.Minecraft", remap = false)
public abstract class MixinClientShutdown {
    @Unique private ReplayClientControl stackanvil$control;

    @Shadow public abstract void stop();

    @Inject(method = "runTick(Z)V", at = @At("TAIL"))
    private void stackanvil$pollShutdown(boolean render, CallbackInfo callback) throws IOException {
        if (this.stackanvil$control == null) {
            Path directory = Path.of(Files.readString(Path.of("stackanvil-replay-directory.txt")).trim());
            this.stackanvil$control = new ReplayClientControl(directory);
        }
        this.stackanvil$control.poll(this::stop);
    }
}
