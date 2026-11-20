import { createAssistantSourceRegistry } from "./assistant-source-registry.mjs";
import { SHADOW_CHECKPOINT_TOOL } from "./shadow-checkpoints.mjs";
import { SPEC_MODE_TOOL } from "./spec-mode.mjs";
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-server.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { createWindowsBridgeRouteIdentity } from "./module-0116.mjs";
import { ExternalMcpRegistry } from "./module-0154.mjs";
import { BridgeToolDispatcher } from "./module-0143.mjs";
import { importGlobalSkillWithPrompt, listInstalledSkillsForAgent } from "./module-0024.mjs";
import { appendBundledLeanrea, bundledLeanreaReadRoot } from './bundled-leanrea.mjs';
import { TunnelProxyManager } from './tunnel-proxy.mjs';
import { ReaBackendTools } from './rea-integration.mjs';
import { hasExecutableOnPath, runProvisionCommand } from "./module-0160.mjs";
import { BRIDGE_SERVER_INSTRUCTIONS, BRIDGE_TOOL_CONCURRENCY_SETTING, BRIDGE_TOOL_DEFINITIONS, CHAT_BRIDGE_CONTROL_TOOL_NAMES, pickOcRecommendedAnswer, readOcChatPermissionSettings, resolveBridgeToolConcurrency } from "./module-0140.mjs";
import { BridgeMcpTransport } from "./module-0119.mjs";
import { customToolsFingerprint, listEnabledCustomTools, loadCustomTools, toStatusEntries } from "./module-0053.mjs";
import { diagnoseGlobalSkills } from "./module-0027.mjs";
import { diagnoseSkillTools, resolveSkillDir } from "./module-0028.mjs";
import { globalSkillsDirectory, isGlobalSkillDirectory } from "./module-0025.mjs";
import { generateSkillRunner } from "./module-0045.mjs";
import { deleteCustomTool, toggleCustomTool } from "./module-0057.mjs";
import { CUSTOM_TOOLS_DIR_NAME } from "./module-0029.mjs";
import { BridgeStartError, classifyBridgeStartFailure } from "./module-0157.mjs";
import { acquireBridgeTunnelLease, bridgeTunnelLeaseResources, clearTunnelOwnership, isBridgeTunnelLeaseConflict, reclaimStaleTunnelOwner, recordTunnelOwnership } from "./module-0118.mjs";
import { showBridgeProviderFallbackNotice } from "./module-0113.mjs";
import { fetchWithExtensionHostFallbacks, resolveExtensionHostProxy } from "./module-0106.mjs";
import { CLOUDFLARE_EDGE_ROUTE_SETTING, QUICK_TUNNEL_CONFIG_NAME, QUICK_TUNNEL_CONFIG_TEXT, QUICK_TUNNEL_EDGE_TIMEOUT_MS, chooseQuickTunnelRoute, normalizeEdgeRouteSetting, quickTunnelArgs, quickTunnelEdgeTimeoutMs } from "./module-0158.mjs";
import { startEdgeRelay } from "./module-0159.mjs";
import { isNgrokEndpointBusy, isNonRetryableNgrokFailure, mayRetryNgrokReplacement, ngrokSessionStatusLine, ngrokStartFailure } from "./module-0115.mjs";


// extensions/opencode/src/bridge-server.ts
init_define_OPENCODE_BUILD_INFO();


// extensions/opencode/src/bridge-server.ts
var import_node_child_process7 = require("node:child_process");

var import_node_path27 = __toESM(require("node:path"));

var import_node_util2 = require("node:util");

var vscode9 = __toESM(require("vscode"));


// extensions/opencode/src/bridge-server.ts
var import_promises12 = require("node:fs/promises");

var import_node_os7 = __toESM(require("node:os"));


// extensions/opencode/src/bridge-server.ts
// src/bridge-cloudflare-connection.ts

function cloudflaredTunnelConnectionRegistered(output2) {
  return /(?:^|\s)registered tunnel connection\b|\bconnection registered\b/i.test(output2);
}
function cloudflareConnectionEvent(line) {
  let message2 = line;
  let index;
  if (line.trimStart().startsWith("{")) {
    try {
      const record4 = JSON.parse(line);
      if (!record4 || typeof record4 !== "object") return void 0;
      const text2 = record4.message ?? record4.msg;
      if (typeof text2 !== "string") return void 0;
      message2 = typeof record4.error === "string" ? `${text2} error=${record4.error}` : text2;
      index = record4.connIndex;
    } catch {
      return void 0;
    }
  } else {
    const match = line.match(/\bconnIndex=(\d+)\b/i);
    index = match ? Number(match[1]) : void 0;
  }
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 255) return void 0;
  if (cloudflaredTunnelConnectionRegistered(message2)) return { type: "registered", index };
  // Quick Tunnel removed on Cloudflare's side (seen 2026-11-10 10:50 CST after a network blip): cloudflared keeps
  // retrying "Register tunnel error from server side error=Unauthorized: Tunnel not found" forever and never exits.
  // The old trycloudflare address cannot come back, so this is a distinct event that requires a new tunnel.
  if (/\btunnel not found\b/i.test(message2)) return { type: "gone", index, reason: "tunnel-not-found" };
  // Named Tunnel (token) whose credentials stopped being accepted while cloudflared keeps running: same treatment.
  if (/\b(?:unauthorized|invalid tunnel (?:token|secret|credentials)|failed to (?:parse|validate) token|authentication failed)\b/i.test(message2) && /\b(?:register tunnel error|error=|failed to)/i.test(message2)) return { type: "gone", index, reason: "unauthorized" };
  if (/\b(?:unregistered tunnel connection|connection unregistered|serve tunnel error|failed to serve (?:quic|http2) connection|connection terminated)\b/i.test(message2)) {
    return { type: "disconnected", index };
  }
  return void 0;
}
// extensions/opencode/src/bridge-cloudflare-recovery.ts
// Waiting for cloudflared to re-register is only useful while its tunnel still exists. "gone" restarts at once; a
// disconnect with no registration within CLOUDFLARE_RECOVERY_DEADLINE_MS also restarts (options.restart/schedule).
var CLOUDFLARE_RECOVERY_DEADLINE_MS = 9e4;
function createCloudflareRecoveryObserver(options) {
  const connections = /* @__PURE__ */ new Set();
  let disposed = false;
  let cancelDeadline;
  const clearDeadline = () => {
    cancelDeadline?.();
    cancelDeadline = void 0;
  };
  const restart = (reason) => {
    if (disposed || !options.restart || !options.isActive()) return;
    disposed = true;
    clearDeadline();
    connections.clear();
    options.restart(reason);
  };
  return {
    isConnected() {
      return !disposed && connections.size > 0;
    },
    observe(line) {
      if (disposed || !options.isActive()) return;
      const event = cloudflareConnectionEvent(line);
      if (!event) return;
      if (event.type === "registered") {
        connections.add(event.index);
        clearDeadline();
        if (options.isReconnecting()) options.recovered();
      } else if (event.type === "gone") {
        connections.delete(event.index);
        if (options.isRunning() || options.isReconnecting()) restart(event.reason ?? "tunnel-not-found");
      } else {
        const removed = connections.delete(event.index);
        if (removed && connections.size === 0 && options.isRunning()) {
          options.disconnected();
          if (options.schedule && options.restart && !cancelDeadline) {
            cancelDeadline = options.schedule(() => {
              cancelDeadline = void 0;
              if (!disposed && connections.size === 0 && options.isReconnecting()) restart("deadline");
            }, options.deadlineMs ?? CLOUDFLARE_RECOVERY_DEADLINE_MS);
          }
        }
      }
    },
    dispose() {
      disposed = true;
      clearDeadline();
      connections.clear();
    }
  };
}
// extensions/opencode/src/bridge-ngrok-recovery.ts

var NGROK_RECOVERY_DEADLINE_MS = 6e4;
var NGROK_RECOVERY_STABLE_MS = 3e4;
// A running ngrok agent can report session errors that never heal by waiting (revoked/invalid authtoken, the reserved
// endpoint taken by another agent, account limits). Returns the ERR_NGROK code (or a short label), else undefined.
function ngrokFatalSessionError(line) {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return void 0;
  }
  if (!event || typeof event !== "object") return void 0;
  const level = String(event.lvl ?? event.level ?? "").toLowerCase();
  const text2 = [event.msg, event.err, event.error].filter((value) => typeof value === "string").join(" ");
  if (!text2 || !/^(?:eror|error|crit|fatal)$/.test(level) && !/ERR_NGROK_/i.test(text2)) return void 0;
  const code = text2.match(/ERR_NGROK_(?:105|107|108|121|334|4018|3820|9009)\b/i)?.[0].toUpperCase();
  if (code) return code;
  if (/\b(?:authentication failed|invalid authtoken|authtoken[^"]{0,64}(?:revoked|invalid)|endpoint\b[^"]{0,256}\bis already online)\b/i.test(text2)) return "fatal-session-error";
  return void 0;
}
function createNgrokRecoveryObserver(options) {
  let confirmed = false;
  let disposed = false;
  let epoch = 0;
  let probing = false;
  let cancelRetry;
  let cancelDeadline;
  let cancelStable;
  let deadlineExpired = false;
  const cancel = () => {
    epoch += 1;
    cancelRetry?.();
    cancelRetry = void 0;
  };
  const active = () => !disposed && confirmed && options.isActive() && options.isReconnecting();
  const resetBudget = () => {
    cancelDeadline?.();
    cancelDeadline = void 0;
    cancelStable?.();
    cancelStable = void 0;
    deadlineExpired = false;
  };
  const dispose = () => {
    disposed = true;
    cancel();
    resetBudget();
  };
  const expire = () => {
    cancelDeadline = void 0;
    deadlineExpired = true;
    if (!active()) return;
    dispose();
    options.restart("deadline");
  };
  const armDeadline = () => {
    if (deadlineExpired) {
      expire();
      return;
    }
    if (!cancelDeadline) cancelDeadline = options.schedule(expire, NGROK_RECOVERY_DEADLINE_MS);
  };
  const recover = () => {
    cancel();
    options.recovered();
    cancelStable?.();
    cancelStable = options.schedule(() => {
      cancelStable = void 0;
      if (!disposed && options.isActive() && options.isRunning() && !options.isReconnecting()) resetBudget();
    }, NGROK_RECOVERY_STABLE_MS);
  };
  const retry = () => {
    cancelRetry?.();
    cancelRetry = options.schedule(() => {
      cancelRetry = void 0;
      void probe();
    }, 5e3);
  };
  const probe = async () => {
    if (probing || !active()) return;
    cancelRetry?.();
    cancelRetry = void 0;
    const currentEpoch = epoch;
    probing = true;
    let online = false;
    try {
      online = await options.probe();
    } catch {
    } finally {
      probing = false;
    }
    if (!active()) return;
    if (online && currentEpoch === epoch) {
      recover();
      return;
    }
    retry();
  };
  return {
    observe(line) {
      if (disposed || !options.isActive()) return;
      const fatal = ngrokFatalSessionError(line);
      if (fatal && (options.isRunning() || options.isReconnecting())) {
        dispose();
        options.restart(`fatal:${fatal}`);
        return;
      }
      const signal = ngrokSessionStatusLine(line, options.domain);
      if (signal === "online") {
        confirmed = true;
        if (options.isReconnecting()) recover();
      } else if (signal === "offline") {
        cancel();
        cancelStable?.();
        cancelStable = void 0;
        if (options.isRunning() && !options.isReconnecting()) options.disconnected();
        if (active()) {
          armDeadline();
          if (active() && !probing) retry();
        }
      } else if (signal === "session-started") {
        void probe();
      }
    },
    dispose
  };
}
// extensions/opencode/src/bridge-tunnel-recovery.ts
// Recovery shared by every Bridge tunnel mode (cloudflare = Quick Tunnel, cloudflare-named = token Named Tunnel,
// ngrok = reserved domain): fatal error -> restart now; no re-register before a deadline -> restart; restart = stop
// only the owned tunnel process and re-enter beginTunnelRecovery (capped backoff); the local MCP server and its
// sessions never stop. Named Tunnel and ngrok keep their fixed hostname (same token / same --url); only the Quick
// Tunnel gets a new address.
var TUNNEL_RECOVERY_BACKOFF_MS = [1e3, 2e3, 4e3, 8e3, 15e3, 3e4, 6e4];
var TUNNEL_RECOVERY_MAX_DELAY_MS = 6e4;
var QUICK_TUNNEL_RECOVERY_RETRY_MS = 6e4;
var TUNNEL_RECOVERY_AUTH_FAILURE_LIMIT = 3;
function tunnelHasFixedAddress(provider) {
  return provider === "ngrok" || provider === "cloudflare-named" || provider === "tailscale";
}
var QUICK_TUNNEL_RATE_LIMIT_COOLDOWN_MS = 15 * 60e3;
var QUICK_TUNNEL_SLOW_RETRY_MS = 5 * 60e3;
var QUICK_TUNNEL_FAST_RETRY_ATTEMPTS = 10;
var QUICK_TUNNEL_RATE_LIMIT_PATTERN = /status 429|error code: 1015|Too Many Requests/i;
function tunnelRecoveryDelayMs(provider, attempt, rateLimited = false) {
  // trycloudflare.com answered 429 / error 1015: every further request extends the ban.
  if (rateLimited) return QUICK_TUNNEL_RATE_LIMIT_COOLDOWN_MS;
  if (attempt <= 0) return TUNNEL_RECOVERY_BACKOFF_MS[0];
  // trycloudflare.com rate-limits new Quick Tunnels: one minute apart at first, then five
  // minutes during a long outage (a whole morning at one per minute tripped error 1015).
  if (provider === "cloudflare") return attempt < QUICK_TUNNEL_FAST_RETRY_ATTEMPTS ? QUICK_TUNNEL_RECOVERY_RETRY_MS : QUICK_TUNNEL_SLOW_RETRY_MS;
  return Math.min(TUNNEL_RECOVERY_BACKOFF_MS[Math.min(attempt, TUNNEL_RECOVERY_BACKOFF_MS.length - 1)], TUNNEL_RECOVERY_MAX_DELAY_MS);
}
function namedTunnelAuthFailure(error2) {
  const message2 = error2 instanceof Error ? error2.message : String(error2 ?? "");
  return /Named Tunnel authentication failed|invalid tunnel token|failed to parse token/i.test(message2);
}
/** Whether the reconnect loop should give up after `failedAttempt` failures (only for failures retrying cannot fix). */
function tunnelRecoveryShouldStop(provider, error2, failedAttempt) {
  if (provider === "ngrok") return isNonRetryableNgrokFailure(error2) && !mayRetryNgrokReplacement(error2, failedAttempt);
  if (provider === "cloudflare-named") return namedTunnelAuthFailure(error2) && failedAttempt >= TUNNEL_RECOVERY_AUTH_FAILURE_LIMIT;
  return false;
}
function tunnelRestartMessage(provider, reason) {
  if (provider === "tailscale") return `Tailscale Funnel stopped (${String(reason ?? "unknown")}); restarting tailscale funnel for the same ts.net address.`;
  const where = provider === "cloudflare" ? "for a new Quick Tunnel address" : provider === "cloudflare-named" ? "with the same Named Tunnel token and hostname" : "for the same reserved ngrok domain";
  const client = provider === "ngrok" ? "the owned ngrok agent" : "cloudflared";
  if (reason === "tunnel-not-found") return provider === "cloudflare" ? `Cloudflare reports this Quick Tunnel no longer exists (Tunnel not found); its address cannot recover. Restarting cloudflared ${where}.` : `Cloudflare reports this Named Tunnel was not found; restarting cloudflared ${where}. If it keeps failing, check the tunnel still exists in the Cloudflare dashboard.`;
  if (reason === "unauthorized") return `Cloudflare rejected the tunnel connector (Unauthorized); restarting cloudflared ${where}.`;
  if (typeof reason === "string" && reason.startsWith("fatal:")) return `ngrok reported a session error that does not heal by waiting (${reason.slice(6)}); restarting ${client} ${where}.`;
  if (provider === "ngrok") return "ngrok did not recover stably within 60 seconds; cleaning up the owned agent before restarting.";
  return `Cloudflare edge connections did not re-register within ${CLOUDFLARE_RECOVERY_DEADLINE_MS / 1e3} seconds; restarting cloudflared ${where}.`;
}
function tunnelRecoveredMessage(provider, publicUrl, previousDomain, domain) {
  if (provider === "cloudflare") return `[bridge] cloudflare tunnel recovered: ${publicUrl} (new Quick Tunnel address; remote MCP clients must use this address and initialize again)`;
  const same = !previousDomain || previousDomain === domain;
  return `[bridge] ${provider} tunnel recovered: ${publicUrl} (${same ? "fixed address unchanged; MCP clients reconnect to the same URL" : "WARNING: fixed address changed"})`;
}
/** Stop only the owned tunnel process and hand over to beginTunnelRecovery. `server` is the BridgeManager. */
function restartOwnedTunnel(server, generation, provider, reason) {
  server.lastError = tunnelRestartMessage(provider, reason);
  server.state = "starting";
  if (!tunnelHasFixedAddress(provider)) server.domain = "";
  server.ngrokSessionOffline = false;
  server.cloudflareSessionOffline = false;
  server.revision += 1;
  server.logDuringShutdown(`[bridge] ${server.lastError}`);
  const current = () => generation === server.tunnelGeneration && !server.stoppingResources && !server.disposed;
  return Promise.resolve().then(() => server.stopTunnelProcess()).then(() => {
    if (current() && server.mcpTransport.isListening()) server.beginTunnelRecovery();
  }).catch((error2) => {
    if (!current()) return;
    server.state = "error";
    server.lastError = error2 instanceof Error ? error2.message : String(error2);
    server.recordStartFailure(error2, "reconnect");
    server.revision += 1;
  });
}
// src/device-file-roots.ts

var import_node_fs21 = require("node:fs");
function deviceFileRoots(platform = process.platform, rootExists = import_node_fs21.existsSync) {
  if (platform !== "win32") return ["/"];
  const roots2 = [];
  for (let code = 65; code <= 90; code++) {
    const root = `${String.fromCharCode(code)}:\\`;
    if (rootExists(root)) roots2.push(root);
  }
  return roots2;
}

var execFileAsync2 = (0, import_node_util2.promisify)(import_node_child_process7.execFile);
var NGROK_DOMAIN_SETTING = "bridge.ngrokDomain";
var NGROK_DOMAIN_STATE_KEY = "opencode.bridge.ngrokDomain";
var CLOUDFLARE_NAMED_DOMAIN_SETTING = "bridge.cloudflareNamedDomain";
var CLOUDFLARE_NAMED_DOMAIN_STATE_KEY = "opencode.bridge.cloudflareNamedDomain";
var CLOUDFLARE_NAMED_TOKEN_SECRET = "opencode.bridge.cloudflareNamedTunnelToken";
var CLOUDFLARE_NAMED_LOCAL_PORT_SETTING = "bridge.cloudflareNamedLocalPort";
var TUNNEL_PROVIDER_SETTING = "bridge.tunnelProvider";
var TAILSCALE_PATH_SETTING = "bridge.tailscalePath";
var TAILSCALE_SOCKET_SETTING = "bridge.tailscaleSocket";
var TAILSCALE_DOMAIN_STATE_KEY = "opencode.bridge.tailscaleDomain";
var TAILSCALE_PORTABLE_SOCKET = "\\\\.\\pipe\\tailscale-ai";
var CUSTOM_INSTRUCTIONS_SETTING = "bridge.customInstructions";
var BRIDGE_SKILLS_ENABLED_SETTING = "bridge.skillsEnabled";
var BRIDGE_WORKSPACE_SCOPE_SETTING = "bridge.workspaceScope";
var NGROK_USE_HTTP_PROXY_SETTING = "bridge.ngrokUseHttpProxy";
var DEFAULT_PUBLIC_HEALTH_STARTUP_TIMEOUT_MS = 2e4;
var PUBLIC_HEALTH_STARTUP_TIMEOUT_SETTING = "bridge.startupTimeoutMs";
var PUBLIC_HEALTH_REQUEST_TIMEOUT_MS = 5e3;
var PUBLIC_HEALTH_POLL_INTERVAL_MS = 750;
var PUBLIC_HEALTH_DETERMINISTIC_FAILURE_LIMIT = 3;
var TUNNEL_RESTART_BACKOFF_MS = [1e3, 2e3, 4e3, 8e3, 15e3];
var TUNNEL_TERMINATE_GRACE_MS = 1e3;
var TUNNEL_KILL_GRACE_MS = 1e3;
var NGROK_AGENT_API_BASE_URL = "http://127.0.0.1:4040";
var NGROK_AGENT_API_TIMEOUT_MS = 2e3;
var CLOUDFLARED_WINGET_PACKAGE = "Cloudflare.cloudflared";
var DEFAULT_CLOUDFLARE_NAMED_LOCAL_PORT = 48271;
function publicHealthFailure(error2) {
  const messages2 = [];
  const codes2 = [];
  let current = error2;
  for (let depth = 0; depth < 4 && current !== void 0 && current !== null; depth++) {
    if (typeof current === "object") {
      const record4 = current;
      if (typeof record4.code === "string") codes2.push(record4.code);
      if (typeof record4.message === "string") messages2.push(record4.message);
      current = record4.cause;
    } else {
      messages2.push(String(current));
      current = void 0;
    }
  }
  const reason = messages2.join(": ") || (error2 instanceof Error ? error2.message : String(error2));
  const detail = `${codes2.join(",")} ${reason}`.toLowerCase();
  const deterministic = codes2.some((code) => code === "ENOTFOUND" || code === "EAI_AGAIN" || code === "ECONNREFUSED" || code === "ECONNRESET" || code === "EPIPE") || detail.includes("certificate") || detail.includes("self-signed") || detail.includes("tls") || detail.includes("ssl") || detail.includes("wrong version number");
  return { reason, code: codes2.length ? codes2[0] : void 0, deterministic };
}
function cloudflaredEdgeFailureHint(output2, proxyRoute = false) {
  const lower = output2.toLowerCase();
  const directDnsTimeout = /(?:dnsquery|dns query|lookup)[^\r\n]*(?:timeout|timed out|i\/o timeout)|(?:timeout|timed out)[^\r\n]*argotunnel\.com/i.test(output2);
  const dnsHint = proxyRoute ? " Proxy route: cloudflared also reported a DNS lookup timeout; check DNS separately." : " Direct route: Cloudflare Tunnel DNS lookup timed out.";
  const proxyTlsEof = /(?:proxy accepted connect|http proxy accepted connect)[^\r\n]*(?:closed|eof)|tls handshake with edge error[^\r\n]*\beof\b/i.test(output2);
  if (proxyTlsEof) {
    return `${directDnsTimeout ? dnsHint : ""} Proxy route: the HTTP proxy accepted CONNECT on port 7844, but the TLS connection to the Cloudflare edge closed before registration. CONNECT success and a temporary URL do not mean the tunnel is online. Check the proxy's 7844 forwarding/TLS handling and the edge network path; do not disable TLS verification.`;
  }
  if (directDnsTimeout) {
    return `${dnsHint} Check the resolver and the edge DNS records; also verify outbound port 7844 separately. A temporary URL is not an edge connection.`;
  }
  const blocked = ["unable to establish", "dial tcp", "connection refused", "connection reset", "no such host", "i/o timeout", "context deadline", "quic"].some((marker) => lower.includes(marker));
  return blocked ? " cloudflared could not register a Cloudflare edge connection. Check DNS and outbound port 7844 on the selected direct or HTTP proxy route; a temporary URL alone is not an online tunnel." : "";
}
function bridgeWorkspaceScopeInstructions(scope) {
  if (scope === "workspace") {
    return "Default operating scope: project files in the folder(s) currently open in OpenCode on this local Windows host. That is the default target, not a hard ban: inspect another local path on this same PC only when the user explicitly identifies it, usually with run_command for read-only discovery first. Do not scan the whole device by default. In Project files mode, file tools remain inside opened workspaces and the global Skill directory. For another path, use an explicit absolute run_command cwd within the authorized task scope. To use file tools for an external directory, add it to the workspace or enable Entire device locally in Bridge settings.";
  }
  return "Default operating scope: this entire local Windows device. In Entire device mode, read_files, read_image, find_files, search_files, list_directory and apply_patch may directly use absolute paths on this host's available local drive letters, subject to OS permissions and path validation. The local user enabled this mode in Bridge settings; no additional local confirmation is needed for task-authorized file operations. Prioritize opened projects when relevant and limit actions to the requested task. Locate uncertain targets with read-only discovery first. Language-service tools lsp and get_diagnostics still use opened workspace folders; add a folder to the workspace when those tools are needed. For shell commands outside the workspace, specify an absolute run_command cwd.";
}
function normalizeHttpsHostname(value, label) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url2;
  try {
    url2 = new URL(withScheme);
  } catch {
    throw new Error(`${label} is not a valid hostname.`);
  }
  if (url2.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  if (url2.pathname !== "/" || url2.search || url2.hash || url2.username || url2.password || url2.port) {
    throw new Error(`Enter only the ${label.toLowerCase()}, without a path, query, port, username, or password.`);
  }
  return url2.hostname.toLowerCase();
}
function normalizeNgrokDomain(value) {
  return normalizeHttpsHostname(value, "ngrok reserved domain");
}
function normalizeCloudflareNamedDomain(value) {
  return normalizeHttpsHostname(value, "Cloudflare Named Tunnel hostname");
}
function normalizeNamedTunnelLocalPort(value) {
  if (!Number.isInteger(value) || value < 1024 || value > 65535) {
    throw new Error("Cloudflare Named Tunnel local port must be an integer from 1024 to 65535.");
  }
  return value;
}
function cancellationFromAbortSignal(signal) {
  if (!signal) return { token: void 0, dispose: () => void 0 };
  const source = new vscode9.CancellationTokenSource();
  const listener = () => source.cancel();
  if (signal.aborted) source.cancel();
  else signal.addEventListener("abort", listener, { once: true });
  return {
    token: source.token,
    dispose: () => {
      signal.removeEventListener("abort", listener);
      source.dispose();
    }
  };
}
var TAILSCALED_PROXY_STATE_KEY = "opencode.bridge.tailscaledProxySignature";
var BridgeManager = class {
  constructor(context, output2, ideToolBroker, externalCatalog, automation) {
    this.context = context;
    this.output = output2;
    this.ideToolBroker = ideToolBroker;
    this.externalCatalog = externalCatalog;
    this.automation = automation;
    this.assistantSources = createAssistantSourceRegistry(context,{enabled:()=>automation?.isCollaborationEnabled()===true,currentContext:()=>this.assistantPublisherContext,changed:()=>automation?.emit('assistant-sources')});
    automation?.setSourceIdentityProvider(owner=>this.assistantSources.sourceForOwner(owner),id=>this.assistantSources.sourceById(id));
    context.subscriptions.push({dispose:()=>this.assistantSources.dispose()});
    this.routeIdentity = createWindowsBridgeRouteIdentity(context);
    // tunnel-proxy-step01: 隧道代理（内置 mihomo，只给 cloudflared / tailscaled 用）。
    this.tunnelProxy = new TunnelProxyManager({
      corePath: import_node_path27.default.join(context.extensionPath, "proxy-core", process.platform === "win32" ? "mihomo.exe" : "mihomo"),
      storagePath: import_node_path27.default.join(context.globalStorageUri.fsPath, "tunnel-proxy"),
      log: (message2) => this.output.appendLine(message2),
      resolveSystemProxy: () => this.systemTunnelProxyUrl()
    });
    if (this.tunnelProxy.tunnelProxyMode() === "node") void this.tunnelProxy.ensureForTunnels().catch((error2) => this.output.appendLine(`[tunnel-proxy] ${error2 instanceof Error ? error2.message : String(error2)}`));
    this.tunnelProxyHealthTimer = setInterval(() => {
      if (this.tunnelProxy.tunnelProxyMode() === "node") void this.tunnelProxy.ensureForTunnels().catch(() => void 0);
    }, 30e3);
    this.tunnelProxyHealthTimer.unref?.();
    context.subscriptions.push({ dispose: () => { clearInterval(this.tunnelProxyHealthTimer); void this.tunnelProxy.dispose(); } });
    this.nativeRea = new ReaBackendTools({extensionPath:context.extensionPath,storagePath:context.globalStorageUri.fsPath,trusted:()=>vscode9.workspace.isTrusted,log:message=>this.output.appendLine(message)});
    context.subscriptions.push({dispose:()=>{void this.nativeRea.dispose().catch(()=>this.output.appendLine('[rea-native] cleanup incomplete during extension disposal'));}});
    if (externalCatalog) {
      this.externalRegistry = new ExternalMcpRegistry({
        trusted: () => vscode9.workspace.isTrusted,
        revision: () => externalCatalog.snapshot().revision,
        load: async () => {
          const configured = externalCatalog.snapshot().servers.filter((server) => server.enabled && server.bridgeEnabled);
          const results = await Promise.allSettled(configured.map((server) => externalCatalog.resolve(server)));
          return results.flatMap((result, index) => {
            if (result.status === "fulfilled") return [result.value];
            this.output.appendLine(`[external-mcp] ${configured[index].id}: missing or invalid secret`);
            return [];
          });
        },
        onChanged: () => this.mcpTransport?.notifyToolsChanged(),
        log: (message2) => this.output.appendLine(message2),
        // Portable uv/uvx ship under the extension's runtime/bin; appended to managed stdio PATH so `uvx` servers work out of the box.
        bundledBinDir: context.asAbsolutePath(import_node_path27.default.join("runtime", "bin"))
      });
      this.unsubscribeExternalCatalog = externalCatalog.onDidChange(() => {
        void this.externalRegistry?.stopAll();
      });
      let trusted = vscode9.workspace.isTrusted;
      this.externalTrustTimer = setInterval(() => {
        if (trusted !== vscode9.workspace.isTrusted) {
          trusted = vscode9.workspace.isTrusted;
          if (!trusted) void this.nativeRea.closeAll().catch(()=>this.output.appendLine('[rea-native] cleanup incomplete after trust change'));
          this.mcpTransport?.notifyToolsChanged();
          void this.externalRegistry?.stopAll();
          if (trusted) void this.refreshExternalMcp();
        }
      }, 1e3);
      this.externalTrustTimer.unref?.();
    }
    this.dispatcher = new BridgeToolDispatcher({
      automation,
      // 建议7：影子 git 检查点（默认关闭）。
      checkpointsEnabled: () => this.checkpointsEnabled(),
      // 建议12：Spec 模式（默认关闭）。
      specModeEnabled: () => this.specModeEnabled(),
      invokeIdeTool: async (name, args, signal, ownerId) => {
        const cancellation = cancellationFromAbortSignal(signal);
        try {
          const roots = name === "list_directory" ? this.fileToolRoots(name) : undefined;
          const scopedRoots = roots ? automation?.collaboration?.fileToolRoots(ownerId, roots) || roots : undefined;
          return await this.ideToolBroker.invokeDirect(name, args, cancellation.token, ownerId, scopedRoots);
        } finally {
          cancellation.dispose();
        }
      },
      workspaceRoots: () => this.workspaceRoots(),
      fileToolRoots: (toolName) => this.fileToolRoots(toolName),
      isWorkspaceTrusted: () => vscode9.workspace.isTrusted,
      skillsEnabled: () => this.skillsEnabled(),
      listSkills: () => {
        let listing, sharedListingFailed = false;
        try {
          listing = listInstalledSkillsForAgent();
        } catch {
          sharedListingFailed = true;
          listing = { directory: "", enabled: this.skillsEnabled(), skills: [] };
        }
        const result = appendBundledLeanrea(listing, context.extensionPath);
        if (sharedListingFailed) for (const skill of result.skills) if (skill.scope === "bundled") {
          skill.reason = "共享 Skill 清单读取失败；无法判断用户同名 Skill 是否存在。";
          skill.reasonCode = "SHARED_SKILL_LIST_FAILED";
        }
        return result;
      },
      externalMcp: this.externalRegistry,
      nativeRea: this.nativeRea,
      configureMcp: externalCatalog ? {
        catalog: externalCatalog,
        locations: () => externalCatalog.locations(),
        runtime: {
          platform: process.platform,
          which: (command) => hasExecutableOnPath(command, context.asAbsolutePath(import_node_path27.default.join("runtime", "bin"))),
          install: (command, args, timeoutMs) => runProvisionCommand(
            command,
            args,
            timeoutMs,
            (message2) => this.output.appendLine(message2)
          )
        },
        refresh: (firstConnect) => this.refreshExternalMcp(firstConnect),
        health: () => this.externalRegistry?.snapshot() ?? []
      } : void 0,
      log: (message2) => this.output.appendLine(message2)
    }, resolveBridgeToolConcurrency(vscode9.workspace.getConfiguration("opencode").get(BRIDGE_TOOL_CONCURRENCY_SETTING)));
    // Tasks are scoped to the current OpenCode session; startup clears legacy persisted task files.
    try {
      this.dispatcher.taskStore.configurePersistence(
        context.globalStorageUri.fsPath,
        vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath
      );
    } catch (error) {
      this.output.appendLine(`[bridge] task startup reset warning: ${error.message}`);
    }
    this.mcpTransport = new BridgeMcpTransport({
      resolveAssistantSource: request => this.assistantSources.resolveRequest(request, this.getStatus().publicUrl),
      recordAssistantConnection: binding => this.assistantSources.recordConnection(binding).catch(() => this.output.appendLine('[bridge] Connection receipt unavailable; no inferred reconnect reminder.')),
      bindAssistantSource: (owner,binding) => this.assistantSources.bindOwner(owner,binding),
      dispatchToolCall: (name, args, extra) => this.dispatcher.dispatch(name, args, extra),
      // 建议11：bridge_ask_user 同时走 MCP elicitation（默认关闭）。
      elicitationEnabled: () => vscode9.workspace.getConfiguration("opencode").get("bridge.elicitation", false) === true,
      beginRemoteConversation: (ownerId) => this.dispatcher.beginRemoteConversation(ownerId),
      endRemoteConversation: (ownerId) => this.dispatcher.endRemoteConversation(ownerId),
      releaseCommandOwner: (ownerId) => { this.ideToolBroker.releaseCommandOwner(ownerId); void this.nativeRea.closeOwner(ownerId).catch(()=>this.output.appendLine('[rea-native] caller cleanup incomplete; ownership retained')); },
      serverInstructions: (ownerId) => this.composeServerInstructions(ownerId),
      log: (message2) => this.output.appendLine(message2),
      diag: (message2) => this.output.appendLine("[bridge-mcp] " + message2),
      listCustomTools: () => {
        try {
          return listEnabledCustomTools(this.customToolRoots(), (message2) => this.output.appendLine(message2), { skillsEnabled: this.skillsEnabled() });
        } catch {
          return [];
        }
      },
      listBuiltinTools: () => this.availableBuiltinToolDefinitions(),
      listExternalTools: (reserved) => this.externalRegistry?.listTools(reserved) ?? Promise.resolve([])
    });
    automation?.setMcpConnectionProvider(() => this.mcpTransport.currentConnections());
    const unsubscribeAutomation = automation?.onDidChange(kind => {
      if (kind === 'rules' || kind === 'roles' || kind === 'collaboration-switch') this.mcpTransport.notifyToolsChanged();
    });
    if (unsubscribeAutomation) context.subscriptions.push({ dispose: unsubscribeAutomation });
    // Push a notifications/message to the recipient's stateful MCP sessions when a collaboration message arrives.
    const unsubscribeInbox = automation?.onMessage?.((message) => {
      try { this.mcpTransport.notifyInbox?.(message, (owner) => automation.agentIdFor(owner)); } catch {}
    });
    if (unsubscribeInbox) context.subscriptions.push({ dispose: unsubscribeInbox });
  }
  context;
  output;
  ideToolBroker;
  externalCatalog;
  state = "stopped";
  tunnelProvider = "cloudflare";
  domain = "";
  configuredDomain = "";
  configuredNamedDomain = "";
  namedTunnelToken = "";
  namedTunnelLocalPort = DEFAULT_CLOUDFLARE_NAMED_LOCAL_PORT;
  routeIdentity;
  get routeToken() {
    return this.routeIdentity.value;
  }
  tunnelProcess;
  lastError;
  /** 最近一次启动失败或自动停止的结构化原因（R2 §8.3），供 Bridge 页显示中文说明；lastError 保留技术原文。 */
  startFailure;
  tunnelInstalled;
  tunnelVersion;
  tunnelConfigValid;
  cloudflaredExecutable = "cloudflared";
  // Quick Tunnel T1/T2 (bridge-quick-tunnel.ts): own config file, route of the current attempt, proxy relay.
  quickTunnelConfigFile = "";
  quickTunnelRoute = "direct";
  quickTunnelProbeMs = 0;
  quickTunnelProxyFallback = false;
  quickTunnelDirectFailed = false;
  quickTunnelProxyWorked = false;
  edgeRelay;
  edgeRelayProxy;
  ngrokExecutable = "ngrok";
  // OpenCode: Tailscale Funnel 隧道（固定 ts.net 地址）
  tailscaleExecutable = "";
  tailscaleSocket = "";
  tailscaleDomain = "";
  revision = 0;
  customToolsRevision = 0;
  lastCustomToolsFingerprint = "";
  lastHealth;
  startPromise;
  stopPromise;
  lifecycleGeneration = 0;
  tunnelRecoveryPromise;
  tunnelRecoveryGeneration;
  tunnelGeneration = 0;
  /** An alive ngrok process can have a disconnected edge session. */
  ngrokSessionOffline = false;
  cancelNgrokRecoveryProbe;
  cloudflareSessionOffline = false;
  cancelCloudflareRecoveryObserver;
  cloudflareConnectionObservers = /* @__PURE__ */ new WeakMap();
  stoppingResources = false;
  stopTunnelProcessInFlight;
  releaseTunnelLease;
  tunnelOwnerResources;
  tunnelOwnerPid;
  disposed = false;
  dispatcher;
  mcpTransport;
  externalRegistry;
  unsubscribeExternalCatalog;
  externalTrustTimer;
  currentLocalPort() {
    return this.mcpTransport.snapshot().localPort;
  }
  async dispatchChatTool(name, args, ownerId, signal, toolInvocationToken, nativeSession) {
    if (!CHAT_BRIDGE_CONTROL_TOOL_NAMES.has(name) || !ownerId.startsWith("native-chat:")) {
      return { text: `Chat control tool unavailable: ${name}`, isError: true };
    }
    if (name === "bridge_ask_user" && args && typeof args === "object" && args.mode !== "check") {
      // OpenCode: 原生对话优先在对话内部用内置问题卡片（vscode_askQuestions）提问，不依赖任务卡、不弹顶部输入框
      // 全自动模式下内置问题卡片由工作台直接以推荐项作答（module-2067）；卡片不可用时在这里直接作答，不挂起等待
      if (toolInvocationToken) {
        const inline = await this.askInNativeChatInline(args, toolInvocationToken, signal);
        if (inline) return inline;
      }
      if (this.isFullAutoPermissionMode()) return this.answerWithRecommendedOptions(args);
      // 任务板只认 recommended_option_id：把选项上的 recommended=true 换算过去
      const withRecommendedId = (item) => {
        const marked = item && item.recommended_option_id === void 0 && Array.isArray(item.options) ? item.options.find((option) => option?.recommended === true && option.id !== void 0) : void 0;
        return marked ? { ...item, recommended_option_id: marked.id } : item;
      };
      const normalized = Array.isArray(args.questions) ? { ...args, questions: args.questions.map(withRecommendedId) } : withRecommendedId(args);
      return this.askInNativeChat(normalized, ownerId, signal);
    }
    if (name === "bridge_ask_user" && args?.mode === "check" && toolInvocationToken && !args.task_id && !args.batch_id && !args.question_id) {
      return { text: "本对话的提问已在对话内直接作答，回答已随 bridge_ask_user 的结果返回，无需再 check。", isError: false };
    }
    const result = await this.dispatcher.dispatch(name, args, { signal, commandOwnerId: ownerId, taskOwnerId: ownerId, ...(nativeSession?.sessionId ? { ocSession: nativeSession } : {}) });
    return {
      text: result.content.filter((block) => block.type === "text").map((block) => block.text).join("\n"),
      isError: result.isError === true
    };
  }
  isFullAutoPermissionMode() {
    try {
      return readOcChatPermissionSettings((key, fallback) => vscode9.workspace.getConfiguration("opencode").get(key, fallback)).mode === "fullAuto";
    } catch {
      return false;
    }
  }
  /** 全自动：不等待用户，直接采用推荐项作答（无推荐取第一项；无选项回答「请按你推荐的方案继续」），并在输出与通知里留下可见记录。 */
  answerWithRecommendedOptions(args) {
    const source = Array.isArray(args?.questions) && args.questions.length > 0 ? args.questions
      : typeof args?.question === "string" && args.question.trim() ? [{ question: args.question, options: args.options, recommended_option_id: args.recommended_option_id }] : [];
    if (source.length === 0) return { text: "全自动：没有可作答的问题，请按你推荐的方案继续。", isError: false };
    const lines = [];
    const structured = [];
    source.forEach((item, index) => {
      const text = String(item?.question ?? "").trim();
      const pick = pickOcRecommendedAnswer(item);
      const what = pick.custom !== void 0 ? `自定义回答：${pick.custom}` : `「${pick.label}」${pick.optionId !== void 0 ? `（option_id=${pick.optionId}）` : ""}${pick.fallback === "first" ? "（未标推荐项，取第一项）" : "（推荐项）"}`;
      lines.push(`${index + 1}. ${text}\n   回答：${what}`);
      structured.push({ question: text, option_ids: pick.optionId !== void 0 ? [pick.optionId] : [], labels: pick.label !== void 0 ? [pick.label] : [], custom: pick.custom ?? null, skipped: false, auto: true });
    });
    const record = `全自动：已自动采用推荐项作答 ${source.length} 题`;
    this.output.appendLine(`[native-chat] ${record}\n${lines.join("\n")}`);
    void vscode9.window.showInformationMessage(`OpenCode ${record}（${structured.map((item) => item.custom ?? item.labels.join("、")).join("；").slice(0, 160)}）`);
    return { text: `${record}（用户开启了「全自动」，不等待用户作答；用户之后会查看）：\n${lines.join("\n")}\n\nanswers_json: ${JSON.stringify(structured)}\n\n继续执行，不要就同一问题再次提问。`, isError: false };
  }
  /** Native Chat: ask inside the conversation with the built-in question carousel. Returns
   * undefined when the carousel is unavailable so the caller falls back to the task-board path. */
  async askInNativeChatInline(args, toolInvocationToken, signal) {
    const source = Array.isArray(args.questions) && args.questions.length > 0 ? args.questions
      : typeof args.question === "string" && args.question.trim() ? [{
        question: args.question,
        options: args.options,
        recommendation: args.recommendation,
        recommended_option_id: args.recommended_option_id,
        allow_custom: args.allow_custom
      }] : [];
    if (source.length === 0) return void 0;
    const usedHeaders = new Set();
    const plans = source.map((item, index) => {
      const text = String(item?.question ?? "").trim();
      const oneLine = text.replace(/\s+/g, " ");
      let header = (source.length > 1 ? `${index + 1}. ` : "") + (oneLine.length > 46 ? oneLine.slice(0, 45) + "…" : oneLine);
      if (!header) header = `问题 ${index + 1}`;
      while (usedHeaders.has(header)) header = header.slice(0, 44) + `#${index + 1}`;
      usedHeaders.add(header);
      const usedLabels = new Set();
      const options = (Array.isArray(item?.options) ? item.options : []).map((option) => {
        let label = String(option?.label ?? option?.id ?? "").trim() || String(option?.id ?? "选项");
        while (usedLabels.has(label)) label += " ";
        usedLabels.add(label);
        return { id: option?.id, label, description: option?.description || void 0, recommended: option?.recommended === true || option?.id !== void 0 && option.id === item?.recommended_option_id };
      });
      const details = [];
      if (oneLine.length > 46 || source.length > 1) details.push(text);
      if (item?.recommendation) details.push(`建议：${item.recommendation}`);
      return {
        header,
        text,
        options,
        carousel: {
          header,
          question: oneLine.length > 46 ? oneLine.slice(0, 197) + (oneLine.length > 197 ? "…" : "") : oneLine,
          ...details.length ? { message: details.join("\n\n") } : {},
          ...options.length ? { options: options.map((option) => ({ label: option.label, ...option.description ? { description: option.description } : {}, ...option.recommended ? { recommended: true } : {} })) } : {},
          allowFreeformInput: item?.allow_custom !== false || options.length === 0
        }
      };
    });
    const cts = new vscode9.CancellationTokenSource();
    const onAbort = () => cts.cancel();
    if (signal?.aborted) cts.cancel();
    signal?.addEventListener("abort", onAbort, { once: true });
    let result;
    try {
      result = await vscode9.lm.invokeTool("vscode_askQuestions", { input: { questions: plans.map((plan) => plan.carousel) }, toolInvocationToken }, cts.token);
    } catch (error2) {
      if (signal?.aborted || cts.token.isCancellationRequested) return { text: "提问已取消：本次回复被停止，用户没有作答。", isError: true };
      this.output.appendLine(`[native-chat] inline ask unavailable, falling back to task board: ${error2 instanceof Error ? error2.message : String(error2)}`);
      return void 0;
    } finally {
      signal?.removeEventListener("abort", onAbort);
      cts.dispose();
    }
    const raw = (result?.content ?? []).map((part) => typeof part?.value === "string" ? part.value : "").join("");
    let answers = {};
    try { answers = JSON.parse(raw)?.answers ?? {}; } catch { return { text: `用户已在对话内作答：${raw}`, isError: false }; }
    const lines = [];
    const structured = [];
    let answered = 0;
    plans.forEach((plan, index) => {
      const answer = answers[plan.header];
      const selected = Array.isArray(answer?.selected) ? answer.selected.map(String) : [];
      const picked = selected.map((label) => plan.options.find((option) => option.label === label || option.label.trim() === label.trim())).filter(Boolean);
      const freeText = typeof answer?.freeText === "string" && answer.freeText.trim() ? answer.freeText.trim() : "";
      const skipped = !answer || answer.skipped === true || (!picked.length && !selected.length && !freeText);
      if (!skipped) answered++;
      const parts = [];
      if (picked.length) parts.push(picked.map((option) => `「${option.label.trim()}」${option.id ? `（option_id=${option.id}）` : ""}`).join("、"));
      else if (selected.length) parts.push(selected.map((label) => `「${label}」`).join("、"));
      if (freeText) parts.push(`自定义回答：${freeText}`);
      lines.push(`${index + 1}. ${plan.text}\n   回答：${skipped ? "未作答（用户跳过）" : parts.join("；")}`);
      structured.push({ question: plan.text, option_ids: picked.map((option) => option.id).filter(Boolean), labels: picked.length ? picked.map((option) => option.label.trim()) : selected, custom: freeText || null, skipped });
    });
    const header = answered === 0 ? "用户没有回答这些问题（全部跳过）。不要再追问同一问题；按最稳妥的方式继续，或在最终回复里说明需要用户补充什么。"
      : answered < plans.length ? `用户已在对话内回答 ${answered}/${plans.length} 题，其余跳过：` : "用户已在对话内回答：";
    return { text: `${header}\n${lines.join("\n")}\n\nanswers_json: ${JSON.stringify(structured)}`, isError: false };
  }
  /** Native Chat: register the question(s) on the task card, ask them right away in the editor
   * (quick pick per question), and keep the tool call open until every answer is in. Answers given
   * on the task board still count; whichever arrives first wins. */
  async askInNativeChat(args, ownerId, signal) {
    const toText = (result) => ({
      text: result.content.filter((block) => block.type === "text").map((block) => block.text).join("\n"),
      isError: result.isError === true
    });
    const context = { signal, commandOwnerId: ownerId, taskOwnerId: ownerId };
    const submitted = await this.dispatcher.dispatch("bridge_ask_user", { ...args, wait_seconds: 0 }, context);
    const state = submitted.structuredContent;
    if (submitted.isError || !state?.task_id || state.status === "answered" || !(state.batch_id || state.question_id)) {
      return toText(submitted);
    }
    const prompts = new AbortController();
    const stopPrompts = () => prompts.abort();
    signal?.addEventListener("abort", stopPrompts, { once: true });
    void this.promptNativeChatQuestions(state.task_id, prompts.signal).catch((error2) => {
      this.output.appendLine(`[native-chat] ask prompt failed: ${error2 instanceof Error ? error2.message : String(error2)}`);
    });
    try {
      const checkArgs = state.batch_id ? { mode: "check", task_id: state.task_id, batch_id: state.batch_id }
        : { mode: "check", task_id: state.task_id, question_id: state.question_id };
      return toText(await this.dispatcher.dispatch("bridge_ask_user", checkArgs, context));
    } finally {
      prompts.abort();
      signal?.removeEventListener("abort", stopPrompts);
    }
  }
  async promptNativeChatQuestions(taskId, signal) {
    const pendingQuestions = () => (this.dispatcher.taskStore.tasks.get(taskId)?.questions ?? []).filter((question) => question.status === "pending");
    const total = pendingQuestions().length;
    let index = 0;
    while (!signal.aborted) {
      const question = pendingQuestions()[0];
      if (!question) return;
      index++;
      const answer = await this.pickNativeChatAnswer(question, index, Math.max(total, index), signal);
      if (!answer || signal.aborted) return;
      try {
        this.dispatcher.answerTaskQuestion(taskId, question.id, answer.optionId, answer.custom);
      } catch (error2) {
        // Already answered on the task board or no longer pending: move on to the next question.
        this.output.appendLine(`[native-chat] ask answer skipped: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }
  }
  pickNativeChatAnswer(question, index, total, signal) {
    return new Promise((resolve) => {
      let settled = false;
      const disposables = [];
      const finish = (value) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        for (const item of disposables) item.dispose();
        resolve(value);
      };
      const onAbort = () => { picker.hide(); finish(void 0); };
      const picker = vscode9.window.createQuickPick();
      disposables.push(picker);
      picker.title = `OpenCode 需要你决定（${index}/${total}）`;
      picker.placeholder = question.text.replace(/\s+/g, " ").slice(0, 300);
      picker.ignoreFocusOut = true;
      picker.matchOnDescription = true;
      picker.matchOnDetail = true;
      const items = question.options.map((option) => ({
        label: option.label,
        description: option.id === question.recommendedOptionId ? "推荐" : "",
        detail: option.description || void 0,
        optionId: option.id
      }));
      if (question.allowCustom) items.push({ label: "$(edit) 自定义回答…", alwaysShow: true, custom: true });
      picker.items = items;
      const recommended = items.find((item) => item.optionId && item.optionId === question.recommendedOptionId);
      if (recommended) picker.activeItems = [recommended];
      disposables.push(picker.onDidAccept(async () => {
        const selected = picker.selectedItems[0];
        if (!selected) return;
        if (!selected.custom) {
          picker.hide();
          finish({ optionId: selected.optionId });
          return;
        }
        settled = true;
        picker.hide();
        const custom = await vscode9.window.showInputBox({ title: picker.title, prompt: question.text.slice(0, 1000), ignoreFocusOut: true });
        settled = false;
        finish(custom && custom.trim() ? { optionId: void 0, custom: custom.trim() } : void 0);
      }));
      disposables.push(picker.onDidHide(() => finish(void 0)));
      if (signal.aborted) { finish(void 0); return; }
      signal.addEventListener("abort", onAbort, { once: true });
      picker.show();
    });
  }
  /** Show a task as soon as Chat Code begins, without starting the network Bridge. */
  ensureNativeChatTask(ownerId, model) {
    return this.dispatcher.ensureNativeChatTask(ownerId, model);
  }
  finishNativeChatTask(ownerId, taskId, revision, succeeded) {
    this.dispatcher.finishNativeChatTask(ownerId, taskId, revision, succeeded);
  }
  async initialize() {
    await this.routeIdentity.initialize();
    this.output.appendLine("[bridge] route identity: durable-commit-v1");
    this.tunnelProvider = this.readTunnelProvider();
    this.namedTunnelToken = await this.context.secrets.get(CLOUDFLARE_NAMED_TOKEN_SECRET) ?? "";
    this.namedTunnelLocalPort = this.readNamedTunnelLocalPort();
    await this.restorePersistedDomain();
    await this.restorePersistedNamedDomain();
    this.domain = this.configuredDomainForProvider(this.tunnelProvider);
  }
  publishAssistantSources(input) { this.assistantPublisherContext={windowId:input.windowId,workspaceId:input.workspaceId};return this.assistantSources.issue(input); }
  assistantSourceEnabled() { return this.automation?.isCollaborationEnabled()===true; }
  setAssistantPublisherContext(value) { this.assistantPublisherContext={windowId:value.windowId,workspaceId:value.workspaceId}; }
  assistantConnectionHistory(value) { return this.assistantSources.connectionHistory(value); }
  checkpointsEnabled() {
    try { return vscode9.workspace.getConfiguration("opencode").get("bridge.checkpoints", false) === true; } catch { return false; }
  }
  specModeEnabled() {
    try { return vscode9.workspace.getConfiguration("opencode").get("bridge.specMode", false) === true; } catch { return false; }
  }
  availableBuiltinToolDefinitions() {
    // 建议7：检查点工具只在 opencode.bridge.checkpoints 开启时出现。
    const tools = [...BRIDGE_TOOL_DEFINITIONS, ...this.checkpointsEnabled() ? [SHADOW_CHECKPOINT_TOOL] : [], ...this.specModeEnabled() ? [SPEC_MODE_TOOL] : [], ...this.nativeRea.definitionsForHost()];
    try { return this.automation ? this.automation.filterAvailableTools(tools) : tools; }
    catch { return tools.filter(tool => !this.automation?.hasTool(tool.name) || ['start','bridge_get_effective_rules','bridge_acknowledge_rules'].includes(tool.name)); }
  }
  async nativeWorkerToolDefinitions() {
    const builtins = this.availableBuiltinToolDefinitions();
    let custom = [];
    try { custom = listEnabledCustomTools(this.customToolRoots(), undefined, { skillsEnabled: this.skillsEnabled() }); } catch {}
    const reserved = new Set([...builtins, ...custom].map(tool => tool.name));
    const external = this.externalRegistry ? await this.externalRegistry.listTools(reserved) : [];
    return [...builtins, ...custom, ...external];
  }
  externalMcpHealth() {
    return this.externalRegistry?.snapshot() ?? [];
  }
  async refreshExternalMcp(firstConnect) {
    if (!this.externalRegistry) return;
    await this.externalRegistry.stopAll();
    if (this.state !== "running" || !vscode9.workspace.isTrusted) return;
    let custom;
    try {
      custom = listEnabledCustomTools(this.customToolRoots(), void 0, { skillsEnabled: this.skillsEnabled() });
    } catch {
      custom = [];
    }
    const reserved = /* @__PURE__ */ new Set([...BRIDGE_TOOL_DEFINITIONS.map((tool) => tool.name), ...custom.map((tool) => tool.name)]);
    const timeouts = firstConnect && new Map(firstConnect.ids.map((id) => [id, firstConnect.connectTimeoutMs]));
    await this.externalRegistry.listTools(reserved, timeouts || void 0);
  }
  getStatus() {
    if (this.state !== "running" && this.state !== "starting") {
      this.tunnelProvider = this.readTunnelProvider();
      this.restoreConfiguredDomain();
      this.restoreConfiguredNamedDomain();
      this.namedTunnelLocalPort = this.readNamedTunnelLocalPort();
      this.domain = this.configuredDomainForProvider(this.tunnelProvider);
    }
    const localUrl = this.currentLocalPort() && this.routeToken ? `http://127.0.0.1:${this.currentLocalPort()}/mcp/${this.routeToken}` : void 0;
    const publicUrl = this.domain && this.routeToken ? `https://${this.domain}/mcp/${this.routeToken}` : void 0;
    const customTools = this.snapshotCustomTools();
    const transport = this.mcpTransport.snapshot();
    const activity = this.dispatcher.snapshotActivity();
    const taskState = this.dispatcher.snapshotTaskState();
    return {
      state: this.state,
      transport: "streamable-http",
      tunnelProvider: this.tunnelProvider,
      domain: this.domain,
      configuredDomain: this.configuredDomain,
      configuredNamedDomain: this.configuredNamedDomain,
      namedTunnelTokenConfigured: Boolean(this.namedTunnelToken),
      namedTunnelLocalPort: this.namedTunnelLocalPort,
      namedTunnelOriginUrl: `http://127.0.0.1:${this.namedTunnelLocalPort}`,
      localUrl,
      publicUrl,
      localPort: this.currentLocalPort(),
      tunnelInstalled: this.tunnelInstalled,
      tunnelVersion: this.tunnelVersion,
      tailscaleDomain: this.tailscaleDomain || void 0,
      tunnelConfigValid: this.tunnelConfigValid,
      lastError: this.lastError,
      startFailure: this.startFailure,
      toolNames: this.availableBuiltinToolDefinitions().map((tool) => tool.name),
      toolCount: this.availableBuiltinToolDefinitions().length,
      customTools,
      activeRequests: transport.activeRequests,
      connected: transport.connected,
      revision: this.revision + transport.revision + this.dispatcher.revision + this.customToolsRevision,
      concurrency: this.dispatcher.concurrencySnapshot(),
      stats: activity.stats,
      todos: this.dispatcher.snapshotTodos(),
      ...taskState,
      activities: activity.activities,
      health: this.lastHealth
    };
  }
  getConcurrencyStatus() { return this.dispatcher.concurrencySnapshot(); }
  /**
   * The Bridge panel polls getStatus every 350 ms. Re-scanning every global Skill directory (dozens of
   * SKILL.md reads, synchronous) on each poll blocked the extension host and made task cards appear late,
   * so the status list is cached briefly; importing or diagnosing Skills refreshes it immediately.
   */
  snapshotCustomTools() {
    const now = Date.now();
    if (this.customToolsSnapshot && now - this.customToolsSnapshotAt < 5e3) return this.customToolsSnapshot;
    this.customToolsSnapshot = this.scanCustomToolsForStatus();
    this.customToolsSnapshotAt = now;
    return this.customToolsSnapshot;
  }
  scanCustomToolsForStatus() {
    let tools;
    try {
      tools = loadCustomTools(this.customToolRoots(), (message2) => this.output.appendLine(message2), { skillsEnabled: this.skillsEnabled() });
    } catch {
      return [];
    }
    const fingerprint = customToolsFingerprint(tools);
    if (fingerprint !== this.lastCustomToolsFingerprint) {
      this.lastCustomToolsFingerprint = fingerprint;
      this.customToolsRevision += 1;
    }
    return toStatusEntries(tools);
  }
  async importSkill(source) {
    const result = await importGlobalSkillWithPrompt(source);
    this.customToolsSnapshotAt = 0;
    return { status: this.getStatus(), result };
  }
  async diagnoseSkills() {
    this.customToolsSnapshotAt = 0;
    const log = (message2) => this.output.appendLine(message2);
    const skillsEnabled = this.skillsEnabled();
    const tools = loadCustomTools(this.customToolRoots(), log, { skillsEnabled });
    const global2 = diagnoseGlobalSkills(log);
    const project = []; // Shared Skills only; no workspace diagnostics scan.
    const diagnoses = [...global2, ...project].map((item) => {
      if (!skillsEnabled) return { ...item, loaded: false, reasonCode: "skills-disabled", reason: "Skill \u603B\u5F00\u5173\u5DF2\u5173\u95ED\u3002", fix: "enable-skills" };
      if (item.loaded && tools.find((tool) => tool.name === item.name)?.skillDir !== item.directory) return { ...item, loaded: false, reasonCode: "duplicate-name", reason: "\u540C\u540D\u5168\u5C40 Skill / \u66F4\u9AD8\u4F18\u5148\u7EA7\u5DE5\u5177\u5DF2\u5360\u7528\u6B64\u540D\u79F0\u3002", fix: "open-folder" };
      return item;
    });
    return { status: this.getStatus(), diagnoses };
  }
  async generateSkillRunner(name) {
    const target = (name ?? "").trim();
    if (!target) throw new Error("Skill name must be a non-empty string.");
    const directory = globalSkillsDirectory();
    const global2 = directory ? resolveSkillDir(directory, target, directory) : void 0;
    if (global2 && !isGlobalSkillDirectory(global2)) throw new Error("\u5168\u5C40 Skill \u8DEF\u5F84\u4E0D\u5B89\u5168\uFF0C\u5DF2\u62D2\u7EDD\u5199\u5165\u3002");
    const root = global2 ? directory : undefined; // No legacy runner fallback.
    if (!root) throw new Error(`\u627E\u4E0D\u5230 Skill\uFF1A${target}`);
    const result = generateSkillRunner(root, target, (message2) => this.output.appendLine(message2), global2 ? directory : void 0);
    return { status: this.getStatus(), result };
  }
  async toggleCustomTool(name) {
    const target = name ?? await this.pickCustomToolName("toggle");
    if (!target) return this.getStatus();
    toggleCustomTool(this.customToolRoots(), target, (message2) => this.output.appendLine(message2));
    return this.getStatus();
  }
  async deleteCustomTool(name) {
    const target = name ?? await this.pickCustomToolName("delete");
    if (!target) return this.getStatus();
    const expectedSource = loadCustomTools(this.customToolRoots()).find((tool) => tool.name === target)?.sourcePath;
    const zh = vscode9.env.language.startsWith("zh");
    const confirm = await vscode9.window.showWarningMessage(
      zh ? `\u6C38\u4E45\u5220\u9664\u81EA\u5B9A\u4E49\u5DE5\u5177 \u201C${target}\u201D\uFF1F\u5176\u6280\u80FD\u5B50\u6587\u4EF6\u5939\u6216 JSON \u6E05\u5355\u4F1A\u88AB\u5220\u9664\uFF0C\u4E0D\u53EF\u6062\u590D\uFF1B\u5168\u5C40 Skill \u7684\u5220\u9664\u5F71\u54CD\u6240\u6709\u5DE5\u4F5C\u533A\u3002` : `Permanently delete custom tool "${target}"? Its skill subfolder or JSON manifest is removed. Global Skills are removed for every workspace.`,
      { modal: true },
      { title: zh ? "\u5220\u9664" : "Delete" }
    );
    if (!confirm) return this.getStatus();
    if (!expectedSource || loadCustomTools(this.customToolRoots()).find((tool) => tool.name === target)?.sourcePath !== expectedSource) throw new Error("\u5DE5\u5177\u6765\u6E90\u5DF2\u6539\u53D8\uFF0C\u5DF2\u53D6\u6D88\u5220\u9664\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002");
    deleteCustomTool(this.customToolRoots(), target, (message2) => this.output.appendLine(message2));
    return this.getStatus();
  }
  /** Command-palette entry point: choose one of the workspace's custom tools. */
  async pickCustomToolName(action) {
    let tools;
    try {
      tools = loadCustomTools(this.customToolRoots(), (message2) => this.output.appendLine(message2), { skillsEnabled: this.skillsEnabled() });
    } catch {
      tools = [];
    }
    const zh = vscode9.env.language.startsWith("zh");
    if (tools.length === 0) {
      void vscode9.window.showInformationMessage(
        zh ? `\u672A\u53D1\u73B0\u81EA\u5B9A\u4E49\u5DE5\u5177\uFF1A\u628A skill \u6587\u4EF6\u5939\u6216 JSON \u6E05\u5355\u653E\u5165 ${CUSTOM_TOOLS_DIR_NAME}\uFF0C\u6216\u5148\u4F7F\u7528\u201C\u5BFC\u5165 Skill\u201D\u3002` : `No custom tools yet: drop a skill folder or JSON manifest into ${CUSTOM_TOOLS_DIR_NAME}, or import one.`
      );
      return void 0;
    }
    const items = tools.map((tool) => ({
      label: `${tool.enabled ? "\u2713" : "\u2298"}  ${tool.title || tool.name}`,
      description: tool.name,
      detail: tool.skillDir ? "skill" : "JSON manifest",
      pickedTool: tool.name
    }));
    const pick2 = await vscode9.window.showQuickPick(items, {
      title: action === "toggle" ? zh ? "\u9009\u62E9\u8981\u542F\u7528/\u505C\u7528\u7684\u81EA\u5B9A\u4E49\u5DE5\u5177" : "Select a custom tool to enable or disable" : zh ? "\u9009\u62E9\u8981\u5220\u9664\u7684\u81EA\u5B9A\u4E49\u5DE5\u5177" : "Select a custom tool to delete",
      placeHolder: zh ? "\u2713 \u5DF2\u542F\u7528\u3000\u2298 \u5DF2\u505C\u7528" : "\u2713 enabled\u3000\u2298 disabled"
    });
    return pick2?.pickedTool;
  }
  readConfiguredDomain() {
    return vscode9.workspace.getConfiguration("opencode").get(NGROK_DOMAIN_SETTING, "").trim();
  }
  readConfiguredNamedDomain() {
    return vscode9.workspace.getConfiguration("opencode").get(CLOUDFLARE_NAMED_DOMAIN_SETTING, "").trim();
  }
  readNamedTunnelLocalPort() {
    const value = vscode9.workspace.getConfiguration("opencode").get(CLOUDFLARE_NAMED_LOCAL_PORT_SETTING, DEFAULT_CLOUDFLARE_NAMED_LOCAL_PORT);
    try {
      return normalizeNamedTunnelLocalPort(value);
    } catch {
      return DEFAULT_CLOUDFLARE_NAMED_LOCAL_PORT;
    }
  }
  configuredDomainForProvider(provider) {
    return provider === "ngrok" ? this.configuredDomain : provider === "cloudflare-named" ? this.configuredNamedDomain : provider === "tailscale" ? (this.tailscaleDomain || this.context.globalState.get(TAILSCALE_DOMAIN_STATE_KEY, "")) : "";
  }
  readTunnelProvider() {
    const provider = vscode9.workspace.getConfiguration("opencode").get(TUNNEL_PROVIDER_SETTING, "cloudflare");
    return provider === "ngrok" || provider === "cloudflare-named" || provider === "tailscale" ? provider : "cloudflare";
  }
  readCustomInstructions() {
    return this.automation ? this.automation.effective().text : vscode9.workspace.getConfiguration("opencode").get(CUSTOM_INSTRUCTIONS_SETTING, "").trim();
  }
  readWorkspaceScope() {
    return vscode9.workspace.getConfiguration("opencode").get(BRIDGE_WORKSPACE_SCOPE_SETTING, "device") === "device" ? "device" : "workspace";
  }
  /**
   * Built-in Bridge instructions plus the optional user-defined text configured through
   * opencode.bridge.customInstructions. Custom text is appended (never replacing the
   * built-in tool and task-coordination rules) and composed per session, so edits apply
   * to the next remote connection without restarting the Bridge.
   */
  composeServerInstructions(ownerId) {
    const custom = this.automation ? this.automation.describe(ownerId) : this.readCustomInstructions();
    const builtIn = `${BRIDGE_SERVER_INSTRUCTIONS}

${bridgeWorkspaceScopeInstructions(this.readWorkspaceScope())}`;
    return custom ? `${builtIn}

${custom}` : builtIn;
  }
  readPersistedDomain() {
    return this.context.globalState.get(NGROK_DOMAIN_STATE_KEY, "").trim();
  }
  readPersistedNamedDomain() {
    return this.context.globalState.get(CLOUDFLARE_NAMED_DOMAIN_STATE_KEY, "").trim();
  }
  /**
   * Restore the Bridge domain from either VS Code configuration or the extension's own
   * persistent memento. The memento is intentionally a second source of truth because
   * carrier/user-data migrations can temporarily present an empty configuration value on
   * startup. Whichever store still has the domain repairs the other one.
   */
  async restorePersistedDomain() {
    const configured = this.readConfiguredDomain();
    const persisted = this.readPersistedDomain();
    const candidate = configured || persisted;
    if (!candidate) return;
    this.configuredDomain = normalizeNgrokDomain(candidate);
    if (persisted !== this.configuredDomain) {
      await this.context.globalState.update(NGROK_DOMAIN_STATE_KEY, this.configuredDomain);
    }
    if (configured !== this.configuredDomain) {
      try {
        await vscode9.workspace.getConfiguration("opencode").update(NGROK_DOMAIN_SETTING, this.configuredDomain, vscode9.ConfigurationTarget.Global);
      } catch (error2) {
        this.output.appendLine(`[bridge] could not repair ngrok domain setting: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }
  }
  restoreConfiguredDomain() {
    const candidate = this.readConfiguredDomain() || this.readPersistedDomain();
    if (!candidate) return;
    try {
      this.configuredDomain = normalizeNgrokDomain(candidate);
    } catch {
    }
  }
  async persistDomain(domain) {
    const trimmed = domain.trim();
    this.configuredDomain = trimmed ? normalizeNgrokDomain(trimmed) : "";
    if (this.tunnelProvider === "ngrok") this.domain = this.configuredDomain;
    await this.context.globalState.update(NGROK_DOMAIN_STATE_KEY, this.configuredDomain);
    try {
      await vscode9.workspace.getConfiguration("opencode").update(NGROK_DOMAIN_SETTING, this.configuredDomain, vscode9.ConfigurationTarget.Global);
    } catch (error2) {
      this.output.appendLine(`[bridge] ngrok domain saved to extension state, but settings.json update failed: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
  }
  async configure(domain) {
    if (this.state === "running" || this.state === "starting") {
      throw new Error("Stop the Bridge before changing its ngrok domain.");
    }
    await this.persistDomain(domain);
    this.clearStartFailure();
    return this.getStatus();
  }
  async restorePersistedNamedDomain() {
    const configured = this.readConfiguredNamedDomain();
    const persisted = this.readPersistedNamedDomain();
    const candidate = configured || persisted;
    if (!candidate) return;
    this.configuredNamedDomain = normalizeCloudflareNamedDomain(candidate);
    if (persisted !== this.configuredNamedDomain) {
      await this.context.globalState.update(CLOUDFLARE_NAMED_DOMAIN_STATE_KEY, this.configuredNamedDomain);
    }
    if (configured !== this.configuredNamedDomain) {
      try {
        await vscode9.workspace.getConfiguration("opencode").update(CLOUDFLARE_NAMED_DOMAIN_SETTING, this.configuredNamedDomain, vscode9.ConfigurationTarget.Global);
      } catch (error2) {
        this.output.appendLine(`[bridge] could not repair Cloudflare Named Tunnel hostname setting: ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
    }
  }
  restoreConfiguredNamedDomain() {
    const candidate = this.readConfiguredNamedDomain() || this.readPersistedNamedDomain();
    if (!candidate) return;
    try {
      this.configuredNamedDomain = normalizeCloudflareNamedDomain(candidate);
    } catch {
    }
  }
  async configureNamedTunnel(input) {
    if (this.state === "running" || this.state === "starting") {
      throw new Error("Stop the Bridge before changing its Cloudflare Named Tunnel configuration.");
    }
    const domain = normalizeCloudflareNamedDomain(input.domain);
    const localPort = normalizeNamedTunnelLocalPort(input.localPort);
    const token = input.token?.trim();
    if (token !== void 0 && !token) throw new Error("Cloudflare Tunnel Token cannot be empty.");
    this.configuredNamedDomain = domain;
    this.namedTunnelLocalPort = localPort;
    await this.context.globalState.update(CLOUDFLARE_NAMED_DOMAIN_STATE_KEY, domain);
    await vscode9.workspace.getConfiguration("opencode").update(CLOUDFLARE_NAMED_DOMAIN_SETTING, domain, vscode9.ConfigurationTarget.Global);
    await vscode9.workspace.getConfiguration("opencode").update(CLOUDFLARE_NAMED_LOCAL_PORT_SETTING, localPort, vscode9.ConfigurationTarget.Global);
    if (token !== void 0) {
      this.namedTunnelToken = token;
      await this.context.secrets.store(CLOUDFLARE_NAMED_TOKEN_SECRET, token);
    }
    if (this.tunnelProvider === "cloudflare-named") this.domain = domain;
    this.tunnelConfigValid = void 0;
    this.clearStartFailure();
    return await this.checkNamedTunnel();
  }
  async clearNamedTunnelToken() {
    if (this.state === "running" || this.state === "starting") {
      throw new Error("Stop the Bridge before clearing its Cloudflare Tunnel Token.");
    }
    this.namedTunnelToken = "";
    await this.context.secrets.delete(CLOUDFLARE_NAMED_TOKEN_SECRET);
    this.tunnelConfigValid = false;
    this.clearStartFailure();
    this.lastError = "Cloudflare Named Tunnel Token is not configured.";
    return this.getStatus();
  }
  async setTunnelProvider(provider) {
    if (this.state === "running" || this.state === "starting") {
      throw new Error("Stop the Bridge before changing its tunnel provider.");
    }
    if (provider !== "cloudflare" && provider !== "cloudflare-named" && provider !== "ngrok" && provider !== "tailscale") {
      throw new Error("Bridge tunnel provider must be cloudflare, cloudflare-named, ngrok, or tailscale.");
    }
    this.tunnelProvider = provider;
    this.domain = this.configuredDomainForProvider(provider);
    this.tunnelInstalled = void 0;
    this.tunnelVersion = void 0;
    this.tunnelConfigValid = void 0;
    this.clearStartFailure();
    await vscode9.workspace.getConfiguration("opencode").update(TUNNEL_PROVIDER_SETTING, provider, vscode9.ConfigurationTarget.Global);
    return this.getStatus();
  }
  async rotateEndpoint() {
    if (this.state === "running" || this.state === "starting") {
      throw new Error("Stop the Bridge before rotating its endpoint URL.");
    }
    await this.routeIdentity.rotate();
    return this.getStatus();
  }
  async checkTunnel() {
    this.tunnelProvider = this.readTunnelProvider();
    await this.tunnelProxy?.ensureForTunnels();
    const status = this.tunnelProvider === "tailscale" ? await this.checkTailscale() : this.tunnelProvider === "ngrok" ? await this.checkNgrok() : this.tunnelProvider === "cloudflare-named" ? await this.checkNamedTunnel() : await this.checkCloudflared();
    return this.resolveTunnelClientFailure(status);
  }
  /** 隧道检测通过后，此前「缺隧道程序 / 配置不完整」一类的启动失败已不成立，不再继续显示。 */
  resolveTunnelClientFailure(status) {
    if (this.lastError || this.startFailure?.stage !== "tunnel-client") return status;
    this.clearStartFailure();
    return this.getStatus();
  }
  /** 失败原因已不成立（相关配置变化或检测通过）：清除失败信息，error 展示态回到 stopped。 */
  clearStartFailure() {
    this.lastError = void 0;
    this.startFailure = void 0;
    if (this.state === "error") this.state = "stopped";
  }
  /** 记录启动失败的结构化原因并原样返回错误，便于 `throw this.recordStartFailure(...)`。只影响展示，不改变启动流程。 */
  recordStartFailure(error2, stage) {
    this.startFailure = classifyBridgeStartFailure(error2, { stage, params: this.startFailureParams() });
    return error2;
  }
  /** 页面文案需要的安全参数：命名隧道的本地端口、主机名与 Service URL。不含路由令牌与隧道令牌。 */
  startFailureParams() {
    if (this.tunnelProvider !== "cloudflare-named") return {};
    const port = this.namedTunnelLocalPort;
    const domain = this.configuredNamedDomain;
    return {
      ...Number.isInteger(port) && port > 0 ? { port, serviceUrl: `http://127.0.0.1:${port}` } : {},
      ...domain ? { domain } : {}
    };
  }
  /** 隧道程序已安装但配置无效时的错误码：ngrok 看 config check；命名隧道区分「没填全」与「填错了」。 */
  tunnelConfigFailureCode() {
    if (this.tunnelProvider === "ngrok") return "ngrok-config-invalid";
    if (this.tunnelProvider !== "cloudflare-named") return "unknown";
    return this.namedTunnelToken && this.configuredNamedDomain ? "named-config-invalid" : "named-config-missing";
  }
  /** 自动重连期间的进度（黄色提示，不是失败）：第 attempt 次尝试。 */
  noteReconnecting(attempt) {
    this.startFailure = classifyBridgeStartFailure(new BridgeStartError("reconnecting", this.lastError ?? "", { attempt }), { stage: "reconnect" });
  }
  /**
   * Clears the tool-call timeline and resets the call statistics. Calls that are
   * still running are kept so their completion is still recorded consistently.
   * Todos are the remote agent's task list and are intentionally left untouched.
   */
  clearActivityLog() {
    const removed = this.dispatcher.clearActivity();
    this.output.appendLine(`[bridge] tool activity log cleared: ${removed} entries removed`);
    return this.getStatus();
  }
  /** Invoked only after the local extension command has shown a modal confirmation. */
  clearTasks(requests, allowAttention = false) {
    const removed = this.dispatcher.clearTasks(requests, allowAttention);
    this.output.appendLine(`[bridge] locally confirmed task cleanup: ${removed} record(s); activity log retained`);
    return this.getStatus();
  }
  deleteTaskDisplay(taskId) {
    const deleted = this.dispatcher.deleteTaskDisplay(taskId);
    if (deleted) this.output.appendLine(`[bridge] locally hidden task display: ${taskId}; memory and checkpoint retained`);
    return this.getStatus();
  }
  forkTask(taskId) {
    const task = this.dispatcher.forkTask(taskId);
    this.output.appendLine(`[bridge] forked task ${taskId} -> ${task.id} for handoff; memory copied`);
    return task;
  }
  /** A local task-card interaction, never exposed through MCP as an answer submitter. */
  answerTaskQuestion(taskId, questionId, optionId, customText) {
    this.dispatcher.answerTaskQuestion(taskId, questionId, optionId, customText);
    return this.getStatus();
  }
  /** Invoked only after the local extension command warns; this does not cancel external work. */
  interruptStaleTasks(requests) {
    const interrupted = this.dispatcher.interruptStaleTasks(requests);
    this.output.appendLine(`[bridge] locally marked ${interrupted} stale task(s) interrupted; external work was not cancelled`);
    return this.getStatus();
  }
  /**
   * Probes the Bridge end to end: local HTTP server, public tunnel endpoint,
   * tunnel process liveness and active MCP sessions. The report is kept on the
   * status so the Bridge panel can show the latest result.
   */
  async checkHealth() {
    const startedAt = Date.now();
    const running = this.state === "running";
    const [local, publicProbe] = await Promise.all([
      this.probeLocalHealth(),
      running && this.domain && this.routeToken ? this.probePublicHealth() : Promise.resolve(void 0)
    ]);
    const tunnel = this.tunnelProcess;
    const tunnelProcessAlive = Boolean(tunnel && tunnel.exitCode === null && tunnel.signalCode === null);
    const transport = this.mcpTransport.snapshot();
    const lastSessionActivity = transport.lastSessionActivityAt;
    const ok = running && local.ok && publicProbe?.ok === true && tunnelProcessAlive;
    const problems = [];
    if (!running) problems.push(`Bridge is ${this.state}`);
    if (!local.ok) problems.push(`local: ${local.error ?? "failed"}`);
    if (running && !publicProbe) problems.push("public endpoint not assigned");
    if (publicProbe && !publicProbe.ok) problems.push(`public: ${publicProbe.error ?? "failed"}`);
    if (running && !tunnelProcessAlive) problems.push("tunnel process not running");
    const summary = ok ? `healthy \xB7 local ${local.latencyMs ?? 0} ms \xB7 public ${publicProbe?.latencyMs ?? 0} ms \xB7 ${transport.sessions} MCP session(s)` : `unhealthy \xB7 ${problems.join("; ")}`;
    const report = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      ok,
      state: this.state,
      durationMs: Date.now() - startedAt,
      local,
      public: publicProbe,
      tunnelProcessAlive,
      sessions: transport.sessions,
      activeRequests: transport.activeRequests,
      lastSessionActivityAt: lastSessionActivity ? new Date(lastSessionActivity).toISOString() : void 0,
      summary
    };
    this.lastHealth = report;
    this.output.appendLine(`[bridge] health check: ${summary}`);
    return this.getStatus();
  }
  async probeLocalHealth() {
    if (!this.currentLocalPort() || !this.routeToken) {
      return { ok: false, error: this.state === "running" ? "local HTTP port unavailable" : "Bridge is not running" };
    }
    const url2 = `http://127.0.0.1:${this.currentLocalPort()}/healthz/${this.routeToken}`;
    const started = Date.now();
    try {
      const response = await fetch(url2, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(3e3) });
      const latencyMs = Date.now() - started;
      if (!response.ok) return { ok: false, url: url2, latencyMs, error: `HTTP ${response.status}` };
      const payload = await response.json().catch(() => void 0);
      return payload?.ok === true ? { ok: true, url: url2, latencyMs } : { ok: false, url: url2, latencyMs, error: "health response did not confirm ok" };
    } catch (error2) {
      return { ok: false, url: url2, latencyMs: Date.now() - started, error: error2 instanceof Error ? error2.message : String(error2) };
    }
  }
  async probePublicHealth() {
    const url2 = this.publicHealthUrl();
    const started = Date.now();
    const result = await this.requestPublicHealth(PUBLIC_HEALTH_REQUEST_TIMEOUT_MS * 2);
    const latencyMs = Date.now() - started;
    return result.ok ? { ok: true, url: url2, latencyMs } : { ok: false, url: url2, latencyMs, error: result.failure.reason };
  }
  async checkNgrok() {
    let lastError;
    for (const executable of this.ngrokExecutableCandidates()) {
      try {
        const version2 = await execFileAsync2(executable, ["version"], { windowsHide: true, timeout: 1e4 });
        this.ngrokExecutable = executable;
        this.tunnelInstalled = true;
        this.tunnelVersion = String(version2.stdout || version2.stderr).trim().split(/\r?\n/)[0] || "ngrok";
        lastError = void 0;
        break;
      } catch (error2) {
        lastError = error2;
      }
    }
    if (!this.tunnelInstalled || lastError) {
      this.tunnelInstalled = false;
      this.tunnelConfigValid = false;
      this.tunnelVersion = void 0;
      this.lastError = `ngrok was not found: ${lastError instanceof Error ? lastError.message : String(lastError ?? "not installed")}`;
      return this.getStatus();
    }
    try {
      await execFileAsync2(this.ngrokExecutable, ["config", "check"], { windowsHide: true, timeout: 1e4 });
      this.tunnelConfigValid = true;
      this.lastError = void 0;
    } catch (error2) {
      this.tunnelConfigValid = false;
      this.lastError = `ngrok config check failed: ${error2 instanceof Error ? error2.message : String(error2)}`;
    }
    return this.getStatus();
  }
  async checkCloudflared() {
    let lastError;
    for (const executable of this.cloudflaredExecutableCandidates()) {
      try {
        const version2 = await execFileAsync2(executable, ["--version"], { windowsHide: true, timeout: 1e4 });
        this.cloudflaredExecutable = executable;
        this.tunnelInstalled = true;
        this.tunnelVersion = String(version2.stdout || version2.stderr).trim().split(/\r?\n/)[0] || "cloudflared";
        this.tunnelConfigValid = true;
        this.lastError = void 0;
        return this.getStatus();
      } catch (error2) {
        lastError = error2;
      }
    }
    this.tunnelInstalled = false;
    this.tunnelConfigValid = false;
    this.tunnelVersion = void 0;
    this.lastError = `cloudflared was not found: ${lastError instanceof Error ? lastError.message : String(lastError ?? "not installed")}`;
    return this.getStatus();
  }
  async checkNamedTunnel() {
    await this.checkCloudflared();
    if (!this.tunnelInstalled) return this.getStatus();
    this.namedTunnelToken = await this.context.secrets.get(CLOUDFLARE_NAMED_TOKEN_SECRET) ?? "";
    this.restoreConfiguredNamedDomain();
    this.namedTunnelLocalPort = this.readNamedTunnelLocalPort();
    this.domain = this.configuredNamedDomain;
    if (!this.namedTunnelToken) {
      this.tunnelConfigValid = false;
      this.lastError = "Cloudflare Named Tunnel Token is not configured.";
      return this.getStatus();
    }
    if (!this.configuredNamedDomain) {
      this.tunnelConfigValid = false;
      this.lastError = "Cloudflare Named Tunnel hostname is not configured.";
      return this.getStatus();
    }
    try {
      this.namedTunnelLocalPort = normalizeNamedTunnelLocalPort(this.namedTunnelLocalPort);
    } catch (error2) {
      this.tunnelConfigValid = false;
      this.lastError = error2 instanceof Error ? error2.message : String(error2);
      return this.getStatus();
    }
    this.tunnelConfigValid = true;
    this.lastError = void 0;
    return this.getStatus();
  }
  // OpenCode: Tailscale Funnel。找 tailscale.exe（设置 > Program Files > E:\ai工作区\tailscale\bin），
  // 免安装版（同目录有 tailscaled.exe）自动用 \\.\pipe\tailscale-ai 并在需要时以用户态拉起 tailscaled。
  tailscaleExecutableCandidates() {
    const configured = String(vscode9.workspace.getConfiguration("opencode").get(TAILSCALE_PATH_SETTING, "") || "").trim();
    const candidates = [configured, this.tailscaleExecutable];
    if (process.platform === "win32") {
      if (process.env.ProgramFiles) candidates.push(import_node_path27.default.join(process.env.ProgramFiles, "Tailscale", "tailscale.exe"));
      candidates.push("E:\\ai\u5DE5\u4F5C\u533A\\tailscale\\bin\\tailscale.exe");
    }
    candidates.push("tailscale");
    return [...new Set(candidates.filter(Boolean))];
  }
  tailscaleSocketFor(executable) {
    const configured = String(vscode9.workspace.getConfiguration("opencode").get(TAILSCALE_SOCKET_SETTING, "") || "").trim();
    if (configured) return configured;
    if (process.platform !== "win32" || !import_node_path27.default.isAbsolute(executable)) return "";
    const portable = (0, import_node_fs21.existsSync)(import_node_path27.default.join(import_node_path27.default.dirname(executable), "tailscaled.exe"));
    const programFiles = process.env.ProgramFiles ? import_node_path27.default.join(process.env.ProgramFiles, "Tailscale").toLowerCase() : "";
    return portable && !(programFiles && executable.toLowerCase().startsWith(programFiles)) ? TAILSCALE_PORTABLE_SOCKET : "";
  }
  tailscaleArgs(...rest) {
    return this.tailscaleSocket ? [`--socket=${this.tailscaleSocket}`, ...rest] : rest;
  }
  async readTailscaleStatus() {
    try {
      const result = await execFileAsync2(this.tailscaleExecutable, this.tailscaleArgs("status", "--json"), { windowsHide: true, timeout: 15e3, maxBuffer: 16 * 1024 * 1024 });
      return JSON.parse(String(result.stdout || "{}"));
    } catch (error2) {
      const stdout = String(error2?.stdout ?? "").trim();
      if (stdout.startsWith("{")) {
        try {
          return JSON.parse(stdout);
        } catch {
        }
      }
      throw error2;
    }
  }
  /**
   * tailscaled-proxy-step01: portable tailscaled reaches DERP / control plane through the same
   * configured or system HTTP proxy the Cloudflare connector uses. On networks where direct
   * international routes are slow this raises Funnel throughput several-fold. Direct UDP cannot
   * traverse an HTTP proxy, so peer traffic is pinned to DERP (TS_DEBUG_ALWAYS_USE_DERP) only
   * when a proxy was resolved. With no proxy, or http.proxySupport=off, behaviour is unchanged.
   * Values the user already set in the environment are kept.
   */
  tailscaledProcessEnvironment(quiet = false) {
    const env10 = { ...process.env };
    const tunnelProxyMode = this.tunnelProxy?.tunnelProxyMode() ?? "system";
    if (tunnelProxyMode !== "system") {
      this.applyTunnelProxyOverride(env10);
      if (env10.HTTPS_PROXY && env10.TS_DEBUG_ALWAYS_USE_DERP === void 0) env10.TS_DEBUG_ALWAYS_USE_DERP = "true";
      if (!quiet) this.output.appendLine(`[bridge] portable tailscaled proxy: ${env10.HTTPS_PROXY ? "built-in tunnel proxy node, relayed via DERP" : "direct (tunnel proxy set to direct)"}.`);
      return env10;
    }
    try {
      const httpConfiguration = vscode9.workspace.getConfiguration("http");
      if (httpConfiguration.get("proxySupport") === "off") return env10;
      const configuredProxy = httpConfiguration.get("proxy")?.trim();
      // ts-direct-default: an auto-detected system / inherited proxy is NOT forced onto tailscaled.
      // Routing Funnel's DERP relay through a local system proxy (v2rayN/mihomo) made inbound TLS
      // handshakes end with EOF, so remote MCP clients could not connect. Only an explicit
      // http.proxy (or the tunnel proxy "node" mode) sends tailscaled through a proxy now.
      if (!configuredProxy) {
        for (const key of Object.keys(env10)) {
          if (/^(https?|all)_proxy$/i.test(key)) delete env10[key];
        }
        if (!quiet) this.output.appendLine("[bridge] portable tailscaled proxy: direct (no explicit http.proxy; system proxy not forced on Funnel).");
        return env10;
      }
      const proxyUrl = resolveExtensionHostProxy(new URL("https://controlplane.tailscale.com/"), configuredProxy);
      if (!proxyUrl) return env10;
      const forceConfiguredProxy = Boolean(configuredProxy);
      const hasAllProxy = Boolean(env10.ALL_PROXY || env10.all_proxy);
      if (forceConfiguredProxy || !env10.HTTPS_PROXY && !env10.https_proxy && !hasAllProxy) env10.HTTPS_PROXY = proxyUrl;
      if (forceConfiguredProxy || !env10.HTTP_PROXY && !env10.http_proxy && !hasAllProxy) env10.HTTP_PROXY = proxyUrl;
      if (!env10.NO_PROXY && !env10.no_proxy) env10.NO_PROXY = "localhost,127.0.0.1,::1";
      if (env10.TS_DEBUG_ALWAYS_USE_DERP === void 0) env10.TS_DEBUG_ALWAYS_USE_DERP = "true";
      if (!quiet) this.output.appendLine("[bridge] portable tailscaled will use the configured/system HTTP proxy and relay via DERP.");
    } catch (error2) {
      if (!quiet) this.output.appendLine(`[bridge] tailscaled proxy resolution failed; starting direct: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
    return env10;
  }
  /** 免安装版：tailscaled 没在跑时，以用户态网络在后台拉起（状态目录在 bin 的上一级 state）。 */
  async startPortableTailscaled() {
    if (!this.tailscaleSocket || !import_node_path27.default.isAbsolute(this.tailscaleExecutable)) return false;
    const bin = import_node_path27.default.dirname(this.tailscaleExecutable);
    const daemon = import_node_path27.default.join(bin, "tailscaled.exe");
    if (!(0, import_node_fs21.existsSync)(daemon)) return false;
    const stateDir = import_node_path27.default.join(import_node_path27.default.dirname(bin), "state");
    await (0, import_promises12.mkdir)(stateDir, { recursive: true });
    this.output.appendLine(`[bridge] starting portable tailscaled (userspace networking, socket ${this.tailscaleSocket}).`);
    const tailscaledEnv = this.tailscaledProcessEnvironment();
    await this.context.globalState.update(TAILSCALED_PROXY_STATE_KEY, this.tailscaledProxySignature(tailscaledEnv));
    const child = (0, import_node_child_process7.spawn)(daemon, ["--tun=userspace-networking", `--statedir=${stateDir}`, `--socket=${this.tailscaleSocket}`, "--port=0", "--windows-mode=dev"], { detached: true, stdio: "ignore", windowsHide: true, cwd: import_node_path27.default.dirname(bin), env: tailscaledEnv });
    child.on("error", (error2) => this.output.appendLine(`[bridge] tailscaled failed to start: ${error2.message}`));
    child.unref();
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        await this.readTailscaleStatus();
        return true;
      } catch {
      }
    }
    return false;
  }
  async checkTailscale() {
    let lastError;
    this.tunnelInstalled = false;
    for (const executable of this.tailscaleExecutableCandidates()) {
      try {
        const socket = this.tailscaleSocketFor(executable);
        const version2 = await execFileAsync2(executable, ["version"], { windowsHide: true, timeout: 1e4 });
        this.tailscaleExecutable = executable;
        this.tailscaleSocket = socket;
        this.tunnelInstalled = true;
        this.tunnelVersion = `tailscale ${String(version2.stdout || version2.stderr).trim().split(/\r?\n/)[0] || ""}`.trim();
        lastError = void 0;
        break;
      } catch (error2) {
        lastError = error2;
      }
    }
    if (!this.tunnelInstalled) {
      this.tunnelConfigValid = false;
      this.tunnelVersion = void 0;
      this.lastError = `\u672A\u627E\u5230 tailscale.exe\uFF1A${lastError instanceof Error ? lastError.message : String(lastError ?? "not installed")}\u3002\u53EF\u5728\u8BBE\u7F6E opencode.bridge.tailscalePath \u91CC\u6307\u5B9A\u8DEF\u5F84\u3002`;
      return this.getStatus();
    }
    await this.restartPortableTailscaledIfProxyChanged();
    let status2;
    try {
      status2 = await this.readTailscaleStatus();
    } catch (error2) {
      if (await this.startPortableTailscaled()) {
        try {
          status2 = await this.readTailscaleStatus();
        } catch (error3) {
          lastError = error3;
        }
      } else {
        lastError = error2;
      }
    }
    if (!status2) {
      this.tunnelConfigValid = false;
      this.lastError = `Tailscale \u540E\u53F0\u670D\u52A1\u6CA1\u6709\u8FD0\u884C\uFF1A${lastError instanceof Error ? lastError.message : String(lastError ?? "")}`;
      return this.getStatus();
    }
    const backendState = String(status2.BackendState ?? "");
    if (backendState !== "Running") {
      this.tunnelConfigValid = false;
      const authUrl = typeof status2.AuthURL === "string" && status2.AuthURL ? status2.AuthURL : "";
      this.lastError = `Tailscale \u672A\u767B\u5F55\uFF08${backendState || "unknown"}\uFF09\u3002${authUrl ? `\u6253\u5F00 ${authUrl} \u767B\u5F55\u540E\u518D\u542F\u52A8 Bridge\u3002` : "\u8FD0\u884C tailscale up \u767B\u5F55\u540E\u518D\u542F\u52A8 Bridge\u3002"}`;
      return this.getStatus();
    }
    const domain = String(status2.Self?.DNSName ?? "").replace(/\.$/, "").trim().toLowerCase();
    if (!domain) {
      this.tunnelConfigValid = false;
      this.lastError = "Tailscale \u5DF2\u767B\u5F55\uFF0C\u4F46\u6CA1\u6709\u62FF\u5230 ts.net \u4E3B\u673A\u540D\uFF0C\u8BF7\u5728\u7BA1\u7406\u540E\u53F0\u5F00\u542F MagicDNS \u548C HTTPS\u3002";
      return this.getStatus();
    }
    this.tailscaleDomain = domain;
    if (this.tunnelProvider === "tailscale") this.domain = domain;
    await this.context.globalState.update(TAILSCALE_DOMAIN_STATE_KEY, domain);
    // OpenCode: Funnel 要求 tailnet 已开 HTTPS 证书且本机有 funnel 能力；缺了就给出官方的开启链接。
    const selfCaps = [...Object.keys(status2.Self?.CapMap ?? {}), ...(Array.isArray(status2.Self?.Capabilities) ? status2.Self.Capabilities : [])].map((cap) => String(cap).toLowerCase());
    const hasFunnel = selfCaps.some((cap) => cap.includes("tailscale.com/cap/funnel"));
    const hasHttps = (Array.isArray(status2.CertDomains) && status2.CertDomains.length > 0) || selfCaps.some((cap) => cap.includes("tailscale.com/cap/https"));
    if (!hasFunnel || !hasHttps) {
      const nodeId = String(status2.Self?.ID ?? "").trim();
      this.tailscaleEnableUrl = `https://login.tailscale.com/f/funnel${nodeId ? `?node=${encodeURIComponent(nodeId)}` : ""}`;
      this.tunnelConfigValid = false;
      this.lastError = `Tailscale \u5DF2\u767B\u5F55\uFF08${domain}\uFF09\uFF0C\u4F46\u8FD9\u4E2A tailnet \u8FD8\u6CA1\u5F00\u542F ${hasHttps ? "" : "HTTPS \u8BC1\u4E66\u548C "}Funnel\u3002\u70B9\u300C\u4E00\u952E\u8FDE\u63A5\u300D\u4F1A\u6253\u5F00\u5B98\u65B9\u5F00\u542F\u9875\uFF0C\u70B9\u540C\u610F\u540E\u8FD9\u91CC\u81EA\u52A8\u53D8\u4E3A\u300C\u5DF2\u8FDE\u63A5\u300D\u3002`;
      return this.getStatus();
    }
    this.tailscaleEnableUrl = "";
    this.tunnelConfigValid = true;
    this.lastError = void 0;
    return this.getStatus();
  }
  /**
   * OpenCode: Bridge 页「一键连接」。未登录时走 tailscale login（或 Stopped 时 tailscale up），
   * 拿到登录链接就在浏览器打开，然后每 2 秒查一次状态，直到 Running（最多 5 分钟）。
   */
  async connectTailscale() {
    if (this.state === "running" || this.state === "starting") throw new Error("\u8BF7\u5148\u505C\u6B62 Bridge \u518D\u8FDE\u63A5 Tailscale\u3002");
    this.tunnelProvider = this.readTunnelProvider();
    if (this.tunnelProvider !== "tailscale") throw new Error("\u5F53\u524D\u96A7\u9053\u6A21\u5F0F\u4E0D\u662F Tailscale Funnel\u3002");
    await this.checkTailscale();
    if (!this.tunnelInstalled || this.tunnelConfigValid) return this.getStatus();
    let status0;
    try {
      status0 = await this.readTailscaleStatus();
    } catch {
      return this.getStatus();
    }
    const backendState = String(status0.BackendState ?? "");
    const opened = /* @__PURE__ */ new Set();
    const openAuthUrl = (url) => {
      if (!url || opened.has(url)) return;
      opened.add(url);
      this.output.appendLine(`[bridge] tailscale login URL opened in the browser: ${url}`);
      void vscode9.env.openExternal(vscode9.Uri.parse(url));
    };
    let child;
    let childOutput = "";
    let childExited = false;
    let reachedRunning = backendState === "Running";
    if (reachedRunning) {
      if (this.tailscaleEnableUrl) openAuthUrl(this.tailscaleEnableUrl);
    } else if (typeof status0.AuthURL === "string" && status0.AuthURL) {
      openAuthUrl(status0.AuthURL);
    } else {
      const args = this.tailscaleArgs("up", "--unattended", "--timeout=300s");
      this.output.appendLine(`[bridge] one-click connect: tailscale ${args.join(" ")}`);
      child = (0, import_node_child_process7.spawn)(this.tailscaleExecutable, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      const onData = (chunk) => {
        childOutput += String(chunk);
        if (childOutput.length > 2e4) childOutput = childOutput.slice(-2e4);
        const url = childOutput.match(/https:\/\/login\.tailscale\.com\/[^\s"']+/i)?.[0];
        if (url) openAuthUrl(url);
      };
      child.stdout?.on("data", onData);
      child.stderr?.on("data", onData);
      child.on("error", (error2) => {
        childExited = true;
        childOutput += `
${error2.message}`;
      });
      child.on("exit", () => {
        childExited = true;
      });
    }
    const deadline = Date.now() + 3e5;
    let running = false;
    try {
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        try {
          const current = await this.readTailscaleStatus();
          if (typeof current.AuthURL === "string" && current.AuthURL) openAuthUrl(current.AuthURL);
          if (String(current.BackendState ?? "") === "Running") {
            reachedRunning = true;
            await this.checkTailscale();
            if (this.tunnelConfigValid) {
              running = true;
              break;
            }
            if (this.tailscaleEnableUrl) openAuthUrl(this.tailscaleEnableUrl);
          }
        } catch {
        }
        if (childExited && !opened.size && !running && !reachedRunning) {
          // login/up 已退出却没给出登录链接：多半是报错，按原文提示。
          break;
        }
      }
    } finally {
      if (child && !childExited) {
        try {
          child.kill();
        } catch {
        }
      }
    }
    await this.checkTailscale();
    if (!running && !this.tunnelConfigValid && !reachedRunning) {
      const detail = childOutput.trim().slice(-600);
      this.lastError = Date.now() >= deadline ? "Tailscale \u767B\u5F55\u7B49\u5F85\u8D85\u65F6\uFF085 \u5206\u949F\uFF09\uFF0C\u53EF\u518D\u70B9\u4E00\u6B21\u300C\u4E00\u952E\u8FDE\u63A5\u300D\u3002" : `Tailscale \u8FDE\u63A5\u5931\u8D25${detail ? `\uFF1A${detail}` : "\u3002"}`;
    }
    return this.getStatus();
  }
  cloudflaredExecutableCandidates() {
    const candidates = [this.cloudflaredExecutable, "cloudflared"];
    if (process.platform === "win32") {
      if (process.env.LOCALAPPDATA) {
        candidates.push(import_node_path27.default.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Links", "cloudflared.exe"));
        candidates.push(import_node_path27.default.join(process.env.LOCALAPPDATA, "Microsoft", "WindowsApps", "cloudflared.exe"));
      }
      if (process.env.ProgramFiles) candidates.push(import_node_path27.default.join(process.env.ProgramFiles, "cloudflared", "cloudflared.exe"));
      if (process.env["ProgramFiles(x86)"]) candidates.push(import_node_path27.default.join(process.env["ProgramFiles(x86)"], "cloudflared", "cloudflared.exe"));
    }
    return [...new Set(candidates.filter(Boolean))];
  }
  ngrokExecutableCandidates() {
    const candidates = [this.ngrokExecutable, "ngrok"];
    if (process.platform === "win32") {
      if (process.env.LOCALAPPDATA) {
        candidates.push(import_node_path27.default.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Links", "ngrok.exe"));
        candidates.push(import_node_path27.default.join(process.env.LOCALAPPDATA, "Microsoft", "WindowsApps", "ngrok.exe"));
      }
      if (process.env.ProgramFiles) candidates.push(import_node_path27.default.join(process.env.ProgramFiles, "ngrok", "ngrok.exe"));
      if (process.env["ProgramFiles(x86)"]) candidates.push(import_node_path27.default.join(process.env["ProgramFiles(x86)"], "ngrok", "ngrok.exe"));
    }
    return [...new Set(candidates.filter(Boolean))];
  }
  async installCloudflared() {
    if (this.state === "running" || this.state === "starting") {
      throw new Error("Stop the Bridge before installing cloudflared.");
    }
    this.tunnelProvider = this.readTunnelProvider();
    if (this.tunnelProvider !== "cloudflare" && this.tunnelProvider !== "cloudflare-named") {
      throw new Error("Select a Cloudflare tunnel mode before installing cloudflared.");
    }
    const existing = await this.checkCloudflared();
    if (existing.tunnelInstalled) return this.resolveTunnelClientFailure(this.tunnelProvider === "cloudflare-named" ? await this.checkNamedTunnel() : existing);
    if (process.platform !== "win32") {
      throw new Error("One-click cloudflared installation is currently supported on Windows with Winget.");
    }
    this.output.appendLine(`[bridge] installing cloudflared with Winget package ${CLOUDFLARED_WINGET_PACKAGE}...`);
    try {
      const result = await execFileAsync2("winget", [
        "install",
        "--id",
        CLOUDFLARED_WINGET_PACKAGE,
        "--exact",
        "--source",
        "winget",
        "--silent",
        "--disable-interactivity",
        "--accept-package-agreements",
        "--accept-source-agreements"
      ], {
        windowsHide: false,
        timeout: 10 * 60 * 1e3,
        maxBuffer: 2 * 1024 * 1024
      });
      const output2 = String(result.stdout || result.stderr).trim();
      if (output2) this.output.appendLine(`[winget] ${output2}`);
    } catch (error2) {
      const details = error2;
      const output2 = [details.message, String(details.stdout ?? "").trim(), String(details.stderr ?? "").trim()].filter(Boolean).join("\n");
      this.lastError = `cloudflared installation failed: ${output2}`;
      throw this.recordStartFailure(new BridgeStartError("cloudflared-install-failed", this.lastError), "tunnel-client");
    }
    const installed = await this.checkCloudflared();
    if (!installed.tunnelInstalled) {
      this.lastError = "cloudflared installation completed, but OpenCode could not locate the executable. Restart OpenCode and check the tunnel again.";
      throw this.recordStartFailure(new BridgeStartError("cloudflared-install-failed", this.lastError), "tunnel-client");
    }
    this.output.appendLine(`[bridge] cloudflared installation verified: ${installed.tunnelVersion ?? "installed"}`);
    return this.resolveTunnelClientFailure(this.tunnelProvider === "cloudflare-named" ? await this.checkNamedTunnel() : installed);
  }
  /** Development-only transport smoke: opens the exact local Streamable HTTP MCP server without a public tunnel. */
  async startLocalSmoke() {
    if (this.disposed) throw new Error("Bridge has been disposed; reopen the workspace before starting it again.");
    if (this.context.extensionMode !== vscode9.ExtensionMode.Development || process.env.OPENCODE_BRIDGE_SMOKE_LOCAL !== "1") {
      throw new Error("Local Bridge smoke mode is available only in an Extension Development Host with OPENCODE_BRIDGE_SMOKE_LOCAL=1.");
    }
    if (this.state === "running") return this.getStatus();
    await this.initialize();
    if (!vscode9.workspace.workspaceFolders?.length) throw new Error("Open a workspace folder before starting the Bridge smoke server.");
    this.state = "starting";
    this.lastError = void 0;
    try {
      await this.mcpTransport.start({
        provider: this.tunnelProvider,
        routeToken: this.routeToken,
        namedTunnelLocalPort: this.namedTunnelLocalPort
      });
      await this.verifyLocalHealth();
      this.state = "running";
      void this.refreshExternalMcp().catch(() => this.output.appendLine("[external-mcp] startup refresh unavailable"));
      this.output.appendLine(`[bridge-smoke] local Streamable HTTP server running on 127.0.0.1:${this.currentLocalPort()}`);
      return this.getStatus();
    } catch (error2) {
      this.lastError = error2 instanceof Error ? error2.message : String(error2);
      this.state = "error";
      await this.stopResources(false);
      throw error2;
    }
  }
  async start(domain) {
    if (this.stopPromise) throw this.recordStartFailure(new BridgeStartError("cleanup-in-progress", "Bridge cleanup is in progress; wait before starting again."), "precheck");
    if (this.disposed) throw this.recordStartFailure(new BridgeStartError("disposed", "Bridge has been disposed; reopen the workspace before starting it again."), "precheck");
    if (this.state === "running") return this.getStatus();
    if (this.startPromise) return this.startPromise;
    if (this.state === "starting" && this.mcpTransport.isListening()) return this.getStatus();
    this.startPromise = this.startInternal(domain);
    try {
      return await this.startPromise;
    } finally {
      this.startPromise = void 0;
    }
  }
  /**
   * Reserve this window's tunnel endpoint across OpenCode windows/instances.
   * ngrok is singleton per machine and a fixed domain/named credential cannot
   * be shared; when the configured provider is already held by another window,
   * a second window automatically falls back to provider #1 (cloudflare quick
   * tunnel, which needs no lease) instead of failing to start. Only this
   * window's in-memory provider changes — the configured provider in settings
   * is left untouched, so a later start retries it (and succeeds once the
   * other window releases it).
   */
  async acquireTunnelLeaseOrFallbackToCloudflare() {
    try {
      this.releaseTunnelLease = await acquireBridgeTunnelLease(this.currentTunnelLeaseResources());
      return;
    } catch (error2) {
      if (this.tunnelProvider === "cloudflare" || !isBridgeTunnelLeaseConflict(error2)) throw error2;
    }
    const configured = this.tunnelProvider;
    this.output.appendLine(`[bridge] ${configured} is already in use by another OpenCode window; this window falls back to cloudflare.`);
    showBridgeProviderFallbackNotice(configured, this.output);
    this.tunnelProvider = "cloudflare";
    this.domain = "";
    this.tunnelInstalled = void 0;
    this.tunnelVersion = void 0;
    this.tunnelConfigValid = void 0;
    const tunnel = await this.checkCloudflared();
    if (!tunnel.tunnelInstalled) throw new Error(this.lastError ?? "cloudflare tunnel client is not installed.");
    if (!tunnel.tunnelConfigValid) throw new Error(this.lastError ?? "cloudflare tunnel configuration is invalid.");
    this.releaseTunnelLease = await acquireBridgeTunnelLease([]);
  }
  /** Lease resources for the currently configured provider (one definition shared by acquire/spawn/stop/reclaim). */
  currentTunnelLeaseResources() {
    return bridgeTunnelLeaseResources({
      provider: this.tunnelProvider,
      configuredDomain: this.configuredDomain,
      configuredNamedDomain: this.configuredNamedDomain,
      namedTunnelToken: this.namedTunnelToken
    });
  }
  /** Tunnel binary image name for orphan identity verification (e.g. `ngrok.exe`). */
  currentTunnelImage() {
    const isCloudflare = this.tunnelProvider === "cloudflare" || this.tunnelProvider === "cloudflare-named";
    const image = import_node_path27.default.basename(isCloudflare ? this.cloudflaredExecutable : this.tunnelProvider === "tailscale" ? this.tailscaleExecutable || "tailscale" : this.ngrokExecutable);
    return process.platform === "win32" && !image.toLowerCase().endsWith(".exe") ? `${image}.exe` : image;
  }
  /** Remember our tunnel child for the next holder's reclaim (singleton scopes only). */
  recordOwnedTunnel(pid) {
    const resources = this.currentTunnelLeaseResources();
    const localPort = this.currentLocalPort();
    if (!resources.length || pid === void 0 || !localPort) {
      this.tunnelOwnerResources = void 0;
      this.tunnelOwnerPid = void 0;
      return;
    }
    this.tunnelOwnerResources = resources;
    this.tunnelOwnerPid = pid;
    recordTunnelOwnership(resources, {
      pid,
      image: this.currentTunnelImage(),
      provider: this.tunnelProvider === "cloudflare-named" ? "cloudflare-named" : "ngrok",
      domain: (this.tunnelProvider === "ngrok" ? this.configuredDomain : this.configuredNamedDomain).trim().toLowerCase(),
      localPort,
      startedAt: Date.now()
    });
  }
  /** Forget our tunnel child (it exited or was stopped); never touches a successor's record. */
  clearOwnedTunnelRecord() {
    if (this.tunnelOwnerResources?.length && this.tunnelOwnerPid !== void 0) {
      clearTunnelOwnership(this.tunnelOwnerResources, this.tunnelOwnerPid);
      this.tunnelOwnerResources = void 0;
      this.tunnelOwnerPid = void 0;
    }
  }
  /**
   * Reclaim a crashed previous holder's tunnel child; fail fast when the
   * survivor cannot be stopped (spawning a duelling second agent for the same
   * reserved endpoint would fail at the edge anyway).
   */
  async reclaimPreviousTunnelOwner() {
    const resources = this.currentTunnelLeaseResources();
    if (!resources.length) return;
    const outcome = await reclaimStaleTunnelOwner(resources, this.currentTunnelImage());
    if (outcome.action === "reclaimed") {
      this.output.appendLine(`[bridge] reclaimed the previous ${this.tunnelProvider} tunnel (pid ${outcome.pid}) left behind by an unclean shutdown.`);
    } else if (outcome.action === "failed") {
      throw new Error(`Previous ${this.tunnelProvider} tunnel (pid ${outcome.pid}) is still running and could not be stopped: ${outcome.reason}. Stop it manually and retry.`);
    } else if (outcome.reason !== "no ownership record") {
      this.output.appendLine(`[bridge] previous-tunnel reclaim skipped (${outcome.reason}).`);
    }
  }
  /**
   * On-demand orphan sweep behind the "clean up processes" action: terminate
   * the stale tunnel child of a crashed previous holder WITHOUT stopping this
   * Bridge. Safety mirrors the startup reclaim, plus a live-holder probe: when
   * this window owns the endpoint, or another live OpenCode window still holds
   * the lease, that tunnel is owned and running — never an orphan — so nothing
   * is terminated. Quick tunnels have no fixed endpoint and leave no
   * reclaimable orphans.
   */
  async cleanupOrphanTunnel() {
    const resources = this.currentTunnelLeaseResources();
    if (!resources.length) {
      this.output.appendLine("[bridge] cleanup: quick tunnels leave no reclaimable processes; nothing to clean.");
      return this.getStatus();
    }
    if (this.state === "starting") {
      this.output.appendLine("[bridge] cleanup skipped: startup is in progress and reclaims stale tunnels itself.");
      return this.getStatus();
    }
    if (this.releaseTunnelLease) {
      this.output.appendLine("[bridge] cleanup skipped: this window owns the running tunnel; nothing to clean.");
      return this.getStatus();
    }
    let releaseProbe;
    try {
      releaseProbe = await acquireBridgeTunnelLease(resources);
    } catch (error2) {
      if (isBridgeTunnelLeaseConflict(error2)) {
        this.output.appendLine("[bridge] cleanup skipped: another live OpenCode window owns this endpoint and its tunnel is not an orphan.");
        return this.getStatus();
      }
      throw error2;
    }
    try {
      const outcome = await reclaimStaleTunnelOwner(resources, this.currentTunnelImage());
      if (outcome.action === "reclaimed") {
        this.output.appendLine(`[bridge] cleanup reclaimed the stale ${this.tunnelProvider} tunnel (pid ${outcome.pid}) left behind by an unclean shutdown.`);
      } else if (outcome.action === "failed") {
        throw new Error(`Stale ${this.tunnelProvider} tunnel (pid ${outcome.pid}) is still running and could not be stopped: ${outcome.reason}. Stop it manually and retry.`);
      } else {
        this.output.appendLine(`[bridge] cleanup found nothing to reclaim (${outcome.reason}).`);
      }
    } finally {
      await releaseProbe();
    }
    return this.getStatus();
  }
  async startInternal(domain) {
    const lifecycle = this.lifecycleGeneration;
    const checkCancelled = () => {
      if (lifecycle !== this.lifecycleGeneration) throw new Error("Bridge startup cancelled by stop/cleanup.");
    };
    checkCancelled();
    this.stoppingResources = false;
    this.state = "starting";
    this.lastError = void 0;
    this.startFailure = void 0;
    let stage = "precheck";
    try {
      await this.initialize();
      this.tunnelProvider = this.readTunnelProvider();
      if (this.tunnelProvider === "ngrok") {
        const resolvedDomain = domain ?? (this.configuredDomain || this.readConfiguredDomain() || this.readPersistedDomain());
        await this.persistDomain(resolvedDomain);
      } else if (this.tunnelProvider === "cloudflare-named") {
        this.namedTunnelToken = await this.context.secrets.get(CLOUDFLARE_NAMED_TOKEN_SECRET) ?? "";
        this.restoreConfiguredNamedDomain();
        this.namedTunnelLocalPort = this.readNamedTunnelLocalPort();
        this.domain = this.configuredNamedDomain;
      } else if (this.tunnelProvider === "tailscale") {
        this.domain = this.configuredDomainForProvider("tailscale");
      } else {
        this.domain = "";
      }
      checkCancelled();
      const folders = vscode9.workspace.workspaceFolders;
      if (!folders?.length) throw new BridgeStartError("no-workspace", "Open a workspace folder before starting the Bridge.");
      stage = "tunnel-client";
      const tunnel = await this.checkTunnel();
      checkCancelled();
      if (!tunnel.tunnelInstalled && this.tunnelProvider === "tailscale") throw new Error(this.lastError ?? "tailscale.exe was not found.");
      if (!tunnel.tunnelInstalled) throw new BridgeStartError(this.tunnelProvider === "ngrok" ? "ngrok-missing" : "cloudflared-missing", this.lastError ?? `${this.tunnelProvider} tunnel client is not installed.`);
      if (!tunnel.tunnelConfigValid && this.tunnelProvider === "tailscale") throw new Error(this.lastError ?? "Tailscale is not ready.");
      if (!tunnel.tunnelConfigValid) throw new BridgeStartError(this.tunnelConfigFailureCode(), this.lastError ?? `${this.tunnelProvider} tunnel configuration is invalid.`);
      stage = "lease";
      await this.acquireTunnelLeaseOrFallbackToCloudflare();
      checkCancelled();
      stage = "local";
      await this.mcpTransport.start({
        provider: this.tunnelProvider,
        routeToken: this.routeToken,
        namedTunnelLocalPort: this.namedTunnelLocalPort
      });
      await this.verifyLocalHealth();
      checkCancelled();
      stage = "tunnel";
      await this.reclaimPreviousTunnelOwner();
      checkCancelled();
      await this.startTunnelOnce();
      checkCancelled();
      this.state = "running";
      this.startFailure = void 0;
      void this.refreshExternalMcp().catch(() => this.output.appendLine("[external-mcp] startup refresh unavailable"));
      this.output.appendLine(`[bridge] running ${this.tunnelProvider} tunnel -> 127.0.0.1:${this.currentLocalPort()} (endpoint available in Bridge status)`);
      return this.getStatus();
    } catch (error2) {
      if (lifecycle !== this.lifecycleGeneration) throw error2;
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      this.lastError = message2;
      this.state = "error";
      this.recordStartFailure(error2, stage);
      await this.stopResources(false);
      throw error2;
    }
  }
  async verifyLocalHealth() {
    if (!this.currentLocalPort()) throw new Error("Bridge local HTTP port is unavailable after startup.");
    const url2 = new URL(`http://127.0.0.1:${this.currentLocalPort()}/healthz/${this.routeToken}`);
    let response;
    try {
      response = await fetch(url2, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(3e3) });
    } catch (error2) {
      throw new Error(`Bridge local HTTP health check failed: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
    if (!response.ok) throw new Error(`Bridge local HTTP health check returned HTTP ${response.status}.`);
    const payload = await response.json().catch(() => void 0);
    if (payload?.ok !== true) throw new Error("Bridge local HTTP health check did not confirm readiness.");
    this.output.appendLine(`[bridge] local health verified: ${url2}`);
  }
  /** 原有的系统代理解析：http.proxySupport / http.proxy / 环境变量 / Windows 系统代理。 */
  systemTunnelProxyUrl(target = "https://www.cloudflare.com/") {
    const httpConfiguration = vscode9.workspace.getConfiguration("http");
    if (httpConfiguration.get("proxySupport") === "off") return void 0;
    return resolveExtensionHostProxy(new URL(target), httpConfiguration.get("proxy")?.trim()) || void 0;
  }
  /** tunnel-proxy-step01：隧道程序实际使用的代理。system 沿用原逻辑；direct 不用代理；node 用内置 mihomo 的本机端口。 */
  tunnelProxyUrl(target) {
    const mode = this.tunnelProxy?.tunnelProxyMode() ?? "system";
    if (mode === "direct") return void 0;
    if (mode === "node") return this.tunnelProxy.nodeProxyUrl();
    return this.systemTunnelProxyUrl(target);
  }
  /** direct / node 模式：去掉继承的代理变量；node 模式再指向内置 mihomo。 */
  applyTunnelProxyOverride(env10) {
    for (const key of Object.keys(env10)) {
      if (/^(https?|all)_proxy$/i.test(key)) delete env10[key];
    }
    const proxyUrl = this.tunnelProxyUrl();
    if (proxyUrl) {
      env10.HTTPS_PROXY = proxyUrl;
      env10.HTTP_PROXY = proxyUrl;
      if (!env10.NO_PROXY && !env10.no_proxy) env10.NO_PROXY = "localhost,127.0.0.1,::1";
    }
    return env10;
  }
  tailscaledProxySignature(env10 = this.tailscaledProcessEnvironment(true)) {
    return `${env10.HTTPS_PROXY ?? env10.https_proxy ?? env10.ALL_PROXY ?? env10.all_proxy ?? ""}|${env10.TS_DEBUG_ALWAYS_USE_DERP ?? ""}`;
  }
  /** 隧道代理变了（模式、系统代理地址）而免安装版 tailscaled 还在用旧代理：先结束它，随后按新代理重新拉起。Funnel 运行中不动。 */
  async restartPortableTailscaledIfProxyChanged() {
    if (process.platform !== "win32" || this.tunnelProcess || !this.tailscaleSocket || !import_node_path27.default.isAbsolute(this.tailscaleExecutable ?? "")) return;
    const daemon = import_node_path27.default.join(import_node_path27.default.dirname(this.tailscaleExecutable), "tailscaled.exe");
    if (!(0, import_node_fs21.existsSync)(daemon)) return;
    const wanted = this.tailscaledProxySignature();
    if (this.context.globalState.get(TAILSCALED_PROXY_STATE_KEY) === wanted) return;
    try {
      await this.readTailscaleStatus();
    } catch {
      return;
    }
    this.output.appendLine("[bridge] tunnel proxy changed; restarting portable tailscaled so it uses the new proxy.");
    const escaped = daemon.replace(/'/g, "''");
    await execFileAsync2("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `Get-CimInstance Win32_Process -Filter "Name='tailscaled.exe'" | Where-Object { $_.ExecutablePath -eq '${escaped}' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { windowsHide: true, timeout: 15e3 }).catch((error2) => this.output.appendLine(`[bridge] could not stop portable tailscaled: ${error2 instanceof Error ? error2.message : String(error2)}`));
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  tunnelProcessEnvironment() {
    const env10 = { ...process.env };
    if (this.tunnelProvider === "tailscale") return env10;
    if (this.tunnelProvider === "ngrok") {
      return this.ngrokProcessEnvironment(env10);
    }
    const httpConfiguration = vscode9.workspace.getConfiguration("http");
    const proxySupport = httpConfiguration.get("proxySupport");
    const configuredProxy = httpConfiguration.get("proxy")?.trim();
    if (proxySupport !== "off") {
      const proxyUrl = resolveExtensionHostProxy(new URL("https://www.cloudflare.com/"), configuredProxy);
      if (proxyUrl) {
        const forceConfiguredProxy = Boolean(configuredProxy);
        const hasAllProxy = Boolean(env10.ALL_PROXY || env10.all_proxy);
        if (forceConfiguredProxy || !env10.HTTPS_PROXY && !env10.https_proxy && !hasAllProxy) env10.HTTPS_PROXY = proxyUrl;
        if (forceConfiguredProxy || !env10.HTTP_PROXY && !env10.http_proxy && !hasAllProxy) env10.HTTP_PROXY = proxyUrl;
        this.output.appendLine("[bridge] tunnel process will use configured/system HTTP proxy settings.");
      }
    }
    if ((this.tunnelProxy?.tunnelProxyMode() ?? "system") !== "system") {
      this.applyTunnelProxyOverride(env10);
      this.output.appendLine(`[bridge] tunnel process proxy: ${env10.HTTPS_PROXY ? "built-in tunnel proxy node" : "direct (tunnel proxy set to direct)"}.`);
    }
    if (this.tunnelProvider === "cloudflare-named") env10.TUNNEL_TOKEN = this.namedTunnelToken;
    return env10;
  }
  /**
   * ngrok Free rejects agents that connect through an HTTP/S proxy with
   * ERR_NGROK_9009, so the ngrok process runs in direct mode by default and
   * inherited proxy variables are stripped (both case variants). Users with
   * an ngrok Pay-as-you-go plan can opt into the resolved proxy explicitly
   * via opencode.bridge.ngrokUseHttpProxy.
   */
  ngrokProcessEnvironment(env10) {
    if (this.ngrokUseHttpProxyEnabled()) {
      const httpConfiguration = vscode9.workspace.getConfiguration("http");
      const configuredProxy = httpConfiguration.get("proxy")?.trim();
      const proxyUrl = httpConfiguration.get("proxySupport") === "off" ? void 0 : resolveExtensionHostProxy(new URL("https://www.cloudflare.com/"), configuredProxy);
      if (proxyUrl) {
        env10.HTTPS_PROXY = proxyUrl;
        env10.HTTP_PROXY = proxyUrl;
        this.output.appendLine("[bridge] ngrok process will use the resolved HTTP proxy (opencode.bridge.ngrokUseHttpProxy); this requires an ngrok Pay-as-you-go plan.");
      } else {
        this.output.appendLine("[bridge] opencode.bridge.ngrokUseHttpProxy is enabled, but no HTTP proxy was resolved; the ngrok process will connect directly.");
      }
      return env10;
    }
    for (const key of Object.keys(env10)) {
      if (/^(https?|all)_proxy$/i.test(key)) delete env10[key];
    }
    this.output.appendLine("[bridge] ngrok process will connect directly; inherited proxy variables were removed (ngrok Free rejects HTTP proxies with ERR_NGROK_9009).");
    return env10;
  }
  ngrokUseHttpProxyEnabled() {
    return vscode9.workspace.getConfiguration("opencode").get(NGROK_USE_HTTP_PROXY_SETTING, false) === true;
  }
  /** HTTP proxy for the Cloudflare edge: http.proxy, else the system proxy; none when proxy support is off. */
  cloudflareEdgeProxyUrl() {
    return this.tunnelProxyUrl("https://region1.v2.argotunnel.com/");
  }
  /** T1: write the Bridge's own cloudflared config. T2: pick this attempt's route and run the relay for the proxy route. */
  async prepareQuickTunnelAttempt() {
    await this.tunnelProxy?.ensureForTunnels();
    const tunnelProxyMode = this.tunnelProxy?.tunnelProxyMode() ?? "system";
    const setting = tunnelProxyMode === "node" ? "proxy" : tunnelProxyMode === "direct" ? "direct" : normalizeEdgeRouteSetting(vscode9.workspace.getConfiguration("opencode").get(CLOUDFLARE_EDGE_ROUTE_SETTING));
    const proxyUrl = this.cloudflareEdgeProxyUrl();
    this.quickTunnelRoute = chooseQuickTunnelRoute({ setting, proxyAvailable: Boolean(proxyUrl), directFailed: this.quickTunnelDirectFailed, proxyWorked: this.quickTunnelProxyWorked });
    const deadline2 = quickTunnelEdgeTimeoutMs({ setting, route: this.quickTunnelRoute, proxyAvailable: Boolean(proxyUrl) });
    this.quickTunnelProbeMs = deadline2 < QUICK_TUNNEL_EDGE_TIMEOUT_MS ? deadline2 : 0;
    this.quickTunnelProxyFallback = setting === "auto" && Boolean(proxyUrl) && this.quickTunnelRoute === "direct";
    const configFile = import_node_path27.default.join(import_node_os7.default.homedir(), ".opencode", QUICK_TUNNEL_CONFIG_NAME);
    await (0, import_promises12.mkdir)(import_node_path27.default.dirname(configFile), { recursive: true });
    if (await (0, import_promises12.readFile)(configFile, "utf8").catch(() => "") !== QUICK_TUNNEL_CONFIG_TEXT) await (0, import_promises12.writeFile)(configFile, QUICK_TUNNEL_CONFIG_TEXT, "utf8");
    this.quickTunnelConfigFile = configFile;
    this.quickTunnelPre = void 0;
    this.quickTunnelPre = await this.provisionQuickTunnel(configFile);
    if (this.quickTunnelRoute === "direct") {
      await this.closeEdgeRelay();
      this.output.appendLine(`[bridge] quick tunnel: own cloudflared config, direct route (QUIC, falling back to HTTP/2)${this.quickTunnelProxyFallback ? `; the HTTP proxy route follows if no edge connection registers within ${Math.round(this.quickTunnelProbeMs / 1e3)} seconds` : ""}.`);
      return;
    }
    if (!proxyUrl) throw new Error("The Cloudflare edge route is set to proxy, but no HTTP proxy is configured (http.proxy or the system proxy), so OpenCode could not reach the Cloudflare edge through a proxy.");
    if (!this.edgeRelay || this.edgeRelayProxy !== proxyUrl) {
      await this.closeEdgeRelay();
      this.edgeRelay = await startEdgeRelay({ proxyUrl, log: (line) => this.output.appendLine(line) });
      this.edgeRelayProxy = proxyUrl;
    }
    this.output.appendLine(`[bridge] quick tunnel: own cloudflared config, HTTP/2 through the local relay 127.0.0.1:${this.edgeRelay.port} and the HTTP proxy (CONNECT to the Cloudflare edge on port 7844).`);
  }
  /**
   * Ask trycloudflare.com for the Quick Tunnel ourselves: cloudflared's own request ignores HTTP proxies, so once this IP
   * is rate-limited (429 / error 1015) every start fails. Try direct first, then through the tunnel HTTP proxy; cloudflared
   * then runs with the returned credentials and still connects to the edge on the chosen route.
   */
  async provisionQuickTunnel(configFile) {
    const api = "https://api.trycloudflare.com/tunnel";
    const proxyUrl = this.tunnelProxyUrl(api);
    const routes = [void 0];
    if (proxyUrl) routes.push(proxyUrl);
    let limited = false;
    let lastError = "";
    for (const via of routes) {
      const args = via ? ["-x", via] : ["--noproxy", "*"];
      args.push("-s", "-m", "25", "-X", "POST", "-w", "\n%{http_code}", api);
      let out = "";
      try {
        out = String((await execFileAsync2(process.platform === "win32" ? "curl.exe" : "curl", args, { windowsHide: true, timeout: 3e4, cwd: import_node_os7.default.tmpdir() })).stdout ?? "");
      } catch (error2) {
        lastError = error2 instanceof Error ? error2.message.split("\n")[0] : String(error2);
        continue;
      }
      const nl = out.lastIndexOf("\n");
      const code = Number(out.slice(nl + 1).trim());
      const body = nl >= 0 ? out.slice(0, nl) : "";
      if (code === 429 || code !== 200 && /1015/.test(body)) {
        limited = true;
        this.output.appendLine(`[bridge] quick tunnel API ${via ? "through the HTTP proxy" : "direct"}: rate limited (429 / error 1015).`);
        continue;
      }
      let result;
      try { result = JSON.parse(body)?.result; } catch { result = void 0; }
      if (code !== 200 || !result?.id || !result?.secret || !result?.hostname) {
        lastError = `HTTP ${code}`;
        continue;
      }
      const credsFile = import_node_path27.default.join(import_node_path27.default.dirname(configFile), "quick-tunnel-credentials.json");
      await (0, import_promises12.writeFile)(credsFile, JSON.stringify({ AccountTag: result.account_tag, TunnelSecret: result.secret, TunnelID: result.id }), { encoding: "utf8", mode: 384 });
      this.output.appendLine(`[bridge] quick tunnel requested ${via ? "through the HTTP proxy" : "directly"}; cloudflared runs with its credentials.`);
      return { host: String(result.hostname).toLowerCase(), id: String(result.id), credsFile };
    }
    if (limited) throw new Error("quick tunnel provisioning failed with status 429: error code: 1015 (direct and through the HTTP proxy)");
    if (lastError) this.output.appendLine(`[bridge] quick tunnel pre-request unavailable (${lastError}); cloudflared requests it itself.`);
    return void 0;
  }
  async closeEdgeRelay() {
    const relay = this.edgeRelay;
    this.edgeRelay = void 0;
    this.edgeRelayProxy = void 0;
    await relay?.close();
  }
  quickTunnelRelayDetail() {
    if (this.quickTunnelRoute !== "proxy") return "";
    const error2 = this.edgeRelay?.lastError();
    return error2 ? ` Through the HTTP proxy relay: ${error2.message}` : " The tunnel went through the HTTP proxy relay.";
  }
  startTunnelProcess() {
    if (this.stoppingResources || this.stopTunnelProcessInFlight) {
      throw new Error("Bridge is stopping; refusing to start a new tunnel process.");
    }
    if (this.tunnelProcess) {
      throw new Error("A Bridge tunnel process is still active; wait for it to exit before starting another.");
    }
    if (!this.currentLocalPort()) throw new Error("Bridge local HTTP port is unavailable.");
    const isCloudflare = this.tunnelProvider === "cloudflare" || this.tunnelProvider === "cloudflare-named";
    const isTailscale = this.tunnelProvider === "tailscale";
    const command = isCloudflare ? this.cloudflaredExecutable : isTailscale ? this.tailscaleExecutable : this.ngrokExecutable;
    const commandLabel = isCloudflare ? "cloudflared" : isTailscale ? "tailscale" : "ngrok";
    const args = isTailscale ? this.tailscaleArgs("funnel", String(this.currentLocalPort())) : this.tunnelProvider === "cloudflare" ? quickTunnelArgs({ localPort: Number(this.currentLocalPort()), configFile: this.quickTunnelConfigFile, route: this.quickTunnelRoute, relayPort: this.edgeRelay?.port }) : this.tunnelProvider === "cloudflare-named" ? ["tunnel", "run"] : ["http", String(this.currentLocalPort()), "--url", `https://${this.configuredDomain}`, "--log=stdout", "--log-format=json"];
    if (this.tunnelProvider === "cloudflare" && this.quickTunnelPre) args.push("run", "--credentials-file", this.quickTunnelPre.credsFile, this.quickTunnelPre.id);
    const child = (0, import_node_child_process7.spawn)(command, args, {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: this.tunnelProcessEnvironment()
    });
    this.tunnelProcess = child;
    this.ngrokSessionOffline = false;
    this.cloudflareSessionOffline = false;
    this.recordOwnedTunnel(child.pid);
    __ocChildTree.add(child.pid);
    child.once("exit", () => __ocChildTree.delete(child.pid));
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    let stdoutTail = "";
    let stderrTail = "";
    const generation = this.tunnelGeneration;
    const target = { domain: this.configuredDomain, routeToken: this.routeToken };
    const recovery = createNgrokRecoveryObserver({
      domain: target.domain,
      isActive: () => this.tunnelProvider === "ngrok" && this.tunnelProcess === child && generation === this.tunnelGeneration && !this.stoppingResources && !this.disposed && !this.stopTunnelProcessInFlight && child.exitCode === null && child.signalCode === null && this.mcpTransport.isListening(),
      isRunning: () => this.state === "running",
      isReconnecting: () => this.ngrokSessionOffline,
      disconnected: () => {
        this.ngrokSessionOffline = true;
        this.state = "starting";
        this.lastError = "ngrok session disconnected; waiting for the owned agent to reconnect.";
        this.startFailure = classifyBridgeStartFailure(new BridgeStartError("reconnecting", this.lastError, { attempt: 1 }), { stage: "reconnect" });
        this.revision += 1;
      },
      recovered: () => {
        this.ngrokSessionOffline = false;
        this.state = "running";
        this.lastError = void 0;
        this.startFailure = void 0;
        this.revision += 1;
        this.output.appendLine("[bridge] ngrok session reconnected in place; reserved domain unchanged.");
      },
      probe: async () => (await this.requestPublicHealth(PUBLIC_HEALTH_REQUEST_TIMEOUT_MS * 3, target)).ok,
      restart: (reason) => {
        void restartOwnedTunnel(this, generation, "ngrok", reason ?? "deadline");
      },
      schedule: (callback, ms) => {
        const timer = setTimeout(callback, ms);
        timer.unref?.();
        return () => clearTimeout(timer);
      }
    });
    if (this.tunnelProvider === "ngrok") this.cancelNgrokRecoveryProbe = () => recovery.dispose();
    child.once("exit", () => recovery.dispose());
    const observe = (chunk, stdout) => {
      if (this.tunnelProvider !== "ngrok" || this.tunnelProcess !== child || this.stoppingResources) return;
      let tail = `${stdout ? stdoutTail : stderrTail}${String(chunk)}`;
      let end;
      while ((end = tail.indexOf("\n")) !== -1) {
        recovery.observe(tail.slice(0, end).trim());
        tail = tail.slice(end + 1);
      }
      if (stdout) stdoutTail = tail.slice(-16e3);
      else stderrTail = tail.slice(-16e3);
    };
    const cloudflareProvider = this.tunnelProvider;
    const cloudflareRecovery = isCloudflare ? createCloudflareRecoveryObserver({
      isActive: () => this.tunnelProcess === child && generation === this.tunnelGeneration && !this.stoppingResources && !this.disposed && !this.stopTunnelProcessInFlight && child.exitCode === null && child.signalCode === null && this.mcpTransport.isListening(),
      isRunning: () => this.state === "running",
      isReconnecting: () => this.cloudflareSessionOffline,
      disconnected: () => {
        this.cloudflareSessionOffline = true;
        this.state = "starting";
        this.lastError = "Cloudflare edge connections disconnected; waiting for the owned connector to reconnect.";
        this.startFailure = classifyBridgeStartFailure(new BridgeStartError("reconnecting", this.lastError, { attempt: 1 }), { stage: "reconnect" });
        this.revision += 1;
      },
      recovered: () => {
        this.cloudflareSessionOffline = false;
        this.state = "running";
        this.lastError = void 0;
        this.startFailure = void 0;
        this.revision += 1;
        this.output.appendLine(`[bridge] ${cloudflareProvider} edge connection re-registered; tunnel recovered in place (address unchanged).`);
      },
      // The owned cloudflared stays alive but its tunnel is gone/unauthorized (or never re-registered): stop it and
      // start again through the shared recovery loop (Quick Tunnel: new address; Named Tunnel: same token/hostname).
      restart: (reason) => {
        void restartOwnedTunnel(this, generation, cloudflareProvider, reason);
      },
      schedule: (callback, ms) => {
        const timer = setTimeout(callback, ms);
        timer.unref?.();
        return () => clearTimeout(timer);
      }
    }) : void 0;
    const cancelCloudflare = () => cloudflareRecovery?.dispose();
    if (cloudflareRecovery) {
      this.cloudflareConnectionObservers.set(child, cloudflareRecovery);
      this.cancelCloudflareRecoveryObserver = cancelCloudflare;
    }
    child.once("exit", () => {
      cancelCloudflare();
      if (this.cancelCloudflareRecoveryObserver === cancelCloudflare) this.cancelCloudflareRecoveryObserver = void 0;
    });
    let cloudflaredStdoutTail = "";
    let cloudflaredStderrTail = "";
    const seenFailures = /* @__PURE__ */ new Set();
    let suppressionNoted = false;
    const forwardCloudflared = (chunk, stdout) => {
      if (!isCloudflare) {
        this.output.append(`[${commandLabel}] ${String(chunk)}`);
        return;
      }
      let tail = `${stdout ? cloudflaredStdoutTail : cloudflaredStderrTail}${String(chunk)}`;
      let end;
      while ((end = tail.indexOf("\n")) !== -1) {
        const line = tail.slice(0, end + 1);
        tail = tail.slice(end + 1);
        cloudflareRecovery?.observe(line);
        if (cloudflaredTunnelConnectionRegistered(line)) {
          seenFailures.clear();
          suppressionNoted = false;
        }
        const repeated = /(?:unable to establish connection with cloudflare edge|tls handshake with edge error|serve tunnel error|failed to dial a quic connection|quic connection failed)/i.test(line);
        const key = repeated ? line.trim().replace(/^\S+\s+/, "").replace(/connindex=\d+/ig, "connIndex=*") : "";
        if (!key || !seenFailures.has(key)) {
          this.output.append(`[${commandLabel}] ${line}`);
          if (key && seenFailures.size < 64) seenFailures.add(key);
        } else if (!suppressionNoted) {
          suppressionNoted = true;
          this.output.append("[bridge] Repeated cloudflared edge errors suppressed in this output channel; the first occurrence remains above.\n");
        }
      }
      if (tail.length > 16e3) {
        this.output.append(`[${commandLabel}] ${tail}`);
        tail = "";
      }
      if (stdout) cloudflaredStdoutTail = tail;
      else cloudflaredStderrTail = tail;
    };
    const flushCloudflared = () => {
      if (cloudflaredStdoutTail) this.output.append(`[${commandLabel}] ${cloudflaredStdoutTail}`);
      if (cloudflaredStderrTail) this.output.append(`[${commandLabel}] ${cloudflaredStderrTail}`);
      cloudflaredStdoutTail = cloudflaredStderrTail = "";
    };
    child.stdout.on("data", (chunk) => {
      forwardCloudflared(chunk, true);
      observe(chunk, true);
    });
    child.stderr.on("data", (chunk) => {
      forwardCloudflared(chunk, false);
      observe(chunk, false);
    });
    child.on("error", (error2) => {
      try {
        flushCloudflared();
      } catch {
      }
      if (this.tunnelProcess !== child || this.stopTunnelProcessInFlight || generation !== this.tunnelGeneration) return;
      this.logDuringShutdown(`[${commandLabel}] process error: ${error2.message}`);
      this.lastError = error2.message;
      if (!this.stoppingResources && this.mcpTransport.isListening() && (this.state === "running" || this.ngrokSessionOffline || this.cloudflareSessionOffline)) {
        this.ngrokSessionOffline = false;
        this.cloudflareSessionOffline = false;
        if (!tunnelHasFixedAddress(this.tunnelProvider)) this.domain = "";
        this.state = "starting";
        this.revision += 1;
        const generation2 = this.tunnelGeneration;
        void this.stopTunnelProcess().then(() => {
          if (generation2 === this.tunnelGeneration && !this.stoppingResources && this.mcpTransport.isListening()) this.beginTunnelRecovery();
        }).catch((stopError) => {
          if (generation2 !== this.tunnelGeneration || this.stoppingResources) return;
          this.state = "error";
          this.lastError = stopError instanceof Error ? stopError.message : String(stopError);
          this.revision += 1;
        });
      }
    });
    child.on("exit", (code, signal) => {
      try {
        flushCloudflared();
      } catch {
      }
      if (this.tunnelProcess !== child || this.stopTunnelProcessInFlight) return;
      this.tunnelProcess = void 0;
      if (generation !== this.tunnelGeneration) return;
      if (!this.stoppingResources && this.mcpTransport.isListening() && (this.state === "running" || this.ngrokSessionOffline || this.cloudflareSessionOffline)) {
        this.ngrokSessionOffline = false;
        this.cloudflareSessionOffline = false;
        const message2 = `${commandLabel} exited unexpectedly (code=${String(code)}, signal=${String(signal)}); reconnecting without stopping the local MCP server.`;
        this.logDuringShutdown(`[bridge] ${message2}`);
        this.lastError = message2;
        if (!tunnelHasFixedAddress(this.tunnelProvider)) this.domain = "";
        this.state = "starting";
        this.revision += 1;
        this.beginTunnelRecovery();
      }
    });
    return child;
  }
  async waitForTunnelStartup(child) {
    await new Promise((resolve, reject) => {
      let settled = false;
      let output2 = "";
      let quickTunnelUrlReceived = false;
      let quickTunnelHostname = "";
      let quickTunnelEdgeRegistered = false;
      const cleanup = () => {
        clearTimeout(timer);
        if (probe) clearTimeout(probe);
        child.off("exit", onExit);
        child.off("error", onError);
        child.stdout.off("data", onData);
        child.stderr.off("data", onData);
      };
      const finish = (error2) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error2) reject(error2);
        else resolve();
      };
      const onExit = (code, signal) => {
        const detail = output2.trim().slice(-4e3);
        finish(new Error(`${this.tunnelProvider} tunnel exited during startup (code=${String(code)}, signal=${String(signal)}).${detail ? ` ${detail}` : ""}`));
      };
      const onError = (error2) => finish(error2);
      const onData = (chunk) => {
        output2 = `${output2}${String(chunk)}`.slice(-16e3);
        const lower = output2.toLowerCase();
        if (this.tunnelProvider === "cloudflare") {
          if (/failed to request quick tunnel/i.test(output2) && /(?:x509:|tls: failed to verify certificate|certificate signed by unknown authority|certificate is not valid for)/i.test(output2)) {
            finish(new Error(`cloudflared Quick Tunnel API TLS certificate verification failed. ${output2.trim().slice(-4e3)}`));
            return;
          }
          const matches = this.quickTunnelPre ? [`https://${this.quickTunnelPre.host}`] : output2.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/ig);
          const tunnelUrl = matches?.find((candidate) => new URL(candidate).hostname.toLowerCase() !== "api.trycloudflare.com");
          if (tunnelUrl) {
            quickTunnelHostname = new URL(tunnelUrl).hostname.toLowerCase();
            quickTunnelUrlReceived = true;
          }
          quickTunnelEdgeRegistered = this.cloudflareConnectionObservers.get(child)?.isConnected() === true;
          if (quickTunnelUrlReceived && quickTunnelEdgeRegistered) {
            if (this.tunnelProcess === child && !this.stoppingResources && this.domain !== quickTunnelHostname) {
              this.domain = quickTunnelHostname;
              this.revision += 1;
            }
            finish();
          }
          return;
        }
        if (this.tunnelProvider === "tailscale") {
          const enableUrl = output2.match(/https:\/\/login\.tailscale\.com\/[^\s"']+/i)?.[0];
          if (enableUrl || lower.includes("funnel is not enabled") || lower.includes("not available") || lower.includes("needslogin") || lower.includes("access denied")) {
            finish(new Error(`Tailscale Funnel \u6CA1\u6709\u5F00\u542F\u6216\u65E0\u6743\u9650${enableUrl ? `\uFF0C\u6253\u5F00 ${enableUrl} \u5F00\u542F\u540E\u518D\u542F\u52A8 Bridge` : ""}\u3002 ${output2.trim().slice(-2e3)}`));
            return;
          }
          const url3 = output2.match(/https:\/\/[a-z0-9.-]+\.ts\.net/i)?.[0];
          if (url3 && lower.includes("available on the internet")) {
            const host = new URL(url3).hostname.toLowerCase();
            if (this.tunnelProcess === child && !this.stoppingResources && this.domain !== host) {
              this.domain = host;
              this.tailscaleDomain = host;
              this.revision += 1;
            }
            finish();
          }
          return;
        }
        if (this.tunnelProvider === "cloudflare-named") {
          if (lower.includes("invalid tunnel token") || lower.includes("failed to parse token") || lower.includes("authentication failed") || lower.includes("unauthorized")) {
            finish(new Error(`Cloudflare Named Tunnel authentication failed. Rotate or recopy the Tunnel Token. ${output2.trim().slice(-4e3)}`));
            return;
          }
          if (lower.includes("registered tunnel connection") || lower.includes("connection registered") || lower.includes("initial protocol")) {
            finish();
          }
          return;
        }
        if (isNgrokEndpointBusy(output2)) {
          finish(ngrokStartFailure(output2));
          return;
        }
        if (output2.split(/\r?\n/).some((line) => ngrokSessionStatusLine(line.trim(), this.configuredDomain) === "online")) {
          finish();
          return;
        }
        if (lower.includes("err_ngrok_9009") || lower.includes("pay-as-you-go")) {
          finish(new Error(`ngrok cannot run through an HTTP/S proxy on the Free plan (ERR_NGROK_9009). Bridge starts ngrok with proxy variables removed, so check the ngrok config file (for example %LOCALAPPDATA%\\ngrok\\ngrok.yml) for a proxy_url entry and remove it, switch the proxy client to TUN mode with the system proxy off, or upgrade ngrok to a Pay-as-you-go plan and set opencode.bridge.ngrokUseHttpProxy to reuse this proxy. ${output2.trim().slice(-2e3)}`));
          return;
        }
        if (lower.includes("err_ngrok_") || lower.includes("endpoint is already online") || lower.includes("failed to start tunnel")) {
          finish(ngrokStartFailure(output2));
        }
      };
      child.once("exit", onExit);
      child.once("error", onError);
      child.stdout.on("data", onData);
      child.stderr.on("data", onData);
      const timer = setTimeout(() => {
        if (this.tunnelProvider === "cloudflare") {
          const reason = quickTunnelUrlReceived ? "cloudflared created a trycloudflare.com URL but did not register a Cloudflare edge connection within 120 seconds" : "cloudflared did not provide a trycloudflare.com URL within 120 seconds";
          const relayDetail = this.quickTunnelRelayDetail();
          finish(new Error(`${reason}.${relayDetail}${cloudflaredEdgeFailureHint(output2 + relayDetail, this.quickTunnelRoute === "proxy")} ${output2.trim().slice(-4e3)}`));
        } else if (this.tunnelProvider === "tailscale") {
          finish(new Error(`tailscale funnel \u5728 30 \u79D2\u5185\u6CA1\u6709\u786E\u8BA4\u516C\u7F51\u5730\u5740\u3002 ${output2.trim().slice(-2e3)}`));
        } else if (this.tunnelProvider === "ngrok") {
          finish(new Error("ngrok did not confirm the reserved endpoint within 60 seconds. The endpoint is not reported online; check the owned agent log and ngrok Active Endpoints dashboard."));
        } else {
          finish();
        }
      }, this.tunnelProvider === "cloudflare" ? 12e4 : this.tunnelProvider === "ngrok" ? 6e4 : this.tunnelProvider === "tailscale" ? 3e4 : 5e3);
      const probe = this.tunnelProvider === "cloudflare" && this.quickTunnelProbeMs > 0 ? setTimeout(() => {
        if (quickTunnelUrlReceived && !quickTunnelEdgeRegistered) {
          finish(new Error(`cloudflared created a trycloudflare.com URL but did not register a Cloudflare edge connection within ${Math.round(this.quickTunnelProbeMs / 1e3)} seconds on the direct route.${cloudflaredEdgeFailureHint(output2)} ${output2.trim().slice(-4e3)}`));
        }
      }, this.quickTunnelProbeMs) : void 0;
    });
    if (this.tunnelProvider === "cloudflare" && !this.cloudflareConnectionObservers.get(child)?.isConnected()) {
      throw new Error("Cloudflare edge connection was lost before startup verification completed.");
    }
  }
  publicHealthUrl() {
    return `https://${this.domain}/healthz/${this.routeToken}`;
  }
  async requestPublicHealth(totalTimeoutMs = PUBLIC_HEALTH_REQUEST_TIMEOUT_MS * 3, target) {
    try {
      const url2 = new URL(target ? `https://${target.domain}/healthz/${target.routeToken}` : this.publicHealthUrl());
      const headers = this.tunnelProvider === "ngrok" ? { "ngrok-skip-browser-warning": "true" } : void 0;
      const httpConfiguration = vscode9.workspace.getConfiguration("http");
      const configuredProxy = httpConfiguration.get("proxy")?.trim();
      const proxySupport = httpConfiguration.get("proxySupport");
      const proxyUrl = proxySupport === "off" ? void 0 : resolveExtensionHostProxy(url2, configuredProxy);
      const boundedTimeoutMs = Math.max(1e3, Math.min(totalTimeoutMs, PUBLIC_HEALTH_REQUEST_TIMEOUT_MS * 3));
      const response = await fetchWithExtensionHostFallbacks(url2, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(boundedTimeoutMs),
        proxyUrl,
        configuredProxy,
        rejectUnauthorized: httpConfiguration.get("proxyStrictSSL", true),
        useElectron: proxySupport !== "off",
        proxySupport: proxySupport === "off" ? "off" : void 0,
        attemptTimeoutMs: Math.min(PUBLIC_HEALTH_REQUEST_TIMEOUT_MS, boundedTimeoutMs)
      });
      if (!response.ok) {
        return { ok: false, failure: { reason: `HTTP ${response.status} ${response.statusText ?? ""}`.trim(), code: `HTTP_${response.status}`, status: response.status, deterministic: false } };
      }
      const payload = await response.json().catch(() => void 0);
      return payload?.ok === true ? { ok: true } : { ok: false, failure: { reason: "health response did not confirm ok", status: response.status, deterministic: false } };
    } catch (error2) {
      return { ok: false, failure: publicHealthFailure(error2) };
    }
  }
  async waitForPublicHealth(child) {
    const configuredTimeout = vscode9.workspace.getConfiguration("opencode").get(PUBLIC_HEALTH_STARTUP_TIMEOUT_SETTING, DEFAULT_PUBLIC_HEALTH_STARTUP_TIMEOUT_MS);
    const timeoutMs = typeof configuredTimeout === "number" && Number.isFinite(configuredTimeout) ? Math.min(Math.max(configuredTimeout, 5e3), 12e4) : DEFAULT_PUBLIC_HEALTH_STARTUP_TIMEOUT_MS;
    const deadline2 = Date.now() + timeoutMs;
    let consecutiveDeterministicFailures = 0;
    while (Date.now() < deadline2) {
      if (child.exitCode !== null || child.signalCode !== null || this.tunnelProcess !== child) {
        throw new Error(`${this.tunnelProvider} tunnel exited before the public Bridge health endpoint became reachable.`);
      }
      const result = await this.requestPublicHealth(Math.max(1e3, deadline2 - Date.now()));
      if (result.ok) return;
      consecutiveDeterministicFailures = result.failure.deterministic ? consecutiveDeterministicFailures + 1 : 0;
      if (result.failure.deterministic && consecutiveDeterministicFailures >= PUBLIC_HEALTH_DETERMINISTIC_FAILURE_LIMIT) {
        throw new Error(this.publicHealthUnreachableMessage(result.failure));
      }
      await new Promise((resolve) => setTimeout(resolve, PUBLIC_HEALTH_POLL_INTERVAL_MS));
    }
    if (this.tunnelProvider === "cloudflare-named") {
      throw new Error(`Cloudflare Named Tunnel connected, but ${this.publicHealthUrl()} could not reach Bridge. In Cloudflare Tunnels, set the published application hostname to ${this.configuredNamedDomain} and its Service URL to http://127.0.0.1:${this.namedTunnelLocalPort}.`);
    }
    throw new Error(`Public Bridge health check timed out after ${Math.round(timeoutMs / 1e3)} seconds: ${this.publicHealthUrl()}`);
  }
  publicHealthUnreachableMessage(failure2) {
    const httpConfiguration = vscode9.workspace.getConfiguration("http");
    const hasProxy = Boolean(httpConfiguration.get("proxy")?.trim() || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy);
    const guidance = hasProxy ? "The health request was routed through the configured HTTP proxy and still failed. Verify the proxy can reach Cloudflare, or enable a system/global (TUN) proxy." : "This machine cannot reach the public endpoint directly. Set http.proxy to a working HTTP proxy or enable a system/global (TUN) proxy so the health check can route around the block.";
    return `Public Bridge health endpoint unreachable: ${this.publicHealthUrl()} (${failure2.reason}). ${guidance}`;
  }
  async startTunnelOnce() {
    const generation = this.tunnelGeneration;
    for (let attempt = 0; ; attempt++) {
      if (this.tunnelProvider === "cloudflare") await this.prepareQuickTunnelAttempt();
      const child = this.startTunnelProcess();
      try {
        await this.waitForTunnelStartup(child);
        if (this.tunnelProvider === "cloudflare") {
          if (this.quickTunnelRoute === "proxy") this.quickTunnelProxyWorked = true;
          this.output.appendLine(`[bridge] quick tunnel URL received and Cloudflare edge connection registered${this.quickTunnelRoute === "proxy" ? " through the HTTP proxy relay" : ""}; local health is ready and public health is not used as a startup gate: ${this.publicHealthUrl()}`);
        } else if (this.tunnelProvider === "tailscale") {
          this.output.appendLine(`[bridge] tailscale funnel started (agent-confirmed) for https://${this.domain}; public health is not used as a startup gate.`);
        } else if (this.tunnelProvider === "ngrok") {
          this.output.appendLine("[bridge] ngrok reserved endpoint started (agent-confirmed); local health is ready and public health is not used as a startup gate (endpoint available in Bridge status).");
        } else {
          await this.waitForPublicHealth(child);
          this.output.appendLine(`[bridge] public health verified: ${this.publicHealthUrl()}`);
        }
        if (this.tunnelProcess !== child) throw new Error(`${this.tunnelProvider} tunnel changed before health verification completed.`);
        return;
      } catch (error2) {
        if (this.tunnelProcess === child) await this.stopTunnelProcess();
        else this.clearOwnedTunnelRecord();
        if (this.tunnelProvider === "cloudflare" && attempt < 2 && /did not register a Cloudflare edge connection within \d+ seconds/.test(error2 instanceof Error ? error2.message : String(error2)) && !/Proxy route: the HTTP proxy accepted CONNECT on port 7844/i.test(error2 instanceof Error ? error2.message : String(error2))) {
          if (generation !== this.tunnelGeneration || this.stoppingResources || this.disposed) throw error2;
          const switchingToProxy = this.quickTunnelRoute === "direct" && this.quickTunnelProxyFallback;
          if (this.quickTunnelRoute === "direct") this.quickTunnelDirectFailed = true;
          this.lastError = switchingToProxy ? `Cloudflare edge connection timed out on the direct route; retry ${attempt + 1}/2 through the HTTP proxy relay in 5 seconds.` : `Cloudflare edge connection timed out; retry ${attempt + 1}/2 in 5 seconds. Check tunnel network reachability if this persists.`;
          this.startFailure = classifyBridgeStartFailure(new BridgeStartError("tunnel-retrying", this.lastError, { attempt: attempt + 1, total: 2, seconds: 5 }), { stage: "tunnel" });
          this.revision += 1;
          this.output.appendLine(`[bridge] ${this.lastError}`);
          await new Promise((resolve) => setTimeout(resolve, 5e3));
          if (generation !== this.tunnelGeneration || this.stoppingResources || this.disposed) throw error2;
          continue;
        }
        throw error2;
      }
    }
  }
  /** Wait for the exact owned tunnel child to exit before releasing ownership. */
  async stopTunnelProcess() {
    if (this.stopTunnelProcessInFlight) return this.stopTunnelProcessInFlight;
    const child = this.tunnelProcess;
    if (!child) {
      this.clearOwnedTunnelRecord();
      return;
    }
    const run = Promise.resolve().then(() => this.terminateOwnedTunnelProcess(child));
    this.stopTunnelProcessInFlight = run;
    try {
      await run;
      if (this.tunnelProcess === child) this.tunnelProcess = void 0;
      this.clearOwnedTunnelRecord();
    } finally {
      if (this.stopTunnelProcessInFlight === run) this.stopTunnelProcessInFlight = void 0;
    }
  }
  /**
   * Close only OUR ngrok tunnels via the local agent API, matched by local
   * port (a foreign agent on 4040 is left alone). Never throws: any failure
   * falls through to process termination.
   */
  async closeOwnedNgrokTunnelsGracefully() {
    const localPort = this.currentLocalPort();
    if (!localPort) return;
    let tunnels;
    try {
      const response = await fetch(`${NGROK_AGENT_API_BASE_URL}/api/tunnels`, { signal: AbortSignal.timeout(NGROK_AGENT_API_TIMEOUT_MS) });
      if (!response.ok) return;
      const payload = await response.json().catch(() => void 0);
      tunnels = Array.isArray(payload?.tunnels) ? payload.tunnels : [];
    } catch {
      return;
    }
    for (const entry of tunnels) {
      const tunnel = entry;
      const name = typeof tunnel?.name === "string" ? tunnel.name : "";
      const addr = typeof tunnel?.config?.addr === "string" ? tunnel.config.addr : "";
      if (!name || addr !== String(localPort) && !addr.includes(`:${localPort}`)) continue;
      try {
        await fetch(`${NGROK_AGENT_API_BASE_URL}/api/tunnels/${encodeURIComponent(name)}`, { method: "DELETE", signal: AbortSignal.timeout(NGROK_AGENT_API_TIMEOUT_MS) });
        this.output.appendLine(`[bridge] closed ngrok tunnel '${name}' gracefully before shutdown.`);
      } catch {
      }
    }
  }
  async terminateOwnedTunnelProcess(child) {
    if (child.exitCode !== null || child.signalCode !== null || child.pid === void 0) return;
    if (this.tunnelProvider === "ngrok") {
      try {
        await this.closeOwnedNgrokTunnelsGracefully();
      } catch {
      }
    }
    return new Promise((resolve, reject) => {
      let settled = false;
      let terminateTimer;
      let killTimer;
      const finish = (error2) => {
        if (settled) return;
        settled = true;
        if (terminateTimer) clearTimeout(terminateTimer);
        if (killTimer) clearTimeout(killTimer);
        child.off("exit", onExit);
        child.off("close", onExit);
        child.off("error", onError);
        if (error2) reject(error2);
        else resolve();
      };
      const onExit = () => finish();
      const onError = (error2) => finish(error2);
      const forceKill = () => {
        if (child.exitCode !== null || child.signalCode !== null) {
          finish();
          return;
        }
        if (process.platform === "win32" && child.pid) {
          void execFileAsync2("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, timeout: TUNNEL_KILL_GRACE_MS }).catch(() => {
            try {
              child.kill("SIGKILL");
            } catch {
            }
          });
        } else {
          try {
            child.kill("SIGKILL");
          } catch {
          }
        }
        killTimer = setTimeout(() => {
          finish(new Error("Bridge tunnel process did not exit after graceful termination and force kill; its ownership is retained and a replacement will not be started."));
        }, TUNNEL_KILL_GRACE_MS);
        killTimer.unref?.();
      };
      child.once("exit", onExit);
      child.once("close", onExit);
      child.once("error", onError);
      terminateTimer = setTimeout(forceKill, TUNNEL_TERMINATE_GRACE_MS);
      terminateTimer.unref?.();
      try {
        child.kill("SIGTERM");
      } catch (error2) {
        finish(error2 instanceof Error ? error2 : new Error(String(error2)));
      }
    });
  }
  isDeterministicTunnelFailure(error2) {
    return this.tunnelProvider === "ngrok" && isNonRetryableNgrokFailure(error2);
  }
  beginTunnelRecovery() {
    if (this.stoppingResources || !this.mcpTransport.isListening()) return;
    if (this.tunnelRecoveryPromise && this.tunnelRecoveryGeneration === this.tunnelGeneration) return;
    const generation = this.tunnelGeneration;
    const previousDomain = tunnelHasFixedAddress(this.tunnelProvider) ? this.domain : "";
    const recovery = (async () => {
      let attempt = 0;
      let rateLimited = false;
      this.noteReconnecting(1);
      while (!this.stoppingResources && this.mcpTransport.isListening() && generation === this.tunnelGeneration) {
        const delayMs = tunnelRecoveryDelayMs(this.tunnelProvider, attempt, rateLimited);
        if (rateLimited) this.output.appendLine(`[bridge] trycloudflare.com rate limit (429 / error 1015); waiting ${Math.round(delayMs / 60e3)} minutes before the next Quick Tunnel request.`);
        rateLimited = false;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        if (this.stoppingResources || !this.mcpTransport.isListening() || generation !== this.tunnelGeneration) return;
        try {
          this.output.appendLine(`[bridge] ${this.tunnelProvider} reconnect attempt ${attempt + 1}...`);
          await this.startTunnelOnce();
          if (generation !== this.tunnelGeneration || this.stoppingResources) return;
          this.state = "running";
          this.lastError = void 0;
          this.startFailure = void 0;
          this.revision += 1;
          this.output.appendLine(tunnelRecoveredMessage(this.tunnelProvider, this.getStatus().publicUrl, previousDomain, this.domain));
          return;
        } catch (error2) {
          this.lastError = error2 instanceof Error ? error2.message : String(error2);
          this.output.appendLine(`[bridge] ${this.tunnelProvider} reconnect attempt ${attempt + 1} failed: ${this.lastError}`);
          if (this.tunnelProvider === "cloudflare") {
            rateLimited = QUICK_TUNNEL_RATE_LIMIT_PATTERN.test(this.lastError ?? "");
            // The proxy relay is only a fallback for a failed direct route. When it fails too,
            // forget both verdicts so the next attempt probes direct again: the network may have
            // recovered while the proxy keeps failing (seen: a proxy answering :7844 with a 2020 cert).
            if (this.quickTunnelRoute === "proxy") {
              this.quickTunnelDirectFailed = false;
              this.quickTunnelProxyWorked = false;
            }
          }
          if (tunnelRecoveryShouldStop(this.tunnelProvider, error2, attempt + 1)) {
            this.state = "error";
            this.recordStartFailure(error2, "reconnect");
            this.revision += 1;
            this.output.appendLine(`[bridge] ${this.tunnelProvider} stopped reconnecting: this failure is deterministic and will not resolve by retrying.`);
            return;
          }
          attempt += 1;
          this.noteReconnecting(attempt + 1);
        }
      }
    });
    let trackedRecovery;
    trackedRecovery = recovery().finally(() => {
      if (this.tunnelRecoveryPromise === trackedRecovery) {
        this.tunnelRecoveryPromise = void 0;
        this.tunnelRecoveryGeneration = void 0;
      }
    });
    this.tunnelRecoveryGeneration = generation;
    this.tunnelRecoveryPromise = trackedRecovery;
  }
  /** Master switch for Agent Skills; JSON manifests are never affected. */
  skillsEnabled() {
    return vscode9.workspace.getConfiguration("opencode").get(BRIDGE_SKILLS_ENABLED_SETTING, true);
  }
  customToolRoots() {
    return vscode9.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];
  }
  workspaceRoots() {
    const roots2 = vscode9.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];
    if (!roots2.length) throw new Error("No workspace folder is open.");
    return roots2;
  }
  /**
   * File-tool boundary (0.7.7): workspace folders first (relative paths keep resolving there), then the
   * configured global Skill directory so agents can read and patch Skill instructions without
   * PATH_OUTSIDE_WORKSPACE. Only that one directory is added; the rest of the host stays outside.
   * A missing directory is tolerated by canonicalizeWorkspaceRoots().
   */
  fileToolRoots(toolName) {
    const roots2 = vscode9.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];
    let skills;
    try {
      skills = globalSkillsDirectory();
    } catch {
      skills = void 0;
    }
    if (skills && !roots2.some((root) => import_node_path27.default.resolve(root).toLowerCase() === import_node_path27.default.resolve(skills).toLowerCase())) roots2.push(skills);
    // The packaged instruction is readable without granting patch/write access to the extension.
    const bundled = bundledLeanreaReadRoot(this.context.extensionPath, toolName);
    if (bundled && !roots2.some((root) => import_node_path27.default.resolve(root).toLowerCase() === import_node_path27.default.resolve(bundled).toLowerCase())) roots2.push(bundled);
    if (this.readWorkspaceScope() === "device") {
      for (const root of deviceFileRoots()) {
        if (!roots2.some((existing) => import_node_path27.default.resolve(existing).toLowerCase() === import_node_path27.default.resolve(root).toLowerCase())) roots2.push(root);
      }
    }
    if (!roots2.length) throw new Error("No allowed file roots are available.");
    return roots2;
  }
  /**
   * 访问控制停止 Bridge 后记录停止原因（只影响展示；何时停止、如何续期不变）。
   * 必须在 stop() 之后调用：正常停止会清掉上一轮的失败信息。
   */
  noteAccessStop(reason, detail) {
    this.startFailure = classifyBridgeStartFailure(new BridgeStartError(reason, detail), { stage: "access" });
    this.revision += 1;
  }
  async stop() {
    if (this.stopPromise) return this.stopPromise;
    this.lifecycleGeneration += 1;
    const pendingStart = this.startPromise;
    const run = (async () => {
      await this.stopResources(true);
      if (pendingStart) {
        await pendingStart.catch(() => void 0);
        await this.stopResources(true);
      }
      return this.getStatus();
    })();
    this.stopPromise = run;
    try {
      return await run;
    } finally {
      if (this.stopPromise === run) this.stopPromise = void 0;
    }
  }
  logDuringShutdown(message2) {
    try {
      this.output.appendLine(message2);
    } catch {
    }
  }
  async stopResources(markStopped) {
    if (!this.stoppingResources) this.tunnelGeneration += 1;
    this.stoppingResources = true;
    this.cancelNgrokRecoveryProbe?.();
    this.cancelCloudflareRecoveryObserver?.();
    try {
      try {
        this.mcpTransport.destroySessionsAndStopPruning();
      } catch (error2) {
        this.logDuringShutdown(`[bridge] session teardown failed during stop (continuing to tunnel shutdown): ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
      try {
        await this.nativeRea?.closeAll();
        await this.externalRegistry?.stopAll();
      } catch (error2) {
        this.logDuringShutdown(`[external-mcp] shutdown incomplete (continuing to tunnel shutdown): ${error2 instanceof Error ? error2.message : String(error2)}`);
      }
      await this.stopTunnelProcess();
      await this.closeEdgeRelay();
      this.quickTunnelDirectFailed = false;
      this.quickTunnelProxyWorked = false;
      await this.mcpTransport.closeListener();
      if (this.releaseTunnelLease) {
        const release = this.releaseTunnelLease;
        this.releaseTunnelLease = void 0;
        try {
          await release();
        } catch (error2) {
          this.logDuringShutdown(`[bridge] tunnel lease release failed during stop (continuing): ${error2 instanceof Error ? error2.message : String(error2)}`);
        }
      }
      if (this.tunnelProvider === "cloudflare") this.domain = "";
      if (markStopped) {
        this.state = "stopped";
        this.lastError = void 0;
        this.startFailure = void 0;
        this.logDuringShutdown("[bridge] stopped");
      }
    } catch (error2) {
      this.state = "error";
      this.lastError = error2 instanceof Error ? error2.message : String(error2);
      throw error2;
    } finally {
      this.stoppingResources = false;
    }
  }
  async disposeAsync() {
    this.disposed = true;
    this.unsubscribeExternalCatalog?.();
    if (this.externalTrustTimer) clearInterval(this.externalTrustTimer);
    try {
      await this.stopResources(true);
    } finally {
      await this.externalRegistry?.dispose();
    }
  }
  dispose() {
    this.disposed = true;
    this.unsubscribeExternalCatalog?.();
    if (this.externalTrustTimer) clearInterval(this.externalTrustTimer);
    void this.stopResources(true).catch((error2) => {
      this.logDuringShutdown(`[bridge] shutdown failed: ${error2 instanceof Error ? error2.message : String(error2)}`);
    });
  }
};
// Windows does not end child processes with their parent: track spawned helper trees and end them when the extension host exits,
// so nothing keeps files under the portable install (e.g. data\tmp) open after OpenCode closes.
var __ocChildTree = globalThis.__opencodeChildTree ??= (() => { const pids = new Set(); const killTree = (pid) => { if (!pid) return false; try { if (process.platform === "win32") { const r = require("node:child_process").spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, timeout: 5e3, stdio: "ignore" }); return r.status === 0; } process.kill(pid, "SIGKILL"); return true; } catch { return false; } }; process.once("exit", () => { for (const pid of pids) killTree(pid); pids.clear(); }); return { add: (pid) => { if (pid) pids.add(pid); }, delete: (pid) => { pids.delete(pid); }, killTree }; })();
export { publicHealthFailure, cloudflaredEdgeFailureHint, bridgeWorkspaceScopeInstructions, normalizeHttpsHostname, normalizeNgrokDomain, normalizeCloudflareNamedDomain, normalizeNamedTunnelLocalPort, cancellationFromAbortSignal, import_node_child_process7, import_node_path27, import_node_util2, vscode9, import_promises12, import_node_os7, execFileAsync2, NGROK_DOMAIN_SETTING, NGROK_DOMAIN_STATE_KEY, CLOUDFLARE_NAMED_DOMAIN_SETTING, CLOUDFLARE_NAMED_DOMAIN_STATE_KEY, CLOUDFLARE_NAMED_TOKEN_SECRET, CLOUDFLARE_NAMED_LOCAL_PORT_SETTING, TUNNEL_PROVIDER_SETTING, CUSTOM_INSTRUCTIONS_SETTING, BRIDGE_SKILLS_ENABLED_SETTING, BRIDGE_WORKSPACE_SCOPE_SETTING, NGROK_USE_HTTP_PROXY_SETTING, DEFAULT_PUBLIC_HEALTH_STARTUP_TIMEOUT_MS, PUBLIC_HEALTH_STARTUP_TIMEOUT_SETTING, PUBLIC_HEALTH_REQUEST_TIMEOUT_MS, PUBLIC_HEALTH_POLL_INTERVAL_MS, PUBLIC_HEALTH_DETERMINISTIC_FAILURE_LIMIT, TUNNEL_RESTART_BACKOFF_MS, TUNNEL_TERMINATE_GRACE_MS, TUNNEL_KILL_GRACE_MS, NGROK_AGENT_API_BASE_URL, NGROK_AGENT_API_TIMEOUT_MS, CLOUDFLARED_WINGET_PACKAGE, DEFAULT_CLOUDFLARE_NAMED_LOCAL_PORT, BridgeManager };
