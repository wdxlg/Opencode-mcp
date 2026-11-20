# 任务记录：step-reset-turn-and-ask-zero-20261103-step01

- **总目标**：修正 OpenCode 90 步 `ask` 防截断规则（`lib_arena_step_budget_guard` v3→v4、`copy-prompt.txt`、`BRIDGE_STEP_BUDGET_RULE`）与服务端步数统计逻辑（`module-0140.mjs`、`module-0143.mjs`），实现：
  1. 每次对话轮次（发送一次对话后开始的回复，含 `ask` 和 `ask` 后的回复）最开始时步数为 `0`，下一次对话轮次也重置步数为 `0`（服务端在 `set_todos(new_task=true)` 直接或通过 `bridge_batch` 调用时自动将步数归零）；
  2. 每次 `ask`（包括普通业务 `ask_user` 和 90 步续接 `ask_user`）都会重置步数为 `0`（移除原先错误的“双轨跟踪整轮累计宿主步数”，允许任意工具或 `bridge_batch` 在每次 `ask` 恢复后传 `reset_step_counter=true` 归零，且 `bridge_ask_user` 回答交付时服务端自动归零）；
  3. 仅在第一次（从当前对话轮次开始 `0` 步起算）或每次 `ask` 重置为 `0` 后达到第 `90` 步（90–99 步窗口）时才触发续接 `ask`（服务端 `trigger_checkpoint_now` 告警阈值从 88 步严格对齐至 90 步）。
- **总目标状态**：完成
- **修改前备份与 Git 快照**：`backup/step-reset-turn-and-ask-zero-20261103-step01/pre/` & `refs/tags/pre/step-reset-turn-and-ask-zero-20261103-step01` -> `f39d7fdc052ce7c28952a08ef3f35564e4818ced`
- **修改后备份与本地隔离提交**：`backup/step-reset-turn-and-ask-zero-20261103-step01/post/`、`refs/tags/post/step-reset-turn-and-ask-zero-20261103-step01` & `refs/heads/task/step-reset-turn-and-ask-zero-20261103-step01` -> `94bdc2ea4dec2bd4af1cbc1000b39063f0aaf83c`
- **子任务状态**：
  1. 只读核查规则库与服务端计数代码并输出对比分析：完成
  2. 通过宿主原生 `ask_user` 确认立即按目标口径修正规则与源码：完成
  3. 建立修改前文件备份与隔离 Git 快照：完成
  4. 更新 `automation-store.mjs`（v3→v4）、`module-0043.mjs`、`002-agent-host.js/module-0028.mjs`、`module-0140.mjs`、`module-0143.mjs`、`bridge-constants.ts`、`defaults/copy-prompt.txt`、`defaults/manifest.json`，执行 `node scripts/update.cjs` 编译同步至 `opencode/`：完成
  5. 原子升级本机实时规则库 `%LOCALAPPDATA%\OpenCode\shared-automation\rules-and-collaboration.v1.json`（revision `118`，ruleVersion `4`）并通过全量校验与单测：完成
- **失败原因**：无（首次 Node ESM 验证脚本缺少 `__dirname` 全局变量，注入 `globalThis.__dirname` 后全部断言一次通过）
- **使用方法**：
  - 当前运行中的 `E:\opencode` 已通过共享规则库 `rules-and-collaboration.v1.json`（修订号 `118`）即时生效新版 v4 规则，无需重启；
  - 新编译的便携运行版已发布至 `E:\OpenCode-Source-Recovery-20261013\opencode`（`verify-build.cjs` `success: true, errors: []`，修改 6 个文件，保留 `data/` 不变，备份位于 `.update-backup/1793643184668-6cea059b`）。
- **验收结果**：通过（`STEP_BUDGET_TURN_AND_ASK_ZERO_VERIFY_ALL_PASS`、`test-task-autonomy.mjs` 7/7 通过、`verify-build.cjs` 0 错误、实时 `bridge_get_effective_rules` 核验已返回 v4 新条文）。
