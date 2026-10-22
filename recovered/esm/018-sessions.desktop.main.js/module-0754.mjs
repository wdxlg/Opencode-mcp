// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestWidgetDetails.ts
import { Emitter } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, Dimension, append, clearNode, getClientArea, hide, show, size } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ResizableHTMLElement } from "./module-0585.mjs";


// src/vs/editor/contrib/suggest/browser/suggestWidgetDetails.ts
function canExpandCompletionItem(item) {
  return !!item && Boolean(item.completion.documentation || item.completion.detail && item.completion.detail !== item.completion.label);
}

var SuggestDetailsWidget = class {
  constructor(_editor, _themeService, _markdownRendererService) {
    this._editor = _editor;
    this._themeService = _themeService;
    this._markdownRendererService = _markdownRendererService;
    this._onDidClose = new Emitter();
    this.onDidClose = this._onDidClose.event;
    this._onDidChangeContents = new Emitter();
    this.onDidChangeContents = this._onDidChangeContents.event;
    this._disposables = new DisposableStore();
    this._renderDisposeable = new DisposableStore();
    this._size = new Dimension(330, 0);
    this.domNode = $(".suggest-details");
    this.domNode.classList.add("no-docs");
    this._body = $(".body");
    this._scrollbar = new DomScrollableElement(this._body, {
      alwaysConsumeMouseWheel: true
    });
    append(this.domNode, this._scrollbar.getDomNode());
    this._disposables.add(this._scrollbar);
    this._header = append(this._body, $(".header"));
    this._close = append(this._header, $("span" + ThemeIcon.asCSSSelector(Codicon.close)));
    this._close.title = localize(1676, null);
    this._close.ariaLabel = localize(1676, null);
    this._close.role = "button";
    this._close.tabIndex = -1;
    this._type = append(this._header, $("p.type"));
    this._docs = append(this._body, $("p.docs"));
    this._configureFont();
    this._disposables.add(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(59 /* fontInfo */)) {
        this._configureFont();
      }
    }));
  }
  dispose() {
    this._disposables.dispose();
    this._renderDisposeable.dispose();
    this._onDidClose.dispose();
    this._onDidChangeContents.dispose();
  }
  _configureFont() {
    const options3 = this._editor.getOptions();
    const fontInfo = options3.get(59 /* fontInfo */);
    const fontFamily = fontInfo.getMassagedFontFamily();
    const fontSize = options3.get(135 /* suggestFontSize */) || fontInfo.fontSize;
    const lineHeight = options3.get(136 /* suggestLineHeight */) || fontInfo.lineHeight;
    const fontWeight = fontInfo.fontWeight;
    const fontSizePx = `${fontSize}px`;
    const lineHeightPx = `${lineHeight}px`;
    this.domNode.style.fontSize = fontSizePx;
    this.domNode.style.lineHeight = `${lineHeight / fontSize}`;
    this.domNode.style.fontWeight = fontWeight;
    this.domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
    this._type.style.fontFamily = fontFamily;
    this._close.style.height = lineHeightPx;
    this._close.style.width = lineHeightPx;
  }
  getLayoutInfo() {
    const lineHeight = this._editor.getOption(136 /* suggestLineHeight */) || this._editor.getOption(59 /* fontInfo */).lineHeight;
    const borderWidth = isHighContrast(this._themeService.getColorTheme().type) ? 2 : 1;
    const borderHeight = borderWidth * 2;
    return {
      lineHeight,
      borderWidth,
      borderHeight,
      verticalPadding: 22,
      horizontalPadding: 14
    };
  }
  renderLoading() {
    this._type.textContent = localize(1677, null);
    this._docs.textContent = "";
    this.domNode.classList.remove("no-docs", "no-type");
    this.layout(this.size.width, this.getLayoutInfo().lineHeight * 2);
    this._onDidChangeContents.fire(this);
  }
  renderItem(item, explainMode) {
    this._renderDisposeable.clear();
    let { detail: detail2, documentation } = item.completion;
    if (explainMode) {
      let md = "";
      md += `score: ${item.score[0]}
`;
      md += `prefix: ${item.word ?? "(no prefix)"}
`;
      md += `word: ${item.completion.filterText ? item.completion.filterText + " (filterText)" : item.textLabel}
`;
      md += `distance: ${item.distance} (localityBonus-setting)
`;
      md += `index: ${item.idx}, based on ${item.completion.sortText && `sortText: "${item.completion.sortText}"` || "label"}
`;
      md += `commit_chars: ${item.completion.commitCharacters?.join("")}
`;
      documentation = new MarkdownString().appendCodeblock("empty", md);
      detail2 = `Provider: ${item.provider._debugDisplayName}`;
    }
    if (!explainMode && !canExpandCompletionItem(item)) {
      this.clearContents();
      return;
    }
    this.domNode.classList.remove("no-docs", "no-type");
    if (detail2) {
      const cappedDetail = detail2.length > 1e5 ? `${detail2.substr(0, 1e5)}\u2026` : detail2;
      this._type.textContent = cappedDetail;
      this._type.title = cappedDetail;
      show(this._type);
      this._type.classList.toggle("auto-wrap", !/\r?\n^\s+/gmi.test(cappedDetail));
    } else {
      clearNode(this._type);
      this._type.title = "";
      hide(this._type);
      this.domNode.classList.add("no-type");
    }
    clearNode(this._docs);
    if (typeof documentation === "string") {
      this._docs.classList.remove("markdown-docs");
      this._docs.textContent = documentation;
    } else if (documentation) {
      this._docs.classList.add("markdown-docs");
      clearNode(this._docs);
      const renderedContents = this._markdownRendererService.render(documentation, {
        context: this._editor,
        asyncRenderCallback: () => {
          this.layout(this._size.width, this._type.clientHeight + this._docs.clientHeight);
          this._onDidChangeContents.fire(this);
        }
      });
      this._docs.appendChild(renderedContents.element);
      this._renderDisposeable.add(renderedContents);
    }
    this.domNode.classList.toggle("detail-and-doc", !!detail2 && !!documentation);
    this.domNode.style.userSelect = "text";
    this.domNode.tabIndex = -1;
    this._close.onmousedown = (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
    };
    this._close.onclick = (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this._onDidClose.fire();
    };
    this._body.scrollTop = 0;
    this.layout(this._size.width, this._type.clientHeight + this._docs.clientHeight);
    this._onDidChangeContents.fire(this);
  }
  clearContents() {
    this.domNode.classList.add("no-docs");
    this._type.textContent = "";
    this._docs.textContent = "";
  }
  get isEmpty() {
    return this.domNode.classList.contains("no-docs");
  }
  get size() {
    return this._size;
  }
  layout(width2, height) {
    const newSize = new Dimension(width2, height);
    if (!Dimension.equals(newSize, this._size)) {
      this._size = newSize;
      size(this.domNode, width2, height);
    }
    this._scrollbar.scanDomNode();
  }
  scrollDown(much = 8) {
    this._body.scrollTop += much;
  }
  scrollUp(much = 8) {
    this._body.scrollTop -= much;
  }
  scrollTop() {
    this._body.scrollTop = 0;
  }
  scrollBottom() {
    this._body.scrollTop = this._body.scrollHeight;
  }
  pageDown() {
    this.scrollDown(80);
  }
  pageUp() {
    this.scrollUp(80);
  }
  focus() {
    this.domNode.focus();
  }
};

SuggestDetailsWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IMarkdownRendererService)
], SuggestDetailsWidget);

var SuggestDetailsOverlay = class {
  constructor(widget, _editor) {
    this.widget = widget;
    this._editor = _editor;
    this.allowEditorOverflow = true;
    this._disposables = new DisposableStore();
    this._added = false;
    this._preferAlignAtTop = true;
    this._resizable = new ResizableHTMLElement();
    this._resizable.domNode.classList.add("suggest-details-container");
    this._resizable.domNode.appendChild(widget.domNode);
    this._resizable.enableSashes(false, true, true, false);
    let topLeftNow;
    let sizeNow;
    let deltaTop = 0;
    let deltaLeft = 0;
    this._disposables.add(this._resizable.onDidWillResize(() => {
      topLeftNow = this._topLeft;
      sizeNow = this._resizable.size;
    }));
    this._disposables.add(this._resizable.onDidResize((e4) => {
      if (topLeftNow && sizeNow) {
        this.widget.layout(e4.dimension.width, e4.dimension.height);
        let updateTopLeft = false;
        if (e4.west) {
          deltaLeft = sizeNow.width - e4.dimension.width;
          updateTopLeft = true;
        }
        if (e4.north) {
          deltaTop = sizeNow.height - e4.dimension.height;
          updateTopLeft = true;
        }
        if (updateTopLeft) {
          this._applyTopLeft({
            top: topLeftNow.top + deltaTop,
            left: topLeftNow.left + deltaLeft
          });
        }
      }
      if (e4.done) {
        topLeftNow = void 0;
        sizeNow = void 0;
        deltaTop = 0;
        deltaLeft = 0;
        this._userSize = e4.dimension;
      }
    }));
    this._disposables.add(this.widget.onDidChangeContents(() => {
      if (this._anchorBox) {
        this._placeAtAnchor(this._anchorBox, this._userSize ?? this.widget.size, this._preferAlignAtTop);
      }
    }));
  }
  dispose() {
    this._resizable.dispose();
    this._disposables.dispose();
    this.hide();
  }
  getId() {
    return "suggest.details";
  }
  getDomNode() {
    return this._resizable.domNode;
  }
  getPosition() {
    return this._topLeft ? { preference: this._topLeft } : null;
  }
  show() {
    if (!this._added) {
      this._editor.addOverlayWidget(this);
      this._added = true;
    }
  }
  hide(sessionEnded = false) {
    this._resizable.clearSashHoverState();
    if (this._added) {
      this._editor.removeOverlayWidget(this);
      this._added = false;
      this._anchorBox = void 0;
      this._topLeft = void 0;
    }
    if (sessionEnded) {
      this._userSize = void 0;
      this.widget.clearContents();
    }
  }
  placeAtAnchor(anchor, preferAlignAtTop) {
    const anchorBox = anchor.getBoundingClientRect();
    this._anchorBox = anchorBox;
    this._preferAlignAtTop = preferAlignAtTop;
    this._placeAtAnchor(this._anchorBox, this._userSize ?? this.widget.size, preferAlignAtTop);
  }
  _placeAtAnchor(anchorBox, size3, preferAlignAtTop) {
    const bodyBox = getClientArea(this.getDomNode().ownerDocument.body);
    const info = this.widget.getLayoutInfo();
    const defaultMinSize = new Dimension(220, 2 * info.lineHeight);
    const defaultTop = anchorBox.top;
    const eastPlacement = (function() {
      const width2 = bodyBox.width - (anchorBox.left + anchorBox.width + info.borderWidth + info.horizontalPadding);
      const left2 = -info.borderWidth + anchorBox.left + anchorBox.width;
      const maxSizeTop = new Dimension(width2, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
      const maxSizeBottom = maxSizeTop.with(void 0, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
      return { top: defaultTop, left: left2, fit: width2 - size3.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width2, defaultMinSize.width)) };
    })();
    const westPlacement = (function() {
      const width2 = anchorBox.left - info.borderWidth - info.horizontalPadding;
      const left2 = Math.max(info.horizontalPadding, anchorBox.left - size3.width - info.borderWidth);
      const maxSizeTop = new Dimension(width2, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
      const maxSizeBottom = maxSizeTop.with(void 0, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
      return { top: defaultTop, left: left2, fit: width2 - size3.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width2, defaultMinSize.width)) };
    })();
    const southPlacement = (function() {
      const left2 = anchorBox.left;
      const top3 = -info.borderWidth + anchorBox.top + anchorBox.height;
      const maxSizeBottom = new Dimension(anchorBox.width - info.borderHeight, bodyBox.height - anchorBox.top - anchorBox.height - info.verticalPadding);
      return { top: top3, left: left2, fit: maxSizeBottom.height - size3.height, maxSizeBottom, maxSizeTop: maxSizeBottom, minSize: defaultMinSize.with(maxSizeBottom.width) };
    })();
    const northPlacement = (function() {
      const left2 = anchorBox.left;
      const maxSizeTop = new Dimension(anchorBox.width - info.borderHeight, anchorBox.top - info.verticalPadding);
      const top3 = Math.max(info.verticalPadding, anchorBox.top - size3.height);
      return { top: top3, left: left2, fit: maxSizeTop.height - size3.height, maxSizeTop, maxSizeBottom: maxSizeTop, minSize: defaultMinSize.with(maxSizeTop.width) };
    })();
    const verticalPlacement = preferAlignAtTop ? southPlacement : northPlacement;
    const placements = [eastPlacement, westPlacement, verticalPlacement];
    const placement = placements.find((p) => p.fit >= 0) ?? placements.sort((a, b) => b.fit - a.fit)[0];
    const bottom = anchorBox.top + anchorBox.height - info.borderHeight;
    let alignAtTop;
    let height = size3.height;
    const maxHeight = Math.max(placement.maxSizeTop.height, placement.maxSizeBottom.height);
    if (height > maxHeight) {
      height = maxHeight;
    }
    let maxSize;
    if (preferAlignAtTop) {
      if (height <= placement.maxSizeTop.height) {
        alignAtTop = true;
        maxSize = placement.maxSizeTop;
      } else {
        alignAtTop = false;
        maxSize = placement.maxSizeBottom;
      }
    } else {
      if (height <= placement.maxSizeBottom.height) {
        alignAtTop = false;
        maxSize = placement.maxSizeBottom;
      } else {
        alignAtTop = true;
        maxSize = placement.maxSizeTop;
      }
    }
    let { top: top2, left } = placement;
    if (placement === northPlacement) {
      top2 = anchorBox.top - height + info.borderWidth;
    } else if (!alignAtTop && height > anchorBox.height) {
      top2 = bottom - height;
    }
    const editorDomNode = this._editor.getDomNode();
    if (editorDomNode) {
      const editorBoundingBox = editorDomNode.getBoundingClientRect();
      top2 -= editorBoundingBox.top;
      left -= editorBoundingBox.left;
    }
    this._applyTopLeft({ left, top: top2 });
    if (placement === northPlacement) {
      this._resizable.enableSashes(true, false, false, true);
    } else {
      this._resizable.enableSashes(!alignAtTop, placement === eastPlacement, alignAtTop, placement !== eastPlacement);
    }
    this._resizable.minSize = placement.minSize;
    this._resizable.maxSize = maxSize;
    this._resizable.layout(height, Math.min(maxSize.width, size3.width));
    this.widget.layout(this._resizable.size.width, this._resizable.size.height);
  }
  _applyTopLeft(topLeft) {
    this._topLeft = topLeft;
    this._editor.layoutOverlayWidget(this);
  }
};
export { canExpandCompletionItem, SuggestDetailsWidget, SuggestDetailsOverlay };
