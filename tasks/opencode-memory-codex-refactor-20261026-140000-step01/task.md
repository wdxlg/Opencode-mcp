# 任务记录：参考 D:\CODEX v1.9.1 彻底重构 OpenCode 记忆系统

- 任务 ID：`opencode-memory-codex-refactor-20261026-140000-step01`
- 工作分支：`task/opencode-memory-codex-refactor-20261026`
- 修改前快照分支：`pre/opencode-memory-codex-refactor-20261026-140000-step01` -> `cb01ecba20b85d760b9ce2b1f7c3e38490a9d715`
- 交付本地提交：`efe79480f33c51fd9df1e48287b0b1590c8c2183`（`sourceDirty: false`，未配置远端、未 push）
- 唯一修改目标目录：`E:\OpenCode-Source-Recovery-20261013`（只读对照 `D:\CODEX`，严禁触碰正式目录 `E:\OpenCode`）

## 一、强制必读清单与 SHA-256

### 1. 只读参考真源（`D:\CODEX` v1.9.1）
- `D:/CODEX/VERSION.txt` (`1.9.1 (2026-10-10)`) — 完整读取
- `D:/CODEX/Tools/project-memory.py` (`sha256: 30d5609e9a4827eb678982a00833efb0ee322e6e1e63924d4cb37d96ed81553e`, 642 lines) — 完整读取
- `D:/CODEX/Tools/gen-prompts.py`, `D:/CODEX/Tools/codex-thread.py`, `D:/CODEX/Config/ARENA_*.{txt,md}`, `D:/CODEX/Config/口令模板/slot-{1,N}.tpl`, `D:/CODEX/Templates/RelayTemplate/{relay,relay-cli}.mjs`, `D:/CODEX/Panel/web/server.mjs` — 完整读取

### 2. OpenCode 目标仓库文件（`E:\OpenCode-Source-Recovery-20261013`）
- `AGENTS.md`: `1d1d07f43c1a2487fd40211d606326517e51b4ebab307a416168963976b6590d`
- `README.md`: `d2f0e18d9d1b7406c7053feef602ce149bcf0cd3c89dcb45517ad179b361c407`
- `package.json`: `7af4d4ccd0be2a58745f996faf1c031e8eb54eee47e83cd1655cb99494c55054`
- `scripts/sync-shared.cjs`: `71f1b84c816c558c557b487ce7db583c6d554f1014d9cf4037ea909467019ba7`
- `scripts/update.cjs`: `e5f1d5d2c2518eb3cb7e3f9c024579b1f7bbcddfd1ab5b8be61c330e7ef28d02`
- `scripts/verify-build.cjs`: `7a165b128b52fd6f1db34bb2aae1171a21d66e1e405ef17af07cf8988fc9efe8`
- `scripts/publish-runtime.cjs`: `eacaceec3ee0b812890be56edc3015e52e653d9bb1b2dde3669d00ddb3763724`
- `recovered/shared/project-memory.mjs`: `5507f40a95ecf27b373a283efce75d7547cee8d9f7e110f604e60780176ed18d`
- `recovered/shared/automation-store.mjs`: `76fe69cada7ae9b56ca67386f27790c3ffc5432710de559ae6a9c850d6af05b9`
- `recovered/shared/automation-workbench.mjs`: `bd85745031db790c7be27d778811034ae4230e0c289af1623a51436af186180c`
- `recovered/esm/000-extension.js/module-0023.mjs`: `2f688dc37fb59171cdc4ce65489602052437d48d5da926a1d500960521fa3be5`
- `recovered/esm/000-extension.js/module-0114.mjs`: `c806eb0c38f2e714c0a6d4389265829268eb6a073cbb21253ccbe1504e32569a`
- `recovered/esm/000-extension.js/module-0119.mjs`: `3cbe35dff3df7d8d829cb7d213f7f5349349168a3c44e25dc330db6e41e0724e`
- `recovered/esm/000-extension.js/module-0140.mjs`: `16c9f2016197571dcd494151ab904a79ee2a17b9a0f2afd75d67d98b240c48a4`
- `recovered/esm/000-extension.js/module-0143.mjs`: `8115ccb5de04bf852b4c8f0ac3280dfd28bc162521221eb102e8754848cf8d95`
- `recovered/esm/000-extension.js/module-0144.mjs`: `37a554e5910256fbff82d0f63046cc7d4801c0d72b98eff3dbf9c31e9fefe912`
- `recovered/esm/000-extension.js/module-0177.mjs`: `5d5d5f83f8f3c914cc0ba3b7ff93528b124a73087dae535b461ff0fe1709679d`
- `recovered/esm/000-extension.js/module-0183.mjs`: `2a357a8091a75f33cc368ba675c355062416b3809748e3c38315ba2079911782`
- `recovered/esm/002-agent-host.js/module-0029.mjs`: `527469e7607846905d87b17d1d997721212f39f536e64877c5590e274a1738e6`
- `recovered/esm/003-mcp-server.js/module-0001.mjs`: `16db01502895ba23833d320abe5723d367da35b04850e3e08ee7ef123fef4857`
- `assets/resources/app/extensions/opencode/package.json`: `cc5c7a3a82683849139b494a3df501ea5efe6936b7ad1a007c7e450f2c242f61`

## 二、懂清单 / 不懂清单

### 懂清单
1. `D:\CODEX` v1.9.1 核心设计：纯本地 Markdown/JSONL 档案袋（`AGENTS.md`/`INDEX.md`/`HANDOFF.md`/`REQUIREMENTS.md`/`DECISIONS.md`/`NOTES.md`/`WORKLOG.md`/`EVENTS.jsonl`/`STATE.json`/`policy.json`/`synonyms.txt`/`search.idx.json`/`HANDOFF.draft.md`/`archive/`），启动 `brief` 严格封顶 ≤230 行，带 `handoff-good.md` 回退与 `断层补充`，写入时机械 `autocap` 归档但绝不归档 `[待办]`/`[进行中]`，中文二元分词 + 18 组同义词 + `search.idx.json` 缓存倒排索引召回，`forget` 备份并标 `[已作废]`。
2. OpenCode 现有记忆系统的 7 处断路：`instructions()` 漏拼 `${memorySection}`；MCP 与 Native Chat 漏传会话级 `callerId` 退化为 `'default-session'`；`resolveMemoryDir` 忽略 `opencode.bridge.workspaceScope === 'device'` 导致整机临时 MCP 污染打开文件夹；`opencode.memory.autoHandoff` 零实现且 `bridge_memory_handoff` 不重写 `HANDOFF.md`；`002-agent-host` >40 条滑窗截断无预归档或摘要衔接；`003-mcp-server.js` 缺少记忆工具；默认规则只灌入 10 条重型手动 `.ai-workflow/memory.sqlite` 规则而无轻量记忆引导。

### 不懂清单
- 无（4 项关键范围与策略已通过 `ask_user` 全部由用户明确拍板）。

## 三、用户三次确认结论（`ask_user` 实测回执）
1. **目录与兼容策略（`strict_opencode_only`）**：严格独立使用 `.opencode-project/` 与 `scratch-memory`，绝不读取、写入或复用 `.codex-project/`。
2. **重构深度与覆盖范围（`full_end_to_end`）**：端到端完整重构（v1.9.1 引擎全特性 + MCP/原生 Chat 会话级增量注入修复 + `device`/`workspace` 双轨严格隔离 + `autoHandoff` 与 `002-agent-host` >40 轮滑窗预归档摘要 + `000-extension.js` 与 `003-mcp-server.js` 全打通）。
3. **内置默认规则策略（`enable_codex_disable_heavy_default`）**：新增并默认启用 CODEX 轻量档案袋记忆与无感交接规则；保留现有 schema 4 用户规则不删数据，新初始化时将重型手动 `.ai-workflow/memory.sqlite` 规则设为默认禁用（`enabled: false`）。
4. **验证、Git 与发布（`confirm_build_and_publish`）**：先建 `pre/` 快照分支，完成代码与隔离临时目录 `selftest` 后提交本地 Git commit（不 push），运行 `npm run build` 更新 `E:\OpenCode-Source-Recovery-20261013\opencode\`（遇锁如实报告，绝不强杀进程）。

## 四、影响文件清单
1. `recovered/shared/project-memory.mjs`（同步至 `recovered/esm/000-extension.js/project-memory.mjs` 与 `recovered/esm/003-mcp-server.js/project-memory.mjs`）
2. `recovered/shared/automation-store.mjs`（同步至 `recovered/esm/000-extension.js/automation-store.mjs`）
3. `scripts/sync-shared.cjs`
4. `recovered/esm/000-extension.js/module-0114.mjs`
5. `recovered/esm/000-extension.js/module-0119.mjs`
6. `recovered/esm/000-extension.js/module-0143.mjs`
7. `recovered/esm/000-extension.js/module-0177.mjs`
8. `recovered/esm/000-extension.js/collaboration-workers.mjs`
9. `recovered/esm/002-agent-host.js/module-0029.mjs`
10. `recovered/esm/003-mcp-server.js/modules.json`
11. `recovered/esm/003-mcp-server.js/module-0001.mjs`
