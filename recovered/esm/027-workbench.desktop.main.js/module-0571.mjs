// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codelens/browser/codelensWidget.ts
import { renderLabelWithIcons } from "./module-0467.mjs";
import { $, reset } from "./module-0075.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/codelens/browser/codelensWidget.ts
var CodeLensViewZone = class {
  constructor(afterLineNumber, heightInPx, onHeight) {
    /**
     * We want that this view zone, which reserves space for a code lens appears
     * as close as possible to the next line, so we use a very large value here.
     */
    this.afterColumn = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
    this.afterLineNumber = afterLineNumber;
    this.heightInPx = heightInPx;
    this._onHeight = onHeight;
    this.suppressMouseDown = true;
    this.domNode = document.createElement("div");
  }
  onComputedHeight(height) {
    if (this._lastHeight === void 0) {
      this._lastHeight = height;
    } else if (this._lastHeight !== height) {
      this._lastHeight = height;
      this._onHeight();
    }
  }
  isVisible() {
    return this._lastHeight !== 0 && this.domNode.hasAttribute("monaco-visible-view-zone");
  }
};

var CodeLensContentWidget = class _CodeLensContentWidget {
  constructor(editor, line) {
    // Editor.IContentWidget.allowEditorOverflow
    this.allowEditorOverflow = false;
    this.suppressMouseDown = true;
    this._commands = /* @__PURE__ */ new Map();
    this._isEmpty = true;
    this._editor = editor;
    this._id = `codelens.widget-${_CodeLensContentWidget._idPool++}`;
    this.updatePosition(line);
    this._domNode = document.createElement("span");
    this._domNode.className = `codelens-decoration`;
  }
  static {
    this._idPool = 0;
  }
  withCommands(lenses, animate2) {
    this._commands.clear();
    const children = [];
    let hasSymbol = false;
    for (let i2 = 0; i2 < lenses.length; i2++) {
      const lens = lenses[i2];
      if (!lens) {
        continue;
      }
      hasSymbol = true;
      if (lens.command) {
        const title = renderLabelWithIcons(lens.command.title.trim());
        if (lens.command.id) {
          const id2 = `c${_CodeLensContentWidget._idPool++}`;
          children.push($("a", { id: id2, title: lens.command.tooltip, role: "button" }, ...title));
          this._commands.set(id2, lens.command);
        } else {
          children.push($("span", { title: lens.command.tooltip }, ...title));
        }
        if (i2 + 1 < lenses.length) {
          children.push($("span", void 0, "\xA0|\xA0"));
        }
      }
    }
    if (!hasSymbol) {
      reset(this._domNode, $("span", void 0, "no commands"));
    } else {
      reset(this._domNode, ...children);
      if (this._isEmpty && animate2) {
        this._domNode.classList.add("fadein");
      }
      this._isEmpty = false;
    }
  }
  getCommand(link2) {
    return link2.parentElement === this._domNode ? this._commands.get(link2.id) : void 0;
  }
  getId() {
    return this._id;
  }
  getDomNode() {
    return this._domNode;
  }
  updatePosition(line) {
    const column = this._editor.getModel().getLineFirstNonWhitespaceColumn(line);
    this._widgetPosition = {
      position: { lineNumber: line, column },
      preference: [1 /* ABOVE */]
    };
  }
  getPosition() {
    return this._widgetPosition || null;
  }
};

var CodeLensHelper = class {
  constructor() {
    this._removeDecorations = [];
    this._addDecorations = [];
    this._addDecorationsCallbacks = [];
  }
  addDecoration(decoration3, callback) {
    this._addDecorations.push(decoration3);
    this._addDecorationsCallbacks.push(callback);
  }
  removeDecoration(decorationId) {
    this._removeDecorations.push(decorationId);
  }
  commit(changeAccessor) {
    const resultingDecorations = changeAccessor.deltaDecorations(this._removeDecorations, this._addDecorations);
    for (let i2 = 0, len = resultingDecorations.length; i2 < len; i2++) {
      this._addDecorationsCallbacks[i2](resultingDecorations[i2]);
    }
  }
};

var codeLensDecorationOptions = ModelDecorationOptions.register({
  collapseOnReplaceEdit: true,
  description: "codelens"
});

var CodeLensWidget = class {
  constructor(data, editor, helper, viewZoneChangeAccessor, heightInPx, updateCallback) {
    this._isDisposed = false;
    this._editor = editor;
    this._data = data;
    this._decorationIds = [];
    let range2;
    const lenses = [];
    this._data.forEach((codeLensData, i2) => {
      if (codeLensData.symbol.command) {
        lenses.push(codeLensData.symbol);
      }
      helper.addDecoration({
        range: codeLensData.symbol.range,
        options: codeLensDecorationOptions
      }, (id2) => this._decorationIds[i2] = id2);
      if (!range2) {
        range2 = Range2.lift(codeLensData.symbol.range);
      } else {
        range2 = Range2.plusRange(range2, codeLensData.symbol.range);
      }
    });
    this._viewZone = new CodeLensViewZone(range2.startLineNumber - 1, heightInPx, updateCallback);
    this._viewZoneId = viewZoneChangeAccessor.addZone(this._viewZone);
    if (lenses.length > 0) {
      this._createContentWidgetIfNecessary();
      this._contentWidget.withCommands(lenses, false);
    }
  }
  _createContentWidgetIfNecessary() {
    if (!this._contentWidget) {
      this._contentWidget = new CodeLensContentWidget(this._editor, this._viewZone.afterLineNumber + 1);
      this._editor.addContentWidget(this._contentWidget);
    } else {
      this._editor.layoutContentWidget(this._contentWidget);
    }
  }
  dispose(helper, viewZoneChangeAccessor) {
    this._decorationIds.forEach(helper.removeDecoration, helper);
    this._decorationIds = [];
    viewZoneChangeAccessor?.removeZone(this._viewZoneId);
    if (this._contentWidget) {
      this._editor.removeContentWidget(this._contentWidget);
      this._contentWidget = void 0;
    }
    this._isDisposed = true;
  }
  isDisposed() {
    return this._isDisposed;
  }
  isValid() {
    return this._decorationIds.some((id2, i2) => {
      const range2 = this._editor.getModel().getDecorationRange(id2);
      const symbol = this._data[i2].symbol;
      return !!(range2 && Range2.isEmpty(symbol.range) === range2.isEmpty());
    });
  }
  updateCodeLensSymbols(data, helper) {
    this._decorationIds.forEach(helper.removeDecoration, helper);
    this._decorationIds = [];
    this._data = data;
    this._data.forEach((codeLensData, i2) => {
      helper.addDecoration({
        range: codeLensData.symbol.range,
        options: codeLensDecorationOptions
      }, (id2) => this._decorationIds[i2] = id2);
    });
  }
  updateHeight(height, viewZoneChangeAccessor) {
    this._viewZone.heightInPx = height;
    viewZoneChangeAccessor.layoutZone(this._viewZoneId);
    if (this._contentWidget) {
      this._editor.layoutContentWidget(this._contentWidget);
    }
  }
  computeIfNecessary(model) {
    if (!this._viewZone.isVisible()) {
      return null;
    }
    for (let i2 = 0; i2 < this._decorationIds.length; i2++) {
      const range2 = model.getDecorationRange(this._decorationIds[i2]);
      if (range2) {
        this._data[i2].symbol.range = range2;
      }
    }
    return this._data;
  }
  updateCommands(symbols) {
    this._createContentWidgetIfNecessary();
    this._contentWidget.withCommands(symbols, true);
    for (let i2 = 0; i2 < this._data.length; i2++) {
      const resolved = symbols[i2];
      if (resolved) {
        const { symbol } = this._data[i2];
        symbol.command = resolved.command || symbol.command;
      }
    }
  }
  getCommand(link2) {
    return this._contentWidget?.getCommand(link2);
  }
  getLineNumber() {
    const range2 = this._editor.getModel().getDecorationRange(this._decorationIds[0]);
    if (range2) {
      return range2.startLineNumber;
    }
    return -1;
  }
  update(viewZoneChangeAccessor) {
    if (this.isValid()) {
      const range2 = this._editor.getModel().getDecorationRange(this._decorationIds[0]);
      if (range2) {
        this._viewZone.afterLineNumber = range2.startLineNumber - 1;
        viewZoneChangeAccessor.layoutZone(this._viewZoneId);
        if (this._contentWidget) {
          this._contentWidget.updatePosition(range2.startLineNumber);
          this._editor.layoutContentWidget(this._contentWidget);
        }
      }
    }
  }
  getItems() {
    return this._data;
  }
};
export { CodeLensViewZone, CodeLensContentWidget, CodeLensHelper, codeLensDecorationOptions, CodeLensWidget };
