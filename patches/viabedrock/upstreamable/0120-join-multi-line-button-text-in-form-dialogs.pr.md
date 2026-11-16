Bedrock form buttons render every line of their text, and servers use a second line for subtitles such as player counts. Java dialog buttons draw one line, so a raw `\n` in the label showed as a stray glyph. This joins the lines with one space for form dialog buttons and for the header and label rows that dialogs show as buttons. Dialog bodies keep their line breaks.

Validation: a unit test feeds an action form with `\n` and `\r\n\n` button breaks through the form request handler and checks the dialog labels. NetherGames' server selector sends buttons such as `BonfireMC\n§21 playing`.
