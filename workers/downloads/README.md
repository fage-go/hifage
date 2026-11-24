# HiFage 下载服务：共享 Release 快照

这个分支只用于发布现有 Cloudflare Worker `hifage-downloads`，不用于 GitHub Pages。不要合并到 `main` 来部署，亦不需要修改网站。它仍使用 Workers Free：SQLite Durable Object 一仓一个实例，不需要 R2、KV、付费或 GitHub token。APK 本体仍来自原有 GitHub Release，现有包含 tag 与 asset ID 的链接、二维码、Range 不改。

## 一次连接

1. 在 [Cloudflare 控制台](https://dash.cloudflare.com/) 的 **Workers & Pages** 打开**现有** `hifage-downloads`。先确认其自定义域为 `download.hifage.com`、账户的 **Workers** 计划是 Free。记录 **Deployments** 顶端旧版本用于回滚。不要点「创建应用」、不要改 DNS/域名、不要升级套餐。
2. 在该 Worker 的 **Settings → Build → Connect**，选择 GitHub `fage-go/hifage`。仅授权这个仓库（若 GitHub 显示授权选择）。设置：
   - Production branch：`worker-durable-release`；不要选 `main`。非生产分支构建保持关闭。
   - Root directory：`workers/downloads`
   - Build command：`npm test`
   - Deploy command：`npx wrangler deploy`
   - 默认的 Cloudflare Workers Builds 凭证即可，不要把 token 复制到聊天。在 Build variables 设 `NODE_VERSION=24`，不是运行时 secret。
3. 确认 Screen 上的 Worker 名、分支与路径都正确后启动现有 Worker 的第一次部署。如果保存后没有自动开始，在 Builds 中点本分支的 **Start build**。若页面要求付费、提示覆盖其他 Worker 或提示删除/转移原域名，先停止，不要继续确认。

不用手动新建 Durable Object，也不用单独添加 Cron：`wrangler.toml` 会在同一次部署创建 SQLite 类和绑定、添加 `*/15 * * * *`。不声明 route(s)，由 Dashboard 保留现有域名。部署后仍要在 **Settings → Domains & Routes** 验证域名存在。

## 怎么验

- 两个不同网络发 GET，响应均为 `200`、`Cache-Control: no-store`、同一 `tag`/两份下载。同一仓库的大小写、GitHub URL 和 owner/repo 写法都归一到同一个对象。
- 这版在空对象时从部署包内经 GitHub 和线上接口双方核对的 `signed-df58525f4d2f` 初始化首值。如果已部署时 GitHub 有更新，不要回写种子或删除对象。下一次 Cron 成功读到新的已验证版本才升版。等触发传播和下一个 15 分钟刻度后，看 `checkedAt` 前进，或查看 Worker 的 **Cron Triggers/Past Events**。
- 用已有 tag 的文件 URL 请求 `Range: bytes=0-15`，应是现有 GitHub 原文件的 206/16 字节；网页上的二维码无需重做。
- GitHub 异常、找不到完整签名双语包、旧版、同日同时间戳异版、同 tag 换资产 ID 均保留上一个已验证版本。数据没有失效时间；30 分钟无成功检查可显示 `stale:true`，不等于缓存过期。旧版确切 tag 的下载仍按原路径。
- 若第一次部署有故障：暂停本分支自动构建，按 Cloudflare 的 **Deployments → Rollback** 选择记录的旧版本；若迁移使历史版本无法直接回滚，可重新部署原逻辑、但保留新 SQLite 类和绑定配置，不删除命名空间。只在确认已恢复旧逻辑后停掉新的 Cron，保持原域名不变。不要清空 Durable Object 来处理上游故障。

[Cloudflare Git 集成说明](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/) · [Workers Builds 设置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) · [Durable Objects Free 计划](https://developers.cloudflare.com/durable-objects/platform/pricing/)
