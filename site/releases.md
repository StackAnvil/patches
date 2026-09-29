---
layout: default
title: Downloads
nav_order: 3
description: Choose the StackAnvil client ZIP or individual JARs from a matching release.
---

# Download StackAnvil

Start with the [latest StackAnvil release on GitHub](https://github.com/StackAnvil/patches/releases/latest). Open **Assets** to see the files. Keep files from the same release together because the client and add-on are tested as a pair.

## I want to play from Java Edition

Download the ZIP whose name ends in `Prism-Launcher_Config.zip`. Import it into [Prism Launcher](https://prismlauncher.org/download/) as an instance. It already contains ViaFabricPlus and the StackAnvil Bedrock add-on. Follow the [player guide]({{ '/getting-started/' | relative_url }}) for the full steps.

## I already have a Fabric client

From the **same release**, install the `ViaFabricPlus-...jar` and `viafabricplus-bedrock-...-StackAnvil.jar` files in your client's mods folder. Match the Minecraft version shown on the release. Keep only one ViaFabricPlus JAR in that folder.

The add-on already contains its patched ViaBedrock and CubeConverter libraries. Do not install those library JARs as separate Fabric mods. [Modrinth](https://modrinth.com/mod/stackanvil-bedrock-addon) and [CurseForge](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus) also list the add-on, but new files there can still be under review. The matching GitHub release has the tested pair.

## I run a server or build against the patches

- **ViaProxy:** Download its StackAnvil JAR to test the patched proxy. It embeds the patched ViaBedrock build.
- **ViaBedrock and CubeConverter:** Download their JARs if you need those libraries for a project. They are not standalone Fabric mods.
- **Maven dependencies:** Use the [StackAnvil Maven repository](https://github.com/StackAnvil/maven) for patched artifacts. Get ViaFabricPlus from [upstream Maven](https://repo.viaversion.com/com/viaversion/viafabricplus/).

StackAnvil builds include experimental changes that may still be under upstream review. Test them before relying on them for a long play session or a production server. StackAnvil is independent of ViaVersion.

To make your own build, see [Build from source]({{ '/build-from-source/' | relative_url }}).
