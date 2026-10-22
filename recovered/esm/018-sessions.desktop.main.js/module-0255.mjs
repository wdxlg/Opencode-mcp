// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
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
    this._register(addDisposableListener(this.domNode.domNode, EventType.POINTER_DOWN, (e4) => this._domNodePointerDown(e4)));
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
      (e4) => {
        if (e4.button === 0) {
          e4.preventDefault();
          this._sliderPointerDown(e4);
        }
      }
    ));
    this.onclick(this.slider.domNode, (e4) => {
      if (e4.leftButton) {
        e4.stopPropagation();
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
  _domNodePointerDown(e4) {
    if (e4.target !== this.domNode.domNode) {
      return;
    }
    this._onPointerDown(e4);
  }
  delegatePointerDown(e4) {
    const domTop = this.domNode.domNode.getClientRects()[0].top;
    const sliderStart = domTop + this._scrollbarState.getSliderPosition();
    const sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
    const pointerPos = this._sliderPointerPosition(e4);
    if (sliderStart <= pointerPos && pointerPos <= sliderStop) {
      if (e4.button === 0) {
        e4.preventDefault();
        this._sliderPointerDown(e4);
      }
    } else {
      this._onPointerDown(e4);
    }
  }
  _onPointerDown(e4) {
    let offsetX;
    let offsetY;
    if (e4.target === this.domNode.domNode && typeof e4.offsetX === "number" && typeof e4.offsetY === "number") {
      offsetX = e4.offsetX;
      offsetY = e4.offsetY;
    } else {
      const domNodePosition = getDomNodePagePosition(this.domNode.domNode);
      offsetX = e4.pageX - domNodePosition.left;
      offsetY = e4.pageY - domNodePosition.top;
    }
    const isMouse = e4.pointerType === "mouse";
    const isLeftClick = e4.button === 0;
    if (isLeftClick || !isMouse) {
      const offset = this._pointerDownRelativePosition(offsetX, offsetY);
      this._setDesiredScrollPositionNow(
        this._scrollByPage ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(offset) : this._scrollbarState.getDesiredScrollPositionFromOffset(offset)
      );
    }
    if (isLeftClick) {
      e4.preventDefault();
      this._sliderPointerDown(e4);
    }
  }
  _sliderPointerDown(e4) {
    if (!e4.target || !(e4.target instanceof Element)) {
      return;
    }
    const initialPointerPosition = this._sliderPointerPosition(e4);
    const initialPointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(e4);
    const initialScrollbarState = this._scrollbarState.clone();
    this.slider.toggleClassName("active", true);
    this._pointerMoveMonitor.startMonitoring(
      e4.target,
      e4.pointerId,
      e4.buttons,
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
