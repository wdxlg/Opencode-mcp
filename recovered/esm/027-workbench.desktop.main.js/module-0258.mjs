// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/scrollbar/verticalScrollbar.ts
import { AbstractScrollbar } from "./module-0255.mjs";
import { ScrollbarState } from "./module-0256.mjs";
import { ARROW_IMG_SIZE } from "./module-0253.mjs";
import { Codicon } from "./module-0085.mjs";
import { StandardWheelEvent } from "./module-0024.mjs";


// src/vs/base/browser/ui/scrollbar/verticalScrollbar.ts
var VerticalScrollbar = class extends AbstractScrollbar {
  constructor(scrollable, options3, host) {
    const scrollDimensions = scrollable.getScrollDimensions();
    const scrollPosition = scrollable.getCurrentScrollPosition();
    super({
      lazyRender: options3.lazyRender,
      host,
      scrollbarState: new ScrollbarState(
        options3.verticalHasArrows ? options3.arrowSize : 0,
        options3.vertical === 2 /* Hidden */ ? 0 : options3.verticalScrollbarSize,
        // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
        0,
        scrollDimensions.height,
        scrollDimensions.scrollHeight,
        scrollPosition.scrollTop
      ),
      visibility: options3.vertical,
      extraScrollbarClassName: "vertical",
      scrollable,
      scrollByPage: options3.scrollByPage
    });
    if (options3.verticalHasArrows) {
      const arrowDelta = (options3.arrowSize - ARROW_IMG_SIZE) / 2;
      const scrollbarDelta = (options3.verticalScrollbarSize - ARROW_IMG_SIZE) / 2;
      this._createArrow({
        className: "scra",
        icon: Codicon.scrollbarButtonUp,
        top: arrowDelta,
        left: scrollbarDelta,
        bottom: void 0,
        right: void 0,
        bgWidth: options3.verticalScrollbarSize,
        bgHeight: options3.arrowSize,
        onActivate: () => this._host.onMouseWheel(new StandardWheelEvent(null, 0, 1))
      });
      this._createArrow({
        className: "scra",
        icon: Codicon.scrollbarButtonDown,
        top: void 0,
        left: scrollbarDelta,
        bottom: arrowDelta,
        right: void 0,
        bgWidth: options3.verticalScrollbarSize,
        bgHeight: options3.arrowSize,
        onActivate: () => this._host.onMouseWheel(new StandardWheelEvent(null, 0, -1))
      });
    }
    this._createSlider(0, Math.floor((options3.verticalScrollbarSize - options3.verticalSliderSize) / 2), options3.verticalSliderSize, void 0);
  }
  _updateSlider(sliderSize, sliderPosition) {
    this.slider.setHeight(sliderSize);
    this.slider.setTop(sliderPosition);
  }
  _renderDomNode(largeSize, smallSize) {
    this.domNode.setWidth(smallSize);
    this.domNode.setHeight(largeSize);
    this.domNode.setRight(0);
    this.domNode.setTop(0);
  }
  onDidScroll(e) {
    this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender;
    this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender;
    this._shouldRender = this._onElementSize(e.height) || this._shouldRender;
    return this._shouldRender;
  }
  _pointerDownRelativePosition(offsetX, offsetY) {
    return offsetY;
  }
  _sliderPointerPosition(e) {
    return e.pageY;
  }
  _sliderOrthogonalPointerPosition(e) {
    return e.pageX;
  }
  _updateScrollbarSize(size3) {
    this.slider.setWidth(size3);
  }
  writeScrollPosition(target, scrollPosition) {
    target.scrollTop = scrollPosition;
  }
  updateOptions(options3) {
    this.updateScrollbarSize(options3.vertical === 2 /* Hidden */ ? 0 : options3.verticalScrollbarSize);
    this._scrollbarState.setOppositeScrollbarSize(0);
    this._visibilityController.setVisibility(options3.vertical);
    this._scrollByPage = options3.scrollByPage;
  }
};
export { VerticalScrollbar };
