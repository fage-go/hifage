// Public GitHub data only. No token, persistent cache, injected HTML or APK proxy.
const validRepo=repo=>typeof repo==='string'&&/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo);
export function safeAsset(asset,repo,tag){
 if(!asset||asset.state!=='uploaded'||typeof asset.name!=='string'||!asset.name||!Number.isFinite(asset.size)||asset.size<=0||typeof asset.browser_download_url!=='string')return false;
 try{const u=new URL(asset.browser_download_url);return u.protocol==='https:'&&u.hostname==='github.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&decodeURIComponent(u.pathname)===`/${repo}/releases/download/${tag}/${asset.name}`&& !asset.name.includes('/')&&!asset.name.includes('\\');}catch{return false;}
}
export function selectRelease(releases,repo,policy='uploaded'){
 if(!validRepo(repo)||!Array.isArray(releases))return null;
 const candidates=[];
 for(const release of releases){
  if(!release||release.draft!==false||typeof release.tag_name!=='string'||!release.tag_name||typeof release.published_at!=='string'||!release.published_at||!Number.isFinite(Date.parse(release.published_at))||!Array.isArray(release.assets))continue;
  const assets=release.assets.filter(a=>safeAsset(a,repo,release.tag_name));let downloads=assets.map(a=>({label:typeof a.label==='string'&&a.label.trim()?a.label.trim():a.name,url:a.browser_download_url}));
  if(policy==='magicnotice-signed'){
   if(!/^signed-[A-Za-z0-9._-]+$/.test(release.tag_name))continue;
   const zh=assets.find(a=>/^cicada_zh_release_v[0-9]+-signed\.apk$/.test(a.name));
   const en=zh&&assets.find(a=>a.name===zh.name.replace('cicada_zh_','cicada_en_'));
   if(!zh||!en)continue;
   downloads=[{label:'下载中文版 APK',url:zh.browser_download_url},{label:'下载英文版 APK',url:en.browser_download_url}];
  }
  if(downloads.length)candidates.push({name:typeof release.name==='string'&&release.name.trim()?release.name.trim():release.tag_name,tag:release.tag_name,publishedAt:release.published_at,prerelease:release.prerelease===true,downloads});
 }
 return candidates.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))[0]||null;
}
export async function fetchLatestRelease(repo,policy='uploaded',{fetcher=globalThis.fetch,timeoutMs=8000,maxPages=10}={}){
 if(!validRepo(repo))throw new Error('Invalid repository');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const all=[];
  for(let page=1;page<=maxPages;page++){
   const response=await fetcher(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`,{signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
   if(!response.ok)throw new Error('GitHub unavailable');const rows=await response.json();if(!Array.isArray(rows))throw new Error('Invalid response');all.push(...rows);
   const hasNext=/rel="next"/.test(response.headers.get('Link')||'');
   if(!hasNext)return selectRelease(all,repo,policy);
  }
  throw new Error('Incomplete release listing');
 }finally{clearTimeout(timer);}
}
const widgetRuns=new WeakMap();
export async function initReleaseWidget(widget,options){
 const run={};widgetRuns.set(widget,run);
 const status=widget.querySelector('[data-release-status]'),result=widget.querySelector('[data-release-result]'),links=widget.querySelector('[data-release-links]');result.hidden=true;links.replaceChildren();
 try{
  const release=await fetchLatestRelease(widget.dataset.repo,widget.dataset.policy,options);
  if(widgetRuns.get(widget)!==run)return;
  if(!release){status.textContent='暂未找到完整可下载的版本，请查看 Releases。';return;}
  widget.querySelector('[data-release-name]').textContent=release.name;
  widget.querySelector('[data-release-meta]').textContent=`${release.tag} · ${new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(release.publishedAt))}（北京时间）${release.prerelease?' · 预发布':''}`;
  for(const download of release.downloads){const a=document.createElement('a');a.href=download.url;a.textContent=download.label;links.append(a);}
  status.textContent='最新可下载版本（刚从 GitHub 查询）';result.hidden=false;
 }catch{if(widgetRuns.get(widget)!==run)return;status.textContent='暂时无法查询最新版本，请打开 Releases 查看下载。';}
}
if(typeof document!=='undefined')document.querySelectorAll('[data-release-widget]').forEach(widget=>initReleaseWidget(widget));
