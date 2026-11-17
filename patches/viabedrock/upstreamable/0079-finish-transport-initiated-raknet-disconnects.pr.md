# Discard packets after session disconnect

Stop forwarding queued packets after the application closes its Bedrock session.
Decode one packet per batch callback so a Disconnect packet can stop the remainder of its batch.
This protects the Java decoder after ViaVersion stops translating the session.

The handler uses transport-independent close state and does not depend on legacy transport events.
Local closes still complete through the transport's disconnect operation.

## Validation

Embedded-channel tests cover local close completion, packets queued during an asynchronous close, and Disconnect within a batch.
Run these tests through the full local stack.
The existing filename remains stable for patch-series references.
