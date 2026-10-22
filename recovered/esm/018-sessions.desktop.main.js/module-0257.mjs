// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/scrollbar/horizontalScrollbar.ts
import { AbstractScrollbar } from "./module-0255.mjs";
import { ScrollbarState } from "./module-0256.mjs";
import { ARROW_IMG_SIZE } from "./module-0253.mjs";
import { Codicon } from "./module-0085.mjs";
import { StandardWheelEvent } from "./module-0024.mjs";


// src/vs/base/browser/ui/scrollbar/horizontalScrollbar.ts
var HorizontalScrollbar = class extends AbstractScrollbar {
  constructor(scrollable, options3, host) {
    const scrollDimensions = scrollable.getScrollDimensions();
    const scrollPosition = scrollable.getCurrentScrollPosition();
    super({
      lazyRender: options3.lazyRender,
      host,
      scrollbarState: new ScrollbarState(
        options3.horizontalHasArrows ? options3.arrowSize : 0,
        options3.horizontal === 2 /* Hidden */ ? 0 : options3.horizontalScrollbarSize,
        options3.vertical === 2 /* Hidden */ ? 0 : options3.verticalScrollbarSize,
        scrollDimensions.width,
        scrollDimensions.scrollWidth,
        scrollPosition.scrollLeft
      ),
      visibility: options3.horizontal,
      extraScrollbarClassName: "horizontal",
      scrollable,
      scrollByPage: options3.scrollByPage
    });
    if (options3.horizontalHasArrows) {
      const arrowDelta = (options3.arrowSize - ARROW_IMG_SIZE) / 2;
      const scrollbarDelta = (options3.horizontalScrollbarSize - ARROW_IMG_SIZE) / 2;
      this._createArrow({
        className: "scra",
        icon: Codicon.scrollbarButtonLeft,
        top: scrollbarDelta,
        left: arrowDelta,
        bottom: void 0,
        right: void 0,
        bgWidth: options3.arrowSize,
        bgHeight: options3.horizontalScrollbarSize,
        onActivate: () => this._host.onMouseWheel(new StandardWheelEvent(null, 1, 0))
      });
      this._createArrow({
        className: "scra",
        icon: Codicon.scrollbarButtonRight,
        top: scrollbarDelta,
        left: void 0,
        bottom: void 0,
        right: arrowDelta,
        bgWidth: options3.arrowSize,
        bgHeight: options3.horizontalScrollbarSize,
        onActivate: () => this._host.onMouseWheel(new StandardWheelEvent(null, -1, 0))
      });
    }
    this._createSlider(Math.floor((options3.horizontalScrollbarSize - options3.horizontalSliderSize) / 2), 0, void 0, options3.horizontalSliderSize);
  }
  _updateSlider(sliderSize, sliderPosition) {
    this.slider.setWidth(sliderSize);
    this.slider.setLeft(sliderPosition);
  }
  _renderDomNode(largeSize, smallSize) {
    this.domNode.setWidth(largeSize);
    this.domNode.setHeight(smallSize);
    this.domNode.setLeft(0);
    this.domNode.setBottom(0);
  }
  onDidScroll(e4) {
    this._shouldRender = this._onElementScrollSize(e4.scrollWidth) || this._shouldRender;
    this._shouldRender = this._onElementScrollPosition(e4.scrollLeft) || this._shouldRender;
    this._shouldRender = this._onElementSize(e4.width) || this._shouldRender;
    return this._shouldRender;
  }
  _pointerDownRelativePosition(offsetX, offsetY) {
    return offsetX;
  }
  _sliderPointerPosition(e4) {
    return e4.pageX;
  }
  _sliderOrthogonalPointerPosition(e4) {
    return e4.pageY;
  }
  _updateScrollbarSize(size3) {
    this.slider.setHeight(size3);
  }
  writeScrollPosition(target, scrollPosition) {
    target.scrollLeft = scrollPosition;
  }
  updateOptions(options3) {
    this.updateScrollbarSize(options3.horizontal === 2 /* Hidden */ ? 0 : options3.horizontalScrollbarSize);
    this._scrollbarState.setOppositeScrollbarSize(options3.vertical === 2 /* Hidden */ ? 0 : options3.verticalScrollbarSize);
    this._visibilityController.setVisibility(options3.horizontal);
    this._scrollByPage = options3.scrollByPage;
  }
};
export { HorizontalScrollbar };
