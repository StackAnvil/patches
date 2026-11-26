package net.pistonmaster.stackanvil.foundry.mixin;

import com.viaversion.viafabricplus.screen.base.VFPPopup;
import com.viaversion.viafabricplus.screen.impl.serverlist.ServerListsScreen;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.navigation.ScreenRectangle;
import net.minecraft.network.chat.Component;
import net.pistonmaster.stackanvil.foundry.FoundryScreen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** Adds Bedrock Foundry below the Bedrock add-on's Realms, Friends, LAN, and Featured server lists. */
@Mixin(value = ServerListsScreen.class, remap = false)
public abstract class MixinServerListsScreen extends VFPPopup {

    /** ViaFabricPlus' two lists and the Bedrock add-on's four lists come first. */
    private static final int ROWS_ABOVE = 6;
    private static final int BUTTON_MARGIN = 3;

    protected MixinServerListsScreen(final Component title, final int bodyWidth, final int bodyHeight) {
        super(title, bodyWidth, bodyHeight);
    }

    @Inject(method = "initBody", at = @At("TAIL"))
    private void stackanvilFoundry$addFoundryButton(final ScreenRectangle body, final CallbackInfo ci) {
        final int x = body.left() + (body.width() - Button.BIG_WIDTH) / 2;
        final int y = body.top() + BUTTON_MARGIN + ROWS_ABOVE * (Button.DEFAULT_HEIGHT + BUTTON_MARGIN);
        this.addRenderableWidget(Button.builder(Component.translatable("stackanvil_foundry.title"),
                        _ -> this.minecraft.gui.setScreen(new FoundryScreen(this.prevScreen)))
                .bounds(x, y, Button.BIG_WIDTH, Button.DEFAULT_HEIGHT)
                .build());
    }

}
