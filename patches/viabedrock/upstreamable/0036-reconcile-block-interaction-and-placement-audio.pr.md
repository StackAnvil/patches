# Reconcile predicted interaction sounds

A locally predicted closeable interaction can receive both a named Bedrock sound and a legacy door sound event. Consume each matching source once for the same prediction. Preserve remote sounds, unrelated positions, expired predictions, and repeated events from one source.

Packet and tracker tests cover both arrival orders and the independent playback controls. The exact event sequence from the reported CubeCraft session remains unrecorded.
