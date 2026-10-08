// SPDX-License-Identifier: GPL-3.0-or-later
use std::path::PathBuf;

use crate::Result;

pub const USAGE: &str = "Usage: capture-x11 list|pointer|active|pixel ID X Y|screenshot ID FILE|focus ID|resize ID WIDTH HEIGHT [X Y]|click|double-click ID X Y [left|right]|mouse-hold ID X Y BUTTON MS|button-hold ID BUTTON MS|type ID TEXT|key|double-key ID NAME|key-hold ID NAME MS|drag ID BUTTON DWELL_MS X0 Y0 X1 Y1 ...";

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
    pub fn number(self) -> u8 {
        match self {
            Self::Left => 1,
            Self::Right => 3,
        }
    }

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
    List,
    Pointer,
    Active,
    Pixel {
        window: u32,
        point: Point,
    },
    Screenshot {
        window: u32,
        path: PathBuf,
    },
    Focus {
        window: u32,
    },
    Resize {
        window: u32,
        width: u16,
        height: u16,
        position: Option<Point>,
    },
    Click {
        window: u32,
        point: Point,
        button: Button,
        duration: u64,
        repeats: u8,
    },
    ButtonHold {
        window: u32,
        button: Button,
        duration: u64,
    },
    Type {
        window: u32,
        text: String,
    },
    Key {
        window: u32,
        names: Vec<String>,
        duration: u64,
        repeats: u8,
    },
    Drag {
        window: u32,
        button: Button,
        dwell: u64,
        points: Vec<Point>,
    },
}

fn decimal<T: std::str::FromStr>(value: &str) -> Result<T> {
    if value.is_empty() || !value.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err(format!("Invalid nonnegative integer: {value}").into());
    }
    value
        .parse()
        .map_err(|_| format!("Integer is out of range: {value}").into())
}

fn window(value: &str) -> Result<u32> {
    let number = if let Some(hex) = value
        .strip_prefix("0x")
        .or_else(|| value.strip_prefix("0X"))
    {
        u32::from_str_radix(hex, 16).map_err(|_| "Invalid window ID")?
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
    pub fn parse(args: &[String]) -> Result<Self> {
        let args: Vec<&str> = args.iter().map(String::as_str).collect();
        Ok(match args.as_slice() {
            ["list"] => Self::List,
            ["pointer"] => Self::Pointer,
            ["active"] => Self::Active,
            ["pixel", id, x, y] => Self::Pixel {
                window: window(id)?,
                point: Point::parse(x, y)?,
            },
            ["screenshot", id, path] => Self::Screenshot {
                window: window(id)?,
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
                    text: text.to_string(),
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
        Command::parse(
            &args
                .iter()
                .map(|value| value.to_string())
                .collect::<Vec<_>>(),
        )
    }

    #[test]
    fn validates_entire_drag_path_and_hold_budget() {
        for dwell in ["0", "1001", "-1", "1.5", "99999999999999999999999999999"] {
            assert!(parse(&["drag", "0x123", "left", dwell, "0", "0", "10", "10"]).is_err());
        }
        for coordinate in ["-1", "1.5", "65536", "10junk"] {
            assert!(parse(&["drag", "0x123", "left", "10", "0", "0", coordinate, "10"]).is_err());
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
            assert_eq!(Command::parse(&args).is_ok(), valid);
        }
    }

    #[test]
    fn rejects_malformed_input_before_emitting_anything() {
        for id in ["0", "-1", "0x", "0x123junk", "4294967296"] {
            assert!(parse(&["focus", id]).is_err());
        }
        for sequence in ["", "+a", "a+", "Control++a", "a+b+c+d+e+f+g+h+i"] {
            assert!(parse(&["key", "12", sequence]).is_err());
        }
        for text in ["validthenINVALID", "valid\n", "é"] {
            assert!(parse(&["type", "12", text]).is_err());
        }
        assert!(parse(&["button-hold", "12", "middle", "100"]).is_err());
        assert!(parse(&["resize", "12", "640", "360", "1"]).is_err());
        assert_eq!(
            parse(&["focus", "0x123"]).unwrap(),
            Command::Focus { window: 291 }
        );
    }

    #[test]
    fn pixel_bounds_exclude_the_far_edges() {
        assert!(Point { x: 639, y: 359 }.fits(640, 360));
        assert!(!Point { x: 640, y: 0 }.fits(640, 360));
        assert!(!Point { x: 0, y: 360 }.fits(640, 360));
        assert!(!Point { x: 0, y: 0 }.fits(0, 0));
    }
}
