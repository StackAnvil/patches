The Bedrock client lays out only the first 512 bytes of a sign face's text. ViaBedrock translated the whole text, so text that Bedrock players never see could appear on Java.

Native evidence: in the 1.26.60.5 Windows client, the sign text renderer at `0x146a7f670` copies text longer than `0x200` bytes into a new `0x200`-byte buffer before it wraps the text into rows. Formatting codes count toward the limit.

This keeps the whole characters within the first 512 UTF-8 bytes. The native client cuts raw bytes, so a character split at the limit is dropped here.

Validation: a local unit test checks that the limit cuts the text after 170 three-byte `§a` codes and `ab`, and that a split two-byte character is dropped.
