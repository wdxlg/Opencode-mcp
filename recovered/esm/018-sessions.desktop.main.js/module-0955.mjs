// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/managedSettings.ts



// src/vs/base/common/managedSettings.ts
function extraKnownMarketplacesToConfigDict(entries2) {
  if (!entries2?.length) {
    return void 0;
  }
  const obj = {};
  for (const entry of entries2) {
    if (typeof entry === "string") {
      if (isUnsafeMarketplaceKey(entry)) {
        continue;
      }
      obj[entry] = entry;
    } else {
      if (isUnsafeMarketplaceKey(entry.name)) {
        continue;
      }
      const s = entry.source;
      const base = s.source === "github" ? s.repo : s.url;
      const source = s.ref ? `${base}#${s.ref}` : base;
      obj[entry.name] = entry.autoUpdate === void 0 ? source : JSON.stringify({ source, autoUpdate: entry.autoUpdate });
    }
  }
  return obj;
}

function isUnsafeMarketplaceKey(key3) {
  return key3 === "__proto__" || key3 === "constructor" || key3 === "prototype";
}
export { extraKnownMarketplacesToConfigDict, isUnsafeMarketplaceKey };
