package net.pistonmaster.stackanvil.replay;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.EventLoopGroup;
import net.raphimc.viabedrock.api.util.CryptUtil;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import org.cloudburstmc.netty.channel.nethernet.NetherNetChannelFactory;
import org.cloudburstmc.netty.channel.nethernet.config.NetherChannelOption;
import org.cloudburstmc.netty.channel.nethernet.signaling.NetherNetHTTPServerSignaling;
import org.cloudburstmc.netty.channel.nethernet.signaling.PongData;
import org.cloudburstmc.netty.util.nethernet.OperatorIdentity;
import org.cloudburstmc.netty.util.nethernet.TokenTrust;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.security.KeyPair;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Transport setup for local recorders and replay servers. */
final class LocalBedrockServer {
    private LocalBedrockServer() {}

    static ServerBootstrap bootstrap(EventLoopGroup loops, String name,
                                     boolean offline, InetAddress iceAddress) throws Exception {
        if (iceAddress != null && (iceAddress.isAnyLocalAddress() || iceAddress.isMulticastAddress()
                || NetworkInterface.getByInetAddress(iceAddress) == null)) {
            throw new IllegalArgumentException("Native ICE must use a specific address on this host");
        }
        ServerBootstrap bootstrap = new ServerBootstrap().group(loops);
        PongData pong = new PongData.Builder().setServerName(name)
                .setProtocol(ProtocolConstants.BEDROCK_PROTOCOL_VERSION)
                .setVersion(ProtocolConstants.BEDROCK_VERSION_NAME).setLevelName(name)
                .setMaxPlayerCount(1).setOnlineAuth(false).setSelfSignedAuth(true).build();
        KeyPair keys = CryptUtil.generateEcdsa384KeyPair();
        OperatorIdentity identity = new OperatorIdentity(keys.getPrivate(), keys.getPublic(),
                Instant.now().plus(1, ChronoUnit.DAYS), "stackanvil-local-recorder");
        var signaling = new NetherNetHTTPServerSignaling.Builder()
                .setIdentity(identity)
                .setRequiresTls(false).setAdvertisedAddresses(List.of("127.0.0.1"))
                // Offline replay cannot fetch or refresh an online identity.
                .setTokenTrust(offline ? TokenTrust.ANY : TokenTrust.MINECRAFT_AUTH)
                .setMotd(pong).build();
        bootstrap.channelFactory(NetherNetChannelFactory.server(signaling))
                // The first local connection can wait for the native TOFU prompt.
                .option(NetherChannelOption.NETHER_SERVER_RTC_HANDSHAKE_TIMEOUT_SECONDS, 120);
        if (iceAddress != null) bootstrap.option(NetherChannelOption.NETHER_SERVER_ICE_ADDRESS, new InetSocketAddress(iceAddress, 0));
        return bootstrap;
    }
}
