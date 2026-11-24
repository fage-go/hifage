import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {ReleaseSnapshot,createDurableWorker,assetPath,validateCatalog} from './index.mjs';
import {BOOTSTRAP} from './release-bootstrap.mjs';

const repo='fage-go/magicnotice', host='https://download.hifage.com';
const goodTag='signed-first', goodId=41, title='Stable fixture';
const start=Date.parse('2026-11-24T10:00:00Z');
let clock=start, github=0, transfer=0, run, cacheReads=0;
const at=()=>clock;
function release(tag,published,base=goodId,name=title){
 return {tag_name:tag,name,draft:false,prerelease:true,published_at:new Date(published).toISOString(),assets:['zh','en'].map((language,i)=>{
  const name='cicada_'+language+'_release_v1700-signed.apk';
  return {id:base+i,name,size:4,state:'uploaded',browser_download_url:`https://github.com/${repo}/releases/download/${tag}/${name}`};
 })};
}
const first=release(goodTag,start-50*60*1000);
run=async()=>Response.json([first]);
const fetcher=async(url,options)=>{
 if(url.startsWith('https://api.github.com/')){
  github++;
  assert(url.startsWith('https://api.github.com/repos/'+repo+'/releases?'));
  assert.equal(options.redirect,'manual');
  return run(url);
 }
 transfer++;
 assert(url.startsWith('https://github.com/'+repo+'/releases/download/'));
 if(options.headers.get('Range')){
  return new Response(options.method==='HEAD'?null:'BC',{status:206,headers:{'Content-Length':'2','Content-Type':'application/octet-stream','Content-Range':'bytes 1-2/4'}});
 }
 return new Response(options.method==='HEAD'?null:'ABCD',{headers:{'Content-Length':'4','Content-Type':'application/octet-stream'}});
};
const databases=new Map();
let sessions=new Map();
let bootstrap={};
function objectFor(id){
 if(!databases.has(id))databases.set(id,new DatabaseSync(':memory:'));
 const db=databases.get(id);
 if(!sessions.has(id)){
  const sql={exec(q,...args){const stmt=db.prepare(q),rows=/^SELECT/.test(q)?stmt.all(...args):(stmt.run(...args),[]);return {toArray:()=>rows};}};
  const transactionSync=fn=>{db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}};
  sessions.set(id,new ReleaseSnapshot({storage:{sql,transactionSync}},null,{fetcher,now:at,bootstrap}));
 }
 return sessions.get(id);
}
const env={RELEASE_SNAPSHOTS:{idFromName(name){assert.equal(name,repo);return name;},get(id){return {fetch(url,init){return objectFor(id).fetch(new Request(url,init));}};}}};
const cache={match(){cacheReads++;throw Error('no edge cache for present slots');},put(){throw Error('no edge cache for present slots');}};
const edgeA=createDurableWorker({fetcher,now:at,cache}), edgeB=createDurableWorker({fetcher,now:at,cache});
const path='/v2/releases?repo='+encodeURIComponent('https://github.com/FAge-Go/MagicNotice/');
const get=(edge=edgeA,p=path,options,customEnv=env)=>edge.fetch(new Request(host+p,options),customEnv);
const cron=(edge=edgeA)=>edge.scheduled({cron:'*/15 * * * *'},env);
const latest=async()=>{const r=await get();assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'no-store');return r.json();};

assert.equal((await get()).status,503);
assert.equal(github,0);
assert.equal((await get(edgeA,'/snapshot?repo='+repo,{method:'POST'})).status,404);
assert.equal((await get(edgeA,path,{method:'POST'})).status,405);
assert.equal((await get(edgeA,path,{headers:{Origin:'https://third-party.test'}})).status,403);
assert.equal((await get(edgeA,path,{},{})).status,503);
await edgeA.scheduled({cron:'* * * * *'},env);assert.equal(github,0);
await cron();assert.equal(github,1);
const old=await latest();assert.equal(old.tag,goodTag);assert.equal(old.stale,false);
assert.deepEqual(await(await get(edgeB)).json(),old);
const v1=await get(edgeA,'/v1/projects/magicnotice/latest');assert.equal(v1.status,200);assert.equal(v1.headers.get('Cache-Control'),'no-store');assert.equal((await v1.json()).tag,goodTag);
assert.equal(github,1);assert.equal(cacheReads,0);
const fixtureAsset=assetPath(repo,goodTag,goodId);
assert.equal(await(await get(edgeA,fixtureAsset)).text(),'ABCD');
assert.equal((await get(edgeA,fixtureAsset,{method:'HEAD',headers:{Range:'bytes=1-2'}})).status,206);
assert.equal((await get(edgeA,fixtureAsset,{headers:{Range:'bytes=88-'}})).status,416);
assert.equal((await get(edgeA,assetPath(repo,goodTag,999))).status,404);
assert.equal(github,1);assert.equal(transfer,2);

const newer=release('signed-next',start+1000,61,'Next fixture');
clock+=15*60*1000;
let unblock, begun;const started=new Promise(r=>begun=r);
run=async()=>{begun();await new Promise(r=>unblock=r);return Response.json([first,newer]);};
const a=cron();await started;const b=cron(edgeB);
assert.deepEqual(await latest(),old,'readers see last committed version while new request is open');
unblock();await Promise.all([a,b]);assert.equal(github,2,'concurrent Cron calls are single-flight');
assert.equal((await latest()).tag,'signed-next');
assert.equal((await(await get(edgeB)).json()).tag,'signed-next');
assert.equal(await(await get(edgeB,fixtureAsset)).text(),'ABCD','old QR/tag link remains exact');

clock+=30*60*1000;
for(const fixture of [
 async()=>new Response(null,{status:403}),async()=>new Response(null,{status:429}),
 async()=>new Response(null,{status:404}),async()=>new Response(null,{status:500}),
 async()=>{throw new TypeError('transient signed URL should never leak');},
 async()=>new Response('not json'),async()=>Response.json({unexpected:true}),async()=>Response.json([]),
 async()=>Response.json([first]),
 async()=>Response.json([{...newer,assets:newer.assets.slice(0,1)}]),
 async()=>Response.json([release('signed-ambiguous',start+1000,81),newer]),
 async()=>Response.json([release(newer.tag_name,start+1000,101)]),
]){
 run=fixture;await assert.rejects(cron);
 const v=await latest();assert.equal(v.tag,newer.tag_name);assert.equal(v.stale,true);
 assert.equal(v.checkedAt,new Date(start+15*60*1000).toISOString());
 assert.equal(v.downloads[0].id,61);
}
run=async()=>Response.json([newer]);
await cron();
assert.equal((await latest()).stale,false);
const validatedBootstrap=validateCatalog(BOOTSTRAP[repo],repo,'magicnotice-signed',start,{durable:true});
assert.equal(validatedBootstrap.tag,'signed-df58525f4d2f');
bootstrap=BOOTSTRAP;
sessions=new Map();clock+=400*86400000;
const restored=await latest();assert.equal(restored.tag,newer.tag_name);assert.equal(restored.stale,true,'never expires');
assert.equal(await(await get(edgeB,fixtureAsset)).text(),'ABCD');
assert.equal(cacheReads,0,'no Cache API for latest or durable old tags');
const before=github;
databases.clear();sessions.clear();
const seeded=await latest();assert.equal(seeded.tag,BOOTSTRAP[repo].tag);
assert.equal(seeded.stale,true);assert.equal(github,before,'bootstrapped read never calls GitHub');
console.log('PASS real SQLite storage across object restarts; canonical no-store reads on two edge instances; Cron-only coalesced refresh; atomic promote; failed/partial/equal/older/changed-ID candidates preserve last-good; no TTL; seed does not overwrite; exact old tag, Range and v1 preserved');
