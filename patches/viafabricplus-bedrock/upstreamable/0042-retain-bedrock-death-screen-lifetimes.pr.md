# fix(ui): retain Bedrock death screen lifetimes

Late death reasons and visibility-rule changes update the existing death screen. Retain its button deadline and confirmations. A later death or replacement connection starts a fresh lifetime. Dispatch local-player reason updates after the main-thread handoff, before Java searches its world entity index.

Manual actions, automatic GUI entry, and combat-kill packets share a pending respawn attempt. Send once, wait 500 milliseconds, then retry every second while the same death route remains active. Late timer delivery starts the next wait from delivery. Java screen re-entry retains the pending screen and disables both actions. Becoming alive, leaving the route, or replacing the player or connection cancels retries.

The original Bedrock 1.26.60.5 OreUI controller supplies these timer and reason-lifetime rules. Nine isolated executions cover stage transitions, late callbacks, route cancellation, and reason updates in normal and immediate modes. The fixture supplies observable hooks, commands, queries, routing, and virtual time. It does not execute native network actions or rendering. The source digest is in the patch body.

All ten `BedrockDeathScreenUpdatesTest` cases pass. The complete 44-patch add-on build passes, including software font shader checks.

Installed direct and ViaProxy controls cover immediate and manual requests, late reasons, duplicate input, pending screen re-entry, and cancellation. The previous client sends an extra immediate request about 50 milliseconds after the first when a late reason arrives. The corrected client preserves the initial wait on both routes. These controls use Java health and reason packets, an explicit death-screen flag, ordinary GUI clicks, and decoded outbound Bedrock requests. The replay withholds respawn replies. Authoritative server respawn and exact native network timing remain unverified.

The presentation remains Java. Early-join admission, including transient zero health before terrain readiness, remains unverified. Native OreUI fonts, layout, animation, loading presentation, menu routing, and complete lifecycle parity remain unfinished.
