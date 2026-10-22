// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/macAddress.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/macAddress.ts
import { networkInterfaces } from "os";

function validateMacAddress(candidate) {
  const tempCandidate = candidate.replace(/\-/g, ":").toLowerCase();
  return !invalidMacAddresses.has(tempCandidate);
}

function getMac() {
  const ifaces = networkInterfaces();
  for (const name in ifaces) {
    const networkInterface = ifaces[name];
    if (networkInterface) {
      for (const { mac } of networkInterface) {
        if (validateMacAddress(mac)) {
          return mac;
        }
      }
    }
  }
  throw new Error("Unable to retrieve mac address (unexpected format)");
}

var invalidMacAddresses;

var init_macAddress = __esm({
  "src/vs/base/node/macAddress.ts"() {
    invalidMacAddresses = /* @__PURE__ */ new Set([
      "00:00:00:00:00:00",
      "ff:ff:ff:ff:ff:ff",
      "ac:de:48:00:11:22"
    ]);
  }
});
export { validateMacAddress, getMac, networkInterfaces, invalidMacAddresses, init_macAddress };
