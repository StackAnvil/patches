# fix(ui): retain Bedrock death screen lifetimes

Late death reasons and visibility-rule changes update the existing death screen. Retain its button deadline and confirmations. A later death or replacement connection starts a fresh lifetime. Dispatch local-player reason updates after the main-thread handoff, before Java searches its world entity index.

Manual and automatic respawn paths share a pending attempt. Send once, wait 500 milliseconds, then retry every second while the same death route remains active. Late timer delivery starts the next wait from delivery. Java screen re-entry retains the pending screen and disables both actions. Becoming alive, leaving the route, or replacing the player or connection cancels retries.

The original Bedrock 1.26.60.5 OreUI controller supplies these timer and reason-lifetime rules. Eight isolated executions cover stage transitions, late callbacks, route cancellation, and retained reason updates. The fixture supplies observable hooks, commands, queries, routing, and virtual time. It does not execute native network actions or rendering. The source digest is in the patch body.

`BedrockDeathScreenUpdatesTest` covers the real Java button timer, reason retention, modal ownership, automatic re-entry, request counts, late callbacks, stale actions, and lifetime replacement. All ten focused tests pass. The complete 44-patch add-on build also passes with frozen local dependencies and software font shader checks. Earlier installed direct and ViaProxy controls establish reason updates and confirmation retention. The new retry integration still needs installed controls on both routes.

The presentation remains Java. Native OreUI fonts, layout, animation, loading presentation, menu routing, and complete lifecycle parity remain unfinished.
