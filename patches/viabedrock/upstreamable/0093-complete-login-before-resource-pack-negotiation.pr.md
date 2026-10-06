# Complete the Bedrock login transition before resource packs

## Cause and behavior

A strict BDS 1.26.51.1 capture, build 51061372 and protocol 2193, contains one Bedrock login-success packet.
The ViaProxy log records two translated login successes, with `Skipping LOGIN state` between them.
The Java 26.3 client then tries to decode a configuration disconnect and rejects an invalid NBT tag.
The proxy's later cleanup exception follows the client failure.
Java login success and configuration disconnect both use packet ID 2.
The second login body therefore reaches the configuration disconnect decoder after the client changes state.

ViaVersion leaves modern connections in `LOGIN` until the Java acknowledgment arrives.
Early Bedrock pack traffic therefore triggers ViaBedrock's omitted-login fallback after a success has already been sent.
Advance only the server state to `CONFIGURATION` after the first success.
Keep the client state pending its acknowledgment and preserve the older-client `PLAY` transition.

## Verification

- The sequence regression fails before the change because the server state remains `LOGIN`.
- The regression passes after the change for Java 1.20.2 and 26.3.
- It covers early pack traffic, repeated success status, genuinely omitted success, and a pre-configuration Java client.
- The full StackAnvil core build passes, including Checkstyle and 746 tests with zero failures and 19 skips.
- The patch applies to the pinned upstream base without StackAnvil setup.

Pinned upstream does not expose its provided dependencies on the test classpath.
The full stack already supplies that JUnit configuration.
All three standalone sequence tests also pass with an external Gradle init script that supplies that test classpath and JUnit configuration.
The standalone production patch does not depend on StackAnvil build identity or dependency routing.

The rebuilt add-on and ViaProxy pass actual joins and movement controls against strict BDS.
One direct run and two ViaProxy runs reach initialization and spawn.
Each journal contains one Bedrock login success.
Both proxy logs record one translated success and no omitted-login fallback.
All three recorders exit successfully, and the owned server stops.

## Limits

This change targets the duplicate login success caused by early resource-pack traffic.
It does not establish complete configuration, reconfiguration, resource-pack, or platform parity.
Raw captures and account data remain private.
