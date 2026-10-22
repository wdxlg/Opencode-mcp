// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/native/common/nativeHostService.ts
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";


// src/vs/platform/native/common/nativeHostService.ts
var NativeHostService = class {
  constructor(windowId, mainProcessService) {
    this.windowId = windowId;
    return ProxyChannel.toService(mainProcessService.getChannel("nativeHost"), {
      context: windowId,
      properties: (() => {
        const properties = /* @__PURE__ */ new Map();
        properties.set("windowId", windowId);
        return properties;
      })()
    });
  }
};

NativeHostService = __decorateClass([
  __decorateParam(1, IMainProcessService)
], NativeHostService);
export { NativeHostService };
