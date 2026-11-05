package com.viaversion.viafabricplus.bedrock.screen.container;

public final class BedrockNativeContainerScreen {
    private final NativePlayerPresentation presentation = new NativePlayerPresentation();
    private final Sources tooltipSources = new Sources();
    private final double pointerX = 12, pointerY = 24;

    public void tooltip(int mode, String collection, int index) {
        tooltipSources.mode = mode;
        tooltipSources.hover = new Source(collection, index);
        tooltipSources.bundle = mode == 0 ? new Source("", -1) : tooltipSources.hover;
    }

    public int mode() { return tooltipSources.mode; }

    private static final class Sources {
        private int mode;
        private boolean hidden;
        private Source hover = new Source("", -1), bundle = hover;
    }
    private record Source(String collection, int index) { }
}

final class NativePlayerPresentation {
    private final Message message = new Message(1, 8, 3);
    private long sequence = 2;
    private Object pending;
    private Object pendingBundle = new Object();
    private record Message(long opening, long generation, long revision) { }
}
