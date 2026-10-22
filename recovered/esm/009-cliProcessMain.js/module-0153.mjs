// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/base/node/id.ts
import { TernarySearchTree } from "./module-0043.mjs";
import { generateUuid } from "./module-0067.mjs";
import { getMac } from "./module-0154.mjs";
import { isWindows } from "./module-0014.mjs";
import { stripUTF8BOM } from "./module-0022.mjs";


// src/vs/base/node/id.ts
import { networkInterfaces as networkInterfaces2 } from "os";


// src/vs/base/node/id.ts
var virtualMachineHint = new class {
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

var machineId;

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
    const crypto2 = await import("crypto");
    const macAddress = getMac();
    return crypto2.createHash("sha256").update(macAddress, "utf8").digest("hex");
  } catch (err) {
    errorLogger(err);
    return void 0;
  }
}

var SQM_KEY = "Software\\Microsoft\\SQMClient";

async function getSqmMachineId(errorLogger) {
  if (isWindows) {
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
export { getMachineId, getMacMachineId, getSqmMachineId, getDevDeviceId, networkInterfaces2, virtualMachineHint, machineId, SQM_KEY };
