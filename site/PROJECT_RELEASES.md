# Project release widget

Current project inventory: `projects/magicnotice.astro` (all current open-source project pages).

For a future real project, add its `owner/repo`, title and optional policy in `src/data/projects.js`, and render `ProjectRelease` on its page. The default `uploaded` policy lists official uploaded release assets using asset label/name. Release heading uses the official release name (tag fallback). Do not add fictional project entries.

MagicNotice policy requires a `signed-*` tag plus same-version `cicada_zh_release_v<digits>-signed.apk` and `cicada_en_release_v<digits>-signed.apk` in that release. This checks the repository's naming contract, not APK cryptographic signature contents.

On page open the browser fetches the public GitHub releases API without credentials. It includes prereleases and sorts by `published_at`, not version/filename or API listing order. Every asset URL is checked against the exact repo, tag and filename. Uploaded assets must have positive numeric sizes. Pagination is bounded to 10 × 100 releases and 8 seconds total. Incomplete pagination, errors, rate limits, timeout or no eligible release leave the permanent Releases link, never an old hardcoded “latest” APK. No local cache, mirror, token or backend. GitHub receives the ordinary API request from the visitor; no analytics is added.

The QR points to https://hifage.com/projects/magicnotice/ and stays valid across releases. Generated with qrcode; decoded independently with zxing-cpp at original 296, 192 and 128 pixels. No QR generation library is required in production.

Tests: `node scripts/test-project-releases.mjs` (optional argument: saved public API JSON fixture), then `npm run build && npm run test:built`. The new test is included in `npm run test:built`; no CI/workflow or lockfile modified. Repeat with `SITE_BASE=/hifage/` to check project subpath support.
