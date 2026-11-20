# context-default-dsh-20261118 — 默认上下文窗口改成和 dsh 一致

快照 tag：`pre/context-default-dsh-20261118-1647-step01`（= HEAD c7fb081d）
备份：`backup\context-default-dsh-20261118-1647\`（改动前 5 个文件，按相对路径）
补丁：`context-default-dsh.patch`（基线 = 备份里的文件；这些文件里已有其他会话未提交的改动，所以**没有 git commit**）
构建：`node scripts/update.cjs` → `hark_build_context-default-dsh.log`，EXIT=0，发布到 `opencode\`（changedFiles 4）

## dsh 规则（E:\Dsh\resources\app.asar，只读解包到 %TEMP%\dsh-asar-ctx-20261118）
- 通用适配器 `@deepseek-ai/dsh-llm-pi-ai/lib/index.js`：:959 `DEFAULT_CONTEXT_WINDOW = 262144`，:961 `DEFAULT_MAX_TOKENS = 32768`；:693 窗口 = 配置的模型值 ?? 内置目录值 ?? 路由 defaultContextWindow(262144)；:387 目录 = pi-ai `providers/data/<provider>.json`，按 provider + 模型 id 精确匹配。
- 发现 `:2332 readListing`：窗口取 contextWindow/context_window/context_length/max_input_tokens/limit.context 第一个正整数；输出取 maxOutputTokens/max_output_tokens/maxTokens/max_tokens/limit.output/top_provider.max_completion_tokens；`models` 可为对象映射。`:2385` 有内置目录的 provider 直接返回目录，不请求接口。
- DeepSeek 官方 `@deepseek-ai/dsh-llm-deepseek/lib/index.js`：:17 `OFFICIAL_CONTEXT_WINDOW = 1048576`（deepseek-flash、deepseek-v4-pro），:38/:451 其他 id 回退 1e6，:40/:450 maxTokens 256000，:525 取值顺序；/models 列表值覆盖内置（:2636）。
- 压缩 `@deepseek-ai/dsh-compaction-basic/lib/index.js:124-133`：阈值 floor(min(W×0.8, W−O−65536))，原文保留 floor((W−O)×0.16)，O = 请求 maxTokens。

## 改动
- `module-0174.mjs`：回退 128K → 262144；Codex 回退 272K → 262144（目录内模型多为 272000）；新增 dsh 目录表（openai、openai-codex、anthropic、google、moonshot ai/cn、kimi-coding、z.ai、bigmodel、qwen token-plan 国际/国内、minimax/minimaxi、xiaomi 及 token-plan、xai、mistral、groq；按端点主机归并）与 `dshDefaultContextWindow(id, baseUrl)`（精确 id 匹配；api.deepseek.com：两个官方 id 1048576，其他 1e6）。
- `module-0171.mjs`：提供商管理模型、/models 发现模型、旧版单模型路径都按 dsh 目录取默认窗口；用户填的值、发现值优先；发现解析补齐 dsh 的字段名与 models 对象格式；`DEFAULT_CONTEXT_WINDOW` 128K → 262144。
- `module-0029.mjs`（agent-host）：`CONTEXT_FALLBACK_WINDOW` 128K → 262144。学到的窗口逻辑未动。
- `module-0161.mjs`：提供商编辑器提示按模型显示「272K（dsh 目录）」/「1M（DeepSeek 官方）」/「256K」。
- `model-defaults.mts`：参考源同步。

## 自检（不是测试套件）
`node tasks/context-default-dsh-20261118/selfcheck.mjs`：只读源码，检查目录查找和编辑器提示函数。23 项全部通过。

## 回滚
把备份目录里的文件按相对路径拷回（或 `git apply -R context-default-dsh.patch`），再 `node scripts/update.cjs`。
