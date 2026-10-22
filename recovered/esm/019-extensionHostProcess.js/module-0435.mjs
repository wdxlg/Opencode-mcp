// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookEditor.ts
import { NotebookRange } from "./module-0237.mjs";
import { illegalArgument } from "./module-0003.mjs";
import { NotebookRange2 } from "./module-0245.mjs";


// src/vs/workbench/api/common/extHostNotebookEditor.ts
var ExtHostNotebookEditor = class _ExtHostNotebookEditor {
  constructor(id2, _proxy, notebookData, _visibleRanges, _selections, _viewColumn, viewType) {
    this.id = id2;
    this._proxy = _proxy;
    this.notebookData = notebookData;
    this._visibleRanges = _visibleRanges;
    this._selections = _selections;
    this._viewColumn = _viewColumn;
    this.viewType = viewType;
    this._visible = false;
  }
  static {
    this.apiEditorsToExtHost = /* @__PURE__ */ new WeakMap();
  }
  get apiEditor() {
    if (!this._editor) {
      const that = this;
      this._editor = {
        get notebook() {
          return that.notebookData.apiNotebook;
        },
        get selection() {
          return that._selections[0];
        },
        set selection(selection) {
          this.selections = [selection];
        },
        get selections() {
          return that._selections;
        },
        set selections(value) {
          if (!Array.isArray(value) || !value.every(NotebookRange.isNotebookRange)) {
            throw illegalArgument("selections");
          }
          that._selections = value.length === 0 ? [new NotebookRange(0, 0)] : value;
          that._trySetSelections(that._selections);
        },
        get visibleRanges() {
          return that._visibleRanges;
        },
        revealRange(range, revealType) {
          that._proxy.$tryRevealRange(
            that.id,
            NotebookRange2.from(range),
            revealType ?? 0 /* Default */
          );
        },
        get viewColumn() {
          return that._viewColumn;
        },
        get replOptions() {
          if (that.viewType === "repl") {
            return { appendIndex: this.notebook.cellCount - 1 };
          }
          return void 0;
        },
        [/* @__PURE__ */ Symbol.for("debug.description")]() {
          return `NotebookEditor(${this.notebook.uri.toString()})`;
        }
      };
      _ExtHostNotebookEditor.apiEditorsToExtHost.set(this._editor, this);
    }
    return this._editor;
  }
  get visible() {
    return this._visible;
  }
  _acceptVisibility(value) {
    this._visible = value;
  }
  _acceptVisibleRanges(value) {
    this._visibleRanges = value;
  }
  _acceptSelections(selections) {
    this._selections = selections;
  }
  _trySetSelections(value) {
    this._proxy.$trySetSelections(this.id, value.map(NotebookRange2.from));
  }
  _acceptViewColumn(value) {
    this._viewColumn = value;
  }
};
export { ExtHostNotebookEditor };
