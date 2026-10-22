// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/id.ts
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { getMac, init_macAddress } from "./module-0147.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { init_strings, stripUTF8BOM } from "./module-0027.mjs";
import { __esm } from "./module-0000.mjs";
import { TernarySearchTree, init_ternarySearchTree } from "./module-0068.mjs";


// src/vs/base/node/id.ts
import { networkInterfaces as networkInterfaces2 } from "os";

async function getMachineId(errorLogger) {
  if (!machineId) {
    machineId = (async () => {
      const id2 = await getMacMachineId(errorLogger);
      return id2 || generateUuid();
    })();
  }
  return machineId;
}

async function getMacMachineId(errorLogger) {
  try {
    const crypto3 = await import("crypto");
    const macAddress = getMac();
    return crypto3.createHash("sha256").update(macAddress, "utf8").digest("hex");
  } catch (err) {
    errorLogger(err);
    return void 0;
  }
}

async function getSqmMachineId(errorLogger) {
  if (isWindows2) {
    const Registry2 = await import("@vscode/windows-registry");
    try {
      return Registry2.GetStringRegKey("HKEY_LOCAL_MACHINE", SQM_KEY, "MachineId") || "";
    } catch (err) {
      errorLogger(err);
      return "";
    }
  }
  return "";
}

async function getDevDeviceId(errorLogger) {
  try {
    const deviceIdPackage = await import("@vscode/deviceid");
    const id2 = await deviceIdPackage.getDeviceId();
    return stripUTF8BOM(id2);
  } catch (err) {
    errorLogger(err);
    return generateUuid();
  }
}

var virtualMachineHint, machineId, SQM_KEY;

var init_id = __esm({
  "src/vs/base/node/id.ts"() {
    init_ternarySearchTree();
    init_uuid();
    init_macAddress();
    init_platform();
    init_strings();
    virtualMachineHint = new class {
      _isVirtualMachineMacAddress(mac) {
        if (!this._virtualMachineOUIs) {
          this._virtualMachineOUIs = TernarySearchTree.forStrings();
          this._virtualMachineOUIs.set("00-50-56", true);
          this._virtualMachineOUIs.set("00-0C-29", true);
          this._virtualMachineOUIs.set("00-05-69", true);
          this._virtualMachineOUIs.set("00-03-FF", true);
          this._virtualMachineOUIs.set("00-1C-42", true);
          this._virtualMachineOUIs.set("00-16-3E", true);
          this._virtualMachineOUIs.set("08-00-27", true);
          this._virtualMachineOUIs.set("00:50:56", true);
          this._virtualMachineOUIs.set("00:0C:29", true);
          this._virtualMachineOUIs.set("00:05:69", true);
          this._virtualMachineOUIs.set("00:03:FF", true);
          this._virtualMachineOUIs.set("00:1C:42", true);
          this._virtualMachineOUIs.set("00:16:3E", true);
          this._virtualMachineOUIs.set("08:00:27", true);
        }
        return !!this._virtualMachineOUIs.findSubstr(mac);
      }
      value() {
        if (this._value === void 0) {
          let vmOui = 0;
          let interfaceCount = 0;
          const interfaces = networkInterfaces2();
          for (const name in interfaces) {
            const networkInterface = interfaces[name];
            if (networkInterface) {
              for (const { mac, internal } of networkInterface) {
                if (!internal) {
                  interfaceCount += 1;
                  if (this._isVirtualMachineMacAddress(mac.toUpperCase())) {
                    vmOui += 1;
                  }
                }
              }
            }
          }
          this._value = interfaceCount > 0 ? vmOui / interfaceCount : 0;
        }
        return this._value;
      }
    }();
    SQM_KEY = "Software\\Microsoft\\SQMClient";
  }
});
export { getMachineId, getMacMachineId, getSqmMachineId, getDevDeviceId, networkInterfaces2, virtualMachineHint, machineId, SQM_KEY, init_id };
