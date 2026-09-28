---
layout: default
title: Home
nav_order: 1
description: StackAnvil builds focused patches across five Minecraft protocol projects.
---

# StackAnvil

<p class="sa-home-lead"><strong>Five upstream projects. One reproducible patch stack.</strong> StackAnvil keeps Minecraft protocol experiments in small, reviewable changes while contributors test the combined build.</p>

<div class="sa-stack" aria-label="Patch stack order">
  <p>Every project follows the same patch order</p>
  <ol>
    <li>Setup: make the combined build work</li>
    <li>Upstreamable: keep each feature reviewable</li>
    <li>Deferred: track work already covered upstream</li>
  </ol>
</div>

<div class="sa-actions">
  <a href="{{ '/getting-started/' | relative_url }}">Build a stack</a>
  <a href="https://github.com/StackAnvil/patches/releases">Get the latest release</a>
  <a href="{{ '/contributing/' | relative_url }}">Contribute a patch</a>
</div>

## Choose a project

Start with the code you know. Each project has its own pinned upstream commit and ordered patch series.

<div class="sa-projects">
  <a href="{{ '/projects/#viabedrock' | relative_url }}"><strong>ViaBedrock</strong><span>Java to Bedrock protocol translation and server support.</span></a>
  <a href="{{ '/projects/#viafabricplus-bedrock-add-on' | relative_url }}"><strong>ViaFabricPlus Bedrock add-on</strong><span>Bedrock connections in the Fabric client.</span></a>
  <a href="{{ '/projects/#cubeconverter' | relative_url }}"><strong>CubeConverter</strong><span>Resource pack conversion used by the Bedrock stack.</span></a>
  <a href="{{ '/projects/#viafabricplus' | relative_url }}"><strong>ViaFabricPlus</strong><span>The client base for the Bedrock add-on.</span></a>
  <a href="{{ '/projects/#viaproxy' | relative_url }}"><strong>ViaProxy</strong><span>A proxy build tested against the patched dependencies.</span></a>
</div>

## Use this site

- [Getting started]({{ '/getting-started/' | relative_url }}) walks through a local build.
- [Patch workflow]({{ '/patch-workflow/' | relative_url }}) explains patch order, edits, and upstream PRs.
- [Projects]({{ '/projects/' | relative_url }}) links each upstream project and patch series.
- [Releases]({{ '/releases/' | relative_url }}) explains the JARs and PrismLauncher bundle.
- [Contributing]({{ '/contributing/' | relative_url }}) shows the path from a local edit to a focused PR.

<p class="sa-note">StackAnvil is an independent experiment. Its builds can include changes that upstream has not accepted. Test them before using them on a production server.</p>
