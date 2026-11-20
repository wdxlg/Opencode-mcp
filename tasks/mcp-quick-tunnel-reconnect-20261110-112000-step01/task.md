# 任务：MCP 自动重连不生效（Cloudflare 快速隧道）排查与修复

- 任务 ID：mcp-quick-tunnel-reconnect-20261110-112000-step01
- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027
- 用户原话：「那你继续更新，这个mcp自动重连有问题，根本没重连。我手动关闭然后重新连接正常」
- 授权依据：用户在本次需求中明确要求排查并修复；授权本地构建、离线测试、本地 commit 与 pre/post tag；不 push，不启停 E:\OpenCode 运行实例，不重启当前提供连接的 Bridge/cloudflared。三项确认以需求原文为依据，未重复询问。

## 总目标
断线后 Bridge 能自行恢复公网可达，而不是一直卡在「重连中」直到用户手动关闭重开。

## 分目标与状态
| 分目标 | 状态 |
|---|---|
| G1 定位负责自动重连的组件与源码 | 完成 |
| G2 日志取证，给出根因 | 完成（11:00 前后有证据；03:57 日志已不存在，未验证） |
| G3 最小改动修复 + 离线测试 | 完成 |
| G4 构建、测试、本地提交与 tag | 见 progress.md / 提交记录 |
| G5 实机验证（用户重启 Bridge 后观察） | 未执行、未验证（需用户手动重启） |

## 负责组件
OpenCode 扩展内的 Bridge 服务端（opencode-bridge 0.13.2）：`recovered/esm/000-extension.js/module-0114.mjs`
（原始标记 extensions/opencode/src/bridge-server.ts，内联 bridge-cloudflare-connection.ts / bridge-cloudflare-recovery.ts）。
- `startTunnelProcess()`：拉起 cloudflared，并用 `createCloudflareRecoveryObserver` 解析 cloudflared 日志；
- `child.on("exit")` / `child.on("error")`：进程退出才进入 `beginTunnelRecovery()` 重启隧道；
- `beginTunnelRecovery()`：重新 `startTunnelOnce()`（快速隧道会换新地址）。
MCP 客户端（Hark 一侧）无法得知新地址，不属于本仓库。

## 证据（OBS）
日志：E:\opencode\data\user-data\logs\20261110T090537\window1\exthost\output_logging_20261110T090548\1-OpenCode.log
- 10:50 cloudflared：`Failed to refresh DNS local resolver ... i/o timeout`，随后 `Serve tunnel error ... timeout: no recent network activity connIndex=0`；
- 紧接着 `Register tunnel error from server side error="Unauthorized: Tunnel not found" connIndex=0`，每 ~20–60 秒重试一次，10:50–11:01 共 45 次，进程一直存活、从未退出；
- 期间没有任何 `[bridge] ... reconnect attempt` / `exited unexpectedly` / `tunnel recovered` 记录；
- 11:02 用户手动停止（`[bridge] stopped`），11:03 新建快速隧道后 `Registered tunnel connection`，恢复。
- 09:07–09:10 另有一次 QUIC 超时，同一隧道重新 Registered 后自行恢复（正常对照：隧道仍存在时原逻辑可用）。

## 根因
1. 快速隧道在 Cloudflare 侧被回收后（Tunnel not found），旧地址永远无法恢复，公网访问即 1033/530；但 cloudflared 进程不退出，只无限重试。
2. Bridge 的 Cloudflare 观察器只识别 registered/disconnected：断线时把状态设为「重连中」后**只等 cloudflared 自己重新注册**，没有截止时间、也不识别 `Tunnel not found`；而唯一会重启隧道的路径是进程 exit/error，所以 `beginTunnelRecovery()` 从未被调用。（ngrok 分支有 60 秒截止重启，Cloudflare 分支没有。）
3. 03:57 那次：该时段的 OpenCode 日志目录已不存在，无法取证；从 1033 现象推断为同一机制（推断，未验证）。

## 修改（只改 module-0114.mjs 的 4 处，另一对话在该文件的未提交改动保留不动）
- `cloudflareConnectionEvent`：识别 `Tunnel not found`（文本与 JSON 日志）为 `gone` 事件；JSON 日志把 error 字段并入判断。
- `createCloudflareRecoveryObserver`：`gone` 且处于运行/重连中 → 立即 `restart("tunnel-not-found")`；断线后 90 秒（CLOUDFLARE_RECOVERY_DEADLINE_MS）仍未重新注册 → `restart("deadline")`；重新注册取消计时；dispose 清计时；只触发一次。
- `startTunnelProcess` 接线：`restart` 写明原因到输出通道，`domain` 清空，停止当前 cloudflared，再走既有 `beginTunnelRecovery()`（新地址成功后输出 `[bridge] cloudflare tunnel recovered: <新地址>` 并更新 Bridge 页面）；本地 MCP 服务与会话不停止。
- 新增离线测试 scripts/test-cloudflare-reconnect.mjs（6 项；不联网、不启动 cloudflared/VS Code）。

## 使用方法
- 测试：`node --test scripts/test-cloudflare-reconnect.mjs`
- 对照旧代码：`git show pre/<任务ID>:recovered/esm/000-extension.js/module-0114.mjs > "$TEMP/old-0114.mjs"; OC_CF_SOURCE="$TEMP/old-0114.mjs" node --test scripts/test-cloudflare-reconnect.mjs`（应失败 4 项）
- 提交暂存：`node tasks/<任务ID>/stage.cjs <msg-file>`（只暂存本任务 hunk）

## 残差 / 未完成
- 快速隧道每次重建都会换新地址；远端 MCP 客户端仍需拿到新地址才能连上（固定地址需改用 Cloudflare 命名隧道或 ngrok 保留域名）。
- 实机验证未执行：需用户重启 OpenCode（或在 Bridge 页面停止再启动）让新构建生效后观察。
- SQL 记忆库（.ai-workflow/memory.sqlite）有其他对话未提交改动，本任务未写入，留痕写在 .ai-workflow/logs 与 index 的本任务文件中。
