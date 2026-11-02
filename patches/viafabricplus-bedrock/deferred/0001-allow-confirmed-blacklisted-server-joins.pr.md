# Confirm a blocked server connection

Keep the server warning and offer **Join anyway** beside **Cancel**.
Confirmation applies to one connection attempt. It does not change the global ViaBedrock blacklist config.
Reconnecting shows the warning again.

This is a StackAnvil-only override, placed in the deferred stack at the user's request.
It does not establish that listed servers accept translated clients.
The warning retains the account-ban risk.

Three tests cover attempt identity, thread isolation, failed setup, and nested setup.
The full dependency build passes 3,242 tests, with 325 skipped.
Installed checks cover warning display, cancellation, reopening, and proceeding to a connection attempt.
An isolated JVM resolves the test hostname to loopback. No live Hive join occurs.
Runtime checks verify that the core mixin admits an approved connection and keeps an unrelated connection blocked.
