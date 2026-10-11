# Preserve shulker box facing

Retain native block-entity facing during later Java block-state queries. Otherwise, a subsequent block update can restore the runtime mapping's default downward facing. Start block-entity rewrites from the raw runtime mapping to preserve fresh facing updates.

Tests exercise the actual chunk getter with missing, null, west-facing, and updated downward-facing block-entity data.

The live BDS 1.26.51.1 ViaProxy scene opens a side-placed box with empty hands and with a held white box. Three stored stone items persist after reopening. The box preserves its side orientation after a neighbor update.
