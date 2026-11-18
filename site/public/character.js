// Image variants share one canvas and foot baseline; only image + speech change.
export function initCharacter(reactions,reduced){
 const person=document.getElementById('person'),avatar=document.getElementById('avatar'),speech=document.getElementById('speech');
 let state=0;
 reactions.forEach(({image})=>{const preload=new Image();preload.src=image;});
 person.addEventListener('click',()=>{
  state=(state+1)%reactions.length;const reaction=reactions[state];avatar.src=reaction.image;speech.textContent=reaction.text;
  avatar.classList.remove('pop');void avatar.offsetWidth;if(!reduced.matches)avatar.classList.add('pop');
 });
}
