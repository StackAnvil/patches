package com.viaversion.viafabricplus.bedrock.screen.ui;

/** The current renderer retains geometry on the screen and form identity on its controller. */
public final class NativeUiSceneScreen {
    private final Object controller;
    private final Object root;
    private final double pointerX = 12, pointerY = 24;
    public NativeUiSceneScreen(Object controller, Object root) { this.controller = controller; this.root = root; }
}
