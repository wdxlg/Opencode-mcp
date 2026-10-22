// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/chatUrlFetchingPatterns.ts
import { normalizeURL2 } from "./module-1239.mjs";
import { URI } from "./module-0032.mjs";
import { testUrlMatchesGlob } from "./module-1238.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/chatUrlFetchingPatterns.ts
function extractUrlPatterns(url) {
  const normalizedStr = normalizeURL2(url);
  const normalized = URI.parse(normalizedStr);
  const patterns = /* @__PURE__ */ new Set();
  const fullUrl = normalized.toString(true);
  patterns.add(fullUrl);
  const domainOnly = normalized.with({ path: "", query: "", fragment: "" }).toString(true);
  patterns.add(domainOnly);
  const authority = normalized.authority;
  const domainParts = authority.split(".");
  const isIPv4 = domainParts.length === 4 && domainParts.every((segment) => Number.isInteger(+segment));
  const isIPv6 = authority.includes(":") && authority.match(/^(\[)?[0-9a-fA-F:]+(\])?(?::\d+)?$/);
  const isIP = isIPv4 || isIPv6;
  if (!isIP && domainParts.length > 2) {
    for (let i2 = 0; i2 < domainParts.length - 2; i2++) {
      const wildcardAuthority = "*." + domainParts.slice(i2 + 1).join(".");
      const wildcardPattern = normalized.with({
        authority: wildcardAuthority,
        path: "",
        query: "",
        fragment: ""
      }).toString(true);
      patterns.add(wildcardPattern);
    }
  }
  const pathSegments = normalized.path.split("/").filter((s) => s.length > 0);
  if (pathSegments.length > 0) {
    for (let i2 = pathSegments.length - 1; i2 >= 0; i2--) {
      const pathPattern = pathSegments.slice(0, i2).join("/");
      const urlWithPathPattern = normalized.with({
        path: (i2 > 0 ? "/" : "") + pathPattern,
        query: "",
        fragment: ""
      }).toString(true);
      patterns.add(urlWithPathPattern);
    }
  }
  return [...patterns].map((p) => p.replace(/\/+$/, ""));
}

function getPatternLabel(url, pattern) {
  let displayPattern = pattern;
  if (displayPattern.startsWith("https://")) {
    displayPattern = displayPattern.substring(8);
  } else if (displayPattern.startsWith("http://")) {
    displayPattern = displayPattern.substring(7);
  }
  return displayPattern.replace(/\/+$/, "");
}

function isUrlApproved(url, approvedUrls, checkRequest) {
  const normalizedUrlStr = normalizeURL2(url);
  const normalizedUrl = URI.parse(normalizedUrlStr);
  for (const [pattern, settings] of Object.entries(approvedUrls)) {
    if (testUrlMatchesGlob(normalizedUrl, pattern)) {
      if (typeof settings === "boolean") {
        return settings;
      }
      if (checkRequest && settings.approveRequest !== void 0) {
        return settings.approveRequest;
      }
      if (!checkRequest && settings.approveResponse !== void 0) {
        return settings.approveResponse;
      }
    }
  }
  return false;
}
export { extractUrlPatterns, getPatternLabel, isUrlApproved };
