export const POSITIONS = ['大安','留连','速喜','赤口','小吉','空亡'];
export const MEANINGS = [
 '这事不用急，按原计划稳着来。',
 '可能要多等一会儿，先别急着催。',
 '手头有能推进的小事，就先做一步。',
 '容易说岔，重要的话想清楚再说。',
 '有点顺风，小事可以先试试看。',
 '眼下还看不明朗，先别急着定。',
];
export const HOURS = [...'子丑寅卯辰巳午未申酉戌亥'];
const ZONE='Asia/Shanghai';
// Numeric zh-CN Chinese-calendar formatting still emits traditional month labels on some engines.
const MONTHS=['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const DAYS=['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
let defaultCalendars;
export function createCalendars() {
 const lunar = new Intl.DateTimeFormat('zh-CN-u-ca-chinese-nu-latn',{timeZone:ZONE,calendar:'chinese',month:'numeric',day:'numeric'});
 const clock = new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn',{timeZone:ZONE,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 if (lunar.resolvedOptions().calendar!=='chinese'||clock.resolvedOptions().timeZone!==ZONE) throw new Error('Calendar unavailable');
 return {lunar,clock};
}
const parts=(fmt,at)=>Object.fromEntries(fmt.formatToParts(at).map(({type,value})=>[type,value]));
function parseMonth(value) {
 const leap=/^[闰閏]|bis$/i.test(value);
 const clean=value.replace(/^[闰閏]|bis$/ig,'').replace(/月$/,'').trim();
 const month=/^\d{1,2}$/.test(clean)?Number(clean):({一:1,十一:11,十二:12,臘:12}[clean]??MONTHS.indexOf(clean)+1);
 return {month,leap};
}
export function positionAt(date=new Date(),calendars=(defaultCalendars??=createCalendars())) {
 const l=parts(calendars.lunar,date), t=parts(calendars.clock,date);
 const {month,leap}=parseMonth(l.month??'');
 const day=Number(l.day), hour=Number(t.hour), minute=Number(t.minute), second=Number(t.second);
 if (!Number.isInteger(month)||month<1||month>12||!Number.isInteger(day)||day<1||day>30||
     !t.year||!t.month||!t.day||!t.hour||!t.minute||!t.second||
     !Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59||
     !Number.isInteger(second)||second<0||second>59) throw new Error('Invalid calendar result');
 const hourIndex=Math.floor((hour+1)/2)%12;
 const index=(month-1+day-1+hourIndex)%POSITIONS.length;
 // Either the next odd-hour boundary or civil midnight, including the split of 子.
 const nextHour=Math.min(24,hour+(hour%2===0?1:2));
 const nextMs=((nextHour-hour)*3600-minute*60-second)*1000-date.getMilliseconds();
 return {month,leap,day,hourIndex,index,result:POSITIONS[index],
   dateLabel:`农历${leap?'闰':''}${MONTHS[month-1]}月${DAYS[day]}`,
   hourLabel:HOURS[hourIndex]+'时',key:`${t.year}-${t.month}-${t.day}/${hourIndex}`,nextMs};
}
function uniformInt(size) {
 const value=new Uint32Array(1),limit=Math.floor(2**32/size)*size;
 do { globalThis.crypto.getRandomValues(value); } while(value[0]>=limit);
 return value[0]%size;
}
export function resultForNumber(number) {
 if(!Number.isInteger(number)||number<1||number>99) throw new RangeError('Choose a number between 1 and 99');
 const index=(number-1)%POSITIONS.length;
 return {index,result:POSITIONS[index],context:`报数起课 · ${number}`};
}
export function sampleNumbers(random=uniformInt) {
 const numbers=Array.from({length:POSITIONS.length},(_,i)=>{
  const first=i+1;
  return first+POSITIONS.length*random(Math.floor((99-first)/POSITIONS.length)+1);
 });
 for(let i=numbers.length-1;i>0;i--){
  const j=random(i+1);
  [numbers[i],numbers[j]]=[numbers[j],numbers[i]];
 }
 return numbers;
}
export function startLiuren(doc=document,{now=()=>new Date(),schedule=setTimeout,cancel=clearTimeout,reduced=matchMedia('(prefers-reduced-motion: reduce)'),win=window,calculate=positionAt,generate=sampleNumbers}={}) {
 const $=s=>doc.querySelector(s);
 const status=$('[data-liuren-result]');
 if (!status) return;
 const nodes=[...doc.querySelectorAll('[data-liuren-position]')];
 const context=$('[data-liuren-context]'), meaning=$('[data-liuren-meaning]');
 const setMeaning=value=>{if(meaning)meaning.textContent=value;};
 const optionRow=$('[data-liuren-options]'), numberSection=$('[data-liuren-numbers]'), timeNote=$('[data-liuren-time-note]');
 const methods=[...doc.querySelectorAll('[data-liuren-mode]')], candidates=[...doc.querySelectorAll('[data-liuren-number]')];
 const refresh=$('[data-liuren-refresh]'),notice=$('[data-liuren-notice]');
 let boundary,animation,key,run=0,mode='time',numbers,manual;
 function stopAnimation(){run++;cancel(animation);}
 function clearPassing(){for(const node of nodes)node.classList.remove('is-passing');}
 function setSelected(index){
  for(let i=0;i<nodes.length;i++){
   if(i===index) nodes[i].setAttribute('aria-current','true');
   else nodes[i].removeAttribute('aria-current');
  }
 }
 function display(data,animate){
  stopAnimation();
  const id=run;
  context.textContent=data.context ?? `${data.dateLabel} · ${data.hourLabel}`;
  function finish(){
   clearPassing();
   setSelected(data.index);
   status.removeAttribute('data-unavailable');
   status.textContent=data.result;
   setMeaning(MEANINGS[data.index]);
  }
  if(!animate||reduced.matches){finish();return;}
  setSelected(-1);
  status.removeAttribute('data-unavailable');
  status.textContent='正在推演';
  setMeaning('');
  let step=0;
  const end=nodes.length+data.index;
  const tick=()=>{
   if(id!==run||doc.hidden)return;
   nodes.forEach((node,i)=>node.classList.toggle('is-passing',i===step%nodes.length));
   if(step++===end){finish();return;}
   animation=schedule(tick,72);
  };
  tick();
 }
 function sync({settle=false}={}) {
  cancel(boundary);
  if(mode!=='time') return;
  let data;
  try {data=calculate(now());}
  catch {
   stopAnimation();setSelected(-1);clearPassing();
   context.textContent='北京时间 · 农历';
   status.setAttribute('data-unavailable','');
   status.textContent='当前浏览器无法读取农历';
   setMeaning('');
   key=undefined;
   return;
  }
  if(settle||data.key!==key){const animate=!settle&&!doc.hidden;key=data.key;display(data,animate);}
  if (!doc.hidden) boundary=schedule(sync,Math.min(data.nextMs+8,60000));
 }
 function renderNumbers(){
  candidates.forEach((button,i)=>{
   button.textContent=String(numbers[i]);
   button.setAttribute('aria-pressed',String(manual?.number===numbers[i]&&manual.group===numbers));
  });
 }
 function refreshNumbers(announce=false) {
  numbers=generate();
  renderNumbers();
  if(announce&&notice) notice.textContent=`新的一组：${numbers.join('、')}`;
 }
 function showManual(animate=false){
  if(manual){display(manual,animate);return;}
  stopAnimation();clearPassing();setSelected(-1);
  status.removeAttribute('data-unavailable');
  context.textContent='报数起课';
  status.textContent='任选一数';
  setMeaning('');
 }
 function setMode(next) {
  if(next===mode||!['time','number'].includes(next))return;
  mode=next;
  cancel(boundary);
  stopAnimation();
  methods.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.liurenMode===mode)));
  if(numberSection) numberSection.hidden=mode!=='number';
  if(timeNote) timeNote.hidden=mode!=='time';
  if(mode==='time'){sync({settle:true});return;}
  if(!numbers)refreshNumbers();
  showManual();
 }
 function choose(i) {
  if(mode!=='number'||!numbers||!Number.isInteger(i)||i<0||i>=numbers.length)return;
  const number=numbers[i];
  manual={...resultForNumber(number),number,group:numbers};
  renderNumbers();
  showManual(!doc.hidden);
 }
 function restore(){
  if(mode==='time')sync({settle:true});
  else showManual();
 }
 function visibility(){
  if(doc.hidden){cancel(boundary);stopAnimation();}
  else restore();
 }
 doc.addEventListener('visibilitychange',visibility);
 win.addEventListener('pageshow',e=>{if(e.persisted)restore();else sync();});
 win.addEventListener('focus',()=>sync());
 reduced.addEventListener?.('change',restore);
 if (optionRow&&typeof optionRow.hidden==='boolean') optionRow.hidden=false;
 methods.forEach(button=>button.addEventListener?.('click',()=>setMode(button.dataset.liurenMode)));
 candidates.forEach((button,i)=>button.addEventListener?.('click',()=>choose(i)));
 refresh?.addEventListener?.('click',()=>{if(mode==='number')refreshNumbers(true);});
 sync();
 return {setMode,choose};
}
if (typeof document!=='undefined') startLiuren();
