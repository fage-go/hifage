import assert from 'node:assert/strict';
import {createWorker,parseRoute,rangeBounds,trustedRedirect} from './index.mjs';
const host='https://downloads.example.workers.dev',prefix='/v1/projects/magicnotice',tag='signed-71375e9cb378',file='cicada_zh_release_v1680-signed.apk';
const raw=`https://github.com/fage-go/magicnotice/releases/download/${tag}/${file}`;
const release={tag_name:tag,name:'MagicNotice '+tag,published_at:'2026-11-19T07:21:56Z',draft:false,prerelease:true,assets:['zh','en'].map((lang,i)=>({id:i+1,name:`cicada_${lang}_release_v1680-signed.apk`,size:4,state:'uploaded',browser_download_url:`https://github.com/fage-go/magicnotice/releases/download/${tag}/cicada_${lang}_release_v1680-signed.apk`}))};
const req=(path,opts={})=>new Request(host+prefix+path,opts);
const cache=()=>{const data=new Map();return{puts:0,async match(k){return data.get(k.url)?.clone()},async put(k,r){this.puts++;data.set(k.url,r.clone())}}};
function setup({status=200,headers={},body='ABCD',api=release,redirect,fetchFailure=false}={}){const seen=[],c=cache();const fetcher=async(url,options)=>{seen.push({url,options});if(fetchFailure)throw new Error('private signed url');if(url.startsWith('https://api.github.com/'))return Response.json(url.includes('/tags/')?api:[api]);if(redirect&&url===raw)return new Response(null,{status:302,headers:{Location:redirect}});return new Response(options.method==='HEAD'?null:body,{status,headers:{'Content-Type':'application/octet-stream','Content-Length':String(body?.length??0),...headers}})};return {worker:createWorker({now:()=>Date.parse('2026-11-19T08:00:00Z'),fetcher,cache:c}),seen,c};}
for(const path of ['/assets/'+tag+'/'+file+'?url=https://evil.test','/assets/'+tag+'/%2fetc','/assets/'+tag+'/x.apk','/assets/signed-../'+file,'/other'])assert.equal(parseRoute(host+prefix+path),null);
for(const url of ['http://release-assets.githubusercontent.com/a','https://evil.release-assets.githubusercontent.com/a','https://release-assets.githubusercontent.com.evil.test/a','https://user:pw@release-assets.githubusercontent.com/a','https://127.0.0.1/a','https://github.com/evil/repo'])assert(!trustedRedirect(url,raw));assert(trustedRedirect('https://release-assets.githubusercontent.com/a?secret=opaque',raw));
assert.deepEqual(rangeBounds('bytes=-2',4),[2,3]);assert.deepEqual(rangeBounds('bytes=1-',4),[1,3]);for(const r of ['bytes=4-','bytes=3-1','bytes=0-1,2-3','bytes=-0','bytes=-'])assert.throws(()=>rangeBounds(r,4));
{
 const {worker,c,seen}=setup();let r=await worker.fetch(req('/latest',{headers:{Origin:'https://hifage.com'}}));assert.equal(r.status,200);const j=await r.json();assert.equal(j.tag,tag);assert.equal(j.downloads.length,2);assert(j.downloads.every(d=>d.path.startsWith(prefix+'/assets/')));assert(!JSON.stringify(j).includes('github.com'));await worker.fetch(req('/latest'));assert(c.puts>=2);assert.equal(seen.length,1);assert.equal((await worker.fetch(req('/latest',{headers:{Origin:'https://evil.test'}}))).status,403);assert.equal((await worker.fetch(req('/latest',{method:'POST'}))).status,405);assert.equal((await worker.fetch(req('/latest',{method:'OPTIONS',headers:{Origin:'https://hifage.com'}}))).status,204);
}
{
 const {worker,seen,c}=setup({redirect:'https://release-assets.githubusercontent.com/asset?secret=opaque'});const r=await worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Authorization:'secret',Cookie:'private=1'}}));assert.equal(r.status,200);assert.equal(await r.text(),'ABCD');assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('Location'),null);assert(c.puts>=2);assert(seen.every(s=>s.options.credentials==='omit'));assert(seen.every(s=>!new Headers(s.options.headers).has('Cookie')&&!new Headers(s.options.headers).has('Authorization')));
}
for(const [range,contentRange,body] of [['bytes=1-2','bytes 1-2/4','BC'],['bytes=-2','bytes 2-3/4','CD'],['bytes=2-','bytes 2-3/4','CD']]){const {worker,seen,c}=setup({status:206,headers:{'Content-Range':contentRange},body});const r=await worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Range:range}}));assert.equal(r.status,206);assert.equal(await r.text(),body);assert.equal(r.headers.get('Content-Range'),contentRange);assert(c.puts>=2);assert.equal(new Headers(seen.at(-1).options.headers).get('Range'),range);}
{
 const {worker}=setup();const head=await worker.fetch(req('/assets/'+tag+'/'+file,{method:'HEAD'}));assert.equal(head.status,200);assert.equal(head.headers.get('Content-Length'),'4');assert.equal(await head.text(),'');const invalid=await worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Range:'bytes=999-'}}));assert.equal(invalid.status,416);assert.equal(invalid.headers.get('Content-Range'),'bytes */4');
 const full=await worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Range:'bytes=1-2','If-Range':'"old"'}}));assert.equal(full.status,200);assert.equal(await full.text(),'ABCD');
}
for(const config of [{status:404},{status:500},{redirect:'https://evil.test/a'},{headers:{'Content-Type':'text/html'}},{status:206,headers:{'Content-Range':'bytes 0-1/99'},body:'AB'},{headers:{'Content-Length':'3'}},{headers:{'Content-Encoding':'gzip'}}]){const {worker}=setup(config);const r=await worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Range:'bytes=0-1'}}));assert.equal(r.status,config.status===404?404:502);assert.equal(await r.text(),'');assert.equal(r.headers.get('Location'),null);}
{
 const {worker}=setup({status:416,headers:{'Content-Range':'bytes */4'},body:''});assert.equal((await worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Range:'bytes=0-1'}}))).status,416);
 const bad=setup({api:{...release,assets:release.assets.slice(0,1)}});assert.equal((await bad.worker.fetch(req('/latest'))).status,404);assert.equal(bad.c.puts,0);
 const error=setup({fetchFailure:true});assert.equal((await error.worker.fetch(req('/latest'))).status,502);assert.equal(error.c.puts,0);
 const truncated=setup({body:'AB',headers:{'Content-Length':'4'}});const r=await truncated.worker.fetch(req('/assets/'+tag+'/'+file));await assert.rejects(r.text());assert(truncated.c.puts>=2); // metadata only, never APK bytes
}
console.log('PASS allowlist/CORS/SSRF, exact pair/assets, cached metadata only, no upstream links, GET/HEAD, Range/206/416/If-Range, redirects, no cookies/auth, malformed/errors/truncated streams');
{
 const worker=createWorker({now:()=>Date.parse('2026-11-19T08:00:00Z'),headerTimeout:5,fetcher:async(url,{signal})=>url.startsWith('https://api.github.com/')?Response.json(release):new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('upstream signed secret'))))});
 const r=await worker.fetch(req('/assets/'+tag+'/'+file));assert.equal(r.status,502);assert.equal(await r.text(),'');
}
console.log('PASS bounded header timeout with non-leaking response');
{
 let fixedCount=0;
 globalThis.FixedLengthStream=class extends TransformStream{constructor(size){let n=0;super({transform(chunk,c){n+=chunk.byteLength;if(n>size)throw new Error('overflow');c.enqueue(chunk)},flush(){if(n!==size)throw new Error('truncated')}});fixedCount++;}};
 const good=setup();assert.equal(await(await good.worker.fetch(req('/assets/'+tag+'/'+file))).text(),'ABCD');assert.equal(fixedCount,1);
 const partial=setup({status:206,headers:{'Content-Range':'bytes 0-1/4'},body:'AB'});assert.equal(await(await partial.worker.fetch(req('/assets/'+tag+'/'+file,{headers:{Range:'bytes=0-1'}}))).text(),'AB');
 const short=setup({body:'AB',headers:{'Content-Length':'4'}});await assert.rejects((await short.worker.fetch(req('/assets/'+tag+'/'+file))).text());delete globalThis.FixedLengthStream;
 const denied=createWorker({now:()=>Date.parse('2026-11-19T08:00:00Z'),fetcher:async()=>new Response(null,{status:302,headers:{Location:'https://evil.test/'}})});assert.equal((await denied.fetch(req('/latest'))).status,502);
}
console.log('PASS FixedLengthStream adapter (Node stand-in), partial/full/truncated, explicit API redirect rejection');
{
 const noCache=createWorker({now:()=>Date.parse('2026-11-19T08:00:00Z'),cache:{async match(){throw new Error('cache unavailable')},async put(){}},fetcher:async(url,init)=>{assert(!('cache' in init));return Response.json([release]);}});
 assert.equal((await noCache.fetch(req('/latest'))).status,200);
 const rate=createWorker({now:()=>Date.parse('2026-11-19T08:00:00Z'),fetcher:async()=>new Response('private upstream body',{status:403})});const r=await rate.fetch(req('/latest'));assert.equal(r.status,502);assert.equal(r.headers.get('X-HiFage-Diagnostic'),'api_http_403');assert.equal(await r.text(),'');
}
console.log('PASS old-cache-mode compatibility, optional cache failure and sanitized API diagnosis');
{
 const {worker,c}=setup();
 assert.equal((await worker.fetch(req('/latest'))).headers.get('Cache-Control'),'public, max-age=900');
 assert.equal((await c.match(new Request('https://download.hifage.com/__metadata/v2/fage-go/magicnotice/latest'))).headers.get('Cache-Control'),'public, max-age=900');
 const apk=await worker.fetch(req('/assets/'+tag+'/'+file));
 assert.equal(apk.headers.get('Cache-Control'),'no-store');await apk.text();
 assert.equal((await c.match(new Request('https://download.hifage.com/__metadata/v2/fage-go/magicnotice/tag/'+tag))).headers.get('Cache-Control'),'public, max-age=900');
 const bad=setup({fetchFailure:true});
 assert.equal((await bad.worker.fetch(req('/latest'))).headers.get('Cache-Control'),'no-store');
}
console.log('PASS latest manifest TTL 900s, APK and failures uncached, tag metadata unchanged');
