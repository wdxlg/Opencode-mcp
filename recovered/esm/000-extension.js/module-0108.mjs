// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-diagnose.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { matchesNoProxy } from "./module-0107.mjs";
import { classifyExternalMcpError } from "./module-0109.mjs";


// extensions/opencode/src/external-mcp-diagnose.ts
init_define_OPENCODE_BUILD_INFO();

var import_promises10 = require("node:dns/promises");

var import_node_net3 = __toESM(require("node:net"));

var import_node_tls2 = __toESM(require("node:tls"));


// extensions/opencode/src/external-mcp-diagnose.ts
var TIMEOUT_MS = 5e3;

function safeProxyLabel(proxy) {
  try {
    const url2 = new URL(proxy);
    return `${url2.protocol}//${url2.host}`;
  } catch {
    return "(\u65E0\u6548\u4EE3\u7406\u5730\u5740)";
  }
}

function diagnosisRoute(target, input, resolve) {
  if (input.proxySupport === "off" || matchesNoProxy(target, input.noProxy.join(","))) return { proxySupport: input.proxySupport };
  const proxy = resolve(target, input.configuredProxy)?.replace(/\/$/, "");
  return proxy ? { proxy, proxySupport: input.proxySupport } : { proxySupport: input.proxySupport };
}

var defaultDiagnosisDeps = {
  lookup: (host) => (0, import_promises10.lookup)(host),
  connect: (host, port, timeoutMs) => new Promise((resolve, reject) => {
    const socket = import_node_net3.default.connect({ host, port });
    socket.setTimeout(timeoutMs, () => socket.destroy(Object.assign(new Error("connect timeout"), { code: "ETIMEDOUT" })));
    socket.once("connect", () => {
      socket.setTimeout(0);
      resolve(socket);
    });
    socket.once("error", reject);
  }),
  secure: (socket, servername, timeoutMs) => new Promise((resolve, reject) => {
    const secured = import_node_tls2.default.connect({ socket, servername, ALPNProtocols: ["http/1.1"] });
    secured.setTimeout(timeoutMs, () => secured.destroy(Object.assign(new Error("tls timeout"), { code: "ETIMEDOUT" })));
    secured.once("secureConnect", () => {
      secured.setTimeout(0);
      resolve(secured);
    });
    secured.once("error", reject);
  }),
  request: (socket, lines, timeoutMs) => new Promise((resolve, reject) => {
    let data = "";
    socket.setTimeout(timeoutMs, () => socket.destroy(Object.assign(new Error("response timeout"), { code: "ETIMEDOUT" })));
    const done = () => {
      socket.setTimeout(0);
      socket.removeAllListeners("data");
      resolve(data.split("\r\n")[0] ?? "");
    };
    socket.on("data", (chunk) => {
      data += chunk.toString("latin1");
      if (data.includes("\r\n")) done();
    });
    socket.once("error", reject);
    socket.once("end", () => {
      if (!data.includes("\r\n")) reject(Object.assign(new Error("closed"), { code: "ECONNRESET" }));
    });
    socket.write(lines.join("\r\n") + "\r\n\r\n");
  })
};

async function diagnoseExternalMcp(address, route, deps = defaultDiagnosisDeps) {
  const url2 = new URL(address);
  const target = `${url2.protocol}//${url2.host}`;
  const port = Number(url2.port || (url2.protocol === "https:" ? 443 : 80));
  const proxy = route.proxySupport === "off" ? void 0 : route.proxy;
  const proxyUrl = proxy ? new URL(proxy) : void 0;
  const socks = proxyUrl?.protocol.startsWith("socks");
  const routeText = route.proxySupport === "off" ? "\u76F4\u8FDE\uFF08http.proxySupport = off\uFF09" : proxyUrl ? `\u7ECF\u4EE3\u7406 ${safeProxyLabel(proxy)}` : "\u76F4\u8FDE";
  const steps = [{ stage: "route", ok: true, detail: routeText }];
  const fail2 = (stage, error2) => {
    steps.push({ stage, ok: false, detail: classifyExternalMcpError(error2).message });
    return { target, route: routeText, steps, ok: false };
  };
  if (socks) {
    steps.push({ stage: "tcp", ok: false, detail: "SOCKS \u4EE3\u7406\u53EA\u80FD\u5728\u5B9E\u9645\u8FDE\u63A5\u4E2D\u9A8C\u8BC1\uFF1B\u8BF7\u786E\u8BA4\u4EE3\u7406\u8F6F\u4EF6\u5DF2\u5F00\u542F\uFF0C\u5E76\u68C0\u67E5\u300C\u8FDE\u63A5\u300D\u7C7B\u9519\u8BEF\u63D0\u793A\u3002" });
    return { target, route: routeText, steps, ok: false };
  }
  if (!proxyUrl) {
    try {
      await deps.lookup(url2.hostname);
      steps.push({ stage: "dns", ok: true, detail: `\u5DF2\u89E3\u6790 ${url2.hostname}` });
    } catch (error2) {
      return fail2("dns", error2);
    }
  } else steps.push({ stage: "dns", ok: true, detail: "\u7531\u4EE3\u7406\u89E3\u6790\u76EE\u6807\u5730\u5740" });
  let socket;
  try {
    try {
      socket = await deps.connect(proxyUrl ? proxyUrl.hostname : url2.hostname, proxyUrl ? Number(proxyUrl.port || 80) : port, TIMEOUT_MS);
    } catch (error2) {
      return fail2("tcp", error2);
    }
    if (proxyUrl) {
      let status;
      try {
        status = await deps.request(socket, [`CONNECT ${url2.hostname}:${port} HTTP/1.1`, `Host: ${url2.hostname}:${port}`], TIMEOUT_MS);
      } catch (error2) {
        return fail2("tcp", error2);
      }
      const code2 = Number(/^HTTP\/1\.[01] (\d{3})/.exec(status)?.[1]);
      if (code2 !== 200) return fail2("tcp", code2 === 407 ? { status: 407 } : new Error(`Proxy response (${Number.isFinite(code2) ? code2 : 0}) !== 200 when HTTP Tunneling`));
      steps.push({ stage: "tcp", ok: true, detail: `\u4EE3\u7406\u96A7\u9053\u5DF2\u5EFA\u7ACB\uFF08CONNECT ${url2.host}\uFF09` });
    } else steps.push({ stage: "tcp", ok: true, detail: `\u5DF2\u8FDE\u63A5 ${url2.host}` });
    if (url2.protocol === "https:") {
      try {
        socket = await deps.secure(socket, url2.hostname, TIMEOUT_MS);
        steps.push({ stage: "tls", ok: true, detail: "\u8BC1\u4E66\u6821\u9A8C\u901A\u8FC7" });
      } catch (error2) {
        return fail2("tls", error2);
      }
    }
    let line;
    try {
      line = await deps.request(socket, [`HEAD / HTTP/1.1`, `Host: ${url2.host}`, "User-Agent: OpenCode-MCP-Diagnosis", "Connection: close"], TIMEOUT_MS);
    } catch (error2) {
      return fail2("http", error2);
    }
    const code = /^HTTP\/\d(?:\.\d)? (\d{3})/.exec(line)?.[1];
    if (!code) return fail2("http", { code: "CLIENT_HTTP_UNEXPECTED_CONTENT" });
    steps.push({ stage: "http", ok: true, detail: `\u670D\u52A1\u5668\u53EF\u8FBE\uFF08HTTP ${code}\uFF1B401/405 \u540C\u6837\u8868\u793A\u53EF\u8FBE\uFF0C\u8BCA\u65AD\u4E0D\u5E26\u4EFB\u4F55\u5BC6\u94A5\uFF09` });
    return { target, route: routeText, steps, ok: true };
  } finally {
    socket?.destroy();
  }
}

function formatDiagnosis(report) {
  const names = { route: "\u8DEF\u7531", dns: "DNS", tcp: "\u8FDE\u63A5", tls: "TLS", http: "HTTP" };
  return [`\u76EE\u6807\uFF1A${report.target}`, ...report.steps.map((step) => `${step.ok ? "\u2713" : "\u2717"} ${names[step.stage]}\uFF1A${step.detail}`)].join("\n");
}
export { safeProxyLabel, diagnosisRoute, diagnoseExternalMcp, formatDiagnosis, import_promises10, import_node_net3, import_node_tls2, TIMEOUT_MS, defaultDiagnosisDeps };
