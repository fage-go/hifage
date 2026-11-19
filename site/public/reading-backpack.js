import {newsDays,defaultNewsDate,visibleNewsDays} from './news-data.js';
export function renderReadingBackpack(kind,base){
 const heading=document.getElementById('reading-title'),tabs=document.getElementById('reading-dates'),body=document.getElementById('reading-content'),notice=document.getElementById('reading-notice');
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 tabs.replaceChildren();body.replaceChildren();body.removeAttribute('role');body.removeAttribute('aria-labelledby');tabs.hidden=kind!=='news';
 if(kind==='notes'){
  heading.textContent='教程笔记';notice.hidden=false;notice.className='';notice.textContent='开发记录、教程与复盘，先从公众号里读起。';
  const row=el('a',null,'reading-row');row.href=base+'notes/wechat/';row.append(el('strong','发哥聊一聊AI · 教程与开发记录'),el('p','查看公众号入口与阅读方式。站内教程索引仍在整理，没有虚构文章。'),el('span','阅读入口 · 站内说明','reading-meta'));body.append(row);return row;
 }
 const days=visibleNewsDays();heading.textContent='AI 资讯';notice.className='news-sample';notice.textContent=days.some(d=>d.editions.some(e=>e.sample===true))?'历史样例':'';notice.hidden=!notice.textContent;
 if(!days.length){tabs.hidden=true;const empty=el('p','还没有已发布的资讯。');empty.tabIndex=-1;body.append(empty);return empty;}
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const tabButtons=[];tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','选择资讯日期');body.setAttribute('role','tabpanel');body.id='reading-content';
 function show(date){const day=days.find(d=>d.date===date);tabButtons.forEach(b=>{const on=b.dataset.date===date;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});body.replaceChildren();body.setAttribute('aria-labelledby','news-date-'+date);for(const edition of day.editions){const group=el('section',null,'reading-edition'),header=el('div',null,'reading-edition-head');header.append(el('h3',edition.title));group.append(header);for(const item of edition.items){const a=el('a',null,'reading-row news-row');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',item.title+'，打开'+item.source+'官方原文（新标签页）');const detail=el('div',null,'news-reveal'),inner=el('div',null,'news-reveal-inner');inner.append(el('p',item.summary),el('span',item.sourceDate+' · '+item.source+' · 官方原文','reading-meta'));detail.append(inner);a.append(el('strong',item.title),detail);group.append(a);}body.append(group);}}
 days.forEach((day,i)=>{const b=el('button',day.date);b.type='button';b.id='news-date-'+day.date;b.dataset.date=day.date;b.setAttribute('role','tab');b.setAttribute('aria-controls','reading-content');b.addEventListener('click',()=>show(day.date));b.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?tabButtons.length-1:(i+(e.key==='ArrowLeft'?-1:1)+tabButtons.length)%tabButtons.length;tabButtons[j].focus();show(days[j].date);});tabButtons.push(b);tabs.append(b);});show(defaultNewsDate(today,days));return tabButtons.find(b=>b.tabIndex===0);
}
