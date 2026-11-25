import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createDurableWorker} from './index.mjs';
import {SKILL_ARCHIVES} from './skill-archives.mjs';

const liveOrigin='https://hifage.com', worker='https://download.hifage.com';
const site=new URL('../../site/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('skill-archives.json',site),'utf8'));
for(const {id,bytes,sha256} of manifest)assert.deepEqual(SKILL_ARCHIVES[id+'.zip'],{bytes,sha256});
const archives=new Map(Object.entries(SKILL_ARCHIVES).map(([file,{bytes,sha256}])=>{
 const expected=readFileSync(new URL('public/downloads/skills/'+file,site));
 assert.equal(expected.length,bytes);assert.equal(createHash('sha256').update(expected).digest('hex'),sha256);
 return [file,expected];
}));
const route=(file)=>'/v2/assets/skills/'+file;
const hasNoDO={RELEASE_SNAPSHOTS:{idFromName(){throw new Error('ZIP relay must not depend on release metadata');}}};
let called=0,mode='valid';
const app=createDurableWorker({fetcher:async(url,init)=>{
 ++called;
 assert.deepEqual({method:init.method,redirect:init.redirect,credentials:init.credentials}, {method:'GET',redirect:'manual',credentials:'omit'});
 assert.equal(Object.keys(init.headers).some(h=>['Authorization','Cookie','Range','If-Range'].includes(h)),false);
 assert.equal(init.headers['Accept-Encoding'],'identity');
 assert(url.startsWith(liveOrigin+'/downloads/skills/'));
 const path=url.slice((liveOrigin+'/downloads/skills/').length);
 assert(archives.has(path),'Upstream is always a pinned archive');
 const bytes=archives.get(path).slice();
 if(mode==='redirect')return new Response(null,{status:302,headers:{Location:'https://untrusted.example/fake.zip'}});
 if(mode==='404')return new Response(null,{status:404});
 if(mode==='throw')throw new Error('upstream unavailable');
 if(mode==='html')return new Response('<html>not an archive</html>',{headers:{'Content-Type':'text/html'}});
 if(mode==='oversized')return new Response(Buffer.concat([bytes,Buffer.from([0])]));
 if(mode==='short')return new Response(bytes.subarray(0,-1));
 if(mode==='partial')return new Response(bytes,{status:206,headers:{'Content-Range':`bytes 0-${bytes.length-1}/${bytes.length}`}});
 if(mode==='encoded')return new Response(bytes,{headers:{'Content-Encoding':'gzip'}});
 if(mode==='declared-mismatch')return new Response(bytes,{headers:{'Content-Length':String(bytes.length+1)}});
 if(mode==='altered')bytes[bytes.length-1]^=255;
 return new Response(bytes,{headers:{'Content-Length':String(bytes.length),'Set-Cookie':'upstream=hidden','Location':'https://example.test/irrelevant'}});
}});
const request=(path,opts={})=>app.fetch(new Request(worker+path,opts),hasNoDO);
for(const [file,bytes] of archives){
 const reply=await request(route(file),{headers:{Origin:liveOrigin,Cookie:'sid=private',Authorization:'not-forwarded'}});
 assert.equal(reply.status,200);assert.equal(reply.headers.get('Content-Type'),'application/zip');
 assert.equal(reply.headers.get('Content-Disposition'),`attachment; filename="${file}"`);
 assert.equal(reply.headers.get('Access-Control-Allow-Origin'),liveOrigin);
 assert.equal(reply.headers.get('Content-Length'),String(bytes.length));
 assert.equal(reply.headers.get('Cache-Control'),'no-store');
 assert.equal(reply.headers.get('Set-Cookie'),null);assert.equal(reply.headers.get('Location'),null);
 assert.deepEqual(Buffer.from(await reply.arrayBuffer()),bytes);
}
const file='dot-work-foundation.zip',filePath=route(file),zip=archives.get(file),size=zip.length;
const etag='"'+SKILL_ARCHIVES[file].sha256+'"';
const head=await request(filePath,{method:'HEAD',headers:{Range:'bytes=0-15'}});
assert.equal(head.status,200);assert.equal(head.body,null);assert.equal(head.headers.get('Content-Length'),String(size));assert.equal(head.headers.get('ETag'),etag);
const range=await request(filePath,{headers:{Range:'bytes=0-15','If-Range':etag}});
assert.equal(range.status,206);assert.equal(range.headers.get('Content-Length'),'16');
assert.equal(range.headers.get('Content-Range'),`bytes 0-15/${size}`);
assert.deepEqual(Buffer.from(await range.arrayBuffer()),zip.subarray(0,16));
const suffix=await request(filePath,{headers:{Range:'bytes=-16'}});
assert.equal(suffix.status,206);assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),zip.subarray(-16));
const outdated=await request(filePath,{headers:{Range:'bytes=0-15','If-Range':'"outdated"'}});
assert.equal(outdated.status,200);assert.deepEqual(Buffer.from(await outdated.arrayBuffer()),zip);
const before=called;
const preflight=await request(filePath,{method:'OPTIONS',headers:{Origin:liveOrigin,'Access-Control-Request-Method':'GET'}});
assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),liveOrigin);
assert.equal((await request(filePath,{method:'POST'})).status,405);
assert.equal((await request(filePath,{headers:{Origin:'https://example.test'}})).status,403);
for(const path of [
 route('not-a-published-skill.zip'),route(file+'?url=https://example.test/evil.zip'),route(file+'/'),route('%64ot-work-foundation.zip'),
 route('dot-work-foundation.ZIP'),route('prefix/'+file),route('dot-work-foundation/SKILL.md'),route('foo%2f'+file),
 '/downloads/skills/'+file,'/v2/assets/skills/fage-go/example/release/321'
])assert.equal((await request(path)).status,404,path);
for(const r of [`bytes=${size}-`,'bytes=-0','bytes=0-1,4-5']){
 const invalid=await request(filePath,{headers:{Range:r}});
 assert.equal(invalid.status,416);assert.equal(invalid.headers.get('Content-Range'),`bytes */${size}`);
}
assert.equal(called,before,'bad paths/methods/ranges must not trigger an upstream fetch');
for(const bad of ['redirect','404','throw','html','oversized','short','partial','encoded','declared-mismatch','altered']){
 mode=bad;const start=called,res=await request(filePath);
 assert.equal(res.status,502,bad);assert.equal(res.headers.get('X-HiFage-Diagnostic'),'skill_upstream');
 assert.equal(res.headers.get('Location'),null);assert.equal(await res.text(),'');assert.equal(called,start+1);
}
console.log(`PASS ${archives.size} exact Skill ZIPs through Worker entry point, attachment/HEAD/Range, path allowlist and CORS, upstream failures closed`);
