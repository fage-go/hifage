import {placePopover} from './popover-position.js';
// Small item-anchored notification bubble; the Finder itself never moves or resizes.
export function initDesk(sections,reduced,reactToDesk){
 const modal=document.getElementById('resource-modal'),back=document.getElementById('finder-back');
 const categories=document.getElementById('finder-categories'),list=document.getElementById('finder-items'),empty=document.getElementById('finder-empty'),detail=document.getElementById('finder-detail');
 const buttons=[...document.querySelectorAll('[data-note]')];
 const mainWindow=document.getElementById('finder-main-window'),detailWindow=document.getElementById('finder-detail-window'),detailTitle=document.getElementById('finder-detail-title');
 const workspace=modal.querySelector('.finder-workspace'),listViewport=modal.querySelector('.finder-list');
 function positionDetail(){if(selected===null)return;const anchor=itemButtons[selected].getBoundingClientRect(),clip=listViewport.getBoundingClientRect();if(anchor.bottom<=clip.top||anchor.top>=clip.bottom||anchor.right<=clip.left||anchor.left>=clip.right){const hadFocus=detailWindow.contains(document.activeElement);showList();if(hadFocus)modal.querySelector('.finder-close').focus({preventScroll:true});return;}const width=detailWindow.offsetWidth,height=detailWindow.offsetHeight,origin=workspace.getBoundingClientRect();const placement=placePopover(anchor,{width:window.innerWidth,height:window.innerHeight},width,height);detailWindow.style.left=(placement.x-origin.left)+'px';detailWindow.style.top=(placement.y-origin.top)+'px';detailWindow.dataset.side=placement.side;detailWindow.style.setProperty('--arrow',placement.arrow+'px');}
 window.addEventListener('resize',positionDetail);modal.addEventListener('scroll',positionDetail,true);
 let current=0,selected=null,lastFocus=null,itemButtons=[];
 const text=(id,value)=>{document.getElementById(id).textContent=value;};
 function el(tag,content,className){const node=document.createElement(tag);if(content!==undefined)node.textContent=content;if(className)node.className=className;return node;}
 function makeLink(action){const link=el('a',action.label,'finder-action');link.href=action.href;if(action.download)link.download=action.download;if(action.external){link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',action.label+'（新标签页）');}return link;}
 function showList(restoreFocus=false){
  const previous=selected;selected=null;modal.classList.remove('is-detail');detailWindow.hidden=true;back.disabled=true;
  document.getElementById('finder-path-item').hidden=true;text('finder-selection-status','');itemButtons.forEach(b=>b.setAttribute('aria-pressed','false'));
  if(restoreFocus&&previous!==null)itemButtons[previous]?.focus();
 }
 function chooseItem(index){
  if(selected===index){showList(true);return;}
  selected=index;const item=sections[current].items[index];detail.replaceChildren();
  detailTitle.textContent=item.title;detail.append(el('span',item.badge,'finder-badge'),el('p',item.brief||item.description,'finder-description'));
  if(item.actions.length){const actions=el('div',undefined,'finder-actions');item.actions.forEach((action,i)=>{const link=makeLink(action);if(i>1)link.classList.add('finder-secondary-action');actions.append(link);});detail.append(actions);}
  if(item.qr){const qr=el('img',undefined,'finder-qr');qr.src=item.qr;qr.alt='发哥聊一聊AI 微信公众号二维码';qr.width=104;qr.height=104;detail.append(qr);}
  if(item.shortNote)detail.append(el('p',item.shortNote,'finder-note'));
  itemButtons.forEach((b,i)=>b.setAttribute('aria-pressed',i===index?'true':'false'));
  detailWindow.hidden=false;back.disabled=false;modal.classList.add('is-detail');positionDetail();
  const path=document.getElementById('finder-path-item');path.textContent='/ '+item.title;path.hidden=false;text('finder-selection-status','已选择：'+item.title);
  detail.scrollTop=0;detailTitle.focus({preventScroll:true});
 }
 modal.addEventListener('cancel',event=>{if(selected!==null){event.preventDefault();showList(true);}});
 function chooseSection(index){
  current=index;showList();const section=sections[index];modal.dataset.kind=section.id;
  text('finder-title',section.name);text('finder-path-section',section.name);text('finder-section-title',section.name);text('finder-section-description',section.description);text('finder-count',section.items.length+' 项');
  [...categories.children].forEach((button,i)=>button.setAttribute('aria-pressed',i===index?'true':'false'));
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',i===index?'true':'false'));
  list.replaceChildren();empty.replaceChildren();itemButtons=[];empty.hidden=section.items.length!==0;
  section.items.forEach((item,i)=>{
   const li=el('li'),button=el('button',undefined,'finder-item');button.type='button';button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','finder-detail-window');
   const image=el('img');image.src=item.icon;image.alt='';image.width=70;image.height=70;
   button.append(image,el('strong',item.title),el('small',item.kind));button.addEventListener('click',()=>chooseItem(i));
   button.addEventListener('keydown',event=>{const delta=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;if(delta){event.preventDefault();itemButtons[(i+delta+itemButtons.length)%itemButtons.length].focus();}});
   li.append(button);list.append(li);itemButtons.push(button);
  });
  if(!section.items.length){empty.append(el('span','▱','finder-empty-symbol'),el('h4','这里还在整理'),el('p',section.empty));if(section.emptyLink)empty.append(makeLink(section.emptyLink));}
 }
 sections.forEach((section,index)=>{const button=el('button',undefined,'finder-category');button.type='button';button.setAttribute('aria-pressed','false');const symbol=el('span',section.symbol);symbol.setAttribute('aria-hidden','true');button.append(symbol,el('span',section.name));button.addEventListener('click',()=>chooseSection(index));categories.append(button);});
 back.addEventListener('click',()=>showList(true));
 modal.querySelector('.finder-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('click',event=>{if(selected!==null&&!detailWindow.contains(event.target)&&!itemButtons[selected].contains(event.target)){showList(true);return;}if(event.target===modal||event.target.classList?.contains('finder-workspace'))modal.close();});
 modal.addEventListener('close',()=>{showList();document.body.classList.remove('modal-open');buttons.forEach(b=>b.setAttribute('aria-pressed','false'));if(lastFocus?.isConnected)lastFocus.focus();});
 buttons.forEach((button,index)=>{
  button.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')reactToDesk(index);});button.addEventListener('focus',()=>reactToDesk(index));
  button.addEventListener('click',()=>{reactToDesk(index);lastFocus=button;chooseSection(index);if(!modal.open){modal.showModal();document.body.classList.add('modal-open');}});
  button.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType==='touch')return;const r=button.getBoundingClientRect();button.style.setProperty('--mx',((event.clientX-r.left)/r.width-.5).toFixed(3));button.style.setProperty('--my',((event.clientY-r.top)/r.height-.5).toFixed(3));});
  button.addEventListener('pointerleave',()=>{button.style.setProperty('--mx','0');button.style.setProperty('--my','0');});
 });
}
