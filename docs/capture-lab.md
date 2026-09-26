# Capture lab

The capture lab helps reproduce Bedrock menus and compare their HTTPS requests with a patched Java client. It keeps raw traffic, account files, screenshots, and JVM dumps under the ignored `.stackanvil/` directory. Use a test account and review every redacted report before sharing it.

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
bun run capture ui screenshot java-connected --client java
```

Click and pixel coordinates are fractions of the chosen client window, from 0 to 1. `ui pixel` prints the red, green, and blue values at one point without changing focus. Use `--window-id` if more than one window matches. `ui key` accepts names such as `Escape`, `Return`, and `Control+b`. `ui key-hold`, `ui mouse-hold`, and `ui button-hold` hold input for 1 to 10000 ms on the private display. `button-hold` leaves the cursor in place. Use `bun run capture ui type "127.0.0.1"` to enter lowercase ASCII text, digits, spaces, periods, or hyphens in a focused field. A scenario JSON file can combine `mark`, `wait`, `screenshot`, `key`, `keyHold`, `type`, `click`, `mouseHold`, `buttonHold`, `videoStart`, and `videoStop` steps. Run the example with `bun run capture ui run scenarios/realm-hub-observe.json`.

For an integration run without a capture session, pass `--output-dir` to `ui screenshot`. The gameplay probe saves its screenshots under `.stackanvil/integration/runs/`.

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

The comparison MP4 shows the before recording on the left and the after recording on the right. `videoStart` and `videoStop` are also scenario steps, so a JSON recipe can record exactly the same input sequence in both runs. Videos stay in the ignored capture directory. Review them before sharing because game menus can show account or player details.

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
