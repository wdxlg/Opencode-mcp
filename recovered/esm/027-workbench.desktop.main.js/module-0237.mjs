// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/editorDom.ts
import { EventType, addDisposableListener, addStandardDisposableListener, getDomNodePagePosition, getWindow, isInShadowDOM } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { asCssVariable } from "./module-0226.mjs";


// src/vs/editor/browser/editorDom.ts
var PageCoordinates = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this._pageCoordinatesBrand = void 0;
  }
  toClientCoordinates(targetWindow) {
    return new ClientCoordinates(this.x - targetWindow.scrollX, this.y - targetWindow.scrollY);
  }
};

var ClientCoordinates = class {
  constructor(clientX, clientY) {
    this.clientX = clientX;
    this.clientY = clientY;
    this._clientCoordinatesBrand = void 0;
  }
  toPageCoordinates(targetWindow) {
    return new PageCoordinates(this.clientX + targetWindow.scrollX, this.clientY + targetWindow.scrollY);
  }
};

var EditorPagePosition = class {
  constructor(x, y, width2, height) {
    this.x = x;
    this.y = y;
    this.width = width2;
    this.height = height;
    this._editorPagePositionBrand = void 0;
  }
};

var CoordinatesRelativeToEditor = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this._positionRelativeToEditorBrand = void 0;
  }
};

function createEditorPagePosition(editorViewDomNode) {
  const editorPos = getDomNodePagePosition(editorViewDomNode);
  return new EditorPagePosition(editorPos.left, editorPos.top, editorPos.width, editorPos.height);
}

function createCoordinatesRelativeToEditor(editorViewDomNode, editorPagePosition, pos) {
  const scaleX = editorPagePosition.width / editorViewDomNode.offsetWidth;
  const scaleY = editorPagePosition.height / editorViewDomNode.offsetHeight;
  const relativeX = (pos.x - editorPagePosition.x) / scaleX;
  const relativeY = (pos.y - editorPagePosition.y) / scaleY;
  return new CoordinatesRelativeToEditor(relativeX, relativeY);
}

var EditorMouseEvent = class extends StandardMouseEvent {
  constructor(e, isFromPointerCapture, editorViewDomNode) {
    super(getWindow(editorViewDomNode), e);
    this._editorMouseEventBrand = void 0;
    this.isFromPointerCapture = isFromPointerCapture;
    this.pos = new PageCoordinates(this.posx, this.posy);
    this._editorViewDomNode = editorViewDomNode;
  }
  /**
   * Editor's coordinates relative to the whole document.
   */
  get editorPos() {
    this._editorPos ??= createEditorPagePosition(this._editorViewDomNode);
    return this._editorPos;
  }
  /**
   * Coordinates relative to the (top;left) of the editor.
   * *NOTE*: These coordinates are preferred because they take into account transformations applied to the editor.
   * *NOTE*: These coordinates could be negative if the mouse position is outside the editor.
  */
  get relativePos() {
    this._relativePos ??= createCoordinatesRelativeToEditor(this._editorViewDomNode, this.editorPos, this.pos);
    return this._relativePos;
  }
};

var EditorMouseEventFactory = class {
  constructor(editorViewDomNode) {
    this._editorViewDomNode = editorViewDomNode;
  }
  _create(e) {
    return new EditorMouseEvent(e, false, this._editorViewDomNode);
  }
  onContextMenu(target, callback) {
    return addDisposableListener(target, EventType.CONTEXT_MENU, (e) => {
      callback(this._create(e));
    });
  }
  onMouseUp(target, callback) {
    return addDisposableListener(target, EventType.MOUSE_UP, (e) => {
      callback(this._create(e));
    });
  }
  onMouseDown(target, callback) {
    return addDisposableListener(target, EventType.MOUSE_DOWN, (e) => {
      callback(this._create(e));
    });
  }
  onPointerDown(target, callback) {
    return addDisposableListener(target, EventType.POINTER_DOWN, (e) => {
      callback(this._create(e), e.pointerId);
    });
  }
  onMouseLeave(target, callback) {
    return addDisposableListener(target, EventType.MOUSE_LEAVE, (e) => {
      callback(this._create(e));
    });
  }
  onMouseMove(target, callback) {
    return addDisposableListener(target, EventType.MOUSE_MOVE, (e) => callback(this._create(e)));
  }
};

var EditorPointerEventFactory = class {
  constructor(editorViewDomNode) {
    this._editorViewDomNode = editorViewDomNode;
  }
  _create(e) {
    return new EditorMouseEvent(e, false, this._editorViewDomNode);
  }
  onPointerUp(target, callback) {
    return addDisposableListener(target, "pointerup", (e) => {
      callback(this._create(e));
    });
  }
  onPointerDown(target, callback) {
    return addDisposableListener(target, EventType.POINTER_DOWN, (e) => {
      callback(this._create(e), e.pointerId);
    });
  }
  onPointerLeave(target, callback) {
    return addDisposableListener(target, EventType.POINTER_LEAVE, (e) => {
      callback(this._create(e));
    });
  }
  onPointerMove(target, callback) {
    return addDisposableListener(target, "pointermove", (e) => callback(this._create(e)));
  }
};

var GlobalEditorPointerMoveMonitor = class extends Disposable {
  constructor(editorViewDomNode) {
    super();
    this._editorViewDomNode = editorViewDomNode;
    this._globalPointerMoveMonitor = this._register(new GlobalPointerMoveMonitor());
    this._keydownListener = null;
  }
  startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
    this._keydownListener = addStandardDisposableListener(initialElement.ownerDocument, "keydown", (e) => {
      const chord = e.toKeyCodeChord();
      if (chord.isModifierKey()) {
        return;
      }
      this._globalPointerMoveMonitor.stopMonitoring(true, e.browserEvent);
    }, true);
    this._globalPointerMoveMonitor.startMonitoring(
      initialElement,
      pointerId,
      initialButtons,
      (e) => {
        pointerMoveCallback(new EditorMouseEvent(e, true, this._editorViewDomNode));
      },
      (e) => {
        this._keydownListener.dispose();
        onStopCallback(e);
      }
    );
  }
  stopMonitoring() {
    this._globalPointerMoveMonitor.stopMonitoring(true);
  }
};

var DynamicCssRules = class _DynamicCssRules {
  constructor(_editor) {
    this._editor = _editor;
    this._instanceId = ++_DynamicCssRules._idPool;
    this._counter = 0;
    this._rules = new DisposableMap();
    // We delay garbage collection so that hanging rules can be reused.
    this._garbageCollectionScheduler = new RunOnceScheduler(() => this.garbageCollect(), 1e3);
  }
  static {
    this._idPool = 0;
  }
  dispose() {
    this._rules.dispose();
    this._garbageCollectionScheduler.dispose();
  }
  createClassNameRef(options3) {
    const rule = this.getOrCreateRule(options3);
    rule.increaseRefCount();
    return {
      className: rule.className,
      dispose: () => {
        rule.decreaseRefCount();
        this._garbageCollectionScheduler.schedule();
      }
    };
  }
  getOrCreateRule(properties) {
    const key3 = this.computeUniqueKey(properties);
    let existingRule = this._rules.get(key3);
    if (!existingRule) {
      const counter = this._counter++;
      existingRule = new RefCountedCssRule(
        key3,
        `dyn-rule-${this._instanceId}-${counter}`,
        isInShadowDOM(this._editor.getContainerDomNode()) ? this._editor.getContainerDomNode() : void 0,
        properties
      );
      this._rules.set(key3, existingRule);
    }
    return existingRule;
  }
  computeUniqueKey(properties) {
    return JSON.stringify(properties);
  }
  garbageCollect() {
    for (const rule of this._rules.values()) {
      if (!rule.hasReferences()) {
        this._rules.deleteAndDispose(rule.key);
      }
    }
  }
};

var RefCountedCssRule = class {
  constructor(key3, className2, _containerElement, properties) {
    this.key = key3;
    this.className = className2;
    this.properties = properties;
    this._referenceCount = 0;
    this._styleElementDisposables = new DisposableStore();
    this._styleElement = createStyleSheet(_containerElement, void 0, this._styleElementDisposables);
    this._styleElement.textContent = this.getCssText(this.className, this.properties);
  }
  getCssText(className2, properties) {
    let str = `.${className2} {`;
    for (const prop in properties) {
      const value2 = properties[prop];
      let cssValue;
      if (typeof value2 === "object") {
        cssValue = asCssVariable(value2.id);
      } else {
        cssValue = value2;
      }
      const cssPropName = camelToDashes(prop);
      str += `
	${cssPropName}: ${cssValue};`;
    }
    str += `
}`;
    return str;
  }
  dispose() {
    this._styleElementDisposables.dispose();
    this._styleElement = void 0;
  }
  increaseRefCount() {
    this._referenceCount++;
  }
  decreaseRefCount() {
    this._referenceCount--;
  }
  hasReferences() {
    return this._referenceCount > 0;
  }
};

function camelToDashes(str) {
  return str.replace(/(^[A-Z])/, ([first2]) => first2.toLowerCase()).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
}
export { createEditorPagePosition, createCoordinatesRelativeToEditor, camelToDashes, PageCoordinates, ClientCoordinates, EditorPagePosition, CoordinatesRelativeToEditor, EditorMouseEvent, EditorMouseEventFactory, EditorPointerEventFactory, GlobalEditorPointerMoveMonitor, DynamicCssRules, RefCountedCssRule };
