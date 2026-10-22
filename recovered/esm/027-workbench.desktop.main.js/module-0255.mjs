// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/scrollbar/abstractScrollbar.ts
import { Widget } from "./module-0252.mjs";
import { ScrollbarVisibilityController } from "./module-0254.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { EventType, addDisposableListener, getDomNodePagePosition } from "./module-0075.mjs";
import { ScrollbarArrow } from "./module-0253.mjs";
import { isWindows } from "./module-0014.mjs";


// src/vs/base/browser/ui/scrollbar/abstractScrollbar.ts
var POINTER_DRAG_RESET_DISTANCE = 140;

var AbstractScrollbar = class extends Widget {
  constructor(opts) {
    super();
    this._lazyRender = opts.lazyRender;
    this._host = opts.host;
    this._scrollable = opts.scrollable;
    this._scrollByPage = opts.scrollByPage;
    this._scrollbarState = opts.scrollbarState;
    this._visibilityController = this._register(new ScrollbarVisibilityController(opts.visibility, "visible scrollbar " + opts.extraScrollbarClassName, "invisible scrollbar " + opts.extraScrollbarClassName));
    this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
    this._pointerMoveMonitor = this._register(new GlobalPointerMoveMonitor());
    this._shouldRender = true;
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this._visibilityController.setDomNode(this.domNode);
    this.domNode.setPosition("absolute");
    this._register(addDisposableListener(this.domNode.domNode, EventType.POINTER_DOWN, (e) => this._domNodePointerDown(e)));
  }
  // ----------------- creation
  /**
   * Creates the dom node for an arrow & adds it to the container
   */
  _createArrow(opts) {
    const arrow = this._register(new ScrollbarArrow(opts));
    this.domNode.domNode.appendChild(arrow.bgDomNode);
    this.domNode.domNode.appendChild(arrow.domNode);
  }
  /**
   * Creates the slider dom node, adds it to the container & hooks up the events
   */
  _createSlider(top2, left, width2, height) {
    this.slider = createFastDomNode(document.createElement("div"));
    this.slider.setClassName("slider");
    this.slider.setPosition("absolute");
    this.slider.setTop(top2);
    this.slider.setLeft(left);
    if (typeof width2 === "number") {
      this.slider.setWidth(width2);
    }
    if (typeof height === "number") {
      this.slider.setHeight(height);
    }
    this.slider.setLayerHinting(true);
    this.slider.setContain("strict");
    this.domNode.domNode.appendChild(this.slider.domNode);
    this._register(addDisposableListener(
      this.slider.domNode,
      EventType.POINTER_DOWN,
      (e) => {
        if (e.button === 0) {
          e.preventDefault();
          this._sliderPointerDown(e);
        }
      }
    ));
    this.onclick(this.slider.domNode, (e) => {
      if (e.leftButton) {
        e.stopPropagation();
      }
    });
  }
  // ----------------- Update state
  _onElementSize(visibleSize) {
    if (this._scrollbarState.setVisibleSize(visibleSize)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }
  _onElementScrollSize(elementScrollSize) {
    if (this._scrollbarState.setScrollSize(elementScrollSize)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }
  _onElementScrollPosition(elementScrollPosition) {
    if (this._scrollbarState.setScrollPosition(elementScrollPosition)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }
  // ----------------- rendering
  beginReveal() {
    this._visibilityController.setShouldBeVisible(true);
  }
  beginHide() {
    this._visibilityController.setShouldBeVisible(false);
  }
  render() {
    if (!this._shouldRender) {
      return;
    }
    this._shouldRender = false;
    this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize());
    this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition());
  }
  // ----------------- DOM events
  _domNodePointerDown(e) {
    if (e.target !== this.domNode.domNode) {
      return;
    }
    this._onPointerDown(e);
  }
  delegatePointerDown(e) {
    const domTop = this.domNode.domNode.getClientRects()[0].top;
    const sliderStart = domTop + this._scrollbarState.getSliderPosition();
    const sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
    const pointerPos = this._sliderPointerPosition(e);
    if (sliderStart <= pointerPos && pointerPos <= sliderStop) {
      if (e.button === 0) {
        e.preventDefault();
        this._sliderPointerDown(e);
      }
    } else {
      this._onPointerDown(e);
    }
  }
  _onPointerDown(e) {
    let offsetX;
    let offsetY;
    if (e.target === this.domNode.domNode && typeof e.offsetX === "number" && typeof e.offsetY === "number") {
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    } else {
      const domNodePosition = getDomNodePagePosition(this.domNode.domNode);
      offsetX = e.pageX - domNodePosition.left;
      offsetY = e.pageY - domNodePosition.top;
    }
    const isMouse = e.pointerType === "mouse";
    const isLeftClick = e.button === 0;
    if (isLeftClick || !isMouse) {
      const offset = this._pointerDownRelativePosition(offsetX, offsetY);
      this._setDesiredScrollPositionNow(
        this._scrollByPage ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(offset) : this._scrollbarState.getDesiredScrollPositionFromOffset(offset)
      );
    }
    if (isLeftClick) {
      e.preventDefault();
      this._sliderPointerDown(e);
    }
  }
  _sliderPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) {
      return;
    }
    const initialPointerPosition = this._sliderPointerPosition(e);
    const initialPointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(e);
    const initialScrollbarState = this._scrollbarState.clone();
    this.slider.toggleClassName("active", true);
    this._pointerMoveMonitor.startMonitoring(
      e.target,
      e.pointerId,
      e.buttons,
      (pointerMoveData) => {
        const pointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(pointerMoveData);
        const pointerOrthogonalDelta = Math.abs(pointerOrthogonalPosition - initialPointerOrthogonalPosition);
        if (isWindows && pointerOrthogonalDelta > POINTER_DRAG_RESET_DISTANCE) {
          this._setDesiredScrollPositionNow(initialScrollbarState.getScrollPosition());
          return;
        }
        const pointerPosition = this._sliderPointerPosition(pointerMoveData);
        const pointerDelta = pointerPosition - initialPointerPosition;
        this._setDesiredScrollPositionNow(initialScrollbarState.getDesiredScrollPositionFromDelta(pointerDelta));
      },
      () => {
        this.slider.toggleClassName("active", false);
        this._host.onDragEnd();
      }
    );
    this._host.onDragStart();
  }
  _setDesiredScrollPositionNow(_desiredScrollPosition) {
    const desiredScrollPosition = {};
    this.writeScrollPosition(desiredScrollPosition, _desiredScrollPosition);
    this._scrollable.setScrollPositionNow(desiredScrollPosition);
  }
  updateScrollbarSize(scrollbarSize) {
    this._updateScrollbarSize(scrollbarSize);
    this._scrollbarState.setScrollbarSize(scrollbarSize);
    this._shouldRender = true;
    if (!this._lazyRender) {
      this.render();
    }
  }
  isNeeded() {
    return this._scrollbarState.isNeeded();
  }
};
export { POINTER_DRAG_RESET_DISTANCE, AbstractScrollbar };
