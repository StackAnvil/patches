// SPDX-License-Identifier: GPL-3.0-or-later
#![cfg(test)]
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::os::fd::AsFd;
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Output, Stdio};
use std::time::{Duration, Instant};

use serde_json::{Value, json};
use tempfile::TempDir;
use wayland_client::globals::{GlobalListContents, registry_queue_init};
use wayland_client::protocol::{
    wl_buffer, wl_callback, wl_compositor, wl_keyboard, wl_pointer, wl_registry, wl_seat, wl_shm,
    wl_shm_pool, wl_surface,
};
use wayland_client::{Connection, Dispatch, QueueHandle, delegate_noop};
use wayland_protocols::wp::pointer_constraints::zv1::client::{
    zwp_locked_pointer_v1, zwp_pointer_constraints_v1,
};
use wayland_protocols::wp::relative_pointer::zv1::client::{
    zwp_relative_pointer_manager_v1, zwp_relative_pointer_v1,
};
use wayland_protocols::xdg::shell::client::{xdg_surface, xdg_toplevel, xdg_wm_base};

struct Process(Child);
impl Drop for Process {
    fn drop(&mut self) {
        // The fixture process may have already exited during cleanup.
        drop(self.0.kill());
        // Fixture cleanup must not panic if waiting fails.
        drop(self.0.wait());
    }
}

struct Lab {
    // Processes must stop before their sockets and fixtures are removed.
    client: Process,
    _input: Process,
    _sway: Process,
    runtime: TempDir,
    directory: TempDir,
    socket: PathBuf,
    display: PathBuf,
    id: String,
}

#[track_caller]
fn until(mut condition: impl FnMut() -> bool) {
    let deadline = Instant::now() + Duration::from_secs(10);
    while !condition() {
        assert!(Instant::now() < deadline, "Wayland condition timed out");
        std::thread::sleep(Duration::from_millis(15));
    }
}

impl Drop for Lab {
    fn drop(&mut self) {
        if std::thread::panicking() {
            for name in [
                "sway.log",
                "input.log",
                "client.log",
                "events.jsonl",
                "record.log",
            ] {
                eprintln!(
                    "{name}: {}",
                    std::fs::read_to_string(self.directory.path().join(name)).unwrap_or_default()
                );
            }
        }
    }
}

impl Lab {
    #[expect(
        clippy::too_many_lines,
        reason = "Keep compositor startup and fixture setup in lifecycle order"
    )]
    fn new() -> Self {
        let parent =
            Path::new(env!("CARGO_MANIFEST_DIR")).join("../../.stackanvil/tools/wayland-tests");
        std::fs::create_dir_all(&parent).unwrap();
        let directory = tempfile::tempdir_in(parent).unwrap();
        let runtime = tempfile::Builder::new()
            .prefix("sa-wl-")
            .tempdir_in(
                std::env::var_os("XDG_RUNTIME_DIR").map_or_else(std::env::temp_dir, PathBuf::from),
            )
            .unwrap();
        std::fs::set_permissions(runtime.path(), std::fs::Permissions::from_mode(0o700)).unwrap();
        let socket = runtime.path().join("sway.sock");
        let config = directory.path().join("sway.conf");
        std::fs::write(&config, "xwayland disable\nswaybg_command -\nswaynag_command -\noutput HEADLESS-1 mode 1280x720@120Hz\noutput * scale 1\nseat seat0 fallback true\ninput * xkb_layout us\ninput * pointer_accel 0\ninput * accel_profile flat\nfor_window [all] floating enable, border none\nfocus_follows_mouse no\n").unwrap();
        let log = File::create(directory.path().join("sway.log")).unwrap();
        let sway = Process(
            Command::new(std::env::var_os("CAPTURE_WAYLAND_SWAY").unwrap_or_else(|| "sway".into()))
                .args(["--unsupported-gpu", "--config"])
                .arg(&config)
                .env("XDG_RUNTIME_DIR", runtime.path())
                .env("SWAYSOCK", &socket)
                .env_remove("DISPLAY")
                .env_remove("WAYLAND_DISPLAY")
                .env_remove("WAYLAND_SOCKET")
                .env("WLR_BACKENDS", "headless")
                .env("WLR_HEADLESS_OUTPUTS", "1")
                .env("WLR_LIBINPUT_NO_DEVICES", "1")
                .env("WLR_RENDERER", "pixman")
                .stdin(Stdio::null())
                .stdout(log.try_clone().unwrap())
                .stderr(log)
                .spawn()
                .expect("Install Sway for native tests"),
        );
        let mut display = None;
        until(|| {
            display = std::fs::read_dir(runtime.path())
                .unwrap()
                .flatten()
                .find(|entry| {
                    entry.file_name().to_string_lossy().starts_with("wayland-")
                        && !entry.file_name().to_string_lossy().ends_with(".lock")
                })
                .map(|entry| entry.path());
            socket.exists() && display.is_some()
        });
        let display = display.unwrap();
        let input_socket = runtime.path().join("input.sock");
        let input_log = File::create(directory.path().join("input.log")).unwrap();
        let input = Process(
            Command::new(env!("CARGO_BIN_EXE_capture-wayland"))
                .arg("serve")
                .arg(&input_socket)
                .env("WAYLAND_DISPLAY", &display)
                .env("SWAYSOCK", &socket)
                .env("STACKANVIL_UI_ISOLATED", "1")
                .env_remove("WAYLAND_SOCKET")
                .env_remove("DISPLAY")
                .stdout(input_log.try_clone().unwrap())
                .stderr(input_log)
                .spawn()
                .unwrap(),
        );
        until(|| input_socket.exists());
        let log = File::create(directory.path().join("client.log")).unwrap();
        let client = Process(
            Command::new(std::env::current_exe().unwrap())
                .args(["--ignored", "--exact", "fixture_client", "--nocapture"])
                .env(
                    "STACKANVIL_WAYLAND_FIXTURE",
                    directory.path().join("events.jsonl"),
                )
                .env("WAYLAND_DISPLAY", &display)
                .env_remove("WAYLAND_SOCKET")
                .env_remove("DISPLAY")
                .stdout(log.try_clone().unwrap())
                .stderr(log)
                .spawn()
                .unwrap(),
        );
        let mut lab = Self {
            client,
            _input: input,
            _sway: sway,
            runtime,
            directory,
            socket,
            display,
            id: String::new(),
        };
        until(|| {
            let output = lab.command(&["list"]);
            if !output.status.success() {
                return false;
            }
            let windows: Value = serde_json::from_slice(&output.stdout).unwrap();
            if let Some(id) = windows
                .as_array()
                .unwrap()
                .iter()
                .find(|window| window["title"] == "StackAnvil Wayland fixture")
                .and_then(|window| window["id"].as_str())
            {
                lab.id = id.to_string();
                return lab.events().iter().any(|event| event["frame"] == true);
            }
            false
        });
        lab
    }

    fn process(&self, args: &[&str]) -> Command {
        let mut command = Command::new(env!("CARGO_BIN_EXE_capture-wayland"));
        command
            .args(args)
            .env("WAYLAND_DISPLAY", &self.display)
            .env("SWAYSOCK", &self.socket)
            .env("STACKANVIL_UI_ISOLATED", "1")
            .env(
                "STACKANVIL_INPUT_SOCKET",
                self.runtime.path().join("input.sock"),
            )
            .env_remove("WAYLAND_SOCKET")
            .env_remove("DISPLAY");
        command
    }
    fn command(&self, args: &[&str]) -> Output {
        self.process(args).output().unwrap()
    }
    fn run(&self, args: &[&str]) -> String {
        let output = self.command(args);
        assert!(
            output.status.success(),
            "{args:?}: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        String::from_utf8(output.stdout).unwrap()
    }
    fn events(&self) -> Vec<Value> {
        std::fs::read_to_string(self.directory.path().join("events.jsonl"))
            .unwrap_or_default()
            .lines()
            .filter_map(|line| serde_json::from_str(line).ok())
            .collect()
    }
}

#[test]
#[ignore = "requires Sway and grim; run bun run test:capture:native"]
#[expect(
    clippy::too_many_lines,
    reason = "The test verifies capture, input, and cleanup in the same compositor session"
)]
fn native_input_capture_and_interrupt_cleanup() {
    let lab = Lab::new();
    assert_eq!(lab.run(&["active"]).trim(), lab.id);
    assert_eq!(
        lab.run(&["pixel", &lab.id, "100", "100"]).trim(),
        "32 96 160"
    );
    let screenshot = lab.directory.path().join("capture.ppm");
    lab.run(&["screenshot", &lab.id, screenshot.to_str().unwrap()]);
    assert_eq!(
        std::fs::metadata(&screenshot).unwrap().permissions().mode() & 0o777,
        0o600
    );
    assert!(
        !lab.command(&["screenshot", &lab.id, screenshot.to_str().unwrap()])
            .status
            .success()
    );
    lab.run(&["move", &lab.id, "50", "60"]);
    lab.run(&["click", &lab.id, "100", "110", "right"]);
    until(|| {
        lab.events()
            .iter()
            .any(|event| event["button"] == 273 && event["state"] == 0)
    });
    lab.run(&["type", &lab.id, "a0 .-"]);
    lab.run(&["key", &lab.id, "Control+b"]);
    lab.run(&["double-key", &lab.id, "space"]);
    lab.run(&["look", &lab.id, "-17", "9"]);
    until(|| {
        lab.events()
            .iter()
            .any(|event| event["dx"] == -17.0 && event["dy"] == 9.0)
    });
    let events = lab.events();
    let keys: Vec<u64> = events
        .iter()
        .filter(|event| event["state"] == 1)
        .filter_map(|event| event["key"].as_u64())
        .collect();
    assert_eq!(keys, vec![30, 11, 57, 52, 12, 29, 48, 57, 57]);
    assert!(events.iter().any(|event| {
        event["modifiers"]
            .as_u64()
            .is_some_and(|mask| mask & 4 != 0)
    }));
    let before = lab.events().len();
    let mut held = Process(
        lab.process(&["key-hold", &lab.id, "d", "10000"])
            .spawn()
            .unwrap(),
    );
    until(|| {
        lab.events()[before..]
            .iter()
            .any(|event| event["key"] == 32 && event["state"] == 1)
    });
    assert!(
        Command::new("kill")
            .args(["-TERM", &held.0.id().to_string()])
            .status()
            .unwrap()
            .success()
    );
    let status = held.0.wait().unwrap();
    assert_eq!(status.code(), Some(143));
    until(|| {
        lab.events()[before..]
            .iter()
            .any(|event| event["key"] == 32 && event["state"] == 0)
    });
    let before = lab.events().len();
    let mut drag = Process(
        lab.process(&[
            "drag", &lab.id, "left", "1000", "10", "10", "20", "20", "30", "30",
        ])
        .spawn()
        .unwrap(),
    );
    until(|| {
        lab.events()[before..]
            .iter()
            .any(|event| event["button"] == 272 && event["state"] == 1)
    });
    assert!(
        Command::new("kill")
            .args(["-INT", &drag.0.id().to_string()])
            .status()
            .unwrap()
            .success()
    );
    assert_eq!(drag.0.wait().unwrap().code(), Some(130));
    until(|| {
        lab.events()[before..]
            .iter()
            .any(|event| event["button"] == 272 && event["state"] == 0)
    });
    assert!(
        !lab.command(&["drag", &lab.id, "left", "100", "10", "10", "65000", "10"])
            .status
            .success()
    );
    lab.run(&["key", &lab.id, "l"]);
    until(|| lab.events().iter().any(|event| event["locked"] == true));
    let before = lab.events().len();
    lab.run(&["look", &lab.id, "12", "-7"]);
    until(|| {
        lab.events()[before..]
            .iter()
            .any(|event| event["dx"] == 12.0 && event["dy"] == -7.0)
    });
    assert!(
        !lab.events()[before..]
            .iter()
            .any(|event| event.get("x").is_some())
    );
    lab.run(&["key", &lab.id, "l"]);
    lab.run(&["resize", &lab.id, "800", "450", "20", "30"]);
    until(|| {
        let windows: Value = serde_json::from_str(&lab.run(&["list"])).unwrap();
        windows[0]["width"] == 800
            && windows[0]["height"] == 450
            && windows[0]["x"] == 20
            && windows[0]["y"] == 30
    });
    assert_eq!(
        lab.run(&["pixel", &lab.id, "799", "449"]).trim(),
        "32 96 160"
    );
    let output = Command::new(env!("CARGO_BIN_EXE_capture-wayland"))
        .arg("list")
        .env_remove("WAYLAND_DISPLAY")
        .env("DISPLAY", ":123")
        .output()
        .unwrap();
    assert!(!output.status.success());
    assert!(String::from_utf8_lossy(&output.stderr).contains("X11 and XWayland are unsupported"));
}

#[test]
#[ignore = "requires Sway, grim, wf-recorder, and ffprobe"]
fn recording_finalizes_and_stops_when_the_selected_window_disappears() {
    let mut lab = Lab::new();
    let path = lab.directory.path().join("recording.mp4");
    let log = File::create(lab.directory.path().join("record.log")).unwrap();
    let mut recorder = Process(
        lab.process(&["record", &lab.id, "30", path.to_str().unwrap()])
            .stdout(log.try_clone().unwrap())
            .stderr(log)
            .spawn()
            .unwrap(),
    );
    until(|| std::fs::metadata(&path).is_ok_and(|metadata| metadata.len() > 0));
    std::thread::sleep(Duration::from_millis(500));
    assert!(
        Command::new("kill")
            .args(["-INT", &recorder.0.id().to_string()])
            .status()
            .unwrap()
            .success()
    );
    assert!(recorder.0.wait().unwrap().success());
    let probe = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "json",
        ])
        .arg(&path)
        .output()
        .unwrap();
    assert!(
        probe.status.success(),
        "{}",
        String::from_utf8_lossy(&probe.stderr)
    );
    let probe: Value = serde_json::from_slice(&probe.stdout).unwrap();
    assert_eq!(probe["streams"][0]["width"], 640);
    assert_eq!(probe["streams"][0]["height"], 360);
    assert_eq!(
        std::fs::metadata(&path).unwrap().permissions().mode() & 0o777,
        0o600
    );
    assert!(
        !lab.command(&["record", &lab.id, "30", path.to_str().unwrap()])
            .status
            .success()
    );
    let path = lab.directory.path().join("closed.mp4");
    let mut recorder = Process(
        lab.process(&["record", &lab.id, "30", path.to_str().unwrap()])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .unwrap(),
    );
    until(|| std::fs::metadata(&path).is_ok_and(|metadata| metadata.len() > 0));
    lab.client.0.kill().unwrap();
    lab.client.0.wait().unwrap();
    until(|| recorder.0.try_wait().unwrap().is_some());
    assert!(!recorder.0.wait().unwrap().success());
}

#[derive(Default)]
struct App {
    surface: Option<wl_surface::WlSurface>,
    shm: Option<wl_shm::WlShm>,
    width: i32,
    height: i32,
    activated: bool,
    constraints: Option<zwp_pointer_constraints_v1::ZwpPointerConstraintsV1>,
    pointer: Option<wl_pointer::WlPointer>,
    lock: Option<zwp_locked_pointer_v1::ZwpLockedPointerV1>,
    log: Option<File>,
}
impl App {
    fn event(&mut self, event: &Value) {
        writeln!(self.log.as_mut().unwrap(), "{event}").unwrap();
    }
    fn draw(&self, qh: &QueueHandle<Self>) {
        let mut file = tempfile::tempfile().unwrap();
        let size = (self.width * self.height * 4).try_into().unwrap();
        let pixels: Vec<u8> = [160, 96, 32, 255].into_iter().cycle().take(size).collect();
        file.write_all(&pixels).unwrap();
        let pool = self.shm.as_ref().unwrap().create_pool(
            file.as_fd(),
            i32::try_from(size).unwrap(),
            qh,
            (),
        );
        let buffer = pool.create_buffer(
            0,
            self.width,
            self.height,
            self.width * 4,
            wl_shm::Format::Xrgb8888,
            qh,
            (),
        );
        let surface = self.surface.as_ref().unwrap();
        surface.frame(qh, self.activated);
        surface.attach(Some(&buffer), 0, 0);
        surface.damage_buffer(0, 0, self.width, self.height);
        surface.commit();
        pool.destroy();
    }
}
impl Dispatch<wl_registry::WlRegistry, GlobalListContents> for App {
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
impl Dispatch<wl_callback::WlCallback, bool> for App {
    fn event(
        state: &mut Self,
        _: &wl_callback::WlCallback,
        _: wl_callback::Event,
        activated: &bool,
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        state.event(&json!({"frame":activated}));
    }
}
impl Dispatch<xdg_wm_base::XdgWmBase, ()> for App {
    fn event(
        _: &mut Self,
        base: &xdg_wm_base::XdgWmBase,
        event: xdg_wm_base::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let xdg_wm_base::Event::Ping { serial } = event {
            base.pong(serial);
        }
    }
}
impl Dispatch<xdg_toplevel::XdgToplevel, ()> for App {
    fn event(
        state: &mut Self,
        _: &xdg_toplevel::XdgToplevel,
        event: xdg_toplevel::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let xdg_toplevel::Event::Configure {
            width,
            height,
            states,
        } = event
        {
            state.activated = states
                .chunks_exact(4)
                .any(|value| value == u32::from(xdg_toplevel::State::Activated).to_ne_bytes());
            if width > 0 {
                state.width = width;
            }
            if height > 0 {
                state.height = height;
            }
        }
    }
}
impl Dispatch<xdg_surface::XdgSurface, ()> for App {
    fn event(
        state: &mut Self,
        surface: &xdg_surface::XdgSurface,
        event: xdg_surface::Event,
        (): &(),
        _: &Connection,
        qh: &QueueHandle<Self>,
    ) {
        if let xdg_surface::Event::Configure { serial } = event {
            surface.ack_configure(serial);
            state.draw(qh);
        }
    }
}
impl Dispatch<wl_pointer::WlPointer, ()> for App {
    fn event(
        state: &mut Self,
        _: &wl_pointer::WlPointer,
        event: wl_pointer::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        #[expect(
            clippy::wildcard_enum_match_arm,
            reason = "The fixture records selected events and ignores other events from this non-exhaustive Wayland enum"
        )]
        match event {
            wl_pointer::Event::Button {
                button,
                state: key_state,
                ..
            } => state.event(&json!({"button":button,"state":u32::from(key_state)})),
            wl_pointer::Event::Motion {
                surface_x,
                surface_y,
                ..
            }
            | wl_pointer::Event::Enter {
                surface_x,
                surface_y,
                ..
            } => state.event(&json!({"x":surface_x,"y":surface_y})),
            _ => {}
        }
    }
}
impl Dispatch<wl_keyboard::WlKeyboard, ()> for App {
    fn event(
        state: &mut Self,
        _: &wl_keyboard::WlKeyboard,
        event: wl_keyboard::Event,
        (): &(),
        _: &Connection,
        qh: &QueueHandle<Self>,
    ) {
        #[expect(
            clippy::wildcard_enum_match_arm,
            reason = "The fixture records selected events and ignores other events from this non-exhaustive Wayland enum"
        )]
        match event {
            wl_keyboard::Event::Key {
                key,
                state: key_state,
                ..
            } => {
                state.event(&json!({"key":key,"state":u32::from(key_state)}));
                if key == 38 && u32::from(key_state) == 1 {
                    if let Some(lock) = state.lock.take() {
                        lock.destroy();
                    } else {
                        state.lock = Some(state.constraints.as_ref().unwrap().lock_pointer(
                            state.surface.as_ref().unwrap(),
                            state.pointer.as_ref().unwrap(),
                            None,
                            zwp_pointer_constraints_v1::Lifetime::Persistent,
                            qh,
                            (),
                        ));
                    }
                }
            }
            wl_keyboard::Event::Modifiers { mods_depressed, .. } => {
                state.event(&json!({"modifiers":mods_depressed}));
            }
            _ => {}
        }
    }
}
impl Dispatch<zwp_locked_pointer_v1::ZwpLockedPointerV1, ()> for App {
    fn event(
        state: &mut Self,
        _: &zwp_locked_pointer_v1::ZwpLockedPointerV1,
        event: zwp_locked_pointer_v1::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if matches!(event, zwp_locked_pointer_v1::Event::Locked) {
            state.event(&json!({"locked": true}));
        }
    }
}
impl Dispatch<zwp_relative_pointer_v1::ZwpRelativePointerV1, ()> for App {
    fn event(
        state: &mut Self,
        _: &zwp_relative_pointer_v1::ZwpRelativePointerV1,
        event: zwp_relative_pointer_v1::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        if let zwp_relative_pointer_v1::Event::RelativeMotion { dx, dy, .. } = event {
            state.event(&json!({"dx":dx,"dy":dy}));
        }
    }
}
delegate_noop!(App: ignore zwp_pointer_constraints_v1::ZwpPointerConstraintsV1);
delegate_noop!(App: ignore wl_compositor::WlCompositor);
delegate_noop!(App: ignore wl_surface::WlSurface);
delegate_noop!(App: ignore wl_shm::WlShm);
delegate_noop!(App: ignore wl_shm_pool::WlShmPool);
delegate_noop!(App: ignore wl_buffer::WlBuffer);
delegate_noop!(App: ignore wl_seat::WlSeat);
delegate_noop!(App: ignore zwp_relative_pointer_manager_v1::ZwpRelativePointerManagerV1);

#[test]
#[ignore = "internal fixture process"]
fn fixture_client() {
    let Ok(path) = std::env::var("STACKANVIL_WAYLAND_FIXTURE") else {
        return;
    };
    let connection = Connection::connect_to_env().unwrap();
    let (globals, mut queue) = registry_queue_init::<App>(&connection).unwrap();
    let qh = queue.handle();
    let compositor: wl_compositor::WlCompositor = globals.bind(&qh, 4..=4, ()).unwrap();
    let shm: wl_shm::WlShm = globals.bind(&qh, 1..=1, ()).unwrap();
    let shell: xdg_wm_base::XdgWmBase = globals.bind(&qh, 1..=1, ()).unwrap();
    let seat: wl_seat::WlSeat = globals.bind(&qh, 1..=7, ()).unwrap();
    let constraints: zwp_pointer_constraints_v1::ZwpPointerConstraintsV1 =
        globals.bind(&qh, 1..=1, ()).unwrap();
    let pointer = seat.get_pointer(&qh, ());
    seat.get_keyboard(&qh, ());
    let relative: zwp_relative_pointer_manager_v1::ZwpRelativePointerManagerV1 =
        globals.bind(&qh, 1..=1, ()).unwrap();
    relative.get_relative_pointer(&pointer, &qh, ());
    let surface = compositor.create_surface(&qh, ());
    let shell_surface = shell.get_xdg_surface(&surface, &qh, ());
    let toplevel = shell_surface.get_toplevel(&qh, ());
    toplevel.set_title("StackAnvil Wayland fixture".into());
    toplevel.set_app_id("stackanvil-fixture".into());
    let mut app = App {
        surface: Some(surface.clone()),
        shm: Some(shm),
        width: 640,
        height: 360,
        activated: false,
        constraints: Some(constraints),
        pointer: Some(pointer),
        lock: None,
        log: Some(
            OpenOptions::new()
                .create(true)
                .append(true)
                .mode(0o600)
                .open(path)
                .unwrap(),
        ),
    };
    surface.commit();
    #[expect(
        clippy::infinite_loop,
        reason = "The parent test ends this fixture process after it finishes sending input"
    )]
    loop {
        queue.blocking_dispatch(&mut app).unwrap();
    }
}
