// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/base/common/normalization.ts
import { LRUCache } from "./module-0007.mjs";


// src/vs/base/common/normalization.ts
var nfcCache = new LRUCache(1e4);

function normalizeNFC(str) {
  return normalize2(str, "NFC", nfcCache);
}

var nfdCache = new LRUCache(1e4);

function normalizeNFD(str) {
  return normalize2(str, "NFD", nfdCache);
}

var nonAsciiCharactersPattern = /[^\u0000-\u0080]/;

function normalize2(str, form, normalizedCache) {
  if (!str) {
    return str;
  }
  const cached = normalizedCache.get(str);
  if (cached) {
    return cached;
  }
  let res;
  if (nonAsciiCharactersPattern.test(str)) {
    res = str.normalize(form);
  } else {
    res = str;
  }
  normalizedCache.set(str, res);
  return res;
}

var tryNormalizeToBase = (function() {
  const cache2 = new LRUCache(1e4);
  const accentsRegex = /[\u0300-\u036f]/g;
  return function(str) {
    const cached = cache2.get(str);
    if (cached) {
      return cached;
    }
    const noAccents = normalizeNFD(str).replace(accentsRegex, "");
    const result = (noAccents.length === str.length ? noAccents : str).toLowerCase();
    cache2.set(str, result);
    return result;
  };
})();
export { normalizeNFC, normalizeNFD, normalize2, nfcCache, nfdCache, nonAsciiCharactersPattern, tryNormalizeToBase };
