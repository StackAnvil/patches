# Manual Windows and macOS tests

Use this guide to prepare private Quickemu guests and reproduce launcher, account, and connection problems.
The VM lab runs on an x86_64 Linux host with KVM. Windows 11 and macOS Sonoma are the default guests.
All guest disks, installation media, account state, logs, and screenshots stay under ignored `.stackanvil/lab/vms/` directories.

The VM lab does not establish full platform coverage by itself.
Quickemu's default macOS guest has no GPU acceleration, as its [macOS guide](https://github.com/quickemu-project/quickemu/wiki/03-Create-macOS-virtual-machines) states.
The default Windows guest also needs an OpenGL capability check before Minecraft tests.
Launcher and browser tests can pass while Minecraft cannot start.
Full game rendering needs a suitable guest graphics driver, GPU passthrough, or a physical machine.
The x86_64 macOS guest does not cover Apple Silicon.

## Prepare the host

Install Quickemu and its distribution dependencies from the [official installation guide](https://github.com/quickemu-project/quickemu/wiki/01-Installation).
This workflow requires Quickemu 4.9.9 or newer. It does not install host packages automatically.

For Fedora, run:

```bash
sudo dnf install quickemu spice-gtk-tools
bun run lab vm doctor
```

For Ubuntu, install the distribution package or the official Quickemu PPA package.
Install `spice-client-gtk` for the `spicy` viewer.
On Ubuntu 24.04 or newer, install `qemu-system-modules-spice` if the QEMU package lacks SPICE support.

Check that the doctor output reports KVM access and the required binaries.
Enable CPU virtualization in the firmware if KVM is unavailable.
Grant your user access to `/dev/kvm` through the distribution's KVM group configuration.

The default guest allocation is four CPU cores, 8 GiB RAM, and a 128 GiB sparse disk.
Actual disk use grows during installation and game downloads.
Check available storage before preparing both guests.
The doctor reports available disk space, memory, CPU count, and the Quickemu version.

## Prepare Windows 11

Run:

```bash
bun run lab vm prepare windows
bun run lab vm start windows
bun run lab vm view windows --allow-focus
```

The first command downloads Windows installation media and VirtIO drivers through Quickget.
Download progress stays in `.stackanvil/lab/vms/windows/download.log`.
The launch log stays beside it in `launch.log`.

The lab checks ISO volume descriptors before it reports successful preparation or starts a guest.
Quickget can return success when Microsoft blocks a download, or save an HTML error page as an ISO.
If validation fails, read `download.log` and download the official installation media.
Replace only the failed media at the path in `windows-11.conf`, then repeat preparation.
Keep the profile, configuration, and guest disk.
Use Microsoft's [Windows 11 download page](https://www.microsoft.com/software-download/windows11) for retail media.
Microsoft also supplies [Enterprise evaluation media](https://www.microsoft.com/en-us/evalcenter/download-windows-11-enterprise), which needs no product key.
Quickget's generated answer file selects Windows Pro and does not apply unchanged to that evaluation edition.
Obtain replacement drivers from the [official VirtIO download directory](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/).

Complete installation in the guest viewer.
Quickget's unattended installation creates the `Quickemu` local account with password `quickemu`.
Change that guest password after installation.
Install any missing VirtIO drivers from the attached driver ISO.
See Quickemu's [Windows instructions](https://github.com/quickemu-project/quickemu/wiki/04-Create-Windows-virtual-machines) for installation details.

## Prepare macOS

Run:

```bash
bun run lab vm prepare macos sonoma
bun run lab vm start macos
bun run lab vm view macos --allow-focus
```

Quickget downloads the recovery image. Quickemu supplies the boot configuration.
The first boot can download additional firmware and bootloader files.
These downloads and the guest installation need internet access.

1. Select the recovery system in the boot menu.
2. Open Disk Utility.
3. Select the guest's virtual disk, then erase it with APFS and a GUID partition map.
4. Close Disk Utility, then run the macOS installer.
5. On the first restart, select the installer entry.
6. On later restarts, select the installed system disk.
7. Complete the guest account setup.

Use the [official macOS procedure](https://github.com/quickemu-project/quickemu/wiki/03-Create-macOS-virtual-machines) if the installer needs troubleshooting.
`prepare macos` also accepts `monterey`, `ventura`, `sequoia`, or `tahoe` before the first preparation.
A prepared directory retains its release. Changing the release does not replace an existing installation.

## Control guests without desktop focus

Guests start with SPICE on a local Unix socket and no viewer.
The lab sends input directly to the guest's QMP socket after checking its unique VM identity.
A screenshot contains the guest display, even when no viewer is open.
Click and key commands hold input for 100 milliseconds by default.
For slow software rendering, use a longer hold time, up to 2,000 milliseconds.

```bash
bun run lab vm status windows
bun run lab vm screenshot windows installer
bun run lab vm key windows ret
bun run lab vm key windows ctrl+alt+delete
bun run lab vm click windows 0.50 0.60
bun run lab vm click windows 0.50 0.60 right
bun run lab vm click macos 0.50 0.60 left 1000
bun run lab vm key macos ret 1000
bun run lab vm view windows
```

Use QEMU key names such as `ret`, `esc`, `spc`, or `tab`.
Click coordinates are fractions from zero to one.
Screenshots use PPM files under the guest's private `captures/` directory.
Choose a new screenshot name for each capture.
For PNG inspection, run:

```bash
ffmpeg -i .stackanvil/lab/vms/windows/captures/installer.ppm \
  .stackanvil/lab/vms/windows/captures/installer.png
```

`view` uses the existing private lab display by default.
`view --allow-focus` explicitly opens a window on your desktop for manual installation.
The SPICE viewer disables audio and USB redirection.
Windows starts without a sound card. Quickemu can select a macOS sound card, but its audio stays in SPICE without audible playback.
Set the game's master volume to zero before game tests.

## Transfer the current stack

Build and stage the artifacts on the host:

```bash
bun run build all
bun run lab vm artifacts
bun run lab vm serve
```

`artifacts` verifies the current build JARs and creates a fresh Prism export.
It stages `StackAnvil-Prism.zip`, `ViaProxy.jar`, `manifest.json`, and `SHA256SUMS` in the private share directory.
The manifest records the repository revision and artifact hashes.

In the guest browser, open `http://10.0.2.2:18081/`.
Download the desired files by appending their names to that address.
The share command runs in the foreground. Stop it with Ctrl+C after transfer.
It serves only those four files and listens on host loopback.
It does not serve the repository, VM disks, logs, or credentials.

QEMU's [user network](https://www.qemu.org/docs/master/system/devices/net.html#using-the-user-mode-network-stack) provides the host gateway at `10.0.2.2`.
From the guest, use these addresses:

| Target | Guest address |
| --- | --- |
| Host Bedrock server | `10.0.2.2:19132` |
| Host ViaProxy | `10.0.2.2:25568` |
| Host artifact share | `http://10.0.2.2:18081/` |
| ViaProxy in the same guest | `127.0.0.1:25568` |

User networking does not provide normal LAN broadcast discovery. Use explicit server addresses for the initial tests.
Quickemu also creates its standard SSH forwarding entry. The lab does not enable an SSH server in either guest.
A forwarded SSH port does not establish guest command access.

## Configure the launchers

Install a guest JDK 25 and the launcher under test.
Import `StackAnvil-Prism.zip` into PrismLauncher for the first baseline.
Select the guest JDK in the instance configuration.
Sign in to the Java account through the launcher.
Then sign in to the Bedrock account through the add-on.

For Modrinth or the official Minecraft Launcher with Fabric:

1. Read the Minecraft and Fabric versions from the export's `mmc-pack.json`.
2. Create a separate instance with those exact versions.
3. Extract both JARs from the export's `minecraft/mods/` directory into that instance's mods directory.
4. Select JDK 25 for the game instance.
5. Record the launcher version, Java path, Java architecture, and operating system version.

Do not import the Prism ZIP as a Modrinth modpack. Its format differs from `.mrpack`.
The export contains version metadata and mods. It does not contain game files or an account.

Before game joins, record the OpenGL version, vendor, and renderer from the client log.
If the game rejects the graphics driver, record the failure and continue launcher or helper tests separately.
Use a physical machine or a configured GPU guest for game tests that require graphics acceleration.

## Run the manual regression cases

Use a separate launcher instance for a clean account state.
Keep previous account state for the cache reuse cases.
Do not remove a working instance's credentials to create a clean test.

| Case | Evidence to record |
| --- | --- |
| Store prompt defaults to Ask | In-game prompt appears only when missing built-in assets are needed |
| Decline or cancel Store sign-in | Join continues with available assets and no repeated browser windows |
| Fresh Store sign-in | Browser opens, approval completes, helper returns, licensed extraction finishes |
| Browser opens slowly | Game remains responsive and the sign-in does not immediately time out |
| Cached Store session | Restart and reconnect reuse licensed assets without another sign-in |
| No Store session | Ordinary server packs work and unavailable Store assets remain absent |
| Direct Bedrock connection | Spawn completes, resource prompt works, connection stays active |
| Host ViaProxy route | The same server and pack behave through `10.0.2.2:25568` |
| Guest ViaProxy route | JDK 25 runs the staged JAR and the guest client connects to local ViaProxy |
| Launcher comparison | Prism, Modrinth, and Fabric official launcher use identical game and mod versions |
| Dressing Room | Account appearance, classic packs, persona preview, and missing-asset fallback load |
| Add-on resource packs | CubeCraft or another reproducing server loads custom blocks, entities, and inventory icons |

For guest ViaProxy, run with the guest JDK:

```bash
java -jar ViaProxy.jar cli --bind-address 127.0.0.1:25568 \
  --target-address 10.0.2.2:19132 --target-version "Bedrock 1.26.51" --auth-method NONE
```

This command targets the local test server. Online servers need their normal account authentication configuration.
Windows PowerShell uses a backtick for line continuation. Enter this command on one line there.

Save screenshots, launcher logs, client logs, and the staged manifest under the guest's private directory.
Keep Store tokens, package keys, licenses, and raw HTTPS flows private.
Record each result as verified, failed, or blocked by graphics or account setup.
A VM boot or browser login does not count as a verified game join.

## Preserve and stop the installation

Run:

```bash
bun run lab vm stop windows
bun run lab vm stop macos
```

`stop` requests guest shutdown. It waits up to 30 seconds and leaves the VM running if shutdown remains pending.
It does not kill QEMU or erase disks.
Repeated preparation preserves the original Quickget configuration, guest disk, and local wrapper edits.

Private wrapper files have names such as `sa-windows-<id>.conf` beside `profile.json`.
If more RAM or CPU cores are needed, stop the guest and edit that wrapper.
Keep its display, QMP socket, disk path, and name intact for lab control.
The profile records the original allocation. Guest diagnostics establish the effective allocation after local edits.

If a preparation process stops unexpectedly, read `operation.lock` for its PID.
Check that the process exited before removing the stale lock.
Resume with the same `prepare` command.
If a disk exists without its original configuration, restore that configuration before another preparation.
The tooling refuses to recreate media over an orphaned installation.

## Coverage boundary

The repository's main tooling and full builds run on Ubuntu GitHub runners.
The separate native persona helper matrix runs on Ubuntu, Windows, Intel macOS, and ARM macOS.
Those jobs do not run account-based game joins.
See [ci.yml](../.github/workflows/ci.yml) and [persona-helpers.yml](../.github/workflows/persona-helpers.yml).

Local verification covers profile preservation, QMP framing and errors, validated input, restricted artifact sharing, and a Quickemu control smoke test.
The smoke test boots a disposable disk without a guest OS. It verifies screenshot and input commands, not Windows or macOS application behavior.
## Guest results, October 6, 2026

Both installed guests launched Minecraft 26.3 through Prism 11.1.1 with Temurin 25.0.4.1+1 and the current add-on.
Each guest ran ViaProxy locally and joined CubeCraft with an accepted converted resource pack.
Screenshots show the lobby, custom NPCs, banners, item icons, and sidebar.
Private logs retain conversion progress and thread samples.

| Guest | Graphics | Observed conversion interval |
| --- | --- | --- |
| Windows 11 Enterprise evaluation, build 26100 | Mesa llvmpipe 26.2.4 | 1,198 milliseconds |
| macOS Sonoma 14.8.9, build 23J631 | Apple Software Renderer, OpenGL 4.1 | 1,278 milliseconds |

These intervals cover conversion only. They exclude preparation, account refresh, pack approval, resource reload, and world loading.
The Windows first attempt disconnected during world loading. A retry reached the lobby and retained server traffic for more than five minutes.
The first macOS attempt used an unavailable local proxy; the next attempt reached the lobby after the proxy started.

The Windows guest needed the official VC++ runtime and an application-local Mesa deployment for SDL and LWJGL.
Its default graphics route aborted before the game menu.
Use [Mesa's Windows deployment instructions](https://github.com/pal1000/mesa-dist-win) for a software renderer.
Both guests need long input holds during slow rendering.
Software graphics establish functional coverage only, without hardware performance claims.

Fresh Store approval, passkeys, Modrinth, the official launcher with Fabric, direct Bedrock connections, Apple Silicon, and movement parity remain unverified.
