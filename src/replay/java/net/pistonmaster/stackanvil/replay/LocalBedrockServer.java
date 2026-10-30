package net.pistonmaster.stackanvil.replay;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.Unpooled;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.socket.nio.NioDatagramChannel;
import net.raphimc.viabedrock.api.util.CryptUtil;
import net.raphimc.viabedrock.protocol.data.ProtocolConstants;
import org.cloudburstmc.netty.channel.nethernet.NetherNetChannelFactory;
import org.cloudburstmc.netty.channel.nethernet.config.NetherChannelOption;
import org.cloudburstmc.netty.channel.nethernet.signaling.NetherNetHTTPServerSignaling;
import org.cloudburstmc.netty.channel.nethernet.signaling.PongData;
import org.cloudburstmc.netty.channel.raknet.RakChannelFactory;
import org.cloudburstmc.netty.channel.raknet.config.RakChannelOption;
import org.cloudburstmc.netty.util.nethernet.OperatorIdentity;
import org.cloudburstmc.netty.util.nethernet.TokenTrust;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Transport setup for loopback recorders and replay servers. */
final class LocalBedrockServer {
    private LocalBedrockServer() {}

    static ServerBootstrap bootstrap(EventLoopGroup loops, int port, String name,
                                     boolean nativeClient, boolean offline) throws Exception {
        ServerBootstrap bootstrap = new ServerBootstrap().group(loops);
        if (nativeClient) {
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
            return bootstrap.channelFactory(NetherNetChannelFactory.server(signaling))
                    // The first local connection can wait for the native TOFU prompt.
                    .option(NetherChannelOption.NETHER_SERVER_RTC_HANDSHAKE_TIMEOUT_SECONDS, 120);
        }
        String motd = "MCPE;" + name + ";" + ProtocolConstants.BEDROCK_PROTOCOL_VERSION + ";"
                + ProtocolConstants.BEDROCK_VERSION_NAME + ";0;1;1;Replay;Survival;1;" + port + ";" + port + ";";
        return bootstrap.channelFactory(RakChannelFactory.server(NioDatagramChannel.class))
                .option(RakChannelOption.RAK_ADVERTISEMENT, Unpooled.copiedBuffer(motd, StandardCharsets.UTF_8))
                .option(RakChannelOption.RAK_SUPPORTED_PROTOCOLS, new int[]{ProtocolConstants.BEDROCK_RAKNET_PROTOCOL_VERSION})
                .option(RakChannelOption.RAK_MAX_CONNECTIONS, 1)
                .option(RakChannelOption.RAK_PACKET_LIMIT, 4096);
    }
}
