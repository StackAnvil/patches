"""Inspect Darwin process environments without publishing arguments or environment bytes.

KERN_PROCARGS2 is the same bounded sysctl used by Apple's ps implementation:
https://github.com/apple-oss-distributions/adv_cmds/blob/main/ps/print.c
"""
import ctypes
import errno
import os
import struct
import sys


def environment(data):
    if len(data) < 4:
        raise ValueError("Truncated process arguments")
    count = struct.unpack_from("=i", data)[0]
    if count < 1 or count > len(data):
        raise ValueError("Invalid process argument count")
    cursor = data.index(b"\0", 4) + 1  # Saved executable path and padding.
    while cursor < len(data) and data[cursor] == 0:
        cursor += 1
    for _ in range(count):
        cursor = data.index(b"\0", cursor) + 1
    while cursor < len(data) and data[cursor] != 0:
        end = data.index(b"\0", cursor)
        yield data[cursor:end]
        cursor = end + 1


def busy(variable, path, owner_pid):
    library = ctypes.CDLL("/usr/lib/libSystem.B.dylib", use_errno=True)
    library.proc_listpids.argtypes = [ctypes.c_uint32, ctypes.c_uint32, ctypes.c_void_p, ctypes.c_int]
    library.proc_listpids.restype = ctypes.c_int
    library.sysctl.argtypes = [ctypes.POINTER(ctypes.c_int), ctypes.c_uint, ctypes.c_void_p,
                              ctypes.POINTER(ctypes.c_size_t), ctypes.c_void_p, ctypes.c_size_t]
    library.sysctl.restype = ctypes.c_int

    # PROC_ALL_PIDS includes owned processes that changed their effective UID.
    size = library.proc_listpids(1, 0, None, 0)
    if size <= 0:
        raise OSError("Cannot enumerate processes")
    for _ in range(4):
        size += 4096
        if size > 4 * 1024 * 1024:
            raise ValueError("Unbounded process list")
        pids = (ctypes.c_int * (size // 4))()
        used = library.proc_listpids(1, 0, pids, size)
        if used <= 0:
            raise OSError("Cannot enumerate processes")
        if used < size:
            break
    else:
        raise ValueError("Process list keeps growing")

    argmax, length = ctypes.c_int(), ctypes.c_size_t(4)
    if library.sysctl((ctypes.c_int * 2)(1, 8), 2, ctypes.byref(argmax), ctypes.byref(length), None, 0):
        raise OSError("Cannot inspect argument bounds")
    if not 4096 <= argmax.value <= 16 * 1024 * 1024:
        raise ValueError("Invalid argument bounds")
    data = ctypes.create_string_buffer(argmax.value)
    prefix = os.fsencode(variable + "=")
    for pid in pids[:used // 4]:
        if pid <= 0 or pid in (os.getpid(), owner_pid):
            continue
        length = ctypes.c_size_t(argmax.value)
        if library.sysctl((ctypes.c_int * 3)(1, 49, pid), 3, data, ctypes.byref(length), None, 0):
            # Exited, zombie/kernel, and inaccessible foreign processes have no readable environment.
            # This matches the Linux /proc inspection's permission and lifetime handling.
            if ctypes.get_errno() in (errno.ESRCH, errno.EINVAL, errno.EACCES, errno.EPERM):
                continue
            raise OSError("Cannot inspect process environment")
        if length.value > argmax.value:
            raise ValueError("Invalid argument size")
        for entry in environment(data.raw[:length.value]):
            if entry.startswith(prefix) and os.path.realpath(os.fsdecode(entry[len(prefix):])) == path:
                return True
    return False


if __name__ == "__main__":
    try:
        if sys.platform != "darwin" or len(sys.argv) != 4 or sys.argv[1] not in ("BOL_HOME", "WINEPREFIX"):
            raise ValueError("Unsupported process inspection")
        result = 10 if busy(sys.argv[1], sys.argv[2], int(sys.argv[3])) else 0
    except Exception:
        result = 1  # Fail closed without leaking private process data through a traceback.
    sys.exit(result)
