# Auth-aware TV runtime delta

The runtime files in this directory are copied from the active BRIXTON TV production baseline and contain no production credentials or device tokens.

Verified read-only baseline on 2026-09-29:

- active release: `/opt/brixton/legacy-releases/tv-confirmation-status-20260914-v1`
- `public/board.html`: `d96b3916717d5a146d055531dc2255f66a964ff39767df16a14f3dfbc4813c29`
- `public/legacy-assets/tv-auth.js`: `14546f995f980edee1e58f33306e2b4897c661a7e4ab221987a3faa8cf4cf8f7`
- `gateway.cjs`: `52a4ea5ef938583d68fbd1918297219ff36e16aff64568b17fdafcd54c1e005e`
- Apps Script rollback baseline: immutable version `157`

The network ranking requires one new read action, `getNetworkTvBoard`. It accepts an existing branch-bound TV device token with the existing `tv.board.read` scope and returns the two fixed BRIXTON branch payloads by calling the existing `doGetTvBoard` serializer. No token migration or new data source is introduced.

Any future production rollout must be atomic and separately approved: publish an immutable Apps Script version containing the action, install the matching gateway allowlist and TV auth asset, then install `board.html`. Roll back all four runtime pieces together if acceptance fails. This branch does not perform that rollout.
