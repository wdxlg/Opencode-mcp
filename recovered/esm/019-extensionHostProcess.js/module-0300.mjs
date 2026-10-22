// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTextEditor.ts
import { IdGenerator } from "./module-0299.mjs";
import { DecorationRenderOptions, EndOfLine2, Position3, Range3, Selection2, TextEditorLineNumbersStyle2, ViewColumn2, fromRangeOrRangeWithMessage, isDecorationOptionsArr } from "./module-0245.mjs";
import { Position2 } from "./module-0232.mjs";
import { Range2 } from "./module-0233.mjs";
import { ReadonlyError, illegalArgument } from "./module-0003.mjs";
import { Selection } from "./module-0238.mjs";
import { ok } from "./module-0008.mjs";


// src/vs/workbench/api/common/extHostTextEditor.ts
var TextEditorDecorationType = class _TextEditorDecorationType {
  static {
    this._Keys = new IdGenerator("TextEditorDecorationType");
  }
  constructor(proxy, extension, options2) {
    const key = _TextEditorDecorationType._Keys.nextId();
    proxy.$registerTextEditorDecorationType(extension.identifier, key, DecorationRenderOptions.from(options2));
    this.value = Object.freeze({
      key,
      dispose() {
        proxy.$removeTextEditorDecorationType(key);
      }
    });
  }
};

var TextEditorEdit = class {
  constructor(document2, options2) {
    this._collectedEdits = [];
    this._setEndOfLine = void 0;
    this._finalized = false;
    this._document = document2;
    this._documentVersionId = document2.version;
    this._undoStopBefore = options2.undoStopBefore;
    this._undoStopAfter = options2.undoStopAfter;
  }
  finalize() {
    this._finalized = true;
    return {
      documentVersionId: this._documentVersionId,
      edits: this._collectedEdits,
      setEndOfLine: this._setEndOfLine,
      undoStopBefore: this._undoStopBefore,
      undoStopAfter: this._undoStopAfter
    };
  }
  _throwIfFinalized() {
    if (this._finalized) {
      throw new Error("Edit is only valid while callback runs");
    }
  }
  replace(location2, value) {
    this._throwIfFinalized();
    let range = null;
    if (location2 instanceof Position2) {
      range = new Range2(location2, location2);
    } else if (location2 instanceof Range2) {
      range = location2;
    } else {
      throw new Error("Unrecognized location");
    }
    this._pushEdit(range, value, false);
  }
  insert(location2, value) {
    this._throwIfFinalized();
    this._pushEdit(new Range2(location2, location2), value, true);
  }
  delete(location2) {
    this._throwIfFinalized();
    let range = null;
    if (location2 instanceof Range2) {
      range = location2;
    } else {
      throw new Error("Unrecognized location");
    }
    this._pushEdit(range, null, true);
  }
  _pushEdit(range, text, forceMoveMarkers) {
    const validRange2 = this._document.validateRange(range);
    this._collectedEdits.push({
      range: validRange2,
      text,
      forceMoveMarkers
    });
  }
  setEndOfLine(endOfLine) {
    this._throwIfFinalized();
    if (endOfLine !== 1 /* LF */ && endOfLine !== 2 /* CRLF */) {
      throw illegalArgument("endOfLine");
    }
    this._setEndOfLine = endOfLine;
  }
};

var ExtHostTextEditorOptions = class {
  constructor(proxy, id2, source, logService) {
    this._proxy = proxy;
    this._id = id2;
    this._accept(source);
    this._logService = logService;
    const that = this;
    this.value = {
      get tabSize() {
        return that._tabSize;
      },
      set tabSize(value) {
        that._setTabSize(value);
      },
      get indentSize() {
        return that._indentSize;
      },
      set indentSize(value) {
        that._setIndentSize(value);
      },
      get insertSpaces() {
        return that._insertSpaces;
      },
      set insertSpaces(value) {
        that._setInsertSpaces(value);
      },
      get cursorStyle() {
        return that._cursorStyle;
      },
      set cursorStyle(value) {
        that._setCursorStyle(value);
      },
      get lineNumbers() {
        return that._lineNumbers;
      },
      set lineNumbers(value) {
        that._setLineNumbers(value);
      }
    };
  }
  _accept(source) {
    this._tabSize = source.tabSize;
    this._indentSize = source.indentSize;
    this._originalIndentSize = source.originalIndentSize;
    this._insertSpaces = source.insertSpaces;
    this._cursorStyle = source.cursorStyle;
    this._lineNumbers = TextEditorLineNumbersStyle2.to(source.lineNumbers);
  }
  // --- internal: tabSize
  _validateTabSize(value) {
    if (value === "auto") {
      return "auto";
    }
    if (typeof value === "number") {
      const r2 = Math.floor(value);
      return r2 > 0 ? r2 : null;
    }
    if (typeof value === "string") {
      const r2 = parseInt(value, 10);
      if (isNaN(r2)) {
        return null;
      }
      return r2 > 0 ? r2 : null;
    }
    return null;
  }
  _setTabSize(value) {
    const tabSize = this._validateTabSize(value);
    if (tabSize === null) {
      return;
    }
    if (typeof tabSize === "number") {
      if (this._tabSize === tabSize) {
        return;
      }
      this._tabSize = tabSize;
    }
    this._warnOnError("setTabSize", this._proxy.$trySetOptions(this._id, {
      tabSize
    }));
  }
  // --- internal: indentSize
  _validateIndentSize(value) {
    if (value === "tabSize") {
      return "tabSize";
    }
    if (typeof value === "number") {
      const r2 = Math.floor(value);
      return r2 > 0 ? r2 : null;
    }
    if (typeof value === "string") {
      const r2 = parseInt(value, 10);
      if (isNaN(r2)) {
        return null;
      }
      return r2 > 0 ? r2 : null;
    }
    return null;
  }
  _setIndentSize(value) {
    const indentSize = this._validateIndentSize(value);
    if (indentSize === null) {
      return;
    }
    if (typeof indentSize === "number") {
      if (this._originalIndentSize === indentSize) {
        return;
      }
      this._indentSize = indentSize;
      this._originalIndentSize = indentSize;
    }
    this._warnOnError("setIndentSize", this._proxy.$trySetOptions(this._id, {
      indentSize
    }));
  }
  // --- internal: insert spaces
  _validateInsertSpaces(value) {
    if (value === "auto") {
      return "auto";
    }
    return value === "false" ? false : Boolean(value);
  }
  _setInsertSpaces(value) {
    const insertSpaces = this._validateInsertSpaces(value);
    if (typeof insertSpaces === "boolean") {
      if (this._insertSpaces === insertSpaces) {
        return;
      }
      this._insertSpaces = insertSpaces;
    }
    this._warnOnError("setInsertSpaces", this._proxy.$trySetOptions(this._id, {
      insertSpaces
    }));
  }
  // --- internal: cursor style
  _setCursorStyle(value) {
    if (this._cursorStyle === value) {
      return;
    }
    this._cursorStyle = value;
    this._warnOnError("setCursorStyle", this._proxy.$trySetOptions(this._id, {
      cursorStyle: value
    }));
  }
  // --- internal: line number
  _setLineNumbers(value) {
    if (this._lineNumbers === value) {
      return;
    }
    this._lineNumbers = value;
    this._warnOnError("setLineNumbers", this._proxy.$trySetOptions(this._id, {
      lineNumbers: TextEditorLineNumbersStyle2.from(value)
    }));
  }
  assign(newOptions) {
    const bulkConfigurationUpdate = {};
    let hasUpdate = false;
    if (typeof newOptions.tabSize !== "undefined") {
      const tabSize = this._validateTabSize(newOptions.tabSize);
      if (tabSize === "auto") {
        hasUpdate = true;
        bulkConfigurationUpdate.tabSize = tabSize;
      } else if (typeof tabSize === "number" && this._tabSize !== tabSize) {
        this._tabSize = tabSize;
        hasUpdate = true;
        bulkConfigurationUpdate.tabSize = tabSize;
      }
    }
    if (typeof newOptions.indentSize !== "undefined") {
      const indentSize = this._validateIndentSize(newOptions.indentSize);
      if (indentSize === "tabSize") {
        hasUpdate = true;
        bulkConfigurationUpdate.indentSize = indentSize;
      } else if (typeof indentSize === "number" && this._originalIndentSize !== indentSize) {
        this._indentSize = indentSize;
        this._originalIndentSize = indentSize;
        hasUpdate = true;
        bulkConfigurationUpdate.indentSize = indentSize;
      }
    }
    if (typeof newOptions.insertSpaces !== "undefined") {
      const insertSpaces = this._validateInsertSpaces(newOptions.insertSpaces);
      if (insertSpaces === "auto") {
        hasUpdate = true;
        bulkConfigurationUpdate.insertSpaces = insertSpaces;
      } else if (this._insertSpaces !== insertSpaces) {
        this._insertSpaces = insertSpaces;
        hasUpdate = true;
        bulkConfigurationUpdate.insertSpaces = insertSpaces;
      }
    }
    if (typeof newOptions.cursorStyle !== "undefined") {
      if (this._cursorStyle !== newOptions.cursorStyle) {
        this._cursorStyle = newOptions.cursorStyle;
        hasUpdate = true;
        bulkConfigurationUpdate.cursorStyle = newOptions.cursorStyle;
      }
    }
    if (typeof newOptions.lineNumbers !== "undefined") {
      if (this._lineNumbers !== newOptions.lineNumbers) {
        this._lineNumbers = newOptions.lineNumbers;
        hasUpdate = true;
        bulkConfigurationUpdate.lineNumbers = TextEditorLineNumbersStyle2.from(newOptions.lineNumbers);
      }
    }
    if (hasUpdate) {
      this._warnOnError("setOptions", this._proxy.$trySetOptions(this._id, bulkConfigurationUpdate));
    }
  }
  _warnOnError(action, promise) {
    promise.catch((err) => {
      this._logService.warn(`ExtHostTextEditorOptions '${action}' failed:'`);
      this._logService.warn(err);
    });
  }
};

var ExtHostTextEditor = class {
  constructor(id2, _proxy, _logService, document2, selections, options2, visibleRanges, viewColumn) {
    this.id = id2;
    this._proxy = _proxy;
    this._logService = _logService;
    this._disposed = false;
    this._hasDecorationsForKey = /* @__PURE__ */ new Set();
    this._selections = selections;
    this._options = new ExtHostTextEditorOptions(this._proxy, this.id, options2, _logService);
    this._visibleRanges = visibleRanges;
    this._viewColumn = viewColumn;
    const that = this;
    this.value = Object.freeze({
      get document() {
        return document2.value;
      },
      set document(_value) {
        throw new ReadonlyError("document");
      },
      // --- selection
      get selection() {
        return that._selections && that._selections[0];
      },
      set selection(value) {
        if (!(value instanceof Selection)) {
          throw illegalArgument("selection");
        }
        that._selections = [value];
        that._trySetSelection();
      },
      get selections() {
        return that._selections;
      },
      set selections(value) {
        if (!Array.isArray(value) || value.some((a) => !(a instanceof Selection))) {
          throw illegalArgument("selections");
        }
        if (value.length === 0) {
          value = [new Selection(0, 0, 0, 0)];
        }
        that._selections = value;
        that._trySetSelection();
      },
      // --- visible ranges
      get visibleRanges() {
        return that._visibleRanges;
      },
      set visibleRanges(_value) {
        throw new ReadonlyError("visibleRanges");
      },
      get diffInformation() {
        return that._diffInformation;
      },
      // --- options
      get options() {
        return that._options.value;
      },
      set options(value) {
        if (!that._disposed) {
          that._options.assign(value);
        }
      },
      // --- view column
      get viewColumn() {
        return that._viewColumn;
      },
      set viewColumn(_value) {
        throw new ReadonlyError("viewColumn");
      },
      // --- edit
      edit(callback, options3 = { undoStopBefore: true, undoStopAfter: true }) {
        if (that._disposed) {
          return Promise.reject(new Error("TextEditor#edit not possible on closed editors"));
        }
        const edit2 = new TextEditorEdit(document2.value, options3);
        callback(edit2);
        return that._applyEdit(edit2);
      },
      // --- snippet edit
      insertSnippet(snippet, where, options3 = { undoStopBefore: true, undoStopAfter: true }) {
        if (that._disposed) {
          return Promise.reject(new Error("TextEditor#insertSnippet not possible on closed editors"));
        }
        let ranges;
        if (!where || Array.isArray(where) && where.length === 0) {
          ranges = that._selections.map((range) => Range3.from(range));
        } else if (where instanceof Position2) {
          const { lineNumber, column } = Position3.from(where);
          ranges = [{ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column }];
        } else if (where instanceof Range2) {
          ranges = [Range3.from(where)];
        } else {
          ranges = [];
          for (const posOrRange of where) {
            if (posOrRange instanceof Range2) {
              ranges.push(Range3.from(posOrRange));
            } else {
              const { lineNumber, column } = Position3.from(posOrRange);
              ranges.push({ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: column });
            }
          }
        }
        if (options3.keepWhitespace === void 0) {
          options3.keepWhitespace = false;
        }
        return _proxy.$tryInsertSnippet(id2, document2.value.version, snippet.value, ranges, options3);
      },
      setDecorations(decorationType, ranges) {
        const willBeEmpty = ranges.length === 0;
        if (willBeEmpty && !that._hasDecorationsForKey.has(decorationType.key)) {
          return;
        }
        if (willBeEmpty) {
          that._hasDecorationsForKey.delete(decorationType.key);
        } else {
          that._hasDecorationsForKey.add(decorationType.key);
        }
        that._runOnProxy(() => {
          if (isDecorationOptionsArr(ranges)) {
            return _proxy.$trySetDecorations(
              id2,
              decorationType.key,
              fromRangeOrRangeWithMessage(ranges)
            );
          } else {
            const _ranges = new Array(4 * ranges.length);
            for (let i = 0, len = ranges.length; i < len; i++) {
              const range = ranges[i];
              _ranges[4 * i] = range.start.line + 1;
              _ranges[4 * i + 1] = range.start.character + 1;
              _ranges[4 * i + 2] = range.end.line + 1;
              _ranges[4 * i + 3] = range.end.character + 1;
            }
            return _proxy.$trySetDecorationsFast(
              id2,
              decorationType.key,
              _ranges
            );
          }
        });
      },
      revealRange(range, revealType) {
        that._runOnProxy(() => _proxy.$tryRevealRange(
          id2,
          Range3.from(range),
          revealType || 0 /* Default */
        ));
      },
      show(column) {
        _proxy.$tryShowEditor(id2, ViewColumn2.from(column));
      },
      hide() {
        _proxy.$tryHideEditor(id2);
      },
      [/* @__PURE__ */ Symbol.for("debug.description")]() {
        return `TextEditor(${this.document.uri.toString()})`;
      }
    });
  }
  dispose() {
    ok(!this._disposed);
    this._disposed = true;
  }
  // --- incoming: extension host MUST accept what the renderer says
  _acceptOptions(options2) {
    ok(!this._disposed);
    this._options._accept(options2);
  }
  _acceptVisibleRanges(value) {
    ok(!this._disposed);
    this._visibleRanges = value;
  }
  _acceptViewColumn(value) {
    ok(!this._disposed);
    this._viewColumn = value;
  }
  _acceptSelections(selections) {
    ok(!this._disposed);
    this._selections = selections;
  }
  _acceptDiffInformation(diffInformation) {
    ok(!this._disposed);
    this._diffInformation = diffInformation;
  }
  async _trySetSelection() {
    const selection = this._selections.map(Selection2.from);
    await this._runOnProxy(() => this._proxy.$trySetSelections(this.id, selection));
    return this.value;
  }
  _applyEdit(editBuilder) {
    const editData = editBuilder.finalize();
    if (editData.edits.length === 0 && !editData.setEndOfLine) {
      return Promise.resolve(true);
    }
    const editRanges = editData.edits.map((edit2) => edit2.range);
    editRanges.sort((a, b) => {
      if (a.end.line === b.end.line) {
        if (a.end.character === b.end.character) {
          if (a.start.line === b.start.line) {
            return a.start.character - b.start.character;
          }
          return a.start.line - b.start.line;
        }
        return a.end.character - b.end.character;
      }
      return a.end.line - b.end.line;
    });
    for (let i = 0, count2 = editRanges.length - 1; i < count2; i++) {
      const rangeEnd = editRanges[i].end;
      const nextRangeStart = editRanges[i + 1].start;
      if (nextRangeStart.isBefore(rangeEnd)) {
        return Promise.reject(
          new Error("Overlapping ranges are not allowed!")
        );
      }
    }
    const edits = editData.edits.map((edit2) => {
      return {
        range: Range3.from(edit2.range),
        text: edit2.text,
        forceMoveMarkers: edit2.forceMoveMarkers
      };
    });
    return this._proxy.$tryApplyEdits(this.id, editData.documentVersionId, edits, {
      setEndOfLine: typeof editData.setEndOfLine === "number" ? EndOfLine2.from(editData.setEndOfLine) : void 0,
      undoStopBefore: editData.undoStopBefore,
      undoStopAfter: editData.undoStopAfter
    });
  }
  _runOnProxy(callback) {
    if (this._disposed) {
      this._logService.warn("TextEditor is closed/disposed");
      return Promise.resolve(void 0);
    }
    return callback().then(() => this, (err) => {
      if (!(err instanceof Error && err.name === "DISPOSED")) {
        this._logService.warn(err);
      }
      return null;
    });
  }
};
export { TextEditorDecorationType, TextEditorEdit, ExtHostTextEditorOptions, ExtHostTextEditor };
