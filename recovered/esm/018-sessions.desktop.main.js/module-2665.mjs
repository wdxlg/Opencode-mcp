// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailure.ts
import { BRIDGE_STARTUP_FAILURE_CATALOG, BRIDGE_STARTUP_FAILURE_CHROME, bridgeStartupFailureCopy, isBridgeStartupFailureCode } from "./module-2662.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailure.ts
var MAX_DETAIL_CHARS = 4e3;

var FALLBACK_RULES = [
  [(raw) => /cloudflared Quick Tunnel API TLS certificate verification failed|failed to request quick tunnel[\s\S]*?(?:x509:|tls: failed to verify certificate|certificate signed by unknown authority|certificate is not valid for)/i.test(raw), () => "quick-tunnel-tls-failed"],
  [(raw) => /startup (?:was )?cancelled|cancelled by stop/i.test(raw), () => "cancelled"],
  [(raw) => /cleanup is in progress/i.test(raw), () => "cleanup-in-progress"],
  [(raw) => /Bridge has been disposed/i.test(raw), () => "disposed"],
  [(raw) => /tunnel \(pid \d+\) is still running and could not be stopped/i.test(raw), () => "stale-tunnel"],
  [(raw) => /Bridge local HTTP (?:health check|port is unavailable)/i.test(raw), () => "local-health-failed"],
  [(raw) => /Open a workspace folder|No workspace folder is open/i.test(raw), () => "no-workspace"],
  [(raw) => /installation.*(revoked|limit)|device.*(revoked|limit)/i.test(raw), () => "device-unavailable"],
  [(raw) => /not activated|no active.*entitlement|license.*expired|未订阅|未开通|授权.*过期/i.test(raw), () => "not-licensed"],
  [(raw) => /sign in|unauthorized|session.*expired|401/i.test(raw) && !/ngrok|tunnel|authtoken/i.test(raw), () => "signed-out"],
  [(raw) => /EADDRINUSE|address already in use|port.*in use|端口.*占用/i.test(raw), () => "local-port-in-use"],
  [(raw) => /trycloudflare\.com URL/i.test(raw) || /cloudflared/i.test(raw) && /edge|quic|unable to establish/i.test(raw), () => "edge-unreachable"],
  [(raw) => /health check timed out/i.test(raw), () => "public-health-timeout"],
  [(raw) => /health endpoint unreachable/i.test(raw), () => "public-health-unreachable"],
  [(raw) => /ENOENT|not installed|not found.*(?:cloudflared|ngrok)|(?:cloudflared|ngrok).*not found/i.test(raw), (raw) => /ngrok/i.test(raw) ? "ngrok-missing" : "cloudflared-missing"],
  [(raw) => /ERR_NGROK|invalid.*token|authentication failed|reserved domain|hostname.*required|Tunnel Token|authtoken/i.test(raw), (raw) => /ngrok|authtoken|reserved domain/i.test(raw) ? "ngrok-config-invalid" : /hostname.*required|not configured/i.test(raw) ? "named-config-missing" : "named-token-invalid"],
  [(raw) => /timed? ?out|timeout|network|fetch failed|ENOTFOUND|ECONN|EAI_AGAIN|health.*unreachable|trycloudflare\.com URL|quic|unable to establish|TLS|proxy/i.test(raw), () => "network-failed"]
];

function describeBridgeStartupFailure(input) {
  const info = typeof input === "object" ? input : void 0;
  const raw = typeof input === "string" ? input : info?.detail ?? "";
  const code = info ? isBridgeStartupFailureCode(info.code) ? info.code : "unknown" : classifyRawStartupFailure(raw);
  const entry = BRIDGE_STARTUP_FAILURE_CATALOG[code];
  const params = { ...info ? {} : paramsFromRaw(code, raw), ...info?.params ?? {} };
  const title = bridgeStartupFailureCopy(entry.title);
  const cause = fillParams(bridgeStartupFailureCopy(entry.cause), params) ?? bridgeStartupFailureCopy(entry.causeWithoutParams ?? entry.cause);
  const heading2 = entry.severity === "error" && !entry.standalone ? bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.failedHeading, title) : title;
  const detail2 = redactBridgeStartupDetail(raw) || bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.noDetail);
  return {
    code,
    stage: info?.stage,
    severity: entry.severity,
    title,
    cause,
    heading: heading2,
    actions: entry.actions,
    params,
    detail: detail2,
    at: info?.at,
    key: JSON.stringify([code, params, detail2])
  };
}

function classifyRawStartupFailure(raw) {
  for (const [matches2, code] of FALLBACK_RULES) {
    if (matches2(raw)) {
      return code(raw);
    }
  }
  return "unknown";
}

function redactBridgeStartupDetail(raw) {
  const hidden = `[${bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.hidden)}]`;
  return raw.replace(/\bBearer\s+[^\s,;]+/gi, `Bearer ${hidden}`).replace(/((?:auth[_-]?token|access[_-]?token|tunnel[_-]?token|token|password|secret|authorization)\s*[=:]\s*)[^\s,;&]+/gi, `$1${hidden}`).replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, `$1${hidden}@`).replace(/(\/(?:mcp|healthz)\/)[^\s/?#"'<>)]+/gi, `$1${hidden}`).replace(/\beyJ[A-Za-z0-9_+/=-]{16,}(?:\.[A-Za-z0-9_+/=-]+){0,2}/g, hidden).replace(/[A-Za-z0-9_+=-]{48,}/g, hidden).slice(0, MAX_DETAIL_CHARS);
}

function bridgeStartupFailureDiagnostics(failure2, context2) {
  return [
    "OpenCode Bridge startup diagnostics",
    `code: ${failure2.code}`,
    `stage: ${failure2.stage ?? "unknown"}`,
    `time: ${new Date(failure2.at ?? Date.now()).toISOString()}`,
    `tunnel: ${context2.provider ?? "unknown"}`,
    `platform: ${context2.platform ?? "unknown"}`,
    "detail:",
    failure2.detail
  ].join("\n");
}

function paramsFromRaw(code, raw) {
  const port = code === "local-port-in-use" ? /\bport (\d{2,5})\b/i.exec(raw)?.[1] : void 0;
  const pid = code === "stale-tunnel" ? /\(pid (\d+)\)/i.exec(raw)?.[1] : void 0;
  return { ...port ? { port: Number(port) } : {}, ...pid ? { pid: Number(pid) } : {} };
}

function fillParams(text2, params) {
  let missing = false;
  const filled = text2.replace(/\{([A-Za-z]+)\}/g, (match2, name) => {
    const value2 = params[name];
    if (value2 === void 0 || value2 === "") {
      missing = true;
      return match2;
    }
    return String(value2);
  });
  return missing ? void 0 : filled;
}
export { describeBridgeStartupFailure, classifyRawStartupFailure, redactBridgeStartupDetail, bridgeStartupFailureDiagnostics, paramsFromRaw, fillParams, MAX_DETAIL_CHARS, FALLBACK_RULES };
