// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindAccessibilityHelp.ts
import { ChatContextKeys } from "./module-0966.mjs";
import { getFocusedFindController } from "./module-2534.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindAccessibilityHelp.ts
var ChatFindAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "chatFind";
    this.type = "help" /* Help */;
    this.when = ChatContextKeys.findWidgetFocused;
  }
  getProvider(accessor) {
    const controller = getFocusedFindController(accessor);
    return controller ? new ChatFindAccessibilityHelpProvider(controller) : void 0;
  }
};

var ChatFindAccessibilityHelpProvider = class extends Disposable {
  constructor(_controller) {
    super();
    this._controller = _controller;
    this.id = "chatFindHelp" /* ChatFindHelp */;
    this.verbositySettingKey = "accessibility.verbosity.find" /* Find */;
    this.options = { type: "help" /* Help */ };
  }
  onClose() {
    this._controller.focus();
  }
  provideContent() {
    const content = [];
    content.push(localize(12347, null));
    content.push(localize(12346, null));
    content.push("");
    content.push(localize(12348, null));
    content.push(localize(12349, null));
    content.push(localize(12352, null));
    content.push(localize(12351, null));
    content.push(localize(12350, null));
    content.push("");
    content.push(localize(12355, null));
    content.push(localize(12353, null));
    content.push(localize(12356, null));
    content.push(localize(12354, null));
    content.push("");
    content.push(localize(12358, null));
    content.push(localize(12357, null));
    content.push("");
    content.push(localize(12359, null, "<keybinding:workbench.action.openSettings>"));
    content.push(localize(12360, null));
    return content.join("\n");
  }
};
export { ChatFindAccessibilityHelp, ChatFindAccessibilityHelpProvider };
