// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/extension-host-proxy.mts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { require_dist3 } from "./module-0009.mjs";
import { isPacUrl, matchesNoProxy, matchesProxyBypass, pacConfigurationError } from "./module-0107.mjs";


// extensions/opencode/src/extension-host-proxy.mts
init_define_OPENCODE_BUILD_INFO();


// extensions/opencode/src/extension-host-proxy.mts
var import_node_child_process4 = require("node:child_process");

var import_node_http2 = __toESM(require("node:http"), 1);

var import_node_https = __toESM(require("node:https"), 1);

var import_node_net2 = __toESM(require("node:net"), 1);

var import_node_tls = __toESM(require("node:tls"), 1);

var import_node_stream = require("node:stream");

var import_https_proxy_agent = __toESM(require_dist3(), 1);
function requestForSelectedRoute(protocol) {
  const client = protocol === "https:" ? import_node_https.default : import_node_http2.default;
  const transport = client.__vscodeOriginal ?? client;
  return transport.request.bind(transport);
}


// extensions/opencode/src/extension-host-proxy.mts
var WINDOWS_INTERNET_SETTINGS = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";

var SYSTEM_PROXY_CACHE_MS = 5e3;

var LOCAL_PROBE_CACHE_MS = 15e3;

var WORKING_PROXY_CACHE_MS = 3e5;

var PROXY_VERIFICATION_CACHE_MS = 3e5;

var CANDIDATE_LOCAL_PROXY_PORTS = [
  { port: 7890, defaultScheme: "http", clientName: "Clash / Clash for Windows (mixed)" },
  { port: 7897, defaultScheme: "http", clientName: "Clash Verge Rev / Mihomo Party (mixed)" },
  { port: 10809, defaultScheme: "http", clientName: "v2rayN HTTP" },
  { port: 12450, defaultScheme: "http", clientName: "SakuraCat HTTP" },
  { port: 2080, defaultScheme: "http", clientName: "sing-box mixed" },
  { port: 10808, defaultScheme: "socks5", clientName: "v2rayN / sing-box SOCKS5" },
  { port: 1080, defaultScheme: "socks5", clientName: "Shadowsocks SOCKS5" },
  { port: 8888, defaultScheme: "http", clientName: "Fiddler / Charles HTTP" },
  { port: 8080, defaultScheme: "http", clientName: "Standard HTTP proxy" },
  { port: 8118, defaultScheme: "http", clientName: "Privoxy HTTP" },
  { port: 20809, defaultScheme: "http", clientName: "NekoRay HTTP" },
  { port: 20808, defaultScheme: "socks5", clientName: "NekoRay SOCKS5" },
  { port: 6152, defaultScheme: "http", clientName: "Surge HTTP" },
  { port: 6153, defaultScheme: "socks5", clientName: "Surge SOCKS5" }
];

var cachedWindowsSettings;

var cachedActiveLocalPorts;

var cachedWorkingProxy;

var cachedElectronFetch;

var cachedProxyVerifications;

function registryValue(name) {
  try {
    const output2 = (0, import_node_child_process4.execFileSync)("reg.exe", ["query", WINDOWS_INTERNET_SETTINGS, "/v", name], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 1e3,
      stdio: ["ignore", "pipe", "ignore"]
    });
    const match = output2.match(new RegExp(`^\\s*${name}\\s+REG_\\w+\\s+(.+?)\\s*$`, "mi"));
    return match?.[1]?.trim();
  } catch {
    return void 0;
  }
}

function queryWindowsInternetSettings() {
  if (process.platform !== "win32") {
    return { enabled: false };
  }
  const enabledStr = registryValue("ProxyEnable");
  const enabled = Boolean(
    enabledStr && Number.parseInt(enabledStr.replace(/^0x/i, ""), enabledStr.startsWith("0x") ? 16 : 10) !== 0
  );
  const proxyServer = registryValue("ProxyServer");
  const autoConfigUrl = registryValue("AutoConfigURL");
  const proxyOverride = registryValue("ProxyOverride");
  return { enabled, proxyServer, autoConfigUrl, proxyOverride };
}

function getWindowsInternetSettings() {
  const now = Date.now();
  if (cachedWindowsSettings && cachedWindowsSettings.expiresAt > now) {
    return cachedWindowsSettings.data;
  }
  const data = queryWindowsInternetSettings();
  cachedWindowsSettings = { expiresAt: now + SYSTEM_PROXY_CACHE_MS, data };
  return data;
}

function windowsSystemProxy() {
  const settings2 = getWindowsInternetSettings();
  return settings2.enabled ? settings2.proxyServer : void 0;
}

function shouldBypassProxy(target, explicitOverride) {
  const hostname3 = target.hostname.toLowerCase();
  if (hostname3 === "localhost" || hostname3 === "127.0.0.1" || hostname3 === "::1" || hostname3 === "0.0.0.0" || hostname3 === "[::1]" || hostname3.startsWith("127.") || hostname3.endsWith(".local")) {
    return true;
  }
  if (matchesNoProxy(target, process.env.NO_PROXY?.trim() || process.env.no_proxy?.trim())) return true;
  const settings2 = getWindowsInternetSettings();
  return [explicitOverride, settings2.proxyOverride].some((group) => group?.split(/[;,]/).some((rule) => matchesProxyBypass(target, rule, false)));
}

function probeLocalPort(port, timeoutMs = 60) {
  return new Promise((resolve) => {
    const socket = new import_node_net2.default.Socket();
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}

async function detectActiveLocalProxyPorts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedActiveLocalPorts && cachedActiveLocalPorts.expiresAt > now) {
    return cachedActiveLocalPorts.ports;
  }
  const results = await Promise.all(
    CANDIDATE_LOCAL_PROXY_PORTS.map(async ({ port }) => ({
      port,
      open: await probeLocalPort(port)
    }))
  );
  const openPorts = results.filter((r) => r.open).map((r) => r.port);
  cachedActiveLocalPorts = { expiresAt: now + LOCAL_PROBE_CACHE_MS, ports: openPorts };
  return openPorts;
}

function getCachedWorkingProxy() {
  if (cachedWorkingProxy && cachedWorkingProxy.expiresAt > Date.now()) {
    return cachedWorkingProxy.url;
  }
  return void 0;
}

function setCachedWorkingProxy(proxyUrl) {
  cachedWorkingProxy = { expiresAt: Date.now() + WORKING_PROXY_CACHE_MS, url: proxyUrl };
}

async function scannedLocalProxyCandidates(forceRefresh = false) {
  const activePorts = await detectActiveLocalProxyPorts(forceRefresh);
  return activePorts.map((port) => {
    const portDef = CANDIDATE_LOCAL_PROXY_PORTS.find((definition) => definition.port === port);
    const scheme = portDef?.defaultScheme ?? "http";
    return `${scheme}://127.0.0.1:${port}/`;
  });
}

function isProxyRejection(status) {
  return status === 407;
}

function isAmbiguousGatewayStatus(status) {
  return status === 502 || status === 503 || status === 504;
}

async function verifyProxyCandidate(proxyUrl, target, init, timeoutMs) {
  cachedProxyVerifications ??= /* @__PURE__ */ new Map();
  const key = `${proxyUrl}|${target.protocol}`;
  const cached2 = cachedProxyVerifications.get(key);
  const now = Date.now();
  if (cached2 && cached2.expiresAt > now) return cached2.verified;
  let verified = false;
  try {
    const proxy = new URL(proxyUrl);
    if (proxy.protocol.startsWith("socks")) {
      const socket = await socks5Connect(proxy, target.hostname, Number(target.port) || (target.protocol === "https:" ? 443 : 80), timeoutMs);
      socket.destroy();
      verified = true;
    } else {
      verified = await probeHttpProxyConnect(proxy, target, timeoutMs, init);
    }
  } catch {
    verified = false;
  }
  cachedProxyVerifications.set(key, { expiresAt: now + PROXY_VERIFICATION_CACHE_MS, verified });
  return verified;
}

function probeHttpProxyConnect(proxy, target, timeoutMs, init) {
  return new Promise((resolve) => {
    const port = Number(target.port) || (target.protocol === "https:" ? 443 : 80);
    const headers = { host: `${target.hostname}:${port}` };
    const authorization = proxyAuthorization(proxy);
    if (authorization) headers["proxy-authorization"] = authorization;
    const client = proxy.protocol === "https:" ? import_node_https.default : import_node_http2.default;
    const request = client.request({
      protocol: proxy.protocol,
      hostname: proxy.hostname.replace(/^\[|\]$/g, ""),
      port: Number(proxy.port) || (proxy.protocol === "https:" ? 443 : 80),
      method: "CONNECT",
      path: `${target.hostname}:${port}`,
      headers,
      timeout: timeoutMs,
      ...proxy.protocol === "https:" ? { rejectUnauthorized: init.rejectUnauthorized !== false } : {}
    });
    const settle = (value, socket) => {
      socket?.destroy();
      request.destroy();
      resolve(value);
    };
    request.once("connect", (response, socket) => {
      settle(response.statusCode !== void 0 && response.statusCode >= 200 && response.statusCode < 300, socket);
    });
    request.once("response", (response) => {
      response.resume();
      settle(false);
    });
    request.once("timeout", () => settle(false));
    request.once("error", () => settle(false));
    request.end();
  });
}

function proxyRuleValue(value, targetProtocol) {
  const trimmed = value.trim();
  if (!trimmed) return void 0;
  if (!trimmed.includes("=")) return { endpoint: trimmed };
  const rules = /* @__PURE__ */ new Map();
  for (const part of trimmed.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    const key = part.slice(0, separator).trim().toLowerCase();
    const endpoint = part.slice(separator + 1).trim();
    if (key && endpoint) rules.set(key, endpoint);
  }
  const scheme = targetProtocol.replace(/:$/, "").toLowerCase();
  if (rules.has(scheme)) return { endpoint: rules.get(scheme), isSocks: scheme.startsWith("socks") };
  if (rules.has("http")) return { endpoint: rules.get("http"), isSocks: false };
  if (rules.has("proxy")) return { endpoint: rules.get("proxy"), isSocks: false };
  if (rules.has("socks")) return { endpoint: rules.get("socks"), isSocks: true };
  return void 0;
}

function systemPacConfigured() {
  return Boolean(getWindowsInternetSettings().autoConfigUrl?.trim());
}

function normalizeProxyUrl(value, targetProtocol, options) {
  if (!value?.trim() || isPacUrl(value)) return void 0;
  const allowSocks = options?.allowSocks ?? true;
  const resolved = proxyRuleValue(value, targetProtocol);
  if (!resolved || !resolved.endpoint) return void 0;
  const { endpoint, isSocks: ruleIsSocks } = resolved;
  const isSocks = ruleIsSocks || /^socks/i.test(endpoint);
  if (isSocks && !allowSocks) return void 0;
  let normalized = endpoint;
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(endpoint)) {
    normalized = isSocks ? `socks5://${endpoint}` : `http://${endpoint}`;
  } else if (/^socks:/i.test(endpoint)) {
    normalized = endpoint.replace(/^socks:/i, "socks5:");
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.pathname && parsed.pathname !== "/" || parsed.search || parsed.hash) return void 0;
    const validProtocols = ["http:", "https:", "socks:", "socks5:", "socks5h:"];
    if (!validProtocols.includes(parsed.protocol) || !parsed.hostname) return void 0;
    if (!allowSocks && parsed.protocol.startsWith("socks")) return void 0;
    if (parsed.protocol.startsWith("socks") && parsed.pathname === "") {
      parsed.pathname = "/";
    }
    return parsed.toString();
  } catch {
    return void 0;
  }
}

async function resolveExtensionHostProxyCandidates(target, configuredProxy) {
  if (shouldBypassProxy(target)) {
    return [];
  }
  const rawCandidates = [];
  if (configuredProxy?.trim()) {
    rawCandidates.push(configuredProxy.trim());
  }
  if (process.env.HTTPS_PROXY) rawCandidates.push(process.env.HTTPS_PROXY);
  if (process.env.https_proxy) rawCandidates.push(process.env.https_proxy);
  if (process.env.ALL_PROXY) rawCandidates.push(process.env.ALL_PROXY);
  if (process.env.all_proxy) rawCandidates.push(process.env.all_proxy);
  if (process.env.HTTP_PROXY) rawCandidates.push(process.env.HTTP_PROXY);
  if (process.env.http_proxy) rawCandidates.push(process.env.http_proxy);
  const winSettings = getWindowsInternetSettings();
  if (winSettings.enabled && winSettings.proxyServer) {
    rawCandidates.push(winSettings.proxyServer);
  }
  const working = getCachedWorkingProxy();
  if (working) rawCandidates.push(working);
  for (const scanned of await scannedLocalProxyCandidates()) {
    rawCandidates.push(scanned);
  }
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const raw of rawCandidates) {
    const normalized = normalizeProxyUrl(raw, target.protocol, { allowSocks: true });
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
}

function resolveExtensionHostProxy(target, configuredProxy) {
  if (shouldBypassProxy(target)) {
    return void 0;
  }
  const explicitProxy = normalizeProxyUrl(configuredProxy, target.protocol);
  if (explicitProxy) return explicitProxy;
  const envCandidates = [
    process.env.HTTPS_PROXY,
    process.env.https_proxy,
    process.env.ALL_PROXY,
    process.env.all_proxy,
    process.env.HTTP_PROXY,
    process.env.http_proxy
  ];
  for (const candidate of envCandidates) {
    const normalized = normalizeProxyUrl(candidate, target.protocol, { allowSocks: false });
    if (normalized) return normalized;
  }
  for (const candidate of envCandidates) {
    const normalized = normalizeProxyUrl(candidate, target.protocol, { allowSocks: true });
    if (normalized) return normalized;
  }
  const winProxy = windowsSystemProxy();
  const normalizedWin = normalizeProxyUrl(winProxy, target.protocol, { allowSocks: true });
  if (normalizedWin) return normalizedWin;
  if (!systemPacConfigured()) {
    const working = getCachedWorkingProxy();
    if (working) return working;
  }
  if (cachedActiveLocalPorts?.ports.length) {
    for (const port of cachedActiveLocalPorts.ports) {
      const portDef = CANDIDATE_LOCAL_PROXY_PORTS.find((p) => p.port === port);
      const scheme = portDef?.defaultScheme ?? "http";
      const normalizedLocal = normalizeProxyUrl(`${scheme}://127.0.0.1:${port}/`, target.protocol, {
        allowSocks: true
      });
      if (normalizedLocal) return normalizedLocal;
    }
  }
  return void 0;
}

async function socks5Connect(proxy, targetHost, targetPort, timeoutMs = 6e3) {
  const socket = import_node_net2.default.connect({ host: proxy.hostname.replace(/^\[|\]$/g, ""), port: Number(proxy.port) || 1080 });
  let failure2;
  let wake;
  const onError = (error2) => {
    failure2 = error2;
    wake?.();
  };
  const onClose = () => {
    failure2 ??= new Error("SOCKS5 proxy closed during handshake");
    wake?.();
  };
  const onReadable = () => wake?.();
  socket.on("error", onError);
  socket.on("close", onClose);
  socket.on("end", onClose);
  socket.on("readable", onReadable);
  const timer = setTimeout(() => socket.destroy(new Error("SOCKS5 handshake timed out")), timeoutMs);
  const read = async (length) => {
    while (true) {
      if (failure2) throw failure2;
      const chunk = socket.read(length);
      if (chunk) return chunk;
      await new Promise((resolve) => {
        wake = resolve;
      });
      wake = void 0;
    }
  };
  try {
    const user = Buffer.from(decodeURIComponent(proxy.username));
    const password = Buffer.from(decodeURIComponent(proxy.password));
    const auth2 = Boolean(user.length || password.length);
    if (auth2 && (!user.length || user.length > 255 || !password.length || password.length > 255)) {
      throw new Error("SOCKS5 credentials must contain 1 to 255 bytes each");
    }
    socket.write(Buffer.from([5, 1, auth2 ? 2 : 0]));
    const greeting = await read(2);
    if (greeting[0] !== 5 || greeting[1] !== (auth2 ? 2 : 0)) throw new Error("SOCKS5 authentication method rejected");
    if (auth2) {
      socket.write(Buffer.concat([Buffer.from([1, user.length]), user, Buffer.from([password.length]), password]));
      const reply2 = await read(2);
      if (reply2[0] !== 1 || reply2[1] !== 0) throw new Error("SOCKS5 authentication failed");
    }
    const host = targetHost.replace(/^\[|\]$/g, "");
    let address;
    if (import_node_net2.default.isIPv4(host)) {
      address = Buffer.from([1, ...host.split(".").map(Number)]);
    } else if (import_node_net2.default.isIPv6(host)) {
      const canonical2 = new URL(`http://[${host}]/`).hostname.slice(1, -1);
      const halves = canonical2.split("::");
      const left = halves[0] ? halves[0].split(":") : [];
      const right = halves[1] ? halves[1].split(":") : [];
      const words = halves.length === 1 ? left : [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
      address = Buffer.alloc(17);
      address[0] = 4;
      words.forEach((word, index) => address.writeUInt16BE(parseInt(word, 16), 1 + index * 2));
    } else {
      const domain = Buffer.from(host);
      if (!domain.length || domain.length > 255) throw new Error("SOCKS5 target hostname is too long");
      address = Buffer.concat([Buffer.from([3, domain.length]), domain]);
    }
    socket.write(Buffer.concat([Buffer.from([5, 1, 0]), address, Buffer.from([targetPort >> 8, targetPort & 255])]));
    const reply = await read(4);
    if (reply[0] !== 5 || reply[1] !== 0 || reply[2] !== 0) throw new Error(`SOCKS5 connect error code: ${reply[1]}`);
    if (reply[3] === 1) await read(6);
    else if (reply[3] === 4) await read(18);
    else if (reply[3] === 3) await read((await read(1))[0] + 2);
    else throw new Error("SOCKS5 reply has an invalid address type");
    return socket;
  } catch (error2) {
    socket.destroy();
    throw error2;
  } finally {
    clearTimeout(timer);
    socket.removeListener("readable", onReadable);
    socket.removeListener("error", onError);
    socket.removeListener("close", onClose);
    socket.removeListener("end", onClose);
  }
}

var Socks5HttpAgent = class extends import_node_http2.default.Agent {
  constructor(proxy, options) {
    super(options);
    this.proxy = proxy;
  }
  proxy;
  createConnection(options, callback) {
    const host = options.host || options.hostname || "localhost";
    const port = Number(options.port) || 80;
    socks5Connect(this.proxy, host, port).then((socket) => callback?.(null, socket)).catch((err) => callback?.(err, void 0));
    return void 0;
  }
};

var Socks5HttpsAgent = class extends import_node_https.default.Agent {
  constructor(proxy, rejectUnauthorizedTls, options) {
    super(options);
    this.proxy = proxy;
    this.rejectUnauthorizedTls = rejectUnauthorizedTls;
  }
  proxy;
  rejectUnauthorizedTls;
  createConnection(options, callback) {
    const host = options.host || options.hostname || "localhost";
    const port = Number(options.port) || 443;
    socks5Connect(this.proxy, host, port).then((rawSocket) => {
      const tlsSocket = import_node_tls.default.connect({
        socket: rawSocket,
        servername: options.servername || host,
        rejectUnauthorized: this.rejectUnauthorizedTls !== false
      });
      tlsSocket.once("error", (err) => callback?.(err, void 0));
      tlsSocket.once("secureConnect", () => callback?.(null, tlsSocket));
    }).catch((err) => callback?.(err, void 0));
    return void 0;
  }
};

function electronNetFetch() {
  if (cachedElectronFetch !== void 0) return cachedElectronFetch ?? void 0;
  try {
    const electronModuleName = "electron";
    const electron = require(electronModuleName);
    cachedElectronFetch = typeof electron.net?.fetch === "function" ? electron.net.fetch.bind(electron.net) : null;
  } catch {
    cachedElectronFetch = null;
  }
  return cachedElectronFetch ?? void 0;
}

function attemptSignal(signal, timeoutMs) {
  const timeoutSignal2 = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal2]) : timeoutSignal2;
}

function errorMessage(error2) {
  return error2 instanceof Error ? `${error2.name}: ${error2.message}` : String(error2);
}

function requestInit(init, signal) {
  return {
    method: init.method ?? "GET",
    headers: init.headers,
    body: init.body,
    signal,
    cache: "no-store"
  };
}

function proxyAuthorization(proxy) {
  if (!proxy.username && !proxy.password) return void 0;
  const username = decodeURIComponent(proxy.username);
  const password = decodeURIComponent(proxy.password);
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function requestHeaders(init, target) {
  const headers = Object.fromEntries(new Headers(init.headers).entries());
  if (!headers.host) headers.host = target.host;
  if (init.body !== void 0 && !headers["content-length"] && !headers["transfer-encoding"]) {
    headers["content-length"] = String(Buffer.byteLength(init.body));
  }
  return headers;
}

function responseHeaders(input) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== void 0) {
      headers.set(key, String(value));
    }
  }
  return headers;
}

function toFetchResponse(response, method = "GET") {
  const status = response.statusCode ?? 500;
  const noBody = method.toUpperCase() === "HEAD" || [204, 205, 304].includes(status);
  if (noBody) response.resume();
  const body = noBody ? null : import_node_stream.Readable.toWeb(response);
  return new Response(body, {
    status,
    statusText: response.statusMessage ?? "",
    headers: responseHeaders(response.headers)
  });
}

function writeBody(request, body) {
  if (body !== void 0) request.write(body);
  request.end();
}

function directRequest(target, init) {
  return new Promise((resolve, reject) => {
    const request = requestForSelectedRoute(target.protocol)(
      target,
      {
        method: init.method ?? "GET",
        headers: requestHeaders(init, target),
        signal: init.signal,
        ...target.protocol === "https:" ? { rejectUnauthorized: init.rejectUnauthorized !== false } : {}
      },
      (response) => resolve(toFetchResponse(response, init.method))
    );
    request.once("error", reject);
    writeBody(request, init.body);
  });
}

function requestHttpTargetThroughProxy(target, proxy, init) {
  return new Promise((resolve, reject) => {
    const client = proxy.protocol === "https:" ? import_node_https.default : import_node_http2.default;
    const headers = requestHeaders(init, target);
    const authorization = proxyAuthorization(proxy);
    if (authorization) headers["proxy-authorization"] = authorization;
    const request = client.request(
      {
        protocol: proxy.protocol,
        hostname: proxy.hostname,
        port: proxy.port || (proxy.protocol === "https:" ? 443 : 80),
        method: init.method ?? "GET",
        path: target.toString(),
        headers,
        signal: init.signal,
        ...proxy.protocol === "https:" ? { rejectUnauthorized: init.rejectUnauthorized !== false } : {}
      },
      (response) => resolve(toFetchResponse(response, init.method))
    );
    request.once("error", reject);
    writeBody(request, init.body);
  });
}

function requestHttpsTargetThroughProxy(target, proxy, init) {
  return new Promise((resolve, reject) => {
    const agent = new import_https_proxy_agent.HttpsProxyAgent(proxy, {
      rejectUnauthorized: init.rejectUnauthorized !== false
    });
    const request = requestForSelectedRoute("https:")(
      target,
      {
        method: init.method ?? "GET",
        headers: requestHeaders(init, target),
        signal: init.signal,
        agent,
        rejectUnauthorized: init.rejectUnauthorized !== false
      },
      (result) => resolve(toFetchResponse(result, init.method))
    );
    request.once("error", reject);
    writeBody(request, init.body);
  });
}

function requestTargetThroughSocksProxy(target, proxy, init) {
  return new Promise((resolve, reject) => {
    const isHttps = target.protocol === "https:";
    const headers = requestHeaders(init, target);
    if (isHttps) {
      const agent = new Socks5HttpsAgent(proxy, init.rejectUnauthorized !== false);
      const request = requestForSelectedRoute("https:")(
        target,
        {
          method: init.method ?? "GET",
          headers,
          signal: init.signal,
          agent,
          rejectUnauthorized: init.rejectUnauthorized !== false
        },
        (result) => resolve(toFetchResponse(result, init.method))
      );
      request.once("error", reject);
      writeBody(request, init.body);
    } else {
      const agent = new Socks5HttpAgent(proxy);
      const request = requestForSelectedRoute("http:")(
        target,
        {
          method: init.method ?? "GET",
          headers,
          signal: init.signal,
          agent
        },
        (result) => resolve(toFetchResponse(result, init.method))
      );
      request.once("error", reject);
      writeBody(request, init.body);
    }
  });
}

function fetchThroughExtensionHostProxy(target, init) {
  if (init.proxySupport === "off") return directRequest(target, init);
  if (isPacUrl(init.proxyUrl)) throw pacConfigurationError();
  const proxyUrl = normalizeProxyUrl(init.proxyUrl, target.protocol, { allowSocks: true });
  if (init.proxyUrl?.trim() && !proxyUrl) throw new Error("Unsupported or invalid proxy URL");
  if (!proxyUrl) return directRequest(target, init);
  const proxy = new URL(proxyUrl);
  if (proxy.protocol.startsWith("socks")) {
    return requestTargetThroughSocksProxy(target, proxy, init);
  }
  return target.protocol === "https:" ? requestHttpsTargetThroughProxy(target, proxy, init) : requestHttpTargetThroughProxy(target, proxy, init);
}

function knownLocalSocksProxyScheme(proxyUrl) {
  try {
    const proxy = new URL(proxyUrl);
    if (proxy.protocol !== "http:") return proxyUrl;
    const rawHost = proxy.hostname.toLowerCase();
    const hostname3 = rawHost.startsWith("[") && rawHost.endsWith("]") ? rawHost.slice(1, -1) : rawHost;
    const loopback = hostname3 === "localhost" || hostname3 === "::1" || import_node_net2.default.isIP(hostname3) === 4 && hostname3.startsWith("127.");
    const port = Number(proxy.port);
    const definition = CANDIDATE_LOCAL_PROXY_PORTS.find((candidate) => candidate.port === port && candidate.defaultScheme === "socks5");
    if (!loopback || !definition) return proxyUrl;
    return proxyUrl.replace(/^http:/i, "socks5:");
  } catch {
    return proxyUrl;
  }
}

function resolveDeclaredProxy(target, init) {
  if (!init.respectProxyPolicy) return void 0;
  const declared = [
    init.configuredProxy,
    process.env.HTTPS_PROXY,
    process.env.https_proxy,
    process.env.ALL_PROXY,
    process.env.all_proxy,
    process.env.HTTP_PROXY,
    process.env.http_proxy,
    windowsSystemProxy()
  ].some((value) => value?.trim());
  const resolved = declared ? resolveExtensionHostProxy(target, init.configuredProxy) : void 0;
  if (!resolved) return void 0;
  const selected = knownLocalSocksProxyScheme(resolved);
  if (selected !== resolved) {
    init.log?.("Configured local proxy " + new URL(resolved).host + " is on a known SOCKS5-only port; using SOCKS5 at the same endpoint.");
  }
  return selected;
}

async function fetchWithExtensionHostPolicyOnce(target, init) {
  const request = requestInit(init, init.signal ?? new AbortController().signal);
  if (init.proxySupport === "off" || shouldBypassProxy(target)) return fetch(target, request);
  if ([init.proxyUrl, init.configuredProxy].some(isPacUrl)) throw pacConfigurationError();
  if ([init.proxyUrl, init.configuredProxy].some((value) => value?.trim() && !normalizeProxyUrl(value, target.protocol))) {
    throw new Error("Unsupported or invalid proxy URL");
  }
  const manualProxy = [
    init.proxyUrl,
    init.configuredProxy,
    process.env.HTTPS_PROXY,
    process.env.https_proxy,
    process.env.HTTP_PROXY,
    process.env.http_proxy,
    process.env.ALL_PROXY,
    process.env.all_proxy
  ].some((value) => value?.trim());
  if (!manualProxy && systemPacConfigured()) {
    const electronFetch = electronNetFetch();
    if (!electronFetch) throw pacConfigurationError();
    const response = await electronFetch(target.toString(), request);
    if (response.status === 407) {
      void response.body?.cancel().catch(() => void 0);
      throw new Error("System PAC proxy authentication required; direct fallback is disabled.");
    }
    return response;
  }
  const proxyUrl = init.proxyUrl ? normalizeProxyUrl(init.proxyUrl, target.protocol) : resolveDeclaredProxy(target, { ...init, respectProxyPolicy: true });
  if (!proxyUrl && manualProxy) throw new Error("Configured proxy is unsupported or unavailable; direct fallback is disabled.");
  if (proxyUrl) {
    const response = await fetchThroughExtensionHostProxy(target, { ...init, proxyUrl });
    if (response.status === 407) {
      void response.body?.cancel().catch(() => void 0);
      throw new Error("Configured proxy authentication required; direct fallback is disabled.");
    }
    return response;
  }
  return fetch(target, request);
}

async function fetchWithExtensionHostFallbacks(target, init) {
  const timeoutMs = Math.max(1e3, Math.min(init.attemptTimeoutMs ?? 2e4, 6e4));
  const failures = [];
  const run = async (name, operation, customTimeoutMs) => {
    if (init.signal?.aborted) throw init.signal.reason;
    try {
      init.log?.(`${name} -> ${target.origin}`);
      const effectiveTimeout = customTimeoutMs ?? timeoutMs;
      const response2 = await operation(attemptSignal(init.signal, effectiveTimeout));
      init.log?.(`${name} <- HTTP ${response2.status}`);
      return response2;
    } catch (error2) {
      if (init.signal?.aborted) throw init.signal.reason;
      const detail = `${name}: ${errorMessage(error2)}`;
      failures.push(detail);
      init.log?.(`${detail}; trying fallback`);
      return void 0;
    }
  };
  if (init.proxySupport === "off") {
    return directRequest(target, { ...init, signal: attemptSignal(init.signal, timeoutMs) });
  }
  if ([init.proxyUrl, init.configuredProxy].some(isPacUrl)) throw pacConfigurationError();
  if ([init.proxyUrl, init.configuredProxy].some((value) => value?.trim() && !normalizeProxyUrl(value, target.protocol))) {
    throw new Error("Unsupported or invalid proxy URL");
  }
  const isBypassed = !init.proxyUrl && shouldBypassProxy(target);
  const electronFetch = init.useElectron !== false ? electronNetFetch() : void 0;
  if (isBypassed) {
    const response2 = await run("Native direct", (signal) => directRequest(target, { ...init, signal }));
    if (response2) return response2;
    throw new Error(`Local network request failed after all transports. ${failures.join(" | ")}`);
  }
  const manualProxy = [
    init.proxyUrl,
    init.configuredProxy,
    process.env.HTTPS_PROXY,
    process.env.https_proxy,
    process.env.HTTP_PROXY,
    process.env.http_proxy,
    process.env.ALL_PROXY,
    process.env.all_proxy
  ].some((value) => value?.trim());
  if (!manualProxy && true && systemPacConfigured()) {
    if (!electronFetch) throw pacConfigurationError();
    const response2 = await run("Electron system PAC", (signal) => electronFetch(target.toString(), requestInit(init, signal)));
    if (response2 && response2.status !== 407) return response2;
    if (response2) void response2.body?.cancel().catch(() => void 0);
    throw new Error("System PAC transport failed or requires proxy authentication; automatic proxy/direct fallback is disabled.");
  }
  const declaredProxy = resolveDeclaredProxy(target, init);
  if (declaredProxy) {
    const response2 = await run("Configured proxy", (signal) => fetchThroughExtensionHostProxy(target, { ...init, proxyUrl: declaredProxy, signal }));
    if (response2 && response2.status !== 407) return response2;
    if (response2) void response2.body?.cancel().catch(() => void 0);
    throw new Error("Configured proxy network request failed; direct fallback is disabled. " + failures.join(" | "));
  }
  const proxyCandidates = [];
  const explicitProxies = /* @__PURE__ */ new Set();
  if (init.proxyUrl) {
    const norm = normalizeProxyUrl(init.proxyUrl, target.protocol, { allowSocks: true });
    if (norm) {
      proxyCandidates.push(norm);
      explicitProxies.add(norm);
    }
  }
  const resolved = await resolveExtensionHostProxyCandidates(target, init.configuredProxy);
  for (const c of resolved) {
    if (!proxyCandidates.includes(c)) proxyCandidates.push(c);
  }
  const scannedGuesses = new Set(
    (await scannedLocalProxyCandidates()).map((candidate) => normalizeProxyUrl(candidate, target.protocol, { allowSocks: true })).filter((candidate) => Boolean(candidate))
  );
  for (const explicit of explicitProxies) scannedGuesses.delete(explicit);
  if (proxyCandidates.length > 0) {
    let ambiguousGatewayResponse;
    for (const candidateProxy of proxyCandidates) {
      const proxyAttemptTimeout = timeoutMs;
      if (scannedGuesses.has(candidateProxy)) {
        const verified = await verifyProxyCandidate(candidateProxy, target, init, proxyAttemptTimeout);
        if (!verified) {
          const detail = `Proxy (${new URL(candidateProxy).protocol}//${new URL(candidateProxy).host}): not a usable forward proxy`;
          failures.push(detail);
          init.log?.(`${detail}; trying fallback`);
          continue;
        }
      }
      const response2 = await run(
        `Proxy (${new URL(candidateProxy).protocol}//${new URL(candidateProxy).host})`,
        (signal) => fetchThroughExtensionHostProxy(target, {
          ...init,
          proxyUrl: candidateProxy,
          signal
        }),
        proxyAttemptTimeout
      );
      if (response2) {
        if (isProxyRejection(response2.status)) {
          void response2.body?.cancel().catch(() => void 0);
          const detail = `Proxy (${new URL(candidateProxy).protocol}//${new URL(candidateProxy).host}): HTTP ${response2.status} proxy authentication required`;
          failures.push(detail);
          init.log?.(`${detail}; trying fallback`);
          continue;
        }
        if (target.protocol !== "https:" && isAmbiguousGatewayStatus(response2.status)) {
          const detail = `Proxy (${new URL(candidateProxy).protocol}//${new URL(candidateProxy).host}): HTTP ${response2.status} gateway error, origin unverified`;
          failures.push(detail);
          init.log?.(`${detail}; trying fallback`);
          if (!ambiguousGatewayResponse) ambiguousGatewayResponse = response2;
          else void response2.body?.cancel().catch(() => void 0);
          continue;
        }
        setCachedWorkingProxy(candidateProxy);
        return response2;
      }
    }
    if (ambiguousGatewayResponse) {
      const direct = electronFetch ? await run("Electron net.fetch (after gateway error)", (signal) => electronFetch(target.toString(), requestInit(init, signal))) : await run("Node fetch (after gateway error)", (signal) => fetch(target, requestInit(init, signal)));
      if (direct) {
        void ambiguousGatewayResponse.body?.cancel().catch(() => void 0);
        return direct;
      }
      init.log?.("Direct transports unavailable; returning the proxy gateway response unchanged");
      return ambiguousGatewayResponse;
    }
  }
  if (electronFetch) {
    const response2 = await run(
      "Electron net.fetch",
      (signal) => electronFetch(target.toString(), requestInit(init, signal))
    );
    if (response2) return response2;
  } else if (init.useElectron !== false) {
    init.log?.("Electron net.fetch unavailable; trying fallback");
  }
  const response = await run("Node fetch", (signal) => fetch(target, requestInit(init, signal)));
  if (response) return response;
  throw new Error(`Network request failed after all transports. ${failures.join(" | ")}`);
}

export { registryValue, queryWindowsInternetSettings, getWindowsInternetSettings, windowsSystemProxy, shouldBypassProxy, probeLocalPort, detectActiveLocalProxyPorts, getCachedWorkingProxy, setCachedWorkingProxy, scannedLocalProxyCandidates, isProxyRejection, isAmbiguousGatewayStatus, verifyProxyCandidate, probeHttpProxyConnect, proxyRuleValue, systemPacConfigured, normalizeProxyUrl, resolveExtensionHostProxyCandidates, resolveExtensionHostProxy, socks5Connect, electronNetFetch, attemptSignal, errorMessage, requestInit, proxyAuthorization, requestHeaders, responseHeaders, toFetchResponse, writeBody, directRequest, requestHttpTargetThroughProxy, requestHttpsTargetThroughProxy, requestTargetThroughSocksProxy, fetchThroughExtensionHostProxy, knownLocalSocksProxyScheme, resolveDeclaredProxy, fetchWithExtensionHostPolicyOnce, fetchWithExtensionHostFallbacks, import_node_child_process4, import_node_http2, import_node_https, import_node_net2, import_node_tls, import_node_stream, import_https_proxy_agent, WINDOWS_INTERNET_SETTINGS, SYSTEM_PROXY_CACHE_MS, LOCAL_PROBE_CACHE_MS, WORKING_PROXY_CACHE_MS, PROXY_VERIFICATION_CACHE_MS, CANDIDATE_LOCAL_PROXY_PORTS, cachedWindowsSettings, cachedActiveLocalPorts, cachedWorkingProxy, cachedElectronFetch, cachedProxyVerifications, Socks5HttpAgent, Socks5HttpsAgent };
