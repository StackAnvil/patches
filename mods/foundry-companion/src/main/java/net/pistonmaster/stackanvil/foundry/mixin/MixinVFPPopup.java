package net.pistonmaster.stackanvil.foundry.mixin;

import com.llamalad7.mixinextras.injector.ModifyExpressionValue;
import com.viaversion.viafabricplus.screen.base.VFPPopup;
import com.viaversion.viafabricplus.screen.impl.serverlist.ServerListsScreen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;

@Mixin(value = VFPPopup.class, remap = false)
public abstract class MixinVFPPopup {

    /** Composes with the Bedrock add-on's own four extra rows. */
    @ModifyExpressionValue(method = "init", at = @At(value = "FIELD", target = "Lcom/viaversion/viafabricplus/screen/base/VFPPopup;bodyHeight:I"))
    private int stackanvilFoundry$makeRoomForFoundry(final int bodyHeight) {
        return (Object) this instanceof ServerListsScreen ? bodyHeight + 20 + 3 : bodyHeight;
    }

}
