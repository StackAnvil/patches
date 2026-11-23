Bedrock wraps a long sign line into the following rows. Java clips each line at the sign's width, so long Bedrock sign lines lost their ends and the lines below them sat too high.

Native evidence from the 1.26.60.5 Windows client, static analysis only:

- The sign renderer (`0x146a7f670`) lays out each face through `0x140e69dd0` with a budget of four rows. Words, spaces and line breaks are the units. A word that does not fit starts a new row, and a space that does not fit stays at the end of its row.
- A word as wide as the row fills the current row and continues on later rows with a hyphen (`0x140e6b010`, `0x140e6c4c0`). `0x140e6bbc0` adds no hyphen after a space, beside a hyphen, or beside wide script.
- Rows are 89 units wide on standing signs and 60 on hanging signs.

On Bedrock connections, the sign renderer now lays out each face this way with the client font. Java servers keep Java's clipping.

Validation: unit tests cover wrapping at spaces with the shared four-row budget, hyphenation and its color, a long word after text, the hyphen exceptions, and a word longer than four rows. The mixin targets were checked against the 26.3 bytecode. No in-game capture was taken.

Remaining limits: the hyphenation switch comes from a global localization object that static analysis does not resolve, so hyphenation assumes the English default. Without `PersistFormatting`, the native client may drop formatting on the continuation rows of a wrapped line; this layout keeps it.
