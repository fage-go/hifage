// One click: object-specific 220ms motion, then the same accessible detail dialog.
export function initDesk(items,gameLink,reduced){
 const modal=document.getElementById('resource-modal'),panel=document.getElementById('panel');
 const buttons=[...document.querySelectorAll('[data-note]')];
 let lastFocus=null,pending=null,pendingIndex=null;
 function clearOpening(){if(pending!==null)clearTimeout(pending);pending=null;pendingIndex=null;buttons.forEach(b=>b.classList.remove('opening'));}
 function show(i){
  clearOpening();const button=buttons[i];lastFocus=button;
  buttons.forEach((b,j)=>b.setAttribute('aria-pressed',i===j?'true':'false'));
  const [tag,title,desc,status]=items[i];panel.replaceChildren();
  for(const [type,text] of [['span',tag],['h2',title],['p',desc],['small',status]]){const el=document.createElement(type);el.textContent=text;if(type==='span')el.className='caption';if(type==='h2')el.id='modal-title';panel.append(el);}
  if(i===0){const link=document.createElement('a');link.href='./skills/';link.textContent='进入 Skill 盒 ↗';link.className='panel-action';panel.append(link);}
  if(i===3){const link=document.createElement('a');link.href=gameLink.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=gameLink.label;link.className='panel-action';panel.append(link);}
  modal.dataset.kind=['skill','news','notebook','game'][i];
  if(!modal.open){modal.showModal();document.body.classList.add('modal-open');}
 }
 modal.querySelector('.modal-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();});
 modal.addEventListener('close',()=>{document.body.classList.remove('modal-open');buttons.forEach(b=>b.setAttribute('aria-pressed','false'));if(lastFocus?.isConnected)lastFocus.focus();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pending!==null)clearOpening();});
 buttons.forEach((b,i)=>{
  b.addEventListener('click',()=>{clearOpening();if(reduced.matches){show(i);return;}b.classList.add('opening');pendingIndex=i;pending=setTimeout(()=>show(i),220);});
  b.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=b.getBoundingClientRect();b.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5).toFixed(3));b.style.setProperty('--my',((e.clientY-r.top)/r.height-.5).toFixed(3));});
  b.addEventListener('pointerleave',()=>{b.style.setProperty('--mx','0');b.style.setProperty('--my','0');});
 });
 reduced.addEventListener('change',e=>{if(e.matches&&pendingIndex!==null)show(pendingIndex);});
}
