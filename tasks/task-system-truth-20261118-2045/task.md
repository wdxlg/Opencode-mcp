# 任务系统修复：任务卡显示与真实进度一致（task-system-truth-20261118-2045）

## 总目标
修复 Bridge 任务卡 / 侧栏「任务」面板“显示 ≠ 真实”的问题：AI 做了但没卡或卡没更新、完成了显示未完成、无状态 MCP 连接接不上旧卡等。

## 状态
- 源码修改：完成（module-0144 / module-0143 / module-2764 / module-0161）
- 无头自检：见 progress.md
- 构建：见 progress.md
- 运行中界面目视验证：未执行（需用户重启 OpenCode 后确认）

## 根因与修复（摘要）
1. MCP 会话结束即把卡标 executionUnverified → 面板“已中断”。无状态客户端每次调用都结束会话，所以卡几乎总显示中断。修复：断开只记录时间，不再标中断；只有 OpenCode 重启、被同对话新任务取代、用户手动标记才显示中断，并附 interruptReason。
2. 无状态调用每次是新 owner，活动不刷新卡 → 20 分钟后“等待同步”。修复：按真实证据（本 owner 的卡 / 参数 task_id / overview_session_id / 同一客户端唯一开放卡）归属活动；无写卡也无活动 20 分钟才标“已停滞”(stalled, stalledForMs)。
3. liveDialogueEntries（未建卡活动）定义了但从未接入 snapshot → 没建卡的工作面板为空。修复：接入，保留 6 小时，3 分钟无活动标已停滞，可删除。
4. 完成写回被拒且无回退：顶层 status:"completed" 被判非法字段；task_id 截断一位 → Unknown task_id；同对话过期 expected_revision → 冲突。修复：status→lifecycle 别名；唯一前缀 / overview_session_id 纠正 task_id；同一对话（同 owner+同 overview_session_id、期间无接班）过期修订按最新应用并在回执说明。
5. 同一对话开新任务时，未完成旧卡被直接隐藏 → 未完成工作“消失”。修复：未完成旧卡保持可见，显示中断（superseded）。
6. 已建卡对话的无状态调用仍反复收到“本对话还没有任务卡”提示并生成重复的“对话进行中”条目。修复：已归属调用不再提示、不再生成条目。

## 使用方法
- 自检：node tasks/task-system-truth-20261118-2045/run-selftest.mjs
- 构建：node scripts/update.cjs（运行中实例会改为 opencode.next 延迟发布，不会停用户实例）

## 快照
- 修改前 tag：pre/task-system-truth-20261118-2045（HEAD ce2923a4）；修改前副本：backup/task-system-truth-20261118-2045/
