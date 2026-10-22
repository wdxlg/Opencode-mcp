// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/sash/sash.ts
import { Emitter } from "./module-0017.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { $, EventHelper, addDisposableListener, append, getWindow, isHTMLElement } from "./module-0075.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Delayer } from "./module-0036.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { createStyleSheet } from "./module-0224.mjs";


// src/vs/base/browser/ui/sash/sash.ts
var DEBUG = false;

var globalSize = 4;

var onDidChangeGlobalSize = new Emitter();

function setGlobalSashSize(size3) {
  globalSize = size3;
  onDidChangeGlobalSize.fire(size3);
}

var globalHoverDelay = 300;

var onDidChangeHoverDelay = new Emitter();

function setGlobalHoverDelay(size3) {
  globalHoverDelay = size3;
  onDidChangeHoverDelay.fire(size3);
}

var MouseEventFactory = class {
  constructor(el) {
    this.el = el;
    this.disposables = new DisposableStore();
  }
  get onPointerMove() {
    return this.disposables.add(new DomEmitter(getWindow(this.el), "mousemove")).event;
  }
  get onPointerUp() {
    return this.disposables.add(new DomEmitter(getWindow(this.el), "mouseup")).event;
  }
  dispose() {
    this.disposables.dispose();
  }
};

__decorateClass([
  memoize
], MouseEventFactory.prototype, "onPointerMove", 1);

__decorateClass([
  memoize
], MouseEventFactory.prototype, "onPointerUp", 1);

var GestureEventFactory = class {
  constructor(el) {
    this.el = el;
    this.disposables = new DisposableStore();
  }
  get onPointerMove() {
    return this.disposables.add(new DomEmitter(this.el, EventType2.Change)).event;
  }
  get onPointerUp() {
    return this.disposables.add(new DomEmitter(this.el, EventType2.End)).event;
  }
  dispose() {
    this.disposables.dispose();
  }
};

__decorateClass([
  memoize
], GestureEventFactory.prototype, "onPointerMove", 1);

__decorateClass([
  memoize
], GestureEventFactory.prototype, "onPointerUp", 1);

var OrthogonalPointerEventFactory = class {
  constructor(factory) {
    this.factory = factory;
  }
  get onPointerMove() {
    return this.factory.onPointerMove;
  }
  get onPointerUp() {
    return this.factory.onPointerUp;
  }
  dispose() {
  }
};

__decorateClass([
  memoize
], OrthogonalPointerEventFactory.prototype, "onPointerMove", 1);

__decorateClass([
  memoize
], OrthogonalPointerEventFactory.prototype, "onPointerUp", 1);

var PointerEventsDisabledCssClass = "pointer-events-disabled";

var Sash = class _Sash extends Disposable {
  constructor(container3, layoutProvider, options3) {
    super();
    this.hoverDelay = globalHoverDelay;
    this.hoverDelayer = this._register(new Delayer(this.hoverDelay));
    this._state = 3 /* Enabled */;
    this.classNameLeases = /* @__PURE__ */ new Map();
    this.onDidEnablementChange = this._register(new Emitter());
    this._onDidStart = this._register(new Emitter());
    this._onDidChange = this._register(new Emitter());
    this._onDidReset = this._register(new Emitter());
    this._onDidEnd = this._register(new Emitter());
    this.orthogonalStartSashDisposables = this._register(new DisposableStore());
    this.orthogonalStartDragHandleDisposables = this._register(new DisposableStore());
    this.orthogonalEndSashDisposables = this._register(new DisposableStore());
    this.orthogonalEndDragHandleDisposables = this._register(new DisposableStore());
    /**
     * A linked sash will be forwarded the same user interactions and events
     * so it moves exactly the same way as this sash.
     *
     * Useful in 2x2 grids. Not meant for widespread usage.
     */
    this.linkedSash = void 0;
    this.el = append(container3, $(".monaco-sash"));
    if (options3.orthogonalEdge) {
      this.el.classList.add(`orthogonal-edge-${options3.orthogonalEdge}`);
    }
    if (isMacintosh) {
      this.el.classList.add("mac");
    }
    this._register(addDisposableListener(this.el, "mousedown", (e) => this.onPointerStart(e, new MouseEventFactory(container3))));
    this._register(addDisposableListener(this.el, "dblclick", (e) => this.onPointerDoublePress(e)));
    this._register(addDisposableListener(this.el, "mouseenter", () => _Sash.onMouseEnter(this)));
    this._register(addDisposableListener(this.el, "mouseleave", () => _Sash.onMouseLeave(this)));
    this._register(Gesture.addTarget(this.el));
    this._register(addDisposableListener(this.el, EventType2.Start, (e) => this.onPointerStart(e, new GestureEventFactory(this.el))));
    let doubleTapTimeout = void 0;
    this._register(addDisposableListener(this.el, EventType2.Tap, (event) => {
      if (doubleTapTimeout) {
        clearTimeout(doubleTapTimeout);
        doubleTapTimeout = void 0;
        this.onPointerDoublePress(event);
        return;
      }
      clearTimeout(doubleTapTimeout);
      doubleTapTimeout = setTimeout(() => doubleTapTimeout = void 0, 250);
    }));
    if (typeof options3.size === "number") {
      this.size = options3.size;
      if (options3.orientation === 0 /* VERTICAL */) {
        this.el.style.width = `${this.size}px`;
      } else {
        this.el.style.height = `${this.size}px`;
      }
    } else {
      this.size = globalSize;
      this._register(onDidChangeGlobalSize.event((size3) => {
        this.size = size3;
        this.layout();
      }));
    }
    this._register(onDidChangeHoverDelay.event((delay) => this.hoverDelay = delay));
    this.layoutProvider = layoutProvider;
    this.orthogonalStartSash = options3.orthogonalStartSash;
    this.orthogonalEndSash = options3.orthogonalEndSash;
    this.orientation = options3.orientation || 0 /* VERTICAL */;
    if (this.orientation === 1 /* HORIZONTAL */) {
      this.el.classList.add("horizontal");
      this.el.classList.remove("vertical");
    } else {
      this.el.classList.remove("horizontal");
      this.el.classList.add("vertical");
    }
    this.el.classList.toggle("debug", DEBUG);
    this.layout();
  }
  get state() {
    return this._state;
  }
  get orthogonalStartSash() {
    return this._orthogonalStartSash;
  }
  get orthogonalEndSash() {
    return this._orthogonalEndSash;
  }
  /**
   * The state of a sash defines whether it can be interacted with by the user
   * as well as what mouse cursor to use, when hovered.
   */
  set state(state) {
    if (this._state === state) {
      return;
    }
    this.el.classList.toggle("disabled", state === 0 /* Disabled */);
    this.el.classList.toggle("minimum", state === 1 /* AtMinimum */);
    this.el.classList.toggle("maximum", state === 2 /* AtMaximum */);
    this._state = state;
    this.onDidEnablementChange.fire(state);
  }
  /**
   * An event which fires whenever the user starts dragging this sash.
   */
  get onDidStart() {
    return this._onDidStart.event;
  }
  /**
   * An event which fires whenever the user moves the mouse while
   * dragging this sash.
   */
  get onDidChange() {
    return this._onDidChange.event;
  }
  /**
   * An event which fires whenever the user double clicks this sash.
   */
  get onDidReset() {
    return this._onDidReset.event;
  }
  /** Adds a CSS class for the lifetime of the returned disposable. */
  addClass(className2) {
    const existingLease = this.classNameLeases.get(className2);
    if (existingLease) {
      existingLease.count++;
    } else {
      this.classNameLeases.set(className2, { count: 1, removeOnRelease: !this.el.classList.contains(className2) });
      this.el.classList.add(className2);
    }
    return toDisposable(() => {
      const lease = this.classNameLeases.get(className2);
      if (lease?.count === 1) {
        this.classNameLeases.delete(className2);
        if (lease.removeOnRelease) {
          this.el.classList.remove(className2);
        }
      } else if (lease) {
        lease.count--;
      }
    });
  }
  /**
   * An event which fires whenever the user stops dragging this sash.
   */
  get onDidEnd() {
    return this._onDidEnd.event;
  }
  /**
   * A reference to another sash, perpendicular to this one, which
   * aligns at the start of this one. A corner sash will be created
   * automatically at that location.
   *
   * The start of a horizontal sash is its left-most position.
   * The start of a vertical sash is its top-most position.
   */
  set orthogonalStartSash(sash) {
    if (this._orthogonalStartSash === sash) {
      return;
    }
    this.orthogonalStartDragHandleDisposables.clear();
    this.orthogonalStartSashDisposables.clear();
    if (sash) {
      const onChange = (state) => {
        this.orthogonalStartDragHandleDisposables.clear();
        if (state !== 0 /* Disabled */) {
          this._orthogonalStartDragHandle = append(this.el, $(".orthogonal-drag-handle.start"));
          this.orthogonalStartDragHandleDisposables.add(toDisposable(() => this._orthogonalStartDragHandle.remove()));
          this.orthogonalStartDragHandleDisposables.add(addDisposableListener(this._orthogonalStartDragHandle, "mouseenter", () => _Sash.onMouseEnter(sash)));
          this.orthogonalStartDragHandleDisposables.add(addDisposableListener(this._orthogonalStartDragHandle, "mouseleave", () => _Sash.onMouseLeave(sash)));
        }
      };
      this.orthogonalStartSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
      onChange(sash.state);
    }
    this._orthogonalStartSash = sash;
  }
  /**
   * A reference to another sash, perpendicular to this one, which
   * aligns at the end of this one. A corner sash will be created
   * automatically at that location.
   *
   * The end of a horizontal sash is its right-most position.
   * The end of a vertical sash is its bottom-most position.
   */
  set orthogonalEndSash(sash) {
    if (this._orthogonalEndSash === sash) {
      return;
    }
    this.orthogonalEndDragHandleDisposables.clear();
    this.orthogonalEndSashDisposables.clear();
    if (sash) {
      const onChange = (state) => {
        this.orthogonalEndDragHandleDisposables.clear();
        if (state !== 0 /* Disabled */) {
          this._orthogonalEndDragHandle = append(this.el, $(".orthogonal-drag-handle.end"));
          this.orthogonalEndDragHandleDisposables.add(toDisposable(() => this._orthogonalEndDragHandle.remove()));
          this.orthogonalEndDragHandleDisposables.add(addDisposableListener(this._orthogonalEndDragHandle, "mouseenter", () => _Sash.onMouseEnter(sash)));
          this.orthogonalEndDragHandleDisposables.add(addDisposableListener(this._orthogonalEndDragHandle, "mouseleave", () => _Sash.onMouseLeave(sash)));
        }
      };
      this.orthogonalEndSashDisposables.add(sash.onDidEnablementChange.event(onChange, this));
      onChange(sash.state);
    }
    this._orthogonalEndSash = sash;
  }
  onPointerStart(event, pointerEventFactory) {
    EventHelper.stop(event);
    let isMultisashResize = false;
    if (!event.__orthogonalSashEvent) {
      const orthogonalSash = this.getOrthogonalSash(event);
      if (orthogonalSash) {
        isMultisashResize = true;
        event.__orthogonalSashEvent = true;
        orthogonalSash.onPointerStart(event, new OrthogonalPointerEventFactory(pointerEventFactory));
      }
    }
    if (this.linkedSash && !event.__linkedSashEvent) {
      event.__linkedSashEvent = true;
      this.linkedSash.onPointerStart(event, new OrthogonalPointerEventFactory(pointerEventFactory));
    }
    if (!this.state) {
      return;
    }
    const iframes = this.el.ownerDocument.getElementsByTagName("iframe");
    for (const iframe of iframes) {
      iframe.classList.add(PointerEventsDisabledCssClass);
    }
    const startX = event.pageX;
    const startY = event.pageY;
    const altKey = event.altKey;
    const startEvent = { startX, currentX: startX, startY, currentY: startY, altKey };
    this.el.classList.add("active");
    this._onDidStart.fire(startEvent);
    const style = createStyleSheet(this.el);
    const updateStyle = () => {
      let cursor = "";
      if (isMultisashResize) {
        cursor = "all-scroll";
      } else if (this.orientation === 1 /* HORIZONTAL */) {
        if (this.state === 1 /* AtMinimum */) {
          cursor = "s-resize";
        } else if (this.state === 2 /* AtMaximum */) {
          cursor = "n-resize";
        } else {
          cursor = isMacintosh ? "row-resize" : "ns-resize";
        }
      } else {
        if (this.state === 1 /* AtMinimum */) {
          cursor = "e-resize";
        } else if (this.state === 2 /* AtMaximum */) {
          cursor = "w-resize";
        } else {
          cursor = isMacintosh ? "col-resize" : "ew-resize";
        }
      }
      style.textContent = `* { cursor: ${cursor} !important; }`;
    };
    const disposables = new DisposableStore();
    updateStyle();
    if (!isMultisashResize) {
      this.onDidEnablementChange.event(updateStyle, null, disposables);
    }
    const onPointerMove = (e) => {
      EventHelper.stop(e, false);
      const event2 = { startX, currentX: e.pageX, startY, currentY: e.pageY, altKey };
      this._onDidChange.fire(event2);
    };
    const onPointerUp = (e) => {
      EventHelper.stop(e, false);
      style.remove();
      this.el.classList.remove("active");
      this._onDidEnd.fire();
      disposables.dispose();
      for (const iframe of iframes) {
        iframe.classList.remove(PointerEventsDisabledCssClass);
      }
    };
    pointerEventFactory.onPointerMove(onPointerMove, null, disposables);
    pointerEventFactory.onPointerUp(onPointerUp, null, disposables);
    disposables.add(pointerEventFactory);
  }
  onPointerDoublePress(e) {
    const orthogonalSash = this.getOrthogonalSash(e);
    if (orthogonalSash) {
      orthogonalSash._onDidReset.fire();
    }
    if (this.linkedSash) {
      this.linkedSash._onDidReset.fire();
    }
    this._onDidReset.fire();
  }
  static onMouseEnter(sash, fromLinkedSash = false) {
    if (sash.el.classList.contains("active")) {
      sash.hoverDelayer.cancel();
      sash.el.classList.add("hover");
    } else {
      sash.hoverDelayer.trigger(() => sash.el.classList.add("hover"), sash.hoverDelay).then(void 0, () => {
      });
    }
    if (!fromLinkedSash && sash.linkedSash) {
      _Sash.onMouseEnter(sash.linkedSash, true);
    }
  }
  static onMouseLeave(sash, fromLinkedSash = false) {
    sash.hoverDelayer.cancel();
    sash.el.classList.remove("hover");
    if (!fromLinkedSash && sash.linkedSash) {
      _Sash.onMouseLeave(sash.linkedSash, true);
    }
  }
  /**
   * Forcefully stop any user interactions with this sash.
   * Useful when hiding a parent component, while the user is still
   * interacting with the sash.
   */
  clearSashHoverState() {
    _Sash.onMouseLeave(this);
  }
  /**
   * Layout the sash. The sash will size and position itself
   * based on its provided {@link ISashLayoutProvider layout provider}.
   */
  layout() {
    if (this.orientation === 0 /* VERTICAL */) {
      const verticalProvider = this.layoutProvider;
      this.el.style.left = verticalProvider.getVerticalSashLeft(this) - this.size / 2 + "px";
      if (verticalProvider.getVerticalSashTop) {
        this.el.style.top = verticalProvider.getVerticalSashTop(this) + "px";
      }
      if (verticalProvider.getVerticalSashHeight) {
        this.el.style.height = verticalProvider.getVerticalSashHeight(this) + "px";
      }
    } else {
      const horizontalProvider = this.layoutProvider;
      this.el.style.top = horizontalProvider.getHorizontalSashTop(this) - this.size / 2 + "px";
      if (horizontalProvider.getHorizontalSashLeft) {
        this.el.style.left = horizontalProvider.getHorizontalSashLeft(this) + "px";
      }
      if (horizontalProvider.getHorizontalSashWidth) {
        this.el.style.width = horizontalProvider.getHorizontalSashWidth(this) + "px";
      }
    }
  }
  getOrthogonalSash(e) {
    const target = e.initialTarget ?? e.target;
    if (!target || !isHTMLElement(target)) {
      return void 0;
    }
    if (target.classList.contains("orthogonal-drag-handle")) {
      return target.classList.contains("start") ? this.orthogonalStartSash : this.orthogonalEndSash;
    }
    return void 0;
  }
  dispose() {
    super.dispose();
    this.el.remove();
  }
};
export { setGlobalSashSize, setGlobalHoverDelay, DEBUG, globalSize, onDidChangeGlobalSize, globalHoverDelay, onDidChangeHoverDelay, MouseEventFactory, GestureEventFactory, OrthogonalPointerEventFactory, PointerEventsDisabledCssClass, Sash };
