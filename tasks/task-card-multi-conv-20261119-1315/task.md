# 任务：任务卡多对话修复（task-card-multi-conv-20261119-1315）

状态：完成（源码修复 + 无头自检 + 构建）；真实界面验收：未完成（需用户重启 OpenCode 并部署到 E:\opencode 后目视确认）

## 总目标
用户反馈（2026-11-19）：4 个对话连到 MCP，面板只显示 1 条「未建卡的活动」；任务完成后仍显示「进行中」。
修好：每个对话的 set_todos 都有自己的可见卡（即使客户端身份完全相同）；AI 写入的终态优先于活动推断；调用按显式 task_id 归属；回执醒目返回 task_id。

## 分目标与状态
1. 确认实际服务的构建 —— 完成。隧道由 E:\opencode\OpenCode.exe（主进程 16144，exthost 11220，2026-11-19 12:53 启动）提供；其 extension.js（2026-11-19 02:01，OPENCODE-RELEASE.json sourceCommit a61912dc）已含昨天 6b842e6e 的代码（attributeActivity/BRIDGE_TASK_ATTRIBUTION_WINDOW_MS 等均存在）。
2. 真实服务端复现 —— 完成。4 个模拟对话（每次调用新 MCP 会话、clientInfo 相同）：R3 不带 task_id/overview_session_id 写完成 → 服务端新建了一张已完成卡 89a6ab27，原卡 baf16e67 仍 running；工具调用带 task_id 被 schema 拒绝（INVALID_ARGUMENT: list_directory.task_id is not an allowed property）。
3. 根因 —— 完成（见下）。
4. 修复 —— 完成。
5. 自检/构建/提交 —— 见 progress.md。

## 根因（修改前快照 pre/task-card-multi-conv-20261119-1315 = aa6c7518 的行号）
- R1 无法归属：除 set_todos/report_progress/记忆等少数工具外，工具 schema 均 additionalProperties=false，调用带 task_id 直接被 module-0041.mjs:120 校验拒绝；module-0144.mjs attributeActivity（159 行起，task_id 分支在 168 行）实际上走不到。多个同客户端开放卡时按标签猜测（172-173 行）判为歧义 → 不归属 → 卡在 20 分钟后显示「已停滞」。
- R2 完成写到新卡：module-0144.mjs update()（535 行 resolve、610/626 行新建）：无 task_id、无 overview_session_id、非 new_task 的写入在新 owner 下 previous=undefined，直接新建卡（完成态），原卡永远 running。
- R3 「已停滞」仍归「进行中」：module-2763.mjs partitionBridgeTaskDisplay（39 行）把 awaiting_sync（卡 20 分钟无证据、未建卡行 3 分钟无调用）放进 slots=「进行中」；未建卡行在其中最多保留 6 小时。module-2764.mjs ocConvTone（722-723 行）把 awaiting_sync 也算「回复中」色调，且已完成卡只要还有运行中调用就显示「回复中」（活动覆盖了 AI 写入的完成态）。
- R4 未建卡对话被遮住/合并：module-0144.mjs liveDialogueEntries（1045 行）只要同标签有开放卡就把无卡调用当作“被覆盖”隐藏，持久会话（如今天 a70a6634：100+ 次调用、从未建卡）因此不可见；标签猜测（172-173 行）还会把持久会话的调用记到另一对话唯一的开放卡上。一次性连接（≤2 次调用）按标签合并成一条（1049-1050 行），所有客户端标签都是「外部 MCP 客户端」，多个无卡对话只能显示成 1 条。
- 面板刷新：module-2764.mjs 每 350ms 拉取状态，按 id:revision:state 变化重绘（975、1204-1205 行），不是原因。

## 修改（使用方法）
- module-0144.mjs：新增 splitCardRef / cardAckPrefix / TASK_TARGET_REQUIRED_MESSAGE；attributeActivity 先认显式 task_id（含唯一前缀，引用已结束卡只记归属不复活）；标签猜测只用于一次性连接，持久会话撤销旧猜测；update() 对外部 owner 的“无目标非 new_task 写入”报 TASK_TARGET_REQUIRED（不写任何卡）；taskCardHint 在多个同类开放卡时提示附加 task_id；liveDialogueEntries 只对一次性连接做“被覆盖”隐藏，显式引用过卡的连接不算未建卡。
- module-0143.mjs：dispatch() 对远程调用用 splitCardRef 剥离工具未声明的 task_id/overview_session_id，作为 extra.cardRef 传给归属/提示（含 bridge_batch 子调用）；新增 toolDeclaresArgument；set_todos/update_plan 回执开头加「【本对话任务卡 task_id=…】」及附带要求。
- module-2763.mjs：awaiting_sync 归「未完成」。
- module-2764.mjs：ocConvTone 中 awaiting_sync 为红色「已停滞」；completed 始终「已完成」（有运行中调用时仅加注）。
- 自检：node tasks/task-card-multi-conv-20261119-1315/run-selftest.mjs [--ref pre/task-card-multi-conv-20261119-1315]

## 参考相关性
- 昨日任务 tasks/task-system-truth-20261118-2045：强相关（同一代码路径，回归套件复用）。
