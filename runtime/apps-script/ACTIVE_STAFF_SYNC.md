# Active staff synchronization

The production-safe patch is based on immutable Apps Script version 171, which preserves the existing daily authenticated TV screenshot flow.

Rules:

- current-month calculations request YCLIENTS staff with `fired=0`;
- historical recalculation keeps `fired=1` so dismissed staff history is preserved;
- current staff identity is the pair `company_id + staff_id`, not the display name;
- an active barber missing from the legacy manual map receives a deterministic temporary profile for the correct branch;
- admin master goals prefer the live active YCLIENTS roster and fall back to the current analytics snapshot if YCLIENTS is unavailable;
- TV auth, device tokens, free slots, schedules, announcements and metric formulas are unchanged.

This is required because equal display names can exist in different branches. In particular, a new `Яна` in Mendeleeva must not collide with the existing `Яна` in Entuziastov. A dismissed employee such as `Тагир` must disappear from the current roster without deleting historical metrics.

Deployment uses immutable Apps Script version 177 and switches only the existing production deployment. Rollback target remains version 171.
