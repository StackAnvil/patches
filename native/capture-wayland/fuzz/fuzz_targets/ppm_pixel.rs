// SPDX-License-Identifier: GPL-3.0-or-later
//! Reads one pixel from a P6 PPM image, as `capture-wayland pixel` does with
//! the output of `grim`.
//!
//! The first input byte selects arbitrary bytes or a generated image. For a
//! generated image, the target compares the result with the raster it wrote.
#![no_main]

use capture_wayland::fuzzing::{Point, pixel};
use libfuzzer_sys::arbitrary::{Result, Unstructured};
use libfuzzer_sys::fuzz_target;

/// The bytes that `u8::is_ascii_whitespace` accepts between header tokens.
const WHITESPACE: &[u8] = b" \t\n\x0c\r";
/// The largest raster this target writes, in bytes.
const MAX_RASTER: usize = 3 * 64 * 64;

fuzz_target!(|data: &[u8]| {
    let mut input = Unstructured::new(data);
    let Ok(mode) = input.arbitrary::<u8>() else {
        return;
    };
    if mode & 1 == 0 {
        let (Ok(x), Ok(y)) = (input.arbitrary(), input.arbitrary()) else {
            return;
        };
        // Arbitrary header and raster bytes must return an error, never panic.
        let _ = pixel(input.take_rest(), Point { x, y });
    } else {
        let _ = generated(&mut input);
    }
});

fn whitespace(input: &mut Unstructured, image: &mut Vec<u8>, min: u8) -> Result<()> {
    for _ in 0..input.int_in_range(min..=3)? {
        image.push(*input.choose(WHITESPACE)?);
    }
    Ok(())
}

fn number(input: &mut Unstructured, image: &mut Vec<u8>, value: u16) -> Result<()> {
    for _ in 0..input.int_in_range(0..=2_u8)? {
        image.push(b'0');
    }
    image.extend_from_slice(value.to_string().as_bytes());
    Ok(())
}

fn coordinate(input: &mut Unstructured, size: u16) -> Result<u16> {
    if size > 0 && input.ratio(3, 4)? {
        input.int_in_range(0..=size - 1)
    } else {
        input.arbitrary()
    }
}

fn generated(input: &mut Unstructured) -> Result<()> {
    let width: u16 = if input.ratio(7, 8)? {
        input.int_in_range(0..=9)?
    } else {
        input.arbitrary()?
    };
    let height: u16 = if input.ratio(7, 8)? {
        input.int_in_range(0..=9)?
    } else {
        input.arbitrary()?
    };
    let point = Point {
        x: coordinate(input, width)?,
        y: coordinate(input, height)?,
    };

    // grim writes "P6\n<width> <height>\n255\n". The parser also accepts other
    // whitespace runs, so vary them.
    let mut image = Vec::new();
    whitespace(input, &mut image, 0)?;
    image.extend_from_slice(b"P6");
    whitespace(input, &mut image, 1)?;
    number(input, &mut image, width)?;
    whitespace(input, &mut image, 1)?;
    number(input, &mut image, height)?;
    whitespace(input, &mut image, 1)?;
    image.extend_from_slice(b"255");
    let header_tokens = image.len();
    // Exactly one whitespace byte separates the header from the raster.
    image.push(*input.choose(WHITESPACE)?);
    let header = image.len();

    let full = usize::from(width) * usize::from(height) * 3;
    let mut raster = vec![0; full.min(MAX_RASTER)];
    input.fill_buffer(&mut raster)?;
    if input.ratio(1, 4)? {
        let keep = input.int_in_range(0..=raster.len())?;
        raster.truncate(keep);
    }
    // A raster byte can equal a whitespace byte. It must not be skipped as
    // part of the header.
    if !raster.is_empty() && input.ratio(1, 2)? {
        raster[0] = *input.choose(WHITESPACE)?;
    }
    image.extend_from_slice(&raster);

    let offset = (usize::from(point.y) * usize::from(width) + usize::from(point.x)) * 3;
    let expected = point
        .fits(width, height)
        .then(|| raster.get(offset..offset + 3))
        .flatten();

    let malformed = match input.int_in_range(0..=7_u8)? {
        0 => {
            let magic = *input.choose(&[&b"P3"[..], b"P5", b"p6", b"P6x", b"P"])?;
            let start = image.iter().position(|&byte| byte == b'P').unwrap_or(0);
            image.splice(start..start + 2, magic.iter().copied());
            true
        }
        1 => {
            let depth = *input.choose(&[&b"65535"[..], b"0", b"256", b"0255", b"25", b"255x"])?;
            image.splice(header_tokens - 3..header_tokens, depth.iter().copied());
            true
        }
        2 => {
            // Cut the header before its separator.
            image.truncate(input.int_in_range(0..=header_tokens)?);
            true
        }
        _ => false,
    };

    let result = pixel(&image, point);
    if malformed {
        assert!(result.is_err(), "malformed header accepted: {result:?}");
    } else {
        match (expected, &result) {
            (Some(rgb), Ok(actual)) => assert_eq!(&actual[..], rgb, "wrong pixel at {point:?}"),
            (None, Err(_)) => {}
            _ => panic!(
                "pixel {point:?} of {width}x{height} with {} raster bytes after a {header}-byte header: expected {expected:?}, got {result:?}",
                raster.len()
            ),
        }
    }
    Ok(())
}
