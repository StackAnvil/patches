package com.enderdash.agent.replay;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.util.*;

/** Creates capture artifacts with owner access before writing sensitive contents. */
public final class PrivateFiles {
    private PrivateFiles() { }

    public static Path createDirectory(Path directory) throws IOException {
        Files.createDirectory(directory, attribute(directory, true));
        try { protect(directory, true); }
        catch (IOException | RuntimeException error) { Files.deleteIfExists(directory); throw error; }
        return directory;
    }

    public static void protectDirectory(Path directory) throws IOException { protect(directory, true); }

    public static OutputStream newOutputStream(Path file) throws IOException {
        createFile(file);
        return Files.newOutputStream(file, StandardOpenOption.WRITE, LinkOption.NOFOLLOW_LINKS);
    }

    public static void write(Path file, byte[] content) throws IOException {
        prepare(file);
        Files.write(file, content, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING, LinkOption.NOFOLLOW_LINKS);
    }

    public static void append(Path file, byte[] content) throws IOException {
        prepare(file);
        Files.write(file, content, StandardOpenOption.WRITE, StandardOpenOption.APPEND, LinkOption.NOFOLLOW_LINKS);
    }

    private static void prepare(Path file) throws IOException {
        if (Files.exists(file, LinkOption.NOFOLLOW_LINKS)) protect(file, false);
        else createFile(file);
    }

    private static void createFile(Path file) throws IOException {
        protectDirectory(file.toAbsolutePath().getParent());
        Files.createFile(file, attribute(file, false));
        try { protect(file, false); }
        catch (IOException | RuntimeException error) { Files.deleteIfExists(file); throw error; }
    }

    private static FileAttribute<?> attribute(Path path, boolean directory) throws IOException {
        FileStore store = Files.getFileStore(path.toAbsolutePath().getParent());
        if (store.supportsFileAttributeView(PosixFileAttributeView.class))
            return PosixFilePermissions.asFileAttribute(permissions(directory));
        if (store.supportsFileAttributeView(AclFileAttributeView.class)) {
            List<AclEntry> acl = acl(path, directory);
            return new FileAttribute<List<AclEntry>>() {
                @Override public String name() { return "acl:acl"; }
                @Override public List<AclEntry> value() { return acl; }
            };
        }
        throw new IOException("Capture filesystem cannot enforce private permissions");
    }

    private static void protect(Path path, boolean directory) throws IOException {
        BasicFileAttributes attributes = Files.readAttributes(path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
        if (directory ? !attributes.isDirectory() : !attributes.isRegularFile())
            throw new IOException("Capture path must be a regular " + (directory ? "directory" : "file"));
        FileStore store = Files.getFileStore(path);
        if (store.supportsFileAttributeView(PosixFileAttributeView.class)) {
            Set<PosixFilePermission> permissions = permissions(directory);
            Files.setPosixFilePermissions(path, permissions);
            if (!Files.getPosixFilePermissions(path, LinkOption.NOFOLLOW_LINKS).equals(permissions))
                throw new IOException("Capture permissions were not applied");
        } else if (store.supportsFileAttributeView(AclFileAttributeView.class)) {
            AclFileAttributeView view = Files.getFileAttributeView(path, AclFileAttributeView.class, LinkOption.NOFOLLOW_LINKS);
            List<AclEntry> acl = acl(path, directory);
            view.setAcl(acl);
            if (!view.getAcl().equals(acl)) throw new IOException("Capture ACL was not applied");
        } else throw new IOException("Capture filesystem cannot enforce private permissions");
    }

    private static Set<PosixFilePermission> permissions(boolean directory) {
        return PosixFilePermissions.fromString(directory ? "rwx------" : "rw-------");
    }

    private static List<AclEntry> acl(Path path, boolean directory) throws IOException {
        UserPrincipal principal = path.getFileSystem().getUserPrincipalLookupService()
                .lookupPrincipalByName(System.getProperty("user.name"));
        if (principal instanceof GroupPrincipal) throw new IOException("Capture owner resolves to a group");
        AclEntry.Builder entry = AclEntry.newBuilder().setType(AclEntryType.ALLOW).setPrincipal(principal)
                .setPermissions(EnumSet.allOf(AclEntryPermission.class));
        if (directory) entry.setFlags(AclEntryFlag.FILE_INHERIT, AclEntryFlag.DIRECTORY_INHERIT);
        return List.of(entry.build());
    }
}
