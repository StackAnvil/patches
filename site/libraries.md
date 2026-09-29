---
layout: default
title: Maven and Javadocs
nav_order: 6
description: Use StackAnvil release artifacts in Gradle and open the API reference for each patched project.
---

# Maven and Javadocs

This page is for developers using the four fully patched StackAnvil projects. To install the client or proxy for play, use the [player guide]({{ '/getting-started/' | relative_url }}).

## Add a dependency in Gradle

1. Choose a version from [StackAnvil releases](https://github.com/StackAnvil/patches/releases). Remove `stack-v` from the tag to get the Maven version.
2. Add the StackAnvil Maven URL to your existing repositories.
3. Add the artifact you need with that version.

For example, release `stack-v0.2.2` provides ViaBedrock version `0.2.2`:

```kotlin
repositories {
    maven("https://stackanvil-maven.pistonmaster.net/")
}

dependencies {
    implementation("io.github.stackanvil:viabedrock-stackanvil:0.2.2")
}
```

Keep the repositories required by the rest of your Gradle build. The [StackAnvil Maven root](https://stackanvil-maven.pistonmaster.net/) explains the repository layout. ViaFabricPlus itself comes from [upstream Maven](https://repo.viaversion.com/com/viaversion/viafabricplus/); the StackAnvil Bedrock add-on has its own artifact below.

## Artifact and API reference

Use the coordinates in the table with your chosen release version. Each Maven metadata link lists published versions. Each Javadocs link opens the API reference for the latest release.

| Project | Artifact ID | Maven metadata | Javadocs |
| --- | --- | --- | --- |
| ViaBedrock | `viabedrock-stackanvil` | [Versions](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/viabedrock-stackanvil/maven-metadata.xml) | [API reference](https://stackanvil-jd.pistonmaster.net/viabedrock/) |
| ViaFabricPlus Bedrock add-on | `viafabricplus-bedrock-stackanvil` | [Versions](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/viafabricplus-bedrock-stackanvil/maven-metadata.xml) | [API reference](https://stackanvil-jd.pistonmaster.net/viafabricplus-bedrock/) |
| CubeConverter | `cubeconverter-stackanvil` | [Versions](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/cubeconverter-stackanvil/maven-metadata.xml) | [API reference](https://stackanvil-jd.pistonmaster.net/cubeconverter/) |
| ViaProxy | `viaproxy-stackanvil` | [Versions](https://stackanvil-maven.pistonmaster.net/io/github/stackanvil/viaproxy-stackanvil/maven-metadata.xml) | [API reference](https://stackanvil-jd.pistonmaster.net/viaproxy/) |

All four coordinates use the group ID `io.github.stackanvil`. The [Javadocs index](https://stackanvil-jd.pistonmaster.net/) identifies the release currently documented. Its project paths update when a new release is published.
