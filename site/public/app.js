import {deskItems, gameLink, reactions} from './content.js';
import {initCharacter} from './character.js';
import {initDesk} from './desk.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
initCharacter(reactions, reduced);
initDesk(deskItems, gameLink, reduced);
function updateDate(){
 const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const el=document.getElementById('today');el.dateTime=date;el.textContent=date.replaceAll('-',' / ');
}
updateDate();setInterval(updateDate,60000);
const headline=document.querySelector('.headline-visual'),intro=document.querySelector('.intro-line');
let typingTimer=null;
function finishTyping(){if(typingTimer)clearInterval(typingTimer);headline.style.removeProperty('--visible-chars');headline.classList.remove('typing');intro.classList.remove('intro-wait');intro.classList.add('intro-ready');}
if(!reduced.matches){let typed=0;headline.style.setProperty('--visible-chars','0');headline.classList.add('typing');intro.classList.add('intro-wait');typingTimer=setInterval(()=>{headline.style.setProperty('--visible-chars',String(++typed));if(typed>=7)finishTyping();},115);}
reduced.addEventListener('change',e=>{if(e.matches)finishTyping();});
