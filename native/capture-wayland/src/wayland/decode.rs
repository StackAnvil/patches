// SPDX-License-Identifier: GPL-3.0-or-later
#![warn(clippy::indexing_slicing, clippy::arithmetic_side_effects)]

use std::io::{BufRead, BufReader, Read};
use std::os::unix::net::UnixStream;

use serde_json::Value;

use super::{Reply, Signals, WindowInfo};
use crate::{
    Result,
    command::{Command, Point},
};

pub(super) fn sway_reply(connection: &mut impl Read, kind: u32) -> Result<Value> {
    let mut header = [0; 14];
    connection.read_exact(&mut header)?;
    let [b'i', b'3', b'-', b'i', b'p', b'c', size @ .., a, b, c, d] = header else {
        return Err("Invalid Sway IPC response".into());
    };
    let size = u32::from_le_bytes(size);
    if size > 16 * 1024 * 1024 || u32::from_le_bytes([a, b, c, d]) != kind {
        return Err("Invalid Sway IPC response".into());
    }
    let mut response = vec![0; usize::try_from(size)?];
    connection.read_exact(&mut response)?;
    Ok(serde_json::from_slice(&response)?)
}

pub(super) fn input_request(stream: impl Read) -> Result<Command> {
    const MAX_REQUEST_BYTES: u64 = 16384;
    let mut request = String::new();
    let size = BufReader::new(stream.take(MAX_REQUEST_BYTES)).read_line(&mut request)?;
    if u64::try_from(size)? == MAX_REQUEST_BYTES && !request.ends_with('\n') {
        return Err("Input service request exceeds its size limit or lacks a newline".into());
    }
    let args: Vec<String> = serde_json::from_str(&request)?;
    Command::parse(&args)
}

pub(super) fn input_reply(stream: &mut UnixStream, signals: &Signals) -> Result<Reply> {
    let mut response = Vec::new();
    loop {
        signals.check()?;
        let mut buffer = [0; 1024];
        match stream.read(&mut buffer) {
            Ok(0) => return Err("The Wayland input service disconnected".into()),
            Ok(count) => {
                response.extend_from_slice(
                    buffer
                        .get(..count)
                        .ok_or("Invalid input service response")?,
                );
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
    Ok(serde_json::from_slice(&response)?)
}

pub(super) fn pixel(bytes: &[u8], point: Point) -> Result<[u8; 3]> {
    // grim emits P6 with a single whitespace byte after the max sample value.
    let mut index = 0_usize;
    let mut token = || -> Result<&[u8]> {
        while bytes.get(index).is_some_and(u8::is_ascii_whitespace) {
            index = index.checked_add(1).ok_or("Invalid PPM header offset")?;
        }
        let begin = index;
        while bytes
            .get(index)
            .is_some_and(|byte| !byte.is_ascii_whitespace())
        {
            index = index.checked_add(1).ok_or("Invalid PPM header offset")?;
        }
        if begin == index {
            return Err("Truncated PPM header".into());
        }
        Ok(bytes.get(begin..index).ok_or("Truncated PPM header")?)
    };
    if token()? != b"P6" {
        return Err("Invalid PPM image".into());
    }
    let width: u16 = std::str::from_utf8(token()?)?.parse()?;
    let height: u16 = std::str::from_utf8(token()?)?.parse()?;
    if token()? != b"255" || !point.fits(width, height) {
        return Err("Invalid pixel bounds or image depth".into());
    }
    let pixel_offset = usize::from(point.y)
        .checked_mul(usize::from(width))
        .and_then(|row| row.checked_add(usize::from(point.x)))
        .and_then(|pixel| pixel.checked_mul(3))
        .ok_or("Invalid PPM pixel offset")?;
    let begin = index
        .checked_add(1)
        .and_then(|header_end| header_end.checked_add(pixel_offset))
        .ok_or("Invalid PPM pixel offset")?;
    let end = begin.checked_add(3).ok_or("Invalid PPM pixel offset")?;
    Ok(bytes
        .get(begin..end)
        .ok_or("Truncated PPM pixels")?
        .try_into()?)
}

pub(super) fn windows(tree: &Value) -> Result<Vec<WindowInfo>> {
    fn visit(node: &Value, output: &str, result: &mut Vec<WindowInfo>) -> Result<()> {
        let output = if node.get("type").and_then(Value::as_str) == Some("output") {
            node.get("name").and_then(Value::as_str).unwrap_or("")
        } else {
            output
        };
        if node.get("shell").and_then(Value::as_str) == Some("xdg_shell")
            && node.get("visible").and_then(Value::as_bool) == Some(true)
        {
            let rect = node.get("rect").ok_or("Invalid Sway window geometry")?;
            let content = node
                .get("window_rect")
                .ok_or("Invalid Sway window geometry")?;
            let number = |value: &Value, field| {
                value
                    .get(field)
                    .and_then(Value::as_i64)
                    .ok_or("Invalid Sway window geometry")
            };
            let position = |field| {
                number(rect, field)?
                    .checked_add(number(content, field)?)
                    .ok_or("Invalid Sway window geometry")
            };
            result.push(WindowInfo {
                id: node
                    .get("id")
                    .and_then(Value::as_u64)
                    .ok_or("Invalid Sway container ID")?
                    .to_string(),
                title: node
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string(),
                x: i32::try_from(position("x")?)?,
                y: i32::try_from(position("y")?)?,
                width: u16::try_from(number(content, "width")?)?,
                height: u16::try_from(number(content, "height")?)?,
                focused: node.get("focused").and_then(Value::as_bool) == Some(true),
                output: output.to_string(),
            });
        }
        for field in ["nodes", "floating_nodes"] {
            if let Some(children) = node.get(field).and_then(Value::as_array) {
                for child in children {
                    visit(child, output, result)?;
                }
            }
        }
        Ok(())
    }
    let mut result = Vec::new();
    visit(tree, "", &mut result)?;
    Ok(result)
}

/// Public wrappers for the fuzz targets in `fuzz/`. See `src/lib.rs`.
#[cfg(fuzzing)]
pub mod fuzzing {
    use std::io::Read;

    use serde_json::Value;

    use crate::Result;
    pub use crate::command::{Button, Command, Point};

    /// A Sway window with the fields that `windows` reads from the tree.
    #[derive(Clone, Debug, PartialEq, Eq)]
    pub struct Window {
        pub id: String,
        pub title: String,
        pub x: i32,
        pub y: i32,
        pub width: u16,
        pub height: u16,
        pub focused: bool,
        pub output: String,
    }

    pub fn sway_reply(connection: &mut impl Read, kind: u32) -> Result<Value> {
        super::sway_reply(connection, kind)
    }

    pub fn windows(tree: &Value) -> Result<Vec<Window>> {
        Ok(super::windows(tree)?
            .into_iter()
            .map(|window| Window {
                id: window.id,
                title: window.title,
                x: window.x,
                y: window.y,
                width: window.width,
                height: window.height,
                focused: window.focused,
                output: window.output,
            })
            .collect())
    }

    pub fn input_request(stream: impl Read) -> Result<Command> {
        super::input_request(stream)
    }

    pub fn pixel(bytes: &[u8], point: Point) -> Result<[u8; 3]> {
        super::pixel(bytes, point)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_a_valid_command_prefix_when_the_request_reaches_the_limit() {
        let mut request = br#"["focus","42"]"#.to_vec();
        request.resize(16384, b' ');
        request.extend_from_slice(b"junk\n");
        let error = input_request(request.as_slice()).unwrap_err();
        assert_eq!(
            error.to_string(),
            "Input service request exceeds its size limit or lacks a newline"
        );

        request.resize(16383, b' ');
        request.push(b'\n');
        assert_eq!(
            input_request(request.as_slice()).unwrap(),
            Command::Focus { window: 42 }
        );
    }

    #[test]
    fn rejects_overflowing_sway_window_geometry() {
        let tree = serde_json::json!({
            "shell": "xdg_shell",
            "visible": true,
            "id": 42,
            "rect": {"x": i64::MAX, "y": 0},
            "window_rect": {"x": 1, "y": 0, "width": 10, "height": 10}
        });
        assert_eq!(
            windows(&tree).unwrap_err().to_string(),
            "Invalid Sway window geometry"
        );
    }

    #[test]
    fn rejects_truncated_sway_payload() {
        let mut frame = b"i3-ipc\x02\x00\x00\x00\x04\x00\x00\x00[".as_slice();
        let error = sway_reply(&mut frame, 4).unwrap_err();
        assert_eq!(
            error.downcast_ref::<std::io::Error>().unwrap().kind(),
            std::io::ErrorKind::UnexpectedEof
        );
    }

    #[test]
    fn rejects_truncated_ppm_pixel() {
        let point = Point { x: 1, y: 0 };
        assert_eq!(
            pixel(b"P6\n2 1\n255\n\x01\x02\x03\x04\x05", point)
                .unwrap_err()
                .to_string(),
            "Truncated PPM pixels"
        );
    }
}
