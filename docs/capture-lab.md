# Capture lab

The capture lab helps reproduce Bedrock menus and compare their HTTPS requests with a patched Java client. It keeps raw traffic, account files, screenshots, and JVM dumps under the ignored `.stackanvil/` directory. Use a test account and review every redacted report before sharing it.

For Windows and macOS guests, use the [Quickemu platform guide](platform-testing.md). Its QMP input and screenshots target the guest directly. The existing `capture ui` commands target host clients on the lab display.

The Java recorders use POSIX permissions on Linux and macOS, and a user-only ACL on Windows.
They apply permissions before writing journals, exported packs, keys, or render observations.
Unsupported filesystems stop recording. Existing journals remain protected against accidental overwrite.
The command orchestrator still requires the host's private virtual display; guest recorders can run inside their own platform harness.

Lab and integration entry points compose native Effect programs. SIGINT and SIGTERM interrupt the command and wait for its cleanup. Each QMP operation owns a socket and a deadline. Pointer release runs when a held click ends or is interrupted.

Integration scopes stop owned process groups before releasing copied server dependencies and the private display. If a process survives shutdown, cleanup retains those resources. Lab services transfer ownership to the persistent process registry after startup, so they remain available after the command exits.

## Prepare the clients

Install Sway, `grim`, `wf-recorder`, `pactl`, Rust 1.85 or newer, and the libxkbcommon development package.
On Fedora, use `sway`, `grim`, `wf-recorder`, `pulseaudio-utils`, and `libxkbcommon-devel`.
On Debian or Ubuntu, use `sway`, `grim`, `wf-recorder`, `pulseaudio-utils`, and `libxkbcommon-dev`.
The lab builds `native/capture-wayland` with its locked dependencies.
Build outputs stay under `.stackanvil/tools/`. Source changes trigger a rebuild.

The private display uses headless Sway with XWayland disabled.
Both clients must support native Wayland. X11 clients have no fallback.
The launcher forces Qt, GTK, SDL2, and SDL3 to use Wayland.
For Wine clients, use a Wine build with its Wayland driver enabled.
The lab sets `BOL_INPUT=wayland` for BedrockOnLinux.
Disable Gamescope and custom display overrides in its configuration before capture.
The bundled launcher adapter refuses an incompatible Wayland engine before the launcher can select XWayland.

Build the stack and install its PrismLauncher instance:

```bash
bun run build all
bun run bundle
bun run lab java prepare
bun run lab doctor
bun run capture doctor
```

Install the BedrockOnLinux AppImage and set `BEDROCK_LAUNCHER` if it is not in `~/AppImages/bedrockonlinux.appimage`. The capture tool extracts the AppImage once and runs its bundled Python launcher with an isolated proxy trust bundle. This keeps certificate changes out of your normal Bedrock installation.

If you need an offline copy of the BedrockOnLinux login files for a local test, run `bun run lab credentials snapshot`. The command copies only its known authentication files from `~/.local/share/bedrock-on-linux` into `.stackanvil/lab/credentials/bedrock-on-linux/`. It creates private directories and files. It does not show or commit their contents. Set `BEDROCK_ON_LINUX_HOME` to change the source.

## Start a reproducible capture

```bash
bun run lab up
bun run capture start realm-hub
bun run capture launch
bun run capture ui list
bun run capture mark "Open Realms hub"
```

The lab starts a private headless Wayland display, a local Bedrock Dedicated Server, ViaProxy, and the patched Java client. The capture command starts mitmdump on `127.0.0.1:18080`, creates an isolated CA bundle, and launches BedrockOnLinux through that proxy on the private display. Set `STACKANVIL_PROXY_PORT` if the port is busy. `bun run capture start <name> --local` uses mitmproxy local capture mode when a regular proxy cannot see the target process. The game clients start with master volume at zero. An audio guard mutes and routes their streams to a silent sink without touching audio from other apps.

The UI command sends keyboard and pointer input only to the private display by default.
Screenshots read that display too. Input does not change the active window on your desktop.
The lab keeps a virtual keyboard and pointer connected before clients start.
Commands share those devices, so the compositor does not remove the seat between actions.
Wayland sockets live in a private directory under `XDG_RUNTIME_DIR`.
Set `STACKANVIL_SWAY_BINARY` and `STACKANVIL_SWAYMSG_BINARY` to select Sway executables.
Tools also resolve from a private installation under `.stackanvil/tools/wayland-root/usr/`.
That installation uses `bin/`, `lib/`, or `lib64/` for its executables and libraries.
Private tool libraries apply to helpers, not game clients.
Set `STACKANVIL_WAYLAND_RENDERER=pixman` for compositor tests without GPU rendering.

If you set `STACKANVIL_USE_DESKTOP=1`, the games launch on your native Wayland desktop.
Desktop automation requires Sway IPC through `SWAYSOCK` and the virtual keyboard, virtual pointer, and screencopy protocols.
GNOME desktop automation is no longer supported.
Desktop input requires `--allow-focus` on each supported input command.
Absolute pointer input and capture require an unrotated output at scale 1.
Absolute input also requires exactly one active output.
Use the private display for relative motion and pointer positioning.

```bash
bun run capture ui screenshot realms-before --client bedrock
bun run capture ui pixel 0.36 0.28 --client bedrock
bun run capture ui key Return --client bedrock
bun run capture ui click 0.50 0.60 --client bedrock
bun run capture ui click 0.50 0.50 right --client java
bun run capture ui key-hold a 1400 --client java
bun run capture ui move 0.50 0.50 --client java
bun run capture ui mouse-hold 0.50 0.50 left 1200 --client java
bun run capture ui button-hold right 150 --client java
bun run capture ui drag right 120 0.40 0.70 0.45 0.70 --client java
bun run capture ui screenshot java-connected --client java
```

Click and pixel coordinates are fractions of the chosen client window, from 0 to 1. On the Bedrock client, `ui click` moves the pointer over the target, waits 400 ms, then holds the button for 150 ms. Bedrock under winewayland ignores a press on a control it has not seen the pointer hover, and a very short press. Java clicks stay a single press. `ui pixel` prints the red, green, and blue values at one point without changing focus. Use `--window-id` if more than one window matches. `ui key` accepts names such as `Escape`, `Return`, and `Control+b`. Use `ui double-key space` to send both creative-flight presses in one native call. `ui key-hold`, `ui mouse-hold`, and `ui button-hold` hold input for 1 to 10000 ms on the private display. `button-hold` leaves the cursor in place. Use `bun run capture ui type "127.0.0.1"` to enter lowercase ASCII text, digits, spaces, periods, or hyphens in a focused field. A scenario JSON file can combine `mark`, `wait`, `screenshot`, `key`, `doubleKey`, `keyHold`, `type`, `click`, `mouseHold`, `buttonHold`, `drag`, `videoStart`, and `videoStop` steps. Run the example with `bun run capture ui run scenarios/realm-hub-observe.json`.

To turn the camera in a game that has captured the pointer, use `ui look <dx> <dy>`.
It sends one relative pointer motion of up to 2000 pixels on each axis to the private display.
Absolute `ui move` positions cannot change pitch in a captured game, and a large move can close an open screen.

For menu input, use `ui move` to position the pointer before `ui button-hold`.
This command requires the private Wayland display and presses no buttons.
The command returns after the compositor processes the motion.
A pointer lock can prevent absolute movement. Use `ui look` for captured camera input.
Make sure that the intended field has focus before typing.

### Drag across inventory slots

Use `ui drag <left|right> <dwell-ms> <x0> <y0> <x1> <y1> ...` to move while holding one mouse button.
Each coordinate is a fraction of the selected window.
The command accepts 2 to 64 points and a dwell of 1 to 1000 ms at each point.
The total button hold cannot exceed 10000 ms.
Choose points from observed slot positions and allow enough dwell for the client to process each movement.

One native call presses the button, visits the points in order, and releases the button.
SIGINT, SIGTERM, and detected window failures also release the button.
SIGKILL and an X server failure cannot guarantee cleanup.
Desktop input requires `--allow-focus`.

A scenario uses the same bounds and input handling:

```json
{
  "action": "drag",
  "button": "right",
  "ms": 120,
  "points": [
    { "x": 0.4, "y": 0.7 },
    { "x": 0.45, "y": 0.7 }
  ]
}
```

For an integration run without a capture session, pass `--output-dir` to `ui screenshot`. The gameplay probe saves its screenshots under `.stackanvil/integration/runs/`.

### Integration input timing

The integration runner uses `createCaptureUi` from `src/capture/ui.ts` directly.
It shares the CLI's command handling without starting another Bun process for each input or pixel read.
One UI session binds its display once and checks the selected window on every command.
The input service focuses the private window before emitting input, so the runner omits a separate focus process there.
Desktop input still requires explicit permission.

Projectile controls still require movement before the shot passes, attributed damage for contact, and changed ownership and outgoing motion for reflection.

## Record before and after video

Record a short private video around each action. Start a recording after its client window appears, mark the step, run the action, and stop the recording. The video contains no audio.

```bash
bun run capture video start before --client bedrock
bun run capture mark "Before opening Realm Hub"
# Run the action or a scenario here.
bun run capture video stop --client bedrock
bun run capture video start after --client bedrock
bun run capture mark "After opening Realm Hub"
# Repeat the same action after your change.
bun run capture video stop --client bedrock
bun run capture video compare before after --client bedrock
```

The comparison MP4 shows the before recording on the left and the after recording on the right. `videoStart` and `videoStop` are also scenario steps, so a JSON recipe can record exactly the same input sequence in both runs. Recordings default to 15 frames per second. For blink or strip timing, use `bun run capture video start timing --client bedrock --fps 120`. The rate must be an integer from 1 to 120. A scenario `videoStart` step accepts the same value as `fps`. Higher rates increase CPU use and file size. Session metadata records the requested rate and recorder launch time. Use the video frame timestamps to measure durations. Capture frames can repeat when the client renders more slowly.

Recording uses `wf-recorder` through Wayland screencopy.
It captures the selected window's content rectangle without audio.
Keep that window focused and stationary during recording.
The recorder stops if the window moves, resizes, loses focus, or closes.
Screenshots require the full window to fit on one output.
On the private display, capture brings the selected window to the front.
Desktop screenshots require you to focus the window first.

Measure the actual client surface and frame intervals before comparing input or packet timing.
A requested FPS cap does not prove that the client reaches it.
Keep profiler and breakpoint overhead separate from ordinary client performance.

Videos stay in the ignored capture directory. Review them before sharing because game menus can show account or player details.

When finished, run:

```bash
bun run capture game-stop
bun run capture stop
bun run capture report
bun run lab down
```

The private session has a raw `flows.mitm`, redacted `events.jsonl`, screenshots, and a `report.md`. `bun run capture compare <first-id> <second-id>` compares endpoint sets from two captures. A redacted report shows method, host, path shape, status, and JSON field shapes. It does not prove that a server response is valid or that a feature works. Keep raw flows and screenshots private because they may contain account or player data.

Replay sessions save `transport-artifacts.json` for the verified ViaProxy JAR and staged proxy recorder before launch.
Java sessions also save `client-artifacts.json` after staging all client mods and before launching Prism.
These private receipts retain JAR filenames, sizes, and SHA-256 hashes after dependency cleanup, including failed runs.
Compare their staged JAR hashes with build manifests when attributing a capture to a build.
Use runtime observations to verify that the expected mods loaded.

### Record one window without a capture session

`ui record` saves a bounded video of one client window on the private display. It does not need `capture start` or the HTTPS proxy.

```bash
bun run capture ui record clapping-native 12 --fps 30 --client bedrock --output-dir .stackanvil/research/emotes
```

The command records for 1 to 120 seconds, then stops the recorder. It refuses to replace an existing file and refuses to run on your desktop. Screenshot and recording names use lowercase letters, digits, and hyphens.

## Compare an emote with the official client

Use the same account in both clients, one after the other. Two sessions on one account disconnect each other. The account's active character and emote wheel apply to both clients, so slot `1` plays the same emote.

1. Start the official client on the private display with `bun run capture launch --direct`. It skips the HTTPS proxy, so Xbox Live sign-in and server joins work as in an ordinary installation. After its menu appears, open Play and add a server. For CubeCraft, use `mco.cubecraft.net` with port 19132. `play.cubecraft.net` fails to join from this setup.
2. After the join, walk well away from spawn, for example with `bun run capture ui key-hold a 6000 --client bedrock`. Other players crowd every lobby spawn and hide the player.
3. Press `F5` twice for the front view, start `ui record`, then press `b` and `1`.
4. Close the official client. Join the same server with the add-on through `bun run server-replay record cubecraft --client addon`, repeat steps 2 and 3, and record the add-on window.
5. Trim each video to the first emote frame and place them side by side with `ffmpeg ... hstack`.

The Java and Bedrock third-person cameras use different distances. Crop and scale each video around the player before comparing poses.

## Inspect the Java client

Use `bun run lab jvm list` to find a running Java process. `bun run lab jvm threads <pid>` and `bun run lab jvm properties <pid>` save private diagnostics. Use `jfr-start`, `jfr-dump`, and `jfr-stop` to record a Java Flight Recorder trace. For deeper analysis, compile your own Java agent JAR or JVMTI library and attach it with `bun run lab jvm agent <pid> <jar>` or `bun run lab jvm native-agent <pid> <library>`.

The UI command can send input to both Bedrock and Java clients without taking focus from your desktop. This lets you compare the same menu or connection step without hardcoding account tokens or packet contents in tests. Gameplay packets over UDP need separate protocol logs or packet capture. The HTTPS proxy covers only traffic that the launched process routes through it.

For skin behavior, see [the Bedrock skin flow](skin-flow.md). It explains what HTTPS captures show, what gameplay packets carry, and why Character Creator skins still need renderer work.

### Observe local movement phases

Fabric replay recordings save `movement-audit.jsonl` in the private recording directory.
The observer samples the local player before `aiStep`, before input application, and after travel at `sendChanges`.
Each row includes the tick, position, motion, pose, swimming blend, fluid state, eye height, and collision axes.
Item-use rows also include active state, remaining and elapsed ticks, the item identifier, and active and held stack counts.
Compare the counters and counts around completion packets to distinguish local use timing from authoritative inventory updates.
Compare these phases with the packet journal to locate changes that occur before or after physics.

The observer does not change movement or input.
It records at most 18,000 samples and uses the same private file permissions as the packet journal.
An observation error stops this observer without interrupting the game.
Keep this file private because its positions can reveal world activity.

## Validate recorded joins

Use `server-replay record local --target 127.0.0.1:port --client proxy` for a local HTTP NetherNet server.
The explicit `nethernet://127.0.0.1:port` form selects the same transport.
Named server recordings use their configured address and reject `--target`.
The native recorder accepts NetherNet backend targets.
It exposes a loopback NetherNet endpoint to the native client and records the decoded backend packets.
Check the server's startup log before choosing a backend transport.
It uses the recording account for the NetherNet session and keeps authentication data private.
An account-free loopback recording uses one self-signed identity for HTTP signaling and game login.
It preserves the native player's UUID from `leguuid`, or derives it from the native `xid` when that field is absent.
A replacement UUID can leave Dressing Room changes disconnected from the in-world appearance.
Gameplay packets retain their original bytes; identity routing belongs in the offline login.
The SDP offer includes proof of possession for that identity, even when the owned server disables online authentication.
The recorder retains offline game authentication and validates the SDP answer.

A server spawn packet alone does not prove a successful join.
Recordings require local-player initialization and movement acknowledgments.
Direct and ViaProxy Java recordings start the requested scene duration after player initialization and the first subsequent input packet.
They also reject an early client exit, cancellation, or a logged disconnect or packet failure.
Inspect the private screenshot and server logs before reporting a live playable session.
Gameplay acknowledgments can arrive after a transport timeout while the client drains queued packets.

For a live Java add-on survey that follows server transfers, add `--allow-transfers`:

```bash
bun run server-replay record public --target host:port --client addon --allow-transfers --seconds 300 --software-rendering
```

The first connection keeps the session's `packets.sbr` and `packs/` paths.
Later connections use private `connection-2/`, `connection-3/`, and subsequent directories.
Each directory contains its own journal and exported packs.
The session manifest lists the later connections and their gameplay checks.
The timer starts at the first playable scene and includes later loading time.
Render observations remain session totals. Inspect screenshots and each journal before attributing a result to a destination.

This option accepts the exact normal transfer notice. Other disconnects and packet errors still fail the run.
It applies only to live add-on recordings. Offline replays retain the single-connection guard.
To replay a destination, pass its connection directory to `server-replay replay`.

Camera preset observations wait until core finishes its custom-block resource-pack gate.
Both direct and ViaProxy recorders retain the latest preset table until its decoder runs.
This prevents the observer from treating an intentionally queued packet as an unhandled packet.

## Build a controlled form fixture

A form fixture combines a recorded protocol-2193 bootstrap with captured form requests and declared decrypted pack exports.
It is a controlled fixture with mixed provenance, not an unchanged server recording.
The fixture preserves form JSON and response indices. It does not contact the recorded server.

Keep the plan, packs, journal, and screenshots in ignored private directories.
Use a fresh direct child of `.stackanvil/replay` for the output.
The source recording must contain StartGame and spawn packets before the chosen cutoff.

The plan contains:

- `source`, `sourceSha256`, and `output`: absolute recording directory, journal checksum, and fresh output directory.
- `bootstrapSeconds`: an integer from 10 to 120.
- `intervalSeconds`: an integer from 10 to 60 between form requests.
- `forms`: one to 16 entries with `id`, absolute `source`, and `sha256` for each captured JSON file.
- `packs`: replacement entries with `from`, absolute `source`, `sha256`, and explicit `decrypted: true` provenance.
- Optional `uiFiles` on a replacement: the expected number of `ui/*.json` definitions.

Pack filenames and manifest identities must agree. Replacements must retain the recorded pack version.
For declared decrypted exports, the fixture updates advertised UUIDs and archive lengths, then removes original encryption and CDN fields.
ReplayServer serves these archives through its owned loopback HTTP endpoint.
Unreplaced fixture metadata remains intact until the normal replay handshake supplies local delivery details.

1. Run the default read-only preview:

   ```bash
   bun run server-replay form-fixture /absolute/private/plan.json --dry-run --verbose
   ```

2. Review every input checksum, pack identity, output action, and journal summary.
3. Use the returned `previewSha256` to create the reviewed fixture:

   ```bash
   bun run server-replay form-fixture /absolute/private/plan.json --apply --reviewed-preview <previewSha256> --verbose
   ```

Apply rejects changed inputs and existing output paths, including symlinks.
It creates private files exclusively and publishes `fixture.json` after input verification.
A failed creation removes only its newly owned output directory.
The command does not launch a client or change installed artifacts.

For an authorized Java render run, use `server-replay replay <fixture-directory>` with `--gui-scale 1..4` and `--software-rendering`.
The normal virtual display and zero-volume defaults still apply.
These Java options cannot change native-client GPU guards.
Keep actual render evidence separate from CPU layout results and synthetic fixture provenance.

### Isolate the Java launcher

Replay clients copy mutable Prism data into their private runtime directory.
This includes assets, libraries, cache, metadata, icons, and the Java runtime.
Prism can rewrite cached asset indexes even when their checksums match.
Copies use reflinks when available and otherwise copy the file bytes.
The command reserves 5 GiB of free disk space beyond the full copy size.
The original Prism directory stays read-only in the Flatpak sandbox.
Both global and instance Java selections use the copied Prism runtime.
External Java paths, including system runtimes, require a separate sandbox contract and are rejected by isolated replay.
Escaping source links and write-through links in profile configuration cause preparation to stop.

Java cleanup records process IDs and start times, including launcher descendants.
It verifies these identities immediately before each signal.
A reused or unrecorded process ID stops cleanup without signaling that process.
Display and audio teardown use separate ownership checks.
The Java route refuses forced cleanup and process-group signals.
If normal shutdown fails, inspect the private `process-ownership.json` and logs before further cleanup.
