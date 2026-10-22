// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture.ts
import { isMacintosh } from "./module-0014.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture.ts
function hasModifier(e4, modifier) {
  return !!e4[modifier];
}

var ClickLinkMouseEvent = class {
  constructor(source, opts) {
    this.target = source.target;
    this.isLeftClick = source.event.leftButton;
    this.isMiddleClick = source.event.middleButton;
    this.isRightClick = source.event.rightButton;
    this.mouseMiddleClickAction = opts.mouseMiddleClickAction;
    this.hasTriggerModifier = hasModifier(source.event, opts.triggerModifier);
    if (this.isMiddleClick && opts.mouseMiddleClickAction === "ctrlLeftClick") {
      this.isMiddleClick = false;
      this.isLeftClick = true;
      this.hasTriggerModifier = true;
    }
    this.hasSideBySideModifier = hasModifier(source.event, opts.triggerSideBySideModifier);
    this.isNoneOrSingleMouseDown = source.event.detail <= 1;
  }
};

var ClickLinkKeyboardEvent = class {
  constructor(source, opts) {
    this.keyCodeIsTriggerKey = source.keyCode === opts.triggerKey;
    this.keyCodeIsSideBySideKey = source.keyCode === opts.triggerSideBySideKey;
    this.hasTriggerModifier = hasModifier(source, opts.triggerModifier);
  }
};

var ClickLinkOptions = class {
  constructor(triggerKey, triggerModifier, triggerSideBySideKey, triggerSideBySideModifier, mouseMiddleClickAction) {
    this.mouseMiddleClickAction = mouseMiddleClickAction;
    this.triggerKey = triggerKey;
    this.triggerModifier = triggerModifier;
    this.triggerSideBySideKey = triggerSideBySideKey;
    this.triggerSideBySideModifier = triggerSideBySideModifier;
  }
  equals(other) {
    return this.triggerKey === other.triggerKey && this.triggerModifier === other.triggerModifier && this.triggerSideBySideKey === other.triggerSideBySideKey && this.triggerSideBySideModifier === other.triggerSideBySideModifier && this.mouseMiddleClickAction === other.mouseMiddleClickAction;
  }
};

function createOptions(multiCursorModifier2, mouseMiddleClickAction) {
  if (multiCursorModifier2 === "altKey") {
    if (isMacintosh) {
      return new ClickLinkOptions(57 /* Meta */, "metaKey", 6 /* Alt */, "altKey", mouseMiddleClickAction);
    }
    return new ClickLinkOptions(5 /* Ctrl */, "ctrlKey", 6 /* Alt */, "altKey", mouseMiddleClickAction);
  }
  if (isMacintosh) {
    return new ClickLinkOptions(6 /* Alt */, "altKey", 57 /* Meta */, "metaKey", mouseMiddleClickAction);
  }
  return new ClickLinkOptions(6 /* Alt */, "altKey", 5 /* Ctrl */, "ctrlKey", mouseMiddleClickAction);
}

var ClickLinkGesture = class extends Disposable {
  constructor(editor, opts) {
    super();
    this._onMouseMoveOrRelevantKeyDown = this._register(new Emitter());
    this.onMouseMoveOrRelevantKeyDown = this._onMouseMoveOrRelevantKeyDown.event;
    this._onExecute = this._register(new Emitter());
    this.onExecute = this._onExecute.event;
    this._onCancel = this._register(new Emitter());
    this.onCancel = this._onCancel.event;
    this._editor = editor;
    this._extractLineNumberFromMouseEvent = opts?.extractLineNumberFromMouseEvent ?? ((e4) => e4.target.position ? e4.target.position.lineNumber : 0);
    this._opts = createOptions(this._editor.getOption(86 /* multiCursorModifier */), this._editor.getOption(87 /* mouseMiddleClickAction */));
    this._lastMouseMoveEvent = null;
    this._hasTriggerKeyOnMouseDown = false;
    this._lineNumberOnMouseDown = 0;
    this._register(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(86 /* multiCursorModifier */) || e4.hasChanged(87 /* mouseMiddleClickAction */)) {
        const newOpts = createOptions(this._editor.getOption(86 /* multiCursorModifier */), this._editor.getOption(87 /* mouseMiddleClickAction */));
        if (this._opts.equals(newOpts)) {
          return;
        }
        this._opts = newOpts;
        this._lastMouseMoveEvent = null;
        this._hasTriggerKeyOnMouseDown = false;
        this._lineNumberOnMouseDown = 0;
        this._onCancel.fire();
      }
    }));
    this._register(this._editor.onMouseMove((e4) => this._onEditorMouseMove(new ClickLinkMouseEvent(e4, this._opts))));
    this._register(this._editor.onMouseDown((e4) => this._onEditorMouseDown(new ClickLinkMouseEvent(e4, this._opts))));
    this._register(this._editor.onMouseUp((e4) => this._onEditorMouseUp(new ClickLinkMouseEvent(e4, this._opts))));
    this._register(this._editor.onKeyDown((e4) => this._onEditorKeyDown(new ClickLinkKeyboardEvent(e4, this._opts))));
    this._register(this._editor.onKeyUp((e4) => this._onEditorKeyUp(new ClickLinkKeyboardEvent(e4, this._opts))));
    this._register(this._editor.onMouseDrag(() => this._resetHandler()));
    this._register(this._editor.onDidChangeCursorSelection((e4) => this._onDidChangeCursorSelection(e4)));
    this._register(this._editor.onDidChangeModel((e4) => this._resetHandler()));
    this._register(this._editor.onDidChangeModelContent(() => this._resetHandler()));
    this._register(this._editor.onDidScrollChange((e4) => {
      if (e4.scrollTopChanged || e4.scrollLeftChanged) {
        this._resetHandler();
      }
    }));
  }
  _onDidChangeCursorSelection(e4) {
    if (e4.selection && e4.selection.startColumn !== e4.selection.endColumn) {
      this._resetHandler();
    }
  }
  _onEditorMouseMove(mouseEvent) {
    this._lastMouseMoveEvent = mouseEvent;
    this._onMouseMoveOrRelevantKeyDown.fire([mouseEvent, null]);
  }
  _onEditorMouseDown(mouseEvent) {
    this._hasTriggerKeyOnMouseDown = mouseEvent.hasTriggerModifier;
    this._lineNumberOnMouseDown = this._extractLineNumberFromMouseEvent(mouseEvent);
  }
  _onEditorMouseUp(mouseEvent) {
    const currentLineNumber = this._extractLineNumberFromMouseEvent(mouseEvent);
    const lineNumbersCorrect = !!this._lineNumberOnMouseDown && this._lineNumberOnMouseDown === currentLineNumber;
    if (lineNumbersCorrect && (this._hasTriggerKeyOnMouseDown || mouseEvent.isMiddleClick && mouseEvent.mouseMiddleClickAction === "openLink")) {
      this._onExecute.fire(mouseEvent);
    }
  }
  _onEditorKeyDown(e4) {
    if (this._lastMouseMoveEvent && (e4.keyCodeIsTriggerKey || e4.keyCodeIsSideBySideKey && e4.hasTriggerModifier)) {
      this._onMouseMoveOrRelevantKeyDown.fire([this._lastMouseMoveEvent, e4]);
    } else if (e4.hasTriggerModifier) {
      this._onCancel.fire();
    }
  }
  _onEditorKeyUp(e4) {
    if (e4.keyCodeIsTriggerKey) {
      this._onCancel.fire();
    }
  }
  _resetHandler() {
    this._lastMouseMoveEvent = null;
    this._hasTriggerKeyOnMouseDown = false;
    this._onCancel.fire();
  }
};
export { hasModifier, createOptions, ClickLinkMouseEvent, ClickLinkKeyboardEvent, ClickLinkOptions, ClickLinkGesture };
