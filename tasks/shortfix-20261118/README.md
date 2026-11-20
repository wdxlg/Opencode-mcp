# shortfix-20261118 — 对话系统短板修复

来源：与 dsh 0.2.1-rc.5、Cursor 的代码级对比后，用户要求一次修完并提交打包（2026-11-18 22:53）。

## 改动
1. **压缩/请求时卸载旧图片**（agent-host `module-0029.mjs`）：每一步请求前只保留最近 N 张图片（设置 `opencode.context.maxImages`，默认 6，0 = 不限；环境变量 `OPENCODE_CONTEXT_MAX_IMAGES`），更早的截图/工具图片换成一行占位文字；最新一条用户消息的图片始终保留。参照 dsh-compaction-image-offload。
2. **任务卡提醒降噪**（`module-0144.mjs`）：很多 MCP 客户端每次调用都换连接（owner 变化），原按 owner 节流从不生效。改为按客户端标签节流；该客户端 30 分钟内有未完成卡时不再提示；否则最多每 10 分钟一次（`OPENCODE_TASK_HINT_INTERVAL_MS`，0 = 只提示一次）。
3. **前台命令软并发上限**（`module-0165.mjs`）：所有对话合计的前台命令数达到上限时排队最多 60 秒，然后照常启动并在结果里附 `concurrency_warning`，从不拒绝（保持「不因数量拒绝」的既有设计）。设置 `opencode.commands.maxConcurrent`（留空 = max(4, 逻辑核数)，0 = 不限）；环境变量 `OPENCODE_MAX_RUNNING_COMMANDS` 优先。后台命令不计入。
4. **后台命令跨连接保留与接管**（`module-0165.mjs`）：MCP 会话结束时，正在运行的后台命令不再随会话被强杀，保留 30 分钟（`OPENCODE_ORPHAN_COMMAND_TTL_MS`，0 = 旧行为）；新连接凭原 command_id（只返回给原调用方的不透明令牌）读取即接管该命令及其终端。
5. 设置项登记于 `assets/resources/app/extensions/opencode/package.json`；`module-0177.mjs` 把 `opencode.context.maxImages` 传给 agent-host。

## 未做
- 「重叠功能合并」：逐个读后确认四套「审查」（ai-review 审 AI 改动、ai-code-review 让模型审 diff、collaboration-review 审协作快照、multica review-gate 合并门）职能不同，不是重复；权限各层作用域也不同。真正重复的只有定时：autopilot-store 与 multica/autopilot（92 行，投递到收件箱/插话）。合并会去掉「插话投递」，需用户决定，未动。
- 不把 recovered/ 重写为 TS。

## 验证
- `node tasks/shortfix-20261118/selfcheck-image-offload.mjs` 通过
- `scripts/test-command-limits.mjs`、`test-concurrency.mjs`、`test-cursor-parity.mjs`、`test-hark-features.mjs`、`test-multica-borrow.mjs`、`test-managed-bash-safety.mjs`、`test-rules-dispatch.mjs` 通过
- 构建：`node scripts/update.cjs` → `hark_build_shortfix.log`，BUILD_EXIT 0，已发布到 `opencode/`（按 README，打包即发布到 opencode/，不生成 ZIP）
- 正在运行的 OpenCode 实例需重启后才加载新代码。
