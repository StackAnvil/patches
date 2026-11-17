Bedrock form text keeps its line breaks, and Java dialogs need two different treatments to show them the same way.

- Buttons: Bedrock renders every line of a button, and servers use a second line for subtitles such as player counts. Java dialog buttons draw one line, so a raw `\n` showed as a stray glyph. Form dialog buttons, and the header and label rows that dialogs show as buttons, now join their lines with one space.
- Body text: each line used to become its own plain message, and Java pads plain messages like paragraphs. A single break inside a sentence got a paragraph gap. Body text now stays in one plain message, and Java breaks its lines at each newline.

Validation: unit tests feed an action form with `\n` and `\r\n\n` button breaks, and a custom form label with single and double breaks, through the form request handler and check the resulting dialog. NetherGames' server selector sends buttons such as `BonfireMC\n§21 playing`. Minehut's age prompt label breaks inside a sentence; on a Java 26.3 client it now reads as consecutive lines.
