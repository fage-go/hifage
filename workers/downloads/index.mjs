import {BOOTSTRAP} from './release-bootstrap.mjs';
export function rangeBounds(range,size){
 if(!range)return null;const m=/^bytes=(\d{0,16})-(\d{0,16})$/.exec(range);if(!m||(!m[1]&&!m[2]))throw new Error('range');
 const a=m[1]?Number(m[1]):null,b=m[2]?Number(m[2]):null;if((a!==null&&!Number.isSafeInteger(a))||(b!==null&&!Number.isSafeInteger(b)))throw new Error('range');
 if(a===null){if(b<=0)throw new Error('range');return [Math.max(0,size-b),size-1];}
 if(a>=size||(b!==null&&b<a))throw new Error('range');return [a,b===null?size-1:Math.min(b,size-1)];
}
export function trustedRedirect(url,original){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&(u.href===original||u.hostname==='release-assets.githubusercontent.com');}catch{return false;}}
const ORIGIN='https://hifage.com', HOST='https://download.hifage.com', PREFIX='/v1/projects/magicnotice';
const FRESH=900, STALE=7*86400;
export const REPOS=Object.freeze({'fage-go/magicnotice':{policy:'magicnotice-signed'}});
const cors={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS','Access-Control-Allow-Headers':'Range, If-Range','Access-Control-Expose-Headers':'Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified','Vary':'Origin','X-Content-Type-Options':'nosniff'};
function error(status,code){return new Response(null,{status,headers:{...cors,'Cache-Control':'no-store',...(code?{'X-HiFage-Diagnostic':code}:{})}});}
function failure(code){const e=new Error(code);e.code=code;return e;}
export function normalizeRepo(input){
 if(typeof input!=='string'||input.trim()!==input)return null;
 let value=input;
 if(value.startsWith('https://')){try{const u=new URL(value);if(u.origin!=='https://github.com'||u.username||u.password||u.search||u.hash||u.pathname.includes('%'))return null;value=u.pathname.slice(1).replace(/\/$/,'');}catch{return null;}}
 if(!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value)||value.split('/')[1]==='..'||value.split('/')[1]==='.')return null;
 return value.toLowerCase();
}
function allowed(repo,repos){return repo&&Object.hasOwn(repos,repo);}
function validTag(s){return typeof s==='string'&&s.length>0&&s.length<=180&&!/[\\\x00-\x20\x7f?#]/.test(s)&&!s.split('/').some(p=>p==='.'||p==='..'||!p);}
function validName(s){return typeof s==='string'&&s.length>0&&s.length<=240&&!/[\\/\x00-\x1f\x7f]/.test(s)&&s!=='.'&&s!=='..';}
export function assetPath(repo,tag,id){return '/v2/assets/'+repo+'/'+encodeURIComponent(tag)+'/'+id;}
export function parseRoute(input,repos=REPOS){
 let u;try{u=new URL(input);}catch{return null;}
 if(u.username||u.password||u.hash)return null;
 if(u.pathname==='/v2/releases'){if([...u.searchParams.keys()].length!==1||u.searchParams.getAll('repo').length!==1)return null;const repo=normalizeRepo(u.searchParams.get('repo'));return allowed(repo,repos)?{v:2,kind:'latest',repo}:null;}
 if(u.search)return null;
 if(u.pathname===PREFIX+'/latest')return {v:1,kind:'latest',repo:'fage-go/magicnotice'};
 if(u.pathname.startsWith(PREFIX+'/assets/')){const p=u.pathname.slice((PREFIX+'/assets/').length).split('/');if(p.length===2&&/^signed-[A-Za-z0-9_-]{1,80}$/.test(p[0])&&/^cicada_(zh|en)_release_v[0-9]{1,12}-signed\.apk$/.test(p[1]))return{v:1,kind:'asset',repo:'fage-go/magicnotice',tag:p[0],file:p[1]};return null;}
 const p=u.pathname.split('/');if(p.length!==7||p[1]!=='v2'||p[2]!=='assets')return null;
 const repo=normalizeRepo(p[3]+'/'+p[4]);let tag;try{tag=decodeURIComponent(p[5]);}catch{return null;}
 if(!allowed(repo,repos)||!validTag(tag)||encodeURIComponent(tag)!==p[5]||!/^\d{1,16}$/.test(p[6])||!Number.isSafeInteger(Number(p[6]))||Number(p[6])<=0||String(Number(p[6]))!==p[6])return null;
 return{v:2,kind:'asset',repo,tag,assetId:p[6]};
}
function original(repo,tag,name){return 'https://github.com/'+repo+'/releases/download/'+encodeURIComponent(tag)+'/'+encodeURIComponent(name);}
function validAsset(a,repo,tag){return a&&Number.isSafeInteger(a.id)&&a.id>0&&Number.isSafeInteger(a.size)&&a.size>0&&validName(a.name)&&typeof a.originalUrl==='string'&&a.originalUrl===original(repo,tag,a.name)&&typeof a.label==='string'&&a.label.length<=300;}
function enforcePolicy(downloads,policy,tag){
 if(policy!=='magicnotice-signed')return downloads;
 if(!/^signed-[A-Za-z0-9_-]{1,80}$/.test(tag))return [];
 const zh=downloads.find(a=>/^cicada_zh_release_v[0-9]{1,12}-signed\.apk$/.test(a.name));
 if(!zh)return [];const en=downloads.find(a=>a.name===zh.name.replace('cicada_zh_','cicada_en_'));
 return en?[{...zh,label:'下载中文版 APK'},{...en,label:'Download English APK'}]:[];
}
export function validateCatalog(raw,repo,policy,now=Date.now(),{durable=false}={}){
 if(!raw||raw.repo!==repo||!validTag(raw.tag)||typeof raw.name!=='string'||raw.name.length>500||typeof raw.prerelease!=='boolean'||!Array.isArray(raw.downloads)||raw.downloads.length<1||raw.downloads.length>100)return null;
 if(typeof raw.checkedAt!=='string'||typeof raw.publishedAt!=='string')return null;
 const checked=Date.parse(raw.checkedAt),published=Date.parse(raw.publishedAt);
 if(!Number.isFinite(checked)||!Number.isFinite(published)||checked>now+60000||(!durable&&now-checked>STALE*1000)||published>now+60000)return null;
 if(!raw.downloads.every(a=>validAsset(a,repo,raw.tag))||new Set(raw.downloads.map(a=>a.id)).size!==raw.downloads.length)return null;
 const downloads=enforcePolicy(raw.downloads,policy,raw.tag);if(!downloads.length)return null;
 return {repo,name:raw.name.trim()||raw.tag,tag:raw.tag,publishedAt:new Date(published).toISOString(),prerelease:raw.prerelease,checkedAt:new Date(checked).toISOString(),stale:now-checked>=(durable?2*FRESH:FRESH)*1000,downloads:downloads.map(a=>({id:a.id,label:a.label,name:a.name,size:a.size,originalUrl:a.originalUrl,downloadUrl:HOST+assetPath(repo,raw.tag,a.id)}))};
}
function fromGitHub(r,repo,policy,now){
 if(!r||r.draft!==false||!validTag(r.tag_name)||!Array.isArray(r.assets)||!Number.isFinite(Date.parse(r.published_at)))return null;
 const downloads=r.assets.filter(a=>a&&a.state==='uploaded').map(a=>({id:a.id,name:a.name,label:typeof a.label==='string'&&a.label.trim()?a.label.trim():a.name,size:a.size,originalUrl:a.browser_download_url})).filter(a=>validAsset(a,repo,r.tag_name));
 return validateCatalog({repo,name:typeof r.name==='string'?r.name:r.tag_name,tag:r.tag_name,publishedAt:r.published_at,checkedAt:new Date(now).toISOString(),prerelease:r.prerelease===true,downloads},repo,policy,now);
}
function makeJSONFetcher(fetcher){
 return async function getJSON(url){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{const r=await fetcher(url,{redirect:'manual',credentials:'omit',signal:controller.signal,headers:{Accept:'application/json','User-Agent':'HiFage-public-downloads','Cache-Control':'no-cache'}});
   if(!r.ok){await r.body?.cancel();throw failure('api_http_'+r.status);}
   const txt=await r.text();if(txt.length>4*1024*1024)throw failure('metadata_size');
   try{return JSON.parse(txt);}catch{throw failure('metadata_json');}
  }catch(e){if(e.code)throw e;throw failure(controller.signal.aborted?'api_timeout':'api_transport');}finally{clearTimeout(timer);}
 }
}
async function newestRelease(getJSON,repo,policy,now){
 let best=null,ambiguous=false;
 for(let page=1;page<=5;page++){
  const rs=await getJSON('https://api.github.com/repos/'+repo+'/releases?per_page=100&page='+page);
  if(!Array.isArray(rs)||rs.length>100)throw failure('metadata_shape');
  for(const release of rs){
   const row=fromGitHub(release,repo,policy,now());
   if(!row)continue;
   if(!best||Date.parse(row.publishedAt)>Date.parse(best.publishedAt)){best=row;ambiguous=false;}
   else if(row.publishedAt===best.publishedAt&&(row.tag!==best.tag||identity(row)!==identity(best)))ambiguous=true;
  }
  if(rs.length<100){if(ambiguous)throw failure('ambiguous_release');return best;}
 }
 throw failure('metadata_pages');
}
export function createWorker({fetcher=(...a)=>globalThis.fetch(...a),cache=globalThis.caches?.default,repos=REPOS,shelf,now=()=>Date.now(),headerTimeout=12000,bodyTimeout=120000}={}){
 const getJSON=makeJSONFetcher(fetcher);
 const key=(repo,suffix)=>new Request(HOST+'/__metadata/v2/'+repo+'/'+suffix);
 async function read(repo,suffix){try{const r=await cache?.match(key(repo,suffix));if(!r)return null;return validateCatalog(await r.json(),repo,repos[repo].policy,now());}catch{return null;}}
 async function put(repo,suffix,data,ttl){try{await cache?.put(key(repo,suffix),Response.json(data,{headers:{'Cache-Control':'public, max-age='+ttl}}));}catch{}}
 function fits(data,route){return data&&(route.kind==='latest'||data.tag===route.tag);}
 async function metadata(route){
  const repo=route.repo,policy=repos[repo].policy,suffix=route.kind==='latest'?'latest':'tag/'+encodeURIComponent(route.tag);
  if(shelf){
   if(route.kind==='latest'){
    const stored=await shelf(repo,null);
    if(!stored)throw failure('snapshot_not_ready');
    return stored;
   }
   // Durable history keeps previously promoted links usable even if GitHub metadata
   // is throttled. Other exact tags continue to use the v2 lookup and validation.
   let stored;try{stored=await shelf(repo,route.tag);}catch{}
   if(fits(stored,route))return stored;
  }
  const fresh=await read(repo,suffix);if(fits(fresh,route)&&!fresh.stale)return fresh;
  let selected;
  try{
   if(route.kind==='latest'){
    selected=await newestRelease(getJSON,repo,policy,now);
   }else{const r=await getJSON('https://api.github.com/repos/'+repo+'/releases/tags/'+encodeURIComponent(route.tag));selected=r.tag_name===route.tag?fromGitHub(r,repo,policy,now()):null;}
  }catch(e){
   if(e.code==='api_http_404')return null;
   if(!['api_http_403','api_http_429','api_transport','api_timeout'].includes(e.code))throw e;
   for(const candidate of [fresh,await read(repo,'last-good'),await read(repo,'last-tag/'+encodeURIComponent(route.tag||''))])if(fits(candidate,route))return {...candidate,stale:true};
   let seed;try{seed=validateCatalog(await getJSON(ORIGIN+'/release-catalog/'+repo+'.json',true),repo,policy,now());}catch{}
   if(fits(seed,route)){await put(repo,'last-good',seed,STALE);return{...seed,stale:true};}
   throw e;
  }
  if(!selected)return null;
  await put(repo,suffix,selected,FRESH);await put(repo,'last-tag/'+encodeURIComponent(selected.tag),selected,STALE);
  if(route.kind==='latest')await put(repo,'last-good',selected,STALE);
  return selected;
 }
 async function transfer(request,route,selected){
  const asset=selected.downloads.find(a=>route.v===1?a.name===route.file:String(a.id)===route.assetId);
  if(!asset)return error(404);const upstream=asset.originalUrl;route={...route,file:asset.name};
  const size=asset.size;if(!Number.isSafeInteger(size)||size<=0)return error(502);
  const range=request.headers.get('Range');try{rangeBounds(range,size);}catch{return new Response(null,{status:416,headers:{...cors,'Content-Range':`bytes */${size}`,'Cache-Control':'no-store'}});}
  const headers=new Headers({'Accept':'application/octet-stream','Accept-Encoding':'identity','User-Agent':'HiFage-public-downloads'});
  if(range)headers.set('Range',range);const ifRange=request.headers.get('If-Range');if(ifRange)headers.set('If-Range',ifRange);
  const controller=new AbortController();let timer=setTimeout(()=>controller.abort(),headerTimeout);let url=upstream,response;
  try{
   for(let hop=0;hop<4;hop++){
    response=await fetcher(url,{method:request.method,redirect:'manual',credentials:'omit',headers,signal:controller.signal});
    if(![301,302,303,307,308].includes(response.status))break;
    const next=response.headers.get('Location');await response.body?.cancel();if(!next)throw new Error('redirect');const target=new URL(next,url).href;if(!trustedRedirect(target,upstream))throw new Error('redirect');url=target;response=null;
   }
   if(!response)throw new Error('redirect');
   if(response.status===404){clearTimeout(timer);await response.body?.cancel();return error(404);}
   if(![200,206,416].includes(response.status))throw new Error('status');
   const encoding=response.headers.get('Content-Encoding');if(encoding&&encoding!=='identity')throw new Error('encoding');
   const output=new Headers({...cors,'Cache-Control':'no-store','Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="${route.file.replace(/[^A-Za-z0-9._-]/g,'_')}"; filename*=UTF-8''${encodeURIComponent(route.file).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase())}`});
   for(const key of ['Content-Length','Content-Range','Accept-Ranges','ETag','Last-Modified'])if(response.headers.has(key))output.set(key,response.headers.get(key));
   if(response.status===416){if(output.get('Content-Range')!==`bytes */${size}`)throw new Error('range');clearTimeout(timer);await response.body?.cancel();return new Response(null,{status:416,headers:output});}
   const type=response.headers.get('Content-Type')||'';if(!type||/^(text\/html|application\/(xhtml\+xml))\b/i.test(type))throw new Error('type');
   const length=Number(output.get('Content-Length'));if(!output.has('Content-Length')||!Number.isSafeInteger(length)||length<=0)throw new Error('length');
   if(response.status===206){const m=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(output.get('Content-Range')||'');if(!range||!m||Number(m[3])!==size)throw new Error('range');const bounds=rangeBounds(range,Number(m[3]));if(Number(m[1])!==bounds[0]||Number(m[2])!==bounds[1]||length!==bounds[1]-bounds[0]+1)throw new Error('range');}
   else if(output.has('Content-Range')||length!==size)throw new Error('range');
   clearTimeout(timer);if(request.method==='HEAD'){await response.body?.cancel();return new Response(null,{status:response.status,headers:output});}
   if(!response.body)throw new Error('body');timer=setTimeout(()=>controller.abort(),bodyTimeout);const reader=response.body.getReader();let bytes=0;
   const body=new ReadableStream({async pull(out){try{const {done,value}=await reader.read();if(done){clearTimeout(timer);if(bytes!==length)throw new Error('truncated');out.close();return;}bytes+=value.byteLength;if(bytes>length)throw new Error('length');out.enqueue(value);}catch{clearTimeout(timer);controller.abort();out.error(new Error('Download interrupted'));}},async cancel(){clearTimeout(timer);controller.abort();await reader.cancel();}});
   // Workers ignores manually assigned Content-Length on arbitrary streams.
   // Its FixedLengthStream carries the verified length without buffering.
   if(typeof globalThis.FixedLengthStream==='function'){const fixed=new globalThis.FixedLengthStream(length);body.pipeTo(fixed.writable).catch(()=>{});return new Response(fixed.readable,{status:response.status,headers:output});}
   return new Response(body,{status:response.status,headers:output});
  }catch(e){const wasAborted=controller.signal.aborted;clearTimeout(timer);controller.abort();await response?.body?.cancel().catch(()=>{});const known=['redirect','status','encoding','range','type','length','body'];const reason=wasAborted?'asset_timeout':known.includes(e?.message)?'asset_'+e.message:e?.name==='TypeError'?'asset_transport_typeerror':'asset_transport';return error(502,reason);}
 }

 return {async fetch(request){
  const origin=request.headers.get('Origin');if(origin&&origin!==ORIGIN)return error(403);
  const route=parseRoute(request.url,repos);if(!route||!allowed(route.repo,repos))return error(404);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Max-Age':'600'}});
  if(!['GET','HEAD'].includes(request.method)||route.kind==='latest'&&request.method!=='GET')return error(405);
  try{const data=await metadata(route);if(!data)return error(404);
   if(route.kind==='latest'){const result=route.v===2?data:{name:data.name,tag:data.tag,publishedAt:data.publishedAt,prerelease:data.prerelease,downloads:data.downloads.map(a=>({label:a.label,path:PREFIX+'/assets/'+data.tag+'/'+a.name}))};
    return Response.json(result,{headers:{...cors,'Cache-Control':shelf||data.stale?'no-store':'public, max-age='+Math.max(0,FRESH-Math.floor((now()-Date.parse(data.checkedAt))/1000))}});}
   return await transfer(request,route,data);
  }catch(e){if(['snapshot_not_ready','snapshot_unavailable'].includes(e.code))return error(503,e.code);const safe=/^(api_(timeout|transport)|api_http_[0-9]{3}|metadata_(size|json|shape|pages))$/.test(e.code||'')?e.code:'metadata_failure';return error(502,safe);}
 }};
}
const SNAPSHOT_CRON='*/15 * * * *';
// Internal URLs are only reachable through our binding, never through the public
// Worker routes. GET does not check GitHub; POST refresh is invoked only by Cron.
function snapshotStub(env,repo){
 const binding=env?.RELEASE_SNAPSHOTS;
 if(!binding)throw failure('snapshot_unavailable');
 return binding.get(binding.idFromName(repo));
}
function snapshotURL(repo,tag=null){
 const url=new URL('https://internal.invalid/snapshot');
 url.searchParams.set('repo',repo);
 if(tag!==null)url.searchParams.set('tag',tag);
 return url;
}
function identity(release){
 return JSON.stringify(release.downloads.map(a=>[a.id,a.name,a.size]).sort((a,b)=>a[0]-b[0]));
}

export class ReleaseSnapshot {
 constructor(ctx,_env,{fetcher=(...a)=>globalThis.fetch(...a),now=()=>Date.now(),bootstrap=BOOTSTRAP}={}){
  this.ctx=ctx;this.sql=ctx.storage.sql;this.now=now;this.bootstrap=bootstrap;this.getJSON=makeJSONFetcher(fetcher);
  this.sql.exec('CREATE TABLE IF NOT EXISTS snapshots (key TEXT PRIMARY KEY, payload TEXT NOT NULL)');
 }
 read(repo,key){
  const raw=this.sql.exec('SELECT payload FROM snapshots WHERE key = ?',key).toArray()[0]?.payload;
  if(raw===undefined)return null;
  const row=validateCatalog(JSON.parse(raw),repo,REPOS[repo].policy,this.now(),{durable:true});
  if(!row)throw failure('snapshot_corrupt');
  return row;
 }
 save(key,row){
  this.sql.exec('INSERT INTO snapshots (key, payload) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET payload = excluded.payload',key,JSON.stringify(row));
 }
 promote(repo,row){
  return this.ctx.storage.transactionSync(()=>{
   const previous=this.read(repo,'latest');
   if(previous){
    const before=Date.parse(previous.publishedAt),after=Date.parse(row.publishedAt);
    // Never move to an older or ambiguously ordered release. An existing tag
    // cannot silently swap out the bytes identified by tag and asset ID.
    if(after<before||after===before&&row.tag!==previous.tag)return 'kept_previous';
    if(row.tag===previous.tag&&(after!==before||identity(row)!==identity(previous)))return 'kept_previous';
    if(Date.parse(row.checkedAt)<Date.parse(previous.checkedAt))return 'kept_previous';
   }
   const known=this.read(repo,'tag:'+row.tag);
   if(known&&(known.publishedAt!==row.publishedAt||identity(known)!==identity(row)))return 'kept_previous';
   if(!known)this.save('tag:'+row.tag,row);
   if(!previous||JSON.stringify(previous)!==JSON.stringify(row))this.save('latest',row);
   return previous?.tag===row.tag?'checked':'promoted';
  });
 }
 initialize(repo){
  if(this.read(repo,'latest'))return;
  const initial=validateCatalog(this.bootstrap[repo],repo,REPOS[repo].policy,this.now(),{durable:true});
  if(initial)this.promote(repo,initial);
 }
 async refresh(repo){
  if(!this.refreshing){
   this.refreshing=(async()=>{
    const row=await newestRelease(this.getJSON,repo,REPOS[repo].policy,this.now);
    if(!row)throw failure('no_valid_release');
    return this.promote(repo,row);
   })().finally(()=>{this.refreshing=null;});
  }
  return this.refreshing;
 }
 async fetch(request){
  const url=new URL(request.url),repo=url.searchParams.get('repo'),tag=url.searchParams.get('tag');
  if(url.pathname!=='/snapshot'||!allowed(repo,REPOS)||tag!==null&&!validTag(tag))return new Response(null,{status:404});
  if(request.method!=='GET'&&(request.method!=='POST'||tag!==null))return new Response(null,{status:405});
  const headers={'Cache-Control':'no-store'};
  try{
   this.initialize(repo);
   if(request.method==='POST')return Response.json({result:await this.refresh(repo)},{headers});
   const stored=this.read(repo,tag===null?'latest':'tag:'+tag);
   return stored?Response.json(stored,{headers}):new Response(null,{status:404,headers});
  }catch(e){
   const code=e?.code;
   const safe=/^(api_(timeout|transport)|api_http_[0-9]{3}|metadata_(size|json|shape|pages)|no_valid_release|ambiguous_release|snapshot_corrupt)$/.test(code||'')?code:'snapshot_failure';
   return Response.json({error:safe},{status:503,headers});
  }
 }
}

export function createDurableWorker({repos=REPOS,fetcher,cache,now}={}){
 return {
  fetch(request,env){
   return createWorker({repos,fetcher,cache,now,shelf:async(repo,tag)=>{
    let response;
    try{response=await snapshotStub(env,repo).fetch(snapshotURL(repo,tag));}catch{throw failure('snapshot_unavailable');}
    if(response.status===404)return null;
    if(!response.ok)throw failure('snapshot_unavailable');
    const row=validateCatalog(await response.json(),repo,repos[repo].policy,now?.()??Date.now(),{durable:true});
    if(!row)throw failure('snapshot_unavailable');
    return row;
   }}).fetch(request);
  },
  async scheduled(controller,env){
   if(controller.cron!==SNAPSHOT_CRON)return;
   let anyFailed=false;
   for(const repo of Object.keys(repos)){
    try{
     const response=await snapshotStub(env,repo).fetch(snapshotURL(repo),{method:'POST'});
     const data=await response.json();
     if(!response.ok||data.result==='kept_previous'){
      console.warn('release snapshot not updated',repo,data.error||data.result);
      anyFailed=true;
     }
    }catch{console.warn('release snapshot unavailable',repo);anyFailed=true;}
   }
   // Show failed/no-op downgrade guards in Cron history without losing last good.
   if(anyFailed)throw new Error('One or more release snapshots could not be refreshed');
  }
 };
}
export default createDurableWorker();
