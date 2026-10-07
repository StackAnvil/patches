# Capture lab

The capture lab helps reproduce Bedrock menus and compare their HTTPS requests with a patched Java client. It keeps raw traffic, account files, screenshots, and JVM dumps under the ignored `.stackanvil/` directory. Use a test account and review every redacted report before sharing it.

For Windows and macOS guests, use the [Quickemu platform guide](platform-testing.md). Its QMP input and screenshots target the guest directly. The existing `capture ui` commands target host clients on the lab display.

The Java recorders use POSIX permissions on Linux and macOS, and a user-only ACL on Windows.
They apply permissions before writing journals, exported packs, keys, or render observations.
Unsupported filesystems stop recording. Existing journals remain protected against accidental overwrite.
The command orchestrator still requires the host's private virtual display; guest recorders can run inside their own platform harness.

## Prepare the clients

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

The lab starts a private Xvfb display, a local Bedrock Dedicated Server, ViaProxy, and the patched Java client. The capture command starts mitmdump on `127.0.0.1:18080`, creates an isolated CA bundle, and launches BedrockOnLinux through that proxy on the private display. Set `STACKANVIL_PROXY_PORT` if the port is busy. `bun run capture start <name> --local` uses mitmproxy local capture mode when a regular proxy cannot see the target process. The game clients start with master volume at zero. An audio guard mutes and routes their streams to a silent sink without touching audio from other apps.

The UI command sends keyboard and pointer input only to the private display by default. Screenshots read that display too. It does not change the active window on your desktop. If you explicitly set `STACKANVIL_USE_DESKTOP=1`, the games launch on your normal display. Desktop input requires `--allow-focus` on each `ui key`, `ui click`, or `ui run` command. On GNOME Wayland, that opt-in input uses a temporary GNOME RemoteDesktop session.

```bash
bun run capture ui screenshot realms-before --client bedrock
bun run capture ui pixel 0.36 0.28 --client bedrock
bun run capture ui key Return --client bedrock
bun run capture ui click 0.50 0.60 --client bedrock
bun run capture ui click 0.50 0.50 right --client java
bun run capture ui key-hold a 1400 --client java
bun run capture ui mouse-hold 0.50 0.50 left 1200 --client java
bun run capture ui button-hold right 150 --client java
bun run capture ui drag right 120 0.40 0.70 0.45 0.70 --client java
bun run capture ui screenshot java-connected --client java
```

Click and pixel coordinates are fractions of the chosen client window, from 0 to 1. `ui pixel` prints the red, green, and blue values at one point without changing focus. Use `--window-id` if more than one window matches. `ui key` accepts names such as `Escape`, `Return`, and `Control+b`. Use `ui double-key space` to send both creative-flight presses in one native call. `ui key-hold`, `ui mouse-hold`, and `ui button-hold` hold input for 1 to 10000 ms on the private display. `button-hold` leaves the cursor in place. Use `bun run capture ui type "127.0.0.1"` to enter lowercase ASCII text, digits, spaces, periods, or hyphens in a focused field. A scenario JSON file can combine `mark`, `wait`, `screenshot`, `key`, `doubleKey`, `keyHold`, `type`, `click`, `mouseHold`, `buttonHold`, `drag`, `videoStart`, and `videoStop` steps. Run the example with `bun run capture ui run scenarios/realm-hub-observe.json`.

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
GNOME Wayland drag input requires the private display.

A scenario uses the same bounds and input handling:

```json
{"action":"drag","button":"right","ms":120,"points":[{"x":0.40,"y":0.70},{"x":0.45,"y":0.70}]}
```

For an integration run without a capture session, pass `--output-dir` to `ui screenshot`. The gameplay probe saves its screenshots under `.stackanvil/integration/runs/`.

### Integration input timing

The integration runner uses `createCaptureUi` from `src/capture/ui.ts` directly.
It shares the CLI's command handling without starting another Bun process for each input or pixel read.
One UI session binds its display once and checks the selected window on every command.
The native helper focuses the private window before emitting input, so the runner omits a separate focus process there.
Desktop input still requires explicit permission.

Private benchmark measurements include a key hold of one millisecond and use twelve samples for each path.
The CLI averages about 220 ms per command; the shared API averages about 9 ms.
These measurements describe driver overhead on the test host, not network latency or native gameplay parity.
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

Videos stay in the ignored capture directory. Review them before sharing because game menus can show account or player details.

When finished, run:

```bash
bun run capture game-stop
bun run capture stop
bun run capture report
bun run lab down
```

The private session has a raw `flows.mitm`, redacted `events.jsonl`, screenshots, and a `report.md`. `bun run capture compare <first-id> <second-id>` compares endpoint sets from two captures. A redacted report shows method, host, path shape, status, and JSON field shapes. It does not prove that a server response is valid or that a feature works. Keep raw flows and screenshots private because they may contain account or player data.

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

Use `server-replay record local --target 127.0.0.1:port --client proxy` for a local RakNet server.
For an owned BDS with NetherNet, use `--target nethernet://127.0.0.1:port`.
Named server recordings use their configured address and reject `--target`.
The native recorder supports RakNet and owned BDS NetherNet targets.
For NetherNet, it exposes a loopback RakNet endpoint to the native client and records the decoded backend packets.
It uses the recording account for the NetherNet session and keeps authentication data private.

A server spawn packet alone does not prove a successful join.
Recordings require local-player initialization and movement acknowledgments.
They also reject an early client exit, cancellation, or a logged disconnect or packet failure.
Inspect the private screenshot and server logs before reporting a live playable session.
Gameplay acknowledgments can arrive after a transport timeout while the client drains queued packets.

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
This includes cache, metadata, icons, and the Java runtime.
Only assets and libraries use shared directories, with explicit read-only Flatpak mounts.
Both global and instance Java selections use the copied Prism runtime.
External Java paths, including system runtimes, require a separate sandbox contract and are rejected by isolated replay.
Escaping source links and write-through links in profile configuration cause preparation to stop.

Java cleanup records process IDs and start times, including launcher descendants.
It verifies these identities immediately before each signal.
A reused or unrecorded process ID stops cleanup without signaling that process.
Display and audio teardown use separate ownership checks.
The Java route refuses forced cleanup and process-group signals.
If normal shutdown fails, inspect the private `process-ownership.json` and logs before further cleanup.
