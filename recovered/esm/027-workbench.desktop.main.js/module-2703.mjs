// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatReferenceAttachmentWidget.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1323.mjs";
import { isChatReferenceVariableEntry } from "./module-0979.mjs";
import { ChatReferenceAttachmentWidget } from "./module-2032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAttachmentWidgetRegistry } from "./module-2033.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatReferenceAttachmentWidget.contribution.ts
var ChatReferenceAttachmentWidgetContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chatReferenceAttachmentWidgetFactory";
  }
  constructor(registry4, instantiationService) {
    super();
    const labels2 = this._register(instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    this._register(registry4.registerFactory(
      "chatReference",
      (attachment, options3, container3) => {
        if (!isChatReferenceVariableEntry(attachment)) {
          throw new Error("Expected a chatReference attachment");
        }
        return instantiationService.createInstance(ChatReferenceAttachmentWidget, attachment, void 0, options3, container3, labels2);
      }
    ));
  }
};

ChatReferenceAttachmentWidgetContribution = __decorateClass([
  __decorateParam(0, IChatAttachmentWidgetRegistry),
  __decorateParam(1, IInstantiationService)
], ChatReferenceAttachmentWidgetContribution);
export { ChatReferenceAttachmentWidgetContribution };
