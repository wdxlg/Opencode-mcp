# context-fixes-20261118 — 原生对话上下文处理修复（用户指令「全部修复」）

任务 ID：context-fixes-20261118-1558-step01　修改前快照：git tag `pre/context-fixes-20261118-1558-step01`（= HEAD 9699e492）
备份：`backup\context-fixes-20261118-1558\`（改动前的每个文件，含 shared 与 esm 变体的 project-memory/automation-store）
补丁：`context-fixes.patch`（相对源码根的 git diff，基线 = 备份里的文件，包含其他会话尚未提交的改动作为上下文）

**未提交 Git**：被改的 module-0161/0171/0177、project-memory、automation-store、package.json 等文件里已有其他会话未提交的改动，按要求不混提交；只保存补丁。

## 改动（按修复项）
1. 上下文窗口默认值 / 溢出学习
   - `recovered/esm/000-extension.js/module-0174.mjs`：未知 API 模型默认 1M → **128K**；Codex 默认 1M → **272K**（ChatGPT 登录的 Codex 多数模型为 272K）。
   - `module-0171.mjs` configuredRuntimeBase：官方 DeepSeek 端点（api.deepseek.com）未填时用 **1M**（官方文档：1M 上下文、384K 输出）；发现值 / 每模型填写值仍优先。
   - `recovered/typescript/.../model-defaults.mts`：参考源同步（不参与构建）。
   - `module-0161.mjs`（提供商编辑器 OC_PROV_JS）：模型未填上下文窗口时，折叠摘要显示「上下文 未知（按 128K / 1M（DeepSeek 官方）计算）」，展开后输入框下方提示默认值与自动学习。
   - `002-agent-host.js/module-0029.mjs`：新增 `parseContextLimitFromError`（maximum context length is N / prompt is too long: N > M maximum / exceeds the context window of N / maximum number of tokens allowed (N) / 中文「上下文上限 128k tokens」等）；溢出时立即把窗口改为报错给出的上限、发 `context_learned` 追踪；解析不到数字时本次运行按当前估算的 90% 收紧窗口。压缩预算与截断阈值改用有效窗口；溢出重试 1 次 → **2 次**（第 2 次：只留 1 条工具结果、工具输出截到 30% 窗口、保留最近 1/4、以往工具上下文头 1.5K+尾 0.5K）。兜底摘要从 8 条×140 字改为首尾消息长保留 + 中间按预算均匀采样（预算≈有效窗口 8%）。
   - `module-0177.mjs`：扩展把学到的窗口按「提供商地址+模型」存到扩展全局存储 `learned-model-context.json`（不含密钥），之后每次运行经 `contextCompaction.learnedWindow` 传回；聊天里提示「已从提供商报错学到…」。
   - `002-agent-host.js/module-0014.mjs`：输入解析放行 `contextCompaction.learnedWindow / tokenRatio`。
2. 记忆简报每轮稳定注入
   - `recovered/shared/project-memory.mjs`：`SessionMemoryTracker.resolveInjection(..., {stableBrief:true})` → 每轮返回同一份缓存的完整简报（≤230 行，note 也固定），简报之后的新增条目放 `delta`；累计增量 >25 条、无法逐条列出或强制刷新时才重渲简报。旧调用方（外部 MCP 首轮全量 + 增量）不变。
   - `recovered/shared/automation-store.mjs`：`instructions()` 透传 stableBrief，`prepareNative` 在 stableBrief 时返回 `memoryDelta`。
   - `module-0177.mjs`：原生对话 prepareNative 传 `stableBrief:true`；`memoryDelta` 放进本轮用户消息 `<memory_delta>`；每轮变化的任务卡句柄（task_id/expected_revision）也从 system 移到用户消息 `<task_card>`，system 只留固定的任务规划优先说明 → system 前缀稳定。
   - shared 文件由 `scripts/sync-shared.cjs`（update.cjs 第一步）同步到 `esm/000-extension.js/` 与 `esm/003-mcp-server.js/` 变体。
3. AGENTS.md / CLAUDE.md
   - `agent-extras.mjs` 新增 `buildAgentsInstructions`：工作区根 → 附件/可见编辑器文件所在目录逐级收集 AGENTS.md、CLAUDE.md（越具体越靠后），默认 32KB 预算、从最具体的文件开始分配，浅层文件截断/省略并注明；内容相同的文件、已包含在规则中心正文里的内容去重；跳过 .git/node_modules/.opencode/.opencode-project 等；工作区不受信任时不读。
   - `module-0177.mjs`：放在本轮用户消息 `<agents_md>`（在 `<project_rules>` 之前，不影响 .opencode/rules 处理）。
   - `package.json`：新增设置 `opencode.context.readAgentsMd`（默认 true）、`opencode.context.agentsMdBudgetBytes`（默认 32768）。
4. 以往轮次工具上下文 / 输出预留
   - `module-0029.mjs` 新增 `shrinkPriorToolContextBlocks`：0.6 清理时把本轮之前 assistant 文本里的 `<opencode_prior_tool_context>` 块裁成头 4K + 尾 1K 字符并注明省略量（幂等）。
   - 所有模型的阈值都扣除输出预留 min(最大输出, 窗口 20%, 64K)（原来只有 DeepSeek）。
   - 落盘 spill：**未做**（扩展已在对话元数据里保存工具上下文原文，agent-host 侧没有会话存储目录，新增落盘要新增清理策略，收益小）。
5. token 估算
   - `estimatedTokens`：ASCII 字母数字 0.27、空白 0.15、标点 0.55、中日韩 0.65、其他非 ASCII 0.5/1、增补平面 1.5。
   - 每步有提供商 usage 时按 实测 input / 本地估算 平滑学习校准系数（0.7/0.3 EMA，限 0.3–3，样本 ≥2000 token、prompt-tools 模式不计），按「提供商+模型」持久化并传回；历史预算、阈值、压缩预算都乘系数。
   - 上下文圆环：没有实测 usage 时数字 = 估算×系数，分项标签加「≈估算」。
6. codebase_search 混合检索：**跳过**（见 task.md 原因）。

## 自检（不是测试套件）
`node tasks/context-fixes-20261118/selfcheck.mjs`：只读源码，用样例字符串检查报错解析、估算、工具上下文裁剪、兜底摘要、AGENTS.md 收集、记忆简报缓存；临时文件写到系统临时目录并删除。

## 回滚
把 `backup\context-fixes-20261118-1558\` 下的文件按相对路径拷回，或 `git apply -R context-fixes.patch`（要求文件仍是本次修改后的内容），然后重新 `node scripts/update.cjs`。
