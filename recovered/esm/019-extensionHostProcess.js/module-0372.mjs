// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostClipboard.ts
import { MainContext } from "./module-0054.mjs";


// src/vs/workbench/api/common/extHostClipboard.ts
var ExtHostClipboard = class {
  constructor(mainContext) {
    const proxy = mainContext.getProxy(MainContext.MainThreadClipboard);
    this.value = Object.freeze({
      readText() {
        return proxy.$readText();
      },
      writeText(value) {
        return proxy.$writeText(value);
      }
    });
  }
};
export { ExtHostClipboard };
