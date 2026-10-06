package com.enderdash.agent.replay;

import java.nio.file.*;
import java.nio.file.attribute.*;
import java.util.*;

/** Exercises native filesystem permission enforcement without account data. */
public final class PrivateFilesSelfTest {
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("stackanvil-private-test");
        try {
            Path directory = PrivateFiles.createDirectory(root.resolve("capture"));
            Path file = directory.resolve("packets.sbr");
            try (var journal = new PacketJournal(file, 2193)) {
                journal.append(false, new byte[]{1, 99});
                journal.append(true, new byte[]{11, 4, 5});
            }
            var entries = PacketJournal.read(file, 2193);
            require(entries.size() == 1 && Arrays.equals(entries.getFirst().payload(), new byte[]{11, 4, 5}));
            verify(directory, true);
            verify(file, false);
            byte[] original = Files.readAllBytes(file);
            try (var ignored = new PacketJournal(file, 2193)) { throw new AssertionError("Overwrote an existing journal"); }
            catch (FileAlreadyExistsException expected) { }
            require(Arrays.equals(original, Files.readAllBytes(file)));
            Path audit = directory.resolve("audit");
            PrivateFiles.write(audit, new byte[]{1, 2});
            PrivateFiles.append(audit, new byte[]{3});
            require(Arrays.equals(Files.readAllBytes(audit), new byte[]{1, 2, 3}));
            verify(audit, false);
            try { PrivateFiles.write(directory, new byte[]{1}); throw new AssertionError("Accepted a directory as a file"); }
            catch (java.io.IOException expected) { }
            Path archive = root.resolve("unsupported.zip");
            try (var zip = FileSystems.newFileSystem(java.net.URI.create("jar:" + archive.toUri()), Map.of("create", "true"))) {
                try { PrivateFiles.createDirectory(zip.getPath("/capture")); throw new AssertionError("Accepted unprotected filesystem"); }
                catch (java.io.IOException expected) { }
                require(!Files.exists(zip.getPath("/capture")));
            }
            if (Files.getFileStore(directory).supportsFileAttributeView(PosixFileAttributeView.class)) {
                Path link = directory.resolve("link");
                Files.createSymbolicLink(link, audit);
                try { PrivateFiles.write(link, new byte[]{4}); throw new AssertionError("Followed capture symlink"); }
                catch (java.io.IOException expected) { }
                require(Arrays.equals(Files.readAllBytes(audit), new byte[]{1, 2, 3}));
            }
            System.out.println("PASS native capture permissions, journal round trip, overwrite protection, and unsupported filesystem rejection");
        } finally {
            try (var paths = Files.walk(root)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }

    private static void verify(Path path, boolean directory) throws Exception {
        if (Files.getFileStore(path).supportsFileAttributeView(PosixFileAttributeView.class)) {
            require(Files.getPosixFilePermissions(path).equals(PosixFilePermissions.fromString(directory ? "rwx------" : "rw-------")));
        } else {
            var acl = Files.getFileAttributeView(path, AclFileAttributeView.class).getAcl();
            var user = path.getFileSystem().getUserPrincipalLookupService().lookupPrincipalByName(System.getProperty("user.name"));
            require(!acl.isEmpty() && acl.stream().allMatch(entry -> entry.type() == AclEntryType.ALLOW && entry.principal().equals(user)));
            require(acl.getFirst().permissions().contains(AclEntryPermission.READ_DATA));
        }
    }

    private static void require(boolean condition) { if (!condition) throw new AssertionError(); }
}
