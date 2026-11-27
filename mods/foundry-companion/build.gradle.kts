plugins {
    id("net.fabricmc.fabric-loom") version "1.19-SNAPSHOT"
}

group = "net.pistonmaster.stackanvil"
version = "0.1.0"
description = "Host Bedrock Foundry servers and join them from Minecraft Java Edition."

base {
    archivesName = "stackanvil-foundry-companion"
}

java {
    toolchain.languageVersion = JavaLanguageVersion.of(25)
}

repositories {
    // The StackAnvil build passes its local repository with the pinned ViaFabricPlus and the built ViaBedrock.
    val stackAnvilMavenRepo = providers.gradleProperty("stackanvilMavenRepo")
    if (stackAnvilMavenRepo.isPresent) {
        exclusiveContent {
            forRepository { maven(stackAnvilMavenRepo.get()) { name = "StackAnvilLocal" } }
            filter {
                includeModule("com.viaversion", "viafabricplus")
                includeModule("net.raphimc", "ViaBedrock")
            }
        }
    }
    maven("https://repo.viaversion.com")
    mavenCentral()
}

val minecraftVersion = "26.3"
val fabricLoaderVersion = "0.19.5"

dependencies {
    minecraft("com.mojang:minecraft:$minecraftVersion")
    implementation("net.fabricmc:fabric-loader:$fabricLoaderVersion")
    // Supplied at runtime by ViaFabricPlus and the Bedrock add-on. Only their API types are compiled against.
    compileOnly("com.viaversion:viafabricplus:${providers.gradleProperty("stackanvilViaFabricPlusVersion").get()}") {
        isTransitive = false
    }
    compileOnly("net.raphimc:ViaBedrock:${providers.gradleProperty("stackanvilViaBedrockVersion").get()}") {
        isTransitive = false
    }
    compileOnly("com.viaversion:viaversion-api:5.12.3") { isTransitive = false }

    testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.release = 25
}

tasks.processResources {
    val properties = mapOf("version" to project.version, "minecraft" to minecraftVersion, "loader" to fabricLoaderVersion)
    inputs.properties(properties)
    filesMatching("fabric.mod.json") { expand(properties) }
}

tasks.jar {
    from(rootProject.file("../../LICENSE"))
    manifest.attributes["Implementation-Vendor"] = "StackAnvil"
}

tasks.test {
    useJUnitPlatform()
}
