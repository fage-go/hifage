import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {pixelSkills,skillDownload} from '../public/skill-catalog.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const path=root+'skill-archives.json';
assert(existsSync(path),'Real Skill ZIPs and verified skill-archives.json are required. Do not publish placeholder downloads.');
const records=JSON.parse(readFileSync(path,'utf8'));
assert.equal(records.length,pixelSkills.length);
for(const skill of pixelSkills){
 const record=records.find(item=>item.id===skill.id);assert(record,'Missing verified archive record: '+skill.id);
 const file=root+'public/'+skillDownload(skill.id,'/').slice(1);assert(existsSync(file),'Missing actual ZIP: '+skill.id);
 const bytes=readFileSync(file);assert.equal(bytes.readUInt32LE(0),0x04034b50,'Not a ZIP: '+skill.id);
 assert.equal(bytes.length,record.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
 assert(record.entries?.some(name=>/(^|\/)SKILL\.md$/.test(name)),'No SKILL.md in verified archive');
}
console.log('PASS four real allowlisted Skill ZIPs match verified lengths, SHA256, and entry records.');
