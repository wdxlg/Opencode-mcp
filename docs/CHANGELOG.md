# OpenCode 更新记录

## recovered.34+：参照 DeepSeek Harness 的稳定性补强（dsh-gap-fixes，部分未实机验证）

> 构建通过、主机冒烟 15/15；未在运行中的 OpenCode 实例里验证。任务记录：`tasks/opencode-dsh-gap-fixes-20261110-2150-step01/`。

- **工具超时**（共享模块 `recovered/shared/tool-guards.mjs`）：Bridge 每次工具调用（含 bridge_batch 子调用）按类别设截止时间，超时返回结构化 `TOOL_TIMEOUT` 并发出取消信号。默认 read 60 s、search 90 s、write 60 s、REA 600 s、其他 120 s；外部 MCP 沿用已有 120 s 兜底；run_command/等待类豁免。`OPENCODE_TOOL_TIMEOUT_MS_<工具名>` / `_<类别>` / `OPENCODE_TOOL_TIMEOUT_MS` 覆盖，0 为不限。
- **终端不再卡在分页/提示**：托管终端在未设置时补 `GIT_PAGER=cat`、`PAGER=cat`、`GIT_TERMINAL_PROMPT=0`、`GCM_INTERACTIVE=never`、`GIT_EDITOR=true`；run_command 默认 `timeout_ms` 由 120 s 改为 50 s（先返回 status=running，命令不被杀），`OPENCODE_RUN_COMMAND_DEFAULT_TIMEOUT_MS` 可改。
- **超长输出落盘**：工具文本超过 30000 字符时只回开头 6000 + 结尾 6000 与完整内容的文件路径（`%LOCALAPPDATA%\OpenCode\shared-automation\spill`，保留 3 天）；read_files、read_image、get_command_output、规则读取等豁免。`OPENCODE_SPILL_*` 可调，阈值 0 关闭。
- **重复调用提醒**：同一对话连续第 3 次用相同参数调用同一工具时，在结果后追加 `[REPEAT_TOOL_CALL]` 提醒（只提醒不拦截，轮询类豁免）。`OPENCODE_REPEAT_TOOL_THRESHOLD` 可调。
- **模型请求重试**：额度/欠费类 429 不再重试；读取 `Retry-After` / `retry-after-ms`（上限 20 s）；退避改为 500 ms×2^n（上限 8 s）加抖动。
- **可选写入沙箱**（`recovered/shared/sandbox-lowil.mjs`，默认关闭）：`"opencode.sandbox.mode": "workspace-write"` 或 `OPENCODE_SANDBOX_MODE=workspace-write` 后，托管 Bash 经低完整性启动器运行（首次用 .NET Framework csc 编译到 `%LOCALAPPDATA%\OpenCode\sandbox`），只能写带 Low 标签的目录与 `AppData\LocalLow`。每个工作区目录由本地用户执行一次 `icacls "<目录>" /setintegritylevel (OI)(CI)low`；未加标签时终端拒绝启动并给出该命令。
- **会话检索与后台命令**：新工具 `bridge_search_sessions`（检索本工作区历史任务卡与其记忆文件，返回命中片段）；`get_command_output` 省略 `command_id` 或 `list=true` 时列出本会话保留的命令（含后台命令），配合 `cancel_command` 停止。

## recovered.33：协作与记忆优化（未测试）

> 源码仅做了 `node --check` 语法检查与 `sync-shared`，**未运行功能/回归测试、未启动程序、未构建**。版本号 `1.0.0-recovered.33`。

> ⚠ **重新构建后门禁同样作用于 Bridge 的 `run_command`**：`git push`、写入/删除/移动 `E:/OpenCode` 下文件的命令、读写 `tool-gates*.json` / `collaboration-limit*.v1.json` 的命令都会被拒绝（`POLICY_DENIED`），经 Bridge 远程执行的维护命令也不例外。需要时由本地用户在本机终端执行，或在规则目录 `tool-gates.v1.json` 中用 `disabled_default_rules` 显式放宽。

- **工具层硬门禁（PreToolUse 式）**：新增共享模块 `recovered/shared/collaboration-policy.mjs`。`AutomationService.guard()` 在角色/规则检查前先评估门禁；原生 Chat 未绑定任务所有者的 IDE 工具调用也会经过门禁。策略 = 内置默认 + 规则数据目录 `tool-gates.v1.json`（本地用户编辑，可 `disabled_default_rules`、追加 `rules`/`protected`）+ 工作区 `.opencode-project/tool-gates.json`（**只能追加** deny/ask 规则与受保护对象，不能放宽）。规则可按工具名通配（如 `ext__*__process`）、路径前缀/后缀、命令正则、参数等值、受保护 PID/进程名/窗口标题匹配。
  - 默认策略：禁止 `git push`；禁止 taskkill/Stop-Process/kill 等终止 OpenCode/Electron 或当前宿主 PID/父 PID 及列出的受保护进程（含 Windows-MCP `Process`/`App` 的 kill 模式）；禁止文件工具写入及命令修改受保护路径 `E:/OpenCode`（`E:/OpenCode-Source-Recovery-*` 等同前缀的其他目录不受影响）；禁止模型修改门禁/限额文件。
  - `deny` 返回结构化错误 `{code:'POLICY_DENIED', rule, reason, tool}`；`ask` 在任务卡上走现有 `bridge_ask_user` 问答（“允许本次调用”仅对 60 秒内完全相同的调用有效），没有任务卡/原生 Chat 时按拒绝处理。每次拒绝写入规则目录 `tool-gate-events.v1.jsonl`（超过 1 MiB 轮转），并记录到调用者任务卡的 toolEvents（`status: policy_denied`）。
  - 可选完成门禁 `completion_gate.require_executed_check_kinds`（全局策略文件）：协作任务提交 `completed` 时要求对应类型检查实际执行；构建/测试仍复用既有“匹配真实终态命令回执”校验，不重复实现。
  - 新工具 `bridge_get_tool_gates`（只读，无需规则确认）：返回生效策略、来源文件、受保护对象、协作限额，可选最近门禁事件。不提供任何修改策略的模型工具。门禁不是 OS 沙箱，不覆盖 Shell 自行脱离的后代进程；“本任务启动的实例”无法自动识别，默认一律保护 OpenCode 进程名。
- **协议减负**：
  - `bridge_update_task` / `bridge_checkpoint_task` / `bridge_resume_task` 的 `task_id`、`lease`、`expected_revision` 可省略：服务端按真实连接唯一持有的任务填充；持有多个时返回 `TASK_AMBIGUOUS`/`TASK_LEASE_AMBIGUOUS` 与 `candidates`。`bridge_claim_task` 的 `expected_revision` 可省略（锁内仍复核）。领取后的工作区/命令工具省略 `execution_lease` 时同样自动填充。
  - 省略 `expected_revision` 时：自调用者上次读取后任务的状态/所有权/lease/执行尝试未变才按最新修订合并，否则 `TASK_VERSION_CONFLICT` 并给出 `current_revision`。`set_todos`/`update_plan` 对本人任务卡同理；`mode=patch` 在变化不涉及本次提交步骤时服务端合并。接班 `handoff=true` 仍必须带修订号。
  - 规则确认按调用者身份（模型助手来源绑定，否则连接所有者）持久化到 `caller-rule-acks.v1.json`；只有 `rules_hash` 变化才需重新读取确认，新任务不再强制重读。`bridge_get_effective_rules` 返回 `already_acknowledged`，任务卡回执的 `rules_required` 改为按实际确认状态给出。
  - 常见别名容错并回显 `normalized`：任务卡 `content/text/name→title`、`state→status`、`done/in-progress/todo` 等状态值、缺失 `id` 自动编号、未知字段忽略；`update_plan` 的 `title/content→step`；协作工具 `state→status`、`revision→expected_revision`、`execution_lease→lease`。
  - 句柄互认：团队读取接口接受普通协作任务 ID 并返回其公开记录（`handle_kind: 'collaboration-task'`），员工连接的 `bridge_get_execution` 可读普通协作任务；`bridge_get_execution`、团队结果读取返回 `handle_kind`；误传任务卡 ID 时给出明确提示。经理工具省略 `manager_task_id`/`lease` 时按当前连接唯一的经理任务填充。
- **推送与等待**：新工具 `bridge_wait_messages`（`after_sequence`、`task_id`、`watch_tasks[{task_id,revision}]`、`timeout_ms` 默认 25000 / 最大 55000、`limit`）：由服务端变更事件与数据文件 `fs.watch` 唤醒，5 秒兜底计时器，不忙轮询；新消息/关注任务变化即返回，超时 `timed_out: true`。新消息时向收件人的有状态 MCP 会话（Streamable HTTP 会话）发送 `notifications/message`（logger `opencode.bridge.inbox`，仅元数据）；无会话的新协议逐请求连接没有服务端推送通道，只能用长轮询。`bridge_wait_team` 改为事件驱动（5 秒兜底，替换每秒整库读取），员工账本按 mtime/size 缓存解析；外部 MCP 经理新增 `timeout_ms`（默认 25 秒）真正等待；两个等待工具不占工具并发槽。
- **限额可配置**：每次执行模型请求上限（默认 12，最大 200）、原生执行槽（2，最大 8）、经理槽（1，最大 4）、自动整合文件数（30，最大 300）/单文件（256 KiB，最大 4096）/总量（512 KiB，最大 16384）。优先级：环境变量 `OPENCODE_COLLAB_MAX_MODEL_REQUESTS`、`OPENCODE_COLLAB_NATIVE_SLOTS`、`OPENCODE_COLLAB_MANAGER_SLOTS`、`OPENCODE_COLLAB_INTEGRATION_MAX_FILES`、`OPENCODE_COLLAB_INTEGRATION_MAX_FILE_KIB`、`OPENCODE_COLLAB_INTEGRATION_MAX_TOTAL_KIB` > 设置 `opencode.collaboration.limits`（对象，键名同 `bridge_get_tool_gates` 返回的 `collaboration_limits`）> 规则目录 `collaboration-limits.v1.json` > 默认值。共享库中类别/任务的 `max_turns` 仍限 1–12（schema 4 不变）：12 表示“使用配置上限”，更小的值照常生效。
  - 到达上限时任务阻塞记录结构化 `blockReason`（`code: LIMIT_REACHED`、`limit`、已用/上限、`extend` 指引）；本地用户经工作台消息 `extendLimit`（`kind`: `attempt-model-requests` + `attempt_id` / `team-model-requests` + `run_id` / `integration` + `run_id` 与 `files`/`file_kib`/`total_kib`，模态确认）或 `AutomationService.extendCollaborationLimit()` 追加额度，存入 `collaboration-limit-extensions.v1.json`；随后恢复单个任务即可，无需暂停团队、改预算并重新授权。扩展只追加，不重置已用量，不是模型工具。工作台按钮 UI 尚未添加，仅接好消息处理。
- **同目录多会话轻量保护**：`TerminalCommandManager.run` 对 git（add/commit/checkout/switch/reset/merge/rebase/clean/pull/fetch/stash/cherry-pick/revert/restore/rm/mv/apply/am/tag/删改分支）与 npm/pnpm/yarn（install/i/ci/add/remove/update/dedupe/prune/link/build/run build）修改子命令，经 `concurrency-runtime` 跨进程端口登记 `workspace-mutation-soft:<cwd>`：其他会话有在途修改命令时最多等待 30 秒，然后照常执行并在结果首部加 `concurrency_warning`；不再出现 `WORKSPACE_BUSY` 拒绝。同一会话自身命令不等待；后台命令持有登记直到结束。`apply_patch` 文件锁不变。
- **记忆（`project-memory.mjs`，引擎 `2.2.0-codex191-collab-hybrid`）**：
  - 可选混合检索：配置 OpenAI 兼容向量服务后 recall/search 把词法排名与语义向量做倒数排名融合（结果 `mode: "hybrid"`，否则 `"lexical"`，附 `embed_status`）。环境变量 `OPENCODE_MEMORY_EMBED_URL`、`OPENCODE_MEMORY_EMBED_MODEL`、`OPENCODE_MEMORY_EMBED_KEY`（密钥只从环境变量读取），或记忆根 `embed.json`（`baseUrl`/`model`/`dimensions`/`timeout_ms`，其中的密钥字段一律忽略）；`OPENCODE_MEMORY_EMBED=0` 或 `enabled:false` 关闭。未配置、失败或超时（默认 8 秒）静默回退词法；向量按条目文本哈希缓存于 `search.vec.json`（不存原文），发送前脱敏。零新依赖，不下载模型。中文索引增加三元切词。
  - 条目有效期与取代：`bridge_memory_append` 可带 `valid_from`/`valid_until`/`subject`；已作废、已被取代、已过期、未生效的条目默认不进 brief 与检索（`include_inactive: true` 可查）。
  - 新工具 `bridge_memory_consolidate`：精确/近似（Jaccard 默认 0.85）去重、同主题旧条目标记 `[已被取代→#id]`；默认 dry-run 只预览，`apply: true` 才在写锁内写入，原文件备份到 `archive/consolidate-backup-<时间>/`，被移除行另存 `archive/合并移除-<时间>.md`。
  - 交接自动提取：`bridge_memory_handoff` 把决策/约束/需求完成迹象写成 `[自动·待确认]` 随手记（去重、过滤套话，`extract_facts: false` 关闭），不直接改台账；核实后 `bridge_memory_append kind=confirm text=<关键词>|"*"` 确认（决策入 DECISIONS、需求状态更新 REQUIREMENTS），错误的用 `bridge_memory_forget`。
  - 工作区范围：brief/recall/search 新增 `scope`（`task` | `workspace` | `all`），已知工作区根（`workspace_root` 参数、宿主当前工作区或槽位定位）时默认 `workspace`：只读合并项目记忆与其他执行者/任务的交接、检查点，逐条标注来源；写入仍只落本槽位。brief 只展示他人的交接下一步/未完成/检查点，不展示其随手记；workspace 范围的 recall/search 可只读检索到他人条目。传 `scope: "task"` 恢复旧行为。
  - brief 分节重排并按节保底：现在看到的（1–2 行）→ PINNED → 交接下一步/未完成 → 手写槽位/检查点/工作区汇总视图 → 活跃需求 → 待确认 → 随手记 → 其余；`max_lines` 很小时 PINNED 与下一步优先保留。内置 `selftest` 增加 step03 断言。
  - 改动文件：`recovered/shared/project-memory.mjs`（sync 到 `000-extension.js` 与 `003-mcp-server.js` 副本）；工具 schema 均来自其 `MEMORY_TOOL_DEFINITIONS`。
- **测试脚本（已编写，未运行）**：`npm run test:memory-v2`（`scripts/test-memory-v2.mjs`，纯临时目录，注入假向量函数，无网络）、`npm run test:collab-v2`（`scripts/test-collab-v2.mjs`，门禁/只能收紧、lease 与修订自动补全、规则确认持久化、别名、`bridge_wait_messages`、限额与 extendLimit）、`npm run test:e2e-bridge`（`scripts/test-e2e-bridge-handoff.cjs`，需先构建，且必须设 `OPENCODE_E2E_CONFIRM=1`；用全新隔离 profile 启动 `opencode/` 运行时的本地 Bridge，会话 A 建任务卡、写记忆、交接，新会话 B 以 `workspace_root` 调 brief 须看到 A 的下一步；该运行时已在运行时拒绝执行，只结束自己启动的进程；经理+2 员工路径标为 TODO）。
- **数据兼容**：共享规则库仍为 schema 4，员工账本 schema 1 不变；新状态全部在规则目录的新文件中（`tool-gates.v1.json`、`tool-gate-events.v1.jsonl`、`caller-rule-acks.v1.json`、`collaboration-limits.v1.json`、`collaboration-limit-extensions.v1.json`）。任务上新增的可选字段 `blockReason` 旧版忽略。旧客户端仍可照常传完整参数。
- 改动文件：`recovered/shared/{collaboration-policy(新增),automation-store,collaboration-runtime,collaboration-staff,collaboration-staff-store,collaboration-staff-contracts,collaboration-staff-integration,collaboration-workers,automation-workbench}.mjs`、`scripts/sync-shared.cjs`（登记新模块）、`recovered/esm/000-extension.js/module-{0114,0119,0140,0143,0144,0165,0183}.mjs`。

## recovered.32：跨会话接班、自动槽位分离与策略继承

- 跨会话接班：手写交接质量合格时，按工作区路径（`workspace_root` 参数、宿主当前工作区或槽位定位字段）在共享临时记忆根的 `workspace-handoffs/` 登记索引；任何会话对同一工作区调用 `bridge_memory_brief` 时，顶部显示最近 5 次其他会话的交接（阶段、未完成、下一步、Git 与 memory_dir）。路径大小写、`\\`/`/`、`/e/...` 写法统一归一。brief 新增可选参数 `workspace_root`。
- 任务卡自动归档改写独立的 `<槽位>-auto.json`，不再覆盖同一执行者的手写槽位；手写交接合并并行槽位时忽略自动槽位。
- 交接门禁策略按目录逐级继承：任务目录未单独设置时，沿用上级（执行者 → 会话桶 → 记忆根）显式设置的 `handoff_gate`；`bridge_memory_policy` 读取结果附带 `source` 与 `inherited`。新写入的策略带 `explicit: true`，旧文件中非 `warn` 的策略视为显式设置。
- 内置 `selftest` 增至 29 项并在临时目录通过；未在真实 Bridge 会话中运行新版。

## recovered.31：记忆接班修复

- 修复任务检查点读取：`persist()` 写入的 `{ task: {...} }` 嵌套格式此前被按扁平格式读取，brief 永远显示「未命名任务、0 步」；现兼容两种格式，同根任务列表同样修复。
- 任务卡自动归档（`set_todos` 收尾）只写自己的槽位；同一记忆目录已有模型手写的有效交接时，不再覆盖主 `HANDOFF.md` 与 `handoff-good.md`。
- `bridge_memory_handoff` 新增定位字段 `workspace_root / git_branch / git_commit / artifacts / uncommitted / verified / constraints`，写入「定位与状态」节并随槽位延续；未填写时返回提醒。
- brief 追加：同一执行者的其他近期任务（即使当前目录已有检查点）、最近一次手写交接的完整槽位、最近 5 条工作日志。
- 交接质量判断不再把自动生成的套话（如「核查并衔接已完成任务…」）当作有效「下一步」。接班提示词同步要求核对定位字段并查看相邻任务。
- 仅在临时目录用内置 `selftest`（26 项）与接班场景脚本做了隔离验证；未在真实 Bridge 会话中运行新版。

## recovered.29：未完成任务持续推进规则

- 新增内置“执行 · 未完成任务持续推进”规则：未完成且仍有已授权工作时，在状态说明之后继续实际工具操作；不因里程碑或非阻塞问题主动停止。危险操作确认和真实权限门禁不受影响。
- 新规则库默认启用；已有规则库首次启动时在锁内备份并添加到通用及已绑定规则组，保留用户自定义、停用和后续删除。冲突或容量不足时不覆盖原数据；不会在构建时修改运行中的规则库。
- 仅生成新版，不启动或重启现有 OpenCode 实例；未运行功能测试。自然语言规则不保证所有模型或宿主能持续执行，也不能绕过宿主等待门禁。

## recovered.28：移除 run_command 工作区命令写互斥锁

- 移除 `TerminalCommandManager.run`（`recovered/esm/000-extension.js/module-0165.mjs`）针对 `git/npm/pnpm/yarn/pip/cargo/cmake/make` 子命令的 `workspace-mutation:<cwd>` 本机端口互斥锁、10 秒排队超时与 `WORKSPACE_BUSY` 拒绝，并同步移除 `recovered/shared/concurrency-runtime.mjs` 的 `workspace-mutation:` 端口分支及 `000-extension.js`/`002-agent-host.js` 终端规则文案中的写锁表述。
- `apply_patch` 单文件原子锁（`withFileLocks` + `STALE_FILE` 乐观版本校验）、多智能体协作任务的 `single-writer`（`TASK_WRITER_BUSY`）、命令归属校验、取消权限与空闲 2 小时终端回收均保持不变；多个会话在同一目录并发运行修改同一 `.git/index` 或依赖目录的底层命令时，直接交由 Git/OS 原生锁或调用方自行协调。
- 本次构建仅增量更新本工程 `opencode/`，保留 `data/`、`.recovery-profile/` 及非托管用户文件，不触碰正式 `E:\OpenCode`，不启停正在运行的实例，未运行功能或回归测试。

## recovered.27：Bridge 提问规则独立开关

- 默认规则拆为「需求澄清与交互式决策」（通用澄清、等待全部答复）和「Bridge 交互式提问」（`bridge_ask_user` 的单题/批次和答案查询）；两条可在规则中心分别启停。新建默认规则库时两条均启用。
- 对库中名称、来源、版本、正文与组引用均可精确识别的未定制 v1/v2/v3 默认规则，新版启动时在原有锁内备份后拆分；各规则组新增的 Bridge 条目继承原条目的启停状态。如已有完全一致的 Bridge 条目，则保留它自己的状态。遇到自定义正文、引用或名称冲突、容量不足时，不自动拆分该规则，也不覆盖用户内容；请在规则中心手动处理。已删除的默认规则不会被本版静默补建。
- Windows 默认规则库位于下文所述的共享路径，自动拆分可能被使用同一规则库的旧版看到。此功能不识别 Arena 或自动切换客户端；关闭 Bridge 提问规则仅停止该规则的提示，不删除或禁用工具，也不会解除已经存在的 Bridge 待答门禁。
- 常规生成只更新本工程 `opencode/`，不会启动程序或修改共享规则库。首次运行后的迁移、规则开关与各客户端问答行为需另行验证；当前运行或连接的旧进程不会自动替换为本版。

## recovered.26：以 LeanREA 指南替换内置 REA

- 内置 `leanrea` 是本地 Skill 指南，不是 MCP 服务或自动执行工具；原 REA 桥和 `ext__rea__*` 接口不再内置，能力不保证等价。完整上游说明、MIT 许可证和来源摘要位于默认 Skill 目录。
- Bridge `list_skills` 可发现本版内置指南并只读访问；用户同名 Skill 优先。缺少平台工具、用户未授权的安装、联网和目标执行均不能由指南自行放行。
- 未定制旧默认 REA 服务在本版启动时先备份引用再退役；定制、停用或无法核验的配置及凭证保留。未定制旧规则仅在本版读取时显示为 LeanREA，不重写可能被其他运行版共享的规则库；自定义规则保留。
- `npm run test:leanrea` 使用虚拟配置和临时目录覆盖发现、读写边界、退役及默认资源迁移；是否已执行、其平台和具体结果以本轮任务记录为准。测试不证明真实逆向能力或 GUI/MCP 的在线表现。
- 交付仍只写本工程 `opencode/`，保留 `data/` 与非托管文件；不会修改、停止或重启另一份 `E:\OpenCode`。

## recovered.21：运行版隔离与共享边界修复

- 主程序和 CLI 均固定使用当前运行版的 `data`；只接受本版 `.recovery-profile` 作为备用 profile，不继承其他运行版的 `VSCODE_PORTABLE`。关键数据目录拒绝链接。
- `Start-Isolated.cmd` 仅隔离普通配置，保留同用户规则/协作与发现目录；历史私有规则库不自动合并。
- 全局 Skills 在便携模式下限定本版 profile，新保存的位置采用 profile 相对路径。历史外部路径保持原配置并报错，用户需明确选择本版位置，不自动搬走文件。
- MCP 旧配置只复制、不改名原文件；便携模式不回退到公共 HOME 配置。可识别的其他 OpenCode 运行版绝对路径在连接前拒绝，普通系统工具仍可使用。任意 Shell 脚本不是安全沙箱。
- schema 4 保持稳定；旧 schema 1/2/3 需要明确迁移许可，未知未来格式拒绝覆盖。这不等于未更新的历史程序能理解新格式。
- 协作在授权前预检本版本 Skills；模型、凭证和真实连接仍由当前版本独立提供，不复制密钥或自动接管执行。
- `build:clean` 验证后也发布到固定 `opencode/`；`build:source` 是明确不发布的开发入口。
- 针对性检查入口：`npm run test:version-isolation`。实际执行结果以 `reports/version-isolation-tests.json` 为准；该检查不启动应用 GUI、不调用付费模型、不使用真实用户库。

当前源码发行：`1.0.0-recovered.32`；OpenCode 扩展与行为标识：`0.13.2`；Code-OSS 底座保持 `1.136.1`。

## recovered.20：Windows-MCP 默认接入

- Windows 新版正常运行后，默认初始化登记固定 `windows-mcp==0.8.8` 到编辑器和 Bridge，不再要求先运行可选配置命令。
- 已有同名服务的版本、启停和目标设置优先；初始化标记保留用户主动删除的选择。跨版本更新继续携带源码默认逻辑，不覆写真实用户配置。
- 不是离线依赖包：首次连接由现有 uvx 复用缓存或下载 Python 3.14 和依赖。遥测关闭；桌面工具仍受任务授权、工作区信任和规则门禁约束。
- `npm run generate:windows-mcp` 与 `build/update/package/generate:workspace-mcp` 统一编译并覆盖本源码下 `opencode/`，不生成 ZIP 或版本目录，不修改正式安装、不启停已有实例、不运行功能测试。
- 本轮未运行回归；默认配置和编译完整性不代表点击、截图或桌面控制功能已验证。

这是可重建的 JavaScript 恢复工程，不是完整原始 TypeScript 仓库。Electron、原生依赖及固定运行时按许可保留；不宣称从其原生源码重新构建。

## recovered.19：独立工作区 MCP 地址交付

- 本机当前 Windows 用户 DPAPI 保护的只读地址通道；只返回该真实工作区窗口自己的 Bridge 原始完整地址，不需要协作开关、工作台配对或 SecretStorage 读取。原 `/v1/source` 仍只负责真实来源登记，不改变其授权边界。
- `npm run generate:workspace-mcp` 现与正常构建共用固定 `opencode/` 发布器；已有目录直接更新构建文件，保留用户 data、账号及非托管文件。
- 唯一运行版交付路径为源码下 `opencode/`。正式 `E:\OpenCode` 不是发布目标。历史独立打包方式已被用户最新要求替代。
- 需两端新版由用户正常运行后才能实际交付；旧版不会被本次操作启动、停止或重启。源码18的工作区身份策略不变，不按名称迁移不同身份。
- 本轮仅生成和静态完整性校验；功能/回归测试实跑0，未执行真实MCP探测或模型发送。详见 `WORKSPACE-MCP-RECOVERED19.md`。

## 本版功能

规则交互：添加按钮位于列表末尾；条目默认折叠，仅保留删除与其后的小箭头动作。选择其他预设或输入库中不存在的名称自动展开。名称为空或精确匹配任意库规则时显示完整候选，否则按输入筛选。拖动左侧手柄排序，不再显示上下移按钮。折叠和候选状态只是界面状态，不改变已保存规则内容。


规则名称框支持搜索并选择库内预设；精确匹配库名时引用库正文，改成不存在于库的名称时保留正文并独立。库预设可维护，更新会影响引用组并要求重新确认规则。

除接入相关信息外，原复制提示词的静态要求拆成七条内置库规则并追加到通用组，不覆盖原规则或工作区绑定。MCP initialize.instructions 直接交付全部已启用规则，不再截断；工作区操作前仍要求显式读取并确认。schema 1/2 数据先备份，再锁内原子迁移到 schema 3。


- 独立规则中心：保存与切换规则组；每组多条命名规则可同时启用、停用、排序，完整合并交付给 AI。工作区使用通用组或指定组。
- 独立多任务协作页面：职位、成员与任务不与规则页面混用；两者具有独立文档、脚本、编辑器和工作区选择。
- 移除右上角全实例共享聊天记录按钮，不删除聊天记录或改变共享历史数据。
- 职位与实际成员：预置规划、开发、审查、文档、默认只读测试职位；支持自定义职责与工具白名单。显示名称不是模型身份或授权证明。
- 协作任务：依赖、真实调用者独占领取、版本与 lease 检查、结果提交、阻塞及本地确认交接。不会超时抢占。
- 原生协作执行器复用现有 OpenCode 模型提供方，在用户选模型并确认可能费用后启动；不打开被禁用的原生 Agents 独立窗口。
- 模型循环最多 12 轮，提供方内部重试依现有配置；原生执行槽为 2，并在本机多进程之间协调。命令不设固定进程/终端数量配额，也不设按 cwd 的命令写互斥锁，仍受宿主资源、权限与命令归属约束；文件补丁单文件锁与协作单写者保持不变。
- 模型提交默认按授权目标自主完成；只有本地明确启用结果验收才等待验收。不把模型文字、工具请求计数或 RPC 返回当作功能测试通过。
- Bridge 文件访问默认值为 `device`；已有明确的 `workspace` 选择不会被改写。操作仍受任务授权、操作系统权限及工具能力限制。

入口：状态栏“规则与协作”，或命令面板“OpenCode: 规则中心 / 多智能体协作”。原生 Chat 工具栏也注册了对应入口。界面使用宿主主题、字体、输入框、按钮和焦点令牌。

## 规则数据与版本切换

正常 Windows 运行的主存储默认位于：

`%LOCALAPPDATA%/OpenCode/shared-automation/rules-and-collaboration.v1.json`

这是固定的数据格式目录，不是应用版本目录。升级、重新生成或切换支持该系统的版本，不重置已有预设、通用规则选择、工作区绑定和职位定义；未定制的内置默认规则可按上述条件备份并升级。工作区身份由规范化的实际目录路径产生，不使用安装目录或窗口名称。

`opencode.rules.dataDirectory` 可指定一个专用、稳定的绝对目录。`OPENCODE_AUTOMATION_HOME` 显式环境变量优先，用于隔离运行等场景。普通配置与运行状态按本版 profile 隔离；发布的 Start-Isolated.cmd 在重定向 LOCALAPPDATA 之前固定共享目录。测试夹具可显式选择自己的临时规则库，不触碰真实数据。

当前活动配置还保留恢复快照。schema 1 的单文本预设升级为 schema 2 的规则组内一条启用规则，组 ID、通用选择和工作区绑定保持。默认不在启动时自动升级旧共享库；确认所有使用该库的版本支持 schema 4 后，显式启用 opencode.rules.allowLegacyMigration，才会先备份旧文件并在同一文件锁内原子迁移。固定的 .v1.json 文件名是历史存储地址，不随应用版本更换。只有主文件不存在时才恢复有效快照；JSON 损坏、未知数据格式或无效引用会明确报错，不将错误解释为“没有规则”并重置。数据格式的语义变更必须提高 schemaVersion，旧版本不得覆盖未来格式。

已有全局和工作区 `bridge.customInstructions` 只在首次建立规则库时导入，明确保存的空文本也保留。之后改变发行默认值不会覆盖用户数据。旧版不支持规则中心时仍可保留文件，但不会凭空执行新规则功能。

## MCP 的规则交付与门禁

Bridge 初始化提供规则机制、当前预设与读取要求。AI 先同步任务卡，再调用：

1. `bridge_get_effective_rules`：完整读取工作区规则、操作策略、职位和规则哈希。
2. `bridge_acknowledge_rules`：确认刚刚读取的当前版本。

业务工具调用前重新检查真实调用者、目标工作区、规则版本、只读/命令策略及职位工具白名单。切换规则或职位使旧确认失效。原生 Chat 将同一份有效规则加入模型请求，并在工作区工具执行前检查；原生协作执行器也使用这份规则。

协作接口：`bridge_join_collaboration`、`bridge_get_collaboration`、`bridge_create_task`、`bridge_claim_task`、`bridge_update_task`。位置和职位由本地用户管理；未分配的外部调用者默认只读，不能通过显示名称自行提升权限。

成员公开 ID 为摘要，不公开 MCP 会话身份；任务 lease 不在公共清单中暴露。规则 API 不授权越过当前用户任务或更高层要求。确认代表客户端完成交付流程，不证明模型已理解或遵从所有自然语言规则。

任意 Shell、同一系统用户的外部程序和共享凭证不能被这套应用层规则变成安全的多用户沙箱。需要强隔离时使用独立凭证、进程或系统账户。跨主机文件系统及非合作编辑器也不属于本机协调的完整覆盖范围。

## 更新、运行与数据保护

默认仅生成，不启动程序、不运行功能测试、不发送模型任务：

```bash
npm run build          # 源码编译、资产与哈希校验，再发布到本工程 opencode/
npm run update         # 同上
npm run build:source   # 仅更新内部编译暂存 generated/source-build/，不是另一个交付运行版
npm run package        # 兼容旧命令：同 build，仍只生成 opencode/
npm run generate:windows-mcp   # 同 build
npm run generate:workspace-mcp # 同 build
```

运行目标固定为本工程的 `opencode/`，不是正式 `E:/OpenCode`。由用户启动 `opencode/OpenCode.exe`；隔离运行使用 `opencode/Start-Isolated.cmd`，其普通配置隔离，规则/协作继续共享；旧隔离规则库保留，不自动合并。

发布直接覆盖本次构建清单中的同名文件（已有目录须有本工具管理的发行标记，否则拒绝覆盖），保留 `data/`、`.recovery-profile/` 和非托管用户文件。目标正在运行时拒绝发布，不擅自终止实例。遗留锁先核对所有者、日志和备份，不强抢。

发布记录当前本地 Git 提交及 dirty 状态，不自动创建提交或 push；保留已有基线。不要将账号、密钥、Bridge 地址、聊天或运行数据加入源码提交。


## 运行中构建：延迟发布与编辑锁
<!-- OpenCode p36/p37 -->

**延迟发布（p36）**：`npm run build` / `update` 时，若本工程 `opencode\` 下有进程在运行（只看可执行文件路径在 `<源码>\opencode\` 下的进程；正式安装 `E:\opencode\OpenCode.exe` 在运行不影响），不再报错，而是：

- 构建与校验照常完成；发布前的冲突/自定义文件检查照常执行（有问题仍直接失败）；
- 构建移到 `<源码>\opencode.next\`，并写 `<源码>\.pending-update.json`（id、版本、提交、运行中的进程），`reports/runtime-update.json` 中 `deferred: true`；`opencode\` 不做任何改动；
- 文件与当前运行版完全一致时不暂存，只报告 up to date。

下次用 **`Start-OpenCode.cmd`**（工程根目录，新）或 **`opencode\Start-Isolated.cmd`** 启动时，会先运行 `scripts/apply-pending-update.cmd` → `apply-pending-update.cjs`：占 `.build-lock`，以 `publish-runtime.cjs --from-pending` 走原有的备份/日志/回滚流程发布，成功后删除 `opencode.next` 与标记并执行收尾（`post-publish.cjs`：重置 confirmBeforeClose、只留 2 个回滚点）。若仍有进程在跑、有构建持锁或发布失败，则保留暂存、启动旧版本。也可关闭 OpenCode 后手动 `node scripts/apply-pending-update.cjs`。直接双击 `opencode\OpenCode.exe` 不会应用暂存。没有进程在运行时行为与以前相同，且成功发布会清掉过期的 `opencode.next`。`publish-runtime.cjs --no-defer` 恢复「运行中即失败」。以上只操作本工程目录，绝不触碰 `E:\opencode`。

**编辑锁（p37）**：多个会话改同一源码文件（尤其共享的 `027-workbench.desktop.main.js/module-1476.mjs`）前先占锁，改完释放。锁是建议性的：`update.cjs` 构建前后发现有效锁只打印 WARNING，不失败。

```bash
node scripts/edit-lock.cjs acquire [文件] --owner <会话名> [--note "p38 浮窗"]   # 默认文件 module-1476.mjs；同 owner 再 acquire = 续期
node scripts/edit-lock.cjs status  [文件]                                     # 不给文件列出全部；有有效锁时退出码 1
node scripts/edit-lock.cjs release [文件] --owner <会话名> [--force]
```

锁文件在 `.edit-locks/`，记录 owner、开始与最后续期时间；30 分钟未续期视为过期，`status` 标 STALE，他人 `acquire` 可直接接管。被占用时 `acquire` 退出码 2。

## 源码维护

- `recovered/shared/` 是共享维护代码真源；`scripts/sync-shared.cjs` 同步入口变体。
- `recovered/esm/` 是恢复的显式模块；不同入口变体必须一起维护。
- `recovered/standalone/` 是构建分类中的其他 JavaScript 输入，不是旧版产品说明入口。
- `assets/` 保存当前静态资源；`recovered/workbench-assets.json` 注册维护的工作台资产。
- `baseline/`、`upstream/`、许可证与原始恢复材料保持不变，不因删除旧界面而删掉必要依赖。
- 旧“开始使用”、walkthrough、教程、独立版说明及 GUIDE.md 不作为当前产品入口或说明；历史证据保留在开发记录中，不恢复旧页面。
- 已有原生 Chat 目录上下文和内置扩展卸载修复保留。

## 验证边界

本次默认只做生成所需的编译、输入/产物哈希和完整性检查。**未运行回归或功能测试，未启动模型请求，未验证 UI、真实多智能体执行或跨版本迁移的运行行为。** 历史 test-suite 不能作为本版已测试证据。

只有用户明确要求测试，才按项目独立入口使用隔离配置并执行指定范围；不得自行将生成升级成测试。不要关闭产品完整性校验，不冒称穷尽行为等价或完整原始 TS 类型恢复。

## recovered.11：Windows-MCP 与协作总开关

见 `WINDOWS-MCP-COLLABORATION-RECOVERED11.md`。默认关闭多模型协作（包括未设置新字段的既有配置）；普通规则与安全策略独立保留。Windows-MCP 通过本地用户确认后接入全部 21 项工具，不因协作关闭而禁用。这里只生成与编译，未运行功能测试，不用历史报告认证新版。

## recovered.12：AI 自主收尾与明确工具回执

见 `TASK-AUTONOMY-RECOVERED12.md`。普通会话任务卡由 AI 自维护；原生协作默认自动完成，仅用户明确开启人工验收时进入待审查。不改动费用授权、强停和在途任务交接保护。仅编译，不运行测试或启停实例。

## recovered.13：模型助手程序来源

见 ASSISTANT-SOURCE-RECOVERED13.md。协作开启后，已配对模型助手提供实例名及真实对话标题，并通过来源专属连接关联；非助手客户端保持原行为。不依赖 AI 自报名，不把来源绑定当作 AI 身份认证或权限提升。

## recovered.14：完整运行版与构建依赖

共享模块同步支持单/双引号并追踪传递依赖；本地扩展模块缺失不再悄悄外置。构建/完整性检查覆盖新增来源与 Windows-MCP helper 的真实编译输入。当前只交付源码下固定 `opencode/`，不另建版本运行目录或 ZIP，不覆盖在用 E:\OpenCode，不复制旧用户配置或验收记录。只生成、编译和包检查；未运行目标程序或功能测试。

## recovered.18：API / MCP 员工与经理团队

见 `COLLABORATION-EMPLOYEES-0.13.0.md`。员工/团队及其任务独立存储，不升级共享规则 schema 4；API员工复用模型管理中的独立提供方配置，MCP员工由真实客户端主动接单。经理在一次明确授权的项目、员工与预算范围内派工、审查、返工、整合，并仅在明确允许时回写原项目。API密钥不进入员工账本。版本、源码生成和功能验证分别记录；本次不运行真实协作、模型请求或功能测试。
