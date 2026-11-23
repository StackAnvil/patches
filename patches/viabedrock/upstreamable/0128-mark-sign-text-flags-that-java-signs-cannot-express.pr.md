Bedrock sign faces have `IgnoreLighting`, `HideGlowOutline` and `PersistFormatting` flags. Java sign text has only `has_glowing_text`, so a client that wants to draw Bedrock signs natively cannot see two results:

- `IgnoreLighting` with `HideGlowOutline` draws the text at full brightness without an outline. ViaBedrock sends such a face as unlit text.
- Without `PersistFormatting`, every drawn row starts without formatting, including the rows of a wrapped line.

Native evidence from the 1.26.60.5 Windows client, static analysis only: the sign renderer (`0x146a7f670`) reads the three flags at face offsets `0x150`, `0x151` and `0x152`. The row callback (`0x146a94fe0`) carries the active formatting codes (`0x1407f8260`) into the next row only when `PersistFormatting` is set.

This adds `"viabedrock:full_bright": true` and `"viabedrock:persist_formatting": false` to the Java face for these cases. Vanilla Java clients ignore unknown sign text fields, so their result does not change. The ViaFabricPlus Bedrock add-on reads both fields.

Validation: a unit test checks both fields on a face with all three flags set as described, and their absence on a normal glowing face.
