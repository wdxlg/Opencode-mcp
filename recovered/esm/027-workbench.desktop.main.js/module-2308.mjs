// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatErrorContentPart.ts
import { $ } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderIcon } from "./module-0467.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatErrorContentPart.ts
var $49 = $;

var ChatErrorContentPart = class extends Disposable {
  constructor(kind, content2, errorDetails, renderer) {
    super();
    this.errorDetails = errorDetails;
    this.domNode = this._register(new ChatErrorWidget(kind, content2, renderer)).domNode;
  }
  hasSameContent(other) {
    return other.kind === this.errorDetails.kind;
  }
};

var ChatErrorWidget = class extends Disposable {
  constructor(kind, content2, renderer) {
    super();
    this.domNode = $49(".chat-notification-widget");
    this.domNode.tabIndex = 0;
    let icon2;
    let iconClass;
    switch (kind) {
      case 1 /* Warning */:
        icon2 = Codicon.warning;
        iconClass = ".chat-warning-codicon";
        break;
      case 2 /* Error */:
        icon2 = Codicon.error;
        iconClass = ".chat-error-codicon";
        break;
      case 0 /* Info */:
        icon2 = Codicon.info;
        iconClass = ".chat-info-codicon";
        break;
    }
    this.domNode.appendChild($49(iconClass, void 0, renderIcon(icon2)));
    const markdownContent = this._register(renderer.render(content2));
    this.domNode.appendChild(markdownContent.element);
  }
};
export { $49, ChatErrorContentPart, ChatErrorWidget };
