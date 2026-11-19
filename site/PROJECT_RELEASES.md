# Project release widget

Add a real project in `src/data/projects.js` with a lower-case GitHub `owner/repo` and render `ProjectRelease` on its page. The download Worker determines which release and uploaded assets are eligible; its MagicNotice policy retains the complete signed Chinese/English pair. No public GitHub API requests are made by the browser.

- Primary metadata: `GET https://download.hifage.com/v2/releases?repo=<encoded GitHub repository URL>`.
- Last-known fallback after an unavailable or rejected primary response: `release-catalog/<owner>/<repo>.json`, relative to the site base. Cached or catalog results use the same neutral “可下载版本” label and show the actual publication time. Stale status still enables retry internally.
- An explicit v2 404 may indicate the previous Worker is still deployed. For the configured MagicNotice project only, try its existing v1 endpoint. No direct GitHub binary URLs are used or exposed.
- v2 links must match the exact expected HTTPS hostname and encoded path, including the repository, tag and asset ID. Catalog rows obey the same rules.
- The site's existing static project-page QR is separate. File controls generate a per-file QR lazily in the browser from the same validated URL used by the download button with no third-party request.

QR engine: unmodified npm `qrcode-generator@2.0.4` ESM distributable `dist/qrcode.mjs`, vendored as `public/vendor/qrcode-generator.mjs` (SHA-256 `ea91d7118a5395289170da848b7c6758b996163bfbccf312591ab65a4911b7c0`); [upstream](https://github.com/kazuhikoarase/qrcode-generator) full MIT notice next to the file. npm tarball integrity: `sha512-mZSiP6RnbHl4xL2Ap5HfkjLnmxfKcPWpWe/c+5XxCuetEenqmNFf1FH/ftXPCtFG5/TDobjsjz6sSNL0Sr8Z9g==`. No runtime package, CDN or dependency lock change.

Run `npm run build && npm run test:built`. Repeat with `SITE_BASE=/hifage/` to verify root/subpath deployment.
