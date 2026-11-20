## 2026-11-19 dsh-metrics EXT（扩展/工作台显示侧）— 已应用（未构建、未提交）
依据 `AUDIT.md`（只读审计）。规格：`ext-edits.json`（17 处精确匹配，`build_spec.py` 生成；缓存命中函数取自 `cachehit_port.js`，尾部已按 dsh client.js:6761-6773 逐字替换），引擎 `edit-ext.cjs`（= PART B 引擎，\r?\n 容忍，全成或全不成，先备份）。
改动：
- W2198 `module-2198.mjs`：圆环分母 = contextWindow（不再 + maxOutputTokens）；不显示输出预留带（#1）。
- E177 `module-0177.mjs`：圆环只用提供商上报的提示词 token，没上报就不更新圆环（#2）；流式时不再按字符估算输出（estimate = 0，"≈" 自然消失）（#4）；不再把存储的 tokenRatio 传回 agent-host（#6，窗口学习保留）；tok/s 计入有首 token 的所有步（含输出 0），tps 不再预先四舍五入（#10）；每轮 metadata 增加 speedTokens/speedMs/ttftMsTotal，会话统计累加 speedTokens/speedMs/ttftMsTotal/ttftCount/llmMs/toolMs（#11）。
- W2372 `module-2372.mjs`：紧凑 token 格式 = dsh formatTokens（517 / 12.2K / 517K / 1.2M）（#13）；时长 = dsh formatDuration（<60s 一位小数，否则四舍五入 分/秒），首 token 不再 max(1)（#14）；tok/s = dsh formatTokensPerSecond，0 也显示（#10）；缓存命中 = dsh formatCacheHitPercent（本轮 1 位、会话整数，部分命中不显示 100%）（#12）；会话统计新增 输出速度 / 首 token（平均）/ 模型用时 / 工具调用用时（#11）。
未做：#3 圆环分项（依赖 agent-host ACX 合并 mcp/skills，单改扩展会错分比例）；#18 可选项。
回滚：把 `backup\dsh-metrics-20261119\ext\<相对路径>` 拷回，或 `git checkout pre/dsh-metrics-ext-20261119-<HHMM> -- recovered/esm/000-extension.js/module-0177.mjs recovered/esm/027-workbench.desktop.main.js/module-2198.mjs recovered/esm/027-workbench.desktop.main.js/module-2372.mjs`，之后统一重建。
