// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/dom.ts
import { ensureCodeWindow, mainWindow } from "./module-0002.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StandardKeyboardEvent, hasModifierKeys } from "./module-0022.mjs";
import { isIOS } from "./module-0014.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { AbstractIdleValue, IntervalTimer, _runWhenIdle } from "./module-0036.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { hash } from "./module-0039.mjs";
import { isWebKit } from "./module-0018.mjs";
import { RemoteAuthorities } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { isPointWithinTriangle } from "./module-0040.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { isObservable } from "./module-0059.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/base/browser/dom.ts
var {
  registerWindow,
  getWindow,
  getDocument,
  getWindows,
  getWindowsCount,
  getWindowId,
  getWindowById,
  hasWindow,
  onDidRegisterWindow,
  onWillUnregisterWindow,
  onDidUnregisterWindow
} = (function() {
  const windows = /* @__PURE__ */ new Map();
  ensureCodeWindow(mainWindow, 1);
  const mainWindowRegistration = { window: mainWindow, disposables: new DisposableStore() };
  windows.set(mainWindow.vscodeWindowId, mainWindowRegistration);
  const onDidRegisterWindow2 = new Emitter();
  const onDidUnregisterWindow2 = new Emitter();
  const onWillUnregisterWindow2 = new Emitter();
  function getWindowById2(windowId, fallbackToMain) {
    const window2 = typeof windowId === "number" ? windows.get(windowId) : void 0;
    return window2 ?? (fallbackToMain ? mainWindowRegistration : void 0);
  }
  return {
    onDidRegisterWindow: onDidRegisterWindow2.event,
    onWillUnregisterWindow: onWillUnregisterWindow2.event,
    onDidUnregisterWindow: onDidUnregisterWindow2.event,
    registerWindow(window2) {
      if (windows.has(window2.vscodeWindowId)) {
        return Disposable.None;
      }
      const disposables = new DisposableStore();
      const registeredWindow = {
        window: window2,
        disposables: disposables.add(new DisposableStore())
      };
      windows.set(window2.vscodeWindowId, registeredWindow);
      disposables.add(toDisposable(() => {
        windows.delete(window2.vscodeWindowId);
        onDidUnregisterWindow2.fire(window2);
      }));
      disposables.add(addDisposableListener(window2, EventType.BEFORE_UNLOAD, () => {
        onWillUnregisterWindow2.fire(window2);
      }));
      onDidRegisterWindow2.fire(registeredWindow);
      return disposables;
    },
    getWindows() {
      return windows.values();
    },
    getWindowsCount() {
      return windows.size;
    },
    getWindowId(targetWindow) {
      return targetWindow.vscodeWindowId;
    },
    hasWindow(windowId) {
      return windows.has(windowId);
    },
    getWindowById: getWindowById2,
    getWindow(e) {
      const candidateNode = e;
      if (candidateNode?.ownerDocument?.defaultView) {
        return candidateNode.ownerDocument.defaultView.window;
      }
      const candidateEvent = e;
      if (candidateEvent?.view) {
        return candidateEvent.view.window;
      }
      return mainWindow;
    },
    getDocument(e) {
      const candidateNode = e;
      return getWindow(candidateNode).document;
    }
  };
})();

var externalFocusCheckers = /* @__PURE__ */ new Set();

function registerExternalFocusChecker(checker) {
  externalFocusCheckers.add(checker);
  return toDisposable(() => {
    externalFocusCheckers.delete(checker);
  });
}

function hasExternalFocus() {
  for (const checker of externalFocusCheckers) {
    if (checker().hasFocus) {
      return true;
    }
  }
  return false;
}

function getExternalFocusWindow() {
  for (const checker of externalFocusCheckers) {
    const info = checker();
    if (info.hasFocus && info.window) {
      return info.window;
    }
  }
  return void 0;
}

function hasAppFocus() {
  for (const { window: window2 } of getWindows()) {
    if (window2.document.hasFocus()) {
      return true;
    }
  }
  if (hasExternalFocus()) {
    return true;
  }
  return false;
}

function clearNode(node) {
  while (node.firstChild) {
    node.firstChild.remove();
  }
}

var DomListener = class {
  constructor(node, type, handler, options3) {
    this._node = node;
    this._type = type;
    this._handler = handler;
    this._options = options3 || false;
    this._node.addEventListener(this._type, this._handler, this._options);
  }
  dispose() {
    if (!this._handler) {
      return;
    }
    this._node.removeEventListener(this._type, this._handler, this._options);
    this._node = null;
    this._handler = null;
  }
};

function addDisposableListener(node, type, handler, useCaptureOrOptions) {
  return new DomListener(node, type, handler, useCaptureOrOptions);
}

function _wrapAsStandardMouseEvent(targetWindow, handler) {
  return function(e) {
    return handler(new StandardMouseEvent(targetWindow, e));
  };
}

function _wrapAsStandardKeyboardEvent(handler) {
  return function(e) {
    return handler(new StandardKeyboardEvent(e));
  };
}

var addStandardDisposableListener = function addStandardDisposableListener2(node, type, handler, useCapture) {
  let wrapHandler = handler;
  if (type === "click" || type === "mousedown" || type === "contextmenu") {
    wrapHandler = _wrapAsStandardMouseEvent(getWindow(node), handler);
  } else if (type === "keydown" || type === "keypress" || type === "keyup") {
    wrapHandler = _wrapAsStandardKeyboardEvent(handler);
  }
  return addDisposableListener(node, type, wrapHandler, useCapture);
};

var addStandardDisposableGenericMouseDownListener = function addStandardDisposableListener3(node, handler, useCapture) {
  const wrapHandler = _wrapAsStandardMouseEvent(getWindow(node), handler);
  return addDisposableGenericMouseDownListener(node, wrapHandler, useCapture);
};

var addStandardDisposableGenericMouseUpListener = function addStandardDisposableListener4(node, handler, useCapture) {
  const wrapHandler = _wrapAsStandardMouseEvent(getWindow(node), handler);
  return addDisposableGenericMouseUpListener(node, wrapHandler, useCapture);
};

function addDisposableGenericMouseDownListener(node, handler, useCapture) {
  return addDisposableListener(node, isIOS && BrowserFeatures.pointerEvents ? EventType.POINTER_DOWN : EventType.MOUSE_DOWN, handler, useCapture);
}

function addDisposableGenericMouseMoveListener(node, handler, useCapture) {
  return addDisposableListener(node, isIOS && BrowserFeatures.pointerEvents ? EventType.POINTER_MOVE : EventType.MOUSE_MOVE, handler, useCapture);
}

function addDisposableGenericMouseUpListener(node, handler, useCapture) {
  return addDisposableListener(node, isIOS && BrowserFeatures.pointerEvents ? EventType.POINTER_UP : EventType.MOUSE_UP, handler, useCapture);
}

function runWhenWindowIdle(targetWindow, callback, timeout2) {
  return _runWhenIdle(targetWindow, callback, timeout2);
}

var WindowIdleValue = class extends AbstractIdleValue {
  constructor(targetWindow, executor) {
    super(targetWindow, executor);
  }
};

var runAtThisOrScheduleAtNextAnimationFrame;

var scheduleAtNextAnimationFrame;

function disposableWindowInterval(targetWindow, handler, interval, iterations) {
  let iteration = 0;
  const timer = targetWindow.setInterval(() => {
    iteration++;
    if (typeof iterations === "number" && iteration >= iterations || handler() === true) {
      disposable.dispose();
    }
  }, interval);
  const disposable = toDisposable(() => {
    targetWindow.clearInterval(timer);
  });
  return disposable;
}

var WindowIntervalTimer = class extends IntervalTimer {
  /**
   *
   * @param node The optional node from which the target window is determined
   */
  constructor(node) {
    super();
    this.defaultTarget = node && getWindow(node);
  }
  cancelAndSet(runner, interval, targetWindow) {
    return super.cancelAndSet(runner, interval, targetWindow ?? this.defaultTarget);
  }
};

var AnimationFrameQueueItem = class {
  constructor(runner, priority = 0) {
    this._runner = runner;
    this.priority = priority;
    this._canceled = false;
  }
  dispose() {
    this._canceled = true;
  }
  execute() {
    if (this._canceled) {
      return;
    }
    try {
      this._runner();
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  // Sort by priority (largest to lowest)
  static sort(a, b) {
    return b.priority - a.priority;
  }
};

(function() {
  const NEXT_QUEUE = /* @__PURE__ */ new Map();
  const CURRENT_QUEUE = /* @__PURE__ */ new Map();
  const animFrameRequested = /* @__PURE__ */ new Map();
  const inAnimationFrameRunner = /* @__PURE__ */ new Map();
  const animationFrameRunner = (targetWindowId) => {
    animFrameRequested.set(targetWindowId, false);
    const currentQueue = NEXT_QUEUE.get(targetWindowId) ?? [];
    CURRENT_QUEUE.set(targetWindowId, currentQueue);
    NEXT_QUEUE.set(targetWindowId, []);
    inAnimationFrameRunner.set(targetWindowId, true);
    while (currentQueue.length > 0) {
      currentQueue.sort(AnimationFrameQueueItem.sort);
      const top2 = currentQueue.shift();
      top2.execute();
    }
    inAnimationFrameRunner.set(targetWindowId, false);
  };
  scheduleAtNextAnimationFrame = (targetWindow, runner, priority = 0) => {
    const targetWindowId = getWindowId(targetWindow);
    const item = new AnimationFrameQueueItem(runner, priority);
    let nextQueue = NEXT_QUEUE.get(targetWindowId);
    if (!nextQueue) {
      nextQueue = [];
      NEXT_QUEUE.set(targetWindowId, nextQueue);
    }
    nextQueue.push(item);
    if (!animFrameRequested.get(targetWindowId)) {
      animFrameRequested.set(targetWindowId, true);
      targetWindow.requestAnimationFrame(() => animationFrameRunner(targetWindowId));
    }
    return item;
  };
  runAtThisOrScheduleAtNextAnimationFrame = (targetWindow, runner, priority) => {
    const targetWindowId = getWindowId(targetWindow);
    if (inAnimationFrameRunner.get(targetWindowId)) {
      const item = new AnimationFrameQueueItem(runner, priority);
      let currentQueue = CURRENT_QUEUE.get(targetWindowId);
      if (!currentQueue) {
        currentQueue = [];
        CURRENT_QUEUE.set(targetWindowId, currentQueue);
      }
      currentQueue.push(item);
      return item;
    } else {
      return scheduleAtNextAnimationFrame(targetWindow, runner, priority);
    }
  };
})();

function measure(targetWindow, callback) {
  return scheduleAtNextAnimationFrame(
    targetWindow,
    callback,
    1e4
    /* must be early */
  );
}

function modify(targetWindow, callback) {
  return scheduleAtNextAnimationFrame(
    targetWindow,
    callback,
    -1e4
    /* must be late */
  );
}

var AnimationFrameScheduler = class {
  constructor(node, runner) {
    this.pendingRunner = new MutableDisposable();
    this.node = node;
    this.runner = runner;
  }
  dispose() {
    this.pendingRunner.dispose();
  }
  /**
   * Cancel the currently scheduled runner (if any).
   */
  cancel() {
    this.pendingRunner.clear();
  }
  /**
   * Schedule the runner to execute at the next animation frame.
   * If already scheduled, this is a no-op (the existing schedule is kept).
   * If currently in an animation frame, the runner will execute immediately.
   */
  schedule() {
    if (this.pendingRunner.value) {
      return;
    }
    this.pendingRunner.value = runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.node), () => {
      this.pendingRunner.clear();
      this.runner();
    });
  }
  /**
   * Returns true if a runner is scheduled.
   */
  isScheduled() {
    return this.pendingRunner.value !== void 0;
  }
};

function getComputedStyle(el) {
  return getWindow(el).getComputedStyle(el, null);
}

function getClientArea(element, defaultValue, fallbackElement) {
  const elWindow = getWindow(element);
  const elDocument = elWindow.document;
  if (element !== elDocument.body) {
    return new Dimension(element.clientWidth, element.clientHeight);
  }
  if (isIOS && elWindow?.visualViewport) {
    return new Dimension(elWindow.visualViewport.width, elWindow.visualViewport.height);
  }
  if (elWindow?.innerWidth && elWindow.innerHeight) {
    return new Dimension(elWindow.innerWidth, elWindow.innerHeight);
  }
  if (elDocument.body && elDocument.body.clientWidth && elDocument.body.clientHeight) {
    return new Dimension(elDocument.body.clientWidth, elDocument.body.clientHeight);
  }
  if (elDocument.documentElement && elDocument.documentElement.clientWidth && elDocument.documentElement.clientHeight) {
    return new Dimension(elDocument.documentElement.clientWidth, elDocument.documentElement.clientHeight);
  }
  if (fallbackElement) {
    return getClientArea(fallbackElement, defaultValue);
  }
  if (defaultValue) {
    return defaultValue;
  }
  throw new Error("Unable to figure out browser width and height");
}

var SizeUtils = class _SizeUtils {
  // Adapted from WinJS
  // Converts a CSS positioning string for the specified element to pixels.
  static convertToPixels(element, value2) {
    return parseFloat(value2) || 0;
  }
  static getDimension(element, cssPropertyName) {
    const computedStyle = getComputedStyle(element);
    const value2 = computedStyle ? computedStyle.getPropertyValue(cssPropertyName) : "0";
    return _SizeUtils.convertToPixels(element, value2);
  }
  static getBorderLeftWidth(element) {
    return _SizeUtils.getDimension(element, "border-left-width");
  }
  static getBorderRightWidth(element) {
    return _SizeUtils.getDimension(element, "border-right-width");
  }
  static getBorderTopWidth(element) {
    return _SizeUtils.getDimension(element, "border-top-width");
  }
  static getBorderBottomWidth(element) {
    return _SizeUtils.getDimension(element, "border-bottom-width");
  }
  static getPaddingLeft(element) {
    return _SizeUtils.getDimension(element, "padding-left");
  }
  static getPaddingRight(element) {
    return _SizeUtils.getDimension(element, "padding-right");
  }
  static getPaddingTop(element) {
    return _SizeUtils.getDimension(element, "padding-top");
  }
  static getPaddingBottom(element) {
    return _SizeUtils.getDimension(element, "padding-bottom");
  }
  static getMarginLeft(element) {
    return _SizeUtils.getDimension(element, "margin-left");
  }
  static getMarginTop(element) {
    return _SizeUtils.getDimension(element, "margin-top");
  }
  static getMarginRight(element) {
    return _SizeUtils.getDimension(element, "margin-right");
  }
  static getMarginBottom(element) {
    return _SizeUtils.getDimension(element, "margin-bottom");
  }
};

var Dimension = class _Dimension {
  constructor(width2, height) {
    this.width = width2;
    this.height = height;
  }
  static {
    this.None = new _Dimension(0, 0);
  }
  with(width2 = this.width, height = this.height) {
    if (width2 !== this.width || height !== this.height) {
      return new _Dimension(width2, height);
    } else {
      return this;
    }
  }
  static is(obj) {
    return typeof obj === "object" && typeof obj.height === "number" && typeof obj.width === "number";
  }
  static lift(obj) {
    if (obj instanceof _Dimension) {
      return obj;
    } else {
      return new _Dimension(obj.width, obj.height);
    }
  }
  static equals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.width === b.width && a.height === b.height;
  }
};

function getTopLeftOffset(element) {
  let offsetParent = element.offsetParent;
  let top2 = element.offsetTop;
  let left = element.offsetLeft;
  while ((element = element.parentNode) !== null && element !== element.ownerDocument.body && element !== element.ownerDocument.documentElement) {
    top2 -= element.scrollTop;
    const c = isShadowRoot(element) ? null : getComputedStyle(element);
    if (c) {
      left -= c.direction !== "rtl" ? element.scrollLeft : -element.scrollLeft;
    }
    if (element === offsetParent) {
      left += SizeUtils.getBorderLeftWidth(element);
      top2 += SizeUtils.getBorderTopWidth(element);
      top2 += element.offsetTop;
      left += element.offsetLeft;
      offsetParent = element.offsetParent;
    }
  }
  return {
    left,
    top: top2
  };
}

function size(element, width2, height) {
  if (typeof width2 === "number") {
    element.style.width = `${width2}px`;
  }
  if (typeof height === "number") {
    element.style.height = `${height}px`;
  }
}

function position(element, top2, right, bottom, left, position2 = "absolute") {
  if (typeof top2 === "number") {
    element.style.top = `${top2}px`;
  }
  if (typeof right === "number") {
    element.style.right = `${right}px`;
  }
  if (typeof bottom === "number") {
    element.style.bottom = `${bottom}px`;
  }
  if (typeof left === "number") {
    element.style.left = `${left}px`;
  }
  element.style.position = position2;
}

function getDomNodePagePosition(domNode) {
  const bb = domNode.getBoundingClientRect();
  const window2 = getWindow(domNode);
  return {
    left: bb.left + window2.scrollX,
    top: bb.top + window2.scrollY,
    width: bb.width,
    height: bb.height
  };
}

function getDomNodeZoomLevel(domNode) {
  let testElement = domNode;
  let zoom = 1;
  do {
    const elementZoomLevel = getComputedStyle(testElement).zoom;
    if (elementZoomLevel !== null && elementZoomLevel !== void 0 && elementZoomLevel !== "1") {
      zoom *= elementZoomLevel;
    }
    testElement = testElement.parentElement;
  } while (testElement !== null && testElement !== testElement.ownerDocument.documentElement);
  return zoom;
}

function getTotalWidth(element) {
  const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
  return element.offsetWidth + margin;
}

function getContentWidth(element) {
  const border = SizeUtils.getBorderLeftWidth(element) + SizeUtils.getBorderRightWidth(element);
  const padding = SizeUtils.getPaddingLeft(element) + SizeUtils.getPaddingRight(element);
  return element.offsetWidth - border - padding;
}

function getTotalScrollWidth(element) {
  const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
  return element.scrollWidth + margin;
}

function getContentHeight(element) {
  const border = SizeUtils.getBorderTopWidth(element) + SizeUtils.getBorderBottomWidth(element);
  const padding = SizeUtils.getPaddingTop(element) + SizeUtils.getPaddingBottom(element);
  return element.offsetHeight - border - padding;
}

function getTotalHeight(element) {
  const margin = SizeUtils.getMarginTop(element) + SizeUtils.getMarginBottom(element);
  return element.offsetHeight + margin;
}

function getRelativeLeft(element, parent) {
  if (element === null) {
    return 0;
  }
  const elementPosition = getTopLeftOffset(element);
  const parentPosition = getTopLeftOffset(parent);
  return elementPosition.left - parentPosition.left;
}

function getLargestChildWidth(parent, children) {
  const childWidths = children.map((child) => {
    return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0;
  });
  const maxWidth = Math.max(...childWidths);
  return maxWidth;
}

function isAncestor(testChild, testAncestor) {
  return Boolean(testAncestor?.contains(testChild));
}

var parentFlowToDataKey = "parentFlowToElementId";

function setParentFlowTo(fromChildElement, toParentElement) {
  fromChildElement.dataset[parentFlowToDataKey] = toParentElement.id;
}

function getParentFlowToElement(node) {
  const flowToParentId = node.dataset[parentFlowToDataKey];
  if (typeof flowToParentId === "string") {
    return node.ownerDocument.getElementById(flowToParentId);
  }
  return null;
}

function isAncestorUsingFlowTo(testChild, testAncestor) {
  let node = testChild;
  while (node) {
    if (node === testAncestor) {
      return true;
    }
    if (isHTMLElement(node)) {
      const flowToParentElement = getParentFlowToElement(node);
      if (flowToParentElement) {
        node = flowToParentElement;
        continue;
      }
    }
    node = node.parentNode;
  }
  return false;
}

function findParentWithClass(node, clazz, stopAtClazzOrNode) {
  while (node && node.nodeType === node.ELEMENT_NODE) {
    if (typeof clazz === "string" ? node.classList.contains(clazz) : clazz.every((candidate) => node.classList.contains(candidate))) {
      return node;
    }
    if (stopAtClazzOrNode) {
      if (typeof stopAtClazzOrNode === "string") {
        if (node.classList.contains(stopAtClazzOrNode)) {
          return null;
        }
      } else {
        if (node === stopAtClazzOrNode) {
          return null;
        }
      }
    }
    node = node.parentNode;
  }
  return null;
}

function hasParentWithClass(node, clazz, stopAtClazzOrNode) {
  return !!findParentWithClass(node, clazz, stopAtClazzOrNode);
}

function isShadowRoot(node) {
  return node && !!node.host && !!node.mode;
}

function isInShadowDOM(domNode) {
  return !!getShadowRoot(domNode);
}

function getShadowRoot(domNode) {
  while (domNode.parentNode) {
    if (domNode === domNode.ownerDocument?.body) {
      return null;
    }
    domNode = domNode.parentNode;
  }
  return isShadowRoot(domNode) ? domNode : null;
}

function getActiveElement() {
  let result = getActiveDocument().activeElement;
  while (result?.shadowRoot) {
    result = result.shadowRoot.activeElement;
  }
  return result;
}

function isActiveElement(element) {
  return getActiveElement() === element;
}

function isAncestorOfActiveElement(ancestor) {
  return isAncestor(getActiveElement(), ancestor);
}

function isActiveDocument(element) {
  return element.ownerDocument === getActiveDocument();
}

function getActiveDocument() {
  if (getWindowsCount() <= 1) {
    return mainWindow.document;
  }
  const documents = Array.from(getWindows()).map(({ window: window2 }) => window2.document);
  const focusedDoc = documents.find((doc) => doc.hasFocus());
  if (focusedDoc) {
    return focusedDoc;
  }
  const externalWindow = getExternalFocusWindow();
  if (externalWindow) {
    return externalWindow.document;
  }
  return mainWindow.document;
}

function getActiveWindow() {
  const document2 = getActiveDocument();
  return document2.defaultView?.window ?? mainWindow;
}

var sharedMutationObserver = new class {
  constructor() {
    this.mutationObservers = /* @__PURE__ */ new Map();
  }
  observe(target, disposables, options3) {
    let mutationObserversPerTarget = this.mutationObservers.get(target);
    if (!mutationObserversPerTarget) {
      mutationObserversPerTarget = /* @__PURE__ */ new Map();
      this.mutationObservers.set(target, mutationObserversPerTarget);
    }
    const optionsHash = hash(options3);
    let mutationObserverPerOptions = mutationObserversPerTarget.get(optionsHash);
    if (!mutationObserverPerOptions) {
      const onDidMutate = new Emitter();
      const observer = new MutationObserver((mutations) => onDidMutate.fire(mutations));
      observer.observe(target, options3);
      const resolvedMutationObserverPerOptions = mutationObserverPerOptions = {
        users: 1,
        observer,
        onDidMutate: onDidMutate.event
      };
      disposables.add(toDisposable(() => {
        resolvedMutationObserverPerOptions.users -= 1;
        if (resolvedMutationObserverPerOptions.users === 0) {
          onDidMutate.dispose();
          observer.disconnect();
          mutationObserversPerTarget?.delete(optionsHash);
          if (mutationObserversPerTarget?.size === 0) {
            this.mutationObservers.delete(target);
          }
        }
      }));
      mutationObserversPerTarget.set(optionsHash, mutationObserverPerOptions);
    } else {
      mutationObserverPerOptions.users += 1;
    }
    return mutationObserverPerOptions.onDidMutate;
  }
}();

function createMetaElement(container3 = mainWindow.document.head) {
  return createHeadElement("meta", container3);
}

function createLinkElement(container3 = mainWindow.document.head) {
  return createHeadElement("link", container3);
}

function createHeadElement(tagName, container3 = mainWindow.document.head) {
  const element = document.createElement(tagName);
  container3.appendChild(element);
  return element;
}

function isHTMLElement(e) {
  return e instanceof HTMLElement || e instanceof getWindow(e).HTMLElement;
}

function isHTMLAnchorElement(e) {
  return e instanceof HTMLAnchorElement || e instanceof getWindow(e).HTMLAnchorElement;
}

function isHTMLTextAreaElement(e) {
  return e instanceof HTMLTextAreaElement || e instanceof getWindow(e).HTMLTextAreaElement;
}

function isHTMLInputElement(e) {
  return e instanceof HTMLInputElement || e instanceof getWindow(e).HTMLInputElement;
}

function isHTMLButtonElement(e) {
  return e instanceof HTMLButtonElement || e instanceof getWindow(e).HTMLButtonElement;
}

function isHTMLDivElement(e) {
  return e instanceof HTMLDivElement || e instanceof getWindow(e).HTMLDivElement;
}

function isSVGElement(e) {
  return e instanceof SVGElement || e instanceof getWindow(e).SVGElement;
}

function isMouseEvent(e) {
  return e instanceof MouseEvent || e instanceof getWindow(e).MouseEvent;
}

function isKeyboardEvent(e) {
  return e instanceof KeyboardEvent || e instanceof getWindow(e).KeyboardEvent;
}

function isPointerEvent(e) {
  return e instanceof PointerEvent || e instanceof getWindow(e).PointerEvent;
}

function isDragEvent(e) {
  return e instanceof DragEvent || e instanceof getWindow(e).DragEvent;
}

var EventType = {
  // Mouse
  CLICK: "click",
  AUXCLICK: "auxclick",
  DBLCLICK: "dblclick",
  MOUSE_UP: "mouseup",
  MOUSE_DOWN: "mousedown",
  MOUSE_OVER: "mouseover",
  MOUSE_MOVE: "mousemove",
  MOUSE_OUT: "mouseout",
  MOUSE_ENTER: "mouseenter",
  MOUSE_LEAVE: "mouseleave",
  MOUSE_WHEEL: "wheel",
  POINTER_UP: "pointerup",
  POINTER_DOWN: "pointerdown",
  POINTER_MOVE: "pointermove",
  POINTER_LEAVE: "pointerleave",
  CONTEXT_MENU: "contextmenu",
  WHEEL: "wheel",
  // Keyboard
  KEY_DOWN: "keydown",
  KEY_PRESS: "keypress",
  KEY_UP: "keyup",
  // HTML Document
  LOAD: "load",
  BEFORE_UNLOAD: "beforeunload",
  UNLOAD: "unload",
  PAGE_SHOW: "pageshow",
  PAGE_HIDE: "pagehide",
  PASTE: "paste",
  ABORT: "abort",
  ERROR: "error",
  RESIZE: "resize",
  SCROLL: "scroll",
  FULLSCREEN_CHANGE: "fullscreenchange",
  WK_FULLSCREEN_CHANGE: "webkitfullscreenchange",
  // Form
  SELECT: "select",
  CHANGE: "change",
  SUBMIT: "submit",
  RESET: "reset",
  FOCUS: "focus",
  FOCUS_IN: "focusin",
  FOCUS_OUT: "focusout",
  BLUR: "blur",
  INPUT: "input",
  // Local Storage
  STORAGE: "storage",
  // Drag
  DRAG_START: "dragstart",
  DRAG: "drag",
  DRAG_ENTER: "dragenter",
  DRAG_LEAVE: "dragleave",
  DRAG_OVER: "dragover",
  DROP: "drop",
  DRAG_END: "dragend",
  // Animation
  ANIMATION_START: isWebKit ? "webkitAnimationStart" : "animationstart",
  ANIMATION_END: isWebKit ? "webkitAnimationEnd" : "animationend",
  ANIMATION_ITERATION: isWebKit ? "webkitAnimationIteration" : "animationiteration"
};

function isEventLike(obj) {
  const candidate = obj;
  return !!(candidate && typeof candidate.preventDefault === "function" && typeof candidate.stopPropagation === "function");
}

var EventHelper = {
  stop: (e, cancelBubble) => {
    e.preventDefault();
    if (cancelBubble) {
      e.stopPropagation();
    }
    return e;
  }
};

function saveParentsScrollTop(node) {
  const r2 = [];
  for (let i2 = 0; node && node.nodeType === node.ELEMENT_NODE; i2++) {
    r2[i2] = node.scrollTop;
    node = node.parentNode;
  }
  return r2;
}

function restoreParentsScrollTop(node, state) {
  for (let i2 = 0; node && node.nodeType === node.ELEMENT_NODE; i2++) {
    if (node.scrollTop !== state[i2]) {
      node.scrollTop = state[i2];
    }
    node = node.parentNode;
  }
}

var FocusTracker = class _FocusTracker extends Disposable {
  constructor(element) {
    super();
    this._onDidFocus = this._register(new Emitter());
    this._onDidBlur = this._register(new Emitter());
    let hasFocus = _FocusTracker.hasFocusWithin(element);
    let loosingFocus = false;
    const onFocus = () => {
      loosingFocus = false;
      if (!hasFocus) {
        hasFocus = true;
        this._onDidFocus.fire();
      }
    };
    const onBlur = () => {
      if (hasFocus) {
        loosingFocus = true;
        (isHTMLElement(element) ? getWindow(element) : element).setTimeout(() => {
          if (loosingFocus) {
            loosingFocus = false;
            hasFocus = false;
            this._onDidBlur.fire();
          }
        }, 0);
      }
    };
    this._refreshStateHandler = () => {
      const currentNodeHasFocus = _FocusTracker.hasFocusWithin(element);
      if (currentNodeHasFocus !== hasFocus) {
        if (hasFocus) {
          onBlur();
        } else {
          onFocus();
        }
      }
    };
    this._register(addDisposableListener(element, EventType.FOCUS, onFocus, true));
    this._register(addDisposableListener(element, EventType.BLUR, onBlur, true));
    if (isHTMLElement(element)) {
      this._register(addDisposableListener(element, EventType.FOCUS_IN, () => this._refreshStateHandler()));
      this._register(addDisposableListener(element, EventType.FOCUS_OUT, () => this._refreshStateHandler()));
    }
  }
  get onDidFocus() {
    return this._onDidFocus.event;
  }
  get onDidBlur() {
    return this._onDidBlur.event;
  }
  static hasFocusWithin(element) {
    if (isHTMLElement(element)) {
      const shadowRoot = getShadowRoot(element);
      const activeElement = shadowRoot ? shadowRoot.activeElement : element.ownerDocument.activeElement;
      return isAncestor(activeElement, element);
    } else {
      const window2 = element;
      return isAncestor(window2.document.activeElement, window2.document);
    }
  }
  refreshState() {
    this._refreshStateHandler();
  }
};

function trackFocus(element) {
  return new FocusTracker(element);
}

function after(sibling, child) {
  sibling.after(child);
  return child;
}

function append(parent, ...children) {
  parent.append(...children);
  if (children.length === 1 && typeof children[0] !== "string") {
    return children[0];
  }
}

function prepend(parent, child) {
  parent.insertBefore(child, parent.firstChild);
  return child;
}

function reset(parent, ...children) {
  parent.textContent = "";
  append(parent, ...children);
}

var SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;

function _$(namespace, description, attrs, ...children) {
  const match2 = SELECTOR_REGEX.exec(description);
  if (!match2) {
    throw new Error("Bad use of emmet");
  }
  const tagName = match2[1] || "div";
  let result;
  if (namespace !== "http://www.w3.org/1999/xhtml" /* HTML */) {
    result = document.createElementNS(namespace, tagName);
  } else {
    result = document.createElement(tagName);
  }
  if (match2[3]) {
    result.id = match2[3];
  }
  if (match2[4]) {
    result.className = match2[4].replace(/\./g, " ").trim();
  }
  if (attrs) {
    Object.entries(attrs).forEach(([name, value2]) => {
      if (typeof value2 === "undefined") {
        return;
      }
      if (/^on\w+$/.test(name)) {
        result[name] = value2;
      } else if (name === "selected") {
        if (value2) {
          result.setAttribute(name, "true");
        }
      } else {
        result.setAttribute(name, value2);
      }
    });
  }
  result.append(...children);
  return result;
}

function $(description, attrs, ...children) {
  return _$("http://www.w3.org/1999/xhtml" /* HTML */, description, attrs, ...children);
}

$.SVG = function(description, attrs, ...children) {
  return _$("http://www.w3.org/2000/svg" /* SVG */, description, attrs, ...children);
};

function setVisibility(visible, ...elements) {
  if (visible) {
    show(...elements);
  } else {
    hide(...elements);
  }
}

function show(...elements) {
  for (const element of elements) {
    element.style.display = "";
    element.removeAttribute("aria-hidden");
  }
}

function hide(...elements) {
  for (const element of elements) {
    element.style.display = "none";
    element.setAttribute("aria-hidden", "true");
  }
}

function finalHandler(fn) {
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    fn(e);
  };
}

function domContentLoaded(targetWindow) {
  return new Promise((resolve3) => {
    const readyState2 = targetWindow.document.readyState;
    if (readyState2 === "complete" || targetWindow.document && targetWindow.document.body !== null) {
      resolve3(void 0);
    } else {
      const listener = () => {
        targetWindow.window.removeEventListener("DOMContentLoaded", listener, false);
        resolve3();
      };
      targetWindow.window.addEventListener("DOMContentLoaded", listener, false);
    }
  });
}

function computeScreenAwareSize(window2, cssPx) {
  const screenPx = window2.devicePixelRatio * cssPx;
  return Math.max(1, Math.floor(screenPx)) / window2.devicePixelRatio;
}

function windowOpenNoOpener(url) {
  mainWindow.open(url, "_blank", "noopener");
}

var popupWidth = 780;

var popupHeight = 640;

function windowOpenPopup(url) {
  const left = Math.floor(mainWindow.screenLeft + mainWindow.innerWidth / 2 - popupWidth / 2);
  const top2 = Math.floor(mainWindow.screenTop + mainWindow.innerHeight / 2 - popupHeight / 2);
  mainWindow.open(
    url,
    "_blank",
    `width=${popupWidth},height=${popupHeight},top=${top2},left=${left}`
  );
}

function windowOpenWithSuccess(url, noOpener = true) {
  const newTab = mainWindow.open();
  if (newTab) {
    if (noOpener) {
      newTab.opener = null;
    }
    newTab.location.href = url;
    return true;
  }
  return false;
}

function animate(targetWindow, fn) {
  const step = () => {
    fn();
    stepDisposable = scheduleAtNextAnimationFrame(targetWindow, step);
  };
  let stepDisposable = scheduleAtNextAnimationFrame(targetWindow, step);
  return toDisposable(() => stepDisposable.dispose());
}

RemoteAuthorities.setPreferredWebSchema(/^https:/.test(mainWindow.location.href) ? "https" : "http");

function triggerDownload(dataOrUri, name) {
  let url;
  if (URI.isUri(dataOrUri)) {
    url = dataOrUri.toString(true);
  } else {
    const blob = new Blob([dataOrUri]);
    url = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(url));
  }
  const activeWindow = getActiveWindow();
  const anchor = document.createElement("a");
  activeWindow.document.body.appendChild(anchor);
  anchor.download = name;
  anchor.href = url;
  anchor.click();
  setTimeout(() => anchor.remove());
}

function triggerUpload() {
  return new Promise((resolve3) => {
    const activeWindow = getActiveWindow();
    const input = document.createElement("input");
    activeWindow.document.body.appendChild(input);
    input.type = "file";
    input.multiple = true;
    Event2.once(Event2.fromDOMEventEmitter(input, "input"))(() => {
      resolve3(input.files ?? void 0);
    });
    input.click();
    setTimeout(() => input.remove());
  });
}

var ModifierKeyEmitter = class _ModifierKeyEmitter extends Emitter {
  constructor() {
    super();
    this._subscriptions = new DisposableStore();
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    };
    this._subscriptions.add(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => this.registerListeners(window2, disposables), { window: mainWindow, disposables: this._subscriptions }));
  }
  registerListeners(window2, disposables) {
    disposables.add(addDisposableListener(window2, "keydown", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 6 /* Alt */ && e.repeat) {
        return;
      }
      if (e.altKey && !this._keyStatus.altKey) {
        this._keyStatus.lastKeyPressed = "alt";
      } else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyPressed = "ctrl";
      } else if (e.metaKey && !this._keyStatus.metaKey) {
        this._keyStatus.lastKeyPressed = "meta";
      } else if (e.shiftKey && !this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyPressed = "shift";
      } else if (event.keyCode !== 6 /* Alt */) {
        this._keyStatus.lastKeyPressed = void 0;
      } else {
        return;
      }
      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.metaKey = e.metaKey;
      this._keyStatus.shiftKey = e.shiftKey;
      if (this._keyStatus.lastKeyPressed) {
        this._keyStatus.event = e;
        this.fire(this._keyStatus);
      }
    }, true));
    disposables.add(addDisposableListener(window2, "keyup", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      if (!e.altKey && this._keyStatus.altKey) {
        this._keyStatus.lastKeyReleased = "alt";
      } else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyReleased = "ctrl";
      } else if (!e.metaKey && this._keyStatus.metaKey) {
        this._keyStatus.lastKeyReleased = "meta";
      } else if (!e.shiftKey && this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyReleased = "shift";
      } else {
        this._keyStatus.lastKeyReleased = void 0;
      }
      if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
        this._keyStatus.lastKeyPressed = void 0;
      }
      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.metaKey = e.metaKey;
      this._keyStatus.shiftKey = e.shiftKey;
      if (this._keyStatus.lastKeyReleased) {
        this._keyStatus.event = e;
        this.fire(this._keyStatus);
      }
    }, true));
    disposables.add(addDisposableListener(window2.document.body, "mousedown", () => {
      this._keyStatus.lastKeyPressed = void 0;
    }, true));
    disposables.add(addDisposableListener(window2.document.body, "mouseup", () => {
      this._keyStatus.lastKeyPressed = void 0;
    }, true));
    disposables.add(addDisposableListener(window2.document.body, "mousemove", (e) => {
      if (e.buttons) {
        this._keyStatus.lastKeyPressed = void 0;
      }
    }, true));
    disposables.add(addDisposableListener(window2, "blur", () => {
      this.resetKeyStatus();
    }));
  }
  get keyStatus() {
    return this._keyStatus;
  }
  get isModifierPressed() {
    return hasModifierKeys(this._keyStatus);
  }
  /**
   * Allows to explicitly reset the key status based on more knowledge (#109062)
   */
  resetKeyStatus() {
    this.doResetKeyStatus();
    this.fire(this._keyStatus);
  }
  doResetKeyStatus() {
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    };
  }
  static getInstance() {
    if (!_ModifierKeyEmitter.instance) {
      _ModifierKeyEmitter.instance = new _ModifierKeyEmitter();
    }
    return _ModifierKeyEmitter.instance;
  }
  static disposeInstance() {
    if (_ModifierKeyEmitter.instance) {
      _ModifierKeyEmitter.instance.dispose();
      _ModifierKeyEmitter.instance = void 0;
    }
  }
  dispose() {
    super.dispose();
    this._subscriptions.dispose();
  }
};

var DragAndDropObserver = class extends Disposable {
  constructor(element, callbacks) {
    super();
    this.element = element;
    this.callbacks = callbacks;
    // A helper to fix issues with repeated DRAG_ENTER / DRAG_LEAVE
    // calls see https://github.com/microsoft/vscode/issues/14470
    // when the element has child elements where the events are fired
    // repeadedly.
    this.counter = 0;
    // Allows to measure the duration of the drag operation.
    this.dragStartTime = 0;
    this.registerListeners();
  }
  registerListeners() {
    if (this.callbacks.onDragStart) {
      this._register(addDisposableListener(this.element, EventType.DRAG_START, (e) => {
        this.callbacks.onDragStart?.(e);
      }));
    }
    if (this.callbacks.onDrag) {
      this._register(addDisposableListener(this.element, EventType.DRAG, (e) => {
        this.callbacks.onDrag?.(e);
      }));
    }
    this._register(addDisposableListener(this.element, EventType.DRAG_ENTER, (e) => {
      this.counter++;
      this.dragStartTime = e.timeStamp;
      this.callbacks.onDragEnter?.(e);
    }));
    this._register(addDisposableListener(this.element, EventType.DRAG_OVER, (e) => {
      e.preventDefault();
      this.callbacks.onDragOver?.(e, e.timeStamp - this.dragStartTime);
    }));
    this._register(addDisposableListener(this.element, EventType.DRAG_LEAVE, (e) => {
      this.counter--;
      if (this.counter === 0) {
        this.dragStartTime = 0;
        this.callbacks.onDragLeave?.(e);
      }
    }));
    this._register(addDisposableListener(this.element, EventType.DRAG_END, (e) => {
      this.counter = 0;
      this.dragStartTime = 0;
      this.callbacks.onDragEnd?.(e);
    }));
    this._register(addDisposableListener(this.element, EventType.DROP, (e) => {
      this.counter = 0;
      this.dragStartTime = 0;
      this.callbacks.onDrop?.(e);
    }));
  }
};

var DisposableResizeObserver = class extends Disposable {
  constructor(name, callback, targetWindow = mainWindow, options3) {
    super();
    this.name = name;
    const ctor = options3?.resizeObserverCtor ?? targetWindow.ResizeObserver;
    this.observer = new ctor((entries2, observer) => {
      recordDisposableResizeObserverInvocation(targetWindow, this.name);
      try {
        callback(entries2, observer);
      } catch (e) {
        onUnexpectedError(e);
      }
    });
    this._register(toDisposable(() => this.observer.disconnect()));
  }
  observe(target, options3) {
    this.observer.observe(target, options3);
    return toDisposable(() => this.observer.unobserve(target));
  }
};

var maxRecentDisposableResizeObservers = 8;

var recentDisposableResizeObserverContexts = /* @__PURE__ */ new WeakMap();

function recordDisposableResizeObserverInvocation(targetWindow, name) {
  let context2 = recentDisposableResizeObserverContexts.get(targetWindow);
  if (!context2) {
    context2 = { names: /* @__PURE__ */ new Set(), overflow: false };
    recentDisposableResizeObserverContexts.set(targetWindow, context2);
    targetWindow.requestAnimationFrame(() => recentDisposableResizeObserverContexts.delete(targetWindow));
  }
  if (context2.names.has(name)) {
    return;
  }
  if (context2.names.size < maxRecentDisposableResizeObservers) {
    context2.names.add(name);
  } else {
    context2.overflow = true;
    const largestName = Array.from(context2.names).sort().at(-1);
    if (name < largestName) {
      context2.names.delete(largestName);
      context2.names.add(name);
    }
  }
}

function getRecentDisposableResizeObserverContextForLoopError(message, targetWindow = mainWindow) {
  if (typeof message !== "string" || !message.includes("ResizeObserver loop")) {
    return void 0;
  }
  const context2 = recentDisposableResizeObserverContexts.get(targetWindow);
  if (!context2) {
    return void 0;
  }
  const names = Array.from(context2.names).sort();
  if (context2.overflow) {
    names.push("<overflow>");
  }
  return `[ResizeObserverLoopContext(${names.join(",")})] ${message}`;
}

var H_REGEX = /(?<tag>[\w\-]+)?(?:#(?<id>[\w\-]+))?(?<class>(?:\.(?:[\w\-]+))*)(?:@(?<name>(?:[\w\_])+))?/;

function h(tag2, ...args2) {
  let attributes;
  let children;
  if (Array.isArray(args2[0])) {
    attributes = {};
    children = args2[0];
  } else {
    attributes = args2[0] || {};
    children = args2[1];
  }
  const match2 = H_REGEX.exec(tag2);
  if (!match2 || !match2.groups) {
    throw new Error("Bad use of h");
  }
  const tagName = match2.groups["tag"] || "div";
  const el = document.createElement(tagName);
  if (match2.groups["id"]) {
    el.id = match2.groups["id"];
  }
  const classNames2 = [];
  if (match2.groups["class"]) {
    for (const className2 of match2.groups["class"].split(".")) {
      if (className2 !== "") {
        classNames2.push(className2);
      }
    }
  }
  if (attributes.className !== void 0) {
    for (const className2 of attributes.className.split(".")) {
      if (className2 !== "") {
        classNames2.push(className2);
      }
    }
  }
  if (classNames2.length > 0) {
    el.className = classNames2.join(" ");
  }
  const result = {};
  if (match2.groups["name"]) {
    result[match2.groups["name"]] = el;
  }
  if (children) {
    for (const c of children) {
      if (isHTMLElement(c)) {
        el.appendChild(c);
      } else if (typeof c === "string") {
        el.append(c);
      } else if ("root" in c) {
        Object.assign(result, c);
        el.appendChild(c.root);
      }
    }
  }
  for (const [key3, value2] of Object.entries(attributes)) {
    if (key3 === "className") {
      continue;
    } else if (key3 === "style") {
      for (const [cssKey, cssValue] of Object.entries(value2)) {
        el.style.setProperty(
          camelCaseToHyphenCase(cssKey),
          typeof cssValue === "number" ? cssValue + "px" : "" + cssValue
        );
      }
    } else if (key3 === "tabIndex") {
      el.tabIndex = value2;
    } else {
      el.setAttribute(camelCaseToHyphenCase(key3), value2.toString());
    }
  }
  result["root"] = el;
  return result;
}

function svgElem(tag2, ...args2) {
  let attributes;
  let children;
  if (Array.isArray(args2[0])) {
    attributes = {};
    children = args2[0];
  } else {
    attributes = args2[0] || {};
    children = args2[1];
  }
  const match2 = H_REGEX.exec(tag2);
  if (!match2 || !match2.groups) {
    throw new Error("Bad use of h");
  }
  const tagName = match2.groups["tag"] || "div";
  const el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  if (match2.groups["id"]) {
    el.id = match2.groups["id"];
  }
  const classNames2 = [];
  if (match2.groups["class"]) {
    for (const className2 of match2.groups["class"].split(".")) {
      if (className2 !== "") {
        classNames2.push(className2);
      }
    }
  }
  if (attributes.className !== void 0) {
    for (const className2 of attributes.className.split(".")) {
      if (className2 !== "") {
        classNames2.push(className2);
      }
    }
  }
  if (classNames2.length > 0) {
    el.className = classNames2.join(" ");
  }
  const result = {};
  if (match2.groups["name"]) {
    result[match2.groups["name"]] = el;
  }
  if (children) {
    for (const c of children) {
      if (isHTMLElement(c)) {
        el.appendChild(c);
      } else if (typeof c === "string") {
        el.append(c);
      } else if ("root" in c) {
        Object.assign(result, c);
        el.appendChild(c.root);
      }
    }
  }
  for (const [key3, value2] of Object.entries(attributes)) {
    if (key3 === "className") {
      continue;
    } else if (key3 === "style") {
      for (const [cssKey, cssValue] of Object.entries(value2)) {
        el.style.setProperty(
          camelCaseToHyphenCase(cssKey),
          typeof cssValue === "number" ? cssValue + "px" : "" + cssValue
        );
      }
    } else if (key3 === "tabIndex") {
      el.tabIndex = value2;
    } else {
      el.setAttribute(camelCaseToHyphenCase(key3), value2.toString());
    }
  }
  result["root"] = el;
  return result;
}

function camelCaseToHyphenCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function copyAttributes(from, to, filter2) {
  for (const { name, value: value2 } of from.attributes) {
    if (!filter2 || filter2.includes(name)) {
      to.setAttribute(name, value2);
    }
  }
}

function copyAttribute(from, to, name) {
  const value2 = from.getAttribute(name);
  if (value2) {
    to.setAttribute(name, value2);
  } else {
    to.removeAttribute(name);
  }
}

function trackAttributes(from, to, filter2) {
  copyAttributes(from, to, filter2);
  const disposables = new DisposableStore();
  disposables.add(sharedMutationObserver.observe(from, disposables, { attributes: true, attributeFilter: filter2 })((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName) {
        copyAttribute(from, to, mutation.attributeName);
      }
    }
  }));
  return disposables;
}

function isEditableElement(element) {
  return element.tagName.toLowerCase() === "input" || element.tagName.toLowerCase() === "textarea" || isHTMLElement(element) && !!element.editContext;
}

var SafeTriangle = class {
  constructor(originX, originY, target) {
    this.originX = originX;
    this.originY = originY;
    // 4 points (x, y), 8 length
    this.points = new Int16Array(8);
    const { top: top2, left, right, bottom } = target.getBoundingClientRect();
    const t2 = this.points;
    let i2 = 0;
    t2[i2++] = left;
    t2[i2++] = top2;
    t2[i2++] = right;
    t2[i2++] = top2;
    t2[i2++] = left;
    t2[i2++] = bottom;
    t2[i2++] = right;
    t2[i2++] = bottom;
  }
  contains(x, y) {
    const { points, originX, originY } = this;
    for (let i2 = 0; i2 < 4; i2++) {
      const p1 = 2 * i2;
      const p2 = 2 * ((i2 + 1) % 4);
      if (isPointWithinTriangle(x, y, originX, originY, points[p1], points[p1 + 1], points[p2], points[p2 + 1])) {
        return true;
      }
    }
    return false;
  }
};

var n;

((n2) => {
  function nodeNs(elementNs = void 0) {
    return (tag2, attributes, children) => {
      const className2 = attributes.class;
      delete attributes.class;
      const ref2 = attributes.ref;
      delete attributes.ref;
      const obsRef = attributes.obsRef;
      delete attributes.obsRef;
      return new ObserverNodeWithElement(tag2, ref2, obsRef, elementNs, className2, attributes, children);
    };
  }
  function node(tag2, elementNs = void 0) {
    const f = nodeNs(elementNs);
    return (attributes, children) => {
      return f(tag2, attributes, children);
    };
  }
  n2.div = node("div");
  n2.elem = nodeNs(void 0);
  n2.svg = node("svg", "http://www.w3.org/2000/svg");
  n2.svgElem = nodeNs("http://www.w3.org/2000/svg");
  function ref() {
    let value2 = void 0;
    const result = function(val) {
      value2 = val;
    };
    Object.defineProperty(result, "element", {
      get() {
        if (!value2) {
          throw new BugIndicatingError("Make sure the ref is set before accessing the element. Maybe wrong initialization order?");
        }
        return value2;
      }
    });
    return result;
  }
  n2.ref = ref;
})(n || (n = {}));

var ObserverNode = class _ObserverNode {
  constructor(tag2, ref, obsRef, ns, className2, attributes, children) {
    this._deriveds = [];
    this._isHovered = void 0;
    this._didMouseMoveDuringHover = void 0;
    this._element = ns ? document.createElementNS(ns, tag2) : document.createElement(tag2);
    if (ref) {
      ref(this._element);
    }
    if (obsRef) {
      this._deriveds.push(derived((_reader) => {
        obsRef(this);
        _reader.store.add({
          dispose: () => {
            obsRef(null);
          }
        });
      }));
    }
    if (className2) {
      if (hasObservable(className2)) {
        this._deriveds.push(derived(this, (reader) => {
          setClassName(this._element, getClassName2(className2, reader));
        }));
      } else {
        setClassName(this._element, getClassName2(className2, void 0));
      }
    }
    for (const [key3, value2] of Object.entries(attributes)) {
      if (key3 === "style") {
        for (const [cssKey, cssValue] of Object.entries(value2)) {
          const key4 = camelCaseToHyphenCase(cssKey);
          if (isObservable(cssValue)) {
            this._deriveds.push(derivedOpts({ owner: this, debugName: () => `set.style.${key4}` }, (reader) => {
              this._element.style.setProperty(key4, convertCssValue(cssValue.read(reader)));
            }));
          } else {
            this._element.style.setProperty(key4, convertCssValue(cssValue));
          }
        }
      } else if (key3 === "tabIndex") {
        if (isObservable(value2)) {
          this._deriveds.push(derived(this, (reader) => {
            this._element.tabIndex = value2.read(reader);
          }));
        } else {
          this._element.tabIndex = value2;
        }
      } else if (key3.startsWith("on")) {
        this._element[key3] = value2;
      } else {
        if (isObservable(value2)) {
          this._deriveds.push(derivedOpts({ owner: this, debugName: () => `set.${key3}` }, (reader) => {
            setOrRemoveAttribute(this._element, key3, value2.read(reader));
          }));
        } else {
          setOrRemoveAttribute(this._element, key3, value2);
        }
      }
    }
    if (children) {
      let getChildren = function(reader, children2) {
        if (isObservable(children2)) {
          return getChildren(reader, children2.read(reader));
        }
        if (Array.isArray(children2)) {
          return children2.flatMap((c) => getChildren(reader, c));
        }
        if (children2 instanceof _ObserverNode) {
          if (reader) {
            children2.readEffect(reader);
          }
          return [children2._element];
        }
        if (children2) {
          return [children2];
        }
        return [];
      };
      const d = derived(this, (reader) => {
        this._element.replaceChildren(...getChildren(reader, children));
      });
      this._deriveds.push(d);
      if (!childrenIsObservable(children)) {
        d.get();
      }
    }
  }
  readEffect(reader) {
    for (const d of this._deriveds) {
      d.read(reader);
    }
  }
  keepUpdated(store) {
    derived((reader) => {
      this.readEffect(reader);
    }).recomputeInitiallyAndOnChange(store);
    return this;
  }
  /**
   * Creates a live element that will keep the element updated as long as the returned object is not disposed.
  */
  toDisposableLiveElement() {
    const store = new DisposableStore();
    this.keepUpdated(store);
    return new LiveElement(this._element, store);
  }
  get isHovered() {
    if (!this._isHovered) {
      const hovered = observableValue("hovered", false);
      this._element.addEventListener("mouseenter", (_e) => hovered.set(true, void 0));
      this._element.addEventListener("mouseleave", (_e) => hovered.set(false, void 0));
      this._isHovered = hovered;
    }
    return this._isHovered;
  }
  get didMouseMoveDuringHover() {
    if (!this._didMouseMoveDuringHover) {
      let _hovering = false;
      const hovered = observableValue("didMouseMoveDuringHover", false);
      this._element.addEventListener("mouseenter", (_e) => {
        _hovering = true;
      });
      this._element.addEventListener("mousemove", (_e) => {
        if (_hovering) {
          hovered.set(true, void 0);
        }
      });
      this._element.addEventListener("mouseleave", (_e) => {
        _hovering = false;
        hovered.set(false, void 0);
      });
      this._didMouseMoveDuringHover = hovered;
    }
    return this._didMouseMoveDuringHover;
  }
};

function setClassName(domNode, className2) {
  if (isSVGElement(domNode)) {
    domNode.setAttribute("class", className2);
  } else {
    domNode.className = className2;
  }
}

function resolve2(value2, reader, cb) {
  if (isObservable(value2)) {
    cb(value2.read(reader));
    return;
  }
  if (Array.isArray(value2)) {
    for (const v2 of value2) {
      resolve2(v2, reader, cb);
    }
    return;
  }
  cb(value2);
}

function getClassName2(className2, reader) {
  let result = "";
  resolve2(className2, reader, (val) => {
    if (val) {
      if (result.length === 0) {
        result = val;
      } else {
        result += " " + val;
      }
    }
  });
  return result;
}

function hasObservable(value2) {
  if (isObservable(value2)) {
    return true;
  }
  if (Array.isArray(value2)) {
    return value2.some((v2) => hasObservable(v2));
  }
  return false;
}

function convertCssValue(value2) {
  if (typeof value2 === "number") {
    return value2 + "px";
  }
  return value2;
}

function childrenIsObservable(children) {
  if (isObservable(children)) {
    return true;
  }
  if (Array.isArray(children)) {
    return children.some((c) => childrenIsObservable(c));
  }
  return false;
}

var LiveElement = class {
  constructor(element, _disposable) {
    this.element = element;
    this._disposable = _disposable;
  }
  dispose() {
    this._disposable.dispose();
  }
};

var ObserverNodeWithElement = class extends ObserverNode {
  get element() {
    return this._element;
  }
};

function setOrRemoveAttribute(element, key3, value2) {
  if (value2 === null || value2 === void 0) {
    element.removeAttribute(camelCaseToHyphenCase(key3));
  } else {
    element.setAttribute(camelCaseToHyphenCase(key3), String(value2));
  }
}

var ConnectionObserverElement = class extends HTMLElement {
  disconnectedCallback() {
    this.onDidDisconnect?.();
  }
  connectedCallback() {
    this.onDidConnect?.();
  }
};

if (!customElements.get("connection-observer")) {
  customElements.define("connection-observer", ConnectionObserverElement);
}
export { registerExternalFocusChecker, hasExternalFocus, getExternalFocusWindow, hasAppFocus, clearNode, addDisposableListener, _wrapAsStandardMouseEvent, _wrapAsStandardKeyboardEvent, addDisposableGenericMouseDownListener, addDisposableGenericMouseMoveListener, addDisposableGenericMouseUpListener, runWhenWindowIdle, disposableWindowInterval, measure, modify, getComputedStyle, getClientArea, getTopLeftOffset, size, position, getDomNodePagePosition, getDomNodeZoomLevel, getTotalWidth, getContentWidth, getTotalScrollWidth, getContentHeight, getTotalHeight, getRelativeLeft, getLargestChildWidth, isAncestor, setParentFlowTo, getParentFlowToElement, isAncestorUsingFlowTo, findParentWithClass, hasParentWithClass, isShadowRoot, isInShadowDOM, getShadowRoot, getActiveElement, isActiveElement, isAncestorOfActiveElement, isActiveDocument, getActiveDocument, getActiveWindow, createMetaElement, createLinkElement, createHeadElement, isHTMLElement, isHTMLAnchorElement, isHTMLTextAreaElement, isHTMLInputElement, isHTMLButtonElement, isHTMLDivElement, isSVGElement, isMouseEvent, isKeyboardEvent, isPointerEvent, isDragEvent, isEventLike, saveParentsScrollTop, restoreParentsScrollTop, trackFocus, after, append, prepend, reset, _$, $, setVisibility, show, hide, finalHandler, domContentLoaded, computeScreenAwareSize, windowOpenNoOpener, windowOpenPopup, windowOpenWithSuccess, animate, triggerDownload, triggerUpload, recordDisposableResizeObserverInvocation, getRecentDisposableResizeObserverContextForLoopError, h, svgElem, camelCaseToHyphenCase, copyAttributes, copyAttribute, trackAttributes, isEditableElement, setClassName, resolve2, getClassName2, hasObservable, convertCssValue, childrenIsObservable, setOrRemoveAttribute, registerWindow, getWindow, getDocument, getWindows, getWindowsCount, getWindowId, getWindowById, hasWindow, onDidRegisterWindow, onWillUnregisterWindow, onDidUnregisterWindow, externalFocusCheckers, DomListener, addStandardDisposableListener, addStandardDisposableGenericMouseDownListener, addStandardDisposableGenericMouseUpListener, WindowIdleValue, runAtThisOrScheduleAtNextAnimationFrame, scheduleAtNextAnimationFrame, WindowIntervalTimer, AnimationFrameQueueItem, AnimationFrameScheduler, SizeUtils, Dimension, parentFlowToDataKey, sharedMutationObserver, EventType, EventHelper, FocusTracker, SELECTOR_REGEX, popupWidth, popupHeight, ModifierKeyEmitter, DragAndDropObserver, DisposableResizeObserver, maxRecentDisposableResizeObservers, recentDisposableResizeObserverContexts, H_REGEX, SafeTriangle, n, ObserverNode, LiveElement, ObserverNodeWithElement, ConnectionObserverElement };
