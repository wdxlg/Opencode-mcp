// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/node/id.ts
import { TernarySearchTree } from "./module-0056.mjs";


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
export { networkInterfaces2, virtualMachineHint };
