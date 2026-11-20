# 任务：Bridge 自动重连推广到所有隧道模式

- 任务 ID：mcp-tunnel-reconnect-all-modes-20261110-113000-step01
- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027（基于 4de97293）
- 用户原话：「你就把不同模式都更新，我目前的模式不能保证地址完全不变就算了。还有我要的是更新源码然后生成运行版」
- 授权：修改源码、离线测试、npm run build（含 publish-runtime.cjs 发布到 <仓库>\opencode）、本地 commit 与 pre/post tag；不 push；不写入/启停 E:\OpenCode 运行实例，不重启当前提供连接的 Bridge/cloudflared。

## 模式清单（以 module-0114.mjs readTunnelProvider/startTunnelProcess 为准）
| 模式 | 设置值 | 启动方式 | 地址 |
|---|---|---|---|
| Cloudflare 快速隧道 | cloudflare（默认；直连/HTTP 代理中继两条路由） | cloudflared tunnel --config ... --url | 每次新建会变（预期） |
| Cloudflare 命名隧道 | cloudflare-named | cloudflared tunnel run，TUNNEL_TOKEN=保存的令牌 | 固定主机名 |
| ngrok 保留域名 | ngrok | ngrok http <port> --url https://<保留域名> | 固定 |
源码中没有 localtunnel/直连/局域网模式。

## 原有缺陷
1. 命名隧道：没有任何运行期观察器（只给 cloudflare 建了 observer），输出也不按行解析；进程活着但 Tunnel not found/Unauthorized、或断线不再注册时永远不重启，Bridge 页面也不显示重连中。只有进程退出才恢复。
2. ngrok：只有「offline→60 秒截止」，运行期致命会话错误（ERR_NGROK_107/105 令牌失效、334 端点被占用等）不立即重启，要等 60 秒且依赖 offline 行。
3. 重连循环：非快速隧道退避 1/2/4/8/15 秒后每 15 秒无限重试；命名隧道令牌被拒（确定性失败）也无限重试。
4. 三处 restart 逻辑重复（ngrok、Cloudflare 各一份）；原地恢复不写输出通道；恢复日志不区分地址是否变化。

## 修改（module-0114.mjs，只动本任务 hunk；他会话 rea 相关未提交改动不动）
- 新增共用段 bridge-tunnel-recovery：tunnelHasFixedAddress / tunnelRecoveryDelayMs（1,2,4,8,15,30,60 秒封顶；快速隧道保持 1 秒后每 60 秒）/ tunnelRecoveryShouldStop（ngrok 沿用原规则；命名隧道认证失败 3 次后停止并报错）/ tunnelRestartMessage / tunnelRecoveredMessage / restartOwnedTunnel（只停自有隧道进程→beginTunnelRecovery，固定地址模式不清 domain，本地 MCP 服务与会话不停）。
- cloudflareConnectionEvent：gone 带 reason（tunnel-not-found / unauthorized：Unauthorized、invalid tunnel token/secret 等）。
- Cloudflare 观察器同时用于 cloudflare 与 cloudflare-named；命名隧道输出也按行解析（含重复错误抑制）。
- ngrok 观察器：ngrokFatalSessionError 识别运行期致命错误→立即 restart("fatal:<code>")；截止重启传 "deadline"。
- 原地恢复写输出通道「re-registered; tunnel recovered in place」；重连成功写「fixed address unchanged」或「new Quick Tunnel address」，revision+1 刷新 Bridge 页面。
- 固定地址复用：命名隧道重启仍用 ["tunnel","run"] + 同一 TUNNEL_TOKEN；ngrok 仍用同一 --url（测试断言两次 spawn 参数一致）。

## 测试
- node --test scripts/test-tunnel-reconnect.mjs（16 项，日志回放 + 假进程，不联网）
- node --test scripts/test-cloudflare-reconnect.mjs（6 项，结构断言改为共用 restartOwnedTunnel）
- 修改前对照：OC_TUNNEL_SOURCE=<pre 版 module-0114> 应失败 9 项

## 残差
- 快速隧道地址会变，远端 MCP 客户端需拿到新地址（用户已接受）。
- 实机验证需用户切换到新运行版后观察（未执行、未验证）。
