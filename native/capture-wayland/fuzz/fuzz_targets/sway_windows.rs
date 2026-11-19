// SPDX-License-Identifier: GPL-3.0-or-later
//! Lists windows from a generated Sway tree and checks the result against the
//! tree that the target generated.
//!
//! Visible `xdg_shell` containers are windows, in depth-first order with
//! `nodes` before `floating_nodes`. Each window takes the name of its nearest
//! `output` ancestor. Its position is the container `rect` plus the
//! `window_rect` offset, and its size is the `window_rect` size. A window with
//! a missing, non-integer or out-of-range field fails the whole listing.
#![no_main]

use capture_wayland::fuzzing::{Window, windows};
use std::ops::RangeInclusive;

use libfuzzer_sys::arbitrary::{Result, Unstructured};
use libfuzzer_sys::fuzz_target;
use serde_json::{Map, Value, json};

const MAX_DEPTH: u8 = 8;
const MAX_NODES: u32 = 64;

/// A JSON field value. `None` leaves the field out.
#[derive(Clone, Debug)]
enum Field {
    Integer(i64),
    Unsigned(u64),
    Float(f64),
    Text(String),
    Flag(bool),
}

impl Field {
    fn json(&self) -> Value {
        match self {
            Self::Integer(value) => json!(value),
            Self::Unsigned(value) => json!(value),
            Self::Float(value) => json!(value),
            Self::Text(value) => json!(value),
            Self::Flag(value) => json!(value),
        }
    }

    fn integer(field: Option<&Self>) -> Option<i64> {
        match field? {
            Self::Integer(value) => Some(*value),
            Self::Unsigned(value) => i64::try_from(*value).ok(),
            Self::Float(_) | Self::Text(_) | Self::Flag(_) => None,
        }
    }

    /// Mostly an integer in `usual`, so that whole trees list windows, and
    /// otherwise an edge value or another JSON type.
    fn generate(
        input: &mut Unstructured,
        usual: RangeInclusive<i64>,
        edges: &[i64],
    ) -> Result<Option<Self>> {
        if input.ratio(15, 16)? {
            return Ok(Some(Self::Integer(input.int_in_range(usual)?)));
        }
        Self::other(input, edges)
    }

    /// No field, an edge integer, or another JSON type.
    fn other(input: &mut Unstructured, edges: &[i64]) -> Result<Option<Self>> {
        Ok(Some(match input.int_in_range(0..=7_u8)? {
            0 => return Ok(None),
            1 => Self::Unsigned(input.int_in_range(i64::MAX as u64..=u64::MAX)?),
            2 => Self::Float(*input.choose(&[0.0, 1.5, -1.0, 1e300])?),
            3 => Self::Text(input.arbitrary()?),
            4 => Self::Flag(input.arbitrary()?),
            5 => Self::Integer(input.arbitrary()?),
            _ => Self::Integer(*input.choose(edges)?),
        }))
    }
}

const POSITIONS: &[i64] = &[
    0,
    1,
    -1,
    640,
    -640,
    i32::MAX as i64,
    i32::MIN as i64,
    i32::MAX as i64 + 1,
    i32::MIN as i64 - 1,
    i64::MAX,
    i64::MIN,
];
const SIZES: &[i64] = &[0, 1, 360, 640, 65535, 65536, -1, i64::MAX];

#[derive(Debug)]
struct Rect {
    x: Option<Field>,
    y: Option<Field>,
    width: Option<Field>,
    height: Option<Field>,
}

impl Rect {
    fn generate(input: &mut Unstructured) -> Result<Option<Self>> {
        if input.ratio(1, 16)? {
            return Ok(None);
        }
        Ok(Some(Self {
            x: Field::generate(input, -2000..=4000, POSITIONS)?,
            y: Field::generate(input, -2000..=4000, POSITIONS)?,
            width: Field::generate(input, 0..=4000, SIZES)?,
            height: Field::generate(input, 0..=4000, SIZES)?,
        }))
    }

    fn json(&self) -> Value {
        let mut object = Map::new();
        for (name, field) in [
            ("x", &self.x),
            ("y", &self.y),
            ("width", &self.width),
            ("height", &self.height),
        ] {
            if let Some(field) = field {
                object.insert(name.into(), field.json());
            }
        }
        Value::Object(object)
    }
}

#[derive(Debug)]
struct Node {
    kind: Option<&'static str>,
    name: Option<Field>,
    shell: Option<&'static str>,
    visible: Option<Field>,
    id: Option<Field>,
    focused: Option<Field>,
    rect: Option<Rect>,
    window_rect: Option<Rect>,
    nodes: Vec<Node>,
    floating_nodes: Vec<Node>,
}

impl Node {
    fn generate(input: &mut Unstructured, depth: u8, budget: &mut u32) -> Result<Self> {
        *budget = budget.saturating_sub(1);
        let mut node = Self {
            kind: *input.choose(&[
                None,
                Some("root"),
                Some("output"),
                Some("workspace"),
                Some("con"),
                Some("floating_con"),
            ])?,
            name: if input.ratio(3, 4)? {
                Some(Field::Text(input.arbitrary()?))
            } else {
                Field::other(input, &[0])?
            },
            shell: *input.choose(&[
                None,
                Some("xdg_shell"),
                Some("xwayland"),
                Some("XDG_SHELL"),
            ])?,
            visible: if input.ratio(3, 4)? {
                Some(Field::Flag(input.arbitrary()?))
            } else {
                Field::other(input, &[1])?
            },
            id: if input.ratio(3, 4)? {
                Some(Field::Integer(input.int_in_range(1..=1000)?))
            } else {
                Field::other(input, &[0, -1, i64::MAX])?
            },
            focused: if input.ratio(3, 4)? {
                Some(Field::Flag(input.arbitrary()?))
            } else {
                Field::other(input, &[1])?
            },
            rect: Rect::generate(input)?,
            window_rect: Rect::generate(input)?,
            nodes: Vec::new(),
            floating_nodes: Vec::new(),
        };
        if depth < MAX_DEPTH {
            for floating in [false, true] {
                while *budget > 0 && input.ratio(1, 3)? {
                    let child = Self::generate(input, depth + 1, budget)?;
                    if floating {
                        node.floating_nodes.push(child);
                    } else {
                        node.nodes.push(child);
                    }
                }
            }
        }
        Ok(node)
    }

    fn json(&self) -> Value {
        let mut object = Map::new();
        if let Some(kind) = self.kind {
            object.insert("type".into(), json!(kind));
        }
        if let Some(shell) = self.shell {
            object.insert("shell".into(), json!(shell));
        }
        for (name, field) in [
            ("name", &self.name),
            ("visible", &self.visible),
            ("id", &self.id),
            ("focused", &self.focused),
        ] {
            if let Some(field) = field {
                object.insert(name.into(), field.json());
            }
        }
        for (name, rect) in [("rect", &self.rect), ("window_rect", &self.window_rect)] {
            if let Some(rect) = rect {
                object.insert(name.into(), rect.json());
            }
        }
        for (name, children) in [
            ("nodes", &self.nodes),
            ("floating_nodes", &self.floating_nodes),
        ] {
            if !children.is_empty() {
                object.insert(name.into(), children.iter().map(Self::json).collect());
            }
        }
        Value::Object(object)
    }

    /// The window this node describes, `Ok(None)` for a container, or
    /// `Err(())` when the window's fields are invalid.
    fn window(&self, output: &str) -> std::result::Result<Option<Window>, ()> {
        if self.shell != Some("xdg_shell") || !matches!(self.visible, Some(Field::Flag(true))) {
            return Ok(None);
        }
        let (rect, content) = self
            .rect
            .as_ref()
            .zip(self.window_rect.as_ref())
            .ok_or(())?;
        let position = |outer: &Option<Field>, inner: &Option<Field>| {
            Field::integer(outer.as_ref())
                .zip(Field::integer(inner.as_ref()))
                .and_then(|(outer, inner)| outer.checked_add(inner))
                .and_then(|value| i32::try_from(value).ok())
        };
        let size = |field: &Option<Field>| {
            Field::integer(field.as_ref()).and_then(|value| u16::try_from(value).ok())
        };
        let id = match &self.id {
            Some(Field::Integer(value)) => u64::try_from(*value).map_err(drop)?,
            Some(Field::Unsigned(value)) => *value,
            _ => return Err(()),
        };
        Ok(Some(Window {
            id: id.to_string(),
            title: match &self.name {
                Some(Field::Text(name)) => name.clone(),
                _ => String::new(),
            },
            x: position(&rect.x, &content.x).ok_or(())?,
            y: position(&rect.y, &content.y).ok_or(())?,
            width: size(&content.width).ok_or(())?,
            height: size(&content.height).ok_or(())?,
            focused: matches!(self.focused, Some(Field::Flag(true))),
            output: output.to_owned(),
        }))
    }

    fn expected(&self, output: &str, result: &mut Vec<Window>) -> std::result::Result<(), ()> {
        let output = if self.kind == Some("output") {
            match &self.name {
                Some(Field::Text(name)) => name.as_str(),
                _ => "",
            }
        } else {
            output
        };
        result.extend(self.window(output)?);
        for child in self.nodes.iter().chain(&self.floating_nodes) {
            child.expected(output, result)?;
        }
        Ok(())
    }
}

fuzz_target!(|data: &[u8]| {
    let mut input = Unstructured::new(data);
    let mut budget = MAX_NODES;
    let Ok(tree) = Node::generate(&mut input, 0, &mut budget) else {
        return;
    };
    let mut expected = Vec::new();
    let expected = tree.expected("", &mut expected).map(|()| expected);
    let actual = windows(&tree.json());
    match (&expected, &actual) {
        (Ok(expected), Ok(actual)) => assert_eq!(actual, expected, "listed different windows"),
        (Err(()), Err(_)) => {}
        _ => panic!("expected {expected:?}, got {actual:?} for {tree:#?}"),
    }
});
