// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/scrollbar/scrollableElement.ts
import { Emitter } from "./module-0017.mjs";
import { getZoomFactor, isChrome2 } from "./module-0018.mjs";
import { EventType, addDisposableListener, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Widget } from "./module-0252.mjs";
import { VerticalScrollbar } from "./module-0258.mjs";
import { HorizontalScrollbar } from "./module-0257.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { TimeoutTimer } from "./module-0036.mjs";
import { dispose } from "./module-0012.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { StandardWheelEvent } from "./module-0024.mjs";
import { Scrollable } from "./module-0099.mjs";


// src/vs/base/browser/ui/scrollbar/scrollableElement.ts
var HIDE_TIMEOUT = 500;

var SCROLL_WHEEL_SENSITIVITY = 50;

var SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED = true;

var DEFAULT_SCROLLBAR_SIZE = 10;

var globalDefaultScrollbarSize = DEFAULT_SCROLLBAR_SIZE;

var _onDidChangeDefaultScrollbarSizeEmitter = new Emitter();

var onDidChangeDefaultScrollbarSize = _onDidChangeDefaultScrollbarSizeEmitter.event;

var MouseWheelClassifierItem = class {
  constructor(timestamp, deltaX, deltaY) {
    this.timestamp = timestamp;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.score = 0;
  }
};

var MouseWheelClassifier = class _MouseWheelClassifier {
  static {
    this.INSTANCE = new _MouseWheelClassifier();
  }
  constructor() {
    this._capacity = 5;
    this._memory = [];
    this._front = -1;
    this._rear = -1;
  }
  isPhysicalMouseWheel() {
    if (this._front === -1 && this._rear === -1) {
      return false;
    }
    let remainingInfluence = 1;
    let score3 = 0;
    let iteration = 1;
    let index2 = this._rear;
    do {
      const influence = index2 === this._front ? remainingInfluence : Math.pow(2, -iteration);
      remainingInfluence -= influence;
      score3 += this._memory[index2].score * influence;
      if (index2 === this._front) {
        break;
      }
      index2 = (this._capacity + index2 - 1) % this._capacity;
      iteration++;
    } while (true);
    return score3 <= 0.5;
  }
  acceptStandardWheelEvent(e4) {
    if (isChrome2) {
      const targetWindow = getWindow(e4.browserEvent);
      const pageZoomFactor = getZoomFactor(targetWindow);
      this.accept(Date.now(), e4.deltaX * pageZoomFactor, e4.deltaY * pageZoomFactor);
    } else {
      this.accept(Date.now(), e4.deltaX, e4.deltaY);
    }
  }
  accept(timestamp, deltaX, deltaY) {
    let previousItem = null;
    const item = new MouseWheelClassifierItem(timestamp, deltaX, deltaY);
    if (this._front === -1 && this._rear === -1) {
      this._memory[0] = item;
      this._front = 0;
      this._rear = 0;
    } else {
      previousItem = this._memory[this._rear];
      this._rear = (this._rear + 1) % this._capacity;
      if (this._rear === this._front) {
        this._front = (this._front + 1) % this._capacity;
      }
      this._memory[this._rear] = item;
    }
    item.score = this._computeScore(item, previousItem);
  }
  /**
   * A score between 0 and 1 for `item`.
   *  - a score towards 0 indicates that the source appears to be a physical mouse wheel
   *  - a score towards 1 indicates that the source appears to be a touchpad or magic mouse, etc.
   */
  _computeScore(item, previousItem) {
    if (Math.abs(item.deltaX) > 0 && Math.abs(item.deltaY) > 0) {
      return 1;
    }
    let score3 = 0.5;
    if (!this._isAlmostInt(item.deltaX) || !this._isAlmostInt(item.deltaY)) {
      score3 += 0.25;
    }
    if (previousItem) {
      const absDeltaX = Math.abs(item.deltaX);
      const absDeltaY = Math.abs(item.deltaY);
      const absPreviousDeltaX = Math.abs(previousItem.deltaX);
      const absPreviousDeltaY = Math.abs(previousItem.deltaY);
      const minDeltaX = Math.max(Math.min(absDeltaX, absPreviousDeltaX), 1);
      const minDeltaY = Math.max(Math.min(absDeltaY, absPreviousDeltaY), 1);
      const maxDeltaX = Math.max(absDeltaX, absPreviousDeltaX);
      const maxDeltaY = Math.max(absDeltaY, absPreviousDeltaY);
      const isSameModulo = maxDeltaX % minDeltaX === 0 && maxDeltaY % minDeltaY === 0;
      if (isSameModulo) {
        score3 -= 0.5;
      }
    }
    return Math.min(Math.max(score3, 0), 1);
  }
  _isAlmostInt(value2) {
    const epsilon = Number.EPSILON * 100;
    const delta2 = Math.abs(Math.round(value2) - value2);
    return delta2 < 0.01 + epsilon;
  }
};

var AbstractScrollableElement = class extends Widget {
  constructor(element, options3, scrollable) {
    super();
    this._inertialTimeout = null;
    this._inertialSpeed = { X: 0, Y: 0 };
    this._onScroll = this._register(new Emitter());
    this._onWillScroll = this._register(new Emitter());
    element.style.overflow = "hidden";
    this._options = resolveOptions(options3);
    this._scrollable = scrollable;
    this._register(this._scrollable.onScroll((e4) => {
      this._onWillScroll.fire(e4);
      this._onDidScroll(e4);
      this._onScroll.fire(e4);
    }));
    const scrollbarHost = {
      onMouseWheel: (mouseWheelEvent) => this._onMouseWheel(mouseWheelEvent),
      onDragStart: () => this._onDragStart(),
      onDragEnd: () => this._onDragEnd()
    };
    this._verticalScrollbar = this._register(new VerticalScrollbar(this._scrollable, this._options, scrollbarHost));
    this._horizontalScrollbar = this._register(new HorizontalScrollbar(this._scrollable, this._options, scrollbarHost));
    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-scrollable-element " + this._options.className;
    this._domNode.setAttribute("role", "presentation");
    this._domNode.style.position = "relative";
    this._domNode.style.overflow = "hidden";
    this._domNode.appendChild(element);
    this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode);
    this._domNode.appendChild(this._verticalScrollbar.domNode.domNode);
    if (this._options.useShadows) {
      this._leftShadowDomNode = createFastDomNode(document.createElement("div"));
      this._leftShadowDomNode.setClassName("shadow");
      this._domNode.appendChild(this._leftShadowDomNode.domNode);
      this._topShadowDomNode = createFastDomNode(document.createElement("div"));
      this._topShadowDomNode.setClassName("shadow");
      this._domNode.appendChild(this._topShadowDomNode.domNode);
      this._topLeftShadowDomNode = createFastDomNode(document.createElement("div"));
      this._topLeftShadowDomNode.setClassName("shadow");
      this._domNode.appendChild(this._topLeftShadowDomNode.domNode);
    } else {
      this._leftShadowDomNode = null;
      this._topShadowDomNode = null;
      this._topLeftShadowDomNode = null;
    }
    this._listenOnDomNode = this._options.listenOnDomNode || this._domNode;
    this._mouseWheelToDispose = [];
    this._setListeningToMouseWheel(this._options.handleMouseWheel);
    this.onmouseover(this._listenOnDomNode, (e4) => this._onMouseOver(e4));
    this.onmouseleave(this._listenOnDomNode, (e4) => this._onMouseLeave(e4));
    this._hideTimeout = this._register(new TimeoutTimer());
    this._isDragging = false;
    this._mouseIsOver = false;
    this._shouldRender = true;
    this._revealOnScroll = true;
    const hSizeExplicit = typeof options3.horizontalScrollbarSize !== "undefined";
    const vSizeExplicit = typeof options3.verticalScrollbarSize !== "undefined";
    if (!hSizeExplicit || !vSizeExplicit) {
      this._register(onDidChangeDefaultScrollbarSize((newSize) => {
        this.updateOptions({
          ...!hSizeExplicit ? { horizontalScrollbarSize: newSize } : {},
          ...!vSizeExplicit ? { verticalScrollbarSize: newSize } : {}
        });
      }));
    }
  }
  get onScroll() {
    return this._onScroll.event;
  }
  get onWillScroll() {
    return this._onWillScroll.event;
  }
  get options() {
    return this._options;
  }
  dispose() {
    this._mouseWheelToDispose = dispose(this._mouseWheelToDispose);
    if (this._inertialTimeout) {
      this._inertialTimeout.dispose();
      this._inertialTimeout = null;
    }
    super.dispose();
  }
  /**
   * Get the generated 'scrollable' dom node
   */
  getDomNode() {
    return this._domNode;
  }
  getOverviewRulerLayoutInfo() {
    return {
      parent: this._domNode,
      insertBefore: this._verticalScrollbar.domNode.domNode
    };
  }
  /**
   * Delegate a pointer down event to the vertical scrollbar.
   * This is to help with clicking somewhere else and having the scrollbar react.
   */
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this._verticalScrollbar.delegatePointerDown(browserEvent);
  }
  getScrollDimensions() {
    return this._scrollable.getScrollDimensions();
  }
  setScrollDimensions(dimensions) {
    this._scrollable.setScrollDimensions(dimensions, false);
  }
  /**
   * Update the class name of the scrollable element.
   */
  updateClassName(newClassName) {
    this._options.className = newClassName;
    if (isMacintosh) {
      this._options.className += " mac";
    }
    this._domNode.className = "monaco-scrollable-element " + this._options.className;
  }
  /**
   * Update configuration options for the scrollbar.
   */
  updateOptions(newOptions) {
    if (typeof newOptions.handleMouseWheel !== "undefined") {
      this._options.handleMouseWheel = newOptions.handleMouseWheel;
      this._setListeningToMouseWheel(this._options.handleMouseWheel);
    }
    if (typeof newOptions.mouseWheelScrollSensitivity !== "undefined") {
      this._options.mouseWheelScrollSensitivity = newOptions.mouseWheelScrollSensitivity;
    }
    if (typeof newOptions.fastScrollSensitivity !== "undefined") {
      this._options.fastScrollSensitivity = newOptions.fastScrollSensitivity;
    }
    if (typeof newOptions.scrollPredominantAxis !== "undefined") {
      this._options.scrollPredominantAxis = newOptions.scrollPredominantAxis;
    }
    if (typeof newOptions.horizontal !== "undefined") {
      this._options.horizontal = newOptions.horizontal;
    }
    if (typeof newOptions.vertical !== "undefined") {
      this._options.vertical = newOptions.vertical;
    }
    if (typeof newOptions.horizontalScrollbarSize !== "undefined") {
      this._options.horizontalScrollbarSize = newOptions.horizontalScrollbarSize;
    }
    if (typeof newOptions.verticalScrollbarSize !== "undefined") {
      this._options.verticalScrollbarSize = newOptions.verticalScrollbarSize;
    }
    if (typeof newOptions.scrollByPage !== "undefined") {
      this._options.scrollByPage = newOptions.scrollByPage;
    }
    this._horizontalScrollbar.updateOptions(this._options);
    this._verticalScrollbar.updateOptions(this._options);
    if (!this._options.lazyRender) {
      this._render();
    }
  }
  setRevealOnScroll(value2) {
    this._revealOnScroll = value2;
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this._onMouseWheel(new StandardWheelEvent(browserEvent));
  }
  async _periodicSync() {
    let scheduleAgain = false;
    if (this._inertialSpeed.X !== 0 || this._inertialSpeed.Y !== 0) {
      this._scrollable.setScrollPositionNow({
        scrollTop: this._scrollable.getCurrentScrollPosition().scrollTop - this._inertialSpeed.Y * 100,
        scrollLeft: this._scrollable.getCurrentScrollPosition().scrollLeft - this._inertialSpeed.X * 100
      });
      this._inertialSpeed.X *= 0.9;
      this._inertialSpeed.Y *= 0.9;
      if (Math.abs(this._inertialSpeed.X) < 0.01) {
        this._inertialSpeed.X = 0;
      }
      if (Math.abs(this._inertialSpeed.Y) < 0.01) {
        this._inertialSpeed.Y = 0;
      }
      scheduleAgain = this._inertialSpeed.X !== 0 || this._inertialSpeed.Y !== 0;
    }
    if (scheduleAgain) {
      if (!this._inertialTimeout) {
        this._inertialTimeout = new TimeoutTimer();
      }
      this._inertialTimeout.cancelAndSet(() => this._periodicSync(), 1e3 / 60);
    } else {
      this._inertialTimeout?.dispose();
      this._inertialTimeout = null;
    }
  }
  // -------------------- mouse wheel scrolling --------------------
  _setListeningToMouseWheel(shouldListen) {
    const isListening = this._mouseWheelToDispose.length > 0;
    if (isListening === shouldListen) {
      return;
    }
    this._mouseWheelToDispose = dispose(this._mouseWheelToDispose);
    if (shouldListen) {
      const onMouseWheel = (browserEvent) => {
        this._onMouseWheel(new StandardWheelEvent(browserEvent));
      };
      this._mouseWheelToDispose.push(addDisposableListener(this._listenOnDomNode, EventType.MOUSE_WHEEL, onMouseWheel, { passive: false }));
    }
  }
  _onMouseWheel(e4) {
    if (e4.browserEvent?.defaultPrevented) {
      return;
    }
    const classifier = MouseWheelClassifier.INSTANCE;
    if (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED) {
      classifier.acceptStandardWheelEvent(e4);
    }
    let didScroll = false;
    if (e4.deltaY || e4.deltaX) {
      let deltaY = e4.deltaY * this._options.mouseWheelScrollSensitivity;
      let deltaX = e4.deltaX * this._options.mouseWheelScrollSensitivity;
      if (this._options.scrollPredominantAxis) {
        if (this._options.scrollYToX && deltaX + deltaY === 0) {
          deltaX = deltaY = 0;
        } else if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          deltaX = 0;
        } else {
          deltaY = 0;
        }
      }
      if (this._options.flipAxes) {
        [deltaY, deltaX] = [deltaX, deltaY];
      }
      const shiftConvert = !isMacintosh && e4.browserEvent && e4.browserEvent.shiftKey;
      if ((this._options.scrollYToX || shiftConvert) && !deltaX) {
        deltaX = deltaY;
        deltaY = 0;
      }
      if (e4.browserEvent && e4.browserEvent.altKey) {
        deltaX = deltaX * this._options.fastScrollSensitivity;
        deltaY = deltaY * this._options.fastScrollSensitivity;
      }
      const futureScrollPosition = this._scrollable.getFutureScrollPosition();
      let desiredScrollPosition = {};
      if (deltaY) {
        const deltaScrollTop = SCROLL_WHEEL_SENSITIVITY * deltaY;
        const desiredScrollTop = futureScrollPosition.scrollTop - (deltaScrollTop < 0 ? Math.floor(deltaScrollTop) : Math.ceil(deltaScrollTop));
        this._verticalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollTop);
      }
      if (deltaX) {
        const deltaScrollLeft = SCROLL_WHEEL_SENSITIVITY * deltaX;
        const desiredScrollLeft = futureScrollPosition.scrollLeft - (deltaScrollLeft < 0 ? Math.floor(deltaScrollLeft) : Math.ceil(deltaScrollLeft));
        this._horizontalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollLeft);
      }
      desiredScrollPosition = this._scrollable.validateScrollPosition(desiredScrollPosition);
      if (this._options.inertialScroll && (deltaX || deltaY) && !classifier.isPhysicalMouseWheel()) {
        let startPeriodic = false;
        if (this._inertialSpeed.X === 0 && this._inertialSpeed.Y === 0) {
          startPeriodic = true;
        }
        this._inertialSpeed.Y = (deltaY < 0 ? -1 : 1) * Math.abs(deltaY) ** 1.02;
        this._inertialSpeed.X = (deltaX < 0 ? -1 : 1) * Math.abs(deltaX) ** 1.02;
        if (startPeriodic) {
          this._periodicSync();
        }
      }
      if (futureScrollPosition.scrollLeft !== desiredScrollPosition.scrollLeft || futureScrollPosition.scrollTop !== desiredScrollPosition.scrollTop) {
        const canPerformSmoothScroll = SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED && this._options.mouseWheelSmoothScroll && classifier.isPhysicalMouseWheel();
        if (canPerformSmoothScroll) {
          this._scrollable.setScrollPositionSmooth(desiredScrollPosition);
        } else {
          this._scrollable.setScrollPositionNow(desiredScrollPosition);
        }
        didScroll = true;
      }
    }
    let consumeMouseWheel = didScroll;
    if (!consumeMouseWheel && this._options.alwaysConsumeMouseWheel) {
      consumeMouseWheel = true;
    }
    if (!consumeMouseWheel && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded())) {
      consumeMouseWheel = true;
    }
    if (consumeMouseWheel) {
      e4.preventDefault();
      e4.stopPropagation();
    }
  }
  _onDidScroll(e4) {
    this._shouldRender = this._horizontalScrollbar.onDidScroll(e4) || this._shouldRender;
    this._shouldRender = this._verticalScrollbar.onDidScroll(e4) || this._shouldRender;
    if (this._options.useShadows) {
      this._shouldRender = true;
    }
    if (this._revealOnScroll) {
      this._reveal();
    }
    if (!this._options.lazyRender) {
      this._render();
    }
  }
  /**
   * Render / mutate the DOM now.
   * Should be used together with the ctor option `lazyRender`.
   */
  renderNow() {
    if (!this._options.lazyRender) {
      throw new Error("Please use `lazyRender` together with `renderNow`!");
    }
    this._render();
  }
  _render() {
    if (!this._shouldRender) {
      return;
    }
    this._shouldRender = false;
    this._horizontalScrollbar.render();
    this._verticalScrollbar.render();
    if (this._options.useShadows) {
      const scrollState = this._scrollable.getCurrentScrollPosition();
      const enableTop = scrollState.scrollTop > 0;
      const enableLeft = scrollState.scrollLeft > 0;
      const leftClassName = enableLeft ? " left" : "";
      const topClassName = enableTop ? " top" : "";
      const topLeftClassName = enableLeft || enableTop ? " top-left-corner" : "";
      this._leftShadowDomNode.setClassName(`shadow${leftClassName}`);
      this._topShadowDomNode.setClassName(`shadow${topClassName}`);
      this._topLeftShadowDomNode.setClassName(`shadow${topLeftClassName}${topClassName}${leftClassName}`);
    }
  }
  // -------------------- fade in / fade out --------------------
  _onDragStart() {
    this._isDragging = true;
    this._reveal();
  }
  _onDragEnd() {
    this._isDragging = false;
    this._hide();
  }
  _onMouseLeave(e4) {
    this._mouseIsOver = false;
    this._hide();
  }
  _onMouseOver(e4) {
    this._mouseIsOver = true;
    this._reveal();
  }
  _reveal() {
    this._verticalScrollbar.beginReveal();
    this._horizontalScrollbar.beginReveal();
    this._scheduleHide();
  }
  _hide() {
    if (!this._mouseIsOver && !this._isDragging) {
      this._verticalScrollbar.beginHide();
      this._horizontalScrollbar.beginHide();
    }
  }
  _scheduleHide() {
    if (!this._mouseIsOver && !this._isDragging) {
      this._hideTimeout.cancelAndSet(() => this._hide(), HIDE_TIMEOUT);
    }
  }
};

var ScrollableElement = class extends AbstractScrollableElement {
  constructor(element, options3) {
    options3 = options3 || {};
    options3.mouseWheelSmoothScroll = false;
    const scrollable = new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration: 0,
      scheduleAtNextAnimationFrame: (callback) => scheduleAtNextAnimationFrame(getWindow(element), callback)
    });
    super(element, options3, scrollable);
    this._register(scrollable);
  }
  setScrollPosition(update) {
    this._scrollable.setScrollPositionNow(update);
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
};

var SmoothScrollableElement = class extends AbstractScrollableElement {
  constructor(element, options3, scrollable) {
    super(element, options3, scrollable);
  }
  setScrollPosition(update) {
    if (update.reuseAnimation) {
      this._scrollable.setScrollPositionSmooth(update, update.reuseAnimation);
    } else {
      this._scrollable.setScrollPositionNow(update);
    }
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
};

var DomScrollableElement = class extends AbstractScrollableElement {
  constructor(element, options3) {
    options3 = options3 || {};
    options3.mouseWheelSmoothScroll = false;
    const scrollable = new Scrollable({
      forceIntegerValues: false,
      // See https://github.com/microsoft/vscode/issues/139877
      smoothScrollDuration: 0,
      scheduleAtNextAnimationFrame: (callback) => scheduleAtNextAnimationFrame(getWindow(element), callback)
    });
    super(element, options3, scrollable);
    this._register(scrollable);
    this._element = element;
    this._register(this.onScroll((e4) => {
      if (e4.scrollTopChanged) {
        this._element.scrollTop = e4.scrollTop;
      }
      if (e4.scrollLeftChanged) {
        this._element.scrollLeft = e4.scrollLeft;
      }
    }));
    this.scanDomNode();
  }
  setScrollPosition(update) {
    this._scrollable.setScrollPositionNow(update);
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
  scanDomNode() {
    this.setScrollDimensions({
      width: this._element.clientWidth,
      scrollWidth: this._element.scrollWidth,
      height: this._element.clientHeight,
      scrollHeight: this._element.scrollHeight
    });
    this.setScrollPosition({
      scrollLeft: this._element.scrollLeft,
      scrollTop: this._element.scrollTop
    });
  }
};

function resolveOptions(opts) {
  const result = {
    lazyRender: typeof opts.lazyRender !== "undefined" ? opts.lazyRender : false,
    className: typeof opts.className !== "undefined" ? opts.className : "",
    useShadows: typeof opts.useShadows !== "undefined" ? opts.useShadows : true,
    handleMouseWheel: typeof opts.handleMouseWheel !== "undefined" ? opts.handleMouseWheel : true,
    flipAxes: typeof opts.flipAxes !== "undefined" ? opts.flipAxes : false,
    consumeMouseWheelIfScrollbarIsNeeded: typeof opts.consumeMouseWheelIfScrollbarIsNeeded !== "undefined" ? opts.consumeMouseWheelIfScrollbarIsNeeded : false,
    alwaysConsumeMouseWheel: typeof opts.alwaysConsumeMouseWheel !== "undefined" ? opts.alwaysConsumeMouseWheel : false,
    scrollYToX: typeof opts.scrollYToX !== "undefined" ? opts.scrollYToX : false,
    mouseWheelScrollSensitivity: typeof opts.mouseWheelScrollSensitivity !== "undefined" ? opts.mouseWheelScrollSensitivity : 1,
    fastScrollSensitivity: typeof opts.fastScrollSensitivity !== "undefined" ? opts.fastScrollSensitivity : 5,
    scrollPredominantAxis: typeof opts.scrollPredominantAxis !== "undefined" ? opts.scrollPredominantAxis : true,
    mouseWheelSmoothScroll: typeof opts.mouseWheelSmoothScroll !== "undefined" ? opts.mouseWheelSmoothScroll : true,
    inertialScroll: typeof opts.inertialScroll !== "undefined" ? opts.inertialScroll : false,
    arrowSize: typeof opts.arrowSize !== "undefined" ? opts.arrowSize : 11,
    listenOnDomNode: typeof opts.listenOnDomNode !== "undefined" ? opts.listenOnDomNode : null,
    horizontal: typeof opts.horizontal !== "undefined" ? opts.horizontal : 1 /* Auto */,
    horizontalScrollbarSize: typeof opts.horizontalScrollbarSize !== "undefined" ? opts.horizontalScrollbarSize : globalDefaultScrollbarSize,
    horizontalSliderSize: typeof opts.horizontalSliderSize !== "undefined" ? opts.horizontalSliderSize : 0,
    horizontalHasArrows: typeof opts.horizontalHasArrows !== "undefined" ? opts.horizontalHasArrows : false,
    vertical: typeof opts.vertical !== "undefined" ? opts.vertical : 1 /* Auto */,
    verticalScrollbarSize: typeof opts.verticalScrollbarSize !== "undefined" ? opts.verticalScrollbarSize : globalDefaultScrollbarSize,
    verticalHasArrows: typeof opts.verticalHasArrows !== "undefined" ? opts.verticalHasArrows : false,
    verticalSliderSize: typeof opts.verticalSliderSize !== "undefined" ? opts.verticalSliderSize : 0,
    scrollByPage: typeof opts.scrollByPage !== "undefined" ? opts.scrollByPage : false
  };
  result.horizontalSliderSize = typeof opts.horizontalSliderSize !== "undefined" ? opts.horizontalSliderSize : result.horizontalScrollbarSize;
  result.verticalSliderSize = typeof opts.verticalSliderSize !== "undefined" ? opts.verticalSliderSize : result.verticalScrollbarSize;
  if (isMacintosh) {
    result.className += " mac";
  }
  return result;
}
export { resolveOptions, HIDE_TIMEOUT, SCROLL_WHEEL_SENSITIVITY, SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED, DEFAULT_SCROLLBAR_SIZE, globalDefaultScrollbarSize, _onDidChangeDefaultScrollbarSizeEmitter, onDidChangeDefaultScrollbarSize, MouseWheelClassifierItem, MouseWheelClassifier, AbstractScrollableElement, ScrollableElement, SmoothScrollableElement, DomScrollableElement };
