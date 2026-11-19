// Replace only the strict JSON between the unique markers; never evaluate input as code.
export const newsDays =
// NEWS_DATA_START
[
  {
    "date": "2026-11-19",
    "editions": [
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "18:00",
        "sample": false,
        "items": [
          {
            "title": "OpenAI 公开编程 Agent 加速研究的新数据",
            "summary": "报告称，编程 Agent 能承担更长的任务，也能加快写代码和跑实验；但选题、验证结果和判断实验质量仍需要研究人员把关。这是 OpenAI 的内部研究观察，不等于所有研究都被同样加速。",
            "source": "OpenAI",
            "sourceDate": "2026-11-19",
            "url": "https://openai.com/index/research-acceleration-jagged-frontier/"
          },
          {
            "title": "Anthropic 公布 IPO 定价：每股 83 美元",
            "summary": "Anthropic 公告称，股票预计于美国当地时间 11 月 19 日在纳斯达克开始交易，代码为 ANT。截至本期截稿，官方确认的是发行定价，不是开盘价。",
            "source": "Anthropic",
            "sourceDate": "2026-11-19",
            "url": "https://www.anthropic.com/news/anthropic-prices-initial-public-offering"
          }
        ]
      }
    ]
  },
  {
    "date": "2025-09-29",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "items": [
          {
            "title": "Claude Sonnet 4.5 发布",
            "summary": "模型升级之外，我更想看它能不能把一个完整任务稳稳做完。",
            "source": "Anthropic",
            "sourceDate": "2025-09-29",
            "url": "https://www.anthropic.com/news/claude-sonnet-4-5"
          }
        ],
        "sample": true
      },
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "18:00",
        "items": [
          {
            "title": "Claude Code 增加检查点与原生 VS Code 扩展",
            "summary": "我最在意检查点：让 AI 放手干之前，先给自己留条退路。",
            "source": "Anthropic",
            "sourceDate": "2025-09-29",
            "url": "https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously"
          }
        ],
        "sample": true
      }
    ]
  },
  {
    "date": "2025-08-07",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "items": [
          {
            "title": "OpenAI 发布 GPT-5",
            "summary": "不用反复选模型是好事，但真正省不省心，还得看复杂任务里的表现。",
            "source": "OpenAI",
            "sourceDate": "2025-08-07",
            "url": "https://openai.com/index/introducing-gpt-5/"
          }
        ],
        "sample": true
      },
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "18:00",
        "items": [
          {
            "title": "GPT-5 面向开发者开放",
            "summary": "开发者不只看分数。我会先对比工具调用是否稳定，再看速度和成本。",
            "source": "OpenAI",
            "sourceDate": "2025-08-07",
            "url": "https://openai.com/index/introducing-gpt-5-for-developers/"
          }
        ],
        "sample": true
      }
    ]
  }
]
// NEWS_DATA_END
;
// Historical examples remain a fallback until a populated real edition is available.
export function visibleNewsDays(days=newsDays){
 const valid=Array.isArray(days)?days.filter(d=>d&&typeof d.date==='string'&&Array.isArray(d.editions)).map(d=>({...d,editions:d.editions.filter(e=>e&&Array.isArray(e.items)&&e.items.length)})):[];
 const hasReal=valid.some(d=>d.editions.some(e=>e.sample!==true));
 return valid.map(d=>({...d,editions:d.editions.filter(e=>!hasReal||e.sample!==true)})).filter(d=>d.editions.length).sort((a,b)=>b.date.localeCompare(a.date));
}
export function defaultNewsDate(today,days=newsDays){const dates=visibleNewsDays(days).map(d=>d.date);return dates.includes(today)?today:dates[0]??null;}
