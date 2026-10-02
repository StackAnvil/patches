package com.enderdash.agent.replay.fabric;

import java.lang.reflect.Field;

/** Accepts only Minecraft's server-pack prompt through its actual affirmative button. */
public final class ReplayResourcePacks {
    private static Object acceptedScreen;

    private ReplayResourcePacks() { }

    public static void tick(Object minecraft) {
        try {
            Object gui = minecraft.getClass().getField("gui").get(minecraft);
            Object screen = gui.getClass().getMethod("screen").invoke(gui);
            if (screen == null || screen == acceptedScreen || !screen.getClass().getName().equals(
                    "net.minecraft.client.multiplayer.ClientCommonPacketListenerImpl$PackConfirmScreen")) return;
            // Target 26.3 ConfirmScreen binds this button to callback.accept(true).
            Class<?> confirmation = Class.forName("net.minecraft.client.gui.screens.ConfirmScreen");
            Field affirmative = confirmation.getDeclaredField("yesButton");
            affirmative.setAccessible(true);
            Object button = affirmative.get(screen);
            if (button == null || !button.getClass().getField("active").getBoolean(button)
                    || !button.getClass().getField("visible").getBoolean(button)) return;
            Class<?> input = Class.forName("net.minecraft.client.input.InputWithModifiers");
            Class<?> key = Class.forName("net.minecraft.client.input.KeyEvent");
            Object enter = key.getConstructor(int.class, int.class, int.class).newInstance(257, 0, 0);
            button.getClass().getMethod("onPress", input).invoke(button, enter);
            acceptedScreen = screen;
            System.out.println("StackAnvil replay accepted the server pack through its confirmation button");
        } catch (ReflectiveOperationException error) {
            throw new IllegalStateException("Could not accept the replay's server-pack confirmation", error);
        }
    }
}
