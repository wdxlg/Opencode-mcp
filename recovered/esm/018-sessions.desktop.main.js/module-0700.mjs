// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoError/browser/gotoErrorWidget.ts
import { DisposableStore, dispose } from "./module-0012.mjs";
import { $, addStandardDisposableListener, append, clearNode } from "./module-0075.mjs";
import { ScrollableElement } from "./module-0259.mjs";
import { splitLines } from "./module-0030.mjs";
import { status } from "./module-0076.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { PeekViewWidget, peekViewTitleForeground, peekViewTitleInfoForeground } from "./module-0623.mjs";
import { Emitter } from "./module-0017.mjs";
import { Color } from "./module-0197.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatActionBarActions } from "./module-0516.mjs";
import { Range2 } from "./module-0106.mjs";
import { basename2 } from "./module-0034.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { MarkerSeverity2 } from "./module-0560.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILabelService } from "./module-0641.mjs";
import { oneOf, registerColor, transparent } from "./module-0226.mjs";
import { editorBackground, editorErrorBorder, editorErrorForeground, editorInfoBorder, editorInfoForeground, editorWarningBorder, editorWarningForeground } from "./module-0229.mjs";
import { contrastBorder } from "./module-0227.mjs";


// src/vs/editor/contrib/gotoError/browser/gotoErrorWidget.ts
var MessageWidget2 = class {
  constructor(parent, editor, onRelatedInformation, _openerService, _labelService) {
    this._openerService = _openerService;
    this._labelService = _labelService;
    this._lines = 0;
    this._longestLineLength = 0;
    this._relatedDiagnostics = /* @__PURE__ */ new WeakMap();
    this._disposables = new DisposableStore();
    this._editor = editor;
    const domNode = document.createElement("div");
    domNode.className = "descriptioncontainer";
    this._messageBlock = document.createElement("div");
    this._messageBlock.classList.add("message");
    this._messageBlock.setAttribute("aria-live", "assertive");
    this._messageBlock.setAttribute("role", "alert");
    domNode.appendChild(this._messageBlock);
    this._relatedBlock = document.createElement("div");
    domNode.appendChild(this._relatedBlock);
    this._disposables.add(addStandardDisposableListener(this._relatedBlock, "click", (event) => {
      event.preventDefault();
      const related = this._relatedDiagnostics.get(event.target);
      if (related) {
        onRelatedInformation(related);
      }
    }));
    this._scrollable = new ScrollableElement(domNode, {
      horizontal: 1 /* Auto */,
      vertical: 1 /* Auto */,
      useShadows: false,
      horizontalScrollbarSize: 6,
      verticalScrollbarSize: 6
    });
    parent.appendChild(this._scrollable.getDomNode());
    this._disposables.add(this._scrollable.onScroll((e4) => {
      domNode.style.left = `-${e4.scrollLeft}px`;
      domNode.style.top = `-${e4.scrollTop}px`;
    }));
    this._disposables.add(this._scrollable);
  }
  dispose() {
    dispose(this._disposables);
  }
  update(marker) {
    const { source, message, relatedInformation, code } = marker;
    let sourceAndCodeLength = (source?.length || 0) + "()".length;
    if (code) {
      if (typeof code === "string") {
        sourceAndCodeLength += code.length;
      } else {
        sourceAndCodeLength += code.value.length;
      }
    }
    const lines = splitLines(message);
    this._lines = lines.length;
    this._longestLineLength = 0;
    for (const line of lines) {
      this._longestLineLength = Math.max(line.length + sourceAndCodeLength, this._longestLineLength);
    }
    clearNode(this._messageBlock);
    this._messageBlock.setAttribute("aria-label", this.getAriaLabel(marker));
    status(this.getAriaLabel(marker));
    this._editor.applyFontInfo(this._messageBlock);
    let lastLineElement = this._messageBlock;
    for (const line of lines) {
      lastLineElement = document.createElement("div");
      lastLineElement.innerText = line;
      if (line === "") {
        lastLineElement.style.height = this._messageBlock.style.lineHeight;
      }
      this._messageBlock.appendChild(lastLineElement);
    }
    if (source || code) {
      const detailsElement = document.createElement("span");
      detailsElement.classList.add("details");
      lastLineElement.appendChild(detailsElement);
      if (source) {
        const sourceElement = document.createElement("span");
        sourceElement.innerText = source;
        sourceElement.classList.add("source");
        detailsElement.appendChild(sourceElement);
      }
      if (code) {
        if (typeof code === "string") {
          const codeElement = document.createElement("span");
          codeElement.innerText = `(${code})`;
          codeElement.classList.add("code");
          detailsElement.appendChild(codeElement);
        } else {
          this._codeLink = $("a.code-link");
          this._codeLink.setAttribute("href", `${code.target.toString()}`);
          this._codeLink.onclick = (e4) => {
            this._openerService.open(code.target);
            e4.preventDefault();
            e4.stopPropagation();
          };
          const codeElement = append(this._codeLink, $("span"));
          codeElement.innerText = code.value;
          detailsElement.appendChild(this._codeLink);
        }
      }
    }
    clearNode(this._relatedBlock);
    this._editor.applyFontInfo(this._relatedBlock);
    if (isNonEmptyArray(relatedInformation)) {
      const relatedInformationNode = this._relatedBlock.appendChild(document.createElement("div"));
      relatedInformationNode.style.paddingTop = `${Math.floor(this._editor.getOption(75 /* lineHeight */) * 0.66)}px`;
      this._lines += 1;
      for (const related of relatedInformation) {
        const container2 = document.createElement("div");
        const relatedResource = document.createElement("a");
        relatedResource.classList.add("filename");
        relatedResource.innerText = `${this._labelService.getUriBasenameLabel(related.resource)}(${related.startLineNumber}, ${related.startColumn}): `;
        relatedResource.title = this._labelService.getUriLabel(related.resource);
        this._relatedDiagnostics.set(relatedResource, related);
        const relatedMessage = document.createElement("span");
        relatedMessage.innerText = related.message;
        container2.appendChild(relatedResource);
        container2.appendChild(relatedMessage);
        this._lines += 1;
        relatedInformationNode.appendChild(container2);
      }
    }
    const fontInfo = this._editor.getOption(59 /* fontInfo */);
    const scrollWidth = Math.ceil(fontInfo.typicalFullwidthCharacterWidth * this._longestLineLength * 0.75);
    const scrollHeight = fontInfo.lineHeight * this._lines;
    this._scrollable.setScrollDimensions({ scrollWidth, scrollHeight });
  }
  layout(height, width2) {
    this._scrollable.getDomNode().style.height = `${height}px`;
    this._scrollable.getDomNode().style.width = `${width2}px`;
    this._scrollable.setScrollDimensions({ width: width2, height });
  }
  getHeightInLines() {
    return Math.min(17, this._lines);
  }
  getAriaLabel(marker) {
    let severityLabel = "";
    switch (marker.severity) {
      case 8 /* Error */:
        severityLabel = localize(1211, null);
        break;
      case 4 /* Warning */:
        severityLabel = localize(1216, null);
        break;
      case 2 /* Info */:
        severityLabel = localize(1213, null);
        break;
      case 1 /* Hint */:
        severityLabel = localize(1212, null);
        break;
    }
    let ariaLabel = localize(1214, null, severityLabel, marker.message, marker.startLineNumber + ":" + marker.startColumn);
    const model = this._editor.getModel();
    if (model && marker.startLineNumber <= model.getLineCount() && marker.startLineNumber >= 1) {
      const lineContent = model.getLineContent(marker.startLineNumber);
      ariaLabel = `${lineContent}, ${ariaLabel}`;
    }
    return ariaLabel;
  }
};

var MarkerNavigationWidget = class extends PeekViewWidget {
  constructor(editor, _themeService, _openerService, _menuService, instantiationService, _contextKeyService, _labelService) {
    super(editor, { showArrow: true, showFrame: true, isAccessible: true, frameWidth: 1 }, instantiationService);
    this._themeService = _themeService;
    this._openerService = _openerService;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._labelService = _labelService;
    this._callOnDispose = new DisposableStore();
    this._onDidSelectRelatedInformation = new Emitter();
    this.onDidSelectRelatedInformation = this._onDidSelectRelatedInformation.event;
    this._severity = 4 /* Warning */;
    this._backgroundColor = Color.white;
    this._applyTheme(_themeService.getColorTheme());
    this._callOnDispose.add(_themeService.onDidColorThemeChange(this._applyTheme.bind(this)));
    this.create();
  }
  static {
    this.TitleMenu = new MenuId("gotoErrorTitleMenu");
  }
  _applyTheme(theme) {
    this._backgroundColor = theme.getColor(editorMarkerNavigationBackground);
    let colorId = editorMarkerNavigationError;
    let headerBackground = editorMarkerNavigationErrorHeader;
    if (this._severity === 4 /* Warning */) {
      colorId = editorMarkerNavigationWarning;
      headerBackground = editorMarkerNavigationWarningHeader;
    } else if (this._severity === 2 /* Info */) {
      colorId = editorMarkerNavigationInfo;
      headerBackground = editorMarkerNavigationInfoHeader;
    }
    const frameColor = theme.getColor(colorId);
    const headerBg = theme.getColor(headerBackground);
    this.style({
      arrowColor: frameColor,
      frameColor,
      headerBackgroundColor: headerBg,
      primaryHeadingColor: theme.getColor(peekViewTitleForeground),
      secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
    });
  }
  _applyStyles() {
    if (this._parentContainer) {
      this._parentContainer.style.backgroundColor = this._backgroundColor ? this._backgroundColor.toString() : "";
    }
    super._applyStyles();
  }
  dispose() {
    this._callOnDispose.dispose();
    this._onDidSelectRelatedInformation.dispose();
    super.dispose();
  }
  focus() {
    this._parentContainer.focus();
  }
  _fillHead(container2) {
    super._fillHead(container2);
    this._disposables.add(this._actionbarWidget.actionRunner.onWillRun((e4) => this.editor.focus()));
    const menu = this._menuService.getMenuActions(MarkerNavigationWidget.TitleMenu, this._contextKeyService);
    const actions = getFlatActionBarActions(menu);
    this._actionbarWidget.push(actions, { label: false, icon: true, index: 0 });
  }
  _fillTitleIcon(container2) {
    this._icon = append(container2, $(""));
  }
  _fillBody(container2) {
    this._parentContainer = container2;
    container2.classList.add("marker-widget");
    this._parentContainer.tabIndex = 0;
    this._parentContainer.setAttribute("role", "tooltip");
    this._container = document.createElement("div");
    container2.appendChild(this._container);
    this._message = new MessageWidget2(this._container, this.editor, (related) => this._onDidSelectRelatedInformation.fire(related), this._openerService, this._labelService);
    this._disposables.add(this._message);
  }
  show() {
    throw new Error("call showAtMarker");
  }
  showAtMarker(marker, markerIdx, markerCount) {
    this._container.classList.remove("stale");
    this._message.update(marker);
    this._severity = marker.severity;
    this._applyTheme(this._themeService.getColorTheme());
    const range2 = Range2.lift(marker);
    const editorPosition = this.editor.getPosition();
    const position2 = editorPosition && range2.containsPosition(editorPosition) ? editorPosition : range2.getStartPosition();
    super.show(position2, this.computeRequiredHeight());
    const model = this.editor.getModel();
    if (model) {
      const detail2 = markerCount > 1 ? localize(1215, null, markerIdx, markerCount) : localize(1203, null, markerIdx, markerCount);
      this.setTitle(basename2(model.uri), detail2);
    }
    this._icon.className = `codicon ${SeverityIcon.className(MarkerSeverity2.toSeverity(this._severity))}`;
    this.editor.revealPositionInCenterIfOutsideViewport(position2, 0 /* Smooth */);
    this.editor.focus();
  }
  updateMarker(marker) {
    this._container.classList.remove("stale");
    this._message.update(marker);
  }
  showStale() {
    this._container.classList.add("stale");
    this._relayout();
  }
  _doLayoutBody(heightInPixel, widthInPixel) {
    super._doLayoutBody(heightInPixel, widthInPixel);
    this._heightInPixel = heightInPixel;
    this._message.layout(heightInPixel, widthInPixel);
    this._container.style.height = `${heightInPixel}px`;
  }
  _onWidth(widthInPixel) {
    this._message.layout(this._heightInPixel, widthInPixel);
  }
  _relayout() {
    super._relayout(this.computeRequiredHeight());
  }
  computeRequiredHeight() {
    return 3 + this._message.getHeightInLines();
  }
};

MarkerNavigationWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ILabelService)
], MarkerNavigationWidget);

var errorDefault = oneOf(editorErrorForeground, editorErrorBorder);

var warningDefault = oneOf(editorWarningForeground, editorWarningBorder);

var infoDefault = oneOf(editorInfoForeground, editorInfoBorder);

var editorMarkerNavigationError = registerColor("editorMarkerNavigationError.background", { dark: errorDefault, light: errorDefault, hcDark: contrastBorder, hcLight: contrastBorder }, localize(1205, null));

var editorMarkerNavigationErrorHeader = registerColor("editorMarkerNavigationError.headerBackground", { dark: transparent(editorMarkerNavigationError, 0.1), light: transparent(editorMarkerNavigationError, 0.1), hcDark: null, hcLight: null }, localize(1206, null));

var editorMarkerNavigationWarning = registerColor("editorMarkerNavigationWarning.background", { dark: warningDefault, light: warningDefault, hcDark: contrastBorder, hcLight: contrastBorder }, localize(1209, null));

var editorMarkerNavigationWarningHeader = registerColor("editorMarkerNavigationWarning.headerBackground", { dark: transparent(editorMarkerNavigationWarning, 0.1), light: transparent(editorMarkerNavigationWarning, 0.1), hcDark: "#0C141F", hcLight: transparent(editorMarkerNavigationWarning, 0.2) }, localize(1210, null));

var editorMarkerNavigationInfo = registerColor("editorMarkerNavigationInfo.background", { dark: infoDefault, light: infoDefault, hcDark: contrastBorder, hcLight: contrastBorder }, localize(1207, null));

var editorMarkerNavigationInfoHeader = registerColor("editorMarkerNavigationInfo.headerBackground", { dark: transparent(editorMarkerNavigationInfo, 0.1), light: transparent(editorMarkerNavigationInfo, 0.1), hcDark: null, hcLight: null }, localize(1208, null));

var editorMarkerNavigationBackground = registerColor("editorMarkerNavigation.background", editorBackground, localize(1204, null));
export { MessageWidget2, MarkerNavigationWidget, errorDefault, warningDefault, infoDefault, editorMarkerNavigationError, editorMarkerNavigationErrorHeader, editorMarkerNavigationWarning, editorMarkerNavigationWarningHeader, editorMarkerNavigationInfo, editorMarkerNavigationInfoHeader, editorMarkerNavigationBackground };
