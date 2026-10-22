// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/mcp/common/allowedMcpServers.ts
import { isObject, isString } from "./module-0010.mjs";
import { equals } from "./module-0007.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";


// src/vs/platform/mcp/common/allowedMcpServers.ts
function getMcpServerMatchers(value2) {
  if (!Array.isArray(value2)) {
    return void 0;
  }
  return value2.filter(isValidMatcher);
}

function isValidMatcher(entry) {
  if (!isObject(entry)) {
    return false;
  }
  const { serverName, serverUrl, serverCommand } = entry;
  const hasName = isString(serverName) && serverName.length > 0;
  const hasUrl = isString(serverUrl) && serverUrl.length > 0;
  const hasCommand = Array.isArray(serverCommand) && serverCommand.length > 0 && serverCommand.every(isString);
  return (hasName ? 1 : 0) + (hasUrl ? 1 : 0) + (hasCommand ? 1 : 0) === 1;
}

function isMcpServerMatched(matchers, identity2) {
  return !!matchers && matchers.some((matcher) => matchesMatcher(matcher, identity2));
}

function checkMcpServerAllowed(allowlist, denylist, identity2) {
  if (isMcpServerMatched(denylist, identity2)) {
    return 1 /* Denied */;
  }
  if (allowlist !== void 0 && !isMcpServerMatched(allowlist, identity2)) {
    return 2 /* NotAllowed */;
  }
  return 0 /* Allowed */;
}

function matchesMatcher(matcher, identity2) {
  if (isString(matcher.serverName)) {
    return matcher.serverName === identity2.name;
  }
  if (isString(matcher.serverUrl)) {
    return identity2.url !== void 0 && matchesUrlPattern(matcher.serverUrl, identity2.url);
  }
  if (Array.isArray(matcher.serverCommand)) {
    return identity2.command !== void 0 && equals(matcher.serverCommand, identity2.command);
  }
  return false;
}

function matchesUrlPattern(pattern, url) {
  const destination = toNetworkDestinationUrl(url);
  if (destination === void 0) {
    return false;
  }
  if (!pattern.includes("*")) {
    const expected = toNetworkDestinationUrl(pattern);
    return expected !== void 0 && expected.toLowerCase() === destination.toLowerCase();
  }
  const normalizedPattern = toNetworkDestinationPattern(pattern);
  if (normalizedPattern === void 0) {
    return false;
  }
  try {
    return new RegExp(buildUrlPatternRegexSource(normalizedPattern), "i").test(destination);
  } catch {
    return false;
  }
}

function toNetworkDestinationUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin + parsed.pathname + parsed.search;
    }
    return url;
  } catch {
    return void 0;
  }
}

function toNetworkDestinationPattern(pattern) {
  const schemeSeparator = pattern.indexOf("://");
  if (schemeSeparator < 0) {
    return pattern;
  }
  const scheme = pattern.slice(0, schemeSeparator).toLowerCase();
  if (scheme !== "http" && scheme !== "https") {
    return pattern;
  }
  const rest = pattern.slice(schemeSeparator + 3);
  const authorityEnd = findAuthorityEnd(rest, 0);
  let authority = rest.slice(0, authorityEnd);
  const userinfoEnd = authority.lastIndexOf("@");
  if (userinfoEnd >= 0) {
    authority = authority.slice(userinfoEnd + 1);
  }
  const hostAndPort = splitHostAndPort(authority);
  if (hostAndPort === void 0) {
    return void 0;
  }
  const defaultPort = scheme === "https" ? "443" : "80";
  const port = hostAndPort.port === defaultPort ? void 0 : hostAndPort.port;
  let afterAuthority = rest.slice(authorityEnd).replace(/\\/g, "/");
  const hash2 = afterAuthority.indexOf("#");
  if (hash2 >= 0) {
    afterAuthority = afterAuthority.slice(0, hash2);
  }
  if (!afterAuthority) {
    afterAuthority = "/";
  } else if (afterAuthority.startsWith("?")) {
    afterAuthority = `/${afterAuthority}`;
  }
  return `${scheme}://${hostAndPort.host}${port !== void 0 ? `:${port}` : ""}${afterAuthority}`;
}

function splitHostAndPort(authority) {
  if (authority.startsWith("[")) {
    const close2 = authority.indexOf("]");
    if (close2 === -1) {
      return void 0;
    }
    if (authority[close2 + 1] === ":") {
      return { host: authority.slice(0, close2 + 1), port: authority.slice(close2 + 2) };
    }
    if (close2 + 1 < authority.length) {
      return void 0;
    }
    return { host: authority, port: void 0 };
  }
  const colon = authority.lastIndexOf(":");
  if (colon >= 0) {
    return { host: authority.slice(0, colon), port: authority.slice(colon + 1) };
  }
  return authority ? { host: authority, port: void 0 } : void 0;
}

function buildUrlPatternRegexSource(pattern) {
  const schemeSeparator = pattern.indexOf("://");
  const authorityStart = schemeSeparator >= 0 ? schemeSeparator + 3 : 0;
  const authorityEnd = findAuthorityEnd(pattern, authorityStart);
  let source = "^";
  for (let i2 = 0; i2 < pattern.length; i2++) {
    const char = pattern[i2];
    if (i2 < authorityEnd && char === ":" && pattern[i2 + 1] === "*") {
      source += "(:[^/@\\\\?#]*)?";
      i2++;
    } else if (char === "*") {
      source += i2 < authorityEnd ? "[^/@\\\\?#]*" : ".*";
    } else {
      source += escapeRegExpCharacters(char);
    }
  }
  return source + "$";
}

function findAuthorityEnd(pattern, authorityStart) {
  for (let i2 = authorityStart; i2 < pattern.length; i2++) {
    const char = pattern[i2];
    if (char === "/" || char === "\\" || char === "?" || char === "#") {
      return i2;
    }
  }
  return pattern.length;
}
export { getMcpServerMatchers, isValidMatcher, isMcpServerMatched, checkMcpServerAllowed, matchesMatcher, matchesUrlPattern, toNetworkDestinationUrl, toNetworkDestinationPattern, splitHostAndPort, buildUrlPatternRegexSource, findAuthorityEnd };
