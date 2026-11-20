# 任务记录：opencode-memory-switching-20261023-162000-step01

- 总目标：实现 OpenCode 项目 MCP 与临时 MCP 双轨制、临时记忆目录可配置、参考 CODEX 的档案袋记忆机制与会话感知增量读取，并增量构建生成至源码根目录 `opencode/`。
- 任务状态：完成
- 关联快照：`pre/opencode-memory-switching-20261023-162000-step01` (commit 7265a5e)
- 强制读取清单：
  1. `E:/OpenCode-Source-Recovery-20261013/AGENTS.md` (已读, sha256:1d1d07f4...)
  2. `E:/OpenCode-Source-Recovery-20261013/README.md` (已读, sha256:d2f0e18d...)
  3. `E:/OpenCode-Source-Recovery-20261013/package.json` (已读, sha256:22bb95f5...)
  4. `D:/CODEX/Tools/project-memory.py` (已读, sha256:5cffaf43...)
  5. `E:/OpenCode-Source-Recovery-20261013/recovered/shared/automation-store.mjs` (已读, sha256:09f26bfb...)
  6. `E:/OpenCode-Source-Recovery-20261013/recovered/esm/000-extension.js/module-0114.mjs` (已读, sha256:be7f4585...)
  7. `E:/OpenCode-Source-Recovery-20261013/scripts/sync-shared.cjs` (已读, sha256:1daef230...)

## 懂/不懂清单
- 懂什么：
  1. 临时 MCP 默认设备级权限（`device` 作用域），项目 MCP 严格限定当前工作区目录。
  2. 临时记忆目录独立设置，设置项为 `opencode.memory.scratchDirectory`，缺省指向本地存储。
  3. CODEX 核心记忆机制：`AGENTS.md`、`INDEX.md`、`HANDOFF.md`、`REQUIREMENTS.md`、`NOTES.md`、`WORKLOG.md`、`DECISIONS.md`、`STATE.json`、`archive/` 归档。
  4. 会话感知增量读取算法：断开重连时跳过已注入记忆；多会话交替时仅注入增量断层；纯新会话注入不超过 230 行 brief。
  5. 构建交付唯一路径为本工程 `opencode/`，运行 `node scripts/update.cjs` 增量编译发布。
- 不懂什么 / 无需猜测事项：
  所有技术路径均已核实，不连接远端 Git，不启动业务测试实例。

## 三项确认
1. 技术理解：在 `recovered/shared/` 中新增 `project-memory.mjs`，在 `module-0114.mjs`、`automation-store.mjs` 中接入双轨 scope 及 `ConversationMemoryTracker`，经 `sync-shared.cjs` 同步后执行 `scripts/update.cjs` 发布到 `opencode/`。
2. 想法思路理解：项目记忆随工作区持久化，临时记忆由全局配置统一托管，避免临时探索污染正式项目；接入时精准跳过或增量补充，彻底解决 token 浪费与重复下发。
3. 最终生成效果理解：源码下得到支持临时/项目记忆与双轨权限的完整可用版 `opencode/`，包含真实校验哈希。

## 验收结果
- `recovered/shared/project-memory.mjs`：已创建并导出 27 个核心函数/常量，Node 语法自检通过。
- `assets/resources/app/extensions/opencode/package.json`：成功登记 `opencode.memory.scratchDirectory` 与 `opencode.memory.autoHandoff`。
- `recovered/shared/automation-store.mjs`：已集成会话感知记忆下发、双轨路径解析与 6 个 `bridge_memory_*` MCP 工具。
- `scripts/sync-shared.cjs`：已完成共享模块到所有 ESM 入口变体的同步。
- 编译与发布：`node scripts/update.cjs` 执行成功，`reports/build-verification.json` (success: true, 12066 ESM 模块, 98 个编译产物)，`reports/runtime-update.json` (success: true, 17618 文件同步到 `opencode/`)。
