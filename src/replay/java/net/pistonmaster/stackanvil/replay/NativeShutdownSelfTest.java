package net.pistonmaster.stackanvil.replay;

import tel.schich.libdatachannel.DataChannel;
import tel.schich.libdatachannel.GatheringState;
import tel.schich.libdatachannel.PeerConnection;
import tel.schich.libdatachannel.PeerConnectionConfiguration;
import tel.schich.libdatachannel.SessionDescriptionType;

import java.net.InetAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Comparator;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Real native callbacks must not prevent the owning JVM from exiting. */
public final class NativeShutdownSelfTest {
    // Retain both endpoints so GC cannot replace JVM teardown with ordinary cleanup.
    private static PeerConnection offerer, answerer;
    private static DataChannel outgoing, incoming;

    public static void main(String[] args) throws Exception {
        if (args.length == 1 && args[0].equals("child")) {
            exitDuringCallback();
            return;
        }
        Path directory = Files.createTempDirectory("stackanvil-native-shutdown-");
        PrivateFiles.protectDirectory(directory);
        Path log = directory.resolve("child.log");
        try {
            PrivateFiles.write(log, new byte[0]);
            String java = ProcessHandle.current().info().command().orElseThrow();
            Process child = new ProcessBuilder(java, "-Xcheck:jni", "-Djava.awt.headless=true",
                    "-XX:-CreateCoredumpOnCrash", "-XX:ErrorFile=" + directory.resolve("hs_err_pid%p.log"),
                    "-cp", System.getProperty("java.class.path"), NativeShutdownSelfTest.class.getName(), "child")
                    .redirectErrorStream(true).redirectOutput(log.toFile()).start();
            boolean exited;
            try {
                exited = child.waitFor(25, TimeUnit.SECONDS);
            } finally {
                if (child.isAlive()) child.destroyForcibly();
                if (!child.waitFor(5, TimeUnit.SECONDS)) throw new AssertionError("Native test process did not terminate");
            }
            String output = Files.readString(log);
            require(exited, "Native JVM exit stalled with an active callback.\n" + output);
            require(child.exitValue() == 0, "Native exit fixture failed.\n" + output);
            require(output.contains("Exiting with an active native callback"), "No callback overlap was established.\n" + output);
            System.out.println("PASS native JVM exit while a loopback data-channel callback is active");
        } finally {
            try (var paths = Files.walk(directory)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }

    private static void exitDuringCallback() throws Exception {
        var configuration = PeerConnectionConfiguration.DEFAULT.withIceServers(List.of())
                .withBindAddress(InetAddress.getByName("127.0.0.1")).withDisableAutoNegotiation(true);
        offerer = PeerConnection.createPeer(configuration);
        answerer = PeerConnection.createPeer(configuration);
        var offerGathered = new CountDownLatch(1);
        var answerGathered = new CountDownLatch(1);
        var entered = new CountDownLatch(1);
        var returned = new CountDownLatch(1);
        offerer.onGatheringStateChange.register((peer, state) -> {
            if (state == GatheringState.RTC_GATHERING_COMPLETE) offerGathered.countDown();
        });
        answerer.onGatheringStateChange.register((peer, state) -> {
            if (state == GatheringState.RTC_GATHERING_COMPLETE) answerGathered.countDown();
        });
        answerer.onDataChannel.register((peer, channel) -> incoming = channel);
        outgoing = offerer.createDataChannel("stackanvil-exit-probe");
        outgoing.onOpen.register(channel -> {
            entered.countDown();
            try { new CountDownLatch(1).await(10, TimeUnit.SECONDS); }
            catch (InterruptedException error) { Thread.currentThread().interrupt(); }
            finally { returned.countDown(); }
        });
        offerer.setLocalDescription("offer");
        require(offerGathered.await(5, TimeUnit.SECONDS), "Offer gathering timed out");
        answerer.setRemoteDescription(offerer.localDescription(), SessionDescriptionType.OFFER);
        answerer.setLocalDescription("answer");
        require(answerGathered.await(5, TimeUnit.SECONDS), "Answer gathering timed out");
        offerer.setRemoteDescription(answerer.localDescription(), SessionDescriptionType.ANSWER);
        require(entered.await(5, TimeUnit.SECONDS), "Native channel did not open");
        require(returned.getCount() == 1, "Native callback returned before the exit control");
        System.out.println("Exiting with an active native callback");
        System.out.flush();
        System.exit(0);
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
