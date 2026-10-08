// SPDX-License-Identifier: GPL-3.0-or-later
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Read, Write};
use std::os::unix::{fs::OpenOptionsExt, net::UnixStream};
use std::process::{Child, Command, Output, Stdio};
use std::time::{Duration, Instant};

use tempfile::TempDir;
use x11rb::connection::Connection;
use x11rb::protocol::Event;
use x11rb::protocol::xproto::{
    self, AtomEnum, ConnectionExt as _, CreateGCAux, CreateWindowAux, EventMask, KeyButMask,
    PropMode, Rectangle, WindowClass,
};
use x11rb::protocol::xtest::ConnectionExt as _;
use x11rb::rust_connection::{DefaultStream, RustConnection};
use x11rb::wrapper::ConnectionExt as _;
use x11rb::{COPY_DEPTH_FROM_PARENT, CURRENT_TIME};

struct OwnedChild(Child);

impl Drop for OwnedChild {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

/// Every fixture owns a fresh authenticated server. It never reads the desktop DISPLAY.
struct Fixture {
    connection: RustConnection,
    window: u32,
    root: u32,
    display: String,
    _server: OwnedChild,
    directory: TempDir,
}

impl Fixture {
    fn new(depth: u8) -> Self {
        let directory = tempfile::tempdir().unwrap();
        let mut cookie = [0; 16];
        File::open("/dev/urandom")
            .unwrap()
            .read_exact(&mut cookie)
            .unwrap();
        let mut auth = OpenOptions::new()
            .write(true)
            .create_new(true)
            .mode(0o600)
            .open(directory.path().join("display.auth"))
            .unwrap();
        auth.write_all(&u16::MAX.to_be_bytes()).unwrap();
        for field in [&b""[..], &b""[..], &b"MIT-MAGIC-COOKIE-1"[..], &cookie[..]] {
            auth.write_all(&(field.len() as u16).to_be_bytes()).unwrap();
            auth.write_all(field).unwrap();
        }
        drop(auth);
        let xvfb = std::env::var_os("CAPTURE_X11_XVFB").unwrap_or_else(|| "Xvfb".into());
        let mut server = OwnedChild(
            Command::new(xvfb)
                .args([
                    "-displayfd",
                    "1",
                    "-screen",
                    "0",
                    &format!("1280x720x{depth}"),
                    "-nolisten",
                    "tcp",
                    "-auth",
                ])
                .arg(directory.path().join("display.auth"))
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .spawn()
                .expect("Install Xvfb or set CAPTURE_X11_XVFB"),
        );
        let stdout = server.0.stdout.take().unwrap();
        let (sender, receiver) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let mut number = String::new();
            let result = BufReader::new(stdout).read_line(&mut number);
            let _ = sender.send(result.map(|_| number));
        });
        let number = receiver
            .recv_timeout(Duration::from_secs(10))
            .expect("Xvfb did not become ready")
            .unwrap();
        let number: u16 = number
            .trim()
            .parse()
            .expect("Xvfb stopped without creating a display");
        let stream = UnixStream::connect(format!("/tmp/.X11-unix/X{number}")).unwrap();
        let (stream, _) = DefaultStream::from_unix_stream(stream).unwrap();
        let connection = RustConnection::connect_to_stream_with_auth_info(
            stream,
            0,
            b"MIT-MAGIC-COOKIE-1".to_vec(),
            cookie.to_vec(),
        )
        .unwrap();
        let screen = &connection.setup().roots[0];
        let root = screen.root;
        let window = connection.generate_id().unwrap();
        connection
            .create_window(
                COPY_DEPTH_FROM_PARENT,
                window,
                root,
                30,
                40,
                641,
                360,
                0,
                WindowClass::INPUT_OUTPUT,
                0,
                &CreateWindowAux::new()
                    .background_pixel(screen.black_pixel)
                    .event_mask(
                        EventMask::KEY_PRESS
                            | EventMask::KEY_RELEASE
                            | EventMask::BUTTON_PRESS
                            | EventMask::BUTTON_RELEASE
                            | EventMask::POINTER_MOTION,
                    ),
            )
            .unwrap()
            .check()
            .unwrap();
        let utf8 = connection
            .intern_atom(false, b"UTF8_STRING")
            .unwrap()
            .reply()
            .unwrap()
            .atom;
        let name = connection
            .intern_atom(false, b"_NET_WM_NAME")
            .unwrap()
            .reply()
            .unwrap()
            .atom;
        connection
            .change_property8(
                PropMode::REPLACE,
                window,
                name,
                utf8,
                "Capture \"fixture\" \\ é".as_bytes(),
            )
            .unwrap()
            .check()
            .unwrap();
        connection.map_window(window).unwrap().check().unwrap();
        Self {
            connection,
            window,
            root,
            display: format!(":{number}"),
            _server: server,
            directory,
        }
    }

    fn command(&self, args: &[&str]) -> Command {
        let mut command = Command::new(env!("CARGO_BIN_EXE_capture-x11"));
        command
            .args(args)
            .env("DISPLAY", &self.display)
            .env("XAUTHORITY", self.directory.path().join("display.auth"))
            .env("STACKANVIL_UI_ISOLATED", "1")
            .env_remove("STACKANVIL_USE_DESKTOP");
        command
    }

    fn run(&self, args: &[&str]) -> Output {
        self.command(args).output().unwrap()
    }

    fn success(&self, args: &[&str]) -> String {
        let output = self.run(args);
        assert!(
            output.status.success(),
            "{args:?}: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        String::from_utf8(output.stdout).unwrap()
    }

    fn atom(&self, name: &[u8]) -> u32 {
        self.connection
            .intern_atom(false, name)
            .unwrap()
            .reply()
            .unwrap()
            .atom
    }

    fn events(&self) -> Vec<Event> {
        self.connection.get_input_focus().unwrap().reply().unwrap();
        let mut events = Vec::new();
        while let Some(event) = self.connection.poll_for_event().unwrap() {
            events.push(event);
        }
        events
    }

    fn input_events(&self) -> Vec<(u8, u8)> {
        self.events()
            .into_iter()
            .filter_map(|event| match event {
                Event::KeyPress(event) => Some((xproto::KEY_PRESS_EVENT, event.detail)),
                Event::KeyRelease(event) => Some((xproto::KEY_RELEASE_EVENT, event.detail)),
                Event::ButtonPress(event) => Some((xproto::BUTTON_PRESS_EVENT, event.detail)),
                Event::ButtonRelease(event) => Some((xproto::BUTTON_RELEASE_EVENT, event.detail)),
                _ => None,
            })
            .collect()
    }

    fn wait_for(&self, mut condition: impl FnMut() -> bool) {
        let deadline = Instant::now() + Duration::from_secs(3);
        while !condition() {
            assert!(Instant::now() < deadline, "X11 condition timed out");
            std::thread::sleep(Duration::from_millis(5));
        }
    }

    fn button_held(&self) -> bool {
        self.connection
            .query_pointer(self.root)
            .unwrap()
            .reply()
            .unwrap()
            .mask
            .intersects(KeyButMask::BUTTON1 | KeyButMask::BUTTON3)
    }

    fn keys_held(&self) -> bool {
        self.connection
            .query_keymap()
            .unwrap()
            .reply()
            .unwrap()
            .keys
            .iter()
            .any(|byte| *byte != 0)
    }

    fn paint(&self) {
        let screen = &self.connection.setup().roots[0];
        let visual = screen
            .allowed_depths
            .iter()
            .flat_map(|depth| &depth.visuals)
            .find(|visual| visual.visual_id == screen.root_visual)
            .unwrap();
        let gc = self.connection.generate_id().unwrap();
        self.connection
            .create_gc(gc, self.window, &CreateGCAux::new())
            .unwrap()
            .check()
            .unwrap();
        for (color, rectangle) in [
            (
                visual.blue_mask,
                Rectangle {
                    x: 0,
                    y: 0,
                    width: 641,
                    height: 360,
                },
            ),
            (
                visual.red_mask,
                Rectangle {
                    x: 1,
                    y: 1,
                    width: 1,
                    height: 1,
                },
            ),
            (
                visual.green_mask,
                Rectangle {
                    x: 2,
                    y: 1,
                    width: 1,
                    height: 1,
                },
            ),
        ] {
            self.connection
                .change_gc(gc, &xproto::ChangeGCAux::new().foreground(color))
                .unwrap()
                .check()
                .unwrap();
            self.connection
                .poly_fill_rectangle(self.window, gc, &[rectangle])
                .unwrap()
                .check()
                .unwrap();
        }
        self.connection.free_gc(gc).unwrap().check().unwrap();
    }
}

#[test]
#[ignore = "requires Xvfb; run cargo test -- --include-ignored"]
fn captures_windows_and_pixels_on_16_and_24_bit_displays() {
    for depth in [16, 24] {
        let fixture = Fixture::new(depth);
        let id = fixture.window.to_string();
        let list: serde_json::Value = serde_json::from_str(&fixture.success(&["list"])).unwrap();
        assert_eq!(list[0]["id"], format!("0x{:x}", fixture.window));
        assert_eq!(list[0]["title"], "Capture \"fixture\" \\ é");
        assert_eq!(
            (list[0]["x"].as_i64(), list[0]["y"].as_i64()),
            (Some(30), Some(40))
        );
        fixture.paint();
        assert_eq!(fixture.success(&["pixel", &id, "1", "1"]).trim(), "255 0 0");
        assert_eq!(fixture.success(&["pixel", &id, "2", "1"]).trim(), "0 255 0");
        assert_eq!(
            fixture.success(&["pixel", &id, "640", "359"]).trim(),
            "0 0 255"
        );
        assert!(!fixture.run(&["pixel", &id, "641", "0"]).status.success());
        let path = fixture.directory.path().join("frame.ppm");
        fixture.success(&["screenshot", &id, path.to_str().unwrap()]);
        let image = std::fs::read(&path).unwrap();
        let header = b"P6\n641 360\n255\n";
        assert_eq!(&image[..header.len()], header);
        assert_eq!(image.len(), header.len() + 641 * 360 * 3);
        let offset = header.len() + (641 + 1) * 3;
        assert_eq!(&image[offset..offset + 6], &[255, 0, 0, 0, 255, 0]);
        assert_eq!(&image[image.len() - 3..], &[0, 0, 255]);
        fixture.success(&["focus", &id]);
        assert_eq!(
            fixture.success(&["active"]).trim(),
            format!("0x{:x}", fixture.window)
        );
        fixture
            .connection
            .change_property32(
                PropMode::REPLACE,
                fixture.root,
                fixture.atom(b"_NET_CLIENT_LIST"),
                AtomEnum::WINDOW,
                &[],
            )
            .unwrap()
            .check()
            .unwrap();
        let list: Vec<serde_json::Value> =
            serde_json::from_str(&fixture.success(&["list"])).unwrap();
        assert!(list.is_empty());
        fixture
            .connection
            .change_property32(
                PropMode::REPLACE,
                fixture.root,
                fixture.atom(b"_NET_CLIENT_LIST"),
                AtomEnum::WINDOW,
                &[fixture.window],
            )
            .unwrap()
            .check()
            .unwrap();
        let list: Vec<serde_json::Value> =
            serde_json::from_str(&fixture.success(&["list"])).unwrap();
        assert_eq!(list.len(), 1);
        fixture.success(&["resize", &id, "640", "360", "640", "360"]);
        let geometry = fixture
            .connection
            .get_geometry(fixture.window)
            .unwrap()
            .reply()
            .unwrap();
        assert_eq!(
            (geometry.x, geometry.y, geometry.width, geometry.height),
            (640, 360, 640, 360)
        );
        assert!(
            !fixture
                .run(&["resize", &id, "640", "360", "641", "360"])
                .status
                .success()
        );
        assert!(
            !fixture
                .command(&["resize", &id, "640", "360", "0", "0"])
                .env("STACKANVIL_UI_ISOLATED", "0")
                .output()
                .unwrap()
                .status
                .success()
        );
    }
}

#[test]
#[ignore = "requires Xvfb; run cargo test -- --include-ignored"]
fn emits_ordered_input_and_releases_it_on_interrupts_and_window_failure() {
    let fixture = Fixture::new(24);
    let id = fixture.window.to_string();
    fixture.success(&["key", &id, "Control+b"]);
    let events = fixture.input_events();
    assert_eq!(events.len(), 4);
    assert_eq!(
        (events[0].0, events[1].0, events[2].0, events[3].0),
        (2, 2, 3, 3)
    );
    assert_eq!(events[0].1, events[3].1);
    assert_eq!(events[1].1, events[2].1);
    assert_ne!(events[0].1, events[1].1);
    assert!(!fixture.keys_held());
    fixture.success(&["double-key", &id, "space"]);
    assert_eq!(
        fixture
            .input_events()
            .iter()
            .map(|event| event.0)
            .collect::<Vec<_>>(),
        [2, 3, 2, 3]
    );
    fixture.success(&["type", &id, "a1 .-"]);
    let events = fixture.input_events();
    assert_eq!(events.len(), 10);
    for pair in events.chunks_exact(2) {
        assert_eq!((pair[0].0, pair[1].0, pair[0].1 == pair[1].1), (2, 3, true));
    }
    for args in [
        vec!["key", &id, "a+UnknownKey"],
        vec!["type", &id, "aB"],
        vec!["click", &id, "999", "1"],
        vec!["drag", &id, "left", "10", "0", "0", "641", "0"],
    ] {
        assert!(!fixture.run(&args).status.success());
        assert!(fixture.input_events().is_empty());
    }
    fixture.success(&["double-click", &id, "10", "20", "right"]);
    assert_eq!(fixture.input_events(), [(4, 3), (5, 3), (4, 3), (5, 3)]);
    fixture.success(&["mouse-hold", &id, "11", "21", "left", "10"]);
    assert_eq!(fixture.input_events(), [(4, 1), (5, 1)]);
    fixture.success(&[
        "drag", &id, "left", "20", "10", "20", "40", "50", "60", "70",
    ]);
    let events = fixture.events();
    let positions: Vec<_> = events
        .iter()
        .filter_map(|event| match event {
            Event::MotionNotify(event) => Some((event.event_x, event.event_y)),
            _ => None,
        })
        .collect();
    assert_eq!(positions, [(10, 20), (40, 50), (60, 70)]);
    let pointer = fixture
        .connection
        .query_pointer(fixture.window)
        .unwrap()
        .reply()
        .unwrap();
    assert_eq!((pointer.win_x, pointer.win_y), (60, 70));
    assert!(!fixture.button_held());
    let pointer_output = fixture.success(&["pointer"]);
    let fields: Vec<_> = pointer_output.split_whitespace().collect();
    assert_eq!((fields[0], fields[1]), ("90", "110"));
    for signal in ["-INT", "-TERM"] {
        for args in [
            vec!["key-hold", &id, "Control+b", "2000"],
            vec!["button-hold", &id, "left", "2000"],
            vec!["mouse-hold", &id, "10", "20", "right", "2000"],
            vec!["drag", &id, "left", "1000", "10", "20", "40", "50"],
        ] {
            let mut child = OwnedChild(
                fixture
                    .command(&args)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn()
                    .unwrap(),
            );
            fixture.wait_for(|| fixture.button_held() || fixture.keys_held());
            assert!(
                Command::new("kill")
                    .args([signal, &child.0.id().to_string()])
                    .status()
                    .unwrap()
                    .success()
            );
            fixture.wait_for(|| child.0.try_wait().unwrap().is_some());
            let status = child.0.wait().unwrap();
            assert_eq!(
                status.code(),
                Some(if signal == "-INT" { 130 } else { 143 })
            );
            assert!(!fixture.button_held());
            assert!(!fixture.keys_held());
            fixture.events();
        }
    }
    // Refuse to release a button owned by another client.
    fixture
        .connection
        .xtest_fake_input(xproto::BUTTON_PRESS_EVENT, 1, CURRENT_TIME, 0, 0, 0, 0)
        .unwrap()
        .check()
        .unwrap();
    assert!(
        !fixture
            .run(&["drag", &id, "left", "10", "1", "1", "2", "2"])
            .status
            .success()
    );
    assert!(fixture.button_held());
    fixture
        .connection
        .xtest_fake_input(xproto::BUTTON_RELEASE_EVENT, 1, CURRENT_TIME, 0, 0, 0, 0)
        .unwrap()
        .check()
        .unwrap();
    let mut child = OwnedChild(
        fixture
            .command(&["drag", &id, "left", "300", "10", "20", "600", "300"])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .unwrap(),
    );
    fixture.wait_for(|| fixture.button_held());
    fixture
        .connection
        .destroy_window(fixture.window)
        .unwrap()
        .check()
        .unwrap();
    fixture.wait_for(|| child.0.try_wait().unwrap().is_some());
    assert!(!child.0.wait().unwrap().success());
    assert!(!fixture.button_held());
}
