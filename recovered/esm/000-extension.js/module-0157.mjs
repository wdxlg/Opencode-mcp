// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-start-failure.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-start-failure.ts
init_define_OPENCODE_BUILD_INFO();

var BRIDGE_START_FAILURE_CODES = [
  "not-licensed",
  "device-unavailable",
  "signed-out",
  "no-workspace",
  "cleanup-in-progress",
  "disposed",
  "cancelled",
  "ngrok-domain-missing",
  "ngrok-domain-invalid",
  "named-config-missing",
  "named-config-invalid",
  "named-token-invalid",
  "cloudflared-missing",
  "cloudflared-install-failed",
  "ngrok-missing",
  "ngrok-config-invalid",
  "stale-tunnel",
  "local-port-in-use",
  "local-health-failed",
  "ngrok-proxy-rejected",
  "ngrok-endpoint-busy",
  "ngrok-start-failed",
  "edge-unreachable",
  "quick-tunnel-tls-failed",
  "quick-tunnel-api-failed",
  "tunnel-exited",
  "named-route-mismatch",
  "public-health-unreachable",
  "public-health-timeout",
  "network-failed",
  "tunnel-retrying",
  "reconnecting",
  "license-renew-failed",
  "access-lost",
  "unknown"
];

var BridgeStartError = class extends Error {
  constructor(failureCode, message2, params) {
    super(message2);
    this.failureCode = failureCode;
    this.params = params;
    this.name = "BridgeStartError";
  }
  failureCode;
  params;
};

var KNOWN_CODES = new Set(BRIDGE_START_FAILURE_CODES);

var MAX_DETAIL_CHARS = 4e3;

var ACCESS_RULES = [
  // Fail-closed licensing: the license server could not be reached/verified, so Bridge is denied even with a cached license.
  ["license-renew-failed", /could not be verified with the license server/i],
  ["device-unavailable", /installation.*(?:revoked|limit)|device.*(?:revoked|limit)/i],
  ["signed-out", /sign in|signed out|unauthori[sz]ed|session.*expired|\b401\b/i]
];

var MESSAGE_RULES = [
  ["cancelled", /startup (?:was )?cancelled|cancelled by stop/i],
  ["cleanup-in-progress", /cleanup is in progress|Bridge is stopping; refusing|tunnel process is still active; wait for it to exit/i],
  ["disposed", /Bridge has been disposed/i],
  ["no-workspace", /Open a workspace folder|No workspace folder is open/i],
  ["ngrok-domain-missing", /ngrok reserved domain is required/i],
  ["ngrok-domain-invalid", /ngrok reserved domain (?:is not a valid hostname|must use HTTPS)|Enter only the ngrok reserved domain/i],
  ["named-config-missing", /Named Tunnel (?:Token|hostname) is not configured|Named Tunnel hostname is required/i],
  ["named-config-invalid", /Named Tunnel local port must be|Named Tunnel hostname (?:is not a valid hostname|must use HTTPS)|Enter only the cloudflare named tunnel hostname/i],
  ["named-token-invalid", /Named Tunnel authentication failed|invalid tunnel token|failed to parse token/i],
  ["cloudflared-install-failed", /cloudflared installation (?:failed|completed, but)|One-click cloudflared installation is currently supported/i],
  ["cloudflared-missing", /cloudflared was not found|cloudflare(?:-named)? tunnel client is not installed/i],
  ["ngrok-missing", /ngrok was not found|ngrok tunnel client is not installed/i],
  ["stale-tunnel", /tunnel \(pid \d+\) is still running and could not be stopped|did not exit after graceful termination and force kill/i],
  ["local-port-in-use", /local port \d+ is already in use|EADDRINUSE|address already in use/i],
  ["local-health-failed", /Bridge local HTTP (?:health check|port is unavailable)/i],
  ["ngrok-endpoint-busy", /ERR_NGROK_334\b|endpoint is already online|still held by another agent session/i],
  ["ngrok-proxy-rejected", /ERR_NGROK_9009\b/i],
  ["ngrok-config-invalid", /ngrok config check failed|ngrok tunnel configuration is invalid|ERR_NGROK_(?:105|107|4018)\b/i],
  ["ngrok-start-failed", /ngrok failed to establish|ERR_NGROK_\d+/i],
  ["named-route-mismatch", /Named Tunnel connected, but [\s\S]* could not reach Bridge/i],
  ["public-health-unreachable", /Public Bridge health endpoint unreachable/i],
  ["public-health-timeout", /Public Bridge health check timed out/i],
  ["quick-tunnel-tls-failed", /cloudflared Quick Tunnel API TLS certificate verification failed|failed to request quick tunnel[\s\S]*?(?:x509:|tls: failed to verify certificate|certificate signed by unknown authority|certificate is not valid for)/i],
  ["quick-tunnel-api-failed", /failed to request quick tunnel/i],
  ["edge-unreachable", /did not provide a trycloudflare\.com URL|did not register a Cloudflare edge connection|could not reach the Cloudflare edge|connectivity pre-check failed/i],
  ["tunnel-exited", /tunnel exited during startup|exited before the public Bridge health endpoint|exited unexpectedly|tunnel changed before health verification/i],
  ["network-failed", /timed? ?out|timeout|network|fetch failed|ENOTFOUND|ECONN|EAI_AGAIN|\bTLS\b|proxy|quic|unable to establish/i]
];

var PUBLIC_HEALTH_CODES = /* @__PURE__ */ new Set([
  "named-route-mismatch",
  "public-health-unreachable",
  "public-health-timeout"
]);

var PARAM_KEYS = {
  "local-port-in-use": ["port", "serviceUrl"],
  "stale-tunnel": ["pid"],
  "named-route-mismatch": ["domain", "serviceUrl"],
  "tunnel-retrying": ["attempt", "total", "seconds"],
  "reconnecting": ["attempt"]
};

function isBridgeStartFailureCode(value) {
  return typeof value === "string" && KNOWN_CODES.has(value);
}

function classifyBridgeStartFailure(error2, context) {
  const message2 = messageOf(error2);
  const record4 = error2 && typeof error2 === "object" ? error2 : {};
  const code = isBridgeStartFailureCode(record4.failureCode) ? record4.failureCode : context.stage === "access" ? firstMatch(ACCESS_RULES, message2) ?? "not-licensed" : record4.code === "EADDRINUSE" ? "local-port-in-use" : firstMatch(MESSAGE_RULES, message2) ?? "unknown";
  const params = pickParams(code, [
    asParams(record4.params),
    code === "local-port-in-use" ? portFromMessage(message2) : void 0,
    code === "stale-tunnel" ? pidFromMessage(message2) : void 0,
    context.params
  ]);
  const detail = redactBridgeFailureDetail(message2);
  return {
    code,
    stage: PUBLIC_HEALTH_CODES.has(code) ? "public-health" : context.stage,
    ...params ? { params } : {},
    ...detail ? { detail } : {},
    at: context.now ?? Date.now()
  };
}

function redactBridgeFailureDetail(text2) {
  return text2.replace(/(\/(?:mcp|healthz)\/)[^\s/?#"'<>)]+/gi, "$1[redacted]").replace(/\bBearer\s+[^\s,;]+/gi, "Bearer [redacted]").replace(/((?:auth[_-]?token|access[_-]?token|tunnel[_-]?token|token|password|secret|authorization)\s*[=:]\s*)[^\s,;&]+/gi, "$1[redacted]").replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, "$1[redacted]@").replace(/\beyJ[A-Za-z0-9_+/=-]{16,}(?:\.[A-Za-z0-9_+/=-]+){0,2}/g, "[redacted]").replace(/[A-Za-z0-9_+=-]{48,}/g, "[redacted]").slice(0, MAX_DETAIL_CHARS);
}

function messageOf(error2) {
  if (error2 instanceof Error) return error2.message;
  const message2 = error2 && typeof error2 === "object" ? error2.message : void 0;
  return typeof message2 === "string" ? message2 : String(error2 ?? "");
}

function firstMatch(rules, message2) {
  return rules.find(([, pattern]) => pattern.test(message2))?.[0];
}

function portFromMessage(message2) {
  const match = /\bport (\d{2,5})\b/i.exec(message2);
  return match ? { port: Number(match[1]) } : void 0;
}

function pidFromMessage(message2) {
  const match = /\(pid (\d+)\)/i.exec(message2);
  return match ? { pid: Number(match[1]) } : void 0;
}

function asParams(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}

function pickParams(code, sources) {
  const keys = PARAM_KEYS[code];
  if (!keys) return void 0;
  const picked = {};
  for (const key of keys) {
    for (const source of sources) {
      const value = source?.[key];
      if (typeof value === "string" && value || typeof value === "number" && Number.isFinite(value)) {
        picked[key] = value;
        break;
      }
    }
  }
  return Object.keys(picked).length ? picked : void 0;
}
export { isBridgeStartFailureCode, classifyBridgeStartFailure, redactBridgeFailureDetail, messageOf, firstMatch, portFromMessage, pidFromMessage, asParams, pickParams, BRIDGE_START_FAILURE_CODES, BridgeStartError, KNOWN_CODES, MAX_DETAIL_CHARS, ACCESS_RULES, MESSAGE_RULES, PUBLIC_HEALTH_CODES, PARAM_KEYS };
