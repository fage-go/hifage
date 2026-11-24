// The browser reads only HiFage release metadata. All download links go through HiFage.
const downloadOrigin = 'https://download.hifage.com';
const validRepo = repo => typeof repo === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(repo) && !['.', '..'].includes(repo.split('/')[1]);
const validTag = tag => typeof tag === 'string' && tag.trim() === tag && tag.length > 0 && tag.length <= 180 && !/[\\\u0000-\u001f\u007f]/.test(tag) && !tag.split('/').some(part => !part || part === '.' || part === '..');
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const requests = new WeakMap();

function validateV2(info, repo) {
  if (!info || !validRepo(info.repo) || info.repo !== repo.toLowerCase() ||
      typeof info.name !== 'string' || !info.name.trim() || info.name.length > 500 || !validTag(info.tag) ||
      !validDate(info.publishedAt) || !validDate(info.checkedAt) || typeof info.stale !== 'boolean' ||
      typeof info.prerelease !== 'boolean' || !Array.isArray(info.downloads) || !info.downloads.length || info.downloads.length > 100) {
    throw new Error('Invalid release metadata');
  }
  const seen = new Set();
  const projectPath = info.repo.split('/').map(encodeURIComponent).join('/');
  const downloads = info.downloads.map(entry => {
    const id = entry?.id;
    if ((typeof id !== 'number' && typeof id !== 'string') || !/^[1-9]\d{0,15}$/.test(String(id)) ||
        !Number.isSafeInteger(Number(id)) || seen.has(String(id)) ||
        typeof entry.name !== 'string' || !entry.name.trim() || !Number.isSafeInteger(entry.size) || entry.size <= 0) {
      throw new Error('Invalid release asset');
    }
    const url = `${downloadOrigin}/v2/assets/${projectPath}/${encodeURIComponent(info.tag)}/${id}`;
    // Do not normalize a suspicious URL or consume originalUrl, even as a fallback.
    if (entry.downloadUrl !== url) throw new Error('Invalid download URL');
    seen.add(String(id));
    return {label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : entry.name, url};
  });
  return {name: info.name.trim(), tag: info.tag, publishedAt: info.publishedAt, checkedAt: info.checkedAt,
    prerelease: info.prerelease, stale: info.stale, downloads};
}

async function readManifest(endpoint, {fetcher = globalThis.fetch, timeoutMs = 8000} = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(endpoint, {signal: controller.signal, credentials: 'omit', redirect: 'error', cache: 'no-store'});
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Download service unavailable');
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTransferRelease(project, options) {
  if (project !== 'magicnotice') throw new Error('Unknown download project');
  const info = await readManifest(downloadOrigin + '/v1/projects/' + project + '/latest', options);
  if (info === null) return null;
  if (typeof info.name !== 'string' || !info.name.trim() || typeof info.tag !== 'string' ||
      !/^signed-[A-Za-z0-9._-]+$/.test(info.tag) || !validDate(info.publishedAt) ||
      !Array.isArray(info.downloads) || info.downloads.length !== 2) throw new Error('Invalid legacy manifest');
  const stem = '/v1/projects/' + project + '/assets/' + info.tag + '/';
  const files = new Map();
  for (const entry of info.downloads) {
    const match = typeof entry?.path === 'string' && entry.path.startsWith(stem) &&
      /^cicada_(zh|en)_release_v([0-9]+)-signed\.apk$/.exec(entry.path.slice(stem.length));
    if (!match || files.has(match[1])) throw new Error('Invalid download pair');
    files.set(match[1], {version: match[2], url: downloadOrigin + entry.path});
  }
  if (files.get('zh')?.version !== files.get('en')?.version) throw new Error('Invalid download version');
  return {name: info.name.trim(), tag: info.tag, publishedAt: info.publishedAt,
    prerelease: info.prerelease === true, stale: info.stale === true, source: 'legacy',
    downloads: [{label: '下载中文版 APK', url: files.get('zh').url}, {label: '下载英文版 APK', url: files.get('en').url}]};
}

export async function fetchProjectRelease(repo, transfer, options) {
  if (!validRepo(repo)) throw new Error('Invalid repository');
  const endpoint = downloadOrigin + '/v2/releases?repo=' + encodeURIComponent('https://github.com/' + repo);
  try {
    const info = await readManifest(endpoint, options);
    if (info !== null) {
      const release = validateV2(info, repo);
      return {...release, source: 'live'};
    }
    // A deployed v2 route missing this repo and a pre-cutover Worker both return 404.
    // Do not advertise static v2 assets if we cannot establish that route exists.
    if (transfer === 'magicnotice' && repo.toLowerCase() === 'fage-go/magicnotice') {
      try { return await fetchTransferRelease(transfer, options); } catch { return null; }
    }
    return null;
  } catch { /* Try the static catalog if live metadata is unavailable or invalid. */ }
  try {
    // This URL is relative to this same-site module, so Astro root and subpath builds both work.
    const path = repo.toLowerCase().split('/').map(encodeURIComponent).join('/');
    const catalog = await readManifest(new URL('./release-catalog/' + path + '.json', import.meta.url).href, options);
    if (catalog !== null) {
      const release = validateV2(catalog, repo);
      // The relay's own catalog fallback only accepts snapshots up to seven days old.
      if (Date.now() - Date.parse(release.checkedAt) <= 7 * 86400000) return {...release, stale: true, source: 'catalog'};
    }
  } catch { /* Never use a repository's original asset URL. */ }
  return null;
}

export async function makeReleaseQr(url) {
  const {default: qrcode} = await import('./vendor/qrcode-generator.mjs');
  const qr = qrcode(0, 'M');
  qr.addData(url, 'Byte');
  qr.make();
  return qr.createDataURL(5, 20);
}

function fileControl(download, makeQr, isCurrent) {
  const item = document.createElement('div');
  item.className = 'release-file';
  const a = document.createElement('a');
  a.href = download.url;
  a.textContent = download.label;
  const disclosure = document.createElement('details');
  const toggle = document.createElement('summary');
  toggle.textContent = '扫码';
  toggle.setAttribute('aria-label', '扫码下载：' + download.label);
  const qrStatus = document.createElement('p');
  qrStatus.setAttribute('role', 'status');
  let generated = false;
  disclosure.addEventListener('toggle', async () => {
    if (!disclosure.open || generated || !isCurrent()) return;
    generated = true;
    qrStatus.textContent = '正在生成二维码…';
    try {
      const image = document.createElement('img');
      image.src = await makeQr(download.url);
      if (!isCurrent()) return;
      image.alt = download.label + '的下载二维码';
      image.width = 176;
      image.height = 176;
      disclosure.append(image);
      qrStatus.textContent = '';
    } catch {
      if (isCurrent()) qrStatus.textContent = '二维码生成失败，请用下载链接。';
      generated = false;
    }
  });
  disclosure.append(toggle, qrStatus);
  item.append(a, disclosure);
  return item;
}

const releaseDate = new Intl.DateTimeFormat('zh-CN', {timeZone: 'Asia/Shanghai', dateStyle: 'medium'});
export async function initReleaseWidget(widget, options) {
  const run = {};
  requests.set(widget, run);
  const isCurrent = () => requests.get(widget) === run;
  const status = widget.querySelector('[data-release-status]');
  const result = widget.querySelector('[data-release-result]');
  const links = widget.querySelector('[data-release-links]');
  const retry = widget.querySelector('[data-release-retry]');
  result.hidden = true;
  links.replaceChildren();
  status.removeAttribute('data-release-ready');
  status.textContent = '正在获取下载…';
  if (retry) {
    retry.hidden = true;
    const button = retry.querySelector('button');
    if (button) button.onclick = () => initReleaseWidget(widget, options);
  }
  try {
    const release = await fetchProjectRelease(widget.dataset.repo, widget.dataset.transfer, options);
    if (!isCurrent()) return;
    if (!release) throw new Error('No downloadable release');
    widget.querySelector('[data-release-name]').textContent = release.name;
    const date = widget.querySelector('[data-release-meta]');
    date.textContent = releaseDate.format(new Date(release.publishedAt));
    date.setAttribute('datetime', new Date(release.publishedAt).toISOString());
    for (const download of release.downloads) {
      links.append(fileControl(download, options?.makeQr ?? makeReleaseQr, isCurrent));
    }
    result.hidden = false;
    status.setAttribute('data-release-ready', '');
    status.textContent = '下载链接已就绪';
  } catch {
    if (!isCurrent()) return;
    links.replaceChildren();
    status.textContent = '暂时无法获取下载。';
    if (retry) retry.hidden = false;
  }
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-release-widget]').forEach(widget => initReleaseWidget(widget));
