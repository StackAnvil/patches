# Native armor attributes

## Purpose

Derive the local player's armor protection and toughness from the Bedrock armor container.
Send standard Java attributes when equipment changes and after joins, respawns, or dimension changes.
Full inventory replacements send one final total, and unchanged totals do not send duplicate updates.
Restoring the actual container recomputes its totals; snapshot copies do not send packets.
This core translation requires no client add-on.

## Target evidence

Private BDS 1.26.51.1, build 51061372, protocol 2193 queries establish vanilla protection and toughness.
The captured values include copper armor, turtle helmets, and zero protection for elytra.
Vanilla ItemRegistry entries omit wearable components, so the core supplies the captured vanilla values.

The target registry sends custom properties under `components.minecraft:wearable`.
[Microsoft's wearable reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_wearable?view=minecraft-bedrock-stable) defines integer protection and the declared equipment slot.
Target server queries confirm protection 7 for a custom chest item and protection 3 for a custom head item.
They report zero toughness for both custom items.
Custom hand wearables contribute zero armor, even with nonzero protection in their definitions.
A diamond chestplate forced into the head slot also contributes zero armor and toughness.
The core preserves these slot rules.

## Testing and limits

Calculation tests cover mixed vanilla and custom equipment, removal, mismatched slots, hand wearables, and totals that exceed integer capacity.
The complete build reports 878 tests passed and 110 skipped, with no failures or errors.
Core Checkstyle passes.

Live direct and ViaProxy clients receive armor 8 and toughness 2 for a diamond chestplate.
Both routes display the armor meter and hide or restore it on the corresponding server HUD commands.
Custom head and chest equipment totals 10 protection with zero toughness; hand wearables add nothing.
The direct misplaced-slot check retains only the valid chest item's 7 protection.
Both routes preserve totals across dimension changes and respawns with `keepInventory` enabled.
Respawning with that rule disabled clears both attributes.
A ViaProxy client with the Bedrock add-on removed also displays the meter and receives 8 protection and 2 toughness.

The full ordered stack applies and builds.
An isolated `pr check --patch` cannot apply this patch to the pinned base because its respawn and item-rewriter contexts depend on earlier stack changes.
That stopped apply was aborted; standalone upstream extraction remains separate work.

This change covers the local player's armor attributes.
It does not establish complete custom wearable interaction, enchantment, damage prediction, remote equipment, or inventory recovery parity.
Startup inventory packets outside Java's play state and registry replacement remain separate audit requirements.
