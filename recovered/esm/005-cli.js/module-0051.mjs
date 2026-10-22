// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/node/unc.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/unc.ts
function processUNCHostAllowlist() {
  return process.uncHostAllowlist;
}

function addUNCHostToAllowlist(allowedHost) {
  if (process.platform !== "win32") {
    return;
  }
  const allowlist = processUNCHostAllowlist();
  if (allowlist) {
    if (typeof allowedHost === "string") {
      allowlist.add(allowedHost.toLowerCase());
    } else {
      for (const host of toSafeStringArray(allowedHost)) {
        addUNCHostToAllowlist(host);
      }
    }
  }
}

function toSafeStringArray(arg0) {
  const allowedUNCHosts = /* @__PURE__ */ new Set();
  if (Array.isArray(arg0)) {
    for (const host of arg0) {
      if (typeof host === "string") {
        allowedUNCHosts.add(host);
      }
    }
  }
  return Array.from(allowedUNCHosts);
}

var init_unc = __esm({
  "src/vs/base/node/unc.ts"() {
  }
});
export { processUNCHostAllowlist, addUNCHostToAllowlist, toSafeStringArray, init_unc };
