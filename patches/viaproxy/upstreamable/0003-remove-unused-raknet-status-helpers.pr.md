Upstream PR: https://github.com/ViaVersion/ViaProxy/pull/813

ViaProxy already uses HTTP NetherNet for Bedrock server status. Remove the unused RakNet ping helper and its response-specific conversion.

Java status detection, HTTP NetherNet status, and MCPing remain unchanged.
This patch applies independently of StackAnvil setup and the shared HTTP identity feature.

Validation: the filtered upstream checkout builds successfully with setup and local tests excluded.
The production diff removes 14 lines from one utility class. No tests were added for the unused API deletion.

Created with gpt-6.1-sol in T3 Code (Codex harness).
