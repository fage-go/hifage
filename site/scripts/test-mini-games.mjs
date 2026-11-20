import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {uniformInt,createGames,initMiniGames} from '../public/mini-games.js';
let values=[4294967295,5],calls=0;
assert.equal(uniformInt(6,{getRandomValues(a){a[0]=values[calls++];}}),5);assert.equal(calls,2);
for(const n of [3,6]){const counts=Array(n).fill(0);for(let i=0;i<600;i++)counts[uniformInt(n,{getRandomValues(a){a[0]=i;}})]++;assert(counts.every(x=>x===600/n));}
for(let p=0;p<6;p++)for(let f=0;f<6;f++){let i=0;const g=createGames(()=>[p,f][i++]);assert.deepEqual(g.roll(),{player:p+1,fage:f+1,outcome:Math.sign(p-f)});assert.equal(i,2);}
for(let p=0;p<3;p++)for(let f=0;f<3;f++){const g=createGames(()=>f),outcome=p===f?0:(p+1)%3===f?1:-1;assert.equal(g.play(p).outcome,outcome);assert.equal(g.rps.player,outcome>0?1:0);assert.equal(g.rps.fage,outcome<0?1:0);}
const g=createGames(()=>1);g.roll();g.play(1);assert.equal(g.rps.player,0);assert.equal(g.rps.fage,0);
for(let i=0;i<25;i++) assert.equal(g.play(0).outcome,1);
assert.equal(g.rps.player,25);assert.equal(g.dice.player,0);assert.equal(g.dice.fage,0);assert.equal(createGames().rps.player,0);
function boot({reduced=false}={}){
 let doc;class El{
  constructor(){this.handlers={};this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.open=false;this.attrs={};this.classList={toggle(){},add(){},remove(){}};}
  setAttribute(n,v){this.attrs[n]=v;}toggleAttribute(n,v){this.attrs[n]=v;}addEventListener(n,f){this.handlers[n]=f;}click(){this.focus();this.handlers.click?.({target:this});}focus(){doc.activeElement=this;}
  showModal(){this.open=true;}close(){this.open=false;this.handlers.close?.();}
 }
 const modal=new El(),nodes={},choices=[0,1,2].map(n=>Object.assign(new El(),{dataset:{miniChoice:String(n)}})),launch=['dice','rps'].map(mode=>Object.assign(new El(),{dataset:{miniOpen:mode}}));
 modal.querySelector=s=>nodes[s]??=new El();modal.querySelectorAll=()=>choices;
 doc={getElementById:()=>modal,querySelectorAll:()=>launch,documentElement:{dataset:{base:'/hifage/'}},body:{style:{overflow:'auto'}}};
 const scheduled=[];let draws=0;
 const game=createGames(()=>{draws++;return 1;});
 const api=initMiniGames(doc,{games:game,reduced:{matches:reduced},schedule:f=>{scheduled.push(f);return scheduled.length;},cancelTimer(){}});
 return{doc,modal,nodes,choices,launch,scheduled,api,draws:()=>draws};
}
let b=boot();b.launch[0].click();assert(b.modal.open);assert.equal(b.doc.body.style.overflow,'hidden');b.nodes['[data-mini-roll]'].click();b.nodes['[data-mini-roll]'].click();assert.equal(b.scheduled.length,1);assert.equal(b.draws(),0);
b.api.close();assert.equal(b.doc.body.style.overflow,'auto');assert.equal(b.doc.activeElement,b.launch[0]);b.scheduled[0]();assert.equal(b.draws(),0);
b.launch[0].click();b.nodes['[data-mini-roll]'].click();b.scheduled[1]();assert.equal(b.draws(),2);assert.equal(b.api.games.dice.player+b.api.games.dice.fage,0);b.api.close();b.launch[0].click();assert.equal(b.api.games.dice.player+b.api.games.dice.fage,0);
b.modal.handlers.cancel({preventDefault(){}});assert(!b.modal.open);
b=boot({reduced:true});b.launch[1].click();b.choices[0].click();assert.equal(b.scheduled.length,0);assert.equal(b.api.games.rps.player,1);b.api.close();b.launch[1].click();assert.equal(b.api.games.rps.player,1);for(let i=0;i<6;i++)b.choices[0].click();assert.equal(b.api.games.rps.player,7);assert.equal(b.doc.activeElement,b.choices[0]);assert.equal(b.nodes['.mini-fage-token'].attrs.hidden,false);assert.equal(b.nodes['#mini-fage-face'].attrs.href,'#mini-hand-1');assert.match(b.nodes['#mini-game-score'].textContent,/你 7 : 0 发哥/);assert.match(b.nodes['#mini-game-status'].textContent,/比分 7 比 0/);
assert(!('replay' in g));assert(!('finished' in g.rps));
const code=readFileSync(new URL('../public/mini-games.js',import.meta.url),'utf8');
assert(!/localStorage|sessionStorage|fetch\(/.test(code));
const base=process.env.SITE_BASE||'/',html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
for(const s of ['data-mini-open="dice"','data-mini-open="rps"','id="mini-game-modal"',base+'mini-games.js',base+'mini-games.css','data-note="4"'])assert(html.includes(s),s);
console.log('PASS uniform rejection sampling; all 36 dice pairs/9 RPS pairs; unlimited points and scoreless draws; separate memory; refresh reset; rapid click; interrupted close and stale callback; focus/escape/overflow; reduced motion immediate; root/subpath wiring; no persistence/network');

{const b=boot();b.launch[1].click();b.choices[0].click();b.scheduled[0]();b.choices[0].click();b.nodes['[data-mini-close]'].focus();b.scheduled[1]();assert.equal(b.doc.activeElement,b.nodes['[data-mini-close]']);}

for(const [id,label,asset] of [['dice','比骰子','mini-dice.webp'],['rps','石头剪刀布','mini-rps.webp']]){const button=html.match(new RegExp('<button[^>]*data-mini-open="'+id+'"[^>]*>.*?</button>'))?.[0];assert(button);assert(button.includes('aria-label="'+label+'"'));assert(button.includes('title="'+label+'"'));assert(button.includes(base+'assets/'+asset));assert(!button.replace(/<[^>]+>/g,'').trim());assert(readFileSync(new URL('../dist/assets/'+asset,import.meta.url)).length>0);}
console.log('PASS raster-only launch controls, accessible names/title, root/subpath assets');

const modal=html.match(/<dialog id="mini-game-modal".*?<\/dialog>/)?.[0];assert(modal);
for(let i=1;i<=6;i++){const face=modal.match(new RegExp('<symbol id="mini-die-'+i+'".*?</symbol>'))?.[0];assert(face);assert.equal([...face.matchAll(/<circle/g)].length,i);}
assert(!/data-mini-replay|mini-game-rule|mini-game-card|mini-memory|<small>/.test(modal));
assert.match(modal,/data-mini-choice="2" aria-label="布"/);
const css=readFileSync(new URL('../public/mini-games.css',import.meta.url),'utf8');
assert(!/blur\(/.test(css));assert.match(css,/#mini-game-modal::backdrop\{background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none\}/);assert.match(css,/mini-dice-throw/);assert.match(css,/mini-hand-send/);
console.log('PASS exact graphical dice pips 1–6, no visible rule/replay/card, transparent unblurred stage, two independent visual paths');
