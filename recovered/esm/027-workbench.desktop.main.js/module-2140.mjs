// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownAnchorService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { addDisposableListener, isActiveElement } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownAnchorService.ts
var IChatMarkdownAnchorService = createDecorator("chatMarkdownAnchorService");

var ChatMarkdownAnchorService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._widgets = [];
    this._lastFocusedWidget = void 0;
  }
  get lastFocusedAnchor() {
    return this._lastFocusedWidget;
  }
  setLastFocusedList(widget) {
    this._lastFocusedWidget = widget;
  }
  register(widget) {
    if (this._widgets.some((other) => other === widget)) {
      throw new Error("Cannot register the same widget multiple times");
    }
    this._widgets.push(widget);
    const element = widget.getHTMLElement();
    if (isActiveElement(element)) {
      this.setLastFocusedList(widget);
    }
    return combinedDisposable(
      addDisposableListener(element, "focus", () => this.setLastFocusedList(widget)),
      toDisposable(() => this._widgets.splice(this._widgets.indexOf(widget), 1)),
      addDisposableListener(element, "blur", () => {
        if (this._lastFocusedWidget === widget) {
          this.setLastFocusedList(void 0);
        }
      })
    );
  }
};
export { IChatMarkdownAnchorService, ChatMarkdownAnchorService };
