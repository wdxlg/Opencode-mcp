// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/editorScrollbar/editorScrollbar.ts
import { PartFingerprints, ViewPart } from "./module-0239.mjs";
import { getThemeTypeSelector } from "./module-0287.mjs";
import { SmoothScrollableElement } from "./module-0259.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { addDisposableListener } from "./module-0075.mjs";


// src/vs/editor/browser/viewParts/editorScrollbar/editorScrollbar.ts
var EditorScrollbar2 = class extends ViewPart {
  constructor(context2, linesContent, viewDomNode, overflowGuardDomNode) {
    super(context2);
    const options3 = this._context.configuration.options;
    const scrollbar = options3.get(117 /* scrollbar */);
    const mouseWheelScrollSensitivity = options3.get(83 /* mouseWheelScrollSensitivity */);
    const fastScrollSensitivity = options3.get(49 /* fastScrollSensitivity */);
    const scrollPredominantAxis = options3.get(120 /* scrollPredominantAxis */);
    const inertialScroll = options3.get(158 /* inertialScroll */);
    const scrollbarOptions = {
      listenOnDomNode: viewDomNode.domNode,
      className: "editor-scrollable " + getThemeTypeSelector(context2.theme.type),
      useShadows: false,
      lazyRender: true,
      vertical: scrollbar.vertical,
      horizontal: scrollbar.horizontal,
      verticalHasArrows: scrollbar.verticalHasArrows,
      horizontalHasArrows: scrollbar.horizontalHasArrows,
      verticalScrollbarSize: scrollbar.verticalScrollbarSize,
      verticalSliderSize: scrollbar.verticalSliderSize,
      horizontalScrollbarSize: scrollbar.horizontalScrollbarSize,
      horizontalSliderSize: scrollbar.horizontalSliderSize,
      handleMouseWheel: scrollbar.handleMouseWheel,
      alwaysConsumeMouseWheel: scrollbar.alwaysConsumeMouseWheel,
      arrowSize: scrollbar.arrowSize,
      mouseWheelScrollSensitivity,
      fastScrollSensitivity,
      scrollPredominantAxis,
      scrollByPage: scrollbar.scrollByPage,
      inertialScroll
    };
    this.scrollbar = this._register(new SmoothScrollableElement(linesContent.domNode, scrollbarOptions, this._context.viewLayout.getScrollable()));
    PartFingerprints.write(this.scrollbar.getDomNode(), 6 /* ScrollableElement */);
    this.scrollbarDomNode = createFastDomNode(this.scrollbar.getDomNode());
    this.scrollbarDomNode.setPosition("absolute");
    this._setLayout();
    const onBrowserDesperateReveal = (domNode, lookAtScrollTop, lookAtScrollLeft) => {
      const newScrollPosition = {};
      if (lookAtScrollTop) {
        const deltaTop = domNode.scrollTop;
        if (deltaTop) {
          newScrollPosition.scrollTop = this._context.viewLayout.getCurrentScrollTop() + deltaTop;
          domNode.scrollTop = 0;
        }
      }
      if (lookAtScrollLeft) {
        const deltaLeft = domNode.scrollLeft;
        if (deltaLeft) {
          newScrollPosition.scrollLeft = this._context.viewLayout.getCurrentScrollLeft() + deltaLeft;
          domNode.scrollLeft = 0;
        }
      }
      this._context.viewModel.viewLayout.setScrollPosition(newScrollPosition, 1 /* Immediate */);
    };
    this._register(addDisposableListener(viewDomNode.domNode, "scroll", (e) => onBrowserDesperateReveal(viewDomNode.domNode, true, true)));
    this._register(addDisposableListener(linesContent.domNode, "scroll", (e) => onBrowserDesperateReveal(linesContent.domNode, true, false)));
    this._register(addDisposableListener(overflowGuardDomNode.domNode, "scroll", (e) => onBrowserDesperateReveal(overflowGuardDomNode.domNode, true, false)));
    this._register(addDisposableListener(this.scrollbarDomNode.domNode, "scroll", (e) => onBrowserDesperateReveal(this.scrollbarDomNode.domNode, true, false)));
  }
  _setLayout() {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this.scrollbarDomNode.setLeft(layoutInfo.contentLeft);
    const minimap = options3.get(81 /* minimap */);
    const side = minimap.side;
    if (side === "right") {
      this.scrollbarDomNode.setWidth(layoutInfo.contentWidth + layoutInfo.minimap.minimapWidth);
    } else {
      this.scrollbarDomNode.setWidth(layoutInfo.contentWidth);
    }
    this.scrollbarDomNode.setHeight(layoutInfo.height);
  }
  getOverviewRulerLayoutInfo() {
    return this.scrollbar.getOverviewRulerLayoutInfo();
  }
  getDomNode() {
    return this.scrollbarDomNode;
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this.scrollbar.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.scrollbar.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    if (e.hasChanged(117 /* scrollbar */) || e.hasChanged(83 /* mouseWheelScrollSensitivity */) || e.hasChanged(49 /* fastScrollSensitivity */)) {
      const options3 = this._context.configuration.options;
      const scrollbar = options3.get(117 /* scrollbar */);
      const mouseWheelScrollSensitivity = options3.get(83 /* mouseWheelScrollSensitivity */);
      const fastScrollSensitivity = options3.get(49 /* fastScrollSensitivity */);
      const scrollPredominantAxis = options3.get(120 /* scrollPredominantAxis */);
      const newOpts = {
        vertical: scrollbar.vertical,
        horizontal: scrollbar.horizontal,
        verticalScrollbarSize: scrollbar.verticalScrollbarSize,
        horizontalScrollbarSize: scrollbar.horizontalScrollbarSize,
        scrollByPage: scrollbar.scrollByPage,
        handleMouseWheel: scrollbar.handleMouseWheel,
        mouseWheelScrollSensitivity,
        fastScrollSensitivity,
        scrollPredominantAxis
      };
      this.scrollbar.updateOptions(newOpts);
    }
    if (e.hasChanged(165 /* layoutInfo */)) {
      this._setLayout();
    }
    return true;
  }
  onScrollChanged(e) {
    return true;
  }
  onThemeChanged(e) {
    this.scrollbar.updateClassName("editor-scrollable " + getThemeTypeSelector(this._context.theme.type));
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    this.scrollbar.renderNow();
  }
};
export { EditorScrollbar2 };
