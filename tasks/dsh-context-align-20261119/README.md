# dsh-context-align-20261119 — OpenCode 上下文与 dsh 对齐（6 项）

快照 tag：`pre/dsh-context-align-20261119-1531`（= HEAD a3948cc5）
备份：`backup/dsh-context-align-20261119/`（改动前 7 个文件，按 recovered/esm 相对路径）
补丁：`dsh-context-align.patch`（基线 = tag）
构建：`node scripts/update.cjs` → `hark_build_dsh-context-align.log`
参考：dsh 解包 %TEMP%\dsh-ctx-audit-20261119\ctx.tgz（dsh-compaction-basic、dsh-spill-policy、dsh-agent-instructions）

## 改动
1. 历史重建（agent-host module-0029 / agent-turn / module-0014；扩展 module-0177）
   - 每轮结束 agent-host 返回 `replay`（实际发出的用户消息 + 之后全部 assistant/tool/附加消息 + 最终回答），扩展存到 `metadata.opencodeReplay`。
   - 下一轮历史条目带 `replay` / `replayUser`，agent-host 原样重放结构化消息；工具调用和结果配对校验；推理内容仅当前为 DeepSeek thinking 时保留，Anthropic thinking 仅同模型保留；图片存为占位文字。
   - 没有记录的旧轮次照旧走文字历史（24K/32 条/12K）。整轮 > 4MB 时工具结果截到 12K，仍超就不存。
2. 压缩摘要（agent-compaction / agent-context）
   - 摘要请求 = 系统提示 + 常驻前缀 + 要压缩的那段原始消息（含旧摘要）+ dsh 原文 8 段指令（最后一条 user），带同样工具定义、同样 thinking，复用前缀缓存；放不下时回退为文字转录 + 同一份 8 段指令。
   - 摘要作为 user 消息（dsh CHECKPOINT_PREAMBLE + <compacted-summary>）放在系统提示和常驻工作区指令之后；系统提示不再变化；被折叠的当前请求保留 64K。
3. AGENTS.md / CLAUDE.md（agent-extras `buildDshAgentsInstructions`；agent-turn；module-0029）
   - 全局 ~/.opencode/AGENTS.md、~/.agents/AGENTS.md；向上找 .git 作项目根，项目根→工作区逐级 AGENTS.md、CLAUDE.md、AGENTS.local.md、CLAUDE.local.md；上限 64KB（设置 agentsMdBudgetBytes 明确填写时用它）。
   - 作为常驻 user 消息 `<workspace_instructions>` 紧跟系统提示，不驱逐不压缩；不再每轮拼进用户消息。
   - 工具访问子目录时补发该目录链上未发过的指令文件（`<workspace_instructions path=...>`，本步合计 64KB）。
4. 系统提示词与工具缓存（module-0177 / agent-turn）
   - 权限模式说明、「MCP 工具已变」提示移到本轮用户消息末尾；非自动压缩模式的历史摘要不再拼进系统提示。
   - DeepSeek（官方地址或 deepSeek 标记）默认关闭工具延迟加载；用户明确设置 opencode.tools.deferLoading 时以设置为准。重放让已加载过的延迟工具在后续轮开局即加载。
5. 工具结果上限（module-0029）：单个结果 > 12,500 token（4 字符/token）时完整写入 %TEMP%\opencode-spill-*\，消息保留头尾各半 + `[...]` + `(Omitted N bytes. Full formatted result stored at: <path>. Use run_command with sed -n/grep ...)`；包括 read_files。
6. 上下文环（module-0029 / agent-context / module-0177）：工具结果进来后发 `context_live`（实测基线 + 新增估算），圆环步骤间实时上涨；工具占比只算实际发出的工具定义；技能并入「连接器、MCP及技能」。

## 自检
- 7 个文件 `node --check` 通过。
- 沙盒里用桩模块跑过 agent-turn + agent-compaction：重放（孤立工具结果被丢弃、缺结果补占位、推理保留）、常驻前缀、摘要请求消息序列 s,u,u,a,t,a,t,u,a,u（指令在最后）、带工具 + thinking enabled、压缩后结构 system / workspace_instructions / 摘要 user / 当前请求。
- 未运行测试套件、未启动程序；未在 DeepSeek 上实测（连续两条 user 消息、带 reasoning_content 的摘要请求、缓存命中率）。

## 回滚
`git checkout pre/dsh-context-align-20261119-1531 -- recovered/esm`（或备份目录拷回），再 `node scripts/sync-shared.cjs && node scripts/update.cjs`。
