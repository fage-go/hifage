import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {safeAsset} from '../public/project-releases.js';
import {projects} from '../src/data/projects.js';

const downloadOrigin='https://download.hifage.com';
const catalogOrigin='https://hifage.com';
const registry=Object.fromEntries(Object.values(projects).filter(p=>p.transfer).map(p=>[p.repo,p.policy??'uploaded']));
const root=fileURLToPath(new URL('../public/release-catalog/',import.meta.url));
const repoId=/^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9_.-]*$/;
const order=(a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt);
function assetPath(repo,tag,id){return downloadOrigin+'/v2/assets/'+repo+'/'+encodeURIComponent(tag)+'/'+id;}
function normalize(repo,release,checkedAt,policy){
 if(!repoId.test(repo)||!release||release.draft!==false||typeof release.tag_name!=='string'||!release.tag_name||!Number.isFinite(Date.parse(release.published_at))||!Array.isArray(release.assets))return null;
 const tag=release.tag_name;
 let assets=release.assets.filter(a=>safeAsset(a,repo,tag)&&Number.isSafeInteger(a.id)&&a.id>0&&Number.isSafeInteger(a.size));
 if(policy==='magicnotice-signed'){
  if(!/^signed-[A-Za-z0-9_-]{1,80}$/.test(tag))return null;
  const zh=assets.find(a=>/^cicada_zh_release_v[0-9]{1,12}-signed\.apk$/.test(a.name)&&assets.some(b=>b.name===a.name.replace('cicada_zh_','cicada_en_')));
  const en=zh&&assets.find(a=>a.name===zh.name.replace('cicada_zh_','cicada_en_'));
  if(!zh||!en)return null;
  assets=[zh,en];
 }
 if(!assets.length||new Set(assets.map(a=>a.id)).size!==assets.length)return null;
 return {repo,name:typeof release.name==='string'&&release.name.trim()?release.name.trim():tag,tag,publishedAt:release.published_at,prerelease:release.prerelease===true,checkedAt,stale:false,downloads:assets.map(a=>({id:a.id,label:policy==='magicnotice-signed'?(a.name.startsWith('cicada_zh_')?'下载中文版 APK':'下载英文版 APK'):typeof a.label==='string'&&a.label.trim()?a.label.trim():a.name,name:a.name,size:a.size,originalUrl:a.browser_download_url,downloadUrl:assetPath(repo,tag,a.id)}))};
}
export function makeCatalog(repo,policy,rows,checkedAt=new Date().toISOString()){
 if(!Array.isArray(rows))throw new Error('expected release list');
 return rows.map(x=>normalize(repo,x,checkedAt,policy)).filter(Boolean).sort(order)[0]??null;
}
export function verifyCatalog(repo,policy,data){
 if(!data||data.repo!==repo||typeof data.name!=='string'||typeof data.checkedAt!=='string'||!Number.isFinite(Date.parse(data.checkedAt))||Date.parse(data.checkedAt)>Date.now()+300000||!Array.isArray(data.downloads))return null;
 const rows=data.downloads.map(d=>d&&({id:d.id,label:d.label,name:d.name,size:d.size,state:'uploaded',browser_download_url:d.originalUrl}));
 const clean=normalize(repo,{draft:false,tag_name:data.tag,name:data.name,published_at:data.publishedAt,prerelease:data.prerelease,assets:rows},data.checkedAt,policy);
 if(!clean||clean.downloads.length!==data.downloads.length||!clean.downloads.every(x=>data.downloads.some(d=>d?.id===x.id&&d.downloadUrl===x.downloadUrl)))return null;
 return clean;
}
async function fetchJson(url,options={}){
 const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000),...options});
 if(!r.ok)throw new Error('HTTP '+r.status);
 return r;
}
async function fromGithub(repo,policy,token){
 const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'HiFage-release-catalog',...(token?{Authorization:'Bearer '+token}:{})};
 const rows=[];
 for(let p=1;p<=5;p++){
  const r=await fetchJson('https://api.github.com/repos/'+repo+'/releases?per_page=100&page='+p,{headers});
  const page=await r.json();if(!Array.isArray(page))throw new Error('unexpected response');
  rows.push(...page);if(!/rel="next"/.test(r.headers.get('Link')??''))return makeCatalog(repo,policy,rows);
 }
 throw new Error('pagination incomplete');
}
async function generate(){
 for(const [repo,policy] of Object.entries(registry)){
  const file=join(root,repo+'.json');let next;
  if(process.argv[2])next=makeCatalog(repo,policy,JSON.parse(await readFile(process.argv[2],'utf8')));
  else{
   try{next=await fromGithub(repo,policy,process.env.GITHUB_TOKEN);if(!next)throw new Error('no eligible release');}
   catch(e){
    // Only on a confirmed successful previous publish; never redate preserved fallback.
    console.warn('Preserving previous catalog for '+repo+': '+e.message);
    try{const r=await fetchJson(catalogOrigin+'/release-catalog/'+repo+'.json');next=verifyCatalog(repo,policy,await r.json());}catch{}
    if(!next)next=verifyCatalog(repo,policy,JSON.parse(await readFile(file,'utf8')));
   }
  }
  if(!verifyCatalog(repo,policy,next))throw new Error('No verified catalog for '+repo);
  await mkdir(dirname(file),{recursive:true});await writeFile(file+'.tmp',JSON.stringify(next,null,2)+'\n');await rename(file+'.tmp',file);
  console.log(repo,next.tag,next.downloads.length,'published files, checked',next.checkedAt);
 }
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])await generate();
