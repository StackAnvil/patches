// SPDX-License-Identifier: GPL-3.0-or-later
//! Helpers shared by the fuzz targets.

use std::io::{ErrorKind, Read, Result};

/// An in-memory socket that returns short reads and occasional interruptions,
/// as a Unix stream can.
pub struct ChunkedReader<'a> {
    data: &'a [u8],
    position: usize,
    schedule: &'a [u8],
    step: usize,
    interrupted: bool,
}

impl<'a> ChunkedReader<'a> {
    /// Each schedule byte sets the size of one read: the low 7 bits give 1 to 128
    /// bytes, and the high bit first returns `ErrorKind::Interrupted` once.
    /// An empty schedule returns as much as the caller asks for.
    pub fn new(data: &'a [u8], schedule: &'a [u8]) -> Self {
        Self {
            data,
            position: 0,
            schedule,
            step: 0,
            interrupted: false,
        }
    }

    /// The number of bytes the parser has read.
    pub fn consumed(&self) -> usize {
        self.position
    }
}

impl Read for ChunkedReader<'_> {
    fn read(&mut self, buffer: &mut [u8]) -> Result<usize> {
        let mut limit = buffer.len();
        if !self.schedule.is_empty() {
            let entry = self.schedule[self.step % self.schedule.len()];
            if entry & 0x80 != 0 && !self.interrupted {
                self.interrupted = true;
                return Err(ErrorKind::Interrupted.into());
            }
            self.interrupted = false;
            self.step += 1;
            limit = limit.min(usize::from(entry & 0x7f) + 1);
        }
        let rest = &self.data[self.position..];
        let count = limit.min(rest.len());
        buffer[..count].copy_from_slice(&rest[..count]);
        self.position += count;
        Ok(count)
    }
}
