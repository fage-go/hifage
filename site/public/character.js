// Shared foot baseline stays fixed while the image and speech change.
export function initCharacter(reactions,deskReactions,reduced){
 const person=document.getElementById('person'),avatar=document.getElementById('avatar'),speech=document.getElementById('speech');
 const drawer=document.getElementById('character-drawer');
 let state=0,activations=[];
 reactions.forEach(({image})=>{const preload=new Image();preload.src=image;});
 function show(reaction){
  avatar.src=reaction.image;speech.textContent=reaction.text;
  avatar.classList.remove('pop');void avatar.offsetWidth;if(!reduced.matches)avatar.classList.add('pop');
 }
 person.addEventListener('click',()=>{
  state=(state+1)%reactions.length;show(reactions[state]);
  const now=Date.now();activations=activations.filter(time=>now-time<=2400);activations.push(now);
  if(activations.length>=3){activations=[];drawer.showModal();document.body.classList.add('modal-open');}
 });
 drawer.querySelector('.drawer-close').addEventListener('click',()=>drawer.close());
 drawer.addEventListener('click',e=>{if(e.target!==drawer)return;const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)drawer.close();});
 drawer.addEventListener('close',()=>{if(!document.getElementById('resource-modal').open)document.body.classList.remove('modal-open');person.focus();});
 return {reactToDesk(index){activations=[];const response=deskReactions[index];show({image:reactions[response.pose].image,text:response.text});}};
}
