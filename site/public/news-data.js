// Replace only the strict JSON between the unique markers; never evaluate input as code.
export const newsDays =
// NEWS_DATA_START
[
  {
    "date": "2026-11-20",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "sample": false,
        "items": [
          {
            "title": "Google 将 Genie 4 接入 Gemini API",
            "summary": "开发者可以在 Google AI Studio 试用，或通过 Interactions API 接入。用文字或参考图生成场景后，还能用键盘在里面走动、用文字改天气和物件，适合先验证互动原型。",
            "source": "Google",
            "sourceDate": "2026-11-20",
            "url": "https://blog.google/innovation-and-ai/technology/developers-tools/genie-4-in-gemini-api/"
          },
          {
            "title": "Anthropic 在纳斯达克上市，首笔成交 111.50 美元",
            "summary": "纳斯达克确认 ANT 正式开始交易，首笔成交比昨晚简报里的 83 美元发行价高约 34%。这是开盘成交，不是收盘价。",
            "source": "纳斯达克",
            "sourceDate": "2026-11-20",
            "url": "https://www.nasdaqtrader.com/Trader.aspx?id=MarketSystemStatus"
          }
        ]
      },
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "18:00",
        "sample": false,
        "items": [
          {
            "title": "ChatGPT 手机版开始测试新版底栏",
            "summary": "新版给 Dot 单独留了入口，Codex、项目和生图也能固定到下面。先向符合条件的 Pro 和少量 Plus 灰度；如果设置里出现「New ChatGPT Design」，可以自己开关。",
            "source": "OpenAI",
            "sourceDate": "2026-11-20",
            "url": "https://help.openai.com/en/articles/6825453-chatgpt-release-notes"
          },
          {
            "title": "ChatGPT Business Standard 开始开放 Dots",
            "summary": "美国符合条件的 Business Standard 成员获开放后，可在工作空间创建一个个人 Dot，用来跟进项目或准备周报。仍有使用额度，不是全球全量。",
            "source": "OpenAI",
            "sourceDate": "2026-11-20",
            "url": "https://help.openai.com/en/articles/11391654-chatgpt-business-release-notes"
          },
          {
            "title": "Codex CLI 默认开启终端工作区",
            "summary": "更新到 0.171.0 后，可以在主对话旁查找文档预览、看图片、读子代理记录，不用来回切窗口。模型列表也加入 GPT‑6.2 Sol 和 Astra。",
            "source": "OpenAI",
            "sourceDate": "2026-11-20",
            "url": "https://github.com/openai/codex/releases/tag/rust-v0.171.0"
          },
          {
            "title": "腾讯混元公开 Hy4 正式版权重",
            "summary": "Hy4 之前已在腾讯产品中上线，这次新增的是可下载的模型权重，包括正式版、FP8 和基础模型；适合想自己部署的人，不是元宝的一次新功能上线。",
            "source": "腾讯混元",
            "sourceDate": "2026-11-20",
            "url": "https://github.com/Tencent-Hunyuan/Hy4"
          }
        ]
      }
    ]
  },
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
