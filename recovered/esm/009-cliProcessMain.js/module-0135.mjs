// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/request/node/requestService.ts
import { AbstractRequestService, systemCertificatesNodeDefault } from "./module-0054.mjs";
import { getResolvedShellEnv } from "./module-0136.mjs";
import { CancellationError, getErrorMessage } from "./module-0003.mjs";
import { getProxyAgent } from "./module-0142.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0031.mjs";
import { INativeEnvironmentService } from "./module-0056.mjs";
import { ILogService } from "./module-0049.mjs";
import { Promises, timeout } from "./module-0028.mjs";
import { isBoolean, isNumber } from "./module-0009.mjs";
import { streamToBufferReadableStream } from "./module-0033.mjs";


// src/vs/platform/request/node/requestService.ts
import { parse as parseUrl2 } from "url";


// src/vs/platform/request/node/requestService.ts
import { createGunzip } from "zlib";

var TRANSIENT_ERROR_CODES = /* @__PURE__ */ new Set([
  "EAI_AGAIN",
  // DNS lookup timed out
  "ECONNREFUSED",
  // Connection refused by server
  "EHOSTDOWN",
  // Host is down
  "EHOSTUNREACH",
  // No route to host
  "ENETDOWN",
  // Network is down
  "ENETUNREACH",
  // Network is unreachable
  "EPROTO"
  // Protocol error (TLS/SSL handshake failure)
]);

var IDEMPOTENT_HTTP_METHODS_REGEX = /^(GET|HEAD|OPTIONS)$/i;

function isTransientError(error) {
  if (error instanceof Error) {
    const code = error.code;
    return !!code && TRANSIENT_ERROR_CODES.has(code);
  }
  return false;
}

var RequestService = class extends AbstractRequestService {
  constructor(machine, configurationService, environmentService, logService) {
    super(logService);
    this.machine = machine;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.configure();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("http")) {
        this.configure();
      }
    }));
  }
  configure() {
    this.proxyUrl = this.getConfigValue("http.proxy");
    this.strictSSL = !!this.getConfigValue("http.proxyStrictSSL");
    this.authorization = this.getConfigValue("http.proxyAuthorization");
  }
  async request(options, token) {
    const { proxyUrl, strictSSL } = this;
    let shellEnv = void 0;
    try {
      shellEnv = await getResolvedShellEnv(this.configurationService, this.logService, this.environmentService.args, process.env);
    } catch (error) {
      if (!this.shellEnvErrorLogged) {
        this.shellEnvErrorLogged = true;
        this.logService.error(`resolving shell environment failed`, getErrorMessage(error));
      }
    }
    const env2 = {
      ...process.env,
      ...shellEnv
    };
    const agent = options.agent ? options.agent : await getProxyAgent(options.url || "", env2, { proxyUrl, strictSSL });
    options.agent = agent;
    options.strictSSL = strictSSL;
    if (this.authorization) {
      options.headers = {
        ...options.headers || {},
        "Proxy-Authorization": this.authorization
      };
    }
    return this.logAndRequest(options, () => nodeRequest(options, token));
  }
  async resolveProxy(url) {
    return void 0;
  }
  async lookupAuthorization(authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(urlStr) {
    try {
      const spnConfig = this.getConfigValue("http.proxyKerberosServicePrincipal");
      const response = await lookupKerberosAuthorization(urlStr, spnConfig, this.logService, "RequestService#lookupKerberosAuthorization");
      return "Negotiate " + response;
    } catch (err) {
      this.logService.debug("RequestService#lookupKerberosAuthorization Kerberos authentication failed", err);
      return void 0;
    }
  }
  async loadCertificates() {
    const proxyAgent = await import("@vscode/proxy-agent");
    return proxyAgent.loadSystemCertificates({
      loadSystemCertificatesFromNode: () => this.getConfigValue("http.systemCertificatesNode", systemCertificatesNodeDefault),
      log: this.logService
    });
  }
  getConfigValue(key, fallback) {
    if (this.machine === "remote") {
      return this.configurationService.getValue(key);
    }
    const values = this.configurationService.inspect(key);
    return values.userLocalValue ?? values.defaultValue ?? fallback;
  }
};

RequestService = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, ILogService)
], RequestService);

async function lookupKerberosAuthorization(urlStr, spnConfig, logService, logPrefix) {
  const importKerberos = await import("kerberos");
  const kerberos = importKerberos.default || importKerberos;
  const url = new URL(urlStr);
  const spn = spnConfig || (process.platform === "win32" ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
  logService.debug(`${logPrefix} Kerberos authentication lookup`, `proxyURL:${url}`, `spn:${spn}`);
  const client = await kerberos.initializeClient(spn);
  return client.step("");
}

async function getNodeRequest(options) {
  const endpoint = parseUrl2(options.url);
  const module2 = endpoint.protocol === "https:" ? await import("https") : await import("http");
  return module2.request;
}

async function nodeRequest(options, token) {
  const maxRetries = 3;
  let lastError;
  const isIdempotent = IDEMPOTENT_HTTP_METHODS_REGEX.test(options.type || "GET");
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await nodeRequestAttempt(options, token);
    } catch (error) {
      lastError = error;
      if (error instanceof CancellationError) {
        throw error;
      }
      if (!isIdempotent || !isTransientError(error) || attempt === maxRetries) {
        throw error;
      }
      await timeout(100 * attempt, token);
    }
  }
  throw lastError;
}

async function nodeRequestAttempt(options, token) {
  return Promises.withAsyncBody(async (resolve3, reject) => {
    const endpoint = parseUrl2(options.url);
    const rawRequest = options.getRawRequest ? options.getRawRequest(options) : await getNodeRequest(options);
    const opts = {
      hostname: endpoint.hostname,
      port: endpoint.port ? parseInt(endpoint.port) : endpoint.protocol === "https:" ? 443 : 80,
      protocol: endpoint.protocol,
      path: endpoint.path,
      method: options.type || "GET",
      headers: options.headers,
      agent: options.agent,
      rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
    };
    if (options.user && options.password) {
      opts.auth = options.user + ":" + options.password;
    }
    if (options.disableCache) {
      opts.cache = "no-store";
    }
    const req = rawRequest(opts, (res) => {
      const followRedirects = isNumber(options.followRedirects) ? options.followRedirects : 3;
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers["location"]) {
        nodeRequest({
          ...options,
          url: res.headers["location"],
          followRedirects: followRedirects - 1
        }, token).then(resolve3, reject);
      } else {
        let stream = res;
        if (!options.isChromiumNetwork && res.headers["content-encoding"] === "gzip") {
          stream = res.pipe(createGunzip());
        }
        resolve3({ res, stream: streamToBufferReadableStream(stream) });
      }
    });
    req.on("error", reject);
    if (options.timeout) {
      if (options.isChromiumNetwork) {
        const timeout2 = setTimeout(() => {
          req.abort();
          reject(new Error(`Request timeout after ${options.timeout}ms`));
        }, options.timeout);
        req.on("response", () => clearTimeout(timeout2));
        req.on("error", () => clearTimeout(timeout2));
        req.on("abort", () => clearTimeout(timeout2));
      } else {
        req.setTimeout(options.timeout);
      }
    }
    if (options.isChromiumNetwork) {
      req.removeHeader("Content-Length");
    }
    if (options.data) {
      if (typeof options.data === "string") {
        req.write(options.data);
      }
    }
    req.end();
    const cancellationListener = token.onCancellationRequested(() => {
      cancellationListener.dispose();
      req.abort();
      reject(new CancellationError());
    });
    req.on("response", () => cancellationListener.dispose());
    req.on("error", () => cancellationListener.dispose());
  });
}
export { isTransientError, lookupKerberosAuthorization, getNodeRequest, nodeRequest, nodeRequestAttempt, parseUrl2, createGunzip, TRANSIENT_ERROR_CODES, IDEMPOTENT_HTTP_METHODS_REGEX, RequestService };
