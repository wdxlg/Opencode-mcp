// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostRequestService.ts
import { AbstractRequestService, systemCertificatesNodeDefault } from "./module-0146.mjs";
import { AgentHostProxyConfigKey } from "./module-0057.mjs";
import { lookupKerberosAuthorization } from "./module-0147.mjs";
import { CancellationError, isCancellationError } from "./module-0002.mjs";
import { timeout } from "./module-0027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostProxyResolver } from "./module-0140.mjs";
import { VSBuffer, newWriteableBufferStream } from "./module-0029.mjs";


// src/vs/platform/agentHost/node/agentHostRequestService.ts
import { loadSystemCertificates as loadSystemCertificates2 } from "@vscode/proxy-agent";

var TRANSIENT_ERROR_CODES2 = /* @__PURE__ */ new Set([
  "EAI_AGAIN",
  "ECONNREFUSED",
  "EHOSTDOWN",
  "EHOSTUNREACH",
  "ENETDOWN",
  "ENETUNREACH",
  "EPROTO"
]);

var IDEMPOTENT_HTTP_METHODS_REGEX2 = /^(GET|HEAD|OPTIONS)$/i;

function isTransientError2(error) {
  if (error instanceof Error) {
    const code = error.code;
    return !!code && TRANSIENT_ERROR_CODES2.has(code);
  }
  return false;
}

var AgentHostRequestService = class extends AbstractRequestService {
  constructor(logService, _proxyResolver) {
    super(logService);
    this._proxyResolver = _proxyResolver;
  }
  request(options, token) {
    return this.logAndRequest(options, () => this._request(options, token));
  }
  resolveProxy(url2) {
    return this._proxyResolver.resolveProxy(url2);
  }
  async lookupAuthorization(_authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(url2) {
    try {
      const spn = this._proxyResolver.getConfigurationValue(AgentHostProxyConfigKey.ProxyKerberosServicePrincipal);
      return `Negotiate ${await lookupKerberosAuthorization(url2, spn, this.logService, "AgentHostRequestService#lookupKerberosAuthorization")}`;
    } catch (error) {
      this.logService.debug("AgentHostRequestService#lookupKerberosAuthorization Kerberos authentication failed", error);
      return void 0;
    }
  }
  loadCertificates() {
    return loadSystemCertificates2({
      loadSystemCertificatesFromNode: () => systemCertificatesNodeDefault,
      log: this.logService
    });
  }
  async _request(options, token) {
    const maxRetries = 3;
    let lastError;
    const isIdempotent = IDEMPOTENT_HTTP_METHODS_REGEX2.test(options.type || "GET");
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this._requestAttempt(options, token);
      } catch (error) {
        lastError = error;
        if (isCancellationError(error)) {
          throw error;
        }
        if (!isIdempotent || !isTransientError2(error) || attempt === maxRetries) {
          throw error;
        }
        await timeout(100 * attempt, token);
      }
    }
    throw lastError;
  }
  async _requestAttempt(options, token) {
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const cancellation = new AbortController();
    const cancellationListener = token.onCancellationRequested(() => cancellation.abort());
    const signal = options.timeout ? AbortSignal.any([cancellation.signal, AbortSignal.timeout(options.timeout)]) : cancellation.signal;
    try {
      const response = await this._proxyResolver.fetch(options.url || "", {
        method: options.type || "GET",
        headers: getRequestHeaders(options),
        body: options.data,
        signal,
        cache: options.disableCache ? "no-store" : void 0
      });
      const stream = response.body ? responseBodyToStream(response.body, cancellation, cancellationListener) : emptyResponseStream(cancellationListener);
      return {
        res: {
          statusCode: response.status,
          headers: getResponseHeaders(response)
        },
        stream
      };
    } catch (error) {
      cancellationListener.dispose();
      if (error instanceof Error && error.name === "AbortError") {
        throw new CancellationError();
      }
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error(`Fetch timeout: ${options.timeout}ms`);
      }
      throw error;
    }
  }
};

AgentHostRequestService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IAgentHostProxyResolver)
], AgentHostRequestService);

function getRequestHeaders(options) {
  if (!options.headers && !options.user && !options.password && !options.proxyAuthorization) {
    return void 0;
  }
  const headers = new Headers();
  for (const key in options.headers) {
    const value = options.headers[key];
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    }
  }
  if (options.user || options.password) {
    headers.set("Authorization", `Basic ${btoa(`${options.user || ""}:${options.password || ""}`)}`);
  }
  if (options.proxyAuthorization) {
    headers.set("Proxy-Authorization", options.proxyAuthorization);
  }
  return headers;
}

function getResponseHeaders(response) {
  const headers = /* @__PURE__ */ Object.create(null);
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

function emptyResponseStream(cancellationListener) {
  const stream = newWriteableBufferStream();
  stream.end();
  cancellationListener.dispose();
  return stream;
}

function responseBodyToStream(body, cancellation, cancellationListener) {
  const reader = body.getReader();
  const stream = newWriteableBufferStream({ highWaterMark: 16 });
  const destroy = stream.destroy.bind(stream);
  stream.destroy = () => {
    cancellation.abort();
    void reader.cancel();
    cancellationListener.dispose();
    destroy();
  };
  void pumpResponseBody(reader, stream, cancellationListener);
  return stream;
}

async function pumpResponseBody(reader, stream, cancellationListener) {
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      await stream.write(VSBuffer.wrap(value));
    }
    stream.end();
  } catch (error) {
    stream.error(error instanceof Error ? error : new Error(String(error)));
    stream.end();
  } finally {
    cancellationListener.dispose();
  }
}
export { isTransientError2, getRequestHeaders, getResponseHeaders, emptyResponseStream, responseBodyToStream, pumpResponseBody, loadSystemCertificates2, TRANSIENT_ERROR_CODES2, IDEMPOTENT_HTTP_METHODS_REGEX2, AgentHostRequestService };
