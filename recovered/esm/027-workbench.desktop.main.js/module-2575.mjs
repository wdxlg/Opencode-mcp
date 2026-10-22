// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatTransfer.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatTransferService } from "./module-2504.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatTransfer.ts
var ChatTransferContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chatTransfer";
  }
  constructor(chatTransferService) {
    super();
    chatTransferService.checkAndSetTransferredWorkspaceTrust();
  }
};

ChatTransferContribution = __decorateClass([
  __decorateParam(0, IChatTransferService)
], ChatTransferContribution);
export { ChatTransferContribution };
