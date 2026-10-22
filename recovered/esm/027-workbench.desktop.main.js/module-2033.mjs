// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentWidgetRegistry.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentWidgetRegistry.ts
var IChatAttachmentWidgetRegistry = createDecorator("chatAttachmentWidgetRegistry");

var ChatAttachmentWidgetRegistry = class {
  constructor() {
    this._factories = /* @__PURE__ */ new Map();
  }
  registerFactory(kind, factory) {
    this._factories.set(kind, factory);
    return {
      dispose: () => {
        if (this._factories.get(kind) === factory) {
          this._factories.delete(kind);
        }
      }
    };
  }
  createWidget(attachment, options3, container3) {
    const factory = this._factories.get(attachment.kind);
    if (!factory) {
      return void 0;
    }
    return factory(attachment, options3, container3);
  }
};
export { IChatAttachmentWidgetRegistry, ChatAttachmentWidgetRegistry };
