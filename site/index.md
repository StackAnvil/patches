---
layout: default
title: Home
nav_order: 1
description: Play on Bedrock servers from Java Edition with ViaProxy or ViaFabricPlus and the Bedrock add-on.
---

# StackAnvil

<p class="sa-home-lead"><strong>Play on Bedrock servers from Minecraft Java Edition.</strong> Use the StackAnvil ViaProxy build with your regular Java client, or install ViaFabricPlus and our Bedrock add-on in a Fabric client.</p>

<div class="sa-actions">
  <a href="{{ '/getting-started/' | relative_url }}">Start playing</a>
  <a href="{{ '/releases/' | relative_url }}">See the downloads</a>
</div>

## Choose how to connect

- **ViaProxy:** Run one JAR, enter a Bedrock server address in its window, then join the address ViaProxy shows from your regular Java client. You do not need client mods.
- **ViaFabricPlus + Bedrock add-on:** Put two matching JARs in a Fabric client's mods folder. Join Bedrock servers from the game's Multiplayer screen, or use the add-on's Friends and Realms menus.

The [player guide]({{ '/getting-started/' | relative_url }}) walks through both setups. Get the files from the [latest release]({{ '/releases/' | relative_url }}). If you want a prepared Fabric client, there is also an optional Prism Launcher ZIP.

You play from **Java Edition** with either setup. StackAnvil does not turn a Java server into a Bedrock server or change your singleplayer worlds.

## What is StackAnvil?

[ViaProxy](https://github.com/ViaVersion/ViaProxy) connects a regular Java client to a Bedrock server through a local proxy. [ViaFabricPlus](https://github.com/ViaVersion/ViaFabricPlus) and its Bedrock add-on put Bedrock support in a Fabric client. Our builds include changes to ViaProxy, the add-on, and their ViaBedrock and CubeConverter libraries.

We publish each change separately for review by the original projects. Players can try the patched builds while that review continues.

This is an independent experimental build, not an official ViaVersion release. Some Bedrock behavior can still fail or differ from the Bedrock game.

## Build or contribute

- [Build from source]({{ '/build-from-source/' | relative_url }}) if you want to compile a project or the full client bundle.
- [Maven and Javadocs]({{ '/libraries/' | relative_url }}) shows how to use published artifacts and links to each API reference.
- [Projects]({{ '/projects/' | relative_url }}) explains what each part does.
- [Patch workflow]({{ '/patch-workflow/' | relative_url }}) explains how changes move toward upstream projects.
- [Contributing]({{ '/contributing/' | relative_url }}) covers bug reports, testing, and patches.
