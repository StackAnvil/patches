"""Compatibility import for comparison fixtures using the verified PE reader."""


def entries(pe):
    return pe.functions()
