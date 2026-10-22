// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-secret-admin.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { EXTERNAL_MCP_MAX_SECRET_FIELDS, validateSecretName, validateSecretValue } from "./module-0063.mjs";
import { validateExternalMcpUrl } from "./module-0060.mjs";


// extensions/opencode/src/external-mcp-secret-admin.ts
init_define_OPENCODE_BUILD_INFO();

function find(catalog, id) {
  const server = typeof id === "string" ? catalog.snapshot().servers.find((item) => item.id === id) : void 0;
  if (!server) throw new Error("MCP \u670D\u52A1\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u3002");
  return server;
}

function refsOf(server, kind) {
  if (kind === "header" && server.transport !== "http") throw new Error("stdio \u670D\u52A1\u4F7F\u7528\u73AF\u5883\u53D8\u91CF\u63D0\u4F9B\u5BC6\u94A5\uFF0C\u4E0D\u652F\u6301 Header\u3002");
  if (kind === "env" && server.transport !== "stdio") throw new Error("HTTP \u670D\u52A1\u4F7F\u7528 Header \u63D0\u4F9B\u5BC6\u94A5\uFF0C\u4E0D\u652F\u6301\u73AF\u5883\u53D8\u91CF\u3002");
  return { ...(kind === "header" ? server.headerRefs : server.envRefs) ?? {} };
}

function setRefs(server, kind, refs2) {
  const value = Object.keys(refs2).length ? refs2 : void 0;
  if (kind === "header") {
    if (value) server.headerRefs = value;
    else delete server.headerRefs;
  } else if (value) server.envRefs = value;
  else delete server.envRefs;
}

var sameName = (kind, a, b) => kind === "header" ? a.toLowerCase() === b.toLowerCase() : a === b;

async function getSecretRefs(catalog, id) {
  const server = find(catalog, id);
  let urlHasCredential = false, argsCount = 0;
  if (server.transport === "http" && server.urlRef) {
    try {
      const url2 = new URL(await catalog.readSecret(server, server.urlRef));
      urlHasCredential = url2.search !== "" || url2.pathname.split("/").some((part) => /^[A-Za-z0-9_-]{20,}$/.test(part));
    } catch {
    }
  }
  if (server.transport === "stdio" && server.argsRef) {
    try {
      const args = JSON.parse(await catalog.readSecret(server, server.argsRef));
      argsCount = Array.isArray(args) ? args.length : 0;
    } catch {
    }
  }
  return {
    id: server.id,
    transport: server.transport,
    headers: Object.keys(server.headerRefs ?? {}),
    env: Object.keys(server.envRefs ?? {}),
    urlHasCredential,
    argsCount,
    ...server.transport === "stdio" ? { proxyMode: server.proxyMode ?? "inherit" } : {}
  };
}

async function setSecret(catalog, id, kind, name, value) {
  if (kind !== "header" && kind !== "env") throw new Error("\u5BC6\u94A5\u7C7B\u578B\u53EA\u80FD\u662F header \u6216 env\u3002");
  const field3 = validateSecretName(kind, name), secret = validateSecretValue(kind, value);
  await catalog.updateServer(find(catalog, id).id, async (server, store) => {
    if (server.authType === "oauth" && kind === "header" && field3.toLowerCase() === "authorization") throw new Error("OAuth \u7BA1\u7406 Authorization\uFF1B\u53EF\u6DFB\u52A0\u5176\u4ED6\u8BF7\u6C42\u5934\u3002");
    const refs2 = refsOf(server, kind);
    const existing = Object.keys(refs2).find((key) => sameName(kind, key, field3));
    if (!existing && Object.keys(refs2).length >= EXTERNAL_MCP_MAX_SECRET_FIELDS) throw new Error(`\u6BCF\u4E2A\u670D\u52A1\u6700\u591A ${EXTERNAL_MCP_MAX_SECRET_FIELDS} \u9879\u5BC6\u94A5\u3002`);
    const obsolete = existing ? [refs2[existing]] : [];
    if (existing) delete refs2[existing];
    refs2[field3] = await store(secret);
    setRefs(server, kind, refs2);
    return obsolete;
  });
}

async function clearSecret(catalog, id, kind, name) {
  if (kind !== "header" && kind !== "env") throw new Error("\u5BC6\u94A5\u7C7B\u578B\u53EA\u80FD\u662F header \u6216 env\u3002");
  if (typeof name !== "string") throw new Error("\u5BC6\u94A5\u540D\u79F0\u65E0\u6548\u3002");
  await catalog.updateServer(find(catalog, id).id, async (server) => {
    const refs2 = refsOf(server, kind);
    const existing = Object.keys(refs2).find((key) => sameName(kind, key, name));
    if (!existing) throw new Error("\u8BE5\u5BC6\u94A5\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u3002");
    const obsolete = [refs2[existing]];
    delete refs2[existing];
    setRefs(server, kind, refs2);
    return obsolete;
  });
}

async function clearAllSecrets(catalog, id) {
  await catalog.updateServer(find(catalog, id).id, async (server) => {
    const obsolete = [...Object.values(server.headerRefs ?? {}), ...Object.values(server.envRefs ?? {})];
    delete server.headerRefs;
    delete server.envRefs;
    return obsolete;
  });
}

async function setProxyMode(catalog, id, mode, proxy) {
  if (mode !== "inherit" && mode !== "none" && mode !== "custom") throw new Error("\u7F51\u7EDC\u4EE3\u7406\u9009\u9879\u53EA\u80FD\u662F inherit\u3001none \u6216 custom\u3002");
  let url2;
  if (mode === "custom") {
    try {
      const parsed = new URL(String(proxy ?? "").trim());
      if (!["http:", "https:", "socks:", "socks5:", "socks5h:"].includes(parsed.protocol) || !parsed.hostname) throw new Error("scheme");
      url2 = String(proxy).trim().replace(/\/$/, "");
    } catch {
      throw new Error("\u4EE3\u7406\u5730\u5740\u987B\u4E3A http://\u3001https:// \u6216 socks5:// \u5F00\u5934\u7684\u5B8C\u6574\u5730\u5740\u3002");
    }
  }
  await catalog.updateServer(find(catalog, id).id, async (server, store) => {
    if (server.transport !== "stdio") throw new Error("\u53EA\u6709 stdio \u670D\u52A1\u53EF\u4EE5\u5355\u72EC\u8BBE\u7F6E\u7F51\u7EDC\u4EE3\u7406\uFF1BHTTP \u670D\u52A1\u4F7F\u7528 OpenCode \u7684\u7F51\u7EDC\u8BBE\u7F6E\u3002");
    const obsolete = server.proxyRef ? [server.proxyRef] : [];
    if (mode === "inherit") delete server.proxyMode;
    else server.proxyMode = mode;
    if (url2) server.proxyRef = await store(url2);
    else delete server.proxyRef;
    return obsolete;
  });
}

async function replaceUrl(catalog, id, value) {
  if (typeof value !== "string") throw new Error("\u8BF7\u8F93\u5165\u65B0\u7684\u5B8C\u6574\u5730\u5740\u3002");
  const next = validateExternalMcpUrl(value);
  await catalog.updateServer(find(catalog, id).id, async (server, store) => {
    if (server.transport !== "http" || !server.urlRef) throw new Error("\u53EA\u6709 HTTP \u670D\u52A1\u53EF\u4EE5\u66FF\u6362\u5730\u5740\u3002");
    const current = new URL(await catalog.readSecret(server, server.urlRef));
    if (current.origin !== next.origin) throw new Error(`\u65B0\u5730\u5740\u5FC5\u987B\u4ECD\u662F ${current.origin}\uFF1B\u8981\u8FDE\u63A5\u5176\u4ED6\u670D\u52A1\uFF0C\u8BF7\u5220\u9664\u540E\u91CD\u65B0\u5BFC\u5165\u3002`);
    const obsolete = [server.urlRef];
    server.urlRef = await store(next.toString());
    return obsolete;
  });
}

async function replaceArgs(catalog, id, args) {
  if (!Array.isArray(args) || args.length > 64 || args.some((arg) => typeof arg !== "string" || !arg || arg.length > 4096 || /[\r\n\0]/.test(arg) || arg.includes("${"))) {
    throw new Error("\u53C2\u6570\u987B\u4E3A\u6700\u591A 64 \u9879\u3001\u6BCF\u9879\u4E0D\u8D85\u8FC7 4096 \u4E2A\u5B57\u7B26\u7684\u975E\u7A7A\u5B57\u7B26\u4E32\uFF0C\u4E14\u4E0D\u542B\u6362\u884C\u6216\u53D8\u91CF\u5F15\u7528\u3002");
  }
  await catalog.updateServer(find(catalog, id).id, async (server, store) => {
    if (server.transport !== "stdio") throw new Error("\u53EA\u6709 stdio \u670D\u52A1\u53EF\u4EE5\u66FF\u6362\u53C2\u6570\u3002");
    const obsolete = server.argsRef ? [server.argsRef] : [];
    if (args.length) server.argsRef = await store(JSON.stringify(args));
    else delete server.argsRef;
    return obsolete;
  });
}
export { find, refsOf, setRefs, getSecretRefs, setSecret, clearSecret, clearAllSecrets, setProxyMode, replaceUrl, replaceArgs, sameName };
