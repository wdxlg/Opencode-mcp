// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/peekView/browser/peekView.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { registerEditorContribution } from "./module-0097.mjs";
import { Color } from "./module-0197.mjs";
import { ZoneWidget } from "./module-0622.mjs";
import { Emitter } from "./module-0017.mjs";
import { mixin } from "./module-0098.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { $, addStandardDisposableListener, append, clearNode, hide, show } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { registerColor } from "./module-0226.mjs";
import { editorForeground, editorInfoForeground } from "./module-0229.mjs";
import { activeContrastBorder, contrastBorder } from "./module-0227.mjs";


// src/vs/editor/contrib/peekView/browser/peekView.ts
var IPeekViewService = createDecorator("IPeekViewService");

registerSingleton(IPeekViewService, class {
  constructor() {
    this._widgets = /* @__PURE__ */ new Map();
  }
  addExclusiveWidget(editor, widget) {
    const existing = this._widgets.get(editor);
    if (existing) {
      existing.listener.dispose();
      existing.widget.dispose();
    }
    const remove2 = () => {
      const data = this._widgets.get(editor);
      if (data && data.widget === widget) {
        data.listener.dispose();
        this._widgets.delete(editor);
      }
    };
    this._widgets.set(editor, { widget, listener: widget.onDidClose(remove2) });
  }
}, 1 /* Delayed */);

var PeekContext;

((PeekContext2) => {
  PeekContext2.inPeekEditor = new RawContextKey("inReferenceSearchEditor", true, localize(1501, null));
  PeekContext2.notInPeekEditor = PeekContext2.inPeekEditor.toNegated();
})(PeekContext || (PeekContext = {}));

var PeekContextController = class {
  static {
    this.ID = "editor.contrib.referenceController";
  }
  constructor(editor, contextKeyService) {
    if (editor instanceof EmbeddedCodeEditorWidget) {
      PeekContext.inPeekEditor.bindTo(contextKeyService);
    }
  }
  dispose() {
  }
};

PeekContextController = __decorateClass([
  __decorateParam(1, IContextKeyService)
], PeekContextController);

registerEditorContribution(PeekContextController.ID, PeekContextController, 0 /* Eager */);

var defaultOptions2 = {
  headerBackgroundColor: Color.white,
  primaryHeadingColor: Color.fromHex("#333333"),
  secondaryHeadingColor: Color.fromHex("#6c6c6cb3")
};

var PeekViewWidget = class extends ZoneWidget {
  constructor(editor, options3, instantiationService) {
    super(editor, options3);
    this.instantiationService = instantiationService;
    this._onDidClose = new Emitter();
    this.onDidClose = this._onDidClose.event;
    mixin(this.options, defaultOptions2, false);
    const e = observableCodeEditor(this.editor);
    e.openedPeekWidgets.set(e.openedPeekWidgets.get() + 1, void 0);
  }
  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      super.dispose();
      this._onDidClose.fire(this);
      this._onDidClose.dispose();
      const e = observableCodeEditor(this.editor);
      e.openedPeekWidgets.set(e.openedPeekWidgets.get() - 1, void 0);
    }
  }
  style(styles) {
    const options3 = this.options;
    if (styles.headerBackgroundColor) {
      options3.headerBackgroundColor = styles.headerBackgroundColor;
    }
    if (styles.primaryHeadingColor) {
      options3.primaryHeadingColor = styles.primaryHeadingColor;
    }
    if (styles.secondaryHeadingColor) {
      options3.secondaryHeadingColor = styles.secondaryHeadingColor;
    }
    super.style(styles);
  }
  _applyStyles() {
    super._applyStyles();
    const options3 = this.options;
    if (this._headElement && options3.headerBackgroundColor) {
      this._headElement.style.backgroundColor = options3.headerBackgroundColor.toString();
    }
    if (this._primaryHeading && options3.primaryHeadingColor) {
      this._primaryHeading.style.color = options3.primaryHeadingColor.toString();
    }
    if (this._secondaryHeading && options3.secondaryHeadingColor) {
      this._secondaryHeading.style.color = options3.secondaryHeadingColor.toString();
    }
    if (this._bodyElement && options3.frameColor) {
      this._bodyElement.style.borderColor = options3.frameColor.toString();
    }
  }
  _fillContainer(container3) {
    this.setCssClass("peekview-widget");
    this._headElement = $(".head");
    this._bodyElement = $(".body");
    this._fillHead(this._headElement);
    this._fillBody(this._bodyElement);
    container3.appendChild(this._headElement);
    container3.appendChild(this._bodyElement);
  }
  _fillHead(container3, noCloseAction) {
    this._titleElement = $(".peekview-title");
    if (this.options.supportOnTitleClick) {
      this._titleElement.classList.add("clickable");
      addStandardDisposableListener(this._titleElement, "click", (event) => this._onTitleClick(event));
    }
    append(this._headElement, this._titleElement);
    this._fillTitleIcon(this._titleElement);
    this._primaryHeading = $("span.filename");
    this._secondaryHeading = $("span.dirname");
    this._metaHeading = $("span.meta");
    append(this._titleElement, this._primaryHeading, this._secondaryHeading, this._metaHeading);
    const actionsContainer = $(".peekview-actions");
    append(this._headElement, actionsContainer);
    const actionBarOptions = this._getActionBarOptions();
    this._actionbarWidget = new ActionBar(actionsContainer, actionBarOptions);
    this._disposables.add(this._actionbarWidget);
    if (!noCloseAction) {
      this._actionbarWidget.push(this._disposables.add(new Action("peekview.close", localize(1502, null), ThemeIcon.asClassName(Codicon.close), true, () => {
        this.dispose();
        return Promise.resolve();
      })), { label: false, icon: true });
    }
  }
  _fillTitleIcon(container3) {
  }
  _getActionBarOptions() {
    return {
      actionViewItemProvider: createActionViewItem.bind(void 0, this.instantiationService),
      orientation: 0 /* HORIZONTAL */
    };
  }
  _onTitleClick(event) {
  }
  setTitle(primaryHeading, secondaryHeading) {
    if (this._primaryHeading && this._secondaryHeading) {
      this._primaryHeading.innerText = primaryHeading;
      this._primaryHeading.setAttribute("title", primaryHeading);
      if (secondaryHeading) {
        this._secondaryHeading.innerText = secondaryHeading;
      } else {
        clearNode(this._secondaryHeading);
      }
    }
  }
  setMetaTitle(value2) {
    if (this._metaHeading) {
      if (value2) {
        this._metaHeading.innerText = value2;
        show(this._metaHeading);
      } else {
        hide(this._metaHeading);
      }
    }
  }
  _doLayout(heightInPixel, widthInPixel) {
    if (!this._isShowing && heightInPixel < 0) {
      this.dispose();
      return;
    }
    const headHeight = Math.ceil(this.editor.getOption(75 /* lineHeight */) * 1.2);
    const bodyHeight = Math.round(heightInPixel - (headHeight + 1));
    this._doLayoutHead(headHeight, widthInPixel);
    this._doLayoutBody(bodyHeight, widthInPixel);
  }
  _doLayoutHead(heightInPixel, widthInPixel) {
    if (this._headElement) {
      this._headElement.style.height = `${heightInPixel}px`;
      this._headElement.style.lineHeight = this._headElement.style.height;
    }
  }
  _doLayoutBody(heightInPixel, widthInPixel) {
    if (this._bodyElement) {
      this._bodyElement.style.height = `${heightInPixel}px`;
    }
  }
};

PeekViewWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], PeekViewWidget);

var peekViewTitleBackground = registerColor("peekViewTitle.background", { dark: "#252526", light: "#F3F3F3", hcDark: Color.black, hcLight: Color.white }, localize(1516, null));

var peekViewTitleForeground = registerColor("peekViewTitleLabel.foreground", { dark: Color.white, light: Color.black, hcDark: Color.white, hcLight: editorForeground }, localize(1517, null));

var peekViewTitleInfoForeground = registerColor("peekViewTitleDescription.foreground", { dark: "#ccccccb3", light: "#616161", hcDark: "#FFFFFF99", hcLight: "#292929" }, localize(1518, null));

var peekViewBorder = registerColor("peekView.border", { dark: editorInfoForeground, light: editorInfoForeground, hcDark: contrastBorder, hcLight: contrastBorder }, localize(1503, null));

var peekViewResultsBackground = registerColor("peekViewResult.background", { dark: "#252526", light: "#F3F3F3", hcDark: Color.black, hcLight: Color.white }, localize(1510, null));

var peekViewResultsMatchForeground = registerColor("peekViewResult.lineForeground", { dark: "#bbbbbb", light: "#646465", hcDark: Color.white, hcLight: editorForeground }, localize(1512, null));

var peekViewResultsFileForeground = registerColor("peekViewResult.fileForeground", { dark: Color.white, light: "#1E1E1E", hcDark: Color.white, hcLight: editorForeground }, localize(1511, null));

var peekViewResultsSelectionBackground = registerColor("peekViewResult.selectionBackground", { dark: "#3399ff33", light: "#3399ff33", hcDark: null, hcLight: null }, localize(1514, null));

var peekViewResultsSelectionForeground = registerColor("peekViewResult.selectionForeground", { dark: Color.white, light: "#6C6C6C", hcDark: Color.white, hcLight: editorForeground }, localize(1515, null));

var peekViewEditorBackground = registerColor("peekViewEditor.background", { dark: "#001F33", light: "#F2F8FC", hcDark: Color.black, hcLight: Color.white }, localize(1504, null));

var peekViewEditorGutterBackground = registerColor("peekViewEditorGutter.background", peekViewEditorBackground, localize(1505, null));

var peekViewEditorStickyScrollBackground = registerColor("peekViewEditorStickyScroll.background", peekViewEditorBackground, localize(1508, null));

var peekViewEditorStickyScrollGutterBackground = registerColor("peekViewEditorStickyScrollGutter.background", peekViewEditorBackground, localize(1509, null));

var peekViewResultsMatchHighlight = registerColor("peekViewResult.matchHighlightBackground", { dark: "#ea5c004d", light: "#ea5c004d", hcDark: null, hcLight: null }, localize(1513, null));

var peekViewEditorMatchHighlight = registerColor("peekViewEditor.matchHighlightBackground", { dark: "#ff8f0099", light: "#f5d802de", hcDark: null, hcLight: null }, localize(1506, null));

var peekViewEditorMatchHighlightBorder = registerColor("peekViewEditor.matchHighlightBorder", { dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder }, localize(1507, null));
export { IPeekViewService, PeekContext, PeekContextController, defaultOptions2, PeekViewWidget, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground, peekViewBorder, peekViewResultsBackground, peekViewResultsMatchForeground, peekViewResultsFileForeground, peekViewResultsSelectionBackground, peekViewResultsSelectionForeground, peekViewEditorBackground, peekViewEditorGutterBackground, peekViewEditorStickyScrollBackground, peekViewEditorStickyScrollGutterBackground, peekViewResultsMatchHighlight, peekViewEditorMatchHighlight, peekViewEditorMatchHighlightBorder };
