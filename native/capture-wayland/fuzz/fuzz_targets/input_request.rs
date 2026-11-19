// SPDX-License-Identifier: GPL-3.0-or-later
//! Reads one input service request through short reads and parses its
//! command. Nothing is executed.
//!
//! The client sends the JSON array of its CLI arguments and a newline. The
//! service reads at most 16 KiB and rejects a request that fills the limit
//! without a newline.
//!
//! For each accepted command, the target checks the documented argument
//! ranges and that the command's canonical arguments parse to the same
//! command.
#![no_main]

use capture_wayland::fuzzing::{Button, Command, input_request};
use capture_wayland_fuzz::ChunkedReader;
use libfuzzer_sys::arbitrary::{Result, Unstructured};
use libfuzzer_sys::fuzz_target;

/// The request size limit in `input_request`.
const MAX_REQUEST: usize = 16384;

const NAMES: &[&str] = &[
    "serve",
    "list",
    "active",
    "pixel",
    "move",
    "look",
    "screenshot",
    "record",
    "focus",
    "resize",
    "click",
    "double-click",
    "mouse-hold",
    "button-hold",
    "type",
    "key",
    "double-key",
    "key-hold",
    "drag",
    "help",
    "",
];

const TOKENS: &[&str] = &[
    "0",
    "1",
    "2",
    "50",
    "70",
    "120",
    "121",
    "359",
    "360",
    "639",
    "640",
    "1000",
    "1001",
    "2000",
    "2001",
    "-0",
    "-1",
    "-2000",
    "-2001",
    "-32768",
    "32767",
    "32768",
    "65535",
    "65536",
    "10000",
    "10001",
    "16384",
    "16385",
    "0x0",
    "0x1",
    "0X2a",
    "0x",
    "0xffffffffffffffff",
    "0x10000000000000000",
    "18446744073709551615",
    "18446744073709551616",
    "left",
    "right",
    "middle",
    "",
    "a",
    "a+b",
    "Control+Shift+a",
    "a+b+c+d+e+f+g+h",
    "a+b+c+d+e+f+g+h+i",
    "+",
    "a++b",
    "1.5",
    "+5",
    "--5",
    " 1",
    "hello world",
    "1.2-3",
    "\u{e9}",
    "/tmp/out.ppm",
];

fuzz_target!(|data: &[u8]| {
    let mut input = Unstructured::new(data);
    let Ok(mode) = input.arbitrary::<u8>() else {
        return;
    };
    let _ = if mode & 1 == 0 {
        arbitrary_stream(&mut input)
    } else {
        generated(&mut input)
    };
});

fn arbitrary_stream(input: &mut Unstructured) -> Result<()> {
    let length = input.int_in_range(0..=8)?;
    let schedule = input.bytes(length)?;
    let stream = input.bytes(input.len())?;
    if let Ok(command) = input_request(ChunkedReader::new(stream, schedule)) {
        check(&command);
    }
    Ok(())
}

fn args(input: &mut Unstructured) -> Result<Vec<String>> {
    let mut args = vec![(*input.choose(NAMES)?).to_owned()];
    let count = if args[0] == "drag" && input.ratio(1, 2)? {
        input.int_in_range(0..=140)?
    } else {
        input.int_in_range(0..=7)?
    };
    for _ in 0..count {
        args.push(if input.ratio(7, 8)? {
            (*input.choose(TOKENS)?).to_owned()
        } else {
            input.arbitrary()?
        });
    }
    Ok(args)
}

/// What `input_request` should return for `stream`, judged from the framing
/// rules and `Command::parse`.
fn expected(stream: &[u8]) -> Option<Command> {
    let limited = &stream[..stream.len().min(MAX_REQUEST)];
    let line = match limited.iter().position(|&byte| byte == b'\n') {
        Some(end) => &limited[..=end],
        None if limited.len() == MAX_REQUEST => return None,
        None => limited,
    };
    let line = std::str::from_utf8(line).ok()?;
    let args: Vec<String> = serde_json::from_str(line).ok()?;
    Command::parse(&args).ok()
}

fn generated(input: &mut Unstructured) -> Result<()> {
    let args = args(input)?;
    let json = serde_json::to_vec(&args).unwrap();
    // Pad the line so it ends near the size limit.
    let line_length = match input.int_in_range(0..=5_u8)? {
        0 => MAX_REQUEST - 1,
        1 => MAX_REQUEST,
        2 => MAX_REQUEST + 1,
        _ => json.len() + 1 + usize::from(input.int_in_range(0..=8_u8)?),
    };
    let mut stream = json;
    let padding = line_length.saturating_sub(stream.len() + 1);
    stream.resize(stream.len() + padding, b' ');
    let newline = input.ratio(7, 8)?;
    if newline {
        stream.push(b'\n');
    }
    let request_length = stream.len();
    let corrupt = match input.int_in_range(0..=7_u8)? {
        0 => {
            // Insert a byte that is never valid UTF-8, or JSON outside strings.
            let index = input.int_in_range(0..=stream.len())?;
            stream.insert(index, *input.choose(&[0xff, 0xc0, 0x80, b'"', b'\n', 0])?);
            true
        }
        1 => {
            let keep = input.int_in_range(0..=stream.len())?;
            stream.truncate(keep);
            true
        }
        _ => false,
    };
    let trailing_length = input.int_in_range(0..=16)?;
    stream.extend_from_slice(input.bytes(trailing_length)?);

    let schedule_length = input.int_in_range(0..=8)?;
    let schedule = input.bytes(schedule_length)?;
    let actual = input_request(ChunkedReader::new(&stream, schedule)).ok();
    assert_eq!(
        actual,
        expected(&stream),
        "framing disagrees for {stream:?}"
    );
    if !corrupt && newline && request_length <= MAX_REQUEST {
        // An intact request within the limit must carry the client's command.
        assert_eq!(
            actual,
            Command::parse(&args).ok(),
            "request changed {args:?}"
        );
    }
    if let Some(command) = actual {
        check(&command);
    }
    Ok(())
}

fn button(button: Button) -> String {
    match button {
        Button::Left => "left",
        Button::Right => "right",
    }
    .to_owned()
}

/// Checks the documented argument ranges, then that the canonical arguments
/// for `command` parse to the same command.
fn check(command: &Command) {
    let id = |window: &u64| {
        assert_ne!(*window, 0, "accepted window 0");
        window.to_string()
    };
    let path = |path: &std::path::Path| path.to_str().unwrap().to_owned();
    let canonical: Vec<String> = match command {
        Command::Serve { path: socket } => vec!["serve".into(), path(socket)],
        Command::List => vec!["list".into()],
        Command::Active => vec!["active".into()],
        Command::Pixel { window, point } => {
            vec![
                "pixel".into(),
                id(window),
                point.x.to_string(),
                point.y.to_string(),
            ]
        }
        Command::Move { window, point } => {
            vec![
                "move".into(),
                id(window),
                point.x.to_string(),
                point.y.to_string(),
            ]
        }
        Command::Look { window, dx, dy } => {
            assert!(
                dx.unsigned_abs() <= 2000 && dy.unsigned_abs() <= 2000,
                "look delta out of range"
            );
            vec!["look".into(), id(window), dx.to_string(), dy.to_string()]
        }
        Command::Screenshot { window, path: file } => {
            vec!["screenshot".into(), id(window), path(file)]
        }
        Command::Record {
            window,
            fps,
            path: file,
        } => {
            assert!((1..=120).contains(fps), "fps out of range");
            vec!["record".into(), id(window), fps.to_string(), path(file)]
        }
        Command::Focus { window } => vec!["focus".into(), id(window)],
        Command::Resize {
            window,
            width,
            height,
            position,
        } => {
            assert!(
                (640..=16384).contains(width) && (360..=16384).contains(height),
                "window size out of range"
            );
            let mut args = vec![
                "resize".into(),
                id(window),
                width.to_string(),
                height.to_string(),
            ];
            if let Some(point) = position {
                args.extend([point.x.to_string(), point.y.to_string()]);
            }
            args
        }
        Command::Click {
            window,
            point,
            button: pressed,
            duration,
            repeats,
        } => {
            assert!(
                (1..=10000).contains(duration),
                "click duration out of range"
            );
            let (x, y) = (point.x.to_string(), point.y.to_string());
            match (repeats, duration) {
                (1, 50) => vec!["click".into(), id(window), x, y, button(*pressed)],
                (2, 50) => vec!["double-click".into(), id(window), x, y, button(*pressed)],
                (1, _) => vec![
                    "mouse-hold".into(),
                    id(window),
                    x,
                    y,
                    button(*pressed),
                    duration.to_string(),
                ],
                _ => panic!("unexpected click {command:?}"),
            }
        }
        Command::ButtonHold {
            window,
            button: pressed,
            duration,
        } => {
            assert!((1..=10000).contains(duration), "hold duration out of range");
            vec![
                "button-hold".into(),
                id(window),
                button(*pressed),
                duration.to_string(),
            ]
        }
        Command::Type { window, text } => {
            assert!(
                text.bytes().all(|byte| byte.is_ascii_lowercase()
                    || byte.is_ascii_digit()
                    || b" .-".contains(&byte)),
                "accepted text {text:?}"
            );
            vec!["type".into(), id(window), text.clone()]
        }
        Command::Key {
            window,
            names,
            duration,
            repeats,
        } => {
            assert!(
                (1..=8).contains(&names.len())
                    && names
                        .iter()
                        .all(|name| !name.is_empty() && !name.contains('+')),
                "accepted keys {names:?}"
            );
            assert!((1..=10000).contains(duration), "key duration out of range");
            let sequence = names.join("+");
            match (repeats, duration) {
                (2, 70) => vec!["double-key".into(), id(window), sequence],
                (1, _) => vec![
                    "key-hold".into(),
                    id(window),
                    sequence,
                    duration.to_string(),
                ],
                _ => panic!("unexpected key {command:?}"),
            }
        }
        Command::Drag {
            window,
            button: pressed,
            dwell,
            points,
        } => {
            let total = u64::try_from(points.len()).unwrap().saturating_mul(*dwell);
            assert!(
                (1..=1000).contains(dwell) && (2..=64).contains(&points.len()) && total <= 10000,
                "drag out of range"
            );
            let mut args = vec![
                "drag".into(),
                id(window),
                button(*pressed),
                dwell.to_string(),
            ];
            for point in points {
                args.extend([point.x.to_string(), point.y.to_string()]);
            }
            args
        }
    };
    let reparsed = Command::parse(&canonical);
    assert_eq!(
        reparsed.as_ref().ok(),
        Some(command),
        "{canonical:?} gave {reparsed:?}"
    );
}
