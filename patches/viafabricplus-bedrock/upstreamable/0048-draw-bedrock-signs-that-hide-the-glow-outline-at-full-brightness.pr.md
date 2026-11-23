A Bedrock sign face with `IgnoreLighting` and `HideGlowOutline` shows its text at full brightness without an outline. Java glowing text always has an outline, so ViaBedrock sends such a face as unlit text, and on Bedrock servers it darkened with the light at the sign.

Native evidence from the 1.26.60.5 Windows client, static analysis only: the sign renderer (`0x146a7f670`) skips the light tint when `IgnoreLighting` is set and draws the outline only when `HideGlowOutline` is clear.

ViaBedrock marks these faces with `viabedrock:full_bright`. The add-on keeps the mark on the loaded `SignText` and draws those rows with full brightness on Bedrock connections. Java already omits the outline because the face has no `has_glowing_text`.

Validation: the add-on compiles against 26.3 and its tests pass. ViaBedrock's unit test covers the mark. No in-game capture was taken.
