// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/model-endpoint-url.mts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/model-endpoint-url.mts
init_define_OPENCODE_BUILD_INFO();

function normalizeOpenAIBaseUrl(value, preserveUnversioned = false) {
  const base = value.trim().replace(/\/+$/, "").replace(/\/(?:chat\/completions|responses|models)\/?$/i, "").replace(/(?:\/v1){2,}$/i, "/v1");
  if (!base) throw new Error("OpenCode model Base URL is empty.");
  const url2 = new URL(base);
  if (!["http:", "https:"].includes(url2.protocol)) throw new Error("OpenCode model Base URL must use HTTP or HTTPS.");
  if (!preserveUnversioned && !url2.search && !url2.hash && (url2.pathname === "/" || url2.pathname === "/api") && url2.hostname.toLowerCase() !== "api.deepseek.com") {
    return `${base}/v1`;
  }
  return base;
}

function normalizeOpenAIModelsUrl(value, preserveUnversioned = false) {
  return `${normalizeOpenAIBaseUrl(value, preserveUnversioned)}/models`;
}

function redactModelEndpointForLog(value) {
  try {
    const url2 = new URL(value);
    const parts = url2.pathname.split("/");
    const path36 = parts.map((part, index) => {
      const decoded = decodeURIComponent(part);
      return /^(?:sk[-_]|key[-_]|token[-_])/i.test(decoded) || /^[a-z0-9_-]{32,}$/i.test(decoded) || /^(?:key|token|secret)$/i.test(parts[index - 1] ?? "") ? "[redacted]" : part;
    }).join("/");
    return `${url2.origin}${path36}`;
  } catch {
    return "<invalid URL>";
  }
}

async function testOpenAIModelsEndpoint(value, apiKey, protocol, onFailure, fetchImpl = fetch) {
  let modelsUrl;
  let response;
  const logFailure = () => {
    const endpoint = modelsUrl ? redactModelEndpointForLog(modelsUrl) : "<unresolved>";
    const redirected = response?.url && response.url !== modelsUrl ? ` redirected=${redactModelEndpointForLog(response.url)}` : "";
    onFailure(`[api-test] endpoint=${endpoint}${redirected} status=${response?.status ?? "n/a"} content-type=${response?.headers.get("content-type")?.slice(0, 120) ?? "(none)"}`);
  };
  try {
    modelsUrl = normalizeOpenAIModelsUrl(value, protocol === "auto");
    const headers = { accept: "application/json" };
    if (apiKey) headers.authorization = `Bearer ${apiKey}`;
    response = await fetchImpl(modelsUrl, { headers, signal: AbortSignal.timeout(1e4) });
    if (!response.ok) {
      logFailure();
      return { ok: false, error: `HTTP ${response.status} ${response.statusText}` };
    }
    const payload = await response.json();
    const data = payload && typeof payload === "object" && !Array.isArray(payload) ? payload.data : void 0;
    const models = Array.isArray(data) ? data : Array.isArray(payload) ? payload : [];
    return { ok: true, count: models.length };
  } catch (error2) {
    logFailure();
    return { ok: false, error: error2 instanceof Error ? error2.message : String(error2) };
  }
}
export { normalizeOpenAIBaseUrl, normalizeOpenAIModelsUrl, redactModelEndpointForLog, testOpenAIModelsEndpoint };
