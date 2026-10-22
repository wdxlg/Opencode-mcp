// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/request/common/request.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { getErrorMessage } from "./module-0002.mjs";
import { Registry } from "./module-0142.mjs";
import { Extensions2 } from "./module-0145.mjs";
import { localize } from "./module-0012.mjs";


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
      for (const key in this.original) {
        if (key.toLowerCase() === "authorization" || key.toLowerCase() === "proxy-authorization") {
          headers[key] = "*****";
        } else {
          headers[key] = this.original[key];
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
  async logAndRequest(options, request) {
    const prefix = `#${++this.counter}: ${options.url}`;
    this.logService.trace(`${prefix} - begin`, options.type, new LoggableHeaders(options.headers ?? {}));
    const startTime = Date.now();
    try {
      const result = await request();
      this.logService.trace(`${prefix} - end`, options.type, result.res.statusCode, result.res.headers);
      this._onDidCompleteRequest.fire({
        callSite: options.callSite,
        latency: Date.now() - startTime,
        statusCode: result.res.statusCode
      });
      return result;
    } catch (error) {
      this.logService.error(`${prefix} - error`, options.type, getErrorMessage(error));
      throw error;
    }
  }
};

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
  const configurationRegistry3 = Registry.as(Extensions2.Configuration);
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
          agentHost: { key: "http.proxy", scope: "ambient" /* Ambient */, transform: (value) => typeof value === "string" ? value : "" }
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
          agentHost: { key: "http.proxyKerberosServicePrincipal", scope: "ambient" /* Ambient */, transform: (value) => typeof value === "string" ? value : "" }
        },
        "http.noProxy": {
          type: "array",
          items: { type: "string" },
          markdownDescription: localize(3225, null, "`#http.useLocalProxyConfiguration#`"),
          restricted: true,
          agentHost: { key: "http.noProxy", scope: "ambient" /* Ambient */, transform: (value) => Array.isArray(value) ? value : [] }
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
  configurationRegistry3.updateConfigurations({ add: proxyConfiguration, remove: oldProxyConfiguration });
}

registerProxyConfigurations();
export { registerProxyConfigurations, IRequestService, NO_FETCH_TELEMETRY, LoggableHeaders, AbstractRequestService, systemCertificatesNodeDefault, proxyConfiguration, previousUseHostProxy, previousUseHostProxyDefault };
