import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const home=readFileSync(root+'index.html','utf8'),skills=readFileSync(root+'skills/index.html','utf8');
assert(home.includes('嗨，我是发哥。'));assert(home.includes('微信搜索 「发哥聊一聊AI」'));
assert.equal((home.match(/data-note=/g)||[]).length,5);assert(home.includes('resource-modal'));
assert(skills.includes('第一批资源正在整理'));
assert.equal(createHash('sha256').update(readFileSync(root+'assets/wechat-qr.jpg')).digest('hex'),'aab99f7dc94bcf1bd866159d4bd6cd4e4fd4278cfe35a45636206c8c6aae83e7');
const project=readFileSync(root+'projects/magicnotice/index.html','utf8');
const base=(process.env.SITE_BASE||'/').replace(/\/$/,'')+'/';
for(const [name,html]of [['index.html',home],['skills/index.html',skills],['projects/magicnotice/index.html',project]]){
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  let url=m[1];if(/^(data:|https?:|#)/.test(url))continue;
  if(url.startsWith(base))url=url.slice(base.length);
  else if(url.startsWith('./'))url=url.slice(2);
  else throw new Error('Unexpected base URL: '+url);
  url=url.split('#')[0];if(!url)continue;assert(existsSync(root+url),name+': missing '+url);
 }
}
assert(project.includes('通知了 / MagicNotice'));assert(project.includes('源码公开 · 非商业许可'));assert(project.includes('https://github.com/fage-go/magicnotice/releases'));assert(!project.includes('.apk'));
const content=readFileSync(root+'content.js','utf8');assert.equal((content.match(/image:/g)||[]).length,5);
console.log('PASS generated home, Skills empty state, local URLs, 5 poses, exact original QR; base='+base);
