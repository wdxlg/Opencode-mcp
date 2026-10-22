// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/hover/browser/hoverWidget.ts
import { $, EventType, addDisposableListener, append, getDomNodeZoomLevel, getWindow, isHTMLElement, prepend } from "./module-0075.mjs";
import { Widget } from "./module-0252.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { HoverAction, HoverWidget, getHoverAccessibleViewHint } from "./module-0469.mjs";
import { isNumber } from "./module-0010.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { TimeoutTimer } from "./module-0036.mjs";


// src/vs/platform/hover/browser/hoverWidget.ts
var $22 = $;

var HoverWidget2 = class extends Widget {
  constructor(options3, _keybindingService, _configurationService, _markdownRenderer, _accessibilityService) {
    super();
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
    this._markdownRenderer = _markdownRenderer;
    this._accessibilityService = _accessibilityService;
    this._messageListeners = new DisposableStore();
    this._isDisposed = false;
    this._forcePosition = false;
    this._x = 0;
    this._y = 0;
    this._isLocked = false;
    this._enableFocusTraps = false;
    this._addedFocusTrap = false;
    this._maxHeightRatioRelativeToWindow = 0.5;
    this._onDispose = this._register(new Emitter());
    this._onRequestLayout = this._register(new Emitter());
    this._linkHandler = options3.linkHandler;
    this._target = "targetElements" in options3.target ? options3.target : new ElementHoverTarget(options3.target);
    this._anchorAlignment = options3.position?.anchorAlignment ?? 0 /* LEFT */;
    if (options3.style) {
      switch (options3.style) {
        case 1 /* Pointer */: {
          options3.appearance ??= {};
          options3.appearance.compact ??= true;
          options3.appearance.showPointer ??= true;
          break;
        }
        case 2 /* Mouse */: {
          options3.appearance ??= {};
          options3.appearance.compact ??= true;
          break;
        }
      }
    }
    this._hoverPointer = options3.appearance?.showPointer ? $22("div.workbench-hover-pointer") : void 0;
    this._hover = this._register(new HoverWidget(!options3.appearance?.skipFadeInAnimation));
    this._hover.containerDomNode.classList.add("workbench-hover");
    if (options3.appearance?.compact) {
      this._hover.containerDomNode.classList.add("workbench-hover", "compact");
    }
    if (this._hoverPointer) {
      this._hover.containerDomNode.classList.add("with-pointer");
    }
    if (options3.additionalClasses) {
      this._hover.containerDomNode.classList.add(...options3.additionalClasses);
    }
    if (options3.position?.forcePosition) {
      this._forcePosition = true;
    }
    if (options3.trapFocus) {
      this._enableFocusTraps = true;
    }
    const maxHeightRatio = options3.appearance?.maxHeightRatio;
    if (maxHeightRatio !== void 0 && maxHeightRatio > 0 && maxHeightRatio <= 1) {
      this._maxHeightRatioRelativeToWindow = maxHeightRatio;
    }
    this._hoverPosition = options3.position?.hoverPosition === void 0 ? 3 /* ABOVE */ : isNumber(options3.position.hoverPosition) ? options3.position.hoverPosition : 2 /* BELOW */;
    this.onmousedown(this._hover.containerDomNode, (e4) => e4.stopPropagation());
    this.onkeydown(this._hover.containerDomNode, (e4) => {
      if (e4.equals(9 /* Escape */)) {
        this.dispose();
      }
    });
    this._register(addDisposableListener(this._targetWindow, "blur", () => this.dispose()));
    const rowElement = $22("div.hover-row.markdown-hover");
    const contentsElement = $22("div.hover-contents");
    if (typeof options3.content === "string") {
      contentsElement.textContent = options3.content;
      contentsElement.style.whiteSpace = "pre-wrap";
    } else if (isHTMLElement(options3.content)) {
      contentsElement.appendChild(options3.content);
      contentsElement.classList.add("html-hover-contents");
      const resizeObserver = new ResizeObserver(() => {
        this.layout();
        this._onRequestLayout.fire();
      });
      resizeObserver.observe(contentsElement);
      this._register(toDisposable(() => resizeObserver.disconnect()));
    } else {
      const markdown = options3.content;
      const { element } = this._register(this._markdownRenderer.render(markdown, {
        actionHandler: this._linkHandler,
        asyncRenderCallback: () => {
          contentsElement.classList.add("code-hover-contents");
          this.layout();
          this._onRequestLayout.fire();
        }
      }));
      contentsElement.appendChild(element);
    }
    rowElement.appendChild(contentsElement);
    this._hover.contentsDomNode.appendChild(rowElement);
    if (options3.actions && options3.actions.length > 0) {
      const statusBarElement = $22("div.hover-row.status-bar");
      const actionsElement = $22("div.actions");
      options3.actions.forEach((action) => {
        const keybinding = this._keybindingService.lookupKeybinding(action.commandId);
        const keybindingLabel2 = keybinding ? keybinding.getLabel() : null;
        this._register(HoverAction.render(actionsElement, {
          label: action.label,
          commandId: action.commandId,
          run: (e4) => {
            action.run(e4);
            this.dispose();
          },
          iconClass: action.iconClass
        }, keybindingLabel2));
      });
      statusBarElement.appendChild(actionsElement);
      this._hover.containerDomNode.appendChild(statusBarElement);
    }
    this._hoverContainer = $22("div.workbench-hover-container");
    if (this._hoverPointer) {
      this._hoverContainer.appendChild(this._hoverPointer);
    }
    this._hoverContainer.appendChild(this._hover.containerDomNode);
    let hideOnHover;
    if (options3.actions && options3.actions.length > 0) {
      hideOnHover = false;
    } else {
      if (options3.persistence?.hideOnHover === void 0) {
        hideOnHover = typeof options3.content === "string" || isMarkdownString(options3.content) && !options3.content.value.includes("](") && !options3.content.value.includes("</a>");
      } else {
        hideOnHover = options3.persistence.hideOnHover;
      }
    }
    if (options3.appearance?.showHoverHint) {
      const statusBarElement = $22("div.hover-row.status-bar");
      const infoElement = $22("div.info");
      infoElement.textContent = localize(3059, null, isMacintosh ? "Option" : "Alt");
      statusBarElement.appendChild(infoElement);
      this._hover.containerDomNode.appendChild(statusBarElement);
    }
    const mouseTrackerTargets = [...this._target.targetElements];
    if (!hideOnHover) {
      mouseTrackerTargets.push(this._hoverContainer);
    }
    const mouseTracker = this._mouseTracker = this._register(new CompositeMouseTracker(mouseTrackerTargets));
    this._register(mouseTracker.onMouseOut(() => {
      if (!this._isLocked) {
        this.dispose();
      }
    }));
    if (hideOnHover) {
      const mouseTracker2Targets = [...this._target.targetElements, this._hoverContainer];
      this._lockMouseTracker = this._register(new CompositeMouseTracker(mouseTracker2Targets));
      this._register(this._lockMouseTracker.onMouseOut(() => {
        if (!this._isLocked) {
          this.dispose();
        }
      }));
    } else {
      this._lockMouseTracker = mouseTracker;
    }
  }
  get _targetWindow() {
    return getWindow(this._target.targetElements[0]);
  }
  get _targetDocumentElement() {
    return getWindow(this._target.targetElements[0]).document.documentElement;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  get isMouseIn() {
    return this._lockMouseTracker.isMouseIn;
  }
  get domNode() {
    return this._hover.containerDomNode;
  }
  get onDispose() {
    return this._onDispose.event;
  }
  get onRequestLayout() {
    return this._onRequestLayout.event;
  }
  get anchor() {
    return this._hoverPosition === 2 /* BELOW */ ? 0 /* BELOW */ : 1 /* ABOVE */;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  /**
   * Whether the hover is "locked" by holding the alt/option key. When locked, the hover will not
   * hide and can be hovered regardless of whether the `hideOnHover` hover option is set.
   */
  get isLocked() {
    return this._isLocked;
  }
  set isLocked(value2) {
    if (this._isLocked === value2) {
      return;
    }
    this._isLocked = value2;
    this._hoverContainer.classList.toggle("locked", this._isLocked);
  }
  /**
   * Adds an element to be tracked by this hover's mouse tracker. Mouse events on
   * this element will be considered as being "inside" the hover, preventing it
   * from closing. This is used for nested hovers where the child hover's container
   * should be treated as part of the parent hover.
   */
  addMouseTrackingElement(element) {
    return this._lockMouseTracker.addElement(element);
  }
  addFocusTrap() {
    if (!this._enableFocusTraps || this._addedFocusTrap) {
      return;
    }
    this._addedFocusTrap = true;
    const firstContainerFocusElement = this._hover.containerDomNode;
    const lastContainerFocusElement = this.findLastFocusableChild(this._hover.containerDomNode);
    if (lastContainerFocusElement) {
      const beforeContainerFocusElement = prepend(this._hoverContainer, $22("div"));
      const afterContainerFocusElement = append(this._hoverContainer, $22("div"));
      beforeContainerFocusElement.tabIndex = 0;
      afterContainerFocusElement.tabIndex = 0;
      this._register(addDisposableListener(afterContainerFocusElement, "focus", (e4) => {
        firstContainerFocusElement.focus();
        e4.preventDefault();
      }));
      this._register(addDisposableListener(beforeContainerFocusElement, "focus", (e4) => {
        lastContainerFocusElement.focus();
        e4.preventDefault();
      }));
    }
  }
  findLastFocusableChild(root) {
    if (root.hasChildNodes()) {
      for (let i2 = 0; i2 < root.childNodes.length; i2++) {
        const node = root.childNodes.item(root.childNodes.length - i2 - 1);
        if (node.nodeType === node.ELEMENT_NODE) {
          const parsedNode = node;
          if (typeof parsedNode.tabIndex === "number" && parsedNode.tabIndex >= 0) {
            return parsedNode;
          }
        }
        const recursivelyFoundElement = this.findLastFocusableChild(node);
        if (recursivelyFoundElement) {
          return recursivelyFoundElement;
        }
      }
    }
    return void 0;
  }
  render(container2) {
    container2.appendChild(this._hoverContainer);
    const hoverFocused = this._hoverContainer.contains(this._hoverContainer.ownerDocument.activeElement);
    const accessibleViewHint = hoverFocused && getHoverAccessibleViewHint(this._configurationService.getValue("accessibility.verbosity.hover") === true && this._accessibilityService.isScreenReaderOptimized(), this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel());
    if (accessibleViewHint) {
      status(accessibleViewHint);
    }
    this.layout();
    this.addFocusTrap();
  }
  layout() {
    this._mouseTracker?.suppressPendingMouseOut();
    if (this._lockMouseTracker !== this._mouseTracker) {
      this._lockMouseTracker?.suppressPendingMouseOut();
    }
    this._hover.containerDomNode.classList.remove("right-aligned");
    this._hover.contentsDomNode.style.maxHeight = "";
    this._hover.containerDomNode.style.maxWidth = "";
    const getZoomAccountedBoundingClientRect = (e4) => {
      const zoom = getDomNodeZoomLevel(e4);
      const boundingRect = e4.getBoundingClientRect();
      return {
        top: boundingRect.top * zoom,
        bottom: boundingRect.bottom * zoom,
        right: boundingRect.right * zoom,
        left: boundingRect.left * zoom
      };
    };
    const targetBounds = this._target.targetElements.map((e4) => getZoomAccountedBoundingClientRect(e4));
    const { top: top2, right, bottom, left } = targetBounds[0];
    const width2 = right - left;
    const height = bottom - top2;
    const targetRect = {
      top: top2,
      right,
      bottom,
      left,
      width: width2,
      height,
      center: {
        x: left + width2 / 2,
        y: top2 + height / 2
      }
    };
    this.adjustHorizontalHoverPosition(targetRect);
    this.adjustVerticalHoverPosition(targetRect);
    this.adjustHoverMaxHeight(targetRect);
    this._hoverContainer.style.padding = "";
    this._hoverContainer.style.margin = "";
    if (this._hoverPointer) {
      switch (this._hoverPosition) {
        case 1 /* RIGHT */:
          targetRect.left += 3 /* PointerSize */;
          targetRect.right += 3 /* PointerSize */;
          this._hoverContainer.style.paddingLeft = `${3 /* PointerSize */}px`;
          this._hoverContainer.style.marginLeft = `${-3}px`;
          break;
        case 0 /* LEFT */:
          targetRect.left -= 3 /* PointerSize */;
          targetRect.right -= 3 /* PointerSize */;
          this._hoverContainer.style.paddingRight = `${3 /* PointerSize */}px`;
          this._hoverContainer.style.marginRight = `${-3}px`;
          break;
        case 2 /* BELOW */:
          targetRect.top += 3 /* PointerSize */;
          targetRect.bottom += 3 /* PointerSize */;
          this._hoverContainer.style.paddingTop = `${3 /* PointerSize */}px`;
          this._hoverContainer.style.marginTop = `${-3}px`;
          break;
        case 3 /* ABOVE */:
          targetRect.top -= 3 /* PointerSize */;
          targetRect.bottom -= 3 /* PointerSize */;
          this._hoverContainer.style.paddingBottom = `${3 /* PointerSize */}px`;
          this._hoverContainer.style.marginBottom = `${-3}px`;
          break;
      }
      targetRect.center.x = targetRect.left + width2 / 2;
      targetRect.center.y = targetRect.top + height / 2;
    }
    this.computeXCordinate(targetRect);
    this.computeYCordinate(targetRect);
    if (this._hoverPointer) {
      this._hoverPointer.classList.remove("top");
      this._hoverPointer.classList.remove("left");
      this._hoverPointer.classList.remove("right");
      this._hoverPointer.classList.remove("bottom");
      this.setHoverPointerPosition(targetRect);
    }
    this._hover.onContentsChanged();
  }
  computeXCordinate(target) {
    const hoverWidth = this._hover.containerDomNode.clientWidth + 2 /* HoverBorderWidth */;
    const documentElementClientLeft = this._targetDocumentElement.clientLeft;
    if (this._target.x !== void 0) {
      this._x = this._target.x;
    } else if (this._hoverPosition === 1 /* RIGHT */) {
      this._x = target.right;
    } else if (this._hoverPosition === 0 /* LEFT */) {
      this._x = target.left - hoverWidth;
    } else {
      if (this._anchorAlignment === 1 /* RIGHT */) {
        this._x = target.right - hoverWidth;
      } else if (this._hoverPointer) {
        this._x = target.center.x - this._hover.containerDomNode.clientWidth / 2;
      } else {
        this._x = target.left;
      }
      const documentElementClientWidth = this._targetDocumentElement.clientWidth;
      if (this._x + hoverWidth >= documentElementClientWidth) {
        this._hover.containerDomNode.classList.add("right-aligned");
        this._x = Math.max(documentElementClientWidth - hoverWidth - 2 /* HoverWindowEdgeMargin */, documentElementClientLeft);
      }
    }
    if (this._x < documentElementClientLeft) {
      this._x = target.left + 2 /* HoverWindowEdgeMargin */;
    }
  }
  computeYCordinate(target) {
    if (this._target.y !== void 0) {
      this._y = this._target.y;
    } else if (this._hoverPosition === 3 /* ABOVE */) {
      this._y = target.top;
    } else if (this._hoverPosition === 2 /* BELOW */) {
      this._y = target.bottom - 2;
    } else {
      if (this._hoverPointer) {
        this._y = target.center.y + this._hover.containerDomNode.clientHeight / 2;
      } else {
        this._y = target.bottom;
      }
    }
    if (this._y > this._targetWindow.innerHeight) {
      this._y = target.bottom;
    }
  }
  adjustHorizontalHoverPosition(target) {
    if (this._target.x !== void 0) {
      return;
    }
    if (this._anchorAlignment === 1 /* RIGHT */ && (this._hoverPosition === 3 /* ABOVE */ || this._hoverPosition === 2 /* BELOW */)) {
      const availableWidth = target.right - this._targetDocumentElement.clientLeft - 2 /* HoverWindowEdgeMargin */ - 2 /* HoverBorderWidth */;
      if (this._hover.containerDomNode.clientWidth > availableWidth) {
        this._hover.containerDomNode.style.maxWidth = `${Math.max(availableWidth, 0)}px`;
      }
      return;
    }
    const hoverPointerOffset = this._hoverPointer ? 3 /* PointerSize */ : 0;
    if (this._forcePosition) {
      const padding = hoverPointerOffset + 2 /* HoverBorderWidth */;
      if (this._hoverPosition === 1 /* RIGHT */) {
        this._hover.containerDomNode.style.maxWidth = `${this._targetDocumentElement.clientWidth - target.right - padding}px`;
      } else if (this._hoverPosition === 0 /* LEFT */) {
        this._hover.containerDomNode.style.maxWidth = `${target.left - padding}px`;
      }
      return;
    }
    if (this._hoverPosition === 1 /* RIGHT */) {
      const roomOnRight = this._targetDocumentElement.clientWidth - target.right;
      if (roomOnRight < this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
        const roomOnLeft = target.left;
        if (roomOnLeft >= this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
          this._hoverPosition = 0 /* LEFT */;
        } else {
          this._hoverPosition = 2 /* BELOW */;
        }
      }
    } else if (this._hoverPosition === 0 /* LEFT */) {
      const roomOnLeft = target.left;
      if (roomOnLeft < this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
        const roomOnRight = this._targetDocumentElement.clientWidth - target.right;
        if (roomOnRight >= this._hover.containerDomNode.clientWidth + hoverPointerOffset) {
          this._hoverPosition = 1 /* RIGHT */;
        } else {
          this._hoverPosition = 2 /* BELOW */;
        }
      }
      if (target.left - this._hover.containerDomNode.clientWidth - hoverPointerOffset <= this._targetDocumentElement.clientLeft) {
        this._hoverPosition = 1 /* RIGHT */;
      }
    }
  }
  adjustVerticalHoverPosition(target) {
    if (this._target.y !== void 0 || this._forcePosition) {
      return;
    }
    const hoverPointerOffset = this._hoverPointer ? 3 /* PointerSize */ : 0;
    if (this._hoverPosition === 3 /* ABOVE */) {
      if (target.top - this._hover.containerDomNode.clientHeight - hoverPointerOffset < 0) {
        this._hoverPosition = 2 /* BELOW */;
      }
    } else if (this._hoverPosition === 2 /* BELOW */) {
      if (target.bottom + this._hover.containerDomNode.offsetHeight + hoverPointerOffset > this._targetWindow.innerHeight) {
        this._hoverPosition = 3 /* ABOVE */;
      }
    }
  }
  adjustHoverMaxHeight(target) {
    let maxHeight = this._targetWindow.innerHeight * this._maxHeightRatioRelativeToWindow;
    if (this._forcePosition) {
      const padding = (this._hoverPointer ? 3 /* PointerSize */ : 0) + 2 /* HoverBorderWidth */;
      if (this._hoverPosition === 3 /* ABOVE */) {
        maxHeight = Math.min(maxHeight, target.top - padding);
      } else if (this._hoverPosition === 2 /* BELOW */) {
        maxHeight = Math.min(maxHeight, this._targetWindow.innerHeight - target.bottom - padding);
      }
    }
    this._hover.containerDomNode.style.maxHeight = "";
    const heightOutsideContents = this._hover.containerDomNode.offsetHeight - this._hover.contentsDomNode.offsetHeight;
    const contentsMaxHeight = Math.max(0, maxHeight - heightOutsideContents);
    this._hover.containerDomNode.style.maxHeight = `${maxHeight}px`;
    this._hover.contentsDomNode.style.maxHeight = `${contentsMaxHeight}px`;
    if (this._hover.contentsDomNode.clientHeight < this._hover.contentsDomNode.scrollHeight) {
      const extraRightPadding = `${this._hover.scrollbar.options.verticalScrollbarSize}px`;
      if (this._hover.contentsDomNode.style.paddingRight !== extraRightPadding) {
        this._hover.contentsDomNode.style.paddingRight = extraRightPadding;
      }
    }
  }
  setHoverPointerPosition(target) {
    if (!this._hoverPointer) {
      return;
    }
    switch (this._hoverPosition) {
      case 0 /* LEFT */:
      case 1 /* RIGHT */: {
        this._hoverPointer.classList.add(this._hoverPosition === 0 /* LEFT */ ? "right" : "left");
        const hoverHeight = this._hover.containerDomNode.clientHeight;
        if (hoverHeight > target.height) {
          this._hoverPointer.style.top = `${target.center.y - (this._y - hoverHeight) - 3 /* PointerSize */}px`;
        } else {
          this._hoverPointer.style.top = `${Math.round(hoverHeight / 2) - 3 /* PointerSize */}px`;
        }
        break;
      }
      case 3 /* ABOVE */:
      case 2 /* BELOW */: {
        this._hoverPointer.classList.add(this._hoverPosition === 3 /* ABOVE */ ? "bottom" : "top");
        const hoverWidth = this._hover.containerDomNode.clientWidth;
        let pointerLeftPosition = Math.round(hoverWidth / 2) - 3 /* PointerSize */;
        const pointerX = this._x + pointerLeftPosition;
        if (pointerX < target.left || pointerX > target.right) {
          pointerLeftPosition = target.center.x - this._x - 3 /* PointerSize */;
        }
        this._hoverPointer.style.left = `${pointerLeftPosition}px`;
        break;
      }
    }
  }
  focus() {
    this._hover.containerDomNode.focus();
  }
  hide() {
    this.dispose();
  }
  dispose() {
    if (!this._isDisposed) {
      this._onDispose.fire();
      this._target.dispose?.();
      this._hoverContainer.remove();
      this._messageListeners.dispose();
      super.dispose();
    }
    this._isDisposed = true;
  }
};

HoverWidget2 = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IAccessibilityService)
], HoverWidget2);

var CompositeMouseTracker = class extends Widget {
  /**
   * @param _elements The target elements to track mouse in/out events on.
   * @param _eventDebounceDelay The delay in ms to debounce the event firing. This is used to
   * allow a short period for the mouse to move into the hover or a nearby target element. For
   * example hovering a scroll bar will not hide the hover immediately.
   */
  constructor(_elements, _eventDebounceDelay = 200) {
    super();
    this._elements = _elements;
    this._eventDebounceDelay = _eventDebounceDelay;
    this._isMouseIn = true;
    this._suppressNextMouseOut = false;
    this._mouseTimer = this._register(new MutableDisposable());
    this._onMouseOut = this._register(new Emitter());
    for (const element of this._elements) {
      this.onmouseover(element, () => this._onTargetMouseOver());
      this.onmouseleave(element, () => this._onTargetMouseLeave());
    }
  }
  get onMouseOut() {
    return this._onMouseOut.event;
  }
  get isMouseIn() {
    return this._isMouseIn;
  }
  _onTargetMouseOver() {
    this._isMouseIn = true;
    this._suppressNextMouseOut = false;
    this._mouseTimer.clear();
  }
  _onTargetMouseLeave() {
    this._isMouseIn = false;
    this._mouseTimer.value = new TimeoutTimer(() => this._fireIfMouseOutside(), this._eventDebounceDelay);
  }
  _fireIfMouseOutside() {
    if (!this._isMouseIn && !this._suppressNextMouseOut) {
      this._onMouseOut.fire();
    }
  }
  /**
   * Suppresses the next pending mouseout dismissal. Call this when tracked
   * elements are being resized or repositioned to avoid spurious dismissals
   * caused by the element shrinking away from the cursor. The suppression
   * is cleared when the mouse next enters a tracked element.
   */
  suppressPendingMouseOut() {
    if (!this._isMouseIn) {
      this._suppressNextMouseOut = true;
    }
  }
  /**
   * Adds an element to be tracked by this mouse tracker. Mouse events on this
   * element will be considered as being "inside" the tracked area.
   */
  addElement(element) {
    if (this._elements.includes(element)) {
      return Disposable.None;
    }
    this._elements.push(element);
    const store = new DisposableStore();
    store.add(addDisposableListener(element, EventType.MOUSE_OVER, () => this._onTargetMouseOver()));
    store.add(addDisposableListener(element, EventType.MOUSE_LEAVE, () => this._onTargetMouseLeave()));
    store.add(toDisposable(() => {
      const index2 = this._elements.indexOf(element);
      if (index2 >= 0) {
        this._elements.splice(index2, 1);
      }
    }));
    return store;
  }
};

var ElementHoverTarget = class {
  constructor(_element) {
    this._element = _element;
    this.targetElements = [this._element];
  }
  dispose() {
  }
};
export { $22, HoverWidget2, CompositeMouseTracker, ElementHoverTarget };
