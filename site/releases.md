---
layout: default
title: Releases
nav_order: 5
description: Download StackAnvil JARs and the PrismLauncher bundle.
---

# Releases

[GitHub releases](https://github.com/StackAnvil/patches/releases) contain four StackAnvil JARs, a copy of the pinned upstream ViaFabricPlus JAR, and a PrismLauncher instance ZIP. Each JAR has a SHA-256 manifest under its local `dist/<project>/` directory.

## Choose an artifact

- **Server or proxy:** Download the JAR for the project you want to test.
- **Java client:** Import the PrismLauncher instance ZIP. It contains the two Fabric mods.
- **Library dependency:** Use the [StackAnvil Maven repository](https://github.com/StackAnvil/maven) for patched artifacts. Get ViaFabricPlus from [upstream Maven](https://repo.viaversion.com/com/viaversion/viafabricplus/).

The add-on embeds the StackAnvil ViaBedrock and CubeConverter JARs. Do not install those embedded libraries as separate Fabric mods.

<p class="sa-note">A full build can contain features still under upstream review. Test a release in your environment before using it on a production server.</p>

For a build from source, follow [getting started]({{ '/getting-started/' | relative_url }}).
