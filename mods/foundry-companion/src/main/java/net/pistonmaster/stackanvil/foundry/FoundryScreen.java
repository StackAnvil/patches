package net.pistonmaster.stackanvil.foundry;

import com.viaversion.viafabricplus.injection.access.core.IServerData;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.components.EditBox;
import net.minecraft.client.gui.components.MultiLineTextWidget;
import net.minecraft.client.gui.components.ScrollableLayout;
import net.minecraft.client.gui.components.Tooltip;
import net.minecraft.client.gui.layouts.HeaderAndFooterLayout;
import net.minecraft.client.gui.layouts.LinearLayout;
import net.minecraft.client.gui.screens.ConfirmLinkScreen;
import net.minecraft.client.gui.screens.ConnectScreen;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.multiplayer.ServerData;
import net.minecraft.client.multiplayer.resolver.ServerAddress;
import net.minecraft.network.chat.Component;
import net.raphimc.viabedrock.api.BedrockProtocolVersion;

/** Lists Bedrock Foundry servers, starts one, and joins it once BDS accepts players. */
public final class FoundryScreen extends Screen {

    private static final int ROW_WIDTH = 300;
    private static final int STOP_WIDTH = 60;

    private final Screen parent;
    private HeaderAndFooterLayout layout;
    private ScrollableLayout scroll;
    private Optional<FoundryCli> cli = Optional.empty();
    private List<FoundryServer> servers;
    private Component status = Component.empty();
    private boolean loading;
    private boolean joinWhenReady;
    private HostedServer.State shownState;
    private String shownLog;

    public FoundryScreen(final Screen parent) {
        super(Component.translatable("stackanvil_foundry.title"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        if (this.servers == null && !this.loading) {
            this.startRefresh();
        }
        // rebuildWidgets() calls init() again, so each pass starts from an empty layout.
        this.layout = new HeaderAndFooterLayout(this);
        this.layout.addTitleHeader(this.title, this.font);
        final LinearLayout content = LinearLayout.vertical().spacing(4);
        content.defaultCellSetting().alignHorizontallyCenter();
        content.addChild(new MultiLineTextWidget(this.status, this.font).setMaxWidth(ROW_WIDTH).setCentered(true));
        if (this.cli.isEmpty() && !this.loading) {
            this.addSetup(content);
        } else if (this.servers != null) {
            for (final FoundryServer server : this.servers) {
                content.addChild(this.row(server));
            }
        }
        this.scroll = this.layout.addToContents(new ScrollableLayout(this.minecraft, content, this.layout.getContentHeight()));
        // Foundry locks its data directory while it runs a server, so its other commands wait until the server stops.
        final boolean hosting = hostingActive();
        final LinearLayout footer = this.layout.addToFooter(LinearLayout.horizontal().spacing(8));
        final Button refresh = footer.addChild(Button.builder(Component.translatable("stackanvil_foundry.refresh"), _ -> this.refresh()).width(98).build());
        refresh.active = !this.loading && !hosting;
        final Button desktop = footer.addChild(Button.builder(Component.translatable("stackanvil_foundry.open_desktop"), _ -> this.openDesktop()).width(98).build());
        desktop.active = this.cli.isPresent() && !hosting;
        desktop.setTooltip(Tooltip.create(Component.translatable("stackanvil_foundry.open_desktop.tooltip")));
        if (hosting) {
            refresh.setTooltip(Tooltip.create(Component.translatable("stackanvil_foundry.busy")));
            desktop.setTooltip(Tooltip.create(Component.translatable("stackanvil_foundry.busy")));
        }
        footer.addChild(Button.builder(Component.translatable("gui.done"), _ -> this.onClose()).width(98).build());
        this.layout.visitWidgets(this::addRenderableWidget);
        this.repositionElements();
    }

    @Override
    protected void repositionElements() {
        if (this.layout == null) {
            return;
        }
        this.layout.arrangeElements();
        if (this.scroll != null) {
            this.scroll.setMaxHeight(this.layout.getContentHeight());
            this.layout.arrangeElements();
        }
    }

    @Override
    public void tick() {
        final HostedServer hosted = FoundryCompanion.hosted();
        if (hosted == null) {
            return;
        }
        final HostedServer.State state = hosted.state();
        if (state == HostedServer.State.READY && this.joinWhenReady) {
            this.joinWhenReady = false;
            this.join(hosted);
            return;
        }
        if (state != this.shownState || (state == HostedServer.State.STARTING && !hosted.lastLog().equals(this.shownLog))) {
            this.shownState = state;
            this.shownLog = hosted.lastLog();
            this.status = this.describe(hosted);
            if (state == HostedServer.State.STOPPED || state == HostedServer.State.FAILED) {
                this.joinWhenReady = false;
                // Foundry released its data directory, so the list can show changes made in the meantime.
                this.startRefresh();
            }
            this.rebuildWidgets();
        }
    }

    @Override
    public void onClose() {
        this.minecraft.gui.setScreen(this.parent);
    }

    private LinearLayout row(final FoundryServer server) {
        final LinearLayout row = LinearLayout.horizontal().spacing(4);
        final HostedServer hosted = FoundryCompanion.hosted();
        final boolean thisActive = hosted != null && hosted.active() && hosted.server().id().equals(server.id());
        final boolean otherActive = hosted != null && hosted.active() && !thisActive;
        final Component label = Component.translatable("stackanvil_foundry.server", server.name(),
                server.installed() ? server.version() : Component.translatable("stackanvil_foundry.not_installed"),
                server.addons().size());
        final Button play = row.addChild(Button.builder(label, _ -> this.play(server)).width(ROW_WIDTH - STOP_WIDTH - 4).build());
        if (!server.addons().isEmpty()) {
            play.setTooltip(Tooltip.create(Component.literal(String.join("\n", server.addons()))));
        }
        if (!server.installed()) {
            play.active = false;
            play.setTooltip(Tooltip.create(Component.translatable("stackanvil_foundry.install_first")));
        } else if (otherActive) {
            play.active = false;
            play.setTooltip(Tooltip.create(Component.translatable("stackanvil_foundry.stop_other_first", hosted.server().name())));
        } else if (thisActive && hosted.state() == HostedServer.State.STOPPING) {
            play.active = false;
        }
        final Button stop = row.addChild(Button.builder(Component.translatable("stackanvil_foundry.stop"), _ -> this.stop()).width(STOP_WIDTH).build());
        stop.active = thisActive && hosted.state() != HostedServer.State.STOPPING;
        return row;
    }

    private void addSetup(final LinearLayout content) {
        final EditBox path = content.addChild(new EditBox(this.font, ROW_WIDTH, 20, Component.translatable("stackanvil_foundry.path")));
        path.setMaxLength(4096);
        path.setHint(Component.translatable("stackanvil_foundry.path.hint"));
        final String configured = FoundryCompanion.configuredExecutable();
        if (configured != null) {
            path.setValue(configured);
        }
        final LinearLayout actions = content.addChild(LinearLayout.horizontal().spacing(4));
        actions.addChild(Button.builder(Component.translatable("stackanvil_foundry.path.save"), _ -> this.saveExecutable(path.getValue())).width(148).build());
        actions.addChild(Button.builder(Component.translatable("stackanvil_foundry.download"),
                ConfirmLinkScreen.confirmLink(this, URI.create(FoundryCompanion.DOWNLOAD_URL))).width(148).build());
    }

    private void refresh() {
        this.startRefresh();
        this.rebuildWidgets();
    }

    /** Starts loading the server list. The caller rebuilds the widgets to show the loading state. */
    private void startRefresh() {
        this.loading = true;
        this.cli = FoundryCompanion.cli();
        if (this.cli.isEmpty()) {
            this.loading = false;
            this.servers = List.of();
            this.status = Component.translatable(FoundryCompanion.configuredExecutable() == null
                    ? "stackanvil_foundry.missing" : "stackanvil_foundry.missing_configured");
            return;
        }
        final HostedServer hosted = FoundryCompanion.hosted();
        if (hosted != null && hosted.active()) {
            this.loading = false;
            this.servers = FoundryCompanion.knownServers();
            this.status = this.describe(hosted);
            return;
        }
        this.status = Component.translatable("stackanvil_foundry.loading");
        final FoundryCli foundry = this.cli.get();
        CompletableFuture.supplyAsync(() -> {
            try {
                return foundry.servers();
            } catch (final IOException e) {
                throw new IllegalStateException(e.getMessage(), e);
            }
        }).whenComplete((servers, error) -> this.minecraft.execute(() -> {
            this.loading = false;
            if (error != null) {
                this.servers = List.of();
                this.status = Component.translatable("stackanvil_foundry.list_failed", rootMessage(error));
            } else {
                this.servers = servers;
                FoundryCompanion.rememberServers(servers);
                this.status = servers.isEmpty() ? Component.translatable("stackanvil_foundry.empty") : this.idleStatus();
            }
            this.rebuildIfOpen();
        }));
    }

    private void play(final FoundryServer server) {
        final HostedServer hosted = FoundryCompanion.hosted();
        if (hosted != null && hosted.active() && hosted.server().id().equals(server.id())) {
            if (hosted.state() == HostedServer.State.READY) {
                this.join(hosted);
            } else {
                this.joinWhenReady = true;
            }
            return;
        }
        try {
            final HostedServer started = this.cli.orElseThrow().run(server);
            FoundryCompanion.host(started);
            this.joinWhenReady = true;
            this.shownState = null;
            this.status = this.describe(started);
        } catch (final IOException e) {
            this.status = Component.translatable("stackanvil_foundry.start_failed", e.getMessage());
        }
        this.rebuildWidgets();
    }

    private void stop() {
        final HostedServer hosted = FoundryCompanion.hosted();
        if (hosted != null) {
            this.joinWhenReady = false;
            hosted.stop();
            this.status = this.describe(hosted);
            this.rebuildWidgets();
        }
    }

    private void join(final HostedServer hosted) {
        final String address = hosted.address();
        final ServerData entry = new ServerData(hosted.server().name(), address, ServerData.Type.OTHER);
        ((IServerData) entry).viaFabricPlus$forceVersion(BedrockProtocolVersion.BEDROCK_LATEST);
        ConnectScreen.startConnecting(this, this.minecraft, ServerAddress.parseString(address), entry, false, null);
    }

    private void openDesktop() {
        try {
            this.cli.orElseThrow().openDesktop();
        } catch (final IOException e) {
            this.status = Component.translatable("stackanvil_foundry.start_failed", e.getMessage());
            this.rebuildWidgets();
        }
    }

    private void saveExecutable(final String value) {
        try {
            FoundryCompanion.configureExecutable(value);
        } catch (final IOException e) {
            this.status = Component.translatable("stackanvil_foundry.start_failed", e.getMessage());
            this.rebuildWidgets();
            return;
        }
        this.servers = null;
        this.refresh();
    }

    private Component describe(final HostedServer hosted) {
        final String name = hosted.server().name();
        return switch (hosted.state()) {
            case STARTING -> Component.translatable("stackanvil_foundry.starting", name, hosted.lastLog());
            case READY -> Component.translatable("stackanvil_foundry.running", name, hosted.address());
            case STOPPING -> Component.translatable("stackanvil_foundry.stopping", name);
            case STOPPED -> Component.translatable("stackanvil_foundry.stopped", name);
            case FAILED -> Component.translatable("stackanvil_foundry.failed", name, hosted.failure());
        };
    }

    private Component idleStatus() {
        final HostedServer hosted = FoundryCompanion.hosted();
        return hosted != null ? this.describe(hosted) : Component.translatable("stackanvil_foundry.choose");
    }

    private static boolean hostingActive() {
        final HostedServer hosted = FoundryCompanion.hosted();
        return hosted != null && hosted.active();
    }

    private void rebuildIfOpen() {
        if (this.minecraft != null && this.minecraft.gui.screen() == this) {
            this.rebuildWidgets();
        }
    }

    private static String rootMessage(final Throwable error) {
        Throwable cause = error;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getMessage() == null ? cause.toString() : cause.getMessage();
    }

}
