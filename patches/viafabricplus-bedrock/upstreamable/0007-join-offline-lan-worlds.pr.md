
## BDS HTTP capability compatibility

HTTP connections use ViaBedrock's shared signaling implementation.
The pinned BDS 1.26.51.1 endpoint returns successful capability status without JSON metadata.
The native 26.51 client accepts it and completes its SDP exchange.
Core handles that response and retains SDP validation and TLS failure handling.
Direct joining against this endpoint remains to verify with the rebuilt add-on.
