---
layout: default
title: Downloads
nav_order: 3
description: Download ViaProxy, the tested Fabric client modpack, or matching ViaFabricPlus and Bedrock add-on JARs.
---

# Download StackAnvil

Choose one of the two ways to play below. The [player guide]({{ '/getting-started/' | relative_url }}) has setup and connection steps.

**Bedrock add-on downloads:** [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus).

The [latest StackAnvil release on GitHub](https://github.com/StackAnvil/patches/releases/latest) has the JARs and client modpack under **Assets**.

## ViaProxy: use your regular Java client

Download `ViaProxy-...-StackAnvil.jar`. Run it as a separate app, enter the Bedrock server address and version, then join the address it shows from Minecraft Java Edition. You do not need client mods. This JAR includes the patched ViaBedrock build.

## ViaFabricPlus + Bedrock add-on: use a Fabric client

Get the add-on using the download links above. For the tested pair, download **both** `ViaFabricPlus-...jar` and `viafabricplus-bedrock-...-StackAnvil.jar` from the **same GitHub release**. Install Fabric Loader for the Minecraft version shown on that release and put both JARs in the client's `mods` folder. Keep only one ViaFabricPlus JAR there.

The add-on includes its patched ViaBedrock and CubeConverter libraries. Do not install those library JARs as separate Fabric mods. New files on mod platforms can remain under review after the GitHub release appears.

## Client modpack

Download `StackAnvil-26.3.mrpack` and import it into a launcher that supports Modrinth modpacks. Modrinth App, Prism Launcher, and ATLauncher support this format. The pack includes the exact ViaFabricPlus and Bedrock add-on JARs from the release. It also pins Minecraft 26.3 and Fabric Loader 0.19.5. Use your own Java Edition account.

## Libraries and builds

- **ViaBedrock and CubeConverter:** Download their JARs if you need those libraries for a project. They are not standalone Fabric mods.
- **Maven dependencies:** Use the [StackAnvil Maven repository](https://stackanvil-maven.pistonmaster.net/) for patched artifacts. The [Maven and Javadocs guide]({{ '/libraries/' | relative_url }}) has a Gradle example, direct artifact links, and API references. Get ViaFabricPlus from [upstream Maven](https://repo.viaversion.com/com/viaversion/viafabricplus/).

{: .warning }
StackAnvil builds include experimental changes that may still be under upstream review. Test them before relying on them for a long play session or a production server. StackAnvil is independent of ViaVersion.

To make your own build, see [Build from source]({{ '/build-from-source/' | relative_url }}).
