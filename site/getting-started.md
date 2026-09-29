---
layout: default
title: Play on Bedrock
nav_order: 2
description: Connect to Bedrock servers from Java Edition with ViaProxy or ViaFabricPlus and the Bedrock add-on.
---

# Play on Bedrock from Java Edition

You need a Minecraft Java Edition account. To join a server, have its Bedrock address ready. Choose the setup you want, then get its files from the [latest StackAnvil release](https://github.com/StackAnvil/patches/releases/latest). You do not need to build the code.

- [ViaProxy](#use-viaproxy) runs beside your regular Java client. Install no client mods.
- [ViaFabricPlus + Bedrock add-on](#use-viafabricplus-and-the-bedrock-add-on) runs inside a Fabric client. Use this setup for the in-game Bedrock Friends, Realms, and LAN menus.

## Use ViaProxy

1. Under **Assets** on the [latest release](https://github.com/StackAnvil/patches/releases/latest), download the JAR named `ViaProxy-...-StackAnvil.jar`.
2. Put the JAR in its own folder and run it. ViaProxy opens a window and saves its settings in that folder.
3. Enter the Bedrock server address and port, then choose the Bedrock version the server uses. If the server requires an online account, add your account in ViaProxy's **Accounts** tab.
4. Select **Start**. Leave ViaProxy running while you play.
5. Open your regular Minecraft Java Edition client. In **Multiplayer**, add a server using the address shown in the ViaProxy window, then join it.

Your Java client connects to ViaProxy first. ViaProxy connects to the Bedrock server. The address shown by ViaProxy is the one to enter in Java Edition, even though you entered the Bedrock server address in ViaProxy. The [ViaProxy player instructions](https://github.com/ViaVersion/ViaProxy#usage-for-players-gui) show the same window flow.

## Use ViaFabricPlus and the Bedrock add-on

1. Install the Fabric Loader for the Minecraft Java Edition version shown on the [latest StackAnvil release](https://github.com/StackAnvil/patches/releases/latest). If you have not installed Fabric mods before, follow [Fabric's installation guide](https://docs.fabricmc.net/players/installing-mods).
2. Under **Assets** on that release, download `ViaFabricPlus-...jar` and `viafabricplus-bedrock-...-StackAnvil.jar`.
3. Put both JARs in that Fabric client's `mods` folder. Keep only one ViaFabricPlus JAR there. Do not put the separate ViaBedrock or CubeConverter JARs in the folder; the add-on already includes them.
4. Launch the Fabric client. Open **Multiplayer**, then the **ViaFabricPlus** menu. For online mode servers and Realms, open **Bedrock** settings, select **Account for Bedrock Edition**, and sign in through your browser.
5. In **Multiplayer**, select **Add Server** and enter the Bedrock server address. Add its port after a colon if needed, such as `play.example.com:19132`.
6. Use the **ViaFabricPlus** button on the server screen to choose the Bedrock version. Save the server and join it.

To join a friend, Realm, or LAN world, open the **ViaFabricPlus** menu from **Multiplayer** and choose **Bedrock Friends**, **Bedrock Realms**, or **LAN Worlds**. Friends and Realms need Bedrock sign-in.

## Want a prepared client?

The release also has a `Prism-Launcher_Config.zip` for [Prism Launcher](https://prismlauncher.org/download/). It packages the same tested ViaFabricPlus and Bedrock add-on pair. In Prism, select **Add Instance**, then **Import**, and choose the ZIP. Launch the imported instance, then follow the [ViaFabricPlus connection steps](#use-viafabricplus-and-the-bedrock-add-on) above from step 4. Prism's [ZIP import guide](https://prismlauncher.org/wiki/help-pages/zip-import/) shows the import screen.

## If something does not work

- **ViaProxy does not connect:** Check the Bedrock server address and version in ViaProxy. Join the address shown by ViaProxy from Java Edition, and keep ViaProxy running.
- **There is no Bedrock option in ViaFabricPlus:** Check that you launched the Fabric client with both JARs installed for the same Minecraft version. Remove duplicate ViaFabricPlus JARs.
- **The Fabric client cannot join a server:** Check its address and port, and set that server's ViaFabricPlus version to Bedrock.
- **Sign-in or Realms fails:** In ViaFabricPlus, open Bedrock settings and sign in again. A Realm can also reject a Bedrock version it does not support.

Ask for help in [StackAnvil Discord](https://discord.gg/F4ZyEtXXge), or [report a reproducible problem](https://github.com/StackAnvil/patches/issues). Include the release version, what you tried, and the error message. Remove account details from logs before sharing them.
