# Publish the VFP Bedrock add-on

This guide is for StackAnvil maintainers who publish the patched ViaFabricPlus Bedrock add-on. The listing text is in [`publishing/vfp-vb-addon-description.md`](../publishing/vfp-vb-addon-description.md). After the GitHub release is created, the release workflow uploads the add-on JAR to Modrinth and CurseForge.

The [Modrinth project](https://modrinth.com/mod/stackanvil-bedrock-addon) is owned by `pistonmaster`. Its project ID is `opL7gK2I`. It has beta versions of the add-on JAR, with Fabric 26.3 and ViaFabricPlus marked as a required dependency. Its AI-assisted text, fork, and local skin import disclosures are saved. It uses the maintainer's hand-drawn icon. Its description, website guide, and Discord invite match the CurseForge listing.

The [CurseForge project](https://www.curseforge.com/minecraft/mc-mods/stackanvil-bedrock-addon-for-viafabricplus) is owned by `pistonmaster`. Its project ID is `1713307`. Maintainers can manage uploads in the [CurseForge author dashboard](https://authors.curseforge.com/#/projects/1713307/files).

The CurseForge description, hand-drawn logo, GPLv3 license, GitHub source link, website, Discord invite, and required ViaFabricPlus relation are saved. Files can remain under manual review before they appear in search. Both project IDs are stored as GitHub Actions repository variables.

## Listing fields

Both projects use these fields. CurseForge also has a Website social link to the StackAnvil home page:

| Field | Value |
| --- | --- |
| Project name | StackAnvil Bedrock Addon for ViaFabricPlus |
| Summary | Experimental Bedrock Edition support for ViaFabricPlus, with Friends, Realms, skins, and StackAnvil patches. |
| Project type | Minecraft mod |
| Loader | Fabric |
| Environment | Client |
| Minecraft version | 26.3 for the current build |
| License | GPLv3, matching the upstream add-on |
| Source | `https://github.com/StackAnvil/patches` |
| Issues | `https://github.com/StackAnvil/patches/issues` |
| Website | `https://stackanvil.pistonmaster.net/` |
| Wiki | `https://stackanvil.pistonmaster.net/getting-started/` |
| Discord | `https://discord.gg/F4ZyEtXXge` |
| Description | Copy `publishing/vfp-vb-addon-description.md` |

On Modrinth, add [ViaFabricPlus](https://modrinth.com/mod/viafabricplus) as a required dependency. On CurseForge, add [ViaFabricPlus](https://www.curseforge.com/minecraft/mc-mods/viafabricplus) as a required relation. The upload tool also sets these version dependencies. Do not add ViaBedrock or CubeConverter as required mods because the add-on embeds them.

Both platforms can install ViaFabricPlus automatically from that relation. The StackAnvil release also includes the pinned upstream Jenkins JAR. Users need only one ViaFabricPlus JAR in the mods folder. The listing description gives this instruction.

Credit the original creators and keep the StackAnvil fork label visible. [Modrinth's rules](https://modrinth.com/legal/rules) require meaningful credit and substantial changes for a fork. [CurseForge's moderation policy](https://support.curseforge.com/support/solutions/articles/9000197279) also requires credit and distinct project content.

The listing description was drafted with AI assistance, and Modrinth's **AI-generated text** disclosure is enabled. The maintainer drew the [`VFP VB icon`](../assets/publishing/vfp-vb.png) in GIMP. Its editable source is [`VFP VB.xcf`](../assets/publishing/handdrawn/VFP%20VB.xcf). [Modrinth's image rule](https://support.modrinth.com/en/articles/16551575-disclosure-and-usage-of-ai) prohibits AI-generated project images.

## Configure GitHub

The project IDs are recorded as GitHub Actions repository variables:

- `MODRINTH_VFP_VB_ADDON_PROJECT_ID`
- `CURSEFORGE_VFP_VB_ADDON_PROJECT_ID`

The repository secrets `MODRINTH_TOKEN` and `CURSEFORGE_TOKEN` are configured. The Modrinth token has the `VERSION_CREATE` scope and expires on September 26, 2027. CurseForge does not offer project or permission scopes for author API tokens, so its token may access other projects on the `pistonmaster` author account. Rotate these tokens in the platform dashboards and update the GitHub secrets when needed. Never put tokens in `targets.json`, a patch, or a release note.

## Upload a release

1. Run the **Release full stacks** workflow or push a `stack-v...` tag. The workflow builds the stack and creates a GitHub release.
2. Wait for the add-on publishing job. It downloads the release JAR and manifest, validates the JAR, and uploads it to both platforms.
3. Review the uploaded version on each platform after moderation. Confirm the Minecraft version, Fabric loader, dependency, and client environment.

The workflow uses the GitHub release notes as the changelog on both platforms. It marks uploads as **beta** because StackAnvil builds are experimental.

If one platform fails, inspect its project for the release version. Then run **Publish VFP Bedrock add-on** with the same release tag and only that platform. This avoids a duplicate upload to the other platform.

Releases before this publishing setup do not contain the required manifest. Use a new release for the first automated upload. The private Modrinth `stack-v0.1.4` version was uploaded through the site after separately verifying its JAR digest against the GitHub release.

For a local validation, download the add-on JAR, its manifest, and the release changelog into one directory. Then run:

```bash
bun run mod:publish prepare stack-v1.0.0 path/to/viafabricplus-bedrock-manifest.json path/to/changelog.md
```

The command prints the release metadata. It does not upload the JAR. The upload formats follow the [Modrinth version API](https://docs.modrinth.com/api/operations/createversion/) and the [CurseForge upload API](https://support.curseforge.com/support/solutions/articles/9000197321).
