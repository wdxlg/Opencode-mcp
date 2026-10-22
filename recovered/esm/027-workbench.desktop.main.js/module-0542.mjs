// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/message/browser/messageController.ts
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { alert } from "./module-0076.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { openLinkFromMarkdown } from "./module-0541.mjs";
import { Event2 } from "./module-0017.mjs";
import { EventType, addDisposableListener, getActiveElement, isAncestor } from "./module-0075.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { EditorCommand, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/message/browser/messageController.ts
var MessageController = class {
  constructor(editor, contextKeyService, _openerService) {
    this._openerService = _openerService;
    this._messageWidget = new MutableDisposable();
    this._messageListeners = new DisposableStore();
    this._mouseOverMessage = false;
    this._editor = editor;
    this._visible = MessageController.MESSAGE_VISIBLE.bindTo(contextKeyService);
  }
  static {
    this.ID = "editor.contrib.messageController";
  }
  static {
    this.MESSAGE_VISIBLE = new RawContextKey("messageVisible", false, localize(1472, null));
  }
  static get(editor) {
    return editor.getContribution(MessageController.ID);
  }
  dispose() {
    this._messageListeners.dispose();
    this._messageWidget.dispose();
    this._visible.reset();
  }
  isVisible() {
    return this._visible.get();
  }
  showMessage(message, position2) {
    alert(isMarkdownString(message) ? message.value : message);
    this._visible.set(true);
    this._messageWidget.clear();
    this._messageListeners.clear();
    if (isMarkdownString(message)) {
      const renderedMessage = this._messageListeners.add(renderMarkdown(message, {
        actionHandler: (url, mdStr) => {
          this.closeMessage();
          openLinkFromMarkdown(this._openerService, url, mdStr.isTrusted);
        }
      }));
      this._messageWidget.value = new MessageWidget(this._editor, position2, renderedMessage.element);
    } else {
      this._messageWidget.value = new MessageWidget(this._editor, position2, message);
    }
    this._messageListeners.add(Event2.debounce(this._editor.onDidBlurEditorText, (last, event) => event, 0)(
      () => {
        if (this._mouseOverMessage) {
          return;
        }
        if (this._messageWidget.value && isAncestor(getActiveElement(), this._messageWidget.value.getDomNode())) {
          return;
        }
        this.closeMessage();
      }
    ));
    this._messageListeners.add(this._editor.onDidChangeCursorPosition(() => this.closeMessage()));
    this._messageListeners.add(this._editor.onDidDispose(() => this.closeMessage()));
    this._messageListeners.add(this._editor.onDidChangeModel(() => this.closeMessage()));
    this._messageListeners.add(addDisposableListener(this._messageWidget.value.getDomNode(), EventType.MOUSE_ENTER, () => this._mouseOverMessage = true, true));
    this._messageListeners.add(addDisposableListener(this._messageWidget.value.getDomNode(), EventType.MOUSE_LEAVE, () => this._mouseOverMessage = false, true));
    let bounds;
    this._messageListeners.add(this._editor.onMouseMove((e) => {
      if (!e.target.position) {
        return;
      }
      if (!bounds) {
        bounds = new Range2(position2.lineNumber - 3, 1, e.target.position.lineNumber + 3, 1);
      } else if (!bounds.containsPosition(e.target.position)) {
        this.closeMessage();
      }
    }));
  }
  closeMessage() {
    this._visible.reset();
    this._messageListeners.clear();
    if (this._messageWidget.value) {
      this._messageListeners.add(MessageWidget.fadeOut(this._messageWidget.value));
    }
  }
};

MessageController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IOpenerService)
], MessageController);

var MessageCommand = EditorCommand.bindToContribution(MessageController.get);

registerEditorCommand(new MessageCommand({
  id: "leaveEditorMessage",
  precondition: MessageController.MESSAGE_VISIBLE,
  handler: (c) => c.closeMessage(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 30,
    primary: 9 /* Escape */
  }
}));

var MessageWidget = class {
  constructor(editor, { lineNumber, column }, text2) {
    // Editor.IContentWidget.allowEditorOverflow
    this.allowEditorOverflow = true;
    this.suppressMouseDown = false;
    this._editor = editor;
    this._editor.revealLinesInCenterIfOutsideViewport(lineNumber, lineNumber, 0 /* Smooth */);
    this._position = { lineNumber, column };
    this._domNode = document.createElement("div");
    this._domNode.classList.add("monaco-editor-overlaymessage");
    this._domNode.style.marginLeft = "-6px";
    const anchorTop = document.createElement("div");
    anchorTop.classList.add("anchor", "top");
    this._domNode.appendChild(anchorTop);
    const message = document.createElement("div");
    if (typeof text2 === "string") {
      message.classList.add("message");
      message.textContent = text2;
    } else {
      text2.classList.add("message");
      message.appendChild(text2);
    }
    this._domNode.appendChild(message);
    const anchorBottom = document.createElement("div");
    anchorBottom.classList.add("anchor", "below");
    this._domNode.appendChild(anchorBottom);
    this._editor.addContentWidget(this);
    this._domNode.classList.add("fadeIn");
  }
  static fadeOut(messageWidget) {
    const dispose2 = () => {
      messageWidget.dispose();
      clearTimeout(handle2);
      messageWidget.getDomNode().removeEventListener("animationend", dispose2);
    };
    const handle2 = setTimeout(dispose2, 110);
    messageWidget.getDomNode().addEventListener("animationend", dispose2);
    messageWidget.getDomNode().classList.add("fadeOut");
    return { dispose: dispose2 };
  }
  dispose() {
    this._editor.removeContentWidget(this);
  }
  getId() {
    return "messageoverlay";
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      position: this._position,
      preference: [
        1 /* ABOVE */,
        2 /* BELOW */
      ],
      positionAffinity: 1 /* Right */
    };
  }
  afterRender(position2) {
    this._domNode.classList.toggle("below", position2 === 2 /* BELOW */);
  }
};

registerEditorContribution(MessageController.ID, MessageController, 4 /* Lazy */);
export { MessageController, MessageCommand, MessageWidget };
