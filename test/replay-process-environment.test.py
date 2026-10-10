"""Deterministic Darwin stack-copy/lifetime regression cases using synthetic bytes only."""
import errno
import ctypes
import importlib.util
import os
from pathlib import Path
import struct
import unittest

source = Path(__file__).resolve().parents[1] / "scripts" / "replay-process-environment.py"
spec = importlib.util.spec_from_file_location("inspection", source)
inspection = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inspection)


class StackCopyRaceTest(unittest.TestCase):
    def setUp(self):
        self.data = struct.pack("=i", 3) + b"/fixture\0\0fixture\0WINEPREFIX=/argument\0\0WINEPREFIX=/owned path\0\0"

    def test_exec_race_retries_then_matches_only_the_complete_environment_entry(self):
        for code in (errno.EIO,):
            reads = []
            def read():
                reads.append(True)
                if len(reads) == 1:
                    raise OSError(code, "Stack changed")
                return self.data
            result = inspection.live_environment(read, lambda: 2, lambda _: None)
            self.assertTrue(result == (b"WINEPREFIX=/owned path",))
            self.assertEqual(len(reads), 2)

    def test_exited_and_zombie_processes_have_no_environment_to_inspect(self):
        for state in (None, 5):
            def read():
                raise OSError(errno.EIO, "Exited stack")
            self.assertTrue(inspection.live_environment(read, lambda: state, lambda _: None) == ())

    def test_zero_argument_and_truncated_stacks_retry_instead_of_silently_skipping_live_processes(self):
        for malformed in (struct.pack("=i", 0), self.data[:12]):
            reads = iter((malformed, self.data))
            self.assertTrue(inspection.live_environment(lambda: next(reads), lambda: 2, lambda _: None) == (b"WINEPREFIX=/owned path",))

    def test_persistently_unreadable_live_process_fails_closed_after_bounded_retries(self):
        for code in (errno.EIO,):
            reads = []
            def read():
                reads.append(True)
                raise OSError(code, "Unreadable live stack")
            with self.assertRaises(OSError) as failure:
                inspection.live_environment(read, lambda: 2, lambda _: None)
            self.assertEqual(failure.exception.errno, code)
            self.assertEqual(len(reads), 3)
        with self.assertRaises(ValueError):
            inspection.live_environment(lambda: struct.pack("=i", 0), lambda: 2, lambda _: None)

    def test_unavailable_lifetime_inspection_and_nontransient_errors_fail_closed(self):
        def read():
            raise OSError(errno.EIO, "Stack changed")
        def state():
            raise OSError(errno.EPERM, "Unavailable lifetime")
        with self.assertRaises(OSError):
            inspection.live_environment(read, state, lambda _: None)
        def permanent():
            raise OSError(errno.ENOMEM, "Unavailable inspection")
        with self.assertRaises(OSError) as failure:
            inspection.live_environment(permanent, lambda: None, lambda _: None)
        self.assertEqual(failure.exception.errno, errno.ENOMEM)

    def test_native_lifetime_api_accepts_the_complete_short_info_layout(self):
        library = ctypes.CDLL("/usr/lib/libSystem.B.dylib", use_errno=True)
        library.proc_pidinfo.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_uint64, ctypes.c_void_p, ctypes.c_int]
        library.proc_pidinfo.restype = ctypes.c_int
        self.assertTrue(inspection.process_state(library, os.getpid()) in (1, 2, 3, 4, 6, 7))


if __name__ == "__main__":
    unittest.main()
