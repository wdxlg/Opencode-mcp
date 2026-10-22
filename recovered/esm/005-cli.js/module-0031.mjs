// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/normalization.ts
import { __esm } from "./module-0000.mjs";
import { LRUCache, init_map } from "./module-0010.mjs";


// src/vs/base/common/normalization.ts
function normalizeNFC(str) {
  return normalize2(str, "NFC", nfcCache);
}

function normalizeNFD(str) {
  return normalize2(str, "NFD", nfdCache);
}

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

var nfcCache, nfdCache, nonAsciiCharactersPattern, tryNormalizeToBase;

var init_normalization = __esm({
  "src/vs/base/common/normalization.ts"() {
    init_map();
    nfcCache = new LRUCache(1e4);
    nfdCache = new LRUCache(1e4);
    nonAsciiCharactersPattern = /[^\u0000-\u0080]/;
    tryNormalizeToBase = (function() {
      const cache = new LRUCache(1e4);
      const accentsRegex = /[\u0300-\u036f]/g;
      return function(str) {
        const cached = cache.get(str);
        if (cached) {
          return cached;
        }
        const noAccents = normalizeNFD(str).replace(accentsRegex, "");
        const result = (noAccents.length === str.length ? noAccents : str).toLowerCase();
        cache.set(str, result);
        return result;
      };
    })();
  }
});
export { normalizeNFC, normalizeNFD, normalize2, nfcCache, nfdCache, nonAsciiCharactersPattern, tryNormalizeToBase, init_normalization };
