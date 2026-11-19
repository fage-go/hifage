// Historical official announcements, used only as clearly labelled layout samples.
// The 07:00 / 19:00 labels are proposed editorial editions, not source publish times.
export const newsDays=[
 {date:'2025-09-29',editions:[
  {id:'am',title:'发哥早报',time:'07:00',items:[{title:'Claude Sonnet 4.5 发布',summary:'模型升级之外，我更想看它能不能把一个完整任务稳稳做完。',source:'Anthropic',sourceDate:'2025-09-29',url:'https://www.anthropic.com/news/claude-sonnet-4-5'}]},
  {id:'pm',title:'发哥晚报',time:'19:00',items:[{title:'Claude Code 增加检查点与原生 VS Code 扩展',summary:'我最在意检查点：让 AI 放手干之前，先给自己留条退路。',source:'Anthropic',sourceDate:'2025-09-29',url:'https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously'}]}
 ]},
 {date:'2025-08-07',editions:[
  {id:'am',title:'发哥早报',time:'07:00',items:[{title:'OpenAI 发布 GPT-5',summary:'不用反复选模型是好事，但真正省不省心，还得看复杂任务里的表现。',source:'OpenAI',sourceDate:'2025-08-07',url:'https://openai.com/index/introducing-gpt-5/'}]},
  {id:'pm',title:'发哥晚报',time:'19:00',items:[{title:'GPT-5 面向开发者开放',summary:'开发者不只看分数。我会先对比工具调用是否稳定，再看速度和成本。',source:'OpenAI',sourceDate:'2025-08-07',url:'https://openai.com/index/introducing-gpt-5-for-developers/'}]}
 ]}
];
export function defaultNewsDate(today,days=newsDays){const dates=days.map(d=>d.date).sort().reverse();return dates.includes(today)?today:dates[0];}
