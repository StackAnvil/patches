package net.pistonmaster.stackanvil.foundry;

import java.util.List;
import java.util.UUID;

/** One server instance from {@code bedrock-foundry server list --json}. */
public record FoundryServer(UUID id, String name, int port, String version, List<String> addons) {

    /** Foundry can start the server only after it has installed BDS in the instance. */
    public boolean installed() {
        return this.version != null;
    }

}
