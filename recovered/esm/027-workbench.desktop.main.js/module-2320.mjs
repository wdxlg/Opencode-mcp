// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatSystemNotificationContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { ChatProgressSubPart } from "./module-2289.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatSystemNotificationContentPart.ts
var ChatSystemNotificationContentPart = class extends Disposable {
  constructor(notification, renderer, instantiationService) {
    super();
    this.notification = notification;
    const rendered = this._register(renderer.render(notification.content));
    this.domNode = this._register(instantiationService.createInstance(ChatProgressSubPart, rendered.element, notification.icon ?? Codicon.check, void 0)).domNode;
  }
  hasSameContent(other) {
    return other.kind === "systemNotification" && other.content.value === this.notification.content.value && ThemeIcon.isEqual(other.icon ?? Codicon.check, this.notification.icon ?? Codicon.check);
  }
};

ChatSystemNotificationContentPart = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ChatSystemNotificationContentPart);
export { ChatSystemNotificationContentPart };
