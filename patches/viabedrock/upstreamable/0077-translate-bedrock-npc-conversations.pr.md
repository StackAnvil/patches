## Purpose

Translate server NPC conversations with Java built-in dialogs. The implementation lives in ViaBedrock and supports ordinary Java clients through ViaProxy.

Render translated names, dialogue lines, command buttons, and HTTP/HTTPS link buttons. Keep hidden entry and exit actions out of the visible button list. Preserve each command button's original server index.

The client sends NPC requests for entry, selected actions, and closing. It does not execute transmitted command text. Bind responses to the current scene and tracked actor. Reject stale responses, hidden action indices, and forged link callbacks. Server close packets only dismiss the matching NPC. Actor removal also clears an active dialogue.

## Versioned evidence

Target: Bedrock 1.26.51, protocol 2193, Java 26.3.

- [Mojang protocol 1.26.51 release](https://github.com/Mojang/bedrock-protocol-docs/releases/tag/v1.26.51): NPC dialogue uses a fixed-width uint64 unique actor ID, signed compressed action enum, then dialogue, scene, name, and action JSON strings. NPC requests use an unsigned runtime varlong, request byte, actions string, action index byte, and scene string.
- An isolated Bedrock Dedicated Server 1.26.51.1, build 51061372, opened a behavior-pack dialogue scene. Its action JSON contained `button_name`, `mode`, `type`, `text`, and `data`. Mode 0 command actions appeared at indices 0 and 1. Mode 2 was an opening action; mode 1 was a closing action. Commands were type 1.
- Sending ExecuteOpeningCommands produced the scene's opening message. Sending ExecuteAction with index 1 and an empty actions string opened the second scene. Sending ExecuteClosingCommands with the original scene name produced the first scene's closing message after the new scene opened.
- The captured actor unique ID represented a negative int64. It must be read as a fixed-width little-endian long, preserving its bits for entity lookup.
- [Microsoft NPC dialogue guide](https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialogue) describes scene names, branching buttons, and opening and closing commands.

## Verification

Five focused tests passed. They cover the registered open and server close handlers, fixed-width actor lookup, unsigned request fields, scene replacement, stale and duplicate response rejection, hidden action indices, ordered button/close requests, link callback rejection, and inventory busy state.

The complete 81-patch core stack replayed successfully. `bun run build all` passed for CubeConverter, ViaBedrock, the Bedrock add-on, and ViaProxy. ViaBedrock passed 353 tests without skips and Checkstyle. The add-on reported 477 tests, including 97 skips, without failures.

## Remaining comparison

Native client UI comparison remains pending. Link actions need a native link-flow capture. Java dialogs provide the conversation controls and text; the native portrait and NPC editing interface need separate work. Private registry and protocol probe logs remain outside the repository.
