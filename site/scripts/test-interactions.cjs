const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El{constructor(tag='div'){this.tag=tag;this.handlers={};this.queries={};this.children=[];this.attrs={};this.dataset={};this.isConnected=true;this.hidden=false;this.disabled=false;this.style={setProperty(){},removeProperty(){}};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};this.rect={left:200,top:180,right:320,bottom:320,width:120,height:140};}addEventListener(t,f){this.handlers[t]=f;}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}replaceChildren(){this.children=[];}append(...e){this.children.push(...e);}contains(e){return this===e||this.children.some(c=>c.contains?.(e));}getBoundingClientRect(){return this.rect;}querySelector(s){return this.queries[s]??=new El('button');}showModal(){this.open=true;}close(){this.open=false;this.handlers.close();}focus(){this.focused=true;document.activeElement=this;}}
const els={},buttons=Array.from({length:5},()=>new El('button')),headline=new El(),intro=new El();let now=10000;class Clock extends Date{static now(){return now;}}
const reduced={matches:false,addEventListener(){}},window={innerWidth:1280,innerHeight:800,handlers:{},addEventListener(t,f){this.handlers[t]=f;}};
const document={body:new El(),activeElement:null,getElementById:id=>els[id]??=new El(),querySelector:s=>s==='.headline-visual'?headline:intro,querySelectorAll:()=>buttons,createElement:tag=>new El(tag)};
const modal=document.getElementById('resource-modal'),workspace=new El(),clip=new El();workspace.rect={left:0,top:0,right:1280,bottom:800,width:1280,height:800};clip.rect=workspace.rect;modal.queries['.finder-workspace']=workspace;modal.queries['.finder-list']=clip;
const bubble=document.getElementById('finder-detail-window');bubble.offsetWidth=310;bubble.offsetHeight=220;bubble.rect={left:0,top:0,right:310,bottom:220,width:310,height:220};bubble.append(document.getElementById('finder-detail'),document.getElementById('finder-detail-title'));
const context=vm.createContext({document,window,Image:class{},matchMedia:()=>reduced,setTimeout:()=>assert.fail('No opening delay'),clearTimeout(){},setInterval(){},clearInterval(){},Intl,Date:Clock});
for(const file of ['content.js','finder-data.js','popover-position.js','character.js','desk.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../public/'+file,'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,''),context);
const list=els['finder-items'],detail=els['finder-detail'],main=els['finder-main-window'],close=els['finder-back'];function escape(){let stopped=false;modal.handlers.cancel({preventDefault(){stopped=true;}});if(!stopped)modal.close();return stopped;}
for(let i=0;i<5;i++){
 buttons[i].handlers.click();assert(modal.open);assert.equal(list.children.length,i===0?0:1);assert(bubble.hidden);
 if(i){const entry=list.children[0].children[0],before=JSON.stringify(main.rect);entry.handlers.click();assert(!bubble.hidden);assert.equal(bubble.dataset.side,'right');assert.equal(JSON.stringify(main.rect),before);assert.equal(document.activeElement,els['finder-detail-title']);entry.handlers.click();assert(bubble.hidden);assert(entry.focused);entry.handlers.click();close.handlers.click();assert(bubble.hidden);assert(modal.open);}
 modal.querySelector('.finder-close').handlers.click();assert(buttons[i].focused);
}
buttons[4].handlers.click();let entry=list.children[0].children[0];entry.handlers.click();assert(!detail.children.some(n=>n.tag==='img'));const actions=detail.children.find(n=>n.className==='finder-actions');assert.equal(actions.children[1].href,'https://github.com/fage-go/magicnotice/releases');assert.equal(actions.children.length,3);assert(escape());assert(modal.open);assert(entry.focused);assert(!escape());assert(!modal.open);
window.innerWidth=390;window.innerHeight=844;buttons[4].handlers.click();entry=list.children[0].children[0];entry.rect={left:210,top:600,right:320,bottom:740,width:110,height:140};entry.handlers.click();assert.equal(bubble.dataset.side,'top');assert(parseFloat(bubble.style.left)>=12);assert(parseFloat(bubble.style.left)+310<=378);assert(!main.inert);window.handlers.resize();assert(!bubble.hidden);
modal.handlers.click({target:main});assert(bubble.hidden);assert(modal.open);entry.handlers.click();els['finder-categories'].children[0].handlers.click();assert(bubble.hidden);assert.equal(list.children.length,0);
els['finder-categories'].children[4].handlers.click();entry=list.children[0].children[0];entry.handlers.click();entry.rect={left:200,top:-300,right:300,bottom:-100,width:100,height:200};modal.handlers.scroll();assert(bubble.hidden);assert(modal.open);
reduced.matches=true;els['finder-categories'].children[1].handlers.click();list.children[0].children[0].handlers.click();assert(detail.children.some(n=>n.src==='./assets/wechat-qr.jpg'));modal.close();
const drawer=els['character-drawer'];els.person.handlers.click();now+=1200;els.person.handlers.click();now+=1100;els.person.handlers.click();assert(drawer.open);drawer.querySelector('.drawer-close').handlers.click();assert(els.person.focused);
console.log('PASS compact anchored bubble; main unchanged; same-item toggle; first Esc/outer click close bubble; second Esc main; mobile up-flip/clamp; resize/scroll including clipped anchor closes; categories/focus/links/QR/reduced motion/drawer.');
// Independent, deterministic geometry coverage.
const place=context.placePopover;
const cases=[
 ['right room',{left:150,top:200,right:260,bottom:310},{width:1280,height:800},310,210,'right'],
 ['right edge flips left',{left:1090,top:200,right:1200,bottom:310},{width:1280,height:800},310,210,'left'],
 ['390 narrow below + horizontal clamp',{left:260,top:200,right:360,bottom:290},{width:390,height:844},300,210,'bottom'],
 ['390 bottom flips above',{left:260,top:650,right:360,bottom:750},{width:390,height:844},300,210,'top'],
 ['small height stays bounded',{left:140,top:110,right:240,bottom:180},{width:390,height:250},300,200,null]
];for(const [label,a,v,w,h,side]of cases){const p=place(a,v,w,h);if(side)assert.equal(p.side,side,label);assert(p.x>=12&&p.y>=12,label);assert(p.x+p.width<=v.width-12&&p.y+p.height<=v.height-12,label);assert(p.arrow>=16,label);}
console.log('PASS geometry: right→left, 390px bottom/top, horizontal clamp, tiny-height bounds.');
