// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/url/common/urlGlob.ts
import { URI } from "./module-0032.mjs";


// src/vs/platform/url/common/urlGlob.ts
function normalizeURL(url) {
  const uri4 = typeof url === "string" ? URI.parse(url) : url;
  return uri4.with({
    // Remove trailing slashes
    path: uri4.path.replace(/\/+$/, ""),
    // Remove query and fragment
    query: null,
    fragment: null
  });
}

function testUrlMatchesGlob(uri4, globUrl) {
  const normalizedUrl = normalizeURL(uri4);
  let normalizedGlobUrl;
  const globHasScheme = /^[^./:]*:\/\//.test(globUrl);
  if (!globHasScheme) {
    if (normalizedUrl.scheme !== "http" && normalizedUrl.scheme !== "https") {
      return false;
    }
    normalizedGlobUrl = normalizeURL(`${normalizedUrl.scheme}://${globUrl}`);
  } else {
    normalizedGlobUrl = normalizeURL(globUrl);
  }
  return doMemoUrlMatch(normalizedUrl.scheme, normalizedGlobUrl.scheme) && // The authority is the only thing that should do port logic.
  doMemoUrlMatch(normalizedUrl.authority, normalizedGlobUrl.authority, true) && //
  (normalizedGlobUrl.path === "/" || doMemoUrlMatch(normalizedUrl.path, normalizedGlobUrl.path));
}

function doMemoUrlMatch(normalizedUrlPart, normalizedGlobUrlPart, includePortLogic = false) {
  const memo = Array.from({ length: normalizedUrlPart.length + 1 }).map(
    () => Array.from({ length: normalizedGlobUrlPart.length + 1 }).map(() => void 0)
  );
  return doUrlPartMatch(memo, includePortLogic, normalizedUrlPart, normalizedGlobUrlPart, 0, 0);
}

function doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset) {
  if (memo[urlOffset]?.[globUrlOffset] !== void 0) {
    return memo[urlOffset][globUrlOffset];
  }
  const options3 = [];
  if (urlOffset === urlPart.length) {
    if (globUrlOffset === globUrlPart.length) {
      return true;
    }
    if (includePortLogic && globUrlPart[globUrlOffset] + globUrlPart[globUrlOffset + 1] === ":*") {
      return globUrlOffset + 2 === globUrlPart.length;
    }
    return false;
  }
  if (globUrlOffset === globUrlPart.length) {
    const remaining = urlPart.slice(urlOffset);
    return remaining[0] === "/";
  }
  if (urlPart[urlOffset] === globUrlPart[globUrlOffset]) {
    options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset + 1, globUrlOffset + 1));
  }
  if (globUrlPart[globUrlOffset] + globUrlPart[globUrlOffset + 1] === "*.") {
    if (!["/", ":"].includes(urlPart[urlOffset])) {
      options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset + 1, globUrlOffset));
    }
    if (urlOffset === 0 || urlPart[urlOffset - 1] === ".") {
      options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset + 2));
    }
  }
  if (globUrlPart[globUrlOffset] === "*") {
    if (urlOffset + 1 === urlPart.length) {
      options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset + 1, globUrlOffset + 1));
    } else {
      options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset + 1, globUrlOffset));
    }
    options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset + 1));
  }
  if (includePortLogic && globUrlPart[globUrlOffset] + globUrlPart[globUrlOffset + 1] === ":*") {
    if (urlPart[urlOffset] === ":") {
      let endPortIndex = urlOffset + 1;
      do {
        endPortIndex++;
      } while (/[0-9]/.test(urlPart[endPortIndex]));
      options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, endPortIndex, globUrlOffset + 2));
    } else {
      options3.push(doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset + 2));
    }
  }
  return memo[urlOffset][globUrlOffset] = options3.some((a) => a === true);
}
export { normalizeURL, testUrlMatchesGlob, doMemoUrlMatch, doUrlPartMatch };
