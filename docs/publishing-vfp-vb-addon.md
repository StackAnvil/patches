# Publish the VFP Bedrock add-on

This guide is for StackAnvil maintainers who publish the patched ViaFabricPlus Bedrock add-on. The listing text is in [`publishing/vfp-vb-addon-description.md`](../publishing/vfp-vb-addon-description.md). The release workflow uploads only the add-on JAR.

The [private Modrinth draft](https://modrinth.com/mod/stackanvil-bedrock-addon) is owned by `pistonmaster`. Its project ID is `opL7gK2I`. It has a beta version of the verified `stack-v0.1.4` add-on JAR, with Fabric 26.3 and ViaFabricPlus marked as a required dependency. Its AI-assisted text, fork, and local skin import disclosures are saved. It has no icon and has not been submitted for review.

The [unlisted CurseForge project](https://authors.curseforge.com/#/projects/1713307/files) is owned by `pistonmaster`. Its project ID is `1713307`. Its description, GPLv3 license, GitHub source link, and required ViaFabricPlus relation are saved. It has no file yet, so it remains unavailable to other users until moderation. Both project IDs are stored as GitHub Actions repository variables.

## Listing fields

The projects use these fields on both sites:

| Field | Value |
| --- | --- |
| Project name | StackAnvil Bedrock Addon for ViaFabricPlus |
| Summary | Experimental Bedrock support for ViaFabricPlus with StackAnvil patches. |
| Project type | Minecraft mod |
| Loader | Fabric |
| Environment | Client |
| Minecraft version | 26.3 for the current build |
| License | GPLv3, matching the upstream add-on |
| Source | `https://github.com/StackAnvil/patches` |
| Issues | `https://github.com/StackAnvil/patches/issues` |
| Description | Copy `publishing/vfp-vb-addon-description.md` |

On Modrinth, add [ViaFabricPlus](https://modrinth.com/mod/viafabricplus) as a required dependency. On CurseForge, add [ViaFabricPlus](https://www.curseforge.com/minecraft/mc-mods/viafabricplus) as a required relation. The upload tool also sets these version dependencies. Do not add ViaBedrock or CubeConverter as required mods because the add-on embeds them.

Both platforms may install upstream ViaFabricPlus automatically from that relation. Users must replace it with the matching StackAnvil ViaFabricPlus JAR from the same GitHub release and keep only one ViaFabricPlus JAR in the mods folder. The listing description gives this instruction.

Credit the original creators and keep the StackAnvil fork label visible. [Modrinth's rules](https://modrinth.com/legal/rules) require meaningful credit and substantial changes for a fork. [CurseForge's moderation policy](https://support.curseforge.com/support/solutions/articles/9000197279) also requires credit and distinct project content.

The listing description was drafted with AI assistance, and Modrinth's **AI-generated text** disclosure is enabled. The icon in [`assets/publishing/vfp-vb.png`](../assets/publishing/vfp-vb.png) was rendered from an AI-authored SVG with Inkscape and is used only on CurseForge. The matching [`vfp.svg`](../assets/publishing/vfp.svg) and [`vfp-vb.svg`](../assets/publishing/vfp-vb.svg) files are editable sources. None of these images, or the existing AI-assisted StackAnvil logo, can be uploaded to Modrinth under [its image rule](https://support.modrinth.com/en/articles/16551575-disclosure-and-usage-of-ai). A Modrinth icon must be created independently by a human, without deriving it from AI output. An icon is optional there.

## Configure GitHub

The project IDs are recorded as GitHub Actions repository variables:

- `MODRINTH_VFP_VB_ADDON_PROJECT_ID`
- `CURSEFORGE_VFP_VB_ADDON_PROJECT_ID`

The repository secrets `MODRINTH_TOKEN` and `CURSEFORGE_TOKEN` are configured. The Modrinth token has the `VERSION_CREATE` scope and expires on September 26, 2027. CurseForge does not offer project or permission scopes for author API tokens, so its token may access other projects on the `pistonmaster` author account. Rotate these tokens in the platform dashboards and update the GitHub secrets when needed. Never put tokens in `targets.json`, a patch, or a release note.

## Upload a release

1. Build and publish a StackAnvil GitHub release. The release includes the add-on JAR and `viafabricplus-bedrock-manifest.json`.
2. Review the release notes. The workflow uses them as the changelog on both platforms.
3. Open the **Publish VFP Bedrock add-on** workflow in GitHub Actions.
4. Enter the existing `stack-v...` release tag and select the destination.
5. Run the workflow. It validates the JAR against the build manifest before upload.
6. Review the uploaded version on each platform after moderation. Confirm the Minecraft version, Fabric loader, dependency, and client environment.

The workflow marks uploads as **beta** because StackAnvil builds are experimental. If one platform fails, select only that platform for a retry. Check its project first so that you do not upload a duplicate version.

Releases before this publishing setup do not contain the required manifest. Use a new release for the first automated upload. The private Modrinth `stack-v0.1.4` version was uploaded through the site after separately verifying its JAR digest against the GitHub release.

For a local validation, download the add-on JAR, its manifest, and the release changelog into one directory. Then run:

```bash
bun run mod:publish prepare stack-v1.0.0 path/to/viafabricplus-bedrock-manifest.json path/to/changelog.md
```

The command prints the release metadata. It does not upload the JAR. The upload formats follow the [Modrinth version API](https://docs.modrinth.com/api/operations/createversion/) and the [CurseForge upload API](https://support.curseforge.com/support/solutions/articles/9000197321).
