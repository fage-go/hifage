// No persistence, requests, prizes or account state. Each page instance owns its games.
export function uniformInt(n,cryptoSource=globalThis.crypto){
 if(!Number.isInteger(n)||n<1||n>0x100000000)throw new RangeError('Invalid random range');
 const limit=Math.floor(0x100000000/n)*n,word=new Uint32Array(1);
 do{cryptoSource.getRandomValues(word);}while(word[0]>=limit);
 return word[0]%n;
}
export function createGames(random=uniformInt){
 const dice={wins:0,losses:0,draws:0,last:null},rps={player:0,fage:0,draws:0,last:null,finished:false};
 function roll(){const player=random(6)+1,fage=random(6)+1,outcome=Math.sign(player-fage);dice[outcome>0?'wins':outcome<0?'losses':'draws']++;return dice.last={player,fage,outcome};}
 function play(player){if(rps.finished||![0,1,2].includes(player))return null;const fage=random(3),outcome=player===fage?0:(player+1)%3===fage?1:-1;if(outcome>0)rps.player++;else if(outcome<0)rps.fage++;else rps.draws++;rps.finished=rps.player===2||rps.fage===2;return rps.last={player,fage,outcome};}
 function replay(){Object.assign(rps,{player:0,fage:0,draws:0,last:null,finished:false});}
 return{dice,rps,roll,play,replay};
}
export function initMiniGames(doc=document,{games=createGames(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),schedule=setTimeout,cancelTimer=clearTimeout,base=doc.documentElement.dataset.base||'/'}={}){
 const modal=doc.getElementById('mini-game-modal');if(!modal)return;
 const $=s=>modal.querySelector(s),launch=[...doc.querySelectorAll('[data-mini-open]')],choices=[...modal.querySelectorAll('[data-mini-choice]')];
 let mode='dice',busy=false,timer=null,epoch=0,lastFocus=null,previousOverflow='';
 const names=['石头','剪刀','布'],hands=['✊','✌','✋'],diceFaces=['⚀','⚁','⚂','⚃','⚄','⚅'];
 function render(){
  const d=games.dice,r=games.rps,last=mode==='dice'?d.last:r.last;
  $('#mini-game-title').textContent=mode==='dice'?'比比谁手气好':'石头、剪刀、布';
  $('#mini-game-rule').textContent=mode==='dice'?'各掷一颗六面骰子，点数大的人赢。':'先赢 2 次拿下这局，平局不加分。';
  $('#mini-game-score').textContent=mode==='dice'?`你赢 ${d.wins} · 发哥赢 ${d.losses} · 平局 ${d.draws}`:`你 ${r.player} : ${r.fage} 发哥`;
  $('[data-mini-dice]').hidden=mode!=='dice';$('[data-mini-rps]').hidden=mode!=='rps';
  $('[data-mini-roll]').disabled=busy;choices.forEach(b=>b.disabled=busy||r.finished);
  $('[data-mini-replay]').hidden=mode!=='rps'||!r.finished;
  $('[data-mini-roll]').textContent=d.last?'再掷一次':'掷骰子';
  $('#mini-player-face').textContent=busy?'…':last?(mode==='dice'?diceFaces[last.player-1]:hands[last.player]):'?';
  $('#mini-fage-face').textContent=busy?'…':last?(mode==='dice'?diceFaces[last.fage-1]:hands[last.fage]):'?';
  const verdict=last?(last.outcome>0?'你赢啦！':last.outcome<0?'这回发哥赢。':'平局，再来！'):'';
  $('#mini-game-status').textContent=busy?'发哥准备好了，揭晓！':last?(mode==='dice'?`你掷出 ${last.player}，发哥掷出 ${last.fage}。${verdict}`:`你出${names[last.player]}，发哥出${names[last.fage]}。${r.finished?(r.player===2?'你拿下这一局！':'发哥拿下这一局。'):verdict}`):(mode==='dice'?'手气这回事，掷了才知道。':'你先选，发哥随机出招。');
  $('[data-mini-actor]').src=base+'assets/'+(!last?'fage-welcome.webp':last.outcome>0?'fage-thumbsup.webp':last.outcome<0?'fage-show.webp':'fage-thinking.webp');
  modal.classList.toggle('mini-busy',busy);
 }
 function invalidate(){epoch++;if(timer!==null)cancelTimer(timer);timer=null;busy=false;}
 function round(choice,trigger){
  if(busy||!modal.open||mode==='rps'&&games.rps.finished)return;
  const ownedFocus=doc.activeElement===trigger;busy=true;const run=++epoch,game=mode;render();
  const finish=()=>{if(run!==epoch||!modal.open||game!==mode)return;timer=null;busy=false;game==='dice'?games.roll():games.play(choice);render();if(ownedFocus&&(doc.activeElement===doc.body||doc.activeElement===trigger)){if(game==='rps'&&games.rps.finished)$('[data-mini-replay]').focus();else trigger.focus();}};
  if(reduced.matches)finish();else timer=schedule(finish,320);
 }
 function close(){if(modal.open)modal.close();}
 modal.addEventListener('close',()=>{invalidate();doc.body.style.overflow=previousOverflow;render();lastFocus?.focus({preventScroll:true});});
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 $('[data-mini-close]').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal||e.target===$('.mini-game-layout'))close();});
 launch.forEach(button=>button.addEventListener('click',()=>{
  if(modal.open)return;invalidate();mode=button.dataset.miniOpen;lastFocus=button;previousOverflow=doc.body.style.overflow;doc.body.style.overflow='hidden';render();modal.showModal();(mode==='dice'?$('[data-mini-roll]'):games.rps.finished?$('[data-mini-replay]'):choices[0]).focus();
 }));
 $('[data-mini-roll]').addEventListener('click',()=>round(undefined,$('[data-mini-roll]')));
 choices.forEach(b=>b.addEventListener('click',()=>round(Number(b.dataset.miniChoice),b)));
 $('[data-mini-replay]').addEventListener('click',()=>{invalidate();games.replay();render();choices[0].focus();});
 return{games,close};
}
if(typeof document!=='undefined')initMiniGames();
