// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/model-defaults.mts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/model-defaults.mts
init_define_OPENCODE_BUILD_INFO();

// OpenCode context-default-dsh: 上下文窗口默认值与 dsh（DeepSeek Harness）一致。
// dsh 证据（E:\Dsh\resources\app.asar 内）：
//   @deepseek-ai/dsh-llm-pi-ai/lib/index.js:959 DEFAULT_CONTEXT_WINDOW = 262144（配置与内置目录都没给出时的回退），:693 取值顺序 entry.contextWindow ?? 目录 ?? defaultContextWindow
//   @deepseek-ai/dsh-llm-deepseek/lib/index.js:17 OFFICIAL_CONTEXT_WINDOW = 1048576（deepseek-flash / deepseek-v4-pro），:38/:451 官方端点未知模型回退 1e6，:525 取值顺序
//   内置目录 = @earendil-works/pi-ai/dist/providers/data/<provider>.json（按 provider + 模型 id 精确匹配，pi-ai catalogModels :387）
// 取值顺序（OpenCode）：用户按模型填写 > 从报错学到的窗口（只会更小）> /models 发现值 > 下面的 dsh 目录 > 回退值。
var DSH_FALLBACK_CONTEXT_WINDOW = 262144;
var DSH_DEEPSEEK_OFFICIAL_CONTEXT_WINDOW = 1048576;
var DSH_DEEPSEEK_FALLBACK_CONTEXT_WINDOW = 1e6;
// 未知/新加的 API 模型：与 dsh pi-ai 适配器一致按 256K（262144）计算（context-fixes step01 曾为 128K）
var DEFAULT_API_CONTEXT_WINDOW = DSH_FALLBACK_CONTEXT_WINDOW;

// OpenCode context-compaction-dsh: 与 dsh pi-ai DEFAULT_MAX_TOKENS 一致（原 384e3）
var DEFAULT_API_MAX_OUTPUT_TOKENS = 32768;

// Codex（ChatGPT 登录）：目录里有的模型用目录值（多数 272000），目录外的模型与 dsh 一样回退 262144
var DEFAULT_CODEX_CONTEXT_WINDOW = DSH_FALLBACK_CONTEXT_WINDOW;

// dsh 内置目录（pi-ai providers/data，按端点主机归并；值 = contextWindow token 数）
var DSH_CONTEXT_CATALOG = {
  // pi-ai providers/data/openai.json
  "api.openai.com": { 8192: ["gpt-4"], 128000: ["gpt-4-turbo", "gpt-4o", "gpt-4o-2024-05-13", "gpt-4o-2024-08-06", "gpt-4o-2024-11-20", "gpt-4o-mini", "gpt-5-chat-latest", "gpt-5.2-chat-latest", "gpt-5.3-chat-latest", "gpt-5.3-codex-spark", "gpt-realtime-2.1"], 200000: ["o1", "o1-pro", "o3", "o3-mini", "o3-pro", "o4-mini"], 272000: ["gpt-6-luna", "gpt-5.4", "gpt-5.5", "gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-6-astra", "gpt-6-sol", "gpt-6.1-sol"], 400000: ["gpt-5", "gpt-5-mini", "gpt-5-nano", "gpt-5-pro", "gpt-5.1", "gpt-5.2", "gpt-5.2-pro", "gpt-5.3-codex", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-daybreak-red-latest"], 1047576: ["gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"], 1050000: ["gpt-5.4-pro", "gpt-5.5-pro", "gpt-daybreak-blue-latest"] },
  // pi-ai providers/data/openai-codex.json
  "chatgpt.com": { 128000: ["gpt-5.3-codex-spark"], 272000: ["gpt-5.5", "gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-6-astra", "gpt-6-luna", "gpt-6-sol", "gpt-6.1-sol"] },
  // pi-ai providers/data/anthropic.json
  "api.anthropic.com": { 200000: ["claude-haiku-4-5", "claude-haiku-4-5-20251001", "claude-opus-4-5", "claude-opus-4-5-20251101"], 1000000: ["claude-fable-5", "claude-fable-5-1", "claude-haiku-5-5", "claude-opus-4-6", "claude-opus-4-7", "claude-opus-4-8", "claude-opus-5", "claude-opus-5-5", "claude-sonnet-4-5", "claude-sonnet-4-5-20250929", "claude-sonnet-4-6", "claude-sonnet-5", "claude-sonnet-5-5"] },
  // pi-ai providers/data/google.json
  "generativelanguage.googleapis.com": { 65536: ["gemini-3.1-flash-lite-image"], 128000: ["gemini-2.5-computer-use-preview-10-2025"], 131072: ["deep-research-max-preview-04-2026", "deep-research-preview-04-2026", "gemini-3.1-flash-live-preview"], 262144: ["gemma-4-26b-a4b-it", "gemma-4-31b-it"], 1048576: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-3.1-flash-lite-preview", "gemini-3.1-pro-preview", "gemini-3.1-pro-preview-customtools", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest"] },
  // pi-ai providers/data/moonshotai.json
  "api.moonshot.ai": { 262144: ["kimi-k2.6", "kimi-k2.7-code", "kimi-k2.7-code-highspeed"], 1048576: ["kimi-k3"] },
  // pi-ai providers/data/moonshotai-cn.json
  "api.moonshot.cn": { 262144: ["kimi-k2.6", "kimi-k2.7-code", "kimi-k2.7-code-highspeed"], 1048576: ["kimi-k3"] },
  // pi-ai providers/data/kimi-coding.json
  "api.kimi.com": { 262144: ["k3-256k", "kimi-for-coding-highspeed"], 1048576: ["k3", "kimi-for-coding"] },
  // pi-ai providers/data/zai.json
  "api.z.ai": { 200000: ["glm-5-turbo"], 204800: ["glm-4.7"], 1000000: ["glm-5.2", "glm-5.2-highspeed", "glm-5.3", "glm-5.3-flash", "glm-5.3-highspeed"] },
  // pi-ai providers/data/zai-coding-cn.json
  "open.bigmodel.cn": { 128000: ["glm-4.6v"], 1000000: ["glm-5.3", "glm-5.3-flash", "glm-5.3-highspeed"] },
  // pi-ai providers/data/qwen-token-plan+qwen-token-plan-individual.json
  "token-plan.ap-southeast-1.maas.aliyuncs.com": { 131072: ["deepseek-v3.2"], 196608: ["MiniMax-M2.5"], 202752: ["glm-5", "glm-5.1"], 262144: ["kimi-k2.5", "kimi-k2.6", "kimi-k2.7-code"], 1000000: ["deepseek-v4-flash", "deepseek-v4-flash-0731", "deepseek-v4-pro", "deepseek-v4-pro-0813", "deepseek-v4.1-flash", "glm-5.2", "glm-5.3", "qwen3.6-flash", "qwen3.6-plus", "qwen3.7-max", "qwen3.7-plus", "qwen3.8-flash", "qwen3.8-max"] },
  // pi-ai providers/data/qwen-token-plan-cn.json
  "token-plan.cn-beijing.maas.aliyuncs.com": { 131072: ["deepseek-v3.2"], 196608: ["MiniMax-M2.5"], 202752: ["glm-5", "glm-5.1"], 262144: ["kimi-k2.5", "kimi-k2.6", "kimi-k2.7-code"], 1000000: ["deepseek-v4-flash", "deepseek-v4-flash-0731", "deepseek-v4-pro", "deepseek-v4-pro-0813", "deepseek-v4.1-flash", "glm-5.2", "glm-5.3", "qwen3.6-flash", "qwen3.6-plus", "qwen3.7-max", "qwen3.7-plus", "qwen3.8-flash", "qwen3.8-max"] },
  // pi-ai providers/data/minimax.json
  "api.minimax.io": { 204800: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"], 1000000: ["MiniMax-M3"] },
  // pi-ai providers/data/minimax-cn.json
  "api.minimaxi.com": { 204800: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"], 1000000: ["MiniMax-M3"] },
  // pi-ai providers/data/xiaomi.json
  "api.xiaomimimo.com": { 1048576: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.5-pro-ultraspeed", "mimo-v2.6-flash", "mimo-v2.6-pro", "mimo-v2.6-pro-ultraspeed"] },
  // pi-ai providers/data/xiaomi-token-plan-cn.json
  "token-plan-cn.xiaomimimo.com": { 1048576: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.6-flash", "mimo-v2.6-pro"] },
  // pi-ai providers/data/xiaomi-token-plan-sgp.json
  "token-plan-sgp.xiaomimimo.com": { 1048576: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.6-flash", "mimo-v2.6-pro"] },
  // pi-ai providers/data/xiaomi-token-plan-ams.json
  "token-plan-ams.xiaomimimo.com": { 1048576: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.6-flash", "mimo-v2.6-pro"] },
  // pi-ai providers/data/xai.json
  "api.x.ai": { 500000: ["grok-4.5", "grok-4.6", "grok-4.7"], 1000000: ["grok-4.3"] },
  // pi-ai providers/data/mistral.json
  "api.mistral.ai": { 8000: ["open-mistral-7b"], 32000: ["open-mixtral-8x7b"], 32768: ["voxtral-small-2507", "voxtral-small-latest"], 64000: ["open-mixtral-8x22b"], 128000: ["devstral-medium-2507", "devstral-small-2505", "devstral-small-2507", "mistral-nemo", "mistral-small-2506", "open-mistral-nemo", "pixtral-12b", "pixtral-large-latest"], 131072: ["ministral-3b-2512", "ministral-3b-latest", "mistral-large-2411", "mistral-medium-2505"], 256000: ["codestral-2508", "codestral-latest", "labs-devstral-small-2512"], 262144: ["devstral-2512", "devstral-latest", "devstral-medium-latest", "labs-leanstral-1-5-1", "magistral-medium-latest", "ministral-14b-2512", "ministral-8b-2512", "ministral-8b-latest", "mistral-large-2512", "mistral-large-latest", "mistral-medium-2508", "mistral-medium-2604", "mistral-medium-3.5", "mistral-medium-latest", "mistral-small-2603", "mistral-small-latest"], 524288: ["mistral-large-4"], 1048576: ["glm-5-2", "zai-glm-5-2", "zai-glm-5-3"] },
  // pi-ai providers/data/groq.json
  "api.groq.com": { 131042: ["qwen/qwen3.8-27b"], 131072: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "openai/gpt-oss-safeguard-20b", "qwen/qwen3.6-27b"] }
};
var DSH_CONTEXT_CATALOG_INDEX = /* @__PURE__ */ (() => {
  const index = {};
  for (const [host, groups] of Object.entries(DSH_CONTEXT_CATALOG)) {
    const models = index[host] = {};
    for (const [window, ids] of Object.entries(groups)) for (const id of ids) models[id] = Number(window);
  }
  index["api.deepseek.com"] = { "deepseek-flash": DSH_DEEPSEEK_OFFICIAL_CONTEXT_WINDOW, "deepseek-v4-pro": DSH_DEEPSEEK_OFFICIAL_CONTEXT_WINDOW };
  return index;
})();
function dshCatalogHost(baseUrl) {
  try {
    return new URL(String(baseUrl || "").trim()).host.toLowerCase();
  } catch {
    return "";
  }
}
// 与 dsh 相同：按端点所属提供商 + 模型 id 精确匹配（区分大小写，不做前缀/模糊匹配）；查不到返回 undefined
function dshCatalogContextWindow(modelId, baseUrl) {
  const models = DSH_CONTEXT_CATALOG_INDEX[dshCatalogHost(baseUrl)];
  const id = String(modelId ?? "");
  return models && Object.prototype.hasOwnProperty.call(models, id) ? models[id] : void 0;
}
// 目录查不到时的回退：官方 DeepSeek 端点 1e6，其他 262144
function dshFallbackContextWindow(baseUrl) {
  return dshCatalogHost(baseUrl) === "api.deepseek.com" ? DSH_DEEPSEEK_FALLBACK_CONTEXT_WINDOW : DSH_FALLBACK_CONTEXT_WINDOW;
}
function dshDefaultContextWindow(modelId, baseUrl) {
  return dshCatalogContextWindow(modelId, baseUrl) ?? dshFallbackContextWindow(baseUrl);
}
// OpenCode context-compaction-dsh PART A: 输出上限默认值与 dsh 一致。
// dsh 证据：dsh-llm-pi-ai/lib/index.js:961 DEFAULT_MAX_TOKENS = 32768，:695 取值顺序 配置 ?? 内置目录 ?? 32768；
//   dsh-llm-deepseek/lib/index.js:40/:450 官方端点 256000，:2645 /models 列出的值取 min(256000, 列出值)。
// 目录 = pi-ai providers/data/<provider>.json 的 maxTokens（按端点主机归并；Codex/chatgpt.com 不在此表，Codex 逻辑不变）。
var DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS = 256e3;
var DSH_OUTPUT_CATALOG = {
  "api.anthropic.com": { 64000: ["claude-haiku-4-5", "claude-haiku-4-5-20251001", "claude-opus-4-5", "claude-opus-4-5-20251101", "claude-sonnet-4-5", "claude-sonnet-4-5-20250929"], 128000: ["claude-fable-5", "claude-fable-5-1", "claude-haiku-5-5", "claude-opus-4-6", "claude-opus-4-7", "claude-opus-4-8", "claude-opus-5", "claude-opus-5-5", "claude-sonnet-4-6", "claude-sonnet-5", "claude-sonnet-5-5"] },
  "api.groq.com": { 16384: ["qwen/qwen3.6-27b", "qwen/qwen3.8-27b"], 32768: ["llama-3.3-70b-versatile"], 65536: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "openai/gpt-oss-safeguard-20b"], 131072: ["llama-3.1-8b-instant"] },
  "api.kimi.com": { 32768: ["kimi-for-coding", "kimi-for-coding-highspeed"], 131072: ["k3", "k3-256k"] },
  "api.minimax.io": { 131072: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"], 512000: ["MiniMax-M3"] },
  "api.minimaxi.com": { 131072: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"], 512000: ["MiniMax-M3"] },
  "api.mistral.ai": { 4096: ["codestral-latest"], 8000: ["open-mistral-7b"], 8192: ["codestral-2508"], 16384: ["magistral-medium-latest", "mistral-large-2411", "mistral-small-2506"], 32000: ["open-mixtral-8x7b", "voxtral-small-2507", "voxtral-small-latest"], 64000: ["open-mixtral-8x22b"], 128000: ["devstral-medium-2507", "devstral-small-2505", "devstral-small-2507", "labs-leanstral-1-5-1", "ministral-3b-latest", "ministral-8b-latest", "mistral-nemo", "open-mistral-nemo", "pixtral-12b", "pixtral-large-latest"], 131072: ["glm-5-2", "mistral-medium-2505", "zai-glm-5-2", "zai-glm-5-3"], 256000: ["labs-devstral-small-2512", "mistral-small-2603", "mistral-small-latest"], 262144: ["devstral-2512", "devstral-latest", "devstral-medium-latest", "ministral-14b-2512", "ministral-3b-2512", "ministral-8b-2512", "mistral-large-2512", "mistral-large-4", "mistral-large-latest", "mistral-medium-2508", "mistral-medium-2604", "mistral-medium-3.5", "mistral-medium-latest"] },
  "api.moonshot.ai": { 262144: ["kimi-k2.6", "kimi-k2.7-code", "kimi-k2.7-code-highspeed"], 1048576: ["kimi-k3"] },
  "api.moonshot.cn": { 262144: ["kimi-k2.6", "kimi-k2.7-code", "kimi-k2.7-code-highspeed"], 1048576: ["kimi-k3"] },
  "api.openai.com": { 4096: ["gpt-4-turbo", "gpt-4o-2024-05-13"], 8192: ["gpt-4"], 16384: ["gpt-4o", "gpt-4o-2024-08-06", "gpt-4o-2024-11-20", "gpt-4o-mini", "gpt-5-chat-latest", "gpt-5.2-chat-latest", "gpt-5.3-chat-latest"], 32000: ["gpt-5.3-codex-spark", "gpt-realtime-2.1"], 32768: ["gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"], 100000: ["o1", "o1-pro", "o3", "o3-mini", "o3-pro", "o4-mini"], 128000: ["gpt-5", "gpt-5-mini", "gpt-5-nano", "gpt-5-pro", "gpt-5.1", "gpt-5.2", "gpt-5.2-pro", "gpt-5.3-codex", "gpt-5.4", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.4-pro", "gpt-5.5", "gpt-5.5-pro", "gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-6-astra", "gpt-6-luna", "gpt-6-sol", "gpt-6.1-sol", "gpt-daybreak-blue-latest", "gpt-daybreak-red-latest"] },
  "api.x.ai": { 30000: ["grok-4.3"], 500000: ["grok-4.5", "grok-4.6", "grok-4.7"] },
  "api.xiaomimimo.com": { 131072: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.5-pro-ultraspeed", "mimo-v2.6-flash", "mimo-v2.6-pro", "mimo-v2.6-pro-ultraspeed"] },
  "api.z.ai": { 131072: ["glm-4.7", "glm-5-turbo", "glm-5.2", "glm-5.2-highspeed", "glm-5.3", "glm-5.3-flash", "glm-5.3-highspeed"] },
  "generativelanguage.googleapis.com": { 4096: ["gemini-3.1-flash-lite-image"], 32768: ["gemma-4-26b-a4b-it", "gemma-4-31b-it"], 64000: ["gemini-2.5-computer-use-preview-10-2025"], 65536: ["deep-research-max-preview-04-2026", "deep-research-preview-04-2026", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-3.1-flash-lite-preview", "gemini-3.1-flash-live-preview", "gemini-3.1-pro-preview", "gemini-3.1-pro-preview-customtools", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest"] },
  "open.bigmodel.cn": { 32768: ["glm-4.6v"], 131072: ["glm-5.3", "glm-5.3-flash", "glm-5.3-highspeed"] },
  "token-plan-ams.xiaomimimo.com": { 131072: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.6-flash", "mimo-v2.6-pro"] },
  "token-plan-cn.xiaomimimo.com": { 131072: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.6-flash", "mimo-v2.6-pro"] },
  "token-plan-sgp.xiaomimimo.com": { 131072: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2.6-flash", "mimo-v2.6-pro"] },
  "token-plan.ap-southeast-1.maas.aliyuncs.com": { 16384: ["glm-5"], 32768: ["MiniMax-M2.5"], 65536: ["deepseek-v3.2", "qwen3.6-flash", "qwen3.6-plus", "qwen3.7-plus"], 98304: ["kimi-k2.5"], 128000: ["glm-5.1"], 131072: ["glm-5.2", "glm-5.3", "qwen3.7-max", "qwen3.8-flash", "qwen3.8-max"], 262144: ["kimi-k2.6", "kimi-k2.7-code"], 384000: ["deepseek-v4-flash", "deepseek-v4-flash-0731", "deepseek-v4-pro", "deepseek-v4-pro-0813", "deepseek-v4.1-flash"] },
  "token-plan.cn-beijing.maas.aliyuncs.com": { 16384: ["glm-5"], 32768: ["MiniMax-M2.5"], 65536: ["deepseek-v3.2", "qwen3.6-flash", "qwen3.6-plus", "qwen3.7-plus"], 98304: ["kimi-k2.5"], 128000: ["glm-5.1"], 131072: ["glm-5.2", "glm-5.3", "qwen3.7-max", "qwen3.8-flash", "qwen3.8-max"], 262144: ["kimi-k2.6", "kimi-k2.7-code"], 384000: ["deepseek-v4-flash", "deepseek-v4-flash-0731", "deepseek-v4-pro", "deepseek-v4-pro-0813", "deepseek-v4.1-flash"] }
};
var DSH_OUTPUT_CATALOG_INDEX = /* @__PURE__ */ (() => {
  const index = {};
  for (const [host, groups] of Object.entries(DSH_OUTPUT_CATALOG)) {
    const models = index[host] = {};
    for (const [limit, ids] of Object.entries(groups)) for (const id of ids) models[id] = Number(limit);
  }
  return index;
})();
// 按端点主机 + 模型 id 精确匹配；查不到返回 undefined
function dshCatalogMaxOutputTokens(modelId, baseUrl) {
  const models = DSH_OUTPUT_CATALOG_INDEX[dshCatalogHost(baseUrl)];
  const id = String(modelId ?? "");
  return models && Object.prototype.hasOwnProperty.call(models, id) ? models[id] : void 0;
}
// 未填写、未发现时的输出上限：官方 DeepSeek 256000；其他 dsh 目录 ?? 32768
function dshDefaultMaxOutputTokens(modelId, baseUrl) {
  if (dshCatalogHost(baseUrl) === "api.deepseek.com") return DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS;
  return dshCatalogMaxOutputTokens(modelId, baseUrl) ?? DEFAULT_API_MAX_OUTPUT_TOKENS;
}
// 提供商编辑器（webview）用的同一份输出目录
var DSH_OUTPUT_CATALOG_JSON = JSON.stringify(DSH_OUTPUT_CATALOG_INDEX);
// 提供商编辑器（webview）用的同一份目录
var DSH_CONTEXT_CATALOG_JSON = JSON.stringify(DSH_CONTEXT_CATALOG_INDEX);
export { DEFAULT_API_CONTEXT_WINDOW, DEFAULT_API_MAX_OUTPUT_TOKENS, DEFAULT_CODEX_CONTEXT_WINDOW, DSH_FALLBACK_CONTEXT_WINDOW, DSH_DEEPSEEK_FALLBACK_CONTEXT_WINDOW, DSH_CONTEXT_CATALOG_JSON, dshCatalogContextWindow, dshFallbackContextWindow, dshDefaultContextWindow, DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS, DSH_OUTPUT_CATALOG_JSON, dshCatalogMaxOutputTokens, dshDefaultMaxOutputTokens };
