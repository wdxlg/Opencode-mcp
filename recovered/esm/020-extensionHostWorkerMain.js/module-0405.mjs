// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostMessageService.ts
import { MainContext } from "./module-0025.mjs";
import { checkProposedApiEnabled } from "./module-0167.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0045.mjs";


// src/vs/workbench/api/common/extHostMessageService.ts
function isMessageItem(item) {
  return item && item.title;
}

var ExtHostMessageService = class {
  constructor(mainContext, _logService) {
    this._logService = _logService;
    this._proxy = mainContext.getProxy(MainContext.MainThreadMessageService);
  }
  showMessage(extension, severity, message, optionsOrFirstItem, rest) {
    const options2 = {
      source: { identifier: extension.identifier, label: extension.displayName || extension.name }
    };
    let items;
    if (typeof optionsOrFirstItem === "string" || isMessageItem(optionsOrFirstItem)) {
      items = [optionsOrFirstItem, ...rest];
    } else {
      options2.modal = optionsOrFirstItem?.modal;
      options2.useCustom = optionsOrFirstItem?.useCustom;
      options2.detail = optionsOrFirstItem?.detail;
      items = rest;
    }
    if (options2.useCustom) {
      checkProposedApiEnabled(extension, "resolvers");
    }
    const commands = [];
    let hasCloseAffordance = false;
    for (let handle = 0; handle < items.length; handle++) {
      const command = items[handle];
      if (typeof command === "string") {
        commands.push({ title: command, handle, isCloseAffordance: false });
      } else if (typeof command === "object") {
        const { title, isCloseAffordance } = command;
        commands.push({ title, isCloseAffordance: !!isCloseAffordance, handle });
        if (isCloseAffordance) {
          if (hasCloseAffordance) {
            this._logService.warn(`[${extension.identifier}] Only one message item can have 'isCloseAffordance':`, command);
          } else {
            hasCloseAffordance = true;
          }
        }
      } else {
        this._logService.warn(`[${extension.identifier}] Invalid message item:`, command);
      }
    }
    return this._proxy.$showMessage(severity, message, options2, commands).then((handle) => {
      if (typeof handle === "number") {
        return items[handle];
      }
      return void 0;
    });
  }
};

ExtHostMessageService = __decorateClass([
  __decorateParam(1, ILogService)
], ExtHostMessageService);
export { isMessageItem, ExtHostMessageService };
