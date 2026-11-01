# Allow food use on Peaceful

Java's local consumable predicate refuses ordinary food at full hunger.
Bedrock permits that use on Peaceful difficulty.
Keep the original predicate and always-edible flag, but ignore hunger for a client in a Bedrock connection on Peaceful.
Read current level difficulty for each use.
The connection capability also covers translation through ViaProxy.

Official Bedrock 1.26.60.5/BDS 1.26.60.6 controls on protocol 2225 establish the boundary.
Full-hunger bread remains at 16 on Normal, falls to 15 after switching to Peaceful, and remains at 16 after switching back.
The previous installed add-on retains 16 bread and never enters use on Peaceful.
Inventory consumption and completion remain server-owned.

Installed direct and ViaProxy controls each pass Normal → Peaceful → Normal at full hunger and a hungry Normal control.
Allowed cases enter local use, receive one server completion, and settle at 15 bread.
Full-hunger Normal cases never enter use and retain 16 bread.
The installed add-on and proxy match the rebuilt artifacts.
The full four-project build passes 3,281 tests, with 325 skipped and no failures or errors.
Core packet regressions cover server-confirmed difficulty changes and food admission without inventory prediction.

The separate DataDriven apple admission discrepancy and the original intermittent food-use report remain open.
