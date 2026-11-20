# 首页小游戏
两个直接入口：比骰子、石头剪刀布。共用独立 native dialog，不改变“游戏体验”栏目、下载、资讯或路由。
实现：MiniGames.astro + mini-games.js + mini-games.css，Hero/HomePage 仅接入。未新增依赖。
骰子：两次独立等概率 d6，记录当前页面的胜负平。
猜拳：玩家选手势，发哥独立随机三选一；先赢两次结束，平局不加分。再来一局只重置猜拳当前比赛。
Web Crypto Uint32 拒绝采样避免取模偏差，无联网、登录、奖品和持久化。
关闭中途取消未揭晓一轮，不扣/加分；重开保持已完成轮次，刷新重置。
键盘、Esc、焦点恢复、44px 触控、屏幕阅读器状态、reduced-motion 已实现。
测试：在 site/ 中 npm run build && npm run test:built。
子路径：SITE_BASE=/hifage/ npm run build && SITE_BASE=/hifage/ npm run test:built。
Node测试包括36骰子组合/9猜拳组合、拒绝采样、胜负平、先赢2次、重置隔离、取消旧回调、连点、焦点、根/子路径。
