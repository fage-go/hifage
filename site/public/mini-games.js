// Both games are independent, page-local point counters. No storage or requests.
export function uniformInt(n, cryptoSource=globalThis.crypto) {
  if (!Number.isInteger(n) || n<1 || n>0x100000000) throw new RangeError('Invalid random range');
  const limit=Math.floor(0x100000000/n)*n, word=new Uint32Array(1);
  do { cryptoSource.getRandomValues(word); } while (word[0]>=limit);
  return word[0]%n;
}
export function createGames(random=uniformInt) {
  const make=()=>({player:0,fage:0,last:null}), dice=make(), rps=make();
  function apply(score, player, fage, outcome) {
    if (outcome>0) score.player++;
    if (outcome<0) score.fage++;
    return score.last={player,fage,outcome};
  }
  function roll() {
    const player=random(6)+1, fage=random(6)+1;
    return apply(dice,player,fage,Math.sign(player-fage));
  }
  function play(player) {
    if (![0,1,2].includes(player)) return null;
    const fage=random(3);
    return apply(rps,player,fage,player===fage?0:(player+1)%3===fage?1:-1);
  }
  return {dice,rps,roll,play};
}
export function initMiniGames(doc=document,{games=createGames(),reduced=matchMedia('(prefers-reduced-motion: reduce)'),schedule=setTimeout,cancelTimer=clearTimeout,base=doc.documentElement.dataset.base||'/'}={}) {
  const modal=doc.getElementById('mini-game-modal');
  if (!modal) return;
  const $=s=>modal.querySelector(s), launch=[...doc.querySelectorAll('[data-mini-open]')], choices=[...modal.querySelectorAll('[data-mini-choice]')];
  const roll=$('[data-mini-roll]'), playerToken=$('.mini-player-token'), fageToken=$('.mini-fage-token'), actor=$('[data-mini-actor]');
  const hands=['石头','剪刀','布'];
  let mode='dice', busy=false, timer=null, epoch=0, lastFocus=null, previousOverflow='';
  function setToken(element, selector, id) {
    element.toggleAttribute('hidden', !id);
    if (id) $(selector).setAttribute('href','#mini-'+id);
  }
  function render(pending) {
    const {player,fage,last}=games[mode], dice=mode==='dice';
    modal.dataset.mode=mode;
    modal.classList.toggle('mini-busy',busy);
    $('#mini-game-title').textContent=dice?'比骰子':'石头剪刀布';
    const score=$('#mini-game-score');
    score.textContent=`你 ${player} : ${fage} 发哥`;
    $('[data-mini-dice]').hidden=!dice;
    $('[data-mini-rps]').hidden=dice;
    [roll,...choices].forEach(button=>button.setAttribute('aria-disabled',String(busy)));
    const face=v=>dice?'die-'+v:'hand-'+v;
    setToken(playerToken,'#mini-player-face',busy?(dice?'die-5':face(pending)):last&&face(last.player));
    setToken(fageToken,'#mini-fage-face',busy?(dice?'die-5':'hand-back'):last&&face(last.fage));
    actor.src=base+'assets/'+(busy||!last?'fage-welcome.webp':last.outcome>0?'fage-thumbsup.webp':last.outcome<0?'fage-show.webp':'fage-thinking.webp');
  }
  function invalidate() {
    epoch++;
    if (timer!==null) cancelTimer(timer);
    timer=null;
    busy=false;
  }
  function setOrigin(token, source, sourceHeight=.5) {
    const from=source.getBoundingClientRect?.(), to=token.getBoundingClientRect?.();
    if (!from||!to) return;
    token.style.setProperty('--launch-x',`${from.left+from.width/2-to.left-to.width/2}px`);
    token.style.setProperty('--launch-y',`${from.top+from.height*sourceHeight-to.top-to.height/2}px`);
  }
  function round(choice) {
    if (busy||!modal.open) return;
    busy=true;
    const run=++epoch, game=mode;
    $('#mini-game-status').textContent='';
    // Measure the landing boxes with neither piece in an animated transform.
    modal.classList.add('mini-measuring');
    render(choice);
    if (!reduced.matches) {
      setOrigin(playerToken, mode==='dice'?roll:choices[choice]);
      setOrigin(fageToken, actor, .43);
    }
    modal.classList.remove('mini-measuring');
    const finish=()=>{
      if (run!==epoch||!modal.open||game!==mode) return;
      timer=null;
      busy=false;
      const {player,fage,outcome}=game==='dice'?games.roll():games.play(choice);
      render();
      const verdict=outcome>0?'你得一分。':outcome<0?'发哥得一分。':'平局，不计分。';
      $('#mini-game-status').textContent=(game==='dice'?`你掷出 ${player}，发哥掷出 ${fage}。`:`你出${hands[player]}，发哥出${hands[fage]}。`)+verdict+`比分 ${games[game].player} 比 ${games[game].fage}。`;
    };
    if (reduced.matches) finish();
    else timer=schedule(finish,560);
  }
  function restore() {
    invalidate();
    doc.body.style.overflow=previousOverflow;
    render();
    const trigger=lastFocus;
    lastFocus=null;
    trigger?.focus({preventScroll:true});
  }
  function close() {
    if (!modal.open) return;
    modal.close();
    restore();
  }
  // Native close events are async; ignore the old one if already closed or reopened.
  modal.addEventListener('close',()=>{if(!modal.open&&lastFocus) restore();});
  modal.addEventListener('cancel',e=>{e.preventDefault();close();});
  $('[data-mini-close]').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal||e.target===$('.mini-stage')) close();});
  launch.forEach(button=>button.addEventListener('click',()=>{
    if (modal.open||!['dice','rps'].includes(button.dataset.miniOpen)) return;
    invalidate();
    mode=button.dataset.miniOpen;
    lastFocus=button;
    previousOverflow=doc.body.style.overflow;
    doc.body.style.overflow='hidden';
    $('#mini-game-status').textContent='';
    render();
    modal.showModal();
    (mode==='dice'?roll:choices[0]).focus();
  }));
  roll.addEventListener('click',()=>round());
  choices.forEach(b=>b.addEventListener('click',()=>round(Number(b.dataset.miniChoice))));
  return {games,close};
}
if (typeof document!=='undefined') initMiniGames();
