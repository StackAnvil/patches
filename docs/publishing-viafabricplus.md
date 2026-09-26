# Prepare the ViaFabricPlus fork listings

This guide records the StackAnvil ViaFabricPlus listings. Both listings are drafts. Do not upload a file or request review until the fork has substantial changes beyond build branding.

The [Modrinth draft](https://modrinth.com/project/stackanvil-viafabricplus) belongs to `pistonmaster`. Its project ID is `vIvjE6fL`. It has a description, GPLv3 license, source and issue links, and the [VFP icon](../assets/publishing/vfp.png). It has no version and has not been submitted for review. Modrinth lists it as a private project. Modrinth requires a version before it enables tags and content disclosures.

The [CurseForge project](https://authors.curseforge.com/#/projects/1713417/files) belongs to `pistonmaster`. Its project ID is `1713417`. It is unlisted and has no file. Its description, GPLv3 license, source link, logo, and Utility & QoL category are saved. The project has no download, and CurseForge has not reviewed a file.

Both descriptions explain that the current [ViaFabricPlus setup patch](../patches/viafabricplus/setup/0001-stackanvil-branding.patch) changes only the version and manifest vendor. The Bedrock changes live in the separate add-on and its libraries. The [listing text](../publishing/viafabricplus-description.md) uses the Modrinth add-on link. The CurseForge description names the add-on without linking to Modrinth.

The VFP icon comes from the maintainer's GIMP drawing. Its editable source is [`VFP.xcf`](../assets/publishing/handdrawn/VFP.xcf). The logo does not use the earlier AI-assisted artwork. The descriptions were drafted with AI assistance, so set Modrinth's AI-generated text disclosure when versions and disclosures become available. Also set its derivative content disclosure and credit upstream.

[Modrinth's content rules](https://modrinth.com/legal/rules) define a fork as a modified copy that has diverged substantially from its source. The current branding patch does not meet that threshold. [CurseForge's moderation policy](https://support.curseforge.com/support/solutions/articles/9000197279) requires distinct content and clear credit for a fork. Review the patch stack against these rules before any upload. A CurseForge file upload starts moderation, so leave the project empty while it must stay out of review.

No ViaFabricPlus upload workflow or project ID variables are configured. The existing manual workflow and variables target only the Bedrock add-on. The GitHub release contains a ViaFabricPlus JAR, but the existing release has no separate ViaFabricPlus build manifest for the upload validator. Add that validation and a separate manual workflow only when the fork is ready for publication.
