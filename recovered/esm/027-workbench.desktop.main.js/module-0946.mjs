// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/request/common/request.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { streamToBuffer } from "./module-0038.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/request/common/request.ts
var IRequestService = createDecorator("requestService");

var NO_FETCH_TELEMETRY = "NO_FETCH_TELEMETRY";

var LoggableHeaders = class {
  constructor(original) {
    this.original = original;
  }
  toJSON() {
    if (!this.headers) {
      const headers = /* @__PURE__ */ Object.create(null);
      for (const key3 in this.original) {
        if (key3.toLowerCase() === "authorization" || key3.toLowerCase() === "proxy-authorization") {
          headers[key3] = "*****";
        } else {
          headers[key3] = this.original[key3];
        }
      }
      this.headers = headers;
    }
    return this.headers;
  }
};

var AbstractRequestService = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
    this.counter = 0;
    this._onDidCompleteRequest = this._register(new Emitter());
    this.onDidCompleteRequest = this._onDidCompleteRequest.event;
  }
  async logAndRequest(options3, request2) {
    const prefix = `#${++this.counter}: ${options3.url}`;
    this.logService.trace(`${prefix} - begin`, options3.type, new LoggableHeaders(options3.headers ?? {}));
    const startTime = Date.now();
    try {
      const result = await request2();
      this.logService.trace(`${prefix} - end`, options3.type, result.res.statusCode, result.res.headers);
      this._onDidCompleteRequest.fire({
        callSite: options3.callSite,
        latency: Date.now() - startTime,
        statusCode: result.res.statusCode
      });
      return result;
    } catch (error) {
      this.logService.error(`${prefix} - error`, options3.type, getErrorMessage(error));
      throw error;
    }
  }
};

function isSuccess(context2) {
  return context2.res.statusCode && context2.res.statusCode >= 200 && context2.res.statusCode < 300 || context2.res.statusCode === 1223;
}

function isClientError(context2) {
  return !!context2.res.statusCode && context2.res.statusCode >= 400 && context2.res.statusCode < 500;
}

function isServerError(context2) {
  return !!context2.res.statusCode && context2.res.statusCode >= 500 && context2.res.statusCode < 600;
}

function readHeader(headers, name) {
  if (!headers) {
    return void 0;
  }
  const value2 = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value2)) {
    return value2[0];
  }
  return value2;
}

function retryAfterFromHeaders(headers) {
  const value2 = readHeader(headers, "retry-after");
  if (!value2) {
    return void 0;
  }
  const parsed = parseInt(value2, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
}

function hasNoContent(context2) {
  return context2.res.statusCode === 204;
}

async function asText(context2) {
  if (hasNoContent(context2)) {
    return null;
  }
  const buffer = await streamToBuffer(context2.stream);
  return buffer.toString();
}

async function asTextOrError(context2) {
  if (!isSuccess(context2)) {
    throw new Error("Server returned " + context2.res.statusCode);
  }
  return asText(context2);
}

async function asJson(context2) {
  if (!isSuccess(context2)) {
    throw new Error("Server returned " + context2.res.statusCode);
  }
  if (hasNoContent(context2)) {
    return null;
  }
  const buffer = await streamToBuffer(context2.stream);
  const str = buffer.toString();
  try {
    return JSON.parse(str);
  } catch (err) {
    err.message += ":\n" + str;
    throw err;
  }
}

function updateProxyConfigurationsScope(useHostProxy, useHostProxyDefault) {
  registerProxyConfigurations(useHostProxy, useHostProxyDefault);
}

var USER_LOCAL_AND_REMOTE_SETTINGS = [
  "http.proxy",
  "http.proxyStrictSSL",
  "http.proxyKerberosServicePrincipal",
  "http.noProxy",
  "http.proxyAuthorization",
  "http.proxySupport",
  "http.systemCertificates",
  "http.systemCertificatesNode",
  "http.experimental.systemCertificatesV2",
  "http.fetchAdditionalSupport",
  "http.experimental.networkInterfaceCheckInterval"
];

var systemCertificatesNodeDefault = true;

var proxyConfiguration = [];

var previousUseHostProxy = void 0;

var previousUseHostProxyDefault = void 0;

function registerProxyConfigurations(useHostProxy = true, useHostProxyDefault = true) {
  if (previousUseHostProxy === useHostProxy && previousUseHostProxyDefault === useHostProxyDefault) {
    return;
  }
  previousUseHostProxy = useHostProxy;
  previousUseHostProxyDefault = useHostProxyDefault;
  const configurationRegistry30 = Registry.as(Extensions4.Configuration);
  const oldProxyConfiguration = proxyConfiguration;
  proxyConfiguration = [
    {
      id: "http",
      order: 15,
      title: localize(3223, null),
      type: "object",
      scope: 2 /* MACHINE */,
      properties: {
        "http.useLocalProxyConfiguration": {
          type: "boolean",
          default: useHostProxyDefault,
          markdownDescription: localize(3238, null),
          restricted: true
        }
      }
    },
    {
      id: "http",
      order: 15,
      title: localize(3223, null),
      type: "object",
      scope: 1 /* APPLICATION */,
      properties: {
        "http.electronFetch": {
          type: "boolean",
          default: false,
          description: localize(3221, null),
          restricted: true
        }
      }
    },
    {
      id: "http",
      order: 15,
      title: localize(3223, null),
      type: "object",
      scope: useHostProxy ? 1 /* APPLICATION */ : 2 /* MACHINE */,
      properties: {
        "http.proxy": {
          type: "string",
          pattern: "^(https?|socks|socks4a?|socks5h?)://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$",
          markdownDescription: localize(3226, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true,
          agentHost: { key: "http.proxy", scope: "ambient" /* Ambient */, transform: (value2) => typeof value2 === "string" ? value2 : "" }
        },
        "http.proxyStrictSSL": {
          type: "boolean",
          default: true,
          markdownDescription: localize(3234, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true
        },
        "http.proxyKerberosServicePrincipal": {
          type: "string",
          markdownDescription: localize(3228, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true,
          agentHost: { key: "http.proxyKerberosServicePrincipal", scope: "ambient" /* Ambient */, transform: (value2) => typeof value2 === "string" ? value2 : "" }
        },
        "http.noProxy": {
          type: "array",
          items: { type: "string" },
          markdownDescription: localize(3225, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true,
          agentHost: { key: "http.noProxy", scope: "ambient" /* Ambient */, transform: (value2) => Array.isArray(value2) ? value2 : [] }
        },
        "http.proxyAuthorization": {
          type: ["null", "string"],
          default: null,
          markdownDescription: localize(3227, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true
        },
        "http.proxySupport": {
          type: "string",
          enum: ["off", "on", "fallback", "override"],
          enumDescriptions: [
            localize(3231, null),
            localize(3232, null),
            localize(3230, null),
            localize(3233, null)
          ],
          default: "override",
          markdownDescription: localize(3229, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true
        },
        "http.systemCertificates": {
          type: "boolean",
          default: true,
          markdownDescription: localize(3235, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true
        },
        "http.systemCertificatesNode": {
          type: "boolean",
          tags: ["experimental"],
          default: systemCertificatesNodeDefault,
          markdownDescription: localize(3236, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true,
          experiment: {
            mode: "auto"
          }
        },
        "http.experimental.systemCertificatesV2": {
          type: "boolean",
          tags: ["experimental"],
          default: false,
          markdownDescription: localize(3237, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true
        },
        "http.fetchAdditionalSupport": {
          type: "boolean",
          default: true,
          markdownDescription: localize(3222, null, "`#http.useLocalProxyConfiguration#`", "`#http.proxySupport#`", "`#http.systemCertificates#`"),
          restricted: true
        },
        "http.webSocketAdditionalSupport": {
          type: "boolean",
          default: true,
          markdownDescription: localize(3239, null, "`#http.useLocalProxyConfiguration#`", "`#http.proxySupport#`", "`#http.systemCertificates#`"),
          restricted: true
        },
        "http.experimental.networkInterfaceCheckInterval": {
          type: "number",
          default: 300,
          minimum: -1,
          tags: ["experimental"],
          markdownDescription: localize(3224, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true,
          experiment: {
            mode: "auto"
          }
        }
      }
    }
  ];
  configurationRegistry30.updateConfigurations({ add: proxyConfiguration, remove: oldProxyConfiguration });
}

registerProxyConfigurations();
export { isSuccess, isClientError, isServerError, readHeader, retryAfterFromHeaders, hasNoContent, asText, asTextOrError, asJson, updateProxyConfigurationsScope, registerProxyConfigurations, IRequestService, NO_FETCH_TELEMETRY, LoggableHeaders, AbstractRequestService, USER_LOCAL_AND_REMOTE_SETTINGS, systemCertificatesNodeDefault, proxyConfiguration, previousUseHostProxy, previousUseHostProxyDefault };
