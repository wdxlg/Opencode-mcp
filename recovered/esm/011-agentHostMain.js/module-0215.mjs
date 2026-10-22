// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/networkFilter/common/domainMatcher.ts
import { URI } from "./module-0023.mjs";


// src/vs/platform/networkFilter/common/domainMatcher.ts
var fileExtensionSuffixes = /* @__PURE__ */ new Set([
  "7z",
  "bz2",
  "cjs",
  "class",
  "cpp",
  "cs",
  "css",
  "csv",
  "dll",
  "exe",
  "gif",
  "gz",
  "ico",
  "jar",
  "env",
  "java",
  "jpeg",
  "jpg",
  "js",
  "json",
  "jsx",
  "lock",
  "log",
  "md",
  "mjs",
  "pdf",
  "php",
  "png",
  "py",
  "rar",
  "rs",
  "so",
  "sql",
  "svg",
  "tar",
  "tgz",
  "toml",
  "ts",
  "tsx",
  "txt",
  "wasm",
  "webp",
  "xml",
  "yaml",
  "yml",
  "zip"
]);

var wellKnownDomainSuffixes = /* @__PURE__ */ new Set([
  "ai",
  "cloud",
  "com",
  "dev",
  "io",
  "me",
  "net",
  "org",
  "tech"
]);

function normalizeDomain(value, fromUrl = false) {
  if (!value) {
    return void 0;
  }
  const normalized = value.trim().toLowerCase().replace(/^[^@]+@/, "").replace(/:\d+$/, "").replace(/\.+$/, "");
  if (!normalized || normalized.includes("/") || normalized === "." || normalized === "..") {
    return void 0;
  }
  if (normalized === "*") {
    return "*";
  }
  if (!/^\*?\.?[a-z0-9.;,)!?:-]+$/.test(normalized)) {
    return void 0;
  }
  const stripped = normalized.replace(/[),;:!?]+$/, "");
  if (!stripped) {
    return void 0;
  }
  const domainToValidate = stripped.startsWith("*.") ? stripped.slice(2) : stripped;
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?))*$/.test(domainToValidate)) {
    return void 0;
  }
  const hasWildcardPrefix = stripped.startsWith("*.");
  const host = hasWildcardPrefix ? stripped.slice(2) : stripped;
  if (!host) {
    return void 0;
  }
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return void 0;
  }
  if (!fromUrl) {
    const lastLabel = host.slice(host.lastIndexOf(".") + 1);
    if (fileExtensionSuffixes.has(lastLabel)) {
      return void 0;
    }
    if (!wellKnownDomainSuffixes.has(lastLabel)) {
      return void 0;
    }
  }
  return hasWildcardPrefix ? `*.${host}` : host;
}

function normalizeUriAuthority(authority) {
  if (!authority || /[/?#\\]/.test(authority)) {
    return void 0;
  }
  let hostname2;
  try {
    hostname2 = new URL(`http://${authority}`).hostname.toLowerCase();
  } catch {
    return void 0;
  }
  if (hostname2.startsWith("[")) {
    return hostname2.endsWith("]") ? hostname2 : void 0;
  }
  return normalizeDomain(hostname2, true);
}

function normalizeBareIPv6Address(value) {
  if (!value.includes(":") || /[\[\]]/.test(value)) {
    return void 0;
  }
  return normalizeUriAuthority(`[${value}]`);
}

function extractDomainPattern(pattern) {
  const trimmed = pattern.trim();
  if (trimmed === "*") {
    return trimmed;
  }
  if (!trimmed.includes("://")) {
    return trimmed;
  }
  try {
    return URI.parse(trimmed).authority;
  } catch {
    return trimmed;
  }
}

function matchesDomainPattern(domain, pattern) {
  const extractedPattern = extractDomainPattern(pattern);
  const normalizedPattern = normalizeUriAuthority(extractedPattern) ?? normalizeBareIPv6Address(extractedPattern) ?? normalizeDomain(extractedPattern, true);
  if (!normalizedPattern) {
    return false;
  }
  if (normalizedPattern === "*") {
    return true;
  }
  if (normalizedPattern.startsWith("*.")) {
    const suffix = normalizedPattern.slice(2);
    return domain === suffix || domain.endsWith(`.${suffix}`);
  }
  return domain === normalizedPattern;
}
export { normalizeDomain, normalizeUriAuthority, normalizeBareIPv6Address, extractDomainPattern, matchesDomainPattern, fileExtensionSuffixes, wellKnownDomainSuffixes };
