## Review focus

Please check that a changed source pack cannot reuse an older conversion, and that reconnecting with unchanged packs avoids another conversion.

## Testing

- [ ] Run the ViaBedrock tests, including the new resource-pack cache and load-state tests.
- [ ] Join a server with resource packs, reconnect, and confirm the converted pack is reused.
- [ ] Change a pack's content and confirm the client receives a fresh conversion.
