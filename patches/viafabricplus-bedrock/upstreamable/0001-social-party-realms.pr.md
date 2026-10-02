## Background

The earlier integration was proposed in [viafabricplus-bedrock PR #7](https://github.com/ViaVersionAddons/viafabricplus-bedrock/pull/7). This patch carries that work forward for review against the current upstream base.

## Testing

- [ ] Build the mod and open the social, party, and Realm screens with a signed-in Bedrock account.
- [ ] Exercise party invites and chat with another account.
- [ ] Open a Realm, inspect its details, and check navigation back to the Realm list.

### Minecraft 26.3 list input

The mapped Minecraft 26.3 client defines the left mouse button as 1. Its mouse handler passes that value to screen input. Shared action lists now compare double clicks with `InputConstants.MOUSE_BUTTON_LEFT`. The previous zero check prevented activation after a successful row click. This correction also applies to the downstream Realm and featured-server lists. The full fixture suite passes 403 tests across 81 suites; direct list double-click navigation has not been separately captured.
