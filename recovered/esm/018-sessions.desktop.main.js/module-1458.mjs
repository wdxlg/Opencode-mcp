// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatStatus.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { MainContext } from "./module-0922.mjs";
import { IChatStatusItemService } from "./module-1457.mjs";


// src/vs/workbench/api/browser/mainThreadChatStatus.ts
var MainThreadChatStatus = class extends Disposable {
  constructor(_extHostContext, _chatStatusItemService) {
    super();
    this._chatStatusItemService = _chatStatusItemService;
  }
  $setEntry(id2, entry) {
    this._chatStatusItemService.setOrUpdateEntry({
      id: id2,
      label: entry.title,
      description: entry.description,
      detail: entry.detail,
      tooltip: entry.tooltip
    });
  }
  $disposeEntry(id2) {
    this._chatStatusItemService.deleteEntry(id2);
  }
};

MainThreadChatStatus = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatStatus),
  __decorateParam(1, IChatStatusItemService)
], MainThreadChatStatus);
export { MainThreadChatStatus };
