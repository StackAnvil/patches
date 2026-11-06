# fix(ui): retain Bedrock death screen lifetimes

Late death reasons and visibility-rule changes update the existing death screen. Retain its button deadline, keep confirmations in front, and avoid reopening a closed screen for a reason-only packet. A later death or replacement connection starts a fresh lifetime. Dispatch local-player reason updates after the main-thread handoff, before Java tries to find the dead player in its world entity index.

The original Bedrock 1.26.60.5 OreUI controller treats the reason as an observable view property. An isolated execution of the shipped JavaScript confirms that reason changes preserve the ready-button stage and pending respawn timers. The source digest and constraints are in the patch body.

`BedrockDeathScreenUpdatesTest` covers the real Java death timer, retained controls, modal and pending-respawn ownership, adoption before the first reason packet, and replacement lifetimes. A replacement visible death screen receives later text instead of leaving it on a hidden instance.

All five focused tests pass. Installed direct and ViaProxy clients also pass visibility-rule changes, late text updates, confirmation retention, and fresh screen creation after respawn. Both use the final add-on artifact. Rule changes come from BDS on protocol 2225; controlled Java packets exercise the installed reason handler. These controls establish handler behavior, not native network timing parity. The full-stack regression run, stack metadata validation, and bundling passed when this patch was introduced.

The current presentation remains Java. Native OreUI fonts, layout, animation, menu routing, and complete visual parity remain unfinished. Automatic Java screen re-entry while waiting for native respawn also remains part of that port.
