// SPDX-License-Identifier: GPL-3.0-or-later
use std::fs::OpenOptions;
use std::io::{BufWriter, Write};
use std::os::unix::fs::OpenOptionsExt;
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
use std::time::{Duration, Instant};

use serde::Serialize;
use signal_hook::{
    SigId,
    consts::{SIGINT, SIGTERM},
};
use x11rb::CURRENT_TIME;
use x11rb::connection::Connection;
use x11rb::image::Image;
use x11rb::protocol::xproto::{
    self, AtomEnum, ClientMessageEvent, ConfigureWindowAux, ConnectionExt as _, EventMask,
    InputFocus, MapState, StackMode, Visualtype, Window,
};
use x11rb::protocol::xtest::ConnectionExt as _;
use x11rb::rust_connection::RustConnection;

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
}

impl Signals {
    fn new() -> Result<Self> {
        let mut signals = Self {
            signal: Arc::new(AtomicUsize::new(0)),
            handlers: Vec::new(),
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

/// Record each press before sending it so every error path can attempt a release.
struct HeldInput<'a> {
    connection: &'a RustConnection,
    pressed: Vec<(u8, u8)>,
}

impl<'a> HeldInput<'a> {
    fn new(connection: &'a RustConnection) -> Self {
        Self {
            connection,
            pressed: Vec::new(),
        }
    }

    fn press(&mut self, event: u8, detail: u8) -> Result<()> {
        self.pressed.push((event, detail));
        self.connection
            .xtest_fake_input(event, detail, CURRENT_TIME, 0, 0, 0, 0)?
            .check()?;
        Ok(())
    }

    fn release(&mut self) -> Result<()> {
        while let Some(&(event, detail)) = self.pressed.last() {
            self.connection
                .xtest_fake_input(event + 1, detail, CURRENT_TIME, 0, 0, 0, 0)?
                .check()?;
            self.pressed.pop();
        }
        Ok(())
    }
}

impl Drop for HeldInput<'_> {
    fn drop(&mut self) {
        for &(event, detail) in self.pressed.iter().rev() {
            if let Ok(cookie) =
                self.connection
                    .xtest_fake_input(event + 1, detail, CURRENT_TIME, 0, 0, 0, 0)
            {
                let _ = cookie.check();
            }
        }
        let _ = self.connection.flush();
    }
}

struct Display {
    connection: RustConnection,
    screen: usize,
}

#[derive(Serialize)]
struct WindowInfo {
    id: String,
    title: String,
    x: i16,
    y: i16,
    width: u16,
    height: u16,
}

impl Display {
    fn root(&self) -> Window {
        self.connection.setup().roots[self.screen].root
    }

    fn atom(&self, name: &[u8]) -> Result<u32> {
        Ok(self.connection.intern_atom(false, name)?.reply()?.atom)
    }

    fn window_property(&self, window: Window, name: &[u8], limit: u32) -> Result<Option<Vec<u32>>> {
        let reply = self
            .connection
            .get_property(false, window, self.atom(name)?, AtomEnum::WINDOW, 0, limit)?
            .reply()?;
        Ok(reply
            .value32()
            .filter(|_| reply.type_ == u32::from(AtomEnum::WINDOW))
            .map(Iterator::collect))
    }

    fn title(&self, window: Window) -> Result<String> {
        let reply = self
            .connection
            .get_property(
                false,
                window,
                self.atom(b"_NET_WM_NAME")?,
                self.atom(b"UTF8_STRING")?,
                0,
                1024,
            )?
            .reply()?;
        if reply.format == 8 && !reply.value.is_empty() {
            return Ok(String::from_utf8_lossy(&reply.value)
                .trim_end_matches('\0')
                .to_owned());
        }
        let reply = self
            .connection
            .get_property(false, window, AtomEnum::WM_NAME, AtomEnum::STRING, 0, 1024)?
            .reply()?;
        // WM_NAME's STRING type contains ISO-8859-1, unlike _NET_WM_NAME.
        Ok(reply
            .value
            .into_iter()
            .take_while(|byte| *byte != 0)
            .map(char::from)
            .collect())
    }

    fn windows(&self) -> Result<Vec<WindowInfo>> {
        let children = match self.window_property(self.root(), b"_NET_CLIENT_LIST", 4096)? {
            Some(children) => children,
            None => self.connection.query_tree(self.root())?.reply()?.children,
        };
        let mut windows = Vec::new();
        for window in children {
            // A client may close between discovery and any of these replies.
            if let Ok(info) = self.window_info(window) {
                windows.extend(info);
            }
        }
        Ok(windows)
    }

    fn window_info(&self, window: Window) -> Result<Option<WindowInfo>> {
        if self
            .connection
            .get_window_attributes(window)?
            .reply()?
            .map_state
            != MapState::VIEWABLE
        {
            return Ok(None);
        }
        let title = self.title(window)?;
        if title.is_empty() {
            return Ok(None);
        }
        let geometry = self.connection.get_geometry(window)?.reply()?;
        let position = self
            .connection
            .translate_coordinates(window, self.root(), 0, 0)?
            .reply()?;
        Ok(Some(WindowInfo {
            id: format!("0x{window:x}"),
            title,
            x: position.dst_x,
            y: position.dst_y,
            width: geometry.width,
            height: geometry.height,
        }))
    }

    fn geometry(&self, window: Window) -> Result<(u16, u16)> {
        let geometry = self.connection.get_geometry(window)?.reply()?;
        if self
            .connection
            .get_window_attributes(window)?
            .reply()?
            .map_state
            != MapState::VIEWABLE
        {
            return Err("Window is not visible".into());
        }
        Ok((geometry.width, geometry.height))
    }

    fn validate_point(&self, window: Window, point: Point) -> Result<()> {
        let (width, height) = self.geometry(window)?;
        if !point.fits(width, height) {
            return Err("Point is outside the window".into());
        }
        // X11 TranslateCoordinates and GetImage use signed 16-bit coordinates.
        i16::try_from(point.x)?;
        i16::try_from(point.y)?;
        Ok(())
    }

    fn focus(&self, window: Window) -> Result<()> {
        self.geometry(window)?;
        self.connection
            .configure_window(
                window,
                &ConfigureWindowAux::new().stack_mode(StackMode::ABOVE),
            )?
            .check()?;
        self.connection
            .set_input_focus(InputFocus::PARENT, window, CURRENT_TIME)?
            .check()?;
        Ok(())
    }

    fn request_focus(&self, window: Window) -> Result<()> {
        self.geometry(window)?;
        if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() == Ok("1") {
            return self.focus(window);
        }
        let event = ClientMessageEvent::new(
            32,
            window,
            self.atom(b"_NET_ACTIVE_WINDOW")?,
            [2, CURRENT_TIME, 0, 0, 0],
        );
        self.connection
            .send_event(
                false,
                self.root(),
                EventMask::SUBSTRUCTURE_REDIRECT | EventMask::SUBSTRUCTURE_NOTIFY,
                event,
            )?
            .check()?;
        Ok(())
    }

    fn move_pointer(&self, window: Window, point: Point) -> Result<()> {
        self.validate_point(window, point)?;
        let translated = self
            .connection
            .translate_coordinates(
                window,
                self.root(),
                point.x.try_into()?,
                point.y.try_into()?,
            )?
            .reply()?;
        if !translated.same_screen {
            return Err("Window is on a different screen".into());
        }
        self.connection
            .xtest_fake_input(
                xproto::MOTION_NOTIFY_EVENT,
                0,
                CURRENT_TIME,
                self.root(),
                translated.dst_x,
                translated.dst_y,
                0,
            )?
            .check()?;
        Ok(())
    }

    fn check_button(&self, button: Button) -> Result<()> {
        let pointer = self.connection.query_pointer(self.root())?.reply()?;
        let mask = match button {
            Button::Left => xproto::KeyButMask::BUTTON1,
            Button::Right => xproto::KeyButMask::BUTTON3,
        };
        if !pointer.same_screen || pointer.mask.contains(mask) {
            return Err("Button is already held or pointer is unavailable".into());
        }
        Ok(())
    }

    fn keycodes(&self, names: &[String]) -> Result<Vec<u8>> {
        let setup = self.connection.setup();
        let mapping = self
            .connection
            .get_keyboard_mapping(setup.min_keycode, setup.max_keycode - setup.min_keycode + 1)?
            .reply()?;
        if mapping.keysyms_per_keycode == 0 {
            return Err("X display has no keyboard mapping".into());
        }
        let mut codes = Vec::with_capacity(names.len());
        for name in names {
            let name = match name.as_str() {
                "Control" => "Control_L",
                "Alt" => "Alt_L",
                "Shift" => "Shift_L",
                other => other,
            };
            let symbol = x11_keysymdef::lookup_by_name(name)
                .ok_or_else(|| format!("Unknown key: {name}"))?
                .keysym;
            // Match XKeysymToKeycode's column-first search across the mapping.
            let mut code = None;
            for column in 0..usize::from(mapping.keysyms_per_keycode) {
                if let Some(index) = mapping
                    .keysyms
                    .chunks_exact(usize::from(mapping.keysyms_per_keycode))
                    .position(|keys| keys[column] == symbol)
                {
                    code = Some(setup.min_keycode + index as u8);
                    break;
                }
            }
            let code = code.ok_or_else(|| format!("Key is unavailable on this display: {name}"))?;
            if codes.contains(&code) {
                return Err("Key sequence repeats the same physical key".into());
            }
            codes.push(code);
        }
        Ok(codes)
    }

    fn visual(&self, id: u32) -> Result<&Visualtype> {
        self.connection
            .setup()
            .roots
            .iter()
            .flat_map(|screen| &screen.allowed_depths)
            .flat_map(|depth| &depth.visuals)
            .find(|visual| visual.visual_id == id)
            .ok_or_else(|| "Unknown image visual".into())
    }

    fn pixel(&self, window: Window, point: Point) -> Result<[u8; 3]> {
        self.validate_point(window, point)?;
        let (image, visual) = Image::get(
            &self.connection,
            window,
            point.x.try_into()?,
            point.y.try_into()?,
            1,
            1,
        )?;
        Ok(rgb(image.get_pixel(0, 0), self.visual(visual)?))
    }

    fn screenshot(&self, window: Window, path: &std::path::Path) -> Result<()> {
        let (width, height) = self.geometry(window)?;
        let (image, visual) = Image::get(&self.connection, window, 0, 0, width, height)?;
        let visual = self.visual(visual)?;
        let file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .mode(0o600)
            .open(path)?;
        let mut file = BufWriter::new(file);
        write!(file, "P6\n{width} {height}\n255\n")?;
        let mut row = Vec::with_capacity(usize::from(width) * 3);
        for y in 0..height {
            row.clear();
            for x in 0..width {
                row.extend(rgb(image.get_pixel(x, y), visual));
            }
            file.write_all(&row)?;
        }
        file.flush()?;
        Ok(())
    }

    fn input(
        &self,
        window: Window,
        signals: &Signals,
        action: impl FnOnce(&mut HeldInput<'_>) -> Result<()>,
    ) -> Result<()> {
        signals.check()?;
        self.focus(window)?;
        self.connection.xtest_get_version(2, 2)?.reply()?;
        let mut held = HeldInput::new(&self.connection);
        action(&mut held)?;
        held.release()?;
        signals.check()
    }

    fn execute(&self, command: Command, signals: &Signals) -> Result<()> {
        match command {
            Command::List => println!("{}", serde_json::to_string(&self.windows()?)?),
            Command::Pointer => {
                let pointer = self.connection.query_pointer(self.root())?.reply()?;
                if !pointer.same_screen {
                    return Err("Pointer is unavailable".into());
                }
                println!(
                    "{} {} 0x{:x}",
                    pointer.root_x, pointer.root_y, pointer.child
                );
            }
            Command::Active => {
                let active = self
                    .window_property(self.root(), b"_NET_ACTIVE_WINDOW", 1)?
                    .and_then(|windows| windows.first().copied());
                let window = match active {
                    Some(window) => window,
                    None => self.connection.get_input_focus()?.reply()?.focus,
                };
                println!("0x{window:x}");
            }
            Command::Pixel { window, point } => {
                let [red, green, blue] = self.pixel(window, point)?;
                println!("{red} {green} {blue}");
            }
            Command::Screenshot { window, path } => self.screenshot(window, &path)?,
            Command::Focus { window } => self.request_focus(window)?,
            Command::Resize {
                window,
                width,
                height,
                position,
            } => {
                self.connection.get_window_attributes(window)?.reply()?;
                let mut configure = ConfigureWindowAux::new()
                    .width(u32::from(width))
                    .height(u32::from(height));
                if let Some(position) = position {
                    if std::env::var("STACKANVIL_UI_ISOLATED").as_deref() != Ok("1") {
                        return Err("Window placement requires an isolated capture display".into());
                    }
                    let root = self.connection.get_geometry(self.root())?.reply()?;
                    if u32::from(position.x) + u32::from(width) > u32::from(root.width)
                        || u32::from(position.y) + u32::from(height) > u32::from(root.height)
                    {
                        return Err("Window placement must fit the capture display".into());
                    }
                    configure = configure
                        .x(i32::from(i16::try_from(position.x)?))
                        .y(i32::from(i16::try_from(position.y)?));
                }
                self.connection
                    .configure_window(window, &configure)?
                    .check()?;
            }
            Command::Click {
                window,
                point,
                button,
                duration,
                repeats,
            } => {
                self.validate_point(window, point)?;
                self.check_button(button)?;
                self.input(window, signals, |held| {
                    self.move_pointer(window, point)?;
                    signals.wait(50)?;
                    for repeat in 0..repeats {
                        signals.check()?;
                        held.press(xproto::BUTTON_PRESS_EVENT, button.number())?;
                        signals.wait(duration)?;
                        held.release()?;
                        if repeat + 1 < repeats {
                            signals.wait(50)?;
                        }
                    }
                    Ok(())
                })?;
            }
            Command::ButtonHold {
                window,
                button,
                duration,
            } => {
                self.check_button(button)?;
                self.input(window, signals, |held| {
                    held.press(xproto::BUTTON_PRESS_EVENT, button.number())?;
                    signals.wait(duration)
                })?;
            }
            Command::Type { window, text } => {
                let names: Vec<String> = text
                    .chars()
                    .map(|character| match character {
                        ' ' => "space".into(),
                        '.' => "period".into(),
                        '-' => "minus".into(),
                        other => other.to_string(),
                    })
                    .collect();
                // Resolve all characters first; unsupported input must never type a prefix.
                let codes = names
                    .iter()
                    .map(|name| {
                        self.keycodes(std::slice::from_ref(name))
                            .map(|codes| codes[0])
                    })
                    .collect::<Result<Vec<_>>>()?;
                self.input(window, signals, |held| {
                    for code in codes {
                        signals.check()?;
                        held.press(xproto::KEY_PRESS_EVENT, code)?;
                        held.release()?;
                        signals.wait(30)?;
                    }
                    Ok(())
                })?;
            }
            Command::Key {
                window,
                names,
                duration,
                repeats,
            } => {
                let codes = self.keycodes(&names)?;
                self.input(window, signals, |held| {
                    for repeat in 0..repeats {
                        for &code in &codes {
                            signals.check()?;
                            held.press(xproto::KEY_PRESS_EVENT, code)?;
                        }
                        signals.wait(duration)?;
                        held.release()?;
                        if repeat + 1 < repeats {
                            signals.wait(70)?;
                        }
                    }
                    Ok(())
                })?;
            }
            Command::Drag {
                window,
                button,
                dwell,
                points,
            } => {
                for &point in &points {
                    self.validate_point(window, point)?;
                }
                self.check_button(button)?;
                self.input(window, signals, |held| {
                    for (index, point) in points.into_iter().enumerate() {
                        signals.check()?;
                        self.move_pointer(window, point)?;
                        if index == 0 {
                            signals.wait(50)?;
                            held.press(xproto::BUTTON_PRESS_EVENT, button.number())?;
                        }
                        signals.wait(dwell)?;
                    }
                    self.geometry(window)?;
                    Ok(())
                })?;
            }
        }
        self.connection.flush()?;
        Ok(())
    }
}

fn component(pixel: u32, mask: u32) -> u8 {
    if mask == 0 {
        return 0;
    }
    let shift = mask.trailing_zeros();
    (((u64::from(pixel & mask) >> shift) * 255) / u64::from(mask >> shift)) as u8
}

fn rgb(pixel: u32, visual: &Visualtype) -> [u8; 3] {
    [
        component(pixel, visual.red_mask),
        component(pixel, visual.green_mask),
        component(pixel, visual.blue_mask),
    ]
}

pub fn run(command: Command) -> Result<()> {
    let signals = Signals::new()?;
    let (connection, screen) =
        x11rb::connect(None).map_err(|error| format!("Cannot open X display: {error}"))?;
    Display { connection, screen }.execute(command, &signals)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scales_rgb_masks_without_rounding_or_overflow() {
        assert_eq!(component(0x12ab34, 0xff0000), 0x12);
        assert_eq!(component(0x12ab34, 0xff00), 0xab);
        assert_eq!(component(0x12ab34, 0xff), 0x34);
        assert_eq!(component(0xffff, 0xf800), 255);
        assert_eq!(component(0x8000, 0xf800), 131);
        assert_eq!(component(u32::MAX, u32::MAX), 255);
        assert_eq!(component(u32::MAX, 0), 0);
    }

    #[test]
    fn wait_stops_immediately_when_interrupted() {
        let signals = Signals {
            signal: Arc::new(AtomicUsize::new(SIGTERM as usize)),
            handlers: Vec::new(),
        };
        let error = signals.wait(10000).unwrap_err();
        assert_eq!(
            error.downcast_ref::<Interrupted>().unwrap().0,
            SIGTERM as usize
        );
    }
}
