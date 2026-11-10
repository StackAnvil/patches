Bedrock servers can wait for boss-bar registration replies before completing a load. Reply to Add and Remove for tracked actors with PlayerAdded and PlayerRemoved. Preserve the native field values and keep this exchange independent of Java boss-bar visibility.

An official Bedrock 1.26.60 client on protocol 2225 answered Galaxite's readiness probes, received the BlasterWars Repeater and stayed connected beyond the translated client's loading timeout. The earlier translated recordings sent no replies. The new registered-handler tests compare both replies with the native wire fixtures and exclude unrelated updates and unknown actors.

Validation: the full core suite reports 2,450 tests, zero failures and 177 skipped. The add-on suite reports 1,697 tests, zero failures and 159 skipped. Checkstyle and the full project build pass.

Live check: a translated Java add-on client on protocol 2225 selected BlasterWars from Galaxite's hub. Each of the three Add and Remove probes received PlayerAdded and PlayerRemoved replies with the same bytes as the native client, including the probe 0.5 seconds after selection. The client received the Repeater 9.3 seconds after selection and was still equipped at 100 seconds. The journal continued 278 seconds after selection with no Disconnect packet or packet decoder error, past the earlier 60.5-second kick. The check covers loading and staying connected in the range room. It did not start a match.

The native captures cover probes targeting the local player. Replies for other tracked boss actors follow the protocol's registration update semantics and still need a matching native control. Raw recordings, screenshots and account data remain private.
