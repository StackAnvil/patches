// SPDX-License-Identifier: GPL-3.0-or-later
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom, Write};
use std::os::fd::AsFd;
use std::os::unix::fs::OpenOptionsExt;
use std::os::unix::net::{UnixListener, UnixStream};
use std::process::{Command as ProcessCommand, Stdio};
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use signal_hook::{
    SigId,
    consts::{SIGINT, SIGTERM},
};
use wayland_client::globals::{GlobalListContents, registry_queue_init};
use wayland_client::protocol::{wl_registry, wl_seat};
use wayland_client::{Connection, Dispatch, QueueHandle, delegate_noop};
use wayland_protocols_misc::zwp_virtual_keyboard_v1::client::{
    zwp_virtual_keyboard_manager_v1, zwp_virtual_keyboard_v1,
};
use wayland_protocols_wlr::virtual_pointer::v1::client::{
    zwlr_virtual_pointer_manager_v1, zwlr_virtual_pointer_v1,
};
use xkbcommon::xkb;

use crate::{
    Result,
    command::{Button, Command, Point},
};

#[derive(Debug)]
pub struct Interrupted(pub usize);

impl std::fmt::Display for Interrupted {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "Input interrupted by signal {}", self.0)
    }
}

impl std::error::Error for Interrupted {}

struct Signals {
    signal: Arc<AtomicUsize>,
    handlers: Vec<SigId>,
    peer: Option<UnixStream>,
}

impl Signals {
    fn new() -> Result<Self> {
        let mut signals = Self {
            signal: Arc::new(AtomicUsize::new(0)),
            handlers: Vec::new(),
            peer: None,
        };
        for signal in [SIGINT, SIGTERM] {
            signals.handlers.push(signal_hook::flag::register_usize(
                signal,
                Arc::clone(&signals.signal),
                signal as usize,
            )?);
        }
        Ok(signals)
    }

    fn check(&self) -> Result<()> {
        if let Some(mut peer) = self.peer.as_ref() {
            match peer.read(&mut [0]) {
                Ok(0) => return Err("Input caller disconnected".into()),
                Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {}
                Ok(_) => return Err("Unexpected input request data".into()),
                Err(error) => return Err(error.into()),
            }
        }
        match self.signal.load(Ordering::Relaxed) {
            0 => Ok(()),
            signal => Err(Interrupted(signal).into()),
        }
    }

    fn wait(&self, milliseconds: u64) -> Result<()> {
        let end = Instant::now() + Duration::from_millis(milliseconds);
        loop {
            self.check()?;
            let remaining = end.saturating_duration_since(Instant::now());
            if remaining.is_zero() {
                return Ok(());
            }
            std::thread::sleep(remaining.min(Duration::from_millis(10)));
        }
    }
}

impl Drop for Signals {
    fn drop(&mut self) {
        for handler in &self.handlers {
            signal_hook::low_level::unregister(*handler);
        }
    }
}

/// Sway's IPC supplies window geometry and focus, which core Wayland intentionally omits.
fn ipc(kind: u32, payload: &str) -> Result<Value> {
    let socket = std::env::var("SWAYSOCK").map_err(
        |_| "Native capture requires Sway IPC (SWAYSOCK). Start the private lab display.",
    )?;
    let mut connection = UnixStream::connect(socket)?;
    connection.set_read_timeout(Some(Duration::from_secs(2)))?;
    connection.set_write_timeout(Some(Duration::from_secs(2)))?;
    connection.write_all(b"i3-ipc")?;
    connection.write_all(&(payload.len() as u32).to_le_bytes())?;
    connection.write_all(&kind.to_le_bytes())?;
    connection.write_all(payload.as_bytes())?;
    let mut header = [0; 14];
    connection.read_exact(&mut header)?;
    let size = u32::from_le_bytes(header[6..10].try_into()?);
    if &header[..6] != b"i3-ipc"
        || size > 16 * 1024 * 1024
        || u32::from_le_bytes(header[10..14].try_into()?) != kind
    {
        return Err("Invalid Sway IPC response".into());
    }
    let mut response = vec![0; size as usize];
    connection.read_exact(&mut response)?;
    Ok(serde_json::from_slice(&response)?)
}

fn sway(command: &str) -> Result<()> {
    let responses = ipc(0, command)?;
    let responses = responses
        .as_array()
        .ok_or("Invalid Sway command response")?;
    if responses.is_empty() || responses.iter().any(|result| result["success"] != true) {
        return Err(format!("Sway rejected {command}: {responses:?}").into());
    }
    Ok(())
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
struct WindowInfo {
    id: String,
    title: String,
    x: i32,
    y: i32,
    width: u16,
    height: u16,
    #[serde(skip)]
    focused: bool,
    #[serde(skip)]
    output: String,
}

impl WindowInfo {
    fn same_surface(&self, other: &Self) -> bool {
        self.id == other.id
            && self.x == other.x
            && self.y == other.y
            && self.width == other.width
            && self.height == other.height
            && self.focused == other.focused
            && self.output == other.output
    }
}

fn windows() -> Result<Vec<WindowInfo>> {
    fn visit(node: &Value, output: &str, result: &mut Vec<WindowInfo>) -> Result<()> {
        let output = if node["type"] == "output" {
            node["name"].as_str().unwrap_or("")
        } else {
            output
        };
        if node["shell"] == "xdg_shell" && node["visible"] == true {
            let rect = &node["rect"];
            let content = &node["window_rect"];
            let number = |value: &Value| value.as_i64().ok_or("Invalid Sway window geometry");
            result.push(WindowInfo {
                id: node["id"]
                    .as_u64()
                    .ok_or("Invalid Sway container ID")?
                    .to_string(),
                title: node["name"].as_str().unwrap_or("").to_string(),
                x: i32::try_from(number(&rect["x"])? + number(&content["x"])?)?,
                y: i32::try_from(number(&rect["y"])? + number(&content["y"])?)?,
                width: u16::try_from(number(&content["width"])?)?,
                height: u16::try_from(number(&content["height"])?)?,
                focused: node["focused"] == true,
                output: output.to_string(),
            });
        }
        for field in ["nodes", "floating_nodes"] {
            if let Some(children) = node[field].as_array() {
                for child in children {
                    visit(child, output, result)?;
                }
            }
        }
        Ok(())
    }
    let mut result = Vec::new();
    visit(&ipc(4, "")?, "", &mut result)?;
    Ok(result)
}

fn window(id: u64) -> Result<WindowInfo> {
    windows()?
        .into_iter()
        .find(|window| window.id == id.to_string())
        .ok_or_else(|| format!("Native Wayland window {id} is not visible").into())
}

fn focus(id: u64) -> Result<WindowInfo> {
    window(id)?;
    sway(&format!("[con_id={id}] focus"))?;
    let window = window(id)?;
    if !window.focused {
        return Err("The compositor did not focus the selected window".into());
    }
    Ok(window)
}

fn output(window: &WindowInfo) -> Result<(i32, i32, u32, u32)> {
    let outputs = ipc(3, "")?;
    let selected = outputs
        .as_array()
        .ok_or("Invalid Sway outputs")?
        .iter()
        .find(|output| output["name"].as_str() == Some(&window.output) && output["active"] == true)
        .ok_or("The selected window has no active output")?;
    if selected["scale"].as_f64() != Some(1.0) || selected["transform"] != "normal" {
        return Err("Capture requires output scale 1 and normal transform".into());
    }
    let rect = &selected["rect"];
    Ok((
        i32::try_from(rect["x"].as_i64().ok_or("Invalid output x")?)?,
        i32::try_from(rect["y"].as_i64().ok_or("Invalid output y")?)?,
        u32::try_from(rect["width"].as_u64().ok_or("Invalid output width")?)?,
        u32::try_from(rect["height"].as_u64().ok_or("Invalid output height")?)?,
    ))
}

fn capture_window(id: u64) -> Result<WindowInfo> {
    // Output capture must not include a different client's pixels. Only capture the
    // focused window and require its full content rectangle to fit on one output.
    let window = if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() == Ok("1") {
        focus(id)?
    } else {
        window(id)?
    };
    if !window.focused {
        return Err("Focus the selected window before capturing it".into());
    }
    let (x, y, width, height) = output(&window)?;
    if window.width == 0
        || window.height == 0
        || window.x < x
        || window.y < y
        || i64::from(window.x) + i64::from(window.width) > i64::from(x) + i64::from(width)
        || i64::from(window.y) + i64::from(window.height) > i64::from(y) + i64::from(height)
    {
        return Err("The entire window must fit on one output before capture".into());
    }
    Ok(window)
}

fn capture(id: u64) -> Result<Vec<u8>> {
    let before = capture_window(id)?;
    let result = ProcessCommand::new("grim")
        .args([
            "-s",
            "1",
            "-g",
            &format!(
                "{},{} {}x{}",
                before.x, before.y, before.width, before.height
            ),
            "-t",
            "ppm",
            "-",
        ])
        .output()
        .map_err(|error| format!("Cannot start grim: {error}"))?;
    if !result.status.success() {
        return Err(format!(
            "Wayland capture failed: {}",
            String::from_utf8_lossy(&result.stderr)
        )
        .into());
    }
    if !window(id)?.same_surface(&before) {
        return Err("Window changed during capture; retry the capture".into());
    }
    Ok(result.stdout)
}

#[derive(Default)]
struct InputState;
impl Dispatch<wl_registry::WlRegistry, GlobalListContents> for InputState {
    fn event(
        _: &mut Self,
        _: &wl_registry::WlRegistry,
        _: wl_registry::Event,
        _: &GlobalListContents,
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
    }
}
delegate_noop!(InputState: ignore wl_seat::WlSeat);
delegate_noop!(InputState: ignore zwlr_virtual_pointer_manager_v1::ZwlrVirtualPointerManagerV1);
delegate_noop!(InputState: ignore zwlr_virtual_pointer_v1::ZwlrVirtualPointerV1);
delegate_noop!(InputState: ignore zwp_virtual_keyboard_manager_v1::ZwpVirtualKeyboardManagerV1);
delegate_noop!(InputState: ignore zwp_virtual_keyboard_v1::ZwpVirtualKeyboardV1);

/// Releases go over the same Wayland connection as presses, including on errors.
struct Input {
    connection: Connection,
    queue: wayland_client::EventQueue<InputState>,
    pointer: zwlr_virtual_pointer_v1::ZwlrVirtualPointerV1,
    keyboard: zwp_virtual_keyboard_v1::ZwpVirtualKeyboardV1,
    keymap: xkb::Keymap,
    state: xkb::State,
    keys: Vec<u32>,
    buttons: Vec<u32>,
    start: Instant,
}

impl Input {
    fn new() -> Result<Self> {
        let connection = Connection::connect_to_env()
            .map_err(|error| format!("Cannot connect to the native Wayland display: {error}"))?;
        let (globals, mut queue) = registry_queue_init::<InputState>(&connection)?;
        let qh = queue.handle();
        let seat: wl_seat::WlSeat = globals
            .bind(&qh, 1..=7, ())
            .map_err(|_| "The compositor does not expose a Wayland seat")?;
        let pointers: zwlr_virtual_pointer_manager_v1::ZwlrVirtualPointerManagerV1 =
            globals.bind(&qh, 1..=2, ())
                .map_err(|_| "The compositor does not support the Wayland virtual-pointer protocol. Use the private lab display.")?;
        let keyboards: zwp_virtual_keyboard_manager_v1::ZwpVirtualKeyboardManagerV1 =
            globals.bind(&qh, 1..=1, ())
                .map_err(|_| "The compositor does not support the Wayland virtual-keyboard protocol. Use the private lab display.")?;
        let pointer = pointers.create_virtual_pointer(Some(&seat), &qh, ());
        let keyboard = keyboards.create_virtual_keyboard(&seat, &qh, ());
        let context = xkb::Context::new(xkb::CONTEXT_NO_FLAGS);
        let keymap = xkb::Keymap::new_from_names(
            &context,
            "evdev",
            "pc105",
            "us",
            "",
            None,
            xkb::KEYMAP_COMPILE_NO_FLAGS,
        )
        .ok_or("Cannot compile the lab's US keyboard map")?;
        let text = keymap.get_as_string(xkb::KEYMAP_FORMAT_TEXT_V1) + "\0";
        let mut file = tempfile::tempfile()?;
        file.write_all(text.as_bytes())?;
        file.seek(SeekFrom::Start(0))?;
        keyboard.keymap(1, file.as_fd(), text.len().try_into()?);
        queue.roundtrip(&mut InputState)?;
        let state = xkb::State::new(&keymap);
        Ok(Self {
            connection,
            queue,
            pointer,
            keyboard,
            keymap,
            state,
            keys: Vec::new(),
            buttons: Vec::new(),
            start: Instant::now(),
        })
    }

    fn time(&self) -> u32 {
        self.start.elapsed().as_millis() as u32
    }

    fn sync(&mut self) -> Result<()> {
        self.queue.roundtrip(&mut InputState)?;
        Ok(())
    }

    fn position(&mut self, window: &WindowInfo, point: Point) -> Result<()> {
        if !point.fits(window.width, window.height) {
            return Err("Point is outside the window".into());
        }
        let (x, y, width, height) = output(window)?;
        let px = i64::from(window.x) + i64::from(point.x) - i64::from(x);
        let py = i64::from(window.y) + i64::from(point.y) - i64::from(y);
        if px < 0 || py < 0 || px >= i64::from(width) || py >= i64::from(height) {
            return Err("Pointer position is outside the selected output".into());
        }
        // Associate absolute coordinates with this output, rather than the desktop
        // bounding box. The private lab has exactly one output at scale 1.
        let outputs = ipc(3, "")?;
        if outputs
            .as_array()
            .ok_or("Invalid outputs")?
            .iter()
            .filter(|output| output["active"] == true)
            .count()
            != 1
        {
            return Err("Absolute input requires exactly one active output".into());
        }
        self.pointer
            .motion_absolute(self.time(), px.try_into()?, py.try_into()?, width, height);
        self.pointer.frame();
        self.sync()
    }

    fn button(&mut self, button: Button) -> Result<()> {
        let code = match button {
            Button::Left => 272,
            Button::Right => 273,
        };
        self.buttons.push(code);
        self.pointer.button(
            self.time(),
            code,
            wayland_client::protocol::wl_pointer::ButtonState::Pressed,
        );
        self.pointer.frame();
        self.sync()
    }

    fn hold(&self, signals: &Signals, selected: &WindowInfo, duration: u64) -> Result<()> {
        let deadline = Instant::now() + Duration::from_millis(duration);
        loop {
            signals.check()?;
            if !window(selected.id.parse()?)?.same_surface(selected) {
                return Err("Window changed while holding input".into());
            }
            let remaining = deadline.saturating_duration_since(Instant::now());
            if remaining.is_zero() {
                return Ok(());
            }
            signals.wait(remaining.as_millis().min(50) as u64)?;
        }
    }

    fn keycode(&self, name: &str) -> Result<u32> {
        let name = match name {
            "Control" | "Ctrl" => "Control_L",
            "Shift" => "Shift_L",
            "Alt" => "Alt_L",
            "Super" | "Meta" => "Super_L",
            "Enter" => "Return",
            "Space" => "space",
            other => other,
        };
        let symbol = xkb::keysym_from_name(name, xkb::KEYSYM_NO_FLAGS);
        if symbol.raw() != 0 {
            for code in self.keymap.min_keycode().raw()..=self.keymap.max_keycode().raw() {
                if self
                    .keymap
                    .key_get_syms_by_level(code.into(), 0, 0)
                    .contains(&symbol)
                {
                    return Ok(code - 8);
                }
            }
        }
        Err(format!("Unknown or shifted key: {name}. Use a modifier chord such as Shift+a.").into())
    }

    fn modifiers(&self) {
        self.keyboard.modifiers(
            self.state.serialize_mods(xkb::STATE_MODS_DEPRESSED),
            self.state.serialize_mods(xkb::STATE_MODS_LATCHED),
            self.state.serialize_mods(xkb::STATE_MODS_LOCKED),
            0,
        );
    }

    fn press_key(&mut self, code: u32) -> Result<()> {
        if self.keys.contains(&code) {
            return Err("A key appears twice in the chord".into());
        }
        self.keys.push(code);
        self.keyboard.key(self.time(), code, 1);
        self.state
            .update_key((code + 8).into(), xkb::KeyDirection::Down);
        self.modifiers();
        self.sync()
    }

    fn release(&mut self) -> Result<()> {
        while let Some(code) = self.keys.pop() {
            self.keyboard.key(self.time(), code, 0);
            self.state
                .update_key((code + 8).into(), xkb::KeyDirection::Up);
            self.modifiers();
        }
        while let Some(code) = self.buttons.pop() {
            self.pointer.button(
                self.time(),
                code,
                wayland_client::protocol::wl_pointer::ButtonState::Released,
            );
            self.pointer.frame();
        }
        self.sync()
    }
}

impl Drop for Input {
    fn drop(&mut self) {
        let _ = self.release();
        self.keyboard.destroy();
        self.pointer.destroy();
        let _ = self.connection.flush();
    }
}

fn with_input(
    id: u64,
    signals: &Signals,
    device: &mut Option<Input>,
    action: impl FnOnce(&mut Input, &WindowInfo) -> Result<()>,
) -> Result<()> {
    signals.check()?;
    let window = focus(id)?;
    if device.is_none() {
        *device = Some(Input::new()?);
    }
    let input = device.as_mut().ok_or("Missing Wayland input devices")?;
    let result = action(input, &window);
    let release = input.release();
    result?;
    release?;
    signals.check()
}

fn pixel(bytes: &[u8], point: Point) -> Result<[u8; 3]> {
    // grim emits P6 with a single whitespace byte after the max sample value.
    let mut index = 0;
    let mut token = || -> Result<&[u8]> {
        while bytes.get(index).is_some_and(u8::is_ascii_whitespace) {
            index += 1;
        }
        let begin = index;
        while bytes
            .get(index)
            .is_some_and(|byte| !byte.is_ascii_whitespace())
        {
            index += 1;
        }
        if begin == index {
            return Err("Truncated PPM header".into());
        }
        Ok(&bytes[begin..index])
    };
    if token()? != b"P6" {
        return Err("Invalid PPM image".into());
    }
    let width: u16 = std::str::from_utf8(token()?)?.parse()?;
    let height: u16 = std::str::from_utf8(token()?)?.parse()?;
    if token()? != b"255" || !point.fits(width, height) {
        return Err("Invalid pixel bounds or image depth".into());
    }
    let begin = index + 1 + (usize::from(point.y) * usize::from(width) + usize::from(point.x)) * 3;
    Ok(bytes
        .get(begin..begin + 3)
        .ok_or("Truncated PPM pixels")?
        .try_into()?)
}

fn record(id: u64, fps: u16, path: &std::path::Path, signals: &Signals) -> Result<()> {
    if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() != Ok("1") {
        return Err("Recording requires the private Wayland display".into());
    }
    let before = capture_window(id)?;
    OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .open(path)?;
    let mut child = ProcessCommand::new("wf-recorder")
        .args([
            "--no-dmabuf",
            "--no-damage",
            "-g",
            &format!(
                "{},{} {}x{}",
                before.x, before.y, before.width, before.height
            ),
            "-r",
            &fps.to_string(),
            "-c",
            "libx264",
            "-p",
            "preset=ultrafast",
            "-p",
            "crf=24",
            "-x",
            "yuv420p",
            "-y",
            "-f",
        ])
        .arg(path)
        .stdin(Stdio::null())
        .spawn()
        .map_err(|error| format!("Cannot start wf-recorder: {error}"))?;
    let result = (|| {
        loop {
            if let Some(status) = child.try_wait()? {
                return Err(format!("Wayland recorder exited unexpectedly: {status}").into());
            }
            if signals.check().is_err() {
                return Ok(());
            }
            if !window(id)?.same_surface(&before) {
                return Err(
                    "The recorded window moved, resized, lost focus, or closed; recording stopped"
                        .into(),
                );
            }
            if signals.wait(50).is_err() {
                return Ok(());
            }
        }
    })();
    // Ask the encoder to finalize its container even when the window disappears.
    let _ = ProcessCommand::new("kill")
        .args(["-INT", &child.id().to_string()])
        .status();
    let deadline = Instant::now() + Duration::from_secs(10);
    while child.try_wait()?.is_none() {
        if Instant::now() >= deadline {
            child.kill()?;
            child.wait()?;
            return Err("Wayland recorder did not stop within 10 seconds".into());
        }
        std::thread::sleep(Duration::from_millis(25));
    }
    result
}

fn is_input(command: &Command) -> bool {
    matches!(
        command,
        Command::Move { .. }
            | Command::Look { .. }
            | Command::Click { .. }
            | Command::ButtonHold { .. }
            | Command::Key { .. }
            | Command::Type { .. }
            | Command::Drag { .. }
    )
}

#[derive(Deserialize, Serialize)]
struct Reply {
    code: u8,
    error: Option<String>,
}

fn serve(path: &std::path::Path) -> Result<()> {
    if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() != Ok("1") {
        return Err("The input service requires the private Wayland display".into());
    }
    let mut device = Some(Input::new()?);
    let listener = UnixListener::bind(path)?;
    std::fs::set_permissions(path, std::os::unix::fs::PermissionsExt::from_mode(0o600))?;
    listener.set_nonblocking(true)?;
    let mut signals = Signals::new()?;
    let result = (|| {
        loop {
            signals.check()?;
            let (mut stream, _) = match listener.accept() {
                Ok(client) => client,
                Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                    signals.wait(10)?;
                    continue;
                }
                Err(error) => return Err(error.into()),
            };
            stream.set_read_timeout(Some(Duration::from_secs(2)))?;
            let mut request = String::new();
            let read = BufReader::new((&stream).take(16384)).read_line(&mut request);
            let result = (|| {
                read?;
                let args: Vec<String> = serde_json::from_str(&request)?;
                let command = Command::parse(&args)?;
                if !is_input(&command) {
                    return Err("The input service accepts only input commands".into());
                }
                stream.set_nonblocking(true)?;
                signals.peer = Some(stream.try_clone()?);
                execute(command, &signals, &mut device)
            })();
            signals.peer = None;
            let reply = match result {
                Ok(()) => Reply {
                    code: 0,
                    error: None,
                },
                Err(error) => Reply {
                    code: error
                        .downcast_ref::<Interrupted>()
                        .map_or(1, |error| 128 + error.0 as u8),
                    error: Some(error.to_string()),
                },
            };
            let _ = writeln!(stream, "{}", serde_json::to_string(&reply)?);
        }
    })();
    drop(device);
    std::fs::remove_file(path)?;
    result
}

fn remote_input(socket: &std::path::Path, signals: &Signals) -> Result<()> {
    let mut stream = UnixStream::connect(socket)
        .map_err(|error| format!("Cannot connect to the private Wayland input service: {error}"))?;
    stream.set_write_timeout(Some(Duration::from_secs(2)))?;
    writeln!(
        stream,
        "{}",
        serde_json::to_string(&std::env::args().skip(1).collect::<Vec<_>>())?
    )?;
    stream.set_read_timeout(Some(Duration::from_millis(50)))?;
    let mut response = Vec::new();
    loop {
        signals.check()?;
        let mut buffer = [0; 1024];
        match stream.read(&mut buffer) {
            Ok(0) => return Err("The Wayland input service disconnected".into()),
            Ok(count) => {
                response.extend_from_slice(&buffer[..count]);
                if response.len() > 16384 {
                    return Err("Invalid input service response".into());
                }
                if response.ends_with(b"\n") {
                    break;
                }
            }
            Err(error)
                if matches!(
                    error.kind(),
                    std::io::ErrorKind::TimedOut
                        | std::io::ErrorKind::WouldBlock
                        | std::io::ErrorKind::Interrupted
                ) => {}
            Err(error) => return Err(error.into()),
        }
    }
    let reply: Reply = serde_json::from_slice(&response)?;
    if reply.code != 0 {
        return Err(reply
            .error
            .unwrap_or_else(|| "Wayland input failed".into())
            .into());
    }
    Ok(())
}

pub fn run(command: Command) -> Result<()> {
    if std::env::var_os("WAYLAND_DISPLAY").is_none_or(|value| value.is_empty()) {
        return Err(
            "Set WAYLAND_DISPLAY to the native Wayland display. X11 and XWayland are unsupported."
                .into(),
        );
    }
    if let Command::Serve { path } = command {
        return serve(&path);
    }
    let signals = Signals::new()?;
    if is_input(&command) {
        if let Some(socket) = std::env::var_os("STACKANVIL_INPUT_SOCKET") {
            return remote_input(std::path::Path::new(&socket), &signals);
        }
        if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() == Ok("1") {
            return Err("Start the private Wayland input service before sending input".into());
        }
    }
    execute(command, &signals, &mut None)
}

fn execute(command: Command, signals: &Signals, device: &mut Option<Input>) -> Result<()> {
    match command {
        Command::Serve { .. } => return Err("Cannot nest an input service".into()),
        Command::List => println!("{}", serde_json::to_string(&windows()?)?),
        Command::Active => println!(
            "{}",
            windows()?
                .iter()
                .find(|window| window.focused)
                .ok_or("No focused Wayland window")?
                .id
        ),
        Command::Focus { window } => {
            focus(window)?;
        }
        Command::Pixel { window, point } => {
            let rgb = pixel(&capture(window)?, point)?;
            println!("{} {} {}", rgb[0], rgb[1], rgb[2]);
        }
        Command::Screenshot { window, path } => {
            let bytes = capture(window)?;
            let mut file = OpenOptions::new()
                .write(true)
                .create_new(true)
                .mode(0o600)
                .open(path)?;
            file.write_all(&bytes)?;
        }
        Command::Record { window, fps, path } => record(window, fps, &path, signals)?,
        Command::Resize {
            window: id,
            width,
            height,
            position,
        } => {
            if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() != Ok("1") {
                return Err("Resizing requires the private Wayland display".into());
            }
            let current = window(id)?;
            let (x, y, output_width, output_height) = output(&current)?;
            let point = position.unwrap_or(Point { x: 0, y: 0 });
            if u32::from(point.x) + u32::from(width) > output_width
                || u32::from(point.y) + u32::from(height) > output_height
            {
                return Err("Window placement exceeds the output".into());
            }
            sway(&format!(
                "[con_id={id}] fullscreen disable, floating enable, border none, resize set {width} px {height} px, move position {} px {} px",
                x + i32::from(point.x),
                y + i32::from(point.y)
            ))?;
        }
        Command::Move { window, point } => with_input(window, signals, device, |input, window| {
            input.position(window, point)
        })?,
        Command::Look { window, dx, dy } => with_input(window, signals, device, |input, _| {
            input
                .pointer
                .motion(input.time(), f64::from(dx), f64::from(dy));
            input.pointer.frame();
            input.sync()
        })?,
        Command::Click {
            window,
            point,
            button,
            duration,
            repeats,
        } => with_input(window, signals, device, |input, window| {
            for _ in 0..repeats {
                input.position(window, point)?;
                input.button(button)?;
                input.hold(signals, window, duration)?;
                input.release()?;
                if repeats > 1 {
                    signals.wait(70)?;
                }
            }
            Ok(())
        })?,
        Command::ButtonHold {
            window,
            button,
            duration,
        } => with_input(window, signals, device, |input, window| {
            input.button(button)?;
            input.hold(signals, window, duration)
        })?,
        Command::Key {
            window,
            names,
            duration,
            repeats,
        } => with_input(window, signals, device, |input, window| {
            let codes = names
                .iter()
                .map(|name| input.keycode(name))
                .collect::<Result<Vec<_>>>()?;
            for _ in 0..repeats {
                for code in &codes {
                    input.press_key(*code)?;
                }
                input.hold(signals, window, duration)?;
                input.release()?;
                if repeats > 1 {
                    signals.wait(70)?;
                }
            }
            Ok(())
        })?,
        Command::Type { window, text } => with_input(window, signals, device, |input, _| {
            let codes = text
                .chars()
                .map(|character| {
                    input.keycode(match character {
                        ' ' => "space",
                        '.' => "period",
                        '-' => "minus",
                        _ => return input.keycode(&character.to_string()),
                    })
                })
                .collect::<Result<Vec<_>>>()?;
            for code in codes {
                signals.check()?;
                input.press_key(code)?;
                input.release()?;
            }
            Ok(())
        })?,
        Command::Drag {
            window,
            button,
            dwell,
            points,
        } => with_input(window, signals, device, |input, selected| {
            for point in &points {
                if !point.fits(selected.width, selected.height) {
                    return Err("Drag point is outside the window".into());
                }
            }
            input.position(selected, points[0])?;
            input.button(button)?;
            for point in points {
                if window_info_changed(window, selected)? {
                    return Err("Window changed during drag".into());
                }
                signals.check()?;
                input.position(selected, point)?;
                signals.wait(dwell)?;
            }
            Ok(())
        })?,
    }
    Ok(())
}

fn window_info_changed(id: u64, before: &WindowInfo) -> Result<bool> {
    Ok(!window(id)?.same_surface(before))
}
