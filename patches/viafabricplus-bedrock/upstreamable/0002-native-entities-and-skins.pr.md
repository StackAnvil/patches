Install supplied player skin geometry even when its identifier uses the standard humanoid alias. Queue skin updates for their exact source connection while Java is still configuring, then install them in arrival order when the play listener becomes available. Disconnected sources cannot leak updates into another connection.

Native actor rendering reports active missing geometry and textures. Inactive server variants do not produce rendering failures.

Validation: queue identity, order and closed-connection regressions pass; the full addon suite has no failures. Recorded Geyser and CubeCraft scenes exercise the extended configuration phase created by custom block packs.
