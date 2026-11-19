// SPDX-License-Identifier: GPL-3.0-or-later
//! Parser entry points for the fuzz targets in `fuzz/`.
//!
//! The helper is a binary. This library is empty unless the crate is built
//! with `--cfg fuzzing`, as `cargo fuzz` does. It then compiles the binary's
//! modules and exports only the parsers.
#![cfg(fuzzing)]
#![expect(
    dead_code,
    reason = "The fuzzing library reuses the binary's modules but calls only the parsers"
)]
#![expect(
    clippy::missing_errors_doc,
    clippy::must_use_candidate,
    reason = "The binary's items become public API only in this test build"
)]

include!("main.rs");

pub use wayland::fuzzing;
