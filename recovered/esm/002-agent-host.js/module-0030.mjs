// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/agent-host.js
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

function redactModelEndpointForLog(value) {
  try {
    const url2 = new URL(value);
    const parts = url2.pathname.split("/");
    const path2 = parts.map((part, index) => {
      const decoded = decodeURIComponent(part);
      return /^(?:sk[-_]|key[-_]|token[-_])/i.test(decoded) || /^[a-z0-9_-]{32,}$/i.test(decoded) || /^(?:key|token|secret)$/i.test(parts[index - 1] ?? "") ? "[redacted]" : part;
    }).join("/");
    return `${url2.origin}${path2}`;
  } catch {
    return "<invalid URL>";
  }
}
export { normalizeOpenAIBaseUrl, redactModelEndpointForLog };
