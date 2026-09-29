---
layout: default
title: Home
nav_order: 1
description: Play on Minecraft Bedrock servers from Java Edition with the StackAnvil client build.
---

# StackAnvil

<p class="sa-home-lead"><strong>Play on Bedrock servers from Minecraft Java Edition.</strong> StackAnvil pairs ViaFabricPlus with an experimental Bedrock add-on. The ready-to-import client lets you try Bedrock servers, Friends, and Realms from Java Edition.</p>

<div class="sa-actions">
  <a href="{{ '/getting-started/' | relative_url }}">Start playing</a>
  <a href="{{ '/releases/' | relative_url }}">See the downloads</a>
</div>

<p class="sa-route">Your Java Edition game <span aria-hidden="true">→</span> ViaFabricPlus + StackAnvil add-on <span aria-hidden="true">→</span> Bedrock world</p>

## Get started

Download one ZIP from a [StackAnvil release]({{ '/releases/' | relative_url }}), import it into Prism Launcher, and launch the new game setup. The [player guide]({{ '/getting-started/' | relative_url }}) shows each step. No code build or separate library installation is needed.

StackAnvil runs in a **Java Edition client**. It does not turn a Java server into a Bedrock server or change your singleplayer worlds.

## What is StackAnvil?

[ViaFabricPlus](https://github.com/ViaVersion/ViaFabricPlus) and its Bedrock add-on let a Java client talk to Bedrock servers. Our client build includes changes to the add-on and its ViaBedrock and CubeConverter libraries. We also publish a patched ViaProxy for people who test server connections.

We publish each change separately for review by the original projects. Players can try the changes together in one build while that review continues.

This is an independent experimental build, not an official ViaVersion release. Some Bedrock behavior can still fail or differ from the Bedrock game.

## Build or contribute

- [Build from source]({{ '/build-from-source/' | relative_url }}) if you want to compile a project or the full client bundle.
- [Projects]({{ '/projects/' | relative_url }}) explains what each part does.
- [Patch workflow]({{ '/patch-workflow/' | relative_url }}) explains how changes move toward upstream projects.
- [Contributing]({{ '/contributing/' | relative_url }}) covers bug reports, testing, and patches.
