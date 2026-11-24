import assert from 'node:assert/strict';
import {createWorker,parseRoute,normalizeRepo,validateCatalog,assetPath} from './index.mjs';
const base='https://download.hifage.com',repo='fage-go/magicnotice',tag='signed-test',time=Date.parse('2026-11-19T08:00:00Z');
const raw={name:'Release name',tag_name:tag,published_at:'2026-11-19T07:00:00Z',draft:false,prerelease:true,assets:['zh','en'].map((lang,i)=>({id:51+i,name:`cicada_${lang}_release_v1680-signed.apk`,size:4,state:'uploaded',browser_download_url:`https://github.com/${repo}/releases/download/${tag}/cicada_${lang}_release_v1680-signed.apk`}))};
const latest='/v2/releases?repo='+repo;
const request=p=>new Request(base+p);
function cache(){const m=new Map();return{m,async match(k){return m.get(k.url)?.clone()},async put(k,v){m.set(k.url,v.clone())}};}
let seen=[],mode='good',clock=time;
const c=cache();
let seed;
const fetcher=async(u,opts)=>{seen.push(u);assert(!('cache' in opts));if(u.startsWith('https://hifage.com/release-catalog/'))return Response.json(seed??{});
if(u.startsWith('https://api.github.com/')){if(mode==='throw')throw new TypeError('secret URL');if(mode!=='good')return new Response(null,{status:Number(mode)});return Response.json(u.includes('/tags/')?raw:[raw]);}
return new Response(opts.method==='HEAD'?null:'ABCD',{headers:{'Content-Length':'4','Content-Type':'application/octet-stream'}});};
const w=createWorker({fetcher,cache:c,now:()=>clock});
assert.equal(normalizeRepo('https://github.com/Fage-Go/MagicNotice/'),repo);
for(const r of ['https://github.com/evil/repo','https://github.com/fage-go/magicnotice?x=1','https://github.com.evil/fage-go/magicnotice','https://user@github.com/fage-go/magicnotice','fage-go/magicnotice/extra','https://github.com/fage-go/%6dagicnotice']){
assert.equal(parseRoute(base+'/v2/releases?repo='+encodeURIComponent(r)),null);}
assert.equal(parseRoute(base+latest+'&repo='+repo),null);
let response=await w.fetch(request(latest));assert.equal(response.status,200);let data=await response.json();seed=data;
assert.equal(data.repo,repo);assert.equal(data.name,'Release name');assert.equal(data.checkedAt,new Date(time).toISOString());assert.equal(data.stale,false);
assert.equal(data.downloads[0].downloadUrl,base+assetPath(repo,tag,51));assert.equal(data.downloads[0].originalUrl,raw.assets[0].browser_download_url);
assert.equal(seen.length,1);
assert.equal(await(await w.fetch(request(assetPath(repo,tag,51)))).text(),'ABCD');
assert.equal((await w.fetch(request(assetPath(repo,tag,999)))).status,404);
assert.equal((await w.fetch(request('/v2/assets/evil/repo/'+tag+'/51'))).status,404);
assert.equal((await w.fetch(request('/v2/assets/'+repo+'/'+tag+'/051'))).status,404);
assert.equal((await w.fetch(request('/v2/releases?repo='+encodeURIComponent('https://github.com/'+repo)))).status,200);
mode='429';clock+=901000;
response=await w.fetch(request(latest));assert.equal(response.status,200);assert.equal((await response.json()).stale,true);assert.equal(response.headers.get('Cache-Control'),'no-store');
const cold=createWorker({fetcher,now:()=>clock});
response=await cold.fetch(request(latest));assert.equal(response.status,200);assert.equal((await response.json()).stale,true);assert(seen.includes('https://hifage.com/release-catalog/'+repo+'.json'));
assert.equal(await(await cold.fetch(request(assetPath(repo,tag,51)))).text(),'ABCD');
assert.equal((await cold.fetch(request(assetPath(repo,'signed-different',51)))).status,502);
for(const state of ['403','throw']){mode=state;assert.equal((await cold.fetch(request(latest))).status,200);}
mode='404';assert.equal((await cold.fetch(request(latest))).status,404);
mode='500';assert.equal((await cold.fetch(request(latest))).status,502);
mode='403';clock=time+8*86400000;assert.equal((await cold.fetch(request(latest))).status,502);assert.equal((await w.fetch(request(latest))).status,502);
clock=time;
for(const mutation of [
 {downloads:[{...data.downloads[0],originalUrl:'https://evil.test/a'},data.downloads[1]]},
 {downloads:[{...data.downloads[0],originalUrl:raw.assets[0].browser_download_url+'?token=x'},data.downloads[1]]},
 {downloads:[{...data.downloads[0],size:0},data.downloads[1]]},
 {downloads:[{...data.downloads[0],id:NaN},data.downloads[1]]},
 {downloads:[data.downloads[0]]},{repo:'evil/repo'},
 {checkedAt:'garbage'},{checkedAt:'2099-01-01T00:00:00Z'},
 {downloads:[data.downloads[0],{...data.downloads[1],name:'cicada_en_release_v999-signed.apk'}]}
])assert.equal(validateCatalog({...data,...mutation},repo,'magicnotice-signed',clock),null);
// Input downloadUrl is never trusted; absolute canonical transfer is reconstructed.
assert.equal(validateCatalog({...data,downloads:data.downloads.map(a=>({...a,downloadUrl:'https://evil.test'}))},repo,'magicnotice-signed',clock).downloads[0].downloadUrl,base+assetPath(repo,tag,51));
// Injection is constructor configuration, never request-controlled authorization.
const genericRepo='fixture/tool',genericTag='release/1.0',genericName='工具 package.zip';
const generic={...raw,name:'Desktop tool',tag_name:genericTag,assets:[{id:900,size:4,state:'uploaded',name:genericName,label:'macOS archive',browser_download_url:'https://github.com/'+genericRepo+'/releases/download/'+encodeURIComponent(genericTag)+'/'+encodeURIComponent(genericName)}]};
const gw=createWorker({repos:{[genericRepo]:{policy:'uploaded'}},now:()=>clock,fetcher:async(u,o)=>u.startsWith('https://api.github.com/')?Response.json(u.includes('/tags/')?generic:[generic]):new Response(o.method==='HEAD'?null:'ABCD',{headers:{'Content-Length':'4','Content-Type':'application/zip'}})});
let g=await(await gw.fetch(request('/v2/releases?repo='+genericRepo))).json();assert.equal(g.name,'Desktop tool');assert.equal(g.downloads[0].label,'macOS archive');assert.equal(g.downloads[0].name,genericName);
response=await gw.fetch(new Request(g.downloads[0].downloadUrl));assert.equal(response.status,200);assert.equal(await response.text(),'ABCD');assert(response.headers.get('Content-Disposition').includes('filename*=UTF-8'));
assert.equal((await w.fetch(request('/v2/releases?repo='+genericRepo))).status,404);
assert.equal((await w.fetch(request('/v2/releases?repo='+repo+'&source=https://evil.test'))).status,404);
assert.equal((await gw.fetch(request('/v1/projects/magicnotice/latest'))).status,404);
console.log('PASS v2 normalization/allowlist, asset ids, absolute URLs, original URL validation, 900s expiry, stale edge cache, cold static catalog, 7-day expiry, generic configured policy, encoded tags/files, no request-controlled source');
for(const method of ['GET','HEAD']){
 const rw=createWorker({now:()=>time,fetcher:async(u,o)=>u.startsWith('https://api.github.com/')?Response.json(raw):new Response(method==='HEAD'?null:'BC',{status:206,headers:{'Content-Type':'application/octet-stream','Content-Length':'2','Content-Range':'bytes 1-2/4'}})});
 const response=await rw.fetch(new Request(base+assetPath(repo,tag,51),{method,headers:{Range:'bytes=1-2'}}));
 assert.equal(response.status,206);assert.equal(response.headers.get('Content-Range'),'bytes 1-2/4');assert.equal(await response.text(),method==='HEAD'?'':'BC');
 assert.equal((await rw.fetch(new Request(base+assetPath(repo,tag,51),{headers:{Range:'bytes=100-'}}))).status,416);
}
console.log('PASS v2 GET/HEAD exact partial response and 416');
