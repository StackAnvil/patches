---
layout: default
title: Downloads
nav_order: 3
description: Get ViaProxy or the matching ViaFabricPlus and Bedrock add-on JARs from a StackAnvil release.
---

# Download StackAnvil

Open **Assets** on the [latest StackAnvil release on GitHub](https://github.com/StackAnvil/patches/releases/latest). Choose one of the two ways to play below. The [player guide]({{ '/getting-started/' | relative_url }}) has setup and connection steps.

## ViaProxy: use your regular Java client

Download `ViaProxy-...-StackAnvil.jar`. Run it as a separate app, enter the Bedrock server address and version, then join the address it shows from Minecraft Java Edition. You do not need client mods. This JAR includes the patched ViaBedrock build.

## ViaFabricPlus + Bedrock add-on: use a Fabric client

Download **both** `ViaFabricPlus-...jar` and `viafabricplus-bedrock-...-StackAnvil.jar` from the **same release**. Install Fabric Loader for the Minecraft version shown on that release and put both JARs in the client's `mods` folder. Keep only one ViaFabricPlus JAR there.

The add-on includes its patched ViaBedrock and CubeConverter libraries. Do not install those library JARs as separate Fabric mods. [Modrinth](https://modrinth.com/mod/stackanvil-bedrock-addon) and [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus) also list the add-on, but new files there can still be under review. The matching GitHub release has the tested pair.

## Optional: prepared Prism Launcher client

If you want a prepackaged Fabric client, download the ZIP ending in `Prism-Launcher_Config.zip` and import it into [Prism Launcher](https://prismlauncher.org/download/). It contains the tested ViaFabricPlus and Bedrock add-on pair. You still need your own Minecraft Java Edition account.

## Libraries and builds

- **ViaBedrock and CubeConverter:** Download their JARs if you need those libraries for a project. They are not standalone Fabric mods.
- **Maven dependencies:** Use the [StackAnvil Maven repository](https://stackanvil-maven.pistonmaster.net/) for patched artifacts. The [Maven and Javadocs guide]({{ '/libraries/' | relative_url }}) has a Gradle example, direct artifact links, and API references. Get ViaFabricPlus from [upstream Maven](https://repo.viaversion.com/com/viaversion/viafabricplus/).

StackAnvil builds include experimental changes that may still be under upstream review. Test them before relying on them for a long play session or a production server. StackAnvil is independent of ViaVersion.

To make your own build, see [Build from source]({{ '/build-from-source/' | relative_url }}).
