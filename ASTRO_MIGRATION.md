# HiFage Astro migration — staged, no live-root replacement

## Stack and layout

Astro 7.4.12 (exact npm registry stable version checked), static output, Node ≥22.23.4 (CI uses Node 24). No React, backend, adapter, CMS or build-time external service. `site/package-lock.json` pins dependencies.

All new source is inside `site/`. Existing repository root `index.html`, CNAME, `.nojekyll`, icon and old assets must remain untouched during initial staging. Committing this migration does **not** switch the live deployment: Settings > Pages must remain “Deploy from a branch” until the owner is ready. A branch build may rerun on a source commit but will still serve the original root homepage.

## Local development

```
cd site
npm ci
npm run dev
npm run build
npm run test:built
```

To validate a project subpath:

```
SITE_BASE=/hifage/ npm run build
SITE_BASE=/hifage/ npm run test:built
```

Custom-domain production uses `/`. The workflow obtains origin/base_path from the existing Pages configuration only on intentional deployment. It does not add or change CNAME or DNS. Set `SITE_URL` for a local production-origin test if desired.

## Source responsibilities

- `site/src/pages/index.astro`: homepage shell.
- `site/src/components/Hero.astro`, `Desk.astro`: approved homepage sections.
- `site/public/styles.css`: approved visual/animation styles, copied unchanged from V9.
- `site/public/app.js`, `desk.js`, `character.js`, `content.js`: no-framework browser behavior and editable content. The Skill dialog also links to the new Skills index.
- `site/public/assets/`: original assets; five reactions share 343×650 canvas and alpha baseline y642. Original QR SHA256: `aab99f7dc94bcf1bd866159d4bd6cd4e4fd4278cfe35a45636206c8c6aae83e7`.
- `site/src/content.config.ts`: schema for Markdown resources.
- `site/src/pages/skills/index.astro`: stable `/skills/` listing, honestly empty until resources are approved.
- `site/src/pages/skills/[slug].astro`: stable resource routes, generated only for approved Markdown with `published: true`.

## Adding an approved Skill

Create `site/src/content/skills/<stable-slug>.md` with `title`, `description`, `published`, optionally `version` and `downloadUrl`, followed by its actual body. Default `published` is false. Do not add invented files or demo downloads. Use an absolute HTTPS URL or a correct base-aware site URL for a real download. Renaming an existing filename changes its URL; preserve slugs. Currently there are zero resource Markdown entries; expected empty-collection warnings during build are not failures.

## Safe cutover / rollback

1. Commit only the source manifest files (`site/**`, workflow, migration docs/ignore), preserving all old root website files.
2. Let the push workflow build and run tests. Its deployment job is skipped on push. Manually running with `deploy: false` also only builds.
3. Inspect/download the `github-pages` artifact. Confirm homepage, `/skills/`, interactions, QR and mobile layout.
4. When authorized, change Settings > Pages source to GitHub Actions. Preserve the existing custom domain.
5. Run **Build Astro (manual Pages cutover)** with `deploy: true`. This is the only path that deploys. Verify deployment success and the live custom domain.
6. Rollback: switch Settings > Pages back to the original branch/root deployment; old homepage remains available in that root. No DNS edit is needed.

The initial cutover is intentionally manual. After it is verified, the planned steady-state flow is simple automatic deployment on the same main-branch source changes: remove the manual-only guards on configure/deploy and keep the existing path-filtered push trigger. No extra repository flag is needed. Until that follow-up edit is made, deployment remains manual, preventing an initial source push from changing the live site.

## Official references checked

- https://docs.astro.build/en/guides/deploy/github/
- https://docs.astro.build/en/guides/content-collections/
- https://raw.githubusercontent.com/actions/starter-workflows/main/pages/astro.yml
- https://registry.npmjs.org/astro/latest

The workflow pins exact commits, resolved from the official actions repositories using git ls-remote against the documented major tags: checkout@v4, setup-node@v4, configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v5. The actual immutable SHAs are recorded in the workflow. No personal tokens or external writes are needed for local development.
