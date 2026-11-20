# 进度：任务卡多对话修复（task-card-multi-conv-20261119-1315）

更新：2026-11-19 13:45 CST（收尾对话，任务卡 c79392ae）

## 结论
- 源码修复：完成（4 个模块，见 task.md「修改」）。
- 无头自检：完成，全部通过。
- 构建：完成（node scripts/update.cjs，BUILD_EXIT=0，2026-11-19 13:25 CST）。
- 本地提交：见下方「提交」。未推送。
- 真实界面验收：未完成。构建只发布到仓库运行目录 E:\OpenCode-Source-Recovery-20261013\opencode；实际提供隧道的正式安装 E:\opencode 尚未部署（本次按授权不运行 deploy-to-E.cmd、不启停 OpenCode）。

## 根因（摘要，详见 task.md）
1. R1：工具 schema additionalProperties=false，调用附带 task_id 被 module-0041 校验拒绝，显式归属走不到；同客户端多张开放卡只能按标签猜测 → 歧义不归属 → 卡 20 分钟后变「已停滞」。
2. R2：无 task_id / overview_session_id 的非 new_task 写入在新 MCP 会话（新 owner）下找不到原卡，直接新建一张卡（复现中的 89a6ab27），原卡 baf16e67 永远 running。
3. R3：awaiting_sync（已停滞）被 partitionBridgeTaskDisplay 放进「进行中」；ocConvTone 让运行中调用覆盖 AI 写入的 completed。
4. R4：liveDialogueEntries 把持久会话的无卡调用当成“被覆盖”隐藏；一次性连接按相同标签合并为 1 条。

## 修改的文件
- recovered/esm/000-extension.js/module-0143.mjs：dispatch 剥离工具未声明的 task_id/overview_session_id 作为 cardRef（含 bridge_batch 子调用）；set_todos/update_plan 回执前缀「【本对话任务卡 task_id=…】」。
- recovered/esm/000-extension.js/module-0144.mjs：显式 task_id 归属优先；标签猜测仅限一次性连接；无目标写入报 TASK_TARGET_REQUIRED 不建卡；多张同类开放卡时提示附带 task_id；liveDialogueEntries 修正。
- recovered/esm/027-workbench.desktop.main.js/module-2763.mjs：awaiting_sync 归「未完成」。
- recovered/esm/027-workbench.desktop.main.js/module-2764.mjs：awaiting_sync 红色「已停滞」；completed 始终显示「已完成」。
- 新增 tasks/task-card-multi-conv-20261119-1315/（task.md、progress.md、selftest-multi-conv.mjs、run-selftest.mjs、build.log）。

## 测试结果（2026-11-19 收尾时在 PC 上重跑）
- node --check：4/4 通过（module-0143、0144、2763、2764）。
- 回归套件 tasks/task-system-truth-20261118-2045/run-selftest.mjs：25 通过，0 失败。
- 新套件 tasks/task-card-multi-conv-20261119-1315/run-selftest.mjs：21 通过，0 失败（「全部套件通过」）。修改前快照 pre/task-card-multi-conv-20261119-1315 上新套件为红（前一对话记录）。
- 构建产物核对：opencode/resources/app/extensions/opencode/dist/extension.js（13:24）含 TASK_TARGET_REQUIRED、splitCardRef；workbench.desktop.main.js（13:24）含 awaiting_sync → error/已停滞 分支。
- 源文件与预期修改逐字节核对一致（忽略行尾/末尾换行）。

## 未验证 / 待用户
- 未部署到 E:\opencode，未重启 OpenCode，因此实际服务中的面板行为（多对话各有卡、完成即显示已完成、已停滞归未完成）尚未目视验收。需用户退出 OpenCode 后运行 deploy-to-E.cmd 并重启再看。
- 构建时 sourceDirty=true：工作区还有其他对话的未提交改动（不属本任务），构建产物同时包含它们。
- 测试残留卡：baf16e67（复现用 running 卡）、89a6ab27（误建的已完成卡）——处理结果见收尾回报。
