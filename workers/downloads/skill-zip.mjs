import {SKILL_ARCHIVES} from './skill-archives.mjs';

export function skillZipName(pathname){
 const match=/^\/v2\/assets\/skills\/([a-z0-9]+(?:-[a-z0-9]+)*\.zip)$/.exec(pathname);
 return match&&Object.hasOwn(SKILL_ARCHIVES,match[1])?match[1]:null;
}

async function exactBytes(response,length){
 const encoding=response.headers.get('Content-Encoding');
 if(response.status!==200||encoding&&encoding!=='identity'||response.headers.has('Content-Range')||!response.body)throw new Error('bad upstream');
 const declared=response.headers.get('Content-Length');
 if(declared!==null&&declared!==String(length))throw new Error('bad length');
 const reader=response.body.getReader(),bytes=new Uint8Array(length);
 let offset=0;
 try{
  for(;;){
   const {value,done}=await reader.read();
   if(done)break;
   if(offset+value.byteLength>length)throw new Error('bad length');
   bytes.set(value,offset);offset+=value.byteLength;
  }
 }catch(e){await reader.cancel().catch(()=>{});throw e;}
 if(offset!==length)throw new Error('bad length');
 return bytes;
}

export async function transferSkillZip(request,file,{origin,fetcher,cors,error,rangeBounds}){
 const entry=SKILL_ARCHIVES[file],size=entry?.bytes;
 if(!Number.isSafeInteger(size)||size<=0||size>2*1024*1024)return error(502,'skill_manifest');
 const etag='"'+entry.sha256+'"';
 const range=request.headers.get('Range'),ifRange=request.headers.get('If-Range');
 // RFC 9110: Range applies to GET, and a nonmatching If-Range receives the full file.
 let bounds=null;
 if(request.method==='GET'&&range&&(!ifRange||ifRange===etag)){
  try{bounds=rangeBounds(range,size);}
  catch{return new Response(null,{status:416,headers:{...cors,'Cache-Control':'no-store','Accept-Ranges':'bytes','Content-Range':`bytes */${size}`}});}
 }
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 let upstream;
 try{
  upstream=await fetcher(origin+'/downloads/skills/'+file,{
   method:'GET',redirect:'manual',credentials:'omit',
   headers:{Accept:'application/zip, application/octet-stream','Accept-Encoding':'identity'},
   signal:controller.signal
  });
  const bytes=await exactBytes(upstream,size);
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(digest!==entry.sha256)throw new Error('bad digest');
  const headers=new Headers({...cors,'Cache-Control':'no-store','Content-Type':'application/zip','Content-Disposition':`attachment; filename="${file}"`,'Accept-Ranges':'bytes',ETag:etag});
  if(bounds){
   const [start,end]=bounds;
   headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
   headers.set('Content-Length',String(end-start+1));
   return new Response(bytes.subarray(start,end+1),{status:206,headers});
  }
  headers.set('Content-Length',String(size));
  return new Response(request.method==='HEAD'?null:bytes,{headers});
 }catch{
  controller.abort();
  await upstream?.body?.cancel().catch(()=>{});
  return error(502,'skill_upstream');
 }finally{clearTimeout(timer);}
}
