// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/pointerHandler.ts
import { MouseHandler } from "./module-0261.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { addDisposableListener } from "./module-0075.mjs";
import { EditorMouseEvent, EditorPointerEventFactory } from "./module-0237.mjs";
import { TextAreaSyntethicEvents } from "./module-0277.mjs";
import { Disposable } from "./module-0012.mjs";
import { isAndroid, isIOS, isMobile } from "./module-0014.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/editor/browser/controller/pointerHandler.ts
var PointerEventHandler = class extends MouseHandler {
  constructor(context2, viewController, viewHelper) {
    super(context2, viewController, viewHelper);
    this._register(Gesture.addTarget(this.viewHelper.linesContentDomNode));
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, EventType2.Tap, (e) => this.onTap(e)));
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, EventType2.Change, (e) => this.onChange(e)));
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, EventType2.Contextmenu, (e) => this._onContextMenu(new EditorMouseEvent(e, false, this.viewHelper.viewDomNode), false)));
    this._lastPointerType = "mouse";
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, "pointerdown", (e) => {
      const pointerType = e.pointerType;
      if (pointerType === "mouse") {
        this._lastPointerType = "mouse";
        return;
      } else if (pointerType === "touch") {
        this._lastPointerType = "touch";
      } else {
        this._lastPointerType = "pen";
      }
    }));
    const pointerEvents = new EditorPointerEventFactory(this.viewHelper.viewDomNode);
    this._register(pointerEvents.onPointerMove(this.viewHelper.viewDomNode, (e) => this._onMouseMove(e)));
    this._register(pointerEvents.onPointerUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
    this._register(pointerEvents.onPointerLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
    this._register(pointerEvents.onPointerDown(this.viewHelper.viewDomNode, (e, pointerId) => this._onMouseDown(e, pointerId)));
  }
  onTap(event) {
    if (!event.initialTarget || !this.viewHelper.linesContentDomNode.contains(event.initialTarget)) {
      return;
    }
    event.preventDefault();
    this.viewHelper.focusTextArea();
    this._dispatchGesture(
      event,
      /*inSelectionMode*/
      false
    );
  }
  onChange(event) {
    if (this._lastPointerType === "touch") {
      this._context.viewModel.viewLayout.deltaScrollNow(-event.translationX, -event.translationY);
    }
    if (this._lastPointerType === "pen") {
      this._dispatchGesture(
        event,
        /*inSelectionMode*/
        true
      );
    }
  }
  _dispatchGesture(event, inSelectionMode) {
    const target = this._createMouseTarget(new EditorMouseEvent(event, false, this.viewHelper.viewDomNode), false);
    if (target.position) {
      this.viewController.dispatchMouse({
        position: target.position,
        mouseColumn: target.position.column,
        startedOnLineNumbers: false,
        revealType: 1 /* Minimal */,
        mouseDownCount: event.tapCount,
        inSelectionMode,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        leftButton: false,
        middleButton: false,
        onInjectedText: target.type === 6 /* CONTENT_TEXT */ && target.detail.injectedText !== null
      });
    }
  }
  _onMouseDown(e, pointerId) {
    if (e.browserEvent.pointerType === "touch") {
      return;
    }
    super._onMouseDown(e, pointerId);
  }
};

var TouchHandler = class extends MouseHandler {
  constructor(context2, viewController, viewHelper) {
    super(context2, viewController, viewHelper);
    this._register(Gesture.addTarget(this.viewHelper.linesContentDomNode));
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, EventType2.Tap, (e) => this.onTap(e)));
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, EventType2.Change, (e) => this.onChange(e)));
    this._register(addDisposableListener(this.viewHelper.linesContentDomNode, EventType2.Contextmenu, (e) => this._onContextMenu(new EditorMouseEvent(e, false, this.viewHelper.viewDomNode), false)));
  }
  onTap(event) {
    event.preventDefault();
    this.viewHelper.focusTextArea();
    const target = this._createMouseTarget(new EditorMouseEvent(event, false, this.viewHelper.viewDomNode), false);
    if (target.position) {
      const event2 = document.createEvent("CustomEvent");
      event2.initEvent(TextAreaSyntethicEvents.Tap, false, true);
      this.viewHelper.dispatchTextAreaEvent(event2);
      this.viewController.moveTo(target.position, 1 /* Minimal */);
    }
  }
  onChange(e) {
    this._context.viewModel.viewLayout.deltaScrollNow(-e.translationX, -e.translationY);
  }
};

var PointerHandler = class extends Disposable {
  constructor(context2, viewController, viewHelper) {
    super();
    const isPhone = isIOS || isAndroid && isMobile;
    if (isPhone && BrowserFeatures.pointerEvents) {
      this.handler = this._register(new PointerEventHandler(context2, viewController, viewHelper));
    } else if (mainWindow.TouchEvent) {
      this.handler = this._register(new TouchHandler(context2, viewController, viewHelper));
    } else {
      this.handler = this._register(new MouseHandler(context2, viewController, viewHelper));
    }
  }
  getTargetAtClientPoint(clientX, clientY) {
    return this.handler.getTargetAtClientPoint(clientX, clientY);
  }
};
export { PointerEventHandler, TouchHandler, PointerHandler };
