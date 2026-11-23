# fix(ui): keep the Bedrock death screen above server forms

A server form that arrives while the local player is dead no longer replaces the death screen. The form opens once the player is alive and Java's terrain screen has closed. Previously the form stopped the pending respawn timer, and closing it rebuilt the death screen without its reason.

The native Bedrock 1.26.60.5 gameplay route selector returns the death route while the player is dead, before bedtime, data-driven forms, block actors and trading. The respawn listener recomputes the route, so a waiting form appears after respawn. The patch body lists the addresses and executable digest.

Both presentations wait: authored native forms and the Java dialogs that present ordinary forms. A newer form replaces the held one, and a close-form request drops it. Containers keep their Java behavior because the server shares their open state.

`BedrockDeathScreenUpdatesTest` covers holding a form through death and terrain loading, opening it once, and dropping it on a close-form request. The dialog and native-form hooks need a running client.
