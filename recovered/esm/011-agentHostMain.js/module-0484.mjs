// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/networkDiagnosticsService.ts
import { createDecorator } from "./module-0044.mjs";
import { AgentHostProxyConfigKey, agentHostProxyConfigSchema } from "./module-0057.mjs";
import { IRequestService, NO_FETCH_TELEMETRY } from "./module-0146.mjs";
import { CancellationToken } from "./module-0017.mjs";
import { streamToBuffer } from "./module-0029.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostProxyResolver } from "./module-0140.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IProductService } from "./module-0173.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/networkDiagnosticsService.ts
import { lookup } from "dns";

var INetworkDiagnosticsService = createDecorator("networkDiagnosticsService");

var PROBE_TIMEOUT_MS = 1e4;

var MAX_BODY_CHARS = 64 * 1024;

var PROXY_ENV_KEYS = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy", "NO_PROXY", "no_proxy", "COPILOT_PROXY_KERBEROS_SPN"];

var PROXY_CONFIG_KEYS = [AgentHostProxyConfigKey.Proxy, AgentHostProxyConfigKey.NoProxy, AgentHostProxyConfigKey.ProxyKerberosServicePrincipal];

var NetworkDiagnosticsService = class {
  constructor(_requestService, _proxyResolver, _configurationService, _productService, _logService) {
    this._requestService = _requestService;
    this._proxyResolver = _proxyResolver;
    this._configurationService = _configurationService;
    this._productService = _productService;
    this._logService = _logService;
  }
  async getInfo(endpoints, account) {
    const proxyEnv = {};
    for (const key of PROXY_ENV_KEYS) {
      const value = process.env[key];
      if (value) {
        proxyEnv[key] = value;
      }
    }
    const proxySettings = {};
    for (const key of PROXY_CONFIG_KEYS) {
      const value = this._configurationService.getRootValue(agentHostProxyConfigSchema, key);
      if (value === void 0 || value === "" || Array.isArray(value) && value.length === 0) {
        continue;
      }
      proxySettings[key] = Array.isArray(value) ? value.join(", ") : String(value);
    }
    return {
      version: this._productService.version,
      os: process.platform,
      arch: process.arch,
      account,
      proxySettings,
      proxyEnv,
      endpoints
    };
  }
  /**
   * Probe connectivity from the agent host process to a single `url`. Resolves
   * the proxy (for reporting), performs an IPv4 DNS lookup, and then a
   * reachability request through {@link IRequestService} — so the probe
   * traverses the same proxy / TLS / certificate stack the rest of VS Code
   * uses. Each step is individually timed and never throws; failures are
   * captured on the result.
   */
  async fetch(url2) {
    const target = new URL(url2);
    const host = target.hostname;
    const [dnsIpv4, dnsIpv6] = await Promise.all([
      resolveDns(host, 4),
      resolveDns(host, 6)
    ]);
    let proxyUrl;
    try {
      proxyUrl = await this._proxyResolver.resolveProxy(url2);
    } catch (err) {
      this._logService.debug(`[AgentHost] Network diagnostics: proxy resolution for ${url2} failed: ${errorMessage2(err)}`);
    }
    const base = {
      url: url2,
      proxyUrl,
      dnsIpv4,
      dnsIpv6
    };
    const probeStart = Date.now();
    try {
      const context = await this._requestService.request({
        url: url2,
        type: "GET",
        timeout: PROBE_TIMEOUT_MS,
        callSite: NO_FETCH_TELEMETRY
      }, CancellationToken.None);
      const body = (await streamToBuffer(context.stream)).toString();
      return {
        ...base,
        statusCode: context.res.statusCode,
        body: body.length > MAX_BODY_CHARS ? body.slice(0, MAX_BODY_CHARS) : body,
        durationMs: Date.now() - probeStart
      };
    } catch (err) {
      return {
        ...base,
        error: errorMessage2(err),
        durationMs: Date.now() - probeStart
      };
    }
  }
};

NetworkDiagnosticsService = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, IAgentHostProxyResolver),
  __decorateParam(2, IAgentConfigurationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ILogService)
], NetworkDiagnosticsService);

function dnsLookup(host, family) {
  return new Promise((resolve3, reject) => {
    lookup(host, { family }, (err, address) => err ? reject(err) : resolve3(address));
  });
}

async function resolveDns(host, family) {
  const start = Date.now();
  try {
    const address = await withTimeout(dnsLookup(host, family), PROBE_TIMEOUT_MS);
    return { address, durationMs: Date.now() - start };
  } catch (err) {
    return { durationMs: Date.now() - start, error: errorMessage2(err) };
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve3, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms / 1e3}s`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve3(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function errorMessage2(error) {
  const seen = /* @__PURE__ */ new Set();
  function collect(error2) {
    if (seen.has(error2)) {
      return "";
    }
    seen.add(error2);
    if (!(error2 instanceof Error)) {
      return String(error2);
    }
    const details = [
      error2.cause ? collect(error2.cause) : "",
      ...error2 instanceof AggregateError ? error2.errors.map(collect) : []
    ].filter(Boolean).join(", ");
    return details ? `${error2.message}: ${details}` : error2.message;
  }
  return collect(error);
}
export { dnsLookup, resolveDns, withTimeout, errorMessage2, lookup, INetworkDiagnosticsService, PROBE_TIMEOUT_MS, MAX_BODY_CHARS, PROXY_ENV_KEYS, PROXY_CONFIG_KEYS, NetworkDiagnosticsService };
