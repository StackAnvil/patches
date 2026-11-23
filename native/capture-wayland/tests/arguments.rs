// SPDX-License-Identifier: GPL-3.0-or-later
use std::ffi::OsStr;
use std::os::unix::ffi::OsStrExt;
use std::process::Command;

#[test]
fn rejects_a_non_utf8_argument_with_the_usage_exit_code() {
    let output = Command::new(env!("CARGO_BIN_EXE_capture-wayland"))
        .args([
            OsStr::new("screenshot"),
            OsStr::new("12"),
            OsStr::from_bytes(b"caf\xe9.ppm"),
        ])
        .env_remove("WAYLAND_DISPLAY")
        .output()
        .expect("start capture-wayland");
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "stderr: {stderr}");
    assert!(
        stderr.starts_with("Arguments must be valid UTF-8\nUsage: capture-wayland "),
        "stderr: {stderr}"
    );
}
