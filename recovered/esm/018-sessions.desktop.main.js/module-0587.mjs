// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/contentHoverWidget.ts
import { ResizableContentWidget } from "./module-0586.mjs";
import { Dimension, append, getClientArea, getDomNodePagePosition, getTotalHeight, getTotalWidth, trackFocus } from "./module-0075.mjs";
import { HoverWidget, getHoverAccessibleViewHint } from "./module-0469.mjs";
import { Emitter } from "./module-0017.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/editor/contrib/hover/browser/contentHoverWidget.ts
var HORIZONTAL_SCROLLING_BY = 30;

var ContentHoverWidget = class extends ResizableContentWidget {
  constructor(editor, contextKeyService, _configurationService, _accessibilityService, _keybindingService) {
    const minimumHeight = editor.getOption(75 /* lineHeight */) + 8;
    const minimumWidth = 150;
    const minimumSize = new Dimension(minimumWidth, minimumHeight);
    super(editor, minimumSize);
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._keybindingService = _keybindingService;
    this._hover = this._register(new HoverWidget(true));
    this._onDidResize = this._register(new Emitter());
    this.onDidResize = this._onDidResize.event;
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this._onContentsChanged = this._register(new Emitter());
    this.onContentsChanged = this._onContentsChanged.event;
    this._minimumSize = minimumSize;
    this._hoverVisibleKey = EditorContextKeys.hoverVisible.bindTo(contextKeyService);
    this._hoverFocusedKey = EditorContextKeys.hoverFocused.bindTo(contextKeyService);
    append(this._resizableNode.domNode, this._hover.containerDomNode);
    this._resizableNode.domNode.style.zIndex = "50";
    this._resizableNode.domNode.className = "monaco-resizable-hover";
    this._register(this._editor.onDidLayoutChange(() => {
      if (this.isVisible) {
        this._updateMaxDimensions();
      }
    }));
    this._register(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(59 /* fontInfo */)) {
        this._updateFont();
      }
    }));
    const focusTracker = this._register(trackFocus(this._resizableNode.domNode));
    this._register(focusTracker.onDidFocus(() => {
      this._hoverFocusedKey.set(true);
    }));
    this._register(focusTracker.onDidBlur(() => {
      this._hoverFocusedKey.set(false);
    }));
    this._register(this._hover.scrollbar.onScroll((e4) => {
      this._onDidScroll.fire(e4);
    }));
    this._setRenderedHover(void 0);
    this._editor.addContentWidget(this);
  }
  static {
    this.ID = "editor.contrib.resizableContentHoverWidget";
  }
  static {
    this._lastDimensions = new Dimension(0, 0);
  }
  get isVisibleFromKeyboard() {
    return this._renderedHover?.source === 2 /* Keyboard */;
  }
  get isVisible() {
    return this._hoverVisibleKey.get() ?? false;
  }
  get isFocused() {
    return this._hoverFocusedKey.get() ?? false;
  }
  dispose() {
    super.dispose();
    this._renderedHover?.dispose();
    this._editor.removeContentWidget(this);
  }
  getId() {
    return ContentHoverWidget.ID;
  }
  static _applyDimensions(container2, width2, height) {
    const transformedWidth = typeof width2 === "number" ? `${width2}px` : width2;
    const transformedHeight = typeof height === "number" ? `${height}px` : height;
    container2.style.width = transformedWidth;
    container2.style.height = transformedHeight;
  }
  _setContentsDomNodeDimensions(width2, height) {
    const contentsDomNode = this._hover.contentsDomNode;
    return ContentHoverWidget._applyDimensions(contentsDomNode, width2, height);
  }
  _setContainerDomNodeDimensions(width2, height) {
    const containerDomNode = this._hover.containerDomNode;
    return ContentHoverWidget._applyDimensions(containerDomNode, width2, height);
  }
  _setScrollableElementDimensions(width2, height) {
    const scrollbarDomElement = this._hover.scrollbar.getDomNode();
    return ContentHoverWidget._applyDimensions(scrollbarDomElement, width2, height);
  }
  _setHoverWidgetDimensions(width2, height) {
    this._setContainerDomNodeDimensions(width2, height);
    this._setScrollableElementDimensions(width2, height);
    this._setContentsDomNodeDimensions(width2, height);
    this._layoutContentWidget();
  }
  static _applyMaxDimensions(container2, width2, height) {
    const transformedWidth = typeof width2 === "number" ? `${width2}px` : width2;
    const transformedHeight = typeof height === "number" ? `${height}px` : height;
    container2.style.maxWidth = transformedWidth;
    container2.style.maxHeight = transformedHeight;
  }
  _setHoverWidgetMaxDimensions(width2, height) {
    ContentHoverWidget._applyMaxDimensions(this._hover.contentsDomNode, width2, height);
    ContentHoverWidget._applyMaxDimensions(this._hover.scrollbar.getDomNode(), width2, height);
    ContentHoverWidget._applyMaxDimensions(this._hover.containerDomNode, width2, height);
    this._hover.containerDomNode.style.setProperty("--vscode-hover-maxWidth", typeof width2 === "number" ? `${width2}px` : width2);
    this._layoutContentWidget();
  }
  _setAdjustedHoverWidgetDimensions(size3) {
    this._setHoverWidgetMaxDimensions("none", "none");
    this._setHoverWidgetDimensions(size3.width, size3.height);
  }
  _updateResizableNodeMaxDimensions() {
    const maxRenderingWidth = this._findMaximumRenderingWidth() ?? Infinity;
    const maxRenderingHeight = this._findMaximumRenderingHeight() ?? Infinity;
    this._resizableNode.maxSize = new Dimension(maxRenderingWidth, maxRenderingHeight);
    this._setHoverWidgetMaxDimensions(maxRenderingWidth, maxRenderingHeight);
  }
  _resize(size3) {
    ContentHoverWidget._lastDimensions = new Dimension(size3.width, size3.height);
    this._setAdjustedHoverWidgetDimensions(size3);
    this._resizableNode.layout(size3.height, size3.width);
    this._updateResizableNodeMaxDimensions();
    this._hover.scrollbar.scanDomNode();
    this._editor.layoutContentWidget(this);
    this._onDidResize.fire();
  }
  _findAvailableSpaceVertically() {
    const position2 = this._renderedHover?.showAtPosition;
    if (!position2) {
      return;
    }
    return this._positionPreference === 1 /* ABOVE */ ? this._availableVerticalSpaceAbove(position2) : this._availableVerticalSpaceBelow(position2);
  }
  _findMaximumRenderingHeight() {
    const availableSpace = this._findAvailableSpaceVertically();
    if (!availableSpace) {
      return;
    }
    const children = this._hover.contentsDomNode.children;
    let maximumHeight = children.length - 1;
    Array.from(this._hover.contentsDomNode.children).forEach((hoverPart) => {
      maximumHeight += hoverPart.clientHeight;
    });
    return Math.min(availableSpace, maximumHeight);
  }
  _isHoverTextOverflowing() {
    this._hover.containerDomNode.style.setProperty("--vscode-hover-whiteSpace", "nowrap");
    this._hover.containerDomNode.style.setProperty("--vscode-hover-sourceWhiteSpace", "nowrap");
    const overflowing = Array.from(this._hover.contentsDomNode.children).some((hoverElement) => {
      return hoverElement.scrollWidth > hoverElement.clientWidth;
    });
    this._hover.containerDomNode.style.removeProperty("--vscode-hover-whiteSpace");
    this._hover.containerDomNode.style.removeProperty("--vscode-hover-sourceWhiteSpace");
    return overflowing;
  }
  _findMaximumRenderingWidth() {
    if (!this._editor || !this._editor.hasModel()) {
      return;
    }
    const overflowing = this._isHoverTextOverflowing();
    const initialWidth = typeof this._contentWidth === "undefined" ? 0 : this._contentWidth;
    if (overflowing || this._hover.containerDomNode.clientWidth < initialWidth) {
      const bodyBoxWidth = getClientArea(this._hover.containerDomNode.ownerDocument.body).width;
      const horizontalPadding = 14;
      return bodyBoxWidth - horizontalPadding;
    } else {
      return this._hover.containerDomNode.clientWidth;
    }
  }
  isMouseGettingCloser(posx, posy) {
    if (!this._renderedHover) {
      return false;
    }
    if (this._renderedHover.initialMousePosX === void 0 || this._renderedHover.initialMousePosY === void 0) {
      this._renderedHover.initialMousePosX = posx;
      this._renderedHover.initialMousePosY = posy;
      return false;
    }
    const widgetRect = getDomNodePagePosition(this.getDomNode());
    if (this._renderedHover.closestMouseDistance === void 0) {
      this._renderedHover.closestMouseDistance = computeDistanceFromPointToRectangle(
        this._renderedHover.initialMousePosX,
        this._renderedHover.initialMousePosY,
        widgetRect.left,
        widgetRect.top,
        widgetRect.width,
        widgetRect.height
      );
    }
    const distance = computeDistanceFromPointToRectangle(
      posx,
      posy,
      widgetRect.left,
      widgetRect.top,
      widgetRect.width,
      widgetRect.height
    );
    if (distance > this._renderedHover.closestMouseDistance + 4) {
      return false;
    }
    this._renderedHover.closestMouseDistance = Math.min(this._renderedHover.closestMouseDistance, distance);
    return true;
  }
  _setRenderedHover(renderedHover) {
    this._renderedHover?.dispose();
    this._renderedHover = renderedHover;
    this._hoverVisibleKey.set(!!renderedHover);
    this._hover.containerDomNode.classList.toggle("hidden", !renderedHover);
  }
  _updateFont() {
    const { fontSize, lineHeight } = this._editor.getOption(59 /* fontInfo */);
    const contentsDomNode = this._hover.contentsDomNode;
    contentsDomNode.style.fontSize = `${fontSize}px`;
    contentsDomNode.style.lineHeight = `${lineHeight / fontSize}`;
    const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName("code"));
    codeClasses.forEach((node) => this._editor.applyFontInfo(node));
  }
  _updateContent(node) {
    const contentsDomNode = this._hover.contentsDomNode;
    contentsDomNode.style.paddingBottom = "";
    contentsDomNode.textContent = "";
    contentsDomNode.appendChild(node);
  }
  _layoutContentWidget() {
    this._editor.layoutContentWidget(this);
    this._hover.onContentsChanged();
  }
  _updateMaxDimensions() {
    const height = Math.max(this._editor.getLayoutInfo().height / 4, 250, ContentHoverWidget._lastDimensions.height);
    const width2 = Math.max(this._editor.getLayoutInfo().width * 0.66, 750, ContentHoverWidget._lastDimensions.width);
    this._resizableNode.maxSize = new Dimension(width2, height);
    this._setHoverWidgetMaxDimensions(width2, height);
  }
  _render(renderedHover) {
    this._setRenderedHover(renderedHover);
    this._updateFont();
    this._updateContent(renderedHover.domNode);
    this.handleContentsChanged();
    this._editor.render();
  }
  getPosition() {
    if (!this._renderedHover) {
      return null;
    }
    return {
      position: this._renderedHover.showAtPosition,
      secondaryPosition: this._renderedHover.showAtSecondaryPosition,
      positionAffinity: this._renderedHover.shouldAppearBeforeContent ? 3 /* LeftOfInjectedText */ : void 0,
      preference: [this._positionPreference ?? 1 /* ABOVE */]
    };
  }
  show(renderedHover) {
    if (!this._editor || !this._editor.hasModel()) {
      return;
    }
    this._render(renderedHover);
    const widgetHeight = getTotalHeight(this._hover.containerDomNode);
    const widgetPosition = renderedHover.showAtPosition;
    this._positionPreference = this._findPositionPreference(widgetHeight, widgetPosition) ?? 1 /* ABOVE */;
    this.handleContentsChanged();
    if (renderedHover.shouldFocus) {
      this._hover.containerDomNode.focus();
    }
    this._onDidResize.fire();
    const hoverFocused = this._hover.containerDomNode.ownerDocument.activeElement === this._hover.containerDomNode;
    const accessibleViewHint = hoverFocused && getHoverAccessibleViewHint(
      this._configurationService.getValue("accessibility.verbosity.hover") === true && this._accessibilityService.isScreenReaderOptimized(),
      this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel() ?? ""
    );
    if (accessibleViewHint) {
      this._hover.contentsDomNode.ariaLabel = this._hover.contentsDomNode.textContent + ", " + accessibleViewHint;
    }
  }
  hide() {
    if (!this._renderedHover) {
      return;
    }
    const hoverStoleFocus = this._renderedHover.shouldFocus || this._hoverFocusedKey.get();
    this._setRenderedHover(void 0);
    this._resizableNode.maxSize = new Dimension(Infinity, Infinity);
    this._resizableNode.clearSashHoverState();
    this._hoverFocusedKey.set(false);
    this._editor.layoutContentWidget(this);
    if (hoverStoleFocus) {
      this._editor.focus();
    }
  }
  _removeConstraintsRenderNormally() {
    const layoutInfo = this._editor.getLayoutInfo();
    this._resizableNode.layout(layoutInfo.height, layoutInfo.width);
    this._setHoverWidgetDimensions("auto", "auto");
    this._updateMaxDimensions();
  }
  setMinimumDimensions(dimensions) {
    this._minimumSize = new Dimension(
      Math.max(this._minimumSize.width, dimensions.width),
      Math.max(this._minimumSize.height, dimensions.height)
    );
    this._updateMinimumWidth();
  }
  _updateMinimumWidth() {
    const width2 = typeof this._contentWidth === "undefined" ? this._minimumSize.width : Math.min(this._contentWidth, this._minimumSize.width);
    this._resizableNode.minSize = new Dimension(width2, this._minimumSize.height);
  }
  handleContentsChanged() {
    this._removeConstraintsRenderNormally();
    const contentsDomNode = this._hover.contentsDomNode;
    let height = getTotalHeight(contentsDomNode);
    let width2 = getTotalWidth(contentsDomNode) + 2;
    this._resizableNode.layout(height, width2);
    this._setHoverWidgetDimensions(width2, height);
    height = getTotalHeight(contentsDomNode);
    width2 = getTotalWidth(contentsDomNode);
    this._contentWidth = width2;
    this._updateMinimumWidth();
    this._resizableNode.layout(height, width2);
    if (this._renderedHover?.showAtPosition) {
      const widgetHeight = getTotalHeight(this._hover.containerDomNode);
      this._positionPreference = this._findPositionPreference(widgetHeight, this._renderedHover.showAtPosition);
    }
    this._layoutContentWidget();
    this._onContentsChanged.fire();
  }
  focus() {
    this._hover.containerDomNode.focus();
  }
  scrollUp() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const fontInfo = this._editor.getOption(59 /* fontInfo */);
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop - fontInfo.lineHeight });
  }
  scrollDown() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const fontInfo = this._editor.getOption(59 /* fontInfo */);
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop + fontInfo.lineHeight });
  }
  scrollLeft() {
    const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
    this._hover.scrollbar.setScrollPosition({ scrollLeft: scrollLeft - HORIZONTAL_SCROLLING_BY });
  }
  scrollRight() {
    const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
    this._hover.scrollbar.setScrollPosition({ scrollLeft: scrollLeft + HORIZONTAL_SCROLLING_BY });
  }
  pageUp() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop - scrollHeight });
  }
  pageDown() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop + scrollHeight });
  }
  goToTop() {
    this._hover.scrollbar.setScrollPosition({ scrollTop: 0 });
  }
  goToBottom() {
    this._hover.scrollbar.setScrollPosition({ scrollTop: this._hover.scrollbar.getScrollDimensions().scrollHeight });
  }
};

ContentHoverWidget = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IAccessibilityService),
  __decorateParam(4, IKeybindingService)
], ContentHoverWidget);

function computeDistanceFromPointToRectangle(pointX, pointY, left, top2, width2, height) {
  const x = left + width2 / 2;
  const y = top2 + height / 2;
  const dx = Math.max(Math.abs(pointX - x) - width2 / 2, 0);
  const dy = Math.max(Math.abs(pointY - y) - height / 2, 0);
  return Math.sqrt(dx * dx + dy * dy);
}
export { computeDistanceFromPointToRectangle, HORIZONTAL_SCROLLING_BY, ContentHoverWidget };
