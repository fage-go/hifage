import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {uniformInt,createGames,initMiniGames} from '../public/mini-games.js';
let values=[4294967295,5],calls=0;
assert.equal(uniformInt(6,{getRandomValues(a){a[0]=values[calls++];}}),5);assert.equal(calls,2);
for(const n of [3,6]){const counts=Array(n).fill(0);for(let i=0;i<600;i++)counts[uniformInt(n,{getRandomValues(a){a[0]=i;}})]++;assert(counts.every(x=>x===600/n));}
for(let p=0;p<6;p++)for(let f=0;f<6;f++){let i=0;const g=createGames(()=>[p,f][i++]);assert.deepEqual(g.roll(),{player:p+1,fage:f+1,outcome:Math.sign(p-f)});assert.equal(i,2);}
for(let p=0;p<3;p++)for(let f=0;f<3;f++){const g=createGames(()=>f),outcome=p===f?0:(p+1)%3===f?1:-1;assert.equal(g.play(p).outcome,outcome);assert.equal(g.rps.player,outcome>0?1:0);assert.equal(g.rps.fage,outcome<0?1:0);}
const g=createGames(()=>1);g.roll();g.play(1);assert.equal(g.rps.draws,1);assert.equal(g.rps.player,0);g.play(0);g.play(0);assert(g.rps.finished);assert.equal(g.play(0),null);g.replay();assert.equal(g.rps.player,0);assert.equal(g.dice.draws,1);assert.equal(createGames().dice.draws,0);
function boot({reduced=false}={}){
 let doc;class El{
  constructor(){this.handlers={};this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.open=false;this.classList={toggle(){}};}
  addEventListener(n,f){this.handlers[n]=f;}click(){this.focus();this.handlers.click?.({target:this});}focus(){doc.activeElement=this;}
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
b.launch[0].click();b.nodes['[data-mini-roll]'].click();b.scheduled[1]();assert.equal(b.draws(),2);assert.equal(b.api.games.dice.draws,1);b.api.close();b.launch[0].click();assert.equal(b.api.games.dice.draws,1);
b.modal.handlers.cancel({preventDefault(){}});assert(!b.modal.open);
b=boot({reduced:true});b.launch[1].click();b.choices[0].click();assert.equal(b.scheduled.length,0);assert.equal(b.api.games.rps.player,1);b.api.close();b.launch[1].click();assert.equal(b.api.games.rps.player,1);b.choices[0].click();assert(b.api.games.rps.finished);assert.equal(b.doc.activeElement,b.nodes['[data-mini-replay]']);b.choices[0].click();assert.equal(b.api.games.rps.player,2);b.nodes['[data-mini-replay]'].click();assert.equal(b.api.games.rps.player,0);assert.equal(b.doc.activeElement,b.choices[0]);
const code=readFileSync(new URL('../public/mini-games.js',import.meta.url),'utf8');
assert(!/localStorage|sessionStorage|fetch\(/.test(code));
const base=process.env.SITE_BASE||'/',html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
for(const s of ['data-mini-open="dice"','data-mini-open="rps"','id="mini-game-modal"',base+'mini-games.js',base+'mini-games.css','data-note="4"'])assert(html.includes(s),s);
console.log('PASS uniform rejection sampling; all 36 dice pairs/9 RPS pairs; first to 2/draw/replay; separate memory; refresh reset; rapid click; interrupted close and stale callback; focus/escape/overflow; reduced motion immediate; root/subpath wiring; no persistence/network');

{const b=boot();b.launch[1].click();b.choices[0].click();b.scheduled[0]();b.choices[0].click();b.nodes['[data-mini-close]'].focus();b.scheduled[1]();assert.equal(b.doc.activeElement,b.nodes['[data-mini-close]']);}
