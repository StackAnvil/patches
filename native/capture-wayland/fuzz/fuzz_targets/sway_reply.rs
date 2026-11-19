// SPDX-License-Identifier: GPL-3.0-or-later
//! Reads one Sway IPC reply frame through short reads, then parses the window
//! tree from it as `capture-wayland list` does.
//!
//! The first input byte selects an arbitrary byte stream or a generated frame.
//! A frame is the magic `i3-ipc`, a little-endian body length and message
//! type, and a JSON body. The parser must read exactly one frame.
#![no_main]

use std::io::{self, Read};

use capture_wayland::fuzzing::{sway_reply, windows};
use capture_wayland_fuzz::ChunkedReader;
use libfuzzer_sys::arbitrary::{Result, Unstructured};
use libfuzzer_sys::fuzz_target;
use serde_json::{Map, Value};

const MAGIC: &[u8; 6] = b"i3-ipc";
const HEADER: usize = 14;
/// The body size limit in `sway_reply`.
const MAX_BODY: u32 = 16 * 1024 * 1024;

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

fn schedule<'a>(input: &mut Unstructured<'a>) -> Result<&'a [u8]> {
    let length = input.int_in_range(0..=8)?;
    input.bytes(length)
}

fn arbitrary_stream(input: &mut Unstructured) -> Result<()> {
    let kind = input.arbitrary()?;
    let schedule = schedule(input)?;
    let stream = input.bytes(input.len())?;
    let mut reader = ChunkedReader::new(stream, schedule);
    if let Ok(value) = sway_reply(&mut reader, kind) {
        let length = u32::from_le_bytes(stream[6..10].try_into().unwrap());
        assert_eq!(&stream[..6], MAGIC, "accepted a frame without the magic");
        assert!(length <= MAX_BODY, "accepted a {length}-byte body");
        assert_eq!(
            u32::from_le_bytes(stream[10..14].try_into().unwrap()),
            kind,
            "accepted a reply of another type"
        );
        assert_eq!(
            reader.consumed(),
            HEADER + length as usize,
            "did not read exactly one frame"
        );
        // Any JSON value Sway could send must give windows or an error.
        let _ = windows(&value);
    }
    Ok(())
}

fn json(input: &mut Unstructured, depth: u8) -> Result<Value> {
    Ok(
        match input.int_in_range(0..=if depth == 0 { 4 } else { 6_u8 })? {
            0 => Value::Null,
            1 => Value::Bool(input.arbitrary()?),
            2 => Value::from(input.arbitrary::<i64>()?),
            3 => Value::from(input.arbitrary::<u64>()?),
            4 => Value::String(input.arbitrary()?),
            5 => {
                let length = input.int_in_range(0..=4)?;
                Value::Array(
                    (0..length)
                        .map(|_| json(input, depth - 1))
                        .collect::<Result<_>>()?,
                )
            }
            _ => {
                let mut object = Map::new();
                for _ in 0..input.int_in_range(0..=4)? {
                    object.insert(input.arbitrary()?, json(input, depth - 1)?);
                }
                Value::Object(object)
            }
        },
    )
}

fn generated(input: &mut Unstructured) -> Result<()> {
    let kind: u32 = input.arbitrary()?;
    let schedule = schedule(input)?;
    let body = if input.ratio(3, 4)? {
        serde_json::to_vec(&json(input, 3)?).unwrap()
    } else {
        let length = input.int_in_range(0..=64)?;
        input.bytes(length)?.to_vec()
    };
    let body_length = u32::try_from(body.len()).unwrap();

    let mut magic = *MAGIC;
    let mut reply_kind = kind;
    let mut length = body_length;
    // Spaces after the body. JSON ignores them, so they reach the size limit
    // without changing the decoded value.
    let mut filler = 0;
    match input.int_in_range(0..=9_u8)? {
        0 => {
            let index = input.choose_index(magic.len())?;
            magic[index] ^= input.int_in_range(1..=255)?;
        }
        1 => reply_kind ^= input.int_in_range(1..=u32::MAX)?,
        // Claim more body bytes than the stream holds.
        2 => length = length.saturating_add(input.int_in_range(1..=4)?),
        // Claim fewer body bytes, so the frame ends early.
        3 => length = input.int_in_range(0..=body_length)?,
        4 => length = *input.choose(&[MAX_BODY + 1, u32::MAX])?,
        // Fill the body to the limit or one byte past it. Reading 16 MiB is
        // slow, so do it rarely.
        5 if input.ratio(1, 16)? => {
            length = *input.choose(&[MAX_BODY, MAX_BODY + 1])?;
            filler = length - body_length;
        }
        // Cut the stream inside the header.
        6 => {
            let cut = input.int_in_range(0..=HEADER - 1)?;
            let mut stream = MAGIC.to_vec();
            stream.extend_from_slice(&length.to_le_bytes());
            stream.extend_from_slice(&kind.to_le_bytes());
            stream.truncate(cut);
            let mut reader = ChunkedReader::new(&stream, schedule);
            let result = sway_reply(&mut reader, kind);
            assert!(result.is_err(), "accepted a {cut}-byte header: {result:?}");
            return Ok(());
        }
        _ => {}
    }
    let mut frame = magic.to_vec();
    frame.extend_from_slice(&length.to_le_bytes());
    frame.extend_from_slice(&reply_kind.to_le_bytes());
    frame.extend_from_slice(&body);
    let trailing_length = input.int_in_range(0..=32)?;
    let trailing = input.bytes(trailing_length)?;

    let mut reader = ChunkedReader::new(&frame, schedule)
        .chain(io::repeat(b' ').take(u64::from(filler)))
        .chain(trailing);
    let result = sway_reply(&mut reader, kind);
    let complete = body.len() + filler as usize + trailing.len() >= length as usize;
    if &magic != MAGIC || reply_kind != kind || length > MAX_BODY || !complete {
        assert!(result.is_err(), "accepted an invalid frame: {result:?}");
        return Ok(());
    }
    // The bytes after the header, and how many of them belong to the frame.
    let (frame_body, rest) = if filler > 0 {
        (body, trailing.to_vec())
    } else {
        let mut after_header = body;
        after_header.extend_from_slice(trailing);
        let rest = after_header.split_off(length as usize);
        (after_header, rest)
    };
    match (serde_json::from_slice::<Value>(&frame_body), result) {
        (Ok(expected), Ok(actual)) => {
            assert_eq!(actual, expected, "decoded a different body");
            let mut unread = Vec::new();
            reader.read_to_end(&mut unread).unwrap();
            assert_eq!(unread, rest, "did not read exactly one frame");
        }
        (Err(_), Err(_)) => {}
        (expected, actual) => {
            panic!("expected {expected:?} for body {frame_body:?}, got {actual:?}")
        }
    }
    Ok(())
}
