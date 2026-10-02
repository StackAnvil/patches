# Correct Java 26.3 head rotation packets

Bedrock head-only movement produced corrupted Java player rotations. Java 26.3 reads the on-ground boolean before yaw and pitch. ViaBedrock wrote it after both angles.

In a recorded Hive scene, the gray seated player’s source pitch became its Java yaw. Its ground flag became a 1.40625-degree pitch. This explains a concrete pose error without changing the skin mesh.

The patch corrects only the Java packet field order. It preserves the existing Bedrock head-only movement state handling. The native head/body application and default skin animation graph need separate evidence.

## Evidence and validation

- Inspected the mapped Java 26.3 rotation packet reader and writer.
- Observed the actual entity and avatar render state for three seated Hive players.
- Both parameterized packet cases failed before the change and passed afterward. They exercise the registered Bedrock handler, serialize its Java output, and decode the current wire layout.
- The rotation and movement tests pass: three cases, no failures or skips. Main and test Checkstyle checks pass.

The native reference uses Bedrock 1.26.51.1, protocol 2193. Private captures, client assets, and runtime traces remain outside Git.

The full exported stack builds successfully: 11 converter tests, 333 core tests, and 447 add-on tests. All 791 cases pass with no failures, errors, or skips. The Prism bundle also builds. The core patch is placed before deferred patches; the metadata patch changes only its regenerated Git blob indexes.
