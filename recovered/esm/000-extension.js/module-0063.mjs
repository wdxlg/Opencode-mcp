// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-secret-fields.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/external-mcp-secret-fields.ts
init_define_OPENCODE_BUILD_INFO();

var EXTERNAL_MCP_MAX_SECRET_FIELDS = 40;

var EXTERNAL_MCP_MAX_SECRET_VALUE = 4096;

var EXTERNAL_MCP_RESERVED_HEADERS = [
  "Host",
  "Content-Length",
  "Transfer-Encoding",
  "Connection",
  "Mcp-Session-Id",
  "MCP-Protocol-Version",
  "Proxy-Authorization",
  "X-OpenCode-Managed-Streamable-HTTP",
  "X-OpenCode-MCP-Timeout-MS",
  "X-OpenCode-MCP-OAuth"
];

var RESERVED = new Set(EXTERNAL_MCP_RESERVED_HEADERS.map((name) => name.toLowerCase()));

var HEADER_NAME = /^[A-Za-z][A-Za-z0-9_-]*$/;

var ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

var PLAIN = (value) => typeof value === "object" && value !== null && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

function validateSecretName(kind, name) {
  if (typeof name !== "string" || !name || name.length > 100) throw new Error(kind === "header" ? "Header \u540D\u79F0\u65E0\u6548\u3002" : "\u73AF\u5883\u53D8\u91CF\u540D\u79F0\u65E0\u6548\u3002");
  if (kind === "header") {
    if (!HEADER_NAME.test(name)) throw new Error(`Header \u540D\u79F0\u300C${name.slice(0, 40)}\u300D\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001- \u548C _\uFF0C\u5E76\u4EE5\u5B57\u6BCD\u5F00\u5934\u3002`);
    if (RESERVED.has(name.toLowerCase())) throw new Error(`Header\u300C${name}\u300D\u7531\u8FDE\u63A5\u672C\u8EAB\u4F7F\u7528\uFF0C\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u5BC6\u94A5\u3002`);
  } else {
    if (!ENV_NAME.test(name)) throw new Error(`\u73AF\u5883\u53D8\u91CF\u540D\u300C${name.slice(0, 40)}\u300D\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u548C _\uFF0C\u4E14\u4E0D\u80FD\u4EE5\u6570\u5B57\u5F00\u5934\u3002`);
    if (["OPENCODE_MCP_MANAGED", "OPENCODE_MCP_TIMEOUT_MS"].includes(name.toUpperCase())) throw new Error("\u8BE5\u73AF\u5883\u53D8\u91CF\u7531 OpenCode \u5185\u90E8\u4F7F\u7528\u3002");
  }
  return name;
}

function validateSecretValue(kind, value) {
  if (typeof value !== "string" || !value) throw new Error("\u8BF7\u586B\u5199\u5BC6\u94A5\u503C\u3002");
  if (value.length > EXTERNAL_MCP_MAX_SECRET_VALUE) throw new Error(`\u5BC6\u94A5\u503C\u8D85\u8FC7 ${EXTERNAL_MCP_MAX_SECRET_VALUE} \u4E2A\u5B57\u7B26\u3002`);
  if (value.includes("${")) throw new Error("\u5BC6\u94A5\u503C\u5305\u542B\u5C1A\u672A\u89E3\u6790\u7684\u53D8\u91CF\u5F15\u7528\uFF1B\u8BF7\u586B\u5199\u5B9E\u9645\u503C\u3002");
  if (kind === "header" ? /[\r\n\0]/.test(value) : value.includes("\0")) throw new Error("\u5BC6\u94A5\u503C\u5305\u542B\u6362\u884C\u6216\u7A7A\u5B57\u7B26\u3002");
  return value;
}

function fields(kind, value) {
  if (value === void 0) return void 0;
  if (!PLAIN(value)) throw new Error(kind === "header" ? "Header \u5BC6\u94A5\u683C\u5F0F\u65E0\u6548\u3002" : "\u73AF\u5883\u53D8\u91CF\u5BC6\u94A5\u683C\u5F0F\u65E0\u6548\u3002");
  const result = /* @__PURE__ */ Object.create(null);
  for (const [name, entry] of Object.entries(value)) {
    if (entry === "" || entry === void 0) continue;
    result[validateSecretName(kind, name)] = validateSecretValue(kind, entry);
  }
  if (Object.keys(result).length > EXTERNAL_MCP_MAX_SECRET_FIELDS) throw new Error(`\u6BCF\u4E2A\u670D\u52A1\u6700\u591A ${EXTERNAL_MCP_MAX_SECRET_FIELDS} \u9879\u5BC6\u94A5\u3002`);
  return Object.keys(result).length ? result : void 0;
}

function normalizeImportSecrets(raw, entries) {
  const result = /* @__PURE__ */ new Map();
  if (raw === void 0 || raw === null) return result;
  if (!PLAIN(raw)) throw new Error("\u5BC6\u94A5\u53C2\u6570\u683C\u5F0F\u65E0\u6548\u3002");
  for (const [id, value] of Object.entries(raw)) {
    const entry = entries.find((item) => item.id === id);
    if (!entry) throw new Error("\u5BC6\u94A5\u53EA\u80FD\u63D0\u4EA4\u7ED9\u672C\u6B21\u52FE\u9009\u7684\u670D\u52A1\u3002");
    if (!PLAIN(value)) throw new Error("\u5BC6\u94A5\u53C2\u6570\u683C\u5F0F\u65E0\u6548\u3002");
    const { bearer, headers, env: env10, oauthClientSecret, ...rest } = value;
    if (Object.keys(rest).length) throw new Error("\u5BC6\u94A5\u53C2\u6570\u5305\u542B\u672A\u77E5\u5B57\u6BB5\u3002");
    if (entry.transport === "http" && env10 !== void 0) throw new Error("HTTP \u670D\u52A1\u4F7F\u7528 Header \u63D0\u4F9B\u5BC6\u94A5\uFF0C\u4E0D\u652F\u6301\u73AF\u5883\u53D8\u91CF\u3002");
    if (entry.transport === "stdio" && (headers !== void 0 || bearer !== void 0 && bearer !== "")) throw new Error("stdio \u670D\u52A1\u4F7F\u7528\u73AF\u5883\u53D8\u91CF\u63D0\u4F9B\u5BC6\u94A5\uFF0C\u4E0D\u652F\u6301 Header\u3002");
    const normalized = {};
    const headerValues = fields("header", headers);
    if (entry.authType === "oauth" && (bearer || Object.keys(headerValues ?? {}).some((key) => key.toLowerCase() === "authorization"))) throw new Error("OAuth \u4E0E Bearer/Authorization \u4E0D\u80FD\u540C\u65F6\u4F7F\u7528\u3002");
    if (oauthClientSecret !== void 0 && oauthClientSecret !== "") {
      if (entry.authType !== "oauth" || !entry.oauth?.clientId) throw new Error("OAuth Client Secret \u9700\u8981 OAuth \u6A21\u5F0F\u53CA Client ID\u3002");
      normalized.oauthClientSecret = validateSecretValue("header", oauthClientSecret);
    }
    if (bearer !== void 0 && bearer !== "") {
      if (headerValues && Object.keys(headerValues).some((name) => name.toLowerCase() === "authorization")) throw new Error("Bearer \u4EE4\u724C\u4E0E\u81EA\u5B9A\u4E49 Authorization Header \u53EA\u80FD\u9009\u4E00\u79CD\u3002");
      const token = validateSecretValue("header", bearer);
      if (/\s/.test(token)) throw new Error("Bearer \u4EE4\u724C\u4E0D\u80FD\u5305\u542B\u7A7A\u767D\u5B57\u7B26\u3002");
      normalized.headers = { ...headerValues ?? {}, Authorization: `Bearer ${token}` };
    } else if (headerValues) normalized.headers = headerValues;
    const envValues = fields("env", env10);
    if (envValues) normalized.env = envValues;
    if (normalized.headers || normalized.env || normalized.oauthClientSecret) result.set(id, normalized);
  }
  return result;
}

function mergeSecretFields(kind, fromJson, fromUser) {
  if (!fromUser) return fromJson;
  const merged = /* @__PURE__ */ Object.create(null);
  const overridden = new Set(Object.keys(fromUser).map((name) => kind === "header" ? name.toLowerCase() : name));
  for (const [name, value] of Object.entries(fromJson ?? {})) if (!overridden.has(kind === "header" ? name.toLowerCase() : name)) merged[name] = value;
  for (const [name, value] of Object.entries(fromUser)) merged[name] = value;
  if (Object.keys(merged).length > EXTERNAL_MCP_MAX_SECRET_FIELDS) throw new Error(`\u6BCF\u4E2A\u670D\u52A1\u6700\u591A ${EXTERNAL_MCP_MAX_SECRET_FIELDS} \u9879\u5BC6\u94A5\u3002`);
  return merged;
}
export { validateSecretName, validateSecretValue, fields, normalizeImportSecrets, mergeSecretFields, EXTERNAL_MCP_MAX_SECRET_FIELDS, EXTERNAL_MCP_MAX_SECRET_VALUE, EXTERNAL_MCP_RESERVED_HEADERS, RESERVED, HEADER_NAME, ENV_NAME, PLAIN };
