# Supplemental Bedrock tests

The integration suite checks that the patched Java client joins and stays connected. The optional entity probe adds repeatable Bedrock entity actions to that check. Run it against a disposable private world:

```bash
bun run test:integration -- --route java-bedrock --entity-probe
```

The runner copies [the entity probe](../test-packs/entity-probe/README.md) into its private Bedrock Dedicated Server, activates it for `integration-world`, and sends the `status` and `metadata` sweeps after the plain Java client joins. It fails if a script action fails, the game exits, or a sweep does not finish. It then runs the usual modpack join check. Logs remain under `.stackanvil/integration/runs/`.

These checks prove that the script actions ran while the Java client stayed connected. They do not prove visual correctness or packet coverage. Review the Bedrock server log and a packet trace for the exact `ActorEvent` and metadata fields. The full catalog sweep takes about 30 minutes and may alter terrain, so run it manually in a disposable world with `/scriptevent vbprobe:all auto`.

The supplied pack covers entity events and synced properties. It has no inventory, movement, block, or command probes. Add those as separate small packs or scenarios, each with a clear success signal and a packet or client assertion. A useful order is:

1. Inventory moves, split stacks, crafting, anvil, and smithing. Assert request IDs, server responses, final slots, and rollback after a rejected request.
2. Movement and blocks. Compare positions, block states, and corrections after placing, breaking, swimming, and dimension changes.
3. Commands and rare entity behavior. Check command completion, permission changes, variant metadata, and status events against packet traces and Java rendering.

The referenced BedrockTechnicalTestTools project uses an older GameTest API and pack format. Its test organization is useful, but importing its packs directly would introduce version and licensing work without proving they run on the current server. Keep the present join suite and add one validated probe at a time.
