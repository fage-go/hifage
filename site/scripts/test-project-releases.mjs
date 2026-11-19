import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fetchProjectRelease, fetchTransferRelease, initReleaseWidget, makeReleaseQr} from '../public/project-releases.js';

const H = 'https://download.hifage.com', repo = 'fage-go/magicnotice', other = 'owner/another';
const endpoint = r => H + '/v2/releases?repo=' + encodeURIComponent('https://github.com/' + r);
const tag = 'build/release-1';
const asset = (repo, id) => ({id, label: '<file>', name: 'app.zip', size: 100, originalUrl: 'https://evil.invalid/not-visible', downloadUrl: H + '/v2/assets/' + repo + '/' + encodeURIComponent(tag) + '/' + id});
const manifest = (r = repo) => ({repo: r, name: '<Build>', tag, publishedAt: '2026-11-19T00:00:00Z',
  checkedAt: new Date().toISOString(), prerelease: true, stale: false, downloads: [asset(r, 51), asset(r, 52)]});
const ok = data => ({ok: true, status: 200, json: async () => data});
const err = status => ({ok: false, status});
const legacyBase = '/v1/projects/magicnotice';
const legacyTag = 'signed-a';
const legacy = {name: 'Legacy', tag: legacyTag, publishedAt: '2026-11-19T00:00:00Z', prerelease: true,
  downloads: ['en', 'zh'].map(lang => ({path: legacyBase + '/assets/' + legacyTag + '/cicada_' + lang + '_release_v1680-signed.apk'}))};

const direct = await fetchProjectRelease(other, undefined, {fetcher: async (url, opts) => {
  assert.equal(url, endpoint(other));
  assert.equal(opts.credentials, 'omit');
  assert.equal(opts.redirect, 'error');
  return ok(manifest(other));
}});
assert.equal(direct.source, 'live');
assert.equal(direct.stale, false);
assert.equal(direct.downloads[0].url, asset(other, 51).downloadUrl);
assert(!JSON.stringify(direct).includes('evil.invalid'));

for (const draft of [
  {...manifest(), repo: other},
  {...manifest(), checkedAt: 'bogus'},
  {...manifest(), stale: 'false'},
  {...manifest(), downloads: []},
  {...manifest(), downloads: [asset(repo, 51), asset(repo, 51)]},
  {...manifest(), downloads: [{...asset(repo, 51), id: '051'}]},
  ...['https://github.com/app.apk', 'https://evil.invalid/file.apk', '//download.hifage.com/file.apk', asset(repo, 51).downloadUrl + '?a=b',
    asset(repo, 51).downloadUrl + '#anything', asset(repo, 51).downloadUrl.replace('%2F', '%2f'),
    asset(repo, 51).downloadUrl.replace('https://', 'https://user@'), asset(other, 51).downloadUrl, asset(repo, 999).downloadUrl]
      .map(downloadUrl => ({...manifest(), downloads: [{...asset(repo, 51), downloadUrl}]})),
]) {
  assert.equal(await fetchProjectRelease(repo, 'magicnotice', {fetcher: async url => url === endpoint(repo) ? ok(draft) : err(404)}), null);
}

let urls = [];
const collected = await fetchProjectRelease(repo, 'magicnotice', {fetcher: async url => {
  urls.push(url);
  return urls.length === 1 ? err(502) : ok(manifest(repo));
}});
assert.equal(collected.source, 'catalog');
assert.equal(collected.stale, true);
assert.match(urls[1], /\/release-catalog\/fage-go\/magicnotice\.json$/);
assert.equal(await fetchProjectRelease(repo, 'magicnotice', {fetcher: async url =>
  url === endpoint(repo) ? err(403) : ok({...manifest(), checkedAt: '2000-01-01T00:00:00Z'})}), null);
urls = [];
const compat = await fetchProjectRelease(repo, 'magicnotice', {fetcher: async url => {
  urls.push(url);
  return urls.length === 1 ? err(404) : ok(legacy);
}});
assert.deepEqual(urls, [endpoint(repo), H + legacyBase + '/latest']);
assert.equal(compat.source, 'legacy');
assert.equal(compat.downloads[0].url, H + legacy.downloads[1].path);
assert.equal(await fetchProjectRelease(other, undefined, {fetcher: async url => {
  assert.equal(url, endpoint(other));
  return err(404);
}}), null);
await assert.rejects(fetchTransferRelease('magicnotice', {fetcher: async () => ok({...legacy, downloads: [{path: '//evil.invalid/file.apk'}, legacy.downloads[0]]})}));

class El {
  constructor(tag) {this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; this.hidden = false; this.textContent = '';}
  replaceChildren() {this.children = [];}
  append(...children) {this.children.push(...children);}
  setAttribute(name, value) {this.attrs[name] = value;}
  addEventListener(event, fn) {this.events[event] = fn;}
  querySelector(selector) {return this[selector] ??= new El(selector);}
}
globalThis.document = {createElement: tag => new El(tag)};
const widget = new El('widget');
widget.dataset = {repo, transfer: 'magicnotice'};
let qrUrl;
await initReleaseWidget(widget, {fetcher: async () => ok(manifest()), makeQr: async url => {qrUrl = url; return 'data:image/gif;base64,AA';}});
assert.equal(widget['[data-release-status]'].textContent, '当前可下载版本');
assert.equal(widget['[data-release-name]'].textContent, '<Build>');
assert.match(widget['[data-release-meta]'].textContent, /预发布/);
const [link, disclosure] = widget['[data-release-links]'].children[0].children;
assert.equal(link.href, asset(repo, 51).downloadUrl);
assert.equal(link.textContent, '<file>');
assert.equal(qrUrl, undefined);
assert.equal(disclosure.children[0].attrs['aria-label'], '扫码下载：<file>');
disclosure.open = true;
await disclosure.events.toggle();
assert.equal(qrUrl, link.href);
assert.equal(disclosure.children[2].alt, '<file>的下载二维码');
const qr = await makeReleaseQr(link.href);
assert.match(qr, /^data:image\/gif;base64,R0lGOD/);
await initReleaseWidget(widget, {fetcher: async () => ok({...manifest(), stale: true})});
assert.match(widget['[data-release-status]'].textContent, /未确认是否最新/);
assert.match(widget['[data-release-meta]'].textContent, /上次检查/);
assert.equal(widget['[data-release-retry]'].hidden, false);
let resolveOld;
const pending = initReleaseWidget(widget, {fetcher: () => new Promise(resolve => resolveOld = resolve)});
await initReleaseWidget(widget, {fetcher: async () => err(502)});
resolveOld(ok(manifest()));
await pending;
assert.equal(widget['[data-release-result]'].hidden, true);
assert.equal(widget['[data-release-links]'].children.length, 0);
assert.equal(widget['[data-release-retry]'].hidden, false);
assert.doesNotMatch(widget['[data-release-status]'].textContent, /GitHub/);
const page = readFileSync(new URL('../src/pages/projects/magicnotice.astro', import.meta.url), 'utf8');
assert(page.includes('<ProjectRelease project={projects.magicnotice}/>'));
console.log('PASS Cloudflare v2/general URLs, unsafe/duplicate rejection, snapshot staleness, v1-only 404, same click/QR URL, lazy accessible disclosure, retry/race');
