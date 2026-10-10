# Resolve a Windows Bedrock version ID

Run this lookup before you hardcode a Windows Bedrock package version. It queries Microsoft Store and Xbox metadata for the latest available build.

## Authentication

Use an Xbox authentication client to sign in with an account that owns Minecraft for Windows. Request an XSTS token with `http://update.xboxlive.com` as the relying party.

The Minecraft services relying party uses a different token. A Microsoft OAuth access token also cannot replace the Xbox XSTS token.

Save the XSTS response in a private file, such as `.stackanvil/private/xsts.json`. The script reads these fields:

```json
{
  "Token": "<XSTS token>",
  "DisplayClaims": {
    "xui": [{ "uhs": "<numeric user hash>" }]
  }
}
```

The file can instead contain the complete Authorization header value:

```text
XBL3.0 x=<numeric user hash>;<XSTS token>
```

Keep the file outside version control. The `.stackanvil/` directory is ignored. On Linux or macOS, restrict its permissions:

```bash
chmod 600 .stackanvil/private/xsts.json
```

## Resolve the latest build

From the repository root, run:

```bash
bun run bedrock:version --auth-file .stackanvil/private/xsts.json
```

For Minecraft Preview, run:

```bash
bun run bedrock:version --channel preview --auth-file .stackanvil/private/xsts.json
```

The script writes a JSON object to stdout. It includes `contentId`, `versionId`, `packageVersion`, `fileName`, and `fileSize`. Errors go to stderr and produce a nonzero exit status.

Review the package version before you pin it. The latest Store build can differ from the version in `bedrock-assets.json`.

To verify a known version ID, add `--version-id`:

```bash
bun run bedrock:version --auth-file .stackanvil/private/xsts.json \
  --version-id 1.26.5101.0.d8c5d0b8-98a0-4965-9be6-8650afed6611
```

This example requests Bedrock 1.26.51.1. An authenticated lookup returned the expected x64 package on October 9, 2026.

For historical builds, [the Archiver metadata](https://github.com/MinecraftBedrockArchiver/Metadata/blob/master/w10_meta.json) records Xbox version IDs under `<game version>.Archs.x64.UpdateIds`. It also records package checksums.

The directory ID in a CDN URL can differ from the Xbox version ID. Do not use a directory ID from `GdkLinks/urls.json` with `--version-id`.

For an exact Xbox lookup, use the pair in this endpoint:

```text
https://packagespc.xboxlive.com/GetSpecificBasePackage/<contentId>/<versionId>
```

That endpoint also requires Xbox authentication. A hardcoded version ID does not remove the authentication requirement.

## What the IDs mean

`contentId` identifies the Windows product. `versionId` identifies its package version. It contains a Windows package version and a UUID.

The old UWP downloader uses an FE3 UpdateID. That ID is different from the Xbox `versionId`. The current MSIXVC package also needs a different extraction path from an APPX archive.

The lookup selects the full x64 MSIXVC package. It rejects ambiguous IDs, incomplete packages, inconsistent versions, and predownloads. It does not download, decrypt, or change the asset bundle.

The output excludes Xbox credentials, license keys, and temporary download URLs.

## Sources

- [Xbox package lookup implementation in Xodus](https://github.com/xodus-gaming/xodus/blob/main/crates/xodus-cli/src/package.rs)
- [Bedrock XVC metadata and version lookup examples](https://gist.github.com/rtm516/725fa1e38aafd2600976113ccc45a496)
- [Archiver Xbox version ID collection](https://github.com/MinecraftBedrockArchiver/Archiver/blob/master/CoreTool/Loaders/Windows/XboxLoader.cs)
