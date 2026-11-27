// Replace only the strict JSON between the unique markers; never evaluate input as code.
export const newsDays =
// NEWS_DATA_START
[
  {
    "date": "2026-11-27",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "09:00",
        "sample": false,
        "items": [
          {
            "title": "真机机器人测试拿第一，成功率仍只有三成",
            "summary": "Black Forest Labs 今晨展示 FLUX 3 Action 真机操作。Poke & Wiggle 榜单上，它在包含分拣螺丝、开工具箱等任务的组别拿第一，整体成功率约 30%，物件摆到训练范围外时约 16%。这是评测结果与新演示，不是新模型发布。",
            "source": "Black Forest Labs / Poke & Wiggle",
            "sourceDate": "2026-11-27",
            "url": "https://x.com/bfl_ai/status/2126025443157664229"
          },
          {
            "title": "Claude Agent 可以在编辑器对话里管插件了",
            "summary": "Claude Agent ACP 适配器 v0.113.0 在受支持的编辑器会话里加入 /plugin，可查看、安装或更新插件；变更成功后会尝试在当前会话重新载入。适用于已接入该版适配器的客户端，不是 Claude Code 主程序发布。",
            "source": "Agent Client Protocol GitHub Releases",
            "sourceDate": "2026-11-26",
            "url": "https://github.com/agentclientprotocol/claude-agent-acp/releases/tag/v0.113.0"
          }
        ]
      }
    ]
  },
  {
    "date": "2026-11-26",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "09:00",
        "sample": false,
        "items": [
          {
            "title": "Nothing 展示能录会议的耳机盒",
            "summary": "Nothing 的新预告展示了 Ear (note)：耳机用来录通话，带麦克风的充电盒用来录现场会议，录音可转写并整理摘要。完整发布定在 12 月 8 日，目前不是开卖公告。",
            "source": "Nothing 官方 X",
            "sourceDate": "2026-11-25",
            "url": "https://x.com/nothing/status/2125590327189021093"
          },
          {
            "title": "Kimi Code 能看见模型收到了什么",
            "summary": "桌面版 1.5.0 在「设置 → Lab」新增实验性的上下文用量面板，能逐项查看送给模型的内容。当前轮还在运行也可以先排队压缩上下文，完成后会显示 Token 变化；这不是账单。",
            "source": "MoonshotAI GitHub Releases",
            "sourceDate": "2026-11-25",
            "url": "https://github.com/MoonshotAI/kimi-code/releases/tag/kimi-code-desktop%401.5.0"
          },
          {
            "title": "Zed 预览版可以只给当前会话换模型",
            "summary": "Zed 1.31.0 预览版可以为当前会话单独选模型、配置和思考强度，不改变默认值。Mac 在下拉选择器里用 Command+Enter 或 Command+点击，Windows 和 Linux 用 Ctrl。",
            "source": "Zed GitHub Releases",
            "sourceDate": "2026-11-26",
            "url": "https://github.com/zed-industries/zed/releases/tag/v1.31.0-pre"
          }
        ]
      },
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "20:00",
        "sample": false,
        "items": [
          {
            "title": "Codex 补发的重置卡已可使用",
            "summary": "Tibo 确认，因 GPT‑6.2 用量计费更正补发的重置卡已上线，覆盖符合条件的 Go、Plus、Pro 和 Business 用户。在 Codex 用量设置里手动使用，不会自动清空已用额度；卡覆盖的额度至少有一项剩余低于 80% 时才能用。",
            "source": "Tibo / OpenAI",
            "sourceDate": "2026-11-26",
            "url": "https://x.com/thsottiaux/status/2125853628250599730"
          },
          {
            "title": "Hex 更新：录音和视频文件可以直接转文字",
            "summary": "开源语音输入工具 Hex 3.5.0 新增音视频文件转写命令，不用先打开应用；长录音会在较安静的位置切段。新版还给会议录音增加了小浮条，可以停止录制或复制转写稿。",
            "source": "Anomaly GitHub Releases",
            "sourceDate": "2026-11-26",
            "url": "https://github.com/anomalyco/hex/releases/tag/v3.5.0"
          }
        ]
      }
    ]
  },
  {
    "date": "2026-11-25",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "09:00",
        "sample": false,
        "items": [
          {
            "title": "Claude 做的小工具可以装到电脑桌面了",
            "summary": "Claude 为 Mac 和 Windows 推出测试功能，符合条件的 Artifacts 可以有独立图标和窗口。适合把常用小工具留在桌面，但打开时仍需联网并登录 Claude Desktop。",
            "source": "Anthropic",
            "sourceDate": "2026-11-25",
            "url": "https://claude.com/resources/articles/install-as-app"
          },
          {
            "title": "ChatGPT 开始向少量 Pro 用户试推 Chat 与 Work 合并",
            "summary": "Tibo 确认合并体验开始小范围开放。OpenAI 另说明，12 月起 Plus、Pro、Business 将逐步使用共享额度，Instant 快速聊天不扣；本批试用用户是否同步改变计量未说明。",
            "source": "Tibo / OpenAI",
            "sourceDate": "2026-11-25",
            "url": "https://x.com/thsottiaux/status/2125284868414394550"
          },
          {
            "title": "LobeHub 统一智能体、技能与连接器的市场入口",
            "summary": "开源版 v2.3.6 把 Agents、Skills 和 Connectors 放在同一市场，并为从 GitHub 导入的技能增加更新检查。已经在用 LobeHub 的人，可以少到几个地方找工具。",
            "source": "LobeHub GitHub Releases",
            "sourceDate": "2026-11-24",
            "url": "https://github.com/lobehub/lobehub/releases/tag/v2.3.6"
          },
          {
            "title": "ShellBench 发布：AI 找对答案，还得交出依据",
            "summary": "OpenClaw 基金会等发布 100 项贴近实际工作的任务测试。一个订餐任务里，很多结果找对了餐厅，却因没标出支撑预算或时间的文件而未过关。",
            "source": "OpenClaw Foundation",
            "sourceDate": "2026-11-24",
            "url": "https://openclaw.ai/blog/shellbench"
          }
        ]
      },
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "20:00",
        "sample": false,
        "items": [
          {
            "title": "千问 Go 免费开放代打电话",
            "summary": "在千问 App 里说清打给谁、几点打、要问什么，确认授权后就能代拨，也可以预约时间。适合问餐厅有没有包间、联系酒店找遗失物品；接通后会表明 AI 助手身份，并把沟通结果带回来。",
            "source": "千问 App 官方公众号",
            "sourceDate": "2026-11-25",
            "url": "https://mp.weixin.qq.com/s/jZumD5cprhI7bgmOI7mUEw"
          },
          {
            "title": "OpenClaw 可以把浏览器交还给人操作",
            "summary": "OpenClaw 2026.11.10 新增浏览器接管：在控制台的 Browser 面板，人可以接手当前页面，不必先停掉智能体。新版还支持预演升级，方便自部署用户检查更新。",
            "source": "OpenClaw GitHub Releases",
            "sourceDate": "2026-11-25",
            "url": "https://github.com/openclaw/openclaw/releases/tag/v2026.11.10"
          },
          {
            "title": "Claude Code 的斜杠菜单可以显示 MCP 技能",
            "summary": "Claude Code 2.1.332 把服务器提供的技能带进斜杠菜单，名称显示为「服务器:技能」，目前为测试功能。新版也改善了桌面版和 VS Code 在部分会话未保存时的提示。",
            "source": "Anthropic GitHub Releases",
            "sourceDate": "2026-11-25",
            "url": "https://github.com/anthropics/claude-code/releases/tag/v2.1.332"
          }
        ]
      }
    ]
  },
  {
    "date": "2026-11-24",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "sample": false,
        "items": [
          {
            "title": "GPT-6.2 Sol 开始进入 ChatGPT 普通聊天",
            "summary": "不必切到 Work：面向日常对话的 Sol 版本开始向 Plus、Pro、Business 和 Enterprise 分批开放，企业用户受管理员设置影响。可以试着上传一张截图，让它按指定条件提取信息；这次不改 Work 或 Codex 的模型。",
            "source": "OpenAI",
            "sourceDate": "2026-11-24",
            "url": "https://x.com/ChatGPT/status/2124942186425069836"
          },
          {
            "title": "智谱清言和 Z.ai Chat 也能体验 GLM-5.4",
            "summary": "除了上期提到的 Coding Plan，智谱确认 GLM-5.4 也已上线智谱清言和 Z.ai Chat。想对照新版看图或问答，不必先配置编程工具；聊天入口的免费额度未在这次公告中说明，API 仍待开放。",
            "source": "智谱 Z.ai",
            "sourceDate": "2026-11-23",
            "url": "https://z.ai/blog/glm-5.4"
          },
          {
            "title": "Google 搜索 AI 模式开始支持连接 Wallet",
            "summary": "入口出现在「搜索个性化 → 已连接的应用」后，可以自行打开或关闭。连接后 AI 模式能读取部分消费信息，但不能转账；接入 Drive 和 Gemini 对话还要等接下来几周。",
            "source": "Google",
            "sourceDate": "2026-11-24",
            "url": "https://blog.google/products-and-platforms/products/search/google-search-personal-intelligence-apps/"
          },
          {
            "title": "Dot 通话结束后可以查看文字记录",
            "summary": "OpenAI 团队成员 Samir 说，Dot 通话结束后会提供转录，方便回头核对刚才交代了什么。它是通话记录，不代表事项已经办完，结果仍要看任务回执。",
            "source": "Samir / OpenAI",
            "sourceDate": "2026-11-23",
            "url": "https://x.com/_samirism/status/2124862750643896648"
          },
          {
            "title": "新建 ChatGPT Business 工作区可获得临时双倍用量",
            "summary": "Tibo 表示，11 月 30 日前创建的 Business 工作区，各席位类型的套餐内用量翻倍至 12 月 31 日。已有工作区只收到后续权益的预告，具体规则和截止时区未公布。",
            "source": "Tibo / OpenAI",
            "sourceDate": "2026-11-24",
            "url": "https://x.com/thsottiaux/status/2124922313019953319"
          }
        ]
      },
      {
        "id": "pm",
        "title": "发哥晚报",
        "time": "20:00",
        "sample": false,
        "items": [
          {
            "title": "豆包个人助理「小豆」开启邀请制公测",
            "summary": "小豆是独立 App，主打记住你交代的事情并主动跟进。现在需要邀请码，受邀可获一定免费额度；豆包称相关能力以后会逐步加入豆包 App。",
            "source": "豆包官方",
            "sourceDate": "2026-11-24",
            "url": "https://sina.cn/news/detail/5368723595591761.html"
          },
          {
            "title": "Gemini 4 Neon 开始向 Google Workspace 用户开放",
            "summary": "用公司或组织账号登录 Gemini App，可以看看模型选择器有没有 Neon。这次说的是 Gemini App，不是 Gmail 或 Docs 内的 Gemini；具体覆盖哪些 Workspace 版本，团队暂未说明。",
            "source": "Logan Kilpatrick / Google",
            "sourceDate": "2026-11-24",
            "url": "https://x.com/OfficialLoganK/status/2125018427790344654"
          },
          {
            "title": "腾讯开源翻译模型 Hy-MT3，覆盖 102 种语言",
            "summary": "腾讯混元公开三个大小版本的模型权重，最小的 1.8B 版提供可配合 llama.cpp 使用的文件。想自己部署文档翻译，或试试在翻译中固定术语，可以从小版开始。",
            "source": "腾讯混元",
            "sourceDate": "2026-11-24",
            "url": "https://github.com/Tencent-Hunyuan/Hy-MT3"
          },
          {
            "title": "OpenCode Go 订阅用户可限时试用 HungerG",
            "summary": "已经订阅 OpenCode Go 的用户，可到模型列表选 HungerG Free 限时试用；免费的是这款模型的调用，不是 Go 订阅。模型出自谁家还没公开。",
            "source": "OpenCode",
            "sourceDate": "2026-11-24",
            "url": "https://opencode.ai/docs/console/go/"
          }
        ]
      }
    ]
  },
  {
    "date": "2026-11-23",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "sample": false,
        "items": [
          {
            "title": "ChatGPT 桌面团队公布会话加载提速数据",
            "summary": "OpenAI 工程师分享了桌面团队的测量结果：打开尚未加载的会话快 80%，切换已打开的会话快 30%，应用启动快 10%。Mac 和 Windows 的安装包分别小了 35% 和 25%；这些数字说的是应用体验，不是模型回答速度。",
            "source": "Jimmy Lai / OpenAI",
            "sourceDate": "2026-11-23",
            "url": "https://x.com/feedthejim/status/2124603771951157579"
          },
          {
            "title": "开源小游戏 Worker 755 让玩家给 AI 打工",
            "summary": "作者在 Show HN 展示了这个浏览器游戏：AI 当主管，玩家反过来扮演它的子代理，在模拟终端里接任务、交结果。想看看人和 AI 换个位置会发生什么，可以从项目页了解玩法。",
            "source": "Worker 755",
            "sourceDate": "2026-11-22",
            "url": "https://github.com/gulivan/worker755"
          },
          {
            "title": "OpenAI 公开模型预训练曲线，提议设行业共同阈值",
            "summary": "首席科学家 Jakub Pachocki 公布了 OpenAI 用来衡量模型预测下一个词元能力的一组数据，并建议多家开发者一起设定安全阈值。这是研究倡议，不是已生效的行业规则，也没有发布新模型。",
            "source": "OpenAI",
            "sourceDate": "2026-11-23",
            "url": "https://openai.com/index/perplexity-and-intelligence/"
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
            "title": "智谱 GLM-5.4 上线 Coding Plan，新增看图能力",
            "summary": "所有 GLM Coding Plan 订阅者都可以用新版。按周计额度的用户，使用 GLM-5.4 的周额度比 5.3 多 50%；在 Claude Code 中选择 glm-5.4[1m]，其他工具用 glm-5.4。",
            "source": "智谱 Z.ai",
            "sourceDate": "2026-11-23",
            "url": "https://x.com/ZixuanLi_/status/2124719275864670681"
          }
        ]
      }
    ]
  },
  {
    "date": "2026-11-22",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "sample": false,
        "items": [
          {
            "title": "Lean 与 Mathlib 联合验证通过黎曼猜想证明",
            "summary": "两套工具核对了题目，确认 Alpöge 在 Claude 协助下证明的正是经典黎曼猜想；多套检查器也验证了证明。克雷数学研究所官网仍列为未解，不能把这次验证写成千禧奖认定。",
            "source": "Lean / Mathlib",
            "sourceDate": "2026-11-21",
            "url": "https://leanprover-community.github.io/blog/posts/riemann-hypothesis/"
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
            "title": "OpenRouter 调整 125 个端点的零数据保留资格",
            "summary": "OpenRouter 公布，已移除 3 家推理服务商，并取消 125 个端点的零数据保留资格，其中部分属预防性调整。平台表示已通知可能受影响的客户；若业务要求不保留请求数据，可重新核对所用端点是否仍符合条件。",
            "source": "OpenRouter",
            "sourceDate": "2026-11-22",
            "url": "https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/"
          },
          {
            "title": "DeepSeek Harness 测试版加入飞书和腾讯文档连接器",
            "summary": "新版可在插件页授权飞书、腾讯文档和 Notion 等服务，再回到对话中使用。这是 DeepSeek Harness 工具的 Alpha 测试版，不是 DeepSeek 聊天 App 或模型更新。",
            "source": "DeepSeek Harness",
            "sourceDate": "2026-11-22",
            "url": "https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.3-alpha.1"
          }
        ]
      }
    ]
  },
  {
    "date": "2026-11-21",
    "editions": [
      {
        "id": "am",
        "title": "发哥早报",
        "time": "06:00",
        "sample": false,
        "items": [
          {
            "title": "Google AI 黑五优惠向部分老用户提前开放",
            "summary": "Google 的美国订阅页已挂出会员提前购。官方产品负责人称，已有 AI 或存储订阅的用户可在 11 月 26 日前查看指定 AI Plus 和年度 AI Pro 优惠，最高五折；实际价格和续费条件以 Google One 登录后显示为准。",
            "source": "Google",
            "sourceDate": "2026-11-21",
            "url": "https://gemini.google/us/subscriptions/"
          },
          {
            "title": "Antigravity 预告 Neon 缓存更新后会重置额度",
            "summary": "Varun Mohan 表示，团队在扩大 Neon 的缓存容量，更新推完后会重置额度。截至截稿未确认已经重置，具体覆盖范围也未公布；自己的余额可以在 Antigravity 设置里看。",
            "source": "Varun Mohan",
            "sourceDate": "2026-11-21",
            "url": "https://x.com/_mohansolo/status/2123848516581892181"
          },
          {
            "title": "Watch Duty 用 Gemini 从消防电台里识别火情",
            "summary": "这家美国野火预警机构把嘈杂的电台对讲转成实时文字，先给值班人员标出疑似火情，再由团队核实并发通知。Google 分享的是这套辅助流程，不是让 AI 自己发布警报。",
            "source": "Google.org",
            "sourceDate": "2026-11-21",
            "url": "https://blog.google/company-news/outreach-and-initiatives/google-org/watch-duty-gemini-tool/"
          },
          {
            "title": "Inkling 2 Mini 开放下载，支持在 Mac 本地运行",
            "summary": "Thinking Machines Lab 发布了可接收文字和图片的开放权重模型。官方给出的 Mac 运行方式是用 Ollama，建议至少 32 GB 内存；想离线试模型，可以先核对自己的机器配置。",
            "source": "Thinking Machines Lab",
            "sourceDate": "2026-11-21",
            "url": "https://thinkingmachines.ai/news/inkling-2-mini/"
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
            "title": "Claude Code 终端里可以直接画图表",
            "summary": "v2.1.330 加入内置图表工具 easel。在 macOS 和 Linux 上，Pro、Max 及部分 Team、Enterprise 用户可以让它画图，部分工具的指标结果也会自动出图；不想自动显示可以在 /config 关闭。",
            "source": "Anthropic",
            "sourceDate": "2026-11-21",
            "url": "https://github.com/anthropics/claude-code/releases/tag/v2.1.330"
          },
          {
            "title": "黎曼猜想候选证明通过 LUMI 超算独立复编译",
            "summary": "另一组核查者复编译了 Alpöge 与 Claude 合作提交的 Lean 证明，175,187 个模块全部通过，主定理的编译产物与 MIT 的核查一致。复现增加了一份独立证据，克雷数学研究所仍将黎曼猜想列为未解。",
            "source": "LUMI 复核记录",
            "sourceDate": "2026-11-21",
            "url": "https://github.com/aapolipponen/rh-lean-check-lumi/commit/6b4f49f0770326efb9fd6e2b6f1d37304ce6c529"
          }
        ]
      }
    ]
  },
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
