// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/native/screenReaderSupport.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Selection } from "./module-0107.mjs";
import { RichScreenReaderContent } from "./module-0358.mjs";
import { SimpleScreenReaderContent } from "./module-0359.mjs";
import { localize } from "./module-0001.mjs";
import { ariaLabelForScreenReaderContent } from "./module-0354.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/editor/browser/controller/editContext/native/screenReaderSupport.ts
var ScreenReaderSupport = class extends Disposable {
  constructor(_domNode, _context, _viewController, _keybindingService, _accessibilityService) {
    super();
    this._domNode = _domNode;
    this._context = _context;
    this._viewController = _viewController;
    this._keybindingService = _keybindingService;
    this._accessibilityService = _accessibilityService;
    // Configuration values
    this._contentLeft = 1;
    this._contentWidth = 1;
    this._contentHeight = 1;
    this._divWidth = 1;
    this._primarySelection = new Selection(1, 1, 1, 1);
    this._primaryCursorVisibleRange = null;
    this._state = this._register(new MutableDisposable());
    this._instantiateScreenReaderContent();
    this._updateConfigurationSettings();
    this._updateDomAttributes();
  }
  onWillPaste() {
    this._state.value?.onWillPaste();
  }
  onWillCut() {
    this._state.value?.onWillCut();
  }
  handleFocusChange(newFocusValue) {
    this._state.value?.onFocusChange(newFocusValue);
    this.writeScreenReaderContent();
  }
  onConfigurationChanged(e) {
    this._instantiateScreenReaderContent();
    this._updateConfigurationSettings();
    this._updateDomAttributes();
    if (e.hasChanged(2 /* accessibilitySupport */)) {
      this.writeScreenReaderContent();
    }
  }
  _instantiateScreenReaderContent() {
    const renderRichContent = this._context.configuration.options.get(107 /* renderRichScreenReaderContent */);
    if (this._renderRichContent !== renderRichContent) {
      this._renderRichContent = renderRichContent;
      this._state.value = this._createScreenReaderContent(renderRichContent);
    }
  }
  _createScreenReaderContent(renderRichContent) {
    if (renderRichContent) {
      return new RichScreenReaderContent(this._domNode, this._context, this._viewController, this._accessibilityService);
    } else {
      return new SimpleScreenReaderContent(this._domNode, this._context, this._viewController, this._accessibilityService);
    }
  }
  _updateConfigurationSettings() {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const wrappingColumn = layoutInfo.wrappingColumn;
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    this._contentHeight = layoutInfo.height;
    this._fontInfo = options3.get(59 /* fontInfo */);
    this._divWidth = Math.round(wrappingColumn * this._fontInfo.typicalHalfwidthCharacterWidth);
    this._state.value?.onConfigurationChanged(options3);
  }
  _updateDomAttributes() {
    const options3 = this._context.configuration.options;
    this._domNode.domNode.setAttribute("role", "textbox");
    this._domNode.domNode.setAttribute("aria-required", options3.get(9 /* ariaRequired */) ? "true" : "false");
    this._domNode.domNode.setAttribute("aria-multiline", "true");
    this._domNode.domNode.setAttribute("aria-autocomplete", options3.get(104 /* readOnly */) ? "none" : "both");
    this._domNode.domNode.setAttribute("aria-roledescription", localize(175, null));
    this._domNode.domNode.setAttribute("aria-label", ariaLabelForScreenReaderContent(options3, this._keybindingService));
    const tabSize = this._context.viewModel.model.getOptions().tabSize;
    const spaceWidth = options3.get(59 /* fontInfo */).spaceWidth;
    this._domNode.domNode.style.tabSize = `${tabSize * spaceWidth}px`;
    const wordWrapOverride2 = options3.get(154 /* wordWrapOverride2 */);
    const wordWrapOverride1 = wordWrapOverride2 === "inherit" ? options3.get(153 /* wordWrapOverride1 */) : wordWrapOverride2;
    const wordWrap = wordWrapOverride1 === "inherit" ? options3.get(149 /* wordWrap */) : wordWrapOverride1;
    this._domNode.domNode.style.textWrap = wordWrap === "off" ? "nowrap" : "wrap";
  }
  onCursorStateChanged(e) {
    this._primarySelection = e.selections[0] ?? new Selection(1, 1, 1, 1);
  }
  prepareRender(ctx) {
    this.writeScreenReaderContent();
    this._primaryCursorVisibleRange = ctx.visibleRangeForPosition(this._primarySelection.getPosition());
  }
  render(ctx) {
    if (!this._primaryCursorVisibleRange) {
      this._renderAtTopLeft();
      return;
    }
    const editorScrollLeft = this._context.viewLayout.getCurrentScrollLeft();
    const left = this._contentLeft + this._primaryCursorVisibleRange.left - editorScrollLeft;
    if (left < this._contentLeft || left > this._contentLeft + this._contentWidth) {
      this._renderAtTopLeft();
      return;
    }
    const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
    const positionLineNumber = this._primarySelection.positionLineNumber;
    const top2 = this._context.viewLayout.getVerticalOffsetForLineNumber(positionLineNumber) - editorScrollTop;
    if (top2 < 0 || top2 > this._contentHeight) {
      this._renderAtTopLeft();
      return;
    }
    const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(positionLineNumber);
    this._doRender(top2, this._contentLeft, this._divWidth, lineHeight);
    this._state.value?.updateScrollTop(this._primarySelection);
  }
  _renderAtTopLeft() {
    this._doRender(0, 0, this._contentWidth, 1);
  }
  _doRender(top2, left, width2, height) {
    applyFontInfo(this._domNode, this._fontInfo);
    this._domNode.setTop(top2);
    this._domNode.setLeft(left);
    this._domNode.setWidth(width2);
    this._domNode.setHeight(height);
    this._domNode.setLineHeight(height);
  }
  setAriaOptions(options3) {
    if (options3.activeDescendant) {
      this._domNode.setAttribute("aria-haspopup", "true");
      this._domNode.setAttribute("aria-autocomplete", "list");
      this._domNode.setAttribute("aria-activedescendant", options3.activeDescendant);
    } else {
      this._domNode.setAttribute("aria-haspopup", "false");
      this._domNode.setAttribute("aria-autocomplete", "both");
      this._domNode.removeAttribute("aria-activedescendant");
    }
    if (options3.role) {
      this._domNode.setAttribute("role", options3.role);
    }
  }
  writeScreenReaderContent() {
    this._state.value?.updateScreenReaderContent(this._primarySelection);
  }
};

ScreenReaderSupport = __decorateClass([
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IAccessibilityService)
], ScreenReaderSupport);
export { ScreenReaderSupport };
