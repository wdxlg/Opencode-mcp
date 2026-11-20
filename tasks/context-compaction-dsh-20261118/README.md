# context-compaction-dsh-20261118 — 压缩与默认输出对齐 dsh

快照 tag：`pre/context-compaction-dsh-20261118-1738`（= HEAD a924c2de）
备份：`backup\context-compaction-dsh-20261118-1738\`（改动前 6 个文件，按相对路径）
补丁：`context-compaction-dsh.patch`（基线 = 备份；文件里有其他会话未提交改动，所以**没有 git commit**）
构建：`node scripts/update.cjs` → `hark_build_context-compaction-dsh.log`，BUILD_EXIT 0，发布到 `opencode\`

## 改动
- agent-host `module-0029.mjs`
  - 触发点 `floor(min(0.8W, W−O−65536))`，下限 0.4W（实测：64K 窗口按 dsh 公式≈0，原 W/4 下限会在 1.6 万就反复压缩）；用户在设置里明确填了 compactThreshold 时改按 (W−O)×比例。
  - 保留原文 `floor((W−O)×0.16)`（用户明确填了 keepRecentTokens 时用填的值）；溢出重试仍按 1/2、1/4 收紧。
  - 去掉 60% 时的旧工具结果清理；改为只在压缩时裁剪：保留部分里 > 8000 字符的工具结果留开头 4000 + 结尾 1000，以往轮次的工具上下文块同样头 4K + 尾 1K。
  - O：扩展传来的 outputReserve；没传时 DeepSeek 官方取其输出上限，其他为 0（原来所有模型预留 min(输出, 20%W, 64K)）。
- `module-0064.mjs` / `module-0173.mjs`：DeepSeek 官方输出 384e3 → 256e3。
- `module-0174.mjs`：默认输出 384e3 → 32768。
- `module-0171.mjs`：新增 `maxOutputTokensExplicit`（提供商窗口填写、配置里填写、/models 返回时为 true）。
- `module-0177.mjs`：传 `outputReserve`（明确值或 DeepSeek 官方才预留，其他 0）；compactThreshold / keepRecentTokens 只在用户明确设置时传。

## 预期触发点
128K（128000）62464；256K 196608；DeepSeek 官方 1M（O=256000）727040。

## 自检（不是测试套件）
`node tasks/context-compaction-dsh-20261118/selfcheck.mjs`

## 回滚
备份目录文件按相对路径拷回（或 `git apply -R context-compaction-dsh.patch`），再 `node scripts/update.cjs`。

---

## 2026-11-19 PART A：默认输出上限与压缩预留 O 对齐 dsh（不含构建）

依据 `PLAN.md`（用户已确认：与 dsh 完全一致，不加额外下限）。只改源码，**未构建、未提交**；PART B（压缩）完成后统一构建。

快照 tag：`pre/context-compaction-dsh-20261119-1308`（= HEAD aa6c7518）
备份：`backup\context-compaction-dsh-20261119-1308\`（改动前 4 个文件，按相对路径）
脚本：`partA\edit-partA.cjs`（精确匹配断言，全成或全不成）+ `partA\block0174.b64`；补丁 `partA\partA.patch`（基线 = tag）

上次（11-18）已应用、本次核对确认的：`module-0174` 默认输出 32768；`module-0173` / agent-host `module-0064` DeepSeek 官方 256e3。

### 本次改动
- `module-0174.mjs`：新增 `DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS = 256e3`、dsh 输出目录 `DSH_OUTPUT_CATALOG`（pi-ai providers/data 的 maxTokens，按端点主机归并，19 个主机；chatgpt.com/Codex 不收录）、`dshCatalogMaxOutputTokens(id, baseUrl)`、`dshDefaultMaxOutputTokens(id, baseUrl)`（api.deepseek.com → 256000；其他 目录 ?? 32768）、`DSH_OUTPUT_CATALOG_JSON`。
- `module-0171.mjs`：
  - 新增 `ocDshOutputFields`：输出上限 = 用户填写 > /models 发现（官方 DeepSeek 取 min(256000, 发现值)）> dsh 目录 > 32768；官方 DeepSeek 未发现时 256000。同时给出 `outputReserveTokens`（压缩预留 O）：用户填写或发现值；官方 DeepSeek 默认 256000；其他 0。
  - 用在：提供商管理模型、/models 发现模型（Codex 原逻辑不变）；`configuredRuntimeBase` 默认值改为 官方 DeepSeek 256000 / 其他 32768 并带 `outputReserveTokens`；旧版单模型路径（非 DeepSeek 原来不发 max_tokens，现按 目录 ?? 32768）；按模型配置和提供商窗口填写的 maxTokens 同时写入 `outputReserveTokens`。
  - 新增 `ocDshOutputCap`：Chat Completions / Responses / Anthropic 请求的输出上限不超过「窗口 − 输入估算 − 4096」（pi-ai 的 clamp）；Codex、官方 DeepSeek（已有 −1024 预留逻辑）不变。**偏差**：下限取 min(上限, 4096)，因为本地估算会把图片高估，避免输出被压到个位数。
  - `maxOutputTokensExplicit` 保留（module-0177 的 `ocContextOutputReserve` 仍读它，结果与 outputReserveTokens 一致）；改 0177 改读 outputReserveTokens 属于 PART B。
- `module-0161.mjs`（第 4 项）：提供商编辑器「最大输出 token 数」占位符由「自动」改为按模型显示 dsh 默认（目录值 / DeepSeek 官方 256K / 32K）。
- `model-defaults.mts`（参考源）：384_000 → 32_768，新增 256_000 常量与说明。`package.json` 无默认输出值，无需同步。

### 未改 / 留给 PART B
- agent-host 自己发请求（`agent-request.mjs`）：非 DeepSeek 的 Chat Completions 仍不发 max_tokens，未加 clamp。
- 单模型配置路径（非提供商管理、未走 /models）不按模型 id 查输出目录，用 32768。

### 校验
`node --check` module-0171/0174/0161 均通过；沙盒内对目录查找和编辑器占位函数做过手工核对（claude-opus-4-6 → 128000/128K，k3@api.kimi.com → 131072，api.deepseek.com → 256000，未知 → 32768）。未运行测试、未启动程序。

### 回滚（PART A）
把 `backup\context-compaction-dsh-20261119-1308\` 下 4 个文件按相对路径拷回（或 `git apply -R tasks/context-compaction-dsh-20261118/partA/partA.patch`，或 `git checkout pre/context-compaction-dsh-20261119-1308 -- <这 4 个文件>`）。未构建，所以无需重新发布；若之后已构建，回滚后再 `node scripts/update.cjs`。

---

## 2026-11-19 PART B：压缩对齐 dsh（精确公式，无下限）+ 构建

依据 `PLAN.md` PART B（用户确认：与 dsh 完全一致，不加任何下限）。快照 tag 同 PART A：`pre/context-compaction-dsh-20261119-1308`（= HEAD aa6c7518）。
备份：`backup\context-compaction-dsh-20261119-1308\`（新增 PART B 改动前 7 个文件，按相对路径；agent-context.mjs 与 HEAD 仅 CRLF 不同）。
脚本：`partB\edit-partB.cjs` + `partB\partB-edits.json`（18 处精确匹配，\r?\n 容忍，全成或全不成；`partB\build_spec.py` 生成 json）。补丁：`partB\partB.patch`（基线 = tag，PART A+B 全部源码改动）。
自检：`node partB\selfcheck-partB.cjs`（纯公式，结果 `partB\selfcheck-partB.out.txt`）。

改动：
- agent-host `module-0029.mjs`：dshCompactSpec = budget W−O；threshold floor(min(W×ratio, W−O−65536))（ratio 默认 0.8，用户 compactThreshold 替换 ratio）；retain floor((W−O)×0.16) 或用户固定值。删除旧 0.4W 下限、O 截断到 W−4096、retain 2000 下限。W−O≤0 / W−O−65536≤0 / retain≥threshold → 每个模型只警告一次（console.warn + trace phase=config_error），跳过自动压力压缩。压力路径：≥threshold → 工具结果裁剪 → 重估 → retain 压缩最多 2 次 → 仍超则警告继续（phase=over）。历史预算 = threshold（配置错误时 W−O）。溢出重试 1 = 裁剪 + retain 0；重试 2 = 原强力裁剪 + retain 0；最多 2 次 + 窗口学习不变。手动 /compact 不变。
- `agent-compaction.mjs`：compactContext 支持 options.retain；压缩后不再自行裁剪工具结果（改由调用方先裁剪）。
- `agent-context.mjs`：裁剪器 = dsh（>8192 码点 → 头 4096 + "[... tool result middle pruned ...]" + 尾 1024）；threshold 后备 0.8；keepRecentTokens 0/未设置 = 16% 规则。
- `agent-turn.mjs`：历史预算用 historyBudgetTokens()（修复 threshold 未设置时 NaN → 不驱逐历史）。
- `module-0014.mjs`：parseContextCompaction 透传 outputReserve（此前被丢弃，O 实际总是后备值）。
- 扩展 `module-0177.mjs`：ocContextOutputReserve 读 PART A 的 outputReserveTokens（无字段时沿用旧规则）；新增进度文字 pruned / over / config_error。
- `package.json`：compactThreshold / keepRecentTokens 说明改为 dsh 公式，keepRecentTokens minimum 0。
（0.6 工具结果清理在 11-18 那次已移除，本次确认不存在。）

回滚：
- 只回滚 PART B：把 `backup\context-compaction-dsh-20261119-1308\` 下 PART B 的 7 个文件按相对路径拷回，或 `git checkout pre/context-compaction-dsh-20261119-1308 -- <这 7 个文件>`，再 `node scripts/update.cjs`。
- 回滚 PART A+B：`git checkout pre/context-compaction-dsh-20261119-1308 -- recovered assets` 后重建；若已提交则 `git revert <commit>`（不重写历史）。
