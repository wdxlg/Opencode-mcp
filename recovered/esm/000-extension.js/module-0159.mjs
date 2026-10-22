// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/cloudflare-edge-relay.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/cloudflare-edge-relay.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_net5 = __toESM(require("node:net"));

var import_node_tls3 = __toESM(require("node:tls"));

var CLOUDFLARE_EDGE_TARGETS = ["region1.v2.argotunnel.com:7844", "region2.v2.argotunnel.com:7844", "198.41.192.7:7844", "198.41.200.53:7844"];

var HEADER_LIMIT = 16 * 1024;

var ProxyConnectError = class extends Error {
  constructor(message2, status) {
    super(message2);
    this.status = status;
    this.name = "ProxyConnectError";
  }
  status;
};

function parseRelayProxy(value) {
  let url2;
  try {
    url2 = new URL(value);
  } catch {
    throw new ProxyConnectError("The HTTP proxy address is not a valid URL.");
  }
  if (url2.protocol !== "http:" && url2.protocol !== "https:") {
    throw new ProxyConnectError(`The Quick Tunnel proxy route needs an HTTP(S) proxy; ${url2.protocol.replace(/:$/, "")} proxies are not supported.`);
  }
  return url2;
}

function openConnectTunnel(proxy, target, timeoutMs = 1e4) {
  return new Promise((resolve, reject) => {
    const port = Number(proxy.port) || (proxy.protocol === "https:" ? 443 : 80);
    const socket = proxy.protocol === "https:" ? import_node_tls3.default.connect({ host: proxy.hostname, port, servername: import_node_net5.default.isIP(proxy.hostname) ? void 0 : proxy.hostname }) : import_node_net5.default.connect({ host: proxy.hostname, port });
    let buffered = Buffer.alloc(0);
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("error", onError);
      socket.off("close", onClose);
      socket.off("data", onData);
    };
    const fail2 = (error2) => {
      if (settled) return;
      settled = true;
      cleanup();
      socket.destroy();
      reject(error2);
    };
    const onError = (error2) => fail2(new ProxyConnectError(`Cannot reach the HTTP proxy for CONNECT ${target} (${error2.code ?? "error"}).`));
    const onClose = () => fail2(new ProxyConnectError(`The HTTP proxy closed the connection during CONNECT ${target}.`));
    const onData = (chunk) => {
      buffered = Buffer.concat([buffered, chunk]);
      const end = buffered.indexOf("\r\n\r\n");
      if (end < 0) {
        if (buffered.length > HEADER_LIMIT) fail2(new ProxyConnectError(`The HTTP proxy sent an oversized answer to CONNECT ${target}.`));
        return;
      }
      const statusLine = buffered.subarray(0, buffered.indexOf("\r\n")).toString("latin1");
      const status = Number(/^HTTP\/1\.[01] (\d{3})\b/.exec(statusLine)?.[1]);
      if (status !== 200) {
        fail2(new ProxyConnectError(`The HTTP proxy refused CONNECT ${target} (HTTP ${Number.isFinite(status) ? status : "?"}).`, Number.isFinite(status) ? status : void 0));
        return;
      }
      settled = true;
      cleanup();
      socket.pause();
      const rest = buffered.subarray(end + 4);
      if (rest.length) socket.unshift(rest);
      resolve(socket);
    };
    const timer = setTimeout(() => fail2(new ProxyConnectError(`The HTTP proxy did not answer CONNECT ${target} within ${Math.round(timeoutMs / 1e3)} seconds.`)), timeoutMs);
    socket.on("error", onError);
    socket.on("close", onClose);
    socket.on("data", onData);
    socket.once(proxy.protocol === "https:" ? "secureConnect" : "connect", () => {
      const credentials = proxy.username || proxy.password ? `Proxy-Authorization: Basic ${Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString("base64")}\r
` : "";
      socket.write(`CONNECT ${target} HTTP/1.1\r
Host: ${target}\r
${credentials}\r
`);
    });
  });
}

async function startEdgeRelay(options) {
  const proxy = parseRelayProxy(options.proxyUrl);
  const targets = options.targets?.length ? options.targets : CLOUDFLARE_EDGE_TARGETS;
  const sockets = /* @__PURE__ */ new Set();
  const track = (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  };
  let next = 0;
  let lastError;
  const logged = /* @__PURE__ */ new Set();
  const log = (line) => {
    if (logged.has(line) || logged.size >= 24) return;
    logged.add(line);
    options.log?.(`[bridge] Cloudflare edge relay: ${line}`);
  };
  const carry = async (client) => {
    for (let index = 0; index < targets.length; index++) {
      const target = targets[(next + index) % targets.length];
      let upstream;
      try {
        upstream = await openConnectTunnel(proxy, target, options.connectTimeoutMs);
      } catch (error2) {
        lastError = error2 instanceof ProxyConnectError ? error2 : new ProxyConnectError(String(error2));
        log(lastError.message);
        continue;
      }
      if (client.destroyed) {
        upstream.destroy();
        return;
      }
      next = (next + index + 1) % targets.length;
      log(`CONNECT ${target} accepted by the HTTP proxy.`);
      track(upstream);
      let answered = false;
      upstream.once("data", () => {
        answered = true;
        lastError = void 0;
      });
      upstream.on("error", () => upstream.destroy());
      upstream.once("close", () => {
        if (!answered) {
          lastError = new ProxyConnectError(`The HTTP proxy accepted CONNECT ${target}, but the connection closed before the Cloudflare edge answered; the proxy's route to port 7844 is probably blocked.`);
          log(lastError.message);
        }
        client.destroy();
      });
      client.once("close", () => upstream.destroy());
      client.pipe(upstream);
      upstream.pipe(client);
      client.resume();
      upstream.resume();
      return;
    }
    client.destroy();
  };
  const server = import_node_net5.default.createServer({ pauseOnConnect: true }, (client) => {
    track(client);
    client.on("error", () => client.destroy());
    void carry(client);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const port = server.address().port;
  let closing;
  return {
    port,
    lastError: () => lastError,
    close: () => closing ??= new Promise((resolve) => {
      for (const socket of sockets) socket.destroy();
      server.close(() => resolve());
    })
  };
}
export { parseRelayProxy, openConnectTunnel, startEdgeRelay, import_node_net5, import_node_tls3, CLOUDFLARE_EDGE_TARGETS, HEADER_LIMIT, ProxyConnectError };
