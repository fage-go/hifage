// Explicit allowlist: callers cannot turn arbitrary names into downloads.
// Legacy export name; this registry also accepts non-pixel Skills.
export const pixelSkills = [
 {id:'pixel-character-master',title:'像素角色母图',description:'按指定朝向制作角色母图，统一角色外观与像素风格。'},
 {id:'pixel-character-spritesheet',title:'像素角色精灵表',description:'以母图为基础，按指定方向、动作和时序制作精灵表。'},
 {id:'pixel-character-rig-align',title:'像素角色骨骼对齐',description:'校验角色分件与武器绑定，定位骨骼对齐问题。'},
 {id:'pixel-character-workflow',title:'像素角色制作工作流',description:'从已有素材所在阶段开始，串联母图、精灵表与骨骼对齐。'},
 {id:'dot-work-foundation',title:'Dot 工作底座',description:'小事直接做；复杂任务写清目标、交接与验收，让换人、换设备、隔天续做都有据可查。',kind:'个人助理 · Skill'}
];
const allowed = new Set(pixelSkills.map(skill=>skill.id));
export function skillDownload(id){
 if(!allowed.has(id))throw new Error('Unknown Skill download: '+id);
 return `https://download.hifage.com/v2/assets/skills/${id}.zip`;
}
// The canonical archive also remains available at its original static site URL.
export function skillArchivePath(id,base='./'){
 if(!allowed.has(id))throw new Error('Unknown Skill download: '+id);
 if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)&&base!=='./')throw new Error('Invalid site base');
 return `${base}downloads/skills/${id}.zip`;
}
