import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectRelease,safeAsset,fetchLatestRelease,fetchTransferRelease,initReleaseWidget} from '../public/project-releases.js';
const repo='fage-go/magicnotice';
const asset=(lang,tag)=>({name:`cicada_${lang}_release_v1680-signed.apk`,size:100,state:'uploaded',browser_download_url:`https://github.com/${repo}/releases/download/${tag}/cicada_${lang}_release_v1680-signed.apk`});
const release=(tag,date)=>({tag_name:tag,name:'Official '+tag,published_at:date,draft:false,prerelease:true,assets:[asset('zh',tag),asset('en',tag)]});
const old=release('signed-old','2026-11-18T00:00:00Z'),fresh=release('signed-new','2026-11-19T00:00:00Z');
assert.equal(selectRelease([old,fresh],repo,'magicnotice-signed').tag,'signed-new');
for(const bad of [{...fresh,draft:true},{...fresh,assets:fresh.assets.slice(0,1)},{...fresh,published_at:null},{...fresh,assets:fresh.assets.map(a=>({...a,state:'new'}))}])assert.equal(selectRelease([old,bad],repo,'magicnotice-signed').tag,'signed-old');
for(const url of ['javascript:alert(1)',fresh.assets[0].browser_download_url.replace(repo,'evil/repo'),fresh.assets[0].browser_download_url.replace('signed-new','signed-old'),fresh.assets[0].browser_download_url+'?x=1'])assert(!safeAsset({...fresh.assets[0],browser_download_url:url},repo,fresh.tag_name));
assert.equal(selectRelease([{...fresh,assets:[fresh.assets[0]]}],repo).downloads.length,1);
assert.equal(selectRelease([],repo),null);
const response=(rows,next=false)=>({ok:true,json:async()=>rows,headers:{get:()=>next?'<https://api.github.com/next>; rel="next"':null}});
let calls=0;assert.equal((await fetchLatestRelease(repo,'magicnotice-signed',{fetcher:async()=>response(calls++?[fresh]:[old],calls===1)})).tag,'signed-new');assert.equal(calls,2);
await assert.rejects(fetchLatestRelease(repo,'uploaded',{fetcher:async()=>({ok:false})}));
await assert.rejects(fetchLatestRelease(repo,'uploaded',{maxPages:1,fetcher:async()=>response([old],true)}));
await assert.rejects(fetchLatestRelease(repo,'uploaded',{timeoutMs:5,fetcher:async(u,{signal})=>new Promise((res,rej)=>signal.addEventListener('abort',()=>rej(new Error('timeout'))))}));
class El{constructor(){this.hidden=false;this.children=[];this.textContent='';}replaceChildren(){this.children=[]}append(x){this.children.push(x)}}
globalThis.document={createElement:()=>new El()};
const els={};const widget={dataset:{repo,policy:'magicnotice-signed'},querySelector:s=>els[s]??=new El()};
await initReleaseWidget(widget,{fetcher:async()=>response([fresh])});assert(!els['[data-release-result]'].hidden);assert.equal(els['[data-release-links]'].children.length,2);
await initReleaseWidget(widget,{fetcher:async()=>({ok:false})});assert(els['[data-release-result]'].hidden);assert.equal(els['[data-release-links]'].children.length,0);assert(els['[data-release-status]'].textContent.includes('暂时无法'));
let finish;const pending=initReleaseWidget(widget,{fetcher:()=>new Promise(resolve=>finish=resolve)});await initReleaseWidget(widget,{fetcher:async()=>response([fresh])});finish(response([old]));await pending;assert.equal(els['[data-release-name]'].textContent,fresh.name);
const fixture=process.argv[2];if(fixture){const selected=selectRelease(JSON.parse(fs.readFileSync(fixture,'utf8')),repo,'magicnotice-signed');assert(selected);console.log('LIVE API fixture:',selected.tag,selected.publishedAt,selected.downloads);}
const page=fs.readFileSync(new URL('../src/pages/projects/magicnotice.astro',import.meta.url),'utf8');assert(page.includes('<ProjectRelease project={projects.magicnotice}/>'));
console.log('PASS published_at ordering, repeated filenames, prerelease, complete signed pair, exact asset URLs, generic assets, pagination, timeout/403, fallback, stale callbacks and page wiring');

for(const size of [undefined,NaN,Infinity,0,-1,'100'])assert(!safeAsset({...fresh.assets[0],size},repo,fresh.tag_name));
assert.equal(selectRelease([{...fresh,name:{},assets:fresh.assets.map(a=>({...a,label:{}}))}],repo).name,fresh.tag_name);
assert.equal(selectRelease([{...fresh,assets:[fresh.assets[0],{...fresh.assets[1],name:'cicada_en_release_v1681-signed.apk',browser_download_url:fresh.assets[1].browser_download_url.replace('v1680','v1681')}]}],repo,'magicnotice-signed'),null);
for(const file of fs.readdirSync(new URL('../src/pages/projects/',import.meta.url)))if(file.endsWith('.astro'))assert(fs.readFileSync(new URL('../src/pages/projects/'+file,import.meta.url),'utf8').includes('<ProjectRelease '));
console.log('PASS malformed fields, same-version signed pairs and all current project pages wired');

const dir='/v1/projects/magicnotice/assets/signed-new/';
const manifest={name:'Cloud release',tag:'signed-new',publishedAt:'2026-11-19T00:00:00Z',prerelease:true,downloads:['en','zh'].map(lang=>({path:dir+`cicada_${lang}_release_v1680-signed.apk`}))};
const mirror='https://download.hifage.com';
const call=info=>({fetcher:async (url,opts)=>{assert.equal(url,mirror+'/v1/projects/magicnotice/latest');assert.equal(opts.redirect,'error');return {ok:true,json:async()=>info}}});
assert.equal((await fetchTransferRelease('magicnotice',call(manifest))).downloads[0].url,mirror+dir+'cicada_zh_release_v1680-signed.apk');
for(const invalid of ['https://evil.invalid/file.apk','//evil.invalid/file.apk',dir+'../cicada_en_release_v1680-signed.apk',dir+'cicada_en_release_v1681-signed.apk',dir+'cicada_en_release_v1680-signed.apk?fake=1',dir+'cicada_zh_release_v1680-signed.apk']){
 await assert.rejects(fetchTransferRelease('magicnotice',call({...manifest,downloads:[{path:invalid},manifest.downloads[1]]})));
}
await assert.rejects(fetchTransferRelease('other',call(manifest)));
assert.equal(await fetchTransferRelease('magicnotice',{fetcher:async()=>({status:404,ok:false})}),null);
const cfEls={};const cfWidget={dataset:{repo,transfer:'magicnotice'},querySelector:s=>cfEls[s]??=new El()};
cfWidget.querySelector('[data-release-retry]').querySelector=()=>({onclick:null});
await initReleaseWidget(cfWidget,call(manifest));assert.equal(cfEls['[data-release-links]'].children.length,2);assert(cfEls['[data-release-links]'].children.every(a=>a.href.startsWith(mirror+'/')));
await initReleaseWidget(cfWidget,{fetcher:async()=>({status:502,ok:false})});assert(cfEls['[data-release-result]'].hidden);assert.equal(cfEls['[data-release-links]'].children.length,0);assert(!cfEls['[data-release-retry]'].hidden);assert(!cfEls['[data-release-status]'].textContent.includes('GitHub'));
console.log('PASS download relay same-origin path validation, paired APKs, no GitHub download fallback, retry UI');
