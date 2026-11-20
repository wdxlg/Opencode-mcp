# 工作（Work board）与 自动化（Automations）

设计借鉴 multica-ai/multica 的 Work / Autopilot 语义；代码、界面均为 OpenCode 自行实现，没有复制 Multica 代码。

## 文件

| 文件 | 作用 |
|---|---|
| `recovered/shared/work-store.mjs` | 工作看板数据层（纯 Node）：项目、工作项、评论/活动、revision 乐观并发、原子写、跨进程锁、Git 基线/diff 统计；5 个 Bridge 工具定义与处理 |
| `recovered/shared/autopilot-store.mjs` | 自动化数据层（纯 Node）：带时区的 cron/间隔计划、错过运行策略、运行历史（JSONL）、幂等 claim、调度锁、Windows 计划任务 XML/登记、启动器脚本生成；2 个可选 Bridge 工具 |
| `recovered/shared/work-automation.mjs` | 扩展集成：两个 webview 面板、Bridge 工具接线、应用内调度器、无界面运行器（vscode.lm + Bridge 调度器） |
| `assets/.../media/task-workbench/{work,automations}.html`、`work.css` | 页面 |
| `recovered/standalone/.../media/task-workbench/{work,automations}.js` | 页面脚本 |
| `scripts/test-work-automation.mjs` | `npm run test:work-automation` |

改动的已有文件（各有 `.pre-work-auto` 备份）：`recovered/shared/automation-store.mjs`（工具注册、SAFE_TOOLS、handleTool 路由、bridge_start 一行规则）、`scripts/sync-shared.cjs`、`recovered/esm/000-extension.js/module-0023.mjs`（激活时注册）、`recovered/esm/027-workbench.desktop.main.js/module-3734.mjs` 与 `module-3779.mjs`（自动化启动的实例退出时不弹关闭确认）、`recovered/workbench-assets.json`、扩展 `package.json`（命令、对话视图标题按钮）、根 `package.json`（测试脚本）。

## 数据位置

共享存储根（与规则、记忆相同）：`OPENCODE_AUTOMATION_HOME` 或 `%LOCALAPPDATA%\OpenCode\shared-automation`

- `work/work-board.v1.json` — 看板
- `autopilot/automations.v1.json` — 自动化定义与游标
- `autopilot/runs.jsonl` — 运行历史（追加写，同一 run id 以最后一条为准；启动器也追加）
- `autopilot/schedule.json` — 供启动器读取的近期计划时刻
- `autopilot/scheduler.lock.json` — 应用内调度锁（心跳 30 秒，3 分钟过期）
- `autopilot/claims/` — 每次计划运行的幂等 claim（`automationId@plannedAt`）
- `autopilot/transcripts/` — 每次运行的过程记录
- `%LOCALAPPDATA%\OpenCode\automation-launcher\` — `launcher.vbs`、`launcher.ps1`、`pointer.json`、`launcher.log`

## 语义（Multica 契约）

- 代理动手前 `work_claim`（或 `work_update status=in_progress`），交付 `in_review` 必须带 summary；有 Git 基线时附 `git diff --shortstat`。
- `done` 只能由用户在「工作」页设置；`blocked` 必须写原因；纯问答只加评论，不改状态。
- 所有修改带 `expected_revision`，不一致返回 `WORK_REVISION_CONFLICT` 与当前 revision。

## 关闭时运行的方式

1. 存在 ≥1 个已启用（且未过结束时间）的自动化时，为当前用户登记**一个** Windows 计划任务 `OpenCode Automations (<用户名>)`：一次性时间触发器，时间 = 最近一次到期时刻；`StartWhenAvailable`（错过时开机后补触发）；动作 `wscript.exe launcher.vbs`。每次运行、修改、启停后重新登记；没有已启用的自动化时删除任务。
2. 触发时 `launcher.vbs` 隐藏启动 `launcher.ps1`，它在数秒内退出：
   - 调度锁新鲜或该安装的 OpenCode.exe 正在运行 → 退出（由应用内调度器处理）；
   - 没有到期时刻 → 重新设置触发器后退出；
   - `pointer.json` 里的 exe 不存在（安装目录被移动）→ 为到期时刻追加 `skipped / install_moved` 记录，重新设置触发器后退出；
   - 否则以 `OPENCODE_AUTOMATION_RUN=1` 启动 OpenCode（`--new-window <目标文件夹>`）后退出。
3. OpenCode 以自动化模式启动后，扩展获取调度锁，按错过策略执行到期运行，重新登记下一次触发，然后在没有用户另开窗口时执行 `workbench.action.quit` 退出（此模式下不弹关闭确认）。整体有看门狗（各运行超时之和 + 10 分钟，最多 3 小时）。
4. OpenCode 打开时，持有调度锁的窗口每 30 秒检查一次到期运行（同一时刻只有一个窗口调度）；每次计划运行先独占创建 claim 文件，保证不会执行两次。
5. 每次 OpenCode 启动都会刷新 `pointer.json`（安装路径），所以关闭时可以随意移动安装文件夹；没有到期运行时不存在任何常驻进程，也没有进程占用安装目录。

### 为什么不用 ELECTRON_RUN_AS_NODE 运行器

模型提供商的密钥存放在 VS Code SecretStorage（Electron safeStorage/DPAPI 加密，只有应用主进程能解密并交给扩展宿主），Bridge 工具（文件、命令、记忆、任务卡）也只存在于扩展宿主里。独立 node 进程既拿不到密钥也没有这些工具，因此运行器在扩展宿主中执行：使用与协作原生执行器相同的 `vscode.lm` 模型通道和 `bridge.dispatcher.dispatch` 工具调度，单次运行有超时（默认 20 分钟，可设 1–180）和 40 轮上限，不能向用户提问（`bridge_ask_user` 不可用）。

## 错过运行策略

- `run_latest`（默认）：只补跑最近一次，更早的记为 `skipped / missed_older`。
- `skip_missed`：最近一次已超过 10 分钟宽限则全部记为 `skipped / missed`。
- 连续 3 次失败的定时运行会自动停用该自动化（手动运行不计）。

## 已知限制

- 自动化模式启动 OpenCode 时会出现窗口（VS Code/Electron 没有隐藏启动方式），完成后自动退出。
- 计划任务使用 InteractiveToken：只在用户已登录时触发。
- 指派给某个对话/代理只是记录，不会主动唤醒它（Multica 的 mention/assign 触发未实现）。

## 界面与入口

- 两个页面只使用 `--vscode-*` 主题变量和 VS Code 字体（不再引用 `automation.css`），深色 / 浅色 / 高对比度主题自动适配；间距按 4/8px 栅格。
- 图标使用 VS Code 自带的 codicon 字体：扩展把应用目录 `out/media` 加入 webview 的 `localResourceRoots`，并在 CSP 中放行 `font-src`，注入带 nonce 的 `@font-face`；找不到字体时页面退回纯文字按钮。
- 「工作」：顶栏（搜索、项目 / 负责人筛选、显示已结束、新建）；看板列标题固定并显示数量，卡片显示优先级圆点、编号、相对时间、负责人、项目、受阻原因；点击卡片在右侧抽屉中查看 / 编辑（状态、优先级、负责人、项目、描述、交付摘要与 diff 统计、评论、活动时间线）。项目管理与数据位置也在抽屉里。快捷键：`/` 搜索，`Esc` 关闭抽屉，评论框 `Ctrl+Enter` 发表。
- 「自动化」：标签页「自动化 / 运行历史 / 后台调度」；列表行含启用开关、计划（中文描述）、下次运行、最近结果徽标，操作收进「⋯」菜单；编辑在右侧抽屉中分组（基本信息、计划、运行环境、高级），计划区实时预览接下来 5 次运行；运行过程在抽屉中按条目显示。`Ctrl+S` 保存。
- 入口图标：扩展通过 `contributes.icons` 提供 `$(opencode-work)`、`$(opencode-automations)` 两个单色图标（`media/task-workbench/icons/opencode-icons.woff`，16px 栅格、1px 线宽，与 codicon 一致，随主题着色）；webview 标签页使用同形的 `work-{light,dark}.svg`、`automations-{light,dark}.svg`。
- 命令面板：「OpenCode: 工作」「OpenCode: 自动化」；状态栏左侧有「工作」（有待验收时显示数量）与「自动化」（运行中时图标旋转）两个入口，可右键隐藏。
