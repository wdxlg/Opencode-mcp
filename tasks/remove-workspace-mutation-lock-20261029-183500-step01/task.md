# 移除 run_command 工作区写互斥锁并生成 recovered.28

- 任务 ID：remove-workspace-mutation-lock-20261029-183500-step01
- 状态：已完成本次授权的源码更新与构建交付（功能验证与用户验收未执行）
- 用户明确要求：删除 `run_command` 工作区写互斥锁（`workspace-mutation` / `WORKSPACE_BUSY`），更新源代码 `E:\OpenCode-Source-Recovery-20261013` 并生成新版在源代码目录 `opencode/` 下。
- 用户已确认决策：
  1. 删锁范围：`run_command_mutation_only`（仅删 `run_command` 的 `workspace-mutation` 命令写互斥锁、端口分支与终端文案表述；保留 `apply_patch` 单文件锁 `withFileLocks` + `STALE_FILE` 与协作任务 `single-writer`）。
  2. 本地 Git 与版本：`new_task_branch_recovered28`（保留原分支历史与现有未提交 `recovered.27` 改动，建立 `pre` 快照并在独立本地分支提交 `1.0.0-recovered.28`，随后发布至 `opencode/`）。
  3. 验证边界：`confirm_build_only`（执行源码同步、编译、`verify-build.cjs` 完整性核验与增量发布至 `opencode/`，不跑额外测试脚本，不触碰正式 `E:\OpenCode` 或在跑实例）。

## 总目标与子任务状态
1. 只读检索并完整阅读恢复源码与锁实现模块：完成
2. 输出读取清单、三项理解并经用户交互确认边界：完成
3. 建立修改前 Git 快照与 SQLite 备份、删除工作区写互斥锁并同步共享变体：完成
4. 记录本地 Git 源码提交并编译发布新版到 `E:\OpenCode-Source-Recovery-20261013\opencode\`：完成
5. 静态校验发布产物、更新留痕索引与 SQLite 记录：完成

## 强制读取清单与读取时校验值
- `AGENTS.md`、`README.md`、`package.json`、`CONCURRENCY-UPDATES.md`：完整读取。
- `recovered/shared/concurrency-runtime.mjs`（124 行）、`recovered/esm/000-extension.js/module-0165.mjs`（2056 行）、`recovered/esm/000-extension.js/module-0043.mjs`（69 行）、`recovered/esm/002-agent-host.js/module-0028.mjs`（69 行）：全部逐行完整读取。
- `scripts/update.cjs`、`sync-shared.cjs`、`build-recovered.cjs`、`copy-static-assets.cjs`、`build-standalone.cjs`、`copy-defaults.cjs`、`verify-build.cjs`、`publish-runtime.cjs`、`test-concurrency.mjs`、`test-command-limits.mjs`：全部完整读取。

## 修改与快照记录
- 修改前快照：`refs/heads/pre/remove-workspace-mutation-lock-20261029-183500-step01` 与 `refs/tags/pre/remove-workspace-mutation-lock-20261029-183500-step01` -> `b9794cd8a0ebc86cc781e485b27acd228ba0f578`（保留完整 `1.0.0-recovered.27` 基线；原分支 `refs/heads/task/opencode-leanrea-replace-20261027` `2722df0f9023bf85238d509a0ace5cb4a4d81021` 与真实索引未改）。
- 源码提交：`cc1ed24cd33c45db3c7217bf69460eb39a802196`，独立本地分支 `refs/heads/task/remove-workspace-mutation-lock-20261029-183500-step01`（9 个文件变更，未向任何远端推送）。
- 编译与发布结果（使用方法：`node scripts/update.cjs` / `npm run build`）：
  - 编译 28 个 bundle（重编 `000-extension.js`、`002-agent-host.js`、`003-mcp-server.js`）、70 个 standalone JS、10 项产品完整性检查、27 个默认 Skill（415 文件），`reports/build-verification.json` `success=true, errors=[]`。
  - 增量发布至唯一运行目录 `E:\OpenCode-Source-Recovery-20261013\opencode\`：`version=1.0.0-recovered.28`，更新 6 个文件（3 个 bundle 及其 map），未变 11014 个文件，删除 0 个文件，`data/` 与用户文件完整保留，备份位于 `E:\OpenCode-Source-Recovery-20261013/.update-backup/1793285456605-3a9aea0a`。
  - 发布清单如实记录当前工作区原 `HEAD` `2722df0f9023bf85238d509a0ace5cb4a4d81021` 与 `sourceDirty=true`。

## 静态自检结果与未验证残差
- `node --check` 全部通过；`git --no-pager diff --cached --check` 无空白错误；`concurrency-runtime.mjs` 真源与 `000-extension.js`、`003-mcp-server.js` 副本 SHA-256 完全一致（`bfbefd745e8973ba059df09541672d10b953c8d9abca519a20af56568059227b`）。
- 发布的 `extension.js`（`de9367ab933e94d01e3481fc16f1fa4a6c0fcc1528919004554960c56711e448`）、`agent-host.js`（`85b7b683af076ae47833fc7f74aab9d75f37bb6ac488d7d77eb60bbd8fc56c1c`）、`mcp-server.js`（`80bd68afed21c34c0f0aff5bafc879b3c94289594b07f12620a24db88f132332`）与构建报告哈希一致，且静态检索确认 `WORKSPACE_BUSY`、`workspace-mutation`、`workspace-lock`、`workspace mutation lock` 均为 0 命中；保留的 `withFileLocks`、`STALE_FILE`、`TASK_WRITER_BUSY`、`single-writer` 均仍在 `extension.js` 中。
- 正式安装 `E:\OpenCode` 未做任何修改（mtime `2026-10-22T12:51:07.706Z` 不变），未启停任何运行实例。
- 未验证项（残差）：按用户确认仅执行编译与静态完整性校验，未运行功能/回归测试，未启动 `opencode/OpenCode.exe` 验证实际多会话并发命令运行表现；底层并发 `git`/`npm` 命令对同一仓库索引或 `node_modules` 的竞争交由 Git/OS 原生锁或调用方自行协调。
