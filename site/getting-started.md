---
layout: default
title: Play on Bedrock
nav_order: 2
description: Import the StackAnvil client in PrismLauncher and join a Bedrock server from Minecraft Java Edition.
---

# Play on Bedrock from Java Edition

This guide uses the prepared StackAnvil game setup. You need a Minecraft Java Edition account and [Prism Launcher](https://prismlauncher.org/download/). No coding or manual mod installation is needed.

## Install the client

1. Open the [latest StackAnvil release on GitHub](https://github.com/StackAnvil/patches/releases/latest).
2. Under **Assets**, download the ZIP whose name ends in `Prism-Launcher_Config.zip`. Keep it as a ZIP file.
3. In Prism Launcher, select **Add Instance**, then **Import**. Choose the ZIP you downloaded and confirm the import. Prism Launcher's [ZIP import guide](https://prismlauncher.org/wiki/help-pages/zip-import/) shows this screen.
4. Launch the new **StackAnvil** instance. Prism Launcher downloads Minecraft and Fabric Loader and asks you to sign in with your Java Edition account if needed.

The instance includes the tested ViaFabricPlus build and the StackAnvil Bedrock add-on. You do not need to add any other JARs to play.

## Join a Bedrock server

1. Open **Multiplayer**, then the **ViaFabricPlus** menu. In **Bedrock** settings, select **Account for Bedrock Edition** and sign in. The sign-in opens in your browser.
2. Return to **Multiplayer** and select **Add Server**. Enter the Bedrock server's address. If the server gives you a port, add it after a colon, like `play.example.com:19132`.
3. On the server screen, use the **ViaFabricPlus** button to choose the Bedrock version for that server.
4. Save the server and join it.

## Join Friends, Realms, or LAN worlds

From **Multiplayer**, open the **ViaFabricPlus** menu. Choose **Bedrock Friends**, **Bedrock Realms**, or **LAN Worlds**. Friends and Realms need Bedrock sign-in. LAN worlds can also offer an offline login option.

## If something does not work

- **No Bedrock menu:** Make sure you launched the imported StackAnvil instance. Its mod list must contain ViaFabricPlus and the Bedrock add-on.
- **A server will not connect:** Make sure its ViaFabricPlus version is set to Bedrock. Check that the address and port came from that Bedrock server.
- **Sign-in or Realms fails:** Open Bedrock settings in ViaFabricPlus and sign in again. A Realm can also reject a Bedrock game version it does not support.

Ask for help in [StackAnvil Discord](https://discord.gg/F4ZyEtXXge), or [report a reproducible problem](https://github.com/StackAnvil/patches/issues). Include the release version, what you tried, and the error message. Remove account details from logs before sharing them.

If you prefer to install the mods manually, see [Downloads]({{ '/releases/' | relative_url }}). To compile the stack, use [Build from source]({{ '/build-from-source/' | relative_url }}).
