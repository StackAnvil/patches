# Preserve native player locations and locator groups

## Purpose

Decode legacy player locations and native locator groups for client integrations.
Retain visibility, position, texture, size, color, actor binding, and position authority.
Publish complete snapshots after join and when a listener registers late.

## Design constraints

Keep locator groups across dimension changes.
Ignore duplicate additions and updates for unknown groups.
Preserve the native rules for omitted fields instead of clearing every absent value.
Publish removal before replacement of the same group ID so clients can reset smoothing.
Coalesce ordinary updates and preserve unrelated groups.
Keep published snapshots immutable and bound decoding to the payload size.

## Validation and remaining limits

Native Bedrock 1.26.51.1, build 51061372 and protocol 2193, supplies packet and lifecycle evidence.
Captured controls establish the field masks and distinguish smoothed updates from immediate group replacement.
The owning patch records those versioned observations.

Local regressions cover packet discriminators, signed actor IDs, optional fields, group merging, removal and replacement ordering, late listeners, and snapshot round trips.
The latest full core build passes these tests.
Tests remain in the local stack and are excluded from the upstream PR.

These checks establish decoding and state transport.
Native rendering, current-version live route comparisons, and complete locator HUD parity require separate validation.
