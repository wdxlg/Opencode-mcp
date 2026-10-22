// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/normalization.ts
import { LRUCache } from "./module-0006.mjs";


// src/vs/base/common/normalization.ts
var nfcCache = new LRUCache(1e4);

function normalizeNFC(str2) {
  return normalize2(str2, "NFC", nfcCache);
}

var nfdCache = new LRUCache(1e4);

function normalizeNFD(str2) {
  return normalize2(str2, "NFD", nfdCache);
}

var nonAsciiCharactersPattern = /[^\u0000-\u0080]/;

function normalize2(str2, form, normalizedCache) {
  if (!str2) {
    return str2;
  }
  const cached = normalizedCache.get(str2);
  if (cached) {
    return cached;
  }
  let res;
  if (nonAsciiCharactersPattern.test(str2)) {
    res = str2.normalize(form);
  } else {
    res = str2;
  }
  normalizedCache.set(str2, res);
  return res;
}

var tryNormalizeToBase = (function() {
  const cache3 = new LRUCache(1e4);
  const accentsRegex = /[\u0300-\u036f]/g;
  return function(str2) {
    const cached = cache3.get(str2);
    if (cached) {
      return cached;
    }
    const noAccents = normalizeNFD(str2).replace(accentsRegex, "");
    const result = (noAccents.length === str2.length ? noAccents : str2).toLowerCase();
    cache3.set(str2, result);
    return result;
  };
})();
export { normalizeNFC, normalizeNFD, normalize2, nfcCache, nfdCache, nonAsciiCharactersPattern, tryNormalizeToBase };
