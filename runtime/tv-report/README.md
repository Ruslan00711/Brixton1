# BRIXTON daily TV screenshots

This renderer produces the existing authenticated TV views at 1920×1080. It does not add a public data endpoint or bypass TV authentication.

Required protected server variables in `/etc/brixton/tv-report.env`:

- `TV_REPORT_CHROMIUM_PATH`
- `TV_SCREENSHOT_RENDER_SECRET`
- `TV_REPORT_MENDELEEVA_TOKEN`
- `TV_REPORT_ENTUZIASTOV_TOKEN`

The two tokens must be created through the standard `registerTvDevice` pairing flow with dedicated names and can be revoked independently. The same HMAC secret is stored in Apps Script property `TV_SCREENSHOT_RENDER_SECRET`. The existing `TELEGRAM_BOT_TOKEN` and existing chat/topic mappings are reused only by Apps Script.

The release tree is owned by `root:brixton-tv-report` with no access for other users. The service keeps `DynamicUser=yes` and receives read/execute access only through that supplementary system group.

`tvScreenshotScheduler` runs every five minutes but acts only from 21:00 through 21:14 Asia/Yekaterinburg. Per-target daily idempotency keys prevent duplicates and allow a failed destination to retry without resending successful destinations.

Production installation, pairing, trigger creation and any real Telegram send require a separate controlled deployment approval.
