"""Original PE page loading for bounded REA comparison fixtures.

The caller owns supplied memory, external-call stubs, entry/stop addresses and
instruction limits. This does not emulate a game process, OS, ECS or scheduler.
Unbacked virtual data is zero-filled when the emulated page is first mapped.
"""
from unicorn import Uc, UC_ARCH_X86, UC_MODE_64, UC_HOOK_MEM_UNMAPPED
from unicorn.x86_const import UC_X86_REG_RIP
from pe import PE

ARENA = 0x60000000
STACK = 0x70010008
STOP = 0x50000000


class PeMachine:
    def __init__(self, artifact=None, sha256=None):
        self.pe = PE(artifact, sha256)
        if self.pe.machine != 0x8664:
            raise ValueError("This fixture loader requires an AMD64 PE")
        self.u = Uc(UC_ARCH_X86, UC_MODE_64)
        self.u.mem_map(0x70000000, 0x20000)
        self.u.mem_map(ARENA, 0x20000)
        self.u.mem_map(STOP, 0x1000)
        self.u.mem_write(STOP, b"\xcc")
        self.u.hook_add(UC_HOOK_MEM_UNMAPPED, self.page)

    def page(self, u, access, address, size, value, data):
        page = address & ~0xfff
        if not any(self.pe.image_base + rva <= address < self.pe.image_base + rva + span
                   for name, rva, span, raw, rawsize in self.pe.sections):
            raise RuntimeError(f"Unmapped external access 0x{address:x}, rip=0x{u.reg_read(UC_X86_REG_RIP):x}")
        u.mem_map(page, 0x1000)
        for name, rva, span, raw, rawsize in self.pe.sections:
            start = self.pe.image_base + rva
            begin, end = max(page, start), min(page + 0x1000, start + rawsize)
            if begin < end:
                offset = raw + begin - start
                u.mem_write(begin, self.pe.b[offset:offset + end - begin])
        return True
