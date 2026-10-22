// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatQuota.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { MainContext } from "./module-0922.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";


// src/vs/workbench/api/browser/mainThreadChatQuota.ts
var MainThreadChatQuota = class extends Disposable {
  constructor(extHostContext, _chatEntitlementService) {
    super();
    this._chatEntitlementService = _chatEntitlementService;
  }
  $updateQuotas(quotas) {
    this._chatEntitlementService.acceptQuotas({ ...this._chatEntitlementService.quotas, ...quotas });
  }
};

MainThreadChatQuota = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatQuota),
  __decorateParam(1, IChatEntitlementService)
], MainThreadChatQuota);
export { MainThreadChatQuota };
