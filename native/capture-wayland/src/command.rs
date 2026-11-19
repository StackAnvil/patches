// SPDX-License-Identifier: GPL-3.0-or-later
use std::path::PathBuf;

use crate::Result;

pub const USAGE: &str = "Usage: capture-wayland serve SOCKET|list|active|pixel ID X Y|move ID X Y|look ID DX DY|screenshot ID FILE|record ID FPS FILE|focus ID|resize ID WIDTH HEIGHT [X Y]|click|double-click ID X Y [left|right]|mouse-hold ID X Y BUTTON MS|button-hold ID BUTTON MS|type ID TEXT|key|double-key ID NAME|key-hold ID NAME MS|drag ID BUTTON DWELL_MS X0 Y0 X1 Y1 ...";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Point {
    pub x: u16,
    pub y: u16,
}

impl Point {
    fn parse(x: &str, y: &str) -> Result<Self> {
        Ok(Self {
            x: decimal(x)?,
            y: decimal(y)?,
        })
    }

    pub fn fits(self, width: u16, height: u16) -> bool {
        self.x < width && self.y < height
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Button {
    Left,
    Right,
}

impl Button {
    fn parse(value: &str) -> Result<Self> {
        match value {
            "left" => Ok(Self::Left),
            "right" => Ok(Self::Right),
            _ => Err("Use left or right mouse button".into()),
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum Command {
    Serve {
        path: PathBuf,
    },
    List,
    Active,
    Pixel {
        window: u64,
        point: Point,
    },
    Move {
        window: u64,
        point: Point,
    },
    /// Relative pointer motion, which a pointer-locked game reads as camera look.
    Look {
        window: u64,
        dx: i16,
        dy: i16,
    },
    Screenshot {
        window: u64,
        path: PathBuf,
    },
    Record {
        window: u64,
        fps: u16,
        path: PathBuf,
    },
    Focus {
        window: u64,
    },
    Resize {
        window: u64,
        width: u16,
        height: u16,
        position: Option<Point>,
    },
    Click {
        window: u64,
        point: Point,
        button: Button,
        duration: u64,
        repeats: u8,
    },
    ButtonHold {
        window: u64,
        button: Button,
        duration: u64,
    },
    Type {
        window: u64,
        text: String,
    },
    Key {
        window: u64,
        names: Vec<String>,
        duration: u64,
        repeats: u8,
    },
    Drag {
        window: u64,
        button: Button,
        dwell: u64,
        points: Vec<Point>,
    },
}

fn look_delta(value: &str) -> Result<i16> {
    let magnitude = value.strip_prefix('-').unwrap_or(value);
    let delta: i16 = decimal(magnitude)?;
    if delta > 2000 {
        return Err(format!("Look delta must be within 2000 pixels: {value}").into());
    }
    Ok(if value.starts_with('-') {
        -delta
    } else {
        delta
    })
}

fn decimal<T: std::str::FromStr>(value: &str) -> Result<T>
where
    T::Err: std::error::Error + 'static,
{
    if value.is_empty() || !value.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err(format!("Invalid nonnegative integer: {value}").into());
    }
    value.parse().map_err(|error| {
        crate::ContextError::new(format!("Integer is out of range: {value}"), error).into()
    })
}

fn window(value: &str) -> Result<u64> {
    let number = if let Some(hex) = value
        .strip_prefix("0x")
        .or_else(|| value.strip_prefix("0X"))
    {
        u64::from_str_radix(hex, 16)
            .map_err(|error| crate::ContextError::new("Invalid window ID", error))?
    } else {
        decimal(value)?
    };
    if number == 0 {
        return Err("Window ID must be nonzero".into());
    }
    Ok(number)
}

fn duration(value: &str, maximum: u64) -> Result<u64> {
    let duration = decimal(value)?;
    if !(1..=maximum).contains(&duration) {
        return Err(format!("Duration must be 1 to {maximum} ms").into());
    }
    Ok(duration)
}

impl Command {
    #[expect(
        clippy::too_many_lines,
        reason = "Keep command syntax and argument validation together in one match"
    )]
    pub fn parse(args: &[String]) -> Result<Self> {
        let args: Vec<&str> = args.iter().map(String::as_str).collect();
        Ok(match args.as_slice() {
            ["serve", path] => Self::Serve { path: path.into() },
            ["list"] => Self::List,
            ["active"] => Self::Active,
            ["pixel", id, x, y] => Self::Pixel {
                window: window(id)?,
                point: Point::parse(x, y)?,
            },
            ["move", id, x, y] => Self::Move {
                window: window(id)?,
                point: Point::parse(x, y)?,
            },
            ["look", id, dx, dy] => Self::Look {
                window: window(id)?,
                dx: look_delta(dx)?,
                dy: look_delta(dy)?,
            },
            ["screenshot", id, path] => Self::Screenshot {
                window: window(id)?,
                path: path.into(),
            },
            ["record", id, fps, path] => Self::Record {
                window: window(id)?,
                fps: u16::try_from(duration(fps, 120)?)?,
                path: path.into(),
            },
            ["focus", id] => Self::Focus {
                window: window(id)?,
            },
            ["resize", id, width, height, position @ ..]
                if position.is_empty() || position.len() == 2 =>
            {
                let width = decimal(width)?;
                let height = decimal(height)?;
                if !(640..=16384).contains(&width) || !(360..=16384).contains(&height) {
                    return Err("Invalid window size".into());
                }
                Self::Resize {
                    window: window(id)?,
                    width,
                    height,
                    position: match position {
                        [x, y] => Some(Point::parse(x, y)?),
                        _ => None,
                    },
                }
            }
            [name @ ("click" | "double-click"), id, x, y, button @ ..] if button.len() <= 1 => {
                Self::Click {
                    window: window(id)?,
                    point: Point::parse(x, y)?,
                    button: Button::parse(button.first().copied().unwrap_or("left"))?,
                    duration: 50,
                    repeats: if *name == "double-click" { 2 } else { 1 },
                }
            }
            ["mouse-hold", id, x, y, button, ms] => Self::Click {
                window: window(id)?,
                point: Point::parse(x, y)?,
                button: Button::parse(button)?,
                duration: duration(ms, 10000)?,
                repeats: 1,
            },
            ["button-hold", id, button, ms] => Self::ButtonHold {
                window: window(id)?,
                button: Button::parse(button)?,
                duration: duration(ms, 10000)?,
            },
            ["type", id, text] => {
                if !text.bytes().all(|byte| {
                    byte.is_ascii_lowercase() || byte.is_ascii_digit() || b" .-".contains(&byte)
                }) {
                    return Err("Only lowercase ASCII letters, digits, spaces, periods, and hyphens can be typed".into());
                }
                Self::Type {
                    window: window(id)?,
                    text: (*text).to_string(),
                }
            }
            [
                name @ ("key" | "double-key" | "key-hold"),
                id,
                sequence,
                ms @ ..,
            ] if ms.len() == usize::from(*name == "key-hold") => {
                let names: Vec<String> = sequence.split('+').map(str::to_owned).collect();
                if names.iter().any(String::is_empty) || names.len() > 8 {
                    return Err("Specify 1 to 8 keys separated by +".into());
                }
                Self::Key {
                    window: window(id)?,
                    names,
                    duration: if *name == "double-key" {
                        70
                    } else if let Some(ms) = ms.first() {
                        duration(ms, 10000)?
                    } else {
                        1
                    },
                    repeats: if *name == "double-key" { 2 } else { 1 },
                }
            }
            ["drag", id, button, dwell, coordinates @ ..] => {
                let dwell = duration(dwell, 1000)?;
                if coordinates.len() % 2 != 0
                    || !(4..=128).contains(&coordinates.len())
                    || coordinates.len() as u64 / 2 * dwell > 10000
                {
                    return Err("Drag needs 2 to 64 points totaling at most 10000 ms".into());
                }
                let points = coordinates
                    .chunks_exact(2)
                    .map(|xy| Point::parse(xy[0], xy[1]))
                    .collect::<Result<_>>()?;
                Self::Drag {
                    window: window(id)?,
                    button: Button::parse(button)?,
                    dwell,
                    points,
                }
            }
            _ => return Err("Invalid capture command or arguments".into()),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(args: &[&str]) -> Result<Command> {
        Command::parse(&args.iter().map(ToString::to_string).collect::<Vec<_>>())
    }

    #[test]
    fn accepts_window_relative_pointer_motion_without_a_button() {
        assert_eq!(
            parse(&["move", "0x123", "639", "258"]).unwrap(),
            Command::Move {
                window: 0x123,
                point: Point { x: 639, y: 258 },
            }
        );
        parse(&["move", "0x123", "-1", "258"])
            .expect_err("parser accepted negative pointer coordinates");
        parse(&["move", "0x123", "639", "258", "left"])
            .expect_err("parser accepted a button argument on move");
    }

    #[test]
    fn accepts_bounded_signed_look_deltas() {
        assert_eq!(
            parse(&["look", "0x123", "-40", "15"]).unwrap(),
            Command::Look {
                window: 0x123,
                dx: -40,
                dy: 15,
            }
        );
        parse(&["look", "0x123", "2001", "0"])
            .expect_err("parser accepted a look delta above 2000");
        parse(&["look", "0x123", "+5", "0"])
            .expect_err("parser accepted an explicit plus sign on a look delta");
        parse(&["look", "0x123", "--5", "0"])
            .expect_err("parser accepted repeated signs on a look delta");
    }

    #[test]
    fn validates_entire_drag_path_and_hold_budget() {
        for dwell in ["0", "1001", "-1", "1.5", "99999999999999999999999999999"] {
            parse(&["drag", "0x123", "left", dwell, "0", "0", "10", "10"])
                .expect_err("parser accepted an invalid drag dwell");
        }
        for coordinate in ["-1", "1.5", "65536", "10junk"] {
            parse(&["drag", "0x123", "left", "10", "0", "0", coordinate, "10"])
                .expect_err("parser accepted an invalid drag coordinate");
        }
        for (count, dwell, valid) in [
            (1, 1, false),
            (64, 1, true),
            (65, 1, false),
            (10, 1000, true),
            (11, 1000, false),
        ] {
            let mut args = vec![
                "drag".into(),
                "0x123".into(),
                "right".into(),
                dwell.to_string(),
            ];
            args.extend(std::iter::repeat_n("0".to_string(), count * 2));
            let result = Command::parse(&args);
            assert_eq!(
                result.is_ok(),
                valid,
                "drag with {count} points and dwell {dwell}: {result:?}"
            );
        }
    }

    #[test]
    fn rejects_malformed_input_before_emitting_anything() {
        for id in ["0", "-1", "0x", "0x123junk", "18446744073709551616"] {
            parse(&["focus", id]).expect_err("parser accepted an invalid window ID");
        }
        for sequence in ["", "+a", "a+", "Control++a", "a+b+c+d+e+f+g+h+i"] {
            parse(&["key", "12", sequence]).expect_err("parser accepted an invalid key sequence");
        }
        for text in ["validthenINVALID", "valid\n", "é"] {
            parse(&["type", "12", text]).expect_err("parser accepted invalid text");
        }
        parse(&["button-hold", "12", "middle", "100"])
            .expect_err("parser accepted a middle button hold");
        parse(&["resize", "12", "640", "360", "1"])
            .expect_err("parser accepted an incomplete resize position");
        assert_eq!(
            parse(&["focus", "0x123"]).unwrap(),
            Command::Focus { window: 291 }
        );
    }

    #[test]
    fn reports_invalid_hex_window_id_with_its_parse_error() {
        let error = parse(&["focus", "0x123junk"]).unwrap_err();
        assert!(error.to_string().starts_with("Invalid window ID: "));
        assert!(error.source().unwrap().is::<std::num::ParseIntError>());
    }

    #[test]
    fn pixel_bounds_exclude_the_far_edges() {
        assert!(Point { x: 639, y: 359 }.fits(640, 360));
        assert!(!Point { x: 640, y: 0 }.fits(640, 360));
        assert!(!Point { x: 0, y: 360 }.fits(640, 360));
        assert!(!Point { x: 0, y: 0 }.fits(0, 0));
    }
}
