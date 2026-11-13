"""Verified file-backed PE reads for REA comparison controls.

This is a byte reader, not a decompiler. Analysis runs through REA. Every load
requires a SHA-256 pin, either explicitly or from StackAnvil's private target.
Addresses are linked virtual addresses, not offsets in a relocated process.
"""
import argparse
import bisect
import hashlib
import json
import os
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[2]


def independent_path(path):
    path = Path(path).expanduser()
    if "pistondecompiler" in str(path).lower():
        raise ValueError("PistonDecompiler paths are not permitted")
    resolved = path.resolve()
    if "pistondecompiler" in str(resolved).lower():
        raise ValueError("PistonDecompiler paths are not permitted")
    return resolved


class PE:
    def __init__(self, path=None, sha256=None):
        if path is None:
            manifest = independent_path(os.environ.get(
                "STACKANVIL_REA_TARGET", ROOT / ".stackanvil/rea/current.json"))
            target = json.loads(manifest.read_text())
            if target.get("schemaVersion") != 1:
                raise ValueError("Unsupported REA target manifest")
            path, sha256 = target["artifact"]["path"], target["artifact"]["sha256"]
        if not isinstance(sha256, str) or len(sha256) != 64 or any(
                c not in "0123456789abcdefABCDEF" for c in sha256):
            raise ValueError("An explicit SHA-256 pin is required")
        self.path = independent_path(path)
        self.b = self.path.read_bytes()
        self.sha256 = hashlib.sha256(self.b).hexdigest()
        if self.sha256 != sha256.lower():
            raise ValueError(f"Artifact SHA-256 differs from the pin: {self.sha256}")
        if self._bytes(0, 2) != b"MZ":
            raise ValueError("Not a DOS/PE image")
        nt = self._unpack("<I", 0x3c)[0]
        if self._bytes(nt, 4) != b"PE\0\0":
            raise ValueError("Not a PE image")
        self.machine, count = self._unpack("<HH", nt + 4)
        optional_size = self._unpack("<H", nt + 20)[0]
        optional = nt + 24
        self._bytes(optional, optional_size)
        if optional_size < 112 or self._unpack("<H", optional)[0] != 0x20b:
            raise ValueError("Only PE32+ images are supported by this control reader")
        self.image_base = self._unpack("<Q", optional + 24)[0]
        self.dir_count = self._unpack("<I", optional + 108)[0]
        if self.dir_count > (optional_size - 112) // 8:
            raise ValueError("Data directories exceed the optional header")
        self.dirs = optional + 112
        self.sections = []
        section_table = optional + optional_size
        self._bytes(section_table, count * 40)
        for index in range(count):
            offset = section_table + index * 40
            name = self._bytes(offset, 8).rstrip(b"\0").decode("ascii", "replace")
            virtual_size, rva, raw_size, raw = self._unpack("<IIII", offset + 8)
            self._bytes(raw, raw_size)
            self.sections.append((name, rva, max(virtual_size, raw_size), raw, raw_size))
        self._functions = None

    def _bytes(self, offset, length):
        if offset < 0 or length < 0 or offset + length > len(self.b):
            raise ValueError("Range exceeds artifact file bytes")
        return self.b[offset:offset + length]

    def _unpack(self, fmt, offset):
        return struct.unpack(fmt, self._bytes(offset, struct.calcsize(fmt)))

    def _section(self, rva, length=1):
        if length < 0:
            raise ValueError("Negative read length")
        matches = [s for s in self.sections if s[1] <= rva < s[1] + s[2]]
        if len(matches) != 1:
            raise ValueError(f"RVA 0x{rva:x} has no unique section")
        section = matches[0]
        if rva - section[1] + length > section[4]:
            raise ValueError(f"RVA 0x{rva:x} exceeds file-backed section bytes")
        return section

    def rva_to_off(self, rva):
        section = self._section(rva)
        return section[3] + rva - section[1]

    def read(self, va, length):
        section = self._section(va - self.image_base, length)
        offset = section[3] + va - self.image_base - section[1]
        return self._bytes(offset, length)

    def data_dir(self, index):
        if not 0 <= index < self.dir_count:
            return 0, 0
        return self._unpack("<II", self.dirs + index * 8)

    def u8(self, va):
        return self.read(va, 1)[0]

    def u16(self, va):
        return struct.unpack("<H", self.read(va, 2))[0]

    def u32(self, va):
        return struct.unpack("<I", self.read(va, 4))[0]

    def u64(self, va):
        return struct.unpack("<Q", self.read(va, 8))[0]

    def i32(self, va):
        return struct.unpack("<i", self.read(va, 4))[0]

    def f32(self, va):
        return struct.unpack("<f", self.read(va, 4))[0]

    def cstr(self, va, limit=512):
        section = self._section(va - self.image_base)
        remaining = section[4] - (va - self.image_base - section[1])
        raw = self.read(va, min(limit, remaining))
        end = raw.find(b"\0")
        return None if end < 0 else raw[:end].decode("utf-8", "replace")

    def start(self, name):
        return self.image_base + next(s[1] for s in self.sections if s[0] == name)

    def end(self, name):
        return self.image_base + next(s[1] + s[2] for s in self.sections if s[0] == name)

    def functions(self):
        if self.machine != 0x8664:
            raise ValueError("RUNTIME_FUNCTION extraction requires an AMD64 PE")
        if self._functions is None:
            rva, size = self.data_dir(3)
            if size % 12:
                raise ValueError("Malformed AMD64 exception directory length")
            raw = self.read(self.image_base + rva, size) if size else b""
            rows = []
            for begin, end, unwind in struct.iter_unpack("<III", raw):
                if begin >= end:
                    raise ValueError("Invalid RUNTIME_FUNCTION bounds")
                self.read(self.image_base + begin, end - begin)
                rows.append((self.image_base + begin, self.image_base + end, unwind))
            self._functions = sorted(rows)
        return self._functions

    def function(self, va):
        rows = self.functions()
        index = bisect.bisect_right(rows, (va, float("inf"), float("inf"))) - 1
        if index < 0 or not rows[index][0] <= va < rows[index][1]:
            return None
        begin, end, unwind = rows[index]
        return dict(procedureAddress=hex(begin), endExclusive=hex(end), unwindInfoRva=hex(unwind))

    def extract(self, va, end=None):
        declared = self.function(va)
        if end is None:
            if declared is None:
                raise ValueError("No RUNTIME_FUNCTION covers this address; provide an explicit end for a manual range")
            begin, stop = int(declared["procedureAddress"], 16), int(declared["endExclusive"], 16)
            scope = "One contiguous AMD64 RUNTIME_FUNCTION span; excludes other chunks, callees and external data"
        else:
            begin, stop = va, end
            if stop <= begin:
                raise ValueError("The end must be greater than the start")
            scope = "Caller-supplied raw range; no function-boundary claim"
        raw = self.read(begin, stop - begin)
        record = dict(sourceSha256=self.sha256, sourcePath=str(self.path), imageBase=hex(self.image_base),
                      requestedAddress=hex(va), procedureAddress=hex(begin), endExclusive=hex(stop),
                      sourceFileOffset=self.rva_to_off(begin - self.image_base), length=len(raw),
                      derivedSha256=hashlib.sha256(raw).hexdigest(), scope=scope)
        if end is None:
            record["unwindInfoRva"] = declared["unwindInfoRva"]
        return record, raw

    def imports(self):
        rva, size = self.data_dir(1)
        if not rva or not size:
            return []
        rows = []
        for index in range(size // 20):
            oft, timestamp, forwarder, name_rva, first = struct.unpack("<IIIII", self.read(self.image_base + rva + index * 20, 20))
            if not any((oft, timestamp, forwarder, name_rva, first)):
                return rows
            dll = self.cstr(self.image_base + name_rva)
            thunk = self.image_base + (oft or first)
            for slot in range(len(self.b) // 8):
                value = self.u64(thunk + slot * 8)
                if not value:
                    break
                symbol = f"ordinal#{value & 0xffff}" if value >> 63 else self.cstr(self.image_base + value + 2)
                if dll is None or symbol is None:
                    raise ValueError("Unterminated import name")
                rows.append(dict(address=hex(self.image_base + first + slot * 8), dll=dll, symbol=symbol))
            else:
                raise ValueError("Unterminated import thunk table")
        raise ValueError("Unterminated import descriptor table")


def references(pe, target, limit=200):
    """Byte-pattern candidates only. RIP candidates report displacement ends.

    Resolve instruction starts and alignment with REA before treating a candidate
    as a call, reference, or owning function.
    """
    rows = []
    count = 0
    def add(kind, address, **fields):
        nonlocal count
        count += 1
        if len(rows) < limit:
            rows.append(dict(kind=kind, address=hex(address), **fields))
    for name, rva, span, raw, size in pe.sections:
        blob = pe.b[raw:raw + size]
        start = pe.image_base + rva
        if name == ".text":
            for opcode, kind in [(b"\xe8", "call-rel32"), (b"\xe9", "jump-rel32")]:
                offset = blob.find(opcode)
                while offset >= 0 and offset + 5 <= size:
                    if start + offset + 5 + struct.unpack_from("<i", blob, offset + 1)[0] == target:
                        add(kind, start + offset)
                    offset = blob.find(opcode, offset + 1)
            try:
                import numpy as np
            except ImportError:
                if size > 4 * 1024 * 1024:
                    raise ValueError("Run bun run rea setup-controls for accelerated reference scans")
                for offset in range(size - 3):
                    if start + offset + 4 + struct.unpack_from("<i", blob, offset)[0] == target:
                        add("possible-rip-disp32", start + offset + 4)
            else:
                step = 4 * 1024 * 1024
                for offset in range(0, size - 3, step):
                    chunk = np.frombuffer(blob[offset:offset + step + 3], dtype=np.uint8)
                    windows = np.lib.stride_tricks.sliding_window_view(chunk, 4)
                    disp = windows[:, 0].astype(np.int64) | windows[:, 1].astype(np.int64) << 8 | windows[:, 2].astype(np.int64) << 16 | windows[:, 3].astype(np.int64) << 24
                    disp = np.where(disp >= 1 << 31, disp - (1 << 32), disp)
                    ends = start + offset + np.arange(len(disp), dtype=np.int64) + 4
                    for index in np.flatnonzero(ends + disp == target):
                        add("possible-rip-disp32", int(ends[index]))
        if name in (".rdata", ".data"):
            offset = blob.find(struct.pack("<Q", target))
            while offset >= 0:
                add("absolute-u64", start + offset)
                offset = blob.find(struct.pack("<Q", target), offset + 1)
    return dict(target=hex(target), candidates=rows, totalCandidates=count, truncated=count > len(rows),
                scope="Byte-pattern candidates, not validated instructions or semantic ownership")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["inspect", "function", "extract", "read", "imports", "refs"])
    parser.add_argument("--artifact")
    parser.add_argument("--sha256")
    parser.add_argument("--va", type=lambda s: int(s, 16))
    parser.add_argument("--end", type=lambda s: int(s, 16))
    parser.add_argument("--length", type=int, default=16)
    parser.add_argument("--output")
    parser.add_argument("--limit", type=int, default=200)
    args = parser.parse_args()
    if args.action in ("function", "extract", "read", "refs") and args.va is None:
        parser.error("--va is required for this action")
    if not 1 <= args.limit <= 10000 or not 0 <= args.length <= 1024 * 1024:
        parser.error("Invalid result limit or read length")
    pe = PE(args.artifact, args.sha256)
    if args.action == "inspect":
        result = dict(sha256=pe.sha256, imageBase=hex(pe.image_base), machine=hex(pe.machine),
                      sections=[dict(name=s[0], rva=hex(s[1]), span=s[2], fileOffset=s[3], fileBytes=s[4]) for s in pe.sections],
                      scope="PE32+ file layout; no runtime, symbols or function analysis")
    elif args.action == "function":
        result = pe.function(args.va)
    elif args.action == "extract":
        if not args.output:
            parser.error("--output is required for extraction")
        result, raw = pe.extract(args.va, args.end)
        out = independent_path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        with out.open("xb") as stream:
            os.chmod(out, 0o600)
            stream.write(raw)
        result["derivedPath"] = str(out)
    elif args.action == "read":
        result = dict(address=hex(args.va), length=args.length, bytes=pe.read(args.va, args.length).hex())
    elif args.action == "imports":
        rows = pe.imports()
        result = rows if args.va is None else next((r for r in rows if int(r["address"], 16) == args.va), None)
    else:
        result = references(pe, args.va, args.limit)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, struct.error) as error:
        raise SystemExit(str(error)) from error
