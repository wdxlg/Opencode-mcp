// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/model-provider.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { normalizeOpenAIBaseUrl } from "./module-0172.mjs";
import { DEFAULT_REASONING_EFFORTS, REASONING_EFFORTS, THINKING_MODES, codexReasoningEfforts, codexReasoningFallback, genericReasoningPickerValues, resolveGenericReasoningOverride } from "./module-0176.mjs";
import { DEEPSEEK_CONTEXT_WINDOW_TOKENS, DEEPSEEK_DEFAULT_REASONING_EFFORT, DEEPSEEK_MAX_OUTPUT_TOKENS, DEEPSEEK_REASONING_EFFORTS, isOfficialDeepSeekApiBaseUrl, normalizeOfficialDeepSeekApiBaseUrl, resolveDeepSeekThinkingEffort } from "./module-0173.mjs";
import { getOpenCodeModelConfig } from "./module-0161.mjs";
import { DEFAULT_API_CONTEXT_WINDOW, DEFAULT_API_MAX_OUTPUT_TOKENS, DEFAULT_CODEX_CONTEXT_WINDOW, DSH_FALLBACK_CONTEXT_WINDOW, dshDefaultContextWindow, dshCatalogMaxOutputTokens } from "./module-0174.mjs";
import { CODEX_API_BASE_URL, CODEX_BETA_HEADER, CODEX_CLIENT_VERSION, CODEX_ORIGINATOR, CODEX_USER_AGENT, codexAuthManager } from "./module-0162.mjs";
import { MODEL_ID_SEPARATOR, deleteRuntimeModelsForNamespace, encodedModelId, normalizeProviderModelId } from "./module-0175.mjs";


// extensions/opencode/src/model-provider.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto24 = require("node:crypto");

var vscode16 = __toESM(require("vscode"));


// extensions/opencode/src/model-provider.ts
function normalizeChatCompletionsUrl(baseUrl, preserveUnversioned = false) {
  return `${normalizeOpenAIBaseUrl(baseUrl, preserveUnversioned)}/chat/completions`;
}

function normalizeResponsesUrl(baseUrl, preserveUnversioned = false) {
  return `${normalizeOpenAIBaseUrl(baseUrl, preserveUnversioned)}/responses`;
}

function normalizeAnthropicMessagesUrl(baseUrl) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) throw new Error("OpenCode provider Base URL is empty.");
  if (trimmed.endsWith("/messages")) return trimmed;
  if (trimmed.endsWith("/v1")) return `${trimmed}/messages`;
  return `${trimmed}/v1/messages`;
}

function normalizeAnthropicModelsUrl(baseUrl) {
  let normalized = baseUrl.trim().replace(/\/+$/, "");
  if (normalized.endsWith("/v1/messages")) {
    normalized = normalized.slice(0, -"/v1/messages".length).replace(/\/+$/, "");
  } else if (normalized.endsWith("/messages")) {
    normalized = normalized.slice(0, -"/messages".length).replace(/\/+$/, "");
  }
  return normalized.endsWith("/v1") ? `${normalized}/models` : `${normalized}/v1/models`;
}

var ANTHROPIC_API_VERSION = "2023-06-01";

var ANTHROPIC_EFFORT_THINKING_BUDGETS = {
  low: 2048,
  medium: 8192,
  high: 16384,
  xhigh: 24576,
  max: 32768,
  ultra: 32768
};

var DEFAULT_TIMEOUT_MS2 = 12e4;

var DEFAULT_FIRST_TOKEN_TIMEOUT_MS = 9e4;

var DEFAULT_IDLE_TIMEOUT_MS = 6e4;

var DEFAULT_TOTAL_TIMEOUT_MS = 6e5;

// OpenCode context-default-dsh: 与 dsh pi-ai 适配器回退值一致（原 128K）
var DEFAULT_CONTEXT_WINDOW = DSH_FALLBACK_CONTEXT_WINDOW;

var MODEL_DISCOVERY_TIMEOUT_MS = 3e4;

var PROVIDER_FINGERPRINT_SALT_SECRET = "opencode.providerFingerprintSalt";

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function integerValue(value, fallback, min, max) {
  return Number.isInteger(value) ? Math.max(min, Math.min(max, Number(value))) : fallback;
}

function optionalInteger(value, min, max) {
  if (value === void 0 || value === null || value === "") return void 0;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isInteger(numeric) && numeric >= min && numeric <= max ? numeric : void 0;
}

function optionalNumber(value, min, max) {
  if (value === void 0 || value === null || value === "") return void 0;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max ? numeric : void 0;
}

function optionalBoolean(value) {
  return typeof value === "boolean" ? value : void 0;
}

function enumValue(value, allowed) {
  const normalized = stringValue(value);
  return allowed.includes(normalized) ? normalized : void 0;
}

function reasoningEffortValues(value, fallback = REASONING_EFFORTS) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,;]+/) : [];
  const normalized = [...new Set(values.map((item) => typeof item === "string" ? item.trim() : "").filter((item) => REASONING_EFFORTS.includes(item)))];
  return normalized.length ? normalized : [...fallback];
}

function reasoningEffortOptions(value, defaultEffort, fallback = REASONING_EFFORTS) {
  const options = reasoningEffortValues(value, fallback);
  if (defaultEffort && !options.includes(defaultEffort)) {
    options.push(defaultEffort);
  }
  return options;
}

function reasoningEffortLabel(value) {
  switch (value) {
    case "none":
      return "None";
    case "minimal":
      return "Minimal";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "xhigh":
      return "Extra High";
    case "max":
      return "Max";
    case "ultra":
      return "Ultra";
  }
}

function reasoningEffortDescription(value) {
  switch (value) {
    case "none":
      return "No reasoning where supported.";
    case "minimal":
      return "Minimal reasoning for compatible models.";
    case "low":
      return "Low reasoning effort for faster responses.";
    case "medium":
      return "Balanced reasoning effort.";
    case "high":
      return "High reasoning effort.";
    case "xhigh":
      return "Extra-high reasoning effort.";
    case "max":
      return "Maximum reasoning effort for models that support it.";
    case "ultra":
      return "Maximum reasoning with automatic task delegation where supported.";
  }
}

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : void 0;
}

function stringRecordValue(value) {
  const record4 = objectValue(value);
  if (!record4) return void 0;
  const entries = Object.entries(record4).filter((entry) => typeof entry[1] === "string");
  return entries.length ? Object.fromEntries(entries) : void 0;
}

function stringArrayValue(value, maxItems) {
  if (typeof value === "string") return value.trim() ? [value.trim()] : void 0;
  if (!Array.isArray(value)) return void 0;
  const values = value.map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean).slice(0, maxItems);
  return values.length ? values : void 0;
}

function normalizeApiBaseUrl(baseUrl) {
  let normalized = baseUrl.trim().replace(/\/+$/, "");
  if (!normalized) throw new Error("OpenCode provider Base URL is empty.");
  if (normalized.endsWith("/chat/completions")) {
    normalized = normalized.slice(0, -"/chat/completions".length).replace(/\/+$/, "");
  } else if (normalized.endsWith("/responses")) {
    normalized = normalized.slice(0, -"/responses".length).replace(/\/+$/, "");
  } else if (normalized.endsWith("/v1/messages")) {
    normalized = normalized.slice(0, -"/v1/messages".length).replace(/\/+$/, "");
  } else if (normalized.endsWith("/messages")) {
    normalized = normalized.slice(0, -"/messages".length).replace(/\/+$/, "");
  }
  return normalizeOfficialDeepSeekApiBaseUrl(normalized);
}

function normalizeModelsUrl(baseUrl, clientVersion, preserveUnversioned = false) {
  const url2 = new URL(`${clientVersion ? normalizeApiBaseUrl(baseUrl) : normalizeOpenAIBaseUrl(baseUrl, preserveUnversioned)}/models`);
  if (clientVersion) url2.searchParams.set("client_version", clientVersion);
  return url2.toString();
}

function parseManualModelIds(value) {
  const text2 = stringValue(value);
  if (!text2) return [];
  return [...new Set(text2.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean))];
}

function providerFingerprint(config2, salt) {
  return (0, import_node_crypto24.createHmac)("sha256", salt).update(JSON.stringify([
    config2.protocol,
    normalizeApiBaseUrl(config2.baseUrl),
    config2.apiKey ?? ""
  ])).digest("hex").slice(0, 16);
}

// OpenCode context-default-dsh: /models 发现与 dsh 一致（dsh-llm-pi-ai readListing/capacity）：
// 窗口取 context_window / max_context_window / contextWindow / context_length / max_input_tokens / limit.context 中第一个正整数，
// 输出上限取 max_output_tokens / maxOutputTokens / maxTokens / max_tokens / limit.output / top_provider.max_completion_tokens；
// "models" 也可以是以模型 id 为键的对象。
function ocDshCapacity(...candidates) {
  for (const candidate of candidates) if (typeof candidate === "number" && Number.isInteger(candidate) && candidate > 0) return candidate;
  return void 0;
}
function ocDshListingMap(models) {
  return Object.entries(models).filter(([, raw]) => raw !== null && typeof raw === "object" && !Array.isArray(raw)).map(([key, raw]) => ({ ...raw, id: key || raw.id }));
}
function parseDiscoveredModels(payload, codex = false) {
  const source = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.models) ? payload.models : payload?.models && typeof payload.models === "object" ? ocDshListingMap(payload.models) : Array.isArray(payload?.results) ? payload.results : [];
  const models = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of source) {
    if (typeof item === "string") {
      const id2 = item.trim();
      if (id2 && !seen.has(id2)) {
        seen.add(id2);
        models.push({ id: id2, name: id2 });
      }
      continue;
    }
    if (!item || typeof item !== "object") continue;
    if (codex && item.supported_in_api === false) continue;
    if (codex && typeof item.visibility === "string" && item.visibility !== "list") continue;
    if (codex && Array.isArray(item.output_modalities) && !item.output_modalities.includes("text")) continue;
    const id = stringValue(item.slug) || stringValue(item.id) || stringValue(item.name) || stringValue(item.model);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const permittedReasoning = codex ? DEFAULT_REASONING_EFFORTS : REASONING_EFFORTS;
    const supportedReasoning = Array.isArray(item.supported_reasoning_levels) ? [...new Set(item.supported_reasoning_levels.map((level) => typeof level === "string" ? level : level && typeof level === "object" ? stringValue(level.effort) : "").filter((level) => permittedReasoning.includes(level)))] : [];
    const defaultReasoningEffort = enumValue(item.default_reasoning_level, permittedReasoning);
    if (defaultReasoningEffort && !supportedReasoning.includes(defaultReasoningEffort)) supportedReasoning.push(defaultReasoningEffort);
    const inputModalities = Array.isArray(item.input_modalities) ? item.input_modalities.map((modality) => stringValue(modality).toLowerCase()).filter(Boolean) : void 0;
    const serviceTiers = [];
    let serviceTierMetadataPresent = false;
    if (codex && Array.isArray(item.service_tiers)) {
      serviceTierMetadataPresent = true;
      for (const tier of item.service_tiers) {
        if (!tier || typeof tier !== "object") continue;
        const id2 = enumValue(tier.id, ["priority", "fast"]);
        const name = stringValue(tier.name);
        if (!id2 || name && name.toLowerCase() !== "fast") continue;
        serviceTiers.push({
          id: id2,
          name: name || "Fast",
          description: stringValue(tier.description) || void 0
        });
      }
    }
    if (codex && Array.isArray(item.additional_speed_tiers)) {
      serviceTierMetadataPresent = true;
      if (serviceTiers.length === 0 && item.additional_speed_tiers.some((tier) => {
        const value = typeof tier === "string" ? tier : tier && typeof tier === "object" ? tier.id ?? tier.name : void 0;
        return stringValue(value).toLowerCase() === "fast";
      })) {
        serviceTiers.push({ id: "priority", name: "Fast", description: "Faster responses with increased usage." });
      }
    }
    const defaultServiceTier = serviceTiers.length ? enumValue(item.default_service_tier, ["default", ...serviceTiers.map((tier) => tier.id)]) ?? "default" : void 0;
    models.push({
      id,
      name: stringValue(item.display_name) || id,
      description: stringValue(item.description) || void 0,
      contextWindow: optionalInteger(ocDshCapacity(item.context_window, item.max_context_window, item.contextWindow, item.context_length, item.max_input_tokens, item.limit?.context) ?? item.context_window ?? item.max_context_window, 1024, 1e7),
      maxOutputTokens: optionalInteger(ocDshCapacity(item.max_output_tokens, item.maxOutputTokens, item.maxTokens, item.max_tokens, item.limit?.output, item.top_provider?.max_completion_tokens) ?? item.max_output_tokens, 1, 1e6),
      imageInput: inputModalities ? inputModalities.includes("image") : void 0,
      reasoningEfforts: supportedReasoning.length ? supportedReasoning : void 0,
      defaultReasoningEffort,
      serviceTiers: serviceTierMetadataPresent ? serviceTiers : void 0,
      defaultServiceTier
    });
  }
  return models;
}

function isUnsupportedRouteError(error2) {
  const status = error2?.status;
  if (![404, 405, 501].includes(status)) return false;
  const code = String(error2?.code ?? "");
  const message2 = error2 instanceof Error ? error2.message : "";
  return !/(model[_ -]?(?:not[_ -]?found|invalid)|invalid[_ -]?model|authentication|api[_ -]?key|quota|rate[_ -]?limit)/i.test(`${code} ${message2}`);
}

function isTransientStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

// dsh-gap-fixes: provider-aware retry — exhausted quota/billing 429s fail fast, Retry-After is honoured (capped),
// and backoff is exponential with jitter so parallel requests do not retry in lockstep.
var RETRY_AFTER_CAP_MS = 2e4;
function isQuotaExhausted(error2) {
  const text2 = `${String(error2?.code ?? "")} ${error2 instanceof Error ? error2.message : String(error2 ?? "")}`;
  return /insufficient[_ -]?quota|quota[_ -]?exceeded|exceeded your (?:current )?quota|billing|余额不足|额度(?:已)?用(?:完|尽)|欠费/i.test(text2);
}
function retryAfterMsFrom(response) {
  try {
    const raw = response?.headers?.get?.("retry-after-ms") ?? response?.headers?.get?.("retry-after");
    if (!raw) return void 0;
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) return Math.max(0, response.headers.get("retry-after-ms") ? asNumber : asNumber * 1e3);
    const at = Date.parse(raw);
    return Number.isFinite(at) ? Math.max(0, at - Date.now()) : void 0;
  } catch {
    return void 0;
  }
}
async function delayForRetry(attempt, token, error2) {
  if (token.isCancellationRequested) throw new vscode16.CancellationError();
  const backoff = Math.min(8e3, 500 * 2 ** attempt);
  const jittered = Math.round(backoff / 2 + Math.random() * backoff / 2);
  const hinted = typeof error2?.retryAfterMs === "number" ? Math.min(RETRY_AFTER_CAP_MS, error2.retryAfterMs) : 0;
  await new Promise((resolve) => setTimeout(resolve, Math.max(jittered, hinted)));
  if (token.isCancellationRequested) throw new vscode16.CancellationError();
}

async function fetchJsonWithRetries(url2, init, token, timeoutMs, retries, label) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (token.isCancellationRequested) throw new vscode16.CancellationError();
    const controller = new AbortController();
    const cancellation = token.onCancellationRequested(() => controller.abort());
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url2, { ...init, signal: controller.signal });
      const raw = await response.text();
      let payload;
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        throw Object.assign(new Error(`${label} returned non-JSON (${response.status}). Check the API Base URL and protocol in provider settings; the response body was not displayed.`), { status: response.status });
      }
      if (!response.ok) {
        const message2 = payload?.error?.message ?? payload?.message ?? `${label} failed with HTTP ${response.status}`;
        const error2 = Object.assign(new Error(String(message2)), { status: response.status, code: payload?.error?.code ?? payload?.code, retryAfterMs: retryAfterMsFrom(response) });
        if (attempt < retries && isTransientStatus(response.status) && !isQuotaExhausted(error2)) {
          lastError = error2;
        } else {
          throw error2;
        }
      } else {
        return payload;
      }
    } catch (error2) {
      if (token.isCancellationRequested) throw new vscode16.CancellationError();
      const status = error2?.status;
      if (typeof status === "number" && (!isTransientStatus(status) || isQuotaExhausted(error2))) throw error2;
      lastError = error2;
      if (attempt >= retries) throw error2;
    } finally {
      clearTimeout(timeout);
      cancellation.dispose();
    }
    await delayForRetry(attempt, token, lastError);
  }
  throw lastError instanceof Error ? lastError : new Error(`${label} failed.`);
}

// Response cache (on by default).
// Settings: "opencode.responseCache.enabled" (boolean, default false since it only hits byte-identical requests; set true to enable),
//           "opencode.responseCache.ttlSeconds" (number, default 3600),
//           "opencode.responseCache.maxEntries" (number, default 200).
// Env overrides: OPENCODE_RESPONSE_CACHE=1|0, OPENCODE_RESPONSE_CACHE_TTL_SECONDS.
// Key = sha256(url + hashed auth headers + exact JSON body), so model, tools, messages,
// temperature and reasoning settings must all match byte-for-byte. In-memory only:
// cleared when the extension host restarts. Only text answers to non-tool-result turns are cached.
// Streaming paths (Chat Completions, Codex) record the reported text/thinking parts and replay them on a hit.
var responseCache = /* @__PURE__ */ new Map();

function responseCacheSettings() {
  let enabled = false;
  let ttlSeconds = 3600;
  let maxEntries = 200;
  try {
    const section = vscode16.workspace.getConfiguration("opencode.responseCache");
    enabled = section.get("enabled", false) === true;
    ttlSeconds = Number(section.get("ttlSeconds", 3600));
    maxEntries = Number(section.get("maxEntries", 200));
  } catch {
  }
  const envEnabled = process.env.OPENCODE_RESPONSE_CACHE;
  if (envEnabled === "1" || envEnabled === "true") enabled = true;
  if (envEnabled === "0" || envEnabled === "false") enabled = false;
  const envTtl = Number(process.env.OPENCODE_RESPONSE_CACHE_TTL_SECONDS);
  if (Number.isFinite(envTtl) && envTtl > 0) ttlSeconds = envTtl;
  return {
    enabled,
    ttlMs: Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds * 1e3 : 36e5,
    maxEntries: Number.isFinite(maxEntries) && maxEntries >= 1 ? Math.min(Math.floor(maxEntries), 5e3) : 200
  };
}

function responseCacheKey(url2, headers, body) {
  const accountId = headers?.["ChatGPT-Account-ID"];
  const authMaterial = !headers ? "" : accountId ? JSON.stringify(["account", accountId]) : JSON.stringify([headers.authorization ?? "", headers["x-api-key"] ?? ""]);
  const authHash = (0, import_node_crypto24.createHash)("sha256").update(authMaterial).digest("hex");
  return (0, import_node_crypto24.createHash)("sha256").update(url2).update("\n").update(authHash).update("\n").update(body).digest("hex");
}

function cloneCachedPayload(payload) {
  return typeof structuredClone === "function" ? structuredClone(payload) : JSON.parse(JSON.stringify(payload));
}

function responseCacheGet(key) {
  const hit = responseCache.get(key);
  if (!hit) return void 0;
  responseCache.delete(key);
  if (hit.expiresAt <= Date.now()) return void 0;
  responseCache.set(key, hit);
  return hit;
}

function responseCacheSet(key, entry, settings) {
  responseCache.set(key, { ...entry, expiresAt: Date.now() + settings.ttlMs });
  while (responseCache.size > settings.maxEntries) {
    responseCache.delete(responseCache.keys().next().value);
  }
}

function isChatCompletionsRequestCacheable(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  const last = messages[messages.length - 1];
  return last?.role !== "tool" && !(Array.isArray(last?.tool_calls) && last.tool_calls.length);
}

function createRecordingProgress(progress) {
  const parts = [];
  let cacheable = true;
  const TextPart = vscode16.LanguageModelTextPart;
  const ThinkingPart = vscode16.LanguageModelThinkingPart;
  return {
    parts,
    isCacheable: () => cacheable && parts.some((part) => part.kind === "text" && part.value.length > 0),
    progress: {
      // OpenCode p29: 输出被截断时不写入响应缓存
      ocNoCache() {
        cacheable = false;
      },
      report(part) {
        try {
          if (typeof TextPart === "function" && part instanceof TextPart && typeof part.value === "string") {
            parts.push({ kind: "text", value: part.value });
          } else if (typeof ThinkingPart === "function" && part instanceof ThinkingPart) {
            parts.push({ kind: "thinking", value: cloneCachedPayload(part.value), id: part.id, metadata: part.metadata === void 0 ? void 0 : cloneCachedPayload(part.metadata) });
          } else {
            cacheable = false;
          }
        } catch {
          cacheable = false;
        }
        progress.report(part);
      }
    }
  };
}

function replayCachedParts(parts, progress) {
  for (const part of parts) {
    if (part.kind === "text") {
      progress.report(new vscode16.LanguageModelTextPart(part.value));
    } else if (part.kind === "thinking" && typeof vscode16.LanguageModelThinkingPart === "function") {
      progress.report(new vscode16.LanguageModelThinkingPart(cloneCachedPayload(part.value), part.id, part.metadata === void 0 ? void 0 : cloneCachedPayload(part.metadata)));
    }
  }
}

async function runStreamWithResponseCache(cacheInput, progress, token, run) {
  const settings = responseCacheSettings();
  if (!settings.enabled || !cacheInput?.requestCacheable || typeof cacheInput.body !== "string") {
    return run(progress);
  }
  const key = `stream:${responseCacheKey(cacheInput.url, cacheInput.headers, cacheInput.body)}`;
  const hit = responseCacheGet(key);
  if (hit && Array.isArray(hit.parts)) {
    if (token?.isCancellationRequested) throw new vscode16.CancellationError();
    replayCachedParts(hit.parts, progress);
    return;
  }
  const recorder = createRecordingProgress(progress);
  await run(recorder.progress);
  try {
    if (!token?.isCancellationRequested && recorder.isCacheable()) {
      responseCacheSet(key, { parts: recorder.parts }, settings);
    }
  } catch {
  }
}

function isResponsesRequestCacheable(input) {
  if (!Array.isArray(input) || input.length === 0) return false;
  const last = input[input.length - 1];
  return last?.type !== "function_call_output" && last?.type !== "function_call";
}

function isResponsesPayloadCacheable(payload) {
  if (!payload || payload.status === "failed" || payload.status === "incomplete" || payload.error) return false;
  const output = Array.isArray(payload.output) ? payload.output : [];
  if (output.some((item) => item?.type === "function_call")) return false;
  return output.some((item) => item?.type === "message") || typeof payload.output_text === "string" && payload.output_text.length > 0;
}

function isAnthropicRequestCacheable(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  const last = messages[messages.length - 1];
  const content = Array.isArray(last?.content) ? last.content : [];
  return !content.some((block) => block?.type === "tool_result");
}

function isAnthropicPayloadCacheable(payload) {
  if (!payload || payload.type === "error" || payload.error) return false;
  if (payload.stop_reason === "max_tokens") return false;
  const content = Array.isArray(payload.content) ? payload.content : [];
  if (content.some((block) => block?.type === "tool_use")) return false;
  return content.some((block) => block?.type === "text" && typeof block.text === "string" && block.text.length > 0);
}

async function fetchJsonWithResponseCache(url2, init, token, timeoutMs, retries, label, cacheOptions) {
  const settings = responseCacheSettings();
  const body = typeof init?.body === "string" ? init.body : void 0;
  if (!settings.enabled || !cacheOptions?.requestCacheable || body === void 0) {
    return fetchJsonWithRetries(url2, init, token, timeoutMs, retries, label);
  }
  const key = responseCacheKey(url2, init.headers, body);
  const hit = responseCacheGet(key);
  if (hit && hit.payload !== void 0) return cloneCachedPayload(hit.payload);
  const payload = await fetchJsonWithRetries(url2, init, token, timeoutMs, retries, label);
  try {
    if (cacheOptions.isPayloadCacheable(payload)) {
      responseCacheSet(key, { payload: cloneCachedPayload(payload) }, settings);
    }
  } catch {
  }
  return payload;
}

async function fetchStreamWithRetries(url2, init, token, timeoutMs, retries, label) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (token.isCancellationRequested) throw new vscode16.CancellationError();
    const controller = new AbortController();
    const cancellation = token.onCancellationRequested(() => controller.abort());
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url2, { ...init, signal: controller.signal });
      if (response.ok) return response;
      const raw = await response.text();
      let payload;
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = void 0;
      }
      const message2 = payload?.error?.message ?? payload?.message ?? `${label} failed with HTTP ${response.status}`;
      const error2 = Object.assign(new Error(String(message2)), { status: response.status, code: payload?.error?.code ?? payload?.code, retryAfterMs: retryAfterMsFrom(response) });
      if (!isTransientStatus(response.status) || isQuotaExhausted(error2) || attempt >= retries) throw error2;
      lastError = error2;
    } catch (error2) {
      if (token.isCancellationRequested) throw new vscode16.CancellationError();
      const status = typeof error2 === "object" && error2 !== null && "status" in error2 ? Number(error2.status) : void 0;
      if (status !== void 0 && Number.isFinite(status) && (!isTransientStatus(status) || isQuotaExhausted(error2))) throw error2;
      lastError = error2;
      if (attempt >= retries) throw error2;
    } finally {
      clearTimeout(timeout);
      cancellation.dispose();
    }
    await delayForRetry(attempt, token, lastError);
  }
  throw lastError instanceof Error ? lastError : new Error(`${label} failed.`);
}

// OpenCode: 很多模型（DeepSeek-R1、QwQ、MiniMax、GLM 等经部分端点）把思考写在正文的 <think>…</think> 里，
// 这里把它拆成思考块显示（流式分片时标签可能被切开，残缺前缀先暂存）。
function ocCreateThinkSplitter(progress) {
  const OPEN = "<think>", CLOSE = "</think>";
  let inThink = false;
  let pending = "";
  const emit = (text, thinking) => {
    if (!text) return;
    progress.report(thinking ? new vscode16.LanguageModelThinkingPart(text) : new vscode16.LanguageModelTextPart(text));
  };
  const partialTail = (s, tag) => {
    for (let n = Math.min(tag.length - 1, s.length); n > 0; n--) if (tag.startsWith(s.slice(s.length - n))) return n;
    return 0;
  };
  return {
    push(text) {
      let s = pending + text;
      pending = "";
      while (s) {
        const tag = inThink ? CLOSE : OPEN;
        const idx = s.indexOf(tag);
        if (idx >= 0) {
          emit(s.slice(0, idx), inThink);
          s = s.slice(idx + tag.length);
          if (!inThink) s = s.replace(/^\r?\n/, "");
          inThink = !inThink;
          continue;
        }
        const keep = partialTail(s, tag);
        emit(s.slice(0, s.length - keep), inThink);
        pending = s.slice(s.length - keep);
        break;
      }
    },
    flush() {
      emit(pending, inThink);
      pending = "";
    }
  };
}
// OpenCode p29: 输出达到长度上限（finish_reason=length / stop_reason=max_tokens / incomplete: max_output_tokens）的标记，沿 __ocOuter 传到最外层的续写包装
var OC_TRUNCATION_NOTICE = "\uff08\u8f93\u51fa\u8fbe\u5230\u957f\u5ea6\u4e0a\u9650\uff0c\u5df2\u622a\u65ad\uff09";
function ocMarkTruncated(progress, reason) {
  for (let p = progress, i = 0; p && typeof p === "object" && i < 8; p = p.__ocOuter, i += 1) p.__ocTruncated = reason || "length";
}
function emitChatCompletionMessage(message2, progress) {
  if (!message2) return;
  const reasoningText = typeof message2.reasoning_content === "string" ? message2.reasoning_content : typeof message2.reasoning === "string" ? message2.reasoning : void 0;
  if (reasoningText) progress.report(new vscode16.LanguageModelThinkingPart(reasoningText));
  if (typeof message2.content === "string" && message2.content) {
    const ocThink = ocCreateThinkSplitter(progress);
    ocThink.push(message2.content);
    ocThink.flush();
  }
  for (const call of Array.isArray(message2.tool_calls) ? message2.tool_calls : []) {
    const name = call?.function?.name;
    if (!name) continue;
    let input = {};
    try {
      input = JSON.parse(call?.function?.arguments ?? "{}");
    } catch {
      input = {};
    }
    progress.report(new vscode16.LanguageModelToolCallPart(call.id ?? `tool-${Date.now()}`, name, input));
  }
}

async function emitChatCompletionStream(response, progress, token) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("text/event-stream")) {
    const raw = await response.text();
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`Chat Completions endpoint returned non-JSON (${response.status}). Check the API Base URL and protocol in provider settings; the response body was not displayed.`);
    }
    if (payload?.error) throw new Error(String(payload.error?.message ?? payload.error));
    emitChatCompletionMessage(payload?.choices?.[0]?.message, progress);
    // OpenCode p29: 返回截断原因
    return payload?.choices?.[0]?.finish_reason === "length" ? "length" : void 0;
  }
  if (!response.body) throw new Error("Chat Completions endpoint returned an empty stream.");
  const reader = response.body.getReader();
  const cancellation = token.onCancellationRequested(() => {
    void reader.cancel();
  });
  const decoder = new TextDecoder();
  let buffer = "";
  const toolCalls = /* @__PURE__ */ new Map();
  const ocThink = ocCreateThinkSplitter(progress);
  let ocFinishReason; // OpenCode p29: 记录 finish_reason
  const processEvent = (event) => {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n").trim();
    if (!data) return false;
    if (data === "[DONE]") { ocThink.flush(); return true; }
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error(`Chat Completions stream returned invalid JSON: ${data.slice(0, 1e3)}`);
    }
    if (payload?.error) throw new Error(String(payload.error?.message ?? payload.error));
    for (const choice of Array.isArray(payload?.choices) ? payload.choices : []) {
      const delta = choice?.delta ?? choice?.message;
      if (!delta) continue;
      const reasoningText = typeof delta.reasoning_content === "string" ? delta.reasoning_content : typeof delta.reasoning === "string" ? delta.reasoning : void 0;
      if (reasoningText) progress.report(new vscode16.LanguageModelThinkingPart(reasoningText));
      if (typeof delta.content === "string" && delta.content) {
        ocThink.push(delta.content);
      }
      if (choice?.finish_reason) {
        ocThink.flush();
        ocFinishReason = choice.finish_reason;
      }
      for (const [fallbackIndex, call] of (Array.isArray(delta.tool_calls) ? delta.tool_calls : []).entries()) {
        const index = Number.isInteger(call?.index) ? call.index : fallbackIndex;
        const current = toolCalls.get(index) ?? { arguments: "" };
        if (typeof call?.id === "string" && call.id) current.id = call.id;
        if (typeof call?.function?.name === "string" && call.function.name) current.name = call.function.name;
        if (typeof call?.function?.arguments === "string") current.arguments += call.function.arguments;
        toolCalls.set(index, current);
      }
    }
    return false;
  };
  try {
    let done = false;
    while (!done) {
      if (token.isCancellationRequested) {
        await reader.cancel();
        throw new vscode16.CancellationError();
      }
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) {
        if (processEvent(event)) {
          done = true;
          break;
        }
      }
    }
    if (token.isCancellationRequested) throw new vscode16.CancellationError();
    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer);
  } finally {
    cancellation.dispose();
    reader.releaseLock();
  }
  for (const [index, call] of [...toolCalls.entries()].sort((a, b) => a[0] - b[0])) {
    if (!call.name) continue;
    let input = {};
    try {
      input = JSON.parse(call.arguments || "{}");
    } catch {
      input = {};
    }
    progress.report(new vscode16.LanguageModelToolCallPart(call.id ?? `tool-${Date.now()}-${index}`, call.name, input));
  }
  return ocFinishReason === "length" ? "length" : void 0; // OpenCode p29
}

function textFromPart(part) {
  if (!part) return void 0;
  if (typeof part === "string") return part;
  if (typeof part.value === "string") return part.value;
  if (part.value && typeof part.value.value === "string") return part.value.value;
  return void 0;
}

function thinkingTextFromPart(part) {
  if (!(part instanceof vscode16.LanguageModelThinkingPart)) return void 0;
  if (typeof part.value === "string") return part.value;
  return Array.isArray(part.value) ? part.value.filter((value) => typeof value === "string").join("") : void 0;
}

function estimatedTokens(value) {
  const text2 = typeof value === "string" ? value : JSON.stringify(value ?? "");
  let estimate = 0;
  for (const character of text2) estimate += (character.codePointAt(0) ?? 0) <= 127 ? 0.25 : 1;
  return Math.max(1, Math.ceil(estimate));
}

function imageFromPart(part) {
  if (!part || typeof part.mimeType !== "string" || !part.mimeType.startsWith("image/") || !part.data) return void 0;
  const bytes = part.data instanceof Uint8Array ? part.data : new Uint8Array(part.data);
  if (bytes.byteLength === 0) return void 0;
  return {
    type: "image_url",
    image_url: { url: `data:${part.mimeType};base64,${Buffer.from(bytes).toString("base64")}` }
  };
}

function responsesImageFromPart(part) {
  const image = imageFromPart(part);
  return image ? { type: "input_image", image_url: image.image_url.url } : void 0;
}

function toOpenAIMessages(messages2, options) {
  const result = [];
  for (const message2 of messages2) {
    const isAssistant = message2.role === vscode16.LanguageModelChatMessageRole.Assistant;
    const texts = [];
    const userContent = [];
    const toolCalls = [];
    const toolResults = [];
    const reasoningTexts = [];
    for (const part of message2.content ?? []) {
      if (part instanceof vscode16.LanguageModelToolCallPart || part && typeof part.callId === "string" && typeof part.name === "string" && part.input !== void 0) {
        toolCalls.push({
          id: part.callId,
          type: "function",
          function: { name: part.name, arguments: JSON.stringify(part.input ?? {}) }
        });
        continue;
      }
      if (part instanceof vscode16.LanguageModelToolResultPart || part && typeof part.callId === "string" && Array.isArray(part.content)) {
        const content = (part.content ?? []).map((value) => textFromPart(value) ?? JSON.stringify(value)).join("\n");
        toolResults.push({ role: "tool", tool_call_id: part.callId, content });
        continue;
      }
      const thinkingText = thinkingTextFromPart(part);
      if (thinkingText !== void 0 && isAssistant) {
        if (options.preserveReasoningContent) reasoningTexts.push(thinkingText);
        else if (thinkingText) texts.push(thinkingText);
        continue;
      }
      const image = imageFromPart(part);
      if (image) {
        userContent.push(image);
        continue;
      }
      const text2 = textFromPart(part);
      if (text2) {
        texts.push(text2);
        userContent.push({ type: "text", text: text2 });
      }
    }
    if (isAssistant) {
      result.push({
        role: "assistant",
        content: texts.join("\n") || (options.preserveReasoningContent && toolCalls.length ? "" : null),
        ...options.preserveReasoningContent && (reasoningTexts.length || toolCalls.length) ? { reasoning_content: reasoningTexts.join("") } : {},
        ...toolCalls.length ? { tool_calls: toolCalls } : {}
      });
    } else {
      if (userContent.length) {
        const hasImage = userContent.some((part) => part.type === "image_url");
        result.push({ role: "user", content: hasImage ? userContent : texts.join("\n") });
      }
      result.push(...toolResults);
    }
  }
  return result;
}

function anthropicSourceFromImageUrl(url2) {
  const trimmed = url2.trim();
  const dataUrl = /^data:([^;,]+);base64,(.*)$/s.exec(trimmed);
  if (dataUrl) return { type: "base64", media_type: dataUrl[1], data: dataUrl[2] };
  if (/^https?:\/\//i.test(trimmed)) return { type: "url", url: trimmed };
  return void 0;
}

function toAnthropicChatMessages(messages2) {
  const output2 = [];
  const pushUserBlocks = (blocks) => {
    if (!blocks.length) return;
    const previous = output2[output2.length - 1];
    if (previous && previous.role === "user") {
      previous.content = [...previous.content, ...blocks];
      return;
    }
    output2.push({ role: "user", content: blocks });
  };
  for (const message2 of messages2) {
    const isAssistant = message2.role === vscode16.LanguageModelChatMessageRole.Assistant;
    const blocks = [];
    const toolResults = [];
    for (const part of message2.content ?? []) {
      if (part instanceof vscode16.LanguageModelToolCallPart || part && typeof part.callId === "string" && typeof part.name === "string" && part.input !== void 0) {
        blocks.push({ type: "tool_use", id: part.callId, name: part.name, input: part.input ?? {} });
        continue;
      }
      if (part instanceof vscode16.LanguageModelToolResultPart || part && typeof part.callId === "string" && Array.isArray(part.content)) {
        const content = (part.content ?? []).map((value) => textFromPart(value) ?? JSON.stringify(value)).join("\n");
        toolResults.push({ type: "tool_result", tool_use_id: part.callId, content });
        continue;
      }
      const image = imageFromPart(part);
      if (image) {
        const source = anthropicSourceFromImageUrl(image.image_url?.url ?? "");
        if (source) blocks.push({ type: "image", source });
        continue;
      }
      const text2 = textFromPart(part);
      if (text2) blocks.push({ type: "text", text: text2 });
    }
    if (isAssistant) {
      if (blocks.length) output2.push({ role: "assistant", content: blocks });
      continue;
    }
    if (toolResults.length) {
      pushUserBlocks(toolResults);
      pushUserBlocks(blocks);
      continue;
    }
    pushUserBlocks(blocks);
  }
  return { messages: output2 };
}

function toResponsesInput(messages2) {
  const result = [];
  for (const message2 of messages2) {
    const isAssistant = message2.role === vscode16.LanguageModelChatMessageRole.Assistant;
    const content = [];
    const toolCalls = [];
    const toolResults = [];
    for (const part of message2.content ?? []) {
      if (part instanceof vscode16.LanguageModelToolCallPart || part && typeof part.callId === "string" && typeof part.name === "string" && part.input !== void 0) {
        toolCalls.push({
          type: "function_call",
          call_id: part.callId,
          name: part.name,
          arguments: JSON.stringify(part.input ?? {})
        });
        continue;
      }
      if (part instanceof vscode16.LanguageModelToolResultPart || part && typeof part.callId === "string" && Array.isArray(part.content)) {
        const output2 = (part.content ?? []).map((value) => textFromPart(value) ?? JSON.stringify(value)).join("\n");
        toolResults.push({ type: "function_call_output", call_id: part.callId, output: output2 });
        continue;
      }
      const image = responsesImageFromPart(part);
      if (image) {
        if (!isAssistant) content.push(image);
        continue;
      }
      const text2 = textFromPart(part);
      if (text2) content.push({ type: isAssistant ? "output_text" : "input_text", text: text2 });
    }
    if (content.length) {
      result.push({ role: isAssistant ? "assistant" : "user", content });
    }
    result.push(...toolCalls, ...toolResults);
  }
  return result;
}

function toCodexResponsesInput(messages2) {
  return toResponsesInput(messages2).map((message2) => {
    if (message2.type === "function_call" || message2.type === "function_call_output") return message2;
    const content = typeof message2.content === "string" ? [{ type: message2.role === "assistant" ? "output_text" : "input_text", text: message2.content }] : Array.isArray(message2.content) ? message2.content : [];
    return { type: "message", role: message2.role, content };
  });
}

function codexReasoningEffort(effort) {
  if (effort === "ultra") throw new Error("Codex does not support Ultra reasoning; choose a supported effort or Account Default.");
  if (!effort || effort === "none") return void 0;
  return effort;
}

function extractResponsesOutputText(response) {
  const texts = [];
  for (const item of Array.isArray(response?.output) ? response.output : []) {
    if (item?.type !== "message") continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === "output_text" && typeof content.text === "string") texts.push(content.text);
      if (content?.type === "refusal" && typeof content.refusal === "string") texts.push(content.refusal);
    }
  }
  return texts.join("");
}

async function emitResponsesStream(response, progress, token) {
  if (!response.body) throw new Error("Codex Responses endpoint returned an empty stream.");
  const reader = response.body.getReader();
  const cancellation = token.onCancellationRequested(() => {
    void reader.cancel();
  });
  const decoder = new TextDecoder();
  let buffer = "";
  let emittedText = false;
  let completed = false;
  let ocTruncated = false; // OpenCode p29
  const callArguments = /* @__PURE__ */ new Map();
  const emittedCalls = /* @__PURE__ */ new Set();
  const emitCall = (key) => {
    const call = callArguments.get(key);
    if (!call || !call.name || emittedCalls.has(key)) return;
    emittedCalls.add(key);
    let input = {};
    try {
      input = JSON.parse(call.arguments || "{}");
    } catch {
      input = {};
    }
    progress.report(new vscode16.LanguageModelToolCallPart(call.callId ?? key, call.name, input));
  };
  const handleEvent = (payload) => {
    const type = typeof payload?.type === "string" ? payload.type : "";
    switch (type) {
      case "response.output_text.delta": {
        if (typeof payload.delta === "string" && payload.delta) {
          emittedText = true;
          progress.report(new vscode16.LanguageModelTextPart(payload.delta));
        }
        break;
      }
      case "response.reasoning_summary_text.delta":
      case "response.reasoning_text.delta": {
        if (typeof payload.delta === "string" && payload.delta) {
          progress.report(new vscode16.LanguageModelThinkingPart(payload.delta));
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const key = typeof payload.item_id === "string" ? payload.item_id : `fc-${payload.output_index ?? 0}`;
        const current = callArguments.get(key) ?? { arguments: "" };
        if (typeof payload.delta === "string") current.arguments += payload.delta;
        callArguments.set(key, current);
        break;
      }
      case "response.output_item.done": {
        const item = payload?.item;
        if (item?.type === "function_call" && typeof item.name === "string") {
          const key = typeof item.id === "string" ? item.id : typeof item.call_id === "string" ? item.call_id : `fc-${callArguments.size}`;
          const current = callArguments.get(key) ?? { arguments: "" };
          current.name = item.name;
          current.callId = typeof item.call_id === "string" ? item.call_id : current.callId;
          if (typeof item.arguments === "string") current.arguments = item.arguments;
          callArguments.set(key, current);
        }
        break;
      }
      case "response.completed": {
        if (payload?.response?.status && payload.response.status !== "completed") {
          throw new Error(`Codex Responses ended with status ${payload.response.status}.`);
        }
        completed = true;
        if (!emittedText) {
          const snapshotText = extractResponsesOutputText(payload?.response ?? payload);
          if (snapshotText) {
            emittedText = true;
            progress.report(new vscode16.LanguageModelTextPart(snapshotText));
          }
        }
        break;
      }
      case "response.failed": {
        throw new Error(String(payload?.response?.error?.message ?? "Codex Responses request failed."));
      }
      case "response.incomplete": {
        const reason = payload?.response?.incomplete_details?.reason;
        // OpenCode p29: 达到输出上限不再报错，保留已输出内容并交给续写
        if (reason === "max_output_tokens" || reason === "max_tokens") {
          completed = true;
          ocTruncated = true;
          if (!emittedText) {
            const snapshotText = extractResponsesOutputText(payload?.response ?? payload);
            if (snapshotText) {
              emittedText = true;
              progress.report(new vscode16.LanguageModelTextPart(snapshotText));
            }
          }
          break;
        }
        throw new Error(`Codex Responses request incomplete${typeof reason === "string" ? `: ${reason}` : "."}`);
      }
      case "error": {
        throw new Error(String(payload?.message ?? payload?.error?.message ?? "Codex Responses stream error."));
      }
    }
  };
  const processEvent = (event) => {
    const data = event.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n").trim();
    if (!data || data === "[DONE]") return;
    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error(`Codex Responses stream returned invalid JSON: ${data.slice(0, 1e3)}`);
    }
    handleEvent(payload);
  };
  try {
    while (true) {
      if (token.isCancellationRequested) {
        await reader.cancel();
        throw new vscode16.CancellationError();
      }
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const event of events) processEvent(event);
    }
    if (token.isCancellationRequested) throw new vscode16.CancellationError();
    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer);
  } finally {
    cancellation.dispose();
    reader.releaseLock();
  }
  if (!completed) throw new Error("Codex Responses stream closed before response.completed.");
  for (const [key, call] of callArguments) emitCall(key);
  return ocTruncated ? "max_output_tokens" : void 0; // OpenCode p29
}

// OpenCode context-compaction-dsh PART A: 输出上限与压缩预留 O 与 dsh 一致（Codex 不走这里）。
// 输出上限：用户填写 > /models 发现（官方 DeepSeek 取 min(256000, 发现值)）> dsh 目录（端点 + 模型 id）> 32768；官方 DeepSeek 未发现时 256000。
// 预留 O：用户填写或发现的值；官方 DeepSeek 默认 256000；其他 0（dsh 通用适配器只在配置了 maxTokens 时报告默认输出）。
function ocDshOutputFields(base, rawModelId, discovered) {
  if (base.maxOutputTokensExplicit === true && base.maxOutputTokens !== void 0) return { maxOutputTokens: base.maxOutputTokens, maxOutputTokensExplicit: true, outputReserveTokens: base.maxOutputTokens };
  if (discovered !== void 0) {
    const value = base.deepSeek ? Math.min(DEEPSEEK_MAX_OUTPUT_TOKENS, discovered) : discovered;
    return { maxOutputTokens: value, maxOutputTokensExplicit: true, outputReserveTokens: value };
  }
  if (base.deepSeek) return { maxOutputTokens: DEEPSEEK_MAX_OUTPUT_TOKENS, maxOutputTokensExplicit: false, outputReserveTokens: DEEPSEEK_MAX_OUTPUT_TOKENS };
  return { maxOutputTokens: dshCatalogMaxOutputTokens(rawModelId, base.baseUrl) ?? DEFAULT_API_MAX_OUTPUT_TOKENS, maxOutputTokensExplicit: false, outputReserveTokens: 0 };
}
// OpenCode context-compaction-dsh PART A: 与 dsh pi-ai 一致，请求的输出上限不超过「窗口 − 输入估算 − 4096」；Codex、官方 DeepSeek（已有自己的预留逻辑）不变。
// 估算偏粗（图片会被高估），所以下限取 min(上限, 4096)，避免把输出压到个位数。
function ocDshOutputCap(config2, maxTokens, payload) {
  if (maxTokens === void 0 || config2.codex || config2.deepSeek || !(config2.contextWindow > 0)) return maxTokens;
  return Math.min(maxTokens, Math.max(Math.min(maxTokens, 4096), config2.contextWindow - estimatedTokens(payload) - 4096));
}

// OpenCode: 提供商窗口里逐个模型的设置。没打开「推理等级」的模型不发送任何推理/思考参数（与 DSH 一致；部分端点收到 reasoning_effort 会返回 400）
function ocApplyManagedModelMeta(config2, meta) {
  const m = meta && typeof meta === "object" ? meta : {};
  const next = { ...config2 };
  if (Number(m.contextWindow) > 0) next.contextWindow = Math.floor(Number(m.contextWindow));
  if (Number(m.maxTokens) > 0) {
    next.maxOutputTokens = Math.floor(Number(m.maxTokens));
    // OpenCode context-compaction-dsh: 提供商窗口里填写/发现的输出上限，压缩时预留
    next.maxOutputTokensExplicit = true;
    next.outputReserveTokens = next.maxOutputTokens;
  }
  if (m.image === false) next.imageInput = false;
  if (next.deepSeek || next.codex) return next;
  if (m.reasoning === true) {
    const efforts = Array.isArray(m.efforts) ? m.efforts.filter((e) => REASONING_EFFORTS.includes(e)) : [];
    if (efforts.length) {
      next.reasoningEfforts = efforts;
      next.exactReasoningEfforts = true;
      next.reasoningEffort = efforts.includes(m.defaultEffort) ? m.defaultEffort : efforts.includes(next.reasoningEffort) ? next.reasoningEffort : efforts[0];
    }
    next.thinking = "enabled";
    return next;
  }
  next.reasoningOff = true;
  next.thinking = "disabled";
  next.reasoningEffort = void 0;
  next.reasoningEfforts = [];
  return next;
}
function modelConfigurationSchema(config2) {
  if (config2.reasoningOff) return { properties: {} };
  const reasoningOptions = config2.deepSeek || config2.codex || config2.exactReasoningEfforts ? [...config2.reasoningEfforts] : [.../* @__PURE__ */ new Set([...DEFAULT_REASONING_EFFORTS, ...config2.reasoningEfforts])];
  if (config2.deepSeek) {
    const defaultEffort = config2.thinking === "disabled" ? "disabled" : config2.reasoningEffort ?? DEEPSEEK_DEFAULT_REASONING_EFFORT;
    return {
      properties: {
        reasoningEffort: {
          type: "string",
          title: "Thinking Effort",
          group: "navigation",
          enum: ["disabled", ...reasoningOptions],
          enumItemLabels: ["Disabled", ...reasoningOptions.map(reasoningEffortLabel)],
          enumDescriptions: ["Disable thinking mode.", ...reasoningOptions.map(reasoningEffortDescription)],
          default: defaultEffort
        }
      }
    };
  }
  if (config2.codex) {
    const properties2 = {
      reasoningEffort: {
        type: "string",
        title: "Thinking Effort",
        group: "navigation",
        enum: ["inherit", ...reasoningOptions],
        enumItemLabels: ["Account Default", ...reasoningOptions.map(reasoningEffortLabel)],
        enumDescriptions: ["Use the default thinking effort for this Codex model.", ...reasoningOptions.map(reasoningEffortDescription)],
        default: "inherit"
      }
    };
    if (config2.serviceTiers?.length) {
      properties2.serviceTier = {
        type: "string",
        title: "Speed",
        group: "speed",
        enum: ["default", ...config2.serviceTiers.map((tier) => tier.id)],
        enumItemLabels: ["Standard", ...config2.serviceTiers.map((tier) => tier.name)],
        enumDescriptions: ["Use standard Codex processing.", ...config2.serviceTiers.map((tier) => tier.description ?? "Use the faster Codex service tier with increased usage.")],
        default: config2.serviceTier ?? "default"
      };
    }
    return {
      properties: properties2
    };
  }
  const genericReasoningValues = genericReasoningPickerValues(reasoningOptions);
  const properties = {
    reasoningEffort: {
      type: "string",
      title: "Thinking Effort",
      group: "navigation",
      enum: genericReasoningValues,
      enumItemLabels: ["Provider Default", "Enabled", "Disabled", ...reasoningOptions.map(reasoningEffortLabel)],
      enumDescriptions: [
        "Use the provider's configured thinking mode and effort.",
        "Enable thinking while keeping the provider's configured effort.",
        "Disable reasoning parameters for this request.",
        ...reasoningOptions.map(reasoningEffortDescription)
      ],
      default: "inherit"
    }
  };
  return { properties };
}

function inheritedEnum(value, allowed, fallback) {
  const normalized = stringValue(value);
  if (!normalized || normalized === "inherit") return fallback;
  return enumValue(normalized, allowed) ?? fallback;
}

function resolveRequestConfig(base, modelConfiguration) {
  if (base.reasoningOff) {
    const resolved = ocResolveRequestConfigInner(base, modelConfiguration);
    return { ...resolved, thinking: "disabled", reasoningEffort: void 0, reasoningEfforts: [] };
  }
  return ocResolveRequestConfigInner(base, modelConfiguration);
}
function ocResolveRequestConfigInner(base, modelConfiguration) {
  const allowedReasoningEfforts = base.codex ? codexReasoningEfforts(base.reasoningEfforts) : base.reasoningEfforts;
  const fallbackEffort = base.codex ? codexReasoningFallback(base.reasoningEffort, allowedReasoningEfforts) : base.reasoningEffort;
  if (!modelConfiguration) return base.codex ? { ...base, reasoningEffort: fallbackEffort, reasoningEfforts: [...allowedReasoningEfforts] } : base;
  const deepSeekSelection = base.deepSeek ? resolveDeepSeekThinkingEffort(modelConfiguration.reasoningEffort) : void 0;
  const genericSelection = !base.deepSeek && !base.codex ? resolveGenericReasoningOverride(modelConfiguration.reasoningEffort, allowedReasoningEfforts, base.reasoningEffort) : void 0;
  let resolvedThinking;
  let reasoningEffort;
  if (deepSeekSelection) {
    resolvedThinking = deepSeekSelection.thinking;
    reasoningEffort = deepSeekSelection.reasoningEffort;
  } else if (genericSelection) {
    resolvedThinking = genericSelection.thinking;
    reasoningEffort = genericSelection.reasoningEffort;
  } else {
    resolvedThinking = inheritedEnum(modelConfiguration.thinking, THINKING_MODES, base.thinking);
    reasoningEffort = inheritedEnum(modelConfiguration.reasoningEffort, allowedReasoningEfforts, fallbackEffort);
  }
  if (!base.deepSeek && resolvedThinking === "enabled" && !reasoningEffort) {
    reasoningEffort = "medium";
  }
  const allowedServiceTiers = base.codex && base.serviceTiers?.length ? ["default", ...base.serviceTiers.map((tier) => tier.id)] : ["auto", "default", "flex", "scale", "priority", "fast"];
  return {
    ...base,
    thinking: resolvedThinking,
    contextWindow: optionalInteger(modelConfiguration.contextSize ?? modelConfiguration.contextWindow, 1024, 1e7) ?? base.contextWindow,
    maxOutputTokens: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) ?? base.maxOutputTokens,
    maxOutputTokensExplicit: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) !== void 0 || base.maxOutputTokensExplicit === true,
    // OpenCode context-compaction-dsh PART A: 按模型填写的输出上限同时作为压缩预留 O
    outputReserveTokens: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) ?? base.outputReserveTokens,
    firstTokenTimeoutMs: optionalInteger(modelConfiguration.firstTokenTimeoutMs, 1e3, 18e5) ?? base.firstTokenTimeoutMs,
    idleTimeoutMs: optionalInteger(modelConfiguration.idleTimeoutMs, 1e3, 18e5) ?? base.idleTimeoutMs,
    totalTimeoutMs: optionalInteger(modelConfiguration.totalTimeoutMs, 1e3, 18e5) ?? base.totalTimeoutMs,
    reasoningEffort,
    reasoningEfforts: base.codex ? [...allowedReasoningEfforts] : reasoningEffortOptions(modelConfiguration.reasoningEfforts, reasoningEffort, allowedReasoningEfforts),
    reasoningSummary: inheritedEnum(modelConfiguration.reasoningSummary, ["auto", "concise", "detailed"], base.reasoningSummary),
    reasoningContext: inheritedEnum(modelConfiguration.reasoningContext, ["auto", "current_turn", "all_turns"], base.reasoningContext),
    reasoningMode: inheritedEnum(modelConfiguration.reasoningMode, ["standard", "pro"], base.reasoningMode),
    verbosity: inheritedEnum(modelConfiguration.verbosity, ["low", "medium", "high"], base.verbosity),
    temperature: optionalNumber(modelConfiguration.temperature, 0, 2) ?? base.temperature,
    topP: optionalNumber(modelConfiguration.topP, 0, 1) ?? base.topP,
    parallelToolCalls: optionalBoolean(modelConfiguration.parallelToolCalls) ?? base.parallelToolCalls,
    maxToolCalls: optionalInteger(modelConfiguration.maxToolCalls, 1, 128) ?? base.maxToolCalls,
    serviceTier: inheritedEnum(modelConfiguration.serviceTier, allowedServiceTiers, base.serviceTier),
    store: optionalBoolean(modelConfiguration.store) ?? base.store,
    truncation: inheritedEnum(modelConfiguration.truncation, ["auto", "disabled"], base.truncation),
    promptCacheKey: stringValue(modelConfiguration.promptCacheKey) || base.promptCacheKey,
    promptCacheMode: inheritedEnum(modelConfiguration.promptCacheMode, ["implicit", "explicit"], base.promptCacheMode),
    promptCacheTtl: inheritedEnum(modelConfiguration.promptCacheTtl, ["30m"], base.promptCacheTtl),
    promptCacheRetention: inheritedEnum(modelConfiguration.promptCacheRetention, ["in_memory", "24h"], base.promptCacheRetention),
    safetyIdentifier: stringValue(modelConfiguration.safetyIdentifier) || base.safetyIdentifier,
    seed: optionalInteger(modelConfiguration.seed, -2147483648, 2147483647) ?? base.seed,
    presencePenalty: optionalNumber(modelConfiguration.presencePenalty, -2, 2) ?? base.presencePenalty,
    frequencyPenalty: optionalNumber(modelConfiguration.frequencyPenalty, -2, 2) ?? base.frequencyPenalty,
    stop: stringArrayValue(modelConfiguration.stop, 4) ?? base.stop,
    responseFormat: objectValue(modelConfiguration.responseFormat) ?? base.responseFormat,
    requestMetadata: stringRecordValue(modelConfiguration.requestMetadata) ?? base.requestMetadata,
    extraBody: { ...base.extraBody ?? {}, ...objectValue(modelConfiguration.extraBody) ?? {} }
  };
}

var PROTECTED_REQUEST_KEYS = /* @__PURE__ */ new Set(["model", "messages", "input", "instructions", "tools", "tool_choice", "stream", "background", "service_tier"]);

function safeExtraBody(value) {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).filter(([key]) => !PROTECTED_REQUEST_KEYS.has(key)));
}

// OpenCode: 模型分组——分组在模型选择器里是一个独立模型；对话时按排名选第一个可用的成员，失败的成员冷却一段时间后再用
var OC_MODEL_GROUPS_KEY = "opencode.modelGroups.v1";
var OC_GROUP_FAIL_COOLDOWN_MS = 5 * 60 * 1e3;
function ocGroupHealth() {
  return globalThis.__opencodeModelGroupHealth ??= /* @__PURE__ */ new Map();
}
function ocGroupMemberKey(providerId, model) {
  return `${providerId}|${model}`;
}
function ocLoadModelGroups(context) {
  const list = context?.globalState?.get(OC_MODEL_GROUPS_KEY, []);
  return (Array.isArray(list) ? list : []).filter((g) => g && typeof g.id === "string" && Array.isArray(g.members));
}
function ocModelGroupDisplayName(group) {
  return String(group.alias || group.name || "模型分组").trim();
}
// OpenCode: 分组成员的思考强度——成员保存了 effort 就用它；否则看模型名去掉组名关键词后的结尾（gpt-6-astra-low → low）
var OC_GROUP_EFFORT_ALIASES = [["xhigh", ["xhigh", "extrahigh"]], ["minimal", ["minimal"]], ["medium", ["medium", "med", "mid"]], ["ultra", ["ultra"]], ["high", ["high"]], ["low", ["low"]], ["max", ["max"]], ["none", ["none", "nothink", "nothinking"]]];
var OC_GROUP_EFFORT_ORDER = ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];
var OC_GROUP_EFFORT_ANY = "any";
function ocGroupNormName(value) {
  let s = String(value || "").toLowerCase().trim();
  for (const [a, b] of [["[", "]"], ["(", ")"], ["【", "】"], ["（", "）"]]) {
    for (let i = s.indexOf(a); i >= 0; i = s.indexOf(a)) {
      const j = s.indexOf(b, i + 1);
      if (j < 0) break;
      s = s.slice(0, i) + s.slice(j + 1);
    }
  }
  s = s.slice(s.lastIndexOf("/") + 1);
  for (const c of [":", "@"]) {
    const k = s.indexOf(c);
    if (k > 0) s = s.slice(0, k);
  }
  s = s.replace(/[ _.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  s = s.replace(/-latest$/, "").replace(/-?20[0-9]{2}-?[01][0-9]-?[0-3][0-9]$/, "");
  return s.replace(/[^a-z0-9]+/g, "");
}
function ocGroupMemberEffort(group, member) {
  if (OC_GROUP_EFFORT_ORDER.includes(member?.effort)) return member.effort;
  const key = ocGroupNormName(ocModelGroupDisplayName(group));
  const name = ocGroupNormName(member?.model);
  const at = key ? name.indexOf(key) : -1;
  if (at < 0) return "";
  const rest = name.slice(0, at) + name.slice(at + key.length);
  if (!rest) return "";
  for (const [effort, aliases] of OC_GROUP_EFFORT_ALIASES) for (const alias of aliases) if (rest.endsWith(alias)) return effort;
  return "";
}
function ocGroupEfforts(group, members = group.members) {
  const found = new Set(members.map((m) => ocGroupMemberEffort(group, m)).filter(Boolean));
  return OC_GROUP_EFFORT_ORDER.filter((e) => found.has(e));
}
// 分组里有按名字区分强度的成员时，思考强度只列出这些强度，外加「无」（不按强度挑选，按排名用第一个可用的）
function ocGroupConfigurationSchema(group, members, first) {
  const efforts = ocGroupEfforts(group, members);
  if (!efforts.length) return modelConfigurationSchema(first);
  return {
    properties: {
      reasoningEffort: {
        type: "string",
        title: "Thinking Effort",
        group: "navigation",
        enum: [OC_GROUP_EFFORT_ANY, ...efforts],
        enumItemLabels: ["无", ...efforts.map(reasoningEffortLabel)],
        enumDescriptions: ["不按强度挑选：按排名使用分组里第一个可用的模型。", ...efforts.map((e) => `使用分组里名字对应「${reasoningEffortLabel(e)}」的模型。`)],
        default: OC_GROUP_EFFORT_ANY
      }
    }
  };
}
// 供原生对话与其他入口共用：记录成员失败 / 成功
globalThis.__opencodeModelGroupMark ??= {
  failed(key, reason) {
    if (!key) return;
    const prev = ocGroupHealth().get(key);
    const failures = (prev?.failures ?? 0) + 1;
    ocGroupHealth().set(key, { until: Date.now() + Math.min(OC_GROUP_FAIL_COOLDOWN_MS * failures, 30 * 60 * 1e3), failures, reason: String(reason ?? "").slice(0, 200), at: Date.now() });
  },
  succeeded(key) {
    if (key) ocGroupHealth().delete(key);
  }
};

var OpenCodeLanguageModelProvider = class {
  constructor(context, providerMode = "api") {
    this.context = context;
    this.providerMode = providerMode;
  }
  context;
  providerMode;
  changeEmitter = new vscode16.EventEmitter();
  runtimeModels = /* @__PURE__ */ new Map();
  /**
   * Last successful model discovery per provider fingerprint. A failed or empty
   * re-discovery falls back to this list so a transient network/auth failure can
   * never wipe the model picker (VS Code clears the vendor's cached models when
   * the provider rejects or returns nothing).
   */
  discoveredModelCache = /* @__PURE__ */ new Map();
  /** Unsupported Responses routes are cached per provider fingerprint and model for five minutes. */
  unsupportedResponsesRoutes = /* @__PURE__ */ new Map();
  onDidChangeLanguageModelChatInformation = this.changeEmitter.event;
  refresh() {
    this.changeEmitter.fire();
  }
  async getProviderFingerprintSalt() {
    const existing = await this.context.secrets.get(PROVIDER_FINGERPRINT_SALT_SECRET);
    if (existing?.trim()) return existing;
    const generated = (0, import_node_crypto24.randomBytes)(32).toString("hex");
    await this.context.secrets.store(PROVIDER_FINGERPRINT_SALT_SECRET, generated);
    return generated;
  }
  async legacyRuntimeModel(modelOverride) {
    const legacy = await getOpenCodeModelConfig(this.context);
    const baseUrl = normalizeApiBaseUrl(legacy.baseUrl);
    const deepSeek = isOfficialDeepSeekApiBaseUrl(baseUrl);
    return {
      protocol: "openai-chat-completions",
      baseUrl,
      apiKey: legacy.apiKey,
      model: modelOverride || legacy.model,
      timeoutMs: DEFAULT_TIMEOUT_MS2,
      firstTokenTimeoutMs: DEFAULT_FIRST_TOKEN_TIMEOUT_MS,
      idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
      totalTimeoutMs: DEFAULT_TOTAL_TIMEOUT_MS,
      retries: 0,
      // OpenCode context-default-dsh: dsh 目录（按端点 + 模型 id）> 回退（官方 DeepSeek 1e6，其他 262144）
      contextWindow: dshDefaultContextWindow(modelOverride || legacy.model, baseUrl),
      // OpenCode context-compaction-dsh PART A: 官方 DeepSeek 256000（预留同值）；其他按 dsh 目录 ?? 32768，预留 0
      maxOutputTokens: deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : dshCatalogMaxOutputTokens(modelOverride || legacy.model, baseUrl) ?? DEFAULT_API_MAX_OUTPUT_TOKENS,
      outputReserveTokens: deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : 0,
      thinking: "enabled",
      reasoningEffort: deepSeek ? DEEPSEEK_DEFAULT_REASONING_EFFORT : "medium",
      reasoningEfforts: deepSeek ? [...DEEPSEEK_REASONING_EFFORTS] : [...DEFAULT_REASONING_EFFORTS],
      deepSeek,
      codex: false,
      imageInput: true,
      providerKey: "legacy",
      legacy: true
    };
  }
  configuredRuntimeBase(configuration) {
    const protocol = enumValue(configuration.protocol, ["openai-chat-completions", "openai-responses", "auto", "anthropic-messages"]) ?? "openai-chat-completions";
    const baseUrl = normalizeApiBaseUrl(stringValue(configuration.baseUrl));
    const deepSeek = protocol === "openai-chat-completions" && isOfficialDeepSeekApiBaseUrl(baseUrl);
    const defaultReasoningEfforts = deepSeek ? DEEPSEEK_REASONING_EFFORTS : DEFAULT_REASONING_EFFORTS;
    const configuredReasoningEfforts = reasoningEffortValues(configuration.reasoningEfforts, defaultReasoningEfforts);
    const reasoningEffort = enumValue(configuration.reasoningEffort, configuredReasoningEfforts) ?? (deepSeek ? DEEPSEEK_DEFAULT_REASONING_EFFORT : "medium");
    const legacyTimeoutMs = integerValue(configuration.timeoutMs, DEFAULT_TIMEOUT_MS2, 1e3, 3e5);
    return {
      protocol,
      baseUrl,
      apiKey: stringValue(configuration.apiKey) || void 0,
      timeoutMs: legacyTimeoutMs,
      firstTokenTimeoutMs: integerValue(configuration.firstTokenTimeoutMs, Math.min(DEFAULT_FIRST_TOKEN_TIMEOUT_MS, legacyTimeoutMs), 1e3, 18e5),
      idleTimeoutMs: integerValue(configuration.idleTimeoutMs, Math.min(DEFAULT_IDLE_TIMEOUT_MS, legacyTimeoutMs), 1e3, 18e5),
      totalTimeoutMs: integerValue(configuration.totalTimeoutMs, Math.max(DEFAULT_TOTAL_TIMEOUT_MS, legacyTimeoutMs), 1e3, 18e5),
      retries: integerValue(configuration.retries, 2, 0, 5),
      // OpenCode context-default-dsh: 用户在配置里填的窗口优先；否则官方 DeepSeek 1e6、其他 262144（与 dsh 回退一致），具体模型再按 dsh 目录细化（见 dshDefaultContextWindow 的调用处）
      contextWindow: integerValue(configuration.contextWindow, deepSeek ? DEEPSEEK_CONTEXT_WINDOW_TOKENS : DEFAULT_API_CONTEXT_WINDOW, 1024, 1e7),
      // OpenCode context-compaction-dsh PART A: 用户填写 > 官方 DeepSeek 256000 > 32768（具体模型再按 dsh 目录细化，见 ocDshOutputFields）
      maxOutputTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? (deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : DEFAULT_API_MAX_OUTPUT_TOKENS),
      // OpenCode context-compaction-dsh: 只有手动填写的输出上限才算「已知」，压缩时预留；默认 32K 不预留（与 dsh 一致）
      maxOutputTokensExplicit: optionalInteger(configuration.maxOutputTokens, 1, 1e6) !== void 0,
      // 压缩预留 O：用户填写值；官方 DeepSeek 默认 256000；其他 0
      outputReserveTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? (deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : 0),
      description: stringValue(configuration.description) || void 0,
      thinking: enumValue(configuration.thinking, THINKING_MODES) ?? "enabled",
      reasoningEffort,
      reasoningEfforts: reasoningEffortOptions(configuredReasoningEfforts, reasoningEffort, defaultReasoningEfforts),
      deepSeek,
      codex: false,
      imageInput: true
    };
  }
  codexRuntimeBase() {
    return {
      protocol: "openai-responses",
      baseUrl: CODEX_API_BASE_URL,
      timeoutMs: DEFAULT_TIMEOUT_MS2,
      firstTokenTimeoutMs: DEFAULT_FIRST_TOKEN_TIMEOUT_MS,
      idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
      totalTimeoutMs: DEFAULT_TOTAL_TIMEOUT_MS,
      retries: 2,
      contextWindow: DEFAULT_CODEX_CONTEXT_WINDOW,
      reasoningEffort: "medium",
      reasoningEfforts: ["low", "medium", "high", "xhigh", "max"],
      serviceTier: "default",
      serviceTiers: [{ id: "priority", name: "Fast", description: "Faster responses with increased usage." }],
      deepSeek: false,
      codex: true,
      imageInput: true,
      description: "ChatGPT subscription"
    };
  }
  async discoverModels(base, token, manualModelIds = []) {
    if (manualModelIds.length > 0) {
      return manualModelIds.map((id) => ({ id, name: id }));
    }
    if (base.codex) {
      let auth2;
      try {
        auth2 = await codexAuthManager.getRequestContext();
      } catch {
        return [];
      }
      const headers2 = {
        accept: "application/json",
        authorization: `Bearer ${auth2.accessToken}`,
        "ChatGPT-Account-ID": auth2.accountId,
        originator: CODEX_ORIGINATOR,
        "User-Agent": CODEX_USER_AGENT,
        "OpenAI-Beta": CODEX_BETA_HEADER
      };
      const payload2 = await fetchJsonWithRetries(
        normalizeModelsUrl(base.baseUrl, CODEX_CLIENT_VERSION),
        { method: "GET", headers: headers2 },
        token,
        Math.min(base.timeoutMs, MODEL_DISCOVERY_TIMEOUT_MS),
        base.retries,
        "Codex model discovery"
      );
      const models2 = parseDiscoveredModels(payload2, true);
      if (models2.length === 0) {
        throw new Error("Codex model discovery returned no compatible text model IDs.");
      }
      return models2;
    }
    const headers = { accept: "application/json" };
    if (base.apiKey?.trim()) headers.authorization = `Bearer ${base.apiKey.trim()}`;
    if (base.protocol === "anthropic-messages") {
      if (base.apiKey?.trim()) headers["x-api-key"] = base.apiKey.trim();
      headers["anthropic-version"] = ANTHROPIC_API_VERSION;
    }
    const payload = await fetchJsonWithRetries(
      base.protocol === "anthropic-messages" ? normalizeAnthropicModelsUrl(base.baseUrl) : normalizeModelsUrl(base.baseUrl, void 0, base.protocol === "auto"),
      { method: "GET", headers },
      token,
      Math.min(base.timeoutMs, MODEL_DISCOVERY_TIMEOUT_MS),
      base.retries,
      "Model discovery"
    );
    const models = parseDiscoveredModels(payload);
    if (models.length === 0) {
      throw new Error("Model discovery succeeded but returned no model IDs. Enter Model IDs manually for endpoints that do not expose GET /models.");
    }
    return models;
  }
  // OpenCode: 模型分组 id → 分组 id（由 provideManagedProviderModels 填充）
  modelGroupIds = /* @__PURE__ */ new Map();
  groupMemberRuntimeId(member) {
    return encodedModelId("managed-" + String(member.providerId).replace(/[^A-Za-z0-9_-]/g, "-"), String(member.model));
  }
  lookupModelGroupId(modelId) {
    return this.modelGroupIds.get(modelId) ?? this.modelGroupIds.get(normalizeProviderModelId(modelId, "opencode"));
  }
  // 按排名返回第一个可用（已配置且不在冷却中）的成员；全部冷却时用最早恢复的那个
  async resolveModelGroup(modelId, modelConfiguration) {
    let groupId = this.lookupModelGroupId(modelId);
    if (!groupId) {
      if (!/(^|\/)group-[^/]*::/.test(modelId)) return void 0;
      await this.provideManagedProviderModels();
      groupId = this.lookupModelGroupId(modelId);
      if (!groupId) return null;
    }
    const group = ocLoadModelGroups(this.context).find((g) => g.id === groupId);
    if (!group) return null;
    if (group.members.some((m) => !this.runtimeModels.has(this.groupMemberRuntimeId(m)))) await this.provideManagedProviderModels();
    const now = Date.now();
    const efforts = ocGroupEfforts(group);
    const wanted = efforts.length ? String(modelConfiguration?.reasoningEffort ?? "") : "";
    const byEffort = efforts.includes(wanted);
    let candidates = [];
    group.members.forEach((member, rank) => {
      const config2 = this.runtimeModels.get(this.groupMemberRuntimeId(member));
      if (!config2) return;
      const key = ocGroupMemberKey(member.providerId, member.model);
      const health = ocGroupHealth().get(key);
      candidates.push({ config2, key, rank, effort: efforts.length ? ocGroupMemberEffort(group, member) : "", cooling: health && health.until > now ? health.until : 0 });
    });
    // 选了具体强度：只用名字对应该强度的成员（模型本身就是该强度，不再额外发送 reasoning 参数）
    if (byEffort) candidates = candidates.filter((c) => c.effort === wanted);
    if (!candidates.length) return null;
    const pick = candidates.find((c) => !c.cooling) ?? [...candidates].sort((a, b) => a.cooling - b.cooling)[0];
    if (efforts.length && modelConfiguration) {
      modelConfiguration = { ...modelConfiguration };
      delete modelConfiguration.reasoningEffort;
    }
    return resolveRequestConfig({
      ...pick.config2,
      groupId: group.id,
      groupName: String(group.name || ""),
      groupDisplayName: ocModelGroupDisplayName(group),
      groupMemberKey: pick.key,
      groupMemberRank: pick.rank + 1,
      groupMemberCount: candidates.length,
      groupEffort: byEffort ? wanted : void 0,
      groupEffortMode: efforts.length > 0
    }, modelConfiguration);
  }
  async resolveRuntimeModel(modelId, modelConfiguration) {
    if (modelId && this.providerMode === "api") {
      const grouped = await this.resolveModelGroup(modelId, modelConfiguration);
      if (grouped !== void 0) return grouped ?? void 0;
    }
    let resolved;
    if (modelId) {
      const normalizedId = normalizeProviderModelId(modelId, this.providerMode === "codex" ? "opencode-codex" : "opencode");
      resolved = this.runtimeModels.get(normalizedId);
      if (!resolved && normalizedId !== modelId) {
        resolved = this.runtimeModels.get(modelId);
      }
      if (!resolved) {
        if (normalizedId.includes(MODEL_ID_SEPARATOR)) return void 0;
        resolved = await this.legacyRuntimeModel(normalizedId);
      }
    } else if (this.providerMode === "api") {
      resolved = await this.legacyRuntimeModel();
    } else {
      return void 0;
    }
    return resolveRequestConfig({ ...resolved }, modelConfiguration);
  }
  // OpenCode: 把提供商管理（globalState opencode.providers.v1 + SecretStorage 密钥）中的模型按供应商列出
  async provideManagedProviderModels() {
    const list = this.context.globalState.get("opencode.providers.v1", []);
    const providers = (Array.isArray(list) ? list : []).filter((p) => p && p.id && stringValue(p.baseUrl) && Array.isArray(p.models) && p.models.length);
    const cfg = vscode16.workspace.getConfiguration("opencode");
    const curBase = String(cfg.get("model.baseUrl", "") || "").trim().replace(/\/+$/, "");
    const curModel = String(cfg.get("model.name", "") || "").trim();
    const out = [];
    let defaultIndex = -1;
    for (const p of providers) {
      const namespace = "managed-" + String(p.id).replace(/[^A-Za-z0-9_-]/g, "-");
      deleteRuntimeModelsForNamespace(this.runtimeModels, namespace);
      let apiKey = "";
      try { apiKey = await this.context.secrets.get(`opencode.provider.${p.id}.apiKey`) || ""; } catch {}
      const base = this.configuredRuntimeBase({ baseUrl: p.baseUrl, apiKey, protocol: p.protocol });
      const groupName = String(p.name || p.baseUrl).trim();
      const sameBase = String(p.baseUrl).trim().replace(/\/+$/, "") === curBase;
      const metaMap = p.modelMeta && typeof p.modelMeta === "object" ? p.modelMeta : {};
      for (const rawModelId of [...new Set(p.models.map((m) => String(m || "").trim()).filter(Boolean))]) {
        const id = encodedModelId(namespace, rawModelId);
        // OpenCode context-default-dsh: 未在模型设置里填窗口时按 dsh 目录（端点 + 模型 id）取值，查不到用 dsh 回退值；用户填写的值（metaMap）仍优先
        const config2 = ocApplyManagedModelMeta({ ...base, model: rawModelId, providerKey: namespace, imageInput: true, contextWindow: dshDefaultContextWindow(rawModelId, base.baseUrl), ...ocDshOutputFields(base, rawModelId) }, metaMap[rawModelId]);
        this.runtimeModels.set(id, config2);
        if (defaultIndex < 0 && sameBase && rawModelId === curModel) defaultIndex = out.length;
        out.push({
          id,
          name: String(metaMap[rawModelId]?.name || "").trim() || rawModelId,
          family: rawModelId,
          version: "configured",
          tooltip: `${rawModelId} \xB7 ${groupName}`,
          detail: groupName,
          maxInputTokens: config2.contextWindow,
          maxOutputTokens: config2.maxOutputTokens ?? Math.min(32768, Math.max(4096, Math.floor(config2.contextWindow / 4))),
          capabilities: { toolCalling: true, imageInput: config2.imageInput !== false },
          configurationSchema: modelConfigurationSchema(config2),
          isBYOK: true,
          isDefault: false,
          isUserSelectable: true,
          _opencodeRuntimeConfig: config2,
          _opencodeProviderOrder: out.length,
          _opencodeProviderGroup: groupName
        });
      }
    }
    if (out.length) out[defaultIndex < 0 ? 0 : defaultIndex].isDefault = true;
    // OpenCode: 模型分组作为独立模型列在最前面
    this.modelGroupIds = /* @__PURE__ */ new Map();
    const groupEntries = [];
    for (const group of ocLoadModelGroups(this.context)) {
      const members = group.members.filter((m) => this.runtimeModels.has(this.groupMemberRuntimeId(m)));
      if (!members.length) continue;
      const display = ocModelGroupDisplayName(group);
      const id = encodedModelId("group-" + String(group.id).replace(/[^A-Za-z0-9_-]/g, "-"), display);
      const first = this.runtimeModels.get(this.groupMemberRuntimeId(members[0]));
      this.modelGroupIds.set(id, group.id);
      groupEntries.push({
        id,
        name: display,
        family: display,
        version: "group",
        tooltip: `${display} \xB7 分组「${group.name || display}」\xB7 ${members.length} 个模型，按排名自动选用可用的`,
        detail: `分组${group.vendor ? ` \xB7 ${group.vendor}` : ""} \xB7 ${members.length} 个模型`,
        maxInputTokens: first.contextWindow,
        maxOutputTokens: first.maxOutputTokens ?? Math.min(32768, Math.max(4096, Math.floor(first.contextWindow / 4))),
        capabilities: { toolCalling: true, imageInput: true },
        configurationSchema: ocGroupConfigurationSchema(group, members, first),
        isBYOK: true,
        isDefault: false,
        isUserSelectable: true,
        _opencodeProviderOrder: -1,
        _opencodeProviderGroup: "模型分组"
      });
    }
    out.unshift(...groupEntries);
    return out;
  }
  async provideLanguageModelChatInformation(options, token) {
    // OpenCode: 记录每个模型所属供应商（与对话框模型下拉的分组一致），团队协作的模型选择按它分组
    const list = await this._ocProvideLanguageModelChatInformation(options, token);
    try { const reg = globalThis.__ocModelGroups ??= new Map(); for (const m of list || []) reg.set(m.id, String(m._opencodeProviderGroup || m.detail || "")); } catch {}
    return list;
  }
  async _ocProvideLanguageModelChatInformation(options, token) {
    const configuration = options?.configuration;
    if (this.providerMode === "api" && (!configuration || !stringValue(configuration.baseUrl))) {
      return this.provideManagedProviderModels(); // OpenCode: 提供商管理窗口中的供应商与模型
    }
    const base = this.providerMode === "codex" ? this.codexRuntimeBase() : this.configuredRuntimeBase(configuration);
    const providerKey = providerFingerprint(base, await this.getProviderFingerprintSalt());
    const modelNamespace = providerKey;
    const manualModelIds = parseManualModelIds(configuration?.modelIds);
    let discoveredModels;
    try {
      discoveredModels = await this.discoverModels(base, token, manualModelIds);
    } catch (error2) {
      const cached2 = this.discoveredModelCache.get(modelNamespace);
      if (!cached2) throw error2;
      discoveredModels = cached2;
    }
    if (discoveredModels.length === 0) {
      const cached2 = this.discoveredModelCache.get(modelNamespace);
      if (!cached2?.length) return [];
      discoveredModels = cached2;
    } else {
      this.discoveredModelCache.set(modelNamespace, discoveredModels);
      if (this.discoveredModelCache.size > 64) {
        const oldestKey = this.discoveredModelCache.keys().next().value;
        if (oldestKey !== void 0) {
          this.discoveredModelCache.delete(oldestKey);
        }
      }
    }
    deleteRuntimeModelsForNamespace(this.runtimeModels, modelNamespace);
    return discoveredModels.map((discoveredModel, index) => {
      const rawModelId = discoveredModel.id;
      let id = encodedModelId(modelNamespace, rawModelId);
      let suffix = 2;
      while (this.runtimeModels.has(id)) {
        id = encodedModelId(`${modelNamespace}-${suffix}`, rawModelId);
        suffix += 1;
      }
      const discoveredReasoningEfforts = discoveredModel.reasoningEfforts?.length ? [...discoveredModel.reasoningEfforts] : [...base.reasoningEfforts];
      const reasoningEfforts = base.codex ? codexReasoningEfforts(discoveredReasoningEfforts) : discoveredReasoningEfforts;
      if (base.codex && !reasoningEfforts.length) reasoningEfforts.push(...codexReasoningEfforts(base.reasoningEfforts));
      const reasoningEffort = base.codex ? codexReasoningFallback(discoveredModel.defaultReasoningEffort ?? base.reasoningEffort, reasoningEfforts) : discoveredModel.defaultReasoningEffort ?? (base.reasoningEffort && reasoningEfforts.includes(base.reasoningEffort) ? base.reasoningEffort : reasoningEfforts[0]);
      const serviceTiers = discoveredModel.serviceTiers !== void 0 ? discoveredModel.serviceTiers : base.serviceTiers;
      const config2 = {
        ...base,
        model: rawModelId,
        providerKey,
        // OpenCode context-default-dsh: 发现值 > 用户在配置里填的窗口 > dsh 目录（端点 + 模型 id）> dsh 回退值
        contextWindow: discoveredModel.contextWindow ?? (!base.codex && optionalInteger(configuration?.contextWindow, 1024, 1e7) !== void 0 ? base.contextWindow : dshDefaultContextWindow(rawModelId, base.baseUrl)),
        // OpenCode context-compaction-dsh PART A: Codex 不变；其他见 ocDshOutputFields（用户 > 发现 > dsh 目录 > 32768）
        ...base.codex ? { maxOutputTokens: discoveredModel.maxOutputTokens ?? base.maxOutputTokens, maxOutputTokensExplicit: discoveredModel.maxOutputTokens !== void 0 || base.maxOutputTokensExplicit === true } : ocDshOutputFields(base, rawModelId, discoveredModel.maxOutputTokens),
        reasoningEffort,
        reasoningEfforts,
        serviceTier: serviceTiers?.length ? discoveredModel.defaultServiceTier ?? "default" : void 0,
        serviceTiers,
        imageInput: true,
        description: discoveredModel.description ?? base.description
      };
      this.runtimeModels.set(id, config2);
      const visibleText = (text2) => (text2 ?? "").replace(/(?:https?:\/\/|data:)[^\s<>）)]+/gi, "").replace(/\s*·\s*·/g, " \xB7 ").replace(/^[\s·,;：:-]+|[\s·,;：:-]+$/g, "").trim().slice(0, 160);
      const visibleName = visibleText(discoveredModel.name) || "API \u6A21\u578B";
      const sourceLabel = base.codex ? "Codex" : "API \u6A21\u578B";
      return {
        id,
        name: visibleName,
        family: rawModelId,
        version: "configured",
        tooltip: visibleText(discoveredModel.description) || `${visibleText(rawModelId) || "API \u6A21\u578B"} \xB7 ${sourceLabel}`,
        detail: visibleText(discoveredModel.description) || visibleText(base.description) || sourceLabel,
        maxInputTokens: config2.contextWindow,
        // Generic API providers always carry an explicit output budget from
        // DEFAULT_API_MAX_OUTPUT_TOKENS; this fallback only covers Codex models.
        maxOutputTokens: config2.maxOutputTokens ?? Math.min(32768, Math.max(4096, Math.floor(config2.contextWindow / 4))),
        capabilities: { toolCalling: true, imageInput: config2.imageInput },
        configurationSchema: modelConfigurationSchema(config2),
        isBYOK: true,
        isDefault: false,
        isUserSelectable: true,
        _opencodeRuntimeConfig: config2,
        _opencodeProviderOrder: index
      };
    });
  }
  async provideTokenCount(_model, input, token) {
    if (token.isCancellationRequested) throw new vscode16.CancellationError();
    const text2 = typeof input === "string" ? input : Array.isArray(input?.content) ? input.content.map((part) => textFromPart(part) ?? JSON.stringify(part)).join("\n") : String(input ?? "");
    return Math.max(1, Math.ceil(text2.length / 4));
  }
  async provideLanguageModelChatResponse(model, messages2, options, progress, token) {
    const ocOff = globalThis.__ocDisabledTools;
    if (ocOff?.size && Array.isArray(options?.tools)) options = { ...options, tools: options.tools.filter((t) => !ocOff.has(t?.name)) }; // OpenCode: 工具窗口中禁用的工具不发给模型
    const baseConfig = model?._opencodeRuntimeConfig ?? await this.resolveRuntimeModel(typeof model?.id === "string" ? model.id : void 0);
    if (!baseConfig) {
      throw new Error("The selected OpenCode API provider is no longer available. Refresh the provider or select another model.");
    }
    const config2 = resolveRequestConfig(baseConfig, objectValue(options?.modelConfiguration));
    if (config2.codex) {
      await this.provideCodexChatResponse(config2, messages2, options, progress, token);
      return;
    }
    const headers = { "content-type": "application/json", accept: "text/event-stream" };
    if (config2.apiKey?.trim()) headers.authorization = `Bearer ${config2.apiKey.trim()}`;
    const rawTools = Array.isArray(options?.tools) ? options.tools : [];
    const toolChoice = rawTools.length ? options?.toolMode === vscode16.LanguageModelChatToolMode.Required ? "required" : "auto" : void 0;
    const autoKey = `${config2.providerKey}:${config2.model}`;
    const autoProtocol = config2.protocol === "auto";
    const blockedUntil = this.unsupportedResponsesRoutes.get(autoKey);
    if (blockedUntil !== void 0 && blockedUntil <= Date.now()) this.unsupportedResponsesRoutes.delete(autoKey);
    if (config2.protocol === "openai-responses" || autoProtocol && !(blockedUntil && blockedUntil > Date.now())) {
      try {
        const reasoning = config2.thinking === "disabled" ? {} : {
          ...config2.reasoningEffort ? { effort: config2.reasoningEffort } : {},
          ...config2.reasoningSummary ? { summary: config2.reasoningSummary } : {},
          ...config2.reasoningContext ? { context: config2.reasoningContext } : {},
          ...config2.reasoningMode ? { mode: config2.reasoningMode } : {}
        };
        const promptCacheOptions = {
          ...config2.promptCacheMode ? { mode: config2.promptCacheMode } : {},
          ...config2.promptCacheTtl ? { ttl: config2.promptCacheTtl } : {}
        };
        const responseTools = rawTools.map((tool) => ({
          type: "function",
          name: tool.name,
          description: tool.description ?? "",
          parameters: tool.inputSchema ?? { type: "object", properties: {} }
        }));
        const extra2 = safeExtraBody(config2.extraBody);
        const extraText = objectValue(extra2.text);
        delete extra2.text;
        const body2 = {
          ...extra2,
          model: config2.model,
          input: toResponsesInput(messages2),
          ...config2.maxOutputTokens !== void 0 ? { max_output_tokens: ocDshOutputCap(config2, config2.maxOutputTokens, { input: toResponsesInput(messages2), tools: responseTools }) } : {},
          ...Object.keys(reasoning).length ? { reasoning } : {},
          ...config2.verbosity || extraText ? { text: { ...extraText ?? {}, ...config2.verbosity ? { verbosity: config2.verbosity } : {} } } : {},
          ...config2.temperature !== void 0 ? { temperature: config2.temperature } : {},
          ...config2.topP !== void 0 ? { top_p: config2.topP } : {},
          ...config2.parallelToolCalls !== void 0 ? { parallel_tool_calls: config2.parallelToolCalls } : {},
          ...config2.maxToolCalls !== void 0 ? { max_tool_calls: config2.maxToolCalls } : {},
          ...config2.serviceTier ? { service_tier: config2.serviceTier } : {},
          ...config2.store !== void 0 ? { store: config2.store } : {},
          ...config2.truncation ? { truncation: config2.truncation } : {},
          ...config2.promptCacheKey ? { prompt_cache_key: config2.promptCacheKey } : {},
          ...Object.keys(promptCacheOptions).length ? { prompt_cache_options: promptCacheOptions } : {},
          ...config2.promptCacheRetention ? { prompt_cache_retention: config2.promptCacheRetention } : {},
          ...config2.safetyIdentifier ? { safety_identifier: config2.safetyIdentifier } : {},
          ...config2.requestMetadata ? { metadata: config2.requestMetadata } : {},
          ...responseTools.length ? { tools: responseTools, tool_choice: toolChoice } : {}
        };
        const payload = await fetchJsonWithResponseCache(
          normalizeResponsesUrl(config2.baseUrl),
          { method: "POST", headers, body: JSON.stringify(body2) },
          token,
          config2.timeoutMs,
          config2.retries,
          "Responses endpoint",
          { requestCacheable: isResponsesRequestCacheable(body2.input), isPayloadCacheable: isResponsesPayloadCacheable }
        );
        if (payload?.status === "failed") {
          throw new Error(payload?.error?.message ?? "OpenCode Responses API request failed.");
        }
        // OpenCode p29: incomplete（max_output_tokens）标记截断
        if (payload?.status === "incomplete" && /max_output_tokens|max_tokens/.test(String(payload?.incomplete_details?.reason ?? ""))) ocMarkTruncated(progress, "max_output_tokens");
        let emittedText = false;
        for (const item of Array.isArray(payload?.output) ? payload.output : []) {
          if (item?.type === "reasoning") {
            const summaries = (Array.isArray(item.summary) ? item.summary : []).map((entry) => typeof entry?.text === "string" ? entry.text : "").filter(Boolean);
            if (summaries.length) {
              progress.report(new vscode16.LanguageModelThinkingPart(summaries, item.id, {
                context: payload?.reasoning?.context,
                mode: payload?.reasoning?.mode
              }));
            }
            continue;
          }
          if (item?.type === "message") {
            for (const content of Array.isArray(item.content) ? item.content : []) {
              const text2 = content?.type === "output_text" && typeof content.text === "string" ? content.text : content?.type === "refusal" && typeof content.refusal === "string" ? content.refusal : void 0;
              if (text2) {
                emittedText = true;
                progress.report(new vscode16.LanguageModelTextPart(text2));
              }
            }
            continue;
          }
          if (item?.type === "function_call" && typeof item.name === "string") {
            let input = {};
            try {
              input = JSON.parse(typeof item.arguments === "string" ? item.arguments : "{}");
            } catch {
              input = {};
            }
            progress.report(new vscode16.LanguageModelToolCallPart(item.call_id ?? item.id ?? `tool-${Date.now()}`, item.name, input));
          }
        }
        if (!emittedText && typeof payload?.output_text === "string" && payload.output_text) {
          progress.report(new vscode16.LanguageModelTextPart(payload.output_text));
        }
        if (autoProtocol) this.unsupportedResponsesRoutes.delete(autoKey);
        return;
      } catch (error2) {
        if (!autoProtocol || !isUnsupportedRouteError(error2) || token.isCancellationRequested) throw error2;
        if (this.unsupportedResponsesRoutes.size >= 64) this.unsupportedResponsesRoutes.delete(this.unsupportedResponsesRoutes.keys().next().value);
        this.unsupportedResponsesRoutes.set(autoKey, Date.now() + 5 * 6e4);
      }
    }
    if (config2.protocol === "anthropic-messages") {
      if (config2.apiKey?.trim()) headers["x-api-key"] = config2.apiKey.trim();
      headers["anthropic-version"] = ANTHROPIC_API_VERSION;
      const anthropicTools = rawTools.map((tool) => ({
        name: tool.name,
        description: tool.description ?? "",
        input_schema: tool.inputSchema ?? { type: "object", properties: {} }
      }));
      const maxOutputTokens = ocDshOutputCap(config2, config2.maxOutputTokens ?? 8192, { messages: toAnthropicChatMessages(messages2).messages, tools: anthropicTools });
      const effort = config2.thinking !== "disabled" && config2.reasoningEffort && config2.reasoningEffort !== "none" && config2.reasoningEffort !== "minimal" ? config2.reasoningEffort : void 0;
      const thinkingBudget = effort ? Math.max(1024, Math.min(ANTHROPIC_EFFORT_THINKING_BUDGETS[effort] ?? 8192, maxOutputTokens - 1024)) : 0;
      const extra2 = safeExtraBody(config2.extraBody);
      const body2 = {
        ...extra2,
        model: config2.model,
        messages: toAnthropicChatMessages(messages2).messages,
        max_tokens: maxOutputTokens,
        ...thinkingBudget >= 1024 && thinkingBudget < maxOutputTokens ? { thinking: { type: "enabled", budget_tokens: thinkingBudget } } : {},
        ...anthropicTools.length ? { tools: anthropicTools, tool_choice: { type: toolChoice === "required" ? "any" : "auto" } } : {}
      };
      const payload = await fetchJsonWithResponseCache(
        normalizeAnthropicMessagesUrl(config2.baseUrl),
        { method: "POST", headers, body: JSON.stringify(body2) },
        token,
        config2.timeoutMs,
        config2.retries,
        "Anthropic Messages endpoint",
        { requestCacheable: isAnthropicRequestCacheable(body2.messages), isPayloadCacheable: isAnthropicPayloadCacheable }
      );
      if (payload?.type === "error" || payload?.error) {
        throw new Error(String(payload?.error?.message ?? "OpenCode Anthropic Messages request failed."));
      }
      // OpenCode p29: stop_reason=max_tokens 标记截断
      if (payload?.stop_reason === "max_tokens") ocMarkTruncated(progress, "max_tokens");
      for (const block of Array.isArray(payload?.content) ? payload.content : []) {
        if (!block || typeof block !== "object") continue;
        if (block.type === "thinking" && typeof block.thinking === "string" && block.thinking) {
          progress.report(new vscode16.LanguageModelThinkingPart(block.thinking, block.id));
          continue;
        }
        if (block.type === "text" && typeof block.text === "string" && block.text) {
          progress.report(new vscode16.LanguageModelTextPart(block.text));
          continue;
        }
        if (block.type === "tool_use" && typeof block.name === "string") {
          progress.report(new vscode16.LanguageModelToolCallPart(
            typeof block.id === "string" && block.id ? block.id : `tool-${Date.now()}`,
            block.name,
            block.input && typeof block.input === "object" ? block.input : {}
          ));
        }
      }
      return;
    }
    const chatTools = rawTools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema ?? { type: "object", properties: {} }
      }
    }));
    const deepSeekThinking = config2.deepSeek && config2.thinking !== "disabled";
    const extra = safeExtraBody(config2.extraBody);
    const chatMessages = toOpenAIMessages(messages2, { preserveReasoningContent: deepSeekThinking });
    const availableOutputTokens = config2.deepSeek ? config2.contextWindow - estimatedTokens({ messages: chatMessages, tools: chatTools }) - 1024 : void 0;
    if (availableOutputTokens !== void 0 && availableOutputTokens < 1) {
      throw new Error("The DeepSeek request exceeds the configured context window after reserving response space.");
    }
    const requestMaxOutputTokens = config2.maxOutputTokens !== void 0 ? availableOutputTokens === void 0 ? ocDshOutputCap(config2, config2.maxOutputTokens, { messages: chatMessages, tools: chatTools }) : Math.min(config2.maxOutputTokens, availableOutputTokens) : void 0;
    const body = {
      ...extra,
      model: config2.model,
      messages: chatMessages,
      ...requestMaxOutputTokens !== void 0 ? { max_tokens: requestMaxOutputTokens } : {},
      ...config2.deepSeek && config2.thinking ? { thinking: { type: config2.thinking } } : {},
      ...config2.reasoningEffort && (config2.deepSeek ? deepSeekThinking : config2.thinking !== "disabled") ? { reasoning_effort: config2.reasoningEffort } : {},
      ...!deepSeekThinking && config2.temperature !== void 0 ? { temperature: config2.temperature } : {},
      ...!deepSeekThinking && config2.topP !== void 0 ? { top_p: config2.topP } : {},
      ...config2.responseFormat ? { response_format: config2.responseFormat } : {},
      ...config2.stop ? { stop: config2.stop } : {},
      ...config2.seed !== void 0 ? { seed: config2.seed } : {},
      ...!deepSeekThinking && config2.presencePenalty !== void 0 ? { presence_penalty: config2.presencePenalty } : {},
      ...!deepSeekThinking && config2.frequencyPenalty !== void 0 ? { frequency_penalty: config2.frequencyPenalty } : {},
      ...chatTools.length ? { tools: chatTools, ...!deepSeekThinking ? { tool_choice: toolChoice } : {} } : {},
      stream: true
    };
    const chatUrl = normalizeChatCompletionsUrl(config2.baseUrl);
    const chatBody = JSON.stringify(body);
    await runStreamWithResponseCache(
      { url: chatUrl, headers, body: chatBody, requestCacheable: isChatCompletionsRequestCacheable(body.messages) },
      progress,
      token,
      async (targetProgress) => {
        // max-tokens-fallback: 服务端声明的输出上限小于 max_tokens 时去掉 max_tokens 重试一次
        const sendChat = (b) => fetchStreamWithRetries(chatUrl, { method: "POST", headers, body: b }, token, config2.timeoutMs, config2.retries, "Chat Completions endpoint");
        let response;
        try {
          response = await sendChat(chatBody);
        } catch (error) {
          if (body.max_tokens === void 0 || !/max_tokens|max_output_tokens|output limit/i.test(String(error?.message ?? error))) throw error;
          const { max_tokens: _dropped, ...rest } = body;
          response = await sendChat(JSON.stringify(rest));
        }
        // OpenCode p29: finish_reason=length 时标记截断（且不缓存）
        const ocFinish = await emitChatCompletionStream(response, targetProgress, token);
        if (ocFinish) {
          targetProgress.ocNoCache?.();
          ocMarkTruncated(progress, ocFinish);
        }
      }
    );
  }
  async provideCodexChatResponse(config2, messages2, options, progress, token) {
    const auth2 = await codexAuthManager.getRequestContext();
    const headers = {
      "content-type": "application/json",
      accept: "text/event-stream",
      authorization: `Bearer ${auth2.accessToken}`,
      "ChatGPT-Account-ID": auth2.accountId,
      originator: CODEX_ORIGINATOR,
      "User-Agent": CODEX_USER_AGENT,
      "OpenAI-Beta": CODEX_BETA_HEADER
    };
    const rawTools = Array.isArray(options?.tools) ? options.tools : [];
    const toolChoice = rawTools.length ? options?.toolMode === vscode16.LanguageModelChatToolMode.Required ? "required" : "auto" : void 0;
    const effort = codexReasoningEffort(config2.reasoningEffort);
    const serviceTier = config2.serviceTier === "default" ? void 0 : config2.serviceTier;
    const reasoning = {
      ...effort ? { effort } : {},
      ...config2.reasoningSummary ? { summary: config2.reasoningSummary } : {},
      ...config2.reasoningContext ? { context: config2.reasoningContext } : {},
      ...config2.reasoningMode ? { mode: config2.reasoningMode } : {}
    };
    const responseTools = rawTools.map((tool) => ({
      type: "function",
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema ?? { type: "object", properties: {} }
    }));
    const extra = safeExtraBody(config2.extraBody);
    const extraText = objectValue(extra.text);
    delete extra.text;
    const body = {
      ...extra,
      model: config2.model,
      instructions: "You are Codex, OpenAI's coding agent.",
      input: toCodexResponsesInput(messages2),
      store: false,
      stream: true,
      ...Object.keys(reasoning).length ? { reasoning } : {},
      ...config2.verbosity || extraText ? { text: { ...extraText ?? {}, ...config2.verbosity ? { verbosity: config2.verbosity } : {} } } : {},
      ...config2.parallelToolCalls !== void 0 ? { parallel_tool_calls: config2.parallelToolCalls } : {},
      ...serviceTier ? { service_tier: serviceTier } : {},
      ...config2.promptCacheKey ? { prompt_cache_key: config2.promptCacheKey } : {},
      ...responseTools.length ? { tools: responseTools, tool_choice: toolChoice } : {}
    };
    const url2 = normalizeResponsesUrl(config2.baseUrl);
    const attempt = () => fetchStreamWithRetries(
      url2,
      { method: "POST", headers, body: JSON.stringify(body) },
      token,
      config2.timeoutMs,
      config2.retries,
      "Codex Responses endpoint"
    );
    await runStreamWithResponseCache(
      { url: url2, headers, body: JSON.stringify(body), requestCacheable: isResponsesRequestCacheable(body.input) },
      progress,
      token,
      async (targetProgress) => {
        let response;
        try {
          response = await attempt();
        } catch (error2) {
          const status = typeof error2 === "object" && error2 !== null && "status" in error2 ? Number(error2.status) : void 0;
          if (status !== 401) throw error2;
          const refreshedAuth = await codexAuthManager.forceRefresh();
          headers.authorization = `Bearer ${refreshedAuth.accessToken}`;
          headers["ChatGPT-Account-ID"] = refreshedAuth.accountId;
          response = await attempt();
        }
        // OpenCode p29: incomplete（max_output_tokens）时标记截断（且不缓存）
        const ocFinish = await emitResponsesStream(response, targetProgress, token);
        if (ocFinish) {
          targetProgress.ocNoCache?.();
          ocMarkTruncated(progress, ocFinish);
        }
      }
    );
  }
  dispose() {
    this.changeEmitter.dispose();
  }
};
// OpenCode: 通过 VS Code 语言模型接口使用分组时，成员在输出前失败就换下一个
var ocProvideChatResponseOriginal = OpenCodeLanguageModelProvider.prototype.provideLanguageModelChatResponse;
OpenCodeLanguageModelProvider.prototype.provideLanguageModelChatResponse = async function(model, messages2, options, progress, token) {
  const modelId = typeof model?.id === "string" ? model.id : "";
  if (!modelId || this.providerMode !== "api" || model?._opencodeRuntimeConfig || !(this.lookupModelGroupId(modelId) || /(^|\/)group-[^/]*::/.test(modelId))) {
    return ocProvideChatResponseOriginal.call(this, model, messages2, options, progress, token);
  }
  const tried = /* @__PURE__ */ new Set();
  const requestedConfiguration = objectValue(options?.modelConfiguration);
  for (; ; ) {
    const config2 = await this.resolveRuntimeModel(modelId, requestedConfiguration);
    if (!config2) throw new Error("模型分组里没有可用的模型。请在「模型提供商」里检查分组成员。");
    // 按名字区分强度的分组：强度已经由所选成员决定，不再把强度参数发给该成员
    if (config2.groupEffortMode && requestedConfiguration) {
      const withoutEffort = { ...requestedConfiguration };
      delete withoutEffort.reasoningEffort;
      options = { ...options, modelConfiguration: withoutEffort };
    }
    if (tried.has(config2.groupMemberKey)) throw new Error("模型分组里的模型都失败了。");
    tried.add(config2.groupMemberKey);
    let emitted = false;
    const watched = { __ocOuter: progress, report: (part) => { // OpenCode p29: __ocOuter 传递截断标记
      emitted = true;
      progress.report(part);
    } };
    try {
      await ocProvideChatResponseOriginal.call(this, { ...model, _opencodeRuntimeConfig: config2 }, messages2, options, watched, token);
      globalThis.__opencodeModelGroupMark.succeeded(config2.groupMemberKey);
      return;
    } catch (error2) {
      if (token?.isCancellationRequested) throw error2;
      globalThis.__opencodeModelGroupMark.failed(config2.groupMemberKey, error2 instanceof Error ? error2.message : String(error2));
      if (emitted || tried.size >= config2.groupMemberCount) throw error2;
    }
  }
};
// OpenCode p29: 输出达到长度上限时自动续写（最多 3 次）：把已输出的正文作为 assistant 消息，再请模型从断点继续；
// 仍被截断、已产生工具调用或没有正文可续时，在输出末尾显示「（输出达到长度上限，已截断）」
var OC_MAX_CONTINUATIONS = 3;
var OC_CONTINUE_PROMPT = "Your previous reply was cut off because it hit the output length limit. Continue exactly where it stopped: do not repeat anything already written, do not restart, and do not add any preamble or commentary. If you stopped inside a code block, continue inside that code block.";
var ocProvideChatResponseGrouped = OpenCodeLanguageModelProvider.prototype.provideLanguageModelChatResponse;
OpenCodeLanguageModelProvider.prototype.provideLanguageModelChatResponse = async function(model, messages2, options, progress, token) {
  let partialText = "";
  for (let round = 0; ; round += 1) {
    let roundText = "";
    let sawToolCall = false;
    const tracker = {
      report: (part) => {
        if (part instanceof vscode16.LanguageModelTextPart && typeof part.value === "string") roundText += part.value;
        else if (part instanceof vscode16.LanguageModelToolCallPart) sawToolCall = true;
        progress.report(part);
      }
    };
    const history = round === 0 ? messages2 : [...messages2, vscode16.LanguageModelChatMessage.Assistant(partialText), vscode16.LanguageModelChatMessage.User(OC_CONTINUE_PROMPT)];
    await ocProvideChatResponseGrouped.call(this, model, history, options, tracker, token);
    if (!tracker.__ocTruncated) return;
    partialText += roundText;
    if (round >= OC_MAX_CONTINUATIONS || sawToolCall || !roundText.trim() || token?.isCancellationRequested) {
      if (!token?.isCancellationRequested) progress.report(new vscode16.LanguageModelTextPart(`\n\n${OC_TRUNCATION_NOTICE}`));
      return;
    }
  }
};
export { normalizeChatCompletionsUrl, normalizeResponsesUrl, normalizeAnthropicMessagesUrl, normalizeAnthropicModelsUrl, stringValue, integerValue, optionalInteger, optionalNumber, optionalBoolean, enumValue, reasoningEffortValues, reasoningEffortOptions, reasoningEffortLabel, reasoningEffortDescription, objectValue, stringRecordValue, stringArrayValue, normalizeApiBaseUrl, normalizeModelsUrl, parseManualModelIds, providerFingerprint, parseDiscoveredModels, isUnsupportedRouteError, isTransientStatus, delayForRetry, fetchJsonWithRetries, fetchStreamWithRetries, emitChatCompletionMessage, emitChatCompletionStream, textFromPart, thinkingTextFromPart, estimatedTokens, imageFromPart, responsesImageFromPart, toOpenAIMessages, anthropicSourceFromImageUrl, toAnthropicChatMessages, toResponsesInput, toCodexResponsesInput, codexReasoningEffort, extractResponsesOutputText, emitResponsesStream, modelConfigurationSchema, inheritedEnum, resolveRequestConfig, safeExtraBody, import_node_crypto24, vscode16, ANTHROPIC_API_VERSION, ANTHROPIC_EFFORT_THINKING_BUDGETS, DEFAULT_TIMEOUT_MS2, DEFAULT_FIRST_TOKEN_TIMEOUT_MS, DEFAULT_IDLE_TIMEOUT_MS, DEFAULT_TOTAL_TIMEOUT_MS, DEFAULT_CONTEXT_WINDOW, MODEL_DISCOVERY_TIMEOUT_MS, PROVIDER_FINGERPRINT_SALT_SECRET, PROTECTED_REQUEST_KEYS, OpenCodeLanguageModelProvider };
