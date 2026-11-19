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
const downloadOrigin='https://download.hifage.com';
export async function fetchTransferRelease(project,{fetcher=globalThis.fetch,timeoutMs=8000}={}){
 if(project!=='magicnotice')throw new Error('Unknown download project');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const endpoint=downloadOrigin+'/v1/projects/'+project+'/latest';
  const response=await fetcher(endpoint,{signal:controller.signal,credentials:'omit',redirect:'error',cache:'no-store'});
  if(response.status===404)return null;
  if(!response.ok)throw new Error('Download service unavailable');
  const info=await response.json();
  if(!info||typeof info.name!=='string'||!info.name.trim()||typeof info.tag!=='string'||!/^signed-[A-Za-z0-9._-]+$/.test(info.tag)||typeof info.publishedAt!=='string'||!Number.isFinite(Date.parse(info.publishedAt))||!Array.isArray(info.downloads)||info.downloads.length!==2)throw new Error('Invalid download manifest');
  const stem='/v1/projects/'+project+'/assets/'+info.tag+'/';
  const files=new Map();
  for(const entry of info.downloads){
   if(typeof entry?.path!=='string'||!entry.path.startsWith(stem))throw new Error('Invalid download path');
   const match=/^cicada_(zh|en)_release_v([0-9]+)-signed\.apk$/.exec(entry.path.slice(stem.length));
   if(!match||files.has(match[1]))throw new Error('Invalid download pair');
   files.set(match[1],{version:match[2],url:downloadOrigin+entry.path});
  }
  if(files.get('zh')?.version!==files.get('en')?.version)throw new Error('Invalid download version');
  return {name:info.name.trim(),tag:info.tag,publishedAt:info.publishedAt,prerelease:info.prerelease===true,downloads:[{label:'下载中文版 APK',url:files.get('zh').url},{label:'下载英文版 APK',url:files.get('en').url}]};
 }finally{clearTimeout(timer);}
}
const widgetRuns=new WeakMap();
export async function initReleaseWidget(widget,options){
 const run={};widgetRuns.set(widget,run);
 const status=widget.querySelector('[data-release-status]'),result=widget.querySelector('[data-release-result]'),links=widget.querySelector('[data-release-links]');result.hidden=true;links.replaceChildren();
 const transfer=widget.dataset.transfer,retry=widget.querySelector('[data-release-retry]');
 if(transfer){status.textContent='正在查询最新版…';if(retry){retry.hidden=true;const button=retry.querySelector('button');if(button)button.onclick=()=>initReleaseWidget(widget,options);}}
 try{
  const release=await (transfer?fetchTransferRelease(transfer,options):fetchLatestRelease(widget.dataset.repo,widget.dataset.policy,options));
  if(widgetRuns.get(widget)!==run)return;
  if(!release){status.textContent=transfer?'暂未找到可下载的版本，请稍后重试。':'暂未找到完整可下载的版本，请查看 Releases。';if(transfer&&retry)retry.hidden=false;return;}
  widget.querySelector('[data-release-name]').textContent=release.name;
  widget.querySelector('[data-release-meta]').textContent=`${release.tag} · ${new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(release.publishedAt))}（北京时间）${release.prerelease?' · 预发布':''}`;
  for(const download of release.downloads){const a=document.createElement('a');a.href=download.url;a.textContent=download.label;links.append(a);}
  status.textContent=transfer?'最新可下载版本':'最新可下载版本（刚从 GitHub 查询）';result.hidden=false;
 }catch{if(widgetRuns.get(widget)!==run)return;status.textContent=transfer?'下载服务暂时不可用，请稍后重试。':'暂时无法查询最新版本，请打开 Releases 查看下载。';if(transfer&&retry)retry.hidden=false;}
}
if(typeof document!=='undefined')document.querySelectorAll('[data-release-widget]').forEach(widget=>initReleaseWidget(widget));
