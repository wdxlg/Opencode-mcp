// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/networkDiagnosticsAction.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { appendEscapedMarkdownCodeBlockFence } from "./module-0462.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Categories } from "./module-0847.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IAgentHostConnectionsService } from "./module-0959.mjs";
import { INativeHostService } from "./module-2591.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/networkDiagnosticsAction.ts
function registerNetworkDiagnosticsAction() {
  registerAction2(NetworkDiagnosticsAction);
}

async function collectNetworkDiagnostics(connectionsService, nativeHostService) {
  const connections = connectionsService.connections;
  const remoteCount = connections.filter((c) => !c.isAmbient).length;
  let output = "# Agent Host Network Diagnostics\n\n";
  output += await formatLocalProxyConfig(nativeHostService);
  output += `- Connections: ${connections.length} (1 local, ${remoteCount} remote)

`;
  output += "Connectivity probes run inside each agent host process (local or remote), so results reflect the environment the Copilot SDK actually connects from.\n\n";
  for (const info of connections) {
    const heading2 = info.isAmbient ? "Local agent host" : `Remote: ${info.name}`;
    output += `## ${heading2}

`;
    if (info.address) {
      output += `- address: ${info.address}
`;
    }
    if (!info.connection) {
      output += "- Not connected.\n\n";
      continue;
    }
    try {
      output += await formatConnectionNetworkDiagnostics(info.connection, nativeHostService);
    } catch (err) {
      output += `- Failed to run network diagnostics: ${err instanceof Error ? err.message : String(err)}

`;
    }
  }
  return output;
}

async function formatLocalProxyConfig(nativeHostService) {
  let output = "## Local OS Proxy Configuration (@vscode/os-proxy-resolver)\n\n";
  try {
    const config = await nativeHostService.readProxyConfigWithPackage();
    output += `- Proxy environment: ${formatEnvironmentProxyConfig(config.environment)}
`;
    output += `- Auto-detect: ${config.autoDetect}
`;
    output += `- DHCP WPAD: ${formatPacSourceStatus(config.wpadDhcp)}
`;
    output += `- DNS WPAD: ${formatPacSourceStatus(config.wpadDns)}
`;
    output += `- Configured PAC: ${formatPacSourceStatus(config.configuredPac)}
`;
    output += `- PAC: ${formatPacConfig(config)}
`;
    if (config.pac) {
      output += `
${appendEscapedMarkdownCodeBlockFence(config.pac.content, "js")}

`;
    }
    output += `- Static rules: ${formatStaticProxyRules(config.staticRules)}
`;
    output += `- Platform settings: ${formatPlatformProxyConfig(config.platform)}

`;
  } catch (err) {
    output += `- Error: ${err instanceof Error ? err.message : String(err)}

`;
  }
  return output;
}

function formatEnvironmentProxyConfig(environment) {
  const values = [environment.httpProxy, environment.httpsProxy, environment.allProxy, environment.noProxy];
  const configured = values.filter((value2) => value2 !== void 0);
  return configured.length ? configured.map((value2) => `${value2.variable}=${value2.value}${value2.error ? ` (error: ${value2.error})` : ""}`).join(", ") : "(none)";
}

function formatPacSourceStatus(status2) {
  const details = [status2.url && `URL=${status2.url}`, status2.error && `error=${status2.error}`].filter((value2) => !!value2);
  return details.length ? `${status2.state} (${details.join(", ")})` : status2.state;
}

function formatPacConfig(config) {
  const values = [];
  if (config.pacUrl) {
    values.push(`configured URL=${config.pacUrl}`);
  }
  if (config.pac) {
    values.push(`loaded URL=${config.pac.url}, source=${config.pac.source}, size=${config.pac.content.length} characters`);
  }
  return values.length ? values.join("; ") : "(none)";
}

function formatStaticProxyRules(rules) {
  if (!rules) {
    return "(none)";
  }
  return [
    `HTTP=${rules.http ? formatProxy(rules.http) : "(none)"}`,
    `HTTPS=${rules.https ? formatProxy(rules.https) : "(none)"}`,
    `SOCKS=${rules.socks ? formatProxy(rules.socks) : "(none)"}`
  ].join(", ");
}

function formatPlatformProxyConfig(platform3) {
  if (!platform3) {
    return "(none)";
  }
  switch (platform3.kind) {
    case "windows":
      return `Windows, proxy=${platform3.proxy ?? "(none)"}, bypass=${platform3.proxyBypass ?? "(none)"}`;
    case "macos":
      return `macOS, exceptions=${formatValues(platform3.exceptions)}, exclude simple hostnames=${platform3.excludeSimpleHostnames}`;
    case "linux":
      return `Linux, mode=${platform3.mode ?? "(none)"}, ignored hosts=${formatValues(platform3.ignoreHosts)}`;
    case "unknown":
      return "Unknown";
  }
}

function formatValues(values) {
  return values.length ? values.join(", ") : "(none)";
}

async function formatConnectionNetworkDiagnostics(connection, nativeHostService) {
  const info = await connection.getNetworkDiagnosticsInfo();
  let output = "";
  output += `- Agent host version: ${info.version}
`;
  output += `- OS: ${info.os} (${info.arch})
`;
  output += `- Account: ${info.account ?? "(unknown)"}
`;
  output += `- Proxy settings: ${formatKeyValues(info.proxySettings)}
`;
  output += `- Proxy environment: ${formatKeyValues(info.proxyEnv)}

`;
  const probes = await Promise.all(info.endpoints.map(async (endpoint) => ({
    endpoint,
    result: await connection.diagnosticsFetch(endpoint.url)
  })));
  for (const { endpoint, result } of probes) {
    output += await formatEndpointSection(endpoint, result, nativeHostService);
  }
  return output;
}

function formatKeyValues(values) {
  const entries2 = Object.entries(values);
  return entries2.length ? entries2.map(([key3, value2]) => `${key3}=${value2}`).join(", ") : "(none)";
}

async function formatEndpointSection(endpoint, result, nativeHostService) {
  let output = `### ${endpoint.name}

`;
  output += `- URL: ${result.url}
`;
  output += `- DNS IPv4: ${formatDnsResult(result.dnsIpv4)}
`;
  output += `- DNS IPv6: ${formatDnsResult(result.dnsIpv6)}
`;
  output += `- Proxy: ${result.proxyUrl ?? "None"}
`;
  try {
    const proxies = await nativeHostService.resolveProxyWithPackage(result.url);
    output += `- Local OS proxy (@vscode/os-proxy-resolver): ${formatProxies(proxies)}
`;
  } catch (err) {
    output += `- Local OS proxy (@vscode/os-proxy-resolver): error: ${err instanceof Error ? err.message : String(err)}
`;
  }
  output += `- Reachability: ${formatReachability(endpoint, result)}

`;
  return output;
}

function formatProxies(proxies) {
  return proxies.length ? proxies.map(formatProxy).join(", ") : "(none)";
}

function formatProxy(proxy) {
  return proxy.host ? `${proxy.kind} ${proxy.host}` : proxy.kind;
}

function formatDnsResult(dns) {
  if (!dns) {
    return "n/a";
  }
  return dns.address ? `${dns.address} (${dns.durationMs} ms)` : `error (${dns.durationMs} ms): ${dns.error ?? "unknown"}`;
}

function formatReachability(endpoint, result) {
  const PASS_MARK = "\u2713", FAIL_MARK = "\u2717";
  const duration = result.durationMs !== void 0 ? ` (${result.durationMs} ms)` : "";
  if (result.error !== void 0) {
    return `${FAIL_MARK} ${result.error}${duration}`;
  }
  const connectVia = result.proxyUrl ? "proxy" : "direct";
  const expectedStatus = endpoint.expectedStatus ?? 200;
  const failures = [];
  if (result.statusCode !== expectedStatus) {
    failures.push(`status ${result.statusCode ?? "?"} (expected ${expectedStatus})`);
  }
  if (endpoint.expectedContent && !(result.body ?? "").includes(endpoint.expectedContent)) {
    failures.push(`missing "${endpoint.expectedContent}"`);
  }
  return failures.length ? `${FAIL_MARK} ${failures.join(", ")} via ${connectVia}${duration}` : `${PASS_MARK} ${result.statusCode} via ${connectVia}${duration}`;
}

var NetworkDiagnosticsAction = class _NetworkDiagnosticsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.agentHostNetworkDiagnostics";
  }
  constructor() {
    super({
      id: _NetworkDiagnosticsAction.ID,
      title: localize2(13526, "Network Diagnostics"),
      icon: Codicon.plug,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const connectionsService = accessor.get(IAgentHostConnectionsService);
    const nativeHostService = accessor.get(INativeHostService);
    const contents = await collectNetworkDiagnostics(connectionsService, nativeHostService);
    await editorService.openEditor({
      resource: void 0,
      contents,
      languageId: "markdown",
      options: {
        pinned: true
      }
    });
  }
};
export { registerNetworkDiagnosticsAction, collectNetworkDiagnostics, formatLocalProxyConfig, formatEnvironmentProxyConfig, formatPacSourceStatus, formatPacConfig, formatStaticProxyRules, formatPlatformProxyConfig, formatValues, formatConnectionNetworkDiagnostics, formatKeyValues, formatEndpointSection, formatProxies, formatProxy, formatDnsResult, formatReachability, NetworkDiagnosticsAction };
