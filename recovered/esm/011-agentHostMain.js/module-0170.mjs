// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/node/macAddress.ts



// src/vs/base/node/macAddress.ts
import { networkInterfaces } from "os";

var invalidMacAddresses = /* @__PURE__ */ new Set([
  "00:00:00:00:00:00",
  "ff:ff:ff:ff:ff:ff",
  "ac:de:48:00:11:22"
]);

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
export { validateMacAddress, getMac, networkInterfaces, invalidMacAddresses };
